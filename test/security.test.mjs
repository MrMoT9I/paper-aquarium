// Аудит безопасности 16.10.2026: каждая найденная дыра — тест, чтобы она не
// вернулась. Сервер настоящий, на свободном порту и пустой временной папке.
//
//   node --test test/
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let base, child, dir;

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aqua-test-'));
  const port = await new Promise((ok) => { const s = net.createServer().listen(0, () => { const p = s.address().port; s.close(() => ok(p)); }); });
  child = spawn(process.execPath, ['server.js'], {
    cwd: ROOT, stdio: 'ignore',
    env: { ...process.env, PORT: String(port), AQUA_DATA_DIR: dir, AQUA_TANKS_PER_HOUR: '3', AQUA_HSTS: '0' }
  });
  base = 'http://127.0.0.1:' + port;
  for (let i = 0; i < 100; i++) {
    try { await fetch(base + '/'); break; } catch (e) { await new Promise((r) => setTimeout(r, 100)); }
  }
});
after(() => { child.kill(); fs.rmSync(dir, { recursive: true, force: true }); });

// Запросы «из интернета»: сервер слушает localhost, и X-Forwarded-For от
// локального адреса он принимает как от прокси — последним значением.
const from = (ip) => ({ 'X-Forwarded-For': '6.6.6.6, ' + ip });
const api = (p, { method = 'GET', json, headers = {} } = {}) => fetch(base + p, {
  method, headers: { ...(json !== undefined ? { 'content-type': 'application/json' } : {}), ...headers },
  body: json !== undefined ? JSON.stringify(json) : undefined
});
async function newTank(ip = '10.0.0.1', password) {
  const r = await api('/api/tanks', { method: 'POST', json: { name: 'Т', ...(password ? { password } : {}) }, headers: from(ip) });
  assert.equal(r.status, 200, await r.clone().text());
  return r.json();
}

// Настоящий PNG w × h, без зависимостей.
function png(w, h) {
  const crc = (b) => { let c = ~0; for (const x of b) { c ^= x; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return ~c >>> 0; };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * Math.min(h, 4));
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr),
                        chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const dataUrl = (type, buf) => 'data:image/' + type + ';base64,' + buf.toString('base64');

test('заголовки безопасности и CSP на страницах', async () => {
  const r = await api('/');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(r.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(r.headers.get('referrer-policy'), 'no-referrer');
  assert.match(r.headers.get('content-security-policy'), /script-src 'self' 'wasm-unsafe-eval' 'sha256-/);
});

test('X-Forwarded-For: считается последний адрес, первый подменять бесполезно', async () => {
  const st = [];
  for (let i = 0; i < 4; i++) {
    const r = await api('/api/tanks', { method: 'POST', json: {}, headers: { 'X-Forwarded-For': '9.9.9.' + i + ', 10.7.7.7' } });
    st.push(r.status);
  }
  assert.deepEqual(st, [200, 200, 200, 429]);
});

test('пин: свой верный пин не обнуляет счётчик промахов', async () => {
  const t = await newTank('10.0.0.2');
  const { pin } = await (await api('/api/t/' + t.id + '/pin', { method: 'POST', headers: from('10.0.0.2') })).json();
  const wrong = pin === '12345' ? '54321' : '12345';
  const ip = from('10.5.5.5');
  for (let i = 0; i < 5; i++) assert.equal((await api('/api/pin/' + wrong, { headers: ip })).status, 404);
  assert.equal((await api('/api/pin/' + pin, { headers: ip })).status, 200);
  assert.equal((await api('/api/pin/' + wrong, { headers: ip })).status, 404, 'шестой промах ещё отвечается');
  assert.equal((await api('/api/pin/' + wrong, { headers: ip })).status, 429, 'а дальше пауза — счётчик не обнулился');
});

test('пароль: чужие промахи не запирают хозяина, одновременные не проскакивают', async () => {
  const t = await newTank('10.0.0.3', 'secret1');
  const all = await Promise.all(Array.from({ length: 40 }, () =>
    api('/api/t/' + t.id + '/auth', { method: 'POST', json: { password: 'nope' }, headers: from('10.6.6.6') }).then((r) => r.status)));
  assert.equal(all.filter((s) => s === 401).length, 6, 'проверено ровно шесть');
  assert.equal(all.filter((s) => s === 429).length, 34);
  const own = await api('/api/t/' + t.id + '/auth', { method: 'POST', json: { password: 'secret1' }, headers: from('10.0.0.3') });
  assert.equal(own.status, 200, 'хозяин со своего адреса входит');
});

test('рыбка: вид только из раскрасок, картинка — настоящая и разумного размера', async () => {
  const t = await newTank('10.0.0.4');
  const fish = (kind, texture) => api('/api/t/' + t.id + '/fish', { method: 'POST', json: { kind, texture }, headers: from('10.0.0.4') }).then((r) => r.status);
  const ok = dataUrl('png', png(64, 32));
  assert.equal(await fish('clownfish', ok), 200);
  assert.equal(await fish('k'.repeat(5000), ok), 400, 'длинный вид');
  assert.equal(await fish('__proto__', ok), 400, 'вид не из раскрасок');
  assert.equal(await fish('clownfish', dataUrl('png', Buffer.from('<html><script>alert(1)</script></html>'))), 400, 'HTML под видом PNG');
  assert.equal(await fish('clownfish', dataUrl('png', png(65000, 65000))), 400, 'картинка-бомба');
  assert.equal(await fish('clownfish', dataUrl('jpeg', png(64, 32))), 400, 'тип в префиксе не совпал');
});

test('фон удаляется в корзину, а не насовсем', async () => {
  const t = await newTank('10.0.0.5');
  const r = await (await api('/api/t/' + t.id + '/backgrounds', { method: 'POST', json: { image: dataUrl('png', png(80, 60)) }, headers: from('10.0.0.5') })).json();
  assert.ok(r.ok);
  assert.equal((await api('/api/t/' + t.id + '/backgrounds/' + r.name, { method: 'DELETE', headers: from('10.0.0.5') })).status, 200);
  assert.ok(fs.existsSync(path.join(dir, 'tanks', t.id, 'trash', r.name)), 'фон в корзине');
});

test('обратный слеш в адресе и /tools/ снаружи — 404', async () => {
  assert.equal((await api('/assets/..%5cserver.js')).status, 404);
  assert.equal((await api('/tools/silhouettes.html', { headers: from('10.0.0.6') })).status, 404);
});

test('тело «null», короткий пароль — 400, а не 500 и не аквариум с паролем «1»', async () => {
  assert.equal((await api('/api/tanks', { method: 'POST', json: null, headers: from('10.0.0.8') })).status, 400);
  assert.equal((await api('/api/tanks', { method: 'POST', json: { password: '1' }, headers: from('10.0.0.8') })).status, 400);
});

test('после всего сервер жив', async () => {
  assert.equal((await api('/robots.txt')).status, 200);
});
