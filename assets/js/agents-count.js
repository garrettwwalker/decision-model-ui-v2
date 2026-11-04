/* Agents page: when a watchlist question is picked, its big figures count up from zero (2026-11-04). agents.js has
   already redrawn them by the time the click reaches the list, so each figure's new text is the target: every number
   in it runs from 0 to its value in about half a second, easing out, keeping its decimals ("$1.3k", "7 of 10", "33%").
   Dates and times are left alone, since a deadline counting up from day 0 would read as nonsense. If anything else
   rewrites a figure mid-way (the clock ticking), that one stops. Off under reduced motion. */
(function () {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var DURATION = 520, NUM = /\d+(?:\.\d+)?/g, DATE = /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b|\d:\d/;
  function count(el) {
    var target = el.textContent;
    if (!/\d/.test(target) || DATE.test(target)) return;
    var start = performance.now(), last = null;
    (function frame(now) {
      // rewritten by someone else: carry on if it was only set to the same value again, else leave it be
      if (last !== null && el.textContent !== last && el.textContent !== target) return;
      var t = Math.min(1, (now - start) / DURATION), k = 1 - Math.pow(1 - t, 3);
      if (t >= 1) { el.textContent = target; return; }
      el.textContent = last = target.replace(NUM, function (m) {
        var dp = (m.split(".")[1] || "").length;
        return (parseFloat(m) * k).toFixed(dp);
      });
      requestAnimationFrame(frame);
    })(start);
  }
  document.getElementById("w-list").addEventListener("click", function (e) {
    if (!e.target.closest(".wq")) return;
    document.querySelectorAll(".dk__v, #hub-p, .side__p b").forEach(count);
  });
})();
