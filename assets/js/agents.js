/* Agents: Penumbra as the brain, a team's agents as the edge. Information agents sense; the Totality engine weighs
   what they find, retasks them toward what would most change the decision, and rewrites the briefs of the workflow
   agents that act (here, a resin negotiation, bookings, cover and customer letters). Manual by default: every change
   waits in the queue. In automatic mode, small reversible changes under the user's limit go through on their own.
   The morning follows the daily brief: Tuesday 6 October, Hormuz at 27% at 06:00. Money is in $M; illustrative. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var REDUCE = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  var money = function (m) { return DB.money(m, 1); };

  /* ---------- the agents ---------- */
  var SENSE = [
    { id: "traffic", name: "Strait traffic", what: "AIS transits through Hormuz", every: "hourly",
      brief: "Count daily transits against the 90-day normal; flag turn-backs at the entrance.",
      last: "Transits at 61% of normal; three tankers turned back", added: "+5 pts to the forecast", auto: true },
    { id: "notices", name: "War-risk notices", what: "Underwriters' listed areas and broker circulars", every: "every 15 minutes",
      brief: "Watch for any extension of the listed area to the whole strait. Retasked at 06:45: three more brokers, every 15 minutes.",
      last: "Draft listing the whole strait from Thursday", added: "+3 pts to the forecast", auto: true },
    { id: "ports", name: "Port agents' inboxes", what: "Berth lists from Jebel Ali and Khor Fakkan", every: "twice a day",
      brief: "Ask Jebel Ali agents about Thursday calls; confirm open berth space at Khor Fakkan.",
      last: "Two carriers cancel Thursday calls at Jebel Ali", added: "Firmed up the booking case", auto: true },
    { id: "wire", name: "Diplomatic wire", what: "Muscat talks and naval statements", every: "hourly",
      brief: "Watch for a date for a second round of talks, or an exercise announced in the shipping lanes.",
      last: "Nothing new since the talks collapsed on 29 Sep", added: "No change this morning", auto: true },
    { id: "supply", name: "Resin suppliers", what: "Producer notices from Jubail and Mesaieed", every: "daily",
      brief: "Watch for force-majeure notices or allocation cuts on polymer grades Gebze and Pune use.",
      last: "No notices yet", added: "Proposed: watch hourly", auto: true },
    { id: "rates", name: "Freight and fuel", what: "Spot rates and Fujairah bunker", every: "hourly",
      brief: "Track Gulf spot rates and Fujairah VLSFO until the cover and hedge are bound.",
      last: "Bunker up 4% since Monday", added: "Repriced the hedge", auto: true }
  ];
  var ACT = [
    { id: "buyer", name: "Resin buyer", what: "Negotiating the 7,000 t bridge-buy from Singapore", owner: "VP Procurement",
      brief: "Brief v2: up to $1,240/t, split the order, ask for a force-majeure carve-out.",
      last: "Counter-offer: 4,000 t at $1,215/t by 20 Oct", added: "Protects up to $8.6M", auto: false },
    { id: "booking", name: "Booking agent", what: "Four sailings diverted to Khor Fakkan", owner: "VP Logistics",
      brief: "Hold four slots on option until the Thursday 14:00 cutoff.",
      last: "600 TEU of berth space still open", added: "Protects $7.6M once booked", auto: false },
    { id: "cover", name: "Cover broker", what: "War-risk cover and the Q4 bunker hedge", owner: "Treasury",
      brief: "Collect quotes for Gulf calls; hold the best one open.",
      last: "Best quote holds until Wednesday", added: "Protects $5.7M once bound", auto: false },
    { id: "letters", name: "Customer letters", what: "The five largest GCC accounts", owner: "Layla, GCC key accounts",
      brief: "Draft delay notices as bookings change; never send without Layla.",
      last: "Waiting on the Thursday calls", added: "Nothing sent", auto: true }
  ];
  var AGENTS = {}; SENSE.concat(ACT).forEach(function (a) { AGENTS[a.id] = a; });
  SENSE.forEach(function (a) { a.kind = "sense"; }); ACT.forEach(function (a) { a.kind = "act"; });

  /* ---------- the morning, one turn of the loop at a time ----------
     stage: sense (an agent reports in), weigh (Totality re-forecasts and values what's unknown), steer (it retasks
     information agents), act (it rewrites workflow agents' briefs). `go` lists [from, to] with "hub" for Totality. */
  var STEPS = [
    { t: "06:00", stage: "act", p: 27, go: [["hub", "buyer"], ["hub", "booking"], ["hub", "cover"], ["hub", "letters"]],
      title: "Model run", text: "Totality forecasts 27% and turns the brief's three decisions into each workflow agent's brief.", fx: "Brief v1" },
    { t: "06:42", stage: "sense", p: 30, go: [["traffic", "hub"]],
      title: "Strait traffic reports", text: "Transits fell to 61% of normal overnight, and three tankers turned back at the entrance.", fx: "Telemetry engine 26% to 31%; fused 27% to 30%" },
    { t: "06:44", stage: "weigh", p: 30, go: [],
      title: "What's worth knowing next", text: "Totality values each open question by how much it could change what you'd do. Whether underwriters list the whole strait is worth $1.9M of decision value; the diplomatic wire, $0.4M.", fx: "Points the agents at the listing" },
    { t: "06:45", stage: "steer", p: 30, go: [["hub", "notices"], ["hub", "ports"]],
      title: "Retasks two information agents", text: "War-risk notices now checked every 15 minutes across three more brokers; port agents asked about Thursday calls at Jebel Ali.", fx: "About $40 of compute; small and reversible" },
    { t: "07:30", stage: "sense", p: 33, go: [["notices", "hub"], ["ports", "hub"]],
      title: "Both report back", text: "Two brokers circulate a draft listing the whole strait from Thursday, and two carriers cancel Thursday calls at Jebel Ali.", fx: "Procedure engine 22% to 34%; fused 30% to 33%" },
    { t: "07:35", stage: "weigh", p: 33, go: [],
      title: "Re-runs the decisions", text: "At 33% the bridge-buy protects $14.3M, up from $11.7M, so paying more per tonne to close fast is worth it, and holding the Khor Fakkan slots on option is no longer enough.", fx: "Every decision gains value" },
    { t: "07:36", stage: "act", p: 33, go: [["hub", "buyer"], ["hub", "booking"], ["hub", "cover"]],
      title: "Rewrites three briefs", text: "The resin buyer may go to $1,240/t and split the order; the booking agent should firm up all four slots; the cover broker should bind before Thursday.", fx: "Brief v2; the big moves wait for you" },
    { t: "08:10", stage: "sense", p: 33, go: [["buyer", "hub"]],
      title: "The resin buyer reports", text: "The supplier counters: 4,000 t at $1,215/t delivered by 20 October, and the other 3,000 t at $1,260/t in November.", fx: "A workflow agent's result feeds the loop" },
    { t: "08:12", stage: "steer", p: 33, go: [["hub", "buyer"], ["hub", "supply"]],
      title: "Tightens the plan and the watch", text: "Take the 4,000 t now and keep the rest open below $1,260. Resin suppliers watched hourly: a force-majeure notice from Jubail would make the last 3,000 t urgent.", fx: "Brief v3 and a retask, waiting for you" }
  ];
  var STAGES = { sense: "Sense", weigh: "Weigh", steer: "Steer", act: "Act" };

  /* ---------- what's waiting now (08:20) ---------- */
  var QUEUE = [
    { id: "q-supply", kind: "Retask", agent: "supply", cost: 0.0024, rev: true,
      title: "Watch resin suppliers hourly, not daily",
      why: "A force-majeure notice from Jubail would make the last 3,000 t urgent. Hearing about it a day sooner is worth $0.6M of decision value.",
      diff: [["How often", "Daily", "Hourly"], ["Sources", "2 producers", "2 producers and 3 traders"]], costText: "$2,400 for a month of the traders' feed" },
    { id: "q-rates", kind: "Retask", agent: "rates", cost: 0.000015, rev: true,
      title: "Check Fujairah bunker every 30 minutes until the hedge is bound",
      why: "The hedge reprices daily, and a Thursday listing would move bunker first.",
      diff: [["How often", "Hourly", "Every 30 minutes"]], costText: "$15 of compute a day" },
    { id: "q-letters", kind: "Draft", agent: "letters", cost: 0, rev: true,
      title: "Draft delay letters to the five largest GCC accounts",
      why: "Two carriers cancelled Thursday calls at Jebel Ali. Layla's team can send them once the bookings are firm.",
      diff: [["Letters", "None", "5 drafts, not sent"]], costText: "No cost; nothing is sent" },
    { id: "q-buyer", kind: "Strategy", agent: "buyer", cost: 0.62, rev: false, edit: true,
      title: "Take 4,000 t at $1,215/t now; keep 3,000 t open below $1,260/t",
      why: "The counter-offer covers both plants through 20 October at less than brief v2 allowed. The last 3,000 t matter only if the strait closes for more than three weeks.",
      diff: [["Ceiling", "$1,240/t", "$1,215/t now, $1,260/t for the rest"], ["Volume now", "7,000 t", "4,000 t"], ["Delivery", "By 30 Oct", "4,000 t by 20 Oct"]], costText: "$0.62M premium, signs a contract" },
    { id: "q-booking", kind: "Strategy", agent: "booking", cost: 0.9, rev: false,
      title: "Firm up all four Khor Fakkan slots",
      why: "With carriers cancelling Thursday calls at Jebel Ali, the slots will go before the 14:00 cutoff. Booking now protects $7.6M at 27%, $9.3M at 33%.",
      diff: [["Slots", "4 on option", "4 booked"], ["Cutoff", "Thu 14:00", "Booked today"]], costText: "$0.90M, commits the bookings" },
    { id: "q-cover", kind: "Strategy", agent: "cover", cost: 1.36, rev: false,
      title: "Bind war-risk cover before Thursday's listing",
      why: "If the whole strait is listed on Thursday, today's quote is gone and premiums reprice upward.",
      diff: [["Quote", "Held open", "Bound"], ["Bunker hedge", "Quoted", "Placed at today's price"]], costText: "$1.36M, binds cover" }
  ];
  QUEUE.forEach(function (q) { q.state = "waiting"; });

  var S = { mode: "manual", limit: 0.01, step: 0, playing: false };
  var LIMITS = [[0.001, "$1k"], [0.01, "$10k"], [0.05, "$50k"]];
  var now = (function () { var m = 20; return function () { m += 1; return "08:" + (m < 10 ? "0" : "") + m; }; })();

  /* ---------- who acts ---------- */
  function small(q) { return q.rev && q.cost <= S.limit + 1e-12; }
  function autoOK(q) { return S.mode === "auto" && small(q) && AGENTS[q.agent].auto && !q.held; }
  function settle() {
    QUEUE.forEach(function (q) {
      // what went through stays done if you tighten the rules later; Undo puts it back in the queue
      if (q.state === "waiting" && autoOK(q)) { q.state = "auto"; q.when = now(); }
    });
  }
  var modeBtns = document.querySelectorAll("#mode [data-mode]");
  modeBtns.forEach(function (b) {
    b.addEventListener("click", function () { S.mode = b.dataset.mode; drawAll(); });
  });
  var limBox = $("mode-limit");
  LIMITS.forEach(function (l) {
    var b = el("button", { type: "button", role: "radio" }, l[1]);
    b.addEventListener("click", function () { S.limit = l[0]; drawAll(); });
    l.btn = b; limBox.appendChild(b);
  });
  function drawMode() {
    modeBtns.forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.mode === S.mode)); });
    LIMITS.forEach(function (l) { l.btn.setAttribute("aria-checked", String(l[0] === S.limit)); });
    $("mode-auto").hidden = S.mode !== "auto";
    var wait = QUEUE.filter(function (q) { return q.state === "waiting"; }).length, auto = QUEUE.filter(function (q) { return q.state === "auto"; }).length;
    $("mode-now").textContent = S.mode === "manual"
      ? (wait ? wait + (wait === 1 ? " change is" : " changes are") + " waiting for you." : "Nothing is waiting for you.")
      : auto + " small " + (auto === 1 ? "change" : "changes") + " went through on " + (auto === 1 ? "its" : "their") + " own; " + wait + " " + (wait === 1 ? "waits" : "wait") + " for you.";
  }

  /* ---------- the loop ---------- */
  var board = $("loop-board"), links = $("loop-links"), hubSvg = $("hub");
  function agentCard(a) {
    var c = el("div", { class: "lag", id: "lag-" + a.id });
    c.appendChild(el("b", null, a.name));
    c.appendChild(el("span", null, a.what));
    return c;
  }
  SENSE.forEach(function (a) { $("loop-sense").appendChild(agentCard(a)); });
  ACT.forEach(function (a) { $("loop-act").appendChild(agentCard(a)); });
  // the hub's ring in four arcs, one per stage: sense on the side of the information agents, act on the other
  (function () {
    var arcs = $("hub-arcs"), NS = "http://www.w3.org/2000/svg", R = 96;
    var at = { weigh: -90, act: 0, steer: 90, sense: 180 };
    Object.keys(at).forEach(function (k) {
      var a0 = (at[k] - 38) * Math.PI / 180, a1 = (at[k] + 38) * Math.PI / 180;
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", "M" + (120 + R * Math.cos(a0)).toFixed(1) + " " + (120 + R * Math.sin(a0)).toFixed(1) + " A" + R + " " + R + " 0 0 1 " + (120 + R * Math.cos(a1)).toFixed(1) + " " + (120 + R * Math.sin(a1)).toFixed(1));
      p.setAttribute("class", "hub__arc"); p.setAttribute("data-stage", k);
      arcs.appendChild(p);
      var t = document.createElementNS(NS, "text"), m = at[k] * Math.PI / 180, r2 = k === "weigh" || k === "steer" ? 112 : 104;
      t.setAttribute("x", (120 + r2 * Math.cos(m)).toFixed(1)); t.setAttribute("y", (120 + r2 * Math.sin(m) + (k === "weigh" ? -2 : k === "steer" ? 9 : 3)).toFixed(1));
      t.setAttribute("text-anchor", k === "sense" ? "end" : k === "act" ? "start" : "middle");
      t.setAttribute("class", "hub__stage"); t.setAttribute("data-stage", k);
      t.textContent = STAGES[k];
      arcs.appendChild(t);
    });
  })();

  var paths = {};
  function linkLoop() {
    var box = board.getBoundingClientRect();
    var stacked = getComputedStyle(board).gridTemplateColumns.split(" ").length < 3;
    links.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    links.innerHTML = ""; paths = {};
    if (stacked) return;
    // each link meets the hub just outside its ring, spread over the side it comes in on
    var hb = hubSvg.getBoundingClientRect(), k = hb.width / 240, cx = hb.left + hb.width / 2 - box.left, cy = hb.top + hb.height / 2 - box.top, r = 104 * k;
    var s = "";
    SENSE.concat(ACT).forEach(function (a) {
      var c = $("lag-" + a.id).getBoundingClientRect(), y = c.top + c.height / 2 - box.top, side = a.kind === "sense" ? -1 : 1;
      var hy = cy + Math.max(-0.6 * r, Math.min(0.6 * r, (y - cy) * 0.4)), hx = cx + side * Math.sqrt(r * r - (hy - cy) * (hy - cy));
      var ex = side < 0 ? c.right - box.left : c.left - box.left, mx = (ex + hx) / 2;
      var d = side < 0 ? "M" + ex + " " + y + "C" + mx + " " + y + " " + mx + " " + hy + " " + hx + " " + hy
                       : "M" + hx + " " + hy + "C" + mx + " " + hy + " " + mx + " " + y + " " + ex + " " + y;
      s += '<path id="lk-' + a.id + '" class="lk lk--' + a.kind + '" d="' + d + '"/>';
    });
    links.innerHTML = s + '<g id="packets"></g>';
    SENSE.concat(ACT).forEach(function (a) { paths[a.id] = $("lk-" + a.id); });
    lightLoop();
  }

  // packets: dots that run along the lit links, in the direction the information flows
  var raf = null, t0 = 0;
  function runPackets() {
    cancelAnimationFrame(raf);
    var g = $("packets"); if (!g) return;
    g.innerHTML = "";
    var st = STEPS[S.step];
    if (REDUCE || !st.go.length) return;
    var NS = "http://www.w3.org/2000/svg";
    var runs = st.go.map(function (e) {
      var id = e[0] === "hub" ? e[1] : e[0], p = paths[id]; if (!p) return null;
      // links are drawn from left to right: sense agents to the hub, the hub to act agents
      var fwd = AGENTS[id].kind === "sense" ? e[0] !== "hub" : e[0] === "hub";
      var dots = [0, 1, 2].map(function () { var c = document.createElementNS(NS, "circle"); c.setAttribute("r", "3.5"); c.setAttribute("class", "pk pk--" + st.stage); g.appendChild(c); return c; });
      return { p: p, len: p.getTotalLength(), fwd: fwd, dots: dots };
    }).filter(Boolean);
    t0 = performance.now();
    (function frame(now) {
      var u = (now - t0) / 1400;
      runs.forEach(function (r) {
        r.dots.forEach(function (d, i) {
          var f = (u + i / 3) % 1, at = r.p.getPointAtLength((r.fwd ? f : 1 - f) * r.len);
          d.setAttribute("cx", at.x.toFixed(1)); d.setAttribute("cy", at.y.toFixed(1));
          d.setAttribute("opacity", Math.sin(f * Math.PI).toFixed(2));
        });
      });
      raf = requestAnimationFrame(frame);
    })(t0);
  }
  function lightLoop() {
    var st = STEPS[S.step], on = {};
    st.go.forEach(function (e) { on[e[0] === "hub" ? e[1] : e[0]] = true; });
    SENSE.concat(ACT).forEach(function (a) {
      $("lag-" + a.id).classList.toggle("is-on", !!on[a.id]);
      if (paths[a.id]) paths[a.id].classList.toggle("is-on", !!on[a.id]);
    });
    hubSvg.querySelectorAll("[data-stage]").forEach(function (x) { x.classList.toggle("is-on", x.getAttribute("data-stage") === st.stage); });
    hubSvg.classList.toggle("is-weigh", st.stage === "weigh");
    runPackets();
  }
  var shownP = STEPS[0].p;
  function countTo(p) {
    var from = shownP, start = performance.now(), out = $("hub-p");
    shownP = p;
    if (REDUCE || from === p) { out.textContent = p + "%"; return; }
    (function f(n) {
      var k = Math.min(1, (n - start) / 600), e = 1 - Math.pow(1 - k, 3);
      out.textContent = Math.round(from + (p - from) * e) + "%";
      if (k < 1) requestAnimationFrame(f);
    })(start);
  }
  function drawNow() {
    var st = STEPS[S.step], box = $("loop-now");
    box.innerHTML = "";
    var head = el("p", { class: "now__head" });
    head.appendChild(el("span", { class: "now__t num" }, st.t));
    head.appendChild(el("span", { class: "now__stage now__stage--" + st.stage }, STAGES[st.stage]));
    head.appendChild(el("b", null, st.title));
    box.appendChild(head);
    box.appendChild(el("p", { class: "now__text" }, st.text));
    box.appendChild(el("p", { class: "now__fx" }, st.fx));
  }

  // the timeline: the forecast at each step, one marker per turn of the loop, the brief's versions beneath
  var chart = $("tl-chart");
  var X = function (i) { return 50 + i * (800 / (STEPS.length - 1)); }, Y = function (p) { return 96 - (p - 25) * 8; };
  function drawChart() {
    var s = "";
    [25, 30, 35].forEach(function (p) { s += '<line class="tl__grid" x1="30" x2="870" y1="' + Y(p) + '" y2="' + Y(p) + '"/><text class="tl__ax" x="24" y="' + (Y(p) + 4) + '" text-anchor="end">' + p + "%</text>"; });
    var d = "M" + X(0) + " " + Y(STEPS[0].p);
    STEPS.forEach(function (st, i) { if (i) d += " L" + X(i) + " " + Y(STEPS[i - 1].p) + " L" + X(i) + " " + Y(st.p); });
    s += '<path class="tl__line" d="' + d + '"/>';
    // versions of the resin buyer's brief
    [[0, 6, "brief v1"], [6, 8, "brief v2"], [8, 8, "v3"]].forEach(function (v) {
      var a = X(v[0]) - 14, b = v[1] === v[0] ? X(v[1]) + 26 : X(v[1]) - 18;
      s += '<line class="tl__ver" x1="' + a + '" x2="' + b + '" y1="140" y2="140"/><text class="tl__vt" x="' + a + '" y="132">' + v[2] + "</text>";
    });
    STEPS.forEach(function (st, i) {
      s += '<g class="tl__pt tl__pt--' + st.stage + (i === S.step ? " is-on" : "") + '" data-i="' + i + '" tabindex="0" role="button" aria-label="' + st.t + ", " + STAGES[st.stage] + ": " + st.title + '">' +
        '<circle class="tl__hit" cx="' + X(i) + '" cy="' + Y(st.p) + '" r="16"/><circle class="tl__dot" cx="' + X(i) + '" cy="' + Y(st.p) + '" r="' + (i === S.step ? 7 : 5) + '"/>' +
        '<text class="tl__t num" x="' + X(i) + '" y="' + (Y(st.p) - 14) + '" text-anchor="middle">' + st.t + "</text></g>";
    });
    chart.innerHTML = s;
  }
  chart.addEventListener("click", function (e) { var g = e.target.closest("[data-i]"); if (g) { stop(); go(+g.dataset.i); } });
  chart.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var g = e.target.closest("[data-i]"); if (g) { e.preventDefault(); stop(); go(+g.dataset.i); var n = chart.querySelector('[data-i="' + g.dataset.i + '"]'); if (n) n.focus(); }
  });
  function go(i) {
    S.step = Math.max(0, Math.min(STEPS.length - 1, i));
    countTo(STEPS[S.step].p); drawNow(); drawChart(); lightLoop();
    $("tl-prev").disabled = S.step === 0; $("tl-next").disabled = S.step === STEPS.length - 1;
  }
  var timer = null;
  function stop() { clearTimeout(timer); S.playing = false; $("tl-play").textContent = "Play"; $("tl-play").setAttribute("aria-label", "Play the morning"); }
  function play() {
    if (S.step === STEPS.length - 1) go(0);
    S.playing = true; $("tl-play").textContent = "Pause"; $("tl-play").setAttribute("aria-label", "Pause");
    (function tick() { timer = setTimeout(function () { if (S.step >= STEPS.length - 1) return stop(); go(S.step + 1); tick(); }, 3200); })();
  }
  $("tl-play").addEventListener("click", function () { if (S.playing) stop(); else play(); });
  $("tl-prev").addEventListener("click", function () { stop(); go(S.step - 1); });
  $("tl-next").addEventListener("click", function () { stop(); go(S.step + 1); });

  /* ---------- the queue ---------- */
  function qCard(q) {
    var a = AGENTS[q.agent], c = el("article", { class: "qc qc--" + q.kind.toLowerCase() + (small(q) ? " is-small" : ""), id: q.id });
    var top = el("p", { class: "qc__top" });
    top.appendChild(el("span", { class: "qc__kind" }, q.kind === "Strategy" ? "Strategy change" : q.kind));
    top.appendChild(el("span", { class: "qc__agent" }, a.name + (a.owner ? ", for " + a.owner : "")));
    c.appendChild(top);
    c.appendChild(el("h3", { class: "qc__title" }, q.title));
    c.appendChild(el("p", { class: "qc__why" }, q.why));
    var dl = el("dl", { class: "qc__diff" });
    dl.appendChild(el("dt", { class: "qc__h" }, "")); dl.appendChild(el("dd", { class: "qc__h" }, "Was")); dl.appendChild(el("dd", { class: "qc__h" }, "Now"));
    q.diff.forEach(function (r) { dl.appendChild(el("dt", null, r[0])); dl.appendChild(el("dd", { class: "qc__was" }, r[1])); dl.appendChild(el("dd", null, r[2])); });
    c.appendChild(dl);
    var foot = el("div", { class: "qc__foot" });
    foot.appendChild(el("p", { class: "qc__cost" + (q.rev ? "" : " is-big") }, q.costText + (q.rev ? "; can be undone" : "")));
    var btns = el("div", { class: "qc__btns" });
    var ok = el("button", { type: "button", class: "btn btn--primary btn--sm" }, q.rev ? "Approve" : "Sign off");
    ok.addEventListener("click", function () { decide(q, "approved"); });
    btns.appendChild(ok);
    if (q.edit) {
      var ed = el("button", { type: "button", class: "btn-q" }, "Edit the brief");
      ed.addEventListener("click", function () { $("st-title").scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" }); });
      btns.appendChild(ed);
    }
    var no = el("button", { type: "button", class: "btn-q" }, "Decline");
    no.addEventListener("click", function () { decide(q, "declined"); });
    btns.appendChild(no);
    foot.appendChild(btns);
    c.appendChild(foot);
    return c;
  }
  function decide(q, how) {
    q.state = how; q.when = now();
    if (q.id === "q-buyer" && how === "approved") { BRIEF.sent = BRIEF.cur = 2; Object.assign(form, VERS[2].v); AGENTS.buyer.brief = "Brief v3: take 4,000 t at $1,215/t; keep the rest open below $1,260/t."; }
    if (how === "approved") AGENTS[q.agent].added = q.kind === "Retask" ? "Retasked at " + q.when : AGENTS[q.agent].added;
    DB.toast(how === "approved" ? (q.rev ? "Approved: " : "Signed off: ") + q.title : "Declined: " + q.title);
    drawAll();
  }
  function drawQueue() {
    var box = $("queue"); box.innerHTML = "";
    var wait = QUEUE.filter(function (q) { return q.state === "waiting"; });
    // the big decisions first, then the small ones
    wait.sort(function (a, b) { return b.cost - a.cost; }).forEach(function (q) { box.appendChild(qCard(q)); });
    if (!wait.length) box.appendChild(el("p", { class: "queue__empty" }, "Nothing is waiting for you. The agents carry on with their current briefs."));
    var big = wait.filter(function (q) { return !small(q); }).length;
    $("q-note").textContent = wait.length
      ? (S.mode === "manual" ? "Manual: every change waits here, including retasking an information agent. " : "Automatic: changes under your limit that can be undone go through; ") +
        (big ? big + " of these sign or commit money, so they always need you." : "")
      : "All clear.";
    var done = QUEUE.filter(function (q) { return q.state !== "waiting"; }), list = $("done-list");
    $("done").hidden = !done.length; list.innerHTML = "";
    $("done").querySelector(".done__title").textContent = "Done";
    done.forEach(function (q) {
      var li = el("li", { class: "done__i is-" + q.state });
      li.appendChild(el("span", { class: "done__t num" }, q.when));
      li.appendChild(el("span", { class: "done__what" }, q.title));
      li.appendChild(el("span", { class: "done__how" }, q.state === "auto" ? "On its own, under your limit" : q.state === "approved" ? (q.rev ? "You approved" : "You signed off") : q.state === "replaced" ? "Replaced by your brief" : "You declined"));
      if (q.rev && q.state !== "declined") {
        var u = el("button", { type: "button", class: "btn-q btn-q--sm" }, "Undo");
        u.addEventListener("click", function () { q.state = "waiting"; q.held = true; DB.toast("Undone: " + q.title); drawAll(); });
        li.appendChild(u);
      }
      list.appendChild(li);
    });
  }

  /* ---------- steer the negotiation ---------- */
  var PH = 0.33, LOSS = 11.7 / 0.27, BASE_PRICE = 1060;  // Hormuz now; the loss the full 7,000 t avoids if it closes; the normal contract price
  var VERS = [
    { n: "v1", t: "06:00", why: "From the brief, at 27%", v: { ceil: 1180, vol: 7000, pri: "balanced", fm: false, dl: false, pay: false },
      text: "Up to $1,180/t for all 7,000 t, delivered by 30 October." },
    { n: "v2", t: "07:36", why: "The draft war-risk listing; 33%", v: { ceil: 1240, vol: 7000, pri: "fast", fm: true, dl: true, pay: false },
      text: "Up to $1,240/t; split the order to get the first lot by 20 October; ask for a force-majeure carve-out." },
    { n: "v3", t: "08:12", why: "The supplier's counter-offer", v: { ceil: 1215, vol: 4000, pri: "balanced", fm: true, dl: true, pay: false },
      text: "Take 4,000 t at $1,215/t by 20 October; keep the other 3,000 t open below $1,260/t." }
  ];
  var BRIEF = { cur: 2, sent: 1 };  // v3 is Totality's proposal; v2 is what the agent is working to until you sign off
  var form = Object.assign({}, VERS[2].v);
  function outcome(v) {
    var logit = 1.6 + (v.ceil - 1215) / 20 - (v.vol - 4000) / 1500 - (v.fm ? 0.5 : 0) - (v.pay ? 0.6 : 0) - (v.dl && v.vol > 4000 ? 0.8 : 0) + ({ price: -0.6, balanced: 0, fast: 0.5 })[v.pri];
    var deal = 1 / (1 + Math.exp(-logit));
    var cov = 1 - Math.pow(1 - v.vol / 7000, 1.6);
    var protect = deal * PH * LOSS * cov * (v.dl ? 1 : 0.8) * (v.fm ? 1.08 : 1);
    var prem = v.vol * Math.max(0, v.ceil - BASE_PRICE) / 1e6;
    return { deal: deal, protect: protect, prem: prem, net: protect - deal * prem };
  }
  var PICKS = [
    { key: "ceil", label: "Ceiling for this lot", step: 5, min: 1150, max: 1300, fmt: function (v) { return "$" + v.toLocaleString("en-US") + "/t"; },
      choices: [[1180, "Singapore spot"], [1215, "their offer"], [1260, "walk-away"]] },
    { key: "vol", label: "Volume to close now", step: 500, min: 1000, max: 7000, fmt: function (v) { return v.toLocaleString("en-US") + " t"; },
      choices: [[3000, "bare cover"], [4000, "to 20 Oct"], [7000, "all of it"]] },
    { key: "pri", label: "What the agent pushes for", choices: [["price", "pays less, slower"], ["balanced", "price and speed"], ["fast", "closes this week"]],
      fmt: function (v) { return { price: "Price", balanced: "Balance", fast: "Speed" }[v]; } }
  ];
  var MUST = [
    { key: "fm", text: "Force-majeure carve-out for a Gulf closure", sub: "The supplier can't walk away if the strait shuts" },
    { key: "dl", text: "First lot delivered by 20 October", sub: "Before both plants run out of cover" },
    { key: "pay", text: "60-day payment terms", sub: "Eases cash, but costs leverage" }
  ];
  function holdable(btn, fn) {
    var tm = null, n = 0, stopH = function () { clearTimeout(tm); tm = null; };
    btn.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || btn.disabled) return;
      e.preventDefault(); stopH(); if (!fn()) return; n = 0;
      var rep = function () { if (!fn()) return stopH(); n++; tm = setTimeout(rep, n < 6 ? 110 : n < 20 ? 60 : 30); };
      tm = setTimeout(rep, 380);
    });
    ["pointerup", "pointerleave", "pointercancel", "blur"].forEach(function (t) { btn.addEventListener(t, stopH); });
    btn.addEventListener("click", function (e) { if (e.detail === 0) fn(); });
  }
  var fieldSync = [];
  (function buildBrief() {
    var box = $("st-fields");
    PICKS.forEach(function (o) {
      var f = el("div", { class: "field" });
      var top = el("span", { class: "field__top" }, o.label); var tv = el("span", { class: "field__val" }); top.appendChild(tv); f.appendChild(top);
      var pick = el("div", { class: "pick" }), seg = el("div", { class: "pick__seg", role: "group", "aria-label": o.label });
      pick.appendChild(seg);
      var btns = o.choices.map(function (c) {
        var b = el("button", { type: "button", "aria-pressed": "false" });
        b.appendChild(el("b", null, o.fmt(c[0]))); b.appendChild(el("small", null, c[1]));
        b.addEventListener("click", function () { form[o.key] = c[0]; edited(); });
        seg.appendChild(b); return [c[0], b];
      });
      var less, more, out;
      if (o.step) {
        var nd = el("div", { class: "nudge", role: "group", "aria-label": o.label + ", in steps" });
        less = el("button", { type: "button", "aria-label": "Less" }, "−"); out = el("output"); more = el("button", { type: "button", "aria-label": "More" }, "+");
        nd.appendChild(less); nd.appendChild(out); nd.appendChild(more); pick.appendChild(nd);
        var by = function (d) { return function () { var v = form[o.key], n = Math.max(o.min, Math.min(o.max, v + d * o.step)); if (n === v) return false; form[o.key] = n; edited(); return true; }; };
        holdable(less, by(-1)); holdable(more, by(1));
      }
      f.appendChild(pick); box.appendChild(f);
      fieldSync.push(function () {
        var v = form[o.key], tz = VERS[BRIEF.cur].v[o.key];
        btns.forEach(function (x) { x[1].setAttribute("aria-pressed", String(x[0] === v)); });
        tv.textContent = v === tz ? "Totality's brief" : "your change";
        if (out) { out.textContent = o.fmt(v); less.disabled = v <= o.min; more.disabled = v >= o.max; }
      });
    });
    var mh = el("div", { class: "field" }); mh.appendChild(el("span", { class: "field__top" }, "Must-haves"));
    MUST.forEach(function (m) {
      var lab = el("label", { class: "switch must" });
      var tx = el("span", { class: "switch__text" }, m.text); tx.appendChild(el("small", null, m.sub)); lab.appendChild(tx);
      var cb = el("input", { type: "checkbox" }); lab.appendChild(cb); lab.appendChild(el("span", { class: "switch__ui", "aria-hidden": "true" }));
      cb.addEventListener("change", function () { form[m.key] = cb.checked; edited(); });
      mh.appendChild(lab);
      fieldSync.push(function () { cb.checked = !!form[m.key]; });
    });
    box.appendChild(mh);
  })();
  function same(a, b) { return Object.keys(a).every(function (k) { return a[k] === b[k]; }); }
  var shown = null;
  function drawKpis() {
    var o = outcome(form), base = outcome(VERS[BRIEF.cur].v), box = $("st-kpis");
    var rows = [
      ["Chance of a deal this week", Math.round(o.deal * 100) + "%", Math.round(base.deal * 100) + "%", o.deal - base.deal],
      ["Value protected, at 33%", money(o.protect), money(base.protect), o.protect - base.protect],
      ["Premium over contract, at most", money(o.prem), money(base.prem), base.prem - o.prem],
      ["Net, after the expected premium", money(o.net), money(base.net), o.net - base.net]
    ];
    if (!shown) {
      box.innerHTML = "";
      shown = rows.map(function (r) {
        var k = el("div", { class: "kpi" });
        k.appendChild(el("p", { class: "kpi__l" }, r[0]));
        var big = el("p", { class: "kpi__v num" }); k.appendChild(big);
        var cmp = el("p", { class: "kpi__c" }); k.appendChild(cmp);
        box.appendChild(k); return { big: big, cmp: cmp, k: k };
      });
    }
    var diff = !same(form, VERS[BRIEF.cur].v);
    rows.forEach(function (r, i) {
      shown[i].big.textContent = r[1];
      shown[i].cmp.textContent = diff ? "Totality's brief: " + r[2] : "Totality's brief";
      shown[i].k.classList.toggle("is-better", diff && r[3] > 0.005);
      shown[i].k.classList.toggle("is-worse", diff && r[3] < -0.005);
    });
  }
  function drawVers() {
    var ol = $("st-vers"); ol.innerHTML = "";
    VERS.forEach(function (v, i) {
      var li = el("li", { class: "ver" + (i === BRIEF.sent ? " is-live" : "") + (i > BRIEF.sent ? " is-pending" : "") });
      var h = el("p", { class: "ver__h" });
      h.appendChild(el("b", null, v.n)); h.appendChild(el("span", { class: "num" }, v.t));
      h.appendChild(el("span", { class: "ver__tag" }, i === BRIEF.sent ? "the agent is working to this" : i > BRIEF.sent ? "waiting for your sign-off" : "superseded"));
      li.appendChild(h);
      li.appendChild(el("p", { class: "ver__text" }, v.text));
      li.appendChild(el("p", { class: "ver__why" }, (v.mine ? "Your edit. " : "Why: ") + v.why));
      ol.appendChild(li);
    });
    var cur = VERS[BRIEF.sent];
    $("st-ver").textContent = "Working to " + cur.n + (BRIEF.cur > BRIEF.sent ? "; " + VERS[BRIEF.cur].n + " waits for you" : "");
  }
  function edited() { $("st-msg").textContent = ""; drawSteer(); }
  function drawSteer() {
    fieldSync.forEach(function (f) { f(); });
    var diff = !same(form, VERS[BRIEF.cur].v);
    $("st-reset").hidden = !diff;
    $("st-send").textContent = diff ? "Send your brief to the agent" : BRIEF.cur > BRIEF.sent ? "Sign off " + VERS[BRIEF.cur].n : "Sent";
    $("st-send").disabled = !diff && BRIEF.cur === BRIEF.sent;
    drawKpis(); drawVers();
  }
  $("st-reset").addEventListener("click", function () { form = Object.assign({}, VERS[BRIEF.cur].v); edited(); });
  $("st-send").addEventListener("click", function () {
    var q = QUEUE.filter(function (x) { return x.id === "q-buyer"; })[0];
    if (same(form, VERS[BRIEF.cur].v)) { decide(q, "approved"); $("st-msg").textContent = "Signed off. The resin buyer is working to " + VERS[BRIEF.sent].n + "."; return; }
    var t = now(), n = "v" + (VERS.length + 1);
    VERS.push({ n: n, t: t, why: "you changed " + Object.keys(form).filter(function (k) { return form[k] !== VERS[BRIEF.cur].v[k]; }).map(function (k) { return { ceil: "the ceiling", vol: "the volume", pri: "the priority", fm: "the carve-out", dl: "the delivery date", pay: "payment terms" }[k]; }).join(", ") + ".",
      v: Object.assign({}, form), mine: true,
      text: "Up to " + PICKS[0].fmt(form.ceil) + " for " + PICKS[1].fmt(form.vol) + ", pushing for " + { price: "the lowest price", balanced: "a balance of price and speed", fast: "a fast deal" }[form.pri] + "." });
    BRIEF.cur = BRIEF.sent = VERS.length - 1;
    AGENTS.buyer.brief = "Brief " + n + " (yours): " + VERS[BRIEF.sent].text;
    if (q.state === "waiting") { q.state = "replaced"; q.when = t; }
    $("st-msg").textContent = "Sent. The resin buyer is working to your " + n + "; Totality will flag it if the odds move.";
    DB.toast("Sent " + n + " to the resin buyer");
    drawAll();
  });

  /* ---------- the roster ---------- */
  function drawRoster() {
    var box = $("roster"); box.innerHTML = "";
    [["Information agents", "They sense: Totality points them at whatever would most change the decision.", SENSE], ["Workflow agents", "They act: Totality writes their briefs, and you sign off before they commit.", ACT]].forEach(function (grp) {
      var g = el("div", { class: "rgroup" });
      var h = el("div", { class: "rgroup__head" }); h.appendChild(el("h3", null, grp[0])); h.appendChild(el("p", null, grp[1])); g.appendChild(h);
      var grid = el("div", { class: "rgrid" });
      grp[2].forEach(function (a) {
        var waiting = QUEUE.some(function (q) { return q.agent === a.id && q.state === "waiting"; });
        var c = el("article", { class: "agent" });
        var top = el("div", { class: "agent__top" });
        var nm = el("div"); nm.appendChild(el("h4", null, a.name)); nm.appendChild(el("p", { class: "agent__what" }, a.what + (a.every ? ", " + a.every : "")));
        top.appendChild(nm);
        top.appendChild(el("span", { class: "agent__st" + (waiting ? " is-wait" : "") }, waiting ? "Waiting for you" : "Working"));
        c.appendChild(top);
        var dl = el("dl", { class: "agent__dl" });
        [["Brief", a.brief], ["Last", a.last], ["Added", a.added]].forEach(function (r) { dl.appendChild(el("dt", null, r[0])); dl.appendChild(el("dd", null, r[1])); });
        c.appendChild(dl);
        var sw = el("label", { class: "switch agent__auto" });
        var tx = el("span", { class: "switch__text" }, "Acts on its own");
        tx.appendChild(el("small", null, S.mode === "manual" ? "Off while you're in manual" : a.kind === "act" ? "Small, reversible steps only; never signs or sends" : "Within your " + LIMITS.filter(function (l) { return l[0] === S.limit; })[0][1] + " limit"));
        sw.appendChild(tx);
        var cb = el("input", { type: "checkbox" }); cb.checked = S.mode === "auto" && a.auto; cb.disabled = S.mode === "manual";
        cb.addEventListener("change", function () { a.auto = cb.checked; drawAll(); });
        sw.appendChild(cb); sw.appendChild(el("span", { class: "switch__ui", "aria-hidden": "true" }));
        c.appendChild(sw);
        grid.appendChild(c);
      });
      g.appendChild(grid); box.appendChild(g);
    });
  }

  function drawAll() { settle(); drawMode(); drawQueue(); drawSteer(); drawRoster(); }

  drawAll(); go(0);
  requestAnimationFrame(linkLoop);
  window.addEventListener("resize", function () { linkLoop(); });
  if (document.fonts) document.fonts.ready.then(linkLoop);
  // the replay starts by itself the first time the loop comes into view
  if (!REDUCE && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); setTimeout(function () { if (!S.playing && S.step === 0) play(); }, 900); } }, { threshold: 0.45 });
    io.observe($("loop"));
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) cancelAnimationFrame(raf); else runPackets(); });
})();
