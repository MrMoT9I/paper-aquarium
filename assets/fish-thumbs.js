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
        // У скиннед-мешей сфера отсечения считается по позе привязки и часто
        // врёт: рыба целиком выпадает из кадра, хотя стоит по центру. Для
        // одиночного рендера отсечение не нужно вовсе — выключаем.
        root.traverse(function (o) {
          if (!o.isMesh) return;
          o.frustumCulled = false;
          // paper-aquarium: color-only
          if (o.geometry && o.geometry.getAttribute && o.geometry.getAttribute('color') && !o.geometry.getAttribute('normal') && o.geometry.computeVertexNormals) o.geometry.computeVertexNormals();
          var mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach(function (m) {
            if (!m) return;
            if (o.geometry && o.geometry.getAttribute && o.geometry.getAttribute('color')) {
              m.vertexColors = true;
              if (m.color && m.color.setHex) m.color.setHex(0xffffff);
            }
            // Текстурные pillow (кит/конёк/сом): без sRGB карта выглядит серой.
            if (m.map) {
              if ('colorSpace' in m.map) m.map.colorSpace = THREE.SRGBColorSpace;
              else m.map.encoding = THREE.sRGBEncoding;
              m.map.needsUpdate = true;
            }
            m.side = THREE.DoubleSide;
            m.needsUpdate = true;
          });
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
        holder.add(pivot);
        scene.add(holder);

        var along = Math.max(b.size.x, b.size.y, b.size.z) || 1;
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
