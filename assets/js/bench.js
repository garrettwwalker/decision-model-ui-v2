/* Workbench: one decision, followed through six stages.
   Forecast -> events -> impact on the organization -> decide -> deliver -> consequences.
   "Your model and data" is kept apart: the assets, teams and data every scenario runs on.
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
  function pct(p) { var v = p * 100; return (v > 0 && v < 1 ? "<1" : Math.round(v)) + "%"; }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }

  /* ================= Forecast questions and events ================= */
  // subs: the forecastable parts, each sent to one engine; declined: the part with no skill at this horizon
  var EVENTS_BASE = [
    { id: "hormuz", short: "Hormuz", name: "Strait of Hormuz closes", detail: "Closed to commercial traffic", p: 0.27, band: 5, mag: 21, unit: "days", min: 3, max: 90, on: true,
      fused: { Judgment: 0.33, Telemetry: 0.26, Procedure: 0.22 }, hist: [0.06, 0.09, 0.18],
      subs: [["Judgment", "Will the naval standoff escalate to a blockade?"], ["Telemetry", "Will daily transits fall below 40% of normal?"], ["Procedure", "Will underwriters list the whole strait as a war zone?"]],
      declined: "A sudden strike or coup in Tehran", hits: ["c-hormuz", "p-jebelali", "p-jubail", "p-mesaieed", "p-dammam"] },
    { id: "redsea", short: "Red Sea", name: "Red Sea shuts to traffic", detail: "Suez lost; Asia–Europe goes round the Cape", p: 0.34, band: 6, mag: 30, unit: "days", min: 7, max: 120, on: true,
      fused: { Judgment: 0.38, Telemetry: 0.31, Procedure: 0.30 }, hist: [0.22, 0.25, 0.31],
      subs: [["Judgment", "Will attacks on merchant ships in the southern Red Sea resume?"], ["Telemetry", "Will Bab el-Mandeb transits fall below half of normal?"], ["Procedure", "Will the three largest carriers suspend Suez routings?"]],
      declined: "Whether a ceasefire is signed this month", hits: ["c-bab", "c-suez", "l-resin-eu", "p-ambarli"] },
    { id: "strike", short: "Gebze strike", name: "Strike at the Gebze plant", detail: "Metalworkers' contract expires 1 November", p: 0.18, band: 7, mag: 10, unit: "days", min: 2, max: 45, on: false,
      fused: { Judgment: 0.24, Telemetry: 0.12, Procedure: 0.19 }, hist: [0.05, 0.08, 0.14],
      subs: [["Judgment", "Will members reject the final offer?"], ["Telemetry", "Will overtime refusals at Gebze pass 20%?"], ["Procedure", "Will the federation file a legal strike notice?"]],
      declined: null, hits: ["f-gebze", "k-union", "s-bursa"] },
    { id: "feeders", short: "Feeder sanctions", name: "Sanctions hit two ME4 feeders", detail: "They share a technical manager with listed tankers", p: 0.19, band: 6, mag: 45, unit: "days", min: 7, max: 120, on: false,
      fused: { Judgment: 0.21, Telemetry: 0.15, Procedure: 0.22 }, hist: [0.11, 0.12, 0.16],
      subs: [["Judgment", "Will regulators list the shared technical manager?"], ["Telemetry", "Will the feeders call at terminals tied to listed tankers?"], ["Procedure", "Would a listing cover the manager's whole fleet?"]],
      declined: null, hits: ["l-me4", "p-dammam"] },
    { id: "bunker", short: "Bunker spike", name: "Bunker fuel spikes", detail: "Fujairah VLSFO prices, this quarter", p: 0.30, band: 5, mag: 35, unit: "% higher", min: 10, max: 80, on: false,
      fused: { Judgment: 0.27, Telemetry: 0.34, Procedure: 0.29 }, hist: [0.19, 0.24, 0.27],
      subs: [["Judgment", "Will producers cut output again this quarter?"], ["Telemetry", "Will Fujairah VLSFO stay above $790/t for 10 days?"], ["Procedure", "Will Fujairah stocks fall below their five-year low?"]],
      declined: null, hits: ["k-bunker", "k-freight"], cost: true }
  ];
  var PRESETS = {
    morning: null,
    escalation: { hormuz: [true, 0.55, 45], redsea: [true, 0.40, 30], strike: [false], feeders: [true, 0.35, 60], bunker: [true, 0.60, 50] },
    worst: { hormuz: [true, 0.70, 60], redsea: [true, 0.70, 60], strike: [true, 0.60, 25], feeders: [true, 0.65, 90], bunker: [true, 0.75, 70] },
    calm: { hormuz: [true, 0.08, 10], redsea: [true, 0.15, 14], strike: [false], feeders: [false], bunker: [false] }
  };

  /* ================= Organization: teams and the people in them ================= */
  var TEAMS = {
    proc: { name: "Procurement", lead: "Aylin Demir", role: "VP Procurement", parent: "coo", heads: 34, load: 0.72, defer: "Q1 supplier reviews slip two weeks" },
    log: { name: "Logistics", lead: "Tomas Varga", role: "VP Logistics", parent: "coo", heads: 52, load: 0.81, defer: "The carrier tender for 2027 waits a fortnight" },
    plan: { name: "Supply planning", lead: "Priya Nair", role: "Director, S&OP", parent: "coo", heads: 21, load: 0.88, defer: "November S&OP runs on last month's forecast" },
    gebze: { name: "Plant ops, Gebze", lead: "Murat Kaya", role: "Plant director", parent: "coo", heads: 1840, load: 0.93, defer: "Line 2's planned maintenance moves to December" },
    pune: { name: "Plant ops, Pune", lead: "Rohan Mehta", role: "Plant director", parent: "coo", heads: 1210, load: 0.77, defer: "The AC line retooling slips a week" },
    tre: { name: "Treasury", lead: "Hanne Sørli", role: "Group Treasurer", parent: "cfo", heads: 12, load: 0.55, defer: "The Q4 FX hedge review is pushed back" },
    com: { name: "Commercial, MENA", lead: "Karim Haddad", role: "GM, MENA", parent: "cco", heads: 96, load: 0.64, defer: "Two Ramadan promotions are planned late" }
  };
  var EXECS = [
    { id: "coo", title: "Chief Operating Officer", lead: "Ingrid Halvorsen" },
    { id: "cfo", title: "Chief Financial Officer", lead: "Lars Aune" },
    { id: "cco", title: "Chief Commercial Officer", lead: "Sofia Brandt" }
  ];
  // free: hours each person can give this week, from Workday
  var PEOPLE = [
    ["aylin", "proc", "Aylin Demir", "VP Procurement", 5], ["emre", "proc", "Emre Yıldız", "Resin buyer", 22], ["deniz", "proc", "Deniz Kurt", "Contracts analyst", 10], ["selin", "proc", "Selin Aksoy", "Category manager, electronics", 8],
    ["tomas", "log", "Tomas Varga", "VP Logistics", 5], ["mira", "log", "Mira Olsen", "Ocean freight manager", 20], ["jonas", "log", "Jonas Weber", "Gulf routing lead", 18], ["farah", "log", "Farah Saleh", "Port operations, UAE", 17],
    ["priya", "plan", "Priya Nair", "Director, S&OP", 5], ["arjun", "plan", "Arjun Rao", "Inventory planner", 15], ["lena", "plan", "Lena Fischer", "Demand planner, EU", 12], ["omar", "plan", "Omar Nasser", "Supply planner, MENA", 8],
    ["murat", "gebze", "Murat Kaya", "Plant director", 10], ["elif", "gebze", "Elif Şahin", "Production manager", 40], ["can", "gebze", "Can Öztürk", "Maintenance lead", 25], ["burak", "gebze", "Burak Aydın", "Labour relations", 15],
    ["rohan", "pune", "Rohan Mehta", "Plant director", 10], ["kavya", "pune", "Kavya Iyer", "Production planner", 35], ["vikram", "pune", "Vikram Singh", "Line supervisor", 25],
    ["hanne", "tre", "Hanne Sørli", "Group Treasurer", 6], ["nils", "tre", "Nils Berg", "Risk and insurance", 9], ["ane", "tre", "Ane Moe", "FX and commodities", 5],
    ["karim", "com", "Karim Haddad", "GM, MENA", 5], ["layla", "com", "Layla Mansour", "Key accounts, GCC", 18], ["yusuf", "com", "Yusuf Demir", "Channel planner", 12]
  ].map(function (p) { return { id: p[0], team: p[1], name: p[2], role: p[3], free: p[4] }; });
  var CAPACITY = {
    normal: { name: "Normal hours", f: 1, cost: 0 },
    overtime: { name: "Overtime", f: 1.35, cost: 0.04 },
    defer: { name: "Defer routine work", f: 1.2, cost: 0 }
  };

  /* ================= Decision space ================= */
  // ways: how the action can be done; the first is the default. Deltas on cost ($M), lead (days) and hours; eff is the share of protection it gives.
  var ACTIONS = [
    { id: "bridge", name: "Bridge-buy resin from Singapore", helps: ["hormuz"], cost: 0.84, lead: 2, need: 8, hours: 30, crew: ["emre", "deniz"], protects: ["f-gebze", "s-jubail"],
      ways: [["One spot cargo", 0, 0, 0, 1], ["Three-month term deal", 0.35, 2, -10, 1, "Locks the premium in; less buying later"], ["Split across two traders", 0.08, 0, 8, 1, "Halves the counterparty risk"]] },
    { id: "divert", name: "Divert Gulf sailings to Khor Fakkan", helps: ["hormuz"], cost: 0.90, lead: 1, need: 9, hours: 40, crew: ["jonas", "farah", "tomas"], protects: ["d-dubai", "p-jebelali", "v-corvane", "v-lumen"],
      ways: [["Divert every Gulf sailing", 0, 0, 0, 1], ["Divert only the two ships at sea", -0.45, 0, -20, 0.55, "Later sailings still head for Jebel Ali"]] },
    { id: "cover", name: "Bind war-risk cover and hedge bunker fuel", helps: ["hormuz", "bunker"], cost: 1.36, lead: 1, need: 2, hours: 12, crew: ["nils", "ane"], protects: ["k-warrisk", "k-bunker"],
      ways: [["Cover and hedge", 0, 0, 0, 1], ["Bind cover only", -0.5, 0, -5, 0.75, "Leaves bunker costs open"]] },
    { id: "stock", name: "Add 7 days of safety stock", helps: ["hormuz", "feeders"], cost: 0.77, lead: 10, need: 6, hours: 60, crew: ["arjun", "omar", "lena"], protects: ["f-gebze", "f-pune", "d-dubai", "d-dammam"],
      ways: [["At every plant and DC", 0, 0, 0, 1], ["At the MENA DCs only", -0.4, -6, -30, 0.55, "Lands in time, but the plants stay thin"]] },
    { id: "sohar", name: "Pre-position finished goods at Sohar", helps: ["hormuz"], cost: 1.10, lead: 6, need: 9, hours: 50, crew: ["layla", "yusuf"], protects: ["d-dubai", "d-dammam", "m-mena"],
      ways: [["30,000 units", 0, 0, 0, 1], ["15,000 units, fastest sellers", -0.5, -3, -20, 0.6, "Covers the top 40 SKUs only"]] },
    { id: "cape", name: "Pre-book Cape routing for EU lanes", helps: ["redsea"], cost: 0.45, lead: 3, need: 10, hours: 20, crew: ["mira"], protects: ["m-eu", "d-rotterdam", "l-resin-eu"],
      ways: [["Book the slots now", 0, 0, 0, 1], ["Take an option, book if Suez shuts", -0.2, 2, 0, 0.85, "Cheaper, but slots may be gone"]] },
    { id: "buildahead", name: "Build ahead at Gebze", helps: ["strike"], cost: 0.60, lead: 5, need: 23, hours: 120, crew: ["elif", "can", "burak"], protects: ["f-gebze", "m-eu"],
      ways: [["10 days ahead, weekend shifts", 0, 0, 0, 1], ["5 days ahead, weekday overtime", -0.3, -2, -60, 0.5, "Half the cover, no weekend shifts"]] },
    { id: "shiftpune", name: "Shift EU washer orders to Pune", helps: ["strike"], cost: 0.50, lead: 7, need: 23, hours: 80, crew: ["kavya", "vikram"], protects: ["m-eu", "f-pune"],
      ways: [["Every EU washer order", 0, 0, 0, 1], ["The top three SKUs only", -0.25, -3, -40, 0.6, "Smaller retooling; slower SKUs wait"]] },
    { id: "charter", name: "Replace the ME4 feeders", helps: ["feeders"], cost: 0.70, lead: 4, need: 6, hours: 25, crew: ["mira"], protects: ["l-me4", "d-dammam"],
      ways: [["Charter two replacement feeders", 0, 0, 0, 1], ["Book slots on a rival shuttle", -0.35, -2, -10, 0.7, "Fewer boxes a week"]] }
  ];
  var SHORT = { bridge: "resin bridge-buy", divert: "Gulf diversion", cover: "war-risk cover", stock: "safety stock", sohar: "Sohar stock", cape: "Cape routing", buildahead: "build-ahead", shiftpune: "Pune shift", charter: "feeder swap" };
  ACTIONS.forEach(function (a) { a.short = SHORT[a.id]; a.ways = a.ways.map(function (w) { return { name: w[0], cost: w[1], lead: w[2], hours: w[3], eff: w[4], note: w[5] || "" }; }); });

  // commitments the organization could breach: when each one triggers, who answers for it, and which actions prevent it
  var TRIGGERS = [
    { id: "mena", name: "MENA late-delivery penalties", note: "Two retail partners, after 7 days short", team: "com", fix: ["sohar", "stock", "charter", "divert"],
      test: function (H, I) { return I.mena > 7; } },
    { id: "launch", name: "EU washer launch slips a season", note: "If Gebze stops for more than 5 days", team: "gebze", fix: ["bridge", "buildahead", "shiftpune"],
      test: function (H, I) { return I.L.stop.gebze > 5; } },
    { id: "budget", name: "Q4 logistics budget breached", note: "Freight and insurance overruns above $10M", team: "log", fix: ["cover", "divert"],
      test: function (H, I) { return I.L.freight > 10; } },
    { id: "warrisk", name: "Gulf cargo sails uninsured", note: "The war-risk quote expires Wednesday", team: "tre", fix: ["cover"],
      test: function (H, I, A) { return H.hormuz != null && !A.cover; } },
    { id: "sanction", name: "ME4 cargo held for sanctions screening", note: "Boxes on listed feeders can't be released", team: "log", fix: ["charter"],
      test: function (H, I, A) { return H.feeders != null && !A.charter; } }
  ];
  var CREW_IN = 62, CREW_OUT = 43; // seafarers on chartered ships inside the strait, and on the two headed for it

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
  // scenario: events, plan and how it's delivered (way, crew, start, capacity). model: params, people's hours, custom assets, signals.
  var events, params, plan, signals, datasets, custom, crew, way, start, capacity, freeEdit, preset;
  var mode = "scenario", focus = null;
  var sel = { kind: "asset", id: "c-hormuz" }, view = "network", typeFilter = "", query = "", sortBy = "net";
  var isel = "c-hormuz", dim = "money", hitTeam = "", openTeam = null, opened = {};
  function resetState() {
    events = EVENTS_BASE.map(function (e) { var c = M.clone(e); c.base = { p: e.p, mag: e.mag, on: e.on }; return c; });
    params = M.clone(M.BASE);
    plan = {}; signals = []; datasets = []; custom = []; crew = {}; way = {}; start = {}; capacity = {}; freeEdit = {}; preset = "morning";
  }
  resetState();
  function allAssets() { return ASSETS.concat(custom); }
  function assetById(id) { return allAssets().filter(function (a) { return a.id === id; })[0]; }
  function eventById(id) { return events.filter(function (e) { return e.id === id; })[0]; }
  function actionById(id) { return ACTIONS.filter(function (a) { return a.id === id; })[0]; }
  function personById(id) { return PEOPLE.filter(function (p) { return p.id === id; })[0]; }
  function peopleOf(t) { return PEOPLE.filter(function (p) { return p.team === t; }); }
  function pOf(e) {
    var p = e.p;
    signals.forEach(function (s) { if (s.on && s.event === e.id) p += s.pts / 100; });
    return Math.max(0.01, Math.min(0.99, p));
  }
  function capOf(t) { return CAPACITY[capacity[t] || "normal"]; }
  function freeOf(p) { return Math.round((freeEdit[p.id] != null ? freeEdit[p.id] : p.free) * capOf(p.team).f); }
  function teamFree(t) { return peopleOf(t).reduce(function (s, p) { return s + freeOf(p); }, 0); }
  function crewOf(a) { return crew[a.id] || a.crew; }
  function ownerOf(a) { return personById(crewOf(a)[0]).team; }
  function cfg(a) {
    var w = a.ways[way[a.id] || 0];
    return { cost: Math.max(0.05, a.cost + w.cost), lead: Math.max(1, a.lead + w.lead), hours: Math.max(4, a.hours + w.hours), eff: w.eff, way: w };
  }
  function planList(A) { return ACTIONS.filter(function (a) { return A[a.id]; }); }
  function capacityCost() { return Object.keys(capacity).reduce(function (s, t) { return s + CAPACITY[capacity[t]].cost; }, 0); }
  function costOf(A) { return planList(A).reduce(function (c, a) { return c + cfg(a).cost; }, 0) + capacityCost(); }
  function maskOf(A) { return ACTIONS.reduce(function (m, a, i) { return m | (A[a.id] ? 1 << i : 0); }, 0); }
  function without(A, id) { var B = M.clone(A); delete B[id]; return B; }
  var cache = {};

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
  // f: share of protection each action actually delivers; in each simulated future it either lands or it doesn't
  function simulate(A, P, N, seed, f) {
    var rand = DB.rng(seed), act = active(), out = new Float64Array(N), ids = Object.keys(A);
    for (var i = 0; i < N; i++) {
      var H = {}, B = {};
      act.forEach(function (e) {
        if (rand() < pOf(e)) {
          var z = Math.sqrt(-2 * Math.log(Math.max(1e-9, rand()))) * Math.cos(2 * Math.PI * rand());
          H[e.id] = Math.max(e.min, e.mag * Math.exp(0.45 * z));
        }
      });
      ids.forEach(function (id) { if (!f || rand() < (f[id] == null ? 1 : f[id])) B[id] = true; });
      out[i] = lossOf(H, B, P).total;
    }
    out.sort();
    return out;
  }
  var q = function (s, p) { return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };

  /* ================= Impact: beyond the money ================= */
  function impactsOf(H, A, P) {
    var L = lossOf(H, A, P), s = L.stop;
    var I = {
      L: L, money: L.total,
      lineDays: s.gebze * 3 + s.pune * 2, units: s.gebze * 6200 + s.pune * 4100,
      eu: Math.max(s.gebze, H.redsea != null ? (A.cape ? 3 : 11) : 0), india: s.pune, mena: Math.max(s.dubai, s.dammam),
      crew: H.hormuz != null ? CREW_IN + (A.divert ? 0 : CREW_OUT) : 0,
      stood: (s.gebze > 0.5 ? 1840 : 0) + (s.pune > 0.5 ? 1210 : 0)
    };
    I.trig = TRIGGERS.map(function (t) { return t.test(H, I, A); });
    return I;
  }
  // every impact as one flat set of numbers: averages and chances over every combination of events (exact), plus w_*: if everything included happens
  function stats(A) {
    var k = "S" + maskOf(A);
    if (cache[k]) return cache[k];
    var act = active(), S = { money: 0, lineDays: 0, units: 0, eu: 0, india: 0, mena: 0, crew: 0, crewP: 0, stoodP: 0, m_gebze: 0, m_pune: 0, m_dubai: 0, m_dammam: 0, m_freight: 0, m_eu: 0 };
    TRIGGERS.forEach(function (t) { S["t_" + t.id] = 0; });
    for (var m = 0; m < (1 << act.length); m++) {
      var H = {}, w = 1;
      act.forEach(function (e, i) { if (m & (1 << i)) { H[e.id] = e.mag; w *= pOf(e); } else w *= 1 - pOf(e); });
      if (!w) continue;
      var I = impactsOf(H, A, params);
      ["money", "lineDays", "units", "eu", "india", "mena", "crew"].forEach(function (x) { S[x] += w * I[x]; });
      ["gebze", "pune", "dubai", "dammam"].forEach(function (x) { S["m_" + x] += w * I.L.nodes[x]; });
      S.m_freight += w * I.L.freight; S.m_eu += w * I.L.eu;
      if (I.crew) S.crewP += w;
      if (I.stood) S.stoodP += w;
      TRIGGERS.forEach(function (t, j) { if (I.trig[j]) S["t_" + t.id] += w; });
    }
    var all = {}; act.forEach(function (e) { all[e.id] = e.mag; });
    var W = impactsOf(all, A, params);
    ["money", "lineDays", "units", "eu", "india", "mena", "crew", "stood"].forEach(function (x) { S["w_" + x] = W[x]; });
    ["gebze", "pune", "dubai", "dammam"].forEach(function (x) { S["w_m_" + x] = W.L.nodes[x]; S["w_stop_" + x] = W.L.stop[x]; });
    S.w_freight = W.L.freight; S.w_eu_money = W.L.eu;
    return (cache[k] = S);
  }

  /* ================= Delivery: people, crews and timing ================= */
  // each crew splits an action's hours in proportion to what each person has free; a person asked for more than they have
  // stretches every action they're on, a stretched action lands late, and a late action protects less
  function readiness(A) {
    var k = "R" + maskOf(A);
    if (cache[k]) return cache[k];
    var D = {}, acts = {}, list = planList(A);
    PEOPLE.forEach(function (p) { D[p.id] = 0; });
    list.forEach(function (a) {
      var c = cfg(a), cr = crewOf(a).map(personById), F = cr.reduce(function (s, p) { return s + freeOf(p); }, 0);
      cr.forEach(function (p) { D[p.id] += F ? c.hours * freeOf(p) / F : c.hours / cr.length; });
    });
    var overPeople = PEOPLE.filter(function (p) { return D[p.id] > freeOf(p) + 0.01; }).map(function (p) { return p.id; });
    var late = [];
    list.forEach(function (a) {
      var c = cfg(a), st = 1;
      crewOf(a).forEach(function (id) { var p = personById(id), f = freeOf(p); st = Math.max(st, f ? D[id] / f : 9); });
      var at = (start[a.id] || 0) + Math.ceil(c.lead * st - 1e-9), lateBy = Math.max(0, at - a.need);
      var timely = lateBy ? Math.max(0, 1 - lateBy / a.need) : 1;
      acts[a.id] = { lands: at, late: lateBy, stretch: st, f: c.eff * timely, timely: timely };
      if (lateBy) late.push(a);
    });
    var overTeams = Object.keys(TEAMS).filter(function (t) { return overPeople.some(function (id) { return personById(id).team === t; }); });
    return (cache[k] = { D: D, acts: acts, overPeople: overPeople, overTeams: overTeams, late: late });
  }
  function fOf(A) { var r = readiness(A), f = {}; planList(A).forEach(function (a) { f[a.id] = r.acts[a.id].f; }); return f; }
  // the plan as it will actually be delivered: each action's shortfall puts back that share of what it would have saved
  function delivered(A) {
    var S = stats(A), out = {}, r = readiness(A);
    for (var k in S) out[k] = S[k];
    planList(A).forEach(function (a) {
      var f = r.acts[a.id].f; if (f >= 0.999) return;
      var S2 = stats(without(A, a.id));
      for (var k2 in out) out[k2] += (1 - f) * (S2[k2] - S[k2]);
    });
    return out;
  }
  function E0() { return stats({}).money; }
  function Edel(A) { return delivered(A).money; }

  /* ================= How the events reach each asset ================= */
  // direct: the asset is exposed to an included event; via: it depends on something that's hit
  function reach(only) {
    var on = active().map(function (e) { return e.id; }).filter(function (id) { return !only || id === only; }), out = {}, frontier = [];
    allAssets().forEach(function (a) {
      var ev = (a.events || []).filter(function (x) { return on.indexOf(x) > -1; });
      // a price event raises costs where it lands but doesn't cut supply, so it doesn't travel down dependencies
      if (ev.length) { out[a.id] = { direct: true, ev: ev, depth: 0 }; if (ev.some(function (x) { return !eventById(x).cost; })) frontier.push(a.id); }
    });
    while (frontier.length) {
      var next = [];
      frontier.forEach(function (id) {
        allAssets().forEach(function (b) {
          if (!out[b.id] && (b.deps || []).indexOf(id) > -1) { out[b.id] = { direct: false, via: id, depth: out[id].depth + 1 }; next.push(b.id); }
        });
      });
      frontier = next;
    }
    return out;
  }
  var LOSS_ASSET = { gebze: "f-gebze", pune: "f-pune", dubai: "d-dubai", dammam: "d-dammam" };

  /* ================= Navigation: two modes, six stages, one followed event ================= */
  var STAGES = ["forecast", "events", "impact", "decide", "deliver", "outcomes"];
  var NEXT = { forecast: "Next: choose contingencies", events: "Next: see the impact", impact: "Next: choose a response",
    decide: "Next: assign the work", deliver: "Next: compare outcomes", outcomes: null };
  var stage = "forecast";
  var tabs = document.querySelectorAll(".thread__stage");
  function setMode(m) {
    mode = m;
    document.querySelectorAll("[data-mode]").forEach(function (x) { x.hidden = x.getAttribute("data-mode") !== m; });
    document.querySelectorAll("[data-mode-btn]").forEach(function (b) { b.setAttribute("aria-selected", String(b.getAttribute("data-mode-btn") === m)); });
  }
  function showStep(id) {
    setMode("scenario"); stage = id;
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-step") === id; t.setAttribute("aria-selected", String(on));
      if (on) { var th = t.parentNode; if (t.offsetLeft < th.scrollLeft || t.offsetLeft + t.offsetWidth > th.scrollLeft + th.clientWidth) th.scrollLeft = t.offsetLeft - 16; }
    });
    document.querySelectorAll("[data-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== id; });
    render(true);
    if (typeof renderSuggest === "function" && !document.getElementById("askdrawer").hidden) renderSuggest();
  }
  function showModel(v) {
    if (v) { view = v; var r = document.querySelector('input[name="wview"][value="' + v + '"]'); if (r) r.checked = true; }
    setMode("model"); render(true);
    if (typeof renderSuggest === "function" && !document.getElementById("askdrawer").hidden) renderSuggest();
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { showStep(t.getAttribute("data-step")); }); });
  document.querySelectorAll("[data-mode-btn]").forEach(function (b) {
    b.addEventListener("click", function () { if (b.getAttribute("data-mode-btn") === "model") showModel(); else showStep(stage); });
  });
  document.getElementById("back-scenario").addEventListener("click", function () { showStep(stage); });
  function goTo(where) {
    if (where.indexOf("model") === 0) showModel(where.split(":")[1]); else showStep(where);
    var anchor = document.querySelector(mode === "model" ? ".modelbar" : ".thread");
    window.scrollTo({ top: anchor.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
  }
  // every stage ends by handing over to the next one
  document.querySelectorAll("[data-panel]").forEach(function (p) {
    var id = p.getAttribute("data-panel"), i = STAGES.indexOf(id), foot = el("div", { class: "step__foot" });
    if (i > 0) { var b = el("button", { class: "btn btn--ghost btn--sm", type: "button" }, "Back"); b.addEventListener("click", function () { goTo(STAGES[i - 1]); }); foot.appendChild(b); }
    if (NEXT[id]) { var n = el("button", { class: "btn btn--primary btn--sm", type: "button" }, NEXT[id]); n.addEventListener("click", function () { goTo(STAGES[i + 1]); }); foot.appendChild(n); }
    else { var c = el("button", { class: "btn btn--primary btn--sm", type: "button" }, "Commit as scenario"); c.addEventListener("click", function () { document.getElementById("commit").click(); }); foot.appendChild(c); }
    p.appendChild(foot);
  });
  function follow(id) {
    focus = focus === id ? null : id;
    changed(focus ? "Following “" + eventById(id).name + "”" : "Stopped following a contingency");
  }
  document.getElementById("focus-clear").addEventListener("click", function () { focus = null; changed("Stopped following a contingency"); });
  function followBtn(e) {
    var b = el("button", { class: "chip-btn chip-btn--follow", type: "button", "aria-pressed": "false" }, "Follow this contingency");
    b.addEventListener("click", function () { follow(e.id); });
    return b;
  }
  function linkBtn(text, fn) { var b = el("button", { type: "button", class: "ins-link" }, text); b.addEventListener("click", fn); return b; }

  /* ================= 1. Forecast ================= */
  var fcBox = document.getElementById("forecast");
  function spark(e) {
    // 90 days of forecast history, ending at Daybreak's forecast this morning
    var rand = DB.rng(e.id.length * 97 + 13), pts = [], h = e.hist, n = 30;
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1), seg = Math.min(2, Math.floor(t * 3)), k = t * 3 - seg;
      var from = [h[0], h[1], h[2]][seg], to = [h[1], h[2], e.base.p][seg];
      pts.push(Math.max(0.01, from + (to - from) * k + (rand() - 0.5) * 0.02));
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
  function unitText(e, v) { return v + (e.unit.charAt(0) === "%" ? "" : " ") + e.unit; }
  function buildForecast() {
    fcBox.textContent = "";
    events.forEach(function (e) {
      var row = el("article", { class: "fcrow" });
      var qd = el("div", { class: "fcrow__q" });
      qd.appendChild(el("h3", null, e.name));
      var det = el("p", null); qd.appendChild(det);
      var btns = el("div", { class: "fcrow__btns" });
      var how = el("button", { class: "chip-btn", type: "button", "aria-expanded": "false" });
      btns.appendChild(how);
      var fb = followBtn(e); btns.appendChild(fb);
      qd.appendChild(btns);
      row.appendChild(qd);
      // the scale: three engines, the fused estimate with its error bars, and your override
      var sc = el("div", { class: "fcrow__scale" });
      var track = el("div", { class: "fscale", role: "img" });
      var ticks = el("div", { class: "fscale__ticks" }); track.appendChild(ticks);
      var band = el("i", { class: "fscale__band" }); track.appendChild(band);
      var engs = Object.keys(e.fused).sort(function (a, b) { return e.fused[a] - e.fused[b]; }).map(function (k) {
        var m = el("i", { class: "fscale__eng", title: k + " engine: " + Math.round(e.fused[k] * 100) + "%" }, k.charAt(0)); track.appendChild(m); return [k, m];
      });
      var fd = el("i", { class: "fscale__fused" }); track.appendChild(fd);
      var you = el("i", { class: "fscale__you" }); track.appendChild(you);
      sc.appendChild(track);
      var leg = el("p", { class: "fcrow__eng" }); sc.appendChild(leg);
      row.appendChild(sc);
      var pd = el("div", { class: "fcrow__p" });
      var big = el("b", { class: "fcrow__big" }); pd.appendChild(big);
      var sp = el("div", { class: "fcrow__spark" }); pd.appendChild(sp);
      var pf = el("label", { class: "field fcrow__ovr" });
      var pt = el("span", { class: "field__top" }, "Your view"); var pv = el("span", { class: "field__val" }); pt.appendChild(pv); pf.appendChild(pt);
      var pr = el("input", { type: "range", min: 1, max: 95, step: 1, value: Math.round(e.p * 100), "aria-label": "Your probability for " + e.name }); pf.appendChild(pr);
      pd.appendChild(pf);
      var reset = el("button", { class: "event__reset", type: "button" }, "Back to Daybreak's forecast");
      reset.addEventListener("click", function () { e.p = e.base.p; pr.value = Math.round(e.p * 100); DB.fillRanges(row); changed("Reset " + e.short + " to Daybreak's forecast"); });
      pd.appendChild(reset);
      row.appendChild(pd);
      // how Daybreak got there
      var hw = el("ol", { class: "fcrow__how" }); hw.hidden = true;
      row.appendChild(hw);
      how.addEventListener("click", function () { opened[e.id] = hw.hidden; sync(); });
      pr.addEventListener("input", function () { e.p = pr.value / 100; markPreset(null); changed(); });
      function sync() {
        var p = pOf(e), moved = Math.round(e.p * 100) !== Math.round(e.base.p * 100);
        row.classList.toggle("is-off", !e.on); row.classList.toggle("is-focus", focus === e.id);
        det.textContent = e.detail + ". 30-day horizon." + (e.on ? "" : " Not included in this scenario.");
        big.textContent = Math.round(p * 100) + "%";
        pv.textContent = moved ? "Your override" : "Same as Daybreak";
        reset.hidden = !moved;
        // one scale for every row, just wide enough for the largest number on it
        var top = Math.max.apply(null, events.map(function (x) { return Math.max(pOf(x), x.base.p + x.band / 100, x.fused.Judgment, x.fused.Telemetry, x.fused.Procedure); }));
        var dom = Math.min(100, Math.max(50, Math.ceil((top * 100 + 5) / 10) * 10)), X = function (v) { return Math.max(0, Math.min(100, v * 100 / dom * 100)) + "%"; };
        ticks.textContent = "";
        for (var t = 0; t <= dom; t += dom > 60 ? 20 : 10) { var tk = el("i", { class: "fscale__tick", "data-t": t + "%" }); tk.style.left = X(t / 100); ticks.appendChild(tk); }
        band.style.left = X(Math.max(0, e.base.p - e.band / 100)); band.style.width = (2 * e.band / dom * 100) + "%";
        var prev = -1, lvl = 0;
        engs.forEach(function (x) { var v = e.fused[x[0]]; lvl = prev >= 0 && (v - prev) * 100 / dom < 0.035 ? lvl + 1 : 0; prev = v; x[1].style.left = X(v); x[1].style.bottom = (1.45 + lvl * 1.25) + "rem"; });
        fd.style.left = X(e.base.p);
        you.hidden = !moved && Math.abs(p - e.p) < 1e-9; you.style.left = X(p);
        track.setAttribute("aria-label", "Engines: " + Object.keys(e.fused).map(function (k) { return k + " " + Math.round(e.fused[k] * 100) + "%"; }).join(", ") + ". Fused " + Math.round(e.base.p * 100) + "% plus or minus " + e.band + " points." + (moved ? " Your view: " + Math.round(p * 100) + "%." : ""));
        leg.textContent = "Fused " + Math.round(e.base.p * 100) + "%, ±" + e.band + " points" + (moved ? ". You've set " + Math.round(e.p * 100) + "%" : "") + (Math.abs(p - e.p) > 1e-9 ? ", " + Math.round(p * 100) + "% with your signals" : "") + ".";
        sp.textContent = ""; sp.appendChild(spark(e)); sp.title = "Last 90 days: " + Math.round(e.hist[0] * 100) + "% to " + Math.round(e.base.p * 100) + "%";
        var open = opened[e.id] != null ? opened[e.id] : focus === e.id;
        hw.hidden = !open; how.setAttribute("aria-expanded", String(open));
        how.textContent = open ? "Hide the working" : "How Daybreak got " + Math.round(e.base.p * 100) + "%";
        fb.setAttribute("aria-pressed", String(focus === e.id)); fb.textContent = focus === e.id ? "Following" : "Follow this contingency";
        if (open) {
          hw.textContent = "";
          e.subs.forEach(function (s) {
            var li = el("li"); li.appendChild(el("span", { class: "fcrow__engname" }, s[0] + " engine")); li.appendChild(el("span", null, s[1])); li.appendChild(el("b", null, Math.round(e.fused[s[0]] * 100) + "%")); hw.appendChild(li);
          });
          if (e.declined) { var dl = el("li", { class: "is-declined" }); dl.appendChild(el("span", { class: "fcrow__engname" }, "Declined")); dl.appendChild(el("span", null, e.declined)); dl.appendChild(el("b", null, "no skill")); hw.appendChild(dl); }
          signals.filter(function (s) { return s.event === e.id; }).forEach(function (s) {
            var li = el("li", { class: "is-signal" }); li.appendChild(el("span", { class: "fcrow__engname" }, "Your signal")); li.appendChild(el("span", null, s.name + (s.on ? ", firing" : ", quiet"))); li.appendChild(el("b", null, s.on ? (s.pts > 0 ? "+" : "") + s.pts + " pts" : "0 pts")); hw.appendChild(li);
          });
          var fl = el("li", { class: "is-fused" }); fl.appendChild(el("span", { class: "fcrow__engname" }, "Fused and calibrated")); fl.appendChild(el("span", null, "±" + e.band + " points, 30-day horizon")); fl.appendChild(el("b", null, Math.round(e.base.p * 100) + "%")); hw.appendChild(fl);
          if (!signals.some(function (s) { return s.event === e.id; })) {
            var add = el("li", { class: "is-add" }); add.appendChild(linkBtn("Add one of your own indicators as a signal", function () { goTo("model:data"); })); hw.appendChild(add);
          }
        }
      }
      e._fsync = sync;
      fcBox.appendChild(row);
    });
    DB.fillRanges(fcBox);
  }

  /* ================= 2. Events ================= */
  var evBox = document.getElementById("events");
  function buildEvents() {
    evBox.textContent = "";
    events.forEach(function (e) {
      var card = el("article", { class: "event" });
      var top = el("label", { class: "switch event__switch" });
      var txt = el("span", { class: "switch__text" }, e.name);
      txt.appendChild(el("small", null, e.detail));
      top.appendChild(txt);
      var cb = el("input", { type: "checkbox", "aria-label": "Include in this scenario: " + e.name }); cb.checked = e.on;
      top.appendChild(cb); top.appendChild(el("span", { class: "switch__ui", "aria-hidden": "true" }));
      card.appendChild(top);
      var body = el("div", { class: "event__body" });
      var pl = el("p", { class: "event__p" }); body.appendChild(pl);
      var mf = el("label", { class: "field" });
      var mt = el("span", { class: "field__top" }, e.unit === "days" ? "How long" : "How much");
      var mv = el("span", { class: "field__val" }); mt.appendChild(mv); mf.appendChild(mt);
      var mr = el("input", { type: "range", min: e.min, max: e.max, step: 1, value: e.mag }); mf.appendChild(mr);
      body.appendChild(mf);
      var hits = el("div", { class: "event__hits" });
      hits.appendChild(el("span", { class: "event__hitlab" }, "Hits first"));
      e.hits.forEach(function (id) {
        var a = assetById(id); if (!a) return;
        var b = el("button", { class: "chip-btn chip-btn--sm", type: "button" }, a.name);
        b.addEventListener("click", function () { isel = id; goTo("impact"); });
        hits.appendChild(b);
      });
      body.appendChild(hits);
      var reachP = el("p", { class: "event__reach" }); body.appendChild(reachP);
      var fb = followBtn(e); body.appendChild(fb);
      card.appendChild(body);
      function sync() {
        mv.textContent = unitText(e, e.mag);
        pl.textContent = "";
        pl.appendChild(el("b", null, Math.round(pOf(e) * 100) + "%"));
        pl.appendChild(document.createTextNode(" likely, from the forecast. "));
        pl.appendChild(linkBtn("Change", function () { opened[e.id] = true; goTo("forecast"); }));
        var wasOn = e.on; e.on = true;
        var R = reach(e.id), n = Object.keys(R).length, direct = Object.keys(R).filter(function (k) { return R[k].direct; }).length;
        e.on = wasOn;
        reachP.textContent = "Affects " + n + " of your " + allAssets().length + " assets" + (n === direct ? ", all directly." : ": " + direct + " directly and " + (n - direct) + " through their dependencies.") +
          (e.on ? " Adds " + money(E0() - expected({}, params, e.id).E) + " to expected loss." : "");
        card.classList.toggle("is-on", e.on); card.classList.toggle("is-focus", focus === e.id);
        fb.setAttribute("aria-pressed", String(focus === e.id)); fb.textContent = focus === e.id ? "Following" : "Follow this contingency";
      }
      cb.addEventListener("change", function () { e.on = cb.checked; if (!e.on && focus === e.id) focus = null; markPreset(null); changed((e.on ? "Included: " : "Excluded: ") + e.name); });
      mr.addEventListener("input", function () { e.mag = +mr.value; markPreset(null); changed(); });
      e._esync = sync;
      evBox.appendChild(card);
    });
    DB.fillRanges(evBox);
  }
  function renderFutures() {
    var act = active(), dist = [0, 0, 0, 0];
    for (var m = 0; m < (1 << act.length); m++) {
      var w = 1, n = 0;
      act.forEach(function (e, i) { if (m & (1 << i)) { w *= pOf(e); n++; } else w *= 1 - pOf(e); });
      dist[Math.min(3, n)] += w;
    }
    var box = document.getElementById("futures"); box.textContent = "";
    ["None happen", "One", "Two", "Three or more"].forEach(function (lab, i) {
      if (dist[i] < 0.005) return;
      var s = el("span", { class: "futures__seg futures__seg--" + i }); s.style.flexGrow = dist[i];
      s.appendChild(el("b", null, pct(dist[i]))); s.appendChild(el("small", null, lab));
      s.title = lab + ": " + pct(dist[i]);
      box.appendChild(s);
    });
    $("futures-note").textContent = act.length ? "With " + plural(act.length, "contingency", "contingencies") + " included, there's a " + pct(1 - dist[0]) + " chance that at least one happens in the next 30 days. Stage 3 weights each combination by its probability." : "Include a contingency to see how they could combine.";
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
      if (focus && !eventById(focus).on) focus = null;
      rebuild(); markPreset(id);
      changed("Loaded preset: " + b.textContent);
    });
  });
  function rebuild() { buildForecast(); buildEvents(); }

  /* ================= Shared: the network graph ================= */
  // tr: the nodes and edges to highlight; hit: nodes an included event touches; onPick(nodeId)
  function drawGraph(svg, nodeLoss, tr, pickedNode, hit, onPick) {
    svg.textContent = "";
    var tracing = Object.keys(tr.ids).length > 0;
    var max = Math.max(1, Math.max.apply(null, Object.keys(nodeLoss).map(function (k) { return nodeLoss[k]; })));
    EDGES.forEach(function (e, i) {
      var a = NODES[e[0]], b = NODES[e[1]];
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.abs(a.x - b.x) * 0.12;
      var at = { class: "gedge" + (tr.edges[i] ? " is-trace" : tracing ? " is-dim" : ""), d: "M" + a.x + " " + a.y + " Q" + mx + " " + my + " " + b.x + " " + b.y, "stroke-width": 1.6 };
      if (e[2] === "alt") { at.stroke = "rgba(127,224,198,0.55)"; at["stroke-dasharray"] = "5 5"; }
      else at.stroke = e[2] === "hot" ? "rgba(255,122,102,0.45)" : "rgba(232,238,242,0.2)";
      svg.appendChild(sv("path", at));
    });
    Object.keys(NODES).forEach(function (id) {
      var n = NODES[id], loss = nodeLoss[id] || 0;
      var r = 5 + (loss > 0.01 ? 15 * Math.sqrt(loss / max) : 0);
      var g = sv("g", { class: "gnode" + (pickedNode === id ? " is-selected" : "") + (tracing && !tr.ids[id] ? " is-dim" : ""), tabindex: 0, role: "button",
        "aria-label": n.name + (loss > 0.01 ? ", " + money(loss) + " expected loss" : "") + ". Inspect." });
      if (hit[id]) g.appendChild(sv("circle", { class: "gnode__ring", cx: n.x, cy: n.y, r: r + 7 }));
      g.appendChild(sv("circle", { class: "gnode__halo", cx: n.x, cy: n.y, r: r + 4 }));
      g.appendChild(sv("circle", { class: "gnode__dot", cx: n.x, cy: n.y, r: r.toFixed(1),
        fill: loss > 0.01 ? "#ff7a66" : n.kind === "Chokepoint" ? "#ffb547" : n.alt ? "#7fe0c6" : "#9fb0bb" }));
      var anchor = n.lab ? "end" : "start";
      var tx = n.lab === "left" ? n.x - r - 9 : n.lab === "below" ? n.x - 10 : n.x + r + 9;
      var ty = n.lab === "below" ? n.y + r + 15 : n.y + 4;
      g.appendChild(sv("text", { x: tx, y: ty, "text-anchor": anchor }, n.name));
      if (loss > 0.01) g.appendChild(sv("text", { class: "gnode__val", x: tx, y: ty + 13, "text-anchor": anchor }, money(loss)));
      g.addEventListener("click", function () { onPick(id); });
      g.addEventListener("keydown", function (k) { if (k.key === "Enter" || k.key === " ") { k.preventDefault(); onPick(id); } });
      svg.appendChild(g);
    });
  }
  function mainAssetAt(id) {
    return allAssets().filter(function (a) { return a.node === id && (a.type === "Plant" || a.type === "Distribution centre" || a.type === "Chokepoint"); })[0] ||
           allAssets().filter(function (a) { return a.node === id && a.type === "Port"; })[0] || allAssets().filter(function (a) { return a.node === id; })[0];
  }
  function nodeLossOf(S) { return { gebze: S.m_gebze, pune: S.m_pune, dubai: S.m_dubai, dammam: S.m_dammam }; }
  function edgesFor(ids) { var ed = {}; EDGES.forEach(function (e, i) { if (ids[e[0]] && ids[e[1]]) ed[i] = 1; }); return ed; }
  function hitNodes(only) {
    var on = active().map(function (e) { return e.id; }).filter(function (id) { return !only || id === only; }), out = {};
    Object.keys(NODES).forEach(function (id) { if ((NODES[id].touched || []).some(function (t) { return on.indexOf(t) > -1; })) out[id] = 1; });
    return out;
  }
  function teamName(t) { return t ? TEAMS[t].name : "Watched by Daybreak"; }

  /* ================= 3. Impact ================= */
  var DIMS = [
    { id: "money", name: "Money" }, { id: "ops", name: "Operations" }, { id: "customers", name: "Customers" },
    { id: "people", name: "People" }, { id: "commit", name: "Commitments" }
  ];
  function days(d) { return Math.round(d) + (Math.round(d) === 1 ? " day" : " days"); }
  function atRisk(S) { return TRIGGERS.filter(function (t) { return S["t_" + t.id] > 0.05; }); }
  function dimHead(id, S) {
    if (id === "money") return [money(S.money), "expected loss", "If they all happen: " + money(S.w_money)];
    if (id === "ops") return [Math.round(S.lineDays) + " line-days", "lost on average", "If they all happen: " + Math.round(S.w_lineDays) + " line-days and " + Math.round(S.w_units).toLocaleString() + " units not built"];
    if (id === "customers") {
      var mk = [["MENA", S.w_mena], ["EU", S.w_eu], ["India", S.w_india]].sort(function (a, b) { return b[1] - a[1]; });
      return mk[0][1] < 0.5 ? ["No shortfall", "in any market", "Even if they all happen"] : [days(mk[0][1]) + " short", "in " + mk[0][0] + " if they all happen", mk.slice(1).map(function (m) { return m[0] + " " + Math.round(m[1]); }).join(", ") + " days"];
    }
    if (id === "people") return S.w_crew ? [S.w_crew + " seafarers", "in harm's way if Hormuz closes", pct(S.crewP) + " chance. Plant staff stood down: " + pct(S.stoodP) + " chance"] :
      [S.w_stood ? S.w_stood.toLocaleString() + " staff" : "No one", S.w_stood ? "stood down if they all happen" : "in harm's way", "Plant stand-down: " + pct(S.stoodP) + " chance"];
    var ar = atRisk(S).sort(function (a, b) { return S["t_" + b.id] - S["t_" + a.id]; });
    return [plural(ar.length, "commitment"), "at risk", ar.length ? "Most likely: " + ar[0].name + ", " + pct(S["t_" + ar[0].id]) : "None above 5%"];
  }
  function addToPlanBtn(a) {
    var inPlan = !!plan[a.id];
    var b = el("button", { class: "chip-btn chip-btn--sm" + (inPlan ? " is-on" : ""), type: "button", "aria-pressed": String(inPlan) }, inPlan ? "In the plan: " + a.name : "Add to plan: " + a.name);
    b.addEventListener("click", function () { if (plan[a.id]) delete plan[a.id]; else plan[a.id] = true; changed((plan[a.id] ? "Added: " : "Removed: ") + a.name); });
    return b;
  }
  function renderDimDetail(S) {
    var box = document.getElementById("dimdetail"); box.textContent = "";
    var t = el("table", { class: "table table--tight dimtable" }), tb = el("tbody");
    function row(cells, cls) { var tr = el("tr", cls ? { class: cls } : null); cells.forEach(function (c, i) { var td = el(i ? "td" : "th", i ? { class: "r" } : { scope: "row" }); if (c && c.nodeType) td.appendChild(c); else td.textContent = c; tr.appendChild(td); }); tb.appendChild(tr); }
    var cols = ["On average", "If they all happen"];
    if (dim === "money") {
      [["Gebze plant", "gebze"], ["Pune plant", "pune"], ["Dubai DC", "dubai"], ["Dammam DC", "dammam"]].forEach(function (x) { row([x[0], money(S["m_" + x[1]]), money(S["w_m_" + x[1]])]); });
      row(["Freight and insurance", money(S.m_freight), money(S.w_freight)]);
      row(["Late EU deliveries", money(S.m_eu), money(S.w_eu_money)]);
    } else if (dim === "ops") {
      row(["Gebze stopped (3 lines)", "", days(S.w_stop_gebze)]);
      row(["Pune stopped (2 lines)", "", days(S.w_stop_pune)]);
      row(["Line-days lost, both plants", Math.round(S.lineDays), Math.round(S.w_lineDays)]);
      row(["Units not built", Math.round(S.units).toLocaleString(), Math.round(S.w_units).toLocaleString()]);
      row(["Dubai DC out of stock", "", days(S.w_stop_dubai)]);
      row(["Dammam DC out of stock", "", days(S.w_stop_dammam)]);
    } else if (dim === "customers") {
      [["EU retail", "eu", "38% of revenue"], ["India retail", "india", "21% of revenue"], ["MENA retail", "mena", "17% of revenue"]].forEach(function (x) {
        row([x[0] + ", " + x[2], days(S[x[1]]) + " short", days(S["w_" + x[1]]) + " short"]);
      });
      row(["Chance of MENA late-delivery penalties", pct(S.t_mena), S.w_mena > 7 ? "Triggered" : "Not triggered"]);
    } else if (dim === "people") {
      row(["Seafarers on chartered ships inside the strait", pct(S.crewP) + " chance", (S.w_crew ? Math.min(S.w_crew, CREW_IN) : 0) + " people"]);
      row(["Seafarers on the two ships headed for it", plan.divert ? "Diverted" : pct(S.crewP) + " chance", (S.w_crew > CREW_IN ? CREW_OUT : 0) + " people"]);
      row(["Plant staff stood down", pct(S.stoodP) + " chance", S.w_stood.toLocaleString() + " people"]);
      row(["Your teams' capacity for the response", "", readiness(plan).late.length + readiness(plan).overPeople.length ? "Overstretched" : planList(plan).length ? "Enough" : "No plan yet"]);
    } else {
      cols = ["Chance", "Accountable team"];
      TRIGGERS.forEach(function (tg) {
        var fixes = el("span", { class: "dimfix" });
        tg.fix.map(actionById).forEach(function (a) { if (!plan[a.id]) fixes.appendChild(addToPlanBtn(a)); });
        var name = el("span"); name.appendChild(el("b", null, tg.name)); name.appendChild(el("small", null, tg.note)); if (fixes.children.length && S["t_" + tg.id] > 0.005) name.appendChild(fixes);
        row([name, pct(S["t_" + tg.id]), TEAMS[tg.team].name], S["t_" + tg.id] > 0.05 ? "is-hot" : "");
      });
    }
    var th = el("thead"); var hr = el("tr"); hr.appendChild(el("th", { scope: "col" }, DIMS.filter(function (d) { return d.id === dim; })[0].name)); cols.forEach(function (c) { hr.appendChild(el("th", { scope: "col", class: "r" }, c)); }); th.appendChild(hr);
    t.appendChild(th); t.appendChild(tb);
    var wrap = el("div", { class: "table-wrap" }); wrap.appendChild(t); box.appendChild(wrap);
    if (planList(plan).length) box.appendChild(el("p", { class: "table-note" }, "These figures assume you do nothing, so they show what's at stake. Stage 6 compares them with your plan."));
  }
  function renderImpact() {
    var S = stats({}), R = reach(focus);
    var dbox = document.getElementById("dims"); dbox.textContent = "";
    DIMS.forEach(function (d) {
      var h = dimHead(d.id, S);
      var b = el("button", { class: "dim" + (dim === d.id ? " is-on" : ""), type: "button", role: "tab", "aria-selected": String(dim === d.id) });
      b.appendChild(el("span", { class: "dim__name" }, d.name));
      b.appendChild(el("b", { class: "dim__val" }, h[0]));
      b.appendChild(el("span", { class: "dim__lab" }, h[1]));
      b.appendChild(el("span", { class: "dim__sub" }, h[2]));
      b.addEventListener("click", function () { dim = d.id; renderImpact(); });
      dbox.appendChild(b);
    });
    renderDimDetail(S);
    // graph: what's hit, and the path to the selected asset
    if (!assetById(isel)) isel = "c-hormuz";
    // light up everything in the path; trace the selected asset's own route back to the event
    var a = assetById(isel), lit = {}, path = {};
    Object.keys(R).forEach(function (id) { var x = assetById(id); if (x.node) lit[x.node] = 1; });
    (function up(id, d) { var x = assetById(id); if (!x || d > 6) return; if (x.node) path[x.node] = 1; ((R[id] && !R[id].direct) ? [R[id].via] : (x.deps || []).filter(function (k) { return R[k]; })).forEach(function (k) { up(k, d + 1); }); })(R[isel] ? isel : null, 0);
    drawGraph(document.getElementById("igraph"), nodeLossOf(S), { ids: lit, edges: edgesFor(path) }, a && a.node, hitNodes(focus), function (id) {
      var m = mainAssetAt(id); if (m) { isel = m.id; renderImpact(); }
    });
    renderImpactAsset(R, S);
    // everything in the path
    var hb = document.querySelector("#hit tbody"); hb.textContent = "";
    var rows = allAssets().filter(function (x) { return R[x.id]; }).sort(function (x, y) { return R[x.id].depth - R[y.id].depth || (S["m_" + (y.loss || "")] || 0) - (S["m_" + (x.loss || "")] || 0); });
    var byTeam = {};
    rows.forEach(function (x) { var t = x.owner || "none"; byTeam[t] = (byTeam[t] || 0) + 1; });
    var tb = document.getElementById("hit-teams"); tb.textContent = "";
    Object.keys(byTeam).sort(function (x, y) { return byTeam[y] - byTeam[x]; }).forEach(function (t) {
      var b = el("button", { class: "chip-btn chip-btn--sm" + (hitTeam === t ? " is-on" : ""), type: "button", "aria-pressed": String(hitTeam === t) }, (t === "none" ? "Watched by Daybreak" : TEAMS[t].name) + " " + byTeam[t]);
      b.addEventListener("click", function () { hitTeam = hitTeam === t ? "" : t; renderImpact(); });
      tb.appendChild(b);
    });
    $("hit-count").textContent = rows.length + " of " + allAssets().length + " assets" + (focus ? ", from " + eventById(focus).short : "");
    rows.filter(function (x) { return !hitTeam || (x.owner || "none") === hitTeam; }).forEach(function (x) {
      var r = R[x.id], tr = el("tr", { class: (isel === x.id ? "is-sel" : "") + (r.direct ? " is-hot" : ""), tabindex: 0 });
      var c0 = el("td"); c0.appendChild(el("b", null, x.name)); c0.appendChild(el("span", { class: "table__sub" }, x.type + ", " + x.where)); tr.appendChild(c0);
      tr.appendChild(el("td", null, r.direct ? "Hit directly by " + r.ev.map(function (e) { return EVSHORT[e]; }).join(" and ") : "Via " + assetById(r.via).name));
      tr.appendChild(el("td", null, teamName(x.owner)));
      tr.appendChild(el("td", { class: "r" + (x.loss ? " money money--loss" : "") }, x.loss ? money(S["m_" + x.loss]) : x.key));
      var pick = function () { isel = x.id; renderImpact(); document.getElementById("iasset").scrollIntoView({ block: "nearest", behavior: "smooth" }); };
      tr.addEventListener("click", pick);
      tr.addEventListener("keydown", function (k) { if (k.key === "Enter") pick(); });
      hb.appendChild(tr);
    });
    if (!rows.length) { var e0 = el("tr"); e0.appendChild(el("td", { colspan: 4, class: "register__empty" }, "Nothing is affected. Include a contingency in stage 2.")); hb.appendChild(e0); }
  }
  function renderImpactAsset(R, S) {
    var box = document.getElementById("iasset"), a = assetById(isel); box.textContent = "";
    if (!a) return;
    box.appendChild(el("p", { class: "eyebrow inspector__type" }, a.type + (a.custom ? ", from your data" : "")));
    box.appendChild(el("h3", { class: "inspector__title" }, a.name));
    box.appendChild(el("p", { class: "inspector__desc" }, a.where + ". " + a.key + "."));
    var r = R[a.id], hit = el("p", { class: "inspector__touch" });
    if (!r) hit.textContent = "Not affected by the contingencies you've included.";
    else if (r.direct) hit.textContent = "Hit directly by " + r.ev.map(function (e) { return "“" + eventById(e).name + "”"; }).join(" and ") + ".";
    else {
      var chain = [], c = a.id;
      while (R[c] && !R[c].direct && chain.length < 6) { c = R[c].via; chain.push(assetById(c).name); }
      hit.textContent = "Affected via " + chain[0] + (chain.length > 1 ? ", which relies on " + chain.slice(1).join(", which relies on ") : "") + ".";
    }
    box.appendChild(hit);
    var dl = el("dl", { class: "facts" });
    function fact(k, v) { var d = el("div"); d.appendChild(el("dt", null, k)); d.appendChild(el("dd", null, v)); dl.appendChild(d); }
    if (a.loss) { fact("Expected loss here", money(S["m_" + a.loss])); fact("Stopped, if they all happen", days(S["w_stop_" + a.loss])); }
    (a.attrs || []).slice(0, 3).forEach(function (f) { fact(f[0], f[1]); });
    box.appendChild(dl);
    if (a.owner) {
      box.appendChild(el("p", { class: "ins-h" }, "Who handles it"));
      var T = TEAMS[a.owner], who = el("p", { class: "ins-who" });
      who.appendChild(el("b", null, T.name)); who.appendChild(document.createTextNode(", led by " + T.lead + ". " + plural(peopleOf(a.owner).length, "person", "people") + " with " + teamFree(a.owner) + " free hours this week. "));
      who.appendChild(linkBtn("Open the team", function () { openTeam = a.owner; goTo("deliver"); }));
      box.appendChild(who);
    }
    var prot = ACTIONS.filter(function (x) { return x.protects.indexOf(a.id) > -1; });
    if (prot.length) {
      box.appendChild(el("p", { class: "ins-h" }, "What would protect it"));
      var ch = el("div", { class: "ins-chips ins-chips--stack" });
      prot.forEach(function (x) { ch.appendChild(addToPlanBtn(x)); });
      box.appendChild(ch);
    }
    var ed = el("button", { class: "btn btn--ghost btn--sm", type: "button" }, "Edit in your model");
    ed.addEventListener("click", function () { sel = { kind: "asset", id: a.id }; goTo("model:network"); });
    box.appendChild(ed);
  }

  /* ================= 4. Decide ================= */
  var opBody = document.querySelector("#options tbody");
  document.getElementById("op-sort").addEventListener("change", function (e) { sortBy = e.target.value; renderDecide(); });
  function renderDecide() {
    var S = stats({}), ar = atRisk(S);
    $("carry-decide").textContent = "At stake from stage 3: " + money(S.money) + " of expected loss, " + plural(ar.length, "commitment") + " at risk" +
      (S.w_crew ? ", and " + S.w_crew + " seafarers if Hormuz closes" : "") + (focus ? ". Actions that don't address " + eventById(focus).short + " are faded." : ". Tick actions to build a plan, or let Daybreak recommend one.");
    opBody.textContent = "";
    var act = active().map(function (e) { return e.id; }), r = readiness(plan);
    var rows = ACTIONS.map(function (a) {
      var w = M.clone(plan), wo = without(plan, a.id); w[a.id] = true;
      var value = stats(wo).money - stats(w).money;
      return { a: a, c: cfg(a), value: value, net: value - cfg(a).cost, relevant: a.helps.some(function (h) { return act.indexOf(h) > -1 && (!focus || h === focus); }) };
    });
    rows.sort(function (x, y) {
      if (sortBy === "cost") return x.c.cost - y.c.cost;
      if (sortBy === "lead") return x.c.lead - y.c.lead;
      return y[sortBy] - x[sortBy];
    });
    rows.forEach(function (row) {
      var a = row.a, c = row.c, ra = r.acts[a.id];
      var tr = el("tr", { class: (plan[a.id] ? "is-in" : "") + (row.relevant ? "" : " is-idle") });
      var td = el("td");
      var cb = el("input", { type: "checkbox", "aria-label": "Include: " + a.name }); cb.checked = !!plan[a.id];
      cb.addEventListener("change", function () { if (cb.checked) plan[a.id] = true; else delete plan[a.id]; changed((cb.checked ? "Added: " : "Removed: ") + a.name); });
      td.appendChild(cb); tr.appendChild(td);
      var nm = el("td", { class: "options__name" }, a.name);
      if (c.way !== a.ways[0]) nm.appendChild(el("span", { class: "table__sub" }, c.way.name));
      tr.appendChild(nm);
      var pr = a.protects.map(assetById).filter(Boolean);
      tr.appendChild(el("td", { class: "options__helps" }, pr.slice(0, 2).map(function (x) { return x.name; }).join(", ") + (pr.length > 2 ? " and " + (pr.length - 2) + " more" : "")));
      tr.appendChild(el("td", { class: "r money" }, row.value > 0.005 ? money(row.value) : "—"));
      tr.appendChild(el("td", { class: "r money" }, money(c.cost, 2)));
      tr.appendChild(el("td", { class: "r money " + (row.net > 0 ? "money--safe" : "money--loss") }, row.value > 0.005 ? signed(row.net) : "—"));
      var lt = el("td");
      if (ra) lt.appendChild(el("span", { class: "pill " + (ra.late ? "pill--loss" : "pill--safe") }, ra.late ? "Lands day " + ra.lands + ", " + ra.late + "d late" : "Lands day " + ra.lands + " of " + a.need));
      else lt.appendChild(el("span", { class: "pill pill--quiet" }, c.lead + "d, needed in " + a.need + "d"));
      tr.appendChild(lt);
      var lead = personById(crewOf(a)[0]), ow = el("td", { class: "options__team" });
      ow.appendChild(linkBtn(lead.name, function () { openTeam = lead.team; goTo("deliver"); }));
      ow.appendChild(el("span", { class: "table__sub" }, TEAMS[lead.team].name));
      tr.appendChild(ow);
      opBody.appendChild(tr);
    });
    drawFrontier();
  }
  var frontier = document.getElementById("frontier");
  // every combination of actions, valued as your teams would actually deliver it (who, how and when as set in stage 5)
  function allPlans() {
    if (cache.plans) return cache.plans;
    var out = [];
    for (var m = 0; m < (1 << ACTIONS.length); m++) {
      var A = {};
      ACTIONS.forEach(function (a, i) { if (m & (1 << i)) A[a.id] = true; });
      out.push({ A: A, cost: costOf(A), full: stats(A).money, E: Edel(A), ok: !readiness(A).late.length, n: planList(A).length });
    }
    return (cache.plans = out);
  }
  var showAll = false;
  document.getElementById("frontier-all").addEventListener("change", function (e) { showAll = e.target.checked; drawFrontier(); });
  function netOf(p, E) { return E0() - E - p.cost; }
  // the original chart: the best plan your teams can staff in time at each budget, valued if every action lands in full
  function drawFrontier() {
    var plans = allPlans(), e0 = E0();
    var x0 = 64, x1 = 612, y0 = 18, y1 = 236;
    var maxC = Math.max.apply(null, plans.map(function (p) { return p.cost; }));
    var maxE = Math.max(e0, 1);
    var sx = function (c) { return x0 + (x1 - x0) * c / maxC; }, sy = function (e) { return y1 - (y1 - y0) * e / maxE; };
    frontier.textContent = "";
    [0, 0.5, 1].forEach(function (f) {
      frontier.appendChild(sv("line", { x1: x0, x2: x1, y1: sy(maxE * f), y2: sy(maxE * f), class: "grid" }));
      frontier.appendChild(sv("text", { x: x0 - 10, y: sy(maxE * f) + 4, class: "axis", "text-anchor": "end" }, money(maxE * f, 0)));
    });
    [0, maxC / 2, maxC].forEach(function (c) { frontier.appendChild(sv("text", { x: sx(c), y: y1 + 20, class: "axis", "text-anchor": "middle" }, money(c, 1))); });
    frontier.appendChild(sv("text", { x: (x0 + x1) / 2, y: y1 + 42, class: "axis", "text-anchor": "middle" }, "Plan cost"));
    frontier.appendChild(sv("text", { x: 14, y: (y0 + y1) / 2, class: "axis", "text-anchor": "middle", transform: "rotate(-90 14 " + (y0 + y1) / 2 + ")" }, "Expected loss"));
    var pool = plans.filter(function (p) { return p.ok; }), sorted = pool.slice().sort(function (a, b) { return a.cost - b.cost; }), best = Infinity, front = [];
    sorted.forEach(function (p) { if (p.full < best - 1e-9) { best = p.full; front.push(p); } });
    function dot(p, cls, r) {
      var c = sv("circle", { cx: sx(p.cost).toFixed(1), cy: sy(p.full).toFixed(1), r: r, class: cls });
      c.appendChild(sv("title", null, (p.n ? planList(p.A).map(function (a) { return a.name; }).join("; ") : "Do nothing") +
        "\nCost " + money(p.cost, 2) + ", expected loss " + money(p.full) + ", net " + signed(netOf(p, p.full)) + (p.ok ? "" : "\nCan't be staffed in time")));
      c.addEventListener("click", function () { plan = M.clone(p.A); changed("Adopted a plan from the chart (" + plural(p.n, "action") + ")"); });
      frontier.appendChild(c);
    }
    if (showAll) plans.forEach(function (p) { dot(p, p.ok ? "fp fp--faint" : "fp fp--no", 2.4); });
    frontier.appendChild(sv("path", { class: "fline", d: front.map(function (p, i) { return (i ? "L" : "M") + sx(p.cost).toFixed(1) + " " + sy(p.full).toFixed(1); }).join(" ") }));
    var bestNet = pool.reduce(function (b, p) { return netOf(p, p.full) > netOf(b, b.full) ? p : b; }, pool[0]);
    front.forEach(function (p) { dot(p, "fp fp--front" + (p === bestNet ? " fp--best" : ""), p === bestNet ? 6.5 : 4.5); });
    var bx = sx(bestNet.cost), by = sy(bestNet.full);
    frontier.appendChild(sv("text", { x: bx, y: by + 22, class: "axis axis--best", "text-anchor": "middle" }, "Best net value"));
    var mc = costOf(plan), me = stats(plan).money, mx = sx(mc), my = sy(me);
    frontier.appendChild(sv("circle", { cx: mx, cy: my, r: 9, class: "fp--mine" }));
    // put the label where it can't collide: above unless near the top, left unless near the right edge
    var lx = mx > x1 - 90 ? mx - 14 : mx + 14, ly = my < y0 + 30 ? my + 24 : my - 14;
    if (Math.abs(lx - bx) < 70 && Math.abs(ly - (by + 22)) < 14) ly = my - 20;
    frontier.appendChild(sv("text", { x: lx, y: ly, class: "axis axis--mine", "text-anchor": mx > x1 - 90 ? "end" : "start" }, "Your plan"));
    $("frontier-note").textContent = "Each dot on the line is the cheapest plan your teams can deliver in time for that level of protection. The best one saves " +
      money(Math.max(0, netOf(bestNet, bestNet.full))) + " net, for " + money(bestNet.cost, 2) + (showAll ? ". Faint dots are the other combinations; hollow ones can't be staffed in time." : ".");
  }
  function bestPlan(capacityAware, maxE) {
    var plans = allPlans(), key = capacityAware ? "E" : "full";
    var pool = plans.filter(function (p) { return (maxE == null || p[key] <= maxE) && (!capacityAware || p.ok); });
    if (!pool.length) return null;
    return maxE != null ? pool.reduce(function (b, p) { return p.cost < b.cost ? p : b; }, pool[0])
                        : pool.reduce(function (b, p) { return netOf(p, p[key]) > netOf(b, b[key]) ? p : b; }, pool[0]);
  }
  function recommend(kind) {
    if (kind === "none") { plan = {}; changed("Cleared the plan"); return; }
    plan = M.clone(bestPlan(kind === "staffed").A);
    changed(kind === "staffed" ? "Recommended the best plan your teams can deliver" : "Recommended the best plan, ignoring capacity");
  }
  document.querySelectorAll("[data-recommend]").forEach(function (b) { b.addEventListener("click", function () { recommend(b.getAttribute("data-recommend")); }); });

  /* ================= 5. Deliver ================= */
  function initials(n) { return n.split(" ").map(function (w) { return w.charAt(0); }).join("").slice(0, 2); }
  function avatar(p, D) {
    var over = D[p.id] > freeOf(p) + 0.01, busy = D[p.id] > 0.01;
    return el("span", { class: "av" + (over ? " is-over" : busy ? " is-busy" : ""), title: p.name + ", " + p.role + ": " + Math.round(D[p.id]) + " of " + freeOf(p) + " free hours" }, initials(p.name));
  }
  function teamActions(t, r) { return planList(plan).filter(function (a) { return ownerOf(a) === t; }); }
  function helpingOn(t) { return planList(plan).filter(function (a) { return ownerOf(a) !== t && crewOf(a).some(function (id) { return personById(id).team === t; }); }); }
  function renderDeliver() {
    var r = readiness(plan), list = planList(plan);
    if (!openTeam) openTeam = (list[0] && ownerOf(list[0])) || "log";
    var box = document.getElementById("board"); box.textContent = "";
    Object.keys(TEAMS).forEach(function (t) {
      var T = TEAMS[t], mine = teamActions(t, r), help = helpingOn(t), ppl = peopleOf(t);
      var D = ppl.reduce(function (s, p) { return s + r.D[p.id]; }, 0), F = teamFree(t);
      var over = ppl.filter(function (p) { return r.D[p.id] > freeOf(p) + 0.01; }), late = mine.filter(function (a) { return r.acts[a.id].late; });
      var card = el("button", { class: "tcard" + (openTeam === t ? " is-open" : "") + (over.length ? " is-over" : "") + (mine.length || help.length ? "" : " is-idle"), type: "button", role: "tab", "aria-selected": String(openTeam === t) });
      card.appendChild(el("b", { class: "tcard__name" }, T.name));
      card.appendChild(el("span", { class: "tcard__lead" }, T.lead));
      var bar = el("span", { class: "tcard__bar" }); var fill = el("i"); fill.style.width = Math.min(100, F ? D / F * 100 : 0) + "%"; bar.appendChild(fill); card.appendChild(bar);
      card.appendChild(el("span", { class: "tcard__hrs" }, Math.round(D) + " of " + F + " free hours" + (capacity[t] && capacity[t] !== "normal" ? ", " + CAPACITY[capacity[t]].name.toLowerCase() : "")));
      var avs = el("span", { class: "tcard__avs" }); ppl.forEach(function (p) { avs.appendChild(avatar(p, r.D)); }); card.appendChild(avs);
      card.appendChild(el("span", { class: "tcard__status" + (over.length || late.length ? " is-warn" : "") },
        !mine.length && !help.length ? "No plan actions" : [mine.length ? "Leads " + plural(mine.length, "action") : "", help.length ? "helps with " + help.length : "", over.length ? plural(over.length, "person", "people") + " stretched" : "", late.length ? late.length + " late" : ""].filter(Boolean).join(", ")));
      card.addEventListener("click", function () { openTeam = t; renderDeliver(); });
      box.appendChild(card);
    });
    renderTeam(openTeam, r);
    drawGantt(r);
  }
  function renderTeam(t, r) {
    var T = TEAMS[t], ws = document.getElementById("teamws"); ws.textContent = "";
    var head = el("div", { class: "tws__head" });
    var hl = el("div"); hl.appendChild(el("h3", { class: "tws__title" }, T.name));
    var exec = EXECS.filter(function (x) { return x.id === T.parent; })[0];
    hl.appendChild(el("p", { class: "tws__sub" }, "Led by " + T.lead + ", " + T.role + ". Reports to " + exec.lead + ", " + exec.title + ". " + T.heads.toLocaleString() + " people, " + Math.round(T.load * 100) + "% of their time already committed."));
    head.appendChild(hl);
    // how the team finds the hours: a decision with a price, not a checkbox
    var capBox = el("div", { class: "tws__cap" });
    capBox.appendChild(el("p", { class: "tws__label" }, "Where the hours come from"));
    var seg = el("div", { class: "choice", role: "radiogroup", "aria-label": "Capacity for " + T.name });
    Object.keys(CAPACITY).forEach(function (k) {
      var C = CAPACITY[k], on = (capacity[t] || "normal") === k;
      var b = el("button", { class: "choice__opt" + (on ? " is-on" : ""), type: "button", role: "radio", "aria-checked": String(on) });
      b.appendChild(el("b", null, C.name));
      b.appendChild(el("small", null, k === "normal" ? teamFreeAt(t, 1) + " free hours" : k === "overtime" ? "+35%, " + money(C.cost, 2) : "+20%, no cost"));
      b.addEventListener("click", function () { if (k === "normal") delete capacity[t]; else capacity[t] = k; changed(T.name + ": " + C.name.toLowerCase()); });
      seg.appendChild(b);
    });
    capBox.appendChild(seg);
    if (capacity[t] === "defer") capBox.appendChild(el("p", { class: "tws__warn" }, "Knock-on: " + T.defer + "."));
    head.appendChild(capBox);
    ws.appendChild(head);
    // the people
    var ppl = el("ul", { class: "people" });
    peopleOf(t).forEach(function (p) {
      var li = el("li", { class: "person" + (r.D[p.id] > freeOf(p) + 0.01 ? " is-over" : "") });
      li.appendChild(avatar(p, r.D));
      var tx = el("div", { class: "person__txt" }); tx.appendChild(el("b", null, p.name)); tx.appendChild(el("span", null, p.role)); li.appendChild(tx);
      var on = planList(plan).filter(function (a) { return crewOf(a).indexOf(p.id) > -1; });
      var ld = el("div", { class: "person__load" });
      var bar = el("span", { class: "person__bar" }); var f = el("i"); f.style.width = Math.min(100, freeOf(p) ? r.D[p.id] / freeOf(p) * 100 : 100) + "%"; bar.appendChild(f); ld.appendChild(bar);
      ld.appendChild(el("span", { class: "person__hrs" }, Math.round(r.D[p.id]) + " of " + freeOf(p) + " h" + (on.length ? ": " + on.map(function (a) { return a.short; }).join(", ") : "")));
      li.appendChild(ld);
      ppl.appendChild(li);
    });
    ws.appendChild(ppl);
    // the actions this team leads: how, who, when
    var mine = teamActions(t, r);
    ws.appendChild(el("p", { class: "tws__label" }, mine.length ? "Actions " + T.name + " leads" : "Actions"));
    if (!mine.length) {
      var em = el("p", { class: "tws__empty" }, planList(plan).length ? T.name + " doesn't lead any action in this plan. " : "There's no plan yet. ");
      em.appendChild(linkBtn(planList(plan).length ? "Back to the plan" : "Build one in Decide", function () { goTo("decide"); }));
      ws.appendChild(em);
    }
    mine.forEach(function (a) { ws.appendChild(actionCard(a, r)); });
    var help = helpingOn(t);
    if (help.length) ws.appendChild(el("p", { class: "tws__note" }, T.name + " also lends people to: " + help.map(function (a) { return a.name + " (" + TEAMS[ownerOf(a)].name + ")"; }).join("; ") + "."));
  }
  function teamFreeAt(t, f) { return peopleOf(t).reduce(function (s, p) { return s + Math.round((freeEdit[p.id] != null ? freeEdit[p.id] : p.free) * f); }, 0); }
  function actionCard(a, r) {
    var c = cfg(a), ra = r.acts[a.id], card = el("article", { class: "acard" + (ra.late ? " is-late" : "") });
    var top = el("div", { class: "acard__top" });
    top.appendChild(el("h4", null, a.name));
    top.appendChild(el("span", { class: "pill " + (ra.late ? "pill--loss" : "pill--safe") }, ra.late ? "Lands day " + ra.lands + ", " + ra.late + " days late" : "Lands day " + ra.lands + ", needed by day " + a.need));
    card.appendChild(top);
    card.appendChild(el("p", { class: "acard__eff" }, (ra.f < 0.999 ? "Delivers " + Math.round(ra.f * 100) + "% of its protection, because " + [c.eff < 1 ? "this approach covers " + Math.round(c.eff * 100) + "%" : "", ra.late ? "it lands late" : ""].filter(Boolean).join(" and ") : "Delivers its full protection") +
      ". " + c.hours + " hours of work, " + money(c.cost, 2) + "."));
    // how
    var how = el("div", { class: "acard__row" }); how.appendChild(el("span", { class: "acard__lab" }, "How"));
    var hw = el("div", { class: "choice choice--wrap", role: "radiogroup", "aria-label": "How to do: " + a.name });
    a.ways.forEach(function (w, i) {
      var on = (way[a.id] || 0) === i, b = el("button", { class: "choice__opt" + (on ? " is-on" : ""), type: "button", role: "radio", "aria-checked": String(on) });
      b.appendChild(el("b", null, w.name));
      var d = [];
      if (i) { if (w.cost) d.push((w.cost > 0 ? "+" : "−") + money(Math.abs(w.cost), 2)); if (w.lead) d.push(Math.abs(w.lead) + (w.lead < 0 ? " days faster" : " days slower")); if (w.hours) d.push((w.hours > 0 ? "+" : "−") + Math.abs(w.hours) + " h"); if (w.eff < 1) d.push("covers " + Math.round(w.eff * 100) + "%"); }
      b.appendChild(el("small", null, i ? d.join(", ") + (w.note ? ". " + w.note : "") : "The default"));
      b.addEventListener("click", function () { if (i) way[a.id] = i; else delete way[a.id]; changed(a.name + ": " + w.name.toLowerCase()); });
      hw.appendChild(b);
    });
    how.appendChild(hw); card.appendChild(how);
    // who
    var who = el("div", { class: "acard__row" }); who.appendChild(el("span", { class: "acard__lab" }, "Who"));
    var wb = el("div", { class: "crew" }), cr = crewOf(a), lead = ownerOf(a);
    function setCrew(next, msg) { if (!next.length) return; if (JSON.stringify(next) === JSON.stringify(a.crew)) delete crew[a.id]; else crew[a.id] = next; changed(msg); }
    peopleOf(lead).concat(cr.map(personById).filter(function (p) { return p.team !== lead; })).forEach(function (p) {
      var on = cr.indexOf(p.id) > -1, b = el("button", { class: "crew__p" + (on ? " is-on" : "") + (r.D[p.id] > freeOf(p) + 0.01 ? " is-over" : ""), type: "button", "aria-pressed": String(on),
        title: on && cr.length === 1 ? "Someone has to do it" : (on ? "Take " : "Put ") + p.name + (on ? " off " : " on ") + "this action" });
      b.appendChild(avatar(p, r.D));
      var tt = el("span"); tt.appendChild(el("b", null, p.name.split(" ")[0] + (p.team !== lead ? ", " + TEAMS[p.team].name : ""))); tt.appendChild(el("small", null, on ? Math.round(shareOf(a, p)) + " h on this, " + Math.round(r.D[p.id]) + " of " + freeOf(p) + " h in total" : freeOf(p) - Math.round(r.D[p.id]) + " h free")); b.appendChild(tt);
      b.addEventListener("click", function () {
        if (on && cr.length === 1) { DB.toast("Someone has to do it. Add another person first."); return; }
        setCrew(on ? cr.filter(function (x) { return x !== p.id; }) : cr.concat([p.id]), (on ? "Took " : "Put ") + p.name + (on ? " off " : " on ") + a.name);
      });
      wb.appendChild(b);
    });
    var bor = el("select", { class: "num-input crew__borrow", "aria-label": "Borrow someone for " + a.name });
    bor.appendChild(el("option", { value: "" }, "Borrow someone"));
    Object.keys(TEAMS).filter(function (t) { return t !== lead; }).forEach(function (t) {
      var og = el("optgroup", { label: TEAMS[t].name });
      peopleOf(t).filter(function (p) { return cr.indexOf(p.id) < 0; }).forEach(function (p) { og.appendChild(el("option", { value: p.id }, p.name + ", " + (freeOf(p) - Math.round(r.D[p.id])) + " h free")); });
      bor.appendChild(og);
    });
    bor.addEventListener("change", function () { var p = personById(bor.value); if (p) setCrew(cr.concat([p.id]), "Borrowed " + p.name + " from " + TEAMS[p.team].name + " for " + a.name); });
    wb.appendChild(bor);
    who.appendChild(wb); card.appendChild(who);
    // when
    var when = el("div", { class: "acard__row" }); when.appendChild(el("span", { class: "acard__lab" }, "Starts"));
    var ss = el("div", { class: "choice choice--days", role: "radiogroup", "aria-label": "Start of " + a.name });
    [0, 1, 2, 3, 5, 7].forEach(function (d) {
      var on = (start[a.id] || 0) === d, b = el("button", { class: "choice__opt" + (on ? " is-on" : ""), type: "button", role: "radio", "aria-checked": String(on) }, d === 0 ? "Today" : "Day " + d);
      b.addEventListener("click", function () { if (d) start[a.id] = d; else delete start[a.id]; changed("Scheduled " + a.name + " to start " + (d ? "day " + d : "today")); });
      ss.appendChild(b);
    });
    when.appendChild(ss); card.appendChild(when);
    if (ra.stretch > 1.001) card.appendChild(el("p", { class: "acard__why" }, "The crew is asked for " + Math.round((ra.stretch - 1) * 100) + "% more time than it has, so the work takes " + Math.ceil(c.lead * ra.stretch - 1e-9) + " days instead of " + c.lead + ". Add someone, change how it's done, or find more hours."));
    return card;
  }
  function shareOf(a, p) {
    var cr = crewOf(a).map(personById), F = cr.reduce(function (s, x) { return s + freeOf(x); }, 0);
    return F ? cfg(a).hours * freeOf(p) / F : cfg(a).hours / cr.length;
  }
  var gantt = document.getElementById("gantt");
  function drawGantt(r) {
    // drawn at the panel's own width, so the labels stay at reading size
    var Wd = Math.max(620, Math.round(gantt.getBoundingClientRect().width) || 720);
    var acts = planList(plan), H = 30, x0 = 250, x1 = Wd - 14, rowH = 30, y0 = 30;
    gantt.setAttribute("viewBox", "0 0 " + Wd + " " + Math.max(120, y0 + acts.length * rowH + 24));
    gantt.textContent = "";
    var sx = function (d) { return x0 + (x1 - x0) * Math.min(d, H) / H; };
    [0, 7, 14, 21, 28].forEach(function (d) {
      gantt.appendChild(sv("line", { x1: sx(d), x2: sx(d), y1: y0 - 6, y2: y0 + Math.max(1, acts.length) * rowH, class: "grid" }));
      gantt.appendChild(sv("text", { x: sx(d), y: y0 - 12, class: "axis", "text-anchor": "middle" }, d === 0 ? "Today" : "Day " + d));
    });
    if (!acts.length) { gantt.appendChild(sv("text", { x: Wd / 2, y: 70, class: "axis", "text-anchor": "middle" }, "Add actions in Decide to see the timeline.")); return; }
    acts.forEach(function (a, i) {
      var ra = r.acts[a.id], y = y0 + i * rowH + 4, s0 = start[a.id] || 0, lead = personById(crewOf(a)[0]);
      gantt.appendChild(sv("text", { x: x0 - 12, y: y + 9, class: "gantt__name", "text-anchor": "end" }, a.name));
      gantt.appendChild(sv("text", { x: x0 - 12, y: y + 21, class: "gantt__who", "text-anchor": "end" }, lead.name + (crewOf(a).length > 1 ? " and " + (crewOf(a).length - 1) + " more" : "")));
      var g = sv("rect", { x: sx(s0), y: y, width: Math.max(4, sx(ra.lands) - sx(s0)), height: 18, rx: 4, class: ra.late ? "gbar gbar--late" : "gbar" });
      g.style.cursor = "pointer";
      g.addEventListener("click", function () { openTeam = lead.team; renderDeliver(); document.getElementById("teamws").scrollIntoView({ behavior: "smooth", block: "start" }); });
      gantt.appendChild(g);
      gantt.appendChild(sv("line", { x1: sx(a.need), x2: sx(a.need), y1: y - 3, y2: y + 21, class: "gdead" }));
    });
    gantt.appendChild(sv("text", { x: x1, y: y0 + acts.length * rowH + 18, class: "axis", "text-anchor": "end" }, "Bars run from start to completion; ticks mark deadlines. Click a bar to open its team."));
  }

  /* ================= 6. Consequences ================= */
  function renderOutcomes() {
    var N = 4000, f = fOf(plan), s0 = simulate({}, params, N, 7), s1 = simulate(plan, params, N, 7, f);
    var S0 = stats({}), S1 = delivered(plan), cost = costOf(plan), net = S0.money - S1.money - cost, none0 = 0;
    for (var i = 0; i < N; i++) if (s0[i] < 0.01) none0++;
    var has = planList(plan).length;
    var groups = [
      ["Money", [["Expected loss", money(S0.money), money(S1.money), S1.money < S0.money - 0.05 ? "safe" : ""], ["Bad case (1 in 20)", money(q(s0, 0.95)), money(q(s1, 0.95))], ["Plan cost, including overtime", "—", money(cost, 2), ""],
        ["Net value of the plan", "—", (net >= 0 ? "" : "−") + money(Math.abs(net)), net >= 0 ? "safe" : "loss"]]],
      ["Operations", [["Line-days lost, on average", Math.round(S0.lineDays), Math.round(S1.lineDays)], ["Units not built, if they all happen", Math.round(S0.w_units).toLocaleString(), Math.round(S1.w_units).toLocaleString()]]],
      ["Customers, if every contingency happens", [["Days short, EU retail", days(S0.w_eu), days(S1.w_eu)], ["Days short, India retail", days(S0.w_india), days(S1.w_india)], ["Days short, MENA retail", days(S0.w_mena), days(S1.w_mena)]]],
      ["People", [["Seafarers in harm's way if Hormuz closes", String(Math.round(S0.w_crew)), String(Math.round(S1.w_crew))], ["Chance plant staff are stood down", pct(S0.stoodP), pct(S1.stoodP)]]],
      ["Commitments: chance of a breach", TRIGGERS.map(function (t) { return [t.name, pct(S0["t_" + t.id]), pct(S1["t_" + t.id]), S1["t_" + t.id] < S0["t_" + t.id] - 0.005 ? "safe" : ""]; })]
    ];
    var tb = document.getElementById("compare"); tb.textContent = "";
    groups.forEach(function (g) {
      var gh = el("tr", { class: "compare__group" }); gh.appendChild(el("th", { scope: "rowgroup", colspan: 3 }, g[0])); tb.appendChild(gh);
      g[1].forEach(function (r) {
        var tr = el("tr"); tr.appendChild(el("th", { scope: "row" }, r[0]));
        tr.appendChild(el("td", { class: "r money" }, r[1]));
        var better = r.length > 3 ? r[3] : (r[2] !== r[1] && has ? "safe" : "");
        tr.appendChild(el("td", { class: "r money" + (better ? " money--" + better : "") }, has ? r[2] : "—"));
        tb.appendChild(tr);
      });
    });
    drawHist(s0, s1);
    var r = readiness(plan), short = planList(plan).filter(function (a) { return r.acts[a.id].f < 0.999; });
    $("hist-note").textContent = "Dashed bars: doing nothing. Filled bars: your plan as delivered" + (short.length ? " (the " + short.map(function (a) { return a.short; }).join(" and ") + " may not fully land)" : "") +
      ". In " + Math.round(100 * none0 / N) + "% of futures nothing goes wrong, so those aren't drawn.";
    drawTornado(S1.money);
    var cb = document.querySelector("#combos tbody"); cb.textContent = "";
    var cs = combos(plan, params).filter(function (c) { return !focus || c.names.indexOf(EVSHORT[focus]) > -1; });
    cs.slice(0, 10).forEach(function (c) {
      var tr = el("tr");
      tr.appendChild(el("td", { class: "combos__what" }, c.names.length ? c.names.join(" + ") : "Nothing happens"));
      tr.appendChild(el("td", { class: "r" }, (c.w * 100 < 1 ? (c.w * 100).toFixed(1) : Math.round(c.w * 100)) + "%"));
      tr.appendChild(el("td", { class: "r money" }, money(c.l0)));
      tr.appendChild(el("td", { class: "r money " + (c.l1 < c.l0 - 0.05 ? "money--safe" : "") }, money(c.l1)));
      cb.appendChild(tr);
    });
    if (cs.length > 10) { var more = el("tr"); more.appendChild(el("td", { colspan: 4, class: "register__empty" }, cs.length - 10 + " less likely combinations not shown.")); cb.appendChild(more); }
    if (focus) { var fr = el("tr"); fr.appendChild(el("td", { colspan: 4, class: "register__empty" }, "Showing only the futures that include “" + eventById(focus).name + "”, because you're following it. The plan column assumes every action lands in full.")); cb.appendChild(fr); }
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
    if (!rows.length) { tornado.appendChild(sv("text", { x: 260, y: 60, class: "axis", "text-anchor": "middle" }, "Include a contingency to see what drives the loss.")); return; }
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

  /* ================= Your model: network, assets, teams ================= */
  function get(o, path) { return path.split(".").reduce(function (x, k) { return x[k]; }, o); }
  function set(o, path, v) { var ks = path.split("."), last = ks.pop(); ks.reduce(function (x, k) { return x[k]; }, o)[last] = v; }
  function fmt(v, step) { var dp = step < 1 ? (String(step).split(".")[1] || "").length : 0; return (+v).toFixed(dp); }
  function exposureOf(a, S) {
    if (a.loss) return { money: S["m_" + a.loss], text: money(S["m_" + a.loss]) };
    var on = active().map(function (e) { return e.id; });
    var hit = (a.events || []).filter(function (e) { return on.indexOf(e) > -1; });
    return { money: null, text: hit.length ? hit.map(function (h) { return EVSHORT[h]; }).join(", ") : "—", n: hit.length };
  }
  // selected graph nodes: the asset's own node plus its dependencies' nodes (and what depends on it)
  function traceNodes() {
    var ids = {};
    if (sel.kind === "asset") {
      var a = assetById(sel.id); if (!a) return { ids: ids, edges: {} };
      var seen = {};
      (function up(x, d) { if (!x || seen[x.id] || d > 3) return; seen[x.id] = 1; if (x.node) ids[x.node] = 1; (x.deps || []).forEach(function (id) { up(assetById(id), d + 1); }); })(a, 0);
      allAssets().forEach(function (b) { if ((b.deps || []).indexOf(a.id) > -1 && b.node) ids[b.node] = 1; });
    } else if (sel.kind === "team") {
      allAssets().forEach(function (b) { if (b.owner === sel.id && b.node) ids[b.node] = 1; });
    }
    return { ids: ids, edges: edgesFor(ids) };
  }
  var regBody = document.querySelector("#register tbody"), typesBox = document.getElementById("asset-types");
  var TYPE_ORDER = ["Supplier", "Port", "Chokepoint", "Lane", "Vessel", "Plant", "Distribution centre", "Market", "Contract", "Site"];
  function renderRegister(S) {
    var list = allAssets();
    typesBox.textContent = "";
    var all = el("button", { class: "chip-btn" + (typeFilter ? "" : " is-on"), type: "button" }, "All " + list.length);
    all.addEventListener("click", function () { typeFilter = ""; renderModel(); });
    typesBox.appendChild(all);
    TYPE_ORDER.forEach(function (t) {
      var c = list.filter(function (a) { return a.type === t; }).length; if (!c) return;
      var b = el("button", { class: "chip-btn" + (typeFilter === t ? " is-on" : ""), type: "button" }, (t === "Distribution centre" ? "DCs" : t + "s") + " " + c);
      b.addEventListener("click", function () { typeFilter = typeFilter === t ? "" : t; renderModel(); });
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
      var ex = exposureOf(a, S);
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
      var pick = function () { sel = { kind: "asset", id: a.id }; renderModel(); };
      tr.addEventListener("click", pick);
      tr.addEventListener("keydown", function (k) { if (k.key === "Enter") pick(); });
      regBody.appendChild(tr);
    });
  }
  var orgBox = document.getElementById("org");
  function renderOrg() {
    orgBox.textContent = "";
    EXECS.forEach(function (x) {
      var col = el("div", { class: "org__col" });
      var head = el("div", { class: "org__exec" });
      head.appendChild(el("span", { class: "org__role" }, x.title));
      head.appendChild(el("b", null, x.lead));
      col.appendChild(head);
      var kids = el("ul", { class: "org__kids" });
      Object.keys(TEAMS).filter(function (t) { return TEAMS[t].parent === x.id; }).forEach(function (t) {
        var T = TEAMS[t], owned = allAssets().filter(function (a) { return a.owner === t; }).length;
        var li = el("li");
        var card = el("button", { type: "button", class: "org__team" + (sel.kind === "team" && sel.id === t ? " is-sel" : "") });
        card.appendChild(el("b", { class: "org__name" }, T.name));
        card.appendChild(el("span", { class: "org__lead" }, T.lead + ", " + T.role));
        var avs = el("span", { class: "tcard__avs" }), none = {};
        peopleOf(t).forEach(function (p) { none[p.id] = 0; avs.appendChild(avatar(p, none)); });
        card.appendChild(avs);
        card.appendChild(el("span", { class: "org__meta" }, T.heads.toLocaleString() + " people, " + teamFreeAt(t, 1) + " free hours this week, owns " + plural(owned, "asset")));
        card.addEventListener("click", function () { sel = { kind: "team", id: t }; renderModel(); });
        li.appendChild(card); kids.appendChild(li);
      });
      col.appendChild(kids);
      orgBox.appendChild(col);
    });
  }
  var ins = document.getElementById("inspector");
  // a list of linked assets, capped at six with a "show all" toggle
  function assetList(list) {
    var ul = el("ul", { class: "ins-list" });
    list.forEach(function (d, i) {
      var li = el("li"); if (i >= 6) li.hidden = true;
      li.appendChild(linkBtn(d.name, function () { sel = { kind: "asset", id: d.id }; renderModel(); }));
      ul.appendChild(li);
    });
    if (list.length > 6) {
      var more = el("li"), b = linkBtn("Show all " + list.length, function () { ul.querySelectorAll("li[hidden]").forEach(function (x) { x.hidden = false; }); more.remove(); });
      b.classList.add("ins-more"); more.appendChild(b); ul.appendChild(more);
    }
    return ul;
  }
  function renderInspector(S) {
    ins.textContent = "";
    if (sel.kind === "team") {
      var t = sel.id, T = TEAMS[t];
      $("type").textContent = "Team"; $("name").textContent = T.name;
      $("desc").textContent = T.lead + ", " + T.role + ". " + T.heads.toLocaleString() + " people. " + Math.round(T.load * 100) + "% of their time already committed this week.";
      ins.appendChild(el("p", { class: "ins-h" }, "Free hours this week, from Workday"));
      peopleOf(t).forEach(function (p) {
        var id = "free-" + p.id, base = p.free, cur = freeEdit[p.id] != null ? freeEdit[p.id] : base;
        var w = el("div", { class: "prop" });
        var lab = el("label", { class: "prop__top", for: id });
        lab.appendChild(el("span", null, p.name + ", " + p.role));
        var bl = el("span", { class: "prop__base" + (cur !== base ? " is-changed" : "") }, "Workday " + base + " h"); lab.appendChild(bl); w.appendChild(lab);
        var inp = el("input", { class: "num-input" + (cur !== base ? " is-changed" : ""), id: id, type: "number", min: 0, max: 40, step: 1, value: cur });
        inp.addEventListener("change", function () {
          var v = parseInt(inp.value, 10); if (isNaN(v)) return; v = Math.max(0, Math.min(40, v));
          if (v === base) delete freeEdit[p.id]; else freeEdit[p.id] = v;
          changed("Set " + p.name + "'s free hours to " + v);
        });
        w.appendChild(inp); ins.appendChild(w);
      });
      ins.appendChild(el("p", { class: "ins-h" }, "Owns"));
      ins.appendChild(assetList(allAssets().filter(function (a) { return a.owner === t; })));
      var op = el("button", { class: "btn btn--ghost btn--sm", type: "button" }, "See its work in Deliver");
      op.addEventListener("click", function () { openTeam = t; goTo("deliver"); });
      ins.appendChild(op);
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
    var dd = el("dd"); if (a.owner) dd.appendChild(linkBtn(teamName(a.owner), function () { sel = { kind: "team", id: a.owner }; view = "org"; document.querySelector('input[name="wview"][value="org"]').checked = true; renderModel(); })); else dd.textContent = teamName(null);
    ownerRow.appendChild(dd); dl2.appendChild(ownerRow);
    (a.attrs || []).forEach(function (f) { var d = el("div"); d.appendChild(el("dt", null, f[0])); d.appendChild(el("dd", null, f[1])); dl2.appendChild(d); });
    ins.appendChild(dl2);
    var on = active().map(function (e) { return e.id; });
    if ((a.events || []).length) {
      ins.appendChild(el("p", { class: "ins-h" }, "Exposed to"));
      var ex = el("div", { class: "ins-chips" });
      a.events.forEach(function (e) { ex.appendChild(el("span", { class: "pill " + (on.indexOf(e) > -1 ? "pill--loss" : "pill--quiet") }, EVSHORT[e] + (on.indexOf(e) > -1 ? "" : " (not included)"))); });
      ins.appendChild(ex);
    }
    var deps = (a.deps || []).map(assetById).filter(Boolean);
    if (deps.length) { ins.appendChild(el("p", { class: "ins-h" }, "Depends on")); ins.appendChild(assetList(deps)); }
    var users = allAssets().filter(function (b) { return (b.deps || []).indexOf(a.id) > -1; });
    if (users.length) { ins.appendChild(el("p", { class: "ins-h" }, "Relied on by")); ins.appendChild(assetList(users)); }
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
    var see = el("button", { class: "btn btn--ghost btn--sm", type: "button" }, "See its impact in this scenario");
    see.addEventListener("click", function () { isel = a.id; goTo("impact"); });
    ins.appendChild(see);
  }
  function renderModel() {
    var S = stats({});
    var isData = view === "data";
    document.querySelector('[data-mview="world"]').hidden = isData;
    document.querySelector('[data-mview="data"]').hidden = !isData;
    document.querySelectorAll("[data-view]").forEach(function (v) { v.hidden = v.getAttribute("data-view") !== view; });
    $("asset-count").textContent = allAssets().length + " assets, " + Object.keys(TEAMS).length + " teams, " + PEOPLE.length + " people on call.";
    var me = modelEdits();
    $("model-edits").textContent = me ? plural(me, "edit") + " so far." : "";
    if (isData) { renderSignals(); renderCode(); return; }
    if (sel.kind === "team" && view !== "org") sel = { kind: "asset", id: "c-hormuz" };
    if (view === "network") drawGraph(document.getElementById("graph"), nodeLossOf(S), traceNodes(), sel.kind === "asset" ? (assetById(sel.id) || {}).node : sel.kind === "node" ? sel.id : null, hitNodes(null), function (id) {
      var m = mainAssetAt(id); sel = m ? { kind: "asset", id: m.id } : { kind: "node", id: id }; renderModel();
    });
    if (view === "assets") renderRegister(S);
    if (view === "org") { if (sel.kind !== "team") sel = { kind: "team", id: "log" }; renderOrg(); }
    renderInspector(S);
  }
  document.querySelectorAll('input[name="wview"]').forEach(function (r) {
    r.addEventListener("change", function () { view = r.value; if (view !== "org" && sel.kind === "team") sel = { kind: "asset", id: "c-hormuz" }; renderModel(); });
  });
  document.getElementById("asset-q").addEventListener("input", function (e) { query = e.target.value; renderModel(); });

  /* ================= Your model: data and signals ================= */
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
      (added.length ? " Added " + added.length + " new asset" + (added.length > 1 ? "s" : "") + " to the asset register: " + added.join(", ") + ". Give each an owner and its dependencies there." : "");
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
    Object.keys(way).forEach(function (id) { L.push('s.how(<span class="s">"' + id + '"</span>, <span class="s">"' + actionById(id).ways[way[id]].name + '"</span>)'); });
    Object.keys(crew).forEach(function (id) { L.push('s.crew(<span class="s">"' + id + '"</span>, [' + crew[id].map(function (p) { return '<span class="s">"' + p + '"</span>'; }).join(", ") + "])"); });
    Object.keys(start).forEach(function (id) { L.push('s.start(<span class="s">"' + id + '"</span>, day=<span class="n">' + start[id] + "</span>)"); });
    Object.keys(capacity).forEach(function (t) { L.push('s.capacity(<span class="s">"' + t + '"</span>, <span class="s">"' + capacity[t] + '"</span>)'); });
    Object.keys(freeEdit).forEach(function (id) { L.push('w.people[<span class="s">"' + id + '"</span>].free_hours = <span class="n">' + freeEdit[id] + "</span>"); });
    L.push('r = s.run(plan, n=<span class="n">4_000</span>)');
    L.push('r.expected_loss      <span class="c"># ' + money(Edel(plan)) + " as delivered (" + money(E0()) + " doing nothing)</span>");
    L.push('r.route_to_owners()  <span class="c"># send each person their action, with a deadline</span>');
    document.getElementById("code").innerHTML = L.join("\n");
  }
  document.getElementById("copy").addEventListener("click", function () {
    var t = document.getElementById("code").textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { DB.toast("Copied."); }, function () { DB.toast("Couldn't reach the clipboard."); });
  });

  /* ================= The thread: every stage's result, always in view ================= */
  var logEl = document.getElementById("log");
  function log(msg) {
    var d = new Date(), li = el("li");
    li.appendChild(el("time", null, [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (n) { return String(n).padStart(2, "0"); }).join(":")));
    li.appendChild(el("span", null, msg));
    logEl.insertBefore(li, logEl.firstChild);
    while (logEl.children.length > 30) logEl.removeChild(logEl.lastChild);
  }
  function modelEdits() {
    var n = 0;
    Object.keys(PROPS).forEach(function (p) { if (Math.abs(get(M.BASE, p) - get(params, p)) > 1e-9) n++; });
    return n + signals.length + custom.length + Object.keys(freeEdit).length;
  }
  function countChanges() {
    var n = 0;
    events.forEach(function (e) { if (e.on !== e.base.on || Math.abs(e.p - e.base.p) > 1e-9 || e.mag !== e.base.mag) n++; });
    return n + modelEdits() + planList(plan).length + Object.keys(crew).length + Object.keys(way).length + Object.keys(start).length + Object.keys(capacity).length;
  }
  var lastNet = null;
  function renderThread() {
    var act = active(), S0 = stats({}), r = readiness(plan), list = planList(plan), D = delivered(plan), cost = costOf(plan), net = S0.money - D.money - cost;
    var moved = events.filter(function (e) { return Math.abs(e.p - e.base.p) > 1e-9; }).length;
    $("t-forecast").textContent = act.length ? act.slice(0, 2).map(function (e) { return e.short + " " + Math.round(pOf(e) * 100) + "%"; }).join(", ") + (act.length > 2 ? " and " + (act.length - 2) + " more" : "") : "Nothing included";
    $("t-forecast-sub").textContent = moved ? plural(moved, "override") : "Daybreak's fused forecast";
    var none = act.reduce(function (s, e) { return s * (1 - pOf(e)); }, 1);
    $("t-events").textContent = plural(act.length, "contingency", "contingencies");
    $("t-events-sub").textContent = act.length ? pct(1 - none) + " chance at least one happens" : "Include one to begin";
    $("t-impact").textContent = money(S0.money) + " expected loss";
    var ar = atRisk(S0);
    $("t-impact-sub").textContent = Object.keys(reach(null)).length + " assets, " + plural(ar.length, "commitment") + " at risk";
    $("t-decide").textContent = list.length ? plural(list.length, "action") : "No plan yet";
    $("t-decide-sub").textContent = list.length ? money(cost, 2) + " to put in place" : "Daybreak can recommend one";
    var ppl = {}; list.forEach(function (a) { crewOf(a).forEach(function (id) { ppl[id] = 1; }); });
    $("t-deliver").textContent = !list.length ? "Nothing to deliver" : r.late.length ? r.late.length + " of " + list.length + " land late" : "All land in time";
    $("t-deliver-sub").textContent = list.length ? plural(Object.keys(ppl).length, "person", "people") + " assigned" + (r.overPeople.length ? ", " + r.overPeople.length + " overstretched" : "") : "No work assigned";
    var tv = $("t-outcomes");
    tv.textContent = list.length ? (net >= 0 ? "Saves " : "Loses ") + money(Math.abs(net)) + " net" : "No plan yet";
    $("t-outcomes-sub").textContent = list.length ? (ar.length ? atRisk(D).length + " of " + ar.length + " commitments still at risk" : "after cost, as delivered") : "Build one to compare outcomes";
    tv.classList.toggle("is-safe", list.length > 0 && net >= 0); tv.classList.toggle("is-loss", list.length > 0 && net < 0);
    if (lastNet != null && Math.abs(lastNet - net) > 0.05) { tv.classList.remove("is-bump"); void tv.offsetWidth; tv.classList.add("is-bump"); }
    lastNet = net;
    document.querySelectorAll(".thread__stage").forEach(function (t) {
      var id = t.getAttribute("data-step");
      t.classList.toggle("is-warn", (id === "deliver" && (r.late.length > 0 || r.overPeople.length > 0)));
    });
    var fb = document.getElementById("focusbar");
    fb.hidden = !focus;
    if (focus) $("focus-name").textContent = "“" + eventById(focus).name + "”";
    var c = countChanges(), ch = $("changes");
    ch.textContent = c ? c + " unsaved change" + (c > 1 ? "s" : "") : "No changes";
    ch.classList.toggle("is-dirty", c > 0);
    var me = modelEdits(), mn = $("model-n");
    mn.hidden = !me; mn.textContent = me;
  }
  var heavy;
  function render(now) {
    cache = {};
    renderThread();
    events.forEach(function (e) { if (e._fsync) e._fsync(); if (e._esync) e._esync(); });
    clearTimeout(heavy);
    var go = function () {
      if (mode === "model") { renderModel(); return; }
      if (stage === "events") renderFutures();
      if (stage === "impact") renderImpact();
      if (stage === "decide") renderDecide();
      if (stage === "deliver") renderDeliver();
      if (stage === "outcomes") renderOutcomes();
    };
    if (now) go(); else heavy = setTimeout(go, 60);
  }
  var logTimer;
  function changed(msg) {
    render(false);
    if (msg) log(msg);
    else { clearTimeout(logTimer); logTimer = setTimeout(function () { log("Re-ran the scenario: " + money(Edel(plan)) + " expected"); }, 700); }
  }
  document.getElementById("reset").addEventListener("click", function () { resetState(); focus = null; rebuild(); markPreset("morning"); changed("Reset to production"); });
  document.getElementById("commit").addEventListener("click", function () {
    var c = countChanges();
    if (!c) { DB.toast("Nothing to commit yet. Change a contingency, the model or the plan first."); return; }
    log("Committed scenario halvorsen/v14.2+" + c);
    DB.toast(planList(plan).length ? "Committed as a scenario. Each person on the plan has their action, with a deadline." : "Committed as a scenario.");
  });

  /* ================= Ask Daybreak: questions about the live scenario ================= */
  var askOpen = document.getElementById("ask-open"), drawer = document.getElementById("askdrawer");
  document.body.appendChild(drawer); // out of .page's stacking context, so it can sit over the sticky bar
  var askLog = document.getElementById("ask-log"), askForm = document.getElementById("ask-form"), askInput = document.getElementById("ask-input");
  var askSuggest = document.getElementById("ask-suggest");
  function currentStep() { return mode === "model" ? "model" : stage; }
  var SUGGEST = {
    forecast: ["Why is Hormuz 27%?", "What if the Gebze strike is 40% likely?", "What's driving the loss?"],
    events: ["What if Hormuz stays closed for 60 days?", "What depends on Jebel Ali?", "What's driving the loss?"],
    impact: ["How exposed is the Gebze plant?", "Who owns the most exposed assets?", "What's the worst that could happen?"],
    decide: ["What should we do?", "What's the cheapest plan that halves the loss?", "Is my plan worth it?"],
    deliver: ["Which team is the bottleneck?", "Why is safety stock late?", "Can we staff the best plan?"],
    outcomes: ["Is my plan worth it?", "What's the worst that could happen?", "What's driving the loss?"],
    model: ["What data would improve the model?", "How would a custom signal help?", "What depends on Jebel Ali?"]
  };
  function setDrawer(open) {
    drawer.hidden = !open; askOpen.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("ask-is-open", open);
    if (open) { renderSuggest(); if (!askLog.children.length) say({ text: ["Ask me about this scenario: what's driving the loss, what to do, who has to do it, or what a change would cost. I answer from the numbers on screen and can make the change for you."] }); askInput.focus(); }
    else askOpen.focus();
  }
  askOpen.addEventListener("click", function () { setDrawer(drawer.hidden); });
  document.getElementById("ask-close").addEventListener("click", function () { setDrawer(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !drawer.hidden) setDrawer(false); });
  function renderSuggest() {
    askSuggest.textContent = "";
    (SUGGEST[currentStep()] || SUGGEST.events).forEach(function (q) {
      var b = el("button", { type: "button", class: "chip-btn" }, q);
      b.addEventListener("click", function () { ask(q); });
      askSuggest.appendChild(b);
    });
  }
  function say(a, who) {
    var li = el("li", { class: "amsg " + (who === "user" ? "amsg--user" : "amsg--bot") });
    (a.text || []).forEach(function (t) { li.appendChild(el("p", null, t)); });
    if (a.facts && a.facts.length) {
      var dl = el("dl", { class: "amsg__facts" });
      a.facts.forEach(function (f) { var d = el("div", f[2] ? { class: "is-" + f[2] } : null); d.appendChild(el("dt", null, f[0])); d.appendChild(el("dd", null, f[1])); dl.appendChild(d); });
      li.appendChild(dl);
    }
    if (a.actions && a.actions.length) {
      var box = el("div", { class: "amsg__acts" });
      a.actions.forEach(function (x, i) {
        var b = el("button", { type: "button", class: "btn btn--sm " + (i ? "btn--ghost" : "btn--primary") }, x.label);
        b.addEventListener("click", function () { x.run(); if (x.done) { b.disabled = true; b.textContent = x.done; } });
        box.appendChild(b);
      });
      li.appendChild(box);
    }
    askLog.appendChild(li);
    askLog.scrollTop = askLog.scrollHeight;
  }
  function ask(text) {
    text = text.trim(); if (!text) return;
    say({ text: [text] }, "user"); askInput.value = "";
    var typing = el("li", { class: "amsg amsg--bot amsg--typing" }, "…");
    askLog.appendChild(typing); askLog.scrollTop = askLog.scrollHeight;
    setTimeout(function () { typing.remove(); say(answer(text)); renderSuggest(); }, 450);
  }
  askForm.addEventListener("submit", function (e) { e.preventDefault(); ask(askInput.value); });

  var EV_WORDS = { hormuz: /hormuz|strait|gulf closure/, redsea: /red sea|suez|bab/, strike: /strike|union|labou?r/, feeders: /feeder|sanction|me4/, bunker: /bunker|fuel|oil/ };
  function findEvent(q) { for (var k in EV_WORDS) if (EV_WORDS[k].test(q)) return events.filter(function (e) { return e.id === k; })[0]; return null; }
  function findAsset(q) {
    var best = null, score = 0;
    allAssets().forEach(function (a) {
      var words = (a.name + " " + a.where).toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length > 3; });
      var s = words.filter(function (w) { return q.indexOf(w) > -1; }).length;
      if (q.indexOf(a.name.toLowerCase()) > -1) s += 5;
      if (s > score) { score = s; best = a; }
    });
    return best;
  }
  function findAction(q) {
    var best = null, score = 0;
    ACTIONS.forEach(function (a) {
      var s = a.name.toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length > 3 && q.indexOf(w) > -1; }).length;
      if (s > score) { score = s; best = a; }
    });
    return best;
  }
  function showAsset(a) { return { label: "Show " + a.name, run: function () { isel = a.id; goTo("impact"); } }; }
  function adopt(p, why) { return { label: "Adopt this plan", done: "Adopted", run: function () { plan = M.clone(p.A); changed(why); } }; }
  function planFacts(p) { return planList(p.A).map(function (a) { return [a.name, money(a.cost, 2)]; }); }

  function answer(raw) {
    var q = raw.toLowerCase(), E0 = expected({}, params).E, E1 = Edel(plan);
    var ev = findEvent(q);
    // what-if: change an event's duration/size or probability
    var num = q.match(/(\d+)\s*(%|percent|days?|weeks?)/);
    if (ev && num && /what if|if |suppose|happens if|lasts|stays|closes for|likely/.test(q)) {
      var v = +num[1], unit = num[2], next = { p: ev.p, mag: ev.mag };
      if (/%|percent/.test(unit)) next.p = Math.max(0.01, Math.min(0.95, v / 100)); else next.mag = Math.max(ev.min, Math.min(ev.max, v * (/week/.test(unit) ? 7 : 1)));
      var tw = { id: ev.id, p: next.p - pOf(ev), mag: next.mag / ev.mag };
      var wasOn = ev.on; ev.on = true;
      var e0 = expected({}, params, null, tw).E, e1 = expected(plan, params, null, tw).E;
      ev.on = wasOn;
      return {
        text: ["Setting “" + ev.name + "” to " + [next.mag !== ev.mag ? next.mag + (ev.unit.charAt(0) === "%" ? "%" : " " + ev.unit) : "", next.p !== ev.p ? Math.round(next.p * 100) + "% likely" : ""].filter(Boolean).join(", ") +
          " changes the expected loss of doing nothing from " + money(E0) + " to " + money(e0) + "." + (planList(plan).length ? " With your plan it's " + money(e1) + "." : " You don't have a plan yet.")],
        facts: [["Doing nothing", money(e0), "loss"]].concat(planList(plan).length ? [["With your plan", money(e1)]] : []).concat([["Change vs now", signed(e1 - E1), e1 > E1 ? "loss" : "safe"]]),
        actions: [{ label: "Apply to the scenario", done: "Applied", run: function () { ev.on = true; ev.p = next.p; ev.mag = next.mag; rebuild(); markPreset(null); changed("Applied what-if: " + ev.short); } }]
      };
    }
    if (ev && /why|how did|how does|where does|get (to|that)|come from/.test(q) && !/late|slow|delay/.test(q)) {
      return { text: ["Daybreak split “" + ev.name + "” into parts and sent each to the engine built for it" + (ev.declined ? ", and declined one part no one can forecast" : "") + ". Fused and calibrated, that's " + Math.round(ev.base.p * 100) + "%, ±" + ev.band + " points over 30 days." +
          (Math.abs(pOf(ev) - ev.base.p) > 0.005 ? " With your overrides and signals it's " + Math.round(pOf(ev) * 100) + "%." : "")],
        facts: ev.subs.map(function (s) { return [s[0] + ": " + s[1], Math.round(ev.fused[s[0]] * 100) + "%"]; }).concat(ev.declined ? [["Declined: " + ev.declined, "no skill"]] : []),
        actions: [{ label: "Show the working", run: function () { opened[ev.id] = true; goTo("forecast"); } }] };
    }
    if (/driv|biggest|main (risk|cause)|what matters|where.*loss come/.test(q)) {
      var rows = active().map(function (e) { return { e: e, add: E0 - expected({}, params, e.id).E }; }).sort(function (a, b) { return b.add - a.add; });
      if (!rows.length) return { text: ["No contingencies are included, so nothing is driving a loss yet. Include one in stage 2."] };
      var base = expected({}, params).nodes, sites = Object.keys(base).sort(function (a, b) { return base[b] - base[a]; });
      var top = assetById({ gebze: "f-gebze", pune: "f-pune", dubai: "d-dubai", dammam: "d-dammam" }[sites[0]]);
      return {
        text: [rows[0].e.name + " drives most of it, adding " + money(rows[0].add) + " of the " + money(E0) + " expected loss. The site that takes the biggest hit is " + top.name + "."],
        facts: rows.map(function (r) { return [r.e.short + ", " + Math.round(pOf(r.e) * 100) + "%", signed(r.add), "loss"]; }),
        actions: [showAsset(top), { label: "See what moves it most", run: function () { goTo("outcomes"); } }]
      };
    }
    if (/cheapest|half|halv|cut .*loss in/.test(q)) {
      var target = E0 / 2, p = bestPlan(true, target);
      if (!p) return { text: ["No plan your teams can deliver halves the loss. Find more hours in Deliver and ask again."] };
      return { text: ["The cheapest plan that halves expected loss (to " + money(p.E) + " or less) as your teams would deliver it costs " + money(p.cost, 2) + "."], facts: planFacts(p), actions: [adopt(p, "Adopted the cheapest plan that halves the loss")] };
    }
    if (/what should|recommend|best plan|what do we do|best move/.test(q) && !/staff|capacity/.test(q)) {
      var b = bestPlan(true), bAll = bestPlan(false);
      var t = ["The best plan your teams can deliver, with today's crews, saves " + money(E0 - b.E - b.cost) + " net, for " + money(b.cost, 2) + "."];
      if (bAll && bAll.full < b.E - 0.1 && planList(bAll.A).length > planList(b.A).length) t.push("Ignoring capacity, a bigger plan would save " + money(E0 - bAll.full - bAll.cost) + " on paper, but your teams can't land all of it in time.");
      return { text: t, facts: planFacts(b), actions: [adopt(b, "Adopted the recommended plan")] };
    }
    if (/worth|net value|is my plan|my plan good/.test(q)) {
      var pl = planList(plan);
      if (!pl.length) return { text: ["You don't have a plan yet. Ask me what you should do, or tick actions in Decide."], actions: [{ label: "Go to Decide", run: function () { goTo("decide"); } }] };
      var cost = costOf(plan), net = E0 - E1 - cost, b2 = bestPlan(true);
      return {
        text: [net > 0 ? "Yes. It cuts expected loss from " + money(E0) + " to " + money(E1) + " for " + money(cost, 2) + ", worth " + money(net) + " net." : "Not on these numbers. It costs " + money(cost, 2) + " but only removes " + money(E0 - E1) + " of expected loss.",
          "If nothing happens, you've spent " + money(cost, 2) + "." + (b2 && (E0 - b2.E - b2.cost) > net + 0.1 ? " A different plan would save " + money(E0 - b2.E - b2.cost - net) + " more." : "")],
        actions: b2 && (E0 - b2.E - b2.cost) > net + 0.1 ? [adopt(b2, "Adopted a better plan")] : []
      };
    }
    if (/worst|bad case|tail|disaster/.test(q)) {
      var w0 = worst({}, params), w1 = worst(plan, params);
      return { text: ["If every contingency you've included happens at once, the loss is " + money(w0.total) + (planList(plan).length ? " doing nothing and " + money(w1.total) + " with your plan." : ". You don't have a plan yet to soften it.")],
        facts: [["Plants and DCs, doing nothing", money(w0.total - w0.freight - w0.eu), "loss"], ["Freight and insurance", money(w0.freight), "loss"], ["Late EU deliveries", money(w0.eu), "loss"]],
        actions: [{ label: "See the spread", run: function () { goTo("outcomes"); } }] };
    }
    if (/bottleneck|capacity|overloaded|stretched|staff/.test(q)) {
      var target2 = /best plan|recommend/.test(q) ? bestPlan(false).A : plan;
      var r = readiness(target2);
      if (!planList(target2).length) return { text: ["There's no plan yet, so no one is stretched. Ask me what you should do first."] };
      if (!r.overPeople.length && !r.late.length) return { text: ["Everyone on " + (target2 === plan ? "your" : "that") + " plan has the hours this week, and every action lands before its deadline."] };
      var acts = [], t3 = [];
      r.overPeople.slice(0, 4).forEach(function (id) { var p = personById(id); t3.push(p.name + " (" + TEAMS[p.team].name + ") is asked for " + Math.round(r.D[id]) + " hours but has " + freeOf(p) + "."); });
      r.late.forEach(function (a) { t3.push(a.name + " lands on day " + r.acts[a.id].lands + ", " + r.acts[a.id].late + " days after it's needed."); });
      r.overTeams.slice(0, 2).forEach(function (t) { if (!capacity[t]) acts.push({ label: "Put " + TEAMS[t].name + " on overtime", done: "On overtime", run: function () { capacity[t] = "overtime"; changed(TEAMS[t].name + ": overtime"); } }); });
      var first = r.overTeams[0] || (r.late[0] && ownerOf(r.late[0]));
      acts.push({ label: first ? "Open " + TEAMS[first].name : "Open Deliver", run: function () { if (first) openTeam = first; goTo("deliver"); } });
      return { text: t3, actions: acts };
    }
    if (/late|why.*(slow|delay)/.test(q)) {
      var rr = readiness(plan), a = findAction(q) || planList(plan).filter(function (x) { return rr.acts[x.id].late; })[0] || ACTIONS.filter(function (x) { return cfg(x).lead > x.need; })[0];
      var A2 = M.clone(plan); A2[a.id] = true;
      var ra = readiness(A2).acts[a.id], c = cfg(a), t4 = [];
      t4.push(a.name + " (“" + c.way.name + "”) takes " + c.lead + " days to put in place" + (start[a.id] ? ", starting day " + start[a.id] : "") + ", and it's needed within " + a.need + ".");
      if (ra.stretch > 1.001) t4.push("Its crew is asked for " + Math.round((ra.stretch - 1) * 100) + "% more time than it has, which stretches it to " + Math.ceil(c.lead * ra.stretch - 1e-9) + " days.");
      t4.push(ra.late ? "It lands " + ra.late + " days late, so it delivers " + Math.round(ra.f * 100) + "% of its protection." : "It lands in time.");
      var alt = a.ways.filter(function (w) { return a.lead + w.lead <= a.need; })[0];
      if (ra.late && alt && alt !== c.way) t4.push("Doing it as “" + alt.name + "” would land in time, at " + Math.round(alt.eff * 100) + "% of the protection.");
      return { text: t4, actions: [{ label: "Open " + TEAMS[ownerOf(a)].name, run: function () { openTeam = ownerOf(a); goTo("deliver"); } }] };
    }
    if (/depend|relies|rely|upstream|downstream|feeds/.test(q)) {
      var as = findAsset(q);
      if (!as) return { text: ["Which asset? Try a port, plant or supplier, like Jebel Ali or the Gebze plant."] };
      var users = allAssets().filter(function (b) { return (b.deps || []).indexOf(as.id) > -1; }), deps = (as.deps || []).map(assetById).filter(Boolean);
      return { text: [users.length + (users.length === 1 ? " asset relies" : " assets rely") + " on " + as.name + ", and " + as.name + " relies on " + deps.length + "."],
        facts: users.slice(0, 6).map(function (u) { return [u.name, u.type]; }).concat(deps.length ? [["It relies on", deps.map(function (d) { return d.name; }).join(", ")]] : []),
        actions: [showAsset(as)] };
    }
    if (/who owns|owners?|which team owns/.test(q)) {
      var on = active().map(function (e) { return e.id; }), byTeam = {};
      allAssets().forEach(function (a2) { if (a2.owner && (a2.events || []).some(function (x) { return on.indexOf(x) > -1; })) byTeam[a2.owner] = (byTeam[a2.owner] || 0) + 1; });
      var ts = Object.keys(byTeam).sort(function (a3, b3) { return byTeam[b3] - byTeam[a3]; });
      if (!ts.length) return { text: ["No owned assets are exposed to the contingencies you've included."] };
      return { text: [TEAMS[ts[0]].name + ", led by " + TEAMS[ts[0]].lead + ", owns the most exposed assets (" + byTeam[ts[0]] + ")."],
        facts: ts.map(function (t) { return [TEAMS[t].name, byTeam[t] + " exposed"]; }),
        actions: [{ label: "Open " + TEAMS[ts[0]].name, run: function () { openTeam = ts[0]; goTo("deliver"); } }] };
    }
    if (/data|improve the model|missing|blind spot/.test(q)) {
      return { text: ["Three gaps would sharpen this scenario most:"],
        facts: [["Gebze MES", "2 fields unmapped, so line rates are estimates"], ["Supplier tier 2", "Who supplies the Bursa seat maker isn't modelled"], ["Dammam DC stock", "Cover is a weekly snapshot, not live"]],
        actions: [{ label: "Load a dataset", run: function () { goTo("model:data"); } }] };
    }
    if (/signal/.test(q)) {
      return { text: ["A custom signal is one of your own indicators, such as container dwell time at Jebel Ali, that nudges a forecast when it fires. Daybreak back-tests it on your history before it counts, so a noisy signal can't skew the numbers."],
        actions: [{ label: "Build a signal", run: function () { goTo("model:data"); } }] };
    }
    var as2 = findAsset(q);
    if (as2 && /expos|risk|how bad|loss|at stake/.test(q) || as2 && q.split(" ").length <= 4) {
      var nodes = nodeLossOf(delivered(plan)), base2 = nodeLossOf(stats({})), onIds = active().map(function (e) { return e.id; });
      var hit = (as2.events || []).filter(function (x) { return onIds.indexOf(x) > -1; });
      return { text: [as2.name + " (" + as2.where + ") is exposed to " + (hit.length ? hit.map(function (h) { return EVSHORT[h]; }).join(" and ") : "none of the contingencies you've included") + "." +
        (as2.loss ? " Expected loss there is " + money(base2[as2.loss]) + (planList(plan).length ? " doing nothing, " + money(nodes[as2.loss]) + " with your plan." : ".") : "")],
        facts: (as2.attrs || []).slice(0, 3), actions: [showAsset(as2)] };
    }
    return { text: ["I can answer how a forecast was made, what's driving the loss, what you should do, whether your plan is worth it, which team is the bottleneck, what depends on an asset, or what a change would cost (try \"what if Hormuz closes for 60 days\")."] };
  }

  rebuild();
  log("Loaded halvorsen/v14.2: " + ASSETS.length + " assets, " + Object.keys(TEAMS).length + " teams, " + PEOPLE.length + " people");
  log("AIS: 22 Halvorsen vessels tracked, 3 inside the strait");
  render(true);
})();
