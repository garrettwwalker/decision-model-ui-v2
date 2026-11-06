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
