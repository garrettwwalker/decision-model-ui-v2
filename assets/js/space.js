/* Product pages: the night sky behind the tiles. Two fixed canvases:
   - a nebula haze in the logo's blue, violet and teal: domain-warped fractal noise (the landing's technique),
     painted once at low resolution and softened by a CSS blur, with dark dust lanes; each page has its own seed,
     and the haze slides up a little as the page scrolls, so it reads as depth rather than wallpaper;
   - a starfield over it that twinkles slowly and drifts a little against the scroll (~15fps, paused when the tab
     is hidden). Both stay still under reduced motion.
   Usage: Space.stars() once the body exists. */
(function () {
  var TINTS = ["255,255,255", "255,255,255", "255,255,255", "214,232,255", "200,220,255", "226,214,255", "206,255,240"];
  // per page, chosen by rendering them: each spreads its color across the screen without one hue taking over
  var SEEDS = { "briefing.html": 0, "memo.html": 13, "team.html": 66, "workbench.html": 90, "ask.html": 27 };
  var HUES = [[74, 168, 255], [169, 139, 255], [62, 224, 184], [90, 140, 255]]; // blue, violet, teal, back to blue
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rng(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var band = function (v, a, b) { return smooth((v - a) / (b - a)); };

  function makeNoise(seed) {
    var r = rng(seed * 48271 + 1), perm = new Uint8Array(512), vals = new Float32Array(256), i;
    for (i = 0; i < 256; i++) { perm[i] = i; vals[i] = r(); }
    for (i = 255; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
    for (i = 0; i < 256; i++) perm[i + 256] = perm[i];
    return function (x, y) {
      var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      xi &= 255; yi &= 255;
      var a = vals[perm[perm[xi] + yi]], b = vals[perm[perm[xi + 1] + yi]];
      var c = vals[perm[perm[xi] + yi + 1]], d = vals[perm[perm[xi + 1] + yi + 1]];
      return lerp(lerp(a, b, u), lerp(c, d, u), v);
    };
  }
  function fbm(n, x, y, oct) {
    var s = 0, a = 0.5, f = 1, norm = 0;
    for (var o = 0; o < oct; o++) { s += a * n(x * f, y * f); norm += a; a *= 0.5; f *= 2.03; }
    return s / norm;
  }
  function warped(n, x, y) {
    var q1 = fbm(n, x + 1.7, y + 9.2, 4), q2 = fbm(n, x + 8.3, y + 2.8, 4);
    return fbm(n, x + 2.4 * q1, y + 2.4 * q2, 5);
  }
  function ramp(t) {
    t = clamp(t, 0, 1) * (HUES.length - 1);
    var i = Math.min(HUES.length - 2, Math.floor(t)), k = t - i;
    return [0, 1, 2].map(function (c) { return lerp(HUES[i][c], HUES[i + 1][c], k); });
  }

  function haze() {
    var page = location.pathname.split("/").pop() || "index.html";
    var seed = SEEDS[page] != null ? SEEDS[page] : 0;
    var cv = document.createElement("canvas");
    cv.className = "haze";
    cv.setAttribute("aria-hidden", "true");
    document.body.insertBefore(cv, document.body.firstChild);
    var nA = makeNoise(11 + seed), nB = makeNoise(23 + seed), nC = makeNoise(37 + seed), nD = makeNoise(53 + seed);
    var W = 200, H = Math.round(W * (cv.offsetHeight || 1.5 * window.innerHeight) / (cv.offsetWidth || window.innerWidth));
    cv.width = W; cv.height = H;
    var g = cv.getContext("2d"), img = g.createImageData(W, H), d = img.data;
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var u = x / W * 2.6, v = y / W * 2.6;
      var open = band(fbm(nB, u * 0.3, v * 0.3, 2), 0.12, 0.55);          // where the cloud gathers
      var w = warped(nA, u, v);
      var dens = band(w, 0.36, 0.78);
      dens = dens * dens * open + band(w, 0.24, 0.7) * 0.45 * (0.45 + 0.55 * open); // filaments + a haze everywhere
      var col = ramp((fbm(nC, u * 0.45, v * 0.45, 3) - 0.28) / 0.44);
      var hot = clamp((dens - 0.65) / 0.35, 0, 1) * 0.45;                 // dense cores go toward white
      var lanes = band(warped(nD, u * 1.1, v * 1.1), 0.56, 0.7);          // dark dust across the glow
      var o = (y * W + x) * 4;
      d[o] = lerp(col[0], 255, hot); d[o + 1] = lerp(col[1], 255, hot); d[o + 2] = lerp(col[2], 255, hot);
      d[o + 3] = 255 * 0.55 * Math.min(1, dens) * (1 - 0.75 * lanes);
    }
    g.putImageData(img, 0, 0);
    cv.classList.add("is-ready");
    if (reduce) return;
    // depth: the haze (half again as tall as the screen) slides up a third of a screen over the whole page
    var queued = false;
    function place() {
      queued = false;
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      cv.style.transform = "translate3d(0," + (-window.scrollY / max * window.innerHeight * 0.33).toFixed(1) + "px,0)";
    }
    window.addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(place); } }, { passive: true });
    window.addEventListener("resize", place);
    place();
  }

  function stars() {
    var canvas = document.createElement("canvas");
    canvas.className = "stars";
    canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
    // the haze goes under the stars; painting it takes a moment, so it comes in after first paint
    setTimeout(haze, 0);
    var ctx = canvas.getContext("2d"), list = [], W = 0, H = 0;

    function seed() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(520, Math.round(W * H / 3000)), r = rng(11);
      list = [];
      for (var i = 0; i < n; i++) {
        var d = 0.15 + r() * 0.85;
        list.push({ x: r() * W, y: r() * H, r: 0.35 + d * d * 1.15, a: 0.3 + r() * 0.6,
                    tw: 2500 + r() * 5000, ph: r() * 6.3, d: d, c: TINTS[Math.floor(r() * TINTS.length)] });
      }
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var sy = window.scrollY;
      for (var i = 0; i < list.length; i++) {
        var s = list[i];
        var y = ((s.y - sy * s.d * 0.08) % H + H) % H;
        var a = reduce ? s.a : s.a * (0.65 + 0.35 * Math.sin(t / s.tw * 6.283 + s.ph));
        ctx.fillStyle = "rgba(" + s.c + "," + a.toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, 6.283); ctx.fill();
      }
    }
    seed(); draw(0);
    window.addEventListener("resize", function () { seed(); draw(performance.now()); });
    if (reduce) {
      window.addEventListener("scroll", function () { requestAnimationFrame(function () { draw(0); }); }, { passive: true });
      return;
    }
    var last = 0;
    (function loop(t) {
      if (!document.hidden && t - last > 66) { last = t; draw(t); }
      requestAnimationFrame(loop);
    })(0);
  }

  window.Space = { stars: stars };
})();
