/* Red Sea demo, the tree: the question's decomposition (redsea-lattice.js) in three views. Cards shows one level at a
   time as a grid you drill into; Branches shows the question being looked into, its children and one child's
   children, joined by curves; List is the outline opened branch by branch. Children sort by chance. Selecting a
   question fills the side panel: where it sits, how it resolves, and the cross-links that tie it to other branches.
   The URL hash holds the selected node, so the summary and report can link straight in. */
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
    concept: ["Context", "Background that shapes the branch rather than an event with a date, so it isn’t forecast."],
    rejected: ["Set aside", "Set aside because it couldn’t be settled cleanly: no reliable source, or the wording left room for doubt."]
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
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
  };

  // ---------- header ----------
  // the title is the root question in title case, written in the page itself
  var count = function (f) { return N.filter(f).length; };
  $("#t-tally").innerHTML = [
    [N.length.toLocaleString("en-US"), "questions in all"],
    [count(function (n) { return depth[n.i] === 1; }), "pathways and scenarios"],
    [count(function (n) { return n.k === "step"; }), "checkable sub-questions"],
    [count(function (n) { return n.k === "driver"; }), "drivers"],
    [count(function (n) { return n.k === "consequence"; }).toLocaleString("en-US"), "knock-on effects"],
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
      ? '<span class="r__bar"><i style="background:' + ramp(n.pr) + ";width:" + n.pr + '%"></i></span><span class="r__p num">' + n.pr + "%</span>"
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

  // ---------- two visual views over one zoom position: Cards and Branches ----------
  // Both show the decomposition a level or two at a time with every question a full-size, readable card (the user
  // found an icicle's slim blocks impossible to click with confidence). `focus` is the question being looked into;
  // Branches also has an `active` child whose own children fill its third column.
  var view = "cards", focus = root.i, active = null, INSIDE = {};
  var cardsEl = $("#t-cards"), branchEl = $("#t-branches"), crumbs = $("#t-crumbs");
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function partition() { INSIDE = {}; }  // filters changed: forget the counts
  function inside(i) {  // visible questions beneath i
    if (i in INSIDE) return INSIDE[i];
    return (INSIDE[i] = sorted(i).reduce(function (t, c) { return t + 1 + inside(c.i); }, 0));
  }
  function inView(i) {
    var n = byId[i]; if (!n) return false;
    if (view === "branches") return i === focus || n.p === focus || (active && n.p === active);
    return n.p === focus;
  }

  // one card, shared by both views
  // the chance in plain words, on the estimative scale the memo uses
  function words(p) {
    return p < 5 ? "almost no chance" : p < 20 ? "very unlikely" : p < 45 ? "unlikely" : p <= 55 ? "about even" : p < 80 ? "likely" : p < 95 ? "very likely" : "almost certain";
  }
  // the color for a chance, from the same ramp as the key (--ramp in redsea.css): the house red from pale to deep, its
  // stops packed into the low range where most questions sit, so neighbouring odds still read apart on white
  var RAMP = [[0, [244, 205, 194]], [10, [238, 163, 146]], [25, [228, 108, 86]], [45, [219, 51, 36]], [70, [166, 30, 20]], [100, [94, 16, 10]]];
  function ramp(p) {
    for (var k = 1; k < RAMP.length; k++) {
      if (p <= RAMP[k][0]) {
        var a = RAMP[k - 1], b = RAMP[k], t = (p - a[0]) / (b[0] - a[0]);
        return "rgb(" + a[1].map(function (v, j) { return Math.round(v + (b[1][j] - v) * t); }).join(",") + ")";
      }
    }
    return "rgb(" + RAMP[RAMP.length - 1][1].join(",") + ")";
  }
  // a chevron and the points moved since yesterday, for the questions whose chance moved
  function moved(n) {
    if (!n.dd) return "";
    var up = n.dd > 0;
    return '<span class="mv-day ' + (up ? "is-up" : "is-down") + '" title="' + (up ? "Up " : "Down ") + Math.abs(n.dd) + "%" +
      ' since yesterday"><span class="mv-day__chev" aria-hidden="true"></span>' + (up ? "+" : "-") + Math.abs(n.dd) + "%" + '<span class="mv-day__t"> since yesterday</span></span>';
  }
  function card(n, o) {
    o = o || {};
    var ch = sorted(n.i), many = inside(n.i), role = ROLE[n.r];
    var tag = n.r === "withheld" ? "declined" : n.r === "rejected" ? "set aside" : n.r === "concept" ? "context" : n.ease ? "eases it" : "";
    var chance = n.pr != null
      ? '<span class="cd__p num">' + n.pr + '<small>%</small></span><span class="cd__w">' + words(n.pr) + '</span><span class="cd__bar"><i style="background:' + ramp(n.pr) + ";width:" + n.pr + '%"></i></span>'
      : '<span class="cd__p cd__p--none">' + (role ? role[0] : "") + '</span><span class="cd__w">' + (n.r === "withheld" ? "no forecast" : "") + '</span><span class="cd__bar is-none"></span>';
    // what's inside, in words, and on the right, how far the chance moved since yesterday where it did
    var decl = ch.filter(function (c) { return c.r === "withheld"; }).length;
    var foot = '<span class="cd__in">' + (ch.length ? many + (many === 1 ? " question" : " questions") + " inside" +
      (decl ? ", " + decl + " declined" : "") : "No questions beneath it") + "</span>" + moved(n);
    var cls = "cd" + (o.cls ? " " + o.cls : "") + (n.i === sel ? " is-sel" : "") + (hits && hits[n.i] ? " is-hit" : "") + (n.pr == null ? " is-quiet" : "") + (ch.length ? " has-kids" : "");
    return '<button type="button" class="' + cls + '" data-i="' + n.i + '"' + (o.style ? ' style="' + o.style + '"' : "") + ">" +
      '<span class="cd__k">' + (n.k === "root" ? "The question" : kind(n)) + (tag ? ' <span class="cd__tag">' + tag + "</span>" : "") + "</span>" +
      '<span class="cd__t">' + esc(n.k === "root" ? L.meta.q.replace(/ over the next 12 months\?$/, "?") : label(n)) + "</span>" +
      '<span class="cd__chance">' + chance + "</span>" + '<span class="cd__foot">' + foot + "</span></button>";
  }

  // where you are, as stops on a line: each level's kind, a short title and its chance; earlier stops jump back up.
  // The stops that stay are kept, so the line grows to a new stop and shrinks back from one that goes (CSS animates
  // .is-entering and .is-leaving); at the top level the whole route fades and folds away.
  var route = null;
  function fillStop(li, x, here) {
    var t = x.k === "root" ? "The question" : label(x);
    var inner = '<span class="route__dot" aria-hidden="true"></span><span class="route__k">' + (x.k === "root" ? "Question" : kind(x)) +
      (x.pr != null ? ' <span class="route__p num">' + x.pr + "%</span>" : "") + '</span><span class="route__t">' + esc(t) + "</span>";
    li.classList.toggle("is-here", here);
    li.innerHTML = here ? '<span class="route__in" aria-current="true">' + inner + "</span>"
      : '<button type="button" class="route__in" data-z="' + x.i + '" title="Up to ' + esc(t) + '">' + inner + "</button>";
  }
  function dropStop(li, now) {
    li.classList.add("is-leaving"); li.classList.remove("is-end");
    if (now) { li.remove(); return; }
    setTimeout(function () { li.remove(); }, 500);
  }
  function drawCrumbs() {
    var path = [], a = byId[focus];
    while (a) { path.unshift(a); a = byId[a.p]; }
    if (!route) { crumbs.innerHTML = '<ol class="route"></ol>'; route = crumbs.firstChild; }
    var ready = crumbs.classList.contains("is-ready");
    if (morph && ready && (path.length === 1) !== crumbs.classList.contains("is-root")) {  // a card is travelling: no fold
      crumbs.classList.add("is-snap");
      requestAnimationFrame(function () { crumbs.classList.remove("is-snap"); });
    }
    if (path.length === 1) {  // the top: keep the stops as they are and let the route fade out
      crumbs.classList.add("is-root"); crumbs.inert = true;
      if (!ready) route.innerHTML = "";
      return;
    }
    // coming back from the top, the route is rebuilt where it is, then fades in
    var now = !ready || REDUCE || crumbs.classList.contains("is-root");
    crumbs.classList.remove("is-root"); crumbs.inert = false;
    var stay = Array.prototype.filter.call(route.children, function (li) { return !li.classList.contains("is-leaving"); });
    var k = 0;
    while (k < stay.length && k < path.length && stay[k].dataset.i === path[k].i) k++;
    stay.slice(k).forEach(function (li) { dropStop(li, now); });
    var before = Array.prototype.filter.call(route.children, function (li) { return li.classList.contains("is-leaving"); })[0] || null;
    var fresh = [];
    path.forEach(function (x, j) {
      var li = j < k ? stay[j] : document.createElement("li");
      if (j >= k) {
        li.className = "route__stop" + (now ? "" : " is-entering"); li.dataset.i = x.i;
        route.insertBefore(li, before); fresh.push(li);
      }
      var here = j === path.length - 1;
      if (j >= k || li.classList.contains("is-here") !== here) fillStop(li, x, here);
      li.classList.toggle("is-end", here);
    });
    if (fresh.length) { void route.offsetWidth; fresh.forEach(function (li) { li.classList.remove("is-entering"); }); }
  }
  // transitions start once the first route is in place, so the page doesn't open with one
  requestAnimationFrame(function () { requestAnimationFrame(function () { crumbs.classList.add("is-ready"); }); });

  // a fresh grid or tree slides in from the side it came from
  var lastDepth = -1;  // so the first level makes an entrance too
  function slide(el) {
    var d = depth[focus], dir = d > lastDepth ? "in-fwd" : d < lastDepth ? "in-back" : "";
    lastDepth = d;
    // same level (a leaf selected, say): drop the last entrance so the rebuilt cards don't replay it
    el.classList.remove("in-fwd", "in-back");
    if (!dir || REDUCE) return;
    void el.offsetWidth; el.classList.add(dir);
  }

  // Cards: the focus question as a header, its children as a grid
  // Opening a card, the card itself grows into the "Looking into" spot, and going back up one level the header shrinks
  // back into its place in the grid. A white shell travels between the two; inside it the old card's contents fade out
  // and the new card's fade in, each held at its own size so the text never rewraps on the way. The real card shows only
  // once the shell has landed on it. While a card travels, the route snaps to its new height instead of folding (drawCrumbs
  // checks `morph`), so the target holds still: chasing a target the route was still pushing down made the shell overshoot
  var morph = null;
  function docRect(el) { var b = el.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height }; }
  function takeMorph(el, dir, i) { morph = REDUCE || view !== "cards" ? null : { dir: dir, i: i, from: docRect(el), node: el.cloneNode(true) }; }
  function layer(node, w, h) {
    node.classList.remove("is-sel", "is-hit", "is-morph"); node.removeAttribute("style"); node.removeAttribute("data-i");
    node.classList.add("cd-ghost__in"); node.style.width = w + "px"; node.style.height = h + "px";
    return node;
  }
  function runMorph(m) {
    var to = m.dir === "in" ? cardsEl.querySelector(".cd--head") : cardsEl.querySelector('.cards__grid .cd[data-i="' + m.i + '"]');
    if (!to) return;
    to.classList.add("is-morph", "no-entrance");  // hidden till the shell lands, and no slide-in under it (it replayed on landing)
    var f = m.from, r = docRect(to), T = 520;
    var g = document.createElement("div"); g.className = "cd-ghost"; g.setAttribute("aria-hidden", "true");
    var out = layer(m.node, f.w, f.h), inn = layer(to.cloneNode(true), r.w, r.h);
    inn.classList.remove("no-entrance");
    g.appendChild(out); g.appendChild(inn);
    document.body.appendChild(g);
    out.animate([{ opacity: 1 }, { opacity: 0 }], { duration: T * 0.4, fill: "forwards", easing: "ease-out" });
    inn.animate([{ opacity: 0 }, { opacity: 0, offset: 0.25 }, { opacity: 1 }], { duration: T, fill: "forwards" });
    var t0 = performance.now(), ease = function (p) { return 1 - Math.pow(1 - p, 3); };
    var place = function (b) { g.style.left = b.x + "px"; g.style.top = b.y + "px"; g.style.width = b.w + "px"; g.style.height = b.h + "px"; };
    place(f);
    (function step(now) {
      var p = Math.min(1, (now - t0) / T), e = ease(p);
      place({ x: f.x + (r.x - f.x) * e, y: f.y + (r.y - f.y) * e, w: f.w + (r.w - f.w) * e, h: f.h + (r.h - f.h) * e });
      if (p < 1 && to.isConnected) requestAnimationFrame(step);
      else { g.remove(); to.classList.remove("is-morph"); }
    })(t0);
    // opened from far down the grid: bring the header into view as the card travels up to it
    if (m.dir === "in" && to.getBoundingClientRect().top < 90) window.scrollTo({ top: Math.max(0, r.y - 110), behavior: "smooth" });
  }
  function drawCards() {
    var f = byId[focus], ch = sorted(focus);
    var head = focus === root.i ? "" :
      '<div class="cards__head"><p class="cards__lab">Looking into</p>' + card(f, { cls: "cd--head" }) + "</div>";
    cardsEl.innerHTML = head + '<p class="cards__n">' + (ch.length ? (focus === root.i ? ch.length + " pathways and scenarios" : ch.length + " questions beneath this one") + ", most likely first" : "Nothing beneath this question") + "</p>" +
      '<div class="cards__grid">' + ch.map(function (c, k) { return card(c, { style: "--k:" + Math.min(k, 16) }); }).join("") + "</div>";
    slide(cardsEl);
    if (morph) { var m = morph; morph = null; runMorph(m); }
  }

  // Branches: focus, its children, and the active child's children, joined by curves; long families fold
  var SHOW = 7, more = {};
  function drawBranches() {
    var f = byId[focus], ch = sorted(focus);
    if (!active || byId[active].p !== focus) active = null;
    var cut = function (list, key) {
      if (more[key] || list.length <= SHOW + 1) return { list: list, rest: 0 };
      return { list: list.slice(0, SHOW), rest: list.length - SHOW };
    };
    var c1 = cut(ch, focus), act = active ? byId[active] : null, gc = act ? sorted(act.i) : [], c2 = act ? cut(gc, act.i) : null;
    var col = function (items, key, rest, cls) {
      return '<div class="br__col ' + cls + '">' + items.map(function (c) { return card(c, { cls: c.i === active ? "is-active" : "" }); }).join("") +
        (rest ? '<button type="button" class="br__more" data-more="' + key + '">' + rest + " more</button>" : "") + "</div>";
    };
    branchEl.innerHTML = '<svg class="br__links" aria-hidden="true"></svg><div class="br__cols">' +
      '<div class="br__col br__col--root">' + card(f, { cls: "cd--head" }) + "</div>" +
      col(c1.list, focus, c1.rest, "br__col--kids") +
      (act ? col(c2.list, act.i, c2.rest, "br__col--grand") : '<div class="br__col br__col--grand br__col--empty"><p>Select a question to see what sits beneath it.</p></div>') +
      "</div>";
    slide(branchEl);
    requestAnimationFrame(linkBranches);
  }
  function linkBranches() {
    if (view !== "branches") return;
    var svg = branchEl.querySelector(".br__links"); if (!svg) return;
    var box = branchEl.getBoundingClientRect(), stacked = getComputedStyle(branchEl.querySelector(".br__cols")).gridTemplateColumns.split(" ").length < 3;
    svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    if (stacked) { svg.innerHTML = ""; return; }
    var curve = function (a, b, on) {
      var r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect();
      var x1 = r1.right - box.left, y1 = r1.top + r1.height / 2 - box.top, x2 = r2.left - box.left, y2 = r2.top + Math.min(r2.height / 2, 28) - box.top, mx = (x1 + x2) / 2;
      return '<path class="' + (on ? "is-on" : "") + '" d="M' + x1 + " " + y1 + "C" + mx + " " + y1 + " " + mx + " " + y2 + " " + x2 + " " + y2 + '"/>';
    };
    var rootCard = branchEl.querySelector(".br__col--root .cd"), s = "";
    branchEl.querySelectorAll(".br__col--kids > *").forEach(function (k) { s += curve(rootCard, k, k.classList.contains("is-active")); });
    var a = branchEl.querySelector(".br__col--kids .is-active");
    if (a) branchEl.querySelectorAll(".br__col--grand > *").forEach(function (k) { s += curve(a, k, true); });
    svg.innerHTML = s;
  }

  function drawView() {
    drawCrumbs();
    if (view === "cards") drawCards();
    else if (view === "branches") drawBranches();
  }
  function zoom(i) { focus = i; active = null; drawView(); }

  // clicks: a card selects; one with questions beneath it opens (Cards drills in; Branches makes it the active child,
  // or shifts the tree along when it's already in the third column)
  function onCard(e) {
    var z = e.target.closest("[data-z]"); if (z) { zoom(z.dataset.z); return; }
    var m = e.target.closest("[data-more]"); if (m) { more[m.dataset.more] = 1; drawBranches(); return; }
    var c = e.target.closest(".cd"); if (!c) return;
    var i = c.dataset.i, n = byId[i], has = sorted(i).length > 0;
    if (view === "cards") {
      if (i === focus) { if (n.p) { takeMorph(c, "out", i); zoom(n.p); } return; }
      if (has) { takeMorph(c, "in", i); focus = i; }
    } else {
      if (i === focus) { if (n.p) { active = focus; focus = n.p; } }
      else if (n.p === focus) { active = has ? i : null; }
      else if (has) { focus = n.p; active = i; }
    }
    // on phones the panel is a sheet over the cards, so opening a branch doesn't also raise it
    if (has && matchMedia("(max-width: 960px)").matches && i !== sel) { drawView(); return; }
    select(i, { focus: false, keep: true });
    var again = e.currentTarget.querySelector('.cd[data-i="' + i + '"]:not(.cd--head)') || e.currentTarget.querySelector('.cd[data-i="' + i + '"]');
    if (again && e.detail === 0) again.focus({ preventScroll: true });  // keyboard: keep focus on the card just rebuilt
  }
  cardsEl.addEventListener("click", onCard);
  branchEl.addEventListener("click", onCard);
  crumbs.addEventListener("click", function (e) {
    var b = e.target.closest("[data-z]"); if (!b) return;
    var h = cardsEl.querySelector(".cd--head");
    if (h && byId[focus].p === b.dataset.z) takeMorph(h, "out", focus);  // one level up: the header shrinks back into the grid
    zoom(b.dataset.z);
  });
  // the left card is sticky, so the curves are redrawn as the page scrolls to stay joined to it
  var linkQueued = false;
  function relink() {
    if (view !== "branches" || linkQueued) return;
    linkQueued = true;
    requestAnimationFrame(function () { linkQueued = false; linkBranches(); });
  }
  window.addEventListener("resize", relink);
  window.addEventListener("scroll", relink, { passive: true });

  function render() { renderList(); drawView(); }
  // the view switch: a cream track with a white pill that slides to the chosen view
  var sw = document.querySelector(".viewsw"), pill = sw.querySelector(".viewsw__pill");
  function placePill() {
    var b = sw.querySelector('[aria-pressed="true"]');
    pill.style.width = b.offsetWidth + "px"; pill.style.transform = "translateX(" + (b.offsetLeft - 4) + "px)";
  }
  placePill();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePill);
  window.addEventListener("resize", placePill);
  requestAnimationFrame(function () { requestAnimationFrame(function () { sw.classList.add("is-ready"); }); });
  function setView(v) {
    view = v;
    document.querySelectorAll(".viewsw button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.v === v); });
    placePill();
    $("#t-visual").hidden = v === "list"; cardsEl.hidden = v !== "cards"; branchEl.hidden = v !== "branches";
    outline.hidden = v !== "list"; $("#t-collapse").hidden = v !== "list";
    if (sel && v !== "list" && !inView(sel)) focus = byId[sel].p || root.i;
    if (v === "branches" && sel && byId[sel].p === focus && sorted(sel).length) active = sel;  // show what sits beneath the selection
    lastDepth = v === "list" ? depth[focus] : -1;  // a fresh view makes its entrance
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
  // switching between questions, the panel fades out quickly, takes the new question, then fades back in as it eases to
  // its new height (the swap used to jump); a fade already under way just picks up the latest selection when it lands.
  // On phones the panel is a sheet that slides on its own, so it swaps straight away there
  var shownKey = null, swapping = false;
  function showDetail() {
    var key = sel || "", first = shownKey === null;
    if (swapping) { shownKey = key; return; }
    if (first || key === shownKey || REDUCE || matchMedia("(max-width: 960px)").matches) { shownKey = key; fillDetail(); return; }
    shownKey = key; swapping = true;
    var h0 = detail.offsetHeight;
    var out = detail.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, easing: "ease-out", fill: "forwards" });
    out.onfinish = function () {
      swapping = false;
      fillDetail();
      var h1 = detail.offsetHeight;
      out.cancel();
      detail.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 170, easing: "ease-out" });
      if (Math.abs(h1 - h0) > 1) {
        detail.style.overflow = "hidden";
        var grow = detail.animate([{ height: h0 + "px" }, { height: h1 + "px" }], { duration: 220, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)" });
        grow.onfinish = grow.oncancel = function () { detail.style.overflow = ""; };
      }
    };
  }
  function fillDetail() {
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
    var html = '<button type="button" class="dt__close btn-q">Close</button>';
    html += '<nav class="dt__path" aria-label="Where it sits">' + ['<button type="button" data-go="">The question</button>'].concat(path.map(function (p) {
      return '<button type="button" data-go="' + p.i + '">' + esc(label(p)) + "</button>";
    })).join('<span aria-hidden="true">/</span>') + "</nav>";
    html += '<p class="dt__k">' + kind(n) + (n.ease ? " that eases the disruption" : "") + "</p>";
    html += '<h2 class="dt__t">' + esc(label(n)) + "</h2>";
    if (n.s && n.s !== n.t) html += '<p class="dt__exact"><span>Exact wording</span>' + esc(n.t) + "</p>";
    if (n.pr != null) {
      html += '<div class="dt__p"><span class="num">' + n.pr + '<small>%</small></span><span>chance' +
        (n.k === "consequence" ? ", if the driver above it happens" : n.c && n.c.dl ? " by " + fmtDate(n.c.dl) : " by " + fmtDate(L.meta.to)) +
        '<br><span class="dt__band">likely between ' + Math.max(0, n.pr - n.bd) + " and " + Math.min(100, n.pr + n.bd) + "%</span>" +
        (n.dd ? '<br><span class="dt__day ' + (n.dd > 0 ? "is-up" : "is-down") + '">' + (n.dd > 0 ? "Up " : "Down ") + Math.abs(n.dd) + "%" + " since yesterday</span>" : "") +
        "</span></div>";
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
      (size[n.i] - 1 > ch.length ? ", " + (size[n.i] - 1).toLocaleString("en-US") + " below it in all" : "") + ".</p>";
    if (n.b) html += '<p class="dt__sub">' + (n.b === "d" ? "Raised by a document Totality retrieved." : "Raised from the model’s own knowledge.") + "</p>";
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
    if (sel) {
      reveal(sel);
      if (!opts.keep && (opts.zoom || !inView(sel))) { focus = byId[sel].p || root.i; active = view === "branches" && sorted(sel).length ? sel : null; }
    }
    render(); showDetail();
    if (opts.hash !== false) { try { history.replaceState(null, "", sel ? "#" + sel : location.pathname); } catch (x) {} }
    var el = sel && document.getElementById("r-" + sel);
    if (el) {
      if (opts.focus !== false) el.focus({ preventScroll: true });
      if (opts.scroll && view === "list") el.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }
  // a branch in the list drops open and folds shut: the outline is rebuilt on every change, so the group under the row is
  // animated from no height to its own after an open, and to no height before a close (its chevron turns with it)
  var EASE = "cubic-bezier(0.3, 0.7, 0.2, 1)", busy = false;
  function grpOf(i) { var r = document.getElementById("r-" + i), g = r && r.nextElementSibling; return g && g.classList.contains("grp") ? g : null; }
  function dropTime(h) { return 240 + Math.min(h, 1400) / 7; }
  function drop(g, from, to, done) {
    g.style.overflow = "hidden";
    var a = g.animate([{ height: from + "px", opacity: from ? 1 : 0 }, { height: to + "px", opacity: to ? 1 : 0 }], { duration: dropTime(Math.max(from, to)), easing: EASE });
    a.onfinish = a.oncancel = function () { g.style.overflow = ""; if (done) done(); };
  }
  function turn(i, from, to) {
    var c = document.querySelector("#r-" + i + " .r__chev");
    if (c) c.animate([{ transform: from }, { transform: to }], { duration: 220, easing: EASE });
  }
  var SHUT = "rotate(-45deg)", OPEN = "rotate(45deg) translate(-2px, -2px)";
  function setOpen(i, v, then) {
    var g = grpOf(i);
    if (REDUCE || busy || v === !!open[i] || (!v && !g)) { open[i] = v; then(); return; }
    if (v) {
      open[i] = true; then();
      g = grpOf(i); turn(i, SHUT, OPEN);
      if (g) drop(g, 0, g.offsetHeight);
    } else {
      busy = true; turn(i, OPEN, SHUT);
      drop(g, g.offsetHeight, 0, function () { busy = false; open[i] = false; then(); });
      g.style.height = "0px";  // stay shut between the animation's end and the redraw
    }
  }
  function toggle(i) {
    setOpen(i, !open[i], function () { render(); var el = document.getElementById("r-" + i); if (el) el.focus({ preventScroll: true }); });
  }

  outline.addEventListener("click", function (e) {
    var r = e.target.closest(".r"); if (!r) return;
    var i = r.dataset.i, has = (kids[i] || []).length > 0;
    if (e.target.closest(".r__tw") && has) { toggle(i); return; }
    // on phones the panel is a sheet over the outline, so the first tap on a closed branch only opens it
    if (has && !open[i] && matchMedia("(max-width: 960px)").matches) { toggle(i); return; }
    if (sel === i && has) { setOpen(i, !open[i], function () { select(i); }); return; }
    if (has && !open[i]) { setOpen(i, true, function () { select(i); }); return; }
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
  $("#t-declined").addEventListener("change", function (e) { showDeclined = e.target.checked; partition(); if (!visible(byId[focus])) focus = root.i; render(); });
  $("#t-aside").addEventListener("change", function (e) { showAside = e.target.checked; partition(); if (!visible(byId[focus])) focus = root.i; render(); });
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
