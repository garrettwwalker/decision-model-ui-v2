/* Agents: a live dashboard of Penumbra steering a team's agents, one question on the watchlist at a time.
   Information agents sense; the Totality engine weighs what they find, retasks them toward what would most change
   the decision, and rewrites the briefs of the workflow agents that act. For the selected question the page shows
   what each linked agent is surfacing, which are in trouble and how to fix it, what moved the forecast, and what
   waits for the decision-maker. Agents belong to the organization and can serve several questions at once (a broken
   one shows on every question it serves); a new question links existing agents, and Totality builds its first
   forecast as they report. A simulated clock runs from 08:20 and reports arrive as it does.
   Manual by default: every change waits in the queue; in automatic mode, small reversible changes under the user's
   limit go through on their own. The morning follows the daily brief (Tuesday 6 October, Hormuz at 27% at 06:00) and
   the workbench's other events (Red Sea 34%, Gebze strike 18%, feeder sanctions 19%).
   Times are minutes after 06:00; money in $M unless noted; every figure is illustrative. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var REDUCE = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  var money = function (m) { return DB.money(m, 1); };
  var hhmm = function (m) { var h = 6 + Math.floor(m / 60), n = m % 60; return (h < 10 ? "0" : "") + h + ":" + (n < 10 ? "0" : "") + n; };
  var ago = function (m) { var d = S.t - m; return d < 1 ? "just now" : d < 60 ? d + " min ago" : Math.floor(d / 60) + " h " + (d % 60) + " min ago"; };
  var lower = function (s) { return s.charAt(0).toLowerCase() + s.slice(1); };

  /* ---------- the organization's agents ----------
     tags are the words Totality matches when suggesting agents for a new question */
  var POOL = [
    // information agents
    { id: "traffic", kind: "sense", name: "Strait traffic", what: "AIS transits through Hormuz", every: "Hourly", checks: 3, cost: 0.12, auto: true,
      brief: "Count daily transits against the 90-day normal; flag turn-backs at the entrance.", tags: ["hormuz", "strait", "tanker", "shipping", "transit", "gulf", "iran"] },
    { id: "notices", kind: "sense", name: "War-risk notices", what: "Underwriters' listed areas and broker circulars", every: "Every 15 minutes", checks: 9, cost: 0.31, auto: true,
      brief: "Watch for any extension of the listed area to the whole strait. Retasked at 06:45: three more brokers, every 15 minutes.", tags: ["insurance", "war-risk", "underwriter", "premium", "cover", "shipping", "gulf"] },
    { id: "ports", kind: "sense", name: "Port agents' inboxes", what: "Berth lists from Jebel Ali and Khor Fakkan", every: "Twice a day", checks: 2, cost: 0.05, auto: true,
      brief: "Ask Jebel Ali agents about Thursday calls; confirm open berth space at Khor Fakkan.", tags: ["port", "berth", "jebel ali", "dubai", "uae", "container", "saudi", "terminal", "feeder"] },
    { id: "wire", kind: "sense", name: "Diplomatic wire", what: "Muscat talks and naval statements", every: "Hourly", checks: 3, cost: 0.18, auto: true,
      brief: "Watch for a date for a second round of talks, or an exercise announced in the shipping lanes.", tags: ["talks", "diplomatic", "iran", "oman", "navy", "naval", "sanction", "government"] },
    { id: "supply", kind: "sense", name: "Resin suppliers", what: "Producer notices from Jubail and Mesaieed", every: "Daily", checks: 1, cost: 0.02, auto: true,
      brief: "Watch for force-majeure notices or allocation cuts on polymer grades Gebze and Pune use.", tags: ["resin", "polymer", "supplier", "supply", "force majeure", "jubail", "plant"] },
    { id: "rates", kind: "sense", name: "Freight and fuel", what: "Spot rates and Fujairah bunker", every: "Hourly", checks: 3, cost: 0.09, auto: true,
      brief: "Track Gulf spot rates and Fujairah VLSFO until the cover and hedge are bound.", tags: ["freight", "rate", "fuel", "bunker", "shipping", "container", "cost", "price"] },
    { id: "redtraffic", kind: "sense", name: "Red Sea transits", what: "AIS transits through Bab el-Mandeb", every: "Hourly", checks: 3, cost: 0.1, auto: true,
      brief: "Count transits through Bab el-Mandeb; flag diversions south of Socotra.", tags: ["red sea", "suez", "bab el-mandeb", "shipping", "transit", "yemen"] },
    { id: "houthi", kind: "sense", name: "Houthi statements", what: "Spokesmen, channels and claimed attacks", every: "Every 30 minutes", checks: 5, cost: 0.14, auto: true,
      brief: "Watch for threats naming merchant ships or carriers, and any claimed strike.", tags: ["houthi", "yemen", "red sea", "attack", "missile", "drone"] },
    { id: "union", kind: "sense", name: "Union channels", what: "Metalworkers' union statements and votes", every: "Hourly", checks: 2, cost: 0.03, auto: true,
      brief: "Watch for a strike vote, a rejected offer or a call to walk out at Gebze.", tags: ["strike", "union", "labour", "labor", "metalworkers", "gebze", "wage", "plant"] },
    { id: "press", kind: "sense", name: "Local press", what: "Turkish business and regional papers", every: "Twice a day", checks: 2, cost: 0.02, auto: true,
      brief: "Summarize coverage of the national metalworkers' talks and anything on Gebze.", tags: ["turkey", "turkish", "gebze", "strike", "press", "news", "election"] },
    { id: "sanc", kind: "sense", name: "Sanctions lists", what: "US, EU and UK designations", every: "Every 30 minutes", checks: 6, cost: 0.08, auto: true,
      brief: "Screen the two ME4 feeders, their managers and owners against every new designation.", tags: ["sanction", "ofac", "designation", "list", "feeder", "vessel", "export control"] },
    { id: "registry", kind: "sense", name: "Vessel registry", what: "Flag registries and class societies", every: "Daily", checks: 1, cost: 0.02, auto: true,
      brief: "Watch both feeders' flag and class status for reviews or withdrawals.", tags: ["registry", "flag", "vessel", "feeder", "ship", "class"] },
    { id: "risk", kind: "sense", name: "Supplier risk monitor", what: "Credit, ownership and adverse news on suppliers", every: "Daily", checks: 0, cost: 0, auto: true,
      brief: "Not linked to any question yet.", tags: ["supplier", "supply", "credit", "bankrupt", "ownership", "vendor", "procurement"] },
    { id: "digest", kind: "sense", name: "News digest", what: "Reuters, FT and regional wires", every: "Hourly", checks: 0, cost: 0, auto: true,
      brief: "Not linked to any question yet.", tags: ["news", "election", "government", "policy", "tariff", "trade", "port", "saudi", "turkey", "china"] },
    { id: "customs", kind: "sense", name: "Customs filings", what: "Import and export declarations for Halvorsen's lanes", every: "Daily", checks: 0, cost: 0, auto: true,
      brief: "Not linked to any question yet.", tags: ["customs", "tariff", "import", "export", "border", "trade", "duty"] },
    { id: "weather", kind: "sense", name: "Weather and storms", what: "Cyclone and port-weather warnings", every: "Every 3 hours", checks: 0, cost: 0, auto: true,
      brief: "Not linked to any question yet.", tags: ["weather", "storm", "cyclone", "typhoon", "flood"] },
    // workflow agents
    { id: "buyer", kind: "act", name: "Resin buyer", what: "The 7,000 t bridge-buy from Singapore", owner: "VP Procurement", checks: 4, cost: 0.4, auto: false,
      brief: "Brief v2: up to $1,240/t, split the order, ask for a force-majeure carve-out.", tags: ["resin", "supply", "procurement", "contract", "negotiat"] },
    { id: "booking", kind: "act", name: "Booking agent", what: "Four sailings diverted to Khor Fakkan", owner: "VP Logistics", checks: 2, cost: 0.06, auto: false,
      brief: "Hold four slots on option until the Thursday 14:00 cutoff.", tags: ["booking", "port", "container", "shipping", "logistics", "dubai"] },
    { id: "cover", kind: "act", name: "Cover broker", what: "War-risk cover and the Q4 bunker hedge", owner: "Treasury", checks: 3, cost: 0.08, auto: false,
      brief: "Collect quotes for Gulf calls; hold the best one open.", tags: ["insurance", "cover", "hedge", "war-risk", "treasury", "fuel"] },
    { id: "letters", kind: "act", name: "Customer letters", what: "The five largest GCC accounts", owner: "Layla, GCC key accounts", checks: 0, cost: 0, auto: true,
      brief: "Draft delay notices as bookings change; never send without Layla.", tags: ["customer", "gcc", "saudi", "delay", "letter", "account"] },
    { id: "caperoute", kind: "act", name: "Cape routing", what: "Asia–Europe parts rerouted round Africa", owner: "VP Logistics", checks: 2, cost: 0.05, auto: false,
      brief: "Hold Cape space for Gebze's compressor parts on the 14 October sailing.", tags: ["cape", "red sea", "suez", "routing", "shipping", "logistics"] },
    { id: "labour", kind: "act", name: "Labour relations", what: "Offers and talking points for the Gebze talks", owner: "HR director, Gebze", checks: 1, cost: 0.02, auto: true,
      brief: "Prepare a revised offer and talking points; never send without the HR director.", tags: ["strike", "union", "labour", "labor", "wage", "gebze"] },
    { id: "stock", kind: "act", name: "Stock planner", what: "Finished-goods buffer at Gebze", owner: "Elif, Gebze production", checks: 1, cost: 0.01, auto: false,
      brief: "Model a two-week finished-goods buffer and the overtime it needs.", tags: ["stock", "inventory", "buffer", "production", "gebze", "plant"] },
    { id: "feedbook", kind: "act", name: "Feeder rebooking", what: "Jebel Ali boxes on the ME4 feeders", owner: "VP Logistics", checks: 1, cost: 0.03, auto: false,
      brief: "Line up space with two other feeder operators for next week's Jebel Ali boxes.", tags: ["feeder", "booking", "jebel ali", "container", "sanction"] },
    { id: "contract", kind: "act", name: "Contract assistant", what: "Drafts and redlines supplier contracts", owner: "Legal", checks: 0, cost: 0, auto: false,
      brief: "Not linked to any question yet.", tags: ["contract", "supplier", "legal", "clause", "force majeure", "negotiat"] },
    { id: "procure", kind: "act", name: "Procurement desk", what: "Requests quotes from approved suppliers", owner: "VP Procurement", checks: 0, cost: 0, auto: false,
      brief: "Not linked to any question yet.", tags: ["supplier", "procurement", "quote", "sourcing", "resin", "parts"] }
  ];
  var AGENTS = { hub: { id: "hub", name: "Totality", kind: "hub" } };
  POOL.forEach(function (a) { AGENTS[a.id] = a; });

  /* ---------- problems, and the fixes the user can apply (an agent's, so they show on every question it serves) ---------- */
  var PROBLEMS = {
    ports: { at: 112, title: "Khor Fakkan's agent stopped answering", text: "Its mailbox has bounced since 07:52, so the berth counts are going stale.",
      fixes: [["Switch to the terminal's public berth list", "Switched to the terminal's public berth list; counts are current again."],
              ["Ask Farah's team to call the agent", "Farah's team reached the agent; the mailbox is back."]] },
    wire: { at: 118, title: "Two sources went behind a paywall", text: "Coverage of the Muscat talks is down to 3 of 5 sources, so a date for a second round could reach us late.",
      fixes: [["Add the licensed news feed ($300 a day)", "Licensed feed added; coverage back to 5 of 5 sources.", 0.3],
              ["Accept 3 of 5 for now", "Coverage left at 3 of 5; Totality widens the band on the talks question."]] },
    cover: { at: 140, title: "The broker has gone quiet", text: "No reply since 06:15, and the best war-risk quote expires on Wednesday.",
      fixes: [["Escalate to Treasury", "Treasury called the broker; the quote is confirmed until Wednesday 17:00."],
              ["Ask a second broker to quote", "A second broker is quoting; an answer is due by 11:00."]] },
    houthi: { at: 125, title: "A channel it reads was taken down", text: "One of its three sources went offline at 08:05, so a claimed attack could reach us late.",
      fixes: [["Add the monitored mirror channel", "Mirror channel added; back to three sources."],
              ["Lean on the news digest for now", "Covering with the news digest until the channel returns."]] }
  };
  Object.keys(PROBLEMS).forEach(function (k) { AGENTS[k].problem = PROBLEMS[k]; });

  /* ---------- the watchlist ----------
     feed kinds: find (a report), prob (a problem), fix (a problem resolved), change (a retask, a decision or a new brief);
     dp moves the forecast, in points; `coming` arrives as the clock runs */
  var QUERIES = [
    { id: "hormuz", short: "Hormuz closes", p0: 27, steer: true,
      about: "The chance the Strait of Hormuz is closed for 7+ days in the next 30, refreshed as the agents report.",
      sense: ["traffic", "notices", "ports", "wire", "supply", "rates"], act: ["buyer", "booking", "cover", "letters"],
      deadline: ["Wed 7 Oct", "The best war-risk quote expires", "cover"],
      feed: [
        { at: 0, agent: "hub", kind: "change", text: "Morning run at 27%. Briefs v1 sent to the four workflow agents." },
        { at: 42, agent: "traffic", kind: "find", text: "Transits at 61% of normal overnight; three tankers turned back at the entrance.", dp: 3 },
        { at: 45, agent: "hub", kind: "change", text: "Retasked war-risk notices (every 15 minutes, three more brokers) and the port agents (Thursday calls)." },
        { at: 70, agent: "rates", kind: "find", text: "Fujairah bunker up 4% since Monday.", impact: "Hedge repriced" },
        { at: 90, agent: "notices", kind: "find", text: "Two brokers circulate a draft listing the whole strait from Thursday.", dp: 3 },
        { at: 90, agent: "ports", kind: "find", text: "Two carriers cancel Thursday calls at Jebel Ali.", impact: "Booking case firmer" },
        { at: 96, agent: "hub", kind: "change", text: "Brief v2 to the resin buyer, booking agent and cover broker; the big moves wait for you." },
        { at: 112, agent: "ports", kind: "prob", text: "Khor Fakkan's agent stopped answering; berth counts going stale." },
        { at: 118, agent: "wire", kind: "prob", text: "Two of five sources went behind a paywall." },
        { at: 130, agent: "buyer", kind: "find", text: "Counter-offer: 4,000 t at $1,215/t by 20 October; the other 3,000 t at $1,260/t in November.", impact: "Protects up to $8.6M" },
        { at: 132, agent: "hub", kind: "change", text: "Proposed brief v3 for the resin buyer and an hourly watch on resin suppliers." },
        { at: 140, agent: "cover", kind: "prob", text: "The broker hasn't replied since 06:15; the best quote expires Wednesday." }
      ],
      coming: [
        { at: 142, agent: "traffic", kind: "find", text: "08:00 count: transits steady at 58% of normal.", impact: "No change" },
        { at: 145, agent: "notices", kind: "find", text: "A third broker repeats the draft listing; the committee hasn't confirmed it.", dp: 1 },
        { at: 149, agent: "rates", kind: "find", text: "Gulf spot rates up 6% overnight.", impact: "Freight budget at risk" },
        { at: 153, agent: "wire", kind: "find", text: "Oman's foreign ministry: contacts continue; still no date for talks.", impact: "No change" },
        { at: 158, agent: "booking", kind: "find", text: "Khor Fakkan: 420 TEU of berth space left this week, down from 600.", impact: "Slots tightening" },
        { at: 163, agent: "traffic", kind: "find", text: "Two tankers resume transits under naval escort.", dp: -1 },
        { at: 168, agent: "buyer", kind: "find", text: "The supplier holds its offer until 17:00 today.", impact: "Deadline today" },
        { at: 175, agent: "notices", kind: "find", text: "The listing committee meets Wednesday; a decision is expected Thursday morning.", impact: "No change" }
      ],
      asks: [
        { q: "Will underwriters list the whole strait on Thursday?", v: 1.9, agent: "notices" },
        { q: "Will a Jubail producer declare force majeure?", v: 0.6, agent: "supply" },
        { q: "Will the Muscat talks set a date for a second round?", v: 0.4, agent: "wire" },
        { q: "Will Khor Fakkan's berth space last until Thursday?", v: 0.3, agent: "ports" }
      ],
      queue: [
        { id: "q-supply", kind: "Retask", agent: "supply", cost: 0.0024, rev: true,
          title: "Watch resin suppliers hourly, not daily",
          why: "A force-majeure notice from Jubail would make the last 3,000 t urgent. Learning of it a day earlier would be worth about $0.6M, because the last 3,000 t could be bought sooner.",
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
          why: "With carriers cancelling Thursday calls at Jebel Ali, the slots will go before the 14:00 cutoff. Booking now protects $7.6M at this morning's 27% chance of closure, or $9.3M at the current 33%.",
          diff: [["Slots", "4 on option", "4 booked"], ["Cutoff", "Thu 14:00", "Booked today"]], costText: "$0.90M, commits the bookings" },
        { id: "q-cover", kind: "Strategy", agent: "cover", cost: 1.36, rev: false,
          title: "Bind war-risk cover before Thursday's listing",
          why: "If the whole strait is listed on Thursday, today's quote is gone and premiums reprice upward.",
          diff: [["Quote", "Held open", "Bound"], ["Bunker hedge", "Quoted", "Placed at today's price"]], costText: "$1.36M, binds cover" }
      ] },
    { id: "redsea", short: "Red Sea shuts", p0: 31,
      about: "The chance the Red Sea is shut to commercial traffic in the next 30 days, Suez lost and Asia–Europe round the Cape.",
      sense: ["redtraffic", "houthi", "rates"], act: ["caperoute", "letters"],
      deadline: ["Fri 9 Oct", "The Cape space hold expires", "caperoute"],
      briefs: { rates: "Track Asia–Europe spot rates via Suez and via the Cape.", letters: "Draft delay notices for Jeddah-bound orders if Suez routings stop; never send without Layla." },
      feed: [
        { at: 0, agent: "hub", kind: "change", text: "Morning run at 31%." },
        { at: 55, agent: "redtraffic", kind: "find", text: "Bab el-Mandeb transits down 12% on last week.", dp: 2 },
        { at: 80, agent: "houthi", kind: "find", text: "A spokesman threatens ships 'linked to the blockade'.", dp: 1 },
        { at: 100, agent: "rates", kind: "find", text: "Asia–Europe spot via the Cape up 9%.", impact: "Cape routing dearer" },
        { at: 125, agent: "houthi", kind: "prob", text: "A channel it reads was taken down; one of three sources lost." },
        { at: 128, agent: "caperoute", kind: "find", text: "Cape space for Gebze's compressor parts: 6 FEU open on the 14 October sailing.", impact: "Option open" }
      ],
      coming: [
        { at: 150, agent: "redtraffic", kind: "find", text: "Two container ships divert south of Socotra.", dp: 1 },
        { at: 160, agent: "caperoute", kind: "find", text: "The carrier holds the 14 October space until Friday.", impact: "Deadline Friday" },
        { at: 171, agent: "rates", kind: "find", text: "Suez transit insurance quotes up a third.", impact: "Suez dearer" }
      ],
      asks: [
        { q: "Will a merchant ship be struck in the Red Sea this month?", v: 1.2, agent: "houthi" },
        { q: "Will the big carriers suspend Suez routings?", v: 0.8, agent: "redtraffic" },
        { q: "How fast will Cape rates climb?", v: 0.3, agent: "rates" }
      ],
      queue: [
        { id: "q-cape", kind: "Strategy", agent: "caperoute", cost: 0.4, rev: false,
          title: "Pre-book Cape space for Gebze's compressor parts",
          why: "If Suez routings stop, Gebze runs short of compressors in late November. Six FEU on the 14 October sailing cover the gap.",
          diff: [["Space", "None", "6 FEU, 14 Oct sailing"], ["Route", "Suez", "Cape of Good Hope"]], costText: "$0.40M, commits the space" },
        { id: "q-redwatch", kind: "Retask", agent: "redtraffic", cost: 0.00002, rev: true,
          title: "Count Bab el-Mandeb transits every 30 minutes",
          why: "Diversions show up in the transit count a day before carriers announce them.",
          diff: [["How often", "Hourly", "Every 30 minutes"]], costText: "$20 of compute a day" }
      ] },
    { id: "strike", short: "Gebze strike", p0: 16,
      about: "The chance metalworkers strike at the Gebze plant before their contract expires on 1 November.",
      sense: ["union", "press"], act: ["labour", "stock"],
      deadline: ["Tue 20 Oct", "The union's strike vote", "union"],
      feed: [
        { at: 0, agent: "hub", kind: "change", text: "Morning run at 16%." },
        { at: 50, agent: "union", kind: "find", text: "The union calls a members' vote for 20 October.", dp: 2 },
        { at: 95, agent: "press", kind: "find", text: "Local press: talks 'constructive' after Monday's session.", impact: "No change" },
        { at: 120, agent: "stock", kind: "find", text: "Finished goods at Gebze cover 9 days of shipments.", impact: "Thin buffer" }
      ],
      coming: [
        { at: 155, agent: "union", kind: "find", text: "The union rejects the 6% offer publicly.", dp: 3 },
        { at: 172, agent: "labour", kind: "find", text: "A revised offer is drafted: 8% over two years.", impact: "Draft ready" }
      ],
      asks: [
        { q: "Will members vote to strike on 20 October?", v: 0.9, agent: "union" },
        { q: "Will the national metalworkers' deal settle first?", v: 0.5, agent: "press" }
      ],
      queue: [
        { id: "q-stock", kind: "Strategy", agent: "stock", cost: 0.35, rev: false,
          title: "Build two weeks of finished-goods stock at Gebze",
          why: "Nine days of stock won't last a strike of the usual length. Two Saturday shifts take it to fourteen.",
          diff: [["Buffer", "9 days", "14 days"], ["Overtime", "None", "Two Saturday shifts"]], costText: "$0.35M in overtime and storage" },
        { id: "q-offer", kind: "Draft", agent: "labour", cost: 0, rev: true,
          title: "Draft a revised offer for the union",
          why: "A two-year term with a higher first year has settled similar disputes in the region.",
          diff: [["Offer", "6%, one year", "8%, two years (draft)"]], costText: "No cost; nothing is sent" }
      ] },
    { id: "feeders", short: "Feeder sanctions", p0: 15,
      about: "The chance sanctions hit the two ME4 feeders Halvorsen uses into Jebel Ali this month.",
      sense: ["sanc", "registry", "ports"], act: ["feedbook"],
      deadline: ["Thu 8 Oct", "The flag registry's review", "registry"],
      briefs: { ports: "Confirm which Jebel Ali boxes sail on the two ME4 feeders this week and next." },
      feed: [
        { at: 0, agent: "hub", kind: "change", text: "Morning run at 15%." },
        { at: 60, agent: "sanc", kind: "find", text: "The feeders' technical manager was added to a UK list overnight.", dp: 3 },
        { at: 85, agent: "registry", kind: "find", text: "One feeder's flag registry opens a review.", dp: 1 },
        { at: 112, agent: "ports", kind: "prob", text: "Khor Fakkan's agent stopped answering; berth counts going stale." },
        { at: 130, agent: "feedbook", kind: "find", text: "Two other operators have space on next week's Jebel Ali feeders.", impact: "Fallback open" }
      ],
      coming: [
        { at: 158, agent: "sanc", kind: "find", text: "No US designation yet; the EU list updates Friday.", impact: "No change" },
        { at: 175, agent: "registry", kind: "find", text: "The registry's review is due Thursday.", impact: "Deadline Thursday" }
      ],
      asks: [
        { q: "Will OFAC designate the two feeders?", v: 1.1, agent: "sanc" },
        { q: "Will the flag registry deregister them?", v: 0.6, agent: "registry" }
      ],
      queue: [
        { id: "q-feeder", kind: "Strategy", agent: "feedbook", cost: 0.15, rev: false,
          title: "Move next week's Jebel Ali boxes to another feeder operator",
          why: "A designation would strand boxes already loaded. Moving next week's 38 TEU now costs less than recovering them.",
          diff: [["Operator", "ME4 feeders", "Two other operators"], ["Boxes", "None moved", "38 TEU"]], costText: "$0.15M, commits the bookings" }
      ] }
  ];
  QUERIES.forEach(function (q) {
    q.p = q.p0; q.feed.forEach(function (f) { if (f.dp) q.p += f.dp; });
    q.queue.forEach(function (x) { x.state = "waiting"; x.q = q; });
    q.briefs = q.briefs || {};
  });
  var Q = QUERIES[0];

  var S = { mode: "manual", limit: 0.01, t: 140, sel: "hub", filter: "all", extra: 0 };
  var LIMITS = [[0.001, "$1k"], [0.01, "$10k"], [0.05, "$50k"]];
  var BUDGET = 25; // $k a day for the agents' compute and data
  var linked = function (q) { return q.sense.concat(q.act).map(function (id) { return AGENTS[id]; }); };
  var spend = function () { return linked(Q).reduce(function (s, a) { return s + a.cost; }, 0) + S.extra; };
  var briefOf = function (a) { return Q.briefs[a.id] || a.brief; };
  var queries = function (a) { return QUERIES.filter(function (q) { return q.sense.indexOf(a.id) >= 0 || q.act.indexOf(a.id) >= 0; }); };

  /* ---------- each agent's state, for the selected question ---------- */
  function waitingFor(id, q) { return (q || Q).queue.filter(function (x) { return x.agent === id && x.state === "waiting"; }); }
  function status(a, q) {
    if (a.problem) return "bad";
    if (a.paused) return "off";
    if (waitingFor(a.id, q).length) return "wait";
    return "ok";
  }
  var ST = { ok: "Working", wait: "Waiting for you", bad: "Problem", off: "Paused" };
  function latest(id, kinds) { for (var i = Q.feed.length - 1; i >= 0; i--) if (Q.feed[i].agent === id && (!kinds || kinds.indexOf(Q.feed[i].kind) >= 0)) return Q.feed[i]; return null; }
  function pts(dp) { return (dp > 0 ? "+" : "−") + Math.abs(dp) + (Math.abs(dp) === 1 ? " pt" : " pts"); }
  function impactText(f) { return f.dp ? pts(f.dp) : f.impact || ""; }
  function impChip(f) { var t = impactText(f); return t ? el("span", { class: "imp" }, t) : null; }
  var pText = function (q) { return q.p == null ? "…" : q.p + "%"; };

  /* ---------- who acts ---------- */
  function small(x) { return x.rev && x.cost <= S.limit + 1e-12; }
  function autoOK(x) { var a = AGENTS[x.agent]; return S.mode === "auto" && small(x) && a.auto && !x.held && !a.paused; }
  function settle() {
    // what went through stays done if you tighten the rules later; Undo puts it back in the queue
    QUERIES.forEach(function (q) {
      q.queue.forEach(function (x) { if (x.state === "waiting" && autoOK(x)) { x.state = "auto"; x.when = S.t; log(q, x.agent, "change", "Went through on its own: " + lower(x.title) + "."); } });
    });
  }
  var modeBtns = document.querySelectorAll("#mode [data-mode]");
  modeBtns.forEach(function (b) { b.addEventListener("click", function () { S.mode = b.dataset.mode; drawAll(); }); });
  var limBox = $("mode-limit");
  LIMITS.forEach(function (l) {
    var b = el("button", { type: "button", role: "radio" }, l[1]);
    b.addEventListener("click", function () { S.limit = l[0]; drawAll(); });
    l.btn = b; limBox.appendChild(b);
  });
  function drawMode() {
    modeBtns.forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.mode === S.mode)); });
    LIMITS.forEach(function (l) { l.btn.setAttribute("aria-checked", String(l[0] === S.limit)); });
    // the limit drops down in automatic mode and folds away in manual (CSS animates it; inert keeps it out of reach shut)
    $("mode-auto").classList.toggle("is-open", S.mode === "auto"); $("mode-auto").inert = S.mode !== "auto";
    $("roster").classList.toggle("is-manual", S.mode === "manual");  // no "acts on its own" column in manual
    var all = [].concat.apply([], QUERIES.map(function (q) { return q.queue; }));
    var wait = all.filter(function (x) { return x.state === "waiting"; }).length, auto = all.filter(function (x) { return x.state === "auto"; }).length;
    $("mode-now").textContent = S.mode === "manual"
      ? (wait ? wait + (wait === 1 ? " change is" : " changes are") + " waiting for you across your watchlist." : "Nothing is waiting for you.")
      : auto + " small " + (auto === 1 ? "decision" : "decisions") + " went through on " + (auto === 1 ? "its" : "their") + " own; " + wait + " " + (wait === 1 ? "waits" : "wait") + " for you.";
  }

  /* ---------- the watchlist ---------- */
  var wTabs = {};
  function drawWatch() {
    var box = $("w-list");
    QUERIES.forEach(function (q) {
      var t = wTabs[q.id];
      if (!t) {
        var b = el("button", { type: "button", role: "tab", class: "wq" });
        var name = el("span", { class: "wq__name" }), p = el("span", { class: "wq__p num" }), meta = el("span", { class: "wq__meta" });
        b.appendChild(name); b.appendChild(p); b.appendChild(meta);
        b.addEventListener("click", function () { pick(q); });
        box.appendChild(b);
        t = wTabs[q.id] = { b: b, name: name, p: p, meta: meta };
      }
      t.b.setAttribute("aria-selected", String(q === Q));
      t.name.textContent = q.short;
      t.p.textContent = pText(q);
      t.meta.innerHTML = "";
      var ag = linked(q), bad = ag.filter(function (a) { return a.problem; }).length, wait = q.queue.filter(function (x) { return x.state === "waiting"; }).length;
      t.meta.appendChild(el("span", { class: "wq__n" }, ag.length + (ag.length === 1 ? " agent" : " agents")));
      if (bad) t.meta.appendChild(el("span", { class: "st st--bad" }, bad + (bad === 1 ? " problem" : " problems")));
      if (wait) t.meta.appendChild(el("span", { class: "st st--wait" }, wait + " waiting"));
      if (!bad && !wait) t.meta.appendChild(el("span", { class: "st st--ok" }, q.p == null ? "Starting" : "All working"));
    });
  }
  function pick(q) {
    if (q === Q) return;
    Q = q; S.sel = "hub"; S.filter = "all";
    $("st-section").hidden = !Q.steer;
    buildMap(); buildRoster(); drawAll();
  }

  /* ---------- the status strip ---------- */
  var kpiEls = null;
  function drawStrip() {
    var counts = { ok: 0, wait: 0, bad: 0, off: 0 }, ag = linked(Q);
    ag.forEach(function (a) { counts[status(a)]++; });
    var wait = Q.queue.filter(function (x) { return x.state === "waiting"; }), big = wait.filter(function (x) { return !small(x); }).length;
    var items = [
      { l: Q.short, v: pText(Q), s: Q.p == null ? "Totality is building the first forecast" : Q.p0 == null ? "First forecast at " + hhmm(Q.firstAt) : pts(Q.p - Q.p0) + " since 06:00", go: function () { select("hub"); } },
      { l: "Agents working", v: (counts.ok + counts.wait) + " of " + ag.length, s: counts.bad ? counts.bad + (counts.bad === 1 ? " has a problem" : " have problems") + (counts.off ? ", " + counts.off + " paused" : "") : counts.off ? counts.off + " paused" : "No problems", bad: counts.bad > 0, go: function () { jump("attn"); } },
      { l: "Waiting for you", v: String(wait.length), s: big ? big + " commit money" : "None commit money", warn: wait.length > 0, go: function () { jump("q-title"); } },
      { l: "Agent spend today", v: "$" + spend().toFixed(1) + "k", s: "Of a $" + BUDGET + "k daily budget" },
      { l: "Next deadline", v: Q.deadline ? Q.deadline[0] : "None yet", s: Q.deadline ? Q.deadline[1] : "Totality sets one once it has a forecast", go: function () { if (Q.deadline) select(Q.deadline[2]); } }
    ];
    var box = $("d-kpis");
    if (!kpiEls) {
      kpiEls = items.map(function (it) {
        var c = el(it.go ? "button" : "div", it.go ? { type: "button", class: "dk__i" } : { class: "dk__i" });
        c.appendChild(el("span", { class: "dk__l" }));
        var v = el("span", { class: "dk__v num" }); c.appendChild(v);
        var s = el("span", { class: "dk__s" }); c.appendChild(s);
        box.appendChild(c); return { c: c, l: c.firstChild, v: v, s: s, go: null };
      });
    }
    items.forEach(function (it, i) {
      var e = kpiEls[i];
      if (e.v.textContent && e.v.textContent !== it.v && e.lastQ === Q && !REDUCE) { e.c.classList.remove("is-new"); void e.c.offsetWidth; e.c.classList.add("is-new"); }
      e.lastQ = Q;
      e.l.textContent = it.l; e.v.textContent = it.v; e.s.textContent = it.s;
      e.c.onclick = it.go || null;
      e.c.classList.toggle("is-bad", !!it.bad); e.c.classList.toggle("is-warn", !!it.warn);
    });
  }
  function jump(id) { $(id).scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "center" }); }

  /* ---------- the map ---------- */
  var board = $("loop-board"), links = $("loop-links"), hubSvg = $("hub"), tiles = {}, paths = {};
  function buildTile(a) {
    var c = el("button", { type: "button", class: "lag", id: "lag-" + a.id });
    var top = el("span", { class: "lag__top" });
    top.appendChild(el("b", null, a.name));
    var st = el("span", { class: "st" }); top.appendChild(st);
    c.appendChild(top);
    var line = el("span", { class: "lag__line" }); c.appendChild(line);
    var when = el("span", { class: "lag__when" }); c.appendChild(when);
    c.addEventListener("click", function () { select(a.id); });
    tiles[a.id] = { c: c, st: st, line: line, when: when };
    return c;
  }
  function buildMap() {
    tiles = {}; paths = {};
    $("loop-sense").innerHTML = ""; $("loop-act").innerHTML = "";
    Q.sense.forEach(function (id) { $("loop-sense").appendChild(buildTile(AGENTS[id])); });
    Q.act.forEach(function (id) { $("loop-act").appendChild(buildTile(AGENTS[id])); });
    if (!Q.sense.length) $("loop-sense").appendChild(el("p", { class: "loop__empty" }, "No information agents linked."));
    if (!Q.act.length) $("loop-act").appendChild(el("p", { class: "loop__empty" }, "No workflow agents linked. Totality will propose briefs once it has a forecast."));
  }
  $("hub-btn").addEventListener("click", function () { select("hub"); });
  function drawTiles() {
    linked(Q).forEach(function (a) {
      var t = tiles[a.id]; if (!t) return;
      var s = status(a), f = latest(a.id, ["find", "fix", "change"]), w = waitingFor(a.id).length;
      t.c.className = "lag is-" + s + (S.sel === a.id ? " is-sel" : "");
      t.c.setAttribute("aria-pressed", String(S.sel === a.id));
      t.st.className = "st st--" + s; t.st.textContent = ST[s];
      t.line.textContent = a.problem ? a.problem.title : a.paused ? "Paused by you" : f ? f.text : a.what;
      t.when.textContent = a.problem ? "Since " + hhmm(a.problem.at) : f ? ago(f.at) + (w ? ", " + w + " waiting" : "") : w ? w + " waiting" : "First report due shortly";
      if (paths[a.id]) paths[a.id].setAttribute("class", "lk lk--" + a.kind + " is-" + s);
    });
    $("hub-btn").classList.toggle("is-sel", S.sel === "hub");
    $("hub-btn").setAttribute("aria-pressed", String(S.sel === "hub"));
    $("hub-p").textContent = pText(Q);
    $("hub-q").textContent = Q.short;
  }
  // the hub pulses when a report moves the forecast
  function pulseHub() {
    if (REDUCE) return;
    hubSvg.classList.remove("is-pulse"); void hubSvg.getBoundingClientRect(); hubSvg.classList.add("is-pulse");
  }
  function linkMap() {
    var box = board.getBoundingClientRect();
    var stacked = getComputedStyle(board).gridTemplateColumns.split(" ").length < 3;
    links.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    var keepLit = $("packets");
    links.innerHTML = ""; paths = {};
    if (keepLit) links.appendChild(keepLit);
    if (stacked) return;
    var hb = hubSvg.getBoundingClientRect(), k = hb.width / 176, cx = hb.left + hb.width / 2 - box.left, cy = hb.top + hb.height / 2 - box.top, r = 80 * k;
    // each side's links meet the hub at evenly spaced points on its arc, in the order of their tiles, so none share one
    var s = "", at = {};
    ["sense", "act"].forEach(function (kind) {
      var list = linked(Q).filter(function (a) { return a.kind === kind; }).sort(function (a, b) { return tiles[a.id].c.getBoundingClientRect().top - tiles[b.id].c.getBoundingClientRect().top; });
      var n = list.length, span = Math.min(100, 24 * (n - 1));
      list.forEach(function (a, i) { at[a.id] = (n === 1 ? 0 : -span / 2 + span * i / (n - 1)) * Math.PI / 180; });
    });
    linked(Q).forEach(function (a) {
      var c = tiles[a.id].c.getBoundingClientRect(), y = c.top + c.height / 2 - box.top, side = a.kind === "sense" ? -1 : 1;
      var hy = cy + r * Math.sin(at[a.id]), hx = cx + side * r * Math.cos(at[a.id]);
      var ex = side < 0 ? c.right - box.left : c.left - box.left, mx = (ex + hx) / 2;
      var d = side < 0 ? "M" + ex + " " + y + "C" + mx + " " + y + " " + mx + " " + hy + " " + hx + " " + hy
                       : "M" + hx + " " + hy + "C" + mx + " " + hy + " " + mx + " " + y + " " + ex + " " + y;
      s += '<path id="lk-' + a.id + '" class="lk lk--' + a.kind + ' is-' + status(a) + '" d="' + d + '"/>';
    });
    // keep any links that are lit right now: a redraw mustn't cut them off mid-flash
    var lit = $("packets");
    links.innerHTML = s;
    if (lit) links.appendChild(lit); else { lit = document.createElementNS(NS, "g"); lit.id = "packets"; links.appendChild(lit); }
    linked(Q).forEach(function (a) { paths[a.id] = $("lk-" + a.id); });
    // and any still lit follow their link to its new course, so a flash never runs beside the line it lights
    [].forEach.call(lit.querySelectorAll(".lk-hot"), function (h) { var p = paths[h.dataset.agent]; if (p) h.setAttribute("d", p.getAttribute("d")); });
  }
  // when information moves, the link itself lights up: a brighter copy draws along it in the direction of travel
  // (toward Totality for a report, away from it for a brief), holds a moment, then fades back
  function packet(id, inward, cls) {
    var p = paths[id], g = $("packets"); if (REDUCE || !p || !g || document.hidden) return;
    var hot = document.createElementNS(NS, "path");
    hot.setAttribute("d", p.getAttribute("d")); hot.setAttribute("pathLength", "1"); hot.dataset.agent = id;
    hot.setAttribute("class", ("lk-hot " + (inward ? "lk-hot--in " : "lk-hot--out ") + (cls || "")).trim());
    g.appendChild(hot);
    var fwd = AGENTS[id].kind === "sense" ? inward : !inward, from = fwd ? 1 : -1;
    var run = hot.animate([{ strokeDashoffset: from, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, offset: 0.45 }, { strokeDashoffset: 0, opacity: 1, offset: 0.6 }, { strokeDashoffset: 0, opacity: 0 }],
      { duration: cls === "pk--quiet" ? 2200 : 1900, easing: "ease-out" });
    run.onfinish = function () { hot.remove(); };
  }
  // working agents check in now and then; ones with a problem or paused stay silent
  setInterval(function () {
    var on = linked(Q).filter(function (a) { var s = status(a); return s === "ok" || s === "wait"; });
    if (on.length) { var a = on[Math.floor(Math.random() * on.length)]; packet(a.id, a.kind === "sense", "pk--quiet"); }
  }, 1800);

  /* ---------- the side panel: an agent, or Totality ---------- */
  function select(id) {
    S.sel = id; drawTiles(); drawSide(); drawRosterSel();
    if (matchMedia("(max-width: 1000px)").matches) $("d-side").scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" });
  }
  function part(box, title) { var s = el("section", { class: "sp" }); if (title) s.appendChild(el("h4", { class: "sp__h" }, title)); box.appendChild(s); return s; }
  function drawSide() {
    var box = $("d-side"); box.innerHTML = "";
    if (S.sel === "hub" || !AGENTS[S.sel] || linked(Q).indexOf(AGENTS[S.sel]) < 0) { S.sel = "hub"; return drawHub(box); }
    var a = AGENTS[S.sel], s = status(a);
    var head = el("div", { class: "side__head" });
    var h = el("div"); h.appendChild(el("h3", { class: "side__name" }, a.name));
    h.appendChild(el("p", { class: "side__sub" }, a.kind === "sense" ? "Information agent. " + a.what + "." : "Workflow agent for " + a.owner + ". " + a.what + "."));
    head.appendChild(h); head.appendChild(el("span", { class: "st st--" + s }, ST[s]));
    box.appendChild(head);
    if (a.problem) box.appendChild(problemCard(a, true));
    var f = latest(a.id, ["find", "fix"]);
    var sv = part(box, "Surfacing");
    if (f) {
      sv.appendChild(el("p", { class: "sp__big" }, f.text));
      var m = el("p", { class: "sp__meta" }); m.appendChild(el("span", null, hhmm(f.at) + ", " + ago(f.at)));
      var ic = impChip(f); if (ic) m.appendChild(ic);
      sv.appendChild(m);
    } else sv.appendChild(el("p", { class: "sp__none" }, "Nothing reported for this question yet."));
    var w = waitingFor(a.id);
    if (w.length) {
      var wb = el("button", { type: "button", class: "side__wait" });
      wb.appendChild(el("b", null, w.length + (w.length === 1 ? " change waits for you" : " changes wait for you")));
      wb.appendChild(el("span", null, w[0].title));
      wb.addEventListener("click", function () { jump(w[0].id); });
      box.appendChild(wb);
    }
    part(box, "Brief from Totality").appendChild(el("p", { class: "sp__text" }, briefOf(a)));
    var also = queries(a).filter(function (q) { return q !== Q; });
    if (also.length) {
      var al = part(box, "Also serving"), row = el("div", { class: "side__also" });
      also.forEach(function (q) { var b = el("button", { type: "button", class: "btn-q btn-q--sm" }, q.short); b.addEventListener("click", function () { pick(q); select(a.id); }); row.appendChild(b); });
      al.appendChild(row);
    }
    var stats = el("dl", { class: "sp__stats" });
    var finds = Q.feed.filter(function (x) { return x.agent === a.id && x.kind === "find"; }).length;
    [[a.kind === "sense" ? "Checks today" : "Actions today", String(a.checks)], ["Reports here today", String(finds)], ["Cost today", "$" + a.cost.toFixed(2) + "k"],
     [a.kind === "sense" ? "Looks" : "Owner", a.kind === "sense" ? a.every : a.owner]].forEach(function (r) {
      var d = el("div"); d.appendChild(el("dt", null, r[0])); d.appendChild(el("dd", { class: "num" }, r[1])); stats.appendChild(d);
    });
    box.appendChild(stats);
    var ol = el("ol", { class: "sp__log" });
    Q.feed.filter(function (x) { return x.agent === a.id; }).slice().reverse().forEach(function (x) {
      var li = el("li", { class: "is-" + x.kind }); li.appendChild(el("span", { class: "num" }, hhmm(x.at))); li.appendChild(el("span", null, x.text)); ol.appendChild(li);
    });
    if (!ol.children.length) ol.appendChild(el("li", { class: "is-none" }, "Nothing yet today."));
    part(box, "Today").appendChild(ol);
    var ctl = el("div", { class: "side__ctl" });
    var pz = el("button", { type: "button", class: "btn-q" }, a.paused ? "Resume" : "Pause");
    pz.addEventListener("click", function () { a.paused = !a.paused; queries(a).forEach(function (q) { log(q, a.id, "change", (a.paused ? "Paused" : "Resumed") + " by you."); }); drawAll(); });
    ctl.appendChild(pz);
    // whether an agent may act alone only matters in automatic mode, so the switch is shown only then
    if (S.mode === "auto") {
    var sw = el("label", { class: "switch side__auto" });
    var tx = el("span", { class: "switch__text" }, "Acts on its own"); tx.appendChild(el("small", null, autoNote(a))); sw.appendChild(tx);
    var cb = el("input", { type: "checkbox" }); cb.checked = S.mode === "auto" && a.auto; cb.disabled = S.mode === "manual";
    cb.addEventListener("change", function () { a.auto = cb.checked; drawAll(); });
    sw.appendChild(cb); sw.appendChild(el("span", { class: "switch__ui", "aria-hidden": "true" }));
    ctl.appendChild(sw);
    }
    box.appendChild(ctl);
  }
  function autoNote(a) {
    return S.mode === "manual" ? "Off while you're in manual" : a.kind === "act" ? "Small, reversible steps only; never signs or sends" : "Within your " + LIMITS.filter(function (l) { return l[0] === S.limit; })[0][1] + " limit";
  }
  function drawHub(box) {
    var head = el("div", { class: "side__head" });
    var h = el("div"); h.appendChild(el("h3", { class: "side__name" }, "Totality"));
    h.appendChild(el("p", { class: "side__sub" }, Q.about));
    head.appendChild(h); box.appendChild(head);
    if (Q.p == null) {
      box.appendChild(el("p", { class: "side__build" }, "Totality is splitting the question into smaller ones it can forecast and waiting for the first reports from " + linked(Q).length + " linked agents. The first forecast usually takes a few minutes."));
      var lg = el("ol", { class: "sp__log" });
      Q.feed.slice().reverse().forEach(function (x) { var li = el("li", { class: "is-" + x.kind }); li.appendChild(el("span", { class: "num" }, hhmm(x.at))); li.appendChild(el("span", null, x.text)); lg.appendChild(li); });
      part(box, "So far").appendChild(lg);
      return;
    }
    var big = el("p", { class: "side__p" }); big.appendChild(el("b", { class: "num" }, Q.p + "%"));
    big.appendChild(el("span", null, Q.p0 == null ? "First forecast at " + hhmm(Q.firstAt) : pts(Q.p - Q.p0) + " since 06:00")); box.appendChild(big);
    box.appendChild(chart());
    var ul = el("ul", { class: "moves" });
    Q.feed.filter(function (f) { return f.dp; }).slice().reverse().forEach(function (f) {
      var li = el("li"), b = el("button", { type: "button" });
      b.appendChild(el("span", { class: "num moves__t" }, hhmm(f.at)));
      var tx = el("span", { class: "moves__txt" }); tx.appendChild(el("b", null, AGENTS[f.agent].name)); tx.appendChild(document.createTextNode(f.text)); b.appendChild(tx);
      b.appendChild(impChip(f));
      b.addEventListener("click", function () { select(f.agent); });
      li.appendChild(b); ul.appendChild(li);
    });
    if (!ul.children.length) ul.appendChild(el("li", { class: "moves__none" }, "Nothing has moved it yet."));
    part(box, "What moved it today").appendChild(ul);
    var ol = el("ol", { class: "asks" }), top = Q.asks.length ? Q.asks[0].v : 1;
    Q.asks.forEach(function (x) {
      var a = AGENTS[x.agent], s = status(a), li = el("li"), b = el("button", { type: "button" });
      b.appendChild(el("span", { class: "asks__q" }, x.q));
      var bar = el("span", { class: "asks__bar" }), fill = el("i"); fill.style.width = (x.v / top * 100) + "%"; bar.appendChild(fill); b.appendChild(bar);
      var m = el("span", { class: "asks__m" }); m.appendChild(el("span", { class: "num" }, "$" + x.v.toFixed(1) + "M of decision value"));
      var who = el("span", { class: "asks__who" }); who.appendChild(document.createTextNode(a.name)); who.appendChild(el("span", { class: "st st--" + s }, ST[s])); m.appendChild(who);
      b.appendChild(m);
      b.addEventListener("click", function () { select(x.agent); });
      li.appendChild(b); ol.appendChild(li);
    });
    part(box, "What it wants to know next").appendChild(ol);
  }
  // the forecast through the morning: a step for each report that moved it
  function chart() {
    var start = Q.p0 == null ? Q.firstAt : 0, base = Q.p0 == null ? Q.first : Q.p0;
    var span = Math.max(S.t - start, 1), W = 360, H = 118;
    var lo = Math.floor((Math.min(base, Q.p) - 4) / 5) * 5, hi = lo + 15;
    var x = function (m) { return 30 + (m - start) / span * (W - 44); }, y = function (p) { return 98 - (p - lo) / (hi - lo) * 88; };
    var p = base, d = "M" + x(start) + " " + y(p), dots = "";
    Q.feed.filter(function (f) { return f.dp && f.at >= start; }).forEach(function (f) {
      d += " L" + x(f.at).toFixed(1) + " " + y(p); p += f.dp; d += " L" + x(f.at).toFixed(1) + " " + y(p);
      dots += '<circle class="ch__dot" cx="' + x(f.at).toFixed(1) + '" cy="' + y(p).toFixed(1) + '" r="3.5"/>';
    });
    d += " L" + x(S.t).toFixed(1) + " " + y(p);
    var g = "";
    [lo, lo + 5, lo + 10, hi].forEach(function (v, i) { if (i === 3) return; g += '<line class="ch__grid" x1="26" x2="' + (W - 8) + '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '"/><text class="ch__ax" x="22" y="' + (y(v) + 3.5).toFixed(1) + '" text-anchor="end">' + v + "%</text>"; });
    (start === 0 ? [0, 60, 120] : [start]).forEach(function (m) { g += '<text class="ch__ax" x="' + x(m).toFixed(1) + '" y="' + (H - 2) + '" text-anchor="' + (m === start ? "start" : "middle") + '">' + hhmm(m) + "</text>"; });
    g += '<text class="ch__ax ch__now" x="' + x(S.t).toFixed(1) + '" y="' + (H - 2) + '" text-anchor="end">now</text>';
    var wrap = el("div", { class: "ch" });
    wrap.innerHTML = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="The forecast from ' + base + "% at " + hhmm(start) + " to " + Q.p + '% now">' + g +
      '<path class="ch__line" d="' + d + '"/>' + dots + '<circle class="ch__end" cx="' + x(S.t).toFixed(1) + '" cy="' + y(p).toFixed(1) + '" r="4.5"/></svg>';
    return wrap;
  }

  /* ---------- problems ---------- */
  function problemCard(a, inSide) {
    var pr = a.problem, c = el("div", { class: "prob" + (inSide ? " prob--side" : "") });
    var h = el("p", { class: "prob__h" }), tag = el("span", { class: "prob__tag" });
    if (!inSide) {
      var who = el("button", { type: "button", class: "prob__who" }, a.name); who.addEventListener("click", function () { select(a.id); }); tag.appendChild(who);
      tag.appendChild(el("span", { class: "st st--bad" }, "Problem"));  // in the panel, its header already says so
    }
    h.appendChild(tag);
    h.appendChild(el("span", { class: "num prob__t" }, "Since " + hhmm(pr.at) + ", " + ago(pr.at)));
    c.appendChild(h);
    c.appendChild(el("p", { class: "prob__title" }, pr.title));
    c.appendChild(el("p", { class: "prob__text" }, pr.text));
    var others = queries(a).filter(function (q) { return q !== Q; });
    if (others.length) c.appendChild(el("p", { class: "prob__also" }, "Also affects " + others.map(function (q) { return q.short; }).join(" and ") + "."));
    var fx = el("div", { class: "prob__fix" });
    pr.fixes.forEach(function (f, i) {
      var b = el("button", { type: "button", class: i === 0 ? "btn btn--primary btn--sm" : "btn-q" }, f[0]);
      b.addEventListener("click", function () { fix(a, f); });
      fx.appendChild(b);
    });
    c.appendChild(fx);
    return c;
  }
  function fix(a, f) {
    if (f[2]) S.extra += f[2];
    a.problem = null;
    queries(a).forEach(function (q) { log(q, a.id, "fix", f[1]); });
    packet(a.id, false, "");
    DB.toast(a.name + ": " + lower(f[1]));
    drawAll();
  }
  function drawAttn() {
    var box = $("attn"); box.innerHTML = "";
    var bad = linked(Q).filter(function (a) { return a.problem; });
    bad.forEach(function (a) { box.appendChild(problemCard(a, false)); });
    if (!bad.length) box.appendChild(el("p", { class: "attn__ok" }, "No agent on this question is in trouble; all are reporting on schedule."));
  }

  /* ---------- the feed ---------- */
  var FILTERS = [["all", "All"], ["find", "Reports"], ["prob", "Problems"], ["change", "Changes"]];
  var fBtns = FILTERS.map(function (f) {
    var b = el("button", { type: "button", "aria-pressed": "false" }, f[1]);
    b.addEventListener("click", function () { S.filter = f[0]; drawFeed(); });
    $("feed-f").appendChild(b); return [f[0], b];
  });
  var KIND = { find: "Report", prob: "Problem", fix: "Fixed", change: "Change" };
  function drawFeed() {
    fBtns.forEach(function (x) { x[1].setAttribute("aria-pressed", String(x[0] === S.filter)); });
    var ol = $("feed"); ol.innerHTML = "";
    Q.feed.filter(function (f) { return S.filter === "all" || f.kind === S.filter || (S.filter === "prob" && f.kind === "fix"); }).slice().reverse().forEach(function (f) {
      var li = el("li", { class: "fd is-" + f.kind + (f.fresh ? " is-fresh" : "") }), b = el("button", { type: "button" });
      b.appendChild(el("span", { class: "fd__t num" }, hhmm(f.at)));
      var body = el("span", { class: "fd__body" }), top = el("span", { class: "fd__top" });
      top.appendChild(el("span", { class: "fd__who fd__who--" + AGENTS[f.agent].kind }, AGENTS[f.agent].name));
      top.appendChild(el("span", { class: "fd__kind" }, KIND[f.kind]));
      body.appendChild(top);
      body.appendChild(el("span", { class: "fd__text" }, f.text));
      b.appendChild(body);
      if (f.kind === "find") { var ic = impChip(f); if (ic) b.appendChild(ic); }
      b.addEventListener("click", function () { select(f.agent); });
      li.appendChild(b); ol.appendChild(li);
      f.fresh = false;
    });
    if (!ol.children.length) ol.appendChild(el("li", { class: "fd__none" }, "Nothing here yet."));
  }
  function log(q, agent, kind, text) { q.feed.push({ at: S.t, agent: agent, kind: kind, text: text, fresh: true }); }

  /* ---------- the clock: a minute every five seconds; every question's reports arrive on time ---------- */
  function tick() {
    S.t++;
    $("d-clock").textContent = hhmm(S.t);
    var here = false;
    QUERIES.forEach(function (q) {
      while (q.coming.length && q.coming[0].at <= S.t) {
        var f = q.coming.shift(), a = AGENTS[f.agent];
        if (a.paused || a.problem) continue;  // a paused or broken agent misses its report
        if (f.setp != null) { q.p = q.first = f.setp; q.firstAt = S.t; if (q.makeAsks) q.makeAsks(); }
        f.fresh = true; f.at = S.t; q.feed.push(f);
        if (f.dp && q.p != null) q.p += f.dp;
        if (a.checks != null) a.checks++;
        if (q === Q) { here = true; if (f.agent !== "hub") packet(f.agent, true, ""); if (f.dp || f.setp != null) pulseHub(); }
      }
    });
    drawWatch();
    if (here) drawAll();
    else { drawStrip(); drawTiles(); drawSide(); drawAttn(); requestAnimationFrame(relink); }  // tiles change height as their ages tick
  }
  setInterval(tick, 5000);

  /* ---------- the queue ---------- */
  function qCard(x) {
    var a = AGENTS[x.agent], c = el("article", { class: "qc qc--" + x.kind.toLowerCase(), id: x.id });
    var top = el("p", { class: "qc__top" });
    top.appendChild(el("span", { class: "qc__kind" }, x.kind === "Strategy" ? "Strategy change" : x.kind));
    top.appendChild(el("span", { class: "qc__agent" }, a.name + (a.owner ? ", for " + a.owner : "")));
    c.appendChild(top);
    c.appendChild(el("h3", { class: "qc__title" }, x.title));
    c.appendChild(el("p", { class: "qc__why" }, x.why));
    var dl = el("dl", { class: "qc__diff" });
    dl.appendChild(el("dt", { class: "qc__h" }, "")); dl.appendChild(el("dd", { class: "qc__h" }, "Was")); dl.appendChild(el("dd", { class: "qc__h" }, "Now"));
    x.diff.forEach(function (r) { dl.appendChild(el("dt", null, r[0])); dl.appendChild(el("dd", { class: "qc__was" }, r[1])); dl.appendChild(el("dd", null, r[2])); });
    c.appendChild(dl);
    var foot = el("div", { class: "qc__foot" });
    foot.appendChild(el("p", { class: "qc__cost" + (x.rev ? "" : " is-big") }, x.costText + (x.rev ? "; can be undone" : "")));
    var btns = el("div", { class: "qc__btns" });
    var ok = el("button", { type: "button", class: "btn btn--primary btn--sm" }, x.rev ? "Approve" : "Sign off");
    ok.addEventListener("click", function () { decide(x, "approved"); });
    btns.appendChild(ok);
    if (x.edit) {
      var ed = el("button", { type: "button", class: "btn-q" }, "Edit the brief");
      ed.addEventListener("click", function () { $("st-title").scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" }); });
      btns.appendChild(ed);
    }
    var no = el("button", { type: "button", class: "btn-q" }, "Decline");
    no.addEventListener("click", function () { decide(x, "declined"); });
    btns.appendChild(no);
    foot.appendChild(btns);
    c.appendChild(foot);
    return c;
  }
  function decide(x, how) {
    x.state = how; x.when = S.t;
    var a = AGENTS[x.agent], q = x.q;
    if (x.id === "q-buyer" && how === "approved") { BRIEF.sent = BRIEF.cur = 2; form = Object.assign({}, VERS[2].v); q.briefs.buyer = "Brief v3: take 4,000 t at $1,215/t; keep the rest open below $1,260/t."; }
    if (how === "approved") {
      if (x.kind === "Retask") q.briefs[a.id] = x.title + ". " + (q.briefs[a.id] || a.brief);
      log(q, x.agent, "change", (x.rev ? "You approved: " : "You signed off: ") + lower(x.title) + ".");
      if (q === Q) packet(x.agent, false, "");
    } else log(q, x.agent, "change", "You declined: " + lower(x.title) + ".");
    DB.toast(how === "approved" ? (x.rev ? "Approved: " : "Signed off: ") + x.title : "Declined: " + x.title);
    drawAll();
  }
  function drawQueue() {
    var box = $("queue"); box.innerHTML = "";
    var wait = Q.queue.filter(function (x) { return x.state === "waiting"; });
    wait.sort(function (a, b) { return b.cost - a.cost; }).forEach(function (x) { box.appendChild(qCard(x)); });
    if (!wait.length) box.appendChild(el("p", { class: "queue__empty" }, Q.p == null ? "Nothing yet. Totality proposes changes once it has a forecast for this question." : "Nothing is waiting for you on this question. The agents carry on with their current briefs."));
    var big = wait.filter(function (x) { return !small(x); }).length;
    $("q-note").textContent = wait.length
      ? "For " + Q.short + ". " + (S.mode === "manual" ? "Manual: every change waits here, including retasking an information agent. " : "Automatic: changes under your limit that can be undone go through; ") +
        (big ? big + " of these sign or commit money, so they always need you." : "")
      : "All clear on " + Q.short.toLowerCase() + ".";
    var done = Q.queue.filter(function (x) { return x.state !== "waiting"; }), list = $("done-list");
    $("done").hidden = !done.length; list.innerHTML = "";
    $("done").querySelector(".done__title").textContent = "Done";
    done.forEach(function (x) {
      var li = el("li", { class: "done__i is-" + x.state });
      li.appendChild(el("span", { class: "done__t num" }, hhmm(x.when)));
      li.appendChild(el("span", { class: "done__what" }, x.title));
      li.appendChild(el("span", { class: "done__how" }, x.state === "auto" ? "On its own, under your limit" : x.state === "approved" ? (x.rev ? "You approved" : "You signed off") : x.state === "replaced" ? "Replaced by your brief" : "You declined"));
      if (x.rev && x.state !== "declined") {
        var u = el("button", { type: "button", class: "btn-q btn-q--sm" }, "Undo");
        u.addEventListener("click", function () { x.state = "waiting"; x.held = true; log(x.q, x.agent, "change", "Undone by you: " + lower(x.title) + "."); DB.toast("Undone: " + x.title); drawAll(); });
        li.appendChild(u);
      }
      list.appendChild(li);
    });
  }

  /* ---------- steer the negotiation (the Hormuz question's resin buyer) ---------- */
  var HZ = QUERIES[0], LOSS = 11.7 / 0.27, BASE_PRICE = 1060;  // the loss the full 7,000 t avoids if Hormuz closes; the normal contract price
  var VERS = [
    { n: "v1", t: "06:00", why: "From the brief, at 27%", v: { ceil: 1180, vol: 7000, pri: "balanced", fm: false, dl: false, pay: false },
      text: "Up to $1,180/t for all 7,000 t, delivered by 30 October." },
    { n: "v2", t: "07:36", why: "The draft war-risk listing; 33%", v: { ceil: 1240, vol: 7000, pri: "fast", fm: true, dl: true, pay: false },
      text: "Up to $1,240/t; split the order to get the first lot by 20 October; ask for a force-majeure carve-out." },
    { n: "v3", t: "08:12", why: "The supplier's counter-offer", v: { ceil: 1215, vol: 4000, pri: "balanced", fm: true, dl: true, pay: false },
      text: "Take 4,000 t at $1,215/t by 20 October; keep the other 3,000 t open below $1,260/t." }
  ];
  var BRIEF = { cur: 2, sent: 1 };  // v3 is Totality's proposal; v2 is what the agent works to until you sign off
  var form = Object.assign({}, VERS[2].v);
  function outcome(v) {
    var logit = 1.6 + (v.ceil - 1215) / 20 - (v.vol - 4000) / 1500 - (v.fm ? 0.5 : 0) - (v.pay ? 0.6 : 0) - (v.dl && v.vol > 4000 ? 0.8 : 0) + ({ price: -0.6, balanced: 0, fast: 0.5 })[v.pri];
    var deal = 1 / (1 + Math.exp(-logit));
    var cov = 1 - Math.pow(1 - v.vol / 7000, 1.6);
    var protect = deal * (HZ.p / 100) * LOSS * cov * (v.dl ? 1 : 0.8) * (v.fm ? 1.08 : 1);
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
      ["Value protected, at " + HZ.p + "%", money(o.protect), money(base.protect), o.protect - base.protect],
      ["Premium over contract, at most", money(o.prem), money(base.prem), base.prem - o.prem],
      ["Net, after the expected premium", money(o.net), money(base.net), o.net - base.net]
    ];
    if (!shown) {
      box.innerHTML = "";
      shown = rows.map(function () {
        var k = el("div", { class: "kpi" });
        var l = el("p", { class: "kpi__l" }); k.appendChild(l);
        var big = el("p", { class: "kpi__v num" }); k.appendChild(big);
        var cmp = el("p", { class: "kpi__c" }); k.appendChild(cmp);
        box.appendChild(k); return { l: l, big: big, cmp: cmp, k: k };
      });
    }
    var diff = !same(form, VERS[BRIEF.cur].v);
    rows.forEach(function (r, i) {
      shown[i].l.textContent = r[0];
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
    $("st-ver").textContent = "Working to " + VERS[BRIEF.sent].n + (BRIEF.cur > BRIEF.sent ? "; " + VERS[BRIEF.cur].n + " waits for you" : "");
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
    var x = HZ.queue.filter(function (y) { return y.id === "q-buyer"; })[0];
    if (same(form, VERS[BRIEF.cur].v)) { decide(x, "approved"); $("st-msg").textContent = "Signed off. The resin buyer is working to " + VERS[BRIEF.sent].n + "."; return; }
    var n = "v" + (VERS.length + 1);
    VERS.push({ n: n, t: hhmm(S.t), why: "you changed " + Object.keys(form).filter(function (k) { return form[k] !== VERS[BRIEF.cur].v[k]; }).map(function (k) { return { ceil: "the ceiling", vol: "the volume", pri: "the priority", fm: "the carve-out", dl: "the delivery date", pay: "payment terms" }[k]; }).join(", ") + ".",
      v: Object.assign({}, form), mine: true,
      text: "Up to " + PICKS[0].fmt(form.ceil) + " for " + PICKS[1].fmt(form.vol) + ", pushing for " + { price: "the lowest price", balanced: "a balance of price and speed", fast: "a fast deal" }[form.pri] + "." });
    BRIEF.cur = BRIEF.sent = VERS.length - 1;
    HZ.briefs.buyer = "Brief " + n + " (yours): " + VERS[BRIEF.sent].text;
    if (x.state === "waiting") { x.state = "replaced"; x.when = S.t; }
    log(HZ, "buyer", "change", "You sent brief " + n + ": " + VERS[BRIEF.sent].text);
    packet("buyer", false, "");
    $("st-msg").textContent = "Sent. The resin buyer is working to your " + n + "; Totality will flag it if the odds move.";
    DB.toast("Sent " + n + " to the resin buyer");
    drawAll();
  });

  /* ---------- every agent on the question, as a table ---------- */
  var rows = {};
  function buildRoster() {
    var box = $("roster"); box.innerHTML = ""; rows = {};
    var head = el("div", { class: "rt rt--head", role: "row" });
    ["Agent", "Status", "Latest", "Today", "Acts on its own"].forEach(function (h) { head.appendChild(el("span", { role: "columnheader" }, h)); });
    box.appendChild(head);
    linked(Q).forEach(function (a) {
      var r = el("div", { class: "rt", role: "row" });
      var nc = el("span", { role: "cell" }), nm = el("button", { type: "button", class: "rt__name" });
      nm.appendChild(el("b", null, a.name)); nm.appendChild(el("span", null, a.kind === "sense" ? "Information, " + lower(a.every) : "Workflow, for " + a.owner));
      nm.addEventListener("click", function () { select(a.id); $("now-title").scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" }); });
      nc.appendChild(nm); r.appendChild(nc);
      var st = el("span", { role: "cell", class: "rt__st" }), stc = el("span", { class: "st" }); st.appendChild(stc); r.appendChild(st);
      var lt = el("span", { class: "rt__latest", role: "cell" }); r.appendChild(lt);
      var td = el("span", { class: "rt__today num", role: "cell" }); r.appendChild(td);
      var cell = el("span", { role: "cell", class: "rt__sw" });
      var sw = el("label", { class: "switch rt__auto" });
      sw.appendChild(el("span", { class: "switch__text" }, "Acts on its own"));
      var cb = el("input", { type: "checkbox" });
      cb.addEventListener("change", function () { a.auto = cb.checked; drawAll(); });
      sw.appendChild(cb); sw.appendChild(el("span", { class: "switch__ui", "aria-hidden": "true" }));
      cell.appendChild(sw); r.appendChild(cell);
      box.appendChild(r);
      rows[a.id] = { r: r, stc: stc, lt: lt, td: td, cb: cb };
    });
  }
  function drawRoster() {
    linked(Q).forEach(function (a) {
      var x = rows[a.id]; if (!x) return;
      var s = status(a), f = latest(a.id, ["find", "fix", "change"]);
      x.stc.className = "st st--" + s; x.stc.textContent = ST[s];
      x.lt.textContent = a.problem ? a.problem.title : a.paused ? "Paused by you" : f ? f.text : "Nothing yet for this question";
      var finds = Q.feed.filter(function (y) { return y.agent === a.id && y.kind === "find"; }).length;
      x.td.textContent = finds + (finds === 1 ? " report" : " reports") + ", $" + a.cost.toFixed(2) + "k";
      x.cb.checked = S.mode === "auto" && a.auto; x.cb.disabled = S.mode === "manual";
    });
    drawRosterSel();
  }
  function drawRosterSel() { Object.keys(rows).forEach(function (id) { rows[id].r.classList.toggle("is-sel", S.sel === id); }); }

  /* ---------- a new question: write it, pick a horizon, link existing agents ---------- */
  var dlg = $("nq"), nqQ = $("nq-q"), BY = [["30 days", 30], ["90 days", 90], ["End of the year", 86]], nq = { by: 30, picked: {}, touched: {} };
  BY.forEach(function (b) {
    var btn = el("button", { type: "button", role: "radio", "aria-pressed": "false" }, b[0]);
    btn.addEventListener("click", function () { nq.by = b[1]; drawNq(); });
    b.btn = btn; $("nq-by").appendChild(btn);
  });
  function suggested(text) {
    var t = " " + text.toLowerCase() + " ";
    return POOL.filter(function (a) { return a.tags.some(function (w) { return t.indexOf(w) >= 0; }); }).map(function (a) { return a.id; });
  }
  var nqRows = {}, nqLists = {};
  (function buildNq() {
    var box = $("nq-agents");
    [["Information agents", "sense"], ["Workflow agents", "act"]].forEach(function (g) {
      box.appendChild(el("p", { class: "nq__group" }, g[0]));
      var list = el("div", { class: "nq__list" }); box.appendChild(list); nqLists[g[1]] = list;
      POOL.filter(function (a) { return a.kind === g[1]; }).forEach(function (a) {
        var lab = el("label", { class: "switch nq__ag" });
        var tx = el("span", { class: "switch__text" });
        var nm = el("span", { class: "nq__name" }, a.name); var tag = el("span", { class: "nq__sug" }, "Suggested"); nm.appendChild(tag); tx.appendChild(nm);
        var sub = el("small"); tx.appendChild(sub);
        lab.appendChild(tx);
        var cb = el("input", { type: "checkbox" });
        cb.addEventListener("change", function () { nq.picked[a.id] = cb.checked; nq.touched[a.id] = true; drawNq(); });
        lab.appendChild(cb); lab.appendChild(el("span", { class: "switch__ui", "aria-hidden": "true" }));
        list.appendChild(lab);
        nqRows[a.id] = { lab: lab, tag: tag, sub: sub, cb: cb, a: a };
      });
    });
  })();
  function drawNq() {
    var sug = suggested(nqQ.value);
    BY.forEach(function (b) { b.btn.setAttribute("aria-pressed", String(b[1] === nq.by)); });
    var n = 0;
    POOL.forEach(function (a) {
      var r = nqRows[a.id], on = sug.indexOf(a.id) >= 0;
      if (!nq.touched[a.id]) nq.picked[a.id] = on;  // suggestions link themselves until you change one
      r.cb.checked = !!nq.picked[a.id]; r.tag.hidden = !on;
      var serving = queries(a);
      r.sub.textContent = a.what + (serving.length ? ". Serving " + serving.map(function (q) { return q.short; }).join(", ") : ". Not serving any question yet");
      if (r.cb.checked) n++;
    });
    // suggested agents float to the top of each group; only rows out of place are moved, since moving a row cuts
    // short its switch's slide
    var at = { sense: 0, act: 0 };
    POOL.slice().sort(function (x, y) { return (sug.indexOf(y.id) >= 0) - (sug.indexOf(x.id) >= 0); }).forEach(function (a) {
      var list = nqLists[a.kind], lab = nqRows[a.id].lab, here = list.children[at[a.kind]++];
      if (here !== lab) list.insertBefore(lab, here || null);
    });
    $("nq-count").textContent = n ? n + " linked" : "";
    $("nq-make").disabled = !nqQ.value.trim() || !n;
  }
  nqQ.addEventListener("input", drawNq);
  $("w-new").addEventListener("click", function () {
    nqQ.value = ""; nq = { by: 30, picked: {}, touched: {} }; drawNq();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    nqQ.focus();
  });
  $("nq-cancel").addEventListener("click", function () { dlg.close(); });
  $("nq-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var text = nqQ.value.trim(), ids = POOL.filter(function (a) { return nq.picked[a.id]; }).map(function (a) { return a.id; });
    if (!text || !ids.length) return;
    dlg.close();
    addQuery(text, ids, nq.by);
  });
  // a short name for the watchlist and the hub, from the question itself
  function shortName(text) {
    var s = text.replace(/\?+$/, "").replace(/^(will|could|would|is|are|does|do|can|should|how likely is it that)\s+/i, "").replace(/^the\s+/i, "");
    var words = s.split(/\s+/).slice(0, 3).join(" ");
    words = words.charAt(0).toUpperCase() + words.slice(1);
    return words.length > 20 ? words.slice(0, 19).trim() + "…" : words;
  }
  function addQuery(text, ids, by) {
    var h = 0; for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    var q = { id: "q" + QUERIES.length, short: shortName(text), p0: null, p: null,
      about: text.replace(/\?*$/, "?") + " Resolves in " + (by === 86 ? "86 days, at the end of the year" : by + " days") + ".",
      sense: ids.filter(function (id) { return AGENTS[id].kind === "sense"; }), act: ids.filter(function (id) { return AGENTS[id].kind === "act"; }),
      deadline: null, briefs: {}, queue: [], asks: [], coming: [],
      feed: [{ at: S.t, agent: "hub", kind: "change", text: "You started watching this question and linked " + ids.length + (ids.length === 1 ? " agent." : " agents.") }] };
    var parts = 6 + h % 7, first = 8 + h % 27;
    q.coming.push({ at: S.t + 1, agent: "hub", kind: "change", text: "Split the question into " + parts + " smaller ones, and declined one that can't be forecast this far out." });
    q.sense.forEach(function (id, k) {
      var a = AGENTS[id];
      q.briefs[id] = a.brief === "Not linked to any question yet." ? "Watch for anything bearing on this question. Sources: " + a.what + "." : "For this question too. " + a.brief;
      q.coming.push({ at: S.t + 2 + k, agent: id, kind: "find", text: "First pass for this question: nothing unusual yet.", impact: "Baseline" });
    });
    q.act.forEach(function (id) { q.briefs[id] = "Standing by: Totality writes a brief once it has a forecast."; });
    q.coming.push({ at: S.t + 3 + q.sense.length, agent: "hub", kind: "change", text: "First forecast: " + first + "%.", setp: first });
    q.coming.sort(function (a, b) { return a.at - b.at; });
    q.makeAsks = function () {
      q.asks = q.sense.slice(0, 3).map(function (id, k) { return { q: AGENTS[id].what + ": is anything moving?", v: [0.4, 0.25, 0.15][k], agent: id }; });
    };
    QUERIES.push(q);
    drawWatch(); pick(q);
    DB.toast("Watching: " + q.short);
    $("now-title").scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" });
  }

  /* a highlight that slides behind the chosen option of a segmented control instead of jumping: it follows whichever
     child is pressed, checked or selected, and hides when none is (a nudged value between the choices) */
  function slider(track) {
    if (!track || track.querySelector(":scope > .seg-thumb")) return;
    var thumb = el("span", { class: "seg-thumb", "aria-hidden": "true" });
    track.insertBefore(thumb, track.firstChild); track.classList.add("has-thumb");
    var place = function () {
      var on = track.querySelector(':scope > [aria-pressed="true"], :scope > [aria-checked="true"], :scope > [aria-selected="true"]');
      if (!on || !on.offsetWidth) { thumb.style.opacity = "0"; return; }
      thumb.style.opacity = "1";
      thumb.style.width = on.offsetWidth + "px"; thumb.style.height = on.offsetHeight + "px";
      thumb.style.transform = "translate(" + on.offsetLeft + "px, " + on.offsetTop + "px)";
    };
    // move as soon as an option is pressed, before the page redraws, so the slide starts at the click; the observer
    // below corrects it if the press doesn't select anything
    track.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b || b.parentNode !== track) return;
      thumb.style.opacity = "1"; thumb.style.width = b.offsetWidth + "px"; thumb.style.height = b.offsetHeight + "px";
      thumb.style.transform = "translate(" + b.offsetLeft + "px, " + b.offsetTop + "px)";
      void thumb.getBoundingClientRect();
    }, true);
    new MutationObserver(place).observe(track, { attributes: true, subtree: true, childList: true, attributeFilter: ["aria-pressed", "aria-checked", "aria-selected"] });
    // on first draw or a resize (a control appearing, the window changing) it jumps into place rather than sliding;
    // transitions come straight back on, without waiting for a frame that a hidden control may never get
    var snap = function () { thumb.style.transition = "none"; place(); void thumb.offsetWidth; thumb.style.transition = ""; };
    if (window.ResizeObserver) new ResizeObserver(snap).observe(track);
    snap();
  }

  function drawAll() {
    settle(); drawMode(); drawWatch(); drawStrip(); drawTiles(); drawSide(); drawFeed(); drawAttn(); drawQueue(); drawSteer(); drawRoster();
    requestAnimationFrame(relink);  // tiles change height as their text changes, so the links are redrawn
  }
  function relink() { linkMap(); drawTiles(); }

  $("d-clock").textContent = hhmm(S.t);
  buildMap(); buildRoster(); drawAll();
  [$("mode-limit"), $("feed-f"), $("w-list"), $("nq-by")].concat([].slice.call(document.querySelectorAll("#st-fields .pick__seg"))).forEach(slider);
  window.addEventListener("resize", relink);
  if (document.fonts) document.fonts.ready.then(relink);
})();
