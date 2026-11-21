// Миниатюры покупных рыб — общие для админки и для выбора рыбки в аквариуме.
//
// Готовых картинок в паке нет, а заводская текстура — это UV-атлас, на превью
// он выглядит мешаниной. Поэтому рисуем сами: один общий рендерер прогоняет
// модели по очереди и отдаёт картинку строкой. Результат кэшируем на сессию.
//
// Нужны THREE, GLTFLoader и FishFrame — подключать после них.
//
//   FishThumbs.get({name, url}, cb)   — cb(dataURL | null)
//   FishThumbs.withPack(cb)           — cb(index), index[name] → модель,
//                                       index.__list → весь список
(function () {
  'use strict';

  // ── миниатюры покупных рыб ──
  // Готовых картинок в паке нет, а заводская текстура — это UV-атлас, на
  // превью он выглядит мешаниной. Поэтому рисуем сами: один общий рендерер
  // прогоняет модели по очереди и отдаёт картинку строкой. Результат кэшируем
  // на сессию — карточки и выбор рыбки берут из одного кэша.
  var Thumbs = (function () {
    var cache = {};      // name@url → dataURL
    var waiting = {};    // name@url → [callbacks]
    var queue = [], busy = false;
    var renderer = null, scene = null, camera = null, loader = null;
    var W = 232, H = 148;

    function setup() {
      if (renderer !== null) return renderer;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
      catch (e) { renderer = false; return false; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.outputEncoding = THREE.sRGBEncoding;

      scene = new THREE.Scene();
      scene.add(new THREE.AmbientLight(0xffffff, 0.9));
      var key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(2, 3, 4);
      scene.add(key);

      camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
      loader = new THREE.GLTFLoader();
      return renderer;
    }

  
        function linearizeUploadedWhaleColors(root) {
      // The uploaded GLB stores COLOR_0 as normalized sRGB bytes. Three r128
      // treats vertex colors as linear, which washes the dark humpback to pale blue.
      root.traverse(function (o) {
        if (!o || !o.isMesh || !o.geometry || !o.geometry.getAttribute) return;
        var a = o.geometry.getAttribute('color');
        if (!a || a._paSrgbLinearized) return;
        var raw = a.array || (a.data && a.data.array);
        if (!raw) return;
        var isByte = raw.constructor && raw.constructor.name === 'Uint8Array';
        var isShort = raw.constructor && raw.constructor.name === 'Uint16Array';
        var denom = (a.normalized && isByte) ? 255 : ((a.normalized && isShort) ? 65535 : 1);
        var itemSize = a.itemSize;
        var out = new Float32Array(a.count * 4);
        function linear(c) {
          if (c <= 0.04045) return c / 12.92;
          return Math.pow((c + 0.055) / 1.055, 2.4);
        }
        for (var i = 0; i < a.count; i++) {
          var base = i * itemSize;
          var r = raw[base] / denom;
          var g = raw[base + 1] / denom;
          var b = raw[base + 2] / denom;
          var al = itemSize > 3 ? raw[base + 3] / denom : 1;
          out[i * 4] = linear(Math.max(0, Math.min(1, r)));
          out[i * 4 + 1] = linear(Math.max(0, Math.min(1, g)));
          out[i * 4 + 2] = linear(Math.max(0, Math.min(1, b)));
          out[i * 4 + 3] = Math.max(0, Math.min(1, al));
        }
        var converted = new THREE.Float32BufferAttribute(out, 4);
        converted._paSrgbLinearized = true;
        o.geometry.setAttribute('color', converted);
      });
    }
  
    function cacheKey(item) {
      return String(item.name) + '@' + String(item.url || '');
    }

    function done(key, url) {
      cache[key] = url;
      (waiting[key] || []).forEach(function (cb) { cb(url); });
      delete waiting[key];
      busy = false;
      pump();
    }

    function pump() {
      if (busy || !queue.length) return;
      if (!setup()) { queue.length = 0; return; }
      busy = true;
      var item = queue.shift();
      loader.load(item.url, function (gltf) {
        var root = gltf.scene;
        if (item.name === 'whale' && /userExact/.test(item.url || '')) linearizeUploadedWhaleColors(root);
        // У скиннед-мешей сфера отсечения считается по позе привязки и часто
        // врёт: рыба целиком выпадает из кадра, хотя стоит по центру. Для
        // одиночного рендера отсечение не нужно вовсе — выключаем.
        root.traverse(function (o) {
          if (!o.isMesh) return;
          o.frustumCulled = false;
          // paper-aquarium: color-only
          if (o.geometry && o.geometry.getAttribute && o.geometry.getAttribute('color') && !o.geometry.getAttribute('normal') && o.geometry.computeVertexNormals) o.geometry.computeVertexNormals();
          var hasVC = o.geometry && o.geometry.getAttribute && o.geometry.getAttribute('color');
          var mats = Array.isArray(o.material) ? o.material : [o.material];
          var outMats = mats.map(function (m) {
            if (!m) return m;
            if (hasVC && !m.map && THREE.MeshBasicMaterial) {
              // paper-aquarium: vc-basic — readable colors in picker thumbs
              return new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, color: 0xffffff });
            }
            if (hasVC) {
              m.vertexColors = true;
              if (m.color && m.color.setHex) m.color.setHex(0xffffff);
            }
            if (m.map) {
              if ('colorSpace' in m.map) m.map.colorSpace = THREE.SRGBColorSpace;
              else m.map.encoding = THREE.sRGBEncoding;
              m.map.needsUpdate = true;
            }
            m.side = THREE.DoubleSide;
            m.needsUpdate = true;
            return m;
          });
          o.material = Array.isArray(o.material) ? outMats : outMats[0];
        });

        // Ориентацию: сначала frame из pack.json (как в аквариуме), иначе
        // скелет, иначе габарит. Без frame акула/конёк вставали к камере «с торца».
        var sk = FishFrame.fromSkeleton(gltf);
        var b = FishFrame.bounds(root);
        var ord = [['x', b.size.x], ['y', b.size.y], ['z', b.size.z]]
          .sort(function (p, q) { return q[1] - p[1]; });
        var fr = item.frame;
        var axes = fr
          ? { body: fr.body, up: fr.up, lat: fr.lat }
          : (sk ? sk.axes : { body: ord[0][0], up: ord[1][0], lat: ord[2][0] });
        var headAtMax = fr ? !!fr.headAtMax : (sk ? sk.headAtMax : true);

        root.position.sub(b.center);
        var pivot = new THREE.Group();
        pivot.quaternion.copy(FishFrame.orientQuat(axes, headAtMax, b));
        pivot.add(root);

        // После разбора нос смотрит в +Z, то есть в камеру. Доворачиваем
        // рыбу боком, носом вправо: рыба, повёрнутая влево, читается как
        // плывущая назад — глаз ждёт движения по направлению чтения.
        var holder = new THREE.Group();
        holder.rotation.y = Math.PI / 2;
        // paper-aquarium: whale has wide pectorals along the lateral axis. A pure
        // side view hides them, so show the whale as 3/4 top so the pectorals and
        // dorsal fin read clearly in the picker thumb.
        if (item.name === 'whale') {
          holder.rotation.y = Math.PI / 2 + Math.PI / 6;
          holder.rotation.x = -Math.PI / 7;
        }
        holder.add(pivot);
        scene.add(holder);

        var along = Math.max(b.size.x, b.size.y, b.size.z) || 1;
        if (item.name === 'whale') along = Math.max(along, b.size.x * 1.4);
        camera.position.set(0, 0, along * 1.7);
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        var url = renderer.domElement.toDataURL('image/png');
        scene.remove(holder);
        done(cacheKey(item), url);
      }, undefined, function () { done(cacheKey(item), null); });
    }

    return {
      get: function (item, cb) {
        var key = cacheKey(item);
        if (cache[key] !== undefined) return cb(cache[key]);
        if (waiting[key]) { waiting[key].push(cb); return; }
        waiting[key] = [cb];
        queue.push(item);
        pump();
      }
    };
  })();

  // Модель для карточки ищем в общем списке пака: в записи рыбки лежит
  // только имя модели, а путь к файлу знает только пак.
  var packIndex = null;
  function withPack(cb) {
    if (packIndex) return cb(packIndex);
    fetch('/api/pack').then(function (r) { return r.json(); }).then(function (list) {
      packIndex = {};
      list.forEach(function (m) { packIndex[m.name] = m; });
      packIndex.__list = list;
      cb(packIndex);
    }).catch(function () { packIndex = { __list: [] }; cb(packIndex); });
  }
  window.FishThumbs = { get: Thumbs.get, withPack: withPack };
})();
