(function () {
  /* Approve / defer decisions */
  document.querySelectorAll("[data-decision]").forEach(function (card) {
    var approve = card.querySelector("[data-approve]");
    var defer = card.querySelector("[data-defer]");
    approve.addEventListener("click", function () {
      var on = card.classList.toggle("is-approved");
      approve.textContent = on ? "approved ✓" : "approve";
      approve.setAttribute("aria-pressed", String(on));
      if (on) {
        var title = card.querySelector(".decision__title").textContent;
        DB.toast("Approved: " + title.split(" ").slice(0, 6).join(" ") + "… Owner notified.");
      }
    });
    defer.addEventListener("click", function () {
      window.location.href = "wargame.html";
    });
  });

  /* POs / SKUs toggle */
  document.querySelectorAll('input[name="by"]').forEach(function (r) {
    r.addEventListener("change", function () {
      document.querySelectorAll("[data-view]").forEach(function (v) {
        v.hidden = v.getAttribute("data-view") !== r.value;
      });
      var title = document.querySelector(".caught .panel__title");
      title.lastChild.textContent = r.value === "po" ? "purchase orders" : "SKUs";
    });
  });

  /* Route cards light up their path on the map */
  var map = document.querySelector(".map");
  document.querySelectorAll("[data-route-card]").forEach(function (card) {
    var key = card.getAttribute("data-route-card");
    var route = document.querySelector('.route[data-route="' + key + '"]');
    function on() { map.classList.add("has-focus"); route.classList.add("is-on"); }
    function off() { map.classList.remove("has-focus"); route.classList.remove("is-on"); }
    card.addEventListener("mouseenter", on);
    card.addEventListener("mouseleave", off);
    card.addEventListener("focus", on);
    card.addEventListener("blur", off);
  });
})();
