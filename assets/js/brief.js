/* The daily brief: what moved across your questions, the decisions waiting for you (approve or decline, as on the agents
   page), the decisions your agents made overnight (with Details and Undo), what's exposed, and why the odds rose. Decision states and undos
   persist in localStorage. The trendlines follow the memo's: one series each, a readout under the pointer. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- state: each decision waiting, approved, or declined; each overnight step kept or undone ----------
  var KEY = "daybreak.brief", S = { d: ["", "", ""], undo: [false, false, false] };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && Array.isArray(saved.d) && Array.isArray(saved.undo)) S = saved;
  } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  var WEEK = ["resin bridge-buy", "Khor Fakkan booking", "war-risk cover"];
  function render() {
    $$(".decision").forEach(function (card, i) {
      var st = S.d[i];
      card.classList.toggle("is-approved", st === "ok");
      card.classList.toggle("is-declined", st === "no");
      $(".decision__state", card).textContent = st === "ok" ? "Approved, owner notified" : st === "no" ? "Declined" : "";
      var a = $("[data-approve]", card), d = $("[data-decline]", card);
      a.textContent = st === "ok" ? "Approved" : "Approve"; a.setAttribute("aria-pressed", String(st === "ok"));
      d.textContent = st === "no" ? "Undo decline" : "Decline"; d.hidden = st === "ok";
    });
    var n = S.d.filter(function (s) { return !s; }).length, count = $("#wait-n");
    count.textContent = n; count.hidden = !n; count.setAttribute("aria-label", n + " waiting");
    $$("[data-week]").forEach(function (li) {
      var i = +li.dataset.week, span = $("span", li);
      if (!span._base) span._base = span.textContent;
      li.classList.toggle("is-done", S.d[i] === "ok");
      li.classList.toggle("is-off", S.d[i] === "no");
      span.textContent = S.d[i] === "ok" ? "Approved: " + WEEK[i] : S.d[i] === "no" ? "Declined: " + WEEK[i] : span._base;
    });
    $$(".did").forEach(function (li, i) {
      li.classList.toggle("is-undone", S.undo[i]);
      $("[data-undo]", li).textContent = S.undo[i] ? "Redo" : "Undo";
    });
    save();
  }
  $$(".decision").forEach(function (card, i) {
    var title = $(".decision__title", card).textContent.split(" ").slice(0, 6).join(" ") + "…";
    $("[data-approve]", card).addEventListener("click", function () {
      S.d[i] = S.d[i] === "ok" ? "" : "ok";
      if (S.d[i] === "ok") DB.toast("Approved: " + title + " Owner notified.");
      render();
    });
    $("[data-decline]", card).addEventListener("click", function () {
      S.d[i] = S.d[i] === "no" ? "" : "no";
      if (S.d[i] === "no") DB.toast("Declined: " + title + " The option lapses at its deadline.");
      render();
    });
  });
  $$(".did").forEach(function (li, i) {
    var more = $("[data-details]", li);
    more.addEventListener("click", function () {
      var open = li.classList.toggle("is-open");
      more.setAttribute("aria-expanded", String(open));
      more.textContent = open ? "Hide details" : "Details";
    });
    $("[data-undo]", li).addEventListener("click", function () {
      S.undo[i] = !S.undo[i];
      DB.toast(S.undo[i] ? "Undone. The agent has reversed it." : "Back on. The agent has redone it.");
      render();
    });
  });
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
    $$("[data-view]").forEach(function (v) {
      v.hidden = v.dataset.view !== b.dataset.by;
      if (!v.hidden) v.classList.add("is-in");
    });
  });

  // ---------- the map and the orders point at each other; a way around lights its route ----------
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
  $$(".way[data-way]").forEach(function (li) {
    var route = $('.rt[data-route="' + li.dataset.way + '"]', map);
    function on() { map.classList.add("has-focus"); route.classList.add("is-on"); li.classList.add("is-on"); }
    function off() { map.classList.remove("has-focus"); route.classList.remove("is-on"); li.classList.remove("is-on"); }
    li.addEventListener("mouseenter", on); li.addEventListener("mouseleave", off);
    li.addEventListener("focus", on); li.addEventListener("blur", off);
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
  Reveal(".spark, .bl__money, .rw, .ways, .fall, .trend");
})();
