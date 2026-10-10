/* Ask page: a scripted chat over the scenario model (mockup, no live assistant).
   Questions are matched to a few intents; every number is computed from model.js.
   The scenario being assumed is kept in sessionStorage, so it survives a trip to the workbench and back. */
(function () {
  var M = DBModel;
  var STORE = "daybreak.scenario";
  var page = document.querySelector(".ask");
  var log = document.getElementById("chat-log");
  var form = document.getElementById("chat-form");
  var input = document.getElementById("composer-input");
  var starters = document.getElementById("starters");
  if (!log) return;

  var STARTERS = [
    ["Capacity", "How long can our plants keep running?"],
    ["What if", "What if Hormuz stays closed for 45 days?"],
    ["Best move", "What's the best way to cut our losses?"],
    ["Forecast", "Why do you think 27%?"],
    ["What if", "What if the Red Sea closes too?"],
    ["Limits", "Will there be a coup in Tehran this month?"]
  ];
  var NODES = {
    gebze: { name: "Gebze plant", kind: "plant", what: "resin" },
    pune: { name: "Pune plant", kind: "plant", what: "resin" },
    dubai: { name: "Dubai DC", kind: "dc", what: "stock" },
    dammam: { name: "Dammam DC", kind: "dc", what: "stock" }
  };
  var ACTIONS = {
    bridge: "bridge-buy resin from Singapore",
    divert: "divert sailings to Khor Fakkan",
    cover: "bind war-risk cover and hedge bunker"
  };

  /* ---------- The scenario being assumed ---------- */
  var ctx, source;
  function load() {
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(STORE) || "null"); } catch (e) {}
    var fromWar = saved && M.STATUS[saved.status] && JSON.stringify(saved) !== JSON.stringify(M.DEFAULTS);
    ctx = fromWar ? saved : M.clone(M.DEFAULTS);
    source = fromWar ? "Your settings from earlier in this session." : "This morning's scenario.";
  }
  function save() { try { sessionStorage.setItem(STORE, JSON.stringify(ctx)); } catch (e) {} }

  function days(n) { n = Math.round(n); return n + (n === 1 ? " day" : " days"); }
  function sentence(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function world(inp) { // "closed for 21 days, with the Red Sea shut too"
    var t = { open: "open", harass: "under harassment", partial: "partly closed", closed: "closed" }[inp.status];
    if (inp.status !== "open") t += " for " + days(inp.dur);
    if (inp.redsea) t += ", with the Red Sea shut too";
    return t;
  }
  function moves(inp) {
    var m = [];
    if (inp.bridge) m.push("resin bridge-buy");
    if (inp.divert) m.push("Khor Fakkan diversion");
    if (inp.cover) m.push("war-risk cover and hedge");
    if (inp.buffer) m.push(inp.buffer + " extra days of stock");
    return m;
  }
  function response(inp) {
    var m = moves(inp);
    return m.length ? "with your current response (" + m.join(", ") + ")" : "with no response in place";
  }
  function noResponse(inp) { var b = M.clone(inp); b.divert = b.bridge = b.cover = false; b.buffer = 0; return b; }

  function renderCtx(changed) {
    var set = function (k, v) {
      var d = document.querySelector('[data-ctx="' + k + '"]');
      if (!d) return;
      if (changed && d.textContent !== v) {
        d.classList.remove("is-changed"); void d.offsetWidth; d.classList.add("is-changed");
      }
      d.textContent = v;
    };
    var st = { open: "Open", harass: "Harassment", partial: "Partly closed", closed: "Closed" }[ctx.status];
    set("world", ctx.status === "open" ? st : st + " for " + days(ctx.dur));
    set("redsea", ctx.redsea ? "Closed too" : "Open");
    var m = moves(ctx);
    set("moves", m.length ? sentence(m.join(", ")) : "None yet");
    var p = M.STATUS[ctx.status].p;
    set("p", p ? Math.round(p * 100) + "% in 30 days" : "Baseline");
    set("source", source);
  }
  function adopt(next, why) {
    ctx = next; source = why; save(); renderCtx(true);
  }

  /* ---------- Rendering ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function toBottom() {
    var f = form.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + f.bottom - window.innerHeight + 40, behavior: "smooth" });
  }
  function userSays(text) {
    page.classList.add("is-talking");
    var li = el("li", "msg msg--user");
    li.appendChild(el("p", null, text));
    log.appendChild(li);
  }
  // a: { text, facts: [[label, value, tone]], route, actions: [{label, run} | {label, href}], followups: [] }
  function modelSays(a) {
    var li = el("li", "msg msg--model");
    li.setAttribute("aria-label", "Daybreak");
    (a.text || []).forEach(function (t) { li.appendChild(el("p", null, t)); });
    if (a.facts && a.facts.length) {
      var dl = el("dl", "msg__facts");
      a.facts.forEach(function (f) {
        var row = el("div", f[2] ? "is-" + f[2] : null);
        row.appendChild(el("dt", null, f[0]));
        row.appendChild(el("dd", null, f[1]));
        dl.appendChild(row);
      });
      li.appendChild(dl);
    }
    if (a.route) li.appendChild(el("p", "msg__route", a.route));
    if (a.actions && a.actions.length) {
      var box = el("div", "msg__actions");
      a.actions.forEach(function (x, i) {
        var b;
        if (x.href) {
          b = el("a", "btn btn--sm " + (i ? "btn--ghost" : "btn--light"), x.label);
          b.href = x.href;
          b.addEventListener("click", save);
        } else {
          b = el("button", "btn btn--sm " + (i ? "btn--ghost" : "btn--light"), x.label);
          b.type = "button";
          b.addEventListener("click", function () { x.run(); b.disabled = true; b.textContent = x.done || "Done"; });
        }
        box.appendChild(b);
      });
      li.appendChild(box);
    }
    if (a.followups && a.followups.length) {
      var fu = el("div", "msg__followups");
      a.followups.forEach(function (q) {
        var b = el("button", "followup", q);
        b.type = "button";
        b.addEventListener("click", function () { ask(q); });
        fu.appendChild(b);
      });
      li.appendChild(fu);
    }
    log.appendChild(li);
  }
  function think(then) {
    var li = el("li", "typing");
    li.setAttribute("aria-label", "Daybreak is answering");
    li.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(li);
    toBottom();
    setTimeout(function () { li.remove(); then(); toBottom(); }, 600 + Math.random() * 500);
  }
  var OPEN_WAR = { label: "Explore in the workbench", href: "workbench.html" };

  /* ---------- Intents ---------- */
  function lossFacts(r) {
    return [
      ["Loss if this happens", DB.money(r.loss), "loss"],
      ["Plants and DCs", DB.money(r.parts.plants + r.parts.dcs)],
      ["Freight, cover and trapped cargo", DB.money(r.parts.war + r.parts.trapped)]
    ];
  }

  function capacity(q) {
    var r = M.run(ctx);
    var only = Object.keys(NODES).filter(function (k) { return q.indexOf(k) > -1; });
    var rows = (only.length ? only : Object.keys(NODES))
      .map(function (id) { return { id: id, n: r.nodes[id], meta: NODES[id] }; })
      .sort(function (a, b) { return a.n.cover - b.n.cover; });
    var first = rows[0], text = [];
    if (r.D <= 0) {
      text.push("With the strait open, nothing runs short. Here's how much cover each site holds today.");
    } else {
      text.push("With the strait " + world(ctx) + ", " + first.meta.name + " runs out of " + first.meta.what + " first, on day " + Math.round(first.n.cover) + ".");
      var short = rows.filter(function (x) { return x.n.stop > 0.5; });
      text.push(short.length
        ? (short.length === rows.length ? (rows.length === 1 ? "It goes" : "All of them go") : short.length + " of " + rows.length + " go") + " short before supply comes back, " + response(ctx) + "."
        : "Every site has enough cover to ride it out, " + response(ctx) + ".");
    }
    return {
      text: text,
      facts: rows.map(function (x) {
        var v = days(x.n.cover) + " of cover";
        if (r.D > 0) v += x.n.stop > 0.5 ? ", then " + days(x.n.stop) + (x.meta.kind === "plant" ? " stopped" : " short") : ", holds";
        return [x.meta.name, v, x.n.stop > 0.5 ? "loss" : "safe"];
      }),
      route: "Worked out from your network model: stock cover, line rates and lead times. No forecast was needed.",
      followups: ["What's the best way to cut our losses?", "What if it closes for 45 days?"]
    };
  }

  function whatIf(q) {
    var next = M.clone(ctx);
    var m = q.match(/(\d+)\s*(day|d\b|week|wk)/);
    if (m) next.dur = Math.max(1, Math.min(90, +m[1] * (/^w/.test(m[2]) ? 7 : 1)));
    if (/red sea|suez|bab/.test(q)) next.redsea = !/reopen|open again|stays open/.test(q);
    if (/partial/.test(q)) next.status = "partial";
    else if (/harass/.test(q)) next.status = "harass";
    else if (/reopen|stays open/.test(q) && !/red sea/.test(q)) next.status = "open";
    else if (/clos|shut|block/.test(q) || m) next.status = "closed";
    var a = M.run(ctx), b = M.run(next), nb = M.run(noResponse(next));
    var d = b.loss - a.loss;
    var text = ["If the strait is " + world(next) + ", the loss comes to " + DB.money(b.loss) + ", " +
      (Math.abs(d) < 0.05 ? "about the same as before." : (d > 0 ? "up " : "down ") + DB.money(Math.abs(d)) + " from what we were assuming.")];
    if (next.redsea && next.bridge) text.push("With Suez lost too, the Singapore resin has to go round the Cape, so the bridge-buy reaches Gebze too late to keep the line running.");
    text.push(b.cost > 0
      ? "Your current response still saves " + DB.money(nb.loss - b.loss) + " against doing nothing. I'll keep assuming this world for your next questions."
      : "That's with no response in place. I'll keep assuming this world for your next questions.");
    var worst = Object.keys(NODES).map(function (k) { return [k, b.nodes[k]]; }).sort(function (x, y) { return y[1].loss - x[1].loss; })[0];
    adopt(next, "From your last question.");
    return {
      text: text,
      facts: lossFacts(b).concat([["Hit hardest", NODES[worst[0]].name + ", " + DB.money(worst[1].loss), "loss"]]),
      route: "Worked out by running this world through your network model. The workbench shows the full spread of outcomes.",
      actions: [OPEN_WAR],
      followups: ["How long can our plants keep running?", "What's the best way to cut our losses?"]
    };
  }

  function bestMoves() {
    var base = M.run(ctx), opts = [];
    Object.keys(ACTIONS).forEach(function (k) {
      if (ctx[k]) return;
      var t = M.clone(ctx); t[k] = true;
      var r = M.run(t);
      opts.push({ label: ACTIONS[k], saves: base.loss - r.loss, cost: r.cost - base.cost, inp: t });
    });
    if ((ctx.buffer || 0) < 21) {
      var t7 = M.clone(ctx); t7.buffer = Math.min(21, (ctx.buffer || 0) + 7);
      var r7 = M.run(t7);
      opts.push({ label: "add 7 days of safety stock", saves: base.loss - r7.loss, cost: r7.cost - base.cost, inp: t7 });
    }
    opts.forEach(function (o) { o.net = o.saves - o.cost; });
    opts.sort(function (a, b) { return b.net - a.net; });
    if (!opts.length || opts[0].net <= 0.05) {
      return { text: ["Nothing left on the menu saves more than it costs in this world. Your current response already covers the big exposures."],
        route: "Worked out by testing each remaining move in your network model.", actions: [OPEN_WAR] };
    }
    var top = opts[0];
    return {
      text: ["The best next move is to " + top.label + ". It costs " + DB.money(top.cost, 2) + " and cuts the loss by " + DB.money(top.saves) + "."],
      facts: opts.map(function (o) { return [sentence(o.label), "saves " + DB.money(o.saves) + " for " + DB.money(o.cost, 2), o.net > 0 ? "safe" : null]; }),
      route: "Worked out by testing each move you haven't made yet, ranked by money saved after cost.",
      actions: [
        { label: "Add it to my response", done: "Added", run: function () { adopt(top.inp, "With the move you added."); } },
        OPEN_WAR
      ],
      followups: ["What's the next best move?", "How long can our plants keep running?"]
    };
  }

  function probability(q) {
    if (/red sea|suez|bab/.test(q)) {
      return {
        text: ["We give a Red Sea closure a 34% chance in the next 30 days. It's a separate question from Hormuz, and it matters most for Gebze, whose resin and EU lanes run through Suez."],
        facts: [["Red Sea closure in 30 days", "34%", "loss"]],
        route: "From this morning's forecast run.",
        followups: ["What if the Red Sea closes too?"]
      };
    }
    return {
      text: ["27% that the Strait of Hormuz closes to commercial traffic for 7+ days in the next 30. I split the question into three parts, sent each to the engine built for it, and fused the answers."],
      facts: [
        ["Judgment: will the standoff escalate to a blockade?", "33%"],
        ["Telemetry: will transits fall below 40% of normal?", "26%"],
        ["Procedure: will underwriters list the whole strait?", "22%"],
        ["Declined: a sudden strike or coup in Tehran", "no skill"],
        ["Fused and calibrated", "27% ±5", "loss"]
      ],
      route: "It rose from 9% on 1 September, mostly on three boardings in ten days and the collapse of sanctions talks. The brief lists every driver.",
      actions: [{ label: "Read the brief", href: "briefing.html#why-title" }],
      followups: ["What would change your mind?", "How much would a closure cost us?"]
    };
  }

  function signposts() {
    return {
      text: ["Four things would move the number most:"],
      facts: [
        ["A naval exercise in the shipping lanes, or a second tanker seized", "up to ~45%", "loss"],
        ["Underwriters suspend cover for Gulf calls", "up to ~35%", "loss"],
        ["The Muscat talks set a date for round two", "down to ~15%", "safe"],
        ["Ten quiet days and AIS traffic recovers", "down to ~10%", "safe"]
      ],
      route: "Daybreak watches for each of these and re-runs the engines when one fires."
    };
  }

  function decline() {
    return {
      text: ["I won't put a number on that. Sudden ruptures like a coup or a surprise strike are beyond what any of my engines can forecast at this horizon, and a guess would look more certain than it is.",
        "What I can do is tell you what it would cost. Ask what happens if the strait closes for 60 days and I'll run it through your network."],
      route: "Classed as a rupture event with no skill at a 30-day horizon, so it was declined rather than answered.",
      followups: ["What if the strait closes for 60 days?"]
    };
  }

  function exposure() {
    var r = M.run(ctx), p = M.STATUS[ctx.status].p;
    var text = ["With the strait " + world(ctx) + ", you'd lose " + DB.money(r.loss) + ", " + response(ctx) + "."];
    if (p) text.push("Weighted by the " + Math.round(p * 100) + "% chance of that world, the expected loss is " + DB.money(r.loss * p) + ".");
    return { text: text, facts: lossFacts(r), route: "Worked out from your network model.", actions: [OPEN_WAR],
      followups: ["What's the best way to cut our losses?"] };
  }

  function fallback() {
    return {
      text: ["I can tell you how long your plants and DCs can hold, what a different closure would cost, and which move saves the most. I can also explain a forecast, or tell you when something can't be forecast."],
      followups: STARTERS.slice(0, 3).map(function (s) { return s[1]; })
    };
  }

  function answer(raw) {
    var q = raw.toLowerCase();
    if (/coup|assassin|tomorrow|exact(ly)? (date|day)|which day|surprise strike|sudden strike|nuclear|regime (fall|collapse)/.test(q)) return decline();
    if (/change your mind|signpost|what would move|what to watch/.test(q)) return signposts();
    if (/\d+\s*(day|d\b|week|wk)|what if|what happens if|suppose|reopen/.test(q)) return whatIf(q);
    if (/(red sea|suez)/.test(q) && /(close|shut|too|also|both)/.test(q) && !/(chance|likely|probab|odds)/.test(q)) return whatIf(q);
    if (/chance|likely|probab|odds|forecast|27|why do you think|how sure|confiden/.test(q)) return probability(q);
    if (/best|next.*move|should we|recommend|cut (our )?loss|reduce|protect|mitigat|which (move|action)|what can we do/.test(q)) return bestMoves();
    if (/how long|last|run out|runs out|capacity|cover|hold|keep running|stock|inventory|plant|gebze|pune|dubai|dammam/.test(q)) return capacity(q);
    if (/expos|lose|loss|cost us|how much|impact/.test(q)) return exposure();
    return fallback();
  }

  /* ---------- Question options: how often it runs, what counts as yes, and what extra data it reads ---------- */
  var CADENCE = [["once", "Once"], ["hourly", "Hourly"], ["daily", "Daily"], ["weekly", "Weekly"], ["signal", "When a signal moves"]];
  var NEXT_RUN = { hourly: "08:00 GST", daily: "tomorrow, 06:00 GST", weekly: "Tue 13 Oct, 06:00 GST", signal: "when AIS, broker or price feeds move" };
  var UNTIL = { resolves: "until it resolves", "2w": "for 2 weeks", "1m": "for a month", never: "until you stop it" };
  var SOURCES = [["sap", "SAP S/4HANA", "POs and BOMs", true], ["ais", "AIS stream", "Vessel positions", true], ["broker", "War-risk broker feed", "Gulf quotes", true], ["kinaxis", "Kinaxis RapidResponse", "Supply plan", false], ["workday", "Workday", "Teams and availability", false]];
  var opts;
  function freshOpts() { return { cadence: "once", until: "resolves", notify: "change", criteria: "", by: "2026-11-05", source: "", files: [], sources: { sap: true, ais: true, broker: true } }; }
  opts = freshOpts();
  var qopts = document.getElementById("qopts"), qbtn = document.getElementById("qopts-btn"), qchips = document.getElementById("qchips");
  var cadBox = document.getElementById("q-cadence"), cadMore = document.getElementById("q-cadence-more");
  var fCrit = document.getElementById("q-criteria"), fBy = document.getElementById("q-by"), fSrc = document.getElementById("q-source");
  var fUntil = document.getElementById("q-until"), fNotify = document.getElementById("q-notify"), fileBox = document.getElementById("q-files"), srcBox = document.getElementById("q-sources");
  function dateText(iso) { var d = new Date(iso + "T00:00:00"); return isNaN(d) ? iso : d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]; }
  function changes() {
    var n = [];
    if (opts.cadence !== "once") n.push(CADENCE.filter(function (c) { return c[0] === opts.cadence; })[0][1]);
    if (opts.criteria.trim()) n.push("Resolves by " + dateText(opts.by));
    if (opts.files.length) n.push(opts.files.length === 1 ? opts.files[0] : opts.files.length + " files");
    var def = { sap: true, ais: true, broker: true }, diff = SOURCES.filter(function (x) { return !!opts.sources[x[0]] !== !!def[x[0]]; }).length;
    if (diff) n.push(SOURCES.filter(function (x) { return opts.sources[x[0]]; }).length + " sources");
    return n;
  }
  function renderOpts() {
    cadBox.textContent = "";
    CADENCE.forEach(function (c) {
      var b = el("button", "qseg__opt" + (opts.cadence === c[0] ? " is-on" : ""), c[1]);
      b.type = "button"; b.setAttribute("role", "radio"); b.setAttribute("aria-checked", String(opts.cadence === c[0]));
      b.addEventListener("click", function () { opts.cadence = c[0]; renderOpts(); });
      cadBox.appendChild(b);
    });
    cadMore.hidden = opts.cadence === "once";
    fileBox.textContent = "";
    opts.files.forEach(function (f, i) {
      var c = el("span", "qfile"); c.appendChild(el("span", null, f));
      var x = el("button", "qfile__x", "×"); x.type = "button"; x.setAttribute("aria-label", "Remove " + f);
      x.addEventListener("click", function () { opts.files.splice(i, 1); renderOpts(); });
      c.appendChild(x); fileBox.appendChild(c);
    });
    srcBox.textContent = "";
    SOURCES.forEach(function (x) {
      var lab = el("label", "qsrc" + (opts.sources[x[0]] ? " is-on" : ""));
      var cb = el("input"); cb.type = "checkbox"; cb.checked = !!opts.sources[x[0]];
      cb.addEventListener("change", function () { opts.sources[x[0]] = cb.checked; renderOpts(); });
      lab.appendChild(cb); var t = el("span"); t.appendChild(el("b", null, x[1])); t.appendChild(el("small", null, x[2])); lab.appendChild(t);
      srcBox.appendChild(lab);
    });
    var n = changes(), badge = document.getElementById("qopts-n");
    badge.hidden = !n.length; badge.textContent = n.length;
    qchips.textContent = "";
    n.forEach(function (t) { var b = el("button", "qchip", t); b.type = "button"; b.addEventListener("click", function () { setOpts(true); }); qchips.appendChild(b); });
    qchips.hidden = !n.length || !qopts.hidden;
  }
  function setOpts(open) {
    qopts.hidden = !open; qbtn.setAttribute("aria-expanded", String(open));
    renderOpts();
    if (open) qopts.querySelector(".qseg__opt.is-on").focus();
  }
  qbtn.addEventListener("click", function () { setOpts(qopts.hidden); });
  document.getElementById("qopts-close").addEventListener("click", function () { setOpts(false); qbtn.focus(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !qopts.hidden) { setOpts(false); qbtn.focus(); } });
  fCrit.addEventListener("input", function () { opts.criteria = fCrit.value; renderOpts(); });
  fBy.addEventListener("change", function () { opts.by = fBy.value; renderOpts(); });
  fSrc.addEventListener("input", function () { opts.source = fSrc.value; });
  fUntil.addEventListener("change", function () { opts.until = fUntil.value; });
  fNotify.addEventListener("change", function () { opts.notify = fNotify.value; });
  document.getElementById("q-file").addEventListener("change", function (e) {
    [].forEach.call(e.target.files, function (f) { if (opts.files.indexOf(f.name) < 0) opts.files.push(f.name); });
    e.target.value = ""; renderOpts();
  });
  // a measurable yes/no wording for whatever's in the box
  document.getElementById("q-suggest").addEventListener("click", function () {
    var q = input.value.toLowerCase(), c, src;
    if (/red sea|suez|bab/.test(q)) { c = "Resolves yes if Bab el-Mandeb transits stay below half of normal for 7 days in a row."; src = "AIS transit counts"; }
    else if (/strike|gebze|union/.test(q)) { c = "Resolves yes if the metalworkers' federation files a legal strike notice at Gebze."; src = "Union filings, Turkish labour ministry"; }
    else if (/bunker|fuel|price/.test(q)) { c = "Resolves yes if Fujairah VLSFO closes above $790 a tonne for 10 trading days."; src = "Platts Fujairah assessment"; }
    else if (/pune|gebze|plant|run out|cover|stock/.test(q)) { c = "Resolves yes if any Halvorsen plant stops a line for lack of resin."; src = "Plant MES line status"; }
    else { c = "Resolves yes if daily transits through the Strait of Hormuz fall below 40% of normal for 3 days in a row."; src = "AIS transit counts"; }
    fCrit.value = opts.criteria = c; fSrc.value = opts.source = src; renderOpts(); fCrit.focus();
  });

  // recurring questions live in the sidebar until removed
  var standing = [], standBox = document.getElementById("standing"), standList = document.getElementById("standing-list");
  function renderStanding() {
    standBox.hidden = !standing.length; standList.textContent = "";
    standing.forEach(function (q, i) {
      var li = el("li", "standing__q" + (q.paused ? " is-paused" : ""));
      li.appendChild(el("b", null, q.text));
      li.appendChild(el("span", null, q.paused ? "Paused" : CADENCE.filter(function (c) { return c[0] === q.cadence; })[0][1] + ". Next run " + NEXT_RUN[q.cadence] + "."));
      var acts = el("div", "standing__acts");
      var pz = el("button", "qlink", q.paused ? "Resume" : "Pause"); pz.type = "button";
      pz.addEventListener("click", function () { q.paused = !q.paused; renderStanding(); });
      var rm = el("button", "qlink", "Remove"); rm.type = "button";
      rm.addEventListener("click", function () { standing.splice(i, 1); renderStanding(); DB.toast("Stopped running that question."); });
      acts.appendChild(pz); acts.appendChild(rm); li.appendChild(acts);
      standList.appendChild(li);
    });
  }
  // the card Daybreak adds to its reply when a question carries options
  function trackingCard(o, tags) {
    var rows = [];
    if (o.cadence !== "once") rows.push(["Runs", CADENCE.filter(function (c) { return c[0] === o.cadence; })[0][1] + ", " + UNTIL[o.until] + ". Next: " + NEXT_RUN[o.cadence] + (o.notify === "change" ? ". You'll hear when the answer moves 5 points or more." : ". You'll get every run.")]);
    if (o.criteria.trim()) rows.push(["Resolves yes if", o.criteria.trim().replace(/^resolves yes if\s*/i, "").replace(/^\w/, function (m) { return m.toUpperCase(); }) + " Deadline " + dateText(o.by) + (o.source.trim() ? ", checked against " + o.source.trim() : "") + "."]);
    var src = SOURCES.filter(function (x) { return o.sources[x[0]]; }).map(function (x) { return x[1]; });
    if (o.files.length || tags.some(function (c) { return /sources$/.test(c); })) rows.push(["Reads", o.files.concat(src).join(", ")]);
    if (!rows.length) return null;
    var card = el("div", "track");
    card.appendChild(el("p", "track__title", o.cadence !== "once" ? "Standing question" : "Your settings for this question"));
    var dl = el("dl", "track__rows");
    rows.forEach(function (r) { var d = el("div"); d.appendChild(el("dt", null, r[0])); d.appendChild(el("dd", null, r[1])); dl.appendChild(d); });
    card.appendChild(dl);
    if (o.files.length) card.appendChild(el("p", "track__note", plural(o.files.length) + " read alongside the model. They nudge this answer only; the brief and the workbench don't change."));
    return card;
  }
  function plural(n) { return n === 1 ? "1 document" : n + " documents"; }

  var busy = false;
  function ask(text) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    var o = opts, tags = changes();
    userSays(text);
    if (tags.length) { var tg = el("div", "msg__tags"); tags.forEach(function (t) { tg.appendChild(el("span", null, t)); }); log.lastChild.appendChild(tg); }
    input.value = "";
    opts = freshOpts(); fCrit.value = ""; fSrc.value = ""; fBy.value = opts.by; fUntil.value = "resolves"; fNotify.value = "change"; setOpts(false);
    think(function () {
      modelSays(answer(text));
      var card = trackingCard(o, tags);
      if (card) log.lastChild.insertBefore(card, log.lastChild.querySelector(".msg__actions, .msg__followups"));
      if (o.cadence !== "once") { standing.push({ text: text, cadence: o.cadence }); renderStanding(); }
      busy = false; input.focus({ preventScroll: true });
    });
  }
  renderOpts();

  form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); });
  STARTERS.forEach(function (s) {
    var b = el("button", "starter");
    b.type = "button";
    b.appendChild(el("span", "starter__kind", s[0]));
    b.appendChild(el("span", "starter__q", s[1]));
    b.addEventListener("click", function () { ask(s[1]); });
    starters.appendChild(b);
  });
  document.querySelector("[data-open-war]").addEventListener("click", save);
  document.getElementById("ctx-reset").addEventListener("click", function () {
    adopt(M.clone(M.DEFAULTS), "This morning's scenario.");
    DB.toast("Back to this morning's scenario.");
  });

  load();
  renderCtx(false);
})();
