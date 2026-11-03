/* The Red Sea demo's one source of truth: what's happening, what it hits at Halvorsen, and who can respond.
   All three demo pages read it (at a glance, the report, the tree), as of Wednesday 1 April 2026 with a horizon
   to 1 October. `node` points into the decomposition (redsea-lattice.js); keep each event's `p` equal to that
   node's chance in tools/redsea-lattice.py (CITED). Money is in $M over the six months; every figure is
   illustrative. */
window.RS = (function () {
  var EVENTS = [
    { id: "attacks", node: "n21", watch: true, p: 46, was: 31,
      name: "Houthi attacks resume at scale",
      plain: "Eight or more attacks or near-misses on merchant ships in a month, by 1 July",
      why: "Iranian weapons shipments intercepted twice in March; Houthi statements name shipping again",
      hist: [22, 24, 23, 25, 27, 29, 31, 46], hits: ["inbound", "outbound", "freight"] },
    { id: "premium", node: "n76", watch: true, p: 41, was: 35,
      name: "War-risk insurance tops 1% of hull value",
      plain: "Insurers quote more than 1% of a ship's value per Red Sea transit, May to September",
      why: "Lloyd's market widened the listed area on 24 March",
      hist: [28, 29, 31, 30, 32, 33, 35, 41], hits: ["freight", "outbound"] },
    { id: "cape", node: "n79", watch: true, p: 64, was: 62,
      name: "Big carriers stay on the Cape route",
      plain: "MSC keeps every Asia-Europe service going around Africa through mid-September",
      why: "Carriers that tried Suez in February have quietly gone back to the Cape",
      hist: [70, 69, 66, 63, 60, 61, 62, 64], hits: ["inbound", "freight"] },
    { id: "cables", node: "n138", watch: false, p: 21, was: 12, spike: true,
      name: "Undersea cables cut in the Red Sea",
      plain: "At least one telecom cable crossing the Red Sea is damaged before October",
      why: "Ships dragging anchors near Hodeidah; repair ships can't get insurance to work there",
      hist: [9, 10, 9, 11, 10, 12, 12, 21], hits: ["systems"] },
    { id: "strike", node: "n27", watch: false, p: 9, was: 4, spike: true,
      name: "Suez Canal pilots strike",
      plain: "A pilots' stoppage halts transits through the canal, before mid-September",
      why: "Pay talks broke down on 27 March as canal revenue fell",
      hist: [3, 3, 4, 3, 4, 4, 4, 9], hits: ["inbound", "outbound"] },
    { id: "mines", node: "n154", watch: false, p: 6, was: 5, swan: true,
      name: "Sea mines found in the shipping lanes",
      plain: "A naval mine is found or goes off in Red Sea lanes or port approaches",
      why: "Unlikely, but it would shut the route outright for weeks",
      hist: [4, 4, 5, 4, 5, 5, 5, 6], hits: ["inbound", "outbound", "freight"] }
  ];
  // the one easing event the report weighs against the rest
  var EASE = { id: "ceasefire", node: "n2569", p: 18, was: 22, name: "A Gaza truce takes the heat out of the attacks" };

  var ASSETS = [
    { id: "inbound", tag: "Gebze's parts", name: "Parts from Asia into Gebze", where: "Busan and Kaohsiung to Gebze, Türkiye",
      what: "Compressors and control boards: 38 containers a week. The Cape adds 12 days; Gebze has 18 days of compressor stock.",
      short: "Gebze runs short of compressors in late May",
      loss: 7.9, bad: 34, cover: 18, need: 30 },
    { id: "outbound", tag: "Gulf shipments", name: "Shipments to Gulf customers", where: "Gebze to Jeddah and Dammam",
      what: "22 containers a week south through Suez. Late deliveries trip penalty clauses with the five largest accounts.",
      short: "Late orders for the five largest Gulf accounts",
      loss: 3.1, bad: 14, cover: 9, need: 16 },
    { id: "freight", tag: "freight costs", name: "Freight and insurance", where: "Every lane through the Red Sea",
      what: "War-risk premiums, Cape surcharges and bunker fuel for the longer voyages.",
      short: "Higher freight and war-risk bills",
      loss: 2.6, bad: 9 },
    { id: "systems", tag: "Gulf systems", name: "Gulf order systems", where: "Dubai and Dammam warehouses",
      what: "Order and warehouse systems run from Frankfurt over Red Sea cables. A cut slows every order and invoice.",
      short: "Orders crawl if the cables go",
      loss: 0.6, bad: 4 }
  ];

  var TEAMS = [
    { id: "logistics", name: "Logistics", lead: "Istanbul control tower",
      move: "Book Cape space now for six weeks of Asian parts", cost: 1.1, saves: 4.8, days: 5, hits: ["inbound", "freight"] },
    { id: "procurement", name: "Procurement", lead: "Supplier management",
      move: "Lift compressor stock from 18 to 35 days; fly control boards", cost: 0.9, saves: 3.6, days: 9, hits: ["inbound"] },
    { id: "accounts", name: "Gulf key accounts", lead: "Layla's team",
      move: "Serve Saudi orders from Dammam stock and warn the top five now", cost: 0.1, saves: 1.8, days: 2, hits: ["outbound"] },
    { id: "treasury", name: "Treasury and risk", lead: "Insurance desk",
      move: "Lock in war-risk cover and second-quarter freight rates", cost: 0.2, saves: 1.2, days: 4, hits: ["freight"] },
    { id: "it", name: "IT", lead: "Infrastructure",
      move: "Test the backup route for Gulf systems through the Gulf cable", cost: 0.05, saves: 0.5, days: 3, hits: ["systems"] }
  ];

  var sum = function (a, k) { return a.reduce(function (s, x) { return s + x[k]; }, 0); };
  var TOTAL = { loss: sum(ASSETS, "loss"), bad: 61, cost: sum(TEAMS, "cost"), saves: sum(TEAMS, "saves") };

  var byId = {};
  EVENTS.concat(ASSETS, TEAMS).forEach(function (x) { byId[x.id] = x; });

  function money(m) { return "$" + (m < 1 ? m.toFixed(2).replace(/0$/, "") : m >= 20 && m % 1 === 0 ? m : m.toFixed(1)) + "M"; }

  return { EVENTS: EVENTS, EASE: EASE, ASSETS: ASSETS, TEAMS: TEAMS, TOTAL: TOTAL, byId: byId, money: money,
           asOf: "Wednesday 1 April 2026", horizon: "1 October 2026" };
})();
