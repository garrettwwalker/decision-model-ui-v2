/* "Ask the model": a scripted chat over the scenario model (mockup, no live assistant).
   Questions are matched to a few intents; every number is computed from model.js using
   the world and response currently set in the sandbox. */
(function () {
  var M = DBModel, W = window.DBWar;
  var log = document.getElementById("chat-log");
  var form = document.getElementById("chat-form");
  var input = document.getElementById("chat-input");
  var suggest = document.getElementById("chat-suggest");
  if (!log || !W) return;

  var SUGGESTIONS = [
    "How long can our plants keep running?",
    "What if Hormuz stays closed for 45 days?",
    "What if the Red Sea closes too?",
    "What's the best way to cut our losses?",
    "Why do you think 27%?",
    "Will there be a coup in Tehran this month?"
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

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  // "closed for 21 days, with the Red Sea shut too"
  function world(inp) {
    var t = { open: "open", harass: "under harassment", partial: "partly closed", closed: "closed" }[inp.status];
    if (inp.status !== "open") t += " for " + days(inp.dur);
    if (inp.redsea) t += ", with the Red Sea shut too";
    return t;
  }
  function response(inp) {
    var m = W.movesText(inp);
    return /^no response/i.test(m) ? "with no response in place" : "with your current response (" + m.toLowerCase() + ")";
  }
  function days(n) { n = Math.round(n); return n + (n === 1 ? " day" : " days"); }
  function scrollLog() { log.scrollTop = log.scrollHeight; }

  /* ---------- Rendering ---------- */
  function userSays(text) {
    var li = el("li", "chat__msg chat__msg--user");
    li.appendChild(el("p", null, text));
    log.appendChild(li);
    scrollLog();
  }
  // a: { text: [..], facts: [[label, value, cls]], route: "...", action: { label, inp } }
  function modelSays(a) {
    var li = el("li", "chat__msg chat__msg--model");
    li.appendChild(el("span", "chat__who", "Daybreak"));
    (a.text || []).forEach(function (t) { li.appendChild(el("p", null, t)); });
    if (a.facts && a.facts.length) {
      var dl = el("dl", "chat__facts");
      a.facts.forEach(function (f) {
        var row = el("div", f[2] ? "is-" + f[2] : null);
        row.appendChild(el("dt", null, f[0]));
        row.appendChild(el("dd", null, f[1]));
        dl.appendChild(row);
      });
      li.appendChild(dl);
    }
    if (a.route) li.appendChild(el("p", "chat__route", a.route));
    if (a.action) {
      var b = el("button", "btn btn--light btn--sm chat__apply", a.action.label);
      b.type = "button";
      b.addEventListener("click", function () {
        W.write(a.action.inp);
        W.update(true);
        DB.toast("Applied to the sandbox. Results above are updated.");
        document.querySelector(".war").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      li.appendChild(b);
    }
    log.appendChild(li);
    scrollLog();
  }
  function think(then) {
    var li = el("li", "chat__msg chat__msg--model chat__typing");
    li.setAttribute("aria-label", "Daybreak is answering");
    li.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(li);
    scrollLog();
    setTimeout(function () { li.remove(); then(); }, 550 + Math.random() * 450);
  }

  /* ---------- Intents ---------- */
  function lossFacts(r) {
    return [
      ["Loss if this happens", DB.money(r.loss), "loss"],
      ["Plants and DCs", DB.money(r.parts.plants + r.parts.dcs)],
      ["Freight, cover and trapped cargo", DB.money(r.parts.war + r.parts.trapped)]
    ];
  }

  function capacity(q) {
    var inp = W.read(), r = M.run(inp);
    var only = Object.keys(NODES).filter(function (k) { return q.indexOf(k) > -1; });
    var ids = only.length ? only : Object.keys(NODES);
    var rows = ids.map(function (id) { return { id: id, n: r.nodes[id], meta: NODES[id] }; })
      .sort(function (a, b) { return a.n.cover - b.n.cover; });
    var first = rows[0];
    var text = [];
    if (r.D <= 0) {
      text.push("In the world you've set the strait stays open, so nothing runs short. Here's how much cover each site holds today:");
    } else {
      text.push("With the strait " + world(inp) + ", " + first.meta.name + " runs out of " + first.meta.what + " first, on day " + Math.round(first.n.cover) + ".");
      var stopped = rows.filter(function (x) { return x.n.stop > 0.5; });
      text.push(stopped.length
        ? stopped.length + " of " + rows.length + " sites go short before supply comes back, " + response(inp) + "."
        : "Every site has enough cover to ride it out with your current response.");
    }
    var facts = rows.map(function (x) {
      var v = days(x.n.cover) + " of cover";
      if (r.D > 0) v += x.n.stop > 0.5 ? ", then " + days(x.n.stop) + (x.meta.kind === "plant" ? " stopped" : " short") : ", holds";
      return [x.meta.name, v, x.n.stop > 0.5 ? "loss" : "safe"];
    });
    return {
      text: text, facts: facts,
      route: "Answered from your network model: stock cover, line rates and lead times. No forecast was needed, so no engine was called."
    };
  }

  function whatIf(q) {
    var cur = W.read(), next = M.clone(cur);
    var m = q.match(/(\d+)\s*(day|d\b|week|wk)/);
    if (m) next.dur = Math.max(1, Math.min(90, +m[1] * (/^w/.test(m[2]) ? 7 : 1)));
    if (/red sea|suez|bab/.test(q)) next.redsea = true;
    if (/partial/.test(q)) next.status = "partial";
    else if (/harass/.test(q)) next.status = "harass";
    else if (/clos|shut|block/.test(q) || m) next.status = "closed";
    var a = M.run(cur), b = M.run(next);
    var nb = M.run(W.noResponse(next));
    var d = b.loss - a.loss;
    var text = ["If the strait is " + world(next) + ", the loss comes to " + DB.money(b.loss) + ", " +
      (Math.abs(d) < 0.05 ? "about the same as the world you've set." : (d > 0 ? "up " : "down ") + DB.money(Math.abs(d)) + " from the world you've set.")];
    if (next.redsea && next.bridge) text.push("With Suez lost too, the Singapore resin has to go round the Cape, so the bridge-buy reaches Gebze too late to keep the line running.");
    if (b.cost > 0) text.push("Your current response still saves " + DB.money(nb.loss - b.loss) + " against doing nothing.");
    else text.push("That's with no response in place. Ask me for the best way to cut the loss.");
    var worst = Object.keys(NODES).map(function (k) { return [k, b.nodes[k]]; }).sort(function (x, y) { return y[1].loss - x[1].loss; })[0];
    return {
      text: text,
      facts: lossFacts(b).concat([["Hit hardest", NODES[worst[0]].name + ", " + DB.money(worst[1].loss), "loss"]]),
      route: "Answered by running your scenario through the network model. The sandbox's 10,000-future spread will show the range once you apply it.",
      action: { label: "Apply to the sandbox", inp: next }
    };
  }

  function bestMoves() {
    var cur = W.read(), base = M.run(cur);
    var opts = [];
    Object.keys(ACTIONS).forEach(function (k) {
      if (cur[k]) return;
      var t = M.clone(cur); t[k] = true;
      var r = M.run(t);
      opts.push({ k: k, label: ACTIONS[k], saves: base.loss - r.loss, cost: r.cost - base.cost, inp: t });
    });
    var t7 = M.clone(cur); t7.buffer = Math.min(21, (cur.buffer || 0) + 7);
    var r7 = M.run(t7);
    opts.push({ k: "buffer", label: "add 7 days of safety stock", saves: base.loss - r7.loss, cost: r7.cost - base.cost, inp: t7 });
    opts.forEach(function (o) { o.net = o.saves - o.cost; });
    opts.sort(function (a, b) { return b.net - a.net; });
    if (!opts.length || opts[0].net <= 0.05) {
      return { text: ["Nothing left on the menu saves more than it costs in this world. Your current response already covers the big exposures."], route: "Answered by testing each remaining move in the network model." };
    }
    var top = opts[0];
    return {
      text: ["In this world, the best next move is to " + top.label + ". It costs " + DB.money(top.cost, 2) + " and cuts the loss by " + DB.money(top.saves) + "."],
      facts: opts.map(function (o) { return [sentence(o.label), "saves " + DB.money(o.saves) + " for " + DB.money(o.cost, 2), o.net > 0 ? "safe" : null]; }),
      route: "Answered by testing each move you haven't made yet in the network model, ranked by money saved after cost.",
      action: { label: "Apply the top move", inp: top.inp }
    };
  }

  function probability(q) {
    if (/red sea|suez|bab/.test(q)) {
      return {
        text: ["We give a Red Sea closure a 34% chance in the next 30 days. That's a separate question from Hormuz, and it matters most for Gebze, whose resin and EU lanes run through Suez."],
        facts: [["Red Sea closure, 30 days", "34%", "loss"]],
        route: "Answered from this morning's forecast run. Turn on \"Red Sea also closed\" in the sandbox to see what it does to your network."
      };
    }
    return {
      text: ["27% that the Strait of Hormuz closes to commercial traffic for 7+ days in the next 30. I split the question into three parts, sent each to the engine built for it, and fused the answers:"],
      facts: [
        ["Judgment: will the standoff escalate to a blockade?", "33%"],
        ["Telemetry: will transits fall below 40% of normal?", "26%"],
        ["Procedure: will underwriters list the whole strait?", "22%"],
        ["Declined: a sudden strike or coup in Tehran", "no skill"],
        ["Fused and calibrated", "27% ±5", "loss"]
      ],
      route: "It rose from 9% on 1 September, mostly on three boardings in ten days and the collapse of sanctions talks. See the brief for every driver."
    };
  }

  function decline() {
    return {
      text: ["I won't put a number on that. Sudden ruptures like a coup or a surprise strike are outside what any of my engines can forecast at this horizon, and a guess would look more certain than it is.",
        "What I can do is tell you what it would cost. Ask me \"what if the strait closes for 60 days?\" and I'll run it through your network."],
      route: "The router classed this as a rupture event with no skill at a 30-day horizon, so it declined instead of answering."
    };
  }

  function exposure() {
    var inp = W.read(), r = M.run(inp), p = M.STATUS[inp.status].p;
    var text = ["With the strait " + world(inp) + ", you'd lose " + DB.money(r.loss) + ", " + response(inp) + "."];
    if (p) text.push("Weighted by the " + Math.round(p * 100) + "% chance of that world, the expected loss is " + DB.money(r.loss * p) + ".");
    return { text: text, facts: lossFacts(r), route: "Answered from the network model with your current sandbox settings." };
  }

  function fallback() {
    return {
      text: ["I can answer three kinds of questions here: how long your plants and DCs can hold, what a different closure would cost you, and which move saves the most. I can also explain a forecast, or tell you when something can't be forecast. Try one of these:"],
      route: null
    };
  }

  function sentence(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  function answer(raw) {
    var q = raw.toLowerCase();
    if (/coup|assassin|tomorrow|exact(ly)? (date|day)|which day|surprise strike|sudden strike|nuclear|regime (fall|collapse)/.test(q)) return decline();
    if (/\d+\s*(day|d\b|week|wk)|what if|what happens if|suppose|scenario/.test(q)) return whatIf(q);
    if (/(red sea|suez)/.test(q) && /(close|shut|too|also|both)/.test(q) && !/(chance|likely|probab|odds)/.test(q)) return whatIf(q);
    if (/chance|likely|probab|odds|forecast|why .*27|why do you think|how sure|confiden/.test(q)) return probability(q);
    if (/best|should we|recommend|cut (our )?loss|reduce|protect|mitigat|which (move|action)|what can we do/.test(q)) return bestMoves();
    if (/how long|last|run out|runs out|capacity|cover|hold|keep running|stock|inventory|plant|gebze|pune|dubai|dammam/.test(q)) return capacity(q);
    if (/expos|lose|loss|cost us|how much|impact/.test(q)) return exposure();
    return fallback();
  }

  function ask(text) {
    text = text.trim();
    if (!text) return;
    userSays(text);
    input.value = "";
    think(function () { modelSays(answer(text)); });
  }

  form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); });
  SUGGESTIONS.forEach(function (s) {
    var b = el("button", "chat__chip", s);
    b.type = "button";
    b.addEventListener("click", function () { ask(s); });
    suggest.appendChild(b);
  });

  modelSays({ text: ["Ask me about a risk, or about how long your network can hold. I'll answer with the world and response you've set in the sandbox above, and tell you when something can't be forecast."] });
})();
