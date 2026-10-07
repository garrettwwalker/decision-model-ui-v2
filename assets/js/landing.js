(function () {
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  Sky.all();

  /* ---------- Sun glitter on the water: short ripple streaks, densest under the sun,
     scattering a little wider and dimmer toward the viewer ---------- */
  (function () {
    var host = document.querySelector(".hero__glint");
    if (!host) return;
    var NS = "http://www.w3.org/2000/svg";
    var seed = 42;
    function rand() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 300 100");
    svg.setAttribute("preserveAspectRatio", "none");
    var y = 0.6;
    while (y < 92) {
      var t = y / 92;                                  // 0 at the horizon, 1 near the viewer
      var dashes = 2 + Math.floor(rand() * 3);
      for (var i = 0; i < dashes; i++) {
        var spread = 62 + 38 * t;                      // half-width of the path, in a 300-wide box
        var w = (20 + rand() * 60) * (1 - 0.3 * t);
        var cx = 150 + (rand() * 2 - 1) * spread * (0.4 + 0.6 * rand());
        var r = document.createElementNS(NS, "rect");
        r.setAttribute("x", (cx - w / 2).toFixed(1));
        r.setAttribute("y", y.toFixed(2));
        r.setAttribute("width", w.toFixed(1));
        r.setAttribute("height", (0.5 + 0.9 * t).toFixed(2));
        r.setAttribute("rx", "0.6");
        r.setAttribute("fill", t < 0.25 ? "#fff3dc" : "#ffd9a8");
        r.setAttribute("opacity", ((1 - 0.85 * t) * (0.55 + 0.45 * rand())).toFixed(2));
        svg.appendChild(r);
      }
      y += 1.1 + 3.4 * t * t + rand() * 0.8;           // ripples spread apart toward the viewer
    }
    host.appendChild(svg);
  })();

  /* ---------- Hero: clouds part, sun rises ---------- */
  var hero = document.querySelector(".hero");
  var stage = document.querySelector(".hero__stage");
  var RIM_NIGHT = [27, 40, 54];
  var RIM_DAWN = [222, 122, 86];

  function heroFrame() {
    var r = hero.getBoundingClientRect();
    var span = hero.offsetHeight - window.innerHeight;
    var p = clamp(-r.top / span, 0, 1);
    var eased = 1 - Math.pow(1 - p, 2);
    stage.style.setProperty("--p", eased.toFixed(4));
    stage.style.setProperty("--after", clamp((p - 0.5) / 0.3, 0, 1).toFixed(3));
    var rim = RIM_NIGHT.map(function (c, i) { return Math.round(lerp(c, RIM_DAWN[i], clamp(p * 1.3, 0, 1))); });
    stage.style.setProperty("--rim", "rgb(" + rim.join(",") + ")");
  }

  /* ---------- Read-as-you-scroll: text darkens word by word, widgets fill in ----------
     The reference's signature move, applied to everything below the hero. */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var day = document.querySelector(".day");
  var BLOCKS = "p, h2, h3, li, dt, dd, label";
  var UNITS = ".chip";                       // inline widgets revealed whole, like a word
  var TILES = ".note, .tag, .swan, .chain li, .bubble, .contact__form"; // revealed whole, text included
  var reads = [], tiles = [];

  function splitWords(root, units) {
    Array.prototype.slice.call(root.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        if (!node.textContent.trim()) return;
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var w = document.createElement("span");
          w.className = "w";
          w.textContent = part;
          frag.appendChild(w);
          units.push(w);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        if (node.matches(UNITS)) { node.classList.add("w"); units.push(node); return; }
        if (node.matches("svg, input, textarea, select, .btn") || node.matches(BLOCKS)) return;
        splitWords(node, units);
      }
    });
  }

  if (day && !reduceMotion) {
    day.querySelectorAll(BLOCKS).forEach(function (el) {
      if (el.closest(".clouds") || el.parentElement.closest(BLOCKS) || el.closest(TILES)) return; // free-standing text only
      var units = [];
      splitWords(el, units);
      if (units.length) reads.push({ el: el, units: units, n: -1 });
    });
    day.querySelectorAll(TILES).forEach(function (el) {
      if (el.parentElement.closest(TILES)) return; // outermost tiles only
      el.classList.add("tile");
      tiles.push({ el: el, on: null });
    });
  }

  function readFrame() {
    var vh = window.innerHeight;
    var atEnd = window.scrollY + vh >= document.documentElement.scrollHeight - 4;
    reads.forEach(function (r) {
      var b = r.el.getBoundingClientRect();
      if (b.bottom < -vh || b.top > vh * 2) return; // far off screen: leave as is
      // starts when the block's top reaches 85% of the viewport, done when its bottom reaches 55%
      var start = vh * 0.85, end = vh * 0.55;
      var t = clamp((start - b.top) / ((b.bottom - b.top) + (start - end)), 0, 1);
      if (atEnd && b.top < vh) t = 1; // the page can't scroll further: finish what's visible
      var n = Math.round(t * r.units.length);
      if (n === r.n) return;
      r.units.forEach(function (u, i) { u.classList.toggle("on", i < n); });
      r.n = n;
    });
    tiles.forEach(function (o) {
      // a tile appears in one go once its top crosses 85% of the viewport
      var top = o.el.getBoundingClientRect().top;
      var on = top < vh * 0.85 || (atEnd && top < vh);
      if (on === o.on) return;
      o.el.classList.toggle("on", on);
      o.on = on;
    });
  }

  /* ---------- Nav theme follows the section under it ---------- */
  var nav = document.querySelector(".nav");
  var themed = document.querySelectorAll("[data-nav]");
  function navFrame() {
    var y = nav.offsetHeight / 2;
    var theme = hero.getBoundingClientRect().bottom > y ? "dark" : "light";
    themed.forEach(function (s) {
      var b = s.getBoundingClientRect();
      if (b.top <= y && b.bottom > y) theme = s.getAttribute("data-nav");
    });
    nav.setAttribute("data-theme", theme);
    nav.classList.toggle("is-scrolled", hero.getBoundingClientRect().bottom < window.innerHeight * 0.5);
  }

  var ticking = false;
  function onScroll() {
    navFrame(); readFrame(); // cheap, and must never lag behind the page
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      heroFrame();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav__toggle");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".nav__links a").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });

  /* ---------- Workbench preview heatmap ---------- */
  var heat = document.querySelector("[data-heat]");
  if (heat) {
    var vals = [.12,.08,.31,.05,.62,.18,.09,.22, .41,.12,.08,.71,.15,.05,.33,.10,
                .06,.44,.19,.09,.07,.28,.52,.14, .23,.05,.11,.36,.83,.17,.06,.09,
                .14,.27,.06,.48,.21,.11,.39,.04];
    vals.forEach(function (v) {
      var c = document.createElement("span");
      c.style.background = heatColor(v);
      heat.appendChild(c);
    });
  }
  function heatColor(v) {
    // night → dusk rose → amber → ember: the same ramp as the sky
    var stops = [[12, 36, 51], [154, 88, 104], [255, 181, 71], [242, 104, 60]];
    var x = clamp(v, 0, 1) * (stops.length - 1);
    var i = Math.min(stops.length - 2, Math.floor(x)), t = x - i;
    var c = stops[i].map(function (a, k) { return Math.round(lerp(a, stops[i + 1][k], t)); });
    return "rgb(" + c.join(",") + ")";
  }

  /* ---------- Contact form (mockup: no backend) ---------- */
  var form = document.querySelector(".contact__form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = form.querySelector(".contact__msg");
    var bad = null;
    form.querySelectorAll("input").forEach(function (i) {
      var ok = i.checkValidity() && i.value.trim() !== "";
      i.setAttribute("aria-invalid", ok ? "false" : "true");
      if (!ok && !bad) bad = i;
    });
    if (bad) {
      msg.textContent = "Add a work email and company so we know whose network to model.";
      bad.focus();
      return;
    }
    msg.textContent = "Thanks. This is a mockup, so nothing was sent, but a real request would reach the team.";
    form.reset();
  });
})();
