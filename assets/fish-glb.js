/* Общий загрузчик GLB-рыб для всех демо-сцен.
   Вынесено из realistic-tank.html, чтобы каждая сцена не изобретала своё:
   · автоориентация произвольной модели (нос → +Z, спина → +Y);
   · spawn() — клон со скелетной анимацией (если есть) или изгибом в шейдере;
   · bake()  — геометрия с запечёнными цветами материалов для InstancedMesh.
   Требует THREE и THREE.GLTFLoader; THREE.SkeletonUtils — по желанию. */
(function () {
  'use strict';

  var uTime = { value: 0 };

  function axisVec(name, sign) {
    return new THREE.Vector3(name === 'x' ? sign : 0, name === 'y' ? sign : 0, name === 'z' ? sign : 0);
  }
  function maskVec(name) { return axisVec(name, 1); }

  // Разбираем произвольную модель: где длинная ось, где спина, где голова.
  //
  // Это запасной путь — по габаритам:
  //  · тело     — самая длинная ось габарита
  //  · спина    — средняя (рыба выше, чем толще)
  //  · бок      — самая тонкая
  //  · голова   — тот конец, где тело ТОЛЩЕ вбок (хвостовой плавник высокий,
  //               но плоский, поэтому мерить высоту нельзя)
  //  · верх     — центр масс у рыбы ниже середины габарита
  //
  // Он врёт на рыбах, которые выше, чем длиннее (дискус), и на тех, у кого
  // габарит задают растопыренные плавники (крылатка), и путает нос с хвостом
  // у длиннорылых. Поэтому, если модель анимирована, оси и голову берём из
  // FishFrame — по взмахам хвоста, а сюда падаем только без анимации.
  function fishFrame(root, useWorld, axes) {
    var box = new THREE.Box3(), sum = new THREE.Vector3(), v = new THREE.Vector3(), n = 0;
    root.traverse(function (o) {
      if (!o.isMesh) return;
      var p = o.geometry.attributes.position;
      for (var i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        if (useWorld) v.applyMatrix4(o.matrixWorld);
        box.expandByPoint(v);
        sum.add(v); n++;
      }
    });
    var size = box.getSize(new THREE.Vector3());
    var center = box.getCenter(new THREE.Vector3());
    var centroid = sum.divideScalar(Math.max(n, 1));

    var order = [['x', size.x], ['y', size.y], ['z', size.z]].sort(function (a, b) { return b[1] - a[1]; });
    var body = order[0][0], up = order[1][0], lat = order[2][0];
    if (axes) { body = axes.body; up = axes.up; lat = axes.lat; }
    var span = size[body] || 1;

    var thickLow = 0, thickHigh = 0;
    root.traverse(function (o) {
      if (!o.isMesh) return;
      var p = o.geometry.attributes.position;
      for (var i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        if (useWorld) v.applyMatrix4(o.matrixWorld);
        var t = (v[body] - box.min[body]) / span;
        var lateral = Math.abs(v[lat] - center[lat]);
        if (t < 0.18) thickLow = Math.max(thickLow, lateral);
        else if (t > 0.82) thickHigh = Math.max(thickHigh, lateral);
      }
    });

    return {
      box: box, size: size, center: center,
      body: body, up: up, lat: lat,
      headAtMax: thickHigh > thickLow,
      // Правило «где спина» общее — в FishFrame. Третья копия этой строки
      // жила здесь и разошлась бы с остальными так же тихо, как разошлась
      // копия в сцене: спинорог плавал кверху брюхом только в аквариуме.
      dorsalPositive: FishFrame.dorsalPositive(up, centroid, center)
    };
  }

  // Кватернион, приводящий найденный базис к нос → +Z, спина → +Y.
  function frameQuat(w) {
    var forward = axisVec(w.body, w.headAtMax ? 1 : -1);
    var upVec = axisVec(w.up, w.dorsalPositive ? 1 : -1);
    var right = new THREE.Vector3().crossVectors(upVec, forward);
    var basis = new THREE.Matrix4().makeBasis(right, upVec, forward);
    return new THREE.Quaternion().setFromRotationMatrix(basis).invert();
  }

  // skel — результат FishFrame.fromSkeleton (оси и голова по анимации) либо
  // null: тогда всё решают габариты.
  function normalizeFish(root, targetLen, skel) {
    root.updateWorldMatrix(true, true);
    var axes = skel && skel.axes;
    var w = fishFrame(root, true, axes);
    var local = fishFrame(root, false, axes);
    if (skel && typeof skel.headAtMax === 'boolean') {
      w.headAtMax = skel.headAtMax; local.headAtMax = skel.headAtMax;
    }

    var quat = frameQuat(w);
    root.position.sub(w.center);

    return {
      quat: quat,
      scale: targetLen / (w.size[w.body] || 1),
      // для изгиба нужны СВОИ, локальные оси меша — шейдер правит position
      bodyMask: maskVec(local.body),
      latMask: maskVec(local.lat),
      range: [local.box.min[local.body], local.box.max[local.body]],
      headAtMax: local.headAtMax
    };
  }

  // Изгиб тела в вершинном шейдере — для моделей без скелета.
  function addBend(mat, info, amp, phase) {
    var uniforms = {
      uTime: uTime,
      uAmp: { value: amp },
      uPhase: { value: phase },
      uBodyMask: { value: info.bodyMask },
      uLatMask: { value: info.latMask },
      uRange: { value: new THREE.Vector2(info.range[0], info.range[1]) },
      uHeadAtMax: { value: info.headAtMax ? 1 : 0 }
    };
    var prev = mat.onBeforeCompile;
    var prevKey = mat.customProgramCacheKey;
    mat.onBeforeCompile = function (shader) {
      if (prev) prev.call(this, shader);
      Object.keys(uniforms).forEach(function (k) { shader.uniforms[k] = uniforms[k]; });
      shader.vertexShader =
        'uniform float uTime; uniform float uAmp; uniform float uPhase;\n' +
        'uniform vec3 uBodyMask; uniform vec3 uLatMask;\n' +
        'uniform vec2 uRange; uniform float uHeadAtMax;\n' +
        shader.vertexShader.replace('#include <begin_vertex>', [
          '#include <begin_vertex>',
          'float a = dot(transformed, uBodyMask);',
          'float span = max(uRange.y - uRange.x, 0.0001);',
          'float k = uHeadAtMax > 0.5 ? (uRange.y - a) / span : (a - uRange.x) / span;',
          'k = clamp(k, 0.0, 1.0); k *= k;',
          'float w = sin(uTime * 5.5 + uPhase + k * 3.2) * uAmp * k * span * 0.25;',
          'transformed += uLatMask * w;'
        ].join('\n'));
    };
    // без +vc акула/текстурная рыба делит шейдер с коньком/китом → однотон
    mat.customProgramCacheKey = function () {
      return (prevKey ? prevKey.call(this) : '') +
        (prev ? '|fishglb-prev' : '') + '|bend' +
        (this.vertexColors ? '+vc' : '') + (this.map ? '+map' : '');
    };
    return mat;
  }

  function tuneMaterial(m) {
    if (m.roughness === undefined) return;
    if (m.map) { m.envMapIntensity = 0.8; return; }
    m.metalness = Math.min(m.metalness, 0.2);
    m.roughness = Math.max(m.roughness, 0.5);
  }

  // Оси и голову берём по взмахам хвоста, если анимация есть и подключён
  // fish-frame.js. Без него остаётся габаритный запасной путь.
  function skelOf(gltf) {
    if (!window.FishFrame) return null;
    try { return FishFrame.fromSkeleton(gltf); } catch (e) { return null; }
  }

  // Загружаем список спеков {url, length, bend?, headAtMax?}.
  // Успех: spec.gltf + spec.info. Ошибка — молча пропускаем (спек без .gltf),
  // сцена сама решает, чем заменить. onDone(количество успешных).
  function load(specs, onDone) {
    var loader = new THREE.GLTFLoader();
    if (THREE.DRACOLoader) {
      var draco = new THREE.DRACOLoader();
      draco.setDecoderPath('/vendor/draco/');
      loader.setDRACOLoader(draco);
    }
    var left = specs.length, ok = 0;
    specs.forEach(function (spec) {
      loader.load(spec.url,
        function (gltf) {
          spec.gltf = gltf;
          spec.info = normalizeFish(gltf.scene, spec.length,
            typeof spec.headAtMax === 'boolean' ? { headAtMax: spec.headAtMax } : skelOf(gltf));
          ok++;
          if (--left === 0) onDone(ok);
        },
        undefined,
        function (err) {
          console.error('GLB не загрузился: ' + spec.url, err);
          if (--left === 0) onDone(ok);
        }
      );
    });
  }

  // Клон рыбы: группа с носом на +Z и длиной spec.length, центр в нуле.
  // Скелет есть — играем первый клип; нет — гнём тело шейдером.
  function spawn(spec) {
    var clone = THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(spec.gltf.scene) : spec.gltf.scene.clone(true);
    var pivot = new THREE.Group();
    pivot.quaternion.copy(spec.info.quat);
    pivot.scale.setScalar(spec.info.scale);
    pivot.add(clone);

    var mixer = null;
    if (spec.gltf.animations && spec.gltf.animations.length) {
      mixer = new THREE.AnimationMixer(clone);
      var act = mixer.clipAction(spec.gltf.animations[0]);
      act.time = Math.random() * 2;   // рассинхронизируем взмахи
      act.play();
    }

    var phase = Math.random() * 6.28;
    var bendAmp = spec.bend !== undefined ? spec.bend : 0.4;
    var allMats = [];
    clone.traverse(function (o) {
      if (!o.isMesh) return;
      o.castShadow = true;
      // paper-aquarium: color-only
      if (o.geometry && o.geometry.getAttribute && o.geometry.getAttribute('color') && !o.geometry.getAttribute('normal') && o.geometry.computeVertexNormals) o.geometry.computeVertexNormals();
      var mats = (Array.isArray(o.material) ? o.material : [o.material]).map(function (m) { return m.clone(); });
      mats.forEach(function (m) {
        tuneMaterial(m);
        if (o.geometry && o.geometry.getAttribute && o.geometry.getAttribute('color')) {
          m.vertexColors = true;
          if (m.color && m.color.setHex) m.color.setHex(0xffffff);
          m.needsUpdate = true;
        }
        if (!mixer && bendAmp > 0) addBend(m, spec.info, bendAmp, phase);
        allMats.push(m);
      });
      o.material = Array.isArray(o.material) ? mats : mats[0];
    });

    var group = new THREE.Group();
    group.add(pivot);
    return { group: group, mixer: mixer, phase: phase, mats: allMats };
  }

  // Одна геометрия из всей модели: нос → +Z, длина spec.length, центр в нуле,
  // цвета материалов запечены в вершины — для InstancedMesh одним draw call.
  function bake(spec) {
    var root = spec.gltf.scene;
    root.updateWorldMatrix(true, true);
    var skel = typeof spec.headAtMax === 'boolean' ? null : skelOf(spec.gltf);
    var w = fishFrame(root, true, skel && skel.axes);
    if (typeof spec.headAtMax === 'boolean') w.headAtMax = spec.headAtMax;
    else if (skel && typeof skel.headAtMax === 'boolean') w.headAtMax = skel.headAtMax;
    var s = spec.length / (w.size[w.body] || 1);
    var M = new THREE.Matrix4().makeScale(s, s, s)
      .multiply(new THREE.Matrix4().makeRotationFromQuaternion(frameQuat(w)))
      .multiply(new THREE.Matrix4().makeTranslation(-w.center.x, -w.center.y, -w.center.z));

    var parts = [];
    root.traverse(function (o) {
      if (!o.isMesh) return;
      var g = o.geometry.clone();
      g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(M, o.matrixWorld));
      if (g.index) g = g.toNonIndexed();

      var count = g.attributes.position.count;
      var colors = new Float32Array(count * 3);
      var mats = Array.isArray(o.material) ? o.material : [o.material];
      var groups = (g.groups && g.groups.length) ? g.groups : [{ start: 0, count: count, materialIndex: 0 }];
      var hasVC = !!(g.attributes.color);
      var vc = hasVC ? g.attributes.color.array : null;
      groups.forEach(function (gr) {
        var m = mats[gr.materialIndex] || mats[0];
        var c = (m && m.color) || { r: 1, g: 1, b: 1 };
        var end = Math.min(gr.start + gr.count, count);
        for (var i = gr.start; i < end; i++) {
          if (hasVC) {
            colors[i * 3] = vc[i * 3] * c.r;
            colors[i * 3 + 1] = vc[i * 3 + 1] * c.g;
            colors[i * 3 + 2] = vc[i * 3 + 2] * c.b;
          } else {
            colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
          }
        }
      });

      var out = new THREE.BufferGeometry();
      out.setAttribute('position', g.attributes.position);
      out.setAttribute('normal', g.attributes.normal);
      out.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      parts.push(out);
    });

    var total = 0, i;
    for (i = 0; i < parts.length; i++) total += parts[i].attributes.position.count;
    var pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3);
    var off = 0;
    for (i = 0; i < parts.length; i++) {
      var p = parts[i];
      pos.set(p.attributes.position.array, off * 3);
      nor.set(p.attributes.normal.array, off * 3);
      col.set(p.attributes.color.array, off * 3);
      off += p.attributes.position.count;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
  }

  window.FishGLB = { uTime: uTime, load: load, spawn: spawn, bake: bake, addBend: addBend };
})();
