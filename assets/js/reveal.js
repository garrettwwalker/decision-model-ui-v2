/* House style: figures make an entrance the first time they scroll into view. Reveal(".a, .b") marks <html class="rv">
   and adds .is-in to each matching element once a quarter of it is on screen (or the given threshold); each page styles
   its entrance under `.rv ... :not(.is-in)` (lines draw, bars grow, charts wipe in). Under reduced motion, or without
   IntersectionObserver, everything is simply in. The Red Sea report keeps its own copy of this (html.rs-anim). */
window.Reveal = function (sel, threshold) {
  var els = document.querySelectorAll(sel);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    els.forEach(function (e) { e.classList.add("is-in"); });
    return;
  }
  document.documentElement.classList.add("rv");
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { threshold: threshold || 0.25 });
  els.forEach(function (e) { io.observe(e); });
};

/* Figures count to their value, as the Red Sea report's lab figures do (house style, 2026-11-10). Count(el, from) runs the
   first number in el's text (keeping its prefix, suffix, decimals, and thousands commas) from `from` to the value it shows
   now; CountIn(".a, .b") counts each match up from zero the first time it scrolls into view. Kept to headline figures:
   a page's top odds and money, and figures that change when a scenario or option is chosen. Off under reduced motion. */
(function () {
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NUM = /\d[\d,]*(\.\d+)?/;
  function textNode(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) if (NUM.test(n.nodeValue)) return n;
    return null;
  }
  window.Count = function (el, from, dur) {
    var n = textNode(el); if (!n || REDUCE) return;
    var src = n.nodeValue, m = src.match(NUM), to = parseFloat(m[0].replace(/,/g, ""));
    if (from == null || isNaN(from) || from === to) return;
    var dec = m[1] ? m[1].length - 1 : 0, comma = m[0].indexOf(",") >= 0, t0 = performance.now(), d = dur || 700;
    var fmt = function (v) {
      var s = v.toFixed(dec);
      return comma ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : s;
    };
    if (n._raf) cancelAnimationFrame(n._raf);
    (function step(now) {
      var k = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - k, 3);
      n.nodeValue = src.slice(0, m.index) + fmt(from + (to - from) * e) + src.slice(m.index + m[0].length);
      if (k < 1) n._raf = requestAnimationFrame(step); else n.nodeValue = src;
    })(t0);
  };
  // the number an element shows now, to count from when it's redrawn
  window.CountValue = function (el) {
    var n = el && textNode(el); if (!n) return null;
    return parseFloat(n.nodeValue.match(NUM)[0].replace(/,/g, ""));
  };
  // count from what an element showed before a redraw (its old text), when the units match: "$2.6M" to "$3.5M" counts,
  // "$400k" to "$2.6M" or "Nothing new" to "$44M" just changes
  window.CountFrom = function (el, prev) {
    var n = el && textNode(el); if (!n || prev == null) return;
    var m = prev.match(NUM); if (!m) return;
    if (prev.replace(NUM, "#") !== n.nodeValue.replace(NUM, "#")) return;
    Count(el, parseFloat(m[0].replace(/,/g, "")));
  };
  window.CountIn = function (sel) {
    var els = [].slice.call(document.querySelectorAll(sel));
    if (REDUCE || !("IntersectionObserver" in window)) return;
    // hold each at zero until it's seen, so the count isn't missed
    els.forEach(function (el) {
      var n = textNode(el); if (!n) return;
      el._src = n.nodeValue; var m = n.nodeValue.match(NUM), dec = m[1] ? m[1].length - 1 : 0;
      n.nodeValue = n.nodeValue.slice(0, m.index) + (0).toFixed(dec) + n.nodeValue.slice(m.index + m[0].length);
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var n = textNode(e.target); if (n && e.target._src) { n.nodeValue = e.target._src; Count(e.target, 0, 900); }
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  };
})();
