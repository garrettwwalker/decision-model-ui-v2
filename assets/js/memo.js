/* Sample memo: a strategic options memo answering "How should we respond to the potential of new
   sanctions by the Trump Administration?" Written on Wed 7 Oct, the day after the brief.
   Money in $M, expected over 12 months at the 41% forecast. Every figure is illustrative.
   If sanctions land, $62M is at risk: resin 24, Dubai re-export sales 18, penalty exposure 11,
   feeders and freight 5, Gebze banking 4. */
(function () {
  var P = 0.41;

  var INTERESTS = [
    { id: "growth", who: "CEO", what: "Keep the MENA growth story", why: "MENA is 11% of revenue and the fastest-growing region; the board expects the Dubai hub to carry it." },
    { id: "legal", who: "General Counsel", what: "No sanctions breach, ever", why: "US liability is strict for a US-listed parent, and a penalty would trip two lender covenants." },
    { id: "plants", who: "COO", what: "Keep Gebze and Pune running", why: "Gebze holds 9 days of resin. A line-stop costs about $1.1M a day in lost output." },
    { id: "cash", who: "Group Treasurer", what: "Keep dollar payments flowing", why: "Gebze settles through a Turkish lender with an Iran history; losing it would freeze payroll and supplier runs." },
    { id: "accounts", who: "GM MENA", what: "Keep key accounts and traders", why: "Three Dubai traders move 14% of MENA volume, some of it on to buyers we can't see." }
  ];

  // fit: yes / mixed / no for each interest, in INTERESTS order
  var OPTIONS = [
    { id: "watch", n: 1, title: "Watch and set tripwires", line: "Change nothing yet. Set the Daybreak engine to watch four signposts and draft, but don't send, the exit letters.",
      cost: 0.1, protects: 0, fit: ["yes", "no", "no", "mixed", "yes"],
      pros: ["Costs almost nothing and keeps every supplier and trader", "Nothing to unwind if the talks restart"],
      cons: ["A 30-day window is too short to qualify new resin, which takes 6 to 8 weeks", "If a trader is named before we act, the shipment is already a breach"] },
    { id: "tighten", n: 2, title: "Tighten compliance now", line: "Re-screen every MENA counterparty, demand end-use certificates from the Dubai traders, pause any that won't sign, and swap the two exposed feeders.",
      cost: 3.5, costNote: "incl. $2.1M of margin given up", protects: 16 * P, fit: ["mixed", "yes", "mixed", "yes", "no"], tag: "at the first tripwire",
      pros: ["Removes nearly all penalty exposure", "Shows banks and auditors we moved early", "Cheap to reverse if nothing comes"],
      cons: ["Gives up about $2.1M of margin a year even if nothing happens", "Strains the traders behind 14% of MENA volume; rivals may take them"] },
    { id: "resin", n: 3, title: "Re-source resin before any rule", line: "Qualify two Singapore grades and one Korean grade at Gebze and move 40% of its volume off the Gulf by December. Builds on Tuesday's Singapore bridge-buy.",
      cost: 2.6, protects: 24 * 0.8 * P, fit: ["yes", "yes", "yes", "mixed", "mixed"], tag: "start now", pick: true,
      pros: ["Protects the most value", "Also cuts the Hormuz exposure in this week's brief", "Qualification is reusable for any future supply shock"],
      cons: ["About $35/t more for at least two quarters", "Ties up Gebze's QA team for 6 weeks", "Gulf suppliers may shrink our allocation"] },
    { id: "engage", n: 4, title: "Engage Washington and the banks", line: "Through the trade association, ask Treasury for wind-down guidance. Pre-clear payment routes with two banks and open a second settlement account for Gebze.",
      cost: 0.4, protects: 4 * P, fit: ["yes", "mixed", "mixed", "yes", "mixed"], tag: "start now", pick: true,
      pros: ["Cheap, and may buy a longer wind-down", "Keeps Gebze's payroll and supplier runs safe"],
      cons: ["The outcome is outside our control", "Visible lobbying on Iran carries some reputational risk", "Does nothing for resin"] }
  ];

  var WEEKS = ["7 Oct", "12 Oct", "19 Oct", "26 Oct", "2 Nov", "9 Nov", "16 Nov", "23 Nov", "30 Nov", "7 Dec"];

  // steps: [what, owner, start week, length in weeks]; marks: [week, label]; trips: [when, then]
  var PLANS = {
    watch: {
      lead: "Risk office", hours: 60, first: "Thu 8 Oct",
      steps: [
        ["Set tripwires on four signposts in ByNine", "Risk office", 0, 1],
        ["Weekly sanctions read-out to the exec team", "Risk office", 0, 10],
        ["Draft exit letters for suppliers and traders", "Legal", 1, 2],
        ["Keep non-Gulf resin samples on file", "Procurement", 2, 2]
      ],
      marks: [[4, "Exec review of the forecast"], [9, "Forecast horizon, 6 Dec"]],
      trips: [["Senate bill passes the floor", "move to option 2 the same week"], ["Chance rises above 55%", "start option 3 at once"], ["Any counterparty is named", "stop shipments that day and send the drafted letters"]]
    },
    tighten: {
      lead: "General Counsel", hours: 420, first: "Mon 12 Oct",
      steps: [
        ["Re-screen all MENA counterparties, ownership included", "Compliance", 0, 2],
        ["Ask the three Dubai traders for end-use certificates", "GM MENA, Legal", 1, 3],
        ["Swap the two feeders that share a manager with named ships", "VP Logistics", 1, 3],
        ["Pause shipments to traders that won't certify", "GM MENA", 4, 6],
        ["Brief the banks and auditors on what changed", "Group Treasurer", 4, 1]
      ],
      marks: [[3, "Certificates due"], [5, "Audit committee"]],
      trips: [["A trader refuses to certify", "pause it and offer its volume to the GCC key accounts"], ["Talks resume with a date", "keep the screening, lift the pauses"]]
    },
    resin: {
      lead: "VP Procurement", hours: 680, first: "Fri 9 Oct",
      steps: [
        ["Order samples: two Singapore grades, one Korean", "Procurement", 0, 1],
        ["Line trials and QA sign-off at Gebze", "Gebze QA", 1, 6],
        ["Frame contracts for 40% of Gebze volume", "Procurement", 4, 3],
        ["Agree a smaller Gulf allocation without breaching terms", "Legal", 5, 2],
        ["First non-Gulf deliveries reach Gebze", "VP Logistics", 7, 3]
      ],
      marks: [[1, "Samples land"], [7, "QA sign-off"], [9, "40% off the Gulf"]],
      trips: [["A Gulf polymer maker is named", "lift the shift to 70% on spot cargoes"], ["Hormuz closes", "the brief's bridge-buy and this plan merge"]]
    },
    engage: {
      lead: "Group Treasurer", hours: 190, first: "Thu 8 Oct",
      steps: [
        ["Brief the trade association's sanctions group", "General Counsel", 0, 1],
        ["Pre-clear payment routes with two banks", "Group Treasurer", 0, 3],
        ["Joint letter to Treasury asking for wind-down guidance", "Trade association", 1, 2],
        ["Open a second settlement account for Gebze", "Group Treasurer", 2, 4],
        ["Prepare investor questions and answers", "Investor relations", 3, 1]
      ],
      marks: [[3, "Letter sent"], [6, "Second account live"]],
      trips: [["Guidance gives under 30 days", "start option 2 at once"], ["The Turkish lender is named", "move all Gebze payments to the new account"]]
    }
  };

  var ASKS = [
    ["what-if", "What happens to Gebze if both Gulf resin suppliers are named on the same day?"],
    ["forecast", "Would new sanctions make a Hormuz closure more likely?"],
    ["capacity", "How long can Gebze run on Singapore resin alone?"],
    ["exposure", "Which of our customers buy through the three Dubai traders?"],
    ["opportunity", "Which competitors rely on the same Gulf suppliers?"],
    ["forecast", "Will India change its oil buying in a way that reaches Pune?"]
  ];

  // weekly series from 13 Jul; index 12 is this week (5 Oct)
  var TRENDS = {
    p: { vals: [19, 20, 22, 21, 22, 22, 23, 26, 29, 31, 34, 38, 41], fmt: function (v) { return v + "%"; }, min: 0, max: 50, ticks: [0, 25, 50], color: "var(--loss)" },
    sdn: { vals: [6, 4, 7, 5, 8, 6, 9, 12, 11, 15, 19, 22, 27], fmt: function (v) { return String(v); }, min: 0, max: 30, ticks: [0, 15, 30], color: "var(--ink)" },
    brent: { vals: [78, 79, 77, 80, 82, 81, 84, 85, 87, 88, 91, 92, 93], fmt: function (v) { return "$" + v; }, min: 70, max: 100, ticks: [70, 85, 100], color: "var(--ink)" }
  };
  var DATES = ["13 Jul", "20 Jul", "27 Jul", "3 Aug", "10 Aug", "17 Aug", "24 Aug", "31 Aug", "7 Sep", "14 Sep", "21 Sep", "28 Sep", "this week"];
  var EVENT = 11 + 1 / 7; // 29 Sep, a day after the 28 Sep point

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  var FIT_WORD = { yes: "serves it", mixed: "partly", no: "works against it" };

  /* ---------- Interests ---------- */
  var ilist = document.getElementById("interests-list");
  INTERESTS.forEach(function (it) {
    var li = el("li", "note interest");
    li.appendChild(el("p", "interest__who", it.who));
    li.appendChild(el("h3", "interest__what", it.what));
    li.appendChild(el("p", "interest__why", it.why));
    ilist.appendChild(li);
  });

  /* ---------- Options ---------- */
  var KEY = "daybreak.memo.choice";
  var chosen = {};
  try { chosen = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
  var olist = document.getElementById("options-list");
  OPTIONS.forEach(function (o) {
    var c = el("article", "note option" + (o.pick ? " is-pick" : ""));
    c.id = "opt-" + o.id;
    var head = el("div", "option__head");
    head.appendChild(el("span", "option__n", String(o.n)));
    if (o.tag) head.appendChild(el("span", "pill " + (o.pick ? "pill--safe" : "pill--warn"), "Daybreak's read: " + o.tag));
    c.appendChild(head);
    c.appendChild(el("h3", "option__title", o.title));
    c.appendChild(el("p", "option__line", o.line));

    var nums = el("dl", "option__nums");
    function num(label, val, cls, sub) {
      var d = el("div"); d.appendChild(el("dt", null, label));
      var dd = el("dd", "money" + (cls ? " " + cls : ""), val);
      if (sub) dd.appendChild(el("small", null, sub));
      d.appendChild(dd); nums.appendChild(d);
    }
    num("costs", DB.money(o.cost), null, o.costNote);
    num("protects", o.protects ? DB.money(o.protects) : "$0", o.protects ? "money--safe" : null);
    var net = o.protects - o.cost;
    num("net", (net < 0 ? "−" : "") + DB.money(Math.abs(net)), net > 0 ? "money--safe" : "money--loss");
    c.appendChild(nums);

    var pc = el("div", "option__pc");
    [["pros", o.pros, "pro"], ["cons", o.cons, "con"]].forEach(function (g) {
      var col = el("div");
      col.appendChild(el("p", "option__pclabel", g[0] === "pros" ? "For" : "Against"));
      var ul = el("ul", "option__list option__list--" + g[2]);
      g[1].forEach(function (t) { ul.appendChild(el("li", null, t)); });
      col.appendChild(ul); pc.appendChild(col);
    });
    c.appendChild(pc);

    var act = el("div", "option__act");
    var pick = el("button", "btn btn--primary btn--sm", "Choose");
    pick.type = "button";
    pick.setAttribute("aria-pressed", "false");
    function paint() {
      var on = !!chosen[o.id];
      c.classList.toggle("is-chosen", on);
      pick.textContent = on ? "Chosen" : "Choose";
      pick.setAttribute("aria-pressed", String(on));
    }
    pick.addEventListener("click", function () {
      chosen[o.id] = !chosen[o.id];
      try { localStorage.setItem(KEY, JSON.stringify(chosen)); } catch (e) {}
      paint();
      if (chosen[o.id]) DB.toast("Option " + o.n + " chosen. " + PLANS[o.id].lead + " is told to start by " + PLANS[o.id].first + ".");
    });
    var see = el("button", "btn btn--ghost btn--sm", "See the plan");
    see.type = "button";
    see.addEventListener("click", function () {
      showPlan(o.id, true);
      document.getElementById("plans").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
    act.appendChild(pick); act.appendChild(see);
    c.appendChild(act);
    paint();
    olist.appendChild(c);
  });

  /* ---------- Fit matrix ---------- */
  var t = document.getElementById("fit-table");
  var thead = el("thead"), hr = el("tr");
  hr.appendChild(el("th", null, "Interest"));
  OPTIONS.forEach(function (o) { var th = el("th", "c", o.n + ". " + o.title); th.scope = "col"; hr.appendChild(th); });
  thead.appendChild(hr); t.appendChild(thead);
  var tb = el("tbody");
  INTERESTS.forEach(function (it, i) {
    var tr = el("tr");
    var th = el("th", null); th.scope = "row";
    th.appendChild(document.createTextNode(it.what));
    th.appendChild(el("span", "table__sub", it.who));
    tr.appendChild(th);
    OPTIONS.forEach(function (o) {
      var td = el("td", "c");
      var f = o.fit[i];
      td.appendChild(el("i", "fit__dot fit__dot--" + f));
      td.appendChild(el("span", "sr-only", FIT_WORD[f]));
      td.title = it.what + ": " + FIT_WORD[f];
      tr.appendChild(td);
    });
    tb.appendChild(tr);
  });
  t.appendChild(tb);

  /* ---------- Plans ---------- */
  var tabs = document.getElementById("plan-tabs"), panel = document.getElementById("plan");
  var tabEls = {};
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
    panel.setAttribute("aria-labelledby", "tab-" + id);
    panel.innerHTML = "";
    if (user) { panel.classList.remove("is-in"); void panel.offsetWidth; panel.classList.add("is-in"); }

    var top = el("div", "plan__top");
    var meta = el("dl", "plan__meta");
    [["lead", p.lead], ["first move by", p.first], ["team hours", p.hours.toLocaleString("en-US")], ["cost", DB.money(o.cost)]].forEach(function (m) {
      var d = el("div"); d.appendChild(el("dt", null, m[0])); d.appendChild(el("dd", null, m[1])); meta.appendChild(d);
    });
    top.appendChild(meta);
    var send = el("button", "btn btn--ink btn--sm", "Send to workflows");
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
    trips.appendChild(el("h3", "panel__title", "Tripwires"));
    var ul = el("ul", "trips__list");
    p.trips.forEach(function (x) {
      var li = el("li");
      li.appendChild(el("b", null, "If " + x[0].charAt(0).toLowerCase() + x[0].slice(1)));
      li.appendChild(el("span", null, x[1].charAt(0).toUpperCase() + x[1].slice(1) + "."));
      ul.appendChild(li);
    });
    trips.appendChild(ul);
    panel.appendChild(trips);
  }
  showPlan("resin", false);

  /* ---------- Related questions ---------- */
  var asks = document.getElementById("asks");
  ASKS.forEach(function (a, i) {
    var li = el("li", "ask-q");
    var link = el("a", "ask-q__a");
    link.href = "ask.html?q=" + encodeURIComponent(a[1]);
    link.appendChild(el("span", "ask-q__kind", a[0]));
    link.appendChild(el("span", "ask-q__text", a[1]));
    li.appendChild(link);
    asks.appendChild(li);
  });

  /* ---------- Trendlines: one series each, crosshair and readout on hover ---------- */
  var NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function draw(fig) {
    var d = TRENDS[fig.getAttribute("data-trend")];
    var host = fig.querySelector(".trend__plot");
    var W = Math.max(240, host.clientWidth), H = 150;
    var L = 30, R = 10, T = 12, B = 22;
    var n = d.vals.length;
    var x = function (i) { return L + (W - L - R) * i / (n - 1); };
    var y = function (v) { return T + (H - T - B) * (1 - (v - d.min) / (d.max - d.min)); };
    host.innerHTML = "";
    fig.querySelector(".trend__now").textContent = d.fmt(d.vals[n - 1]);
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img",
      "aria-label": fig.querySelector(".trend__name").textContent + ", weekly from 13 July: " + d.vals.map(d.fmt).join(", ") });
    d.ticks.forEach(function (v) {
      s.appendChild(svg("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), class: "trend__grid" }));
      var tx = svg("text", { x: L - 6, y: y(v) + 3.5, class: "trend__tick", "text-anchor": "end" });
      tx.textContent = d.fmt(v); s.appendChild(tx);
    });
    [0, 4, 8, 12].forEach(function (i) {
      var tx = svg("text", { x: x(i), y: H - 6, class: "trend__tick", "text-anchor": i === 0 ? "start" : i === 12 ? "end" : "middle" });
      tx.textContent = i === 12 ? "today" : DATES[i]; s.appendChild(tx);
    });
    var ex = L + (W - L - R) * EVENT / (n - 1);
    s.appendChild(svg("line", { x1: ex, x2: ex, y1: T - 4, y2: H - B, class: "trend__event" }));
    var pts = d.vals.map(function (v, i) { return x(i).toFixed(1) + " " + y(v).toFixed(1); });
    s.appendChild(svg("path", { d: "M" + pts.join(" L") + " L" + x(n - 1) + " " + (H - B) + " L" + L + " " + (H - B) + "Z", class: "trend__area", style: "fill:" + d.color }));
    s.appendChild(svg("path", { d: "M" + pts.join(" L"), class: "trend__line", style: "stroke:" + d.color }));
    s.appendChild(svg("circle", { cx: x(n - 1), cy: y(d.vals[n - 1]), r: 4, class: "trend__dot", style: "fill:" + d.color }));

    var hair = svg("line", { y1: T - 4, y2: H - B, class: "trend__hair" });
    var hdot = svg("circle", { r: 4.5, class: "trend__dot", style: "fill:" + d.color });
    var hov = svg("g", { class: "trend__hov" });
    hov.appendChild(hair); hov.appendChild(hdot);
    s.appendChild(hov);
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
      tip.style.left = (x(i) / W * 100) + "%";
      tip.style.top = (y(d.vals[i]) / H * 100) + "%";
      tip.classList.toggle("is-left", i > n / 2);
      host.classList.add("is-hover");
    }
    s.addEventListener("pointermove", function (e) { at(e.clientX); });
    s.addEventListener("pointerdown", function (e) { at(e.clientX); });
    s.addEventListener("pointerleave", function () { host.classList.remove("is-hover"); });
  }
  var figs = document.querySelectorAll("[data-trend]");
  function drawAll() { figs.forEach(draw); }
  drawAll();
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(drawAll, 120); });
})();
