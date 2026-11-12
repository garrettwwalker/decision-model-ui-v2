/* Workbench, rebuilt in the house style (2026-11-12): test the model behind the daily brief. One of the brief's four
   questions at a time drives the page: the bottom line with and without the plan, and what you've changed from
   production; how Totality got its chance (three engines, the declined part, the band) with an override; what the event
   hits, each asset's cover against the disruption; the plan, its moves and every combination by cost and loss; and the
   model's sources, change log, and the same edits in the SDK. Hormuz runs on model.js, so its figures match the brief,
   workflows, and agents ($140.7M if it happens, $38.0M expected, $13.0M with the three decisions for $3.1M); the other
   questions carry small models of their own. Money is in $M; every figure is illustrative. */
(function () {
  var M = window.DBModel, money = DB.money;
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (k) { return document.querySelector('[data-out="' + k + '"]'); };
  var byId = function (id) { return document.getElementById(id); };
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    if (typeof attrs === "string") e.className = attrs;
    else for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function sv(tag, attrs, text) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  function pct(p) { return Math.round(100 * p) + "%"; }
  function r1(m) { return Math.round(m * 10) / 10; } // money as shown, so a difference of two figures matches the figures (the brief's $38.0M less $13.0M is $25.0M)
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  var WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  function span(d) { return d % 7 === 0 && d / 7 <= 10 ? (d === 7 ? "one week" : WORDS[d / 7] + " weeks") : d + " days"; }
  function list(a) { return a.length < 3 ? a.join(" and ") : a.slice(0, -1).join(", ") + ", and " + a[a.length - 1]; }

  /* ================= The questions, as on the brief and the agents page ================= */
  var QS = [
    { id: "hormuz", short: "Hormuz closes", topic: "Hormuz", title: "the Strait of Hormuz", phrase: "the strait closes", p: 0.27, band: 0.05, delta: "+3% overnight", up: true, next: "War-risk quote expires Wed Oct 7",
      question: "Will the Strait of Hormuz close to commercial traffic for 7 days or more in the next 30 days?",
      engines: [["Judgment", "Will the naval standoff escalate to a blockade?", 0.33], ["Telemetry", "Will daily transits fall below 40% of normal?", 0.26], ["Procedure", "Will underwriters list the whole strait as a war zone?", 0.22]],
      declined: "Whether a sudden strike or coup in Tehran changes course. No engine has skill on it at 30 days, so it widens the band rather than moving the forecast.",
      dur: [14, 21, 35], dmin: 7, dmax: 90, model: "hormuz",
      sites: { gebze: ["Gebze plant", "Resin from Jubail and Mesaieed"], pune: ["Pune plant", "Resin through the strait"], dubai: ["Dubai DC", "Inbound through Jebel Ali"], dammam: ["Dammam DC", "Fed from Jebel Ali by the ME4 feeders"] },
      actions: [
        { id: "divert", name: "Divert Four Jebel Ali Sailings", owner: "Logistics, Tomas Varga", what: "Send the four Gulf sailings to Khor Fakkan, outside the strait, and truck boxes to the Dubai DC", team: "divert" },
        { id: "bridge", name: "Bridge-Buy Resin from Singapore", owner: "Procurement, Aylin Demir", what: "One spot cargo of PP and ABS, landing in Gebze in 14 days, Pune in 9", team: "bridge" },
        { id: "cover", name: "Bind War-Risk Cover on Gulf Calls", owner: "Treasury, Hanne Sørli", what: "Take today’s quote before it expires, and hedge bunker fuel for the quarter", team: "cover" },
        { id: "sohar", name: "Pre-Position Finished Goods at Sohar", owner: "Commercial MENA, Layla Mansour", what: "30,000 units held in Oman, outside the strait, and trucked to the Dubai and Dammam DCs if it shuts" }
      ],
      asks: [["What if", "What if the strait stays closed for six weeks instead of three?"], ["Capacity", "How long can Gebze run on Singapore resin alone?"], ["Best move", "What’s the best plan if we can only spend $2M?"], ["Signposts", "What would push the chance of a closure above 40%?"]] },
    { id: "redsea", short: "Red Sea shuts", topic: "Red Sea", title: "the Red Sea", phrase: "the Red Sea shuts", p: 0.31, band: 0.06, delta: "−1% overnight", up: false, next: "Cape space hold expires Fri Oct 9",
      question: "Will the Red Sea close to most commercial traffic for 14 days or more in the next 30 days?",
      engines: [["Judgment", "Will attacks on merchant ships in the southern Red Sea resume?", 0.36], ["Telemetry", "Will Bab el-Mandeb transits fall below half of normal?", 0.29], ["Procedure", "Will the three largest carriers suspend Suez routings?", 0.27]],
      declined: "Whether a ceasefire is signed this month. Talks are too fluid for any engine at 30 days, so it widens the band.",
      dur: [14, 30, 60], dmin: 7, dmax: 120,
      assets: [{ id: "comp", name: "Compressor supply to Gebze", note: "Parts from Busan and Ningbo come through Suez", cover: 18, rate: 1.1, ramp: 2 },
               { id: "euw", name: "Washers from Pune to the EU", note: "Eight days longer round the Cape", cover: 12, rate: 0.5, ramp: 0 }],
      flats: [{ id: "cape", name: "Cape detour freight and fuel", note: "Asia–Europe sailings go round Africa", amount: 6.8 },
              { id: "wc", name: "Stock at sea", note: "Two more weeks of cargo in transit, as working capital", amount: 2.4 }],
      actions: [
        { id: "cape", name: "Pre-Book Cape Routing for EU Lanes", owner: "Logistics, Mira Olsen", what: "Lock space at today’s rates before carriers reprice", cost: 0.45, apply: function (m) { m.flat.cape.amount *= 0.55; } },
        { id: "air", name: "Air-Freight Compressors to Gebze", owner: "Procurement, Selin Aksoy", what: "Bridge the gap until Cape cargo lands", cost: 0.62, apply: function (m) { m.asset.comp.cover += 16; } },
        { id: "buffer", name: "Build a 10-Day Compressor Buffer", owner: "Supply planning, Arjun Rao", what: "Order ahead from Busan this week", cost: 0.38, apply: function (m) { m.asset.comp.cover += 10; } }
      ],
      asks: [["What if", "What if Suez stays shut through Christmas?"], ["Capacity", "How long can Gebze run without compressors from Asia?"], ["Best move", "Is air freight worth it if the Red Sea reopens in two weeks?"]] },
    { id: "strike", short: "Gebze strike", topic: "Gebze strike", title: "a Gebze strike", phrase: "workers at Gebze strike", p: 0.16, band: 0.07, delta: "No change", up: false, next: "Union strike vote Tue Oct 20",
      question: "Will workers at the Gebze plant strike before November 1?",
      engines: [["Judgment", "Will members reject the final offer?", 0.21], ["Telemetry", "Will overtime refusals at Gebze pass 20%?", 0.11], ["Procedure", "Will the federation file a legal strike notice?", 0.18]],
      declined: null,
      dur: [5, 10, 21], dmin: 2, dmax: 45,
      assets: [{ id: "lines", name: "Gebze’s three lines", note: "Finished-goods stock covers three days", cover: 3, rate: 2.6, ramp: 1 }],
      flats: [{ id: "launch", name: "The EU washer launch slips a season", note: "If Gebze is out for more than five days", amount: 4.0, when: ["lines", 5] }],
      actions: [
        { id: "ahead", name: "Build Ten Days Ahead", owner: "Plant ops, Murat Kaya", what: "Weekend shifts on all three lines until the vote", cost: 0.6, apply: function (m) { m.asset.lines.cover += 10; } },
        { id: "pune", name: "Shift EU Washer Orders to Pune", owner: "Plant ops, Rohan Mehta", what: "Retool one Pune line for the EU models", cost: 0.5, apply: function (m) { m.asset.lines.rate *= 0.6; m.flat.launch.amount *= 0.25; } }
      ],
      asks: [["What if", "What if a strike runs three weeks?"], ["Best move", "Is building ahead cheaper than moving orders to Pune?"]] },
    { id: "feeders", short: "Feeder sanctions", topic: "feeder sanctions", title: "feeder sanctions", phrase: "sanctions take the two ME4 feeders out", p: 0.15, band: 0.06, delta: "+2% overnight", up: true, next: "Flag registry review Thu Oct 8",
      question: "Will US sanctions list the technical manager of the two ME4 feeders in the next 30 days?",
      engines: [["Judgment", "Will regulators list the shared technical manager?", 0.18], ["Telemetry", "Will the feeders call at terminals tied to listed tankers?", 0.12], ["Procedure", "Would a listing cover the manager’s whole fleet?", 0.17]],
      declined: null,
      dur: [21, 45, 90], dmin: 7, dmax: 120,
      assets: [{ id: "dammam", name: "Dammam DC deliveries", note: "The ME4 feeders carry 60% of its inbound", cover: 6, rate: 0.3, ramp: 0 }],
      flats: [{ id: "held", name: "Boxes held for screening", note: "Cargo already on the two feeders", amount: 2.1 },
              { id: "pen", name: "Saudi late-delivery penalties", note: "After seven days short", amount: 1.8, when: ["dammam", 7] }],
      actions: [
        { id: "charter", name: "Charter Two Replacement Feeders", owner: "Logistics, Mira Olsen", what: "From an operator with no listed ships", cost: 0.7, apply: function (m) { m.asset.dammam.rate *= 0.25; m.flat.pen.amount = 0; } },
        { id: "rebook", name: "Move This Week’s Boxes to a Rival Shuttle", owner: "Port operations, Farah Saleh", what: "Before the registry review on Thursday", cost: 0.25, apply: function (m) { m.flat.held.amount *= 0.3; } }
      ],
      asks: [["Signposts", "What would tell us the feeders are about to be listed?"], ["Best move", "Should we charter now or wait for the registry review?"]] }
  ];
  var BYQ = {}; QS.forEach(function (q) { BYQ[q.id] = q; });

  /* ================= The models ================= */
  // the loss if the event happens, for a question's state and a set of moves: every asset and cost, and what the moves cost
  function evaluate(q, s, plan) {
    var dur = s.dur, on = {}; (plan || []).forEach(function (id) { on[id] = true; });
    if (q.model === "hormuz") {
      var P = M.clone(M.BASE);
      P.plants.concat(P.dcs).forEach(function (n) { if (s.cover[n.id] != null) n.cover = s.cover[n.id]; });
      var inp = M.clone(M.DEFAULTS); inp.dur = dur; inp.divert = !!on.divert; inp.bridge = !!on.bridge; inp.cover = !!on.cover;
      var r = M.run(inp, P), rows = [], total = r.loss, cost = r.cost;
      P.plants.concat(P.dcs).forEach(function (n) {
        var x = r.nodes[n.id], isPlant = P.plants.indexOf(n) >= 0, l = x.loss;
        // stock at Sohar covers 30% of what the two DCs would lose, the same losses the diversion goes after
        if (on.sohar && !isPlant) { total -= 0.3 * l; l *= 0.7; }
        rows.push({ id: n.id, name: q.sites[n.id][0], note: q.sites[n.id][1], cover: n.cover, out: isPlant ? x.stop : Math.max(0, r.D - x.cover), loss: l, asset: true });
      });
      if (on.sohar) cost += 1.35;
      rows.push({ id: "war", name: "War-risk premiums and bunker fuel", note: "On $620M insured on Gulf calls this quarter", loss: r.parts.war });
      rows.push({ id: "trapped", name: "Cargo stuck inside the Gulf", note: "Demurrage and working capital", loss: r.parts.trapped });
      return { rows: rows, loss: total, cost: cost };
    }
    var m = { asset: {}, flat: {} };
    q.assets.forEach(function (a) { var c = Object.assign({}, a); if (s.cover[a.id] != null) c.cover = s.cover[a.id]; m.asset[a.id] = c; });
    q.flats.forEach(function (f) { m.flat[f.id] = Object.assign({}, f); });
    var cost = 0;
    q.actions.forEach(function (a) { if (on[a.id]) { a.apply(m); cost += a.cost; } });
    var out = [], loss = 0, outDays = {};
    q.assets.forEach(function (a) {
      var x = m.asset[a.id], d = Math.max(0, dur - x.cover), l = d > 0 ? (d + x.ramp) * x.rate : 0;
      outDays[a.id] = d;
      out.push({ id: a.id, name: a.name, note: a.note, cover: x.cover, out: d > 0 ? d + x.ramp : 0, loss: l, asset: true }); loss += l;
    });
    q.flats.forEach(function (f) {
      var x = m.flat[f.id], l = f.when && outDays[f.when[0]] <= f.when[1] ? 0 : x.amount;
      out.push({ id: f.id, name: f.name, note: f.note, loss: l }); loss += l;
    });
    return { rows: out, loss: loss, cost: cost };
  }
  function actionCost(q, id) {
    if (q.model !== "hormuz") return q.actions.filter(function (a) { return a.id === id; })[0].cost;
    return { divert: 0.9, bridge: 0.84, cover: 1.36, sohar: 1.35 }[id];
  }
  function chance(q, s) { return s.p == null ? q.p : s.p; }
  // every combination of the moves, by cost and expected loss; the best by net value is Totality's suggestion
  function plans(q, s) {
    var ids = q.actions.map(function (a) { return a.id; }), out = [], p = chance(q, s);
    for (var mask = 0; mask < (1 << ids.length); mask++) {
      var set = ids.filter(function (id, i) { return mask & (1 << i); }), e = evaluate(q, s, set);
      out.push({ set: set, cost: e.cost, exp: p * e.loss });
    }
    return out;
  }
  function suggest(q, s) {
    var base = plans(q, s);
    return base.reduce(function (best, x) { return x.exp + x.cost < best.exp + best.cost - 1e-9 ? x : best; }, base[0]).set;
  }

  /* ================= State: one per question, against production ================= */
  function fresh(q) {
    var cover = {};
    var s = { p: null, di: 1, dur: q.dur[1], cover: cover, plan: [] };
    s.plan = q.model === "hormuz" ? ["divert", "bridge", "cover"] : suggest(q, s);
    return s;
  }
  function copy(o) { return JSON.parse(JSON.stringify(o)); }
  var ST = {}, PROD = {}, version = 2, log = [];
  QS.forEach(function (q) { ST[q.id] = fresh(q); PROD[q.id] = copy(ST[q.id]); });
  var qid = (location.search.match(/[?&]q=(\w+)/) || [])[1];
  if (!BYQ[qid]) qid = "hormuz";
  function Q() { return BYQ[qid]; }
  function S() { return ST[qid]; }
  function coverOf(q, s, id) {
    if (s.cover[id] != null) return s.cover[id];
    if (q.model === "hormuz") return M.BASE.plants.concat(M.BASE.dcs).filter(function (n) { return n.id === id; })[0].cover;
    return q.assets.filter(function (a) { return a.id === id; })[0].cover;
  }
  function assetName(q, id) { return q.model === "hormuz" ? q.sites[id][0] : q.assets.filter(function (a) { return a.id === id; })[0].name; }
  function actName(q, id) { return q.actions.filter(function (a) { return a.id === id; })[0].name; }
  // what differs from production, in words
  function changes(q) {
    var s = ST[q.id], b = PROD[q.id], out = [];
    if (chance(q, s) !== chance(q, b)) out.push("Chance " + pct(chance(q, b)) + " → " + pct(chance(q, s)));
    if (s.dur !== b.dur) out.push("Lasts " + span(b.dur) + " → " + span(s.dur));
    var ids = {}; Object.keys(s.cover).concat(Object.keys(b.cover)).forEach(function (k) { ids[k] = 1; });
    Object.keys(ids).forEach(function (id) {
      var a = coverOf(q, b, id), z = coverOf(q, s, id);
      if (a !== z) out.push(assetName(q, id) + " cover " + a + " → " + z + " days");
    });
    s.plan.filter(function (id) { return b.plan.indexOf(id) < 0; }).forEach(function (id) { out.push("Plan adds “" + actName(q, id) + "”"); });
    b.plan.filter(function (id) { return s.plan.indexOf(id) < 0; }).forEach(function (id) { out.push("Plan drops “" + actName(q, id) + "”"); });
    return out;
  }

  /* ================= Drawing ================= */
  var shownQ = null;
  function render() {
    var swap = shownQ !== null && shownQ !== qid; shownQ = qid;
    drawQs(); drawBottom(); drawForecast(); drawImpact(); drawPlan(); drawData(); drawAsks();
    if (swap && !REDUCE) { var wb = byId("wb"); wb.classList.remove("is-swap"); void wb.offsetWidth; wb.classList.add("is-swap"); }
  }
  function swapTo(id) {
    if (id === qid) return;
    qid = id;
    try { history.replaceState(null, "", "?q=" + id); } catch (e) {}
    render();
  }

  function drawQs() {
    var box = byId("qs"); box.textContent = "";
    QS.forEach(function (q) {
      var s = ST[q.id], on = q.id === qid, edited = changes(q).length > 0;
      var b = el("button", { type: "button", class: "q" + (on ? " is-on" : ""), "aria-pressed": String(on) });
      var k = el("span", "q__k", q.short); if (edited) k.appendChild(el("span", "pill pill--amber", "Edited")); b.appendChild(k);
      b.appendChild(el("span", "q__p", pct(chance(q, s))));
      b.appendChild(el("span", "q__d" + (q.up ? " q__d--up" : ""), s.p == null ? q.delta : "Your override"));
      b.appendChild(el("span", "q__n", q.next));
      b.addEventListener("click", function () { swapTo(q.id); });
      box.appendChild(b);
    });
  }

  var lastStats = null;
  function drawBottom() {
    var q = Q(), s = S(), p = chance(q, s), none = evaluate(q, s, []), withp = evaluate(q, s, s.plan);
    var e0 = r1(p * none.loss), e1 = r1(p * withp.loss), prot = r1(e0 - e1), ch = changes(q);
    var box = byId("bl"); box.textContent = "";
    var left = el("div", "bl__lead");
    var lead = "If " + q.phrase + " for " + span(s.dur) + ", Halvorsen loses " + money(none.loss) + " doing nothing; at a " + pct(p) + " chance, that’s " + money(e0) + " expected. ";
    lead += s.plan.length ? (s.plan.length === 1 ? "The one move in the plan cuts" : "The " + WORDS[s.plan.length] + " moves in the plan cut") + " it to " + money(e1) + " for " + money(withp.cost) + ", protecting " + money(prot) + "." : "There are no moves in the plan.";
    left.appendChild(el("p", "bl__text", lead));
    if (q.id === "hormuz" && !ch.length) left.appendChild(el("p", "bl__sub", "These match this morning’s brief, which runs on the same model."));
    box.appendChild(left);
    var right = el("div", "bl__changes");
    right.appendChild(el("h3", "bl__h", ch.length ? "Changes From Production" : "Matches Production"));
    if (ch.length) { var ul = el("ul"); ch.forEach(function (c) { ul.appendChild(el("li", null, c)); }); right.appendChild(ul); }
    else right.appendChild(el("p", "bl__none", "Nothing changed yet. Edit a forecast, an assumption, or the plan below and it shows here."));
    var acts = el("div", "bl__acts");
    var reset = el("button", { type: "button", class: "btn-q btn-q--sm" }, "Reset"); reset.disabled = !ch.length;
    reset.addEventListener("click", function () { ST[q.id] = copy(PROD[q.id]); render(); });
    var commit = el("button", { type: "button", class: "btn btn--primary btn--sm" }, "Commit"); commit.disabled = !ch.length;
    commit.addEventListener("click", function () {
      var n = ch.length; version++;
      log.unshift(["Just now", "You", "Committed " + WORDS[Math.min(n, 10)] + (n === 1 ? " change" : " changes") + " to the " + q.topic + " question as halvorsen/v14." + version, true]);
      PROD[q.id] = copy(ST[q.id]);
      document.querySelector(".wh .h-kicker").textContent = "World model halvorsen/v14." + version + ", committed just now";
      DB.toast("Committed as halvorsen/v14." + version + ". The brief and workflows pick it up at the next run.");
      render();
    });
    acts.appendChild(reset); acts.appendChild(commit); right.appendChild(acts);
    box.appendChild(right);

    var stats = [["Chance", pct(p), s.p == null ? "Totality’s forecast" : "Your override, against Totality’s " + pct(q.p)],
                 ["If it happens", money(none.loss), "Over " + span(s.dur) + ", doing nothing", "red"],
                 ["Expected loss with the plan", money(e1), "From " + money(e0) + " doing nothing", e1 > 0.05 ? "red" : ""],
                 ["Protected by the plan", money(prot), "For " + money(withp.cost) + ", net " + (prot - withp.cost < 0 ? "−" : "") + money(Math.abs(prot - withp.cost))]];
    var sb = byId("stats"), was = lastStats; sb.textContent = "";
    stats.forEach(function (x, i) {
      var t = el("div", "stat");
      t.appendChild(el("span", "stat__k", x[0]));
      var v = el("b", "stat__v" + (x[3] ? " " + x[3] : ""), x[1]); t.appendChild(v);
      t.appendChild(el("span", "stat__s", x[2]));
      sb.appendChild(t);
      if (was && was[i] !== x[1] && window.CountFrom) CountFrom(v, was[i]);
    });
    lastStats = stats.map(function (x) { return x[1]; });
  }

  // a picker: three values that mean something, each with a word, and a −/+ nudge for anything between
  function picker(opts, value, fmt, step, min, max, set) {
    var w = el("div", "pk");
    var track = el("div", { class: "pk__track", role: "group" });
    opts.forEach(function (o) {
      var b = el("button", { type: "button", class: "pk__b" + (Math.abs(o[0] - value) < 1e-9 ? " is-on" : ""), "aria-pressed": String(Math.abs(o[0] - value) < 1e-9) });
      b.appendChild(el("b", null, fmt(o[0]))); b.appendChild(el("span", null, o[1]));
      b.addEventListener("click", function () { set(o[0]); });
      track.appendChild(b);
    });
    w.appendChild(track);
    w.appendChild(nudge(value, fmt, step, min, max, set));
    return w;
  }
  function nudge(value, fmt, step, min, max, set, label) {
    var n = el("div", "nd");
    var dn = el("button", { type: "button", class: "nd__b", "aria-label": "Less" + (label ? " " + label : "") }, "−"); dn.disabled = value - step < min - 1e-9;
    var up = el("button", { type: "button", class: "nd__b", "aria-label": "More" + (label ? " " + label : "") }, "+"); up.disabled = value + step > max + 1e-9;
    dn.addEventListener("click", function () { set(Math.round((value - step) * 1000) / 1000); });
    up.addEventListener("click", function () { set(Math.round((value + step) * 1000) / 1000); });
    n.appendChild(dn); n.appendChild(el("span", "nd__v", fmt(value))); n.appendChild(up);
    return n;
  }

  function drawForecast() {
    var q = Q(), s = S(), p = chance(q, s);
    $("fc-title").textContent = "How Totality Got " + pct(q.p);
    var box = byId("fc"); box.textContent = "";
    box.appendChild(el("p", "fc__q", "“" + q.question + "”"));
    var eng = el("div", "fc__eng");
    q.engines.forEach(function (e) {
      var c = el("div", "fc__e");
      c.appendChild(el("span", "fc__name", e[0] + " engine"));
      c.appendChild(el("p", "fc__sub", e[1]));
      c.appendChild(el("b", "fc__p", pct(e[2])));
      eng.appendChild(c);
    });
    box.appendChild(eng);
    // the fused chance on a scale, with its band
    var fused = el("div", "fc__fused");
    var fl = el("div", "fc__fl");
    fl.appendChild(el("span", "fc__name", "Fused, not averaged"));
    var fp = el("p", "fc__big"); fp.appendChild(el("b", null, pct(q.p))); fp.appendChild(el("span", null, "±" + Math.round(100 * q.band) + "%")); fl.appendChild(fp);
    fused.appendChild(fl);
    var scale = el("div", "fc__scale", null), top = Math.max(0.5, Math.ceil((q.p + q.band + 0.05) * 10) / 10);
    scale.style.setProperty("--lo", (q.p - q.band) / top); scale.style.setProperty("--hi", (q.p + q.band) / top);
    scale.style.setProperty("--v", q.p / top); scale.style.setProperty("--you", p / top);
    scale.appendChild(el("i", "fc__band")); scale.appendChild(el("i", "fc__mark"));
    if (s.p != null) scale.appendChild(el("i", "fc__you"));
    var ticks = el("div", "fc__ticks"); for (var t = 0; t <= top + 1e-9; t += 0.1) { var tk = el("span", null, Math.round(t * 100) + "%"); tk.style.setProperty("--t", t / top); ticks.appendChild(tk); }
    scale.appendChild(ticks);
    fused.appendChild(scale);
    box.appendChild(fused);
    if (q.declined) { var dc = el("p", "fc__declined"); dc.appendChild(el("span", "pill", "Declined")); dc.appendChild(document.createTextNode(" " + q.declined)); box.appendChild(dc); }
    // your forecast
    var ov = el("div", "fc__ov");
    var ol = el("div"); ol.appendChild(el("h3", "fc__h", "Your Forecast"));
    ol.appendChild(el("p", "fc__note", s.p == null ? "Running on Totality’s " + pct(q.p) + ". An override changes every figure on this page, and reaches the brief only when you commit it." : "Overriding Totality’s " + pct(q.p) + " with " + pct(p) + ". Every figure on this page follows it."));
    ov.appendChild(ol);
    ov.appendChild(picker([[Math.round((q.p - q.band) * 100) / 100, "Low end"], [q.p, "Totality"], [Math.round((q.p + q.band) * 100) / 100, "High end"]], p, pct, 0.01, 0.01, 0.95,
      function (v) { s.p = Math.abs(v - q.p) < 1e-9 ? null : v; render(); }));
    box.appendChild(ov);
  }

  function drawImpact() {
    var q = Q(), s = S(), none = evaluate(q, s, []), withp = evaluate(q, s, s.plan);
    $("im-note").textContent = "How long each part of the business can run if " + q.phrase + ", and what it costs once its cover runs out. Change the length of the disruption or any site’s cover, and the plan and figures follow.";
    var box = byId("im"); box.textContent = "";
    var head = el("div", "im__head");
    var hl = el("div"); hl.appendChild(el("h3", "im__h", "If It Happens, It Lasts")); hl.appendChild(el("p", "im__sub", "Totality’s expected length, and the ends of its range"));
    head.appendChild(hl);
    head.appendChild(picker([[q.dur[0], "Shorter"], [q.dur[1], "Expected"], [q.dur[2], "Longer"]], s.dur, function (d) { return cap(span(d)); }, 1, q.dmin, q.dmax, function (v) { s.dur = v; render(); }));
    box.appendChild(head);
    var assets = none.rows.filter(function (r) { return r.asset; });
    var scale = Math.max(s.dur + 4, Math.max.apply(null, assets.map(function (r) { return r.cover + r.out + 2; })));
    var tbl = el("div", "im__rows");
    var th = el("div", "im__row im__row--head");
    ["Where", "Days of cover", "Covered, then out", "Doing nothing", "With the plan"].forEach(function (k) { th.appendChild(el("span", null, k)); });
    tbl.appendChild(th);
    none.rows.forEach(function (r, i) {
      var w = withp.rows[i], row = el("div", "im__row" + (r.asset ? "" : " im__row--flat"));
      var nm = el("div", "im__name"); nm.appendChild(el("b", null, r.name)); nm.appendChild(el("span", null, r.note)); row.appendChild(nm);
      if (r.asset) {
        row.appendChild(nudge(r.cover, function (d) { return d + (d === 1 ? " day" : " days"); }, 1, 0, 60, function (v) { s.cover[r.id] = v; render(); }, "cover at " + r.name));
        var bar = el("div", { class: "im__bar", "aria-label": r.cover + " days covered, then " + r.out + " days out" });
        var cv = el("i", "im__cov"); cv.style.width = (100 * Math.min(r.cover, scale) / scale) + "%"; bar.appendChild(cv);
        if (r.out > 0) { var ot = el("i", "im__out"); ot.style.left = (100 * r.cover / scale) + "%"; ot.style.width = (100 * r.out / scale) + "%"; bar.appendChild(ot); }
        var mk = el("i", "im__end"); mk.style.left = (100 * s.dur / scale) + "%"; bar.appendChild(mk);
        row.appendChild(bar);
      } else { row.appendChild(el("span", "im__dash")); row.appendChild(el("span", "im__dash")); }
      row.appendChild(el("b", "im__m" + (r.loss > 0.05 ? " red" : ""), money(r.loss)));
      row.appendChild(el("b", "im__m im__m--plan" + (w.loss > 0.05 ? "" : " is-zero"), money(w.loss)));
      tbl.appendChild(row);
    });
    var tot = el("div", "im__row im__row--tot");
    tot.appendChild(el("b", null, "If it happens")); tot.appendChild(el("span")); tot.appendChild(el("span", "im__legend", "The line marks the end of the disruption"));
    tot.appendChild(el("b", "im__m red", money(none.loss))); tot.appendChild(el("b", "im__m im__m--plan", money(withp.loss)));
    tbl.appendChild(tot);
    box.appendChild(tbl);
  }

  function drawPlan() {
    var q = Q(), s = S(), p = chance(q, s), base = evaluate(q, s, []).loss, sug = suggest(q, s);
    $("pl-note").textContent = "The moves that would protect against " + (q.id === "hormuz" ? "a closure" : q.title) + ", each valued at the " + pct(p) + " chance and in combination, since moves overlap rather than add. " + (sug.length ? "Totality suggests " + list(sug.map(function (id) { return "“" + actName(q, id) + "”"; })) + "." : "Totality suggests none of them at this chance.");
    var box = byId("moves"); box.textContent = "";
    var hd = el("div", "mv mv--head"); ["Move", "Cost", "Protects", "Net"].forEach(function (k) { hd.appendChild(el("span", null, k)); }); box.appendChild(hd);
    q.actions.forEach(function (a) {
      var on = s.plan.indexOf(a.id) >= 0, alone = r1(r1(p * base) - r1(p * evaluate(q, s, [a.id]).loss)), c = actionCost(q, a.id), net = alone - c;
      var row = el("label", "mv" + (on ? " is-on" : ""));
      var nm = el("span", "mv__name");
      var t = el("b", null, a.name); nm.appendChild(t);
      if (sug.indexOf(a.id) >= 0) nm.appendChild(el("span", "pill pill--red", "Totality suggests"));
      else if (net > 0) nm.appendChild(el("span", "pill", "Pays alone, overlaps the rest"));
      nm.appendChild(el("small", null, a.owner + ". " + a.what + "."));
      row.appendChild(nm);
      row.appendChild(el("span", "mv__v", money(c)));
      row.appendChild(el("span", "mv__v", money(alone)));
      row.appendChild(el("span", "mv__v" + (net < 0 ? " red" : ""), (net < 0 ? "−" : "") + money(Math.abs(net))));
      var cb = el("input", { type: "checkbox", "aria-label": "Include " + a.name }); cb.checked = on;
      cb.addEventListener("change", function () {
        if (cb.checked) s.plan.push(a.id); else s.plan = s.plan.filter(function (x) { return x !== a.id; });
        s.plan = q.actions.map(function (x) { return x.id; }).filter(function (id) { return s.plan.indexOf(id) >= 0; });
        setTimeout(render, 220);
      });
      var sw = el("span", "mv__sw"); sw.appendChild(cb); sw.appendChild(el("span", { class: "switch__ui", "aria-hidden": "true" })); row.appendChild(sw);
      box.appendChild(row);
    });
    var withp = evaluate(q, s, s.plan), prot = r1(r1(p * base) - r1(p * withp.loss));
    var foot = el("div", "mv__foot");
    foot.appendChild(el("p", null, s.plan.length ? "Together the plan costs " + money(withp.cost) + " and protects " + money(prot) + ", less than the sum of its moves, since they cover some of the same losses." : "No moves in the plan."));
    if (q.id === "hormuz") { var lk = el("a", { class: "btn-q btn-q--sm", href: "team.html" }, "See the teams’ part"); foot.appendChild(lk); }
    box.appendChild(foot);
    drawFront(q, s);
  }
  // every plan by cost and expected loss; the cheapest way to each level of loss joined by a line; select a dot to load it
  function drawFront(q, s) {
    var fig = byId("front"); fig.textContent = "";
    fig.appendChild(el("h3", "front__h", "Every Plan, by Cost and Loss"));
    fig.appendChild(el("p", "front__sub", "Each dot is one combination of the moves. The line joins the cheapest way to each level of loss. Select a dot to load it."));
    var all = plans(q, s), W = 520, H = 280, L = 66, R = 16, T = 14, B = 40;
    var maxC = Math.max(1, Math.max.apply(null, all.map(function (x) { return x.cost; }))) * 1.08, maxE = Math.max.apply(null, all.map(function (x) { return x.exp; })) * 1.1 || 1;
    var X = function (c) { return L + (W - L - R) * c / maxC; }, Y = function (e) { return T + (H - T - B) * (1 - e / maxE); };
    var g = sv("svg", { viewBox: "0 0 " + W + " " + H, class: "front__svg", role: "img", "aria-label": "Every plan by cost and expected loss" });
    var stepE = maxE > 20 ? 10 : maxE > 8 ? 4 : maxE > 4 ? 2 : 1;
    for (var e = 0; e <= maxE; e += stepE) { g.appendChild(sv("line", { x1: L, x2: W - R, y1: Y(e), y2: Y(e), class: "front__grid" })); g.appendChild(sv("text", { x: L - 8, y: Y(e) + 4, class: "front__ax", "text-anchor": "end" }, money(e))); }
    var stepC = maxC > 3 ? 1 : 0.5;
    for (var c = 0; c <= maxC; c += stepC) g.appendChild(sv("text", { x: X(c), y: H - B + 18, class: "front__ax", "text-anchor": "middle" }, money(c)));
    g.appendChild(sv("text", { x: (L + W - R) / 2, y: H - 4, class: "front__lab", "text-anchor": "middle" }, "What the plan costs"));
    g.appendChild(sv("text", { x: 10, y: (T + H - B) / 2, class: "front__lab", "text-anchor": "middle", transform: "rotate(-90 10 " + (T + H - B) / 2 + ")" }, "Expected loss"));
    var sorted = all.slice().sort(function (a, b) { return a.cost - b.cost || a.exp - b.exp; }), line = [], best = Infinity;
    sorted.forEach(function (x) { if (x.exp < best - 1e-9) { best = x.exp; line.push(x); } });
    g.appendChild(sv("polyline", { points: line.map(function (x) { return X(x.cost).toFixed(1) + "," + Y(x.exp).toFixed(1); }).join(" "), class: "front__line" }));
    var key = s.plan.slice().sort().join("+");
    all.forEach(function (x) {
      var on = x.set.slice().sort().join("+") === key;
      var d = sv("circle", { cx: X(x.cost), cy: Y(x.exp), r: on ? 7 : 5, class: "front__dot" + (on ? " is-on" : ""), tabindex: "0", role: "button" });
      d.appendChild(sv("title", {}, (x.set.length ? x.set.map(function (id) { return actName(q, id); }).join(", ") : "No moves") + ": " + money(x.cost) + ", " + money(x.exp) + " expected loss"));
      function load() { s.plan = x.set.slice(); render(); }
      d.addEventListener("click", load);
      d.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); load(); } });
      g.appendChild(d);
      if (on) g.appendChild(sv("text", { x: X(x.cost) + 11, y: Y(x.exp) - 9, class: "front__you" }, "Your plan"));
    });
    fig.appendChild(g);
  }

  var SOURCES = [
    ["AIS transits through Hormuz", "From the strait traffic agent", "Live", "4 min ago"],
    ["Underwriters’ war-risk notices", "From the war-risk notices agent", "Live", "12 min ago"],
    ["Port agents’ inboxes", "Berth lists from Jebel Ali and Khor Fakkan", "Problem", "Khor Fakkan’s agent stopped answering"],
    ["Diplomatic wire", "Muscat talks and naval statements", "Lagging", "Two of five sources behind a paywall"],
    ["SAP stock levels", "Days of cover at every plant and DC", "Live", "Nightly, last at 05:40"],
    ["Workday", "Free hours for everyone on the plan", "Live", "Hourly"],
    ["Fujairah bunker prices", "From the freight and fuel agent", "Live", "1 h ago"]
  ];
  var LOG = [
    ["06:00", "Totality", "Morning run: Hormuz at 27%, up 3% overnight"],
    ["05:40", "SAP", "Gebze’s resin cover set to 11 days from last night’s stock count"],
    ["05:12", "War-risk notices", "War-risk rate on Gulf calls raised to 0.45% of insured value"],
    ["Mon 18:30", "Priya Nair", "Dammam DC cover cut from 8 to 6 days after the ME4 delays"],
    ["Mon 11:05", "Hanne Sørli", "Insured value on Gulf calls set to $620M for the quarter"],
    ["Fri Oct 2", "Totality", "Feeder sanctions question added, at 13%"]
  ];
  function drawData() {
    var q = Q(), s = S(), box = byId("md"); box.textContent = "";
    var c1 = el("div", "md__col"); c1.appendChild(el("h3", "md__h", "Sources"));
    var ul = el("ul", "md__src");
    SOURCES.forEach(function (r) {
      var li = el("li"), w = el("div"); w.appendChild(el("b", null, r[0])); w.appendChild(el("span", null, r[1] + ". " + r[3] + "."));
      li.appendChild(w); li.appendChild(el("span", "pill" + (r[2] === "Live" ? " pill--green" : r[2] === "Lagging" ? " pill--amber" : " pill--red"), r[2]));
      ul.appendChild(li);
    });
    c1.appendChild(ul); box.appendChild(c1);
    var c2 = el("div", "md__col"); c2.appendChild(el("h3", "md__h", "Change Log"));
    var ol = el("ol", "md__log");
    var pending = changes(q);
    if (pending.length) { var li0 = el("li", "is-new"); li0.appendChild(el("span", "md__t", "Not committed")); var w0 = el("div"); w0.appendChild(el("b", null, "You")); w0.appendChild(el("span", null, pending.join("; ") + ".")); li0.appendChild(w0); ol.appendChild(li0); }
    log.concat(LOG).forEach(function (r) { var li = el("li", r[3] ? "is-you" : ""); li.appendChild(el("span", "md__t", r[0])); var w = el("div"); w.appendChild(el("b", null, r[1])); w.appendChild(el("span", null, r[2] + ".")); li.appendChild(w); ol.appendChild(li); });
    c2.appendChild(ol); box.appendChild(c2);
    var c3 = el("div", "md__col"); c3.appendChild(el("h3", "md__h", "The Same, in the SDK"));
    var lines = ["from penumbra import World", "", 'w = World("halvorsen/v14.' + version + '")', 'q = w.question("' + q.id + '")'];
    if (s.p != null) lines.push("q.forecast.override(" + s.p.toFixed(2) + ")");
    if (s.dur !== PROD[q.id].dur || s.dur !== q.dur[1]) lines.push("q.duration_days = " + s.dur);
    Object.keys(s.cover).forEach(function (id) { if (s.cover[id] !== coverOf(q, { cover: {} }, id)) lines.push('w.asset("' + id + '").cover_days = ' + s.cover[id]); });
    var ids = s.plan.map(function (id) { return '"' + id + '"'; });
    if (ids.length > 2) { lines.push("plan = q.plan(["); ids.forEach(function (x) { lines.push("    " + x + ","); }); lines.push("])"); }
    else lines.push("plan = q.plan([" + ids.join(", ") + "])");
    lines.push("plan.expected_loss   # " + money(chance(q, s) * evaluate(q, s, s.plan).loss));
    var pre = el("pre", "md__code"); pre.textContent = lines.join("\n"); c3.appendChild(pre);
    c3.appendChild(el("p", "md__note", "It follows every edit on this page. Run it against a fork, never production, until you commit."));
    box.appendChild(c3);
  }

  function drawAsks() {
    var box = byId("asks"); box.textContent = "";
    Q().asks.forEach(function (a) {
      var li = el("li"), l = el("a", { class: "ask-q", href: "ask.html?q=" + encodeURIComponent(a[1]) });
      l.appendChild(el("span", "ask-q__kind", a[0])); l.appendChild(el("span", "ask-q__text", a[1]));
      li.appendChild(l); box.appendChild(li);
    });
  }

  render();
  if (window.Reveal) Reveal(".im, .front, .fc");
})();
