/* Penumbra landing (preview). Built from landing.js: same reveal, watch card, graph and charts, with the
   eclipse hero, starfield, aurora and pointer glows in place of the dawn sky. */
(function () {
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

  /* ---------- Hero: the moon slides across a screen-filling sun; at totality the rim lights, then bursts
     outward into the page's colors as the second headline arrives ---------- */
  var hero = document.querySelector(".hero");
  var stage = document.querySelector(".hero__stage");

  function heroFrame() {
    var r = hero.getBoundingClientRect();
    var span = hero.offsetHeight - window.innerHeight;
    var p = reduceMotion ? 1 : clamp(-r.top / span, 0, 1);
    var cover = smooth(p / 0.52);
    var b = clamp((p - 0.52) / 0.24, 0, 1);
    stage.style.setProperty("--cover", cover.toFixed(4));
    // nothing lights until the moon is dead center (cover hits 1 at p = 0.52), or the ring would cross the moon
    stage.style.setProperty("--ring", clamp((p - 0.52) / 0.03, 0, 1).toFixed(3));
    stage.style.setProperty("--burst", (1 - Math.pow(1 - b, 3)).toFixed(4)); // explosive: fast, then settling
    stage.style.setProperty("--flash", Math.sin(Math.PI * clamp((p - 0.52) / 0.16, 0, 1)).toFixed(4));
    stage.style.setProperty("--after", clamp((p - 0.62) / 0.24, 0, 1).toFixed(3));
  }

  /* ---------- Read-as-you-scroll: text darkens word by word, widgets fill in ----------
     The reference's signature move, applied to everything below the hero. */
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
      if (el.querySelector(BLOCKS) || el.closest(TILES)) return; // innermost free-standing text only
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

  // Every word gets a place in reading order: its line's page position, plus how far along the line it
  // sits (as a fraction of one line height). One reading line sweeps down the page, so a paragraph can't
  // start before the one above it is done. Measured once per layout, not per frame.
  var READ_LINE = 0.7; // share of the viewport height
  function measureReads() {
    var sy = window.scrollY;
    reads.forEach(function (r) {
      var bb = r.el.getBoundingClientRect(), w = Math.max(1, bb.width);
      r.top = bb.top + sy; r.bottom = bb.bottom + sy;
      r.keys = r.units.map(function (u) {
        var b = u.getBoundingClientRect();
        return b.top + sy + (b.left - bb.left) / w * b.height;
      });
      r.n = -1;
    });
  }

  function readFrame() {
    var vh = window.innerHeight, sy = window.scrollY;
    var atEnd = sy + vh >= document.documentElement.scrollHeight - 4;
    var line = sy + vh * READ_LINE;
    reads.forEach(function (r) {
      if (!r.keys || r.bottom < sy - vh || r.top > sy + vh * 2) return; // far off screen: leave as is
      var lim = atEnd && r.top < sy + vh ? Infinity : line; // the page can't scroll further: finish what's visible
      var n = 0;
      while (n < r.keys.length && r.keys[n] < lim) n++;
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
      { event: "A ceasefire in Ukraine", p: 18, when: "within 6 months", touches: "Black Sea grain and steel lanes", move: "Keep spot contracts open", vlabel: "Upside", value: "+$1.2M", up: true },
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

  /* ---------- Node-link model: connectors draw themselves once, row by row, when the section arrives.
     The nodes are tiles: all fade in once the diagram's top crosses 85% of the viewport, and back out
     (lines dimmed too) when it drops below that line again. ---------- */
  (function () {
    var fig = document.querySelector(".graph");
    if (!fig) return;
    var svg = fig.querySelector(".graph__edges");
    var NS = "http://www.w3.org/2000/svg";
    var EDGES = [["driver", "asset"], ["asset", "road"], ["asset", "crew"], ["road", "exposure"], ["crew", "exposure"],
                 ["exposure", "security"], ["exposure", "procurement"], ["exposure", "board"]];
    var WAVES = [[0], [1, 2], [3, 4], [5, 6, 7]]; // edges in a wave draw together
    var node = function (k) { return fig.querySelector('[data-node="' + k + '"]'); };
    function paint() {
      if (still) return;
      var on = fig.getBoundingClientRect().top < window.innerHeight * 0.85;
      fig.querySelectorAll(".gn").forEach(function (n) {
        n.classList.toggle("on", on);
      });
      fig.classList.toggle("is-away", started && !on);
    }
    var edges = [], done = false, started = false;
    function draw() {
      var box = fig.getBoundingClientRect();
      svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
      svg.textContent = "";
      // the pulses' color runs down the diagram: teal at the driver to gold at the owners
      svg.insertAdjacentHTML("afterbegin", '<defs><linearGradient id="pn-pulse" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="' + box.height + '">' +
        '<stop offset="0" stop-color="#3ef0c6"/><stop offset=".35" stop-color="#3aa8ff"/><stop offset=".6" stop-color="#a77bff"/>' +
        '<stop offset=".82" stop-color="#ff4fa8"/><stop offset="1" stop-color="#ffd25a"/></linearGradient></defs>');
      var heads = {};
      edges = EDGES.map(function (e) {
        var a = node(e[0]).getBoundingClientRect(), b = node(e[1]).getBoundingClientRect();
        var x1 = a.left + a.width / 2 - box.left, y1 = a.bottom - box.top;
        var x2 = b.left + b.width / 2 - box.left, y2 = b.top - box.top - 3;
        // rounded elbow: down, across, then straight down into the box, so every arrow lands vertically
        var my = (y1 + y2) / 2, dx = x2 - x1, sx = dx > 0 ? 1 : -1;
        var r = Math.min(10, Math.abs(dx) / 2, (y2 - y1) / 4);
        var d = Math.abs(dx) < 1
          ? "M" + x1 + " " + y1 + " V" + y2
          : "M" + x1 + " " + y1 + " V" + (my - r) + " Q" + x1 + " " + my + " " + (x1 + sx * r) + " " + my +
            " H" + (x2 - sx * r) + " Q" + x2 + " " + my + " " + x2 + " " + (my + r) + " V" + y2;
        var p = document.createElementNS(NS, "path");
        p.setAttribute("d", d);
        svg.appendChild(p);
        var len = p.getTotalLength();
        // point the arrowhead along the line's direction over its last few pixels, not straight down
        var tip = p.getPointAtLength(len), back = p.getPointAtLength(Math.max(0, len - 7));
        var dx = tip.x - back.x, dy = tip.y - back.y, m = Math.hypot(dx, dy) || 1;
        dx /= m; dy /= m;
        var bx = tip.x - dx * 7, by = tip.y - dy * 7; // base of the arrowhead, 7px back along the line
        var head = document.createElementNS(NS, "path");
        head.setAttribute("class", "graph__head");
        head.setAttribute("d", "M" + (bx - dy * 4) + " " + (by + dx * 4) + " L" + tip.x + " " + tip.y + " L" + (bx + dy * 4) + " " + (by - dx * 4));
        var key = Math.round(tip.x) + "," + Math.round(tip.y);
        if (heads[key]) head.setAttribute("visibility", "hidden"); else heads[key] = 1; // merging lines share one arrow
        svg.appendChild(head);
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = done ? 0 : len;
        head.style.opacity = done ? 1 : 0;
        return { p: p, head: head, len: len, d: d };
      });
      if (done) pulses();
    }
    // once the lines are down, a short bright dash travels each one, wave by wave, on a loop
    function pulses() {
      if (still) return;
      WAVES.forEach(function (wave, w) {
        wave.forEach(function (i) {
          var e = edges[i], q = document.createElementNS(NS, "path");
          q.setAttribute("d", e.d);
          q.setAttribute("class", "graph__pulse");
          q.style.strokeDasharray = "28 " + Math.ceil(e.len + 60);
          q.style.setProperty("--len", Math.ceil(e.len));
          q.style.setProperty("--delay", (w * 0.55) + "s");
          svg.appendChild(q);
        });
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
        if (w >= WAVES.length) { done = true; pulses(); return; }
        drawWave(WAVES[w++], function () { setTimeout(next, 90); });
      })();
    }
    function check() {
      var r = fig.getBoundingClientRect();
      if (!started && r.top < window.innerHeight * 0.85 && r.bottom > 0) play();
      paint();
    }
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) done = started = true;
    else fig.querySelectorAll(".gn").forEach(function (n) { n.classList.add("tile"); });
    draw();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    window.addEventListener("resize", function () {
      if (started) done = true;
      draw(); paint();
    });
    window.addEventListener("scroll", check, { passive: true });
    check();
  })();

  /* ---------- Rigor charts: lines draw themselves once, left to right, when scrolled into view ---------- */
  (function () {
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var charts = Array.prototype.slice.call(document.querySelectorAll(".calib, .horizon"));
    if (still || !charts.length) return;
    // a clip reveal works for solid, dashed and dotted lines alike
    function clip(el, k) { el.style.clipPath = "inset(-10% " + ((1 - k) * 110 - 10).toFixed(2) + "% -10% -10%)"; }
    charts.forEach(function (c) {
      c.querySelectorAll(".draw").forEach(function (el) { clip(el, 0); });
      c.querySelectorAll(".draw-label").forEach(function (el) { el.style.opacity = 0; });
    });
    function draw(c) {
      var parts = Array.prototype.slice.call(c.querySelectorAll(".draw"));
      var labels = Array.prototype.slice.call(c.querySelectorAll(".draw-label"));
      var t0 = Date.now(), D = 1300;
      (function step() {
        var done = true;
        parts.forEach(function (el) {
          var delay = parseFloat(el.style.getPropertyValue("--d")) * 1000 || 0;
          var k = Math.max(0, Math.min(1, (Date.now() - t0 - delay) / D));
          clip(el, 1 - Math.pow(1 - k, 3));
          if (k < 1) done = false;
        });
        labels.forEach(function (el) { // each label fades in while its line draws past it
          var delay = parseFloat(el.style.getPropertyValue("--d")) * 1000 || 0;
          var k = Math.max(0, Math.min(1, (Date.now() - t0 - delay - D * 0.25) / (D * 0.5)));
          el.style.opacity = k.toFixed(2);
          if (k < 1) done = false;
        });
        if (!done) setTimeout(step, 16);
        else parts.forEach(function (el) { el.style.clipPath = ""; });
      })();
    }
    function check() {
      charts = charts.filter(function (c) {
        var r = c.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.85 && r.bottom > 0) { draw(c); return false; }
        return true;
      });
      if (!charts.length) window.removeEventListener("scroll", check);
    }
    window.addEventListener("scroll", check, { passive: true });
    check();
  })();

  /* ---------- Nav theme follows the section under it ---------- */
  var nav = document.querySelector(".nav");
  function navFrame() {
    nav.classList.toggle("is-scrolled", hero.getBoundingClientRect().bottom < window.innerHeight * 0.5);
  }

  var ticking = false;
  function onScroll() {
    navFrame(); readFrame(); // cheap, and must never lag behind the page
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      heroFrame(); skyFrame();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  // word positions shift whenever the layout does (resize, late fonts, the watch card changing height)
  var remeasure = 0;
  function relayout() { cancelAnimationFrame(remeasure); remeasure = requestAnimationFrame(function () { measureReads(); readFrame(); }); }
  measureReads();
  if (window.ResizeObserver) new ResizeObserver(relayout).observe(document.body);
  else window.addEventListener("resize", relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
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
    var cells = vals.map(function (v) {
      var c = document.createElement("span");
      c.style.background = heatColor(v);
      heat.appendChild(c);
      return { el: c, base: v };
    });
    // a live panel: about three-quarters of the cells breathe slowly around their reading, each on its own
    // period and phase, staying on the same ramp. Computed continuously (no CSS transitions to interrupt),
    // only while the card is on screen, and never under reduced motion
    var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!calm) {
      var rnd = Math.random;
      cells.forEach(function (c) {
        c.amp = rnd() < 0.25 ? 0 : 0.06 + rnd() * 0.12;
        c.per = 3500 + rnd() * 5000;
        c.ph = rnd() * Math.PI * 2;
      });
      var shown = false, last = 0;
      var frame = function (t) {
        if (shown && !document.hidden && t - last > 50) {
          last = t;
          cells.forEach(function (c) {
            if (c.amp) c.el.style.background = heatColor(c.base + c.amp * Math.sin(t / c.per * Math.PI * 2 + c.ph));
          });
        }
        requestAnimationFrame(frame);
      };
      if (window.IntersectionObserver) {
        new IntersectionObserver(function (es) { shown = es[0].isIntersecting; }).observe(heat);
      } else shown = true;
      requestAnimationFrame(frame);
    }
  }
  function heatColor(v) {
    // void → blue → violet → pink → gold: the penumbra's ramp
    var stops = [[22, 25, 32], [32, 92, 170], [140, 105, 245], [255, 79, 168], [255, 200, 95]];
    var x = clamp(v, 0, 1) * (stops.length - 1);
    var i = Math.min(stops.length - 2, Math.floor(x)), t = x - i;
    var c = stops[i].map(function (a, k) { return Math.round(lerp(a, stops[i + 1][k], t)); });
    return "rgb(" + c.join(",") + ")";
  }

  /* ---------- Space: page-wide aurora tint, starfield, pointer glow, card spotlights ---------- */
  var aurora = document.querySelector(".aurora");
  function skyFrame() {
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    // the aurora's hue drifts as you read down the page: teal-violet at the top, warmer by the end
    aurora.style.filter = "hue-rotate(" + (-70 * window.scrollY / max).toFixed(1) + "deg)";
  }

  var canvas = document.querySelector(".stars");
  var ctx = canvas.getContext("2d");
  var stars = [], W = 0, H = 0, DPR = 1;
  var pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, seen: false };
  var TINTS = ["255,255,255", "255,255,255", "255,255,255", "214,236,255", "190,255,236", "255,214,236"];
  function seed() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var n = Math.min(650, Math.round(W * H / 2600)), rnd = DB_rng(7);
    stars = [];
    for (var i = 0; i < n; i++) {
      var depth = 0.15 + rnd() * 0.85;
      stars.push({ x: rnd() * W, y: rnd() * H, r: 0.3 + depth * depth * 1.1, a: 0.25 + rnd() * 0.65,
                   tw: 1500 + rnd() * 4000, ph: rnd() * 6.3, d: depth, c: TINTS[Math.floor(rnd() * TINTS.length)] });
    }
  }
  function DB_rng(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function drawStars(t) {
    ctx.clearRect(0, 0, W, H);
    var sy = window.scrollY, ox = (pointer.x - 0.5) * 18, oy = (pointer.y - 0.5) * 12;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var y = ((s.y - sy * s.d * 0.12 - oy * s.d) % H + H) % H;
      var x = ((s.x - ox * s.d) % W + W) % W;
      var a = reduceMotion ? s.a : s.a * (0.65 + 0.35 * Math.sin(t / s.tw * 6.283 + s.ph));
      ctx.fillStyle = "rgba(" + s.c + "," + a.toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.283); ctx.fill();
    }
  }
  seed();
  window.addEventListener("resize", function () { seed(); drawStars(performance.now()); });

  var glow = document.querySelector(".glow");
  var spots = Array.prototype.slice.call(document.querySelectorAll(".note, .swan, .split__q, .part, .gn, .contact__form"));
  spots.forEach(function (el) { el.classList.add("spot"); });
  var lit = null;
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    pointer.tx = e.clientX / window.innerWidth; pointer.ty = e.clientY / window.innerHeight;
    if (!pointer.seen) { pointer.seen = true; pointer.x = pointer.tx; pointer.y = pointer.ty; glow.classList.add("is-on"); }
    var hit = e.target.closest && e.target.closest(".spot");
    if (lit && lit !== hit) lit.classList.remove("is-lit");
    lit = hit;
    if (hit) {
      var b = hit.getBoundingClientRect();
      hit.style.setProperty("--mx", (e.clientX - b.left) + "px");
      hit.style.setProperty("--my", (e.clientY - b.top) + "px");
      hit.classList.add("is-lit");
    }
  }, { passive: true });
  document.addEventListener("pointerleave", function () { glow.classList.remove("is-on"); pointer.seen = false; if (lit) lit.classList.remove("is-lit"); lit = null; });

  // one loop for everything that eases toward the pointer; ~30fps, paused when the tab is hidden
  var lastSky = 0;
  function loop(t) {
    if (!document.hidden && t - lastSky > 32) {
      lastSky = t;
      pointer.x = lerp(pointer.x, pointer.tx, 0.08); pointer.y = lerp(pointer.y, pointer.ty, 0.08);
      drawStars(t);
      glow.style.transform = "translate(" + (pointer.x * window.innerWidth).toFixed(1) + "px," + (pointer.y * window.innerHeight).toFixed(1) + "px)";
      stage.style.setProperty("--tx", ((pointer.x - 0.5) * -22).toFixed(2) + "px");
      stage.style.setProperty("--ty", ((pointer.y - 0.5) * -16).toFixed(2) + "px");
    }
    requestAnimationFrame(loop);
  }
  if (reduceMotion) {
    drawStars(0);
    window.addEventListener("scroll", function () { requestAnimationFrame(function () { drawStars(0); }); }, { passive: true });
  } else requestAnimationFrame(loop);

  /* ---------- Nebula behind the gray swans ----------
     Two gas layers and a layer of dark dust lanes from domain-warped fractal noise (wispy rather than blobby),
     painted once at low resolution when the section comes near, plus a full-resolution layer of specks. */
  (function () {
    var box = document.querySelector(".nebula");
    if (!box) return;
    var gasA = box.querySelector(".nebula__gas:not(.nebula__gas--b)"), gasB = box.querySelector(".nebula__gas--b");
    var dust = box.querySelector(".nebula__dust"), specks = box.querySelector(".nebula__specks");

    function makeNoise(seed) {
      var rnd = DB_rng(seed * 48271 + 1), perm = new Uint8Array(512), vals = new Float32Array(256), i;
      for (i = 0; i < 256; i++) { perm[i] = i; vals[i] = rnd(); }
      for (i = 255; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
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
    function warped(n, x, y) { // fbm sampled through fbm: streaks and filaments
      var q1 = fbm(n, x + 1.7, y + 9.2, 4), q2 = fbm(n, x + 8.3, y + 2.8, 4);
      return fbm(n, x + 2.4 * q1, y + 2.4 * q2, 5);
    }
    function ramp(stops, t) {
      t = clamp(t, 0, 1) * (stops.length - 1);
      var i = Math.min(stops.length - 2, Math.floor(t)), k = t - i;
      return [0, 1, 2].map(function (c) { return lerp(stops[i][c], stops[i + 1][c], k); });
    }
    var band = function (v, a, b) { return smooth((v - a) / (b - a)); };

    function paint(cv, w, h, pixel) {
      cv.width = w; cv.height = h;
      var c = cv.getContext("2d"), img = c.createImageData(w, h), d = img.data;
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var px = pixel(x / w * 3.4, y / w * 3.4), o = (y * w + x) * 4;
        d[o] = px[0]; d[o + 1] = px[1]; d[o + 2] = px[2]; d[o + 3] = px[3];
      }
      c.putImageData(img, 0, 0);
      cv.classList.add("is-ready");
    }

    var WARM = [[58, 168, 255], [167, 123, 255], [255, 79, 168], [255, 138, 76]];
    var COOL = [[62, 240, 198], [58, 168, 255], [120, 110, 255]];
    function render() {
      var b = box.getBoundingClientRect(), aspect = (b.height * 1.2) / Math.max(1, b.width * 1.2);
      var nA = makeNoise(11), nB = makeNoise(23), nC = makeNoise(37), nD = makeNoise(53);
      var W = 300, H = Math.max(60, Math.round(W * aspect));
      var steps = [];
      steps.push(function () { paint(gasA, W, H, function (x, y) {
        var open = band(fbm(nB, x * 0.35, y * 0.35, 2), 0.3, 0.6);         // where the cloud is at all
        var w = warped(nA, x, y);
        var dens = band(w, 0.4, 0.76); dens = dens * dens * open + band(w, 0.3, 0.7) * 0.22 * (0.4 + 0.6 * open); // body + faint haze
        var col = ramp(WARM, (fbm(nC, x * 0.6, y * 0.6, 3) - 0.3) / 0.4);
        var hot = clamp((dens - 0.6) / 0.4, 0, 1) * 0.55;                  // hot cores go toward white
        return [lerp(col[0], 255, hot), lerp(col[1], 245, hot), lerp(col[2], 250, hot), 255 * Math.min(1, dens * 1.1)];
      }); });
      steps.push(function () { paint(gasB, W, H, function (x, y) {
        var dens = band(warped(nB, x * 1.4 + 5, y * 1.4), 0.48, 0.74);
        dens *= dens * band(fbm(nC, x * 0.4 + 3, y * 0.4, 2), 0.4, 0.62);
        var col = ramp(COOL, fbm(nA, x * 0.8, y * 0.8, 2) * 1.6 - 0.4);
        return [col[0], col[1], col[2], 200 * dens];
      }); });
      var DW = 440, DH = Math.max(80, Math.round(DW * aspect));
      steps.push(function () { paint(dust, DW, DH, function (x, y) {
        var lanes = band(warped(nD, x * 1.1, y * 1.1), 0.56, 0.7);           // dark filaments across the glow
        return [4, 5, 8, 225 * lanes];
      }); });
      steps.push(drawSpecks);
      (function next() { var f = steps.shift(); if (f) { f(); setTimeout(next, 30); } })();
    }
    function drawSpecks() {
      // specks: fine dust and a few bright stars caught in the cloud
      var sb = specks.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      specks.width = Math.round(sb.width * dpr); specks.height = Math.round(sb.height * dpr);
      var g = specks.getContext("2d"), rnd = DB_rng(91), n = Math.min(900, Math.round(sb.width * sb.height / 1800));
      g.scale(dpr, dpr);
      var TINT = ["255,255,255", "255,214,236", "214,200,255", "190,255,236"];
      for (var i = 0; i < n; i++) {
        var x = rnd() * sb.width, y = rnd() * sb.height, r = 0.25 + Math.pow(rnd(), 3) * 1.1;
        g.fillStyle = "rgba(" + TINT[Math.floor(rnd() * TINT.length)] + "," + (0.2 + rnd() * 0.6).toFixed(2) + ")";
        g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
      }
      for (i = 0; i < 9; i++) {
        var bx = rnd() * sb.width, by = rnd() * sb.height, br = 6 + rnd() * 10;
        var gr = g.createRadialGradient(bx, by, 0, bx, by, br);
        gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(0.12, "rgba(255,230,245,0.6)"); gr.addColorStop(1, "rgba(255,180,230,0)");
        g.fillStyle = gr; g.beginPath(); g.arc(bx, by, br, 0, 6.283); g.fill();
      }
      specks.classList.add("is-ready");
    }

    var done = false;
    function go() { if (done) return; done = true; setTimeout(render, 0); }
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); go(); } }, { rootMargin: "800px 0px" });
      io.observe(box);
    } else go();
    var lastW = 0;
    window.addEventListener("resize", function () {
      if (!done || Math.abs(window.innerWidth - lastW) < 120) return; // repaint only for a real change of shape
      lastW = window.innerWidth; render();
    });
    lastW = window.innerWidth;
    // depth on scroll: layers part as the band passes
    window.addEventListener("scroll", function () {
      var r = box.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      box.style.setProperty("--nb", ((r.top + r.height / 2 - vh / 2) / vh).toFixed(3));
    }, { passive: true });
  })();

  /* ---------- Northern lights over the closing section ----------
     Each curtain is a wandering lower edge with light rising off it: bright green at the hem, fading to teal
     and then a faint violet-pink crown, with fine vertical rays and folds that brighten and slide along.
     Columns are painted from pre-drawn gradient strips with additive blending, at half resolution. */
  (function () {
    var cv = document.querySelector(".borealis__sky");
    if (!cv) return;
    var g = cv.getContext("2d"), S = 0.5, cw = 0, ch = 0;
    // a strip runs from the top of a curtain (transparent) down to its hem
    function makeStrip(stops) {
      var el = document.createElement("canvas");
      el.width = 1; el.height = 256;
      var c = el.getContext("2d"), gr = c.createLinearGradient(0, 0, 0, 256);
      stops.forEach(function (st) { gr.addColorStop(st[0], st[1]); });
      c.fillStyle = gr; c.fillRect(0, 0, 1, 256);
      return el;
    }
    var GREEN = makeStrip([[0, "rgba(255,79,168,0)"], [0.22, "rgba(200,90,220,0.16)"], [0.5, "rgba(62,200,200,0.3)"],
      [0.8, "rgba(70,240,150,0.7)"], [0.94, "rgba(150,255,190,1)"], [0.975, "rgba(220,255,235,1)"], [1, "rgba(255,90,170,0.5)"]]);
    var CROWN = makeStrip([[0, "rgba(255,79,168,0)"], [0.3, "rgba(255,79,168,0.22)"], [0.6, "rgba(167,123,255,0.35)"],
      [0.88, "rgba(62,240,198,0.6)"], [1, "rgba(120,255,200,0.8)"]]);
    // three curtains: near and bright, a middle one, a high faint one leaning pink
    var CURTAINS = [
      { base: 0.8, amp: 0.07, len: 0.5, a: 0.75, sp: 1, ph: 0.4, f: 1.6, strip: GREEN },
      { base: 0.66, amp: 0.06, len: 0.42, a: 0.5, sp: 0.7, ph: 2.1, f: 2.3, strip: GREEN },
      { base: 0.52, amp: 0.05, len: 0.36, a: 0.35, sp: 0.5, ph: 4.0, f: 3.1, strip: CROWN }
    ];
    function size() {
      var b = cv.getBoundingClientRect();
      cw = Math.max(1, Math.round(b.width * S)); ch = Math.max(1, Math.round(b.height * S));
      cv.width = cw; cv.height = ch;
    }
    function frame(t) {
      t /= 1000;
      g.globalCompositeOperation = "source-over";
      g.clearRect(0, 0, cw, ch);
      g.globalCompositeOperation = "lighter";
      var PI = Math.PI;
      CURTAINS.forEach(function (c) {
        var k = t * c.sp * 0.12;
        for (var x = 0; x < cw; x++) {
          var u = x / cw;
          var hem = ch * (c.base + c.amp * (0.6 * Math.sin(u * c.f * PI + k * 1.3 + c.ph) +
                                            0.3 * Math.sin(u * c.f * 2.7 * PI - k * 2.1 + c.ph * 2) +
                                            0.1 * Math.sin(u * 19 * PI + k * 3.4)));
          var h = ch * c.len * (0.5 + 0.5 * (0.5 + 0.5 * Math.sin(u * 3.3 * PI - k * 1.7 + c.ph)));
          var fold = 0.5 + 0.5 * Math.sin(u * 4.6 * PI + k * 2.6 + c.ph * 3); // bright folds drifting along
          var rays = 0.72 + 0.28 * Math.sin(u * 260 + t * 0.35) * Math.sin(u * 97 - t * 0.22);
          var edge = Math.min(1, u * 5, (1 - u) * 5); // soften the ends
          var alpha = c.a * (0.25 + 0.75 * fold * fold) * rays * edge;
          if (alpha < 0.01) continue;
          g.globalAlpha = alpha;
          g.drawImage(c.strip, 0, 0, 1, 256, x, hem - h, 1, h + 2); // exactly one column: overlaps would band under additive blending
        }
      });
      g.globalAlpha = 1;
    }
    size();
    var shown = false, last = 0;
    function loop(t) {
      if (shown && !document.hidden && t - last > 40) { last = t; frame(t); }
      if (shown) requestAnimationFrame(loop);
    }
    if (window.ResizeObserver) new ResizeObserver(function () { size(); frame(performance.now()); }).observe(cv);
    if (reduceMotion || !window.IntersectionObserver) { frame(20000); return; }
    new IntersectionObserver(function (es) {
      var was = shown; shown = es[0].isIntersecting;
      if (shown && !was) requestAnimationFrame(loop);
    }).observe(cv);
    frame(performance.now());
  })();

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
