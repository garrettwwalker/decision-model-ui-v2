/* Red Sea demo, the tree: the question's decomposition (redsea-lattice.js) as an outline opened branch by branch.
   Each row shows what kind of question it is and Totality's chance, or that it was declined; children sort by
   chance. Selecting a row fills the side panel: where it sits, how it resolves, and the cross-links that tie it
   to other branches. The URL hash holds the selected node, so the summary and report can link straight in. */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var L = window.LATTICE, N = L.nodes;
  var byId = {}, kids = {};
  N.forEach(function (n) { byId[n.i] = n; (kids[n.p] = kids[n.p] || []).push(n.i); });
  var root = N.filter(function (n) { return n.k === "root"; })[0];

  var KIND = { root: "Question", mechanism: "Pathway", step: "Sub-question", driver: "Driver", node: "Development", consequence: "Knock-on" };
  var KIND_LONG = {
    mechanism: "A pathway: one way shipping could be disrupted. Totality forecasts it by fusing the sub-questions under it.",
    step: "A sub-question Totality can check against the record, with a date and a source that settle it.",
    driver: "A driver: a signal that, if it moves, moves the question above it.",
    node: "A development that would show the branch above it is playing out.",
    scenario: "A scenario: a broader turn of events that shapes several pathways at once.",
    consequence: "A knock-on effect: what follows if the driver above it happens. Its chance assumes the driver does."
  };
  var ROLE = {
    withheld: ["Declined", "Totality declined this one: nothing in the record lets it forecast it well six months out."],
    concept: ["Context", "Background that shapes the branch rather than an event with a date, so it isn't forecast."],
    rejected: ["Set aside", "Set aside because it couldn't be settled cleanly: no reliable source, or the wording left room for doubt."]
  };
  var EVAL = { any_time: "at any point before the deadline", at_date: "on the deadline itself", per_period: "over each period",
    rolling: "on a rolling average", throughout: "for the whole period" };
  // how a cross-link reads from this node's side: [outgoing, incoming], by sign where the sign matters
  var REL = {
    cause: { "1": ["Makes this more likely", "Made more likely by"], "-1": ["Makes this less likely", "Made less likely by"], "0": ["Leads to", "Follows from"] },
    informs: { "1": ["Signals", "Signalled by"], "-1": ["Signals against", "Signalled against by"], "0": ["Signals", "Signalled by"] },
    conditional: { "1": ["Sets up", "Depends on"], "-1": ["Rules out", "Ruled out by"], "0": ["Sets up", "Depends on"] },
    correlated: { "1": ["Tends to rise with", "Tends to rise with"], "-1": ["Tends to fall as", "Tends to fall as"], "0": ["Moves with", "Moves with"] },
    decomposition: { "0": ["Splits into", "Part of"] }
  };

  // depth, subtree size, cross-links (edges that aren't parent-child)
  var depth = {}, size = {};
  (function walk(i, d) { depth[i] = d; size[i] = 1; (kids[i] || []).forEach(function (c) { walk(c, d + 1); size[i] += size[c]; }); })(root.i, 0);
  var out = {}, inc = {};
  L.edges.forEach(function (e) {
    var s = e[0], t = e[1];
    if (!byId[s] || !byId[t] || byId[t].p === s || byId[s].p === t) return;
    (out[s] = out[s] || []).push(e); (inc[t] = inc[t] || []).push(e);
  });

  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var label = function (n) { return n.s || n.t; };
  var kind = function (n) { return n.k === "node" && n.p === root.i ? "Scenario" : KIND[n.k]; }; // a development hung straight off the question is a scenario
  var fmtDate = function (iso) {
    if (!iso) return "";
    var d = new Date(iso + "T00:00:00Z");
    return d.getUTCDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()] + " " + d.getUTCFullYear();
  };

  // ---------- header ----------
  $("#t-q").textContent = root.t.replace(/ over the next 12 months\?$/, "?");
  var count = function (f) { return N.filter(f).length; };
  $("#t-tally").innerHTML = [
    [N.length.toLocaleString("en-GB"), "questions in all"],
    [count(function (n) { return depth[n.i] === 1; }), "pathways and scenarios"],
    [count(function (n) { return n.k === "step"; }), "checkable sub-questions"],
    [count(function (n) { return n.k === "driver"; }), "drivers"],
    [count(function (n) { return n.k === "consequence"; }).toLocaleString("en-GB"), "knock-on effects"],
    [count(function (n) { return n.r === "withheld"; }), "declined"]
  ].map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + x[1] + "</dd></div>"; }).join("");

  // ---------- state ----------
  var open = {}, sel = null, showDeclined = true, showAside = false, hits = null;
  open[root.i] = true;

  function visible(n) {
    if (n.r === "rejected" && !showAside) return false;
    if (n.r === "withheld" && !showDeclined) return false;
    return true;
  }
  function sorted(i) {
    return (kids[i] || []).map(function (c) { return byId[c]; }).filter(visible).sort(function (a, b) {
      var pa = a.pr == null ? -1 : a.pr, pb = b.pr == null ? -1 : b.pr;
      return pb - pa || size[b.i] - size[a.i];
    });
  }

  // ---------- outline ----------
  var outline = $("#t-outline");
  function row(n, d, last) {
    var ch = sorted(n.i), has = ch.length > 0, isOpen = !!open[n.i];
    var role = ROLE[n.r];
    var right = n.pr != null
      ? '<span class="r__bar' + (n.ease ? " is-ease" : "") + '"><i style="width:' + n.pr + '%"></i></span><span class="r__p num">' + n.pr + "%</span>"
      : role ? '<span class="r__role">' + role[0] + "</span>" : "";
    var cls = "r" + (n.i === sel ? " is-sel" : "") + (n.r === "withheld" || n.r === "rejected" || n.r === "concept" ? " is-quiet" : "") +
      (hits && hits[n.i] ? " is-hit" : "");
    var html = '<div class="it' + (d ? " is-sub" : "") + (last ? " is-last" : "") + '" role="none" style="--d:' + d + '">' +
      '<div class="' + cls + '" role="treeitem" id="r-' + n.i + '" data-i="' + n.i + '" tabindex="' + (n.i === (sel || root.i) ? 0 : -1) + '"' +
      ' aria-level="' + (d + 1) + '"' + (has ? ' aria-expanded="' + isOpen + '"' : "") + ' aria-selected="' + (n.i === sel) + '" style="--d:' + d + '">' +
      '<span class="r__tw" aria-hidden="true">' + (has ? '<span class="r__chev"></span>' : "") + "</span>" +
      '<span class="r__main"><span class="r__k">' + kind(n) + (n.ease ? ' <span class="r__ease">eases it</span>' : "") +
      (has ? '<span class="r__n">' + ch.length + " below</span>" : "") + '</span><span class="r__t">' + esc(label(n)) + "</span></span>" +
      '<span class="r__right">' + right + "</span></div>";
    if (has && isOpen) {
      html += '<div class="grp" role="group">' + ch.map(function (c, k) { return row(c, d + 1, k === ch.length - 1); }).join("") + "</div>";
    }
    return html + "</div>";
  }
  function renderList() {
    // the question itself heads the outline; its pathways sit at the first level
    var ch = sorted(root.i);
    outline.innerHTML = ch.map(function (c, k) { return row(c, 0, k === ch.length - 1); }).join("");
  }

  // ---------- the map: a zoomable icicle of the whole decomposition ----------
  // Each question is a block; columns are levels, left to right; a block's height is how many questions end beneath
  // it, and its color is Totality's chance (gold for branches that ease the disruption, hatched where declined).
  // Blocks are kept per node and moved with CSS transitions, so zooming glides.
  var view = "map", focus = root.i, Y0 = {}, Y1 = {}, LV = {}, EL = {};
  var iceSvg = $("#t-ice-svg"), iceG = $("#t-ice-g"), crumbs = $("#t-crumbs");
  var SVGNS = "http://www.w3.org/2000/svg";
  function partition() {
    Y0 = {}; Y1 = {}; LV = {};
    (function leaves(i) { var ch = sorted(i); LV[i] = ch.length ? ch.reduce(function (t, c) { return t + leaves(c.i); }, 0) : 1; return LV[i]; })(root.i);
    (function place(i, y0, y1) {
      Y0[i] = y0; Y1[i] = y1;
      var y = y0;
      sorted(i).forEach(function (c) { var h = (y1 - y0) * LV[c.i] / LV[i]; place(c.i, y, y + h); y += h; });
    })(root.i, 0, 1);
  }
  function mix(a, b, t) { return "rgb(" + a.map(function (v, k) { return Math.round(v + (b[k] - v) * t); }).join(",") + ")"; }
  function fill(n) {
    if (n.k === "root") return "#1b1e26";
    if (n.pr == null) return n.r === "withheld" ? "url(#ice-hatch)" : "rgba(236, 238, 242, 0.07)";
    var t = Math.pow(n.pr / 100, 0.8);
    return n.ease ? mix([52, 46, 30], [255, 213, 107], t) : mix([40, 32, 42], [255, 107, 129], t);
  }
  function colsNow() { var w = iceSvg.clientWidth || 800; return w < 560 ? 2 : w < 800 ? 3 : 4; }
  function inWindow(i) {
    if (!(i in Y0)) return false;
    var a = byId[i];
    while (a && a.i !== focus) a = byId[a.p];
    return !!a && depth[i] - depth[focus] < colsNow();
  }
  function drawMap() {
    if (view !== "map") return;
    var W = iceSvg.clientWidth || 800, H = Math.round(Math.max(420, Math.min(680, window.innerHeight - 230)));
    iceSvg.setAttribute("viewBox", "0 0 " + W + " " + H); iceSvg.style.height = H + "px";
    var cols = colsNow(), fd = depth[focus], c0 = Math.min(W * 0.2, 200), cw = (W - c0) / (cols - 1);
    var ky = H / (Y1[focus] - Y0[focus]), want = {};
    (function walk(i) {
      var c = depth[i] - fd;
      if (c >= cols) return;
      var h = (Y1[i] - Y0[i]) * ky;
      if (h < 0.75) return;
      want[i] = { x: c ? c0 + (c - 1) * cw : 0, y: (Y0[i] - Y0[focus]) * ky, w: c ? cw : c0, h: h, c: c };
      sorted(i).forEach(function (ch) { walk(ch.i); });
    })(focus);
    Object.keys(EL).forEach(function (i) {
      if (want[i]) return;
      var g = EL[i]; delete EL[i];
      g.style.opacity = 0; g.style.pointerEvents = "none";
      setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 450);
    });
    Object.keys(want).forEach(function (i) {
      var n = byId[i], b = want[i], g = EL[i], fresh = !g;
      if (fresh) {
        g = document.createElementNS(SVGNS, "g"); g.setAttribute("class", "ib"); g.dataset.i = i;
        g.innerHTML = "<rect rx='3'/><text class='ib__k' x='8'></text><text class='ib__t' x='8'></text><text class='ib__p' text-anchor='end'></text><title></title>";
        g.style.opacity = 0;
        // a new block grows out of where its parent sat, so zooming in reads as opening that block
        var pb = n.p && EL[n.p] ? EL[n.p]._b : null;
        g.style.transform = pb ? "translate(" + pb.x + "px," + pb.y + "px)" : "translate(" + b.x + "px," + b.y + "px)";
        iceG.appendChild(g); EL[i] = g;
        void g.getBoundingClientRect();
      }
      g._b = b;
      var tall = b.h >= 17, roomy = b.h >= 36, t = n.pr == null ? 0 : n.pr / 100;
      var dark = n.pr != null && Math.pow(t, 0.8) > 0.55;
      g.setAttribute("class", "ib" + (dark ? " is-dark" : "") + (i === sel ? " is-sel" : "") + (i === focus && i !== root.i ? " is-focus" : "") +
        (hits && hits[i] ? " is-hit" : "") + (n.r === "withheld" ? " is-decl" : ""));
      g.style.opacity = 1; g.style.pointerEvents = "";
      g.style.transform = "translate(" + b.x.toFixed(1) + "px," + b.y.toFixed(1) + "px)";
      var r = g.querySelector("rect");
      r.style.width = Math.max(0, b.w - 2).toFixed(1) + "px"; r.style.height = Math.max(0, b.h - 1).toFixed(1) + "px";
      r.style.fill = fill(n);
      var pct = n.pr != null && b.w > 110 ? n.pr + "%" : "", room = Math.floor((b.w - 18 - (pct ? 34 : 0)) / 6.4);
      var name = n.k === "root" ? "The question" : label(n), cut = function (x, m) { return x.length > m ? x.slice(0, Math.max(0, m - 1)) + "…" : x; };
      var tk = g.querySelector(".ib__k"), tt = g.querySelector(".ib__t"), tp = g.querySelector(".ib__p");
      tk.textContent = roomy ? kind(n) + (n.r === "withheld" ? ", declined" : n.ease ? ", eases it" : "") : "";
      tk.setAttribute("y", 15);
      // tall blocks wrap the label onto as many lines as fit (up to three)
      var lines = !tall ? [] : wrap(name, room, roomy ? Math.max(1, Math.min(3, Math.floor((b.h - 22) / 15))) : 1);
      var ty = roomy ? 31 : Math.min(b.h - 4, 13);
      tt.innerHTML = lines.map(function (ln, k) { return '<tspan x="8" y="' + (ty + k * 15) + '">' + esc(ln) + "</tspan>"; }).join("");
      tp.textContent = tall ? pct : ""; tp.setAttribute("x", (b.w - 9).toFixed(1)); tp.setAttribute("y", roomy ? 31 : Math.min(b.h - 4, 13));
      g.querySelector("title").textContent = name + (n.pr != null ? ", " + n.pr + "%" : n.r === "withheld" ? ", declined" : "") +
        (sorted(i).length ? ". " + LV[i] + " questions end beneath it" : "");
      if (tall) { g.setAttribute("tabindex", "0"); g.setAttribute("role", "button"); } else { g.removeAttribute("tabindex"); g.removeAttribute("role"); }
    });
    // where we are, as crumbs back up the tree
    var path = [], a = byId[focus];
    while (a) { path.unshift(a); a = byId[a.p]; }
    crumbs.innerHTML = path.map(function (x, k) {
      var t = x.k === "root" ? "The question" : label(x);
      return k === path.length - 1 ? '<span aria-current="true">' + esc(t.length > 60 ? t.slice(0, 59) + "…" : t) + "</span>"
        : '<button type="button" data-z="' + x.i + '">' + esc(t.length > 36 ? t.slice(0, 35) + "…" : t) + "</button>";
    }).join('<span class="ice__sep" aria-hidden="true">/</span>');
  }
  function zoom(i) { focus = i; drawMap(); }
  // words onto lines of at most `room` characters; the last line takes an ellipsis if text is left over
  function wrap(t, room, max) {
    if (room < 4) return [];
    var words = t.split(" "), out = [], cur = "";
    for (var k = 0; k < words.length; k++) {
      var nx = cur ? cur + " " + words[k] : words[k];
      if (nx.length <= room) { cur = nx; continue; }
      if (out.length === max - 1) { out.push((cur ? cur + " " : "") + words[k]); cur = ""; break; }
      if (cur) out.push(cur);
      cur = words[k];
    }
    if (cur && out.length < max) out.push(cur);
    var last = out.length - 1, rest = out.join(" ").length < t.length;
    if (last >= 0 && (rest || out[last].length > room)) out[last] = out[last].slice(0, room - 1).replace(/[\s,;:]+$/, "") + "…";
    return out;
  }
  iceSvg.addEventListener("click", function (e) {
    var g = e.target.closest(".ib"); if (!g) return;
    var i = g.dataset.i;
    if (i === focus) { if (i !== root.i) { zoom(byId[i].p); } return; }
    if (sorted(i).length) focus = i;
    select(i, { focus: false });
  });
  iceSvg.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var g = e.target.closest(".ib"); if (!g) return;
    e.preventDefault(); g.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    var n = EL[g.dataset.i]; if (n) n.focus();
  });
  crumbs.addEventListener("click", function (e) { var b = e.target.closest("[data-z]"); if (b) zoom(b.dataset.z); });
  window.addEventListener("resize", function () { if (view === "map") drawMap(); });

  function render() { renderList(); drawMap(); }
  function setView(v) {
    view = v;
    document.querySelectorAll(".viewsw button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.v === v); });
    $("#t-ice").hidden = v !== "map"; outline.hidden = v !== "list"; $("#t-collapse").hidden = v !== "list";
    render();
  }
  document.querySelector(".viewsw").addEventListener("click", function (e) { var b = e.target.closest("[data-v]"); if (b) setView(b.dataset.v); });

  // ---------- detail ----------
  var detail = $("#t-detail");
  function linkRow(e, dir) {
    var o = byId[dir === "out" ? e[1] : e[0]];
    if (!o) return "";
    var r = REL[e[2]] || {}, pair = r[String(e[3])] || r["0"] || [e[2], e[2]];
    var rel = pair[dir === "out" ? 0 : 1];
    return '<li><button type="button" class="lk" data-go="' + o.i + '"><span class="lk__rel' + (e[3] === 1 ? " sg--up" : e[3] === -1 ? " sg--down" : "") + '">' + rel + "</span>" +
      '<span class="lk__t">' + esc(label(o)) + "</span></button></li>";
  }
  function showDetail() {
    if (!sel) {
      detail.innerHTML = '<p class="dt__empty">Select any question to see how it resolves and what else it moves.</p>' +
        '<div class="dt__legend"><p><b>Pathway</b> one way shipping could be disrupted</p><p><b>Sub-question</b> checkable against the record</p>' +
        "<p><b>Driver</b> a signal that moves the question above it</p><p><b>Knock-on</b> what follows if a driver happens</p>" +
        "<p><b>Declined</b> no forecasting skill this far out</p></div>";
      detail.classList.remove("is-open");
      return;
    }
    var n = byId[sel], path = [], a = byId[n.p];
    while (a && a.k !== "root") { path.unshift(a); a = byId[a.p]; }
    var role = ROLE[n.r];
    var o = (out[n.i] || []).slice(0, 12), ic = (inc[n.i] || []).slice(0, 12);
    var nOut = (out[n.i] || []).length, nIn = (inc[n.i] || []).length;
    var ch = kids[n.i] || [], nDecl = ch.filter(function (c) { return byId[c].r === "withheld"; }).length;
    var html = '<button type="button" class="dt__close" aria-label="Close">Close</button>';
    html += '<nav class="dt__path" aria-label="Where it sits">' + ['<button type="button" data-go="">The question</button>'].concat(path.map(function (p) {
      return '<button type="button" data-go="' + p.i + '">' + esc(label(p)) + "</button>";
    })).join('<span aria-hidden="true">/</span>') + "</nav>";
    html += '<p class="dt__k">' + kind(n) + (n.ease ? " that eases the disruption" : "") + "</p>";
    html += '<h2 class="dt__t">' + esc(label(n)) + "</h2>";
    if (n.s && n.s !== n.t) html += '<p class="dt__exact"><span>Exact wording</span>' + esc(n.t) + "</p>";
    if (n.pr != null) {
      html += '<div class="dt__p"><span class="num">' + n.pr + '<small>%</small></span><span>chance' +
        (n.k === "consequence" ? ", if the driver above it happens" : n.c && n.c.dl ? " by " + fmtDate(n.c.dl) : " by " + fmtDate(L.meta.to)) +
        '<br><span class="dt__band">likely between ' + Math.max(0, n.pr - n.bd) + " and " + Math.min(100, n.pr + n.bd) + "%</span></span></div>";
    } else if (role) {
      html += '<p class="dt__role"><b>' + role[0] + "</b> " + role[1] + "</p>";
    }
    var long = kind(n) === "Scenario" ? KIND_LONG.scenario : KIND_LONG[n.k];
    if (long) html += '<p class="dt__what">' + long + "</p>";
    if (n.c) {
      html += '<div class="dt__box"><p class="dt__lab">How it resolves</p>' + (n.c.e ? "<p>" + esc(n.c.e) + "</p>" : "") +
        '<dl class="dt__kv">' + (n.c.dl ? "<dt>Deadline</dt><dd>" + fmtDate(n.c.dl) + "</dd>" : "") +
        (n.c.et ? "<dt>Judged</dt><dd>" + (EVAL[n.c.et] || n.c.et) + "</dd>" : "") +
        (n.c.src ? "<dt>Source</dt><dd>" + esc(n.c.src) + "</dd>" : "") + "</dl></div>";
    }
    if (ch.length) html += '<p class="dt__sub">Splits into ' + ch.length + (ch.length === 1 ? " question" : " questions") + (nDecl ? ", " + nDecl + " declined" : "") +
      (size[n.i] - 1 > ch.length ? ", " + (size[n.i] - 1).toLocaleString("en-GB") + " below it in all" : "") + ".</p>";
    if (n.b) html += '<p class="dt__sub">' + (n.b === "d" ? "Raised by a document Totality retrieved." : "Raised from the model's own knowledge.") + "</p>";
    if (nOut || nIn) {
      html += '<div class="dt__links"><p class="dt__lab">Tied to other branches</p>';
      if (nOut) html += '<ul class="lks">' + o.map(function (e) { return linkRow(e, "out"); }).join("") + "</ul>" + (nOut > o.length ? '<p class="dt__more">and ' + (nOut - o.length) + " more</p>" : "");
      if (nIn) html += '<ul class="lks">' + ic.map(function (e) { return linkRow(e, "in"); }).join("") + "</ul>" + (nIn > ic.length ? '<p class="dt__more">and ' + (nIn - ic.length) + " more</p>" : "");
      html += "</div>";
    }
    detail.innerHTML = html;
    detail.classList.add("is-open");
    detail.scrollTop = 0;
  }

  // ---------- selection ----------
  function reveal(i) { var a = byId[byId[i].p]; while (a) { open[a.i] = true; a = byId[a.p]; } }
  function select(i, opts) {
    opts = opts || {};
    if (i && !visible(byId[i])) { if (byId[i].r === "rejected") { showAside = true; $("#t-aside").checked = true; } else { showDeclined = true; $("#t-declined").checked = true; } partition(); }
    sel = i || null;
    if (sel) { reveal(sel); if (opts.zoom || !inWindow(sel)) focus = byId[sel].p || root.i; }
    render(); showDetail();
    if (opts.hash !== false) { try { history.replaceState(null, "", sel ? "#" + sel : location.pathname); } catch (x) {} }
    var el = sel && document.getElementById("r-" + sel);
    if (el) {
      if (opts.focus !== false) el.focus({ preventScroll: true });
      if (opts.scroll && view === "list") el.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }
  function toggle(i) { open[i] = !open[i]; render(); var el = document.getElementById("r-" + i); if (el) el.focus({ preventScroll: true }); }

  outline.addEventListener("click", function (e) {
    var r = e.target.closest(".r"); if (!r) return;
    var i = r.dataset.i, has = (kids[i] || []).length > 0;
    if (e.target.closest(".r__tw") && has) { toggle(i); return; }
    // on phones the panel is a sheet over the outline, so the first tap on a closed branch only opens it
    if (has && !open[i] && matchMedia("(max-width: 960px)").matches) { toggle(i); return; }
    if (sel === i && has) { open[i] = !open[i]; }
    else if (has && !open[i]) { open[i] = true; }
    select(i);
  });
  outline.addEventListener("keydown", function (e) {
    var r = e.target.closest(".r"); if (!r) return;
    var rows = Array.prototype.slice.call(outline.querySelectorAll(".r")), k = rows.indexOf(r), i = r.dataset.i;
    var has = (kids[i] || []).length > 0, go = function (el) { if (el) { el.focus(); } };
    if (e.key === "ArrowDown") { go(rows[k + 1]); e.preventDefault(); }
    else if (e.key === "ArrowUp") { go(rows[k - 1]); e.preventDefault(); }
    else if (e.key === "ArrowRight") { if (has && !open[i]) toggle(i); else go(rows[k + 1]); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { if (has && open[i]) toggle(i); else go(document.getElementById("r-" + byId[i].p)); e.preventDefault(); }
    else if (e.key === "Enter" || e.key === " ") { select(i); e.preventDefault(); }
  });
  detail.addEventListener("click", function (e) {
    if (e.target.closest(".dt__close")) { sel = null; render(); showDetail(); try { history.replaceState(null, "", location.pathname); } catch (x) {} return; }
    var g = e.target.closest("[data-go]"); if (!g) return;
    select(g.dataset.go || null, { scroll: true, focus: false, zoom: true });
  });

  // ---------- tools ----------
  $("#t-declined").addEventListener("change", function (e) { showDeclined = e.target.checked; partition(); if (!(focus in Y0)) focus = root.i; render(); });
  $("#t-aside").addEventListener("change", function (e) { showAside = e.target.checked; partition(); if (!(focus in Y0)) focus = root.i; render(); });
  $("#t-collapse").addEventListener("click", function () { open = {}; open[root.i] = true; sel = null; render(); showDetail(); });
  var found = $("#t-found"), timer;
  $("#t-find").addEventListener("input", function (e) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      var q = e.target.value.trim().toLowerCase();
      if (q.length < 3) { hits = null; found.textContent = ""; render(); return; }
      hits = {}; var first = null, n = 0;
      N.forEach(function (x) {
        if (x.k === "root" || !visible(x)) return;
        if ((x.t + " " + (x.s || "")).toLowerCase().indexOf(q) >= 0) { hits[x.i] = 1; n++; if (!first) first = x.i; if (n <= 40) reveal(x.i); }
      });
      found.textContent = n ? n + (n === 1 ? " match" : " matches") + (n > 40 ? ", the first 40 opened" : "") : "No matches";
      render();
      if (first) { var el = document.getElementById("r-" + first); if (el) el.scrollIntoView({ block: "center" }); }
    }, 220);
  });

  partition(); render(); showDetail();
  var h = location.hash.slice(1);
  if (h && byId[h]) select(h, { scroll: true, hash: false, focus: false, zoom: true });
  window.addEventListener("hashchange", function () { var x = location.hash.slice(1); if (x && byId[x]) select(x, { scroll: true, hash: false, zoom: true }); });
})();
