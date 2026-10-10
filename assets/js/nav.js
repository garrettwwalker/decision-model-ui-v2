/* Page-to-page slides. Loaded in <head> so it can mark the page before first paint.
   Clicking a link to another page records which way that page lies in the nav order;
   the new page then slides in from that side. Where the browser supports cross-document
   view transitions, the old page slides out too and the top bar stays put. */
(function () {
  var ORDER = ["index.html", "briefing.html", "team.html", "workbench.html", "ask.html"];
  var KEY = "daybreak.slide";
  function idx(href) {
    try { return ORDER.indexOf(new URL(href, location.href).pathname.split("/").pop() || "index.html"); } catch (e) { return -1; }
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var to = idx(a.href), from = idx(location.href);
    if (to < 0 || from < 0 || to === from) return;
    try { sessionStorage.setItem(KEY, to > from ? "fwd" : "back"); } catch (x) {}
  }, true);

  var dir = null;
  try { dir = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch (x) {}
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!dir || reduce) return;
  var root = document.documentElement;
  root.setAttribute("data-slide", dir);
  // the view transition carries the slide instead, so drop the CSS entrance
  window.addEventListener("pagereveal", function (e) {
    if (!e.viewTransition) return;
    if (e.viewTransition.types) { e.viewTransition.types.add(dir); root.removeAttribute("data-slide"); }
    else e.viewTransition.skipTransition();
  });
  // clear the mark once the entrance has played, so nothing keeps a transform afterwards
  document.addEventListener("animationend", function end(e) {
    if (!/^page-in/.test(e.animationName)) return;
    root.removeAttribute("data-slide"); document.removeEventListener("animationend", end);
  });
  // fallback, counted from the first painted frame so a slow stylesheet can't eat the entrance
  requestAnimationFrame(function () { setTimeout(function () { root.removeAttribute("data-slide"); }, 1500); });
})();
