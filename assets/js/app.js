/* Shared helpers for the product pages. */
(function () {
  var D = {};

  D.money = function (m, digits) {
    // m in $ millions
    var abs = Math.abs(m);
    if (abs < 0.0005) return "$0";
    if (abs >= 1000) return "$" + (m / 1000).toFixed(2) + "B";
    if (abs >= 1) return "$" + m.toFixed(digits == null ? 1 : digits) + "M";
    return "$" + Math.round(m * 1000) + "k";
  };
  D.pct = function (p, d) { return (p * 100).toFixed(d || 0) + "%"; };
  D.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  D.lerp = function (a, b, t) { return a + (b - a) * t; };

  D.rng = function (seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // Paint the filled part of range tracks (WebKit has no ::range-progress)
  function fill(r) {
    var p = (r.value - r.min) / (r.max - r.min || 1);
    r.style.setProperty("--fill", (p * 100).toFixed(1) + "%");
  }
  D.fillRanges = function (root) {
    (root || document).querySelectorAll('input[type="range"]').forEach(fill);
  };
  document.addEventListener("input", function (e) {
    if (e.target.matches && e.target.matches('input[type="range"]')) fill(e.target);
  });

  var toastEl, toastTimer;
  D.toast = function (msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(function () { toastEl.classList.add("is-on"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 3200);
  };

  document.addEventListener("DOMContentLoaded", function () { D.fillRanges(); });

  window.DB = D;
})();
