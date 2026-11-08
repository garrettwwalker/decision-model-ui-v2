/* Sample memo: a strategic options memo answering "How should we respond to the potential of new
   sanctions by the Trump Administration?" Written on Wed Oct 7, the day after the brief.
   Money in $M, expected over 12 months at the 41% forecast. Every figure is illustrative.
   If sanctions land, $62M is at risk, split by the interests it would reach: resin for Gebze 24, sales through the
   Dubai traders 18, penalty exposure 11, feeders and freight 5, Gebze's banking 4. Rebuilt 2026-11-07 in the brief's
   shape: the company's interests rather than its officers, each option's fit read as which interests it serves. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var P = 0.41;

  // what's at stake: the company interests new sanctions would reach, with the value at risk if they come
  var INTERESTS = [
    { id: "plants", short: "Plants", what: "Keep Gebze Running", risk: 24,
      why: "Two Gulf suppliers carry 38% of Gebze’s resin, and the plant holds 9 days of it. A line stop costs about $1.1M a day." },
    { id: "growth", short: "MENA growth", what: "Keep MENA Growing", risk: 18,
      why: "MENA is 11% of revenue and our fastest-growing region. Three Dubai traders move 14% of its volume." },
    { id: "clear", short: "No breach", what: "Stay Clear of a Breach", risk: 11,
      why: "As a US-listed parent our liability is strict, and a penalty would trip two lender covenants." },
    { id: "freight", short: "Freight", what: "Keep Freight Moving", risk: 5,
      why: "Two of our feeder ships share a technical manager with tankers named in September." },
    { id: "cash", short: "Payments", what: "Keep Payments Flowing", risk: 4,
      why: "Gebze settles through a Turkish lender with an Iran history. Losing it would freeze payroll and supplier runs." }
  ];
  var BY = {};
  INTERESTS.forEach(function (it) { BY[it.id] = it; });

  // serves and strains: the interests each option helps and the ones it works against
  var OPTIONS = [
    { id: "resin", n: 1, title: "Re-source resin before sanctions arrive", pick: true, view: "Start now",
      line: "Qualify two Singapore grades and one Korean grade at Gebze, and move 40% of its volume off the Gulf by December. Builds on Tuesday’s Singapore bridge-buy.",
      cost: 2.6, protects: 24 * 0.8 * P, serves: ["plants", "clear"], strains: [],
      pros: ["Protects the most value", "Also cuts the Hormuz exposure in this week’s brief", "Qualification is reusable for any future supply shock"],
      cons: ["About $35/t more for at least two quarters", "Ties up Gebze’s QA team for 6 weeks", "Gulf suppliers may shrink our allocation"] },
    { id: "engage", n: 2, title: "Engage Washington and the banks", pick: true, view: "Start now",
      line: "Through the trade association, ask Treasury for wind-down guidance. Pre-clear payment routes with two banks and open a second settlement account for Gebze.",
      cost: 0.4, protects: 4 * P, serves: ["cash", "growth"], strains: [],
      pros: ["Cheap, and may buy a longer wind-down", "Keeps Gebze’s payroll and supplier runs safe"],
      cons: ["The outcome is outside our control", "Visible lobbying on Iran carries some reputational risk", "Does nothing for resin"] },
    { id: "tighten", n: 3, title: "Tighten compliance now", view: "Start at the first tripwire",
      line: "Re-screen every MENA counterparty, ask the Dubai traders for end-use certificates, pause any that won’t sign, and swap the two exposed feeders.",
      cost: 3.5, costNote: "including $2.1M of margin given up", protects: 16 * P, serves: ["clear", "freight", "cash"], strains: ["growth"],
      pros: ["Removes nearly all penalty exposure", "Shows banks and auditors we moved early", "Cheap to reverse if no sanctions come"],
      cons: ["Gives up about $2.1M of margin a year even if nothing happens", "Strains the traders behind 14% of MENA volume; rivals may take them"] },
    { id: "watch", n: 4, title: "Watch and set tripwires",
      line: "Change nothing yet. Set the Totality engine to watch four signposts, and draft, but don’t send, the exit letters.",
      cost: 0.1, protects: 0, serves: ["growth"], strains: ["plants", "clear"],
      pros: ["Costs almost nothing and keeps every supplier and trader", "Nothing to unwind if the talks restart"],
      cons: ["A 30-day window is too short to qualify new resin, which takes 6 to 8 weeks", "If a trader is named before we act, the shipment is already a breach"] }
  ];

  var WEEKS = ["Oct 7", "Oct 12", "Oct 19", "Oct 26", "Nov 2", "Nov 9", "Nov 16", "Nov 23", "Nov 30", "Dec 7"];

  // steps: [what, owner, start week, length in weeks]; marks: [week, label]; trips: [when, then], written to follow "If "
  var PLANS = {
    resin: {
      lead: "VP Procurement", hours: 680, first: "Fri Oct 9",
      steps: [
        ["Order samples: two Singapore grades, one Korean", "Procurement", 0, 1],
        ["Line trials and QA sign-off at Gebze", "Gebze QA", 1, 6],
        ["Frame contracts for 40% of Gebze volume", "Procurement", 4, 3],
        ["Agree a smaller Gulf allocation without breaching terms", "Legal", 5, 2],
        ["First non-Gulf deliveries reach Gebze", "VP Logistics", 7, 3]
      ],
      marks: [[1, "Samples land"], [7, "QA sign-off"], [9, "40% off the Gulf"]],
      trips: [["a Gulf polymer maker is named", "move 70% of Gebze’s resin off the Gulf, using spot cargoes"], ["Hormuz closes", "fold this plan into the brief’s Singapore bridge-buy"]]
    },
    engage: {
      lead: "Group Treasurer", hours: 190, first: "Thu Oct 8",
      steps: [
        ["Brief the trade association’s sanctions group", "General Counsel", 0, 1],
        ["Pre-clear payment routes with two banks", "Group Treasurer", 0, 3],
        ["Joint letter to Treasury asking for wind-down guidance", "Trade association", 1, 2],
        ["Open a second settlement account for Gebze", "Group Treasurer", 2, 4],
        ["Prepare investor questions and answers", "Investor relations", 3, 1]
      ],
      marks: [[3, "Letter sent"], [6, "Second account live"]],
      trips: [["the guidance allows less than 30 days to wind down", "start tightening compliance at once"], ["the Turkish lender is named", "move all Gebze payments to the new account"]]
    },
    tighten: {
      lead: "General Counsel", hours: 420, first: "Mon Oct 12",
      steps: [
        ["Re-screen all MENA counterparties, ownership included", "Compliance", 0, 2],
        ["Ask the three Dubai traders for end-use certificates", "GM MENA, Legal", 1, 3],
        ["Swap the two feeders that share a manager with named ships", "VP Logistics", 1, 3],
        ["Pause shipments to traders that won’t certify", "GM MENA", 4, 6],
        ["Brief the banks and auditors on what changed", "Group Treasurer", 4, 1]
      ],
      marks: [[3, "Certificates due"], [5, "Audit committee"]],
      trips: [["a trader refuses to certify", "pause it and offer its volume to the GCC key accounts"], ["talks resume with a date", "keep the screening, lift the pauses"]]
    },
    watch: {
      lead: "Risk office", hours: 60, first: "Thu Oct 8",
      steps: [
        ["Set tripwires on four signposts in Penumbra", "Risk office", 0, 1],
        ["Weekly sanctions read-out to the exec team", "Risk office", 0, 10],
        ["Draft exit letters for suppliers and traders", "Legal", 1, 2],
        ["Keep non-Gulf resin samples on file", "Procurement", 2, 2]
      ],
      marks: [[4, "Exec review of the forecast"], [9, "Forecast horizon, Dec 6"]],
      trips: [["the Senate bill passes the floor", "tighten compliance the same week"], ["the chance rises above 55%", "re-source resin at once"], ["any counterparty is named", "stop shipments that day and send the drafted letters"]]
    }
  };

  var ASKS = [
    ["What-if", "What happens to Gebze if both Gulf resin suppliers are named on the same day?"],
    ["Forecast", "Would new sanctions make a Hormuz closure more likely?"],
    ["Capacity", "How long can Gebze run on Singapore resin alone?"],
    ["Exposure", "Which of our customers buy through the three Dubai traders?"],
    ["Opportunity", "Which competitors rely on the same Gulf suppliers?"],
    ["Forecast", "Would a change in India’s oil buying affect the Pune plant?"]
  ];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- what's at stake: a white card per interest, its share of the $62M a thin red line ---------- */
  var stakes = $("#stakes");
  INTERESTS.forEach(function (it) {
    var li = el("li", "stake");
    li.appendChild(el("h3", "stake__what", it.what));
    li.appendChild(el("p", "stake__why", it.why));
    var foot = el("div", "stake__foot");
    foot.appendChild(el("span", "stake__k", "At risk if sanctions come"));
    foot.appendChild(el("b", "stake__v", DB.money(it.risk, 0)));
    var bar = el("span", "stake__bar"); bar.setAttribute("aria-hidden", "true");
    var fill = el("i"); fill.style.setProperty("--v", it.risk / 24);
    bar.appendChild(fill); foot.appendChild(bar);
    li.appendChild(foot);
    stakes.appendChild(li);
  });

  /* ---------- options: a row each, Choose and Details, as the brief's decisions ---------- */
  var KEY = "daybreak.memo.choice";
  var chosen = {};
  try { chosen = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
  var olist = $("#options-list");
  OPTIONS.forEach(function (o) {
    var li = el("li", "option");
    li.id = "opt-" + o.id; li.dataset.id = o.id;
    li.appendChild(el("span", "option__n", String(o.n))).setAttribute("aria-hidden", "true");

    var body = el("div", "option__body");
    body.appendChild(el("h3", "option__title", o.title));
    body.appendChild(el("p", "option__line", o.line));
    var meta = el("p", "option__meta");
    if (o.view) meta.appendChild(el("span", "pill" + (o.pick ? " pill--red" : ""), "Totality’s view: " + o.view.toLowerCase()));
    o.serves.forEach(function (id) { var s = el("span", "pill option__int", "Serves " + BY[id].short.toLowerCase()); s.dataset.int = id; meta.appendChild(s); });
    o.strains.forEach(function (id) { var s = el("span", "pill pill--amber option__int", "Strains " + BY[id].short.toLowerCase()); s.dataset.int = id; s.dataset.strain = ""; meta.appendChild(s); });
    var state = el("span", "pill option__state"); meta.appendChild(state);
    body.appendChild(meta);
    li.appendChild(body);

    var nums = el("dl", "option__nums");
    function num(label, val, sub) {
      var d = el("div"); d.appendChild(el("dt", null, label));
      var dd = el("dd", null, val); d.appendChild(dd);
      if (sub) d.appendChild(el("small", null, sub));
      nums.appendChild(d);
    }
    num("Costs", DB.money(o.cost), o.costNote);
    num("Protects", DB.money(o.protects));
    li.appendChild(nums);

    var act = el("div", "option__act");
    var pick = el("button", "btn btn--primary btn--sm", "Choose");
    pick.type = "button";
    var more = el("button", "btn-q", "Details");
    more.type = "button"; more.setAttribute("aria-expanded", "false"); more.setAttribute("aria-controls", "more-" + o.id);
    act.appendChild(pick); act.appendChild(more);
    li.appendChild(act);

    // details drop open beneath the words: for and against, then a way to the plan
    var drop = el("div", "option__more"); drop.id = "more-" + o.id;
    var inner = el("div"), pc = el("div", "option__pc");
    [["For", o.pros, "pro"], ["Against", o.cons, "con"]].forEach(function (g) {
      var col = el("div");
      col.appendChild(el("p", "option__pclabel", g[0]));
      var ul = el("ul", "option__list option__list--" + g[2]);
      g[1].forEach(function (t) { ul.appendChild(el("li", null, t)); });
      col.appendChild(ul); pc.appendChild(col);
    });
    inner.appendChild(pc);
    var see = el("button", "btn-q", "See how it would run");
    see.type = "button";
    see.addEventListener("click", function () {
      showPlan(o.id, true);
      var y = $("#plans").getBoundingClientRect().top + window.scrollY - $(".bar").getBoundingClientRect().bottom - 16;
      window.scrollTo({ top: y, behavior: REDUCE ? "auto" : "smooth" });
    });
    inner.appendChild(see);
    drop.appendChild(inner);
    li.appendChild(drop);

    more.addEventListener("click", function () {
      var open = li.classList.toggle("is-open");
      more.setAttribute("aria-expanded", String(open));
      more.textContent = open ? "Hide details" : "Details";
    });
    function paint() {
      var on = !!chosen[o.id];
      li.classList.toggle("is-chosen", on);
      pick.textContent = on ? "Chosen" : "Choose";
      pick.setAttribute("aria-pressed", String(on));
      state.textContent = on ? PLANS[o.id].lead + " starts by " + PLANS[o.id].first : "";
    }
    pick.addEventListener("click", function () {
      chosen[o.id] = !chosen[o.id];
      try { localStorage.setItem(KEY, JSON.stringify(chosen)); } catch (e) {}
      paint();
      if (chosen[o.id]) DB.toast("Chosen. " + PLANS[o.id].lead + " is told to start by " + PLANS[o.id].first + ".");
    });
    paint();
    olist.appendChild(li);
  });

  /* ---------- show what serves: a cream track with a white pill; options that don't serve the interest fade back ---------- */
  var sw = $("#serves"), swPill = $(".sw__pill", sw);
  INTERESTS.forEach(function (it) {
    var b = el("button", null, it.short);
    b.type = "button"; b.dataset.int = it.id; b.setAttribute("aria-pressed", "false");
    sw.appendChild(b);
  });
  function placePill() {
    var b = $('[aria-pressed="true"]', sw);
    swPill.style.width = b.offsetWidth + "px"; swPill.style.transform = "translateX(" + (b.offsetLeft - 4) + "px)";
  }
  placePill();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePill);
  window.addEventListener("resize", placePill);
  requestAnimationFrame(function () { requestAnimationFrame(function () { sw.classList.add("is-ready"); }); });
  sw.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var id = b.dataset.int;
    $$("button", sw).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    placePill();
    OPTIONS.forEach(function (o) {
      $("#opt-" + o.id).classList.toggle("is-faded", !!id && o.serves.indexOf(id) < 0);
    });
    $$(".option__int").forEach(function (p) { p.classList.toggle("is-lit", p.dataset.int === id); });
  });

  /* ---------- plans ---------- */
  var tabs = $("#plan-tabs"), panel = $("#plan");
  var tabEls = {};
  // a white pill slides behind the chosen tab (and follows it to another line when the tabs wrap)
  var thumb = el("span", "planpick__thumb"); thumb.setAttribute("aria-hidden", "true"); tabs.appendChild(thumb);
  function placeThumb(snap) {
    var b = tabs.querySelector('[aria-selected="true"]'); if (!b) return;
    if (snap) thumb.classList.add("is-snap");
    thumb.style.width = b.offsetWidth + "px"; thumb.style.height = b.offsetHeight + "px";
    thumb.style.transform = "translate(" + b.offsetLeft + "px," + b.offsetTop + "px)";
    if (snap) { void thumb.offsetWidth; thumb.classList.remove("is-snap"); }
  }
  window.addEventListener("resize", function () { placeThumb(true); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeThumb(true); });
  OPTIONS.forEach(function (o) {
    var b = el("button", "planpick__tab");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.id = "tab-" + o.id;
    b.appendChild(el("span", "planpick__n", String(o.n)));
    b.appendChild(el("span", null, o.title));
    b.addEventListener("click", function () { showPlan(o.id, true); });
    b.addEventListener("keydown", function (e) {
      var i = OPTIONS.indexOf(o), d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var next = OPTIONS[(i + d + OPTIONS.length) % OPTIONS.length].id;
      showPlan(next, true); tabEls[next].focus();
    });
    tabEls[o.id] = b;
    tabs.appendChild(b);
  });

  function showPlan(id, user) {
    var o = OPTIONS.filter(function (x) { return x.id === id; })[0], p = PLANS[id];
    Object.keys(tabEls).forEach(function (k) {
      tabEls[k].setAttribute("aria-selected", String(k === id));
      tabEls[k].tabIndex = k === id ? 0 : -1;
    });
    placeThumb(!user);
    panel.setAttribute("aria-labelledby", "tab-" + id);
    panel.innerHTML = "";
    // the card stays put; only what's in it fades in, so switching plans doesn't jolt
    if (user) { panel.classList.remove("is-swap"); void panel.offsetWidth; panel.classList.add("is-swap"); }

    var top = el("div", "plan__top");
    var meta = el("dl", "plan__meta");
    [["Lead", p.lead], ["First move by", p.first], ["Team hours", p.hours.toLocaleString("en-US")], ["Cost", DB.money(o.cost)]].forEach(function (m) {
      var d = el("div"); d.appendChild(el("dt", null, m[0])); d.appendChild(el("dd", null, m[1])); meta.appendChild(d);
    });
    top.appendChild(meta);
    var send = el("button", "btn btn--primary btn--sm", "Send to workflows");
    send.type = "button";
    send.addEventListener("click", function () { DB.toast(p.steps.length + " tasks sent to workflows for " + p.lead + " to staff."); });
    top.appendChild(send);
    panel.appendChild(top);

    // gantt: a week grid with one row per step
    var g = el("div", "gantt");
    g.style.setProperty("--weeks", WEEKS.length);
    var head = el("div", "gantt__row gantt__row--head");
    head.appendChild(el("span", "gantt__step", "Step"));
    var wk = el("div", "gantt__track");
    WEEKS.forEach(function (w) { wk.appendChild(el("span", "gantt__wk", w)); });
    head.appendChild(wk);
    g.appendChild(head);
    p.steps.forEach(function (s) {
      var r = el("div", "gantt__row");
      var name = el("span", "gantt__step", s[0]);
      name.appendChild(el("small", null, s[1]));
      r.appendChild(name);
      var tr = el("div", "gantt__track");
      var bar = el("span", "gantt__bar");
      bar.style.setProperty("--s", s[2]); bar.style.setProperty("--l", s[3]);
      bar.title = s[0] + ": week of " + WEEKS[s[2]] + ", " + s[3] + (s[3] === 1 ? " week" : " weeks");
      tr.appendChild(bar);
      r.appendChild(tr);
      g.appendChild(r);
    });
    var mr = el("div", "gantt__row gantt__row--marks");
    mr.appendChild(el("span", "gantt__step", "Decision points"));
    var mt = el("div", "gantt__track");
    p.marks.forEach(function (m) {
      var d = el("span", "gantt__mark" + (m[0] >= WEEKS.length - 2 ? " is-end" : ""));
      d.style.setProperty("--s", m[0]);
      d.appendChild(el("i"));
      d.appendChild(el("em", null, m[1]));
      mt.appendChild(d);
    });
    mr.appendChild(mt);
    g.appendChild(mr);
    var wrap = el("div", "gantt__wrap");
    wrap.appendChild(g);
    panel.appendChild(wrap);

    var trips = el("div", "trips");
    trips.appendChild(el("h3", "card__title", "Tripwires"));
    var ul = el("ul", "trips__list");
    p.trips.forEach(function (x) {
      var li = el("li");
      li.appendChild(el("b", null, "If " + x[0]));
      li.appendChild(el("span", null, x[1].charAt(0).toUpperCase() + x[1].slice(1) + "."));
      ul.appendChild(li);
    });
    trips.appendChild(ul);
    panel.appendChild(trips);
  }
  showPlan("resin", false);

  /* ---------- related questions: white bubbles that open the ask page ---------- */
  var asks = $("#asks");
  ASKS.forEach(function (a) {
    var li = el("li");
    var link = el("a", "ask-q");
    link.href = "ask.html?q=" + encodeURIComponent(a[1]);
    link.appendChild(el("span", "ask-q__kind", a[0]));
    link.appendChild(el("span", "ask-q__text", a[1]));
    li.appendChild(link);
    asks.appendChild(li);
  });

  /* ---------- trendlines: weekly from July 13; index 12 is this week ---------- */
  var TRENDS = {
    sdn: { vals: [6, 4, 7, 5, 8, 6, 9, 12, 11, 15, 19, 22, 27], fmt: function (v) { return String(Math.round(v)); }, min: 0, max: 30, ticks: [0, 15, 30] },
    senate: { vals: [18, 18, 19, 21, 22, 22, 24, 27, 31, 36, 41, 47, 52], fmt: function (v) { return String(Math.round(v)); }, min: 0, max: 60, ticks: [0, 30, 60] },
    brent: { vals: [78, 79, 77, 80, 82, 81, 84, 85, 87, 88, 91, 92, 93], fmt: function (v) { return "$" + Math.round(v); }, min: 70, max: 100, ticks: [70, 85, 100] }
  };
  var DATES = ["Jul 13", "Jul 20", "Jul 27", "Aug 3", "Aug 10", "Aug 17", "Aug 24", "Aug 31", "Sep 7", "Sep 14", "Sep 21", "Sep 28", "this week"];
  var EVENT = 11 + 1 / 7; // September 29, a day after the Sep 28 point
  var NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function draw(fig) {
    var d = TRENDS[fig.dataset.trend], host = $(".trend__plot", fig);
    var W = Math.max(240, host.clientWidth), H = 150, L = 34, R = 10, T = 12, B = 22, n = d.vals.length;
    var x = function (i) { return L + (W - L - R) * i / (n - 1); };
    var y = function (v) { return T + (H - T - B) * (1 - (v - d.min) / (d.max - d.min)); };
    host.innerHTML = "";
    $(".trend__now", fig).textContent = d.fmt(d.vals[n - 1]);
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img",
      "aria-label": $(".trend__name", fig).textContent + ", weekly from July 13: " + d.vals.map(d.fmt).join(", ") });
    d.ticks.forEach(function (v) {
      s.appendChild(svg("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), class: "trend__grid" }));
      var tx = svg("text", { x: L - 6, y: y(v) + 3.5, class: "trend__tick", "text-anchor": "end" });
      tx.textContent = d.fmt(v); s.appendChild(tx);
    });
    [0, 4, 8, 12].forEach(function (i) {
      var tx = svg("text", { x: x(i), y: H - 6, class: "trend__tick", "text-anchor": i === 0 ? "start" : i === 12 ? "end" : "middle" });
      tx.textContent = i === 12 ? "Today" : DATES[i]; s.appendChild(tx);
    });
    var ex = L + (W - L - R) * EVENT / (n - 1);
    s.appendChild(svg("line", { x1: ex, x2: ex, y1: T - 4, y2: H - B, class: "trend__event" }));
    var pts = d.vals.map(function (v, i) { return x(i).toFixed(1) + " " + y(v).toFixed(1); });
    s.appendChild(svg("path", { d: "M" + pts.join(" L") + " L" + x(n - 1) + " " + (H - B) + " L" + L + " " + (H - B) + "Z", class: "trend__area" }));
    s.appendChild(svg("path", { d: "M" + pts.join(" L"), class: "trend__line", pathLength: 1 }));
    s.appendChild(svg("circle", { cx: x(n - 1), cy: y(d.vals[n - 1]), r: 4, class: "trend__dot" }));
    var hair = svg("line", { y1: T - 4, y2: H - B, class: "trend__hair" }), hdot = svg("circle", { r: 4.5, class: "trend__dot" });
    var hov = svg("g", { class: "trend__hov" });
    hov.appendChild(hair); hov.appendChild(hdot); s.appendChild(hov);
    var tip = el("div", "trend__tip");
    host.appendChild(s); host.appendChild(tip);
    function at(clientX) {
      var r = s.getBoundingClientRect();
      var i = Math.round((clientX - r.left - L * r.width / W) / ((W - L - R) * r.width / W) * (n - 1));
      i = Math.max(0, Math.min(n - 1, i));
      hair.setAttribute("x1", x(i)); hair.setAttribute("x2", x(i));
      hdot.setAttribute("cx", x(i)); hdot.setAttribute("cy", y(d.vals[i]));
      tip.innerHTML = "";
      tip.appendChild(el("span", null, i === 12 ? "This week" : "Week of " + DATES[i]));
      tip.appendChild(el("b", null, d.fmt(d.vals[i])));
      tip.style.left = (x(i) / W * 100) + "%"; tip.style.top = (y(d.vals[i]) / H * 100) + "%";
      tip.classList.toggle("is-left", i > n / 2);
      host.classList.add("is-hover");
    }
    s.addEventListener("pointermove", function (e) { at(e.clientX); });
    s.addEventListener("pointerdown", function (e) { at(e.clientX); });
    s.addEventListener("pointerleave", function () { host.classList.remove("is-hover"); });
  }
  var figs = $$("[data-trend]");
  figs.forEach(draw);
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { figs.forEach(draw); }, 120); });

  // figures make their entrance the first time they scroll into view
  Reveal(".spark, .bl__money, .stakes, .fall, .trend, #plan");
})();
