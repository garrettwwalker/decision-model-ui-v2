/* Agents page: when a watchlist question is picked, its big figures decrypt into place (2026-11-04). agents.js has
   already redrawn them by the time the click reaches the list, so each figure's new text is the target: its characters
   cycle through random digits and letters, then settle from left to right in about 0.4 s. Spaces and punctuation hold
   still. If anything else rewrites a figure mid-way (the clock ticking), that one stops. Off under reduced motion. */
(function () {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var DIGITS = "0123456789", LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var DURATION = 420, STEP = 35;
  function noise(c) {
    if (/[0-9]/.test(c)) return DIGITS[Math.floor(Math.random() * 10)];
    if (/[a-z]/i.test(c)) return LETTERS[Math.floor(Math.random() * LETTERS.length)];
    return c;
  }
  function decrypt(el) {
    var target = el.textContent, n = target.length, start = performance.now(), last = null;
    if (!n) return;
    (function frame() {
      if (last !== null && el.textContent !== last) return;  // rewritten by someone else: leave it be
      var t = (performance.now() - start) / DURATION;
      if (t >= 1) { el.textContent = target; return; }
      var settled = Math.floor(t * n), out = "";
      for (var i = 0; i < n; i++) out += i < settled ? target[i] : noise(target[i]);
      el.textContent = last = out;
      setTimeout(frame, STEP);
    })();
  }
  document.getElementById("w-list").addEventListener("click", function (e) {
    if (!e.target.closest(".wq")) return;
    document.querySelectorAll(".dk__v, #hub-p, .side__p b").forEach(decrypt);
  });
})();
