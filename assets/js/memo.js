/* Sample memo: a strategic options memo answering "How should we respond to the potential of new
   sanctions by the Trump Administration?" Written on Wed Oct 7, the day after the brief. A deep dive rather than a
   brief (rebuilt 2026-11-07 at the user's request): four paths the question could take and how each would reach
   Halvorsen, the drivers, how the forecast was built (the three engines and the declined part), the counterparty
   network, the loss curve, the responses that hold up in every path, the plans, the openings, and the models, sources,
   and agents behind it. Choosing a path anywhere follows it through the page. Money in $M over 12 months; every figure
   is illustrative. The two sanctions paths make up the 41%; if sanctions land, $62M is at risk on average across them. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }

  // the four paths; loss is what each would cost us over a year, by interest (plants, clear, growth, freight, cash)
  var PATHS = [
    { id: "a", name: "Targeted Widening", short: "Targeted widening", p: 26, sanctions: true,
      line: "Treasury extends secondary sanctions to foreign buyers of Iranian petrochemicals under the authority it already has, with a 30-day wind-down. Shipping and banks are mostly left alone.",
      signs: [["Treasury signals “maximum pressure” in three speeches", 1], ["A Gulf polymer maker is named in a designation", 0], ["The November 1 waivers lapse without renewal", 0]],
      unfold: [["Late October", "Treasury briefs allies on a rule for buyers"], ["November", "The rule is announced, and a 30-day wind-down starts"], ["December", "Our two Gulf suppliers must prove clean feedstock or lose buyers with US ties"], ["Early 2027", "Gulf resin prices rise 12 to 18%"]],
      loss: { plants: 22, clear: 8, growth: 14, freight: 0, cash: 0 },
      reach: "Two chains break: resin from the Gulf suppliers, and sales through the Dubai traders.",
      best: "Re-source resin now. In this path it’s the difference between paying more for resin and stopping a line." },
    { id: "b", name: "Sweeping Package", short: "Sweeping package", p: 15, sanctions: true,
      line: "The Senate bill passes and is signed, reaching the shipping, insurers, and banks that serve Iranian trade. The wind-down could be as short as two weeks.",
      signs: [["The bill clears committee", 1], ["A majority of senators back it", 1], ["Leadership schedules a floor vote", 0]],
      unfold: [["November", "A floor vote, then signing"], ["November and December", "Banks drop clients with Iran exposure, and insurers withdraw cover"], ["December", "Gebze’s Turkish lender restricts dollar payments"], ["Early 2027", "Gulf freight and resin are both scarce"]],
      loss: { plants: 32, clear: 18, growth: 27, freight: 8, cash: 8 },
      reach: "Every chain breaks, including the feeders and Gebze’s payments.",
      best: "Everything in the suggested path, plus tightening compliance the week a floor vote is scheduled." },
    { id: "c", name: "Pressure Without New Sanctions", short: "Pressure, no new rules", p: 38, sanctions: false,
      line: "No new rules, but Treasury keeps naming ships, firms, and managers under today’s authority. The risk is being caught by association.",
      signs: [["Designations up threefold since August", 1], ["Ship-to-ship transfers off Fujairah rising", 1], ["No new rule by December 6", 0]],
      unfold: [["October to December", "Weekly designations stay above 20"], ["November", "The technical manager behind two of our feeders may be named"], ["Early 2027", "Screening counterparties becomes routine"]],
      loss: { plants: 0, clear: 0, growth: 0, freight: 0.8, cash: 0 },
      reach: "Only the feeder chain is at risk, through the technical manager we share with named tankers.",
      best: "Swap the two exposed feeders. It’s cheap and ends the only real exposure here." },
    { id: "d", name: "Talks Restart", short: "Talks restart", p: 21, sanctions: false,
      line: "Muscat sets a second round, the waivers are renewed unchanged, and pressure eases into the new year.",
      signs: [["European partners push to keep talking", 1], ["Muscat sets a date for a second round", 0], ["The November 1 waivers are renewed unchanged", 0]],
      unfold: [["November", "A second round in Muscat"], ["December", "Designations fall back to summer levels"], ["Early 2027", "The risk returns if the talks stall again"]],
      loss: { plants: 0, clear: 0, growth: 0, freight: 0, cash: 0 },
      reach: "Nothing breaks. Every chain still runs, though none of them goes away.",
      best: "Keep the resin qualification going. It still covers the Hormuz exposure." }
  ];
  var BYP = {};
  PATHS.forEach(function (p) { BYP[p.id] = p; });
  var path = "a";

  // the responses: what each is worth net of its cost in each path ($M); plans below use n, title, and cost
  var OPTIONS = [
    { id: "resin", n: 1, title: "Re-source resin before sanctions arrive", cost: 2.6, v: { a: 18.0, b: 26.0, c: 0.4, d: 0.4 } },
    { id: "engage", n: 2, title: "Engage Washington and the banks", cost: 0.4, v: { a: 1.6, b: 10.6, c: 0.1, d: 0.1 } },
    { id: "tighten", n: 3, title: "Tighten compliance now", cost: 3.5, v: { a: 11.5, b: 28.5, c: -2.7, d: -3.5 } },
    { id: "watch", n: 4, title: "Watch and set tripwires", cost: 0.1, v: { a: 0.9, b: 1.9, c: -0.1, d: -0.1 } }
  ];

  var WEEKS = ["Oct 7", "Oct 12", "Oct 19", "Oct 26", "Nov 2", "Nov 9", "Nov 16", "Nov 23", "Nov 30", "Dec 7"];

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

  function signed(v) { return (v < 0 ? "−" : "+") + Math.abs(v).toFixed(1); }
  function lossOf(p) { var t = 0; for (var k in p.loss) t += p.loss[k]; return t; }

  /* ---------- path tracks: a cream track with a white pill, one per section that follows the path, all in step ---------- */
  var tracks = [];
  function makeTrack(host) {
    host.classList.add("sw");
    var pill = el("span", "sw__pill"); pill.setAttribute("aria-hidden", "true"); host.appendChild(pill);
    PATHS.forEach(function (p) {
      var b = el("button", null, p.short);
      b.type = "button"; b.dataset.path = p.id;
      b.addEventListener("click", function () { setPath(p.id); });
      host.appendChild(b);
    });
    tracks.push({ host: host, pill: pill });
    requestAnimationFrame(function () { requestAnimationFrame(function () { host.classList.add("is-ready"); }); });
  }
  function placeTracks() {
    tracks.forEach(function (t) {
      var b = $('[data-path="' + path + '"]', t.host);
      $$("button", t.host).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      if (!b.offsetWidth) return;
      t.pill.style.width = b.offsetWidth + "px"; t.pill.style.transform = "translateX(" + (b.offsetLeft - 4) + "px)";
    });
  }
  var pathsTrack = el("div"); pathsTrack.setAttribute("role", "group"); pathsTrack.setAttribute("aria-label", "Choose a path");
  var pathsBar = el("div", "paths__bar"); pathsBar.appendChild(pathsTrack);
  $(".paths").parentNode.insertBefore(pathsBar, $(".paths"));
  makeTrack(pathsTrack);
  makeTrack($("[data-paths]"));

  function setPath(id) {
    path = id;
    placeTracks();
    drawPath();
    paintMix();
    paintNet();
    paintRob();
  }

  /* ---------- how the paths have shifted: stacked shares, the sanctions paths at the foot ---------- */
  var P13 = [19, 20, 22, 21, 22, 22, 23, 26, 29, 31, 34, 38, 41];
  var D13 = [40, 40, 39, 40, 39, 38, 37, 34, 31, 29, 26, 22, 21];
  var MIX = P13.map(function (s, i) {
    var b = Math.round(s * (0.3 + 0.066 * i / 12)), d = D13[i];
    return { b: b, a: s - b, c: 100 - s - d, d: d };
  });
  var ORDER = ["b", "a", "c", "d"]; // bottom to top
  var DATES = ["Jul 13", "Jul 20", "Jul 27", "Aug 3", "Aug 10", "Aug 17", "Aug 24", "Aug 31", "Sep 7", "Sep 14", "Sep 21", "Sep 28", "this week"];
  var EVENT = 11 + 1 / 7; // September 29, a day after the Sep 28 point
  var mixHost = $("#mix"), mixAreas = {};
  function drawMix() {
    var W = Math.max(300, mixHost.clientWidth), H = 230, L = 34, R = 66, T = 8, B = 22, n = MIX.length;
    var x = function (i) { return L + (W - L - R) * i / (n - 1); };
    var y = function (v) { return T + (H - T - B) * (1 - v / 100); };
    mixHost.innerHTML = "";
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img",
      "aria-label": "Chances of the four paths, weekly since July 13. Today: targeted widening 26%, sweeping package 15%, pressure without new sanctions 38%, talks restart 21%." });
    [0, 50, 100].forEach(function (v) {
      var tx = svg("text", { x: L - 6, y: y(v) + 3.5, class: "trend__tick", "text-anchor": "end" });
      tx.textContent = v + "%"; s.appendChild(tx);
    });
    [0, 4, 8, 12].forEach(function (i) {
      var tx = svg("text", { x: x(i), y: H - 6, class: "trend__tick", "text-anchor": i === 0 ? "start" : i === 12 ? "end" : "middle" });
      tx.textContent = i === 12 ? "Today" : DATES[i]; s.appendChild(tx);
    });
    var base = MIX.map(function () { return 0; });
    ORDER.forEach(function (id) {
      var top = MIX.map(function (m, i) { return base[i] + m[id]; });
      var d = "M" + top.map(function (v, i) { return x(i).toFixed(1) + " " + y(v).toFixed(1); }).join(" L");
      for (var i = n - 1; i >= 0; i--) d += " L" + x(i).toFixed(1) + " " + y(base[i]).toFixed(1);
      var a = svg("path", { d: d + "Z", class: "mix__area mix__area--" + id });
      a.addEventListener("click", function () { setPath(id); });
      s.appendChild(a); mixAreas[id] = a;
      var mid = (base[n - 1] + top[n - 1]) / 2;
      var lab = svg("text", { x: W - R + 8, y: y(mid) + 4, class: "mix__lab mix__lab--" + id });
      lab.textContent = MIX[n - 1][id] + "%"; s.appendChild(lab); mixAreas[id + "lab"] = lab;
      base = top;
    });
    var ex = L + (W - L - R) * EVENT / (n - 1);
    s.appendChild(svg("line", { x1: ex, x2: ex, y1: T, y2: H - B, class: "trend__event" }));
    var hair = svg("line", { y1: T, y2: H - B, class: "mix__hair" });
    s.appendChild(hair);
    var tip = el("div", "trend__tip mix__tip");
    mixHost.appendChild(s); mixHost.appendChild(tip);
    function at(clientX) {
      var r = s.getBoundingClientRect();
      var i = Math.round((clientX - r.left - L * r.width / W) / ((W - L - R) * r.width / W) * (n - 1));
      i = Math.max(0, Math.min(n - 1, i));
      hair.setAttribute("x1", x(i)); hair.setAttribute("x2", x(i));
      tip.innerHTML = "";
      tip.appendChild(el("span", null, i === 12 ? "This week" : "Week of " + DATES[i]));
      PATHS.forEach(function (p) {
        var row = el("p", "mix__row" + (p.id === path ? " is-on" : ""));
        row.appendChild(el("i", "mix__sw mix__sw--" + p.id)); row.appendChild(document.createTextNode(p.short + " "));
        row.appendChild(el("b", null, MIX[i][p.id] + "%"));
        tip.appendChild(row);
      });
      tip.style.left = (x(i) / W * 100) + "%"; tip.style.top = "45%";
      tip.classList.toggle("is-left", i > n / 2);
      mixHost.classList.add("is-hover");
    }
    s.addEventListener("pointermove", function (e) { at(e.clientX); });
    s.addEventListener("pointerleave", function () { mixHost.classList.remove("is-hover"); });
    paintMix();
  }
  function paintMix() {
    PATHS.forEach(function (p) {
      if (!mixAreas[p.id]) return;
      mixAreas[p.id].classList.toggle("is-on", p.id === path);
      mixAreas[p.id + "lab"].classList.toggle("is-on", p.id === path);
    });
    mixHost.classList.add("has-pick");
  }

  /* ---------- the chosen path: what it is, its first signs, how it would unfold, what it costs us ---------- */
  var pathEl = $("#path");
  var INT_NAMES = { plants: "Gebze’s resin", clear: "Penalties", growth: "MENA sales", freight: "Freight", cash: "Payments" };
  function drawPath() {
    var p = BYP[path], total = lossOf(p);
    pathEl.innerHTML = "";
    var head = el("div", "path__head");
    var hl = el("div");
    hl.appendChild(el("span", "pill" + (p.sanctions ? " pill--red" : ""), p.sanctions ? "New sanctions" : "No new sanctions"));
    hl.appendChild(el("h3", "path__t", p.name));
    head.appendChild(hl);
    head.appendChild(el("p", "path__p", p.p + "%"));
    pathEl.appendChild(head);
    pathEl.appendChild(el("p", "path__line", p.line));

    var cols = el("div", "path__cols");
    var signs = el("div");
    signs.appendChild(el("p", "path__k", "First signs"));
    var ul = el("ul", "path__signs");
    p.signs.forEach(function (s) {
      var li = el("li");
      li.appendChild(el("span", null, s[0]));
      li.appendChild(el("span", "pill" + (s[1] ? " pill--red" : ""), s[1] ? "Seen" : "Not yet"));
      ul.appendChild(li);
    });
    signs.appendChild(ul);
    cols.appendChild(signs);
    var unfold = el("div");
    unfold.appendChild(el("p", "path__k", "How it would unfold"));
    var ol = el("ol", "path__steps");
    p.unfold.forEach(function (u) {
      var li = el("li"); li.appendChild(el("b", null, u[0])); li.appendChild(el("span", null, u[1])); ol.appendChild(li);
    });
    unfold.appendChild(ol);
    cols.appendChild(unfold);
    pathEl.appendChild(cols);

    var foot = el("div", "path__foot");
    var cost = el("div", "path__cost");
    cost.appendChild(el("p", "path__k", "What it would cost us"));
    cost.appendChild(el("p", "path__v" + (total ? " red" : ""), total ? DB.money(total, total % 1 ? 1 : 0) : "$0"));
    cost.appendChild(el("p", "path__sub", "over the next year if we change nothing"));
    foot.appendChild(cost);
    var best = el("div", "path__best");
    best.appendChild(el("p", "path__k", "What serves us best"));
    best.appendChild(el("p", null, p.best));
    foot.appendChild(best);
    pathEl.appendChild(foot);
    if (!REDUCE) { pathEl.classList.remove("is-swap"); void pathEl.offsetWidth; pathEl.classList.add("is-swap"); }
  }

  /* ---------- the counterparty network: Iranian links, who we deal with, what we stand to lose ---------- */
  var NODES = [
    { id: "jv", col: 0, t: "An Iranian petrochemical joint venture", s: "Not named yet" },
    { id: "buyers", col: 0, t: "Iran-linked buyers in the Gulf", s: "Some already named" },
    { id: "tankers", col: 0, t: "Tankers named in September", s: "Named" },
    { id: "banks", col: 0, t: "Iranian correspondent banks", s: "Named" },
    { id: "suppliers", col: 1, t: "Two Gulf resin suppliers", s: "Take feedstock from the joint venture, and supply 38% of Gebze’s resin" },
    { id: "traders", col: 1, t: "Three Dubai traders", s: "Move 14% of MENA volume, some of it on to Iran-linked buyers" },
    { id: "manager", col: 1, t: "A shared technical manager", s: "Runs the named tankers and two of our feeder ships" },
    { id: "lender", col: 1, t: "Gebze’s Turkish lender", s: "Settled an Iran case in 2019, and handles Gebze’s payroll and supplier runs" },
    { id: "plants", col: 2, t: "Keep Gebze running" },
    { id: "clear", col: 2, t: "Stay clear of a breach" },
    { id: "growth", col: 2, t: "Keep MENA growing" },
    { id: "freight", col: 2, t: "Keep freight moving" },
    { id: "cash", col: 2, t: "Keep payments flowing" }
  ];
  var EDGES = [["jv", "suppliers"], ["suppliers", "plants"], ["suppliers", "clear"], ["buyers", "traders"], ["traders", "clear"],
    ["traders", "growth"], ["tankers", "manager"], ["manager", "freight"], ["banks", "lender"], ["lender", "cash"]];
  var net = $("#net"), netSvg = $(".net__lines", net), nodeEls = {}, edgeEls = [];
  NODES.forEach(function (nd) {
    var c = el("div", "node node--c" + nd.col);
    c.appendChild(el("p", "node__t", nd.t));
    if (nd.col === 2) { var v = el("p", "node__v"); c.appendChild(v); nd.v = v; }
    else c.appendChild(el("p", "node__s", nd.s));
    $('[data-col="' + nd.col + '"]', net).appendChild(c);
    nodeEls[nd.id] = c;
  });
  function lit(e) {
    var p = BYP[path];
    if (p.loss[e[1]] != null) return p.loss[e[1]] > 0;
    return EDGES.some(function (f) { return f[0] === e[1] && p.loss[f[1]] > 0; });
  }
  function drawNet() {
    netSvg.innerHTML = ""; edgeEls = [];
    var r0 = net.getBoundingClientRect();
    netSvg.setAttribute("viewBox", "0 0 " + r0.width + " " + r0.height);
    EDGES.forEach(function (e) {
      var a = nodeEls[e[0]].getBoundingClientRect(), b = nodeEls[e[1]].getBoundingClientRect();
      var x1 = a.right - r0.left, y1 = a.top + a.height / 2 - r0.top, x2 = b.left - r0.left, y2 = b.top + b.height / 2 - r0.top, mx = (x1 + x2) / 2;
      var line = svg("path", { d: "M" + x1 + " " + y1 + " C" + mx + " " + y1 + " " + mx + " " + y2 + " " + x2 + " " + y2, class: "net__edge" });
      netSvg.appendChild(line); edgeEls.push(line);
    });
    paintNet();
  }
  function paintNet() {
    var p = BYP[path], on = {};
    EDGES.forEach(function (e, i) {
      var l = lit(e);
      if (edgeEls[i]) edgeEls[i].classList.toggle("is-on", l);
      if (l) { on[e[0]] = 1; on[e[1]] = 1; }
    });
    NODES.forEach(function (nd) {
      nodeEls[nd.id].classList.toggle("is-on", !!on[nd.id]);
      if (nd.v) {
        var v = p.loss[nd.id];
        nd.v.textContent = v ? DB.money(v, v % 1 ? 1 : 0) + " at risk" : "Nothing new at risk";
      }
    });
    $("#net-sum").textContent = p.name + ": " + p.reach;
  }

  /* ---------- how bad it could get: the chance the loss passes each amount ---------- */
  var CURVE = {
    xs: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 150],
    wait: [41, 40, 37, 33, 27, 20, 15, 13, 11, 8, 6, 3, 2, 1.5],
    plan: [41, 33, 24, 15, 12, 9, 6, 4, 3, 2, 1.4, 0.6, 0.3, 0.2]
  };
  var curveHost = $("#curve");
  function drawCurve() {
    var W = Math.max(300, curveHost.clientWidth), H = 220, L = 38, R = 12, T = 10, B = 24, n = CURVE.xs.length;
    var x = function (v) { return L + (W - L - R) * v / 150; };
    var y = function (v) { return T + (H - T - B) * (1 - v / 50); };
    curveHost.innerHTML = "";
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img",
      "aria-label": "Chance the loss passes each amount. If we wait: 33% above $30M, 15% above $60M, 6% above $100M. With Penumbra’s suggestions: 15%, 6%, and 1.4%." });
    [0, 25, 50].forEach(function (v) {
      s.appendChild(svg("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), class: "trend__grid" }));
      var tx = svg("text", { x: L - 6, y: y(v) + 3.5, class: "trend__tick", "text-anchor": "end" }); tx.textContent = v + "%"; s.appendChild(tx);
    });
    [0, 50, 100, 150].forEach(function (v) {
      var tx = svg("text", { x: x(v), y: H - 6, class: "trend__tick", "text-anchor": v === 0 ? "start" : v === 150 ? "end" : "middle" });
      tx.textContent = "$" + v + "M"; s.appendChild(tx);
    });
    ["wait", "plan"].forEach(function (k) {
      var d = "M" + CURVE.xs.map(function (v, i) { return x(v).toFixed(1) + " " + y(CURVE[k][i]).toFixed(1); }).join(" L");
      s.appendChild(svg("path", { d: d, class: "curve__line curve__line--" + k, pathLength: 1 }));
    });
    var hair = svg("line", { y1: T, y2: H - B, class: "trend__hair" });
    var hov = svg("g", { class: "trend__hov" }); hov.appendChild(hair); s.appendChild(hov);
    var tip = el("div", "trend__tip");
    curveHost.appendChild(s); curveHost.appendChild(tip);
    s.addEventListener("pointermove", function (e) {
      var r = s.getBoundingClientRect();
      var i = 0, best = 1e9, px = (e.clientX - r.left) * W / r.width;
      CURVE.xs.forEach(function (v, j) { var dd = Math.abs(x(v) - px); if (dd < best) { best = dd; i = j; } });
      hair.setAttribute("x1", x(CURVE.xs[i])); hair.setAttribute("x2", x(CURVE.xs[i]));
      tip.innerHTML = "";
      tip.appendChild(el("span", null, "Losing more than $" + CURVE.xs[i] + "M"));
      var a = el("p", "mix__row"); a.appendChild(document.createTextNode("If we wait ")); a.appendChild(el("b", null, CURVE.wait[i] + "%")); tip.appendChild(a);
      var b = el("p", "mix__row"); b.appendChild(document.createTextNode("With suggestions ")); b.appendChild(el("b", null, CURVE.plan[i] + "%")); tip.appendChild(b);
      tip.style.left = (x(CURVE.xs[i]) / W * 100) + "%"; tip.style.top = (y(CURVE.wait[i]) / H * 100) + "%";
      tip.classList.toggle("is-left", i > n / 2);
      curveHost.classList.add("is-hover");
    });
    s.addEventListener("pointerleave", function () { curveHost.classList.remove("is-hover"); });
  }

  /* ---------- what holds up in every path: each response's net value in each path; the chosen path's column lit ---------- */
  var rob = $("#rob");
  (function () {
    var thead = el("thead"), hr = el("tr");
    hr.appendChild(el("th", null, "Response"));
    PATHS.forEach(function (p) {
      var th = el("th", "r rob__path"); th.dataset.path = p.id; th.scope = "col";
      var b = el("button", null); b.type = "button";
      b.appendChild(el("span", null, p.short)); b.appendChild(el("small", null, p.p + "%"));
      b.addEventListener("click", function () { setPath(p.id); });
      th.appendChild(b); hr.appendChild(th);
    });
    var te = el("th", "r", "Expected"); te.scope = "col"; hr.appendChild(te);
    thead.appendChild(hr); rob.appendChild(thead);
    var tb = el("tbody");
    OPTIONS.forEach(function (o) {
      var tr = el("tr"), th = el("th"); th.scope = "row";
      th.appendChild(el("span", "rob__name", o.title));
      var all = PATHS.every(function (p) { return o.v[p.id] >= 0; });
      if (all) th.appendChild(el("span", "pill", "Holds up in every path"));
      tr.appendChild(th);
      var ev = 0;
      PATHS.forEach(function (p) {
        var v = o.v[p.id]; ev += v * p.p / 100;
        var td = el("td", "r rob__v"); td.dataset.path = p.id;
        td.appendChild(el("span", v < 0 ? "pill pill--red" : null, signed(v)));
        tr.appendChild(td);
      });
      tr.appendChild(el("td", "r rob__ev", signed(ev)));
      tb.appendChild(tr);
    });
    rob.appendChild(tb);
  })();
  function paintRob() {
    $$("[data-path]", rob).forEach(function (c) { c.classList.toggle("is-on", c.dataset.path === path); });
  }

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


  // figures make their entrance the first time they scroll into view

  /* ---------- links within the page glide there rather than jump ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    var to = $(a.getAttribute("href"));
    if (!to) return;
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var y = to.getBoundingClientRect().top + window.scrollY - $(".bar").getBoundingClientRect().bottom - 16;
      window.scrollTo({ top: y, behavior: REDUCE ? "auto" : "smooth" });
      history.replaceState(null, "", a.getAttribute("href"));
    });
  });

  /* ---------- first draw, and redraws when the width changes ---------- */
  drawMix(); drawPath(); drawCurve(); placeTracks(); paintRob();
  drawNet();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeTracks(); drawNet(); });
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { figs.forEach(draw); drawMix(); drawCurve(); drawNet(); placeTracks(); }, 120);
  });

  // figures make their entrance the first time they scroll into view
  Reveal(".spark, .mix, .fall, .trend, .fuse, .curve, #plan");
})();
