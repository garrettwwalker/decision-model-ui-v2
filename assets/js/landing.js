(function () {
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  Sky.all();

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
  var TILES = ".note, .tag, .swan, .contact__form, .split__q, .part, .split__fused"; // revealed whole, text included
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
      if (el.closest(".clouds") || el.querySelector(BLOCKS) || el.closest(TILES)) return; // innermost free-standing text only
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

  /* ---------- Overnight watch card: cycles through flagged events ---------- */
  (function () {
    var card = document.querySelector(".watch");
    if (!card) return;
    var EVENTS = [
      { event: "Hormuz closes for 7+ days", p: 27, when: "within 30 days", touches: "9 vessels and 312 purchase orders", move: "Bridge-buy resin from Singapore", vlabel: "Protects", value: "$11.7M" },
      { event: "The Red Sea shuts to traffic", p: 34, when: "within 30 days", touches: "Resin for the Gebze plant, via Suez", move: "Pre-book Cape routing for 3 sailings", vlabel: "Protects", value: "$4.1M" },
      { event: "New Section 232 tariffs", p: 62, when: "by the second quarter", touches: "14 SKUs from 3 suppliers", move: "Front-load first-quarter imports", vlabel: "Protects", value: "$2.8M" },
      { event: "A ceasefire in Ukraine", p: 18, when: "within 60 days", touches: "Black Sea grain and steel lanes", move: "Keep spot contracts open", vlabel: "Upside", value: "+$1.2M", up: true },
      { event: "Sanctions hit two of your feeders", p: 19, when: "within 60 days", touches: "The ME4 Gulf shuttle, 88 POs", move: "Line up replacement charters", vlabel: "Protects", value: "$1.9M" }
    ];
    var body = card.querySelector(".watch__body");
    var count = card.querySelector("[data-watch-count]");
    var bar = card.querySelector('[data-watch="bar"]');
    var cur = 0;
    function fill(e) {
      ["event", "when", "touches", "move", "vlabel", "value"].forEach(function (k) {
        card.querySelector('[data-watch="' + k + '"]').textContent = e[k];
      });
      card.querySelector('[data-watch="p"]').textContent = e.p + "%";
      count.textContent = (cur + 1) + " of " + EVENTS.length;
      card.classList.toggle("is-up", !!e.up);
      bar.style.width = "0";
      requestAnimationFrame(function () { requestAnimationFrame(function () { bar.style.width = e.p + "%"; }); });
    }
    function next() {
      body.classList.add("is-out");
      setTimeout(function () {
        cur = (cur + 1) % EVENTS.length;
        fill(EVENTS[cur]);
        body.classList.remove("is-out");
      }, 350);
    }
    fill(EVENTS[0]);
    setInterval(next, 4500);
  })();

  /* ---------- Node-link model: connectors draw themselves once, row by row, when the section arrives ---------- */
  (function () {
    var fig = document.querySelector(".graph");
    if (!fig) return;
    var svg = fig.querySelector(".graph__edges");
    var NS = "http://www.w3.org/2000/svg";
    var EDGES = [["driver", "asset"], ["asset", "road"], ["asset", "crew"], ["road", "exposure"], ["crew", "exposure"],
                 ["exposure", "security"], ["exposure", "procurement"], ["exposure", "board"]];
    var WAVES = [[0], [1, 2], [3, 4], [5, 6, 7]]; // edges in a wave draw together
    var node = function (k) { return fig.querySelector('[data-node="' + k + '"]'); };
    var edges = [], done = false, started = false;
    function draw() {
      var box = fig.getBoundingClientRect();
      svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
      svg.textContent = "";
      edges = EDGES.map(function (e) {
        var a = node(e[0]).getBoundingClientRect(), b = node(e[1]).getBoundingClientRect();
        var x1 = a.left + a.width / 2 - box.left, y1 = a.bottom - box.top;
        var x2 = b.left + b.width / 2 - box.left, y2 = b.top - box.top - 3;
        var my = (y1 + y2) / 2;
        var p = document.createElementNS(NS, "path");
        p.setAttribute("d", "M" + x1 + " " + y1 + " C" + x1 + " " + my + " " + x2 + " " + my + " " + x2 + " " + y2);
        svg.appendChild(p);
        var head = document.createElementNS(NS, "path"); // the curves end vertical, so the arrow points straight down
        head.setAttribute("class", "graph__head");
        head.setAttribute("d", "M" + (x2 - 4) + " " + (y2 - 6) + " L" + x2 + " " + (y2 + 1) + " L" + (x2 + 4) + " " + (y2 - 6));
        svg.appendChild(head);
        var len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = done ? 0 : len;
        head.style.opacity = done ? 1 : 0;
        return { p: p, head: head, len: len };
      });
    }
    function drawWave(idx, then) {
      var t0 = Date.now(), D = 520;
      (function step() {
        var k = Math.min(1, (Date.now() - t0) / D);
        var ease = 1 - Math.pow(1 - k, 3);
        idx.forEach(function (i) { edges[i].p.style.strokeDashoffset = edges[i].len * (1 - ease); });
        if (k < 1) return setTimeout(step, 16);
        idx.forEach(function (i) { edges[i].head.style.opacity = 1; });
        then();
      })();
    }
    function play() {
      started = true;
      var w = 0;
      (function next() {
        if (w >= WAVES.length) { done = true; return; }
        drawWave(WAVES[w++], function () { setTimeout(next, 90); });
      })();
    }
    function check() {
      if (started) return;
      var r = fig.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.7 && r.bottom > 0) play();
    }
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) done = started = true;
    draw();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    window.addEventListener("resize", function () { if (started) done = true; draw(); });
    window.addEventListener("scroll", check, { passive: true });
    check();
  })();

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
