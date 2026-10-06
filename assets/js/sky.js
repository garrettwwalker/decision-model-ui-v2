/* Procedural cloud banks. Each [data-clouds] element gets an inline SVG of
   overlapping puffs, roughened by a turbulence displacement filter so the edges
   read as vapour rather than circles. Colors come from CSS custom properties
   on the bank (see .clouds--* in CSS):
     --c-lo   shadowed body      --c-mid  main body
     --c-hi   sunlit tops        --c-rim  underside glow (dawn light is low) */
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

  // n: puff count; x/y: placement range in % of the bank; s: diameter range in % of bank width;
  // fill: [cx, cy, w, h] in % for a solid core so dense banks have no gaps
  var SHAPES = {
    top:   { n: 34, x: [-5, 105], y: [-10, 62],  s: [12, 26], fill: [50, 15, 120, 60] },
    left:  { n: 24, x: [0, 95],   y: [15, 100],  s: [16, 34], fill: [40, 70, 100, 70] },
    right: { n: 24, x: [5, 100],  y: [15, 100],  s: [16, 34], fill: [60, 70, 100, 70] },
    edge:  { n: 44, x: [-3, 103], y: [30, 82],   s: [5, 11],  fill: [50, 62, 112, 40] },
    band:  { n: 44, x: [-3, 103], y: [35, 70],   s: [3, 8],   fill: [50, 52, 110, 30] },
    floor: { n: 36, x: [-3, 103], y: [40, 100],  s: [6, 14],  fill: [50, 100, 110, 60] },
    wisp:  { n: 9,  x: [10, 90],  y: [40, 60],   s: [14, 30] }
  };

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function build(host, seed) {
    var shape = SHAPES[host.getAttribute("data-clouds")];
    if (!shape) return;
    var rand = rng(seed);
    var W = Math.max(1, host.clientWidth), H = Math.max(1, host.clientHeight);
    // Tall, narrow banks (phones) need proportionally bigger puffs
    var tall = H > W ? Math.min(1.8, H / W) : 1;

    var puffs = [];
    for (var i = 0; i < shape.n; i++) {
      var d = (shape.s[0] + rand() * (shape.s[1] - shape.s[0])) * tall * W / 100;
      puffs.push({
        x: (shape.x[0] + rand() * (shape.x[1] - shape.x[0])) * W / 100,
        y: (shape.y[0] + rand() * (shape.y[1] - shape.y[0])) * H / 100,
        r: d / 2,
        sq: 0.78 + rand() * 0.2 // clouds are wider than tall
      });
    }
    var avg = puffs.reduce(function (a, p) { return a + p.r; }, 0) / puffs.length;

    var id = "cl" + (++uid);
    var svg = el("svg", { width: W, height: H, viewBox: "0 0 " + W + " " + H, "aria-hidden": "true", focusable: "false" });
    var defs = el("defs", {});
    var f = el("filter", { id: id, x: "-25%", y: "-25%", width: "150%", height: "150%", "color-interpolation-filters": "sRGB" });
    f.appendChild(el("feTurbulence", { type: "fractalNoise", baseFrequency: (0.9 / avg).toFixed(4), numOctaves: 4, seed: seed % 97, result: "n" }));
    f.appendChild(el("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: Math.round(avg * 0.24), xChannelSelector: "R", yChannelSelector: "G", result: "d" }));
    f.appendChild(el("feGaussianBlur", { in: "d", stdDeviation: Math.max(2, avg * 0.06).toFixed(1) }));
    defs.appendChild(f);
    var fs = el("filter", { id: id + "s", x: "-25%", y: "-25%", width: "150%", height: "150%" });
    fs.appendChild(el("feGaussianBlur", { stdDeviation: (avg * 0.22).toFixed(1) }));
    defs.appendChild(fs);
    svg.appendChild(defs);

    function layer(fill, dy, k, filter, opacity, subset) {
      var g = el("g", { filter: "url(#" + filter + ")", style: "fill:var(" + fill + ")" });
      if (opacity) g.setAttribute("opacity", opacity);
      if (shape.fill && !subset) {
        var c = shape.fill;
        g.appendChild(el("ellipse", {
          cx: c[0] * W / 100, cy: c[1] * H / 100 + dy * avg,
          rx: c[2] * W / 200 * k, ry: c[3] * H / 200 * k
        }));
      }
      puffs.forEach(function (p, i) {
        if (subset && !subset(p, i)) return;
        g.appendChild(el("ellipse", { cx: p.x.toFixed(1), cy: (p.y + dy * p.r).toFixed(1), rx: (p.r * k).toFixed(1), ry: (p.r * k * p.sq).toFixed(1) }));
      });
      svg.appendChild(g);
    }

    // Underside glow peeks out below, then body, then sunlit crowns on the upper puffs
    layer("--c-rim", 0.12, 0.94, id, null);
    layer("--c-lo", 0, 1, id, null);
    layer("--c-mid", -0.14, 0.86, id, null);
    layer("--c-hi", -0.34, 0.55, id + "s", 0.55, function (p, i) { return i % 2 === 0; });

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
