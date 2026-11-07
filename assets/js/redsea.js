/* The Red Sea demo's one source of truth: what's happening, what it hits at Halvorsen, who can respond, and the
   small loss model all three pages compute from (at a glance, the report and its plan lab, the tree), as of
   Wednesday, April 1, 2026 with a horizon to October 1. `node` points into the decomposition (redsea-lattice.js);
   keep each event's `p` equal to that node's chance in tools/redsea-lattice.py (CITED). Money is in $M over the six
   months; every figure is illustrative.

   The model: each asset loses a set amount if a given event happens (LOSS), events are independent, and each move
   removes a share of particular losses (TEAMS[..].cut). Moves that cut the same loss multiply, so they overlap
   rather than add up. stats() enumerates all 64 combinations of the six events exactly. */
window.RS = (function () {
  var EVENTS = [
    { id: "attacks", node: "n21", watch: true, p: 46, was: 31,
      name: "Houthi attacks resume at scale",
      plain: "Eight or more attacks or near-misses on merchant ships in a month, by July 1",
      hist: [22, 24, 23, 25, 27, 29, 31, 46], hits: ["inbound", "outbound", "freight"] },
    { id: "premium", node: "n76", watch: true, p: 41, was: 35,
      name: "War-risk insurance tops 1% of hull value",
      plain: "Insurers quote more than 1% of a ship’s value per Red Sea transit, May to September",
      hist: [28, 29, 31, 30, 32, 33, 35, 41], hits: ["freight"] },
    { id: "cape", node: "n79", watch: true, p: 64, was: 62,
      name: "Big carriers stay on the Cape route",
      plain: "MSC keeps every Asia-Europe service going around Africa through mid-September",
      hist: [70, 69, 66, 63, 60, 61, 62, 64], hits: ["freight"] },
    { id: "cables", node: "n138", watch: false, p: 21, was: 12, spike: true,
      name: "Undersea cables cut in the Red Sea",
      plain: "At least one telecom cable crossing the Red Sea is damaged before October",
      hist: [9, 10, 9, 11, 10, 12, 12, 21], hits: ["systems"] },
    { id: "strike", node: "n27", watch: false, p: 9, was: 4, spike: true,
      name: "Suez Canal pilots strike",
      plain: "A pilots’ stoppage halts transits through the canal, before mid-September",
      hist: [3, 3, 4, 3, 4, 4, 4, 9], hits: ["inbound", "outbound"] },
    { id: "mines", node: "n154", watch: false, p: 6, was: 5, swan: true,
      name: "Sea mines found in the shipping lanes",
      plain: "A naval mine is found or goes off in Red Sea lanes or port approaches",
      hist: [4, 4, 5, 4, 5, 5, 5, 6], hits: ["inbound", "outbound", "freight", "systems"] }
  ];
  // the one easing event the report weighs against the rest
  var EASE = { id: "ceasefire", node: "n2569", p: 18, was: 22, name: "A Gaza truce takes the heat out of the attacks" };

  var ASSETS = [
    { id: "inbound", tag: "Gebze’s parts", name: "Parts from Asia into Gebze", where: "Busan and Kaohsiung to Gebze, Türkiye",
      short: "Gebze runs short of compressors in late May", cover: 18 },
    { id: "outbound", tag: "Gulf shipments", name: "Shipments to Gulf customers", where: "Gebze to Jeddah and Dammam",
      short: "Late orders for the five largest Gulf accounts" },
    { id: "freight", tag: "freight costs", name: "Freight and insurance", where: "Every lane through the Red Sea",
      short: "Higher freight and war-risk bills" },
    { id: "systems", tag: "Gulf systems", name: "Gulf order systems", where: "Dubai and Dammam warehouses",
      short: "Orders slow down if the cables are cut" }
  ];
  // what each asset loses if an event happens ($M)
  var LOSS = {
    inbound: { attacks: 10.4, strike: 8, mines: 40 },
    outbound: { attacks: 3.6, strike: 6, mines: 15 },
    freight: { premium: 3.0, attacks: 1.5, cape: 0.6, mines: 5 },
    systems: { cables: 2.6, mines: 0.9 }
  };

  var TEAMS = [
    { id: "logistics", name: "Logistics", lead: "Istanbul control tower", days: 5, cost: 1.1,
      move: "Book Cape space now for six weeks of Asian parts", hits: ["inbound", "freight"],
      cut: { "inbound.attacks": 0.55, "inbound.mines": 0.5, "freight.attacks": 0.4, "freight.cape": 0.4 } },
    { id: "procurement", name: "Procurement", lead: "Supplier management", days: 9, cost: 0.9,
      move: "Lift compressor stock from 18 to 35 days; fly control boards", hits: ["inbound"],
      cut: { "inbound.attacks": 0.6, "inbound.strike": 0.7, "inbound.mines": 0.3 } },
    { id: "accounts", name: "Gulf key accounts", lead: "Layla’s team", days: 2, cost: 0.1,
      move: "Serve Saudi orders from Dammam stock and warn the top five now", hits: ["outbound"],
      cut: { "outbound.attacks": 0.55, "outbound.strike": 0.5, "outbound.mines": 0.3 } },
    { id: "treasury", name: "Treasury and risk", lead: "Insurance desk", days: 4, cost: 0.2,
      move: "Lock in war-risk cover and second-quarter freight rates", hits: ["freight"],
      cut: { "freight.premium": 0.7, "freight.attacks": 0.3, "freight.mines": 0.4 } },
    { id: "it", name: "IT", lead: "Infrastructure", days: 3, cost: 0.05,
      move: "Test the backup route for Gulf systems through the Gulf cable", hits: ["systems"],
      cut: { "systems.cables": 0.85, "systems.mines": 0.5 } }
  ];

  var byId = {};
  EVENTS.concat(ASSETS, TEAMS).forEach(function (x) { byId[x.id] = x; });

  // every outcome of the six events: its chance and each asset's loss under a plan (a list of team ids).
  // `p` overrides event chances in percent, e.g. { attacks: 60 }
  function outcomes(plan, p) {
    p = p || {};
    var out = [], n = EVENTS.length;
    for (var mask = 0; mask < (1 << n); mask++) {
      var pr = 1, on = {};
      EVENTS.forEach(function (e, k) {
        var q = (p[e.id] != null ? p[e.id] : e.p) / 100, hit = mask & (1 << k);
        pr *= hit ? q : 1 - q;
        if (hit) on[e.id] = 1;
      });
      var by = {}, total = 0;
      ASSETS.forEach(function (a) {
        var s = 0;
        Object.keys(LOSS[a.id]).forEach(function (ev) {
          if (!on[ev]) return;
          var keep = 1;
          plan.forEach(function (t) { keep *= 1 - (byId[t].cut[a.id + "." + ev] || 0); });
          s += LOSS[a.id][ev] * keep;
        });
        by[a.id] = s; total += s;
      });
      out.push({ pr: pr, total: total, by: by });
    }
    return out;
  }
  function quantile(list, key, q) {
    var s = list.map(function (o) { return [key ? o.by[key] : o.total, o.pr]; }).sort(function (a, b) { return a[0] - b[0]; });
    var c = 0;
    for (var i = 0; i < s.length; i++) { c += s[i][1]; if (c >= q - 1e-9) return s[i][0]; }
    return s[s.length - 1][0];
  }
  // expected loss, the bad case (1 in 20), each asset's share of both, the plan's cost, and every outcome for charts
  function stats(plan, p) {
    plan = plan || [];
    var o = outcomes(plan, p), r = { loss: 0, bad: quantile(o, null, 0.95), by: {}, outcomes: o };
    o.forEach(function (x) { r.loss += x.pr * x.total; });
    ASSETS.forEach(function (a) {
      var e = 0;
      o.forEach(function (x) { e += x.pr * x.by[a.id]; });
      r.by[a.id] = { loss: e, bad: quantile(o, a.id, 0.95) };
    });
    r.cost = plan.reduce(function (s, t) { return s + byId[t].cost; }, 0);
    return r;
  }

  var ALL = TEAMS.map(function (t) { return t.id; });
  var BASE = stats([]), FULL = stats(ALL);
  ASSETS.forEach(function (a) { a.loss = BASE.by[a.id].loss; a.bad = BASE.by[a.id].bad; });
  TEAMS.forEach(function (t) { t.saves = BASE.loss - stats([t.id]).loss; });
  var TOTAL = { loss: BASE.loss, bad: BASE.bad, cost: FULL.cost, saves: BASE.loss - FULL.loss, left: FULL.loss, badLeft: FULL.bad };

  // the report's three options
  var OPTIONS = [
    { id: "A", name: "Watch and wait", plan: [] },
    { id: "B", name: "Cover the parts gap", plan: ["logistics", "procurement", "accounts"] },
    { id: "C", name: "Cover the gap and lock in costs", plan: ALL.slice(), pick: true }
  ];

  function money(m) {
    m = Math.round(m * 100) / 100;
    if (m === 0) return "$0";
    if (m > 0 && m < 1) return "$" + m.toFixed(2).replace(/0$/, "") + "M";
    return "$" + (m >= 20 ? Math.round(m) : m.toFixed(1)) + "M";
  }

  return { EVENTS: EVENTS, EASE: EASE, ASSETS: ASSETS, TEAMS: TEAMS, LOSS: LOSS, OPTIONS: OPTIONS, TOTAL: TOTAL,
           ALL: ALL, byId: byId, stats: stats, money: money,
           asOf: "Wednesday, April 1, 2026", horizon: "October 1, 2026" };
})();
