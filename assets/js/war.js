(function () {
  var M = DBModel;
  var form = document.getElementById("controls");
  var $ = function (k) { return document.querySelector('[data-out="' + k + '"]'); };
  var NS = "http://www.w3.org/2000/svg";
  var LOSS = "#ff7a66", SAFE = "#7fe0c6", QUIET = "rgba(246,239,230,0.18)";

  function svgEl(name, attrs, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  function read() {
    var f = form.elements;
    return {
      status: form.querySelector('input[name="status"]:checked').value,
      dur: +f.dur.value,
      redsea: f.redsea.checked,
      prem: +f.prem.value,
      bunker: +f.bunker.value,
      divert: f.divert.checked,
      bridge: f.bridge.checked,
      cover: f.cover.checked,
      buffer: +f.buffer.value
    };
  }
  function write(inp) {
    var f = form.elements;
    form.querySelector('input[name="status"][value="' + inp.status + '"]').checked = true;
    f.dur.value = inp.dur; f.redsea.checked = inp.redsea; f.prem.value = inp.prem; f.bunker.value = inp.bunker;
    f.divert.checked = inp.divert; f.bridge.checked = inp.bridge; f.cover.checked = inp.cover; f.buffer.value = inp.buffer;
    DB.fillRanges(form);
  }
  function noResponse(inp) {
    var b = M.clone(inp); b.divert = b.bridge = b.cover = false; b.buffer = 0; return b;
  }
  function movesText(inp) {
    var m = [];
    if (inp.bridge) m.push("bridge-buy");
    if (inp.divert) m.push("divert");
    if (inp.cover) m.push("cover + hedge");
    if (inp.buffer) m.push("+" + inp.buffer + "d stock");
    return sentence(m.length ? m.join(", ") : "no response");
  }
  function sentence(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function worldText(inp) {
    var st = M.STATUS[inp.status];
    var t = st.label + (inp.status === "open" ? "" : ", " + inp.dur + "d");
    if (inp.redsea) t += " + Red Sea";
    return sentence(t);
  }

  /* ---------- Cascade ---------- */
  var cas = document.getElementById("cascade");
  var COLS = [0, 240, 478, 715], W = 185, H = 50;
  function casRender(r, inp) {
    var n = r.nodes, p = r.parts;
    var nodes = {
      hormuz: { c: 0, y: 122, h: 86, name: "Strait of Hormuz", sub: worldText(inp), v: r.loss },
      resin: { c: 1, y: 18, name: "Resin supply", sub: "Jubail and Mesaieed", v: p.plants },
      japort: { c: 1, y: 98, name: "Jebel Ali port", sub: "inbound boxes", v: n.dubai.loss },
      dmport: { c: 1, y: 178, name: "Dammam port", sub: "inbound boxes", v: n.dammam.loss },
      calls: { c: 1, y: 258, name: "Gulf calls", sub: "Insurance, fuel, cargo", v: p.war + p.trapped },
      gebze: { c: 2, y: 8, name: "Gebze plant", sub: n.gebze.stop ? Math.round(n.gebze.stop) + "d line stop" : "running", v: n.gebze.loss },
      pune: { c: 2, y: 72, name: "Pune plant", sub: n.pune.stop ? Math.round(n.pune.stop) + "d line stop" : "running", v: n.pune.loss },
      dubai: { c: 2, y: 136, name: "Dubai DC", sub: n.dubai.stop ? Math.round(n.dubai.stop) + "d stocked out" : "in stock", v: n.dubai.loss },
      dammam: { c: 2, y: 200, name: "Dammam DC", sub: n.dammam.stop ? Math.round(n.dammam.stop) + "d stocked out" : "in stock", v: n.dammam.loss },
      freight: { c: 2, y: 264, name: "Freight & cover", sub: "Premium, bunker, demurrage", v: p.war + p.trapped },
      eu: { c: 3, y: 18, name: "EU revenue", sub: "Washers, dishwashers", v: n.gebze.loss },
      india: { c: 3, y: 98, name: "India revenue", sub: "Fridges, AC", v: n.pune.loss },
      mena: { c: 3, y: 178, name: "MENA revenue", sub: "all categories", v: n.dubai.loss + n.dammam.loss },
      opex: { c: 3, y: 258, name: "Operating cost", sub: "P&L, not revenue", v: p.war + p.trapped }
    };
    var edges = [
      ["hormuz", "resin"], ["hormuz", "japort"], ["hormuz", "dmport"], ["hormuz", "calls"],
      ["resin", "gebze", n.gebze.loss], ["resin", "pune", n.pune.loss], ["japort", "dubai"], ["dmport", "dammam"], ["calls", "freight"],
      ["gebze", "eu"], ["pune", "india"], ["dubai", "mena", n.dubai.loss], ["dammam", "mena", n.dammam.loss], ["freight", "opex"]
    ];
    var max = Math.max(1, r.loss);
    cas.textContent = "";
    ["Chokepoint", "First contact", "Operations", "Where it lands"].forEach(function (t, i) {
      cas.appendChild(svgEl("text", { x: COLS[i], y: -6 + 0, class: "ccol", dy: 0 }, t));
    });
    var gE = svgEl("g", {}), gN = svgEl("g", {});
    cas.appendChild(gE); cas.appendChild(gN);
    edges.forEach(function (e) {
      var a = nodes[e[0]], b = nodes[e[1]], v = e[2] != null ? e[2] : b.v;
      var x1 = COLS[a.c] + W, y1 = a.y + (a.h || H) / 2, x2 = COLS[b.c], y2 = b.y + (b.h || H) / 2, mx = (x1 + x2) / 2;
      gE.appendChild(svgEl("path", {
        class: "cedge",
        d: "M" + x1 + " " + y1 + " C" + mx + " " + y1 + " " + mx + " " + y2 + " " + x2 + " " + y2,
        stroke: v > 0.05 ? LOSS : QUIET,
        "stroke-opacity": v > 0.05 ? 0.35 + 0.6 * Math.min(1, v / (max * 0.5)) : 1,
        "stroke-width": v > 0.05 ? (1.5 + 16 * Math.sqrt(v / max)).toFixed(1) : 1.5
      }));
    });
    Object.keys(nodes).forEach(function (k) {
      var d = nodes[k], hot = d.v > 0.05;
      var g = svgEl("g", { class: "cnode", transform: "translate(" + COLS[d.c] + " " + d.y + ")" });
      g.appendChild(svgEl("rect", {
        width: W, height: d.h || H,
        fill: hot ? "rgba(120,30,30," + (0.25 + 0.45 * Math.min(1, d.v / (max * 0.5))).toFixed(2) + ")" : "rgba(255,255,255,0.04)",
        stroke: hot ? "rgba(255,122,102,0.7)" : "rgba(255,255,255,0.14)"
      }));
      g.appendChild(svgEl("text", { x: 12, y: 21, class: "cnode__name" }, d.name));
      g.appendChild(svgEl("text", { x: 12, y: 38, class: "cnode__sub" }, sentence(d.sub)));
      if (d.h) g.appendChild(svgEl("text", { x: 12, y: 70, class: "cnode__val cnode__val--big", fill: hot ? LOSS : SAFE }, hot ? DB.money(d.v) : "$0"));
      else g.appendChild(svgEl("text", { x: W - 10, y: 21, class: "cnode__val", "text-anchor": "end", fill: hot ? LOSS : SAFE }, hot ? DB.money(d.v) : "—"));
      gN.appendChild(g);
    });
    cas.setAttribute("viewBox", "0 -22 900 344");
  }

  /* ---------- Capacity chart ---------- */
  var cap = document.getElementById("cap");
  var SERIES = [
    { id: "gebze", name: "Gebze plant", color: "#ffb547" },
    { id: "pune", name: "Pune plant", color: "#ff7a66" },
    { id: "dubai", name: "Dubai DC fill rate", color: "#7fe0c6" },
    { id: "dammam", name: "Dammam DC fill rate", color: "#a9c6e8" }
  ];
  var legend = document.getElementById("cap-legend");
  SERIES.forEach(function (s) {
    var li = document.createElement("li");
    li.innerHTML = '<i style="background:' + s.color + '"></i>' + s.name;
    legend.appendChild(li);
  });
  function capRender(inp, r) {
    var days = 84, x0 = 44, x1 = 510, y0 = 14, y1 = 196;
    var sx = function (d) { return x0 + (x1 - x0) * d / days; };
    var sy = function (v) { return y1 - (y1 - y0) * v; };
    var data = M.series(inp, null, days);
    cap.textContent = "";
    var grid = svgEl("g", { class: "grid" });
    [0, 0.5, 1].forEach(function (v) {
      grid.appendChild(svgEl("line", { x1: x0, x2: x1, y1: sy(v), y2: sy(v) }));
      cap.appendChild(svgEl("text", { x: x0 - 8, y: sy(v) + 3, class: "axis", "text-anchor": "end" }, Math.round(v * 100) + "%"));
    });
    cap.appendChild(grid);
    for (var w = 0; w <= 12; w += 2) cap.appendChild(svgEl("text", { x: sx(w * 7), y: y1 + 18, class: "axis", "text-anchor": "middle" }, "w" + w));
    if (r.D > 0) {
      cap.appendChild(svgEl("rect", { x: sx(0), y: y0, width: Math.max(0, sx(Math.min(days, r.D)) - sx(0)), height: y1 - y0, fill: "rgba(255,122,102,0.07)" }));
      cap.appendChild(svgEl("text", { x: sx(Math.min(days, r.D)) + 6, y: y1 - 8, class: "axis axis--loss" }, "strait shut " + Math.round(r.D) + "d"));
    }
    SERIES.forEach(function (s, i) {
      var arr = data[s.id], d = "";
      arr.forEach(function (v, k) {
        var y = sy(v) + i * 1.6 - 2.4; // nudge so overlapping lines stay visible
        d += (k ? " L" : "M") + sx(k).toFixed(1) + " " + y.toFixed(1);
      });
      cap.appendChild(svgEl("path", { d: d, fill: "none", stroke: s.color, "stroke-width": 2.2, "stroke-linejoin": "round" }));
    });
  }

  /* ---------- Histogram ---------- */
  var hist = document.getElementById("hist");
  var seed = 11;
  function histRender(inp) {
    var N = 10000;
    var cur = M.simulate(inp, null, N, seed);
    var base = M.simulate(noResponse(inp), null, N, seed);
    var hi = Math.max(1, M.quantile(base, 0.99));
    var bins = 30, x0 = 44, x1 = 510, y0 = 14, y1 = 196, bw = (x1 - x0) / bins;
    function count(arr) {
      var c = new Array(bins).fill(0);
      for (var i = 0; i < arr.length; i++) { var k = Math.floor(arr[i] / hi * bins); if (k < bins) c[k]++; }
      return c;
    }
    var cc = count(cur), cb = count(base);
    var top = Math.max.apply(null, cc.concat(cb));
    hist.textContent = "";
    var sx = function (v) { return x0 + (x1 - x0) * Math.min(1, v / hi); };
    var g = svgEl("g", { class: "grid" });
    g.appendChild(svgEl("line", { x1: x0, x2: x1, y1: y1, y2: y1 }));
    hist.appendChild(g);
    cb.forEach(function (c, i) {
      var h = (y1 - y0) * c / top;
      hist.appendChild(svgEl("rect", { x: x0 + i * bw + 1, y: y1 - h, width: bw - 2, height: h, fill: "none", stroke: "rgba(246,239,230,0.25)", "stroke-dasharray": "2 2" }));
    });
    cc.forEach(function (c, i) {
      var h = (y1 - y0) * c / top;
      hist.appendChild(svgEl("rect", { x: x0 + i * bw + 1, y: y1 - h, width: bw - 2, height: h, rx: 2, fill: "#f2683c", "fill-opacity": 0.85 }));
    });
    var p50 = M.quantile(cur, 0.5), p95 = M.quantile(cur, 0.95), b95 = M.quantile(base, 0.95);
    [[p50, "P50 " + DB.money(p50), "#f6efe6"], [p95, "P95 " + DB.money(p95), LOSS]].forEach(function (m, i) {
      var x = sx(m[0]);
      hist.appendChild(svgEl("line", { x1: x, x2: x, y1: y0 + 6, y2: y1, stroke: m[2], "stroke-width": 1.5, "stroke-dasharray": "3 3" }));
      hist.appendChild(svgEl("text", { x: x + 4, y: y0 + 8 + i * 13, class: "axis", fill: m[2], style: "fill:" + m[2] }, m[1]));
    });
    for (var t = 0; t <= 4; t++) {
      var v = hi * t / 4;
      hist.appendChild(svgEl("text", { x: sx(v), y: y1 + 18, class: "axis", "text-anchor": "middle" }, DB.money(v, 0)));
    }
    $("mcnote").textContent = "Filled: your branch. Dashed: same world, no response (P95 " + DB.money(b95) + "). Duration and severity vary around your settings; worst 1% not shown.";
    return { p50: p50, p95: p95 };
  }

  /* ---------- Main update ---------- */
  var last = null, simTimer;
  function update(full) {
    var inp = read();
    var st = M.STATUS[inp.status];
    $("dur").textContent = inp.dur + " days";
    $("prem").textContent = inp.prem.toFixed(2) + "% of value";
    $("bunker").textContent = "$" + inp.bunker + "/t";
    $("buffer").textContent = "+" + inp.buffer + " days";
    $("pworld").textContent = st.p ? "Daybreak gives this world a " + Math.round(st.p * 100) + "% chance in the next 30 days." : "The baseline: traffic flows normally.";
    form.elements.dur.disabled = inp.status === "open";

    var r = M.run(inp), b = M.run(noResponse(inp));
    $("loss").textContent = DB.money(r.loss);
    var hasMoves = inp.divert || inp.bridge || inp.cover || inp.buffer;
    $("lossdelta").textContent = hasMoves ? "Down from " + DB.money(b.loss) + " with no response" : "With no response";
    $("cost").textContent = DB.money(r.cost, 2);
    $("moves").textContent = movesText(inp);
    var net = b.loss - r.loss - r.cost;
    $("net").textContent = (net < 0 ? "−" : "") + DB.money(Math.abs(net));
    $("net").classList.toggle("money--loss", net < 0);
    $("net").classList.toggle("money--safe", net >= 0);
    $("roi").textContent = r.cost > 0 ? "Every $1 spent saves $" + ((b.loss - r.loss) / r.cost).toFixed(1) : "Nothing spent yet";
    $("eff").textContent = st.p ? "× " + Math.round(st.p * 100) + "% chance = " + DB.money(r.loss * st.p) + " expected" : "";

    casRender(r, inp);
    capRender(inp, r);
    clearTimeout(simTimer);
    var go = function () { last = { inp: inp, r: r, mc: histRender(inp) }; $("p95").textContent = DB.money(last.mc.p95); };
    if (full) go(); else simTimer = setTimeout(go, 90);
  }

  form.addEventListener("input", function () { update(false); });
  form.addEventListener("change", function () { update(false); });
  document.getElementById("rerun").addEventListener("click", function () { seed = Math.floor(Math.random() * 1e6); update(true); });
  document.getElementById("reset").addEventListener("click", function () { write(M.DEFAULTS); update(true); });
  document.getElementById("apply-brief").addEventListener("click", function () {
    var i = read(); i.bridge = i.divert = i.cover = true; write(i); update(true);
    DB.toast("Applied the brief's three actions to this world.");
  });

  /* ---------- Branches ---------- */
  var branches = [];
  var tbody = document.querySelector("#branches tbody");
  var COLORS = ["#f2683c", "#ffb547", "#7fe0c6", "#a9c6e8", "#f6efe6"];
  function renderBranches() {
    tbody.textContent = "";
    if (!branches.length) {
      tbody.innerHTML = '<tr class="empty"><td colspan="7">No branches yet. Set up a world and a response, then save it to compare.</td></tr>';
      return;
    }
    branches.forEach(function (b, i) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td><span class="branch__swatch" style="background:' + COLORS[i % COLORS.length] + '"></span>' + b.name + "</td>" +
        "<td>" + worldText(b.inp) + "</td><td>" + movesText(b.inp) + "</td>" +
        '<td class="r"><span class="money money--loss">' + DB.money(b.loss) + "</span></td>" +
        '<td class="r money">' + DB.money(b.p95) + "</td>" +
        '<td class="r money">' + DB.money(b.cost, 2) + "</td>" +
        '<td class="r"><button class="branch__x" type="button" aria-label="Remove branch ' + b.name + '">×</button></td>';
      tr.querySelector("button").addEventListener("click", function () { branches.splice(i, 1); renderBranches(); });
      tr.addEventListener("dblclick", function () { write(b.inp); update(true); });
      tbody.appendChild(tr);
    });
  }
  var letter = 0;
  function save(name) {
    if (!last) update(true);
    if (branches.length >= 5) branches.shift();
    branches.push({ name: name || "Branch " + String.fromCharCode(65 + (letter++ % 26)), inp: last.inp, loss: last.r.loss, p95: last.mc.p95, cost: last.r.cost });
    renderBranches();
  }
  document.getElementById("save").addEventListener("click", function () {
    clearTimeout(simTimer); update(true); save(); DB.toast("Branch saved. Double-click a row to load it back.");
  });

  write(M.DEFAULTS);
  update(true);
  save("This morning");
  var i = read(); i.bridge = i.divert = i.cover = true;
  write(i); update(true); save("Brief's 3 actions");
  write(M.DEFAULTS); update(true);

  // Arriving from the brief's "Test in the wargame": switch that action on
  var NAMES = { bridge: "the resin bridge-buy", divert: "the Khor Fakkan diversion", cover: "war-risk cover and the bunker hedge" };
  var tryMove = new URLSearchParams(window.location.search).get("try");
  if (NAMES[tryMove]) {
    var t = read(); t[tryMove] = true; write(t); update(true);
    DB.toast("Testing " + NAMES[tryMove] + " from this morning's brief.");
  }
})();
