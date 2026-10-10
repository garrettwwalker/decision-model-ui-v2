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

  /* ---------- Inputs: the events ---------- */
  var EVENTS_BASE = [
    { id: "hormuz", name: "Strait of Hormuz closes", detail: "Closed to commercial traffic", p: 0.27, mag: 21, unit: "days", min: 3, max: 90, on: true,
      fused: { Judgment: 0.33, Telemetry: 0.26, Procedure: 0.22 } },
    { id: "redsea", name: "Red Sea shuts to traffic", detail: "Suez lost; Asia–Europe goes round the Cape", p: 0.34, mag: 30, unit: "days", min: 7, max: 120, on: true,
      fused: { Judgment: 0.38, Telemetry: 0.31, Procedure: 0.30 } },
    { id: "strike", name: "Strike at the Gebze plant", detail: "Metalworkers' contract expires 1 November", p: 0.18, mag: 10, unit: "days", min: 2, max: 45, on: false,
      fused: { Judgment: 0.24, Telemetry: 0.12, Procedure: 0.19 } },
    { id: "feeders", name: "Sanctions hit two ME4 feeders", detail: "They share a technical manager with listed tankers", p: 0.19, mag: 45, unit: "days", min: 7, max: 120, on: false,
      fused: { Judgment: 0.21, Telemetry: 0.15, Procedure: 0.22 } },
    { id: "bunker", name: "Bunker fuel spikes", detail: "Fujairah VLSFO over this quarter", p: 0.30, mag: 35, unit: "% higher", min: 10, max: 80, on: false,
      fused: { Judgment: 0.27, Telemetry: 0.34, Procedure: 0.29 } }
  ];

  /* ---------- The decision space ---------- */
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
  var TEAMS = {
    proc: { name: "Procurement", lead: "VP Procurement", spare: 45, load: 0.72 },
    log: { name: "Logistics", lead: "VP Logistics", spare: 60, load: 0.81 },
    tre: { name: "Treasury", lead: "Group Treasurer", spare: 20, load: 0.55 },
    plan: { name: "Supply planning", lead: "Director, S&OP", spare: 40, load: 0.88 },
    com: { name: "Commercial, MENA", lead: "GM, MENA", spare: 35, load: 0.64 },
    gebze: { name: "Plant ops, Gebze", lead: "Plant director", spare: 90, load: 0.93 },
    pune: { name: "Plant ops, Pune", lead: "Plant director", spare: 70, load: 0.77 }
  };
  var EVNAME = {};
  EVENTS_BASE.forEach(function (e) { EVNAME[e.id] = e.name; });

  /* ---------- State ---------- */
  var events, params, plan, signals = [], datasets = [], selected = "hormuz";
  function resetState() {
    events = EVENTS_BASE.map(function (e) { var c = M.clone(e); c.base = { p: e.p, mag: e.mag, on: e.on }; return c; });
    params = M.clone(M.BASE);
    plan = {};
    signals = []; datasets = [];
  }
  resetState();
  function pOf(e) { // probability after any custom signals that are firing
    var p = e.p;
    signals.forEach(function (s) { if (s.on && s.event === e.id) p += s.pts / 100; });
    return Math.max(0.01, Math.min(0.99, p));
  }

  /* ---------- Loss given which events happen (H: id -> magnitude) and a plan (A) ---------- */
  function lossOf(H, A, P) {
    var inp = {
      status: H.hormuz != null ? "closed" : "open", dur: H.hormuz || 0, redsea: H.redsea != null,
      prem: 0.45, bunker: 690, divert: !!A.divert, bridge: !!A.bridge, cover: !!A.cover, buffer: A.stock ? 7 : 0
    };
    var r = M.run(inp, P);
    var n = { gebze: r.nodes.gebze.loss, pune: r.nodes.pune.loss, dubai: r.nodes.dubai.loss, dammam: r.nodes.dammam.loss };
    var stop = { gebze: r.nodes.gebze.stop, pune: r.nodes.pune.stop, dubai: r.nodes.dubai.stop, dammam: r.nodes.dammam.stop };
    if (A.sohar) { n.dubai *= 0.65; n.dammam *= 0.65; stop.dubai *= 0.65; stop.dammam *= 0.65; }
    var freight = r.parts.war + r.parts.trapped;
    var eu = 0;
    if (H.redsea != null) eu = 0.35 * H.redsea * (A.cape ? 0.3 : 1);           // late EU deliveries round the Cape
    if (H.strike != null) {
      var lost = Math.max(0, H.strike - (A.buildahead ? 10 : 0)) * (A.shiftpune ? 0.7 : 1);
      n.gebze += P.plants[0].rate * lost; stop.gebze += lost;
    }
    if (H.feeders != null) {
      var dc = P.dcs[1], out = Math.max(0, H.feeders - (dc.cover + (A.stock ? 7 : 0))) * 0.6 * (A.charter ? 0.2 : 1);
      n.dammam += dc.rate * out; stop.dammam += out;
    }
    if (H.bunker != null) freight += (P.bunkerKt * 690 * H.bunker / 100) / 1000 * (A.cover ? 0.2 : 1);
    var total = n.gebze + n.pune + n.dubai + n.dammam + freight + eu;
    return { total: total, nodes: n, stop: stop, freight: freight, eu: eu };
  }

  function active() { return events.filter(function (e) { return e.on; }); }
  // Expected loss: enumerate every combination of the active events at their set severity
  function expected(A, P) {
    var act = active(), E = 0, nodes = { gebze: 0, pune: 0, dubai: 0, dammam: 0 };
    for (var m = 0; m < (1 << act.length); m++) {
      var H = {}, w = 1;
      act.forEach(function (e, i) {
        var p = pOf(e);
        if (m & (1 << i)) { H[e.id] = e.mag; w *= p; } else w *= 1 - p;
      });
      if (!w) continue;
      var l = lossOf(H, A, P);
      E += w * l.total;
      for (var k in nodes) nodes[k] += w * l.nodes[k];
    }
    return { E: E, nodes: nodes };
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
  function costOf(A) { return ACTIONS.reduce(function (c, a) { return c + (A[a.id] ? a.cost : 0); }, 0); }
  function planList(A) { return ACTIONS.filter(function (a) { return A[a.id]; }); }

  /* ---------- Execution feasibility ---------- */
  function teamLoad(A) {
    var out = {};
    for (var t in TEAMS) out[t] = { hours: 0, actions: [] };
    planList(A).forEach(function (a) { out[a.team].hours += a.hours; out[a.team].actions.push(a); });
    return out;
  }
  function readiness(A) {
    var load = teamLoad(A), over = [], late = [];
    for (var t in load) if (load[t].hours > TEAMS[t].spare) over.push(t);
    planList(A).forEach(function (a) { if (a.lead > a.need) late.push(a); });
    return { over: over, late: late, load: load };
  }

  /* ---------- Steps ---------- */
  var tabs = document.querySelectorAll(".steps__tab");
  function showStep(id) {
    tabs.forEach(function (t) { t.setAttribute("aria-selected", String(t.getAttribute("data-step") === id)); });
    document.querySelectorAll("[data-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== id; });
    render(true);
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { showStep(t.getAttribute("data-step")); }); });

  /* ---------- 1. Events ---------- */
  var evBox = document.getElementById("events");
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
      card.appendChild(body);

      function sync() {
        pv.textContent = Math.round(pOf(e) * 100) + "%" + (Math.abs(pOf(e) - e.p) > 1e-9 ? " with your signals" : "");
        mv.textContent = e.mag + (e.unit.charAt(0) === "%" ? "" : " ") + e.unit;
        var parts = Object.keys(e.fused).map(function (k) { return k + " " + Math.round(e.fused[k] * 100) + "%"; });
        fz.textContent = (Math.round(e.p * 100) === Math.round(e.base.p * 100) ? "Daybreak's fused forecast. " : "You've overridden Daybreak's " + Math.round(e.base.p * 100) + "%. ") + "Engines: " + parts.join(", ") + ".";
        card.classList.toggle("is-on", e.on);
      }
      cb.addEventListener("change", function () { e.on = cb.checked; sync(); changed("Event " + (e.on ? "on" : "off") + ": " + e.name); });
      pr.addEventListener("input", function () { e.p = pr.value / 100; sync(); changed(); });
      mr.addEventListener("input", function () { e.mag = +mr.value; sync(); changed(); });
      e._sync = sync;
      sync();
      evBox.appendChild(card);
    });
    DB.fillRanges(evBox);
  }

  /* ---------- 2. World model ---------- */
  var NODES = {
    busan: { x: 718, y: 92, name: "Busan", kind: "Port, origin", lab: "left" },
    ningbo: { x: 705, y: 152, name: "Ningbo", kind: "Port, origin", lab: "left" },
    kaoh: { x: 690, y: 214, name: "Kaohsiung", kind: "Port, origin", lab: "left" },
    sing: { x: 612, y: 372, name: "Singapore", kind: "Port, hub", alt: true },
    pune: { x: 500, y: 326, name: "Pune plant", kind: "Plant", touched: ["hormuz"] },
    khor: { x: 446, y: 258, name: "Khor Fakkan", kind: "Port, alternate", alt: true },
    hormuz: { x: 414, y: 200, name: "Hormuz", kind: "Chokepoint", touched: ["hormuz"] },
    dubai: { x: 380, y: 262, name: "Dubai DC", kind: "Distribution centre", lab: "below", touched: ["hormuz"] },
    mesaieed: { x: 336, y: 236, name: "Mesaieed", kind: "Port, origin", lab: "left", touched: ["hormuz"] },
    dammam: { x: 312, y: 200, name: "Dammam DC", kind: "Distribution centre", lab: "left", touched: ["hormuz", "feeders"] },
    jubail: { x: 300, y: 162, name: "Jubail", kind: "Port, origin", lab: "left", touched: ["hormuz"] },
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
  var NODE_PROPS = { gebze: ["plants.0.cover", "plants.0.rate"], pune: ["plants.1.cover", "plants.1.rate"], dubai: ["dcs.0.cover", "dcs.0.rate"],
    dammam: ["dcs.1.cover", "dcs.1.rate"], khor: ["divertCapture"], hormuz: ["trappedPerDay"] };
  var DESC = {
    gebze: "Washers and dishwashers for the EU. Runs on PP resin from Jubail, shipped via Suez. Exposed to Hormuz, the Red Sea and its own labour contract.",
    pune: "Fridges and AC for India and MENA. Runs on HDPE from Mesaieed.",
    dubai: "MENA hub at Jebel Ali, inside the strait. Can be fed by road from Khor Fakkan.",
    dammam: "Saudi DC, inside the strait. Served by the ME4 feeder shuttle.",
    hormuz: "The chokepoint behind most of this morning's exposure.",
    khor: "UAE east coast, outside the strait. 140 km by road to the Dubai DC.",
    sing: "Transshipment hub and the alternate resin source.",
    suez: "Gebze's resin and the EU lanes depend on it.",
    bab: "The Red Sea entrance.",
    jubail: "PP resin origin for Gebze.", mesaieed: "HDPE resin origin for Pune.",
    ningbo: "Finished goods for MENA.", kaoh: "Finished goods for MENA.", busan: "Finished goods for Saudi Arabia."
  };
  function get(o, path) { return path.split(".").reduce(function (x, k) { return x[k]; }, o); }
  function set(o, path, v) { var ks = path.split("."), last = ks.pop(); ks.reduce(function (x, k) { return x[k]; }, o)[last] = v; }

  var graph = document.getElementById("graph");
  function drawGraph(nodeLoss) {
    graph.textContent = "";
    var on = active().map(function (e) { return e.id; });
    var max = Math.max(1, Math.max.apply(null, Object.keys(nodeLoss).map(function (k) { return nodeLoss[k]; })));
    EDGES.forEach(function (e) {
      var a = NODES[e[0]], b = NODES[e[1]];
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.abs(a.x - b.x) * 0.12;
      var at = { class: "gedge", d: "M" + a.x + " " + a.y + " Q" + mx + " " + my + " " + b.x + " " + b.y, "stroke-width": 1.6 };
      if (e[2] === "alt") { at.stroke = "rgba(127,224,198,0.55)"; at["stroke-dasharray"] = "5 5"; }
      else at.stroke = e[2] === "hot" ? "rgba(255,122,102,0.45)" : "rgba(232,238,242,0.2)";
      graph.appendChild(sv("path", at));
    });
    Object.keys(NODES).forEach(function (id) {
      var n = NODES[id], loss = nodeLoss[id] || 0;
      var touched = (n.touched || []).some(function (t) { return on.indexOf(t) > -1; });
      var r = 5 + (loss > 0.01 ? 15 * Math.sqrt(loss / max) : 0);
      var g = sv("g", { class: "gnode" + (id === selected ? " is-selected" : ""), tabindex: 0, role: "button",
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
      g.addEventListener("click", function () { selected = id; renderWorld(); });
      g.addEventListener("keydown", function (k) { if (k.key === "Enter" || k.key === " ") { k.preventDefault(); selected = id; renderWorld(); } });
      graph.appendChild(g);
    });
  }
  var ins = document.getElementById("inspector");
  function fmt(v, step) { var dp = step < 1 ? (String(step).split(".")[1] || "").length : 0; return (+v).toFixed(dp); }
  function renderInspector(nodeLoss, base) {
    var n = NODES[selected];
    $("type").textContent = n.kind;
    $("name").textContent = n.name === "Hormuz" ? "Strait of Hormuz" : n.name;
    $("desc").textContent = DESC[selected] || "";
    ins.textContent = "";
    var touched = (n.touched || []).map(function (t) { return EVNAME[t]; });
    if (touched.length) ins.appendChild(el("p", { class: "inspector__touch" }, "Exposed to: " + touched.join("; ") + "."));
    (NODE_PROPS[selected] || []).forEach(function (path) {
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
    if (nodeLoss[selected] != null) {
      var dl = el("dl", { class: "facts" });
      [["Expected loss, doing nothing", money(base[selected] || 0)], ["Expected loss, with your plan", money(nodeLoss[selected])]].forEach(function (f) {
        var d = el("div"); d.appendChild(el("dt", null, f[0])); d.appendChild(el("dd", null, f[1])); dl.appendChild(d);
      });
      ins.appendChild(dl);
    }
    if (!NODE_PROPS[selected]) ins.appendChild(el("p", { class: "prop__hint" }, "Load a dataset in step 6 to give this site its own parameters."));
  }
  function renderWorld() {
    var e = expected(plan, params), b = expected({}, params);
    drawGraph(e.nodes);
    renderInspector(e.nodes, b.nodes);
  }

  /* ---------- 3. Options ---------- */
  var opBody = document.querySelector("#options tbody");
  function renderOptions() {
    opBody.textContent = "";
    var act = active().map(function (e) { return e.id; });
    ACTIONS.forEach(function (a) {
      var with_ = M.clone(plan), without = M.clone(plan);
      with_[a.id] = true; delete without[a.id];
      var value = expected(without, params).E - expected(with_, params).E;
      var relevant = a.helps.some(function (h) { return act.indexOf(h) > -1; });
      var tr = el("tr", { class: (plan[a.id] ? "is-in" : "") + (relevant ? "" : " is-idle") });
      var td = el("td");
      var cb = el("input", { type: "checkbox", "aria-label": "Include: " + a.name }); cb.checked = !!plan[a.id];
      cb.addEventListener("change", function () { if (cb.checked) plan[a.id] = true; else delete plan[a.id]; changed((cb.checked ? "Added " : "Removed ") + a.name.charAt(0).toLowerCase() + a.name.slice(1)); });
      td.appendChild(cb); tr.appendChild(td);
      tr.appendChild(el("td", { class: "options__name" }, a.name));
      tr.appendChild(el("td", { class: "options__helps" }, a.helps.map(function (h) { return EVNAME[h]; }).join("; ")));
      tr.appendChild(el("td", { class: "r money " + (value > a.cost ? "money--safe" : "") }, value > 0.005 ? money(value) : "—"));
      tr.appendChild(el("td", { class: "r money" }, money(a.cost, 2)));
      var late = a.lead > a.need, lt = el("td");
      lt.appendChild(el("span", { class: "pill " + (late ? "pill--loss" : "pill--quiet") }, a.lead + "d, needed in " + a.need + "d"));
      tr.appendChild(lt);
      tr.appendChild(el("td", { class: "options__team" }, TEAMS[a.team].name));
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
      out.push({ A: A, cost: costOf(A), E: expected(A, params).E, ok: !r.over.length && !r.late.length });
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
    plans.forEach(function (p) { frontier.appendChild(sv("circle", { cx: sx(p.cost).toFixed(1), cy: sy(p.E).toFixed(1), r: 2.6, class: p.ok ? "fp" : "fp fp--no" })); });
    frontier.appendChild(sv("path", { class: "fline", d: front.map(function (p, i) { return (i ? "L" : "M") + sx(p.cost).toFixed(1) + " " + sy(p.E).toFixed(1); }).join(" ") }));
    var mc = costOf(plan), me = expected(plan, params).E;
    frontier.appendChild(sv("circle", { cx: sx(mc), cy: sy(me), r: 7, class: "fp--mine" }));
    frontier.appendChild(sv("text", { x: Math.min(sx(mc) + 11, x1 - 60), y: sy(me) - 10, class: "axis axis--mine" }, "Your plan"));
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

  /* ---------- 4. Consequences ---------- */
  var MKT = [
    { id: "EU", from: ["gebze"], extra: "eu" },
    { id: "India", from: ["pune"] },
    { id: "MENA", from: ["dubai", "dammam"] }
  ];
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

  /* ---------- 5. Execution ---------- */
  function renderExecution() {
    var r = readiness(plan), box = document.getElementById("teams"); box.textContent = "";
    Object.keys(TEAMS).forEach(function (t) {
      var T = TEAMS[t], L = r.load[t], over = L.hours > T.spare;
      var card = el("article", { class: "team" + (over ? " is-over" : "") + (L.actions.length ? "" : " is-idle") });
      var head = el("div", { class: "team__head" });
      head.appendChild(el("h3", null, T.name));
      head.appendChild(el("span", { class: "team__lead" }, T.lead));
      card.appendChild(head);
      var bar = el("div", { class: "team__bar", role: "img", "aria-label": T.name + ": " + Math.round(T.load * 100) + "% already committed; the plan needs " + L.hours + " of " + T.spare + " spare hours" });
      var base = el("i", { class: "team__base" }); base.style.width = (T.load * 100) + "%";
      var add = el("i", { class: "team__add" }); add.style.width = Math.min(100 - T.load * 100, (L.hours / T.spare) * (100 - T.load * 100)) + "%";
      bar.appendChild(base); bar.appendChild(add); card.appendChild(bar);
      card.appendChild(el("p", { class: "team__nums" }, Math.round(T.load * 100) + "% committed already. Plan needs " + L.hours + " of " + T.spare + " spare hours this week" + (over ? ", " + (L.hours - T.spare) + " too many" : "") + "."));
      var ul = el("ul", { class: "team__acts" });
      if (!L.actions.length) ul.appendChild(el("li", { class: "team__none" }, "Nothing in the plan"));
      L.actions.forEach(function (a) { ul.appendChild(el("li", { class: a.lead > a.need ? "is-late" : "" }, a.name + (a.lead > a.need ? " (lands " + (a.lead - a.need) + "d late)" : ""))); });
      card.appendChild(ul);
      box.appendChild(card);
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
      var y = y0 + i * rowH + 4, late = a.lead > a.need;
      gantt.appendChild(sv("text", { x: x0 - 12, y: y + 13, class: "gantt__name", "text-anchor": "end" }, a.name));
      gantt.appendChild(sv("rect", { x: sx(0), y: y, width: Math.max(4, sx(a.lead) - sx(0)), height: 18, rx: 4, class: late ? "gbar gbar--late" : "gbar" }));
      gantt.appendChild(sv("line", { x1: sx(a.need), x2: sx(a.need), y1: y - 3, y2: y + 21, class: "gdead" }));
    });
    gantt.appendChild(sv("text", { x: x1, y: y0 + acts.length * rowH + 18, class: "axis", "text-anchor": "end" }, "Bar: time to put in place. Tick: deadline."));
  }

  /* ---------- 6. Your data ---------- */
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
    loadCSV("site,inventory_days_of_cover,line_stop_cost_musd_per_day,as_of\nGebze plant,14,2.9,2026-10-09\nPune plant,6,2.3,2026-10-09\nDubai DC (Jebel Ali),11,2.1,2026-10-09\nDammam DC,4,0.9,2026-10-09\n", "inventory_snapshot.csv");
  });
  document.getElementById("csv-apply").addEventListener("click", function () {
    var m = {}; document.querySelectorAll("[data-map]").forEach(function (s) { m[s.getAttribute("data-map")] = s.value === "" ? null : +s.value; });
    if (m.site == null) { $("csv-status").textContent = "Map the site column first, so each row can be matched to a site in the model."; return; }
    var before = expected(plan, params).E, applied = 0, skipped = [];
    csvRows.forEach(function (r) {
      var site = (r[m.site] || "").toLowerCase(), key = null;
      Object.keys(SITE_KEYS).forEach(function (k) { if (site.indexOf(k) > -1) key = SITE_KEYS[k]; });
      if (!key) { skipped.push(r[m.site]); return; }
      if (m.cover != null && !isNaN(parseFloat(r[m.cover]))) { set(params, key + ".cover", parseFloat(r[m.cover])); applied++; }
      if (m.rate != null && !isNaN(parseFloat(r[m.rate]))) { set(params, key + ".rate", parseFloat(r[m.rate])); applied++; }
    });
    datasets.push({ name: csvName, values: applied });
    var after = expected(plan, params).E, d = after - before;
    $("csv-status").textContent = "Applied " + applied + " values from " + csvName + ". Expected loss " + (d >= 0 ? "rises " : "falls ") + money(Math.abs(d)) + "." + (skipped.length ? " Couldn't match: " + skipped.join(", ") + "." : "");
    changed("Applied " + csvName + " (" + applied + " values)");
  });
  var sf = document.getElementById("signal-form"), evSel = sf.elements.event;
  EVENTS_BASE.forEach(function (e) { evSel.appendChild(el("option", { value: e.id }, e.name)); });
  sf.elements.pts.addEventListener("input", function () { var v = +sf.elements.pts.value; $("sig-pts").textContent = (v > 0 ? "+" : "") + v + " pts"; });
  sf.addEventListener("submit", function (e) {
    e.preventDefault();
    var s = { name: sf.elements.name.value.trim(), rule: sf.elements.rule.value.trim(), event: evSel.value, pts: +sf.elements.pts.value, on: true };
    if (!s.name || !s.rule) return;
    var h = 0; for (var i = 0; i < s.name.length; i++) h = (h * 31 + s.name.charCodeAt(i)) >>> 0;
    s.brier = [0.124, 0.124 - (2 + h % 7) / 1000]; // illustrative back-test
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
    signals.forEach(function (s) { L.push('w.signals.add(<span class="s">"' + s.name.replace(/[<>"]/g, "") + '"</span>, moves=<span class="s">"' + s.event + '"</span>, pts=<span class="n">' + s.pts + "</span>)"); });
    L.push("", "s = w.scenario(");
    active().forEach(function (e) { L.push('    <span class="s">"' + e.id + '"</span>: dict(p=<span class="n">' + pOf(e).toFixed(2) + "</span>, " + (e.unit === "days" ? "days" : "pct") + '=<span class="n">' + e.mag + "</span>),"); });
    L.push(")");
    L.push("plan = [" + planList(plan).map(function (a) { return '<span class="s">"' + a.id + '"</span>'; }).join(", ") + "]");
    L.push('r = s.run(plan, n=<span class="n">4_000</span>)');
    L.push('r.expected_loss      <span class="c"># ' + money(expected(plan, params).E) + " (" + money(expected({}, params).E) + " doing nothing)</span>");
    L.push('r.route_to_owners()  <span class="c"># send each action to its team, with a deadline</span>');
    document.getElementById("code").innerHTML = L.join("\n");
  }
  document.getElementById("copy").addEventListener("click", function () {
    var t = document.getElementById("code").textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { DB.toast("Copied."); }, function () { DB.toast("Couldn't reach the clipboard."); });
  });

  /* ---------- Summary rail, log, change tracking ---------- */
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
    return n + signals.length + planList(plan).length;
  }
  function renderRail() {
    var act = active();
    $("rail-events").textContent = act.length ? act.map(function (e) { return e.name + ", " + Math.round(pOf(e) * 100) + "%"; }).join(". ") + "." : "No events switched on.";
    var e0 = expected({}, params).E, e1 = expected(plan, params).E, cost = costOf(plan), net = e0 - e1 - cost;
    $("r-e0").textContent = money(e0); $("r-e1").textContent = money(e1); $("r-cost").textContent = money(cost, 2);
    var n = $("r-net"); n.textContent = (net < 0 ? "−" : "") + money(Math.abs(net));
    n.classList.toggle("money--safe", net >= 0); n.classList.toggle("money--loss", net < 0);
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

  document.getElementById("reset").addEventListener("click", function () { resetState(); buildEvents(); changed("Reset to production"); });
  document.getElementById("commit").addEventListener("click", function () {
    var c = countChanges();
    if (!c) { DB.toast("Nothing to commit yet. Change an event, the model or the plan first."); return; }
    log("Committed scenario halvorsen/v14.2+" + c);
    DB.toast("Committed as a scenario. Each action in the plan has gone to its owner, with a deadline.");
  });

  buildEvents();
  log("Loaded halvorsen/v14.2: 14 sites, 38 lanes, 7 teams");
  log("AIS: 22 Halvorsen vessels tracked, 3 inside the strait");
  render(true);
})();
