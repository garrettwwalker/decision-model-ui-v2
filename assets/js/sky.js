/* Procedural cloud banks: each [data-clouds] element is filled with overlapping
   "puffs" whose colors come from CSS custom properties (see .clouds--* in CSS). */
(function () {
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // n: puff count; x/y: placement range in % of the bank; s: diameter range in % of bank width
  var SHAPES = {
    top:   { n: 42, x: [0, 100], y: [0, 70],   s: [9, 22],  fill: [50, 25, 120, 60] },
    left:  { n: 30, x: [0, 100], y: [20, 100], s: [13, 30], fill: [45, 65, 110, 80] },
    right: { n: 30, x: [0, 100], y: [20, 100], s: [13, 30], fill: [55, 65, 110, 80] },
    edge:  { n: 46, x: [-2, 102], y: [50, 100], s: [3, 9] },
    band:  { n: 50, x: [-2, 102], y: [30, 75],  s: [2.5, 7] },
    floor: { n: 40, x: [-2, 102], y: [45, 105], s: [5, 13] }
  };

  function build(el, seed) {
    var shape = SHAPES[el.getAttribute("data-clouds")];
    if (!shape) return;
    var rand = rng(seed);
    var rect = el.getBoundingClientRect();
    // Tall, narrow banks (phones) need proportionally bigger puffs
    var tall = rect.height > rect.width ? Math.min(1.8, rect.height / rect.width) : 1;
    var frag = document.createDocumentFragment();

    if (shape.fill) {
      var f = document.createElement("span");
      f.className = "clouds__fill";
      f.style.left = shape.fill[0] - shape.fill[2] / 2 + "%";
      f.style.top = shape.fill[1] - shape.fill[3] / 2 + "%";
      f.style.width = shape.fill[2] + "%";
      f.style.height = shape.fill[3] + "%";
      frag.appendChild(f);
    }

    var puffs = [];
    for (var i = 0; i < shape.n; i++) {
      puffs.push({
        x: shape.x[0] + rand() * (shape.x[1] - shape.x[0]),
        y: shape.y[0] + rand() * (shape.y[1] - shape.y[0]),
        s: (shape.s[0] + rand() * (shape.s[1] - shape.s[0])) * tall
      });
    }
    // Lower puffs drawn last so their lit undersides overlap the ones above
    puffs.sort(function (a, b) { return a.y - b.y; });
    puffs.forEach(function (p) {
      var d = document.createElement("span");
      d.className = "puff";
      d.style.left = p.x + "%";
      d.style.top = p.y + "%";
      d.style.width = p.s * (rect.width / 100) + "px";
      d.style.height = p.s * (rect.width / 100) * (0.8 + rand() * 0.25) + "px";
      frag.appendChild(d);
    });
    el.textContent = "";
    el.appendChild(frag);
  }

  function all(root) {
    var els = (root || document).querySelectorAll("[data-clouds]");
    els.forEach(function (el, i) { build(el, 7 + i * 101); });
  }

  var lastW = window.innerWidth;
  window.addEventListener("resize", function () {
    if (Math.abs(window.innerWidth - lastW) < 40) return; // ignore mobile URL-bar jitter
    lastW = window.innerWidth;
    all();
  });

  window.Sky = { build: build, all: all };
})();
