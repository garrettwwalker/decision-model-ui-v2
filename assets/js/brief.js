(function () {
  /* Approve a decision (its "See the team's part" is a plain link, so nav.js slides to the workflows page) */
  document.querySelectorAll("[data-decision]").forEach(function (card) {
    var approve = card.querySelector("[data-approve]");
    approve.addEventListener("click", function () {
      var on = card.classList.toggle("is-approved");
      approve.textContent = on ? "Approved" : "Approve";
      approve.setAttribute("aria-pressed", String(on));
      if (on) {
        var title = card.querySelector(".decision__title").textContent;
        DB.toast("Approved: " + title.split(" ").slice(0, 6).join(" ") + "… Owner notified.");
      }
    });
  });

  /* Links within the page glide there rather than jump */
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var to = document.querySelector(a.getAttribute("href"));
    if (!to) return;
    a.addEventListener("click", function (e) {
      e.preventDefault();
      to.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", a.getAttribute("href"));
    });
  });

  /* Orders or products: a cream track with a white pill that slides to the chosen grouping */
  var sw = document.querySelector(".sw"), pill = sw.querySelector(".sw__pill");
  function placePill() {
    var b = sw.querySelector('[aria-pressed="true"]');
    pill.style.width = b.offsetWidth + "px"; pill.style.transform = "translateX(" + (b.offsetLeft - 4) + "px)";
  }
  placePill();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePill);
  window.addEventListener("resize", placePill);
  requestAnimationFrame(function () { requestAnimationFrame(function () { sw.classList.add("is-ready"); }); });
  sw.addEventListener("click", function (e) {
    var b = e.target.closest("[data-by]");
    if (!b) return;
    sw.querySelectorAll("[data-by]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    placePill();
    document.querySelectorAll("[data-view]").forEach(function (v) {
      v.hidden = v.getAttribute("data-view") !== b.dataset.by;
      if (!v.hidden) v.classList.add("is-in");
    });
  });

  /* A route card lights its path on the map */
  var map = document.querySelector(".bmap");
  document.querySelectorAll("[data-route-card]").forEach(function (card) {
    var route = map.querySelector('.rt[data-route="' + card.getAttribute("data-route-card") + '"]');
    function on() { map.classList.add("has-focus"); route.classList.add("is-on"); }
    function off() { map.classList.remove("has-focus"); route.classList.remove("is-on"); }
    card.addEventListener("mouseenter", on);
    card.addEventListener("mouseleave", off);
    card.addEventListener("focus", on);
    card.addEventListener("blur", off);
  });

  /* Figures make their entrance the first time they scroll into view */
  Reveal(".spark, .stake--loss, .tbl-wrap, .fall");
})();
