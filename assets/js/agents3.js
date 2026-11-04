/* Agents 3: rounded-square initial avatars, as on Looo's notification rows, for the live map's agent tiles and the
   activity feed (2026-11-04). agents.js redraws both freely, so a watcher marks each tile and row as it appears: its
   initial in data-ini, and a color picked from the agent's name (Totality is always the page's red). */
(function () {
  var COLORS = ["#7a1f2b", "#161412", "#c2410c", "#3f6b4e", "#2d4a7a", "#a16207"];
  function color(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return COLORS[h % COLORS.length];
  }
  function mark(el, name, hub) {
    var ini = name.trim().charAt(0).toUpperCase();
    if (el.dataset.ini === ini) return;
    el.dataset.ini = ini;
    el.style.setProperty("--av", hub ? "var(--accent)" : color(name));
  }
  function decorate() {
    document.querySelectorAll(".lag").forEach(function (t) { var b = t.querySelector(".lag__top b"); if (b) mark(t, b.textContent, false); });
    document.querySelectorAll(".fd button").forEach(function (r) { var w = r.querySelector(".fd__who"); if (w) mark(r, w.textContent, w.classList.contains("fd__who--hub")); });
  }
  ["loop-sense", "loop-act", "feed"].forEach(function (id) {
    new MutationObserver(decorate).observe(document.getElementById(id), { childList: true, subtree: true });
  });
  decorate();
})();
