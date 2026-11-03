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
  function render() {
    // the question itself heads the outline; its pathways sit at the first level
    var ch = sorted(root.i);
    outline.innerHTML = ch.map(function (c, k) { return row(c, 0, k === ch.length - 1); }).join("");
  }

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
    if (i && !visible(byId[i])) { if (byId[i].r === "rejected") { showAside = true; $("#t-aside").checked = true; } else { showDeclined = true; $("#t-declined").checked = true; } }
    sel = i || null;
    if (sel) reveal(sel);
    render(); showDetail();
    if (opts.hash !== false) { try { history.replaceState(null, "", sel ? "#" + sel : location.pathname); } catch (x) {} }
    var el = sel && document.getElementById("r-" + sel);
    if (el) {
      if (opts.focus !== false) el.focus({ preventScroll: true });
      if (opts.scroll) el.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
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
    select(g.dataset.go || null, { scroll: true, focus: false });
  });

  // ---------- tools ----------
  $("#t-declined").addEventListener("change", function (e) { showDeclined = e.target.checked; render(); });
  $("#t-aside").addEventListener("change", function (e) { showAside = e.target.checked; render(); });
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

  render(); showDetail();
  var h = location.hash.slice(1);
  if (h && byId[h]) select(h, { scroll: true, hash: false, focus: false });
  window.addEventListener("hashchange", function () { var x = location.hash.slice(1); if (x && byId[x]) select(x, { scroll: true, hash: false }); });
})();
