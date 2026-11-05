/* Agents 2 and 3: the agents page as click-through views (2026-11-04), on top of the shared agents.js, which still draws
   everything. One view shows at a time under a tab bar (overview, live map, activity, waiting for you, negotiation,
   every agent); the side panel for an agent or Totality slides in as a drawer when you select one. agents.js moves
   around the page by scrolling elements into view, so scrollIntoView is taken over here: scrolling to something in
   another view switches to that view, and scrolling to the side panel opens the drawer. Views and the drawer slide;
   the hash keeps the view, so Back returns to the last one. */
(function () {
  var REDUCE = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };
  var ORDER = ["overview", "live", "activity", "waiting", "negotiation", "agents"];
  var views = {}, tabs = {};
  document.querySelectorAll("[data-view]").forEach(function (v) { views[v.dataset.view] = v; });
  document.querySelectorAll("[data-go]").forEach(function (t) { tabs[t.dataset.go] = t; });
  var nav = $("vtabs"), thumb = nav.querySelector(".vtabs__thumb"), cur = null;
  var narrow = function () { return matchMedia("(max-width: 1000px)").matches; };
  var relayout = function () { window.dispatchEvent(new Event("resize")); };
  // the tab bar and the drawer sit just under the site's bar, whose height changes with the width
  var bar = document.querySelector(".bar");
  function barH() { document.documentElement.style.setProperty("--bar-h", bar.offsetHeight + "px"); }
  barH(); window.addEventListener("resize", barH);

  function available(name) { return views[name] && !(name === "negotiation" && $("st-section").hidden); }
  function placeThumb(snap) {
    var t = tabs[cur]; if (!t) return;
    var w = t.offsetWidth + "px", x = "translateX(" + t.offsetLeft + "px)";
    // already headed there: leave it be, since snapping would cut short the slide (show() relays out straight away)
    if (thumb.style.width === w && thumb.style.transform === x) return;
    if (snap) thumb.style.transition = "none";
    thumb.style.width = w; thumb.style.transform = x;
    if (snap) { void thumb.offsetWidth; thumb.style.transition = ""; }
  }
  function show(name, how) {
    how = how || {};
    if (!available(name)) name = "overview";
    if (name === cur) return;
    var from = ORDER.indexOf(cur), to = ORDER.indexOf(name), dir = to > from ? 1 : -1;
    var first = cur === null;
    Object.keys(views).forEach(function (k) { views[k].hidden = true; });
    cur = name; views[name].hidden = false;
    Object.keys(tabs).forEach(function (k) { tabs[k].setAttribute("aria-current", String(k === name)); });
    placeThumb(first);
    var t = tabs[name]; if (t && t.scrollIntoViewIfNeeded) t.scrollIntoViewIfNeeded(false);
    if (how.push) history.pushState(null, "", "#" + name);
    // keep the tab bar in sight: if the page is scrolled past it, come back up to it
    var top = nav.getBoundingClientRect().top + scrollY - stickyTop();
    if (!first && scrollY > top) scrollTo({ top: top, behavior: REDUCE ? "auto" : "smooth" });
    relayout();
    if (!first && !REDUCE) {
      var run = views[name].animate([{ opacity: 0, transform: "translateX(" + dir * 26 + "px)" }, { opacity: 1, transform: "none" }],
        { duration: 340, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" });
      run.onfinish = relayout;  // the map measures itself; measure again once it has stopped moving
    }
  }
  function stickyTop() { return parseFloat(getComputedStyle(nav).top) || 0; }
  Object.keys(tabs).forEach(function (k) {
    tabs[k].addEventListener("click", function (e) { e.preventDefault(); show(k, { push: true }); if (narrow()) shut(); });
  });
  // other buttons can open a view too (agents 3's hero): the view opens and the page comes down to it
  document.querySelectorAll("[data-open]").forEach(function (b) {
    b.addEventListener("click", function () {
      var top = nav.getBoundingClientRect().top + scrollY - stickyTop();
      show(b.dataset.open, { push: true });
      requestAnimationFrame(function () { scrollTo({ top: top, behavior: REDUCE ? "auto" : "smooth" }); });
    });
  });
  window.addEventListener("popstate", function () { show(location.hash.slice(1) || "overview"); });
  window.addEventListener("resize", function () { placeThumb(true); });
  if (document.fonts) document.fonts.ready.then(function () { placeThumb(true); });

  /* ---------- counts on the tabs ---------- */
  function counts() {
    var w = $("queue").querySelectorAll(".qc").length, p = $("attn").querySelectorAll(".prob").length;
    $("n-wait").textContent = w; $("n-wait").hidden = !w;
    $("n-attn").textContent = p; $("n-attn").hidden = !p;
    tabs.negotiation.hidden = $("st-section").hidden;
    if (cur === "negotiation" && $("st-section").hidden) show("overview", { push: true });
    placeThumb(true);
  }
  ["queue", "attn"].forEach(function (id) { new MutationObserver(counts).observe($(id), { childList: true }); });
  new MutationObserver(counts).observe($("st-section"), { attributes: true, attributeFilter: ["hidden"] });

  /* ---------- the drawer ---------- */
  var drawer = $("drawer"), panel = $("drawer-panel"), opener = null, picking = false;
  function open() {
    if (drawer.classList.contains("is-open")) return;
    opener = document.activeElement;
    drawer.inert = false; drawer.classList.add("is-open"); document.body.classList.add("has-drawer");
    panel.scrollTop = 0;
    panel.focus({ preventScroll: true });
    settle();
  }
  function shut() {
    if (!drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open"); document.body.classList.remove("has-drawer"); drawer.inert = true;
    if (opener && opener.isConnected && !narrow()) opener.focus({ preventScroll: true });
    settle();
  }
  // on wide screens the page makes room for the drawer; the map redraws its links once the room has been made
  function settle() {
    if (narrow()) return;
    document.body.classList.add("is-shifting");
    setTimeout(function () { document.body.classList.remove("is-shifting"); relayout(); }, 380);
  }
  drawer.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) shut(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("is-open") && !$("nq").open) shut(); });
  // selecting an agent or Totality redraws the side panel: when a click did that, open the drawer
  var SELECTS = ".lag, #hub-btn, .fd button, .rt__name, .prob__who, .dk__i, .moves button, .asks button, .side__also button";
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(SELECTS)) { picking = true; setTimeout(function () { picking = false; }); }
  }, true);
  new MutationObserver(function () { if (picking) open(); }).observe($("d-side"), { childList: true });

  /* ---------- agents.js scrolls to things; here that means going to their view ---------- */
  var native = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function (opt) {
    var el = this;
    if (el.id === "d-side") { open(); return; }
    var v = el.closest && el.closest("[data-view]");
    if (!v) return native.call(el, opt);
    // a roster name opens its agent and then asks for the map: the drawer has it, so stay on the table
    if (el.id === "now-title" && picking) return;
    var name = v.dataset.view, moved = name !== cur;
    if (moved) { show(name, { push: true }); if (narrow() || drawer.contains(document.activeElement)) shut(); }
    if (el.classList.contains("vhead__title") || el.id === "now-title") return;
    requestAnimationFrame(function () { native.call(el, { behavior: REDUCE ? "auto" : "smooth", block: "center" }); });
  };

  /* ---------- switching questions: the open view settles in again ---------- */
  $("w-list").addEventListener("click", function (e) {
    if (!e.target.closest(".wq") || REDUCE || !cur) return;
    views[cur].animate([{ opacity: 0.35, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: "ease-out" });
  });

  counts();
  show(location.hash.slice(1) || "overview");
})();
