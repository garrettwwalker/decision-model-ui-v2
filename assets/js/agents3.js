/* Agents 3: rounded-square initial avatars, as on Looo's notification rows, for the live map's agent tiles
   (2026-11-04; the activity feed had them too, until the user found its rows too much like chat). agents.js redraws the
   tiles freely, so a watcher marks each as it appears: its initial in data-ini, and a color picked from its name. */
(function () {
  var COLORS = ["#7a1f2b", "#161412", "#c2410c", "#8a5a2b", "#a33a2a", "#a16207"];  // warm only: wine, espresso, rust, umber, brick, ochre
  function color(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return COLORS[h % COLORS.length];
  }
  function mark(el, name) {
    var ini = name.trim().charAt(0).toUpperCase();
    if (el.dataset.ini === ini) return;
    el.dataset.ini = ini;
    el.style.setProperty("--av", color(name));
  }
  function decorate() {
    document.querySelectorAll(".lag").forEach(function (t) { var b = t.querySelector(".lag__top b"); if (b) mark(t, b.textContent); });
  }
  ["loop-sense", "loop-act"].forEach(function (id) {
    new MutationObserver(decorate).observe(document.getElementById(id), { childList: true, subtree: true });
  });
  decorate();
})();

/* The chosen question rides in the tab bar once the question cards have scrolled away (2026-11-04): its name, in a
   pill under a "Question" label, fills the space left of the centered tabs, and leave again when the cards come back. The pill scrolls back up to
   the questions (the user disliked a dropdown there, and wanted no chance in it). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var box = $("vq"), list = $("w-list"), nav = $("vtabs");
  function sync() {
    var on = list.querySelector('.wq[aria-selected="true"]'); if (!on) return;
    $("vq-name").textContent = on.querySelector(".wq__name").textContent;
  }
  function place() {
    // the cards have gone once their bottom edge is above the foot of the stuck tab bar
    var card = list.querySelector(".wq"), bar = document.querySelector(".bar");
    var shown = !!card && card.getBoundingClientRect().bottom < bar.getBoundingClientRect().bottom + nav.offsetHeight;
    if (shown === box.classList.contains("is-on")) return;
    box.classList.toggle("is-on", shown); $("vq-name").tabIndex = shown ? 0 : -1;
  }
  // the pill takes you back up to the questions
  $("vq-name").addEventListener("click", function () {
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var top = document.querySelector(".watch").getBoundingClientRect().top + scrollY - document.querySelector(".bar").offsetHeight - 24;
    scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
    var on = list.querySelector('.wq[aria-selected="true"]'); if (on) on.focus({ preventScroll: true });
  });
  new MutationObserver(sync).observe(list, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-selected"] });
  addEventListener("scroll", place, { passive: true });
  sync(); place();
})();

/* Totality's disc as a gauge (2026-11-04): its red arc runs round the ring as far as the chance in #hub-p, which
   agents.js rewrites; a question with no forecast yet shows an empty track. */
(function () {
  var p = document.getElementById("hub-p"), arc = document.getElementById("hub-arc");
  function draw() {
    var m = /(\d+(?:\.\d+)?)\s*%/.exec(p.textContent), v = m ? Math.min(100, parseFloat(m[1])) : 0;
    arc.style.strokeDasharray = v + " " + (100 - v + 1);
    arc.style.opacity = v ? "1" : "0";
  }
  new MutationObserver(draw).observe(p, { childList: true, characterData: true, subtree: true });
  draw();
})();
