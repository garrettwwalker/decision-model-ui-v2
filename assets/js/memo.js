/* Sample memo: a strategic options memo answering "How should we respond to the potential of new
   sanctions by the Trump Administration?" Written on Wed Oct 7, the day after the brief. Shaped like an intelligence
   community options memo, made live (rebuilt 2026-11-07; the user wants only what helps a decision-maker, nothing on
   how the model works): key judgments and what's changed since Monday, key stakeholders, four scenarios (the chosen one
   carries onto the map), drivers, trends and key assumptions, a map of how we're at risk, option cards that set the plan
   below them, signposts with live readings and alerts, and known unknowns. Money in $M over 12 months; every figure is
   illustrative. The two sanctions scenarios make up the 41%; if sanctions land, $62M is at risk on average across them. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }

  // the four paths; loss is what each would cost us over a year, by interest (plants, clear, growth, freight, cash)
  var PATHS = [
    { id: "a", name: "Treasury Extends Sanctions to Buyers", short: "Slight expansion", p: 26, sanctions: true,
      line: "Treasury extends secondary sanctions to foreign buyers of Iranian petrochemicals under existing authority, with a 30-day wind-down. Shipping and banks are mostly left alone.",
      signs: [["Treasury signals “maximum pressure” in three speeches", 1], ["A Gulf polymer maker is named in a designation", 0], ["The November 1 waivers lapse without renewal", 0]],
      unfold: [["Late October", "Treasury briefs allies on a rule for buyers"], ["November", "The rule is announced, and a 30-day wind-down starts"], ["December", "Our two Gulf suppliers must prove clean feedstock or lose buyers with US ties"], ["Early 2027", "Gulf resin prices rise 12 to 18%"]],
      loss: { plants: 22, clear: 8, growth: 14, freight: 0, cash: 0 },
      reach: "Two chains break: resin from the Gulf suppliers, and sales through the Dubai traders.",
      best: "Re-source resin now. In this scenario, re-sourcing is the difference between paying more for resin and stopping a Gebze line." },
    { id: "b", name: "Congress Passes a Sweeping Package", short: "Sweeping package", p: 15, sanctions: true,
      line: "The Senate bill clears committee, passes, and is signed, reaching the shipping, insurers, and banks that serve Iranian trade. The wind-down could be as short as two weeks.",
      signs: [["A sanctions bill is introduced in the Senate", 1], ["The bill clears the Banking Committee", 0], ["Leadership schedules a floor vote", 0]],
      unfold: [["November", "The bill clears committee, then a floor vote and signing"], ["November and December", "Banks drop clients with Iran exposure, and insurers withdraw cover"], ["December", "Gebze’s Turkish lender restricts dollar payments"], ["Early 2027", "Gulf freight and resin are both scarce"]],
      loss: { plants: 32, clear: 18, growth: 27, freight: 8, cash: 8 },
      reach: "Every chain breaks, including the feeders and Gebze’s payments.",
      best: "Re-source resin and secure the banks now, then vet our partners the week a floor vote is scheduled." },
    { id: "c", name: "More Designations, No New Rules", short: "Status quo", p: 38, sanctions: false,
      line: "No new rules, but Treasury keeps naming ships, firms, and managers under today’s authority. The risk is being caught by association.",
      signs: [["Designations up threefold since August", 1], ["Ship-to-ship transfers off Fujairah rising", 1], ["No new rule by December 6", 0]],
      unfold: [["October to December", "Weekly designations stay above 20"], ["November", "The technical manager behind two of our feeders may be named"], ["Early 2027", "Screening counterparties becomes routine"]],
      loss: { plants: 0, clear: 0, growth: 0, freight: 0.8, cash: 0 },
      reach: "Only the feeder chain is at risk, through the technical manager we share with named tankers.",
      best: "Swap the two exposed feeders, a cheap fix for the only real exposure in this scenario." },
    { id: "d", name: "Talks Restart and Pressure Eases", short: "Talks restart", p: 21, sanctions: false,
      line: "Muscat sets a second round, the waivers are renewed unchanged, and pressure eases into the new year.",
      signs: [["European partners push to keep talking", 1], ["Muscat sets a date for a second round", 0], ["The November 1 waivers are renewed unchanged", 0]],
      unfold: [["November", "A second round in Muscat"], ["December", "Designations fall back to summer levels"], ["Early 2027", "Sanctions risk returns if the talks stall again"]],
      loss: { plants: 0, clear: 0, growth: 0, freight: 0, cash: 0 },
      reach: "Nothing breaks, but every exposure stays in place.",
      best: "Keep qualifying the new resin, which still hedges the Hormuz exposure." }
  ];
  var BYP = {};
  PATHS.forEach(function (p) { BYP[p.id] = p; });
  var path = "a";

  // the four ways to respond, as expected values over a year at the 41% chance; Totality's view marks when to start
  var P = 0.41;
  var OPTIONS = [
    { id: "resin", n: 1, title: "Re-source Resin", if: "If we re-source resin",
      sub: "Qualify Singapore and Korean resin at Gebze, and move 40% of its supply off the Gulf by December.",
      detail: "Procurement orders samples of two Singapore grades and one Korean grade this week. Gebze’s QA team runs line trials through November, then Procurement signs frame contracts for 40% of the plant’s resin and Legal trims the Gulf allocation without breaching terms. The plan builds on Tuesday’s Singapore bridge-buy.",
      line: "Qualify two Singapore grades and one Korean grade at Gebze, and move 40% of its volume off the Gulf by December. Builds on Tuesday’s Singapore bridge-buy.",
      cost: 2.6, protects: 24 * 0.8 * P,
      pros: ["Protects $7.9M, the most of any option", "Also cuts the Hormuz exposure in this week’s brief", "Qualification is reusable for any future supply shock"],
      cons: ["About $35/t more for at least two quarters", "Ties up Gebze’s QA team for 6 weeks", "Gulf suppliers may shrink our allocation"] },
    { id: "engage", n: 2, title: "Secure the Banks", if: "If we secure the banks",
      sub: "Open a second account for Gebze’s payments, and ask Treasury for wind-down guidance.",
      detail: "The Group Treasurer pre-clears payment routes with two banks and opens a second settlement account for Gebze. The General Counsel briefs our trade association, which writes to Treasury asking for a longer wind-down.",
      line: "Through the trade association, ask Treasury for wind-down guidance. Pre-clear payment routes with two banks and open a second settlement account for Gebze.",
      cost: 0.4, protects: 4 * P,
      pros: ["Cheap, and may buy a longer wind-down", "Keeps Gebze’s payroll and supplier runs safe"],
      cons: ["Treasury’s answer is outside our control", "Visible lobbying on Iran carries some reputational risk", "Does nothing for resin"] },
    { id: "tighten", n: 3, title: "Vet Our Partners", if: "If we vet our partners",
      sub: "Re-screen MENA partners, have the Dubai traders certify end use, and swap two exposed feeders.",
      detail: "Compliance re-screens every MENA partner, ownership included. The GM MENA and Legal ask the three Dubai traders to certify end use and pause any that won’t, while Logistics swaps the two feeders that share a manager with named tankers.",
      line: "Re-screen every MENA counterparty, ask the Dubai traders for end-use certificates, pause any that won’t sign, and swap the two exposed feeders.",
      cost: 3.5, costNote: "including $2.1M of margin given up", protects: 16 * P,
      pros: ["Removes nearly all penalty exposure", "Shows banks and auditors we moved early", "Cheap to reverse if no sanctions come"],
      cons: ["Gives up about $2.1M of margin a year even if nothing happens", "Strains the traders behind 14% of MENA volume; rivals may win that business"] },
    { id: "watch", n: 4, title: "Stay Ready", if: "If we stay ready",
      sub: "Change nothing yet. Watch four signposts and keep exit letters drafted.",
      detail: "Change nothing yet. The risk office tracks four signposts each week, and Legal keeps exit letters drafted.",
      line: "Change nothing yet. Watch four signposts, and draft, but don’t send, the exit letters.",
      cost: 0.1, protects: 0,
      pros: ["Costs almost nothing and keeps every supplier and trader", "Nothing to unwind if the talks restart"],
      cons: ["A 30-day window is too short to qualify new resin, which takes 6 to 8 weeks", "If a trader is named before we act, the shipment is already a breach"] }
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
      trips: [["the guidance allows less than 30 days to wind down", "start vetting our partners at once"], ["the Turkish lender is named", "move all Gebze payments to the new account"]]
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
      trips: [["a trader refuses to certify", "pause that trader and redirect the volume to the GCC key accounts"], ["talks resume with a date", "keep the screening, lift the pauses"]]
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
      trips: [["the Senate bill passes the floor", "vet our partners the same week"], ["the chance rises above 55%", "re-source resin at once"], ["any counterparty is named", "stop shipments that day and send the drafted letters"]]
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

  function mM(v) { return v ? "$" + (v % 1 ? v.toFixed(1) : String(v)) + "M" : "$0"; }
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
    paintAtlas();
    drawSide();
  }

  /* ---------- how the paths have shifted: stacked shares, the sanctions paths at the foot ---------- */
  var P13 = [19, 20, 22, 21, 22, 22, 23, 26, 29, 31, 34, 38, 41];
  var D13 = [40, 40, 39, 40, 39, 38, 37, 34, 31, 29, 26, 22, 21];
  var MIX = P13.map(function (s, i) {
    var b = Math.round(s * (0.3 + 0.066 * i / 12)), d = D13[i];
    return { b: b, a: s - b, c: 100 - s - d, d: d };
  });
  var ORDER = ["a", "b", "c", "d"]; // bottom to top: the two sanctions scenarios at the foot, so their 41% reads as a height
  var DATES = ["Jul 13", "Jul 20", "Jul 27", "Aug 3", "Aug 10", "Aug 17", "Aug 24", "Aug 31", "Sep 7", "Sep 14", "Sep 21", "Sep 28", "this week"];
  var EVENT = 11 + 1 / 7; // September 29, a day after the Sep 28 point
  var mixHost = $("#mix"), mixAreas = {};
  function drawMix() {
    var W = Math.max(300, mixHost.clientWidth), H = 230, L = 34, R = 66, T = 8, B = 22, n = MIX.length;
    var x = function (i) { return L + (W - L - R) * i / (n - 1); };
    var y = function (v) { return T + (H - T - B) * (1 - v / 100); };
    mixHost.innerHTML = "";
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img",
      "aria-label": "Chances of the four paths, weekly since July 13. Today: slight expansion 26%, sweeping package 15%, status quo 38%, talks restart 21%." });
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
      PATHS.slice().reverse().forEach(function (p) { // top to bottom, as the bands stack
        var row = el("p", "mix__row" + (p.id === path ? " is-on" : ""));
        row.appendChild(el("i", "mix__sw mix__sw--" + p.id + (p.id === path ? " is-on" : ""))); row.appendChild(document.createTextNode(p.short + " "));
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
  function drawPath() {
    var was = [$(".path__p", pathEl), $(".path__v", pathEl)].map(function (e) { return e ? e.textContent : null; });
    var p = BYP[path], total = lossOf(p);
    pathEl.innerHTML = "";
    var head = el("div", "path__head");
    var hl = el("div");
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
      li.appendChild(el("span", "pill" + (s[1] ? " pill--red" : ""), s[1] ? "Observed" : "Pending"));
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
    cost.appendChild(el("p", "path__v" + (total ? " red" : ""), mM(total)));
    cost.appendChild(el("p", "path__sub", "over the next year if we change nothing"));
    foot.appendChild(cost);
    var best = el("div", "path__best");
    best.appendChild(el("p", "path__k", "What serves us best"));
    best.appendChild(el("p", null, p.best));
    foot.appendChild(best);
    pathEl.appendChild(foot);
    if (!REDUCE) { pathEl.classList.remove("is-swap"); void pathEl.offsetWidth; pathEl.classList.add("is-swap"); }
    CountFrom($(".path__p", pathEl), was[0]); CountFrom($(".path__v", pathEl), was[1]); // the chance and the cost count to the new scenario's
  }

  /* ---------- how we're at risk: a map of our sites, partners, and their Iranian links ----------
     Land from bench-map.js (Natural Earth): the region at 1:50m, and the Gulf at 1:10m laid over it in the same
     projection, so zooming in on the Gulf stays sharp. Choosing a scenario turns the links it would cut red; selecting
     a place lights its links and opens its details beside the map. */
  var MAPX = function (lon) { return (lon - 24) * 9.06; }, MAPY = function (lat) { return (46 - lat) * 10; };
  // the region crops to Türkiye, the Gulf, and India; it widens to reach East Asia when the re-sourcing routes are shown
  var VIEWS = { region: [10, 20, 600, 300], wide: [0, 0, 1000, 500], gulf: [214, 176, 92, 46] };
  var GULF = { x0: 214, y0: 172, x1: 306, y1: 227 };
  var PLACES = [
    { id: "gebze", kind: "site", name: "Gebze plant", place: "Gebze, Türkiye", lon: 29.43, lat: 40.8, side: "r", interest: "plants",
      about: "Makes washers and dishwashers for Europe and the Middle East. 38% of the plant’s resin comes from two Gulf suppliers.",
      facts: [["Resin on hand", "9 days"], ["A stopped line costs", "$1.1M a day"]] },
    { id: "pune", kind: "site", name: "Pune plant", place: "Pune, India", lon: 73.86, lat: 18.52, side: "r", interest: "plants",
      about: "Builds fridges and air conditioners on HDPE resin shipped from Mesaieed.",
      facts: [["Resin on hand", "8 days"]] },
    { id: "hub", kind: "site", name: "Dubai distribution center", place: "Jebel Ali, UAE", lon: 55.06, lat: 24.99, side: "b", interest: "growth",
      about: "Serves the Gulf states, and sells through three Dubai traders who resell across the region.",
      facts: [["Share of group revenue", "11%"], ["Sold through the traders", "14% of MENA volume"]] },
    { id: "feeders", kind: "site", name: "Two chartered feeders", place: "Jebel Ali to Khor Fakkan", lon: 54.3, lat: 25.75, side: "l", interest: "freight",
      about: "Shuttle our containers around the Gulf. The feeders’ technical manager also runs tankers named in September.",
      facts: [["Containers a week", "About 1,100"]] },
    { id: "jubail", kind: "partner", name: "Resin supplier", place: "Jubail, Saudi Arabia", lon: 49.66, lat: 27.01, side: "r",
      about: "Supplies PP resin to Gebze. Takes feedstock from an Iranian joint venture.",
      facts: [["Share of Gebze’s resin", "22%"], ["Contract runs to", "June 2027"]] },
    { id: "mesaieed", kind: "partner", name: "Resin supplier", place: "Mesaieed, Qatar", lon: 51.55, lat: 24.99, side: "r",
      about: "Supplies PP resin to Gebze and HDPE to Pune. Also takes feedstock from the joint venture.",
      facts: [["Share of Gebze’s resin", "16%"], ["Share of Pune’s resin", "45%"]] },
    { id: "traders", kind: "partner", name: "Three Dubai traders", place: "Deira, Dubai", lon: 55.33, lat: 25.27, side: "t",
      about: "Buy from our distribution center and resell across the region, some of it to buyers we can’t see.",
      facts: [["Share of MENA volume", "14%"], ["Onward sales we can trace", "About 60%"]] },
    { id: "manager", kind: "partner", name: "Technical manager", place: "Fujairah, UAE", lon: 56.34, lat: 25.12, side: "b",
      about: "Runs two of our chartered feeders, and the tankers named in September.",
      facts: [["Ships under management", "23"]] },
    { id: "lender", kind: "partner", name: "Gebze’s lender", place: "Istanbul, Türkiye", lon: 28.98, lat: 41.01, side: "t",
      about: "Handles Gebze’s payroll and supplier payments. Settled an Iran case with US authorities in 2019.",
      facts: [["Payments a month", "About $40M"]] },
    { id: "jv", kind: "iran", name: "Petrochemical joint venture", place: "Asaluyeh, Iran", lon: 52.61, lat: 27.48, side: "t", status: "Not named yet",
      about: "Supplies feedstock to both of our Gulf resin suppliers. A rule on buyers would reach the joint venture first." },
    { id: "buyers", kind: "iran", name: "Iran-linked buyers", place: "Bandar Abbas, Iran", lon: 56.27, lat: 27.18, side: "t", status: "Two already named",
      about: "Where some of the Dubai traders’ volume ends up." },
    { id: "tankers", kind: "iran", name: "Named tankers", place: "Anchored off Fujairah", lon: 56.66, lat: 25.4, side: "t", status: "Named in September",
      about: "Five tankers named for carrying Iranian oil. The tankers share a technical manager with our feeders." },
    { id: "banks", kind: "iran", name: "Iranian correspondent banks", place: "Tehran, Iran", lon: 51.39, lat: 35.69, side: "t", status: "Named in 2018",
      about: "Gebze’s lender dealt with these banks before settling with US authorities in 2019." },
    { id: "sg", kind: "alt", name: "Singapore resin", place: "Jurong Island, Singapore", lon: 103.75, lat: 1.27, side: "r",
      about: "Two grades in qualification for Gebze, about 24 days away by sea.", facts: [["Ready by", "Mid-November"]] },
    { id: "ulsan", kind: "alt", name: "Korean resin", place: "Ulsan, South Korea", lon: 129.3, lat: 35.5, side: "l",
      about: "One grade in qualification for Gebze, about 30 days away by sea.", facts: [["Ready by", "Late November"]] }
  ];
  var PL = {};
  PLACES.forEach(function (p) {
    p.x = MAPX(p.lon); p.y = MAPY(p.lat); PL[p.id] = p;
    p.gulf = p.x > GULF.x0 && p.x < GULF.x1 && p.y > GULF.y0 && p.y < GULF.y1;
  });
  // sea lanes, as lon/lat waypoints
  var OUT_JUBAIL = [[50.4, 27.0], [51.3, 26.7], [52.3, 26.4], [54.8, 26.4]];
  var OUT_MESAIEED = [[51.95, 25.2], [52.4, 25.9], [53.5, 26.25], [54.8, 26.4]];
  var HORMUZ = [[56.3, 26.55], [57.1, 25.6], [58.6, 23.9]];
  var TO_SUEZ = [[60.0, 21.0], [56.0, 16.5], [51.0, 13.6], [46.5, 12.6], [43.45, 12.6], [42.4, 14.6], [39.5, 19.5], [36.5, 24.0], [34.2, 27.6], [32.6, 29.6], [32.35, 31.3]];
  var TO_GEBZE = [[31.0, 32.7], [27.8, 34.5], [25.6, 36.4], [25.9, 38.6], [26.3, 40.05], [26.9, 40.45], [27.8, 40.7], [28.9, 40.85]];
  var TO_PUNE = [[62.0, 22.5], [70.0, 19.6], [72.95, 18.95]];
  var FROM_SG = [[103.6, 1.6], [100.5, 3.6], [97.0, 6.3], [88.0, 6.0], [80.5, 5.4], [72.0, 8.5], [60.0, 12.6], [51.0, 13.6]];
  var FROM_ULSAN = [[128.6, 34.4], [126.0, 32.5], [123.0, 29.8], [120.9, 25.0], [117.0, 20.0], [110.0, 12.5], [105.6, 5.0]];
  var LINKS = [
    { id: "jv-jub", a: "jv", b: "jubail", chain: "resin", what: "Feedstock" },
    { id: "jv-mes", a: "jv", b: "mesaieed", chain: "resin", what: "Feedstock" },
    { id: "jub-geb", a: "jubail", b: "gebze", chain: "resin", what: "PP resin by sea, through Suez", via: OUT_JUBAIL.concat(HORMUZ, TO_SUEZ.slice(2), TO_GEBZE) },
    { id: "mes-geb", a: "mesaieed", b: "gebze", chain: "resin", what: "PP resin by sea, through Suez", via: OUT_MESAIEED.concat(HORMUZ, TO_SUEZ.slice(2), TO_GEBZE) },
    { id: "mes-pun", a: "mesaieed", b: "pune", chain: "resin", what: "HDPE resin by sea and road", via: OUT_MESAIEED.concat(HORMUZ, TO_PUNE) },
    { id: "buy-tra", a: "buyers", b: "traders", chain: "trade", what: "Onward sales" },
    { id: "tra-hub", a: "traders", b: "hub", chain: "trade", what: "Our sales to the traders" },
    { id: "tan-man", a: "tankers", b: "manager", chain: "freight", what: "Technical management" },
    { id: "man-fee", a: "manager", b: "feeders", chain: "freight", what: "Technical management" },
    { id: "fee-hub", a: "feeders", b: "hub", chain: "freight", what: "Feeder service" },
    { id: "ban-len", a: "banks", b: "lender", chain: "money", what: "Past correspondent banking", bow: -0.18 },
    { id: "len-geb", a: "lender", b: "gebze", chain: "money", what: "Payroll and supplier payments" },
    { id: "sg-geb", a: "sg", b: "gebze", chain: "alt", what: "Re-sourcing route", via: FROM_SG.concat(TO_SUEZ.slice(4), TO_GEBZE) },
    { id: "uls-geb", a: "ulsan", b: "gebze", chain: "alt", what: "Re-sourcing route", via: FROM_ULSAN.concat(FROM_SG.slice(1), TO_SUEZ.slice(4), TO_GEBZE) }
  ];
  var CUTS = { a: { resin: 1, trade: 1 }, b: { resin: 1, trade: 1, freight: 1, money: 1 }, c: { freight: 1 }, d: {} };
  var KIND = { site: "Our site", partner: "Partner", iran: "Iranian link", alt: "Where we could re-source" };
  var INTEREST = { plants: "Keep Gebze running", clear: "Stay clear of a breach", growth: "Keep MENA growing", freight: "Keep freight moving", cash: "Keep payments flowing" };

  var atlas = $("#atlas"), map = $("#atlas-svg"), side = $("#atlas-side");
  var vb = VIEWS.region.slice(), view = "region", picked = null, hovered = null;
  var layers = { site: true, partner: true, iran: true, alt: false };
  var gMarks, linkEls = {}, markEls = {}, gulfBox;

  // a smooth curve through projected points (Catmull-Rom as cubic Béziers)
  function smooth(pts) {
    var d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += " C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + " " +
        (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
    }
    return d;
  }
  function linkPath(l) {
    var a = PL[l.a], b = PL[l.b];
    if (l.via) return smooth([[a.x, a.y]].concat(l.via.map(function (q) { return [MAPX(q[0]), MAPY(q[1])]; }), [[b.x, b.y]]));
    var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, k = l.bow || 0.2;
    return "M" + a.x + " " + a.y + " Q" + (mx - dy * k).toFixed(1) + " " + (my + dx * k).toFixed(1) + " " + b.x + " " + b.y;
  }
  function buildMap() {
    var M = window.BENCH_MAP || {};
    map.appendChild(svg("rect", { x: -50, y: -50, width: 1100, height: 600, class: "atlas__sea" }));
    if (M.main) map.appendChild(svg("path", { d: M.main, class: "atlas__land" }));
    // the Gulf at 1:10m over its own patch of sea, in the main projection
    var defs = svg("defs", {}), clip = svg("clipPath", { id: "gulf-clip" });
    clip.appendChild(svg("rect", { x: GULF.x0, y: GULF.y0, width: GULF.x1 - GULF.x0, height: GULF.y1 - GULF.y0 }));
    defs.appendChild(clip); map.appendChild(defs);
    if (M.inset) {
      var g = svg("g", { "clip-path": "url(#gulf-clip)" });
      g.appendChild(svg("rect", { x: GULF.x0, y: GULF.y0, width: GULF.x1 - GULF.x0, height: GULF.y1 - GULF.y0, class: "atlas__sea" }));
      g.appendChild(svg("path", { d: M.inset, class: "atlas__land atlas__land--fine", transform: "translate(212.27 58.56) scale(0.335556 0.33557)" }));
      map.appendChild(g);
    }
    [["TÜRKİYE", 33, 39.3], ["IRAN", 54.5, 32.5], ["SAUDI ARABIA", 44, 23.5], ["INDIA", 77, 23], ["EGYPT", 29, 26.5], ["CHINA", 103, 33]].forEach(function (t) {
      var tx = svg("text", { x: MAPX(t[1]), y: MAPY(t[2]), class: "atlas__region", "text-anchor": "middle" });
      tx.textContent = t[0]; map.appendChild(tx);
    });
    gulfBox = svg("g", { class: "atlas__gulfbox", tabindex: "0", role: "button", "aria-label": "Zoom to the Gulf" });
    gulfBox.appendChild(svg("rect", { x: VIEWS.gulf[0], y: VIEWS.gulf[1], width: VIEWS.gulf[2], height: VIEWS.gulf[3], rx: 3 }));
    gulfBox.addEventListener("click", function (e) { e.stopPropagation(); zoom("gulf"); });
    gulfBox.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); zoom("gulf"); } });
    map.appendChild(gulfBox);
    var gl = svg("g", { class: "atlas__links" });
    LINKS.forEach(function (l) {
      var p = svg("path", { d: linkPath(l), class: "lk lk--" + l.chain, "vector-effect": "non-scaling-stroke" });
      gl.appendChild(p); linkEls[l.id] = p;
    });
    map.appendChild(gl);
    gMarks = svg("g", { class: "atlas__marks" });
    PLACES.forEach(function (p) {
      var g = svg("g", { class: "mkg mkg--" + p.kind + (p.gulf ? " is-gulf" : ""), tabindex: "0", role: "button", "aria-label": p.name + ", " + p.place });
      var inner = svg("g", { class: "mkg__in" });
      if (p.kind === "partner") inner.appendChild(svg("rect", { x: -5, y: -5, width: 10, height: 10, rx: 2.5, class: "mkg__dot" }));
      else inner.appendChild(svg("circle", { r: p.kind === "site" ? 6 : 5, class: "mkg__dot" }));
      var off = { r: [10, 4, "start"], l: [-10, 4, "end"], t: [0, -10, "middle"], b: [0, 17, "middle"] }[p.side];
      var t = svg("text", { x: off[0], y: off[1], "text-anchor": off[2], class: "mkg__lab" });
      t.textContent = p.name; inner.appendChild(t);
      g.appendChild(inner);
      g.addEventListener("click", function (e) { e.stopPropagation(); pick(p.id === picked ? null : p.id); });
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(p.id === picked ? null : p.id); } });
      g.addEventListener("mouseenter", function () { hovered = p.id; paintAtlas(); });
      g.addEventListener("mouseleave", function () { hovered = null; paintAtlas(); });
      gMarks.appendChild(g); markEls[p.id] = { g: g, inner: inner };
    });
    map.appendChild(gMarks);
    map.addEventListener("click", function () { if (picked) pick(null); });
    setVB(vb);
  }
  // markers and labels keep their size on screen whatever the zoom
  function setVB(b) {
    vb = b;
    map.setAttribute("viewBox", b.map(function (v) { return v.toFixed(2); }).join(" "));
    var w = map.getBoundingClientRect().width || 800, s = b[2] / w * (w < 600 ? 0.85 : 1.25); // smaller marks on a phone
    PLACES.forEach(function (p) { markEls[p.id].g.setAttribute("transform", "translate(" + p.x + " " + p.y + ") scale(" + s.toFixed(4) + ")"); });
    var zoomed = b[2] < 400;
    atlas.classList.toggle("is-zoomed", zoomed);
    gulfBox.style.strokeWidth = (1.5 * b[2] / w) + "px";
  }
  function zoom(to, force) {
    if (to === view && !force) return;
    view = to;
    $$("#atlas-view button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.view === to)); });
    placeView();
    var from = vb.slice(), dest = VIEWS[to === "region" && layers.alt ? "wide" : to];
    if (REDUCE) { setVB(dest.slice()); return; }
    var t0 = performance.now(), dur = 650;
    (function step(now) {
      var t = Math.min(1, (now - t0) / dur), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      // ease the zoom on a log scale so it doesn't rush the last stretch
      var w = Math.exp(Math.log(from[2]) + (Math.log(dest[2]) - Math.log(from[2])) * e), f = (from[2] - w) / (from[2] - dest[2] || 1);
      setVB([from[0] + (dest[0] - from[0]) * f, from[1] + (dest[1] - from[1]) * f, w, w / 2]);
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }
  var viewPill = $("#atlas-view .sw__pill");
  function placeView() {
    var b = $('#atlas-view [aria-pressed="true"]');
    if (b && b.offsetWidth) { viewPill.style.width = b.offsetWidth + "px"; viewPill.style.transform = "translateX(" + (b.offsetLeft - 4) + "px)"; }
  }
  $$("#atlas-view button").forEach(function (b) { b.addEventListener("click", function () { zoom(b.dataset.view); }); });
  requestAnimationFrame(function () { requestAnimationFrame(function () { $("#atlas-view").classList.add("is-ready"); }); });
  $$(".atlas__layer").forEach(function (b) {
    b.addEventListener("click", function () {
      layers[b.dataset.layer] = !layers[b.dataset.layer];
      b.setAttribute("aria-pressed", String(layers[b.dataset.layer]));
      if (picked && !layers[PL[picked].kind]) picked = null;
      if (b.dataset.layer === "alt" && view === "region") zoom("region", true);
      paintAtlas(); drawSide();
    });
  });
  function pick(id) {
    picked = id;
    if (id) {
      var p = PL[id];
      if (!layers[p.kind]) { layers[p.kind] = true; $('.atlas__layer[data-layer="' + p.kind + '"]').setAttribute("aria-pressed", "true"); }
      if (p.kind === "alt" && view === "region") { zoom("region", true); paintAtlas(); drawSide(); return; }
      if (p.gulf && view !== "gulf") zoom("gulf");
      else if (!p.gulf && view === "gulf") zoom("region");
    }
    paintAtlas(); drawSide();
  }
  function cut(l) { return !!CUTS[path][l.chain]; }
  function paintAtlas() {
    if (!gMarks) return;
    var focus = hovered || picked, near = {};
    if (focus) { near[focus] = 1; LINKS.forEach(function (l) { if (l.a === focus || l.b === focus) { near[l.a] = 1; near[l.b] = 1; } }); }
    var hit = {};
    LINKS.forEach(function (l) {
      var on = layers[PL[l.a].kind] && layers[PL[l.b].kind], c = cut(l), el2 = linkEls[l.id];
      if (c) { hit[l.a] = 1; hit[l.b] = 1; }
      el2.classList.toggle("is-hidden", !on);
      el2.classList.toggle("is-cut", c);
      el2.classList.toggle("is-dim", !!focus && !(l.a === focus || l.b === focus));
      el2.classList.toggle("is-near", !!focus && (l.a === focus || l.b === focus));
    });
    PLACES.forEach(function (p) {
      var m = markEls[p.id].g;
      m.classList.toggle("is-hidden", !layers[p.kind]);
      m.classList.toggle("is-hit", !!hit[p.id]);
      m.classList.toggle("is-picked", p.id === picked);
      m.classList.toggle("is-dim", !!focus && !near[p.id]);
    });
    var sc = BYP[path], loss = $("#atlas-loss");
    var wasTot = $(".atlas__total", loss), wasText = wasTot && wasTot.textContent;
    var wasRows = $$("div:not(.atlas__losshead) dd", loss).map(function (e) { return e.textContent; });
    loss.innerHTML = "";
    var head = el("div", "atlas__losshead");
    head.appendChild(el("dt", null, "At risk in this scenario"));
    var tot = lossOf(sc);
    var totEl = el("dd", "atlas__total" + (tot ? " red" : ""), mM(tot));
    head.appendChild(totEl);
    loss.appendChild(head);
    CountFrom(totEl, wasText); // the total counts to the new scenario's
    ["plants", "clear", "growth", "freight", "cash"].forEach(function (k) {
      var v = sc.loss[k], d = el("div", v ? "is-on" : null);
      d.appendChild(el("dt", null, INTEREST[k]));
      var dd = el("dd", null, mM(v));
      d.appendChild(dd); loss.appendChild(d);
      CountFrom(dd, wasRows[loss.children.length - 2]);
    });
    if (!picked) drawSide();
  }
  // the side panel crossfades when its content changes: the old content fades out over the new as the panel eases to
  // its new height, and the chance counts to the new scenario's; a redraw with nothing new (a hover) leaves it be
  var sideKey = null;
  function drawSide() {
    var key = path + "|" + (picked || "") + "|" + Object.keys(layers).filter(function (k) { return layers[k]; }).join();
    if (key === sideKey) return;
    var first = sideKey === null, wasP = $(".atlas__p", side), wasPText = wasP && wasP.textContent;
    sideKey = key;
    var h0 = side.offsetHeight, ghost = null;
    if (!first && !REDUCE && side.animate) {
      $$(".atlas__ghost", side).forEach(function (g) { g.remove(); });
      ghost = el("div", "atlas__ghost"); ghost.setAttribute("aria-hidden", "true");
      while (side.firstChild) ghost.appendChild(side.firstChild);
    } else side.innerHTML = "";
    fillSide();
    CountFrom($(".atlas__p", side), wasPText);
    if (!ghost) return;
    var kids = [].slice.call(side.children), h1 = side.offsetHeight;
    side.appendChild(ghost);
    var ease = "cubic-bezier(0.3, 0.7, 0.2, 1)";
    ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: "ease-out", fill: "forwards" }).onfinish = function () { ghost.remove(); };
    kids.forEach(function (k) { k.animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 320, delay: 120, easing: ease, fill: "backwards" }); });
    if (Math.abs(h1 - h0) > 1) {
      side.style.overflow = "hidden";
      side.animate([{ height: h0 + "px" }, { height: h1 + "px" }], { duration: 340, easing: ease }).onfinish = function () { side.style.overflow = ""; };
    }
  }
  function fillSide() {
    var sc = BYP[path];
    if (!picked) {
      side.appendChild(el("h3", "atlas__t", sc.name));
      side.appendChild(el("p", "atlas__p", sc.p + "% chance"));
      side.appendChild(el("p", "atlas__about", sc.reach));
      return;
    }
    var p = PL[picked], hit = LINKS.some(function (l) { return cut(l) && (l.a === p.id || l.b === p.id); });
    side.appendChild(el("span", "pill" + (p.kind === "iran" ? " pill--red" : ""), KIND[p.kind]));
    side.appendChild(el("h3", "atlas__t", p.name));
    side.appendChild(el("p", "atlas__place", p.place));
    side.appendChild(el("p", "atlas__about", p.about));
    var dl = el("dl", "atlas__facts");
    (p.status ? [["Status", p.status]] : []).concat(p.facts || []).forEach(function (f) {
      var d = el("div"); d.appendChild(el("dt", null, f[0])); d.appendChild(el("dd", null, f[1])); dl.appendChild(d);
    });
    if (dl.children.length) side.appendChild(dl);
    if (p.kind !== "alt") {
      var st = el("p", "atlas__in");
      st.appendChild(el("span", null, "In this scenario"));
      st.appendChild(el("b", hit ? "red" : null, hit ? (p.interest && sc.loss[p.interest] ? "Cut off, with " + DB.money(sc.loss[p.interest], sc.loss[p.interest] % 1 ? 1 : 0) + " at risk" : "Cut off") : "Not affected"));
      side.appendChild(st);
    }
    var links = LINKS.filter(function (l) { return (l.a === p.id || l.b === p.id) && layers[PL[l.a].kind] && layers[PL[l.b].kind]; });
    if (links.length) {
      side.appendChild(el("p", "atlas__k2", "Linked to"));
      var ul = el("ul", "atlas__linked");
      links.forEach(function (l) {
        var o = PL[l.a === p.id ? l.b : l.a], li = el("li"), b = el("button", "btn-q", o.name);
        b.type = "button";
        b.addEventListener("click", function (e) { e.stopPropagation(); pick(o.id); });
        li.appendChild(b); li.appendChild(el("span", null, l.what)); ul.appendChild(li);
      });
      side.appendChild(ul);
    }
    var back = el("button", "atlas__back", "Back to the scenario"); back.type = "button";
    back.addEventListener("click", function () { pick(null); });
    side.appendChild(back);
  }
  buildMap();
  paintAtlas();
  drawSide();

  // the map's entrance, the first time it scrolls into view: every place pops in at once, then each link draws itself
  // from its source. Strokes don't scale with the zoom, so dashes are set in screen pixels.
  (function () {
    if (REDUCE || !window.IntersectionObserver) return;
    atlas.classList.add("is-waiting");
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      atlas.classList.remove("is-waiting");
      var k = (map.getBoundingClientRect().width || 800) / vb[2];
      LINKS.forEach(function (l, i) {
        var el2 = linkEls[l.id], len = el2.getTotalLength() * k;
        el2.style.strokeDasharray = len + "px"; el2.style.strokeDashoffset = len + "px";
        var a = el2.animate([{ strokeDashoffset: len + "px" }, { strokeDashoffset: "0px" }],
          { duration: l.via ? 1400 : 700, delay: 500 + i * 70, easing: "cubic-bezier(0.3, 0.6, 0.2, 1)", fill: "forwards" });
        a.onfinish = function () { a.cancel(); el2.style.strokeDasharray = ""; el2.style.strokeDashoffset = ""; };
      });
    }, { threshold: 0.35 });
    io.observe(map);
  })();

  /* ---------- key stakeholders: a short card each; the chosen one fills the panel beneath with its incentives, its
     people, its record, ours with it, and what to watch for. Officials are today's office-holders where a name helps
     (the bill's lead sponsor, Senator Whitcomb, is made up); past actions before 2026 are the real record ---------- */
  var ACTORS = [
    { id: "ofac", lean: "up", name: "Office of Foreign Assets Control",
      line: "Can widen today’s sanctions without waiting for Congress.",
      stance: "Treasury’s sanctions office writes the designations and the guidance that tell banks and shippers what’s off limits. It needs no new law to name a Gulf polymer maker or a broker, so it’s the fastest route from talk to a rule that touches our resin.",
      us: "A designation of either Gulf supplier that takes Iranian-linked feedstock would cut 38% of Gebze’s resin overnight.",
      next: ["Any day", "Designations land without notice"],
      wants: ["Visible results from the “maximum pressure” campaign before the November 1 waiver deadline", "Cases it can win: clear Iranian ownership or feedstock, documented trades"],
      fears: ["Moves that spike oil prices before the holidays", "Designations that collapse in court for thin evidence"],
      who: [["Scott Bessent, Treasury Secretary", "Has made “maximum pressure” on Iran’s oil revenue a public test of the department"],
            ["John Hurley, Under Secretary for Terrorism and Financial Intelligence", "Sets the campaign’s priorities and gave two of the three speeches on it"],
            ["Bradley Smith, OFAC’s director", "Signs off each designation package"],
            ["The Iran targeting team", "Builds the cases; has moved from tankers toward petrochemical brokers since August"]],
      record: [["June 2019", "Designated Persian Gulf Petrochemical Industries, Iran’s largest petrochemical group"],
               ["January 2020", "Gained authority to sanction anyone in Iran’s petrochemical sector (Executive Order 13902)"],
               ["2025", "Named tankers and Chinese independent refineries buying Iranian oil, round after round"],
               ["August to October 2026", "Iran-linked designations up threefold; a third speech names petrochemical buyers"]],
      ours: "In 2022 we disclosed that a Dubai distributor had resold spare parts into Iran; OFAC closed it with a cautionary letter and no penalty. We hold no licenses, and our outside sanctions counsel speaks with OFAC’s compliance staff a few times a year.",
      engage: "Have counsel ask OFAC how it treats feedstock from an Iranian-linked joint venture before any designation, not after.",
      watch: [["A Gulf polymer maker named in a designation", "Chance rises to about 60%", 1], ["New guidance aimed at petrochemical brokers", "Raises the chance", 1], ["Iran-linked designations past 40 in a week", "Chance rises to about 50%", 1]] },
    { id: "senate", lean: "up", name: "Senate Banking Committee",
      line: "Holds the August 3 sanctions bill, now at 34 co-sponsors.",
      stance: "The committee with jurisdiction over sanctions holds the bill introduced August 3. It would reach the shipping, insurers, and banks that serve Iranian trade, and would write a wind-down window into law. The chair decides when it’s marked up.",
      us: "Its insurer and bank provisions reach our two feeder ships and Gebze’s Turkish lender; how long its wind-down window runs decides whether re-sourcing resin in time is possible.",
      next: ["October 21", "The committee’s next business meeting; no markup set yet"],
      wants: ["A bipartisan win on Iran before the midterms", "Leverage over the administration’s waivers"],
      fears: ["Owning higher fuel prices", "A bill so broad it catches allies’ banks and draws a veto threat"],
      who: [["Senator Tim Scott, chair", "Sets the markup date, and so the clock"],
            ["Senator Elizabeth Warren, ranking member", "Her office is drafting text on the bank provisions"],
            ["Senator Dale Whitcomb, lead sponsor", "Gathered eight more co-sponsors this week, 34 in all, and wants a vote before the November 1 waiver deadline"]],
      record: [["July 2017", "The Senate passed sanctions on Iran, Russia, and North Korea 98 to 2"],
               ["April 2024", "The Stop Harboring Iranian Petroleum Act became law, reaching ports and refineries that take Iranian oil"],
               ["August 3, 2026", "The current bill introduced"],
               ["October 2026", "Eight co-sponsors added in a week"]],
      ours: "Our trade association commented on the 2024 act. In September our Washington office met committee staff about the insurer provisions; they asked for examples of allied firms that would be caught.",
      engage: "Send the staff those examples before October 21, through the trade association, and ask for a 30-day wind-down at least.",
      watch: [["The bill clears committee", "Chance rises to about 52%", 1], ["Draft text from Senator Warren’s office", "Shows how far the bank provisions reach", 0]] },
    { id: "nsc", lean: "flat", name: "National Security Council",
      line: "Wants leverage for talks, but no oil spike before the holidays.",
      stance: "The White House staff that weighs Treasury’s plans against diplomacy and oil prices. It leans toward hitting buyers rather than supply, which keeps barrels flowing while squeezing Tehran’s revenue.",
      us: "Hitting buyers rather than supply is the slight-expansion path, the one where our Gulf suppliers and Dubai traders are most exposed.",
      next: ["Before November 1", "A principals meeting on whether to renew the waivers"],
      wants: ["Leverage for a second round of talks", "Allies on side"],
      fears: ["Brent above $95 before the holidays", "Being seen as soft on Iran in an election year"],
      who: [["Marco Rubio, Secretary of State and acting National Security Advisor", "Chairs the principals meeting and frames the waiver choice, wearing both hats"],
            ["Scott Bessent, Treasury Secretary", "Pushes for designations at the principals meeting"],
            ["Nathan Ferris, senior director for the Gulf", "Writes the options memo"]],
      record: [["May 2018", "The United States left the nuclear deal and reimposed sanctions"],
               ["February 2025", "A presidential memorandum restored “maximum pressure”"],
               ["June 2025", "US strikes on Iranian nuclear sites"],
               ["September 2026", "Backed Treasury’s speeches while keeping the waivers in place"]],
      ours: "No direct contact. Our views reach it through Treasury’s and Commerce’s industry calls, which our Washington office joins.",
      engage: "Raise the resin exposure on the next Commerce industry call, framed as a supply risk to American appliance prices.",
      watch: [["A statement on who buys Iranian petrochemicals", "Points to the slight-expansion path", 1], ["The November 1 waivers renewed unchanged", "Chance falls to about 30%", -1]] },
    { id: "tehran", lean: "flat", name: "Tehran",
      line: "Wants relief without giving ground on enrichment.",
      stance: "Iran’s leadership is split between those who want sanctions relief through talks and those who profit from confrontation. Boardings in the Gulf of Oman have pushed the odds up; agreeing to a second round in Muscat would pull them down.",
      us: "Every boarding raises war-risk premiums on our Jebel Ali calls and nudges Washington toward a wider package.",
      next: ["No date", "A second round of talks in Muscat"],
      wants: ["Relief on oil and petrochemical sales", "To keep enrichment as a bargaining chip"],
      fears: ["Losing its last buyers in Asia", "Looking weak at home"],
      who: [["Ayatollah Ali Khamenei, Supreme Leader", "Has the final word on talks"],
            ["The Revolutionary Guards", "Run the boardings at sea, and own stakes in petrochemicals and shipping"],
            ["Masoud Pezeshkian, President, and Abbas Araghchi, Foreign Minister", "Favor talks and relief, and lead them, but can’t deliver the Guards"],
            ["Parliament’s hardliners", "Pass laws that limit cooperation with inspectors"]],
      record: [["July 2019", "Seized the British tanker Stena Impero in the Strait of Hormuz"],
               ["April 2021", "Began enriching uranium to 60%"],
               ["July 2025", "Suspended cooperation with the UN’s nuclear inspectors"],
               ["September 29, 2026", "Talks in Muscat collapsed; three boardings in the Gulf of Oman followed in ten days"]],
      ours: "No dealings since we closed our Iranian distributor in 2018. Our exposure is indirect: two Gulf resin suppliers take feedstock from an Iranian-linked joint venture, and three Dubai traders resell into the region.",
      engage: "None directly. We watch it through our agents and the diplomatic wire.",
      watch: [["Muscat sets a date for a second round", "Chance falls to about 25%", -1], ["New boardings in the Gulf of Oman", "Raises the chance", 1]] },
    { id: "europe", lean: "down", name: "European Partners",
      line: "Want the talks kept alive and oil flowing.",
      stance: "France, Germany, and the United Kingdom want room for a second round of talks and stable oil. Their pressure is the main thing holding Washington back from a sweeping package.",
      us: "Our EU sales subsidiaries fall under the EU’s blocking statute, so a wide US rule could pull them in opposite directions from the parent.",
      next: ["October 19", "EU foreign ministers meet"],
      wants: ["The talks kept alive", "Their banks and insurers kept out of US penalties"],
      fears: ["An oil spike going into winter", "US rules that reach European firms"],
      who: [["Jean-Noël Barrot and Johann Wadephul, French and German foreign ministers", "Asked Washington to wait for a second round"],
            ["Yvette Cooper, British Foreign Secretary", "The likeliest of the three to side with Washington"],
            ["Kaja Kallas, the EU’s foreign policy chief", "Coordinates the 27 members’ position"]],
      record: [["August 2018", "Updated the EU blocking statute to shield its firms from US Iran sanctions"],
               ["January 2019", "France, Germany, and Britain set up a channel for humanitarian trade with Iran"],
               ["September 2025", "Triggered the return of UN sanctions on Iran"],
               ["October 2026", "France and Germany asked Washington to wait for a second round"]],
      ours: "Our EU subsidiaries’ counsel advised on the blocking statute in 2018, when we closed our Iranian distributor, and found no conflict then.",
      engage: "Ask the subsidiaries’ counsel to update that 2018 advice for a bill that reaches insurers and banks.",
      watch: [["A statement from the British Foreign Office", "Shows whether the E3 holds together", 0], ["An E3 request to renew the waivers", "Lowers the chance", -1]] }
  ];
  var LEAN = { up: ["Pushing the odds up", " pill--red"], flat: ["Neutral", ""], down: ["Pulling the odds down", " pill--green"] };
  var alist = $("#actors-list"), apanel = $("#actor-panel"), actorEls = {}, actorOn = ACTORS[0].id;
  function pill(text, cls) { return el("span", "pill" + (cls || ""), text); }
  ACTORS.forEach(function (a) {
    var c = el("li", "actor");
    c.tabIndex = 0; c.setAttribute("role", "button"); c.setAttribute("aria-controls", "actor-panel");
    var lean = el("p", "actor__lean"); lean.appendChild(pill(LEAN[a.lean][0], LEAN[a.lean][1])); c.appendChild(lean);
    c.appendChild(el("h3", "actor__t", a.name));
    c.appendChild(el("p", "actor__line", a.line));
    function go() { if (actorOn !== a.id) { actorOn = a.id; paintActors(); showActor(true); } }
    c.addEventListener("click", go);
    c.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    actorEls[a.id] = c; alist.appendChild(c);
  });
  function paintActors() {
    alist.classList.add("has-pick");
    ACTORS.forEach(function (a) { var on = a.id === actorOn; actorEls[a.id].classList.toggle("is-on", on); actorEls[a.id].setAttribute("aria-pressed", String(on)); });
  }
  function block(title) { var b = el("div", "ap__block"); b.appendChild(el("h4", "ap__h", title)); return b; }
  function showActor(user) {
    var a = ACTORS.filter(function (x) { return x.id === actorOn; })[0];
    apanel.innerHTML = "";
    if (user && !REDUCE) { apanel.classList.remove("is-swap"); void apanel.offsetWidth; apanel.classList.add("is-swap"); }
    var top = el("div", "ap__top");
    var head = el("div", "ap__head");
    var k = el("p", "ap__k"); k.appendChild(pill(LEAN[a.lean][0], LEAN[a.lean][1])); head.appendChild(k);
    head.appendChild(el("h3", "ap__t", a.name));
    head.appendChild(el("p", "ap__stance", a.stance));
    var us = el("p", "ap__us"); us.appendChild(el("b", null, "What it means for us. ")); us.appendChild(document.createTextNode(a.us)); head.appendChild(us);
    top.appendChild(head);
    var nx = el("div", "ap__next"); nx.appendChild(el("span", null, "Next to watch")); nx.appendChild(el("b", null, a.next[0])); nx.appendChild(el("small", null, a.next[1]));
    top.appendChild(nx);
    apanel.appendChild(top);

    var cols = el("div", "ap__cols"), left = el("div"), right = el("div");
    var inc = block("Incentives"), iv = el("dl", "ap__inc");
    [["Wants", a.wants], ["Fears", a.fears]].forEach(function (r) {
      var d = el("div"); d.appendChild(el("dt", null, r[0]));
      var dd = el("dd"), ul = el("ul"); r[1].forEach(function (t) { ul.appendChild(el("li", null, t)); }); dd.appendChild(ul); d.appendChild(dd); iv.appendChild(d);
    });
    inc.appendChild(iv); left.appendChild(inc);
    var who = block("Who Matters"), wl = el("ul", "ap__who");
    a.who.forEach(function (w) { var li = el("li"); li.appendChild(el("b", null, w[0])); li.appendChild(el("span", null, w[1])); wl.appendChild(li); });
    who.appendChild(wl); left.appendChild(who);
    var hist = block("Our History With Them"); hist.appendChild(el("p", "ap__p", a.ours)); left.appendChild(hist);

    var wt = block("Watch For"), wtl = el("ul", "ap__watch");
    a.watch.forEach(function (w) { var li = el("li"); li.appendChild(el("span", null, w[0])); li.appendChild(pill(w[1], w[2] > 0 ? " pill--red" : w[2] < 0 ? " pill--green" : "")); wtl.appendChild(li); });
    wt.appendChild(wtl); right.appendChild(wt);
    var rec = block("Track Record"), rl = el("ol", "ap__rec");
    a.record.forEach(function (r) { var li = el("li"); li.appendChild(el("b", null, r[0])); li.appendChild(el("span", null, r[1])); rl.appendChild(li); });
    rec.appendChild(rl); right.appendChild(rec);
    var eng = block("How We Engage"); eng.appendChild(el("p", "ap__p", a.engage)); right.appendChild(eng);
    cols.appendChild(left); cols.appendChild(right);
    apanel.appendChild(cols);
  }
  paintActors(); showActor(false);

  /* ---------- our options: a short card each; the selected card fills the panel below with its figures, for and against,
     and implementation timeline ---------- */
  var panel = $("#plan"), olist = $("#options-list"), cardEls = {}, shown = "resin";
  OPTIONS.forEach(function (o) {
    var c = el("li", "option");
    c.tabIndex = 0; c.setAttribute("role", "button"); c.setAttribute("aria-controls", "plan");
    var head = el("div", "option__head");
    head.appendChild(el("span", "option__n", String(o.n)));
    head.appendChild(el("h3", "option__title", o.title));
    c.appendChild(head);
    c.appendChild(el("p", "option__sub", o.sub));
    function go() { if (shown !== o.id) { shown = o.id; paintCards(); showPlan(o.id, true); drawRivals(true); } }
    c.addEventListener("click", go);
    c.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    cardEls[o.id] = c;
    olist.appendChild(c);
  });
  /* ---------- how rivals are positioned, and where each meets the selected option ---------- */
  var RIVALS = [
    { name: "Ostra Home", base: "Turkish white goods, plants in Manisa", exp: "High exposure", cls: " pill--red",
      facts: [["Resin from the Gulf", "70%"],["Share of MENA sales", "18%"]],
      hit: "No second resin source. A rule on buyers would slow Ostra’s lines within weeks.",
      meets: { resin: "We’d both chase Singapore and Korean grades. Ours qualify by mid-November and Ostra hasn’t started, so frame contracts this month keep that capacity ours.",
        engage: "Little overlap. Ostra banks with state lenders that have no Iran history.",
        tighten: "If we pause a Dubai trader, Ostra is the likeliest to pick up that trader’s volume.",
        watch: "Waiting puts us in the same queue as Ostra for Asian resin once sanctions land." } },
    { name: "Brenmar Group", base: "European, plants in Poland and Egypt", exp: "Low exposure", cls: "",
      facts: [["Resin from the Gulf", "15%"], ["Share of MENA sales", "22%"]],
      hit: "Brenmar buys most of its resin in Europe and would gain from any rival that stalls.",
      meets: { resin: "Brenmar buys Korean resin too, so that grade could tighten. Singapore is the safer first source.",
        engage: "Brenmar’s trade association is already lobbying Treasury. A joint letter with ours would carry more weight.",
        tighten: "Brenmar already certifies its traders, so customers asking for clean supply chains will compare us with Brenmar.",
        watch: "Brenmar is the one that wins if we’re caught short." } },
    { name: "Saffron Electric", base: "Gulf assembler at Jebel Ali", exp: "High exposure", cls: " pill--red",
      facts: [["Resin from the Gulf", "90%"], ["Share of MENA sales", "9%"]],
      hit: "Saffron buys from the same three Dubai traders and hires two of the same feeders.",
      meets: { resin: "Saffron takes resin from the same Mesaieed plant. If that plant is shut out, Saffron will bid for our Gulf allocation, so we should move first.",
        engage: "No overlap. Saffron banks in Dubai.",
        tighten: "Two of its feeders share our technical manager. If we swap ours first, we get the better replacement slots.",
        watch: "Saffron shares our exposure with no plan, and trouble there could drag the traders down too." } }
  ];
  var rivalsEl = $("#rivals");
  function drawRivals(user) {
    var o = OPTIONS.filter(function (x) { return x.id === shown; })[0];
    rivalsEl.innerHTML = "";
    RIVALS.forEach(function (rv) {
      var li = el("li", "rival");
      var head = el("div", "rival__head");
      head.appendChild(el("h4", "rival__t", rv.name));
      head.appendChild(el("span", "pill" + rv.cls, rv.exp));
      li.appendChild(head);
      li.appendChild(el("p", "rival__base", rv.base));
      var dl = el("dl", "rival__facts");
      rv.facts.forEach(function (f) { var d = el("div"); d.appendChild(el("dt", null, f[0])); d.appendChild(el("dd", null, f[1])); dl.appendChild(d); });
      li.appendChild(dl);
      li.appendChild(el("p", "rival__hit", rv.hit));
      var m = el("div", "rival__meets" + (user && !REDUCE ? " is-swap" : ""));
      m.appendChild(el("b", null, o.if));
      m.appendChild(el("p", null, rv.meets[o.id]));
      li.appendChild(m);
      rivalsEl.appendChild(li);
    });
  }

  function paintCards() {
    olist.classList.add("has-pick"); // one is always chosen, so the others step back
    OPTIONS.forEach(function (o) {
      var on = o.id === shown;
      cardEls[o.id].classList.toggle("is-on", on);
      cardEls[o.id].setAttribute("aria-pressed", String(on));
    });
  }
  paintCards();
  drawRivals(false);

  function showPlan(id, user) {
    var o = OPTIONS.filter(function (x) { return x.id === id; })[0], p = PLANS[id];
    var wasMeta = $$(".plan__meta dd", panel).map(function (e) { return e.textContent; });
    panel.innerHTML = "";
    // the card stays put; only what's in it fades in, so switching plans doesn't jolt
    if (user) { panel.classList.remove("is-swap"); void panel.offsetWidth; panel.classList.add("is-swap"); }

    var top = el("div", "plan__top");
    var tl = el("div", "plan__head");
    tl.appendChild(el("h3", "plan__t", o.title));
    tl.appendChild(el("p", "plan__line", o.detail));
    top.appendChild(tl);
    var send = el("button", "btn btn--primary btn--sm", "Send to workflows");
    send.type = "button";
    send.addEventListener("click", function () { DB.toast(p.steps.length + " tasks sent to workflows for " + p.lead + " to staff."); });
    top.appendChild(send);
    panel.appendChild(top);

    // costs and benefits beside who runs it
    var net = o.protects - o.cost, meta = el("dl", "plan__meta");
    [["Costs", DB.money(o.cost), o.costNote], ["Protects", o.protects ? DB.money(o.protects) : "$0"], ["Net", (net < 0 ? "−" : "") + DB.money(Math.abs(net)), null, net < 0],
     ["Lead", p.lead], ["First move by", p.first], ["Team hours", p.hours.toLocaleString("en-US")]].forEach(function (m) {
      var d = el("div"); d.appendChild(el("dt", null, m[0]));
      var dd = el("dd", m[3] ? "red" : null, m[1]); d.appendChild(dd);
      if (m[2]) d.appendChild(el("small", null, m[2]));
      meta.appendChild(d);
    });
    panel.appendChild(meta);
    $$("dd", meta).forEach(function (e, i) { CountFrom(e, wasMeta[i]); }); // costs, protects, net, and hours count to the new option's

    // for and against, side by side
    var pc = el("div", "plan__pc");
    [["Arguments for", o.pros, "pro"], ["Arguments against", o.cons, "con"]].forEach(function (gp) {
      var col = el("div");
      col.appendChild(el("p", "option__pclabel", gp[0]));
      var ul = el("ul", "option__list option__list--" + gp[2]);
      gp[1].forEach(function (t) { ul.appendChild(el("li", null, t)); });
      col.appendChild(ul); pc.appendChild(col);
    });
    panel.appendChild(pc);
    var tlk = el("p", "plan__sub"); tlk.appendChild(el("b", null, "Implementation Timeline"));
    tlk.appendChild(el("span", null, "Built from your teams’ free hours and this quarter’s calendar."));
    panel.appendChild(tlk);

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
    senate: { vals: [0, 0, 0, 4, 6, 7, 9, 12, 16, 20, 23, 26, 34], fmt: function (v) { return String(Math.round(v)); }, min: 0, max: 40, ticks: [0, 20, 40] },
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

  /* ---------- signposts: where each stands, what it would do to the chance, and an alert you can turn on ---------- */
  var POSTS = [
    { id: "vote", t: "The sanctions bill clears the Banking Committee", now: "In committee, with 34 co-sponsors", effect: "Chance rises to about 52%", up: true, checked: 4 },
    { id: "polymer", t: "A Gulf polymer maker is named in a designation", now: "None named so far", effect: "Chance rises to about 60%", up: true, checked: 11 },
    { id: "sdn", t: "Iran-linked designations in a week", now: "27 last week, against a line of 40", gauge: 27 / 40, effect: "Past 40, chance rises to about 50%", up: true, checked: 26 },
    { id: "brent", t: "Brent crude falls below $85", now: "$93 this morning", effect: "Chance rises to about 47%", up: true, checked: 7 },
    { id: "waivers", t: "The November 1 waivers are renewed unchanged", now: "Due in 25 days", effect: "Chance falls to about 30%", up: false, checked: 52 },
    { id: "muscat", t: "Muscat sets a date for a second round of talks", now: "No date yet", effect: "Chance falls to about 25%", up: false, checked: 18 }
  ];
  var AKEY = "daybreak.memo.alerts", alerts = { vote: true, polymer: true };
  try { var sa = JSON.parse(localStorage.getItem(AKEY) || "null"); if (sa) alerts = sa; } catch (e) {}
  var posts = $("#posts"), ages = [];
  function ago(m) { return m < 1 ? "Checked just now" : m < 60 ? "Checked " + m + " min ago" : "Checked " + Math.floor(m / 60) + " hr ago"; }
  POSTS.forEach(function (sp) {
    var li = el("li", "post");
    var main = el("div", "post__main");
    main.appendChild(el("h3", "post__t", sp.t));
    main.appendChild(el("p", "post__now", sp.now));
    if (sp.gauge != null) {
      var g = el("span", "post__gauge"); g.setAttribute("aria-hidden", "true");
      var gi = el("i"); gi.style.setProperty("--v", sp.gauge); g.appendChild(gi); main.appendChild(g);
    }
    li.appendChild(main);
    var side = el("div", "post__side");
    side.appendChild(el("span", "pill" + (sp.up ? " pill--red" : " pill--green"), sp.effect));
    var age = el("span", "post__age", ago(sp.checked)); side.appendChild(age); ages.push([age, sp]);
    // a bell: outlined while off, filled (and rung once) when the alert is on
    var b = el("button", "post__alert"); b.type = "button";
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="bell__body" d="M12 3.2a5.6 5.6 0 0 0-5.6 5.6v3.3c0 .9-.3 1.8-.9 2.5l-1 1.3c-.5.6-.1 1.4.7 1.4h13.6c.8 0 1.2-.8.7-1.4l-1-1.3a4 4 0 0 1-.9-2.5V8.8A5.6 5.6 0 0 0 12 3.2Z"/><path class="bell__clap" d="M9.6 19.4a2.5 2.5 0 0 0 4.8 0"/></svg>';
    function paint() {
      var on = !!alerts[sp.id];
      b.setAttribute("aria-pressed", String(on));
      b.setAttribute("aria-label", (on ? "Alert on: " : "Alert me: ") + sp.t);
      b.title = on ? "Alert on. Select to turn it off." : "Alert me when this moves";
      li.classList.toggle("is-alert", on);
    }
    b.addEventListener("click", function () {
      alerts[sp.id] = !alerts[sp.id];
      try { localStorage.setItem(AKEY, JSON.stringify(alerts)); } catch (e) {}
      paint();
      if (alerts[sp.id] && !REDUCE) { b.classList.remove("is-ring"); void b.offsetWidth; b.classList.add("is-ring"); }
    });
    paint();
    side.appendChild(b);
    li.appendChild(side);
    posts.appendChild(li);
  });
  // the checks keep coming: each signpost's age ticks up, and every so often one is checked again
  setInterval(function () {
    if (document.hidden) return;
    ages.forEach(function (a, i) {
      a[1].checked = (i === Math.floor(Math.random() * ages.length) && a[1].checked > 20) ? 0 : a[1].checked + 1;
      a[0].textContent = ago(a[1].checked);
    });
  }, 60000);

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
  drawMix(); drawPath(); placeTracks(); placeView(); showPlan("resin", false);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeTracks(); placeView(); });
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { figs.forEach(draw); drawMix(); setVB(vb); placeTracks(); placeView(); }, 120);
  });

  // figures make their entrance the first time they scroll into view
  Reveal(".mix, .fall, .trend, .posts, .gaps, #plan");
  CountIn(".bl__p, .figs dd"); // the headline odds and money count up on first view
})();
