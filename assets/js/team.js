/* Workflows: Penumbra for the managers who carry decisions out, in the house style (rebuilt 2026-11-11, then made an
   orchestration tool the same day: the user found a status page with one-click choices and an email draft too basic).
   One manager's week as a live plan. Every task carries a chance of landing on time, built from what's in its way (an
   owner over capacity, a stuck step, a late input from another team); those roll up to each directive's chance and to how
   much of the money the brief's decisions protect is expected to land. Decisions preview their effect on the plan before
   they're committed (and go up for approval past a limit); Totality suggests moves that raise the plan's odds, including
   handing work to agents; handoffs between teams are tracked both ways (live between the three managers); playbooks are
   rehearsed against the week; and the plan rolls up to what the manager's boss sees. Today is Tue Oct 6, 07:10 GST, the
   morning of the brief; day 0 below is today. The chances of events match the brief. Every figure is illustrative. */
(function () {
  var DAYS = ["Tue Oct 6", "Wed Oct 7", "Thu Oct 8", "Fri Oct 9", "Sat Oct 10", "Sun Oct 11", "Mon Oct 12"];
  var DOW = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];
  var WORK = [1, 1, 1, 1, 0, 0, 1]; // Saturday and Sunday off, unless a task lands there
  var NOW = 7 + 10 / 60; // 07:10 on day 0
  var LIMIT = 25; // $k a manager can commit without the boss's approval
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // people: [id, name, role, shift, place, routine hours, cap, certified for, off (days and why), backup]
  var PEOPLE_FIELDS = ["id", "name", "role", "shift", "place", "base", "cap", "skills", "off", "backup"];
  function people(rows) { return rows.map(function (r) { var o = {}; PEOPLE_FIELDS.forEach(function (k, i) { o[k] = r[i]; }); return o; }); }
  // tasks: [id, text, who, start day, due day, hours, status, blocker]
  function tasks(rows) { return rows.map(function (r) { return { id: r[0], text: r[1], who: r[2], start: r[3], day: r[4], hours: r[5], status: r[6] || "todo", blocker: r[7] || "" }; }); }

  var PERSONAS = {
    farah: {
      first: "Farah", name: "Farah Saleh", role: "Port operations manager", team: "Port operations, UAE", short: "Port operations, UAE",
      boss: { name: "Tomas Varga", first: "Tomas", role: "VP Logistics" },
      title: "Move Four Sailings to Khor Fakkan by Thursday",
      lede: "The COO approved the Khor Fakkan diversion and war-risk cover in this morning’s brief. The port team owns the groundwork for both, and the Khor Fakkan berth booking closes Thursday at 2pm.",
      lead: "The diversion only protects its $7.6M if every box reaches the Dubai DC within 36 hours of discharge. Joel is the only one who can file customs entries at Khor Fakkan and is already over capacity, and war-risk cover is stuck on a hull value the carrier hasn’t sent.",
      priorities: [
        ["Take customs drafting off Joel", "The customs drafting agent can prepare the transit entries for Joel to check, which frees seven hours of his week."],
        ["Unstick the war-risk cover", "Treasury can’t bind cover without the Sable Orchid’s hull value, and the quote expires Wednesday at 5pm."],
        ["Book the four held slots", "The booking agent is holding four Khor Fakkan slots on option until Thursday’s 2pm cutoff."]
      ],
      people: people([
        ["farah", "Farah Saleh", "Port operations manager", "Days", "Jebel Ali", 30, 45, ["Berth planning", "Carrier relations"], null, null],
        ["rashid", "Rashid Al Mansoori", "Shift supervisor", "Days", "Jebel Ali", 33, 45, ["Yard planning", "Customs liaison"], null, "nadia"],
        ["nadia", "Nadia Haddad", "Shift supervisor", "Nights", "Jebel Ali", 30, 45, ["Yard planning", "Reefers"], null, "rashid"],
        ["joel", "Joel Fernandes", "Documentation lead", "Days", "Jebel Ali", 38, 45, ["Customs filings", "Bills of lading"], null, null],
        ["sanjay", "Sanjay Pillai", "Trucking coordinator", "Days", "Khor Fakkan", 26, 45, ["Haulier contracts", "Road permits"], null, null],
        ["aisha", "Aisha Karim", "Lead reach-stacker operator", "Nights", "Jebel Ali", 36, 45, ["Reach-stacker certified", "Hazmat"], null, "tariq"],
        ["tariq", "Tariq Nasser", "Reach-stacker operator", "Nights", "Jebel Ali", 0, 45, ["Reach-stacker certified"], { days: [0, 1, 2, 3, 4], label: "Leave" }, "aisha"],
        ["meilin", "Mei Lin Tan", "Operations analyst", "Days, part time", "Remote", 14, 22, ["TMS", "Reporting"], null, null]
      ]),
      agents: [["booking", "Booking agent"], ["customs", "Customs drafting agent"], ["haulage", "Haulage agent"]],
      gaps: [
        { text: "Only Joel can file customs entries at Khor Fakkan, and the diversion doubles his filings this week.", fix: "Have Rashid shadow Joel on Khor Fakkan filings", who: "rashid", start: 1, day: 2, hours: 4, at: ["joel", 1, 3] },
        { text: "Aisha is the only certified reach-stacker operator on nights until Tariq is back on Sunday.", fix: "Borrow a certified operator from the day pool for nights", who: "nadia", start: 0, day: 0, hours: 1, at: ["aisha", 0, 3] },
        { text: "Sanjay is the only one with the Khor Fakkan hauliers’ numbers.", fix: "Share the haulier contact sheet with Rashid", who: "sanjay", start: 0, day: 0, hours: 1, at: ["sanjay", 1, 2] }
      ],
      decisions: [
        { id: "kf-slots", stake: 0.97, dir: "divert", q: "Book the Khor Fakkan berth slots before Thursday’s cutoff?", due: [2, "14:00"],
          context: "The booking agent is holding four slots on option until the cutoff. Khor Fakkan is 70% booked and won’t hold slots past it.",
          opts: [{ t: "Book all 4 held slots", sub: "$1.6k a slot to cancel later", cost: 12.8, done: "t-slots" },
                 { t: "Book 2 now, 2 on Thursday", sub: "The last 2 may be gone", cost: 6.4, hit: { m: 0.78, why: "Two of the four slots may be gone by Thursday" } },
                 { t: "Wait for Monday’s forecast", sub: "The held slots lapse Thursday", cost: 0, hit: { m: 0.3, why: "The held slots lapse Thursday at 2pm" } }],
          pick: 0, why: "The directive moves four sailings, and if the strait closes every Gulf shipper will want these berths. Cancelling later costs far less than missing the cutoff.",
          flip: "If the chance of a closure fell below 15% before Thursday, booking two would be enough." },
        { id: "yard", stake: 0.9, dir: "divert", q: "Release boxes from the Jebel Ali yard early?", due: [1, "12:00"],
          context: "212 Halvorsen boxes are in the yard. Dwell time is 71 hours and climbing, an hour short of the 72-hour trigger.",
          opts: [{ t: "Release the 90 fast movers", sub: "The DC takes them without overtime", cost: 0, add: { text: "Release 90 fast-moving boxes to the Dubai DC", who: "rashid", start: 1, day: 1, hours: 6, dir: "divert" } },
                 { t: "Release all 212", sub: "The DC needs a Saturday shift", cost: 9.5, add: { text: "Release all 212 boxes to the Dubai DC", who: "rashid", start: 1, day: 2, hours: 12, dir: "divert" } },
                 { t: "Hold until Monday", sub: "Dwell keeps climbing", cost: 0, hit: { m: 0.9, why: "A congested yard slows the diverted boxes too" } }],
          pick: 0, why: "Moving the fast movers clears the boxes the DC would need first if inbound stops, without paying for a weekend shift.",
          flip: "If dwell passes 80 hours before noon tomorrow, releasing all 212 is worth the Saturday shift." },
        { id: "nights", stake: 0.86, dir: "divert", q: "Approve overtime for Saturday’s night gate shift?", due: [3, "17:00"],
          context: "With Tariq on leave, Aisha is the only certified operator on nights, and three vessels bunch up on Saturday.",
          opts: [{ t: "Approve 6 hours", sub: "Two cranes all night", cost: 1.1, add: { text: "Schedule a second certified operator for Saturday night", who: "nadia", start: 3, day: 3, hours: 1, dir: "divert" } },
                 { t: "Move Rashid to nights", sub: "Days lose a supervisor", cost: 0, add: { text: "Cover Saturday’s night gate", who: "rashid", start: 4, day: 4, hours: 10, dir: "divert" } },
                 { t: "Decline", sub: "One crane on Saturday night", cost: 0, hit: { m: 0.86, why: "One crane can’t turn three vessels overnight" } }],
          pick: 0, why: "One crane can’t turn three vessels overnight, and a missed window pushes the boxes into next week’s dwell.",
          flip: "If one of Saturday’s three vessels slips to Sunday, one crane is enough." },
        { id: "surcharge", stake: 0.95, dir: "cover", q: "Accept the carrier’s $180-a-box war-risk surcharge on AE7?", due: [1, "17:00"],
          context: "The carrier wants an answer for this week’s sailing. Treasury is binding war-risk cover on Gulf calls today.",
          opts: [{ t: "Ask Treasury first", sub: "Answer the carrier tomorrow", cost: 0, add: { text: "Ask Treasury whether the new cover overlaps the AE7 surcharge", who: "farah", start: 0, day: 0, hours: 1, dir: "cover" } },
                 { t: "Accept for this week", sub: "Paid on this sailing", cost: 38 },
                 { t: "Push back", sub: "Risks a rolled booking", cost: 0, hit: { m: 0.85, why: "The carrier may roll the AE7 booking" } }],
          pick: 0, why: "If Treasury’s new cover already insures this cargo, the surcharge pays for it twice. One message to Treasury settles the overlap before the carrier’s deadline.",
          flip: "If Treasury’s cover excludes AE7’s cargo, accepting is cheaper than rolling the booking." }
      ],
      directives: [
        { id: "divert", brief: true, protects: 7.6, short: "the Khor Fakkan diversion", title: "Divert Four Jebel Ali Sailings", by: "Tomas Varga, VP Logistics", approved: "Approved by the COO in this morning’s brief",
          part: "Every diverted box from Khor Fakkan to the Dubai DC within 36 hours of discharge, ready before Saturday’s vessels.", due: [3, "17:00"],
          tasks: tasks([
            ["t-slots", "Book four Khor Fakkan berth slots", "farah", 1, 2, 2],
            ["t-trucks", "Line up 14 trucks a sailing with Khor Fakkan hauliers", "sanjay", 0, 1, 8, "doing"],
            ["t-customs", "File transit customs entries for the diverted boxes", "joel", 2, 3, 10],
            ["t-eta", "Update arrival times for 212 boxes in the TMS", "meilin", 0, 0, 4, "done"],
            ["t-dc", "Give the Dubai DC its new arrival windows", "rashid", 1, 1, 2],
            ["t-gate", "Brief the night shift on the new gate plan", "nadia", 2, 3, 2]
          ]) },
        { id: "cover", brief: true, protects: 5.7, short: "war-risk cover", title: "Bind War-Risk Cover on Gulf Calls", by: "Hanne Sørli, Group Treasurer", approved: "Approved by the COO in this morning’s brief",
          part: "Everything Treasury needs to put every Gulf call on the cover before the quote expires.", due: [1, "17:00"],
          tasks: tasks([
            ["t-calls", "Send Treasury the Gulf calls for the next 30 days", "joel", 0, 1, 3],
            ["t-hull", "Confirm each vessel’s insured value with the carrier", "rashid", 0, 1, 3, "blocked", "The carrier hasn’t sent the hull value for the Sable Orchid."],
            ["t-hold", "Hold the AE7 surcharge until the cover is confirmed", "farah", 1, 1, 1]
          ]) }
      ],
      // what other teams owe this one, and the task each holds up
      xin: [
        { id: "x-slots", team: "Booking agent", agent: "booking", what: "Hold four Khor Fakkan slots on option", due: [2, "14:00"], p: 0.97, gates: "t-slots", status: "Holding until Thursday at 2pm" },
        { id: "x-haul", ask: "the Khor Fakkan hauliers", team: "Khor Fakkan hauliers", who: "Two hauliers", what: "Confirm 14 trucks a sailing", due: [1, "12:00"], p: 0.8, gates: "t-trucks", status: "Quoted, not confirmed" },
        { id: "x-hull", ask: "the Sable Orchid’s operator", team: "Carrier", who: "The Sable Orchid’s operator", what: "Send the Sable Orchid’s hull value", due: [-2, "17:00"], p: 0.5, gates: "t-hull", status: "Two days late", late: true },
        { id: "x-dcwin", ask: "the Dubai DC’s inbound planning", team: "Dubai DC", who: "Inbound planning", what: "Confirm it can receive at the new windows", due: [2, "12:00"], p: 0.9, gates: "t-dc", status: "Waiting on our windows" }
      ],
      // what this team owes others, and the task that delivers it
      xout: [
        { to: "Treasury", who: "Hanne Sørli", what: "The Gulf calls for the next 30 days", from: "t-calls", due: [1, "12:00"], why: "Treasury can’t bind war-risk cover without them, and the quote expires Wednesday at 5pm." },
        { to: "Key accounts, GCC", who: "Layla Mansour", persona: "layla", what: "New arrival times for 212 boxes", from: "t-eta", due: [0, "09:00"], why: "Layla’s order desk resets the delivery promise on every open Middle East order from them." },
        { to: "Dubai DC", who: "Inbound planning", what: "New arrival windows for the diverted boxes", from: "t-dc", due: [1, "17:00"], why: "The DC staffs its receiving docks around the windows." }
      ],
      watch: [
        { id: "hormuz", kind: "threat", title: "Strait of Hormuz Closes", pn: 27, p: "Chance in 30 days", trend: [6, 9, 18, 24, 27],
          impact: "Jebel Ali inbound drops to almost nothing, three ships are stuck inside, and the team’s work moves to Khor Fakkan and Sohar overnight.",
          signal: { text: "Daily strait transits", now: 61, at: 40, max: 100, unit: "% of normal", dir: "below" },
          steps: [["Switch every inbound booking to Khor Fakkan or Sohar", "farah", 3], ["Run trucks to the Dubai DC around the clock", "sanjay", 8], ["Move two operators to Khor Fakkan", "nadia", 2], ["Release every box in the Jebel Ali yard to the DC", "rashid", 10], ["Hold a 07:30 call with Tomas every day until the strait reopens", "farah", 1]] },
        { id: "dwell", kind: "threat", title: "Jebel Ali Yard Congestion", p: "Likely within 2 weeks", trend: [48, 55, 63, 71],
          impact: "Boxes wait days for a gate slot, demurrage starts after 5 days, and the DC’s stock runs down while cargo sits in port.",
          signal: { text: "Average container dwell", now: 71, at: 72, max: 96, unit: " hours", dir: "above" },
          steps: [["Release fast movers to the DC early", "rashid", 6], ["Open a Saturday gate", "nadia", 6], ["Ask the DC for overflow yard space", "farah", 1]] },
        { id: "feeders", kind: "threat", title: "Sanctions Hit Two ME4 Feeders", pn: 15, p: "Chance in 30 days", trend: [9, 10, 13, 15],
          impact: "About 480 boxes a week bound for Dammam are held for screening, and the documentation team is buried in checks.",
          signal: { text: "Listing of the feeders’ technical manager", dir: "event", status: "Not yet" },
          steps: [["Pre-book slots on the rival Gulf shuttle", "sanjay", 2], ["Prepare a cargo screening checklist", "joel", 4], ["Warn the Dammam DC of a possible gap", "farah", 1]] },
        { id: "kf-room", kind: "opportunity", title: "Spare Berth Space at Khor Fakkan", p: "Open now, likely gone next week",
          impact: "600 TEU a week is free and quoted 8% below Jebel Ali. Standing slots now would make the diversion cheaper and keep it open for a month.",
          signal: { text: "Free capacity at Khor Fakkan", now: 600, at: 200, max: 800, unit: " TEU a week", dir: "below" },
          steps: [["Book standing slots for the next four weeks", "farah", 2], ["Negotiate the rate on a four-week commitment", "farah", 2]] }
      ],
      asks: [["Capacity", "How many trucks a day would Khor Fakkan need if the strait closes?"], ["What if", "What if Khor Fakkan fills up before Thursday’s cutoff?"], ["Exposure", "Which boxes in the Jebel Ali yard matter most to the Dubai DC?"], ["Forecast", "How likely is a closure before the four diverted sailings arrive?"]]
    },

    elif: {
      first: "Elif", name: "Elif Şahin", role: "Production manager", team: "Production, Gebze plant", short: "Gebze production",
      boss: { name: "Murat Kaya", first: "Murat", role: "Plant director" },
      title: "Get Gebze Ready to Run on Singapore Resin",
      lede: "The COO approved the Singapore resin bridge-buy in this morning’s brief. The first 4,000 t lands on October 20, and Gebze has 11 days of PP resin in its silos.",
      lead: "If the strait closes, Jubail resin stops and all three Gebze lines would stop in week two. The Singapore grade has to pass a moulding trial before it lands, only Hakan can sign the trial off, and he’s at a supplier audit until Thursday.",
      priorities: [
        ["Unblock the resin trial", "Hakan’s remote approval of the trial plan lets Line 1’s trial start the day he’s back, and Procurement won’t release the second lot without it."],
        ["Settle Saturday’s Line 2 shift", "A Saturday shift banks about 1,100 dishwashers ahead of the union’s strike vote on October 20."],
        ["Get the union’s list of essential roles", "The strike contingency for Murat can’t be finished until the union agrees which roles keep running."]
      ],
      people: people([
        ["elif", "Elif Şahin", "Production manager", "Days", "Gebze", 32, 45, ["Line scheduling", "Lean"], null, null],
        ["kemal", "Kemal Aydın", "Line 1 supervisor, washers", "Days", "Gebze", 36, 45, ["Washer line", "Changeovers"], null, "zeynep"],
        ["zeynep", "Zeynep Kaya", "Line 2 supervisor, dishwashers", "Days", "Gebze", 34, 45, ["Dishwasher line", "Changeovers"], null, "kemal"],
        ["ozan", "Ozan Çelik", "Line 3 supervisor, dryers", "Nights", "Gebze", 38, 45, ["Dryer line"], null, null],
        ["selma", "Selma Arslan", "Materials planner", "Days", "Gebze", 37, 45, ["Resin planning", "MRP"], null, null],
        ["hakan", "Hakan Doğan", "Quality engineer", "Days", "Supplier audit, Bursa", 30, 45, ["Resin qualification", "Moulding trials"], { days: [0, 1], label: "Bursa" }, null],
        ["derya", "Derya Polat", "Maintenance planner", "Days", "Gebze", 28, 45, ["Planned maintenance", "Moulds"], null, null],
        ["burak", "Burak Aydın", "Labor relations", "Days", "Gebze", 20, 30, ["Union liaison"], null, null]
      ]),
      agents: [["planning", "Planning agent"], ["data", "Plant data agent"], ["resin", "Resin supply agent"]],
      gaps: [
        { text: "Only Hakan can sign off a new resin grade, and he’s at a supplier audit until Thursday.", fix: "Ask Hakan to approve the trial plan remotely", who: "hakan", start: 0, day: 1, hours: 1, unblocks: "e-trial", at: ["hakan", 0, 1] },
        { text: "Line 3 has no backup supervisor on nights if Ozan is out.", fix: "Train Zeynep’s deputy on the dryer line", who: "zeynep", start: 2, day: 3, hours: 6, at: ["ozan", 0, 3] }
      ],
      decisions: [
        { id: "offspec", stake: 0.85, dir: "bridge", q: "Accept 40 t of Singapore resin with a slightly high melt index?", due: [1, "10:00"],
          context: "The first bridge-buy lot tested inside spec for dryer drums but at the edge for washer tubs.",
          opts: [{ t: "Accept for Line 3 only", sub: "Washers wait for the next lot", cost: 0, add: { text: "Route the 40 t lot to Line 3’s silo", who: "selma", start: 1, day: 1, hours: 2, dir: "bridge" } },
                 { t: "Reject and wait", sub: "Next lot in 9 days", cost: 0, hit: { m: 0.85, why: "Nine more days without Singapore resin on hand" } },
                 { t: "Accept for every line", sub: "Higher scrap on washer tubs", cost: 0, hit: { m: 0.8, why: "Scrap on washer tubs could fail the trial" } }],
          pick: 0, why: "Dryer drums tolerate the higher melt index, so Line 3 uses the lot safely and saves the in-spec resin for washers.",
          flip: "If Line 3’s silo is full, rejecting costs less than a second changeover." },
        { id: "saturday", stake: 0.85, dir: "strike", q: "Run Line 2 on Saturday to build dishwasher stock?", due: [2, "16:00"],
          context: "The union votes on a strike on October 20, and the chance of a strike at Gebze is 16%. Murat asked every plant manager for a strike contingency.",
          opts: [{ t: "Run Saturday", sub: "About 1,100 units ahead", cost: 38, add: { text: "Staff Line 2 for Saturday", who: "zeynep", start: 3, day: 3, hours: 3, dir: "strike" } },
                 { t: "Half shift on Sunday", sub: "About 550 units ahead", cost: 19, add: { text: "Staff Line 2 for a Sunday half shift", who: "zeynep", start: 3, day: 3, hours: 2, dir: "strike" } },
                 { t: "Don’t run", sub: "No stock ahead", cost: 0, hit: { m: 0.85, why: "No dishwasher stock banked before the vote" } }],
          pick: 0, why: "Each Saturday worked now banks a day of dishwasher output in case talks fail, and uses resin before a Gulf disruption makes it scarce.",
          flip: "If the chance of a strike fell below 10%, the overtime wouldn’t pay for itself." },
        { id: "maint", stake: 0.88, dir: "bridge", q: "Move Line 1’s planned maintenance?", due: [3, "12:00"],
          context: "Maintenance is set for Friday, the day after Line 1’s resin trial. Resin cover is thinnest around October 15, when Line 1 may idle anyway.",
          opts: [{ t: "Move to Thu Oct 15", sub: "Maintain while waiting for resin", cost: 0, add: { text: "Re-book Line 1’s maintenance crew for Thu Oct 15", who: "derya", start: 2, day: 2, hours: 2, dir: "bridge" } },
                 { t: "Keep Friday", sub: "Squeezes the trial into Thursday", cost: 0, hit: { m: 0.88, why: "Friday maintenance leaves the trial one day on Line 1" } }],
          pick: 0, why: "If Line 1 is going to wait for resin around October 15, maintenance then costs no output and leaves the trial room.",
          flip: "If the first Singapore lot lands early, keeping Friday is fine." }
      ],
      directives: [
        { id: "bridge", brief: true, protects: 11.7, short: "the resin bridge-buy", title: "Bridge-Buy Resin from Singapore", by: "Aylin Demir, VP Procurement", approved: "Approved by the COO in this morning’s brief",
          part: "Every line ready to run on Singapore resin when it lands on October 20, with no scrap spike.", due: [6, "10:00"],
          tasks: tasks([
            ["e-trial", "Trial-mould washer tubs on Line 1 with Singapore resin", "hakan", 2, 3, 8, "blocked", "Hakan is at a supplier audit until Thursday."],
            ["e-seq", "Re-sequence the lines so Singapore resin goes to washers first", "selma", 3, 6, 6],
            ["e-silo", "Agree silo space for the 4,000 t landing October 20", "selma", 0, 1, 2, "doing"],
            ["e-cover", "Report resin days of cover to Murat every morning", "selma", 0, 0, 1, "done"]
          ]) },
        { id: "strike", short: "the strike contingency", title: "Prepare a Strike Contingency", by: "Murat Kaya, Plant director", approved: "Asked of every plant manager this week",
          part: "Which work continues, which stops, and in what order, before the union votes on October 20.", due: [6, "10:00"],
          tasks: tasks([
            ["e-roles", "List the roles that keep running during a legal strike", "burak", 1, 3, 4],
            ["e-ahead", "Build two days of washer stock by October 30", "kemal", 0, 6, 10],
            ["e-shut", "Write a safe shutdown sequence for each line", "derya", 2, 3, 6],
            ["e-brief", "Brief supervisors on what they can say about the talks", "burak", 3, 6, 2]
          ]) }
      ],
      xin: [
        { id: "x-spec", ask: "Aylin Demir in Procurement", team: "Procurement", who: "Aylin Demir", what: "Confirm the Singapore grade’s melt-index spec", due: [1, "12:00"], p: 0.85, gates: "e-trial", status: "Supplier sheet requested" },
        { id: "x-silo", ask: "the Ambarlı bulk desk", team: "Ambarlı terminal", who: "Bulk desk", what: "Confirm silo space for 4,000 t", due: [1, "17:00"], p: 0.85, gates: "e-silo", status: "Quoted for October 19 to 22" },
        { id: "x-union", ask: "the union’s branch secretary", team: "Metalworkers’ union", who: "Branch secretary", what: "Agree the list of essential roles", due: [3, "12:00"], p: 0.6, gates: "e-roles", status: "Meeting Thursday morning" }
      ],
      xout: [
        { to: "Procurement", who: "Aylin Demir", what: "The resin trial’s result", from: "e-trial", due: [3, "17:00"], why: "Procurement releases the second Singapore lot only after a passing trial." },
        { to: "Plant director", who: "Murat Kaya", what: "The safe shutdown sequence for each line", from: "e-shut", due: [3, "17:00"], why: "Murat signs the plant’s strike contingency at Monday’s review." }
      ],
      watch: [
        { id: "resin", kind: "threat", title: "Resin Runs Out if the Strait Closes", pn: 27, p: "Chance of a closure in 30 days", trend: [6, 9, 18, 24, 27],
          impact: "Jubail resin stops. With 11 days of cover, all three lines stop in week two unless the Singapore resin is qualified and flowing.",
          signal: { text: "PP resin days of cover", now: 11, at: 8, max: 20, unit: " days", dir: "below" },
          steps: [["Switch every line to the Singapore grade", "selma", 4], ["Cut to two shifts on Lines 1 and 2", "elif", 2], ["Pull planned maintenance into the idle days", "derya", 3]] },
        { id: "strike-w", kind: "threat", title: "Strike at the Gebze Plant", pn: 16, p: "Chance before November 1", trend: [5, 8, 13, 16],
          impact: "Lines stop for the length of the walkout. Every day out costs about 6,200 units, and the EU washer launch slips after five days.",
          signal: { text: "Overtime refusals", now: 12, at: 20, max: 30, unit: "%", dir: "above" },
          steps: [["Run the shutdown sequence line by line", "derya", 4], ["Keep the agreed essential roles staffed", "burak", 2], ["Shift EU washer orders to Pune", "elif", 3]] },
        { id: "redsea-e", kind: "threat", title: "Red Sea Shuts to Traffic", pn: 31, p: "Chance in 30 days", trend: [22, 25, 32, 31],
          impact: "Resin and Bursa parts ships go round the Cape, adding 11 days to every inbound lot.",
          signal: { text: "Bab el-Mandeb transits", now: 64, at: 50, max: 100, unit: "% of normal", dir: "below" },
          steps: [["Add 11 days to every inbound in the plan", "selma", 3], ["Ask Bursa for a road shipment of seat assemblies", "selma", 1]] },
        { id: "pune", kind: "opportunity", title: "Spare Capacity at the Pune Plant", p: "18% free this quarter",
          impact: "Pune can take some EU washer orders, which would protect the launch if Gebze has to stop.",
          signal: { text: "Pune spare capacity", now: 18, at: 10, max: 30, unit: "%", dir: "below" },
          steps: [["Agree which washer SKUs Pune could make", "elif", 3]] }
      ],
      asks: [["Capacity", "How long can Gebze run on Singapore resin alone?"], ["What if", "What if the first Singapore lot lands a week late?"], ["Exposure", "Which products would Gebze stop making first if resin runs short?"], ["Forecast", "Would a Hormuz closure make a strike at Gebze more likely?"]]
    },

    layla: {
      first: "Layla", name: "Layla Mansour", role: "Head of key accounts, GCC", team: "Key accounts, GCC", short: "GCC key accounts",
      boss: { name: "Karim Haddad", first: "Karim", role: "GM, MENA" },
      title: "Keep Every GCC Key Account Ahead of the Delays",
      lede: "The Khor Fakkan diversion approved this morning adds a day and a half to Middle East deliveries. Al Noor Hypermarkets and Gulf Home Electronics can both claim penalties after 7 days short.",
      lead: "No key account should hear about a delay from anyone but Halvorsen. Every open Middle East order needs a new delivery promise by Thursday, and only Ravi can change them in the order system, with 12 hours of it on top of a full week.",
      priorities: [
        ["Get Ravi under capacity", "The order desk agent can rewrite the delivery promises for Ravi to check, which takes his part from 12 hours to 2."],
        ["Call Al Noor this week", "A call with a protection plan, before the delays reach the shelf, lets Al Noor move its promotions instead of running out."],
        ["Free 400 pallets at the Dubai DC", "The diverted boxes need the room, and slow fridge SKUs take 260 of those spaces."]
      ],
      people: people([
        ["layla", "Layla Mansour", "Head of key accounts", "Days", "Dubai", 34, 45, ["Account strategy", "Negotiation"], null, null],
        ["omar", "Omar Farouk", "Key account manager, Al Noor Hypermarkets", "Days", "Dubai", 38, 45, ["Al Noor", "Promotions"], null, "hessa"],
        ["hessa", "Hessa Al Suwaidi", "Key account manager, Gulf Home Electronics", "Days", "Riyadh", 31, 45, ["Gulf Home", "KSA retail"], null, "omar"],
        ["ravi", "Ravi Menon", "Order desk lead", "Days", "Dubai", 40, 45, ["Order system", "Delivery promises"], null, null],
        ["lina", "Lina Aziz", "Customer service lead", "Days", "Dubai", 33, 45, ["Customer letters", "Claims"], null, null],
        ["yusuf", "Yusuf Demir", "Channel planner", "Days", "Dubai", 30, 45, ["Allocation", "Forecasting"], null, null],
        ["dana", "Dana Khoury", "Trade marketing", "Days", "Dubai", 22, 45, ["Promotions", "In-store"], { days: [1, 2], label: "Riyadh" }, null]
      ]),
      agents: [["order", "Order desk agent"], ["drafting", "Drafting agent"], ["contract", "Contract agent"]],
      gaps: [
        { text: "Only Ravi can change delivery promises in the order system, and the diversion means changing hundreds.", fix: "Give Yusuf order-system access for this month", who: "ravi", start: 0, day: 0, hours: 1, at: ["ravi", 0, 2] },
        { text: "Al Noor and Gulf Home both have penalty clauses after 7 days short, and nobody owns tracking the clock.", fix: "Make Yusuf the owner of the penalty clock", who: "yusuf", start: 0, day: 0, hours: 1, at: ["omar", 3, 6] }
      ],
      decisions: [
        { id: "warn", stake: 0.75, dir: "protect", q: "Tell Al Noor Hypermarkets about possible delays now?", due: [2, "12:00"],
          context: "Al Noor’s penalty clause starts after 7 days short. The diversion adds a day and a half to Middle East deliveries.",
          opts: [{ t: "Call this week with a plan", sub: "Omar leads; you join", cost: 0, add: { text: "Call Al Noor’s buyer with the protection plan", who: "omar", start: 1, day: 2, hours: 2, dir: "protect" } },
                 { t: "Send a written notice", sub: "Formal, but colder", cost: 0, add: { text: "Send Al Noor a written notice of delays", who: "lina", start: 1, day: 1, hours: 1, dir: "protect" }, hit: { m: 0.9, why: "A letter without a plan invites a penalty claim" } },
                 { t: "Wait for a closure", sub: "No noise unless it happens", cost: 0, hit: { m: 0.7, why: "Al Noor hears about delays from the shelf first" } }],
          pick: 0, why: "Customers who hear early, with a plan, rarely invoke penalties. Calling first also lets Al Noor move its promotions instead of running out on shelf.",
          flip: "If the diversion’s delay shrinks under a day, a written notice is enough." },
        { id: "discount", stake: 0.75, dir: "divert-l", q: "Offer 3% off to move slow fridge stock out of the Dubai DC?", due: [3, "17:00"],
          context: "Making room for the diverted boxes needs 400 pallet spaces. Slow fridge SKUs take 260 of them.",
          opts: [{ t: "Offer 3% to two accounts", sub: "Frees 260 pallets", cost: 21, add: { text: "Offer the slow fridge SKUs at 3% off to Al Noor and Gulf Home", who: "hessa", start: 2, day: 3, hours: 2, dir: "divert-l" } },
                 { t: "Move them to the Dammam DC", sub: "Trucking cost, no discount", cost: 14, add: { text: "Truck the slow fridge SKUs to the Dammam DC", who: "yusuf", start: 2, day: 3, hours: 3, dir: "divert-l" } },
                 { t: "Leave them", sub: "The DC runs short of space", cost: 0, hit: { m: 0.75, why: "The Dubai DC can’t take the diverted boxes" } }],
          pick: 0, why: "Space at the Dubai DC is worth more this month than the margin on slow SKUs, and the accounts get a deal before any shortage news.",
          flip: "If Dammam has empty racking, moving the stock keeps the margin." },
        { id: "ramadan", stake: 0.95, dir: "protect", q: "Start planning the Ramadan promotion two weeks earlier?", due: [6, "10:00"],
          context: "Retailers are asking for earlier stock commitments, and supply may be tight in November.",
          opts: [{ t: "Bring it forward", sub: "Lock volumes before any shortage", cost: 0, add: { text: "Bring the Ramadan promotion plan forward two weeks", who: "dana", start: 3, day: 6, hours: 6, dir: "protect" } },
                 { t: "Keep the usual plan", sub: "Decide in November", cost: 0, hit: { m: 0.95, why: "Ramadan volumes go uncommitted while stock is tight" } }],
          pick: 0, why: "Committing volumes while stock is available protects the season’s biggest promotion if Gulf supply tightens.",
          flip: "If the strait’s odds fall below 15% by Monday, the usual plan is fine." }
      ],
      directives: [
        { id: "protect", short: "the key-account plan", title: "Protect GCC Key Accounts", by: "Karim Haddad, GM, MENA", approved: "Set after this morning’s brief",
          part: "No key account surprised, and none 7 days short on its top sellers.", due: [3, "17:00"],
          tasks: tasks([
            ["l-top", "Rank the top 20 SKUs for each account", "yusuf", 0, 1, 4, "doing"],
            ["l-sub", "Agree substitution rules with each buyer", "omar", 1, 3, 4],
            ["l-letter", "Draft the customer letter for a closure", "lina", 1, 2, 3],
            ["l-clock", "Track days short against each penalty clause", "yusuf", 0, 1, 2]
          ]) },
        { id: "divert-l", brief: true, protects: 7.6, short: "the Khor Fakkan diversion", title: "Divert Four Jebel Ali Sailings", by: "Tomas Varga, VP Logistics", approved: "Approved by the COO in this morning’s brief",
          part: "Every Middle East delivery promise reflects the extra day and a half.", due: [2, "17:00"],
          tasks: tasks([
            ["l-promise", "Update delivery promises on open Middle East orders", "ravi", 1, 2, 12],
            ["l-tell", "Tell account managers which orders move", "ravi", 2, 2, 2]
          ]) }
      ],
      xin: [
        { id: "x-eta", team: "Port operations, UAE", who: "Farah Saleh", persona: "farah", src: "t-eta", what: "New arrival times for 212 boxes", due: [0, "09:00"], p: 0.9, gates: "l-promise" },
        { id: "x-buyer", ask: "Al Noor’s category buyer", team: "Al Noor Hypermarkets", who: "Category buyer", what: "Agree substitution rules", due: [3, "12:00"], p: 0.7, gates: "l-sub", status: "Meeting requested" },
        { id: "x-legal", ask: "Legal’s contracts counsel", team: "Legal, MENA", who: "Contracts counsel", what: "Clear the customer letter’s wording", due: [2, "12:00"], p: 0.8, gates: "l-letter", status: "In the queue" }
      ],
      xout: [
        { to: "GM, MENA", who: "Karim Haddad", what: "Which accounts are exposed, ranked", from: "l-top", due: [1, "17:00"], why: "Karim calls the two biggest accounts himself if a closure comes." },
        { to: "Port operations, UAE", who: "Farah Saleh", persona: "farah", what: "Which diverted boxes the key accounts need first", from: "l-tell", due: [2, "17:00"], why: "Farah’s team trucks those boxes to the Dubai DC first." }
      ],
      watch: [
        { id: "mena", kind: "threat", title: "Middle East Stock-Outs if the Strait Closes", pn: 27, p: "Chance of a closure in 30 days", trend: [6, 9, 18, 24, 27],
          impact: "The Dubai and Dammam DCs run dry within two weeks, and two key accounts can invoke penalties after 7 days short.",
          signal: { text: "Washer stock at the Dubai DC", now: 14, at: 7, max: 28, unit: " days", dir: "below" },
          steps: [["Allocate remaining stock to top SKUs by account", "yusuf", 4], ["Call every key account the same day", "layla", 3], ["Send the agreed customer letter", "lina", 2]] },
        { id: "feeders-l", kind: "threat", title: "Feeder Sanctions Hold Dammam Deliveries", pn: 15, p: "Chance in 30 days", trend: [9, 10, 13, 15],
          impact: "Gulf Home’s Saudi stores lose about a week of deliveries while boxes are screened.",
          signal: { text: "Listing of the feeders’ technical manager", dir: "event", status: "Not yet" },
          steps: [["Warn Gulf Home’s buyer", "hessa", 1], ["Serve Saudi stores from Dubai by road", "ravi", 4]] },
        { id: "rival", kind: "opportunity", title: "A Rival Brand Is Short in Saudi Arabia", p: "Seen in 4 of 10 store checks",
          impact: "A competitor’s washers are missing from Gulf Home shelves. Extra facings now could hold share after the competitor recovers.",
          signal: { text: "Store checks with the rival out of stock", now: 4, at: 6, max: 10, unit: " of 10", dir: "above" },
          steps: [["Offer Gulf Home extra washer facings", "hessa", 2], ["Shift 300 washers to Saudi stores", "yusuf", 2]] }
      ],
      asks: [["Exposure", "Which customers would feel a Jebel Ali delay first?"], ["What if", "What if Al Noor invokes its penalty clause?"], ["Capacity", "How many washers could Saudi stores take from Dubai by road?"], ["Forecast", "How likely are the Dammam feeders to be sanctioned this month?"]]
    }
  };
  var BRIEF_PROTECTS = 25.0; // the brief's three decisions protect $25.0M in all

  // a decision's `stake` is what leaving it open costs its directive's chance; doing nothing keeps that cost as a `hit`
  // tasks that can't start until others are done
  var AFTER = { "t-customs": ["t-slots"], "t-gate": ["t-slots"], "t-dc": ["t-eta"], "t-hold": ["t-hull"], "e-seq": ["e-trial"], "e-brief": ["e-roles"], "l-sub": ["l-top"], "l-tell": ["l-promise"] };
  // tasks only someone certified can do, so no suggestion passes them to the wrong person
  var SKILL = { "t-customs": "Customs filings", "e-trial": "Moulding trials", "l-promise": "Order system" };
  // work an agent can take on, and the hours its human owner keeps to check it
  var AGENTABLE = { "t-customs": ["customs", 3], "t-calls": ["booking", 1], "t-trucks": ["haulage", 3], "e-seq": ["planning", 2], "e-cover": ["data", 0], "l-promise": ["order", 2], "l-letter": ["drafting", 1], "l-clock": ["contract", 1] };
  var STATUS = { todo: "To do", doing: "In progress", done: "Done", blocked: "Stuck" };
  // what each task is for, and the steps that make it up (ticking them moves its status)
  var DETAIL = {
    "t-slots": ["Locks four Khor Fakkan berths for the diverted sailings before the port stops holding slots on option.",
      ["Confirm the four sailings and their arrival dates with the carrier", "Check each slot against the vessel’s length and draft", "Book the held slots in the port system", "Send the booking numbers to the carrier and Sanjay"]],
    "t-trucks": ["Gets every box from Khor Fakkan to the Dubai DC within 36 hours of discharge, which the diversion’s $7.6M depends on.",
      ["Ask both hauliers for 14 trucks a sailing", "Agree rates and a 36-hour delivery window", "Get road permits for the Khor Fakkan to Dubai run", "Share the truck plan with the Dubai DC"]],
    "t-customs": ["Clears the diverted boxes for transit to Dubai. Without an entry, a box can’t leave the Khor Fakkan terminal.",
      ["Pull the bills of lading for the four sailings", "Draft a transit entry for each box", "Check the entries against the cargo manifests", "File the entries with Khor Fakkan customs", "Chase any entry customs holds"]],
    "t-eta": ["Gives every team downstream the boxes’ new arrival times, starting with Layla’s order desk.",
      ["Export the 212 boxes from the TMS", "Apply the new Khor Fakkan dates", "Publish the new arrival times to the order desk"]],
    "t-dc": ["Lets the Dubai DC staff its receiving docks for when the diverted boxes will actually arrive.",
      ["Turn the new arrival times into daily receiving windows", "Agree the windows with the DC’s inbound planning", "Confirm dock staffing for Saturday"]],
    "t-gate": ["Makes sure the night shift knows which boxes go to Khor Fakkan and how the gate runs once the diversion starts.",
      ["Write a one-page gate plan for nights", "Walk Nadia’s shift through it at the start of shift", "Post the plan in the gate office"]],
    "t-calls": ["Gives Treasury the list it needs to put every Gulf port call on the war-risk cover before the quote expires Wednesday at 5pm.",
      ["List every Gulf call in the next 30 days, by vessel", "Add each vessel’s cargo value", "Send the list to Hanne Sørli in Treasury"]],
    "t-hull": ["Treasury prices the cover on each vessel’s insured hull value, and one value is missing.",
      ["Collect the hull values from each carrier", "Get the Sable Orchid’s value from its operator", "Send the full set to Treasury"]],
    "t-hold": ["Stops Halvorsen paying the carrier’s surcharge for risk the new cover may already insure.",
      ["Tell the carrier the surcharge is under review", "Hold the AE7 invoice until Treasury confirms the cover", "Accept or turn down the surcharge once the cover is bound"]],
    "e-trial": ["Proves the Singapore grade moulds washer tubs within Gebze’s scrap and strength limits. Procurement won’t release the second lot until the trial passes, and the lines can’t switch to the new resin without it.",
      ["Hakan approves the trial plan", "Load 2 t of the Singapore lot into Line 1’s dryer", "Mould 200 tubs at standard settings, then at two melt temperatures", "Test the tubs for impact strength, warpage, and scrap", "Hakan signs off the result and sends it to Procurement"]],
    "e-seq": ["Sends the first Singapore resin to washer tubs, the line with the thinnest cover.",
      ["Rank the lines by resin days of cover", "Rewrite the week’s schedule so washers draw the Singapore grade first", "Agree changeover times with Kemal and Zeynep", "Publish the schedule to the line supervisors"]],
    "e-silo": ["Makes room at the Ambarlı terminal for the 4,000 t landing October 20, so the resin isn’t left on the ship.",
      ["Confirm the landing window with Procurement", "Book silo space for October 19 to 22", "Arrange trucking from Ambarlı to Gebze"]],
    "e-cover": ["Keeps Murat’s view of how long Gebze can run current every morning.",
      ["Read the silo levels at 6am", "Report days of cover by line to Murat"]],
    "e-roles": ["Fixes which roles keep working through a legal strike, so the contingency covers safety and essential maintenance.",
      ["Draft the list of essential roles", "Review it with the union’s branch secretary on Thursday", "Get the agreed list signed by both sides"]],
    "e-ahead": ["Banks two days of washer output before the strike vote, so EU orders keep shipping if talks fail.",
      ["Set the extra output for each day", "Schedule the overtime with Kemal’s team", "Move finished stock to the export warehouse"]],
    "e-shut": ["Lets each line stop safely, and restart quickly, if a strike is called.",
      ["Write the shutdown order for Lines 1, 2, and 3", "List what has to keep running, such as dryers and compressors", "Walk each sequence through with its supervisor", "Send the sequences to Murat"]],
    "e-brief": ["Keeps supervisors from saying anything about the talks that could breach labor law.",
      ["Get the agreed wording from Labor relations and Legal", "Brief the three line supervisors", "Pass their questions to Burak"]],
    "l-top": ["Shows which products each account can’t do without, so scarce stock goes there first.",
      ["Pull 12 weeks of sales by account and SKU", "Rank the top 20 SKUs for each account", "Send the ranking to Karim"]],
    "l-sub": ["Settles in advance what each buyer will take when a SKU runs short, so substitutes ship without a dispute.",
      ["Propose a substitute for each top SKU", "Meet Al Noor’s category buyer", "Write the agreed rules into the order desk’s notes"]],
    "l-letter": ["Has the customer letter ready to send the same day if the strait closes.",
      ["Draft the letter around the protection plan", "Get Legal’s sign-off on the wording", "Load it into the customer service system, ready to send"]],
    "l-clock": ["Shows how close each account is to a penalty claim, so the team acts before day 7.",
      ["List each account’s penalty terms", "Count days short by SKU every morning", "Flag any SKU 4 days short to Layla"]],
    "l-promise": ["Gives customers delivery dates that include the diversion’s extra day and a half, so no order is promised on the old date.",
      ["Load Farah’s new arrival times", "Recalculate the promise on each open Middle East order", "Check the 40 largest orders by hand", "Release the new promises to customers"]],
    "l-tell": ["Lets account managers warn their buyers about the orders that move before the buyers notice.",
      ["List the orders whose dates moved", "Send each account manager their list"]]
  };

  /* ================= State: one per manager, kept while switching between them ================= */
  var S = {}, pid = "farah", P, st;
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function init(id) {
    if (S[id]) return S[id];
    var p = PERSONAS[id], s = { tasks: {}, dirs: [], own: [], decided: {}, choice: {}, pending: {}, hits: {}, ext: {}, prepared: {}, active: {}, armed: {}, planned: {}, escalated: {}, steps: {}, wsel: {}, prep: {}, sel: null, dsel: null, watch: p.watch[0].id, sent: false, note: "", seq: 0 };
    p.directives.forEach(function (d) {
      var c = clone(d); c.taskIds = c.tasks.map(function (t) { t.dir = d.id; s.tasks[t.id] = t; return t.id; }); delete c.tasks; s.dirs.push(c);
    });
    // work under way has its first step ticked; finished work all of them
    Object.keys(s.tasks).forEach(function (k) {
      var t = s.tasks[k], n = DETAIL[k] ? DETAIL[k][1].length : 0, done = {};
      if (t.status === "done") for (var i = 0; i < n; i++) done[i] = true; else if (t.status === "doing" && n) done[0] = true;
      s.steps[k] = done;
    });
    p.xin.forEach(function (x) { s.ext[x.id] = { nudged: false, got: false, raised: false }; });
    s.sel = s.dirs[0].taskIds.filter(function (id) { return s.tasks[id].status !== "done"; })[0];
    return (S[id] = s);
  }
  function persona(id) { pid = id; P = PERSONAS[id]; st = init(id); try { localStorage.setItem("daybreak.team.as", id); } catch (e) {} }

  /* ================= The model: chance on time, from what stands in each task's way ================= */
  function isAgent(id) { return typeof id === "string" && id.indexOf("ag:") === 0; }
  function agentName(id) { var a = P.agents.filter(function (x) { return "ag:" + x[0] === id; })[0]; return a ? a[1] : "Agent"; }
  function person(id) { return P.people.filter(function (x) { return x.id === id; })[0]; }
  function isMe(id) { return id === P.people[0].id; }
  function allTasks(s) { return Object.keys(s.tasks).map(function (k) { return s.tasks[k]; }); }
  function human(t) { return isAgent(t.who) ? t.rev : t.who; }
  function hoursOf(s, id) {
    var p = person(id);
    return p.base + allTasks(s).reduce(function (h, t) {
      if (t.status === "done") return h;
      return h + (t.who === id ? t.hours : 0) + (t.rev === id ? t.revH : 0);
    }, 0);
  }
  function dirOf(s, id) { return s.dirs.filter(function (d) { return d.id === id; })[0]; }
  function extP(s, x) {
    if (x.src) { var o = init(x.persona).tasks[x.src]; return o && o.status === "done" ? 1 : x.p; }
    var e = s.ext[x.id];
    if (e.got) return 1;
    return Math.min(0.97, x.p + (e.nudged ? 0.08 : 0) + (e.raised ? 0.15 : 0));
  }
  // each obstacle a multiplier on a task's chance, with the reason in words
  function taskRisk(s, t) {
    if (t.status === "done") return { p: 1, f: [] };
    var f = [], who = human(t), me = person(who);
    if (t.status === "blocked") f.push([t.blocker.replace(/\.$/, "") + (s.escalated[t.id] ? ", raised with " + P.boss.first : ""), s.escalated[t.id] ? 0.72 : 0.6]);
    var over = hoursOf(s, who) - me.cap;
    if (over > 0) f.push([(isMe(who) ? "You’re " : me.name.split(" ")[0] + " is ") + over + " h over capacity this week", Math.max(0.45, 1 - 0.025 * over)]);
    if (me.off && me.off.days.indexOf(t.start) >= 0 && t.status !== "blocked") f.push([me.name.split(" ")[0] + " is away (" + me.off.label + ") the day it starts", 0.85]);
    (AFTER[t.id] || []).forEach(function (d) {
      var dt = s.tasks[d];
      if (dt && dt.status !== "done") f.push(["Starts after “" + dt.text + "”" + (dt.status === "blocked" ? ", which is stuck" : ""), dt.status === "blocked" ? 0.8 : 0.97]);
    });
    P.xin.forEach(function (x) {
      if (x.gates !== t.id) return;
      var xp = extP(s, x);
      if (xp < 1) f.push(["Waits on " + x.team + ": " + lc(x.what) + " (" + Math.round(100 * xp) + "% on time)", 1 - (1 - xp) * 0.6]);
    });
    var p = isAgent(t.who) ? 0.99 : 0.985;
    f.forEach(function (x) { p *= x[1]; });
    return { p: p, f: f };
  }
  function dirRisk(s, d) {
    var p = 1;
    d.taskIds.map(function (id) { return s.tasks[id]; }).filter(Boolean).forEach(function (t) { p *= taskRisk(s, t).p; });
    (s.hits[d.id] || []).forEach(function (h) { p *= h.m; });
    // a call still open on this directive weighs on it until it's made
    P.decisions.forEach(function (x) { if (x.dir === d.id && x.stake && s.decided[x.id] == null) p *= x.stake; });
    return Math.max(0.02, p);
  }
  function expected(s) { return s.dirs.reduce(function (a, d) { return a + (d.brief ? d.protects * dirRisk(s, d) : 0); }, 0); }
  function rides() { return P.directives.reduce(function (a, d) { return a + (d.brief ? d.protects : 0); }, 0); }
  // one number for comparing moves: money expected to land, plus a little for directives that carry no money
  function score(s) { return expected(s) + s.dirs.reduce(function (a, d) { return a + (d.brief ? 0 : dirRisk(s, d)); }, 0); }
  function band(p) { return p >= 0.8 ? { label: "On track", cls: "" } : p >= 0.6 ? { label: "At risk", cls: "pill--amber" } : { label: "Off track", cls: "pill--red" }; }

  /* ================= Helpers ================= */
  var $ = function (k) { return document.querySelector('[data-out="' + k + '"]'); };
  var byId = function (id) { return document.getElementById(id); };
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    if (typeof attrs === "string") attrs = { class: attrs };
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function svg(tag, attrs) { var e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function initials(n) { return n.replace(/ agent$/i, "").replace(/^The /, "").trim().split(" ").map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase(); }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many || one + "s"); }
  var WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  function words(n, one, many) { return (WORDS[n] || n) + " " + (n === 1 ? one : many || one + "s"); }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function lc(t) { return /^[A-Z][A-Z]/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1); } // leaves acronyms such as PP and TEU alone
  function pct(p) { return Math.round(100 * p) + "%"; }
  function money(m) { return DB.money(m); }
  function signed(m) { return Math.abs(m) < 0.05 ? "$0" : (m < 0 ? "−" : "+") + money(Math.abs(m)); }
  function kmoney(k) { return "$" + (k % 1 ? k.toFixed(1) : k) + "k"; }
  function dayText(d, time) { return (d === -2 ? "Sun Oct 4" : d === -1 ? "Mon Oct 5" : d === 0 ? "Today" : d === 1 ? "Tomorrow" : DOW[d]) + (time ? " " + time : ""); }
  function dayLow(d, time) { var t = dayText(d, time); return d === 0 || d === 1 ? lc(t) : t; }
  function byDue(a, b) { return a.due[0] - b.due[0] || a.due[1].localeCompare(b.due[1]); }
  function first(id) { return isAgent(id) ? "the " + lc(agentName(id)) : isMe(id) ? "you" : person(id).name.split(" ")[0]; }
  function First(id) { return isAgent(id) ? agentName(id) : isMe(id) ? "You" : person(id).name.split(" ")[0]; }
  // rounded-square initials in a warm color picked from the name, as on the agents page; agents in cream with ink
  var COLORS = ["#7a1f2b", "#161412", "#c2410c", "#8a5a2b", "#a33a2a", "#a16207"];
  function avatar(id, cls) {
    var name = isAgent(id) ? agentName(id) : person(id) ? person(id).name : String(id);
    var a = el("span", { class: "av" + (isAgent(id) ? " av--agent" : "") + (cls ? " " + cls : ""), "aria-hidden": "true" }, initials(name));
    if (!isAgent(id)) { var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; a.style.setProperty("--av", COLORS[h % COLORS.length]); }
    return a;
  }
  function button(text, cls, fn, attrs) { var b = el("button", Object.assign({ type: "button", class: cls }, attrs || {}), text); b.addEventListener("click", fn); return b; }
  function glide(id, offset) {
    var t = byId(id); if (!t) return;
    var bar = document.querySelector(".bar").getBoundingClientRect().bottom;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - bar - (offset == null ? 24 : offset), behavior: REDUCE ? "auto" : "smooth" });
  }
  function flash(id) {
    var t = byId(id); if (!t) return;
    glide(id, 40);
    t.classList.remove("is-flash"); void t.offsetWidth; t.classList.add("is-flash");
  }
  // a figure redrawn with a new value counts to it from the old one
  function counted(sel, fn) {
    var old = [].map.call(document.querySelectorAll(sel), function (e) { return e.textContent; });
    fn();
    [].forEach.call(document.querySelectorAll(sel), function (e, i) { if (old[i] != null && old[i] !== e.textContent) CountFrom(e, old[i]); });
  }
  function changed() { render(); }
  // a redraw a moment after a switch or a tick, so its own motion plays first
  function later() { setTimeout(changed, 300); }

  /* ================= Changes to the plan, each applied to a state so it can be previewed first ================= */
  function addTask(s, a, group, why) {
    var id = "x" + (++s.seq);
    s.tasks[id] = { id: id, text: a.text, who: a.who, start: a.start, day: a.day, hours: a.hours, status: "todo", blocker: "", dir: a.dir || null, why: why || "" };
    var d = a.dir && dirOf(s, a.dir);
    if (group) group.push(id); else if (d) d.taskIds.push(id); else s.own.push(id);
    return id;
  }
  function removeTask(s, id) {
    delete s.tasks[id];
    s.own = s.own.filter(function (x) { return x !== id; });
    s.dirs.forEach(function (d) { d.taskIds = d.taskIds.filter(function (x) { return x !== id; }); });
    Object.keys(s.active).forEach(function (k) { s.active[k].ids = s.active[k].ids.filter(function (x) { return x !== id; }); });
  }
  function applyOpt(s, d, i) {
    var o = d.opts[i], rec = { i: i };
    if (o.done && s.tasks[o.done]) { rec.done = o.done; rec.was = s.tasks[o.done].status; s.tasks[o.done].status = "done"; }
    if (o.add) rec.added = addTask(s, o.add, null, "From your decision on whether to " + lc(d.q.replace(/\?$/, "")) + ": " + lc(o.t) + ".");
    if (o.hit) { (s.hits[d.dir] = s.hits[d.dir] || []).push({ m: o.hit.m, why: o.hit.why, dec: d.id }); rec.hit = true; }
    s.decided[d.id] = rec;
    return rec;
  }
  function undoOpt(s, d) {
    var rec = s.decided[d.id];
    if (rec.done && s.tasks[rec.done]) s.tasks[rec.done].status = rec.was;
    if (rec.added) removeTask(s, rec.added);
    if (rec.hit) s.hits[d.dir] = (s.hits[d.dir] || []).filter(function (h) { return h.dec !== d.id; });
    delete s.decided[d.id];
  }
  function toAgent(s, t) { var a = AGENTABLE[t.id]; t.rev = human(t); t.revH = a[1]; t.who = "ag:" + a[0]; }
  function canAgent(t) { return AGENTABLE[t.id] && !isAgent(t.who) && t.status !== "done" && P.agents.some(function (a) { return a[0] === AGENTABLE[t.id][0]; }); }
  function qualified(t, q) { return !SKILL[t.id] || q.skills.indexOf(SKILL[t.id]) >= 0; }
  function planGap(s, i) {
    var g = P.gaps[i];
    s.planned[i] = addTask(s, { text: g.fix, who: g.who, start: g.start, day: g.day, hours: g.hours }, null, g.text);
    if (g.unblocks && s.tasks[g.unblocks] && s.tasks[g.unblocks].status === "blocked") { s.tasks[g.unblocks].status = "todo"; s.tasks[g.unblocks].blocker = ""; }
  }
  // what a change does to the plan: the directive's chance before and after, money expected, and whose hours move
  function preview(fn, dirId) {
    var tmp = clone(st); fn(tmp);
    var d0 = dirId && dirOf(st, dirId), d1 = dirId && dirOf(tmp, dirId);
    var loads = P.people.map(function (p) { return { p: p, a: hoursOf(st, p.id), b: hoursOf(tmp, p.id) }; }).filter(function (x) { return x.a !== x.b; });
    return { tmp: tmp, from: d0 ? dirRisk(st, d0) : null, to: d1 ? dirRisk(tmp, d1) : null, dExp: expected(tmp) - expected(st), dScore: score(tmp) - score(st), loads: loads };
  }

  /* ================= Head and the managers ================= */
  function renderHead() {
    $("kicker").textContent = "Workflows for " + P.name + ", " + lc(P.role) + ", Tuesday, October 6, 2026, as of 7:10am GST";
    $("title").textContent = P.title;
    $("lede").textContent = P.lede;
    var box = byId("mgrs");
    if (!box.querySelector("button")) Object.keys(PERSONAS).forEach(function (id) {
      var b = el("button", { type: "button", "data-as": id }, PERSONAS[id].first);
      b.title = PERSONAS[id].name + ", " + PERSONAS[id].short;
      b.addEventListener("click", function () { if (id !== pid) switchTo(id); });
      box.appendChild(b);
    });
    [].forEach.call(box.querySelectorAll("button"), function (b) { b.setAttribute("aria-pressed", String(b.dataset.as === pid)); });
    placePill();
  }
  function placePill() {
    var box = byId("mgrs"), b = box.querySelector('[aria-pressed="true"]'), pill = box.querySelector(".mgrs__pill");
    if (!b) return;
    pill.style.width = b.offsetWidth + "px"; pill.style.transform = "translateX(" + (b.offsetLeft - 4) + "px)";
  }
  window.addEventListener("resize", placePill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePill);
  function switchTo(id) {
    persona(id); render();
    var body = byId("tbody"), head = document.querySelector(".th__words");
    if (!REDUCE && body.animate) [head, body].forEach(function (x) {
      x.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)" });
    });
  }

  /* ================= 1. Bottom line ================= */
  function renderBottom() {
    $("bl-lead").textContent = P.lead;
    var kp = byId("kp"); kp.textContent = "";
    P.priorities.forEach(function (x, i) {
      var li = el("li"); li.appendChild(el("span", "kp__n", String(i + 1)));
      var t = el("div"); t.appendChild(el("b", null, x[0])); t.appendChild(el("p", null, x[1])); li.appendChild(t);
      kp.appendChild(li);
    });
    var R = rides(), E = expected(st);
    $("rides-k").textContent = "Expected to land, as the plan stands";
    var rv = $("rides-v"), old = rv.textContent;
    rv.textContent = money(E);
    if (rv._src) rv._src = null; // a redraw before the first count: the count would bring back the old figure
    else if (old && old !== rv.textContent) CountFrom(rv, old);
    $("rides-of").textContent = "of " + money(R);
    $("rides-bar").style.width = (100 * E / R).toFixed(1) + "%";
    var briefDirs = st.dirs.filter(function (d) { return d.brief; });
    $("rides-what").textContent = money(R) + " of the $" + BRIEF_PROTECTS.toFixed(1) + "M the brief’s decisions protect rides on " + P.first + "’s team: " +
      briefDirs.map(function (d) { return d.short + " (" + money(d.protects) + ")"; }).join(" and ") + ". The other " + money(R - E) + " is at risk from how the work is going.";
    var ul = byId("ontime"); ul.textContent = "";
    st.dirs.forEach(function (d) {
      var p = dirRisk(st, d), b = band(p), li = el("li");
      li.appendChild(el("span", "ontime__t", d.title));
      li.appendChild(el("span", "pill " + b.cls, pct(p) + " on time"));
      ul.appendChild(li);
    });

    var open = P.decisions.filter(function (d) { return st.decided[d.id] == null && st.pending[d.id] == null; });
    var next = open.slice().sort(byDue)[0];
    var lead = [].concat.apply([], st.dirs.map(function (d) { return d.taskIds; })).map(function (id) { return st.tasks[id]; }).filter(Boolean);
    var done = lead.filter(function (t) { return t.status === "done"; }).length, stuck = lead.filter(function (t) { return t.status === "blocked"; }).length;
    var here = P.people.filter(function (p) { return p.base > 0; });
    var h = here.reduce(function (s, p) { return s + hoursOf(st, p.id); }, 0), c = here.reduce(function (s, p) { return s + p.cap; }, 0);
    var over = here.filter(function (p) { return hoursOf(st, p.id) > p.cap; });
    var worst = lead.filter(function (t) { return t.status !== "done"; }).map(function (t) { return { t: t, r: taskRisk(st, t) }; }).sort(function (a, b) { return a.r.p - b.r.p; })[0];
    var cells = [
      ["waiting", "Decisions waiting", String(open.length), next ? "Next due " + dayLow(next.due[0], next.due[1]) : "All made", open.length ? "red" : ""],
      ["plan", "Tasks done", done + " of " + lead.length, stuck ? cap(words(stuck, "task")) + " stuck" : "Nothing stuck", ""],
      ["team", "Team load this week", Math.round(100 * h / c) + "%", over.length ? over.map(function (p) { return First(p.id); }).join(" and ") + " over capacity" : "Nobody over capacity", over.length ? "red" : ""],
      ["plan", "Weakest task, on time", worst ? pct(worst.r.p) : "None", worst ? worst.t.text : "Every task is done", worst && worst.r.p < 0.6 ? "red" : ""]
    ];
    var box = byId("stats");
    counted(".stat__v", function () {
      box.textContent = "";
      cells.forEach(function (x, i) {
        var b = el("button", { type: "button", class: "stat" + (x[4] ? " is-" + x[4] : "") });
        b.appendChild(el("span", "stat__k", x[1]));
        b.appendChild(el("b", "stat__v", x[2]));
        b.appendChild(el("span", "stat__n", x[3]));
        b.addEventListener("click", function () { if (i === 3 && worst) { st.sel = worst.t.id; render(); glide("task-card", 140); } else glide(x[0]); });
        box.appendChild(b);
      });
    });
  }

  /* ================= 2. Decisions: a short card each, as the memo's options are; the chosen card fills the panel beneath
     with its options weighed on a copy of the plan, what the chosen one does, and Totality's read ================= */
  var fresh = null, shownDec = null, shownSel = null;
  function decState(d) { return st.decided[d.id] != null ? "made" : st.pending[d.id] != null ? "pending" : "open"; }
  // a panel that changes what it shows eases to its new height and fades its contents in
  function swapIn(box, h0, parts) {
    if (REDUCE || !box.animate) return;
    var h1 = box.offsetHeight;
    box.style.overflow = "hidden";
    box.animate([{ height: h0 + "px" }, { height: h1 + "px" }], { duration: 340, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)" }).onfinish = function () { box.style.overflow = ""; };
    parts.forEach(function (x, i) { x.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 320, delay: i * 40, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)", fill: "backwards" }); });
  }
  function fadeIn(parts) {
    if (REDUCE) return;
    parts.forEach(function (x, i) { if (x && x.animate) x.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 300, delay: i * 40, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)", fill: "backwards" }); });
  }
  // a newly chosen row: its wash fades in and its radio mark grows, while the old row's wash fades out
  function pickAnim(on, off) {
    if (REDUCE || !on || !on.animate) return;
    var E = "cubic-bezier(0.3, 0.7, 0.2, 1)", wash = getComputedStyle(on).backgroundColor, none = "rgba(253, 235, 232, 0)";
    on.animate([{ backgroundColor: none }, { backgroundColor: wash }], { duration: 300, easing: E });
    var m = on.querySelector(".radio"); if (m) m.animate([{ transform: "scale(0.5)" }, { transform: "scale(1.12)", offset: 0.6 }, { transform: "scale(1)" }], { duration: 340, easing: E });
    if (off) {
      off.animate([{ backgroundColor: wash }, { backgroundColor: none }], { duration: 300, easing: E });
      var n = off.querySelector(".radio"); if (n) n.animate([{ backgroundColor: getComputedStyle(m || on).backgroundColor }, { backgroundColor: getComputedStyle(n).backgroundColor }], { duration: 300, easing: E });
    }
  }
  // a card row redrawn on a new choice: the chosen card rises into its lift and the old one settles, as if neither were redrawn
  var lifted = {};
  function liftAnim(box, name, sel, lift) {
    var was = lifted[name]; lifted[name] = pid + ":" + sel;
    if (REDUCE || was == null || was === lifted[name] || was.split(":")[0] !== pid) return;
    var E = "cubic-bezier(0.3, 0.7, 0.2, 1)", on = box.querySelector(".is-on"), off = box.querySelector('[data-k="' + was.split(":")[1] + '"]');
    if (on) {
      on.animate([{ transform: "translateY(-2px)" }, { transform: "translateY(-" + lift + "px)" }], { duration: 320, easing: E });
      [].forEach.call(on.children, function (c) { c.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 280, easing: "ease" }); });
    }
    if (off && off !== on) {
      off.animate([{ transform: "translateY(-" + lift + "px)", boxShadow: getComputedStyle(on || off).boxShadow }, { transform: "none", boxShadow: getComputedStyle(off).boxShadow }], { duration: 320, easing: E });
      [].forEach.call(off.children, function (c) { c.animate([{ opacity: 1 }, { opacity: getComputedStyle(c).opacity }], { duration: 280, easing: "ease" }); });
    }
  }
  function renderDecisions() {
    var list = P.decisions.slice().sort(byDue), open = list.filter(function (d) { return decState(d) === "open"; }), c = byId("wait-n");
    c.textContent = open.length; c.hidden = !open.length; c.setAttribute("aria-label", open.length + " waiting");
    $("wait-note").textContent = "Calls that are yours to make. Each option is tried on a copy of the plan before you commit, and anything over " + kmoney(LIMIT) + " goes to " + P.boss.first + " for approval.";
    if (!list.some(function (d) { return d.id === st.dsel; })) st.dsel = (open[0] || list[0]).id;
    var box = byId("decisions"); box.textContent = "";
    box.style.setProperty("--n", list.length);
    list.forEach(function (d, n) {
      var s = decState(d), on = d.id === st.dsel, dd = dirOf(st, d.dir);
      var li = el("li", { class: "decard is-" + s + (on ? " is-on" : ""), "data-k": d.id, tabindex: "0", role: "button", "aria-pressed": String(on), "aria-controls": "dpanel" });
      var head = el("div", "decard__head");
      head.appendChild(el("span", { class: "decard__n", "aria-hidden": "true" }, String(n + 1)));
      head.appendChild(el("span", "pill " + (s === "open" ? "pill--red" : s === "pending" ? "pill--amber" : ""), s === "open" ? "Decide by " + dayLow(d.due[0], d.due[1]) : s === "pending" ? "With " + P.boss.first : "Committed"));
      li.appendChild(head);
      li.appendChild(el("h3", "decard__q", d.q));
      li.appendChild(el("p", "decard__sub", s === "made" ? d.opts[st.decided[d.id].i].t : s === "pending" ? d.opts[st.pending[d.id]].t + ", " + kmoney(d.opts[st.pending[d.id]].cost) : "For " + dd.short));
      function go() { if (st.dsel !== d.id) { st.dsel = d.id; render(); } }
      li.addEventListener("click", go);
      li.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
      box.appendChild(li);
    });
    liftAnim(box, "dec", st.dsel, 5);
    renderDecPanel();
  }
  function consequence(d, rec) {
    var bits = [];
    if (rec.done && st.tasks[rec.done]) bits.push("That finishes “" + st.tasks[rec.done].text + "”.");
    if (rec.added && st.tasks[rec.added]) { var t = st.tasks[rec.added]; bits.push("Added to the plan: “" + t.text + "” for " + first(t.who) + ", due " + dayLow(t.day) + "."); }
    if (rec.hit) bits.push("The plan carries the risk: " + lc(d.opts[rec.i].hit.why) + ".");
    return bits.join(" ") || "Logged for " + P.boss.first + ".";
  }
  function renderDecPanel() {
    var box = byId("dpanel"), d = P.decisions.filter(function (x) { return x.id === st.dsel; })[0];
    var key = pid + ":" + d.id, swap = shownDec !== null && shownDec !== key, h0 = box.offsetHeight, wasSel = shownDec === key ? shownSel : null;
    var was = [].map.call(box.querySelectorAll(".dp__meta dd"), function (e) { return e.textContent; });
    shownDec = key;
    box.textContent = "";
    var s = decState(d), dd = dirOf(st, d.dir), brief = dd.brief;
    var sel = s === "made" ? st.decided[d.id].i : s === "pending" ? st.pending[d.id] : st.choice[d.id] != null ? st.choice[d.id] : d.pick;
    var o = d.opts[sel], parts = [], again = wasSel != null && wasSel !== sel;
    shownSel = sel;

    // the question, and the one button that acts on it
    var top = el("div", "dp__top");
    var tw = el("div", "dp__head");
    tw.appendChild(el("p", "dp__k", "For " + dd.short + (s === "open" ? ", decide by " + dayLow(d.due[0], d.due[1]) : "")));
    tw.appendChild(el("h3", "dp__t", d.q));
    if (s === "open") tw.appendChild(el("p", "dp__line", d.context));
    else {
      var res = el("p", "dp__line");
      res.appendChild(el("b", null, (s === "made" ? "Committed: " : "Waiting on " + P.boss.first + "’s approval: ") + o.t + ". "));
      res.appendChild(document.createTextNode(s === "made" ? consequence(d, st.decided[d.id]) : "It costs " + kmoney(o.cost) + ", over your " + kmoney(LIMIT) + " limit, so " + P.boss.name + " approves it first."));
      tw.appendChild(res);
    }
    top.appendChild(tw);
    if (s === "open") top.appendChild(button(o.cost >= LIMIT ? "Send to " + P.boss.first + " for approval" : "Commit: " + o.t, "btn btn--primary btn--sm", function () {
      if (o.cost >= LIMIT) { st.pending[d.id] = sel; DB.toast("Sent to " + P.boss.name + " for approval."); }
      else { applyOpt(st, d, sel); DB.toast("Committed. The plan has been updated."); }
      changed();
    }));
    else top.appendChild(button(s === "made" ? "Reopen" : "Withdraw", "btn-q", function () { if (s === "made") undoOpt(st, d); else delete st.pending[d.id]; changed(); }));
    box.appendChild(top); parts.push(top);

    if (s === "open") {
      var pv = d.opts.map(function (x, i) { return preview(function (t) { applyOpt(t, d, i); }, d.dir); }), v = pv[sel];
      // the chosen option's figures, between hairlines
      var meta = el("dl", "dp__meta");
      [["Cost", o.cost ? kmoney(o.cost) : "$0", o.cost >= LIMIT ? "Over your " + kmoney(LIMIT) + " limit" : "Within your limit", o.cost >= LIMIT],
       [cap(dd.short) + " on time", pct(v.from), "As the plan stands"],
       ["With this option", pct(v.to), v.to > v.from + 0.005 ? "+" + Math.round(100 * (v.to - v.from)) + "%" : v.to < v.from - 0.005 ? "−" + Math.round(100 * (v.from - v.to)) + "%" : "No change", v.to < v.from - 0.005],
       brief ? ["Expected to land", signed(v.dExp), "Of " + money(dd.protects) + " the directive protects", v.dExp < -0.05] : null
      ].filter(Boolean).forEach(function (m) {
        var x = el("div"); x.appendChild(el("dt", null, m[0])); x.appendChild(el("dd", m[3] ? "red" : null, m[1])); x.appendChild(el("small", null, m[2])); meta.appendChild(x);
      });
      box.appendChild(meta); parts.push(meta);
      [].forEach.call(meta.querySelectorAll("dd"), function (e, i) { if (was[i] != null && was[i] !== e.textContent) CountFrom(e, was[i]); });

      // the options, each tried on a copy of the plan
      var ow = el("div", "dp__opts");
      var oh = el("div", "dopt dopt--head", null); ["Option", "Cost", "On time", brief ? "Expected to land" : ""].forEach(function (k) { oh.appendChild(el("span", null, k)); });
      ow.appendChild(oh);
      var rg = el("div", { role: "radiogroup", "aria-label": d.q });
      d.opts.forEach(function (x, i) {
        var pi = pv[i], on = i === sel;
        var b = el("button", { type: "button", role: "radio", "aria-checked": String(on), class: "dopt" + (on ? " is-on" : "") });
        var nm = el("span", "dopt__name");
        nm.appendChild(el("span", { class: "radio", "aria-hidden": "true" }));
        var tt = el("b", null, x.t); nm.appendChild(tt);
        if (i === d.pick) nm.appendChild(el("span", "pill pill--red", "Totality suggests"));
        nm.appendChild(el("small", null, x.sub));
        b.appendChild(nm);
        b.appendChild(el("span", "dopt__v" + (x.cost >= LIMIT ? " red" : ""), x.cost ? kmoney(x.cost) : "$0"));
        b.appendChild(el("span", "dopt__v" + (pi.to < pi.from - 0.005 ? " red" : ""), pct(pi.to)));
        b.appendChild(el("span", "dopt__v" + (pi.dExp < -0.05 ? " red" : ""), brief ? signed(pi.dExp) : ""));
        b.addEventListener("click", function () { if (st.choice[d.id] !== i && sel !== i) { st.choice[d.id] = i; render(); } });
        rg.appendChild(b);
      });
      ow.appendChild(rg);
      box.appendChild(ow); parts.push(ow);
      if (again) pickAnim(rg.children[sel], rg.children[wasSel]);

      // what the chosen option does to the plan, beside Totality's read
      var cols = el("div", "dp__cols");
      var c1 = el("div"); c1.appendChild(el("h4", "dp__h", "What It Does to the Plan"));
      var ul = el("ul", "dec__fx");
      if (o.done) ul.appendChild(el("li", null, "Finishes “" + st.tasks[o.done].text + "”."));
      if (o.add) ul.appendChild(el("li", null, "Adds “" + o.add.text + "” for " + first(o.add.who) + ", " + o.add.hours + " h, due " + dayLow(o.add.day) + "."));
      v.loads.forEach(function (x) { if (x.b > x.p.cap) ul.appendChild(el("li", "is-warn", First(x.p.id) + " goes to " + x.b + " of " + x.p.cap + " h this week.")); });
      if (o.hit) ul.appendChild(el("li", "is-warn", cap(o.hit.why) + ", which cuts the chance " + dd.short + " lands on time."));
      if (o.cost >= LIMIT) ul.appendChild(el("li", null, "Over your " + kmoney(LIMIT) + " limit, so " + P.boss.first + " approves it first."));
      if (!ul.childNodes.length) ul.appendChild(el("li", null, "No change to the plan’s tasks."));
      c1.appendChild(ul); cols.appendChild(c1);
      var c2 = el("div"); c2.appendChild(el("h4", "dp__h", "Totality’s Read"));
      var w1 = el("p", "dp__why"); w1.appendChild(el("b", null, "Why " + lc(d.opts[d.pick].t) + ". ")); w1.appendChild(document.createTextNode(d.why)); c2.appendChild(w1);
      var w2 = el("p", "dp__why"); w2.appendChild(el("b", null, "What would change the suggestion. ")); w2.appendChild(document.createTextNode(d.flip)); c2.appendChild(w2);
      cols.appendChild(c2);
      box.appendChild(cols); parts.push(cols);
    } else {
      var rd = el("div", "dp__cols dp__cols--one");
      var c3 = el("div"); c3.appendChild(el("h4", "dp__h", "Totality’s Read"));
      var w3 = el("p", "dp__why"); w3.appendChild(el("b", null, "What would change the suggestion. ")); w3.appendChild(document.createTextNode(d.flip)); c3.appendChild(w3);
      rd.appendChild(c3); box.appendChild(rd); parts.push(rd);
    }
    if (swap) swapIn(box, h0, parts);
    else if (again) fadeIn([top.lastChild, meta, cols]);
  }

  /* ================= 3. The plan: a week of tasks with what each waits on ================= */
  function groups() {
    var g = st.dirs.map(function (d) { return { id: d.id, title: d.title, ids: d.taskIds, due: d.due, p: dirRisk(st, d) }; });
    P.watch.forEach(function (w) {
      if (st.active[w.id]) g.push({ id: "play-" + w.id, title: (w.kind === "threat" ? "Playbook: " : "Acting On: ") + w.title, ids: st.active[w.id].ids, p: null });
    });
    if (st.own.length) g.push({ id: "own", title: "Tasks You’ve Added", ids: st.own, p: null });
    return g;
  }
  // Totality's suggestions: every way it finds to raise a task's odds, each tried on a copy of the plan and kept only if
  // it helps; the best one per task is its suggestion, so two never pull the same work in different directions
  function suggestions() {
    var cands = [];
    allTasks(st).forEach(function (t) {
      if (t.status === "done") return;
      if (canAgent(t)) {
        var a = AGENTABLE[t.id], ag = "ag:" + a[0];
        cands.push({ kind: "agent", text: "Hand it to the " + lc(agentName(ag)) + (a[1] ? ", with " + first(t.who) + " checking its work" : ""), t: t, who: ag, fn: function (s) { toAgent(s, s.tasks[t.id]); },
          note: a[1] ? "The agent drafts and " + first(t.who) + " checks and signs off, " + a[1] + " h instead of " + t.hours + ", so nothing goes out unchecked." : "The agent does it on its own; nobody needs to check it." });
      }
      var h = human(t), me = person(h);
      if (!isAgent(t.who) && hoursOf(st, h) > me.cap) {
        P.people.filter(function (q) { return q.id !== h && q.base > 0 && !(q.off && q.off.days.indexOf(t.start) >= 0) && q.cap - hoursOf(st, q.id) >= t.hours && qualified(t, q); })
          .sort(function (a, b) { return (b.cap - hoursOf(st, b.id)) - (a.cap - hoursOf(st, a.id)); }).slice(0, 2)
          .forEach(function (q) { cands.push({ kind: "hand", text: "Hand it from " + first(h) + " to " + q.name.split(" ")[0], t: t, who: q.id, fn: function (s) { s.tasks[t.id].who = q.id; },
            note: q.name.split(" ")[0] + " has " + (q.cap - hoursOf(st, q.id)) + " h free this week" + (SKILL[t.id] ? " and is certified for " + lc(SKILL[t.id]) : "") + "." }); });
      }
      if (t.status === "blocked" && !st.escalated[t.id] && !P.gaps.some(function (g, i) { return g.unblocks === t.id && !st.planned[i]; }))
        cands.push({ kind: "raise", text: "Raise what’s in its way with " + P.boss.first, t: t, who: P.boss.name, fn: function (s) { s.escalated[t.id] = true; },
          note: P.boss.first + " sees it at the top of today’s roll-up, as something needed from " + P.boss.first + "." });
    });
    P.gaps.forEach(function (g, i) {
      if (!g.unblocks || st.planned[i] || !st.tasks[g.unblocks] || st.tasks[g.unblocks].status !== "blocked") return;
      cands.push({ kind: "gap", text: g.fix, t: st.tasks[g.unblocks], who: g.who, fn: function (s) { planGap(s, i); }, note: g.text + " Covering it adds " + g.hours + " h for " + first(g.who) + " and unblocks the task." });
    });
    P.xin.forEach(function (x) {
      var e = st.ext[x.id];
      if (x.src || x.agent || e.got || e.nudged || extP(st, x) >= 0.85 || !st.tasks[x.gates]) return;
      cands.push({ kind: "chase", text: (x.late ? "Escalate with " + x.ask + ": " : "Remind " + x.ask + " to ") + lc(x.what), t: st.tasks[x.gates], who: x.who || x.team, fn: function (s) { s.ext[x.id].nudged = true; if (x.late) s.ext[x.id].raised = true; },
        note: x.late ? "It’s " + lc(x.status) + ". " + P.boss.first + " gets it as a need on today’s roll-up, and a reminder goes to " + x.ask + "." : "A reminder goes to " + x.ask + " in your name. Where it stands: " + lc(x.status) + "." });
    });
    cands.forEach(function (c) { c.v = preview(c.fn, c.t.dir); });
    var byTask = {}, best = [];
    cands.filter(function (c) { return c.v.dScore > 0.004; }).sort(function (a, b) { return b.v.dScore - a.v.dScore; })
      .forEach(function (c) { var k = c.t.id; if (!byTask[k]) { byTask[k] = []; best.push(c); } byTask[k].push(c); });
    return { byTask: byTask, best: best };
  }
  // why a suggestion helps, in words: what it clears from the task's way, whose hours move, what else it lifts
  function reasons(c) {
    var tmp = c.v.tmp, before = taskRisk(st, c.t).f, after = tmp.tasks[c.t.id] ? taskRisk(tmp, tmp.tasks[c.t.id]).f : [];
    // factors match on their words without figures, so one that only shrinks reads as eased, not removed and still there
    var key = function (x) { return x[0].replace(/[0-9]+/g, "#"); }, cost = function (x) { return "−" + Math.max(1, Math.round(100 * (1 - x[1]))) + "%"; };
    var bare = function (x) { return x[0].replace(/ \([0-9]+% on time\)$/, ""); }, out = [];
    var gone = before.filter(function (x) { return !after.some(function (y) { return key(y) === key(x); }); });
    var eased = before.map(function (x) { var y = after.filter(function (z) { return key(z) === key(x); })[0]; return y && y[1] > x[1] + 0.004 ? [x, y] : null; }).filter(Boolean);
    if (gone.length) out.push("Removes " + gone.map(function (x) { return "“" + x[0] + "” (" + cost(x) + ")"; }).join(" and ") + ".");
    eased.forEach(function (e) { out.push("Eases “" + bare(e[0]) + "” from " + cost(e[0]) + " to " + cost(e[1]) + "."); });
    after = after.filter(function (y) { return !eased.some(function (e) { return e[1] === y; }); });
    out.push(c.note);
    c.v.loads.forEach(function (x) { out.push(First(x.p.id) + " goes from " + x.a + " to " + x.b + " of " + x.p.cap + " h this week."); });
    var lifts = allTasks(st).filter(function (o) { return o.id !== c.t.id && o.status !== "done" && tmp.tasks[o.id] && taskRisk(tmp, tmp.tasks[o.id]).p - taskRisk(st, o).p > 0.015; });
    if (lifts.length) out.push("Also lifts " + lifts.map(function (o) { return "“" + o.text + "” to " + pct(taskRisk(tmp, tmp.tasks[o.id]).p); }).join(" and ") + ".");
    if (after.length) out.push("Still in its way: " + after.map(function (x) { return lc(x[0]); }).join("; ") + ".");
    return out;
  }
  var SUG = { byTask: {}, best: [] }, AHEAD = null;
  // alert marks: a red triangle for the grid's shortages, a red circle for the plan's suggestions, each with an exclamation point
  var BANG = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.2 19 17.8H1z"/><rect x="9.1" y="7.4" width="1.8" height="5.6" rx=".9"/><circle cx="10" cy="15.1" r="1.05"/></svg>';
  var ALERT = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle class="mk" cx="10" cy="10" r="8.6"/><rect x="9.1" y="5.4" width="1.8" height="5.3" rx=".9"/><circle cx="10" cy="13.9" r="1.05"/></svg>';
  function renderPlan() {
    SUG = suggestions();
    AHEAD = null;
    if (SUG.best.length) { AHEAD = clone(st); SUG.best.forEach(function (c) { c.fn(AHEAD); }); }
    var n = allTasks(st).filter(function (t) { return t.status !== "done"; }).length;
    $("plan-note").textContent = cap(words(n, "task")) + " still open this week. Each bar runs from the day a task can start to the day it’s due, with its chance of landing on time. Point to a bar to see what’s in that task’s way.";
    var box = byId("gantt"); box.textContent = "";
    // the suggestions, summed up at the head of the week they change
    var top = el("div", "g__top");
    var tw = el("div", "g__sum");
    if (SUG.best.length) {
      var gain = expected(AHEAD) - expected(st), k = SUG.best.length;
      tw.appendChild(el("b", null, "Totality’s Suggestions"));
      var sp = el("p");
      sp.appendChild(document.createTextNode(cap(words(k, "task")) + " below " + (k === 1 ? "has" : "have") + " a change Totality suggests, marked "));
      var km = el("span", { class: "g__sug g__sug--key", role: "img", "aria-label": "an alert mark" }); km.innerHTML = ALERT; sp.appendChild(km);
      sp.appendChild(document.createTextNode(". Made together, they’d raise the plan’s odds" + (gain > 0.05 ? " and take what’s expected to land from " + money(expected(st)) + " to " + money(expected(AHEAD)) : "") + ". Point to a mark to see the change."));
      tw.appendChild(sp);
      top.appendChild(tw);
    } else {
      tw.appendChild(el("b", null, "Totality’s Suggestions"));
      tw.appendChild(el("p", null, "Nothing left that would raise the plan’s odds: every owner is within capacity, and nothing is waiting to be chased."));
      top.appendChild(tw);
    }
    box.appendChild(top);
    var scroll = el("div", "g__scroll");
    var head = el("div", "g__row g__head");
    head.appendChild(el("span", "g__lab", "Task and owner"));
    DAYS.forEach(function (d, i) { head.appendChild(el("span", "g__day" + (i === 0 ? " is-today" : "") + (WORK[i] ? "" : " is-off"), DOW[i] + " " + d.split(" ")[2])); });
    var nl = el("span", "g__nowlab", "Now"); nl.style.setProperty("--x", NOW / 24); head.appendChild(nl);
    scroll.appendChild(head);
    var grid = el("div", "g__body");
    DAYS.forEach(function (d, i) { if (!WORK[i]) { var w = el("i", "g__wkend"); w.style.setProperty("--c", i); grid.appendChild(w); } });
    var now = el("i", "g__now"); now.style.setProperty("--x", NOW / 24); grid.appendChild(now);
    groups().forEach(function (g) {
      var sec = el("div", { class: "g__group", id: "dir-" + g.id });
      var gh = el("div", "g__row g__ghead");
      var gt = el("span", "g__lab");
      gt.appendChild(el("b", null, g.title));
      if (g.p != null) {
        gt.appendChild(el("span", "pill " + band(g.p).cls, pct(g.p) + " on time"));
      }
      gh.appendChild(gt);
      if (g.due) { var dl = el("span", "g__due"); dl.style.setProperty("--x", g.due[0] + parseInt(g.due[1], 10) / 24); dl.textContent = "Due " + DOW[g.due[0]] + " " + g.due[1]; gh.appendChild(dl); }
      if (g.id.indexOf("play-") === 0) { var wid = g.id.slice(5); gh.appendChild(button("Stand down", "btn-q btn-q--sm g__stop", function () { st.active[wid].ids.forEach(function (id) { removeTask(st, id); }); delete st.active[wid]; changed(); })); }
      sec.appendChild(gh);
      g.ids.map(function (id) { return st.tasks[id]; }).filter(Boolean).forEach(function (t) { sec.appendChild(taskRow(t)); });
      if (g.due) { var line = el("i", "g__dueline"); line.style.setProperty("--x", g.due[0] + parseInt(g.due[1], 10) / 24); sec.appendChild(line); }
      grid.appendChild(sec);
    });
    scroll.appendChild(grid);
    box.appendChild(scroll);
    // what the bars' colors and lines mean
    var key = el("div", { class: "g__key", "aria-hidden": "true" });
    [["sw", "On course"], ["sw is-risk", "Under 60% on time"], ["sw is-blocked", "Stuck"], ["sw is-done", "Done"], ["ln", "Now"], ["ln is-due", "Deadline"]].forEach(function (k) {
      var it = el("span", "g__k"); it.appendChild(el("i", "g__" + k[0])); it.appendChild(document.createTextNode(k[1])); key.appendChild(it);
    });
    box.appendChild(key);
    renderTaskCard();
  }
  // what's in a task's way, in words, worst first
  function inWay(t, s) {
    var f = taskRisk(s, t).f, stuck = t.status === "blocked" ? f[0] : null;
    return f.slice().sort(function (a, b) { return a[1] - b[1]; }).map(function (x) {
      var w = x[0].replace(/ \([0-9]+% on time\)$/, "");
      return (x === stuck ? "Stuck: " + lc(w) : w) + ".";
    });
  }
  // a task's pop-out: what's in its way and, when there is one, Totality's suggestion with a button down to the task's card
  function taskPop(t, sug, at, wait) {
    showPop("t:" + t.id, at, wait, "Task", function (box) {
      var r = taskRisk(st, t), way = inWay(t, st);
      box.appendChild(el("p", "gpop__h", t.text));
      box.appendChild(el("p", "gpop__k gpop__k--ink", way.length ? "In its way" : "Nothing in its way"));
      if (way.length) { var ul = el("ul", "gpop__way"); way.forEach(function (w) { ul.appendChild(el("li", /^Stuck:/.test(w) ? "is-stuck" : "", w)); }); box.appendChild(ul); }
      if (!sug) return;
      var tp = taskRisk(sug.v.tmp, sug.v.tmp.tasks[t.id]).p, d = t.dir && dirOf(st, t.dir);
      box.appendChild(el("p", "gpop__k gpop__k--sug", "Totality suggests"));
      box.appendChild(el("p", "gpop__t", cap(sug.text) + "."));
      var fx = el("p", "gpop__fx");
      fx.appendChild(el("span", "pill", "This task " + pct(r.p) + " → " + pct(tp)));
      if (d && sug.v.to - sug.v.from > 0.005) fx.appendChild(el("span", "pill", cap(d.short) + " " + pct(sug.v.from) + " → " + pct(sug.v.to)));
      if (sug.v.dExp > 0.05) fx.appendChild(el("span", "pill pill--red", "+" + money(sug.v.dExp) + " expected"));
      box.appendChild(fx);
      // opens the task's card below, where the change is weighed against the other ways and made
      box.appendChild(button("See below", "btn btn--primary btn--sm", function () { hidePop(true); if (st.sel !== t.id) { st.sel = t.id; render(); } glide("task-card"); }));
    });
  }
  function taskRow(t) {
    var r = taskRisk(st, t), sug = SUG.byTask[t.id] && SUG.byTask[t.id][0];
    var row = el("div", { class: "g__row g__task is-" + t.status + (st.sel === t.id ? " is-sel" : "") + (r.p < 0.6 ? " is-risk" : ""), id: "task-" + t.id, "data-t": t.id, role: "button", tabindex: "0", "aria-pressed": String(st.sel === t.id), "aria-label": t.text + ", " + STATUS[t.status] + ", " + pct(r.p) + " on time" + (sug ? ", Totality suggests: " + sug.text : "") });
    var lab = el("span", "g__lab");
    lab.appendChild(avatar(t.who, "av--sm"));
    lab.appendChild(el("span", { class: "g__text", title: t.text }, t.text));
    // a task with a suggested change is marked; the mark opens the change
    if (sug) {
      var chip = el("button", { type: "button", class: "g__sug", "aria-haspopup": "dialog", "aria-expanded": "false", "aria-label": "Totality’s suggestion for " + t.text });
      chip.innerHTML = ALERT;
      chip.addEventListener("mouseenter", function () { taskPop(t, sug, chip, 0); });
      chip.addEventListener("mouseleave", function () { hidePop(); });
      chip.addEventListener("focus", function () { taskPop(t, sug, chip, 0); });
      chip.addEventListener("click", function (e) { e.stopPropagation(); if (popFor === "t:" + t.id && pop.classList.contains("is-on")) hidePop(true); else taskPop(t, sug, chip, 0); });
      chip.addEventListener("keydown", function (e) { e.stopPropagation(); });
      lab.appendChild(chip);
    }
    row.appendChild(lab);
    var bar = el("span", "g__bar");
    bar.style.gridColumn = (t.start + 2) + " / " + (t.day + 3);
    bar.appendChild(el("b", null, t.status === "done" ? "Done" : t.status === "blocked" ? "Stuck" : pct(r.p)));
    bar.appendChild(el("span", null, isAgent(t.who) ? (t.revH ? t.revH + " h check" : "Agent") : t.hours + " h"));
    if (t.status !== "done") {
      bar.addEventListener("mouseenter", function () { taskPop(t, sug, bar, 260); });
      bar.addEventListener("mouseleave", function () { hidePop(); });
    }
    row.appendChild(bar);
    function pick() { if (st.sel !== t.id) { st.sel = t.id; render(); } glide("task-card"); } // always brings the task card up under the bar, even when part of it already shows
    row.addEventListener("click", pick);
    row.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    return row;
  }
  var shownTask = null, struck = {}, unstruck = {}, stepT = 0;
  function renderTaskCard() {
    var box = byId("task-card"), h0 = box.hidden ? 0 : box.offsetHeight; box.textContent = "";
    var t = st.tasks[st.sel];
    if (!t) { box.hidden = true; shownTask = null; return; }
    box.hidden = false;
    // a different task or owner eases the card to its new height and fades it in, as the decision panel does
    var key = pid + ":" + t.id + ":" + t.who, prev = shownTask, swap = prev !== null && prev !== key;
    var opened = prev !== null && prev.split(":").slice(0, 2).join(":") !== pid + ":" + t.id;
    if (opened) struck = {};
    shownTask = key;
    var r = taskRisk(st, t), d = t.dir && dirOf(st, t.dir);
    var left = el("div", "tc__about");
    left.appendChild(el("p", "tc__kind", d ? d.title : "Added by you"));
    left.appendChild(el("h3", "tc__title", t.text));
    left.appendChild(el("p", "tc__when", (t.start === t.day ? DAYS[t.day] : DAYS[t.start] + " to " + DAYS[t.day]) + ". " + (isAgent(t.who) ? agentName(t.who) + ", with " + first(t.rev) + " checking its work (" + t.revH + " h)." : t.hours + " h for " + first(t.who) + ".")));
    var det = DETAIL[t.id], why = det ? det[0] : t.why;
    if (why) { var wp = el("p", "tc__for"); wp.appendChild(el("b", null, "What it’s for. ")); wp.appendChild(document.createTextNode(why)); left.appendChild(wp); }
    // the steps that make the task up: ticking one starts it, ticking them all finishes it
    if (det) {
      var done = st.steps[t.id] || (st.steps[t.id] = {}), nd = det[1].filter(function (x, i) { return done[i]; }).length;
      var sw = el("div", "tc__steps");
      sw.appendChild(el("p", "tc__h", "Steps, " + nd + " of " + det[1].length + " done"));
      var ol = el("ol");
      var drawn = struck[t.id] || (struck[t.id] = {}), nth = 0, ndone = 0;
      det[1].forEach(function (x, i) {
        // a step done since the card last showed it has its strike drawn through, one after another on a newly opened card
        // a strike ticked a moment ago carries on drawing through the redraw (a negative delay picks it up where it was)
        var since = typeof drawn[i] === "number" ? performance.now() - drawn[i] : 1e9;
        var draw = done[i] && prev !== null && (!drawn[i] || since < 520);
        var gone = !done[i] && unstruck[t.id + ":" + i] ? performance.now() - unstruck[t.id + ":" + i] : 1e9;
        var li = el("li", (done[i] ? "is-done" : "") + (draw ? " is-new" : "") + (gone < 420 ? " is-undo" : "")), lab = el("label");
        if (gone < 420) li.style.setProperty("--d", -gone / 1000 + "s");
        if (draw) li.style.setProperty("--d", (drawn[i] ? -since / 1000 : (opened ? 0.25 : 0) + 0.09 * nth++) + "s");
        if (done[i]) { li.style.setProperty("--i", ndone++); if (!drawn[i]) drawn[i] = true; }
        var cb = el("input", { type: "checkbox" }); cb.checked = !!done[i];
        cb.addEventListener("change", function () {
          if (cb.checked) { done[i] = true; drawn[i] = performance.now(); li.style.setProperty("--d", "0s"); li.classList.add("is-done", "is-new"); }
          else { delete done[i]; delete drawn[i]; unstruck[t.id + ":" + i] = performance.now(); li.style.setProperty("--d", "0s"); li.classList.remove("is-done", "is-new"); li.classList.add("is-undo"); }
          li._done = done[i] ? 1 : 0;
          var k = det[1].filter(function (y, j) { return done[j]; }).length;
          if (k === det[1].length) { if (t.status === "blocked") { t.blocker = ""; delete st.escalated[t.id]; } t.status = "done"; }
          else if (k && (t.status === "todo" || t.status === "done")) t.status = "doing";
          else if (!k && t.status === "doing") t.status = "todo";
          // the strike draws, then the step slides to the foot of the list (or back to its place), then the card redraws
          clearTimeout(stepT);
          stepT = setTimeout(function () { settle(ol); stepT = setTimeout(changed, REDUCE ? 0 : 480); }, REDUCE ? 0 : 340);
        });
        var tx = el("span"); tx.appendChild(el("span", "tc__st", x));
        lab.appendChild(cb); lab.appendChild(tx); li.appendChild(lab); ol.appendChild(li);
        li._i = i; li._done = done[i] ? 1 : 0;
      });
      settle(ol, true);
      sw.appendChild(ol);
      left.appendChild(sw);
    }
    // who does it: the team with their free hours (the uncertified can't take it), then the agent that can
    var who = el("div", "tc__who");
    who.appendChild(el("p", "tc__h", "Who does it"));
    var opts = el("div", "tc__people");
    P.people.forEach(function (q) {
      if (q.base === 0) return;
      var mine = human(t) === q.id && t.status !== "done";
      var free = q.cap - hoursOf(st, q.id) + (mine ? (isAgent(t.who) ? t.revH : t.hours) : 0);
      var on = t.who === q.id, ok = qualified(t, q);
      var b = el("button", { type: "button", class: "who" + (on ? " is-on" : "") + (!ok ? " is-no" : free < t.hours ? " is-tight" : ""), "aria-pressed": String(on), title: ok ? q.role : "Not certified for " + lc(SKILL[t.id]) });
      b.appendChild(avatar(q.id, "av--sm"));
      b.appendChild(el("span", "who__n", First(q.id)));
      b.appendChild(el("span", "who__f", ok ? Math.max(0, free) + " h free" : "Not certified"));
      if (ok) b.addEventListener("click", function () { if (!on) { var from = First(human(t)); t.who = q.id; delete t.rev; delete t.revH; DB.toast("Handed from " + from + " to " + first(q.id) + "."); changed(); } });
      else b.disabled = true;
      opts.appendChild(b);
    });
    if (AGENTABLE[t.id] && P.agents.some(function (a) { return a[0] === AGENTABLE[t.id][0]; })) {
      var aid = "ag:" + AGENTABLE[t.id][0], aon = t.who === aid;
      var ab = el("button", { type: "button", class: "who who--agent" + (aon ? " is-on" : ""), "aria-pressed": String(aon) });
      ab.appendChild(avatar(aid, "av--sm"));
      ab.appendChild(el("span", "who__n", agentName(aid)));
      ab.appendChild(el("span", "who__f", AGENTABLE[t.id][1] ? AGENTABLE[t.id][1] + " h to check" : "No check needed"));
      ab.addEventListener("click", function () { if (!aon && t.status !== "done") { toAgent(st, t); DB.toast("Handed to the " + lc(agentName(aid)) + "."); changed(); } });
      opts.appendChild(ab);
    }
    who.appendChild(opts);
    left.appendChild(who);
    box.appendChild(left);

    var right = el("div", "tc__odds");
    right.appendChild(el("p", "bl__k", "Chance it lands on time"));
    right.appendChild(el("p", "tc__p" + (r.p < 0.6 ? " red" : ""), t.status === "done" ? "Done" : pct(r.p)));
    if (t.status !== "done") {
      var fl = el("ul", "tc__factors");
      if (!r.f.length) fl.appendChild(el("li", "is-none", "Nothing stands in its way."));
      r.f.slice().sort(function (a, b) { return a[1] - b[1]; }).forEach(function (x) {
        var li = el("li"); li.appendChild(el("span", null, x[0])); li.appendChild(el("b", null, "−" + Math.max(1, Math.round(100 * (1 - x[1]))) + "%")); fl.appendChild(li);
      });
      right.appendChild(fl);
    }
    var unb = Object.keys(AFTER).filter(function (k) { return AFTER[k].indexOf(t.id) >= 0 && st.tasks[k]; }).map(function (k) { return st.tasks[k]; });
    var outs = P.xout.filter(function (x) { return x.from === t.id; });
    if (unb.length || outs.length) {
      right.appendChild(el("p", "tc__h", "Waiting on it"));
      var ul = el("ul", "tc__deps");
      unb.forEach(function (u) { var li = el("li"); li.appendChild(button(u.text, "tc__link", function () { st.sel = u.id; render(); })); li.appendChild(el("span", null, First(u.who))); ul.appendChild(li); });
      outs.forEach(function (x) { var li = el("li"); li.appendChild(el("span", "tc__ext", x.to + ": " + lc(x.what))); li.appendChild(el("span", null, x.who)); ul.appendChild(li); });
      right.appendChild(ul);
    }
    if (t.status === "blocked") {
      var acts = el("div", "tc__acts");
      if (st.escalated[t.id]) acts.appendChild(el("span", "pill", "Raised with " + P.boss.first));
      else acts.appendChild(button("Raise with " + P.boss.first, "btn btn--primary btn--sm", function () { st.escalated[t.id] = true; DB.toast("Raised with " + P.boss.first + "."); changed(); }));
      right.appendChild(acts);
    }
    box.appendChild(right);

    // beneath the odds, every way Totality found to raise them, the suggestion first, each with its reasons and what it moves
    var ways = SUG.byTask[t.id];
    if (ways && ways.length) {
      var wb = el("div", "tc__ways");
      wb.appendChild(el("h4", "dp__h", ways.length > 1 ? "Ways to Raise Its Odds" : "Totality’s Suggestion"));
      // the ways as choices, the suggestion picked first; one button beneath carries out the chosen one
      var ws = st.wsel[t.id] != null && ways[st.wsel[t.id]] ? st.wsel[t.id] : 0;
      var wl = el("div", { class: "ways", role: "radiogroup", "aria-label": "Ways to raise the chance “" + t.text + "” lands on time" });
      ways.forEach(function (c, i) {
        var tp = taskRisk(c.v.tmp, c.v.tmp.tasks[t.id]).p, on = i === ws;
        var li = el(ways.length > 1 ? "button" : "div", ways.length > 1 ? { type: "button", role: "radio", "aria-checked": String(on), class: "way" + (on ? " is-on" : "") } : "way is-on is-only");
        var wt = el("p", "way__t"); if (ways.length > 1) wt.appendChild(el("span", { class: "radio", "aria-hidden": "true" })); wt.appendChild(el("b", null, c.text)); if (!i) wt.appendChild(el("span", "pill pill--red", "Totality suggests")); li.appendChild(wt);
        var rl = el("ul", "way__why"); reasons(c).forEach(function (x) { rl.appendChild(el("li", null, x)); }); li.appendChild(rl);
        var fx = el("p", "way__fx");
        if (tp - r.p > 0.005) fx.appendChild(el("span", "pill", "This task " + pct(r.p) + " → " + pct(tp)));
        if (d && c.v.from != null && c.v.to - c.v.from > 0.005) fx.appendChild(el("span", "pill", cap(d.short) + " " + pct(c.v.from) + " → " + pct(c.v.to)));
        if (c.v.dExp > 0.05) fx.appendChild(el("span", "pill pill--red", "+" + money(c.v.dExp) + " expected"));
        li.appendChild(fx);
        if (ways.length > 1) li.addEventListener("click", function () { if (st.wsel[t.id] !== i && ws !== i) { st.wsel[t.id] = i; render(); } });
        wl.appendChild(li);
      });
      wb.appendChild(wl);
      var pickd = ways[ws];
      var go = button("Make this change", "btn btn--primary btn--sm way__go", function () { pickd.fn(st); delete st.wsel[t.id]; DB.toast("Plan updated."); changed(); });
      wb.appendChild(go);
      right.appendChild(wb);
      if (!swap && wayWas && wayWas.id === key && wayWas.i !== ws) { pickAnim(wl.children[ws], wl.children[wayWas.i]); fadeIn([go]); }
      wayWas = { id: key, i: ws };
    }
    if (swap) swapIn(box, h0, [left, right]);
  }
  var wayWas = null;
  // steps not yet done keep their order at the top, done ones follow in theirs; a step that changes slides to its place
  function settle(ol, still) {
    var items = [].slice.call(ol.children), was = still ? null : items.map(function (x) { return x.getBoundingClientRect().top; });
    // reordered with flex order rather than moved in the DOM, which would restart a strike mid-draw
    items.forEach(function (x) { x.style.order = x._done * 100 + x._i; });
    if (!was || REDUCE) return;
    items.forEach(function (x, j) {
      var dy = was[j] - x.getBoundingClientRect().top;
      if (Math.abs(dy) > 1) x.animate([{ transform: "translateY(" + dy + "px)" }, { transform: "none" }], { duration: 440, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)" });
    });
  }

  /* ================= 4. Across teams: each list's rows are selectable, and the chosen handoff's actions, worded for it,
     sit once beneath the list (the user dislikes the same short button repeated down every row) ================= */
  function openPlan(id) { switchTo(id); window.scrollTo({ top: 0, behavior: REDUCE ? "auto" : "smooth" }); }
  function openTask(t) { st.sel = t.id; render(); glide("task-card", 160); }
  function xrow(list, on, pick, parts) {
    var li = el("li", { class: "xi" + (parts.done ? " is-done" : "") + (on ? " is-on" : ""), role: "button", tabindex: "0", "aria-pressed": String(on) });
    li.appendChild(parts.av);
    var w = el("div", "xi__w");
    w.appendChild(el("p", "xi__team", parts.team));
    w.appendChild(el("p", "xi__what", parts.what));
    w.appendChild(el("p", "xi__meta", parts.meta));
    li.appendChild(w);
    var side = el("div", "xi__side");
    side.appendChild(el("span", "pill " + parts.cls, parts.pill));
    if (parts.due) side.appendChild(el("span", "xi__due" + (parts.late ? " red" : ""), parts.due));
    li.appendChild(side);
    li.addEventListener("click", pick);
    li.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    list.appendChild(li);
  }
  var shownX = { i: null, o: null };
  function renderAcross() {
    var late = P.xin.filter(function (x) { return extP(st, x) < 0.7; }).length;
    $("x-note").textContent = "What other teams owe " + P.first + "’s team, and what the team owes them, with each handoff’s chance of arriving on time. Select one to act on it." + (late ? " " + cap(words(late, "input")) + " could hold the plan up." : "");
    var xin = P.xin.slice().sort(function (a, b) { return extP(st, a) - extP(st, b); });
    if (!xin.some(function (x) { return x.id === st.xin; })) st.xin = xin[0].id;
    var inb = byId("x-in"); inb.textContent = "";
    xin.forEach(function (x) {
      var p = extP(st, x), e = st.ext[x.id], t = st.tasks[x.gates], other = x.src && init(x.persona).tasks[x.src];
      var status = x.src ? STATUS[other.status] + " in " + PERSONAS[x.persona].first + "’s plan" : e.got ? "Received" : x.status + (e.raised ? ", escalated" : e.nudged ? ", chased" : "");
      xrow(inb, st.xin === x.id, function () { if (st.xin !== x.id) { st.xin = x.id; render(); } }, {
        av: x.agent ? avatar("ag:" + x.agent) : avatar(x.who || x.team), team: x.team + (x.who ? ", " + x.who : ""), what: x.what,
        meta: status + (t ? ". Holds up “" + t.text + "”." : "."), done: p >= 1,
        cls: p >= 1 ? "" : p < 0.7 ? "pill--red" : p < 0.85 ? "pill--amber" : "", pill: p >= 1 ? "In hand" : pct(p) + " on time",
        due: p >= 1 ? "" : (x.due[0] < 0 ? "Was due " : "Due ") + dayLow(x.due[0], x.due[1]), late: x.late && p < 1
      });
    });
    // the chosen input's actions, each worded for it
    var x = P.xin.filter(function (y) { return y.id === st.xin; })[0], e = st.ext[x.id], t = st.tasks[x.gates], acts = byId("x-in-act");
    var xk = pid + ":" + x.id, xh0 = acts.offsetHeight, xswap = shownX.i !== null && shownX.i !== xk; shownX.i = xk;
    acts.textContent = "";
    if (x.src) acts.appendChild(button("Open " + PERSONAS[x.persona].first + "’s plan", "btn-q", function () { openPlan(x.persona); }));
    else if (!e.got && !x.agent) {
      if (!e.nudged) acts.appendChild(button(x.late ? "Escalate" : "Send a reminder", "btn btn--primary btn--sm", function () {
        e.nudged = true; if (x.late) e.raised = true; DB.toast((x.late ? "Escalated with " : "Reminded ") + x.ask + "."); changed();
      }));
      acts.appendChild(button("Mark received", "btn-q", function () { e.got = true; if (t && t.status === "blocked") { t.status = "todo"; t.blocker = ""; } changed(); }));
    } else if (x.agent) acts.appendChild(el("p", "xi__note", agentName("ag:" + x.agent) + " is handling it: " + lc(x.status) + "."));
    if (t) acts.appendChild(button("See the task", "btn-q", function () { openTask(t); }));
    if (xswap) { pickAnim(inb.querySelector(".xi.is-on")); swapIn(acts, xh0, [].slice.call(acts.children)); }

    if (st.xout == null || !P.xout[st.xout]) st.xout = 0;
    var out = byId("x-out"); out.textContent = "";
    P.xout.forEach(function (o, i) {
      var tt = st.tasks[o.from], r = tt ? taskRisk(st, tt) : { p: 1 }, done = !tt || tt.status === "done";
      xrow(out, st.xout === i, function () { if (st.xout !== i) { st.xout = i; render(); } }, {
        av: avatar(o.who), team: o.to + ", " + o.who, what: o.what, meta: o.why, done: done,
        cls: done ? "" : r.p < 0.6 ? "pill--red" : r.p < 0.8 ? "pill--amber" : "", pill: done ? "Sent" : pct(r.p) + " on time",
        due: done ? "" : "Due " + dayLow(o.due[0], o.due[1])
      });
    });
    var o = P.xout[st.xout], ot = st.tasks[o.from], oacts = byId("x-out-act");
    var ok = pid + ":" + st.xout, oh0 = oacts.offsetHeight, oswap = shownX.o !== null && shownX.o !== ok; shownX.o = ok;
    oacts.textContent = "";
    if (ot && ot.status !== "done") oacts.appendChild(button("See the task", "btn-q", function () { openTask(ot); }));
    if (o.persona) oacts.appendChild(button("Open " + PERSONAS[o.persona].first + "’s plan", "btn-q", function () { openPlan(o.persona); }));
    if (!oacts.childNodes.length) oacts.appendChild(el("p", "xi__note", "Sent to " + o.who + "."));
    if (oswap) { pickAnim(out.querySelector(".xi.is-on")); swapIn(oacts, oh0, [].slice.call(oacts.children)); }
  }

  /* ================= 5. Who has room, day by day ================= */
  function daily(s, p) {
    var h = [0, 0, 0, 0, 0, 0, 0], wd = WORK.filter(function (w, i) { return w && !(p.off && p.off.days.indexOf(i) >= 0); }).length || 1;
    WORK.forEach(function (w, i) { if (w && !(p.off && p.off.days.indexOf(i) >= 0)) h[i] += p.base / wd; });
    allTasks(s).forEach(function (t) {
      if (t.status === "done") return;
      var hrs = t.who === p.id ? t.hours : t.rev === p.id ? t.revH : 0; if (!hrs) return;
      var span = []; for (var i = Math.max(0, t.start); i <= t.day; i++) span.push(i);
      var work = span.filter(function (i) { return WORK[i]; }); if (!work.length) work = span;
      work.forEach(function (i) { h[i] += hrs / work.length; });
    });
    return h;
  }
  function renderTeam() {
    var here = P.people.filter(function (p) { return p.base > 0; }), free = here.reduce(function (s, p) { return s + Math.max(0, p.cap - hoursOf(st, p.id)); }, 0);
    var agentTasks = allTasks(st).filter(function (t) { return isAgent(t.who) && t.status !== "done"; });
    var saved = agentTasks.reduce(function (a, t) { return a + t.hours - (t.revH || 0); }, 0);
    $("team-note").textContent = cap(words(here.length, "person", "people")) + " working this week, with " + free + " hours free between them" + (saved ? ". Agents are taking " + saved + " hours of work off the team." : ".") +
      (function (n) { return n ? " " + cap(words(n, "stretch", "stretches")) + " of shifts " + (n > 1 ? "rest" : "rests") + " on one person, outlined in red." : ""; })(P.gaps.filter(function (g, i) { return g.at && !st.planned[i]; }).length);
    var box = byId("heat"); box.textContent = "";
    var scroll = el("div", "h__scroll");
    var head = el("div", "h__row h__head"); head.appendChild(el("span", "h__lab", "Hours a day"));
    DAYS.forEach(function (d, i) { head.appendChild(el("span", "h__day" + (WORK[i] ? "" : " is-off"), DOW[i])); });
    head.appendChild(el("span", "h__wk", "Week"));
    scroll.appendChild(head);
    P.people.forEach(function (p) {
      var h = daily(st, p), tot = hoursOf(st, p.id), dc = p.cap / 5, row = el("div", "h__row");
      var lab = el("span", "h__lab"); lab.appendChild(avatar(p.id, "av--sm")); lab.style.gridColumn = "1";
      var nm = el("span", "h__name"); nm.appendChild(el("b", null, isMe(p.id) ? p.name + " (you)" : p.name)); nm.appendChild(el("small", null, p.role)); lab.appendChild(nm);
      row.appendChild(lab);
      h.forEach(function (v, i) {
        var off = p.off && p.off.days.indexOf(i) >= 0, r = WORK[i] ? v / dc : v > 0 ? 2 : 0;
        var c = el("span", { class: "h__c" + (off ? " is-away" : r > 1.05 ? " is-over" : "") + (WORK[i] ? "" : " is-off"), title: p.name + ", " + DAYS[i] + ": " + (off ? p.off.label + (v >= 0.5 ? ", " + Math.round(v) + " h" : "") : Math.round(v) + " of " + (WORK[i] ? Math.round(dc) : 0) + " h") });
        if (!off && r <= 1.05) c.style.setProperty("--l", Math.min(1, r).toFixed(2));
        c.textContent = off ? p.off.label : v >= 0.5 ? Math.round(v) : "";
        c.style.gridColumn = String(i + 2);
        row.appendChild(c);
      });
      var wk = el("span", "h__wk" + (tot > p.cap ? " red" : ""), p.base === 0 && tot === 0 ? "Away" : tot + " of " + p.cap + " h"); wk.style.gridColumn = "9";
      row.appendChild(wk);
      // shifts that rest on one person: a red outline round them, and an alert that opens into why and the cover
      P.gaps.forEach(function (g, gi) {
        if (!g.at || g.at[0] !== p.id || st.planned[gi]) return;
        var a = el("span", "h__alert"); a.style.gridColumn = (g.at[1] + 2) + " / " + (g.at[2] + 3);
        var bang = el("button", { type: "button", class: "h__bang", "aria-label": "Shortage risk: " + g.text, "aria-expanded": "false" });
        bang.innerHTML = BANG;
        bang.addEventListener("mouseenter", function () { gapPop(gi, bang); });
        bang.addEventListener("focus", function () { gapPop(gi, bang); });
        bang.addEventListener("click", function () { if (popFor === gi) hidePop(true); else gapPop(gi, bang); });
        bang.addEventListener("mouseleave", function () { hidePop(); });
        bang.addEventListener("blur", function () { hidePop(); });
        a.appendChild(bang);
        row.appendChild(a);
      });
      scroll.appendChild(row);
    });
    box.appendChild(scroll);
    if (agentTasks.length) {
      var ar = el("div", "h__agents");
      ar.appendChild(el("p", "tc__h", "Agents on the Plan"));
      var ul = el("ul");
      agentTasks.forEach(function (t) { var li = el("li"); li.appendChild(avatar(t.who, "av--sm")); li.appendChild(el("span", null, agentName(t.who) + ": " + lc(t.text) + (t.revH ? ". " + First(t.rev) + " checks it, " + t.revH + " h instead of " + t.hours + "." : "."))); ul.appendChild(li); });
      ar.appendChild(ul);
      box.appendChild(ar);
    }
    hidePop(true);
  }
  // the explanation an alert opens into, held in one floating card so the grid's scroller can't clip it
  var pop = null, popFor = null, popT = 0, popAt = null;
  function gapPop(gi, at) {
    showPop(gi, at, 0, "Shortage risk", function (box) {
      var g = P.gaps[gi];
      box.appendChild(el("p", "gpop__k", "One person deep"));
      box.appendChild(el("p", "gpop__t", g.text));
      var c = el("p", "gpop__fix"); c.appendChild(el("b", null, "Cover: ")); c.appendChild(document.createTextNode(g.fix + ", " + first(g.who) + ", " + dayLow(g.day) + ", " + g.hours + " h" + (g.unblocks && st.tasks[g.unblocks] ? ". It unblocks “" + st.tasks[g.unblocks].text + "”." : ".")));
      box.appendChild(c);
      box.appendChild(button("Plan the cover", "btn btn--primary btn--sm", function () { planGap(st, gi); DB.toast("Added to the plan for " + first(g.who) + "."); hidePop(true); changed(); }));
    });
  }
  // one floating card for every pop-out, so no scroller clips it; `wait` holds it back while the pointer only passes over
  function showPop(key, at, wait, label, fill) {
    clearTimeout(popT);
    if (!pop) {
      pop = el("div", { class: "gpop", role: "dialog" });
      pop.addEventListener("mouseenter", function () { clearTimeout(popT); });
      pop.addEventListener("mouseleave", function () { hidePop(); });
      document.body.appendChild(pop);
      window.addEventListener("scroll", function () { hidePop(true); }, { passive: true });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") hidePop(true); });
      document.addEventListener("click", function (e) { if (pop.classList.contains("is-on") && !pop.contains(e.target) && !(popAt && popAt.contains(e.target))) hidePop(true); });
    }
    if (popFor === key && pop.classList.contains("is-on")) return;
    if (wait && !pop.classList.contains("is-on")) { popT = setTimeout(function () { showPop(key, at, 0, label, fill); }, wait); return; }
    pop.textContent = "";
    pop.setAttribute("aria-label", label);
    fill(pop);
    popFor = key;
    if (popAt) popAt.setAttribute("aria-expanded", "false");
    popAt = at;
    if (at.hasAttribute("aria-expanded")) at.setAttribute("aria-expanded", "true");
    var r = at.getBoundingClientRect(), w = Math.min(320, window.innerWidth - 32);
    pop.style.width = w + "px";
    var left = Math.max(16, Math.min(window.innerWidth - w - 16, r.left + r.width / 2 - w / 2));
    pop.style.left = left + "px";
    pop.classList.remove("is-on", "is-up");
    var h = pop.offsetHeight, below = r.bottom + 10 + h <= window.innerHeight - 8, above = r.top - 10 - h >= 72;
    if (below || above || window.innerWidth - r.right < w + 28) {
      var up = !below && above;
      pop.style.top = Math.max(72, up ? r.top - 10 - h : r.bottom + 10) + "px";
      pop.style.transformOrigin = (r.left + r.width / 2 - left) + "px " + (up ? "100%" : "0");
    } else {
      // no room above or below: beside the trigger, held on screen
      var top = Math.max(72, Math.min(window.innerHeight - h - 12, r.top + r.height / 2 - h / 2));
      pop.style.left = r.right + 12 + "px"; pop.style.top = top + "px";
      pop.style.transformOrigin = "0 " + (r.top + r.height / 2 - top) + "px";
    }
    void pop.offsetWidth;
    pop.classList.add("is-on");
  }
  function hidePop(now) {
    if (!pop) return;
    clearTimeout(popT);
    var go = function () { pop.classList.remove("is-on"); popFor = null; if (popAt) popAt.setAttribute("aria-expanded", "false"); popAt = null; };
    if (now) go(); else popT = setTimeout(go, 180);
  }

  /* ================= 6. If it happens: playbooks rehearsed against this week's plan ================= */
  function signalState(w) {
    var s = w.signal;
    if (s.dir === "event") return { rank: 0, cls: "", label: "Watching", text: s.text + ": " + lc(s.status) };
    var hit = s.dir === "below" ? s.now <= s.at : s.now >= s.at, gap = Math.abs(s.now - s.at) / Math.max(1, Math.abs(s.at));
    var rank = hit ? 3 : gap < 0.1 ? 2 : 1;
    return { rank: rank, cls: rank === 3 ? "pill--red" : rank === 2 ? "pill--amber" : "", label: rank === 3 ? "Triggered" : rank === 2 ? "Close to its trigger" : "Watching",
      text: s.text + " at " + s.now + s.unit + ", against a trigger " + (s.dir === "below" ? "below " : "above ") + s.at + s.unit };
  }
  function spark(trend) {
    var W = 84, H = 26, max = Math.max.apply(null, trend) * 1.15, s = svg("svg", { class: "spark", viewBox: "0 0 " + W + " " + H, "aria-hidden": "true" });
    var pts = trend.map(function (v, i) { return [i * (W - 6) / (trend.length - 1) + 3, H - 3 - v / max * (H - 6)]; });
    s.appendChild(svg("path", { d: pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" "), class: "spark__line", pathLength: 1 }));
    var last = pts[pts.length - 1];
    s.appendChild(svg("circle", { cx: last[0], cy: last[1].toFixed(1), r: 2.6, class: "spark__dot" }));
    return s;
  }
  function readiness(w) { var n = Object.keys(st.prepared[w.id] || {}).length; return { n: n, of: w.steps.length }; }
  function playbookTasks(s, w) { var g = []; w.steps.forEach(function (step, i) { addTask(s, { text: step[0], who: step[1], start: 0, day: i < 2 ? 0 : 1, hours: step[2] }, g, "Step " + (i + 1) + " of the playbook for " + lc(w.title) + "."); }); return g; }
  // run the playbook on a copy of the week: who runs short, what slips, how long a full response takes
  function rehearse(w) {
    var tmp = clone(st), prep = st.prepared[w.id] || {};
    playbookTasks(tmp, w);
    var per = {}, ready = {};
    w.steps.forEach(function (step, i) { per[step[1]] = (per[step[1]] || 0) + step[2] * (prep[i] ? 0.3 : 1); ready[step[1]] = (ready[step[1]] || 0) + step[2] * 0.3; });
    var max = function (o) { return Math.max.apply(null, Object.keys(o).map(function (k) { return o[k]; })); };
    var short = P.people.filter(function (p) { return per[p.id] && hoursOf(tmp, p.id) > p.cap; }).map(function (p) { return { p: p, over: hoursOf(tmp, p.id) - p.cap }; });
    var slips = st.dirs.map(function (d) { return { d: d, a: dirRisk(st, d), b: dirRisk(tmp, dirOf(tmp, d.id)) }; }).filter(function (x) { return x.a - x.b > 0.01; });
    return { hours: max(per), allReady: max(ready), short: short, slips: slips };
  }
  function renderWatch() {
    var threats = P.watch.filter(function (w) { return w.kind === "threat"; }).length;
    $("watch-note").textContent = cap(words(threats, "threat")) + " and " + words(P.watch.length - threats, "opportunity", "opportunities") + " that would land on " + P.first + "’s team. Each playbook is rehearsed against this week’s plan, so its cost shows before it’s needed.";
    var box = byId("watch-list"); box.textContent = "";
    box.style.setProperty("--n", P.watch.length);
    P.watch.forEach(function (w) {
      var s = signalState(w), r = readiness(w), on = st.watch === w.id;
      var b = el("button", { type: "button", role: "tab", "aria-selected": String(on), class: "wi" + (on ? " is-on" : ""), "data-k": w.id });
      var top = el("span", "wi__top");
      top.appendChild(el("span", "pill wi__kind" + (w.kind === "opportunity" ? " pill--red" : " pill--ink"), w.kind === "threat" ? "Threat" : "Opportunity"));
      top.appendChild(el("span", "pill " + (st.active[w.id] ? "pill--red" : s.cls), st.active[w.id] ? "Running" : st.armed[w.id] ? "Armed" : s.label));
      b.appendChild(top);
      b.appendChild(el("b", "wi__title", w.title));
      var row = el("span", "wi__row");
      if (w.pn != null) row.appendChild(el("span", "wi__p", w.pn + "%"));
      if (w.trend) row.appendChild(spark(w.trend));
      b.appendChild(row);
      b.appendChild(el("span", "wi__lab", w.p));
      b.appendChild(el("span", "wi__ready", r.n === r.of ? "Playbook ready" : r.n + " of " + r.of + " steps ready"));
      b.addEventListener("click", function () { if (st.watch !== w.id) { st.watch = w.id; render(); } });
      box.appendChild(b);
    });
    liftAnim(box, "watch", st.watch, 4);
    renderPlay();
  }
  var shownPlay = null;
  function renderPlay() {
    var box = byId("play"), w = P.watch.filter(function (x) { return x.id === st.watch; })[0];
    var key = pid + ":" + w.id, h0 = box.offsetHeight, swap = shownPlay !== null && shownPlay !== key;
    shownPlay = key;
    box.textContent = "";
    var s = signalState(w), r = readiness(w);
    var left = el("div", "play__about");
    left.appendChild(el("p", "play__kind", (w.kind === "threat" ? "Threat" : "Opportunity") + ", " + (w.pn != null ? w.pn + "% " + lc(w.p) : lc(w.p))));
    left.appendChild(el("h3", "play__title", w.title));
    left.appendChild(el("p", "play__impact", w.impact));
    var sig = el("div", "signal");
    var sl = el("p", "signal__k"); sl.appendChild(el("span", null, "Early signal")); sl.appendChild(el("span", "pill " + s.cls, s.label)); sig.appendChild(sl);
    sig.appendChild(el("p", "signal__t", s.text + "."));
    // the reading on its scale: the stretch past the trigger pale red and labelled, now a caret above
    if (w.signal.dir !== "event") {
      var g = w.signal, X = function (v) { return Math.max(0, Math.min(100, 100 * v / g.max)); };
      var m = el("div", { class: "gauge" + (s.rank === 3 ? " is-hit" : s.rank === 2 ? " is-near" : ""), role: "img", "aria-label": s.text + ", on a scale of 0 to " + g.max + g.unit });
      var nowRow = el("div", "gauge__row gauge__row--now");
      var nk = el("span", "gauge__now", "Now " + g.now + g.unit); nk.style.setProperty("--x", X(g.now)); nowRow.appendChild(nk);
      m.appendChild(nowRow);
      var trk = el("div", "gauge__track");
      var safe = el("i", "gauge__safe"), zone = el("i", "gauge__zone");
      zone.classList.add(g.dir === "below" ? "is-low" : "is-high");
      // the beige track runs the whole scale, and the red zone sweeps out over it from its end
      safe.style.left = "0"; safe.style.right = "0";
      if (g.dir === "below") { zone.style.left = "0"; zone.style.width = X(g.at) + "%"; }
      else { zone.style.left = X(g.at) + "%"; zone.style.right = "0"; }
      trk.appendChild(safe); trk.appendChild(zone);
      var ln = el("i", "gauge__line"); ln.style.setProperty("--x", X(g.at)); trk.appendChild(ln);
      var car = el("i", "gauge__caret"); car.style.setProperty("--x", X(g.now)); trk.appendChild(car);
      m.appendChild(trk);
      var trRow = el("div", "gauge__row");
      var tk = el("span", "gauge__trig", "Trigger: " + (g.dir === "below" ? "below " : "above ") + g.at + g.unit); tk.style.setProperty("--x", X(g.at));
      trRow.appendChild(tk);
      m.appendChild(trRow);
      sig.appendChild(m);
    }
    left.appendChild(sig);
    // armed, the steps hand themselves out when the signal crosses its trigger, for the manager's sign-off
    if (!st.active[w.id]) {
      var arm = el("label", "switch play__arm");
      var tx = el("span", "switch__text", "Arm the playbook");
      tx.appendChild(el("small", null, w.signal.dir === "event" ? "If the listing comes, Totality hands out the steps and asks for your sign-off." : "If " + lc(w.signal.text) + " crosses " + w.signal.at + w.signal.unit + ", Totality hands out the steps and asks for your sign-off."));
      arm.appendChild(tx);
      var cb = el("input", { type: "checkbox" }); cb.checked = !!st.armed[w.id];
      cb.addEventListener("change", function () { st.armed[w.id] = cb.checked; DB.toast(cb.checked ? "Armed. You’ll be asked to sign off if it triggers." : "Disarmed."); later(); });
      arm.appendChild(cb); arm.appendChild(el("span", { class: "switch__ui", "aria-hidden": "true" }));
      left.appendChild(arm);
    }
    box.appendChild(left);

    var right = el("div", "play__steps");
    var sh = el("div", "play__h");
    sh.appendChild(el("h4", null, st.active[w.id] ? "Running" : "Rehearsed Against This Week"));
    sh.appendChild(el("span", null, r.n + " of " + r.of + " steps ready"));
    right.appendChild(sh);
    if (!st.active[w.id]) {
      var R = rehearse(w), dl = el("dl", "rh");
      var fact = function (k, v, sub, cls) { var x = el("div"); x.appendChild(el("dt", null, k)); var dd = el("dd", cls || null); dd.appendChild(el("b", null, v)); if (sub) dd.appendChild(el("small", null, sub)); x.appendChild(dd); dl.appendChild(x); };
      fact("Full response", "About " + Math.round(R.hours) + " h", r.n < r.of ? "About " + Math.max(1, Math.round(R.allReady)) + " h with every step ready" : "Every step is ready");
      fact("Short of people", R.short.length ? R.short.map(function (x) { return First(x.p.id); }).join(" and ") : "Nobody", R.short.length ? R.short.map(function (x) { return First(x.p.id) + " " + x.over + " h over"; }).join(", ") : "The team absorbs it", R.short.length ? "red" : null);
      var big = R.slips.slice().sort(function (x, y) { return (y.a - y.b) - (x.a - x.b); })[0];
      fact("What slips", big ? pct(big.a) + " → " + pct(big.b) : "Nothing", big ? cap(big.d.short || big.d.title) + ", on time" + (R.slips.length > 1 ? ", and " + words(R.slips.length - 1, "more directive") : "") : "This week’s directives hold", big ? "red" : null);
      right.appendChild(dl);
    }
    var ol = el("ol", "steps");
    var prep = st.prepared[w.id] || (st.prepared[w.id] = {}), pick = st.prep[w.id] || (st.prep[w.id] = {});
    w.steps.forEach(function (step, i) {
      var li = el("li", "step" + (prep[i] ? " is-ready" : "")), open = !prep[i] && !st.active[w.id];
      var lab = el(open ? "label" : "div", "step__row" + (open ? " switch" : ""));
      lab.appendChild(avatar(step[1], "av--sm"));
      var t = el("div", "step__txt"); t.appendChild(el("b", null, step[0])); t.appendChild(el("span", null, (isMe(step[1]) ? "You" : person(step[1]).name) + ", about " + step[2] + " h" + (prep[i] ? ", " + Math.max(1, Math.round(step[2] * 0.3)) + " h once ready" : ", " + Math.max(1, Math.round(step[2] * 0.3)) + " h if prepared"))); lab.appendChild(t);
      if (!open) lab.appendChild(el("span", "pill", prep[i] && !st.active[w.id] ? "Ready" : "Handed out"));
      else {
        var cb = el("input", { type: "checkbox", "aria-label": "Prepare: " + step[0] }); cb.checked = pick[i] !== false;
        cb.addEventListener("change", function () { pick[i] = cb.checked; later(); });
        lab.appendChild(cb); lab.appendChild(el("span", { class: "switch__ui", "aria-hidden": "true" }));
      }
      li.appendChild(lab);
      ol.appendChild(li);
    });
    right.appendChild(ol);
    var acts = el("div", "play__acts");
    if (st.active[w.id]) {
      acts.appendChild(el("p", "play__running", cap(words(st.active[w.id].ids.length, "step")) + " handed out at 7:10am, in the plan above."));
      acts.appendChild(button("See them in the plan", "btn-q", function () { flash("dir-play-" + w.id); }));
    } else {
      // one button prepares every ticked step: an hour's prep task each, this week, so the step runs faster if it comes
      var todo = w.steps.map(function (x, i) { return i; }).filter(function (i) { return !prep[i] && pick[i] !== false; });
      if (todo.length) acts.appendChild(button("Prepare " + (todo.length === w.steps.filter(function (x, i) { return !prep[i]; }).length && todo.length > 1 ? "all " : "") + words(todo.length, "step") + " this week, " + plural(todo.length, "hour"), "btn-q", function () {
        todo.forEach(function (i) { prep[i] = addTask(st, { text: "Get ready to " + lc(w.steps[i][0]), who: w.steps[i][1], start: 1, day: 2, hours: 1 }, null, "Prep for step " + (i + 1) + " of the playbook for " + lc(w.title) + ", so the step takes less time if it comes."); });
        DB.toast("Added " + words(todo.length, "prep task") + " to the plan.");
        changed();
      }));
      acts.appendChild(button(w.kind === "threat" ? "Run the playbook now" : "Act on it now", "btn btn--primary btn--sm", function () {
        st.active[w.id] = { ids: playbookTasks(st, w) };
        DB.toast((w.kind === "threat" ? "Playbook running. " : "On it. ") + cap(words(w.steps.length, "step")) + " handed out.");
        changed();
        setTimeout(function () { flash("dir-play-" + w.id); }, 80);
      }));
    }
    right.appendChild(acts);
    box.appendChild(right);
    if (swap && !REDUCE && box.animate) {
      // the gauge draws again for the new card: the zone past the trigger sweeps out, the trigger line rises, the caret slides to the reading
      var E = "cubic-bezier(0.3, 0.7, 0.2, 1)", gz = box.querySelector(".gauge__zone"), gl = box.querySelector(".gauge__line"), gc = box.querySelector(".gauge__caret");
      if (gz) gz.animate([{ transform: "scaleX(0)" }, { transform: "none" }], { duration: 700, delay: 150, easing: E, fill: "backwards" });
      if (gl) gl.animate([{ transform: "scaleY(0)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 450, delay: 550, easing: E, fill: "backwards" });
      if (gc) gc.animate([{ left: "0%" }, { left: getComputedStyle(gc).left }], { duration: 800, delay: 100, easing: E, fill: "backwards" });
      var h1 = box.offsetHeight;
      box.style.overflow = "hidden";
      box.animate([{ height: h0 + "px" }, { height: h1 + "px" }], { duration: 340, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)" }).onfinish = function () { box.style.overflow = ""; };
      [left, right].forEach(function (x, i) { x.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 320, delay: i * 50, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)", fill: "backwards" }); });
    }
  }

  /* ================= 7. What leadership sees ================= */
  function renderRoll() {
    $("up-title").textContent = "What " + P.boss.first + " Sees";
    $("up-note").textContent = "The plan as it rolls up to " + P.boss.name + ", " + P.boss.role + ", kept current as the plan changes. It goes up at 5pm and into the COO’s brief at 6am.";
    var box = byId("roll"); box.textContent = "";
    var ps = st.dirs.map(function (d) { return dirRisk(st, d); }), worst = Math.min.apply(null, ps), b = band(worst);
    var head = el("div", "roll__head");
    var hw = el("div");
    hw.appendChild(el("p", "roll__k", "From " + P.name));
    hw.appendChild(el("h3", "roll__t", P.team));
    head.appendChild(hw);
    var fig = el("div", "roll__fig");
    fig.appendChild(el("span", "pill " + b.cls, b.label));
    fig.appendChild(el("b", null, money(expected(st))));
    fig.appendChild(el("span", null, "of " + money(rides()) + " expected to land"));
    head.appendChild(fig);
    box.appendChild(head);
    var rows = el("ul", "roll__rows");
    st.dirs.forEach(function (d, i) {
      var p = ps[i], bb = band(p), ts = d.taskIds.map(function (id) { return st.tasks[id]; }).filter(Boolean);
      var done = ts.filter(function (t) { return t.status === "done"; }).length;
      var weak = ts.filter(function (t) { return t.status !== "done"; }).map(function (t) { return { t: t, r: taskRisk(st, t) }; }).sort(function (a, c) { return a.r.p - c.r.p; })[0];
      var why = weak && weak.r.f.slice().sort(function (a, c) { return a[1] - c[1]; })[0];
      var li = el("li");
      var w = el("div");
      w.appendChild(el("b", null, d.title));
      w.appendChild(el("p", null, done + " of " + ts.length + " tasks done. " + (weak ? "Weakest: " + lc(weak.t.text) + ", " + pct(weak.r.p) + " on time" + (why ? " (" + lc(why[0]) + ")" : "") + "." : "Complete.")));
      li.appendChild(w);
      li.appendChild(el("span", "pill " + bb.cls, pct(p) + " on time"));
      rows.appendChild(li);
    });
    box.appendChild(rows);
    var needs = [];
    allTasks(st).forEach(function (t) { if (t.status === "blocked" && st.escalated[t.id]) needs.push("Help unblock “" + t.text + "”: " + lc(t.blocker)); });
    P.decisions.forEach(function (d) { if (st.pending[d.id] != null) { var o = d.opts[st.pending[d.id]]; needs.push("Approve " + kmoney(o.cost) + " to " + lc(o.t) + ": " + lc(d.q.replace(/\?$/, "")) + "."); } });
    P.xin.forEach(function (x) { if (st.ext[x.id] && st.ext[x.id].raised) needs.push("Lean on " + x.team + " to " + lc(x.what) + "."); });
    var made = P.decisions.filter(function (d) { return st.decided[d.id] != null; });
    var cols = el("div", "roll__cols");
    function col(title, items, none) {
      var c = el("div"); c.appendChild(el("p", "tc__h", title));
      var u = el("ul", "roll__list"); (items.length ? items : [none]).forEach(function (n) { u.appendChild(el("li", items.length ? null : "is-none", n)); }); c.appendChild(u);
      cols.appendChild(c);
    }
    col("Needs from " + P.boss.first, needs, "Nothing right now.");
    col("Decided today", made.map(function (d) { return d.q.replace(/\?$/, "") + ": " + lc(d.opts[st.decided[d.id].i].t) + "."; }), "Nothing yet.");
    box.appendChild(cols);
    var foot = el("div", "roll__foot");
    var inp = el("input", { class: "tc__input", type: "text", placeholder: "Add a note for " + P.boss.first + " (optional)", "aria-label": "A note for " + P.boss.name, maxlength: 200 });
    inp.value = st.note; inp.addEventListener("input", function () { st.note = inp.value; });
    foot.appendChild(inp);
    foot.appendChild(button(st.sent ? "Send the latest now" : "Send to " + P.boss.first + " now", "btn btn--primary btn--sm", function () { st.sent = true; DB.toast("Sent to " + P.boss.name + "."); changed(); }));
    if (st.sent) foot.appendChild(el("span", "roll__sent", "Sent at 7:10am"));
    box.appendChild(foot);
  }

  /* ================= 8. You might also ask ================= */
  function renderAsks() {
    var box = byId("asks"); box.textContent = "";
    P.asks.forEach(function (a) {
      var li = el("li"), link = el("a", { class: "ask-q", href: "ask.html?q=" + encodeURIComponent(a[1]) });
      link.appendChild(el("span", "ask-q__kind", a[0])); link.appendChild(el("span", "ask-q__text", a[1]));
      li.appendChild(link); box.appendChild(li);
    });
  }

  /* ================= Render ================= */
  function render() {
    renderHead(); renderBottom(); renderDecisions(); renderPlan(); renderAcross(); renderTeam(); renderWatch(); renderRoll(); renderAsks();
  }

  // arriving from the brief: open the team that carries out that decision and pick out its part of the plan
  var q = new URLSearchParams(window.location.search), FROM = { divert: ["farah", "divert"], cover: ["farah", "cover"], bridge: ["elif", "bridge"] };
  var as = q.get("as"), dir = FROM[q.get("directive")];
  var saved = null; try { saved = localStorage.getItem("daybreak.team.as"); } catch (e) {}
  persona(dir ? dir[0] : PERSONAS[as] ? as : PERSONAS[saved] ? saved : "farah");
  render();
  requestAnimationFrame(function () { requestAnimationFrame(function () { byId("mgrs").classList.add("is-ready"); }); });
  // figures count in and bars grow the first time each section scrolls into view; later redraws stay put
  CountIn(".rides__v, .odds__p");
  Reveal("#bottom-line, #plan, #team, #watch", 0.15);
  if (dir) setTimeout(function () { flash("dir-" + dir[1]); DB.toast("From this morning’s brief: " + P.first + "’s part of the plan."); }, 350);
})();
