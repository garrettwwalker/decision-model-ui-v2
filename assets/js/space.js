/* Product pages: the landing's starfield, quieter. A fixed canvas of faint stars that twinkle slowly and
   drift a little against the scroll; drawn at ~15fps and paused when the tab is hidden. Still under
   reduced motion. Usage: Space.stars() once the body exists. */
(function () {
  var TINTS = ["255,255,255", "255,255,255", "255,255,255", "255,236,214", "255,224,190", "255,214,220"];
  function rng(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  function stars() {
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var canvas = document.createElement("canvas");
    canvas.className = "stars";
    canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext("2d"), list = [], W = 0, H = 0;

    function seed() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(380, Math.round(W * H / 4200)), r = rng(11);
      list = [];
      for (var i = 0; i < n; i++) {
        var d = 0.15 + r() * 0.85;
        list.push({ x: r() * W, y: r() * H, r: 0.3 + d * d * 0.9, a: 0.15 + r() * 0.45,
                    tw: 2500 + r() * 5000, ph: r() * 6.3, d: d, c: TINTS[Math.floor(r() * TINTS.length)] });
      }
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var sy = window.scrollY;
      for (var i = 0; i < list.length; i++) {
        var s = list[i];
        var y = ((s.y - sy * s.d * 0.08) % H + H) % H;
        var a = reduce ? s.a : s.a * (0.7 + 0.3 * Math.sin(t / s.tw * 6.283 + s.ph));
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
