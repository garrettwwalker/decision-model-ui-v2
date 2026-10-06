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

  /* ---------- Read-as-you-scroll prose ---------- */
  var reads = [];
  document.querySelectorAll(".read").forEach(function (el) {
    var units = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var parts = node.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          var s = document.createElement("span");
          s.className = "w";
          s.textContent = part;
          frag.appendChild(s);
          units.push(s);
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        units.push(node);
      }
    });
    reads.push({ el: el, units: units });
  });

  function readFrame() {
    var vh = window.innerHeight;
    reads.forEach(function (r) {
      var b = r.el.getBoundingClientRect();
      // Starts revealing when the paragraph's top reaches 80% of the viewport,
      // fully read when its bottom reaches 55%
      var start = vh * 0.8, end = vh * 0.55;
      var total = (b.bottom - b.top) + (start - end);
      var t = clamp((start - b.top) / total, 0, 1);
      var n = Math.round(t * r.units.length);
      r.units.forEach(function (u, i) { u.classList.toggle("on", i < n); });
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
    navFrame(); // cheap, and must never lag behind the page
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      heroFrame(); readFrame();
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
