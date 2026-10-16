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
  var TILES = ".note, .lune, .swan, .contact__form, .split__q, .part, .split__fused"; // revealed whole, text included
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
  var lastY = window.scrollY;
  function navFrame() {
    var hb = hero.getBoundingClientRect().bottom, y = window.scrollY, dy = y - lastY;
    nav.classList.toggle("is-scrolled", hb <= nav.offsetHeight); // frosted only once the hero has gone by underneath it
    // hide on the way down, show on the way up; it stays put until the hero's bottom edge has passed it, and with the menu open
    if (hb > nav.offsetHeight || nav.classList.contains("is-open")) nav.classList.remove("is-hidden");
    else if (dy > 4) nav.classList.add("is-hidden");
    else if (dy < -4) nav.classList.remove("is-hidden");
    if (Math.abs(dy) > 4) lastY = y;
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
    var hue = DB_rng(29); hue(); // skip the first draw, which is tiny for a small seed
    var cells = vals.map(function (v) {
      var c = document.createElement("span");
      var h = hue(); // each cell gets a hue at random from the palette (seeded, so it's the same every visit)
      c.style.background = heatColor(v, h);
      heat.appendChild(c);
      return { el: c, base: v, h: h };
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
            if (c.amp) c.el.style.background = heatColor(c.base + c.amp * Math.sin(t / c.per * Math.PI * 2 + c.ph), c.h);
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
  function heatColor(v, h) {
    // muted like the original panel: brightness follows the reading closely, so most cells sit dark and only a few
    // glow. Each cell has its own random hue from the palette (pink → rose → red → orange → amber), but low readings
    // lean toward dusky rose, as the original ramp did, because dim orange on the dark ground reads as brown
    var SPEC = [[255, 122, 170], [255, 84, 120], [255, 68, 56], [255, 122, 60], [255, 170, 64]];
    v = clamp(v, 0, 1);
    var x = lerp(0.2, clamp(h || 0, 0, 1), Math.min(1, v / 0.5)) * (SPEC.length - 1);
    var i = Math.min(SPEC.length - 2, Math.floor(x)), t = x - i;
    var k = Math.min(1, 0.06 + v * 1.1), BASE = [24, 20, 27];
    var c = SPEC[i].map(function (a, n) { return Math.round(lerp(BASE[n], lerp(a, SPEC[i + 1][n], t), k)); });
    return "rgb(" + c.join(",") + ")";
  }

  /* ---------- Space: page-wide aurora tint, starfield, pointer glow, card spotlights ---------- */
  var aurora = document.querySelector(".aurora");
  function skyFrame() {
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    // the background glows warm slightly as you read down the page: rose at the top, more orange by the end
    aurora.style.filter = "hue-rotate(" + (22 * window.scrollY / max).toFixed(1) + "deg)";
  }

  var canvas = document.querySelector(".stars");
  var ctx = canvas.getContext("2d");
  var stars = [], W = 0, H = 0, DPR = 1;
  var pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, seen: false };
  var TINTS = ["255,255,255", "255,255,255", "255,255,255", "255,236,214", "255,224,190", "255,214,220"];
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

  /* ---------- Nebulae: behind the gray swans, and the cloud the page closes on ----------
     Two gas layers and a layer of dark dust lanes from domain-warped fractal noise (wispy rather than blobby),
     painted once at low resolution when the section comes near, plus a full-resolution layer of specks.
     Each nebula gets its own seeds, so no two look alike. */
  document.querySelectorAll(".nebula").forEach(function (box, k) {
    var seed = k * 140; // offsets picked by rendering them: 140 gives the closing cloud a full, wispy body
    var gasA = box.querySelector(".nebula__gas:not(.nebula__gas--b)"), gasB = box.querySelector(".nebula__gas--b");
    var dust = box.querySelector(".nebula__dust"), specks = box.querySelector(".nebula__specks");
    // each layer gets a twin painted from the same cloud a little further along in time; CSS crossfades the pair, so
    // the wisps re-form in place rather than the cloud travelling (it's in a vacuum)
    var twin = function (el) { var t = el.cloneNode(); t.classList.add("is-twin"); el.after(t); return t; };
    var gasA2 = twin(gasA), gasB2 = twin(gasB), dust2 = twin(dust);

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
    function warped(n, x, y, t) { // fbm sampled through fbm: streaks and filaments; t evolves the warp (0.3 re-forms the wisps, not the cloud)
      t = t || 0;
      var q1 = fbm(n, x + 1.7 + t * 0.5, y + 9.2 - t * 0.3, 4), q2 = fbm(n, x + 8.3 - t * 0.4, y + 2.8 + t * 0.5, 4);
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
      cv._base = new Uint8ClampedArray(d); // the painting, kept so the cursor can disturb the visible copy and let it settle
      cv._out = c.createImageData(w, h);
      cv.classList.add("is-ready");
    }

    var WARM = [[255, 90, 160], [255, 70, 90], [255, 96, 64], [255, 150, 90]];
    var COOL = [[255, 176, 120], [255, 120, 140], [255, 86, 96]]; // the paler, peach-to-rose layer
    function render() {
      var b = box.getBoundingClientRect(), aspect = (b.height * 1.2) / Math.max(1, b.width * 1.2);
      var nA = makeNoise(11 + seed), nB = makeNoise(23 + seed), nC = makeNoise(37 + seed), nD = makeNoise(53 + seed);
      var W = 300, H = Math.max(60, Math.round(W * aspect));
      var steps = [];
      var gasAt = function (t) { return function (x, y) {
        var open = band(fbm(nB, x * 0.35, y * 0.35, 2), 0.3, 0.6);         // where the cloud is at all
        var w = warped(nA, x, y, t);
        var dens = band(w, 0.4, 0.76); dens = dens * dens * open + band(w, 0.3, 0.7) * 0.22 * (0.4 + 0.6 * open); // body + faint haze
        var col = ramp(WARM, (fbm(nC, x * 0.6, y * 0.6, 3) - 0.3) / 0.4);
        var hot = clamp((dens - 0.6) / 0.4, 0, 1) * 0.55;                  // hot cores go toward white
        return [lerp(col[0], 255, hot), lerp(col[1], 245, hot), lerp(col[2], 250, hot), 255 * Math.min(1, dens * 1.1)];
      }; };
      var gasBt = function (t) { return function (x, y) {
        var dens = band(warped(nB, x * 1.4 + 5, y * 1.4, t), 0.48, 0.74);
        dens *= dens * band(fbm(nC, x * 0.4 + 3, y * 0.4, 2), 0.4, 0.62);
        var col = ramp(COOL, fbm(nA, x * 0.8, y * 0.8, 2) * 1.6 - 0.4);
        return [col[0], col[1], col[2], 200 * dens];
      }; };
      var DW = 440, DH = Math.max(80, Math.round(DW * aspect));
      var dustT = function (t) { return function (x, y) {
        var lanes = band(warped(nD, x * 1.1, y * 1.1, t), 0.56, 0.7);        // dark filaments across the glow
        return [4, 5, 8, 225 * lanes];
      }; };
      steps.push(function () { paint(gasA, W, H, gasAt(0)); });
      steps.push(function () { paint(gasB, W, H, gasBt(0)); });
      steps.push(function () { paint(dust, DW, DH, dustT(0)); });
      steps.push(drawSpecks);
      steps.push(function () { paint(gasA2, W, H, gasAt(0.3)); });
      steps.push(function () { paint(gasB2, W, H, gasBt(0.3)); });
      steps.push(function () { paint(dust2, DW, DH, dustT(0.3)); });
      (function next() { var f = steps.shift(); if (f) { f(); setTimeout(next, 30); } })();
    }
    function drawSpecks() {
      // specks: fine dust and a few bright stars caught in the cloud
      var sb = specks.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      specks.width = Math.round(sb.width * dpr); specks.height = Math.round(sb.height * dpr);
      var g = specks.getContext("2d"), rnd = DB_rng(91 + seed), n = Math.min(900, Math.round(sb.width * sb.height / 1800));
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
        gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(0.12, "rgba(255,232,210,0.6)"); gr.addColorStop(1, "rgba(255,170,130,0)");
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

    // The cursor disturbs the gas. A coarse field holds, per point, an offset (screen px) and a thinning. The pointer's
    // motion shoves gas along its path and curls it off to either side; lingering pushes gas outward and thins it, so
    // a soft clearing opens under the pointer rather than the cloud magnifying. Everything relaxes back over a few
    // seconds. Each painted layer (and its twin) is redrawn through the field, only where the field is non-zero.
    if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;
    var LAYERS = [{ cv: gasA, k: 1 }, { cv: gasA2, k: 1 }, { cv: gasB, k: 0.75 }, { cv: gasB2, k: 0.75 }, { cv: dust, k: 1.2 }, { cv: dust2, k: 1.2 }];
    var GW = 48, GH = 36, N = GW * GH, FX = new Float32Array(N), FY = new Float32Array(N), TH = new Float32Array(N);
    var REACH = 150, SHOVE = 0.13, CURL = 0.05, PUSH = 0.25, THIN = 0.007, MAX = 18, RELAX = 0.96, THIN_RELAX = 0.95;
    var ptr = { x: 0, y: 0, px: null, py: null, inside: false }, seen = false, last = 0, running = false;
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var r = box.getBoundingClientRect();
      ptr.x = e.clientX; ptr.y = e.clientY;
      ptr.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (ptr.inside && seen && !running) { running = true; requestAnimationFrame(step); }
    }, { passive: true });
    document.addEventListener("pointerleave", function () { ptr.inside = false; });
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; }).observe(box);
    function step(t) {
      if (t - last < 32) { requestAnimationFrame(step); return; }
      last = t;
      // the layers cover the box plus 10% each side, so the field does too
      var b = box.getBoundingClientRect(), W = b.width * 1.2, H = b.height * 1.2, L0 = b.left - b.width * 0.1, T0 = b.top - b.height * 0.1;
      var vx = ptr.px === null || !ptr.inside ? 0 : ptr.x - ptr.px, vy = ptr.py === null || !ptr.inside ? 0 : ptr.y - ptr.py;
      ptr.px = ptr.x; ptr.py = ptr.y;
      var cw = W / (GW - 1), chh = H / (GH - 1), live = false, gx0 = GW, gx1 = -1, gy0 = GH, gy1 = -1;
      for (var gy = 0; gy < GH; gy++) for (var gx = 0; gx < GW; gx++) {
        var n = gy * GW + gx, fx = FX[n] * RELAX, fy = FY[n] * RELAX, th = TH[n] * THIN_RELAX;
        if (ptr.inside) {
          var dx = L0 + gx * cw - ptr.x, dy = T0 + gy * chh - ptr.y, d2 = dx * dx + dy * dy;
          var wgt = Math.exp(-d2 / (REACH * REACH));
          if (wgt > 0.01) {
            var d = Math.sqrt(d2) || 1, ux = dx / d, uy = dy / d;
            var side = ux * vy - uy * vx > 0 ? 1 : -1;               // which side of the pointer's path this point is on
            fx += (vx * SHOVE + ux * PUSH - uy * Math.hypot(vx, vy) * CURL * side) * wgt;
            fy += (vy * SHOVE + uy * PUSH + ux * Math.hypot(vx, vy) * CURL * side) * wgt;
            th = Math.min(0.16, th + THIN * wgt);
            var mag = Math.sqrt(fx * fx + fy * fy);
            if (mag > MAX) { fx *= MAX / mag; fy *= MAX / mag; }
          }
        }
        FX[n] = fx; FY[n] = fy; TH[n] = th;
        if (Math.abs(fx) + Math.abs(fy) > 0.25 || th > 0.004) {
          live = true; if (gx < gx0) gx0 = gx; if (gx > gx1) gx1 = gx; if (gy < gy0) gy0 = gy; if (gy > gy1) gy1 = gy;
        }
      }
      LAYERS.forEach(function (Ly) {
        var cv = Ly.cv, base = cv._base;
        if (!base) return;
        var w = cv.width, h = cv.height, out = cv._out, o = out.data;
        o.set(base);
        if (live) {
          var sx = w / W, sy = h / H, k = Ly.k;
          var x0 = Math.max(0, Math.floor((gx0 - 1) * cw * sx)), x1 = Math.min(w - 1, Math.ceil((gx1 + 1) * cw * sx));
          var y0 = Math.max(0, Math.floor((gy0 - 1) * chh * sy)), y1 = Math.min(h - 1, Math.ceil((gy1 + 1) * chh * sy));
          for (var y = y0; y <= y1; y++) {
            var gyf = y / sy / chh, iy = Math.min(GH - 2, gyf | 0), ty = gyf - iy;
            for (var x = x0; x <= x1; x++) {
              var gxf = x / sx / cw, ix = Math.min(GW - 2, gxf | 0), tx = gxf - ix, n0 = iy * GW + ix;
              var w00 = (1 - tx) * (1 - ty), w10 = tx * (1 - ty), w01 = (1 - tx) * ty, w11 = tx * ty;
              var ox = FX[n0] * w00 + FX[n0 + 1] * w10 + FX[n0 + GW] * w01 + FX[n0 + GW + 1] * w11;
              var oy = FY[n0] * w00 + FY[n0 + 1] * w10 + FY[n0 + GW] * w01 + FY[n0 + GW + 1] * w11;
              var thin = TH[n0] * w00 + TH[n0 + 1] * w10 + TH[n0 + GW] * w01 + TH[n0 + GW + 1] * w11;
              var fx2 = x - ox * sx * k, fy2 = y - oy * sy * k, di = (y * w + x) * 4; // this pixel shows the gas pushed here
              if (fx2 < 0 || fy2 < 0 || fx2 > w - 2 || fy2 > h - 2) { o[di + 3] = 0; continue; }
              var px0 = fx2 | 0, py0 = fy2 | 0, ux2 = fx2 - px0, uy2 = fy2 - py0;
              var a00 = (py0 * w + px0) * 4, a10 = a00 + 4, a01 = a00 + w * 4, a11 = a01 + 4;
              for (var c = 0; c < 4; c++) {
                var top = base[a00 + c] + (base[a10 + c] - base[a00 + c]) * ux2;
                o[di + c] = top + (base[a01 + c] + (base[a11 + c] - base[a01 + c]) * ux2 - top) * uy2;
              }
              o[di + 3] *= 1 - thin * k; // the gas thins where it's been pushed away
            }
          }
        }
        cv.getContext("2d").putImageData(out, 0, 0);
      });
      if (!live && !ptr.inside) { running = false; ptr.px = ptr.py = null; return; }
      requestAnimationFrame(step);
    }
  });

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
