/* Procedural cumulus banks. Each [data-clouds] element gets an inline SVG of
   clouds built like real cumulus: a flat base, puffs that peak in the middle and
   taper at the ends, a smaller crown on top, one continuous light gradient per
   cloud (lit crown, shadowed base), soft highlights on each puff and a glow along
   the underside. Colors come from CSS custom properties on the bank:
     --c-hi  sunlit crowns     --c-mid  body       --c-lo  shadowed base
     --c-rim underside glow    --c-base solid fill that joins the next section
   [data-flip] hangs the bank upside down (clouds below a band). */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var uid = 0;

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Rows run back to front. y: baseline as % of bank height; w: cloud width as % of bank
  // width; h: cloud height as a share of its width; gap: space between neighbours as a share
  // of cloud width (negative overlaps). base: % of bank height below which --c-base fills solid.
  var SHAPES = {
    top: { rows: [
      { y: 16, w: [30, 44], h: [0.42, 0.54], gap: -0.3 },
      { y: 40, w: [26, 38], h: [0.42, 0.54], gap: -0.3 },
      { y: 64, w: [24, 34], h: [0.42, 0.52], gap: -0.28 }
    ] },
    left: { rows: [
      { y: 32, w: [58, 78], h: [0.42, 0.5], gap: -0.45 },
      { y: 58, w: [54, 72], h: [0.42, 0.5], gap: -0.45 },
      { y: 84, w: [50, 68], h: [0.40, 0.48], gap: -0.4 },
      { y: 108, w: [60, 82], h: [0.36, 0.44], gap: -0.45 }
    ] },
    edge: { base: 60, rows: [
      { y: 56, w: [11, 17], h: [0.40, 0.52], gap: -0.22 },
      { y: 76, w: [13, 20], h: [0.38, 0.48], gap: -0.25 }
    ] },
    band: { base: 50, rows: [
      { y: 52, w: [8, 13], h: [0.42, 0.55], gap: -0.2 },
      { y: 64, w: [10, 15], h: [0.38, 0.50], gap: -0.22 }
    ] },
    floor: { base: 72, rows: [
      { y: 66, w: [12, 18], h: [0.42, 0.54], gap: -0.22 },
      { y: 90, w: [14, 22], h: [0.40, 0.50], gap: -0.25 }
    ] }
  };
  SHAPES.right = SHAPES.left;

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function between(rand, r) { return r[0] + rand() * (r[1] - r[0]); }
  function f1(n) { return n.toFixed(1); }

  // Puffs for one cloud centred on cx, sitting on baseline by, w wide and h tall
  function puffs(rand, cx, by, w, h) {
    var out = [];
    var n = 4 + Math.floor(rand() * 3); // 4-6 along the base, biggest in the middle
    for (var i = 0; i < n; i++) {
      var u = (i + 0.5) / n;
      // tallest puff reaches ~h: a puff sitting on the baseline is 2r tall
      var r = h * (0.22 + 0.26 * Math.sin(Math.PI * u)) * (0.9 + rand() * 0.2);
      out.push({ x: cx - w / 2 + w * u + (rand() - 0.5) * w * 0.04, y: by - r * 0.95, r: r });
    }
    var m = 1 + Math.floor(rand() * 2); // 1-2 crown puffs near the middle
    for (var j = 0; j < m; j++) {
      var rr = h * (0.26 + rand() * 0.08);
      out.push({ x: cx + (j - (m - 1) / 2) * w * 0.22 + (rand() - 0.5) * w * 0.08, y: by - h + rr, r: rr, crown: true });
    }
    return out;
  }

  function build(host, seed) {
    var shape = SHAPES[host.getAttribute("data-clouds")];
    if (!shape) return;
    var rand = rng(seed);
    var W = Math.max(1, host.clientWidth), H = Math.max(1, host.clientHeight);
    var scale = W < 700 ? Math.min(2.2, 700 / W) : 1; // phones: keep clouds from shrinking to pebbles
    var id = "cl" + (++uid);

    var svg = el("svg", { width: W, height: H, viewBox: "0 0 " + W + " " + H, "aria-hidden": "true", focusable: "false" });
    var defs = el("defs", {});
    var grad = el("linearGradient", { id: id + "g", x1: 0, y1: 0, x2: 0, y2: 1 });
    var joins = shape.base != null; // this bank melts into the section below it
    (joins ? [[0, "--c-hi"], [0.4, "--c-mid"], [0.78, "--c-base"], [1, "--c-base"]]
           : [[0, "--c-hi"], [0.42, "--c-mid"], [1, "--c-lo"]]).forEach(function (s) {
      grad.appendChild(el("stop", { offset: s[0], style: "stop-color:var(" + s[1] + ")" }));
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    var blurs = {};
    function blur(sd) {
      var k = Math.max(1, Math.round(sd));
      if (!blurs[k]) {
        var f = el("filter", { id: id + "b" + k, x: "-30%", y: "-30%", width: "160%", height: "160%" });
        f.appendChild(el("feGaussianBlur", { stdDeviation: k }));
        defs.appendChild(f);
        blurs[k] = "url(#" + id + "b" + k + ")";
      }
      return blurs[k];
    }

    var root = el("g", {});
    if (host.hasAttribute("data-flip")) root.setAttribute("transform", "translate(0 " + H + ") scale(1 -1)");
    svg.appendChild(root);

    if (shape.base != null) {
      // solid base that fades out, so it melts into whatever the next section paints
      var bg = el("linearGradient", { id: id + "base", x1: 0, y1: 0, x2: 0, y2: 1 });
      bg.appendChild(el("stop", { offset: 0, style: "stop-color:var(--c-base, var(--c-lo))" }));
      bg.appendChild(el("stop", { offset: 0.5, style: "stop-color:var(--c-base, var(--c-lo))" }));
      bg.appendChild(el("stop", { offset: 1, style: "stop-color:var(--c-base, var(--c-lo));stop-opacity:0" }));
      defs.appendChild(bg);
      root.appendChild(el("rect", { x: -W * 0.1, y: H * shape.base / 100, width: W * 1.2, height: H * (1 - shape.base / 100) + 2, fill: "url(#" + id + "base)" }));
    }

    shape.rows.forEach(function (row) {
      var by0 = H * row.y / 100;
      var x = -W * 0.08 - rand() * W * 0.06;
      while (x < W * 1.08) {
        var w = W * between(rand, row.w) / 100 * scale;
        var h = w * between(rand, row.h);
        var cx = x + w / 2;
        var by = by0 + (rand() - 0.5) * h * 0.12;
        var ps = puffs(rand, cx, by, w, h);

        var cid = id + "c" + (++uid);
        var clip = el("clipPath", { id: cid });
        ps.forEach(function (p) { clip.appendChild(el("circle", { cx: f1(p.x), cy: f1(p.y), r: f1(p.r) })); });
        clip.appendChild(el("rect", { x: f1(cx - w / 2 + h * 0.12), y: f1(by - h * 0.36), width: f1(w - h * 0.24), height: f1(h * 0.36), rx: f1(h * 0.18) }));
        defs.appendChild(clip);

        var soft = el("g", { filter: blur(Math.max(1, h * 0.012)) }); // soften the clipped edge
        var body = el("g", { "clip-path": "url(#" + cid + ")" });
        body.appendChild(el("rect", { x: f1(cx - w / 2 - h * 0.2), y: f1(by - h * 1.2), width: f1(w + h * 0.4), height: f1(h * 1.25), fill: "url(#" + id + "g)" }));
        var hl = el("g", { filter: blur(h * 0.09), style: "fill:var(--c-hi)", opacity: 0.6 });
        ps.forEach(function (p) {
          hl.appendChild(el("circle", { cx: f1(p.x - p.r * 0.18), cy: f1(p.y - p.r * 0.32), r: f1(p.r * (p.crown ? 0.55 : 0.5)) }));
        });
        body.appendChild(hl);
        if (!joins) { // underside glow only on free-floating banks; on joining banks it drew a hard line
          body.appendChild(el("ellipse", { cx: f1(cx), cy: f1(by), rx: f1(w * 0.5), ry: f1(h * 0.14), style: "fill:var(--c-rim)", filter: blur(h * 0.06), opacity: 0.85 }));
        }
        soft.appendChild(body);
        root.appendChild(soft);

        x += w * (1 + between(rand, [row.gap, row.gap * 0.5]));
      }
    });

    host.textContent = "";
    host.appendChild(svg);
  }

  function all(root) {
    var els = (root || document).querySelectorAll("[data-clouds]");
    els.forEach(function (e, i) { build(e, 7 + i * 101); });
  }

  var lastW = window.innerWidth;
  window.addEventListener("resize", function () {
    if (Math.abs(window.innerWidth - lastW) < 40) return; // ignore mobile URL-bar jitter
    lastW = window.innerWidth;
    all();
  });

  window.Sky = { build: build, all: all };
})();
