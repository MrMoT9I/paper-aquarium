/* Просит Яндекс и Bing переобойти страницы сайта — без Вебмастера и аккаунта.
 *
 *   node tools/indexnow.js            (после деплоя, когда сайт уже отдаёт ключ)
 *
 * Протокол IndexNow: шлём список адресов и ключ, поисковик проверяет, что
 * по адресу /<ключ>.txt наш сервер отдаёт тот же ключ, — значит, пингует
 * хозяин сайта. Ключ и список страниц берём из server.js, чтобы не завести
 * вторую копию, которая разойдётся с первой.
 *
 * Злоупотреблять нельзя: пинговать только когда страницы правда поменялись.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
const key = src.match(/const INDEXNOW_KEY = '([0-9a-f]+)'/)[1];
const pages = JSON.parse(src.match(/const SITEMAP_PAGES = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
const site = process.env.SITE_URL || 'https://aquarium.mrmot9i.com';
const host = new URL(site).host;

const body = JSON.stringify({
  host,
  key,
  keyLocation: `${site}/${key}.txt`,
  urlList: pages.map((p) => site + p)
});

(async () => {
  // Сначала убеждаемся, что ключ виден снаружи: иначе поисковик ответит 403,
  // и непонятно будет, в чём дело.
  const own = await fetch(`${site}/${key}.txt`).then((r) => r.text()).catch(() => '');
  if (own.trim() !== key) {
    console.error(`${site}/${key}.txt не отдаёт ключ — сначала задеплой сервер`);
    process.exit(1);
  }

  // Яндекс напрямую, а общий узел раздаёт пинг остальным участникам (Bing и др.).
  for (const endpoint of ['https://yandex.com/indexnow', 'https://api.indexnow.org/indexnow']) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body
      });
      console.log(`${endpoint}: ${res.status} ${(await res.text()).slice(0, 200)}`);
    } catch (e) {
      console.log(`${endpoint}: ${e.message}`);
    }
  }
})();
