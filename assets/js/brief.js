/* The daily brief as a small decision lab. The figures are today's (computed from model.js at a 27% chance); a what-if
   chance scales every expected figure in proportion, and the plan is whichever decisions are switched on. Everything
   re-renders from `S` and every number glides to its new value. Choices (not the what-if) persist in localStorage. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- the model: expected figures at today's 27%, in $M ----------
  var P0 = 27, LOSS = 38.0, CAUSES = [16.9, 9.8, 6.7, 4.5];
  var ROUTES = {
    kf: { prot: 7.6, cost: 0.90, title: "Divert four Jebel Ali sailings to Khor Fakkan and truck the boxes to the Dubai DC",
          why: "Khor Fakkan sits outside the strait on the UAE's east coast, 140 km by road from the distribution center. The detour adds a day and a half, and 600 containers a week of berth space are open now." },
    so: { prot: 7.0, cost: 1.30, title: "Divert four Jebel Ali sailings to Sohar and truck the boxes to the Dubai DC",
          why: "Sohar is in Oman, outside the strait, 260 km by road from the distribution center. The detour adds two and a half days, but it has the most room: 900 containers a week." },
    fj: { prot: 3.1, cost: 1.00, title: "Divert four Jebel Ali sailings to Fujairah and truck the boxes to the Dubai DC",
          why: "Fujairah is outside the strait and a short drive from the distribution center, but only 240 containers a week of berth space are free, so most of the four sailings won't fit." },
    jd: { prot: 1.9 }
  };
  var DECS = [{ prot: 11.7, cost: 0.84 }, null, { prot: 5.7, cost: 1.36 }];
  var WEEK = ["Approved: resin bridge-buy", "Approved: diversion booked", "Approved: cover and hedge"];
  var SHORT = { 45: "if a naval exercise is announced or a tanker is seized", 35: "if underwriters suspend Gulf cover",
                15: "if the Muscat talks set a second round", 10: "if 10 quiet days pass" };
  var NUM = ["no", "one", "two", "three"];

  var KEY = "daybreak.brief", S = { p: P0, on: [true, true, true], ok: [false, false, false], route: "kf" };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && saved.on && saved.ok && ROUTES[saved.route]) { S.on = saved.on; S.ok = saved.ok; S.route = saved.route; }
  } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ on: S.on, ok: S.ok, route: S.route })); } catch (e) {} }

  function figures() {
    var k = S.p / P0, r = ROUTES[S.route];
    var decs = [DECS[0], { prot: r.prot, cost: r.cost }, DECS[2]].map(function (d, i) {
      return { prot: d.prot * k, cost: d.cost, on: S.on[i] };
    });
    var prot = 0, cost = 0, n = 0;
    decs.forEach(function (d) { if (d.on) { prot += d.prot; cost += d.cost; n++; } });
    return { k: k, loss: LOSS * k, decs: decs, prot: prot, cost: cost, n: n, left: LOSS * k - prot, net: prot - cost,
             allPay: decs.every(function (d) { return !d.on || d.prot > d.cost; }) };
  }

  // ---------- motion: numbers count from what's on screen to the new value ----------
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  function money(v, dp) { return (v < -0.004 ? "−" : "") + "$" + Math.abs(v).toFixed(dp == null ? 1 : dp) + "M"; }
  function count(el, v, fmt) {
    if (!el) return;
    var from = el._v == null ? v : el._v;
    cancelAnimationFrame(el._raf);
    el._v = v;
    if (REDUCE || from === v) { el.textContent = fmt(v); return; }
    var t0 = performance.now();
    (function step(now) {
      var t = ease(Math.min(1, (now - t0) / 600));
      el.textContent = fmt(from + (v - from) * t);
      if (t < 1) el._raf = requestAnimationFrame(step);
    })(t0);
  }
  function swapText(el, text) {
    if (el._to === text || (el._to == null && el.textContent === text)) return;
    el._to = text;
    if (REDUCE || !el.animate) { el.textContent = text; return; }
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: "ease-in" }).onfinish = function () {
      el.textContent = el._to;
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
    };
  }
  var pct = function (v) { return Math.round(v) + ""; };

  // ---------- the strip the stakes fold into once they scroll away ----------
  var kbar = document.createElement("div");
  kbar.className = "kbar"; kbar.setAttribute("aria-hidden", "true");
  kbar.innerHTML = '<div class="kbar__in"><button type="button" class="kbar__name" tabindex="-1">Your Plan</button>' +
    [["Chance of a closure", ""], ["If we do nothing", "red"], ["With your plan", ""], ["Net of its cost", ""]].map(function (k) {
      return '<span class="kbar__i"><span class="kbar__k">' + k[0] + '</span><b class="kbar__v ' + k[1] + '"></b></span>';
    }).join("") + "</div>";
  document.body.appendChild(kbar);
  var KB = $$(".kbar__v", kbar);

  // ---------- render everything from S ----------
  var map = $(".bmap");
  function render() {
    var F = figures(), what = S.p !== P0;

    // the stakes
    count($("#s-p"), S.p, pct);
    $("#s-p2").textContent = S.p + "%";
    swapText($("#s-pk"), what ? "Chance of a closure " + SHORT[S.p] : "Chance of a closure");
    $("#s-whatif").hidden = !what; $("#s-back").hidden = !what; $("#s-pfoot").hidden = what;
    count($("#s-loss"), F.loss, money);
    $$("[data-cause]").forEach(function (b) { count(b, CAUSES[+b.dataset.cause] * F.k, money); });
    count($("#s-plan"), F.left, money);
    $("#s-planwhat").textContent = F.n ? "expected loss after the " + NUM[F.n] + " decision" + (F.n > 1 ? "s" : "") + " in your plan, which " +
      (F.n > 1 ? "cost " + money(F.cost) + " together" : "costs " + money(F.cost, 2)) : "with nothing in your plan, the same as doing nothing";
    $(".left__risk").style.width = (F.left / F.loss * 100) + "%";
    $("#s-leftbar").setAttribute("aria-label", "Of the loss if we do nothing, the plan protects " + money(F.prot) + " and " + money(F.left) + " is still at risk");
    count($("#s-risk"), F.left, money);
    count($("#s-prot"), F.prot, money);
    count($("#s-net"), F.net, money);

    // the decisions and the week's deadlines
    $$(".decision").forEach(function (card, i) {
      var d = F.decs[i], sw = $(".decision__in input", card), ok = S.ok[i];
      card.classList.toggle("is-off", !d.on);
      card.classList.toggle("is-approved", ok);
      sw.checked = d.on; sw.disabled = ok;
      $(".decision__in", card).title = ok ? "Approved decisions stay in the plan. Undo the approval to take it out." : "";
      var btn = $("[data-approve]", card);
      btn.textContent = ok ? "Approved" : "Approve"; btn.setAttribute("aria-pressed", String(ok));
      count($('[data-f="prot"]', card), d.prot, money);
      count($('[data-f="cost"]', card), d.cost, function (v) { return money(v, 2); });
    });
    var c2 = $('.decision[data-d="1"]'), R = ROUTES[S.route];
    swapText($('[data-f="title"]', c2), R.title);
    swapText($('[data-f="why"]', c2), R.why);
    $$("[data-week]").forEach(function (li) {
      var i = +li.dataset.week, span = $("span", li);
      if (!span._base) span._base = span.textContent;
      li.classList.toggle("is-done", S.ok[i]);
      span.textContent = S.ok[i] ? WEEK[i] : span._base;
    });

    // the ways around: the chosen port is decision 2's; locked once decision 2 is approved
    var locked = S.ok[1];
    $$(".rcard[data-route]").forEach(function (b) {
      b.setAttribute("aria-checked", String(b.dataset.route === S.route));
      b.setAttribute("aria-disabled", String(locked && b.dataset.route !== S.route));
    });
    $$("[data-rp]").forEach(function (dd) { count(dd, ROUTES[dd.dataset.rp].prot * F.k, money); });
    $("#r-note").textContent = locked ? "Decision 2 is approved with this port. Undo the approval to change it." :
      "Pick the port for decision 2. Its cost, what it protects, and the route on the map follow.";
    $$(".rt").forEach(function (g) { g.classList.toggle("is-plan", S.on[1] && g.dataset.route === S.route); });

    // the forecast chooser and its readout
    $$(".sign").forEach(function (b) { b.setAttribute("aria-checked", String(+b.dataset.p === S.p)); });
    $("#why-read").innerHTML = F.n ? "At " + (what ? "" : "today's ") + S.p + "%, the " + NUM[F.n] + " decision" + (F.n > 1 ? "s" : "") +
      " in your plan " + (what ? "would protect" : "protect" + (F.n > 1 ? "" : "s")) + " <b>" + money(F.prot) + "</b> for <b>" + money(F.cost) + "</b>." +
      (F.allPay ? (F.n > 1 ? " Each one" : " It") + " still pays for itself." : " Not every one pays for itself at this chance.") :
      "Nothing is in your plan, so nothing is protected.";

    // the strip
    count(KB[0], S.p, function (v) { return Math.round(v) + "%"; });
    count(KB[1], F.loss, money); count(KB[2], F.left, money); count(KB[3], F.net, money);
    save();
  }

  // ---------- controls ----------
  $$(".decision").forEach(function (card, i) {
    $(".decision__in input", card).addEventListener("change", function (e) { S.on[i] = e.target.checked; render(); });
    $("[data-approve]", card).addEventListener("click", function () {
      S.ok[i] = !S.ok[i];
      if (S.ok[i]) {
        S.on[i] = true;
        var title = $(".decision__title", card).textContent;
        DB.toast("Approved: " + title.split(" ").slice(0, 6).join(" ") + "… Owner notified.");
      }
      render();
    });
  });
  $$(".rcard[data-route]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.getAttribute("aria-disabled") === "true") return;
      S.route = b.dataset.route; render();
    });
  });
  $$(".sign").forEach(function (b) { b.addEventListener("click", function () { S.p = +b.dataset.p; render(); }); });
  $("#s-back").addEventListener("click", function () { S.p = P0; render(); });

  // links within the page glide there rather than jump
  function glide(el) {
    var y = el.getBoundingClientRect().top + window.scrollY - $(".bar").getBoundingClientRect().bottom - 16;
    window.scrollTo({ top: y, behavior: REDUCE ? "auto" : "smooth" });
  }
  $$('a[href^="#"]').forEach(function (a) {
    var to = $(a.getAttribute("href"));
    if (!to) return;
    a.addEventListener("click", function (e) { e.preventDefault(); glide(to); history.replaceState(null, "", a.getAttribute("href")); });
  });
  $(".kbar__name", kbar).addEventListener("click", function () { glide($("#stakes")); });

  // the strip shows once the stakes card has passed under the top bar
  (function () {
    var bar = $(".bar"), stakes = $("#stakes"), on = false, raf = 0;
    function place() {
      raf = 0;
      var top = bar.getBoundingClientRect().bottom;
      document.body.style.setProperty("--bar-b", top + "px");
      var show = stakes.getBoundingClientRect().bottom < top;
      if (show !== on) { on = show; kbar.classList.toggle("is-on", on); }
    }
    function ask() { if (!raf) raf = requestAnimationFrame(place); }
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", ask);
    place();
  })();

  // orders or products: a cream track with a white pill that slides to the chosen grouping
  var sw = $(".sw"), pill = $(".sw__pill", sw);
  function placePill() {
    var b = $('[aria-pressed="true"]', sw);
    pill.style.width = b.offsetWidth + "px"; pill.style.transform = "translateX(" + (b.offsetLeft - 4) + "px)";
  }
  placePill();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePill);
  window.addEventListener("resize", placePill);
  requestAnimationFrame(function () { requestAnimationFrame(function () { sw.classList.add("is-ready"); }); });
  sw.addEventListener("click", function (e) {
    var b = e.target.closest("[data-by]");
    if (!b) return;
    $$("[data-by]", sw).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    placePill();
    $$("[data-view]").forEach(function (v) {
      v.hidden = v.dataset.view !== b.dataset.by;
      if (!v.hidden) v.classList.add("is-in");
    });
  });

  // the map and the orders point at each other: a row lights its ship, a ship lights its rows
  function light(ship) {
    map.classList.toggle("has-ship", !!ship);
    $$("[data-ship]", map).forEach(function (g) { g.classList.toggle("is-lit", g.dataset.ship === ship); });
    $$("tr[data-ship]").forEach(function (tr) { tr.classList.toggle("is-lit", tr.dataset.ship === ship); });
  }
  $$("tr[data-ship], .bmap [data-ship]").forEach(function (el) {
    el.addEventListener("mouseenter", function () { light(el.dataset.ship); });
    el.addEventListener("mouseleave", function () { light(null); });
  });
  // pointing at a way around previews its route
  $$(".rcard[data-route]").forEach(function (card) {
    var route = $('.rt[data-route="' + card.dataset.route + '"]', map);
    function on() { map.classList.add("has-focus"); route.classList.add("is-on"); }
    function off() { map.classList.remove("has-focus"); route.classList.remove("is-on"); }
    card.addEventListener("mouseenter", on); card.addEventListener("mouseleave", off);
    card.addEventListener("focus", on); card.addEventListener("blur", off);
  });

  render();
  // figures make their entrance the first time they scroll into view
  Reveal(".spark, .stake--loss, .tbl-wrap, .fall");
})();
