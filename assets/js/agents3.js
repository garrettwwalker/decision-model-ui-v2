/* Agents 3: rounded-square initial avatars, as on Looo's notification rows, for the live map's agent tiles
   (2026-11-04; the activity feed had them too, until the user found its rows too much like chat). agents.js redraws the
   tiles freely, so a watcher marks each as it appears: its initial in data-ini, and a color picked from its name. */
(function () {
  var COLORS = ["#7a1f2b", "#161412", "#c2410c", "#8a5a2b", "#a33a2a", "#a16207"];  // warm only: wine, espresso, rust, umber, brick, ochre
  function color(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return COLORS[h % COLORS.length];
  }
  function mark(el, name) {
    var ini = name.trim().charAt(0).toUpperCase();
    if (el.dataset.ini === ini) return;
    el.dataset.ini = ini;
    el.style.setProperty("--av", color(name));
  }
  function decorate() {
    document.querySelectorAll(".lag").forEach(function (t) { var b = t.querySelector(".lag__top b"); if (b) mark(t, b.textContent); });
  }
  ["loop-sense", "loop-act"].forEach(function (id) {
    new MutationObserver(decorate).observe(document.getElementById(id), { childList: true, subtree: true });
  });
  decorate();
})();

/* The chosen question rides in the tab bar once the questions have scrolled away (2026-11-04): its name and chance,
   and a menu to switch to another without scrolling back up. It mirrors the watchlist's cards and clicks them. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var box = $("vq"), btn = $("vq-btn"), menu = $("vq-menu"), list = $("w-list"), nav = $("vtabs");
  function cards() { return Array.prototype.slice.call(list.querySelectorAll(".wq")); }
  function sync() {
    var on = list.querySelector('.wq[aria-selected="true"]'); if (!on) return;
    $("vq-name").textContent = on.querySelector(".wq__name").textContent;
    $("vq-p").textContent = on.querySelector(".wq__p").textContent;
    if (!menu.hidden) fill();
  }
  function fill() {
    menu.innerHTML = "";
    cards().forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "vq__item"; b.setAttribute("role", "menuitemradio");
      b.setAttribute("aria-checked", c.getAttribute("aria-selected"));
      b.innerHTML = "<span></span><b class=\"num\"></b>";
      b.firstChild.textContent = c.querySelector(".wq__name").textContent;
      b.lastChild.textContent = c.querySelector(".wq__p").textContent;
      b.addEventListener("click", function () { shut(true); c.click(); });
      menu.appendChild(b);
    });
  }
  function open() { fill(); menu.hidden = false; btn.setAttribute("aria-expanded", "true"); var on = menu.querySelector('[aria-checked="true"]') || menu.firstChild; if (on) on.focus(); }
  function shut(refocus) { if (menu.hidden) return; menu.hidden = true; btn.setAttribute("aria-expanded", "false"); if (refocus) btn.focus({ preventScroll: true }); }
  btn.addEventListener("click", function () { menu.hidden ? open() : shut(); });
  document.addEventListener("click", function (e) { if (!box.contains(e.target)) shut(); });
  box.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.stopPropagation(); shut(true); }
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !menu.hidden) {
      e.preventDefault();
      var items = Array.prototype.slice.call(menu.children), i = items.indexOf(document.activeElement);
      items[(i + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length].focus();
    }
  });
  // shown once the cards have gone up under the tab bar
  function place() {
    var shown = list.getBoundingClientRect().bottom < nav.getBoundingClientRect().bottom;
    if (shown === box.classList.contains("is-on")) return;
    box.classList.toggle("is-on", shown); btn.tabIndex = shown ? 0 : -1;
    if (!shown) shut();
  }
  new MutationObserver(sync).observe(list, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-selected"] });
  addEventListener("scroll", place, { passive: true });
  sync(); place();
})();
