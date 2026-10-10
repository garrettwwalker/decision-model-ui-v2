/* Workbench: a six-step workflow over one scenario.
   Events -> world model -> options -> consequences -> execution -> your data.
   Losses come from model.js (the Hormuz / Red Sea network model) plus the extra events below.
   All money is in $ millions; every figure is illustrative mockup data. */
(function () {
  var M = DBModel;
  var NS = "http://www.w3.org/2000/svg";
  var $ = function (k) { return document.querySelector('[data-out="' + k + '"]'); };
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function sv(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  var money = DB.money;
  function signed(m) { return (m >= 0 ? "+" : "−") + money(Math.abs(m)); }

  /* ================= Inputs: events ================= */
  var EVENTS_BASE = [
    { id: "hormuz", short: "Hormuz", name: "Strait of Hormuz closes", detail: "Closed to commercial traffic", p: 0.27, mag: 21, unit: "days", min: 3, max: 90, on: true,
      fused: { Judgment: 0.33, Telemetry: 0.26, Procedure: 0.22 }, hist: [0.06, 0.09, 0.18] },
    { id: "redsea", short: "Red Sea", name: "Red Sea shuts to traffic", detail: "Suez lost; Asia–Europe goes round the Cape", p: 0.34, mag: 30, unit: "days", min: 7, max: 120, on: true,
      fused: { Judgment: 0.38, Telemetry: 0.31, Procedure: 0.30 }, hist: [0.22, 0.25, 0.31] },
    { id: "strike", short: "Gebze strike", name: "Strike at the Gebze plant", detail: "Metalworkers' contract expires 1 November", p: 0.18, mag: 10, unit: "days", min: 2, max: 45, on: false,
      fused: { Judgment: 0.24, Telemetry: 0.12, Procedure: 0.19 }, hist: [0.05, 0.08, 0.14] },
    { id: "feeders", short: "Feeder sanctions", name: "Sanctions hit two ME4 feeders", detail: "They share a technical manager with listed tankers", p: 0.19, mag: 45, unit: "days", min: 7, max: 120, on: false,
      fused: { Judgment: 0.21, Telemetry: 0.15, Procedure: 0.22 }, hist: [0.11, 0.12, 0.16] },
    { id: "bunker", short: "Bunker spike", name: "Bunker fuel spikes", detail: "Fujairah VLSFO over this quarter", p: 0.30, mag: 35, unit: "% higher", min: 10, max: 80, on: false,
      fused: { Judgment: 0.27, Telemetry: 0.34, Procedure: 0.29 }, hist: [0.19, 0.24, 0.27] }
  ];
  var PRESETS = {
    morning: null,
    escalation: { hormuz: [true, 0.55, 45], redsea: [true, 0.40, 30], strike: [false], feeders: [true, 0.35, 60], bunker: [true, 0.60, 50] },
    worst: { hormuz: [true, 0.70, 60], redsea: [true, 0.70, 60], strike: [true, 0.60, 25], feeders: [true, 0.65, 90], bunker: [true, 0.75, 70] },
    calm: { hormuz: [true, 0.08, 10], redsea: [true, 0.15, 14], strike: [false], feeders: [false], bunker: [false] }
  };

  /* ================= Organization ================= */
  var TEAMS = {
    proc: { name: "Procurement", lead: "Aylin Demir", role: "VP Procurement", parent: "coo", heads: 34, spare: 45, load: 0.72 },
    log: { name: "Logistics", lead: "Tomas Varga", role: "VP Logistics", parent: "coo", heads: 52, spare: 60, load: 0.81 },
    plan: { name: "Supply planning", lead: "Priya Nair", role: "Director, S&OP", parent: "coo", heads: 21, spare: 40, load: 0.88 },
    gebze: { name: "Plant ops, Gebze", lead: "Murat Kaya", role: "Plant director", parent: "coo", heads: 1840, spare: 90, load: 0.93 },
    pune: { name: "Plant ops, Pune", lead: "Rohan Mehta", role: "Plant director", parent: "coo", heads: 1210, spare: 70, load: 0.77 },
    tre: { name: "Treasury", lead: "Hanne Sørli", role: "Group Treasurer", parent: "cfo", heads: 12, spare: 20, load: 0.55 },
    com: { name: "Commercial, MENA", lead: "Karim Haddad", role: "GM, MENA", parent: "cco", heads: 96, spare: 35, load: 0.64 }
  };
  var EXECS = [
    { id: "coo", title: "Chief Operating Officer", lead: "Ingrid Halvorsen" },
    { id: "cfo", title: "Chief Financial Officer", lead: "Lars Aune" },
    { id: "cco", title: "Chief Commercial Officer", lead: "Sofia Brandt" }
  ];

  /* ================= Decision space ================= */
  var ACTIONS = [
    { id: "bridge", name: "Bridge-buy resin from Singapore", helps: ["hormuz"], team: "proc", cost: 0.84, lead: 2, need: 8, hours: 30 },
    { id: "divert", name: "Divert Gulf sailings to Khor Fakkan", helps: ["hormuz"], team: "log", cost: 0.90, lead: 1, need: 9, hours: 40 },
    { id: "cover", name: "Bind war-risk cover and hedge bunker", helps: ["hormuz", "bunker"], team: "tre", cost: 1.36, lead: 1, need: 2, hours: 12 },
    { id: "stock", name: "Add 7 days of safety stock everywhere", helps: ["hormuz", "feeders"], team: "plan", cost: 0.77, lead: 10, need: 6, hours: 60 },
    { id: "sohar", name: "Pre-position 30,000 units at Sohar", helps: ["hormuz"], team: "com", cost: 1.10, lead: 6, need: 9, hours: 50 },
    { id: "cape", name: "Pre-book Cape routing for EU lanes", helps: ["redsea"], team: "log", cost: 0.45, lead: 3, need: 10, hours: 20 },
    { id: "buildahead", name: "Build 10 days ahead at Gebze", helps: ["strike"], team: "gebze", cost: 0.60, lead: 5, need: 23, hours: 120 },
    { id: "shiftpune", name: "Shift EU washer orders to Pune", helps: ["strike"], team: "pune", cost: 0.50, lead: 7, need: 23, hours: 80 },
    { id: "charter", name: "Charter replacement feeders", helps: ["feeders"], team: "log", cost: 0.70, lead: 4, need: 6, hours: 25 }
  ];
  var OVERTIME_COST = 0.04, OVERTIME_GAIN = 1.35;

  /* ================= World model: graph nodes ================= */
  var NODES = {
    busan: { x: 718, y: 92, name: "Busan", kind: "Port", lab: "left" },
    ningbo: { x: 705, y: 152, name: "Ningbo", kind: "Port", lab: "left" },
    kaoh: { x: 690, y: 214, name: "Kaohsiung", kind: "Port", lab: "left" },
    sing: { x: 612, y: 372, name: "Singapore", kind: "Port", alt: true },
    pune: { x: 500, y: 326, name: "Pune plant", kind: "Plant", touched: ["hormuz", "strike"] },
    khor: { x: 446, y: 258, name: "Khor Fakkan", kind: "Port", alt: true },
    hormuz: { x: 414, y: 200, name: "Hormuz", kind: "Chokepoint", touched: ["hormuz", "bunker"] },
    dubai: { x: 380, y: 262, name: "Dubai DC", kind: "Distribution centre", lab: "below", touched: ["hormuz"] },
    mesaieed: { x: 336, y: 236, name: "Mesaieed", kind: "Port", lab: "left", touched: ["hormuz"] },
    dammam: { x: 312, y: 200, name: "Dammam DC", kind: "Distribution centre", lab: "left", touched: ["hormuz", "feeders"] },
    jubail: { x: 300, y: 162, name: "Jubail", kind: "Port", lab: "left", touched: ["hormuz"] },
    bab: { x: 214, y: 316, name: "Bab el-Mandeb", kind: "Chokepoint", lab: "left", touched: ["redsea"] },
    suez: { x: 150, y: 168, name: "Suez", kind: "Chokepoint", lab: "left", touched: ["redsea"] },
    gebze: { x: 76, y: 76, name: "Gebze plant", kind: "Plant", touched: ["strike", "redsea", "hormuz"] }
  };
  var EDGES = [
    ["jubail", "hormuz", "hot"], ["mesaieed", "hormuz", "hot"], ["dammam", "hormuz", "hot"], ["dubai", "hormuz", "hot"],
    ["hormuz", "pune", "hot"], ["hormuz", "bab", "hot"], ["bab", "suez", "norm"], ["suez", "gebze", "norm"],
    ["busan", "ningbo", "norm"], ["ningbo", "kaoh", "norm"], ["kaoh", "sing", "norm"], ["sing", "hormuz", "hot"],
    ["sing", "khor", "alt"], ["khor", "dubai", "alt"], ["sing", "pune", "alt"], ["sing", "bab", "alt"]
  ];

  /* ================= World model: asset register ================= */
  // node: graph node; loss: key into the loss model; props: editable parameters; deps: asset ids it relies on
  var ASSETS = [
    // Suppliers
    { id: "s-jubail", type: "Supplier", name: "PP resin supply", where: "Jubail, Saudi Arabia", owner: "proc", node: "jubail", events: ["hormuz"], key: "4,200 t / month", deps: ["p-jubail", "c-hormuz"], attrs: [["Contract", "Annual, 3 renewals left"], ["Share of Gebze resin", "100%"], ["Alternate", "Singapore spot"]] },
    { id: "s-mesaieed", type: "Supplier", name: "HDPE resin supply", where: "Mesaieed, Qatar", owner: "proc", node: "mesaieed", events: ["hormuz"], key: "2,800 t / month", deps: ["p-mesaieed", "c-hormuz"], attrs: [["Share of Pune resin", "100%"], ["Alternate", "Singapore spot"]] },
    { id: "s-sing", type: "Supplier", name: "Spot resin (alternate)", where: "Singapore", owner: "proc", node: "sing", events: [], key: "7,000 t available", deps: ["p-sing"], attrs: [["Premium over contract", "+$118 / t"], ["Lead to Gebze", "14 d via Suez, 30 d via Cape"]] },
    { id: "s-ningbo", type: "Supplier", name: "TV contract manufacturer", where: "Ningbo, China", owner: "proc", node: "ningbo", events: ["hormuz"], key: "1,920 units / week", deps: ["p-ningbo", "l-ae7"], attrs: [["SKUs", "HV-OLED55, HV-OLED65"]] },
    { id: "s-kaoh", type: "Supplier", name: "Washer sub-assemblies", where: "Kaohsiung, Taiwan", owner: "proc", node: "kaoh", events: ["hormuz"], key: "3,400 units / week", deps: ["p-kaoh", "l-ae7"], attrs: [["SKUs", "HV-WM8 drums and motors"]] },
    { id: "s-busan", type: "Supplier", name: "Fridge compressors", where: "Busan, South Korea", owner: "proc", node: "busan", events: ["hormuz"], key: "2,150 units / week", deps: ["p-busan", "l-ae7"], attrs: [["SKUs", "HV-FR90"]] },
    { id: "s-bursa", type: "Supplier", name: "Seat and door assemblies", where: "Bursa, Türkiye", owner: "proc", node: "gebze", events: ["strike"], key: "Sole source", deps: [], attrs: [["Substitute tooling time", "14 weeks"], ["Union", "Same metalworkers' federation as Gebze"]] },
    // Ports
    { id: "p-jubail", type: "Port", name: "Jubail Commercial Port", where: "Saudi Arabia, inside the strait", owner: "log", node: "jubail", events: ["hormuz"], key: "Resin loading", deps: ["c-hormuz"], attrs: [["Dwell time", "62 h"]] },
    { id: "p-mesaieed", type: "Port", name: "Mesaieed", where: "Qatar, inside the strait", owner: "log", node: "mesaieed", events: ["hormuz"], key: "Resin loading", deps: ["c-hormuz"], attrs: [["Dwell time", "48 h"]] },
    { id: "p-jebelali", type: "Port", name: "Jebel Ali", where: "UAE, inside the strait", owner: "log", node: "dubai", events: ["hormuz"], key: "1,140 TEU / week", deps: ["c-hormuz", "l-ae7"], attrs: [["Dwell time", "71 h"], ["Halvorsen boxes in yard", "212"]] },
    { id: "p-dammam", type: "Port", name: "King Abdulaziz Port", where: "Dammam, inside the strait", owner: "log", node: "dammam", events: ["hormuz", "feeders"], key: "480 TEU / week", deps: ["c-hormuz", "l-me4"], attrs: [["Served by", "ME4 feeder shuttle"]] },
    { id: "p-khor", type: "Port", name: "Khor Fakkan", where: "UAE east coast, outside the strait", owner: "log", node: "khor", events: [], key: "600 TEU / week open", deps: [], attrs: [["Road to Dubai DC", "140 km"], ["Booking cutoff", "Thursday 14:00"]] },
    { id: "p-sohar", type: "Port", name: "Sohar", where: "Oman, outside the strait", owner: "log", node: null, events: [], key: "900 TEU / week open", deps: [], attrs: [["Road to Dubai DC", "260 km"]] },
    { id: "p-sing", type: "Port", name: "Singapore", where: "Transshipment hub", owner: "log", node: "sing", events: [], key: "1,140 TEU / week", deps: ["c-malacca"], attrs: [] },
    { id: "p-ningbo", type: "Port", name: "Ningbo-Zhoushan", where: "China", owner: "log", node: "ningbo", events: [], key: "420 TEU / week", deps: [], attrs: [] },
    { id: "p-kaoh", type: "Port", name: "Kaohsiung", where: "Taiwan", owner: "log", node: "kaoh", events: [], key: "260 TEU / week", deps: [], attrs: [] },
    { id: "p-busan", type: "Port", name: "Busan", where: "South Korea", owner: "log", node: "busan", events: [], key: "190 TEU / week", deps: [], attrs: [] },
    { id: "p-ambarli", type: "Port", name: "Ambarlı", where: "Istanbul, Türkiye", owner: "log", node: "gebze", events: ["redsea"], key: "Resin discharge for Gebze", deps: ["c-suez"], attrs: [] },
    // Chokepoints
    { id: "c-hormuz", type: "Chokepoint", name: "Strait of Hormuz", where: "Iran / Oman", owner: null, node: "hormuz", events: ["hormuz", "bunker"], key: "21 nm wide", deps: [], attrs: [["Halvorsen transits / week", "14"]] },
    { id: "c-bab", type: "Chokepoint", name: "Bab el-Mandeb", where: "Yemen / Djibouti", owner: null, node: "bab", events: ["redsea"], key: "Red Sea entrance", deps: [], attrs: [["Halvorsen transits / week", "11"]] },
    { id: "c-suez", type: "Chokepoint", name: "Suez Canal", where: "Egypt", owner: null, node: "suez", events: ["redsea"], key: "Asia–Europe", deps: ["c-bab"], attrs: [["Cape detour", "+11 days"]] },
    { id: "c-malacca", type: "Chokepoint", name: "Strait of Malacca", where: "Malaysia / Indonesia", owner: null, node: null, events: [], key: "Far East to Gulf", deps: [], attrs: [] },
    // Lanes
    { id: "l-ae7", type: "Lane", name: "AE7, Far East to Gulf", where: "Ningbo → Jebel Ali", owner: "log", node: "sing", events: ["hormuz"], key: "Weekly, 4 vessels", deps: ["c-malacca", "c-hormuz"], attrs: [["Carrier", "Long-term contract, 2 years"]] },
    { id: "l-me4", type: "Lane", name: "ME4 Gulf shuttle", where: "Jebel Ali → Dammam", owner: "log", node: "dammam", events: ["hormuz", "feeders"], key: "2 chartered feeders", deps: ["c-hormuz"], attrs: [["Technical manager", "Shared with 3 listed tankers"]] },
    { id: "l-resin-eu", type: "Lane", name: "Resin to Gebze", where: "Jubail → Ambarlı via Suez", owner: "log", node: "suez", events: ["hormuz", "redsea"], key: "Fortnightly", deps: ["c-hormuz", "c-bab", "c-suez"], attrs: [] },
    { id: "l-resin-in", type: "Lane", name: "Resin to Pune", where: "Mesaieed → Nhava Sheva", owner: "log", node: "pune", events: ["hormuz"], key: "Weekly", deps: ["c-hormuz"], attrs: [] },
    { id: "l-eu", type: "Lane", name: "Finished goods to Europe", where: "Ambarlı → Rotterdam", owner: "log", node: null, events: [], key: "Twice weekly", deps: [], attrs: [] },
    // Vessels
    { id: "v-asterion", type: "Vessel", name: "Asterion Dawn", where: "Loading at Jubail", owner: "log", node: "jubail", events: ["hormuz"], key: "4,200 t PP resin", deps: ["c-hormuz"], attrs: [["PO", "7731-044"], ["ETA Ambarlı", "29 Oct"]] },
    { id: "v-kestrel", type: "Vessel", name: "Kestrel Bay", where: "At anchor, Mesaieed", owner: "log", node: "mesaieed", events: ["hormuz"], key: "2,800 t HDPE", deps: ["c-hormuz"], attrs: [["PO", "7731-051"]] },
    { id: "v-sable", type: "Vessel", name: "Sable Orchid", where: "Inbound, central Gulf", owner: "log", node: "hormuz", events: ["hormuz"], key: "2,150 fridges", deps: ["c-hormuz"], attrs: [["PO", "4471-240"]] },
    { id: "v-corvane", type: "Vessel", name: "Corvane Tessaly", where: "Gulf of Oman, can divert", owner: "log", node: "khor", events: ["hormuz"], key: "1,920 TVs", deps: ["c-hormuz"], attrs: [["PO", "4471-208"], ["Voyage", "041W"]] },
    { id: "v-lumen", type: "Vessel", name: "Lumen Strait", where: "Arabian Sea, can divert", owner: "log", node: "sing", events: ["hormuz"], key: "3,400 washers", deps: ["c-hormuz"], attrs: [["PO", "4471-233"]] },
    // Plants
    { id: "f-gebze", type: "Plant", name: "Gebze plant", where: "Türkiye", owner: "gebze", node: "gebze", loss: "gebze", events: ["strike", "redsea", "hormuz"], key: "3 lines, 1,840 staff", deps: ["s-jubail", "l-resin-eu", "s-bursa"], props: ["plants.0.cover", "plants.0.rate"],
      attrs: [["Lines", "Washers, dishwashers, dryers"], ["Output", "6,200 units / day"], ["Labour contract", "Expires 1 November"]] },
    { id: "f-pune", type: "Plant", name: "Pune plant", where: "India", owner: "pune", node: "pune", loss: "pune", events: ["hormuz"], key: "2 lines, 1,210 staff", deps: ["s-mesaieed", "l-resin-in", "s-busan"], props: ["plants.1.cover", "plants.1.rate"],
      attrs: [["Lines", "Fridges, split AC"], ["Output", "4,100 units / day"], ["Spare capacity", "18%"]] },
    // Distribution centres
    { id: "d-dubai", type: "Distribution centre", name: "Dubai DC", where: "Jebel Ali free zone", owner: "com", node: "dubai", loss: "dubai", events: ["hormuz"], key: "Serves GCC retail", deps: ["p-jebelali", "s-ningbo", "s-kaoh"], props: ["dcs.0.cover", "dcs.0.rate"], attrs: [["SKUs held", "1,860"]] },
    { id: "d-dammam", type: "Distribution centre", name: "Dammam DC", where: "Saudi Arabia", owner: "com", node: "dammam", loss: "dammam", events: ["hormuz", "feeders"], key: "Serves KSA retail", deps: ["p-dammam", "l-me4"], props: ["dcs.1.cover", "dcs.1.rate"], attrs: [["SKUs held", "1,240"]] },
    { id: "d-rotterdam", type: "Distribution centre", name: "Rotterdam DC", where: "Netherlands", owner: "plan", node: null, events: ["redsea"], key: "Serves EU retail", deps: ["f-gebze", "l-eu"], attrs: [["SKUs held", "2,410"]] },
    { id: "d-mumbai", type: "Distribution centre", name: "Mumbai DC", where: "India", owner: "plan", node: null, events: ["hormuz"], key: "Serves India retail", deps: ["f-pune"], attrs: [["SKUs held", "980"]] },
    // Markets
    { id: "m-eu", type: "Market", name: "EU retail", where: "38% of revenue", owner: "com", node: null, events: ["redsea", "strike"], key: "$2.1B / year", deps: ["d-rotterdam"], attrs: [["Key accounts", "6 national chains"]] },
    { id: "m-india", type: "Market", name: "India retail", where: "21% of revenue", owner: "com", node: null, events: ["hormuz"], key: "$1.2B / year", deps: ["d-mumbai"], attrs: [] },
    { id: "m-mena", type: "Market", name: "MENA retail", where: "17% of revenue", owner: "com", node: null, events: ["hormuz", "feeders"], key: "$0.9B / year", deps: ["d-dubai", "d-dammam"], attrs: [["Penalty clauses", "2 partners, after 7 days short"]] },
    // Contracts
    { id: "k-warrisk", type: "Contract", name: "Gulf war-risk cover", where: "Lloyd's syndicate", owner: "tre", node: "hormuz", events: ["hormuz"], key: "$620M insured", deps: [], attrs: [["Premium", "0.45% of hull value"], ["Quote expires", "Wednesday"]] },
    { id: "k-bunker", type: "Contract", name: "Bunker hedge", where: "Fujairah VLSFO swaps", owner: "tre", node: null, events: ["bunker"], key: "40% of Q4 hedged", deps: [], attrs: [["Strike", "$690 / t"]] },
    { id: "k-union", type: "Contract", name: "Metalworkers' agreement", where: "Gebze", owner: "gebze", node: "gebze", events: ["strike"], key: "Expires 1 November", deps: [], attrs: [["Last offer", "+11% over 2 years"], ["Union ask", "+19%"]] },
    { id: "k-freight", type: "Contract", name: "AE7 freight contract", where: "Carrier, 2-year term", owner: "log", node: "sing", events: ["hormuz", "bunker"], key: "$38M / year", deps: [], attrs: [["Bunker adjustment", "Pass-through, quarterly"]] }
  ];
  var PROPS = {
    "plants.0.cover": ["Resin cover", "days", 0, 60, 1, "gebze.cover_days"],
    "plants.0.rate": ["Cost of a line stop", "$M/day", 0, 10, 0.1, "gebze.stop_cost_musd"],
    "plants.1.cover": ["Resin cover", "days", 0, 60, 1, "pune.cover_days"],
    "plants.1.rate": ["Cost of a line stop", "$M/day", 0, 10, 0.1, "pune.stop_cost_musd"],
    "dcs.0.cover": ["Stock cover", "days", 0, 60, 1, "dubai_dc.cover_days"],
    "dcs.0.rate": ["Lost margin when out", "$M/day", 0, 10, 0.1, "dubai_dc.lost_margin_musd"],
    "dcs.1.cover": ["Stock cover", "days", 0, 60, 1, "dammam_dc.cover_days"],
    "dcs.1.rate": ["Lost margin when out", "$M/day", 0, 10, 0.1, "dammam_dc.lost_margin_musd"],
    "divertCapture": ["Share of Dubai inbound it can absorb", "0–1", 0, 1, 0.05, "khor_fakkan.capture_share"],
    "trappedPerDay": ["Cost of cargo trapped inside", "$M/day", 0, 5, 0.1, "gulf.trapped_cost_musd"]
  };
  ASSETS.forEach(function (a) { if (a.id === "p-khor") a.props = ["divertCapture"]; if (a.id === "c-hormuz") a.props = ["trappedPerDay"]; });
  var EVNAME = {}, EVSHORT = {};
  EVENTS_BASE.forEach(function (e) { EVNAME[e.id] = e.name; EVSHORT[e.id] = e.short; });

  /* ================= State ================= */
  var events, params, plan, signals, datasets, custom, assign, start, overtime, preset;
  var sel = { kind: "asset", id: "c-hormuz" }, view = "network", typeFilter = "", query = "", sortBy = "net", teamFilter = "";
  function resetState() {
    events = EVENTS_BASE.map(function (e) { var c = M.clone(e); c.base = { p: e.p, mag: e.mag, on: e.on }; return c; });
    params = M.clone(M.BASE);
    plan = {}; signals = []; datasets = []; custom = []; assign = {}; start = {}; overtime = {}; preset = "morning";
  }
  resetState();
  function allAssets() { return ASSETS.concat(custom); }
  function assetById(id) { return allAssets().filter(function (a) { return a.id === id; })[0]; }
  function pOf(e) {
    var p = e.p;
    signals.forEach(function (s) { if (s.on && s.event === e.id) p += s.pts / 100; });
    return Math.max(0.01, Math.min(0.99, p));
  }
  function ownerOf(a) { return assign[a.id] || a.team; }

  /* ================= Loss engine ================= */
  function lossOf(H, A, P) {
    var inp = {
      status: H.hormuz != null ? "closed" : "open", dur: H.hormuz || 0, redsea: H.redsea != null,
      prem: 0.45, bunker: 690, divert: !!A.divert, bridge: !!A.bridge, cover: !!A.cover, buffer: A.stock ? 7 : 0
    };
    var r = M.run(inp, P);
    var n = { gebze: r.nodes.gebze.loss, pune: r.nodes.pune.loss, dubai: r.nodes.dubai.loss, dammam: r.nodes.dammam.loss };
    var stop = { gebze: r.nodes.gebze.stop, pune: r.nodes.pune.stop, dubai: r.nodes.dubai.stop, dammam: r.nodes.dammam.stop };
    if (A.sohar) { n.dubai *= 0.65; n.dammam *= 0.65; stop.dubai *= 0.65; stop.dammam *= 0.65; }
    var freight = r.parts.war + r.parts.trapped, eu = 0;
    if (H.redsea != null) eu = 0.35 * H.redsea * (A.cape ? 0.3 : 1);
    if (H.strike != null) {
      var lost = Math.max(0, H.strike - (A.buildahead ? 10 : 0)) * (A.shiftpune ? 0.7 : 1);
      n.gebze += P.plants[0].rate * lost; stop.gebze += lost;
    }
    if (H.feeders != null) {
      var dc = P.dcs[1], out = Math.max(0, H.feeders - (dc.cover + (A.stock ? 7 : 0))) * 0.6 * (A.charter ? 0.2 : 1);
      n.dammam += dc.rate * out; stop.dammam += out;
    }
    if (H.bunker != null) freight += (P.bunkerKt * 690 * H.bunker / 100) / 1000 * (A.cover ? 0.2 : 1);
    return { total: n.gebze + n.pune + n.dubai + n.dammam + freight + eu, nodes: n, stop: stop, freight: freight, eu: eu };
  }
  function active() { return events.filter(function (e) { return e.on; }); }
  // exact expectation over every combination of the active events; tweak lets one event's p/mag be overridden
  function expected(A, P, skip, tweak) {
    var act = active().filter(function (e) { return e.id !== skip; }), E = 0, nodes = { gebze: 0, pune: 0, dubai: 0, dammam: 0 };
    for (var m = 0; m < (1 << act.length); m++) {
      var H = {}, w = 1;
      act.forEach(function (e, i) {
        var p = pOf(e), mag = e.mag;
        if (tweak && tweak.id === e.id) { if (tweak.p != null) p = Math.max(0, Math.min(1, p + tweak.p)); if (tweak.mag != null) mag = e.mag * tweak.mag; }
        if (m & (1 << i)) { H[e.id] = mag; w *= p; } else w *= 1 - p;
      });
      if (!w) continue;
      var l = lossOf(H, A, P);
      E += w * l.total;
      for (var k in nodes) nodes[k] += w * l.nodes[k];
    }
    return { E: E, nodes: nodes };
  }
  function combos(A, P) {
    var act = active(), out = [];
    for (var m = 0; m < (1 << act.length); m++) {
      var H = {}, w = 1, names = [];
      act.forEach(function (e, i) { if (m & (1 << i)) { H[e.id] = e.mag; w *= pOf(e); names.push(e.short); } else w *= 1 - pOf(e); });
      out.push({ names: names, w: w, l0: lossOf(H, {}, P).total, l1: lossOf(H, A, P).total });
    }
    return out.sort(function (a, b) { return b.w - a.w; });
  }
  function worst(A, P) { var H = {}; active().forEach(function (e) { H[e.id] = e.mag; }); return lossOf(H, A, P); }
  function simulate(A, P, N, seed) {
    var rand = DB.rng(seed), act = active(), out = new Float64Array(N);
    for (var i = 0; i < N; i++) {
      var H = {};
      act.forEach(function (e) {
        if (rand() < pOf(e)) {
          var z = Math.sqrt(-2 * Math.log(Math.max(1e-9, rand()))) * Math.cos(2 * Math.PI * rand());
          H[e.id] = Math.max(e.min, e.mag * Math.exp(0.45 * z));
        }
      });
      out[i] = lossOf(H, A, P).total;
    }
    out.sort();
    return out;
  }
  var q = function (s, p) { return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
  function planList(A) { return ACTIONS.filter(function (a) { return A[a.id]; }); }
  function overtimeCost() { return Object.keys(overtime).filter(function (t) { return overtime[t]; }).length * OVERTIME_COST; }
  function costOf(A) { return ACTIONS.reduce(function (c, a) { return c + (A[a.id] ? a.cost : 0); }, 0) + overtimeCost(); }

  /* ================= Execution feasibility ================= */
  function spareOf(t) { return Math.round(TEAMS[t].spare * (overtime[t] ? OVERTIME_GAIN : 1)); }
  function lands(a) { return (start[a.id] || 0) + a.lead; }
  function readiness(A) {
    var load = {}, over = [], late = [];
    for (var t in TEAMS) load[t] = { hours: 0, actions: [] };
    planList(A).forEach(function (a) { var t = ownerOf(a); load[t].hours += a.hours; load[t].actions.push(a); if (lands(a) > a.need) late.push(a); });
    for (t in load) if (load[t].hours > spareOf(t)) over.push(t);
    return { over: over, late: late, load: load };
  }

  /* ================= Steps ================= */
  var tabs = document.querySelectorAll(".steps__tab");
  function showStep(id) {
    tabs.forEach(function (t) { t.setAttribute("aria-selected", String(t.getAttribute("data-step") === id)); });
    document.querySelectorAll("[data-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== id; });
    render(true);
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { showStep(t.getAttribute("data-step")); }); });
  function goTo(step) { showStep(step); window.scrollTo({ top: document.querySelector(".steps").getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" }); }

  /* ================= 1. Events ================= */
  var evBox = document.getElementById("events");
  function spark(e) {
    // 90 days of forecast history, ending at Daybreak's forecast this morning
    var rand = DB.rng(e.id.length * 97 + 13), pts = [], h = e.hist, n = 30;
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1), seg = Math.min(2, Math.floor(t * 3)), k = t * 3 - seg;
      var target;
      var from = [h[0], h[1], h[2]][seg], to = [h[1], h[2], e.base.p][seg];
      target = from + (to - from) * k + (rand() - 0.5) * 0.02;
      pts.push(Math.max(0.01, target));
    }
    pts[n - 1] = e.base.p;
    var W = 120, H = 30, max = Math.max.apply(null, pts.concat([pOf(e)])) * 1.1;
    var s = sv("svg", { class: "spark", viewBox: "0 0 " + W + " " + H, "aria-hidden": "true" });
    s.appendChild(sv("path", { class: "spark__line", d: pts.map(function (p, i) { return (i ? "L" : "M") + (i / (n - 1) * (W - 8)).toFixed(1) + " " + (H - 2 - p / max * (H - 6)).toFixed(1); }).join(" ") }));
    var cy = H - 2 - pOf(e) / max * (H - 6);
    if (Math.abs(pOf(e) - e.base.p) > 0.005) s.appendChild(sv("path", { class: "spark__you", d: "M" + (W - 8) + " " + (H - 2 - e.base.p / max * (H - 6)).toFixed(1) + " L" + (W - 3) + " " + cy.toFixed(1) }));
    s.appendChild(sv("circle", { class: "spark__dot", cx: W - 3, cy: cy.toFixed(1), r: 2.6 }));
    return s;
  }
  function buildEvents() {
    evBox.textContent = "";
    events.forEach(function (e) {
      var card = el("article", { class: "event" + (e.on ? " is-on" : "") });
      var top = el("label", { class: "switch event__switch" });
      var txt = el("span", { class: "switch__text" }, e.name);
      txt.appendChild(el("small", null, e.detail));
      top.appendChild(txt);
      var cb = el("input", { type: "checkbox" }); cb.checked = e.on;
      top.appendChild(cb); top.appendChild(el("span", { class: "switch__ui", "aria-hidden": "true" }));
      card.appendChild(top);
      var body = el("div", { class: "event__body" });
      var trend = el("div", { class: "event__trend" });
      var sp = el("div", { class: "event__spark" });
      trend.appendChild(sp);
      var contrib = el("p", { class: "event__contrib" });
      trend.appendChild(contrib);
      body.appendChild(trend);
      var pf = el("label", { class: "field" });
      var pt = el("span", { class: "field__top" }, "Probability");
      var pv = el("span", { class: "field__val" }); pt.appendChild(pv); pf.appendChild(pt);
      var pr = el("input", { type: "range", min: 1, max: 95, step: 1, value: Math.round(e.p * 100) }); pf.appendChild(pr);
      body.appendChild(pf);
      var mf = el("label", { class: "field" });
      var mt = el("span", { class: "field__top" }, e.unit === "days" ? "How long" : "How much");
      var mv = el("span", { class: "field__val" }); mt.appendChild(mv); mf.appendChild(mt);
      var mr = el("input", { type: "range", min: e.min, max: e.max, step: 1, value: e.mag }); mf.appendChild(mr);
      body.appendChild(mf);
      var fz = el("p", { class: "event__fused" });
      body.appendChild(fz);
      var reset = el("button", { class: "event__reset", type: "button" }, "Back to Daybreak's forecast");
      reset.addEventListener("click", function () { e.p = e.base.p; e.mag = e.base.mag; pr.value = Math.round(e.p * 100); mr.value = e.mag; DB.fillRanges(card); sync(); changed("Reset " + e.short + " to Daybreak's forecast"); });
      body.appendChild(reset);
      card.appendChild(body);
      function sync() {
        pv.textContent = Math.round(pOf(e) * 100) + "%" + (Math.abs(pOf(e) - e.p) > 1e-9 ? " with your signals" : "");
        mv.textContent = e.mag + (e.unit.charAt(0) === "%" ? "" : " ") + e.unit;
        var parts = Object.keys(e.fused).map(function (k) { return k + " " + Math.round(e.fused[k] * 100) + "%"; });
        var moved = Math.round(e.p * 100) !== Math.round(e.base.p * 100) || e.mag !== e.base.mag;
        fz.textContent = (moved ? "You've overridden Daybreak (" + Math.round(e.base.p * 100) + "%, " + e.base.mag + (e.unit.charAt(0) === "%" ? "" : " ") + e.unit + "). " : "Daybreak's fused forecast. ") + "Engines: " + parts.join(", ") + ".";
        reset.hidden = !moved;
        sp.textContent = ""; sp.appendChild(spark(e));
        sp.title = "Last 90 days: " + Math.round(e.hist[0] * 100) + "% to " + Math.round(e.base.p * 100) + "%";
        if (e.on) {
          var add = expected({}, params).E - expected({}, params, e.id).E;
          contrib.innerHTML = ""; contrib.appendChild(el("b", null, signed(add))); contrib.appendChild(document.createTextNode(" to expected loss"));
        } else contrib.textContent = "Switched off";
        card.classList.toggle("is-on", e.on);
      }
      cb.addEventListener("change", function () { e.on = cb.checked; markPreset(null); changed("Event " + (e.on ? "on" : "off") + ": " + e.name); });
      pr.addEventListener("input", function () { e.p = pr.value / 100; markPreset(null); changed(); });
      mr.addEventListener("input", function () { e.mag = +mr.value; markPreset(null); changed(); });
      e._sync = sync;
      evBox.appendChild(card);
    });
    DB.fillRanges(evBox);
    events.forEach(function (e) { e._sync(); });
  }
  function markPreset(id) {
    preset = id;
    document.querySelectorAll("[data-preset]").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-preset") === id); });
  }
  document.querySelectorAll("[data-preset]").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.getAttribute("data-preset"), P = PRESETS[id];
      events.forEach(function (e) {
        if (!P) { e.on = e.base.on; e.p = e.base.p; e.mag = e.base.mag; return; }
        var v = P[e.id]; e.on = v[0]; if (v.length > 1) { e.p = v[1]; e.mag = v[2]; }
      });
      buildEvents(); markPreset(id);
      changed("Loaded preset: " + b.textContent);
    });
  });

  /* ================= 2. World model ================= */
  function get(o, path) { return path.split(".").reduce(function (x, k) { return x[k]; }, o); }
  function set(o, path, v) { var ks = path.split("."), last = ks.pop(); ks.reduce(function (x, k) { return x[k]; }, o)[last] = v; }
  function fmt(v, step) { var dp = step < 1 ? (String(step).split(".")[1] || "").length : 0; return (+v).toFixed(dp); }
  function teamName(t) { return t ? TEAMS[t].name : "Watched by Daybreak"; }
  function exposureOf(a, nodes) {
    if (a.loss) return { money: nodes[a.loss], text: money(nodes[a.loss]) };
    var on = active().map(function (e) { return e.id; });
    var hit = (a.events || []).filter(function (e) { return on.indexOf(e) > -1; });
    return { money: null, text: hit.length ? hit.map(function (h) { return EVSHORT[h]; }).join(", ") : "—", n: hit.length };
  }
  // selected graph nodes: the asset's own node plus its dependencies' nodes (and what depends on it)
  function traceNodes() {
    var ids = {}, edges = {};
    if (sel.kind === "asset") {
      var a = assetById(sel.id); if (!a) return { ids: ids, edges: edges };
      var seen = {};
      (function up(x, d) { if (!x || seen[x.id] || d > 3) return; seen[x.id] = 1; if (x.node) ids[x.node] = 1; (x.deps || []).forEach(function (id) { up(assetById(id), d + 1); }); })(a, 0);
      allAssets().forEach(function (b) { if ((b.deps || []).indexOf(a.id) > -1 && b.node) ids[b.node] = 1; });
    } else if (sel.kind === "team") {
      allAssets().forEach(function (b) { if (b.owner === sel.id && b.node) ids[b.node] = 1; });
    }
    EDGES.forEach(function (e, i) { if (ids[e[0]] && ids[e[1]]) edges[i] = 1; });
    return { ids: ids, edges: edges };
  }
  var graph = document.getElementById("graph");
  function drawGraph(nodeLoss) {
    graph.textContent = "";
    var on = active().map(function (e) { return e.id; }), tr = traceNodes(), tracing = Object.keys(tr.ids).length > 0;
    var max = Math.max(1, Math.max.apply(null, Object.keys(nodeLoss).map(function (k) { return nodeLoss[k]; })));
    EDGES.forEach(function (e, i) {
      var a = NODES[e[0]], b = NODES[e[1]];
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.abs(a.x - b.x) * 0.12;
      var at = { class: "gedge" + (tr.edges[i] ? " is-trace" : tracing ? " is-dim" : ""), d: "M" + a.x + " " + a.y + " Q" + mx + " " + my + " " + b.x + " " + b.y, "stroke-width": 1.6 };
      if (e[2] === "alt") { at.stroke = "rgba(127,224,198,0.55)"; at["stroke-dasharray"] = "5 5"; }
      else at.stroke = e[2] === "hot" ? "rgba(255,122,102,0.45)" : "rgba(232,238,242,0.2)";
      graph.appendChild(sv("path", at));
    });
    Object.keys(NODES).forEach(function (id) {
      var n = NODES[id], loss = nodeLoss[id] || 0;
      var touched = (n.touched || []).some(function (t) { return on.indexOf(t) > -1; });
      var r = 5 + (loss > 0.01 ? 15 * Math.sqrt(loss / max) : 0);
      var picked = sel.kind === "node" && sel.id === id || (sel.kind === "asset" && (assetById(sel.id) || {}).node === id);
      var g = sv("g", { class: "gnode" + (picked ? " is-selected" : "") + (tracing && !tr.ids[id] ? " is-dim" : ""), tabindex: 0, role: "button",
        "aria-label": n.name + (loss > 0.01 ? ", " + money(loss) + " expected loss" : "") + ". Inspect." });
      if (touched) g.appendChild(sv("circle", { class: "gnode__ring", cx: n.x, cy: n.y, r: r + 7 }));
      g.appendChild(sv("circle", { class: "gnode__halo", cx: n.x, cy: n.y, r: r + 4 }));
      g.appendChild(sv("circle", { class: "gnode__dot", cx: n.x, cy: n.y, r: r.toFixed(1),
        fill: loss > 0.01 ? "#ff7a66" : n.kind === "Chokepoint" ? "#ffb547" : n.alt ? "#7fe0c6" : "#9fb0bb" }));
      var anchor = n.lab ? "end" : "start";
      var tx = n.lab === "left" ? n.x - r - 9 : n.lab === "below" ? n.x - 10 : n.x + r + 9;
      var ty = n.lab === "below" ? n.y + r + 15 : n.y + 4;
      g.appendChild(sv("text", { x: tx, y: ty, "text-anchor": anchor }, n.name));
      if (loss > 0.01) g.appendChild(sv("text", { class: "gnode__val", x: tx, y: ty + 13, "text-anchor": anchor }, money(loss)));
      var pick = function () {
        var main = allAssets().filter(function (a) { return a.node === id && (a.type === "Plant" || a.type === "Distribution centre" || a.type === "Chokepoint"); })[0] ||
                   allAssets().filter(function (a) { return a.node === id && a.type === "Port"; })[0];
        sel = main ? { kind: "asset", id: main.id } : { kind: "node", id: id };
        renderWorld();
      };
      g.addEventListener("click", pick);
      g.addEventListener("keydown", function (k) { if (k.key === "Enter" || k.key === " ") { k.preventDefault(); pick(); } });
      graph.appendChild(g);
    });
  }
  var regBody = document.querySelector("#register tbody"), typesBox = document.getElementById("asset-types");
  var TYPE_ORDER = ["Supplier", "Port", "Chokepoint", "Lane", "Vessel", "Plant", "Distribution centre", "Market", "Contract", "Site"];
  function renderRegister(nodes) {
    var list = allAssets();
    typesBox.textContent = "";
    var all = el("button", { class: "chip-btn" + (typeFilter ? "" : " is-on"), type: "button" }, "All " + list.length);
    all.addEventListener("click", function () { typeFilter = ""; renderWorld(); });
    typesBox.appendChild(all);
    TYPE_ORDER.forEach(function (t) {
      var c = list.filter(function (a) { return a.type === t; }).length; if (!c) return;
      var b = el("button", { class: "chip-btn" + (typeFilter === t ? " is-on" : ""), type: "button" }, (t === "Distribution centre" ? "DCs" : t + "s").replace("Chokepoints", "Chokepoints") + " " + c);
      b.addEventListener("click", function () { typeFilter = typeFilter === t ? "" : t; renderWorld(); });
      typesBox.appendChild(b);
    });
    var ql = query.toLowerCase();
    var rows = list.filter(function (a) {
      if (typeFilter && a.type !== typeFilter) return false;
      if (!ql) return true;
      return (a.name + " " + a.where + " " + a.type + " " + teamName(a.owner) + " " + a.key).toLowerCase().indexOf(ql) > -1;
    });
    regBody.textContent = "";
    if (!rows.length) { var tr0 = el("tr"); tr0.appendChild(el("td", { colspan: 5, class: "register__empty" }, "No assets match. Clear the search or pick another type.")); regBody.appendChild(tr0); }
    rows.forEach(function (a) {
      var ex = exposureOf(a, nodes);
      var tr = el("tr", { class: (sel.kind === "asset" && sel.id === a.id ? "is-sel" : "") + (ex.money > 0.01 || ex.n ? " is-hot" : ""), tabindex: 0 });
      var c0 = el("td");
      c0.appendChild(el("b", null, a.name));
      if (a.custom) c0.appendChild(el("span", { class: "pill pill--warn register__yours" }, "Your data"));
      c0.appendChild(el("span", { class: "table__sub" }, a.where));
      tr.appendChild(c0);
      tr.appendChild(el("td", null, a.type));
      tr.appendChild(el("td", null, teamName(a.owner)));
      tr.appendChild(el("td", null, a.key));
      tr.appendChild(el("td", { class: "r" + (ex.money != null ? " money money--loss" : "") }, ex.text));
      var pick = function () { sel = { kind: "asset", id: a.id }; renderWorld(); };
      tr.addEventListener("click", pick);
      tr.addEventListener("keydown", function (k) { if (k.key === "Enter") pick(); });
      regBody.appendChild(tr);
    });
  }
  var orgBox = document.getElementById("org");
  function renderOrg() {
    var r = readiness(plan);
    orgBox.textContent = "";
    EXECS.forEach(function (x) {
      var col = el("div", { class: "org__col" });
      var head = el("div", { class: "org__exec" });
      head.appendChild(el("span", { class: "org__role" }, x.title));
      head.appendChild(el("b", null, x.lead));
      col.appendChild(head);
      var kids = el("ul", { class: "org__kids" });
      Object.keys(TEAMS).filter(function (t) { return TEAMS[t].parent === x.id; }).forEach(function (t) {
        var T = TEAMS[t], L = r.load[t], over = L.hours > spareOf(t);
        var owned = allAssets().filter(function (a) { return a.owner === t; }).length;
        var li = el("li");
        var card = el("button", { type: "button", class: "org__team" + (sel.kind === "team" && sel.id === t ? " is-sel" : "") + (over ? " is-over" : "") });
        card.appendChild(el("b", { class: "org__name" }, T.name));
        card.appendChild(el("span", { class: "org__lead" }, T.lead + ", " + T.role));
        var bar = el("span", { class: "team__bar" });
        var base = el("i", { class: "team__base" }); base.style.width = (T.load * 100) + "%";
        var add = el("i", { class: "team__add" }); add.style.width = Math.min(100 - T.load * 100, (L.hours / spareOf(t)) * (100 - T.load * 100)) + "%";
        bar.appendChild(base); bar.appendChild(add); card.appendChild(bar);
        card.appendChild(el("span", { class: "org__meta" }, T.heads.toLocaleString() + " people · " + owned + " assets · " + L.actions.length + " plan action" + (L.actions.length === 1 ? "" : "s")));
        card.addEventListener("click", function () { sel = { kind: "team", id: t }; renderWorld(); });
        li.appendChild(card); kids.appendChild(li);
      });
      col.appendChild(kids);
      orgBox.appendChild(col);
    });
  }
  var ins = document.getElementById("inspector");
  function linkBtn(text, fn) { var b = el("button", { type: "button", class: "ins-link" }, text); b.addEventListener("click", fn); return b; }
  // a list of linked assets, capped at six with a "show all" toggle
  function assetList(list) {
    var ul = el("ul", { class: "ins-list" });
    list.forEach(function (d, i) {
      var li = el("li"); if (i >= 6) li.hidden = true;
      li.appendChild(linkBtn(d.name, function () { sel = { kind: "asset", id: d.id }; renderWorld(); }));
      ul.appendChild(li);
    });
    if (list.length > 6) {
      var more = el("li"), b = linkBtn("Show all " + list.length, function () { ul.querySelectorAll("li[hidden]").forEach(function (x) { x.hidden = false; }); more.remove(); });
      b.classList.add("ins-more"); more.appendChild(b); ul.appendChild(more);
    }
    return ul;
  }
  function renderInspector(nodes, base) {
    ins.textContent = "";
    if (sel.kind === "team") {
      var t = sel.id, T = TEAMS[t], r = readiness(plan), L = r.load[t];
      $("type").textContent = "Team"; $("name").textContent = T.name;
      $("desc").textContent = T.lead + ", " + T.role + ". " + T.heads.toLocaleString() + " people. " + Math.round(T.load * 100) + "% committed this week.";
      var dl = el("dl", { class: "facts" });
      [["Spare hours this week", spareOf(t) + (overtime[t] ? " (with overtime)" : "")], ["Plan needs", L.hours + " hours"], ["Reports to", EXECS.filter(function (x) { return x.id === T.parent; })[0].lead]].forEach(function (f) {
        var d = el("div"); d.appendChild(el("dt", null, f[0])); d.appendChild(el("dd", null, f[1])); dl.appendChild(d);
      });
      ins.appendChild(dl);
      var ot = el("label", { class: "switch" });
      var ott = el("span", { class: "switch__text" }, "Authorize overtime"); ott.appendChild(el("small", null, "+35% capacity for " + money(OVERTIME_COST, 2)));
      ot.appendChild(ott);
      var oc = el("input", { type: "checkbox" }); oc.checked = !!overtime[t];
      oc.addEventListener("change", function () { overtime[t] = oc.checked; changed((oc.checked ? "Authorized" : "Cancelled") + " overtime for " + T.name); });
      ot.appendChild(oc); ot.appendChild(el("span", { class: "switch__ui", "aria-hidden": "true" }));
      ins.appendChild(ot);
      ins.appendChild(el("p", { class: "ins-h" }, "Owns"));
      ins.appendChild(assetList(allAssets().filter(function (a) { return a.owner === t; })));
      if (L.actions.length) {
        ins.appendChild(el("p", { class: "ins-h" }, "Plan actions"));
        var ul2 = el("ul", { class: "ins-list" });
        L.actions.forEach(function (a) { ul2.appendChild(el("li", null, a.name)); });
        ins.appendChild(ul2);
      }
      return;
    }
    if (sel.kind === "node") {
      var n = NODES[sel.id];
      $("type").textContent = n.kind; $("name").textContent = n.name; $("desc").textContent = "";
      return;
    }
    var a = assetById(sel.id); if (!a) return;
    $("type").textContent = a.type + (a.custom ? ", from your data" : "");
    $("name").textContent = a.name;
    $("desc").textContent = a.where + ". " + a.key + ".";
    var dl2 = el("dl", { class: "facts" });
    var ownerRow = el("div"); ownerRow.appendChild(el("dt", null, "Owner"));
    var dd = el("dd"); if (a.owner) dd.appendChild(linkBtn(teamName(a.owner), function () { sel = { kind: "team", id: a.owner }; renderWorld(); })); else dd.textContent = teamName(null);
    ownerRow.appendChild(dd); dl2.appendChild(ownerRow);
    (a.attrs || []).forEach(function (f) { var d = el("div"); d.appendChild(el("dt", null, f[0])); d.appendChild(el("dd", null, f[1])); dl2.appendChild(d); });
    if (a.loss) {
      [["Expected loss, doing nothing", money(base[a.loss])], ["Expected loss, with your plan", money(nodes[a.loss])]].forEach(function (f) {
        var d = el("div"); d.appendChild(el("dt", null, f[0])); d.appendChild(el("dd", { class: "money--loss" }, f[1])); dl2.appendChild(d);
      });
    }
    ins.appendChild(dl2);
    var on = active().map(function (e) { return e.id; });
    if ((a.events || []).length) {
      ins.appendChild(el("p", { class: "ins-h" }, "Exposed to"));
      var ex = el("div", { class: "ins-chips" });
      a.events.forEach(function (e) { ex.appendChild(el("span", { class: "pill " + (on.indexOf(e) > -1 ? "pill--loss" : "pill--quiet") }, EVSHORT[e] + (on.indexOf(e) > -1 ? "" : " (off)"))); });
      ins.appendChild(ex);
    }
    var deps = (a.deps || []).map(assetById).filter(Boolean);
    if (deps.length) {
      ins.appendChild(el("p", { class: "ins-h" }, "Depends on"));
      ins.appendChild(assetList(deps));
    }
    var users = allAssets().filter(function (b) { return (b.deps || []).indexOf(a.id) > -1; });
    if (users.length) {
      ins.appendChild(el("p", { class: "ins-h" }, "Relied on by"));
      ins.appendChild(assetList(users));
    }
    (a.props || []).forEach(function (path) {
      var p = PROPS[path], b = get(M.BASE, path), id = "p-" + path.replace(/\./g, "-");
      var w = el("div", { class: "prop" });
      var lab = el("label", { class: "prop__top", for: id });
      lab.appendChild(el("span", null, p[0]));
      var bl = el("span", { class: "prop__base" }, "baseline " + fmt(b, p[4]) + " " + p[1]);
      lab.appendChild(bl); w.appendChild(lab);
      var inp = el("input", { class: "num-input", id: id, type: "number", min: p[2], max: p[3], step: p[4], value: fmt(get(params, path), p[4]) });
      function sync() { var c = Math.abs(get(params, path) - b) > 1e-9; inp.classList.toggle("is-changed", c); bl.classList.toggle("is-changed", c); }
      inp.addEventListener("change", function () {
        var v = parseFloat(inp.value); if (isNaN(v)) return;
        set(params, path, Math.max(p[2], Math.min(p[3], v))); sync();
        changed("Edited " + p[5] + " to " + fmt(get(params, path), p[4]));
      });
      sync(); w.appendChild(inp); ins.appendChild(w);
    });
  }
  function renderWorld() {
    var e = expected(plan, params), b = expected({}, params);
    document.querySelectorAll("[data-view]").forEach(function (v) { v.hidden = v.getAttribute("data-view") !== view; });
    var on = active().map(function (x) { return x.id; });
    var hit = allAssets().filter(function (a) { return (a.events || []).some(function (x) { return on.indexOf(x) > -1; }); }).length;
    $("asset-count").textContent = allAssets().length + " assets, " + Object.keys(TEAMS).length + " teams. " + hit + " assets exposed to the events you've switched on.";
    if (view === "network") drawGraph(e.nodes);
    if (view === "assets") renderRegister(e.nodes);
    if (view === "org") renderOrg();
    renderInspector(e.nodes, b.nodes);
  }
  document.querySelectorAll('input[name="wview"]').forEach(function (r) { r.addEventListener("change", function () { view = r.value; renderWorld(); }); });
  document.getElementById("asset-q").addEventListener("input", function (e) { query = e.target.value; renderWorld(); });

  /* ================= 3. Options ================= */
  var opBody = document.querySelector("#options tbody"), opTeam = document.getElementById("op-team");
  Object.keys(TEAMS).forEach(function (t) { opTeam.appendChild(el("option", { value: t }, TEAMS[t].name)); });
  document.getElementById("op-sort").addEventListener("change", function (e) { sortBy = e.target.value; renderOptions(); });
  opTeam.addEventListener("change", function (e) { teamFilter = e.target.value; renderOptions(); });
  function renderOptions() {
    opBody.textContent = "";
    var act = active().map(function (e) { return e.id; });
    var rows = ACTIONS.map(function (a) {
      var with_ = M.clone(plan), without = M.clone(plan);
      with_[a.id] = true; delete without[a.id];
      var value = expected(without, params).E - expected(with_, params).E;
      return { a: a, value: value, net: value - a.cost, relevant: a.helps.some(function (h) { return act.indexOf(h) > -1; }) };
    }).filter(function (r) { return !teamFilter || ownerOf(r.a) === teamFilter; });
    rows.sort(function (x, y) {
      if (sortBy === "cost") return x.a.cost - y.a.cost;
      if (sortBy === "lead") return x.a.lead - y.a.lead;
      return y[sortBy] - x[sortBy];
    });
    rows.forEach(function (r) {
      var a = r.a;
      var tr = el("tr", { class: (plan[a.id] ? "is-in" : "") + (r.relevant ? "" : " is-idle") });
      var td = el("td");
      var cb = el("input", { type: "checkbox", "aria-label": "Include: " + a.name }); cb.checked = !!plan[a.id];
      cb.addEventListener("change", function () { if (cb.checked) plan[a.id] = true; else delete plan[a.id]; changed((cb.checked ? "Added: " : "Removed: ") + a.name); });
      td.appendChild(cb); tr.appendChild(td);
      tr.appendChild(el("td", { class: "options__name" }, a.name));
      tr.appendChild(el("td", { class: "options__helps" }, a.helps.map(function (h) { return EVSHORT[h]; }).join(", ")));
      tr.appendChild(el("td", { class: "r money" }, r.value > 0.005 ? money(r.value) : "—"));
      tr.appendChild(el("td", { class: "r money" }, money(a.cost, 2)));
      tr.appendChild(el("td", { class: "r money " + (r.net > 0 ? "money--safe" : "money--loss") }, r.value > 0.005 ? signed(r.net) : "—"));
      var lt = el("td");
      lt.appendChild(el("span", { class: "pill " + (lands(a) > a.need ? "pill--loss" : "pill--quiet") }, a.lead + "d, needed in " + a.need + "d"));
      tr.appendChild(lt);
      tr.appendChild(el("td", { class: "options__team" }, TEAMS[ownerOf(a)].name));
      opBody.appendChild(tr);
    });
    drawFrontier();
  }
  var frontier = document.getElementById("frontier");
  function allPlans() {
    var out = [];
    for (var m = 0; m < (1 << ACTIONS.length); m++) {
      var A = {};
      ACTIONS.forEach(function (a, i) { if (m & (1 << i)) A[a.id] = true; });
      var r = readiness(A);
      out.push({ A: A, cost: costOf(A), E: expected(A, params).E, ok: !r.over.length && !r.late.length, n: planList(A).length });
    }
    return out;
  }
  function drawFrontier() {
    var plans = allPlans(), E0 = expected({}, params).E;
    var x0 = 60, x1 = 620, y0 = 22, y1 = 250;
    var maxC = Math.max.apply(null, plans.map(function (p) { return p.cost; }));
    var maxE = Math.max(E0, 1);
    var sx = function (c) { return x0 + (x1 - x0) * c / maxC; }, sy = function (e) { return y1 - (y1 - y0) * e / maxE; };
    frontier.textContent = "";
    [0, 0.5, 1].forEach(function (f) {
      frontier.appendChild(sv("line", { x1: x0, x2: x1, y1: sy(maxE * f), y2: sy(maxE * f), class: "grid" }));
      frontier.appendChild(sv("text", { x: x0 - 8, y: sy(maxE * f) + 4, class: "axis", "text-anchor": "end" }, money(maxE * f, 0)));
    });
    [0, maxC / 2, maxC].forEach(function (c) { frontier.appendChild(sv("text", { x: sx(c), y: y1 + 18, class: "axis", "text-anchor": "middle" }, money(c, 1))); });
    frontier.appendChild(sv("text", { x: x1, y: y1 + 36, class: "axis", "text-anchor": "end" }, "Plan cost"));
    frontier.appendChild(sv("text", { x: x0, y: y0 - 8, class: "axis" }, "Expected loss"));
    var sorted = plans.slice().sort(function (a, b) { return a.cost - b.cost; }), best = Infinity, front = [];
    sorted.forEach(function (p) { if (p.E < best - 1e-9) { best = p.E; front.push(p); } });
    frontier.appendChild(sv("path", { class: "fline", d: front.map(function (p, i) { return (i ? "L" : "M") + sx(p.cost).toFixed(1) + " " + sy(p.E).toFixed(1); }).join(" ") }));
    plans.forEach(function (p) {
      var c = sv("circle", { cx: sx(p.cost).toFixed(1), cy: sy(p.E).toFixed(1), r: 3, class: p.ok ? "fp" : "fp fp--no", tabindex: -1 });
      c.appendChild(sv("title", null, (p.n ? planList(p.A).map(function (a) { return a.name; }).join("; ") : "Do nothing") +
        "\nCost " + money(p.cost, 2) + ", expected loss " + money(p.E) + ", net " + signed(E0 - p.E - p.cost) + (p.ok ? "" : "\nCan't be staffed or lands too late")));
      c.addEventListener("click", function () { plan = M.clone(p.A); changed("Adopted a plan from the frontier (" + p.n + " actions)"); });
      frontier.appendChild(c);
    });
    var mc = costOf(plan), me = expected(plan, params).E;
    frontier.appendChild(sv("circle", { cx: sx(mc), cy: sy(me), r: 8, class: "fp--mine" }));
    frontier.appendChild(sv("text", { x: Math.min(sx(mc) + 12, x1 - 60), y: sy(me) - 11, class: "axis axis--mine" }, "Your plan"));
    var bestNet = plans.reduce(function (b, p) { return (E0 - p.E - p.cost) > (E0 - b.E - b.cost) ? p : b; }, plans[0]);
    $("frontier-note").textContent = "Each dot is one combination of actions; hollow ones can't be staffed or land too late. The line is the cheapest way to reach each level of protection. The best plan saves " +
      money(Math.max(0, E0 - bestNet.E - bestNet.cost)) + " net, for " + money(bestNet.cost, 2) + ".";
  }
  function recommend(kind) {
    if (kind === "none") { plan = {}; changed("Cleared the plan"); return; }
    var plans = allPlans(), E0 = expected({}, params).E;
    var pool = kind === "staffed" ? plans.filter(function (p) { return p.ok; }) : plans;
    var best = pool.reduce(function (b, p) { return (E0 - p.E - p.cost) > (E0 - b.E - b.cost) ? p : b; }, pool[0]);
    plan = M.clone(best.A);
    changed(kind === "staffed" ? "Recommended the best plan that can be staffed in time" : "Recommended the best plan");
  }
  document.querySelectorAll("[data-recommend]").forEach(function (b) { b.addEventListener("click", function () { recommend(b.getAttribute("data-recommend")); }); });

  /* ================= 4. Consequences ================= */
  var MKT = [{ id: "EU", from: ["gebze"], extra: "eu" }, { id: "India", from: ["pune"] }, { id: "MENA", from: ["dubai", "dammam"] }];
  function renderConsequences() {
    var N = 4000, s0 = simulate({}, params, N, 7), s1 = simulate(plan, params, N, 7);
    var e0 = expected({}, params).E, e1 = expected(plan, params).E, cost = costOf(plan), net = e0 - e1 - cost;
    var w0 = worst({}, params), w1 = worst(plan, params), none0 = 0;
    for (var i = 0; i < N; i++) if (s0[i] < 0.01) none0++;
    var rows = [
      ["Expected loss", money(e0), money(e1), "loss"],
      ["Bad case, 1 in 20", money(q(s0, 0.95)), money(q(s1, 0.95))],
      ["If everything switched on happens", money(w0.total), money(w1.total)],
      ["Plan cost", "—", money(cost, 2)],
      ["If nothing happens, you've spent", "—", money(cost, 2)],
      ["Net value of the plan", "—", (net >= 0 ? "" : "−") + money(Math.abs(net)), net >= 0 ? "safe" : "loss"]
    ];
    var tb = document.getElementById("compare"); tb.textContent = "";
    rows.forEach(function (r) {
      var tr = el("tr"); tr.appendChild(el("th", { scope: "row" }, r[0]));
      tr.appendChild(el("td", { class: "r money" }, r[1]));
      tr.appendChild(el("td", { class: "r money" + (r[3] ? " money--" + r[3] : "") }, r[2]));
      tb.appendChild(tr);
    });
    drawHist(s0, s1);
    $("hist-note").textContent = "Dashed: doing nothing. Filled: your plan. Nothing goes wrong at all in " + Math.round(100 * none0 / N) + "% of futures, so those aren't drawn.";
    var mb = document.querySelector("#markets tbody"); mb.textContent = "";
    MKT.forEach(function (m) {
      var short0 = 0, short1 = 0, rev0 = 0, rev1 = 0;
      m.from.forEach(function (k) { short0 = Math.max(short0, w0.stop[k]); short1 = Math.max(short1, w1.stop[k]); rev0 += w0.nodes[k]; rev1 += w1.nodes[k]; });
      if (m.extra) { rev0 += w0[m.extra]; rev1 += w1[m.extra]; }
      var tr = el("tr"); tr.appendChild(el("td", null, m.id));
      tr.appendChild(el("td", { class: "r" }, Math.round(short1) + (Math.round(short0) !== Math.round(short1) ? " (was " + Math.round(short0) + ")" : "")));
      tr.appendChild(el("td", { class: "r money money--loss" }, money(rev1) + (Math.abs(rev0 - rev1) > 0.05 ? " (was " + money(rev0) + ")" : "")));
      mb.appendChild(tr);
    });
    var kn = document.getElementById("knock"); kn.textContent = "";
    var notes = [];
    if (w1.stop.dubai > 7 || w1.stop.dammam > 7) notes.push("MENA stock-outs over a week trigger late-delivery penalties with two retail partners.");
    if (w1.stop.gebze > 5) notes.push("A Gebze stop of more than five days pushes the EU washer launch back a season.");
    if (w1.freight > 10) notes.push("Freight and insurance overruns this size would breach the Q4 logistics budget.");
    if (!notes.length) notes.push("With this plan, no second-order breaches show up even if everything happens.");
    notes.forEach(function (n) { kn.appendChild(el("li", null, n)); });
    drawTornado(e1);
    var cb = document.querySelector("#combos tbody"); cb.textContent = "";
    var cs = combos(plan, params);
    cs.slice(0, 10).forEach(function (c) {
      var tr = el("tr");
      tr.appendChild(el("td", { class: "combos__what" }, c.names.length ? c.names.join(" + ") : "Nothing happens"));
      tr.appendChild(el("td", { class: "r" }, (c.w * 100 < 1 ? (c.w * 100).toFixed(1) : Math.round(c.w * 100)) + "%"));
      tr.appendChild(el("td", { class: "r money" }, money(c.l0)));
      tr.appendChild(el("td", { class: "r money " + (c.l1 < c.l0 - 0.05 ? "money--safe" : "") }, money(c.l1)));
      cb.appendChild(tr);
    });
    if (cs.length > 10) { var more = el("tr"); more.appendChild(el("td", { colspan: 4, class: "register__empty" }, cs.length - 10 + " less likely combinations not shown.")); cb.appendChild(more); }
  }
  var hist = document.getElementById("hist");
  function drawHist(s0, s1) {
    var bins = 28, x0 = 44, x1 = 510, y0 = 14, y1 = 190, bw = (x1 - x0) / bins;
    var hi = Math.max(1, q(s0, 0.99));
    function count(arr) { var c = new Array(bins).fill(0); for (var i = 0; i < arr.length; i++) { if (arr[i] < 0.01) continue; var k = Math.floor(arr[i] / hi * bins); if (k < bins) c[k]++; } return c; }
    var c0 = count(s0), c1 = count(s1), top = Math.max(1, Math.max.apply(null, c0.concat(c1)));
    hist.textContent = "";
    hist.appendChild(sv("line", { x1: x0, x2: x1, y1: y1, y2: y1, class: "grid" }));
    c0.forEach(function (c, i) { var h = (y1 - y0) * c / top; hist.appendChild(sv("rect", { x: x0 + i * bw + 1, y: y1 - h, width: bw - 2, height: h, fill: "none", stroke: "rgba(246,239,230,0.4)", "stroke-dasharray": "2 2" })); });
    c1.forEach(function (c, i) { var h = (y1 - y0) * c / top; hist.appendChild(sv("rect", { x: x0 + i * bw + 1, y: y1 - h, width: bw - 2, height: h, rx: 2, fill: "#f2683c", "fill-opacity": 0.85 })); });
    for (var t = 0; t <= 4; t++) hist.appendChild(sv("text", { x: x0 + (x1 - x0) * t / 4, y: y1 + 18, class: "axis", "text-anchor": "middle" }, money(hi * t / 4, 0)));
  }
  var tornado = document.getElementById("tornado");
  function drawTornado(E) {
    var act = active(), rows = [];
    act.forEach(function (e) {
      rows.push({ label: e.short + ", chance ±10 pts", lo: expected(plan, params, null, { id: e.id, p: -0.1 }).E, hi: expected(plan, params, null, { id: e.id, p: 0.1 }).E });
      rows.push({ label: e.short + ", severity ±25%", lo: expected(plan, params, null, { id: e.id, mag: 0.75 }).E, hi: expected(plan, params, null, { id: e.id, mag: 1.25 }).E });
    });
    rows.sort(function (a, b) { return (b.hi - b.lo) - (a.hi - a.lo); });
    rows = rows.slice(0, 8);
    var rowH = 24, x0 = 190, x1 = 500, y0 = 24, Hh = y0 + rows.length * rowH + 26;
    tornado.setAttribute("viewBox", "0 0 520 " + Math.max(120, Hh));
    tornado.textContent = "";
    if (!rows.length) { tornado.appendChild(sv("text", { x: 260, y: 60, class: "axis", "text-anchor": "middle" }, "Switch an event on to see what drives the loss.")); return; }
    var mn = Math.min.apply(null, rows.map(function (r) { return r.lo; }).concat([E])), mx = Math.max.apply(null, rows.map(function (r) { return r.hi; }).concat([E]));
    var pad = (mx - mn) * 0.08 || 1, lo = Math.max(0, mn - pad), hi = mx + pad;
    var sx = function (v) { return x0 + (x1 - x0) * (v - lo) / (hi - lo); };
    rows.forEach(function (r, i) {
      var y = y0 + i * rowH;
      tornado.appendChild(sv("text", { x: x0 - 10, y: y + 13, class: "tornado__lab", "text-anchor": "end" }, r.label));
      tornado.appendChild(sv("rect", { x: sx(Math.min(r.lo, E)), y: y + 2, width: Math.max(1, sx(E) - sx(Math.min(r.lo, E))), height: 15, rx: 3, class: "tbar tbar--lo" }));
      tornado.appendChild(sv("rect", { x: sx(E), y: y + 2, width: Math.max(1, sx(Math.max(r.hi, E)) - sx(E)), height: 15, rx: 3, class: "tbar tbar--hi" }));
    });
    tornado.appendChild(sv("line", { x1: sx(E), x2: sx(E), y1: y0 - 6, y2: y0 + rows.length * rowH, class: "tmid" }));
    tornado.appendChild(sv("text", { x: sx(E), y: y0 - 10, class: "axis axis--mine", "text-anchor": "middle" }, money(E)));
    tornado.appendChild(sv("text", { x: x0, y: y0 + rows.length * rowH + 18, class: "axis" }, money(lo)));
    tornado.appendChild(sv("text", { x: x1, y: y0 + rows.length * rowH + 18, class: "axis", "text-anchor": "end" }, money(hi)));
  }

  /* ================= 5. Execution ================= */
  function renderExecution() {
    var r = readiness(plan), box = document.getElementById("teams"); box.textContent = "";
    Object.keys(TEAMS).forEach(function (t) {
      var T = TEAMS[t], L = r.load[t], over = L.hours > spareOf(t);
      var card = el("article", { class: "team" + (over ? " is-over" : "") + (L.actions.length ? "" : " is-idle") });
      var head = el("div", { class: "team__head" });
      head.appendChild(el("h3", null, T.name));
      head.appendChild(el("span", { class: "team__lead" }, T.lead + ", " + T.role));
      card.appendChild(head);
      var bar = el("div", { class: "team__bar", role: "img", "aria-label": T.name + ": " + Math.round(T.load * 100) + "% already committed; the plan needs " + L.hours + " of " + spareOf(t) + " spare hours" });
      var base = el("i", { class: "team__base" }); base.style.width = (T.load * 100) + "%";
      var add = el("i", { class: "team__add" }); add.style.width = Math.min(100 - T.load * 100, (L.hours / spareOf(t)) * (100 - T.load * 100)) + "%";
      bar.appendChild(base); bar.appendChild(add); card.appendChild(bar);
      card.appendChild(el("p", { class: "team__nums" }, "Plan needs " + L.hours + " of " + spareOf(t) + " spare hours" + (over ? ", " + (L.hours - spareOf(t)) + " too many" : "") + "."));
      var ot = el("label", { class: "team__ot" });
      var oc = el("input", { type: "checkbox" }); oc.checked = !!overtime[t];
      oc.addEventListener("change", function () { overtime[t] = oc.checked; changed((oc.checked ? "Authorized" : "Cancelled") + " overtime for " + T.name); });
      ot.appendChild(oc); ot.appendChild(document.createTextNode(" Overtime (+35%, " + money(OVERTIME_COST, 2) + ")"));
      card.appendChild(ot);
      box.appendChild(card);
    });
    var ab = document.querySelector("#assign tbody"); ab.textContent = "";
    var acts = planList(plan);
    if (!acts.length) {
      var tr0 = el("tr"); var td0 = el("td", { colspan: 5, class: "register__empty" }, "No actions in the plan yet. ");
      td0.appendChild(linkBtn("Build one in step 3", function () { goTo("options"); })); tr0.appendChild(td0); ab.appendChild(tr0);
    }
    acts.forEach(function (a) {
      var tr = el("tr");
      tr.appendChild(el("td", { class: "options__name" }, a.name));
      var tdo = el("td"), so = el("select", { class: "num-input", "aria-label": "Owner of " + a.name });
      Object.keys(TEAMS).forEach(function (t) { var o = el("option", { value: t }, TEAMS[t].name + (t === a.team ? " (default)" : "")); if (ownerOf(a) === t) o.selected = true; so.appendChild(o); });
      so.addEventListener("change", function () { if (so.value === a.team) delete assign[a.id]; else assign[a.id] = so.value; changed("Reassigned " + a.name + " to " + TEAMS[so.value].name); });
      tdo.appendChild(so); tr.appendChild(tdo);
      var tds = el("td"), ss = el("select", { class: "num-input", "aria-label": "Start of " + a.name });
      [0, 1, 2, 3, 5, 7].forEach(function (d) { var o = el("option", { value: d }, d === 0 ? "Today" : "Day " + d); if ((start[a.id] || 0) === d) o.selected = true; ss.appendChild(o); });
      ss.addEventListener("change", function () { start[a.id] = +ss.value; changed("Scheduled " + a.name + " to start " + (ss.value === "0" ? "today" : "day " + ss.value)); });
      tds.appendChild(ss); tr.appendChild(tds);
      tr.appendChild(el("td", { class: "r" }, a.lead + (a.lead === 1 ? " day" : " days")));
      var late = lands(a) > a.need;
      var tdl = el("td"); tdl.appendChild(el("span", { class: "pill " + (late ? "pill--loss" : "pill--safe") }, "Day " + lands(a) + (late ? ", " + (lands(a) - a.need) + "d late" : ", in time")));
      tr.appendChild(tdl);
      ab.appendChild(tr);
    });
    drawGantt();
  }
  var gantt = document.getElementById("gantt");
  function drawGantt() {
    var acts = planList(plan), H = 30, x0 = 250, x1 = 706, rowH = 28, y0 = 30;
    gantt.setAttribute("viewBox", "0 0 720 " + Math.max(120, y0 + acts.length * rowH + 24));
    gantt.textContent = "";
    var sx = function (d) { return x0 + (x1 - x0) * d / H; };
    [0, 7, 14, 21, 28].forEach(function (d) {
      gantt.appendChild(sv("line", { x1: sx(d), x2: sx(d), y1: y0 - 6, y2: y0 + Math.max(1, acts.length) * rowH, class: "grid" }));
      gantt.appendChild(sv("text", { x: sx(d), y: y0 - 12, class: "axis", "text-anchor": "middle" }, d === 0 ? "Today" : "Day " + d));
    });
    if (!acts.length) { gantt.appendChild(sv("text", { x: 360, y: 70, class: "axis", "text-anchor": "middle" }, "Add actions in step 3 to see the timeline.")); return; }
    acts.forEach(function (a, i) {
      var y = y0 + i * rowH + 4, late = lands(a) > a.need, s0 = start[a.id] || 0;
      gantt.appendChild(sv("text", { x: x0 - 12, y: y + 13, class: "gantt__name", "text-anchor": "end" }, a.name));
      gantt.appendChild(sv("rect", { x: sx(s0), y: y, width: Math.max(4, sx(lands(a)) - sx(s0)), height: 18, rx: 4, class: late ? "gbar gbar--late" : "gbar" }));
      gantt.appendChild(sv("line", { x1: sx(a.need), x2: sx(a.need), y1: y - 3, y2: y + 21, class: "gdead" }));
    });
    gantt.appendChild(sv("text", { x: x1, y: y0 + acts.length * rowH + 18, class: "axis", "text-anchor": "end" }, "Bar: from start to in place. Tick: deadline."));
  }

  /* ================= 6. Your data ================= */
  var csvRows = null, csvHead = null, csvName = "";
  function parseCSV(text) {
    var rows = [], row = [], cell = "", qd = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (qd) { if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') qd = false; else cell += ch; }
      else if (ch === '"') qd = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cell); cell = ""; if (row.some(function (c) { return c.trim(); })) rows.push(row); row = []; }
      else cell += ch;
    }
    row.push(cell); if (row.some(function (c) { return c.trim(); })) rows.push(row);
    return rows;
  }
  function loadCSV(text, name) {
    var rows = parseCSV(text);
    if (rows.length < 2) { $("csv-status").textContent = "That file has no data rows. It needs a header row and at least one row of data."; return; }
    csvHead = rows[0].map(function (h) { return h.trim(); }); csvRows = rows.slice(1); csvName = name;
    $("csv-status").textContent = name + ": " + csvRows.length + " rows, " + csvHead.length + " columns. Read in your browser; nothing was uploaded.";
    var prev = document.getElementById("csv-preview"); prev.textContent = "";
    var wrap = el("div", { class: "table-wrap" }), t = el("table", { class: "table table--tight" });
    var hr = el("tr"); csvHead.forEach(function (h) { hr.appendChild(el("th", { scope: "col" }, h)); });
    var th = el("thead"); th.appendChild(hr); t.appendChild(th);
    var tb = el("tbody");
    csvRows.slice(0, 6).forEach(function (r) { var tr = el("tr"); csvHead.forEach(function (_, i) { tr.appendChild(el("td", null, r[i] || "")); }); tb.appendChild(tr); });
    t.appendChild(tb); wrap.appendChild(t); prev.appendChild(wrap);
    var guess = { site: /site|location|node|plant/i, cover: /cover/i, rate: /cost|rate|margin/i };
    document.querySelectorAll("[data-map]").forEach(function (s) {
      var key = s.getAttribute("data-map"), picked = false; s.textContent = "";
      s.appendChild(el("option", { value: "" }, "Not mapped"));
      csvHead.forEach(function (h, i) { var o = el("option", { value: i }, h); if (!picked && guess[key].test(h)) { o.selected = true; picked = true; } s.appendChild(o); });
    });
    document.getElementById("csv-mapping").hidden = false;
  }
  var SITE_KEYS = { gebze: "plants.0", pune: "plants.1", dubai: "dcs.0", jebel: "dcs.0", dammam: "dcs.1" };
  document.getElementById("csv-file").addEventListener("change", function (e) {
    var f = e.target.files[0]; if (!f) return;
    var rd = new FileReader();
    rd.onload = function () { loadCSV(String(rd.result), f.name); };
    rd.readAsText(f);
  });
  document.getElementById("csv-sample").addEventListener("click", function () {
    loadCSV("site,inventory_days_of_cover,line_stop_cost_musd_per_day,as_of\nGebze plant,14,2.9,2026-10-09\nPune plant,6,2.3,2026-10-09\nDubai DC (Jebel Ali),11,2.1,2026-10-09\nDammam DC,4,0.9,2026-10-09\nSalalah cross-dock,9,0.6,2026-10-09\nIzmir spare-parts store,21,0.3,2026-10-09\n", "inventory_snapshot.csv");
  });
  document.getElementById("csv-apply").addEventListener("click", function () {
    var m = {}; document.querySelectorAll("[data-map]").forEach(function (s) { m[s.getAttribute("data-map")] = s.value === "" ? null : +s.value; });
    if (m.site == null) { $("csv-status").textContent = "Map the site column first, so each row can be matched to a site in the model."; return; }
    var before = expected(plan, params).E, applied = 0, added = [];
    csvRows.forEach(function (r, ri) {
      var siteName = (r[m.site] || "").trim(), site = siteName.toLowerCase(), key = null;
      if (!siteName) return;
      Object.keys(SITE_KEYS).forEach(function (k) { if (site.indexOf(k) > -1) key = SITE_KEYS[k]; });
      if (key) {
        if (m.cover != null && !isNaN(parseFloat(r[m.cover]))) { set(params, key + ".cover", parseFloat(r[m.cover])); applied++; }
        if (m.rate != null && !isNaN(parseFloat(r[m.rate]))) { set(params, key + ".rate", parseFloat(r[m.rate])); applied++; }
        return;
      }
      // a site the model doesn't know yet: register it as a new asset
      var id = "x-" + site.replace(/[^a-z0-9]+/g, "-");
      if (assetById(id)) return;
      var attrs = csvHead.map(function (h, i) { return [h, r[i] || ""]; }).filter(function (p, i) { return i !== m.site && p[1]; });
      custom.push({ id: id, type: "Site", name: siteName, where: "From " + csvName, owner: null, node: null, events: [], deps: [], custom: true,
        key: m.cover != null && r[m.cover] ? r[m.cover] + " days of cover" : "Imported", attrs: attrs });
      added.push(siteName);
    });
    datasets.push({ name: csvName, values: applied });
    var after = expected(plan, params).E, d = after - before;
    $("csv-status").textContent = "Applied " + applied + " values from " + csvName + "; expected loss " + (d >= 0 ? "rises " : "falls ") + money(Math.abs(d)) + "." +
      (added.length ? " Added " + added.length + " new asset" + (added.length > 1 ? "s" : "") + " to the register: " + added.join(", ") + ". Give them an owner and dependencies in step 2." : "");
    changed("Applied " + csvName + " (" + applied + " values" + (added.length ? ", " + added.length + " new assets" : "") + ")");
  });
  var sf = document.getElementById("signal-form"), evSel = sf.elements.event;
  EVENTS_BASE.forEach(function (e) { evSel.appendChild(el("option", { value: e.id }, e.name)); });
  sf.elements.pts.addEventListener("input", function () { var v = +sf.elements.pts.value; $("sig-pts").textContent = (v > 0 ? "+" : "") + v + " pts"; });
  sf.addEventListener("submit", function (e) {
    e.preventDefault();
    var s = { name: sf.elements.name.value.trim(), rule: sf.elements.rule.value.trim(), event: evSel.value, pts: +sf.elements.pts.value, on: true };
    if (!s.name || !s.rule) return;
    var h = 0; for (var i = 0; i < s.name.length; i++) h = (h * 31 + s.name.charCodeAt(i)) >>> 0;
    s.brier = [0.124, 0.124 - (2 + h % 7) / 1000];
    signals.push(s); sf.reset(); $("sig-pts").textContent = "+6 pts"; DB.fillRanges(sf);
    changed("Added signal: " + s.name);
  });
  function renderSignals() {
    var ul = document.getElementById("signals"); ul.textContent = "";
    if (!signals.length) { ul.appendChild(el("li", { class: "signals__empty" }, "No custom signals yet. A signal is one of your own indicators that nudges a forecast when it fires.")); return; }
    signals.forEach(function (s, i) {
      var li = el("li", { class: "signal" });
      var top = el("label", { class: "switch" });
      var txt = el("span", { class: "switch__text" }, s.name);
      txt.appendChild(el("small", null, s.rule + ". When it fires, “" + EVNAME[s.event] + "” moves " + (s.pts > 0 ? "+" : "") + s.pts + " pts. Back-tested on 14 months of your data: Brier score " + s.brier[0].toFixed(3) + " to " + s.brier[1].toFixed(3) + "."));
      top.appendChild(txt);
      var cb = el("input", { type: "checkbox", "aria-label": "Firing now: " + s.name }); cb.checked = s.on;
      cb.addEventListener("change", function () { s.on = cb.checked; changed("Signal " + s.name + (s.on ? " firing" : " quiet")); });
      top.appendChild(cb); top.appendChild(el("span", { class: "switch__ui", "aria-hidden": "true" }));
      li.appendChild(top);
      var x = el("button", { class: "signal__x", type: "button", "aria-label": "Remove " + s.name }, "Remove");
      x.addEventListener("click", function () { signals.splice(i, 1); changed("Removed signal " + s.name); });
      li.appendChild(x);
      ul.appendChild(li);
    });
  }
  function renderCode() {
    var L = ['<span class="k">from</span> daybreak <span class="k">import</span> World', "", 'w = World.load(<span class="s">"halvorsen/v14.2"</span>)'];
    Object.keys(PROPS).forEach(function (path) {
      var a = get(M.BASE, path), b = get(params, path);
      if (Math.abs(a - b) > 1e-9) L.push('w.set(<span class="s">"' + PROPS[path][5] + '"</span>, <span class="n">' + fmt(b, PROPS[path][4]) + '</span>)  <span class="c"># was ' + fmt(a, PROPS[path][4]) + "</span>");
    });
    custom.forEach(function (a) { L.push('w.assets.add(<span class="s">"' + a.name.replace(/[<>"]/g, "") + '"</span>, type=<span class="s">"site"</span>)  <span class="c"># from ' + a.where.replace(/^From /, "").replace(/[<>]/g, "") + "</span>"); });
    signals.forEach(function (s) { L.push('w.signals.add(<span class="s">"' + s.name.replace(/[<>"]/g, "") + '"</span>, moves=<span class="s">"' + s.event + '"</span>, pts=<span class="n">' + s.pts + "</span>)"); });
    L.push("", "s = w.scenario(");
    active().forEach(function (e) { L.push('    <span class="s">"' + e.id + '"</span>: dict(p=<span class="n">' + pOf(e).toFixed(2) + "</span>, " + (e.unit === "days" ? "days" : "pct") + '=<span class="n">' + e.mag + "</span>),"); });
    L.push(")");
    L.push("plan = [" + planList(plan).map(function (a) { return '<span class="s">"' + a.id + '"</span>'; }).join(", ") + "]");
    Object.keys(assign).forEach(function (id) { L.push('s.assign(<span class="s">"' + id + '"</span>, to=<span class="s">"' + assign[id] + '"</span>)'); });
    L.push('r = s.run(plan, n=<span class="n">4_000</span>)');
    L.push('r.expected_loss      <span class="c"># ' + money(expected(plan, params).E) + " (" + money(expected({}, params).E) + " doing nothing)</span>");
    L.push('r.route_to_owners()  <span class="c"># send each action to its team, with a deadline</span>');
    document.getElementById("code").innerHTML = L.join("\n");
  }
  document.getElementById("copy").addEventListener("click", function () {
    var t = document.getElementById("code").textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { DB.toast("Copied."); }, function () { DB.toast("Couldn't reach the clipboard."); });
  });

  /* ================= Rail, log, change tracking ================= */
  var logEl = document.getElementById("log");
  function log(msg) {
    var d = new Date(), li = el("li");
    li.appendChild(el("time", null, [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (n) { return String(n).padStart(2, "0"); }).join(":")));
    li.appendChild(el("span", null, msg));
    logEl.insertBefore(li, logEl.firstChild);
    while (logEl.children.length > 12) logEl.removeChild(logEl.lastChild);
  }
  function countChanges() {
    var n = 0;
    events.forEach(function (e) { if (e.on !== e.base.on || Math.abs(e.p - e.base.p) > 1e-9 || e.mag !== e.base.mag) n++; });
    Object.keys(PROPS).forEach(function (p) { if (Math.abs(get(M.BASE, p) - get(params, p)) > 1e-9) n++; });
    return n + signals.length + planList(plan).length + custom.length + Object.keys(assign).length + Object.keys(start).filter(function (k) { return start[k]; }).length +
      Object.keys(overtime).filter(function (k) { return overtime[k]; }).length;
  }
  var lastNet = null;
  function renderRail() {
    var act = active();
    $("rail-events").textContent = act.length ? act.map(function (e) { return e.short + " " + Math.round(pOf(e) * 100) + "%"; }).join(" · ") : "No events switched on.";
    var e0 = expected({}, params).E, e1 = expected(plan, params).E, cost = costOf(plan), net = e0 - e1 - cost;
    $("r-e0").textContent = money(e0); $("r-e1").textContent = money(e1); $("r-cost").textContent = money(cost, 2);
    var n = $("r-net"); n.textContent = (net < 0 ? "−" : "") + money(Math.abs(net));
    n.classList.toggle("money--safe", net >= 0); n.classList.toggle("money--loss", net < 0);
    if (lastNet != null && Math.abs(lastNet - net) > 0.05) { n.classList.remove("is-bump"); void n.offsetWidth; n.classList.add("is-bump"); }
    lastNet = net;
    var pl = planList(plan);
    $("r-plan").textContent = pl.length ? pl.length + " action" + (pl.length > 1 ? "s" : "") + " in the plan." : "No plan yet. Build one in step 3.";
    var r = readiness(plan), msg = [];
    if (pl.length) {
      msg.push((pl.length - r.late.length) + " of " + pl.length + " land in time");
      if (r.over.length) msg.push(r.over.map(function (t) { return TEAMS[t].name; }).join(" and ") + " over capacity");
    }
    var rd = $("r-ready"); rd.textContent = msg.length ? msg.join("; ") + "." : "";
    rd.classList.toggle("is-warn", !!(r.late.length || r.over.length));
    var c = countChanges(), ch = $("changes");
    ch.textContent = c ? c + " unsaved change" + (c > 1 ? "s" : "") : "No changes";
    ch.classList.toggle("is-dirty", c > 0);
  }
  function currentStep() { var t = document.querySelector('.steps__tab[aria-selected="true"]'); return t ? t.getAttribute("data-step") : "events"; }
  var heavy;
  function render(now) {
    renderRail();
    events.forEach(function (e) { if (e._sync) e._sync(); });
    var step = currentStep();
    clearTimeout(heavy);
    var go = function () {
      if (step === "world") renderWorld();
      if (step === "options") renderOptions();
      if (step === "consequences") renderConsequences();
      if (step === "execution") renderExecution();
      if (step === "data") { renderSignals(); renderCode(); }
    };
    if (now) go(); else heavy = setTimeout(go, 60);
  }
  var logTimer;
  function changed(msg) {
    render(false);
    if (msg) log(msg);
    else { clearTimeout(logTimer); logTimer = setTimeout(function () { log("Re-ran the scenario: " + money(expected(plan, params).E) + " expected"); }, 700); }
  }

  document.getElementById("reset").addEventListener("click", function () { resetState(); buildEvents(); markPreset("morning"); changed("Reset to production"); });
  document.getElementById("commit").addEventListener("click", function () {
    var c = countChanges();
    if (!c) { DB.toast("Nothing to commit yet. Change an event, the model or the plan first."); return; }
    log("Committed scenario halvorsen/v14.2+" + c);
    DB.toast("Committed as a scenario. Each action in the plan has gone to its owner, with a deadline.");
  });

  buildEvents();
  log("Loaded halvorsen/v14.2: " + ASSETS.length + " assets, " + Object.keys(TEAMS).length + " teams");
  log("AIS: 22 Halvorsen vessels tracked, 3 inside the strait");
  render(true);
})();
