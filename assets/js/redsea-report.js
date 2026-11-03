/* Red Sea demo, the report: the narrative figures and the plan lab. Everything is drawn from redsea.js.
   The lab holds one plan (a set of moves), a chance for the attacks and the day they'd start; changing any of them
   redraws the headline numbers, exposure by asset, Gebze's compressor stock, the risk curve, every possible plan,
   and the timeline in section 4. */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var RS = window.RS, M = RS.money;
  var f1 = function (v) { return v.toFixed(1); };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function dayLabel(d) { var x = new Date(Date.UTC(2026, 3, 1 + d)); return x.getUTCDate() + " " + MONTHS[x.getUTCMonth()]; }
  function weekday(d) { var x = new Date(Date.UTC(2026, 3, 1 + d)); return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][x.getUTCDay()] + " " + dayLabel(d); }
  // a move due on a weekend is ready the Monday after
  function ready(days) { var w = new Date(Date.UTC(2026, 3, 1 + days)).getUTCDay(); return days + (w === 6 ? 2 : w === 0 ? 1 : 0); }

  // ---------- bottom line ----------
  var C = RS.stats(RS.OPTIONS[2].plan);
  var K = { loss: M(RS.TOTAL.loss), bad: M(RS.TOTAL.bad), "c-cost": M(C.cost), "c-left": M(C.loss), "c-bad": M(C.bad) };
  document.querySelectorAll("[data-k]").forEach(function (el) { if (K[el.dataset.k]) el.textContent = K[el.dataset.k]; });

  // ---------- 1. the trend, with a readout under the pointer ----------
  (function () {
    var svg = $("#f-trend"), E = RS.byId.attacks, h = E.hist;
    var weeks = ["11 Feb", "18 Feb", "25 Feb", "4 Mar", "11 Mar", "18 Mar", "25 Mar", "1 Apr"];
    var X = function (i) { return 40 + i * 62; }, Y = function (v) { return 170 - v * 2.5; };
    var pts = h.map(function (v, i) { return X(i) + "," + Y(v); }).join(" ");
    var s = '<g class="ax">' + [0, 20, 40, 60].map(function (v) {
      return '<line x1="40" x2="500" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text x="32" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + (v === 60 ? "%" : "") + "</text>";
    }).join("") + weeks.map(function (w, i) { return i % 2 && i !== 7 ? "" : '<text x="' + X(i) + '" y="192" text-anchor="middle">' + w + "</text>"; }).join("") + "</g>";
    s += '<polygon class="area" points="' + X(0) + ",170 " + pts + " " + X(7) + ',170"/>';
    s += '<polyline class="line" points="' + pts + '"/>';
    s += '<circle class="dot dot--loss" cx="' + X(7) + '" cy="' + Y(46) + '" r="5"/>';
    s += '<text class="lab lab--loss" x="' + (X(7) - 10) + '" y="' + (Y(46) - 10) + '" text-anchor="end">46% today</text>';
    s += '<g class="hover" id="f-trend-h" style="display:none"><line y1="20" y2="170"/><circle r="4"/><text text-anchor="middle"></text></g>';
    s += '<rect x="20" y="10" width="500" height="170" fill="transparent" class="hit"/>';
    svg.innerHTML = s;
    var g = $("#f-trend-h");
    svg.addEventListener("pointermove", function (e) {
      var r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 520;
      var i = Math.max(0, Math.min(7, Math.round((x - 40) / 62)));
      g.style.display = "";
      g.querySelector("line").setAttribute("x1", X(i)); g.querySelector("line").setAttribute("x2", X(i));
      g.querySelector("circle").setAttribute("cx", X(i)); g.querySelector("circle").setAttribute("cy", Y(h[i]));
      var t = g.querySelector("text"); t.setAttribute("x", Math.min(470, Math.max(70, X(i)))); t.setAttribute("y", 14); t.textContent = weeks[i] + ": " + h[i] + "%";
    });
    svg.addEventListener("pointerleave", function () { g.style.display = "none"; });
  })();

  // what moved it: a tug of war in points
  (function () {
    var D = [[7, "Iranian missile parts bound for Yemen intercepted twice in March"],
             [5, "Houthi statements on 26 and 29 March name commercial shipping again"],
             [4, "Lloyd's insurers widened the Red Sea listed area on 24 March"],
             [-1, "Gaza truce talks restart on 7 April"]];
    var max = 8;
    $("#f-tug").innerHTML = D.map(function (d) {
      var w = Math.abs(d[0]) / max * 50;
      return '<div class="tug__row"><span class="tug__t">' + d[1] + '</span><span class="tug__track"><i class="' + (d[0] > 0 ? "up" : "down") +
        '" style="width:' + w + "%;" + (d[0] > 0 ? "left:50%" : "right:50%") + '"></i></span><b class="tug__v ' + (d[0] > 0 ? "up" : "down") + '">' +
        (d[0] > 0 ? "+" : "") + d[0] + "</b></div>";
    }).join("") + '<div class="tug__row tug__sum"><span class="tug__t">From 31% last week to 46% today</span><span class="tug__track tug__axis"><span>lowers it</span><span>raises it</span></span><b class="tug__v up">+15</b></div>';
  })();

  // ---------- 2. the lane map: Natural Earth land (redsea-map.js), lanes as sea waypoints in lon/lat ----------
  (function () {
    var MAP = { lon0: -22, lat0: 50, k: 1000 / 157 };
    var P = function (ll) { return [(ll[0] - MAP.lon0) * MAP.k, (MAP.lat0 - ll[1]) * MAP.k]; };
    var line = function (pts) {
      // a smooth curve through the waypoints (Catmull-Rom as cubic Béziers)
      var q = pts.map(P), d = "M" + q[0][0].toFixed(1) + " " + q[0][1].toFixed(1);
      for (var i = 0; i < q.length - 1; i++) {
        var p0 = q[i - 1] || q[i], p1 = q[i], p2 = q[i + 1], p3 = q[i + 2] || p2;
        d += "C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + " " +
          (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
      }
      return d;
    };
    var ASIA = [[129.04, 35.1], [128.2, 33.6], [124.5, 29.5], [121.6, 25.6], [120.0, 21.8], [116, 16], [110, 9], [105.5, 3.5], [103.6, 1.4],
      [101.2, 2.8], [98.2, 5.4], [94, 6.4], [86, 5.9], [81, 5.4], [76, 7.2], [66, 11], [56, 13.3], [50, 12.6], [45, 12.3], [43.4, 12.6]];
    var KAOH = [[120.28, 22.61], [119.2, 20.6], [116, 16]];
    var REDSEA = [[43.4, 12.6], [41.5, 14.6], [39.4, 17.8], [37.6, 21.2], [35.9, 24.3], [34.4, 26.8], [33.4, 28.3], [32.55, 29.95], [32.35, 31.3]];
    var MED = [[32.35, 31.3], [29.5, 32.6], [26.5, 34.1], [24.2, 35.1], [23.2, 36.4], [24.6, 37.6], [25.6, 39.3], [26.3, 40.05], [27.5, 40.6], [29.43, 40.8]];
    var CAPE = [[81, 5.4], [74, 0], [62, -12], [50, -26], [38, -33.5], [26, -35.6], [18.4, -35.2], [12.5, -29], [10, -18], [4, -6], [-6, 2.8],
      [-15.5, 9.5], [-19, 15.5], [-17.5, 24], [-13, 30.5], [-9.6, 35.2], [-5.6, 35.95], [0, 37.2], [8, 37.8], [11.6, 37.4], [15.5, 35.9], [20.5, 35.3], [24.2, 35.1]];
    var GULF = [[43.4, 12.6], [47, 12.4], [52, 13], [57.4, 17.5], [59.6, 21.8], [58.6, 24.2], [56.8, 26.4], [55, 26.4], [52.5, 26.7], [50.6, 26.8], [50.1, 26.43]];
    var PL = { busan: [129.04, 35.1], kaoh: [120.28, 22.61], gebze: [29.43, 40.8], jed: [39.17, 21.48], dam: [50.1, 26.43],
      bab: [43.4, 12.6], suez: [32.55, 30.0], cape: [18.47, -34.36], sing: [103.82, 1.3] };
    var s = '<rect class="sea" width="1000" height="573"/><path class="land" d="' + (window.RS_LAND || "") + '"/>';
    s += '<path class="rt rt--cape" d="' + line(CAPE) + '"/>';
    // outbound shares the inbound lane through the Med and the Red Sea, so it runs alongside, a little north and east
    var beside = function (pts) { return pts.map(function (q) { return [q[0] + 0.8, q[1] + 0.7]; }); };
    s += '<path class="rt rt--out" d="' + line(beside(MED.slice().reverse().concat(REDSEA.slice().reverse().slice(1, 5))).concat([PL.jed])) + '"/>';
    s += '<path class="rt rt--out" d="' + line(beside(REDSEA.slice(0, 5).reverse()).concat(GULF.slice(1))) + '"/>';
    s += '<path class="rt rt--risk" d="' + line(ASIA.concat(REDSEA.slice(1), MED.slice(1))) + '"/><path class="rt rt--risk" d="' + line(KAOH) + '"/>';
    var dot = function (k, cls) { var q = P(PL[k]); return '<circle class="' + (cls || "node") + '" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="4.5"/>'; };
    var ring = function (k, r, late) { var q = P(PL[k]); return '<circle class="choke' + (late ? " choke--late" : "") + '" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="' + r + '"/><circle class="choke__c" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="4"/>'; };
    var text = function (k, t, dx, dy, anchor, cls) { var q = P(PL[k]); return '<text class="' + (cls || "pl") + '" x="' + (q[0] + dx).toFixed(1) + '" y="' + (q[1] + dy).toFixed(1) + '" text-anchor="' + (anchor || "start") + '">' + t + "</text>"; };
    s += ring("bab", 15) + ring("suez", 12, true);
    ["busan", "kaoh", "gebze", "jed", "dam"].forEach(function (k) { s += dot(k); });
    s += text("busan", "Busan", -9, -6, "end") + text("kaoh", "Kaohsiung", 9, 4) + text("gebze", "Gebze plant", 0, -11, "middle", "pl pl--b") +
      text("jed", "Jeddah", -9, 4, "end") + text("dam", "Dammam", 8, -6);
    s += text("bab", "Bab el-Mandeb", 16, 16, "start", "pl pl--b") + text("bab", "attacks 46%", 16, 31, "start", "pl pl--risk");
    s += text("suez", "Suez Canal", -16, -2, "end", "pl pl--b") + text("suez", "pilots' strike 9%", -16, 13, "end", "pl pl--risk");
    s += text("cape", "Cape of Good Hope", 16, 0, "start", "pl pl--b") + text("cape", "about 42 days to Gebze, 12 more", 16, 15, "start", "pl pl--mute");
    s += text("sing", "about 30 days to Gebze through the Red Sea", 0, 34, "middle", "pl pl--mute");
    s += '<text class="ocean" x="' + P([75, -18])[0] + '" y="' + P([75, -18])[1] + '" text-anchor="middle">Indian Ocean</text>';
    s += '<text class="ocean" x="' + P([-12, -12])[0] + '" y="' + P([-12, -12])[1] + '" text-anchor="middle">Atlantic</text>';
    s += '<g class="legend" transform="translate(735 470)"><rect x="-14" y="-18" width="262" height="86" rx="10"/>' +
      '<line x1="0" x2="26" y1="0" y2="0" class="rt rt--risk"/><text x="36" y="4">parts in, through the Red Sea</text>' +
      '<line x1="0" x2="26" y1="22" y2="22" class="rt rt--cape"/><text x="36" y="26">the way round, if it closes</text>' +
      '<line x1="0" x2="26" y1="44" y2="44" class="rt rt--out"/><text x="36" y="48">finished goods out to the Gulf</text></g>';
    $("#f-route").innerHTML = s;
  })();

  // the loss table
  (function () {
    var max = Math.max.apply(null, RS.ASSETS.map(function (a) { return a.loss; }));
    $("#f-table tbody").innerHTML = RS.ASSETS.slice().sort(function (a, b) { return b.loss - a.loss; }).map(function (a) {
      return '<tr><th scope="row">' + a.name + "<span>" + a.short + '</span></th><td class="n loss">' + M(a.loss) + '</td><td class="n">' + M(a.bad) +
        '</td><td class="tbl__bar"><span><i style="width:' + (a.loss / max * 100).toFixed(1) + '%"></i></span></td></tr>';
    }).join("");
    var foot = document.createElement("tfoot");
    foot.innerHTML = '<tr><th scope="row">Total</th><td class="n loss">' + M(RS.TOTAL.loss) + '</td><td class="n">' + M(RS.TOTAL.bad) + "</td><td></td></tr>";
    $("#f-table").appendChild(foot);
  })();

  // ---------- 3. the plan lab ----------
  var S = { plan: RS.OPTIONS[2].plan.slice(), p: 46, t: 32 };
  var has = function (id) { return S.plan.indexOf(id) >= 0; };
  var same = function (a, b) { return a.length === b.length && a.every(function (x) { return b.indexOf(x) >= 0; }); };
  var ORDER = RS.ALL;

  $("#l-presets").innerHTML = RS.OPTIONS.map(function (o) {
    return '<button type="button" class="preset" data-o="' + o.id + '"><b>' + o.id + "</b><span>" + o.name + "</span>" + (o.pick ? '<em>Recommended</em>' : "") + "</button>";
  }).join("");
  $("#l-moves").insertAdjacentHTML("beforeend", RS.TEAMS.map(function (t) {
    return '<label class="mv"><span class="mv__body"><span class="mv__name">' + t.name + '</span><span class="mv__what">' + t.move +
      '</span><span class="mv__meta"><span class="num">' + M(t.cost) + "</span> ready " + weekday(ready(t.days)) +
      '</span></span><input type="checkbox" class="tgl" value="' + t.id + '"></label>';
  }).join(""));

  // ---------- motion: every lab figure moves from what it shows to the new figures ----------
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  var TW = {};
  // tween(key, target, draw): animates a list of numbers from the values on screen to `target`, drawing each frame
  function tween(key, target, draw) {
    var tw = TW[key] || (TW[key] = { cur: target.slice(), raf: 0 });
    var from = tw.cur.length === target.length ? tw.cur.slice() : target.slice();
    cancelAnimationFrame(tw.raf);
    if (REDUCE) { tw.cur = target.slice(); draw(tw.cur); return; }
    var t0 = performance.now();
    (function step(now) {
      var k = ease(Math.min(1, (now - t0) / 600));
      tw.cur = from.map(function (v, i) { return v + (target[i] - v) * k; });
      draw(tw.cur);
      if (k < 1) tw.raf = requestAnimationFrame(step);
    })(t0);
  }

  // the lab's lasting elements, built once so selection, focus and CSS transitions survive each redraw
  $("#l-kpis").innerHTML = ["Expected loss", "Bad case, 1 in 20", "Plan costs", "Net of its cost"].map(function (k, i) {
    return '<div class="kpi"><span class="kpi__k">' + k + '</span><b class="kpi__v num ' + ["kpi--loss", "kpi--loss", "", "kpi--safe"][i] + '"></b><span class="kpi__n"></span></div>';
  }).join("");
  $("#l-expo").innerHTML = RS.ASSETS.map(function (a) {
    return '<div class="expo__row"><span class="expo__k">' + a.name + '</span><span class="expo__track"><i class="expo__left"></i><i class="expo__safe"></i></span><span class="expo__v num"></span></div>';
  }).join("");
  var GROWS = RS.TEAMS.slice().sort(function (a, b) { return a.days - b.days; });
  (function () {
    var X = function (d) { return 210 + d * 18.5; }, bot = 20 + GROWS.length * 34;
    var s = '<g class="ax">' + [0, 7, 14, 21, 28, 35, 42].map(function (d) {
      return '<line x1="' + X(d) + '" x2="' + X(d) + '" y1="10" y2="' + bot + '"/><text x="' + X(d) + '" y="' + (bot + 18) + '" text-anchor="middle">' + dayLabel(d) + "</text>";
    }).join("") + "</g>";
    GROWS.forEach(function (t, i) {
      var y = 22 + i * 34;
      s += '<g class="gt" data-t="' + t.id + '"><text class="gt__k" x="200" y="' + (y + 13) + '" text-anchor="end">' + t.name + "</text>" +
        '<rect x="' + X(0) + '" y="' + y + '" width="' + (ready(t.days) * 18.5) + '" height="18" rx="4"/>' +
        '<text class="gt__v" x="' + (X(ready(t.days)) + 8) + '" y="' + (y + 13) + '"></text></g>';
    });
    $("#f-gantt").innerHTML = s + '<g id="f-gantt-mark"></g>';
    $("#f-gantt").setAttribute("viewBox", "0 0 1000 " + (bot + 30));
  })();

  function update() {
    var p = { attacks: S.p }, base = RS.stats([], p), plan = RS.stats(S.plan, p);
    // controls
    document.querySelectorAll(".preset").forEach(function (b) {
      var o = RS.OPTIONS.filter(function (x) { return x.id === b.dataset.o; })[0];
      b.setAttribute("aria-pressed", same(o.plan, S.plan));
    });
    document.querySelectorAll(".mv input").forEach(function (c) { c.checked = has(c.value); c.closest(".mv").classList.toggle("is-on", c.checked); });
    $("#l-p-out").textContent = S.p + "%";
    document.querySelectorAll("#l-p-seg button").forEach(function (b) { b.setAttribute("aria-pressed", +b.dataset.p === S.p); });
    document.querySelectorAll("#l-t-seg button").forEach(function (b) { b.setAttribute("aria-pressed", +b.dataset.t === S.t); });
    var named = { 25: "A truce holds", 46: "Totality's forecast", 70: "Talks collapse" }[S.p];
    $("#l-p-note").textContent = named || (S.p > 46 ? S.p - 46 + " points above Totality" : 46 - S.p + " points below Totality");
    $("#l-p-down").disabled = S.p <= 5; $("#l-p-up").disabled = S.p >= 95;

    // headline numbers count to their new values
    var saved = base.loss - plan.loss, net = saved - plan.cost;
    var notes = [plan.cost ? "down from " + M(base.loss) : "if we do nothing", plan.cost ? "down from " + M(base.bad) : "",
      S.plan.length + (S.plan.length === 1 ? " move" : " moves"), plan.cost ? "each $1 saves $" + f1(saved / plan.cost) : "nothing spent"];
    var kv = document.querySelectorAll("#l-kpis .kpi__v"), kn = document.querySelectorAll("#l-kpis .kpi__n");
    notes.forEach(function (n, i) { kn[i].textContent = n; });
    tween("kpi", [plan.loss, plan.bad, plan.cost, net], function (v) {
      kv[0].textContent = M(v[0]); kv[1].textContent = M(v[1]); kv[2].textContent = M(v[2]);
      kv[3].textContent = (v[3] < -0.005 ? "-" : "") + M(Math.abs(v[3]));
    });

    // exposure by asset: the split between still at risk and protected slides
    var max = Math.max.apply(null, RS.ASSETS.map(function (a) { return base.by[a.id].loss; }));
    var rows = document.querySelectorAll("#l-expo .expo__row");
    tween("expo", RS.ASSETS.map(function (a) { return plan.by[a.id].loss; }).concat(RS.ASSETS.map(function (a) { return base.by[a.id].loss; }), [max]), function (v) {
      var n = RS.ASSETS.length, mx = v[2 * n];
      RS.ASSETS.forEach(function (a, i) {
        var l = v[i], b = v[n + i], r = rows[i];
        r.querySelector(".expo__left").style.width = (l / mx * 100).toFixed(2) + "%";
        var sf = r.querySelector(".expo__safe"); sf.style.left = (l / mx * 100).toFixed(2) + "%"; sf.style.width = (Math.max(0, b - l) / mx * 100).toFixed(2) + "%";
        r.querySelector(".expo__v").innerHTML = M(l) + (b - l > 0.005 ? " <span>of " + M(b) + "</span>" : "");
      });
    });

    stock(); risk(base, plan); plans(p); gantt();
  }

  // Gebze's compressor stock, day by day from 1 April: a reroute cuts arrivals for a stretch; stock covers it or the lines stop
  function stockRun(withP, withL, T) {
    var start = T + 5, gap = withL && T >= 5 ? 12 : 24, out = [], s = 18, stops = [];
    var target = function (d) { return withP && T > 9 ? (d < 9 ? 18 : Math.min(35, 18 + (d - 9) * 17 / 21)) : 18; };
    for (var d = 0; d <= 121; d++) {
      if (d < start) s = target(d);
      else if (d < start + gap) { s = Math.max(0, s - 1); if (s === 0) stops.push(d); }
      else s = Math.min(withP ? 35 : 18, s + 1.5);
      out.push(s);
    }
    return { s: out, stops: stops, start: start, gap: gap };
  }
  // the run of empty days in a (possibly mid-tween) series, from day `from`
  function emptyRun(sr, from) {
    var a = -1, n = 0;
    for (var d = Math.max(0, Math.floor(from)); d < sr.length; d++) { if (sr[d] < 0.05) { if (a < 0) a = d; n++; } else if (a >= 0) break; }
    return { a: a, n: n };
  }
  function stock() {
    var T = S.t, none = stockRun(false, false, T), mine = stockRun(has("procurement"), has("logistics"), T);
    var msg = mine.stops.length
      ? "Lines stop for " + mine.stops.length + " days from " + dayLabel(mine.stops[0])
      : "No line stop: the lowest point is " + Math.round(Math.min.apply(null, mine.s.slice(mine.start))) + " days of stock";
    var msgNone = none.stops.length ? "Doing nothing, they'd stop for " + none.stops.length + " days from " + dayLabel(none.stops[0]) : "";
    $("#l-stock-msg").innerHTML = '<b class="' + (mine.stops.length ? "is-loss" : "is-safe") + '">' + msg + "</b>" + (msgNone && S.plan.length ? "<span>" + msgNone + "</span>" : "");
    $("#l-stock").setAttribute("aria-label", msg + ". " + msgNone);
    var N = none.s.length;
    tween("stock", none.s.concat(mine.s, [mine.start, mine.gap, T]), function (v) {
      var ns = v.slice(0, N), ms = v.slice(N, 2 * N), st = v[2 * N], gp = v[2 * N + 1], t = v[2 * N + 2];
      var X = function (d) { return 40 + d * 2.9; }, Y = function (x) { return 190 - x * 4.4; };
      var path = function (sr) { return sr.map(function (x, d) { return (d ? "L" : "M") + X(d).toFixed(1) + " " + Y(x).toFixed(1); }).join(""); };
      var s = '<g class="ax">' + [0, 10, 20, 30, 40].map(function (x) {
        return '<line x1="40" x2="392" y1="' + Y(x) + '" y2="' + Y(x) + '"/><text x="36" y="' + (Y(x) + 4) + '" text-anchor="end">' + x + "</text>";
      }).join("") + [0, 30, 61, 91, 121].map(function (d) { return '<text x="' + X(d) + '" y="212" text-anchor="middle">' + dayLabel(d) + "</text>"; }).join("") + "</g>";
      s += '<rect class="gapband" x="' + X(st).toFixed(1) + '" y="' + Y(40) + '" width="' + (gp * 2.9).toFixed(1) + '" height="' + (Y(0) - Y(40)) + '"/>';
      s += '<line class="mark" x1="' + X(t).toFixed(1) + '" x2="' + X(t).toFixed(1) + '" y1="' + Y(40) + '" y2="' + Y(0) + '"/>';
      s += '<text class="lab" x="' + (X(t) + 5).toFixed(1) + '" y="' + (Y(40) + 10) + '">attacks resume</text>';
      s += '<path class="line line--none" d="' + path(ns) + '"/><path class="line" d="' + path(ms) + '"/>';
      [[ns, "stopbar stopbar--none"], [ms, "stopbar"]].forEach(function (x) {
        var r = emptyRun(x[0], st); if (r.n) s += '<rect class="' + x[1] + '" x="' + X(r.a).toFixed(1) + '" y="' + (Y(0) + 2) + '" width="' + Math.max(3, r.n * 2.9).toFixed(1) + '" height="6" rx="2"/>';
      });
      $("#l-stock").innerHTML = s;
    });
  }

  // chance the total passes each amount, with and without the plan, sampled on a fixed grid so the curves can morph
  var GRID = []; for (var gx = 0; gx <= 80; gx += 0.5) GRID.push(gx);
  function exceed(o) { return GRID.map(function (x) { var q = 0; o.forEach(function (r) { if (r.total > x + 1e-9) q += r.pr; }); return q; }); }
  function risk(base, plan) {
    var nothing = 0; plan.outcomes.forEach(function (o) { if (o.total <= 0.01) nothing += o.pr; });
    var n = GRID.length;
    tween("risk", exceed(base.outcomes).concat(exceed(plan.outcomes), [plan.bad, nothing]), function (v) {
      var X = function (x) { return 40 + Math.min(x, 80) / 80 * 352; }, Y = function (q) { return 190 - q * 170; };
      // a step curve: hold each level until the next grid point
      var curve = function (qs) { return "M" + X(0) + " " + Y(1) + qs.map(function (q, i) { return "L" + X(GRID[i]).toFixed(1) + " " + Y(q).toFixed(1); }).join(""); };
      var s = '<g class="ax">' + [0, 0.25, 0.5, 0.75, 1].map(function (q) {
        return '<line x1="40" x2="392" y1="' + Y(q) + '" y2="' + Y(q) + '"/><text x="36" y="' + (Y(q) + 4) + '" text-anchor="end">' + Math.round(q * 100) + (q === 1 ? "%" : "") + "</text>";
      }).join("") + [0, 20, 40, 60, 80].map(function (x) { return '<text x="' + X(x) + '" y="212" text-anchor="middle">$' + x + "M</text>"; }).join("") + "</g>";
      s += '<line class="mark mark--soft" x1="40" x2="392" y1="' + Y(0.05) + '" y2="' + Y(0.05) + '"/><text class="lab lab--mute" x="392" y="' + (Y(0.05) - 5) + '" text-anchor="end">1 in 20</text>';
      s += '<path class="line line--none" d="' + curve(v.slice(0, n)) + '"/><path class="line" d="' + curve(v.slice(n, 2 * n)) + '"/>';
      s += '<circle class="dot dot--loss" cx="' + X(v[2 * n]).toFixed(1) + '" cy="' + Y(0.05) + '" r="4.5"/>';
      s += '<text class="lab lab--loss" x="' + (X(v[2 * n]) + 8).toFixed(1) + '" y="' + (Y(0.05) + 16) + '">' + M(v[2 * n]) + "</text>";
      s += '<text class="lab" x="' + X(2) + '" y="' + (Y(1) - 6) + '">' + Math.round(v[2 * n + 1] * 100) + "% chance we lose nothing at all</text>";
      $("#l-risk").innerHTML = s;
    });
  }

  // every subset of the five moves: cost against expected loss left; the cheapest way to each level is the frontier.
  // The dots are built once and glide when the chance changes
  var ALLP = [];
  for (var m = 0; m < (1 << ORDER.length); m++) ALLP.push(ORDER.filter(function (x, k) { return m & (1 << k); }));
  (function () {
    var s = '<g class="ax" id="l-plans-ax"></g><polyline class="front" id="l-plans-front"/>';
    ALLP.forEach(function (pl) {
      var opt = RS.OPTIONS.filter(function (o) { return same(o.plan, pl); })[0];
      var names = pl.length ? pl.map(function (t) { return RS.byId[t].name; }).join(", ") : "No moves";
      s += '<g class="pt" data-plan="' + pl.join(" ") + '" tabindex="0" role="button" data-names="' + names + '"><circle r="4.5"/>' +
        (opt ? "<text>" + opt.id + "</text>" : "") + "<title></title></g>";
    });
    $("#l-plans").innerHTML = s;
  })();
  function plans(p) {
    var all = ALLP.map(function (pl) { var st = RS.stats(pl, p); return { plan: pl, cost: st.cost, loss: st.loss }; });
    var front = all.slice().sort(function (a, b) { return a.cost - b.cost || a.loss - b.loss; }).filter(function (x, i, arr) {
      return !arr.some(function (y) { return y !== x && y.cost <= x.cost && y.loss < x.loss - 1e-9; });
    });
    var g = document.querySelectorAll("#l-plans .pt");
    all.forEach(function (x, i) {
      var cur = same(x.plan, S.plan);
      g[i].classList.toggle("is-cur", cur); g[i].classList.toggle("is-front", front.indexOf(x) >= 0);
      var lab = g[i].dataset.names + ": costs " + M(x.cost) + ", leaves " + M(x.loss);
      g[i].setAttribute("aria-label", lab); g[i].querySelector("title").textContent = lab;
    });
    var fi = front.map(function (x) { return all.indexOf(x); });
    tween("plans", all.map(function (x) { return x.loss; }).concat([all[0].loss]), function (v) {
      var maxL = v[v.length - 1], X = function (c) { return 40 + c / 2.5 * 352; }, Y = function (l) { return 190 - l / Math.max(1, maxL) * 170; };
      $("#l-plans-ax").innerHTML = [0, 0.5, 1, 1.5, 2, 2.5].map(function (c) {
        return '<text x="' + X(c) + '" y="212" text-anchor="middle">$' + c + "M</text>";
      }).join("") + [0, 0.5, 1].map(function (f) {
        return '<line x1="40" x2="392" y1="' + Y(maxL * f) + '" y2="' + Y(maxL * f) + '"/><text x="36" y="' + (Y(maxL * f) + 4) + '" text-anchor="end">' + M(maxL * f).replace(".0M", "M") + "</text>";
      }).join("") + '<text x="392" y="226" text-anchor="end">plan cost</text>';
      $("#l-plans-front").setAttribute("points", fi.map(function (i) { return X(all[i].cost).toFixed(1) + "," + Y(v[i]).toFixed(1); }).join(" "));
      all.forEach(function (x, i) {
        var c = g[i].querySelector("circle"), t = g[i].querySelector("text"), cx = X(x.cost), cy = Y(v[i]);
        c.setAttribute("cx", cx.toFixed(1)); c.setAttribute("cy", cy.toFixed(1));
        if (t) { t.setAttribute("x", (cx + (x.cost > 2.2 ? -10 : 10)).toFixed(1)); t.setAttribute("y", (cy - 9).toFixed(1)); t.setAttribute("text-anchor", x.cost > 2.2 ? "end" : "start"); }
      });
    });
  }
  $("#l-plans").addEventListener("click", function (e) { var g = e.target.closest(".pt"); if (g) { S.plan = g.dataset.plan ? g.dataset.plan.split(" ") : []; update(); } });
  $("#l-plans").addEventListener("keydown", function (e) { if (e.key !== "Enter" && e.key !== " ") return; var g = e.target.closest(".pt"); if (g) { e.preventDefault(); S.plan = g.dataset.plan ? g.dataset.plan.split(" ") : []; update(); } });

  // ---------- 4. the timeline: bars fade in and out of the plan, the attack marker slides ----------
  function gantt() {
    document.querySelectorAll("#f-gantt .gt").forEach(function (el) {
      var t = RS.byId[el.dataset.t], on = has(t.id);
      el.classList.toggle("is-off", !on);
      el.querySelector(".gt__v").textContent = on ? "ready " + weekday(ready(t.days)) : "not in the plan";
    });
    var bot = 20 + GROWS.length * 34;
    tween("gantt", [S.t], function (v) {
      var T = v[0], X = function (d) { return 210 + d * 18.5; }, s = "";
      if (T <= 42) s += '<line class="mark" x1="' + X(T).toFixed(1) + '" x2="' + X(T).toFixed(1) + '" y1="10" y2="' + bot + '"/><text class="lab lab--loss" x="' + (X(T) + 5).toFixed(1) + '" y="18">attacks resume, ' + dayLabel(Math.round(T)) + "</text>";
      if (T + 5 <= 42) s += '<line class="mark mark--soft" x1="' + X(T + 5).toFixed(1) + '" x2="' + X(T + 5).toFixed(1) + '" y1="10" y2="' + bot + '"/>';
      $("#f-gantt-mark").innerHTML = s;
    });
  }

  // ---------- controls ----------
  $("#l-presets").addEventListener("click", function (e) {
    var b = e.target.closest(".preset"); if (!b) return;
    S.plan = RS.OPTIONS.filter(function (o) { return o.id === b.dataset.o; })[0].plan.slice(); update();
  });
  $("#l-moves").addEventListener("change", function (e) {
    var id = e.target.value; if (!id) return;
    S.plan = e.target.checked ? S.plan.concat([id]) : S.plan.filter(function (x) { return x !== id; });
    S.plan.sort(function (a, b) { return ORDER.indexOf(a) - ORDER.indexOf(b); });
    update();
  });
  $("#l-p-seg").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { S.p = +b.dataset.p; update(); } });
  $("#l-p-down").addEventListener("click", function () { S.p = Math.max(5, S.p - 5); update(); });
  $("#l-p-up").addEventListener("click", function () { S.p = Math.min(95, S.p + 5); update(); });
  $("#l-t-seg").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { S.t = +b.dataset.t; update(); } });

  // ---------- 6. outside the watch list ----------
  $("#f-off").innerHTML = RS.EVENTS.filter(function (e) { return !e.watch; }).map(function (e) {
    var h = e.hist, w = 220, ht = 56, hi = Math.max(10, Math.max.apply(null, h));
    var pts = h.map(function (v, i) { return (i / (h.length - 1) * w).toFixed(1) + "," + (ht - 4 - v / hi * (ht - 10)).toFixed(1); }).join(" ");
    return '<a class="offc" href="redsea-tree.html#' + e.node + '"><span class="offc__p num">' + e.p + "%</span>" +
      '<span class="offc__d">' + (e.swan ? "a gray swan: unlikely, severe" : "up from " + e.was + "% a week ago") + "</span>" +
      '<svg class="offc__sp" viewBox="0 0 ' + w + " " + ht + '" aria-hidden="true"><polyline points="' + pts + '"/></svg>' +
      '<span class="offc__n">' + e.name + '</span><span class="offc__t">' + e.plain + "</span></a>";
  }).join("");

  // ---------- entrances: figures draw themselves in as they scroll into view ----------
  (function () {
    var els = document.querySelectorAll(".report .fig, .report .tbl, .report .off");
    document.querySelectorAll("#f-trend .line, #f-route .rt, .offc__sp polyline").forEach(function (l) { l.setAttribute("pathLength", "1"); });
    if (REDUCE || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    document.documentElement.classList.add("rs-anim");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.25 });
    els.forEach(function (e) { io.observe(e); });
  })();

  update();
})();
