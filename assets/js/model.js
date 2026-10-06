/* The toy loss model behind the wargame and workbench. All money in $ millions.
   It is deliberately simple: a scenario blocks the strait for D effective days, and
   each node loses money once its cover runs out, until supply returns. */
(function () {
  var BASE = {
    plants: [
      { id: "gebze", name: "Gebze plant", where: "Türkiye", cover: 11, rate: 2.6, bridge: 14, bridgeCape: 30, feeds: "EU revenue" },
      { id: "pune", name: "Pune plant", where: "India", cover: 8, rate: 2.1, bridge: 9, bridgeCape: 9, feeds: "India revenue" }
    ],
    dcs: [
      { id: "dubai", name: "Dubai DC", where: "Jebel Ali", cover: 9, rate: 2.0, divertible: true },
      { id: "dammam", name: "Dammam DC", where: "Saudi Arabia", cover: 6, rate: 0.82, divertible: false }
    ],
    ramp: 2,              // days to restart a line after supply returns
    trappedPerDay: 0.8,   // demurrage + working capital on cargo stuck inside
    insured: 620,         // value insured on Gulf calls this quarter
    bunkerKt: 80,         // bunker burn, thousand tonnes / quarter
    divertCapture: 0.85,  // share of Dubai DC inbound Khor Fakkan can absorb
    pClose: 0.27          // this morning's forecast for the closure scenario
  };

  var STATUS = {
    open: { s: 0, label: "open", p: null },
    harass: { s: 0.25, label: "harassment", p: 0.63 },
    partial: { s: 0.6, label: "partial closure", p: 0.41 },
    closed: { s: 1, label: "closed", p: 0.27 }
  };

  var DEFAULTS = { status: "closed", dur: 21, redsea: false, prem: 0.45, bunker: 690, divert: false, bridge: false, cover: false, buffer: 0 };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function run(inp, params, sOverride, durOverride) {
    var P = params || BASE;
    var s = sOverride != null ? sOverride : STATUS[inp.status].s;
    var dur = durOverride != null ? durOverride : inp.dur;
    var D = s * dur; // effective blocked days
    var buf = inp.buffer || 0;
    var nodes = {};

    var plantsLoss = 0;
    P.plants.forEach(function (pl) {
      var cover = pl.cover + buf;
      var back = D; // supply returns when the strait does...
      if (inp.bridge) back = Math.min(back, inp.redsea ? pl.bridgeCape : pl.bridge); // ...or when the bridge-buy lands
      var stop = Math.max(0, back - cover);
      if (stop > 0) stop += P.ramp;
      var loss = stop * pl.rate;
      nodes[pl.id] = { loss: loss, stop: stop, cover: cover, back: back };
      plantsLoss += loss;
    });

    var dcLoss = 0;
    P.dcs.forEach(function (dc) {
      var cover = dc.cover + buf;
      var out = Math.max(0, D - cover);
      var share = inp.divert && dc.divertible ? 1 - P.divertCapture : 1;
      var loss = out * dc.rate * share;
      nodes[dc.id] = { loss: loss, stop: out * share, cover: cover, share: share };
      dcLoss += loss;
    });

    var premMult = inp.cover ? 1 : 1 + 2 * s;
    var premium = P.insured * (inp.prem / 100) * premMult - P.insured * (inp.prem / 100); // increase over today
    var shock = inp.bunker * 0.35 * s;               // $/t spike if the strait shuts
    var bunker = (shock * P.bunkerKt) / 1000 * (inp.cover ? 0.2 : 1);
    if (inp.redsea) bunker += 4.0;                   // Cape routing burns more fuel
    var war = Math.max(0, premium) + bunker;

    var trapped = P.trappedPerDay * D * (inp.divert ? 0.55 : 1);

    var cost = 0;
    if (inp.divert) cost += 0.9 + 0.03 * Math.max(0, D - 21);
    if (inp.bridge) cost += 0.84 + (inp.redsea ? 0.5 : 0);
    if (inp.cover) cost += 1.36;
    cost += 0.11 * buf;

    var loss = plantsLoss + dcLoss + war + trapped;
    nodes.hormuz = { loss: loss };
    return {
      D: D, s: s,
      parts: { plants: plantsLoss, dcs: dcLoss, war: war, trapped: trapped },
      nodes: nodes,
      loss: loss,
      cost: cost
    };
  }

  // Daily availability (0..1) for charting, days 0..days-1
  function series(inp, params, days) {
    var P = params || BASE;
    var r = run(inp, P);
    var out = {};
    P.plants.forEach(function (pl) {
      var n = r.nodes[pl.id], arr = [];
      for (var d = 0; d < days; d++) {
        var v = 1;
        if (n.stop > 0) {
          var start = n.cover, end = n.back;
          if (d >= start && d < end) v = 0;
          else if (d >= end && d < end + P.ramp) v = (d - end + 1) / (P.ramp + 1);
        }
        arr.push(v);
      }
      out[pl.id] = arr;
    });
    P.dcs.forEach(function (dc) {
      var n = r.nodes[dc.id], arr = [];
      for (var d = 0; d < days; d++) {
        var v = 1;
        if (r.D > n.cover && d >= n.cover && d < r.D) v = 1 - n.share;
        else if (r.D > n.cover && d >= r.D && d < r.D + 7) v = (1 - n.share) + n.share * ((d - r.D + 1) / 8);
        arr.push(v);
      }
      out[dc.id] = arr;
    });
    return out;
  }

  // Monte Carlo over duration and severity around the chosen scenario
  function simulate(inp, params, n, seed) {
    var rand = DB.rng(seed || 11);
    var s0 = STATUS[inp.status].s;
    var res = new Float64Array(n);
    for (var i = 0; i < n; i++) {
      var u1 = Math.max(1e-9, rand()), u2 = rand();
      var z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      var z2 = Math.sqrt(-2 * Math.log(Math.max(1e-9, rand()))) * Math.cos(2 * Math.PI * rand());
      var dur = inp.dur * Math.exp(0.5 * z);
      var s = s0 === 0 ? 0 : DB.clamp(s0 + 0.12 * z2, 0.05, 1);
      res[i] = run(inp, params, s, dur).loss;
    }
    res.sort();
    return res;
  }
  function quantile(sorted, q) { return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]; }

  window.DBModel = { BASE: BASE, STATUS: STATUS, DEFAULTS: DEFAULTS, clone: clone, run: run, series: series, simulate: simulate, quantile: quantile };
})();
