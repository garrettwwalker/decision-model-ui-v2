/* Red Sea demo, at a glance: three columns (events, Halvorsen's assets, teams) drawn from redsea.js, with curves
   between each event and the assets it hits and each asset and the teams that cover it. Pointing at or focusing
   any card lights its whole chain and dims the rest. */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var RS = window.RS, M = RS.money;

  $("#f-loss").textContent = M(RS.TOTAL.loss);
  $("#f-bad").textContent = M(RS.TOTAL.bad);
  $("#f-saves").textContent = M(RS.TOTAL.saves);
  $("#f-cost").textContent = M(RS.TOTAL.cost);

  function spark(h) {
    var w = 64, ht = 22, lo = Math.min.apply(null, h), hi = Math.max.apply(null, h), r = Math.max(8, hi - lo);
    var pts = h.map(function (v, i) { return [i / (h.length - 1) * w, ht - 3 - (v - lo) / r * (ht - 6)]; });
    var last = pts[pts.length - 1];
    return '<svg class="spark" viewBox="0 0 ' + w + " " + ht + '" aria-hidden="true"><polyline pathLength="1" points="' +
      pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '"/><circle cx="' +
      last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="2.2"/></svg>';
  }

  // where the curves can't be drawn (stacked columns), each card names its links instead
  function hitsLine(word, ids) {
    return '<span class="card__hits">' + word + " " + ids.map(function (a) { return RS.byId[a].tag; }).join(", ") + "</span>";
  }

  function eventCard(e) {
    var d = e.p - e.was;
    var tag = e.swan ? '<span class="tag tag--swan">Gray swan</span>' : e.spike ? '<span class="tag tag--jump">Odds jumped</span>' : "";
    return '<a class="ev card" href="redsea-tree.html#' + e.node + '" data-id="' + e.id + '">' +
      '<span class="ev__p num">' + e.p + "<small>%</small></span>" +
      '<span class="ev__body"><span class="card__name">' + e.name + "</span>" +
      '<span class="card__line">' + e.plain + "</span>" +
      '<span class="ev__foot">' + spark(e.hist) + '<span class="' + (d > 0 ? "up" : "down") + '">' +
      (d > 0 ? "+" : "") + d + " pts this week</span>" + tag + "</span>" + hitsLine("Hits", e.hits) + "</span></a>";
  }

  var maxLoss = Math.max.apply(null, RS.ASSETS.map(function (a) { return a.loss; }));
  function assetCard(a) {
    return '<div class="as card" tabindex="0" data-id="' + a.id + '">' +
      '<span class="card__name">' + a.name + "</span>" +
      '<span class="card__where">' + a.where + "</span>" +
      '<span class="as__short">' + a.short + "</span>" +
      '<span class="as__money"><b class="num money--loss">' + M(a.loss) + "</b>" +
      '<span class="as__bar"><i style="width:' + (a.loss / maxLoss * 100).toFixed(1) + '%"></i></span></span></div>';
  }

  function teamCard(t) {
    return '<div class="tm card" tabindex="0" data-id="' + t.id + '">' +
      '<span class="card__name">' + t.name + ' <span class="card__where">' + t.lead + "</span></span>" +
      '<span class="tm__move">' + t.move + "</span>" +
      '<span class="tm__foot"><span class="num">' + M(t.cost) + '</span><span class="tm__to">protects</span>' +
      '<b class="num money--safe">' + M(t.saves) + '</b><span class="tm__days">ready in ' + t.days + " days</span></span>" + hitsLine("Covers", t.hits) + "</div>";
  }

  $("#b-watch").innerHTML = RS.EVENTS.filter(function (e) { return e.watch; }).map(eventCard).join("");
  $("#b-off").innerHTML = RS.EVENTS.filter(function (e) { return !e.watch; }).map(eventCard).join("");
  var assets = RS.ASSETS.slice().sort(function (a, b) { return b.loss - a.loss; });
  $("#b-assets").innerHTML = assets.map(assetCard).join("");
  var teams = RS.TEAMS.slice().sort(function (a, b) { return b.saves - a.saves; });
  $("#b-teams").innerHTML = teams.map(teamCard).join("");

  // the chain: event -> assets -> teams
  var LINKS = [];
  RS.EVENTS.forEach(function (e) { e.hits.forEach(function (a) { LINKS.push([e.id, a]); }); });
  RS.TEAMS.forEach(function (t) { t.hits.forEach(function (a) { LINKS.push([a, t.id]); }); });

  function chain(id) {
    var on = {}, x = RS.byId[id];
    on[id] = 1;
    if (RS.EVENTS.indexOf(x) >= 0) {
      x.hits.forEach(function (a) { on[a] = 1; });
      RS.TEAMS.forEach(function (t) { if (t.hits.some(function (a) { return on[a]; })) on[t.id] = 1; });
    } else if (RS.ASSETS.indexOf(x) >= 0) {
      RS.EVENTS.forEach(function (e) { if (e.hits.indexOf(id) >= 0) on[e.id] = 1; });
      RS.TEAMS.forEach(function (t) { if (t.hits.indexOf(id) >= 0) on[t.id] = 1; });
    } else {
      x.hits.forEach(function (a) { on[a] = 1; });
      RS.EVENTS.forEach(function (e) { if (e.hits.some(function (a) { return x.hits.indexOf(a) >= 0; })) on[e.id] = 1; });
    }
    return on;
  }

  var board = $(".board"), svg = $(".board__links");
  var cards = {};
  board.querySelectorAll("[data-id]").forEach(function (c) { cards[c.dataset.id] = c; });

  function draw() {
    var b = board.getBoundingClientRect();
    svg.setAttribute("viewBox", "0 0 " + b.width + " " + b.height);
    var stacked = getComputedStyle(board).gridTemplateColumns.split(" ").length < 3;
    if (stacked) { svg.innerHTML = ""; return; }
    svg.innerHTML = LINKS.map(function (l) {
      var a = cards[l[0]].getBoundingClientRect(), z = cards[l[1]].getBoundingClientRect();
      var x1 = a.right - b.left, y1 = a.top + a.height / 2 - b.top, x2 = z.left - b.left, y2 = z.top + z.height / 2 - b.top;
      var mx = (x1 + x2) / 2;
      return '<path pathLength="1" data-a="' + l[0] + '" data-b="' + l[1] + '" d="M' + x1.toFixed(1) + " " + y1.toFixed(1) +
        "C" + mx.toFixed(1) + " " + y1.toFixed(1) + " " + mx.toFixed(1) + " " + y2.toFixed(1) + " " +
        x2.toFixed(1) + " " + y2.toFixed(1) + '"/>';
    }).join("");
  }

  var active = null;
  function light(id) {
    if (id === active) return;
    active = id;
    var on = id ? chain(id) : null;
    board.classList.toggle("is-tracing", !!id);
    Object.keys(cards).forEach(function (k) { cards[k].classList.toggle("is-on", !!on && !!on[k]); });
    svg.querySelectorAll("path").forEach(function (p) {
      p.classList.toggle("is-on", !!on && !!on[p.dataset.a] && !!on[p.dataset.b] && relevant(id, p));
    });
  }
  // a link is part of the chain if both ends are lit and it runs through an asset the chosen card touches
  function relevant(id, p) {
    var x = RS.byId[id];
    if (RS.ASSETS.indexOf(x) >= 0) return p.dataset.a === id || p.dataset.b === id;
    var hits = x.hits;
    return hits.indexOf(p.dataset.a) >= 0 || hits.indexOf(p.dataset.b) >= 0;
  }

  Object.keys(cards).forEach(function (k) {
    var c = cards[k];
    c.addEventListener("mouseenter", function () { light(k); });
    c.addEventListener("focus", function () { light(k); });
  });
  board.addEventListener("mouseleave", function () { light(null); });
  board.addEventListener("focusout", function (e) { if (!board.contains(e.relatedTarget)) light(null); });

  draw();
  // the board's entrance: sparklines and the curves between the columns draw in, the cost bars grow (reveal.js)
  Reveal(".board", 0.1);
  window.addEventListener("resize", draw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  new ResizeObserver(draw).observe(board);
})();
