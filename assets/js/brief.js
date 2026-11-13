/* The daily brief: what moved across your questions, the decisions waiting for you (assign one to its owner, or open its
   details), the decisions your agents made overnight (a switch keeps or undoes each; its details set whether the agent may act alone next time), what's exposed, and why the odds rose.
   Assignments and undos persist in localStorage. The trendlines follow the memo's: one series each, a readout under the
   pointer. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- state: each decision waiting or assigned ("ok"); each overnight step kept or undone ----------
  var KEY = "daybreak.brief", S = { d: ["", "", ""], undo: [false, false, false], next: ["auto", "auto", "auto"] };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && Array.isArray(saved.d) && Array.isArray(saved.undo)) S = saved;
    if (!Array.isArray(S.next)) S.next = ["auto", "auto", "auto"];
  } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  var WEEK = ["resin bridge-buy", "Khor Fakkan booking", "war-risk cover"];
  function render() {
    $$(".decision").forEach(function (card, i) {
      var on = S.d[i] === "ok", state = $(".decision__state", card), a = $("[data-assign]", card);
      card.classList.toggle("is-assigned", on);
      state.textContent = on ? (a.dataset.verb ? "Approved, sent to " : "Assigned to ") + state.dataset.owner : "";
      a.textContent = on ? (a.dataset.did || "Assigned") : (a.dataset.verb || "Assign"); a.setAttribute("aria-pressed", String(on));
    });
    var n = S.d.filter(function (s) { return !s; }).length, count = $("#wait-n");
    count.textContent = n; count.hidden = !n; count.setAttribute("aria-label", n + " waiting");
    $$("[data-week]").forEach(function (li) {
      var i = +li.dataset.week, span = $("span", li);
      if (!span._base) span._base = span.textContent;
      li.classList.toggle("is-done", S.d[i] === "ok");
      var verb = $('.decision[data-d="' + i + '"] [data-assign]').dataset.did || "Assigned";
      span.textContent = S.d[i] === "ok" ? verb + ": " + WEEK[i] : span._base;
    });
    $$(".did").forEach(function (li, i) {
      li.classList.toggle("is-undone", S.undo[i]);
      $(".did__keep", li).checked = !S.undo[i];
      $$("[data-next]", li).forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.next === S.next[i])); });
    });
    placeSmall();
    save();
  }
  // the small cream tracks in the steps' details: the white pill slides to the chosen option
  function placeSmall() {
    $$(".sw--sm").forEach(function (t) {
      var b = $('[aria-pressed="true"]', t), pill = $(".sw__pill", t);
      if (!b || !b.offsetWidth) return;
      pill.style.width = b.offsetWidth + "px"; pill.style.transform = "translateX(" + (b.offsetLeft - 3) + "px)";
      if (!t.classList.contains("is-ready")) requestAnimationFrame(function () { t.classList.add("is-ready"); });
    });
  }
  // a Details button drops its panel open (grid rows 0fr to 1fr) and back
  function details(host, btn) {
    btn.addEventListener("click", function () {
      var open = host.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Hide details" : "Details";
    });
  }
  $$(".decision").forEach(function (card, i) {
    var owner = $(".decision__state", card).dataset.owner, btn = $("[data-assign]", card);
    btn.addEventListener("click", function () {
      S.d[i] = S.d[i] === "ok" ? "" : "ok";
      if (S.d[i] === "ok") DB.toast(btn.dataset.verb ? "Approved and sent to " + owner + "." : "Assigned to " + owner + ", and added to their workflows.");
      render();
    });
    details(card, $("[data-details]", card));
  });
  // an overnight step drops its details open when its line is selected; its switch keeps or undoes it, and its details
  // set whether the agent may take a step like it on its own next time
  $$(".did").forEach(function (li, i) {
    var what = $(".did__what", li), agent = $(".did__dl dd", li).textContent;
    function toggle() { var open = li.classList.toggle("is-open"); what.setAttribute("aria-expanded", String(open)); placeSmall(); }
    li.addEventListener("click", function (e) { if (!e.target.closest(".did__keep, .did__more")) toggle(); });
    what.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    $(".did__keep", li).addEventListener("change", function () {
      S.undo[i] = !this.checked;
      DB.toast(S.undo[i] ? "Undone. The agent has reversed it." : "Back on. The agent has redone it.");
      render();
    });
    $$("[data-next]", li).forEach(function (b) {
      b.addEventListener("click", function () {
        if (S.next[i] === b.dataset.next) return;
        S.next[i] = b.dataset.next;
        DB.toast(S.next[i] === "ask" ? "The " + agent.toLowerCase() + " will ask you before a step like this." : "The " + agent.toLowerCase() + " may take steps like this on its own again.");
        render();
      });
    });
  });
  window.addEventListener("resize", placeSmall);
  render();

  // ---------- links within the page glide there rather than jump ----------
  $$('a[href^="#"]').forEach(function (a) {
    var to = $(a.getAttribute("href"));
    if (!to) return;
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var y = to.getBoundingClientRect().top + window.scrollY - $(".bar").getBoundingClientRect().bottom - 16;
      window.scrollTo({ top: y, behavior: REDUCE ? "auto" : "smooth" });
      history.replaceState(null, "", a.getAttribute("href"));
    });
  });

  // ---------- orders or products: a cream track with a white pill that slides to the chosen grouping ----------
  var sw = $(".sw"), pill = $(".sw__pill", sw);
  function placePill() {
    var b = $('[aria-pressed="true"]', sw);
    pill.style.width = b.offsetWidth + "px"; pill.style.transform = "translateX(" + (b.offsetLeft - 4) + "px)";
  }
  placePill();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePill);
  window.addEventListener("resize", placePill);
  requestAnimationFrame(function () { requestAnimationFrame(function () { sw.classList.add("is-ready"); }); });
  sw.addEventListener("click", function (e) {
    var b = e.target.closest("[data-by]");
    if (!b) return;
    $$("[data-by]", sw).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    placePill();
    // the card eases to its new height while the new table slides in from the side its tab lies on
    var card = $(".caught"), h0 = card.offsetHeight, shown;
    $$("[data-view]").forEach(function (v) {
      v.hidden = v.dataset.view !== b.dataset.by;
      if (!v.hidden) { v.classList.add("is-in"); shown = v; }
    });
    if (REDUCE || !card.animate) return;
    var h1 = card.offsetHeight, dx = b.dataset.by === "sku" ? 16 : -16;
    card.style.overflow = "hidden";
    card.animate([{ height: h0 + "px" }, { height: h1 + "px" }], { duration: 320, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)" })
      .onfinish = function () { card.style.overflow = ""; };
    shown.animate([{ opacity: 0, transform: "translateX(" + dx + "px)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)" });
  });

  // ---------- the map and the orders point at each other ----------
  var map = $(".bmap");
  function light(ship) {
    map.classList.toggle("has-ship", !!ship);
    $$("[data-ship]", map).forEach(function (g) { g.classList.toggle("is-lit", g.dataset.ship === ship); });
    $$("tr[data-ship]").forEach(function (tr) { tr.classList.toggle("is-lit", tr.dataset.ship === ship); });
  }
  $$("tr[data-ship], .bmap [data-ship]").forEach(function (el) {
    el.addEventListener("mouseenter", function () { light(el.dataset.ship); });
    el.addEventListener("mouseleave", function () { light(null); });
  });

  // ---------- trendlines: weekly from July 13; index 12 is this week ----------
  var TRENDS = {
    transits: { vals: [100, 99, 101, 98, 100, 97, 96, 93, 88, 84, 77, 70, 61], fmt: function (v) { return Math.round(v) + "%"; }, min: 40, max: 110, ticks: [50, 75, 100] },
    premium: { vals: [0.05, 0.05, 0.05, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10, 0.11, 0.12, 0.14, 0.15], fmt: function (v) { return v.toFixed(2) + "%"; }, min: 0, max: 0.2, ticks: [0, 0.1, 0.2] },
    incidents: { vals: [0, 1, 0, 0, 1, 0, 1, 1, 2, 2, 3, 4, 3], fmt: function (v) { return String(Math.round(v)); }, min: 0, max: 6, ticks: [0, 3, 6] }
  };
  var DATES = ["Jul 13", "Jul 20", "Jul 27", "Aug 3", "Aug 10", "Aug 17", "Aug 24", "Aug 31", "Sep 7", "Sep 14", "Sep 21", "Sep 28", "this week"];
  var EVENT = 11 + 1 / 7; // September 29, a day after the Sep 28 point
  var NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function draw(fig) {
    var d = TRENDS[fig.dataset.trend], host = $(".trend__plot", fig);
    var W = Math.max(240, host.clientWidth), H = 150, L = 38, R = 10, T = 12, B = 22, n = d.vals.length;
    var x = function (i) { return L + (W - L - R) * i / (n - 1); };
    var y = function (v) { return T + (H - T - B) * (1 - (v - d.min) / (d.max - d.min)); };
    host.innerHTML = "";
    $(".trend__now", fig).textContent = d.fmt(d.vals[n - 1]);
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img",
      "aria-label": $(".trend__name", fig).textContent + ", weekly from July 13: " + d.vals.map(d.fmt).join(", ") });
    d.ticks.forEach(function (v) {
      s.appendChild(svg("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), class: "trend__grid" }));
      var tx = svg("text", { x: L - 6, y: y(v) + 3.5, class: "trend__tick", "text-anchor": "end" });
      tx.textContent = d.fmt(v); s.appendChild(tx);
    });
    [0, 4, 8, 12].forEach(function (i) {
      var tx = svg("text", { x: x(i), y: H - 6, class: "trend__tick", "text-anchor": i === 0 ? "start" : i === 12 ? "end" : "middle" });
      tx.textContent = i === 12 ? "Today" : DATES[i]; s.appendChild(tx);
    });
    var ex = L + (W - L - R) * EVENT / (n - 1);
    s.appendChild(svg("line", { x1: ex, x2: ex, y1: T - 4, y2: H - B, class: "trend__event" }));
    var pts = d.vals.map(function (v, i) { return x(i).toFixed(1) + " " + y(v).toFixed(1); });
    s.appendChild(svg("path", { d: "M" + pts.join(" L") + " L" + x(n - 1) + " " + (H - B) + " L" + L + " " + (H - B) + "Z", class: "trend__area" }));
    s.appendChild(svg("path", { d: "M" + pts.join(" L"), class: "trend__line", pathLength: 1 }));
    s.appendChild(svg("circle", { cx: x(n - 1), cy: y(d.vals[n - 1]), r: 4, class: "trend__dot" }));
    var hair = svg("line", { y1: T - 4, y2: H - B, class: "trend__hair" }), hdot = svg("circle", { r: 4.5, class: "trend__dot" });
    var hov = svg("g", { class: "trend__hov" });
    hov.appendChild(hair); hov.appendChild(hdot); s.appendChild(hov);
    var tip = el("div", "trend__tip");
    host.appendChild(s); host.appendChild(tip);
    function at(clientX) {
      var r = s.getBoundingClientRect();
      var i = Math.round((clientX - r.left - L * r.width / W) / ((W - L - R) * r.width / W) * (n - 1));
      i = Math.max(0, Math.min(n - 1, i));
      hair.setAttribute("x1", x(i)); hair.setAttribute("x2", x(i));
      hdot.setAttribute("cx", x(i)); hdot.setAttribute("cy", y(d.vals[i]));
      tip.innerHTML = "";
      tip.appendChild(el("span", null, i === 12 ? "This week" : "Week of " + DATES[i]));
      tip.appendChild(el("b", null, d.fmt(d.vals[i])));
      tip.style.left = (x(i) / W * 100) + "%"; tip.style.top = (y(d.vals[i]) / H * 100) + "%";
      tip.classList.toggle("is-left", i > n / 2);
      host.classList.add("is-hover");
    }
    s.addEventListener("pointermove", function (e) { at(e.clientX); });
    s.addEventListener("pointerdown", function (e) { at(e.clientX); });
    s.addEventListener("pointerleave", function () { host.classList.remove("is-hover"); });
  }
  var figs = $$("[data-trend]");
  figs.forEach(draw);
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { figs.forEach(draw); }, 120); });

  // figures make their entrance the first time they scroll into view
  Reveal(".spark, .bl__money, .rw, .fall, .trend");
  CountIn(".bl__p, .cost__v, .net b"); // the headline odds and money count up on first view
})();
