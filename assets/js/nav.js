/* Page-to-page slides. Loaded in <head> so it can mark the page before first paint.
   Clicking a link to another page records which way that page lies in the nav order;
   the new page then slides in from that side. Where the browser supports cross-document
   view transitions, the old page slides out too and the top bar stays put.
   Between the Red Sea demo's pages the moon crosses instead: it slides over the page from the side the next page
   lies on, covers it while that page loads, and slides off the far side once it's ready. */
(function () {
  var ORDER = ["index.html", "briefing.html", "memo.html", "team.html", "workbench.html", "agents.html", "ask.html", "redsea.html", "redsea-report.html", "redsea-tree.html"];
  var KEY = "daybreak.slide", MOON = "daybreak.moon", ECLIPSE = ["redsea.html", "redsea-report.html", "redsea-tree.html"].map(function (p) { return ORDER.indexOf(p); });
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  function moon(cls) {
    var m = document.createElement("div");
    m.className = "moon " + cls; m.setAttribute("aria-hidden", "true");
    m.innerHTML = '<div class="moon__disc"></div>';
    document.body.appendChild(m);
    return m;
  }
  function idx(href) {
    try { return ORDER.indexOf(new URL(href, location.href).pathname.split("/").pop() || "index.html"); } catch (e) { return -1; }
  }
  function eclipseLink(a) {
    var to = idx(a.href), from = idx(location.href);
    return !reduce && to !== from && ECLIPSE.indexOf(to) >= 0 && ECLIPSE.indexOf(from) >= 0;
  }
  // fetch the next demo page as soon as a pointer heads for its link, so it's ready by the time the moon covers
  var fetched = {};
  document.addEventListener("pointerover", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || fetched[a.href] || !eclipseLink(a)) return;
    fetched[a.href] = 1;
    var l = document.createElement("link"); l.rel = "prefetch"; l.href = a.href; document.head.appendChild(l);
  });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var to = idx(a.href), from = idx(location.href);
    if (to < 0 || from < 0 || to === from) return;
    var way = to > from ? "fwd" : "back";
    if (eclipseLink(a)) {
      try { sessionStorage.setItem(MOON, way); } catch (x) { return; }
      e.preventDefault();
      var href = a.href, gone = false, go = function () { if (!gone) { gone = true; location.href = href; } };
      moon("moon--in-" + way).addEventListener("animationend", go);
      setTimeout(go, 350);
      return;
    }
    try { sessionStorage.setItem(KEY, way); } catch (x) {}
  }, true);
  // back to a page kept in memory: it still has the moon over it
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) document.querySelectorAll(".moon--in-fwd, .moon--in-back").forEach(function (m) { m.remove(); });
  });

  var eclipse = null;
  try { eclipse = sessionStorage.getItem(MOON); sessionStorage.removeItem(MOON); } catch (x) {}
  if (eclipse && !reduce) {
    // dark until the moon is in place over the page, so nothing shows before it
    root.setAttribute("data-moon", "");
    window.addEventListener("pagereveal", function (e) {
      var vt = e.viewTransition; if (!vt) return;
      [vt.ready, vt.finished, vt.updateCallbackDone].forEach(function (p) { if (p) p.catch(function () {}); });  // skipping rejects these; nothing to report
      vt.skipTransition();
    });
    document.addEventListener("DOMContentLoaded", function () {
      var m = moon("moon--on");
      root.removeAttribute("data-moon");
      var off = false, leave = function () {
        if (off) return; off = true;
        requestAnimationFrame(function () {
          m.className = "moon moon--out-" + eclipse;
          m.addEventListener("animationend", function () { m.remove(); });
          setTimeout(function () { m.remove(); }, 600);
        });
      };
      // off as soon as the page is drawn: the fonts get a moment to land, but never hold the moon (they swap in if late)
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(leave);
      setTimeout(leave, 120);
    });
    return;
  }

  var dir = null;
  try { dir = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch (x) {}
  if (!dir || reduce) return;
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

/* Scrollbars inside house-style pages (and agents) fade in while a panel scrolls and out once it stops, as macOS's do.
   The bar's color is the registered custom property --sb (house.css, agents.css), which the thumb inherits; it's
   animated here with WAAPI because a scrollbar can't take a transition of its own. Dragging the bar scrolls, so it stays
   up while in hand. Under reduced motion it simply shows while scrolling. */
(function () {
  var ON = "rgba(22, 20, 18, 0.24)", OFF = "rgba(22, 20, 18, 0)";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function fade(el, to, ms) {
    // read where the bar is before stopping the last fade: once stopped, it would read as clear and the fade out jumped
    var from = getComputedStyle(el).getPropertyValue("--sb").trim() || OFF;
    if (el._sbFade) el._sbFade.cancel();
    try { el._sbFade = el.animate([{ "--sb": from }, { "--sb": to }], { duration: reduce ? 0 : ms, fill: "forwards", easing: "ease-in-out" }); } catch (e) {}
  }
  document.addEventListener("scroll", function (e) {
    var el = e.target, b = document.body;
    if (!el || el.nodeType !== 1 || !b || !(b.classList.contains("house") || b.classList.contains("ag-page"))) return;
    if (!el._sbOn) { el._sbOn = true; fade(el, ON, 150); }
    clearTimeout(el._sbT);
    el._sbT = setTimeout(function () { el._sbOn = false; fade(el, OFF, 450); }, 800);
  }, true);
})();
