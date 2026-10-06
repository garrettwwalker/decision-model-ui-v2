(function () {
  var M = DBModel;
  var NS = "http://www.w3.org/2000/svg";
  var $ = function (k) { return document.querySelector('[data-out="' + k + '"]'); };

  /* ---------- State ---------- */
  var ENSEMBLE = [
    { id: "structural", name: "Structural conflict model", p: 0.31 },
    { id: "base_rates", name: "Event-history base rates", p: 0.19 },
    { id: "ais_anomaly", name: "AIS behaviour anomaly", p: 0.34 },
    { id: "insurance", name: "Insurance-market signal", p: 0.30 },
    { id: "experts", name: "Expert panel (n=14)", p: 0.24 },
    { id: "llm_synthesis", name: "LLM evidence synthesis", p: 0.29 },
    { id: "markets", name: "Prediction-market prior", p: 0.22 }
  ];
  var params = M.clone(M.BASE);
  var weights = ENSEMBLE.map(function () { return 1; });
  var NO_RESPONSE = M.clone(M.DEFAULTS);

  // Editable parameters: path into params, label, unit, SDK key
  var PROPS = {
    "plants.0.cover": { label: "Resin cover", unit: "days", sdk: "gebze.cover_days", min: 0, max: 60, step: 1 },
    "plants.0.rate": { label: "Line-stop cost", unit: "$M/day", sdk: "gebze.stop_cost_musd", min: 0, max: 10, step: 0.1 },
    "plants.0.bridge": { label: "Bridge-buy lead time", unit: "days", sdk: "gebze.bridge_lead_days", min: 1, max: 60, step: 1 },
    "plants.1.cover": { label: "Resin cover", unit: "days", sdk: "pune.cover_days", min: 0, max: 60, step: 1 },
    "plants.1.rate": { label: "Line-stop cost", unit: "$M/day", sdk: "pune.stop_cost_musd", min: 0, max: 10, step: 0.1 },
    "plants.1.bridge": { label: "Bridge-buy lead time", unit: "days", sdk: "pune.bridge_lead_days", min: 1, max: 60, step: 1 },
    "dcs.0.cover": { label: "Stock cover", unit: "days", sdk: "dubai_dc.cover_days", min: 0, max: 60, step: 1 },
    "dcs.0.rate": { label: "Lost margin when out", unit: "$M/day", sdk: "dubai_dc.lost_margin_musd", min: 0, max: 10, step: 0.1 },
    "dcs.1.cover": { label: "Stock cover", unit: "days", sdk: "dammam_dc.cover_days", min: 0, max: 60, step: 1 },
    "dcs.1.rate": { label: "Lost margin when out", unit: "$M/day", sdk: "dammam_dc.lost_margin_musd", min: 0, max: 10, step: 0.1 },
    "divertCapture": { label: "Share of Dubai DC inbound it can absorb", unit: "0–1", sdk: "khor_fakkan.capture_share", min: 0, max: 1, step: 0.05 },
    "trappedPerDay": { label: "Trapped-cargo cost", unit: "$M/day", sdk: "gulf.trapped_cost_musd", min: 0, max: 5, step: 0.1 },
    "insured": { label: "Insured value on Gulf calls", unit: "$M", sdk: "gulf.insured_value_musd", min: 0, max: 3000, step: 10 }
  };

  function get(obj, path) { return path.split(".").reduce(function (o, k) { return o[k]; }, obj); }
  function set(obj, path, v) {
    var ks = path.split("."), last = ks.pop();
    ks.reduce(function (o, k) { return o[k]; }, obj)[last] = v;
  }
  function pooled(w) {
    var sw = 0, s = 0;
    ENSEMBLE.forEach(function (m, i) { sw += w[i]; s += w[i] * m.p; });
    return sw ? s / sw : 0;
  }
  function evaluate(P, w) {
    var r = M.run(NO_RESPONSE, P), p = pooled(w);
    return { p: p, cl: r.loss, el: p * r.loss, r: r };
  }
  var BASE_EVAL = evaluate(M.BASE, ENSEMBLE.map(function () { return 1; }));

  function changes() {
    var out = [];
    Object.keys(PROPS).forEach(function (path) {
      var a = get(M.BASE, path), b = get(params, path);
      if (Math.abs(a - b) > 1e-9) out.push({ path: path, from: a, to: b, sdk: PROPS[path].sdk });
    });
    ENSEMBLE.forEach(function (m, i) {
      if (Math.abs(weights[i] - 1) > 1e-9) out.push({ path: "w." + m.id, from: 1, to: weights[i], sdk: 'ensemble.weights["' + m.id + '"]', w: i });
    });
    return out;
  }

  /* ---------- Graph ---------- */
  var NODES = {
    busan: { x: 718, y: 92, name: "Busan", kind: "port", lab: "left" },
    ningbo: { x: 705, y: 152, name: "Ningbo", kind: "port" },
    kaoh: { x: 690, y: 214, name: "Kaohsiung", kind: "port" },
    sing: { x: 612, y: 372, name: "Singapore", kind: "port", alt: true },
    pune: { x: 500, y: 326, name: "Pune plant", kind: "plant", ref: "plants.1" },
    khor: { x: 446, y: 258, name: "Khor Fakkan", kind: "port", alt: true },
    hormuz: { x: 414, y: 200, name: "Hormuz", kind: "chokepoint" },
    dubai: { x: 380, y: 262, name: "Dubai DC", kind: "dc", ref: "dcs.0", lab: "below" },
    mesaieed: { x: 336, y: 236, name: "Mesaieed", kind: "port", lab: "left" },
    dammam: { x: 312, y: 200, name: "Dammam DC", kind: "dc", ref: "dcs.1", lab: "left" },
    jubail: { x: 300, y: 162, name: "Jubail", kind: "port", lab: "left" },
    bab: { x: 214, y: 316, name: "Bab el-Mandeb", kind: "chokepoint", lab: "left" },
    suez: { x: 150, y: 168, name: "Suez", kind: "chokepoint", lab: "left" },
    gebze: { x: 76, y: 76, name: "Gebze plant", kind: "plant", ref: "plants.0" }
  };
  var EDGES = [
    ["jubail", "hormuz", "hot"], ["mesaieed", "hormuz", "hot"], ["dammam", "hormuz", "hot"], ["dubai", "hormuz", "hot"],
    ["hormuz", "pune", "hot"], ["hormuz", "bab", "hot"], ["bab", "suez", "norm"], ["suez", "gebze", "norm"],
    ["busan", "ningbo", "norm"], ["ningbo", "kaoh", "norm"], ["kaoh", "sing", "norm"], ["sing", "hormuz", "hot"],
    ["sing", "khor", "alt"], ["khor", "dubai", "alt"], ["sing", "pune", "alt"], ["sing", "bab", "alt"]
  ];
  var svg = document.getElementById("graph");
  var selected = "hormuz";

  function el(name, attrs, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  function drawGraph(ev) {
    svg.textContent = "";
    // faint graticule
    var g0 = el("g", {});
    for (var x = 40; x < 760; x += 60) g0.appendChild(el("line", { x1: x, x2: x, y1: 0, y2: 420, stroke: "rgba(255,255,255,0.035)" }));
    for (var y = 30; y < 420; y += 60) g0.appendChild(el("line", { x1: 0, x2: 760, y1: y, y2: y, stroke: "rgba(255,255,255,0.035)" }));
    svg.appendChild(g0);

    var gE = el("g", {});
    EDGES.forEach(function (e) {
      var a = NODES[e[0]], b = NODES[e[1]];
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.abs(a.x - b.x) * 0.12;
      var attrs = { class: "gedge", d: "M" + a.x + " " + a.y + " Q" + mx + " " + my + " " + b.x + " " + b.y };
      if (e[2] === "hot") { attrs.stroke = "rgba(255,122,102,0.55)"; attrs["stroke-width"] = 2.2; }
      else if (e[2] === "alt") { attrs.stroke = "rgba(127,224,198,0.55)"; attrs["stroke-width"] = 1.6; attrs["stroke-dasharray"] = "5 5"; }
      else { attrs.stroke = "rgba(232,238,242,0.18)"; attrs["stroke-width"] = 1.4; }
      gE.appendChild(el("path", attrs));
    });
    svg.appendChild(gE);

    var max = ev.r.loss;
    Object.keys(NODES).forEach(function (id) {
      var n = NODES[id];
      var loss = id === "hormuz" ? ev.r.loss : (ev.r.nodes[id] ? ev.r.nodes[id].loss : 0);
      var r = 5 + (loss > 0 ? 15 * Math.sqrt(loss / max) : 0);
      if (n.kind === "chokepoint") r = Math.max(r, 7);
      var fill = loss > 0.05 ? "#ff7a66" : n.kind === "chokepoint" ? "#ffb547" : n.alt ? "#7fe0c6" : "#9fb0bb";
      if (id === "hormuz") fill = "#ff7a66";
      var g = el("g", { class: "gnode" + (id === selected ? " is-selected" : ""), tabindex: 0, role: "button", "aria-label": n.name + (loss > 0.05 ? ", " + DB.money(loss) + " at risk" : "") + ". Inspect." });
      g.appendChild(el("circle", { class: "gnode__halo", cx: n.x, cy: n.y, r: r + 6 }));
      if (id === "hormuz") g.appendChild(el("circle", { cx: n.x, cy: n.y, r: r + 14, fill: "rgba(255,122,102,0.12)" }));
      g.appendChild(el("circle", { class: "gnode__dot", cx: n.x, cy: n.y, r: r.toFixed(1), fill: fill }));
      var anchor = n.lab === "left" ? "end" : "start";
      var tx = n.lab === "left" ? n.x - r - 7 : n.lab === "below" ? n.x - 10 : n.x + r + 7;
      var ty = n.lab === "below" ? n.y + r + 14 : n.y + 4;
      g.appendChild(el("text", { x: tx, y: ty, "text-anchor": n.lab === "below" ? "end" : anchor }, n.name));
      if (loss > 0.05) g.appendChild(el("text", { class: "gnode__val", x: tx, y: ty + 13, "text-anchor": n.lab === "below" ? "end" : anchor }, DB.money(loss)));
      g.addEventListener("click", function () { select(id); });
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(id); } });
      svg.appendChild(g);
    });
  }

  /* ---------- Inspector ---------- */
  var ins = document.getElementById("inspector");
  var INFO = {
    hormuz: { type: "Chokepoint, the driver", desc: "Seven models forecast closure for ≥7 days in the next 30. Weight them to see how much the pooled number, and every loss downstream, depends on each one." },
    gebze: { type: "Plant", desc: "Appliance assembly. Runs on PP resin from Jubail via Suez. Washers and dishwashers for the EU." },
    pune: { type: "Plant", desc: "Refrigerators and AC. Runs on HDPE from Mesaieed via Nhava Sheva." },
    dubai: { type: "Distribution centre", desc: "MENA hub at Jebel Ali, inside the strait. Can be fed by road from Khor Fakkan." },
    dammam: { type: "Distribution centre", desc: "Saudi DC, inside the strait. No east-coast alternative is modelled yet." },
    khor: { type: "Port, alternate", desc: "UAE east coast, outside the strait. 140 km by road to the Dubai DC." },
    jubail: { type: "Port, origin", desc: "PP resin origin for Gebze. Inside the strait." },
    mesaieed: { type: "Port, origin", desc: "HDPE resin origin for Pune. Inside the strait." },
    sing: { type: "Port, hub", desc: "Transshipment hub and alternate resin source for the bridge-buy." },
    bab: { type: "Chokepoint", desc: "Red Sea entrance. Its own scenario: p(closure, 30d) = 0.34. Not in this run." },
    suez: { type: "Chokepoint", desc: "Gebze's resin and EU lanes depend on it. Modelled through the Red Sea scenario." },
    ningbo: { type: "Port, origin", desc: "Finished-goods origin for MENA (TVs, small appliances)." },
    kaoh: { type: "Port, origin", desc: "Finished-goods origin for MENA (washers)." },
    busan: { type: "Port, origin", desc: "Finished-goods origin for Saudi (fridges)." }
  };
  var NODE_PROPS = {
    gebze: ["plants.0.cover", "plants.0.rate", "plants.0.bridge"],
    pune: ["plants.1.cover", "plants.1.rate", "plants.1.bridge"],
    dubai: ["dcs.0.cover", "dcs.0.rate"],
    dammam: ["dcs.1.cover", "dcs.1.rate"],
    khor: ["divertCapture"],
    jubail: ["trappedPerDay", "insured"],
    mesaieed: ["trappedPerDay", "insured"]
  };
  var FACTS = {
    sing: [["Halvorsen TEU / week", "1,140"], ["Spot PP premium", "+$118/t"], ["Lead to Gebze via Suez", "14 d"]],
    bab: [["p(closure, 30d)", "0.34"], ["Halvorsen sailings / wk", "11"]],
    suez: [["Transit queue", "normal"], ["Cape detour", "+11 d"]],
    ningbo: [["Halvorsen TEU / week", "420"], ["Bound for Gulf", "62%"]],
    kaoh: [["Halvorsen TEU / week", "260"], ["Bound for Gulf", "48%"]],
    busan: [["Halvorsen TEU / week", "190"], ["Bound for Gulf", "71%"]]
  };

  function fmt(v, path) {
    var st = PROPS[path] ? PROPS[path].step : 0.1; // ensemble weights step by 0.1
    var dp = st < 1 ? (String(st).split(".")[1] || "").length : 0;
    return (+v).toFixed(dp);
  }

  function renderInspector() {
    var n = NODES[selected], info = INFO[selected];
    $("type").textContent = info.type;
    $("name").textContent = n.name === "Hormuz" ? "Strait of Hormuz" : n.name;
    $("desc").textContent = info.desc;
    ins.textContent = "";
    document.querySelectorAll("[data-select]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-select") === selected)); });

    if (selected === "hormuz") {
      var h = document.createElement("p");
      h.className = "prop__top";
      h.innerHTML = '<span>Ensemble weights</span><span class="prop__base" data-out="pool"></span>';
      ins.appendChild(h);
      var ul = document.createElement("ul");
      ul.className = "ens2";
      ENSEMBLE.forEach(function (m, i) {
        var li = document.createElement("li");
        var id = "w-" + m.id;
        li.innerHTML = '<label class="ens2__name" for="' + id + '">' + m.name + '</label><span class="ens2__p">' + m.p.toFixed(2) + '</span>' +
          '<input id="' + id + '" type="range" min="0" max="3" step="0.1" value="' + weights[i] + '">' +
          '<span class="ens2__w">weight ' + weights[i].toFixed(1) + "</span>";
        var input = li.querySelector("input"), wl = li.querySelector(".ens2__w");
        input.addEventListener("input", function () {
          weights[i] = +input.value;
          wl.textContent = "weight " + weights[i].toFixed(1) + (weights[i] === 0 ? ", excluded" : "");
          recompute();
        });
        ul.appendChild(li);
      });
      ins.appendChild(ul);
      DB.fillRanges(ins);
      return;
    }

    var props = NODE_PROPS[selected];
    if (props) {
      props.forEach(function (path) {
        var p = PROPS[path], id = "p-" + path.replace(/\./g, "-");
        var base = get(M.BASE, path);
        var wrap = document.createElement("div");
        wrap.className = "prop";
        wrap.innerHTML = '<label class="prop__top" for="' + id + '"><span>' + p.label + '</span><span class="prop__base">baseline ' + fmt(base, path) + " " + p.unit + "</span></label>" +
          '<input class="num-input" id="' + id + '" type="number" inputmode="decimal" min="' + p.min + '" max="' + p.max + '" step="' + p.step + '" value="' + fmt(get(params, path), path) + '">';
        var input = wrap.querySelector("input"), bl = wrap.querySelector(".prop__base");
        function sync() {
          var changed = Math.abs(get(params, path) - base) > 1e-9;
          input.classList.toggle("is-changed", changed);
          bl.classList.toggle("is-changed", changed);
        }
        input.addEventListener("input", function () {
          var v = parseFloat(input.value);
          if (isNaN(v)) return;
          set(params, path, DB.clamp(v, p.min, p.max));
          sync(); recompute();
        });
        sync();
        ins.appendChild(wrap);
      });
    }
    var facts = FACTS[selected];
    var ev = evaluate(params, weights), nd = ev.r.nodes[selected];
    if (nd) {
      facts = [
        [selected === "gebze" || selected === "pune" ? "Line stop if it closes" : "Days stocked out", Math.round(nd.stop) + " d"],
        ["Loss if it closes", DB.money(nd.loss)],
        ["Expected (× p)", DB.money(nd.loss * ev.p)]
      ];
    }
    if (facts) {
      var dl = document.createElement("dl");
      dl.className = "facts";
      dl.setAttribute("data-facts", "");
      facts.forEach(function (f) { dl.innerHTML += "<div><dt>" + f[0] + "</dt><dd>" + f[1] + "</dd></div>"; });
      ins.appendChild(dl);
    }
  }

  function select(id) {
    selected = id;
    renderInspector();
    drawGraph(evaluate(params, weights));
  }
  document.querySelectorAll("[data-select]").forEach(function (b) {
    b.addEventListener("click", function () { select(b.getAttribute("data-select")); });
  });

  /* ---------- Diff, code, log ---------- */
  var diffEl = document.getElementById("diff");
  var codeEl = document.getElementById("code");
  var logEl = document.getElementById("log");

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  function renderDiff(ch) {
    diffEl.textContent = "";
    if (!ch.length) {
      diffEl.innerHTML = '<li class="empty">Nothing changed. Edit a node in the inspector, or reweight the ensemble on Hormuz.</li>';
      return;
    }
    ch.forEach(function (c) {
      // effect of this change alone
      var P = M.clone(M.BASE), w = ENSEMBLE.map(function () { return 1; });
      if (c.w != null) w[c.w] = c.to; else set(P, c.path, c.to);
      var d = evaluate(P, w).el - BASE_EVAL.el;
      var li = document.createElement("li");
      li.innerHTML = '<span class="diff__k">' + esc(c.sdk) + '</span><span class="diff__v"><s>' + fmt(c.from, c.path) + "</s>" + fmt(c.to, c.path) + "</span>" +
        '<span class="diff__fx">on its own: expected loss ' + (d >= 0 ? "+" : "−") + DB.money(Math.abs(d)) + "</span>";
      diffEl.appendChild(li);
    });
  }

  function renderCode(ch, ev) {
    var L = [];
    L.push('<span class="k">from</span> daybreak <span class="k">import</span> World');
    L.push("");
    L.push('w = World.load(<span class="s">"halvorsen/v14.2"</span>)');
    ch.forEach(function (c) {
      var lhs = c.w != null ? "w." + c.sdk : 'w.set(<span class="s">"' + c.sdk + '"</span>, ';
      var line = c.w != null
        ? '<span class="hl">' + lhs + ' = <span class="n">' + fmt(c.to, c.path) + '</span>   <span class="c"># was ' + fmt(c.from, c.path) + "</span></span>"
        : '<span class="hl">' + lhs + '<span class="n">' + fmt(c.to, c.path) + '</span>)   <span class="c"># was ' + fmt(c.from, c.path) + "</span></span>";
      L.push(line);
    });
    if (!ch.length) L.push('<span class="c"># no overrides: production parameters</span>');
    L.push("");
    L.push('r = w.run(<span class="s">"hormuz_closure_7d"</span>, horizon=<span class="s">"30d"</span>, n=<span class="n">10_000</span>)');
    L.push('r.p_event        <span class="c"># ' + ev.p.toFixed(3) + "</span>");
    L.push('r.loss_if_event  <span class="c"># ' + DB.money(ev.cl) + "</span>");
    L.push('r.expected_loss  <span class="c"># ' + DB.money(ev.el) + "  (baseline " + DB.money(BASE_EVAL.el) + ")</span>");
    L.push('r.exposure(by=<span class="s">"po"</span>).head(<span class="n">20</span>)');
    codeEl.innerHTML = L.join("\n");
  }

  function stamp() {
    var d = new Date();
    return [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (n) { return String(n).padStart(2, "0"); }).join(":");
  }
  function log(html) {
    var li = document.createElement("li");
    li.innerHTML = "<time>" + stamp() + "</time><span>" + html + "</span>";
    logEl.insertBefore(li, logEl.firstChild);
    while (logEl.children.length > 30) logEl.removeChild(logEl.lastChild);
  }

  function delta(el, now, base, fmtFn, unitDown) {
    var d = now - base;
    el.classList.remove("up", "down");
    if (Math.abs(d) < 1e-6) { el.textContent = "Baseline"; return; }
    el.classList.add(d > 0 ? "up" : "down");
    el.textContent = (d > 0 ? "▲ " : "▼ ") + fmtFn(Math.abs(d)) + " vs baseline";
  }

  var logTimer;
  function recompute() {
    var ev = evaluate(params, weights);
    var ch = changes();
    $("p").textContent = (ev.p * 100).toFixed(1) + "%";
    $("cl").textContent = DB.money(ev.cl);
    $("el").textContent = DB.money(ev.el);
    delta($("pd"), ev.p, BASE_EVAL.p, function (v) { return (v * 100).toFixed(1) + " pts"; });
    delta($("cld"), ev.cl, BASE_EVAL.cl, DB.money);
    delta($("eld"), ev.el, BASE_EVAL.el, DB.money);
    var pool = document.querySelector('[data-out="pool"]');
    if (pool) pool.textContent = "pooled " + ev.p.toFixed(3);
    var c = $("changes");
    c.textContent = ch.length ? ch.length + " unsaved change" + (ch.length > 1 ? "s" : "") : "No changes";
    c.classList.toggle("is-dirty", ch.length > 0);
    drawGraph(ev);
    var facts = ins.querySelector("[data-facts]");
    if (facts && ev.r.nodes[selected]) {
      var nd = ev.r.nodes[selected], dds = facts.querySelectorAll("dd");
      dds[0].textContent = Math.round(nd.stop) + " d";
      dds[1].textContent = DB.money(nd.loss);
      dds[2].textContent = DB.money(nd.loss * ev.p);
    }
    renderDiff(ch);
    renderCode(ch, ev);
    clearTimeout(logTimer);
    logTimer = setTimeout(function () {
      log("Re-ran 10,000 futures: <b>" + DB.money(ev.el) + "</b> expected" + (ch.length ? ", " + ch.length + " override" + (ch.length > 1 ? "s" : "") : ""));
    }, 500);
  }

  document.getElementById("reset").addEventListener("click", function () {
    params = M.clone(M.BASE);
    weights = ENSEMBLE.map(function () { return 1; });
    renderInspector();
    recompute();
    log("Reset to production parameters");
  });
  document.getElementById("commit").addEventListener("click", function () {
    var n = changes().length;
    if (!n) { DB.toast("Nothing to commit yet. Change a parameter first."); return; }
    log("<b>Committed</b> scenario halvorsen/v14.2+" + n);
    DB.toast("Committed as a scenario with " + n + " override" + (n > 1 ? "s" : "") + ". It's now selectable in the wargame.");
  });
  document.getElementById("copy").addEventListener("click", function () {
    var text = codeEl.textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { DB.toast("Copied."); }, function () { DB.toast("Couldn't reach the clipboard."); });
  });

  log("Loaded <b>halvorsen/v14.2</b>: 14 nodes, 38 lanes");
  log("AIS: 22 Halvorsen vessels tracked, 3 inside the strait");
  log("Gebze MES: 2 fields unmapped (line_rate_v2, shift_code)");
  renderInspector();
  recompute();
})();
