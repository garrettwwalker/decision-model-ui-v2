/* Workflows: Penumbra for the managers who carry decisions out, in the house style (rebuilt 2026-11-11). One manager's
   week: a bottom line tied to this morning's brief, the calls that are theirs to make, leadership's directives broken into
   their team's tasks, who has room, what could change the week (each with an early signal and a playbook), and the update
   that goes back up. Three managers to view as. Today is Tue Oct 6, the morning of the brief; day 0 below is today. The
   chances match the brief (Hormuz 27%, Red Sea 31%, Gebze strike 16%, feeder sanctions 15%). Every figure is illustrative. */
(function () {
  var DAYS = ["Tue Oct 6", "Wed Oct 7", "Thu Oct 8", "Fri Oct 9", "Sat Oct 10", "Sun Oct 11", "Mon Oct 12"];
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // people: [id, name, role, shift, place, routine hours, cap, certified for, away, backup]
  var PEOPLE_FIELDS = ["id", "name", "role", "shift", "place", "base", "cap", "skills", "away", "backup"];
  function people(rows) { return rows.map(function (r) { var o = {}; PEOPLE_FIELDS.forEach(function (k, i) { o[k] = r[i]; }); return o; }); }
  // tasks: [id, text, who, day, hours, status, blocker]; a decision's option can finish a task (done) or add one (add)
  function tasks(rows) { return rows.map(function (r) { return { id: r[0], text: r[1], who: r[2], day: r[3], hours: r[4], status: r[5] || "todo", blocker: r[6] || "" }; }); }

  var PERSONAS = {
    farah: {
      first: "Farah", name: "Farah Saleh", role: "Port operations manager", team: "Port operations, UAE", short: "Port operations, UAE",
      boss: { name: "Tomas Varga", first: "Tomas", role: "VP Logistics" },
      title: "Move Four Sailings to Khor Fakkan by Thursday",
      lede: "The COO approved the Khor Fakkan diversion and war-risk cover in this morning’s brief. The port team owns the groundwork for both, and the Khor Fakkan berth booking closes Thursday at 2pm.",
      lead: "The diversion only protects its $7.6M if every box reaches the Dubai DC within 36 hours of discharge. Trucks and customs filings are the tight spots, and Joel is the only one who can file entries at Khor Fakkan.",
      priorities: [
        ["Book the four held slots", "The booking agent is holding four Khor Fakkan slots on option until Thursday’s 2pm cutoff."],
        ["Get Treasury the Gulf calls", "The war-risk quote expires Wednesday at 5pm, and the carrier still hasn’t sent the Sable Orchid’s hull value."],
        ["Cover the night gate", "Aisha is the only certified reach-stacker operator on nights until Tariq is back on Sunday, and three vessels arrive Saturday."]
      ],
      rides: { v: 13.3, what: "the Khor Fakkan diversion ($7.6M) and war-risk cover ($5.7M)" },
      people: people([
        ["farah", "Farah Saleh", "Port operations manager", "Days", "Jebel Ali", 30, 45, ["Berth planning", "Carrier relations"], null, null],
        ["rashid", "Rashid Al Mansoori", "Shift supervisor", "Days", "Jebel Ali", 33, 45, ["Yard planning", "Customs liaison"], null, "nadia"],
        ["nadia", "Nadia Haddad", "Shift supervisor", "Nights", "Jebel Ali", 30, 45, ["Yard planning", "Reefers"], null, "rashid"],
        ["joel", "Joel Fernandes", "Documentation lead", "Days", "Jebel Ali", 38, 45, ["Customs filings", "Bills of lading"], null, null],
        ["sanjay", "Sanjay Pillai", "Trucking coordinator", "Days", "Khor Fakkan", 26, 45, ["Haulier contracts", "Road permits"], null, null],
        ["aisha", "Aisha Karim", "Lead reach-stacker operator", "Nights", "Jebel Ali", 36, 45, ["Reach-stacker certified", "Hazmat"], null, "tariq"],
        ["tariq", "Tariq Nasser", "Reach-stacker operator", "Nights", "Jebel Ali", 0, 45, ["Reach-stacker certified"], "On leave until Sun Oct 11", "aisha"],
        ["meilin", "Mei Lin Tan", "Operations analyst", "Days, part time", "Remote", 14, 22, ["TMS", "Reporting"], null, null]
      ]),
      gaps: [
        { text: "Only Joel can file customs entries at Khor Fakkan, and the diversion doubles his filings this week.", fix: "Have Rashid shadow Joel on Khor Fakkan filings", who: "rashid", day: 1, hours: 4 },
        { text: "Aisha is the only certified reach-stacker operator on nights until Tariq is back on Sunday.", fix: "Borrow a certified operator from the day pool for nights", who: "nadia", day: 0, hours: 1 },
        { text: "Sanjay is the only one with the Khor Fakkan hauliers’ numbers.", fix: "Share the haulier contact sheet with Rashid", who: "sanjay", day: 0, hours: 1 }
      ],
      decisions: [
        { id: "kf-slots", q: "Book the Khor Fakkan berth slots before Thursday’s cutoff?", due: [2, "14:00"],
          context: "The booking agent is holding four slots on option until the cutoff. Khor Fakkan is 70% booked and won’t hold slots past it.",
          opts: [{ t: "Book all 4 held slots", sub: "$12.8k; $1.6k a slot to cancel", done: "t-slots" }, { t: "Book 2 now, 2 on Thursday", sub: "$6.4k now; the last 2 may be gone" }, { t: "Wait for Monday’s forecast", sub: "Nothing spent; likely no slots left" }],
          pick: 0, why: "The directive moves four sailings, and if the strait closes every Gulf shipper will want these berths. Cancelling later costs far less than missing the cutoff." },
        { id: "yard", q: "Release boxes from the Jebel Ali yard early?", due: [1, "12:00"],
          context: "212 Halvorsen boxes are in the yard. Dwell time is 71 hours and climbing, an hour short of the 72-hour trigger.",
          opts: [{ t: "Release the 90 fast movers", sub: "The DC can take them without overtime", add: { text: "Release 90 fast-moving boxes to the Dubai DC", who: "rashid", day: 1, hours: 6 } }, { t: "Release all 212", sub: "The DC needs a Saturday shift", add: { text: "Release all 212 boxes to the Dubai DC", who: "rashid", day: 1, hours: 12 } }, { t: "Hold until Monday", sub: "Dwell keeps climbing" }],
          pick: 0, why: "Moving the fast movers clears the boxes the DC would need first if inbound stops, without paying for a weekend shift." },
        { id: "nights", q: "Approve overtime for Saturday’s night gate shift?", due: [3, "17:00"],
          context: "With Tariq on leave, Aisha is the only certified operator on nights, and three vessels bunch up on Saturday.",
          opts: [{ t: "Approve 6 hours", sub: "$1.1k; two cranes all night", add: { text: "Schedule a second certified operator for Saturday night", who: "nadia", day: 3, hours: 1 } }, { t: "Move Rashid to nights", sub: "Free, but days lose a supervisor" }, { t: "Decline", sub: "One crane on Saturday night" }],
          pick: 0, why: "One crane can’t turn three vessels overnight, and a missed window pushes the boxes into next week’s dwell." },
        { id: "surcharge", q: "Accept the carrier’s $180-a-box war-risk surcharge on AE7?", due: [1, "17:00"],
          context: "The carrier wants an answer for this week’s sailing. Treasury is binding war-risk cover on Gulf calls today.",
          opts: [{ t: "Ask Treasury first", sub: "Answer the carrier tomorrow", add: { text: "Ask Treasury whether the new cover overlaps the AE7 surcharge", who: "farah", day: 0, hours: 1 } }, { t: "Accept for this week", sub: "About $38k on this sailing" }, { t: "Push back", sub: "Risks a rolled booking" }],
          pick: 0, why: "If Treasury’s new cover already insures this cargo, the surcharge pays for it twice. One message to Treasury settles the overlap before the carrier’s deadline." }
      ],
      directives: [
        { id: "divert", brief: true, title: "Divert Four Jebel Ali Sailings to Khor Fakkan", by: "Tomas Varga, VP Logistics", approved: "Approved by the COO in this morning’s brief",
          part: "Get every diverted box from Khor Fakkan to the Dubai DC within 36 hours of discharge.", due: 2,
          tasks: tasks([
            ["t-slots", "Book four Khor Fakkan berth slots", "farah", 2, 2],
            ["t-trucks", "Line up 14 trucks a sailing with Khor Fakkan hauliers", "sanjay", 1, 8, "doing"],
            ["t-customs", "File transit customs entries for the diverted boxes", "joel", 2, 10],
            ["t-eta", "Update arrival times for 212 boxes in the TMS", "meilin", 1, 4, "done"],
            ["t-dc", "Give the Dubai DC its new arrival windows", "rashid", 1, 2],
            ["t-gate", "Brief the night shift on the new gate plan", "nadia", 2, 2]
          ]) },
        { id: "cover", brief: true, title: "Bind War-Risk Cover on Gulf Calls", by: "Hanne Sørli, Group Treasurer", approved: "Approved by the COO in this morning’s brief",
          part: "Give Treasury what it needs to put every Gulf call on the cover before the quote expires Wednesday.", due: 1,
          tasks: tasks([
            ["t-calls", "Send Treasury the Gulf calls for the next 30 days", "joel", 1, 3],
            ["t-hull", "Confirm each vessel’s insured value with the carrier", "rashid", 1, 3, "blocked", "The carrier hasn’t sent the hull value for the Sable Orchid."],
            ["t-hold", "Hold the AE7 surcharge until the cover is confirmed", "farah", 1, 1]
          ]) }
      ],
      watch: [
        { id: "hormuz", kind: "threat", title: "Strait of Hormuz Closes", pn: 27, p: "Chance in 30 days", trend: [6, 9, 18, 24, 27],
          impact: "Jebel Ali inbound drops to almost nothing, three ships are stuck inside, and the team’s work moves to Khor Fakkan and Sohar overnight.",
          signal: { text: "Daily strait transits", now: 61, at: 40, unit: "% of normal", dir: "below" },
          steps: [["Switch every inbound booking to Khor Fakkan or Sohar", "farah", 3], ["Run trucks to the Dubai DC around the clock", "sanjay", 8], ["Move two operators to Khor Fakkan", "nadia", 2], ["Release every box in the Jebel Ali yard to the DC", "rashid", 10], ["Hold a 07:30 call with Tomas every day until the strait reopens", "farah", 1]] },
        { id: "dwell", kind: "threat", title: "Jebel Ali Yard Congestion", p: "Likely within 2 weeks", trend: [48, 55, 63, 71],
          impact: "Boxes wait days for a gate slot, demurrage starts after 5 days, and the DC’s stock runs down while cargo sits in port.",
          signal: { text: "Average container dwell", now: 71, at: 72, unit: " hours", dir: "above" },
          steps: [["Release fast movers to the DC early", "rashid", 6], ["Open a Saturday gate", "nadia", 6], ["Ask the DC for overflow yard space", "farah", 1]] },
        { id: "feeders", kind: "threat", title: "Sanctions Hit Two ME4 Feeders", pn: 15, p: "Chance in 30 days", trend: [9, 10, 13, 15],
          impact: "About 480 boxes a week bound for Dammam are held for screening, and the documentation team is buried in checks.",
          signal: { text: "Listing of the feeders’ technical manager", dir: "event", status: "Not yet" },
          steps: [["Pre-book slots on the rival Gulf shuttle", "sanjay", 2], ["Prepare a cargo screening checklist", "joel", 4], ["Warn the Dammam DC of a possible gap", "farah", 1]] },
        { id: "kf-room", kind: "opportunity", title: "Spare Berth Space at Khor Fakkan", p: "Open now, likely gone next week",
          impact: "600 TEU a week is free and quoted 8% below Jebel Ali. Standing slots now would make the diversion cheaper and keep it open for a month.",
          signal: { text: "Free capacity at Khor Fakkan", now: 600, at: 200, unit: " TEU a week", dir: "below" },
          steps: [["Book standing slots for the next four weeks", "farah", 2], ["Negotiate the rate on a four-week commitment", "farah", 2]] },
        { id: "trucks", kind: "opportunity", title: "Khor Fakkan Truck Rates at a Three-Month Low", p: "This month",
          impact: "Locking a month of haulage now saves about $9k against spot and guarantees trucks if every shipper diverts at once.",
          signal: { text: "Spot rate, Khor Fakkan to Dubai", now: 610, at: 700, unit: " AED a truck", dir: "above" },
          steps: [["Lock a one-month haulage contract with two hauliers", "sanjay", 3]] }
      ],
      fixed: [[0, "07:30", "Team stand-up"], [1, "17:00", "War-risk quote expires"], [2, "14:00", "Khor Fakkan booking closes"], [4, "", "Three vessels due at Jebel Ali"], [5, "", "Tariq back from leave"], [6, "09:00", "Weekly review with Tomas"]],
      asks: [["Capacity", "How many trucks a day would Khor Fakkan need if the strait closes?"], ["What if", "What if Khor Fakkan fills up before Thursday’s cutoff?"], ["Exposure", "Which boxes in the Jebel Ali yard matter most to the Dubai DC?"], ["Forecast", "How likely is a closure before the four diverted sailings arrive?"]]
    },

    elif: {
      first: "Elif", name: "Elif Şahin", role: "Production manager", team: "Production, Gebze plant", short: "Gebze production",
      boss: { name: "Murat Kaya", first: "Murat", role: "Plant director" },
      title: "Get Gebze Ready to Run on Singapore Resin",
      lede: "The COO approved the Singapore resin bridge-buy in this morning’s brief. The first 4,000 t lands on October 20, and Gebze has 11 days of PP resin in its silos.",
      lead: "If the strait closes, Jubail resin stops and all three Gebze lines would stop in week two. The Singapore grade has to pass a moulding trial before it lands, and only Hakan can sign the trial off.",
      priorities: [
        ["Start the resin trial Thursday", "Hakan is at a supplier audit in Bursa until Thursday. His remote approval of the trial plan lets Line 1’s trial start the day he’s back."],
        ["Decide on Saturday’s Line 2 shift", "A Saturday shift banks about 1,100 dishwashers ahead of the union’s strike vote on October 20."],
        ["Send Murat the strike contingency", "Which roles keep running during a legal strike, and the safe shutdown order for each line."]
      ],
      rides: { v: 11.7, what: "the Singapore resin bridge-buy, shared with the Pune plant" },
      people: people([
        ["elif", "Elif Şahin", "Production manager", "Days", "Gebze", 32, 45, ["Line scheduling", "Lean"], null, null],
        ["kemal", "Kemal Aydın", "Line 1 supervisor, washers", "Days", "Gebze", 36, 45, ["Washer line", "Changeovers"], null, "zeynep"],
        ["zeynep", "Zeynep Kaya", "Line 2 supervisor, dishwashers", "Days", "Gebze", 34, 45, ["Dishwasher line", "Changeovers"], null, "kemal"],
        ["ozan", "Ozan Çelik", "Line 3 supervisor, dryers", "Nights", "Gebze", 38, 45, ["Dryer line"], null, null],
        ["selma", "Selma Arslan", "Materials planner", "Days", "Gebze", 37, 45, ["Resin planning", "MRP"], null, null],
        ["hakan", "Hakan Doğan", "Quality engineer", "Days", "Supplier audit, Bursa", 30, 45, ["Resin qualification", "Moulding trials"], "At a supplier audit until Thu Oct 8", null],
        ["derya", "Derya Polat", "Maintenance planner", "Days", "Gebze", 28, 45, ["Planned maintenance", "Moulds"], null, null],
        ["burak", "Burak Aydın", "Labor relations", "Days", "Gebze", 20, 30, ["Union liaison"], null, null]
      ]),
      gaps: [
        { text: "Only Hakan can sign off a new resin grade, and he’s at a supplier audit until Thursday.", fix: "Ask Hakan to approve the trial plan remotely", who: "hakan", day: 1, hours: 1 },
        { text: "Line 3 has no backup supervisor on nights if Ozan is out.", fix: "Train Zeynep’s deputy on the dryer line", who: "zeynep", day: 3, hours: 6 }
      ],
      decisions: [
        { id: "offspec", q: "Accept 40 t of Singapore resin with a slightly high melt index?", due: [1, "10:00"],
          context: "The first bridge-buy lot tested inside spec for dryer drums but at the edge for washer tubs.",
          opts: [{ t: "Accept for Line 3 only", sub: "Dryers run it; washers wait for the next lot", add: { text: "Route the 40 t lot to Line 3’s silo", who: "selma", day: 1, hours: 2 } }, { t: "Reject and wait", sub: "Next lot in 9 days" }, { t: "Accept for every line", sub: "Higher scrap risk on washer tubs" }],
          pick: 0, why: "Dryer drums tolerate the higher melt index, so Line 3 uses the lot safely and saves the in-spec resin for washers." },
        { id: "saturday", q: "Run Line 2 on Saturday to build dishwasher stock?", due: [2, "16:00"],
          context: "The union votes on a strike on October 20, and the chance of a strike at Gebze is 16%. Murat asked every plant manager for a strike contingency.",
          opts: [{ t: "Run Saturday", sub: "$38k overtime; about 1,100 units ahead", add: { text: "Staff Line 2 for Saturday", who: "zeynep", day: 3, hours: 3 } }, { t: "Half shift on Sunday", sub: "$19k; about 550 units" }, { t: "Don’t run", sub: "No stock ahead" }],
          pick: 0, why: "Each Saturday worked now banks a day of dishwasher output in case talks fail, and uses resin before a Gulf disruption makes it scarce." },
        { id: "maint", q: "Move Line 1’s planned maintenance?", due: [3, "12:00"],
          context: "Maintenance is set for Friday. Resin cover is thinnest around October 15, when Line 1 may idle anyway.",
          opts: [{ t: "Move to Thu Oct 15", sub: "Maintain while waiting for resin", add: { text: "Re-book Line 1’s maintenance crew for Thu Oct 15", who: "derya", day: 2, hours: 2 } }, { t: "Keep Friday", sub: "Lose a full production day now" }],
          pick: 0, why: "If Line 1 is going to wait for resin around October 15, maintenance then costs no output at all." }
      ],
      directives: [
        { id: "bridge", brief: true, title: "Bridge-Buy Resin from Singapore", by: "Aylin Demir, VP Procurement", approved: "Approved by the COO in this morning’s brief",
          part: "Be ready to run every line on Singapore resin when it lands on October 20, with no scrap spike.", due: 3,
          tasks: tasks([
            ["e-trial", "Run a moulding trial with the Singapore grade on Line 1", "hakan", 3, 8, "blocked", "Hakan is at a supplier audit until Thursday."],
            ["e-seq", "Re-sequence the lines so Singapore resin goes to washers first", "selma", 2, 6],
            ["e-silo", "Agree silo space for the 4,000 t landing October 20", "selma", 1, 2, "doing"],
            ["e-cover", "Report resin days of cover to Murat every morning", "selma", 0, 1, "done"]
          ]) },
        { id: "strike", title: "Prepare a Strike Contingency", by: "Murat Kaya, Plant director", approved: "Asked of every plant manager this week",
          part: "Know which work continues, which stops, and in what order, before the union votes on October 20.", due: 3,
          tasks: tasks([
            ["e-roles", "List the roles that keep running during a legal strike", "burak", 3, 4],
            ["e-ahead", "Build two days of washer stock by October 30", "kemal", 6, 10],
            ["e-shut", "Write a safe shutdown sequence for each line", "derya", 3, 6],
            ["e-brief", "Brief supervisors on what they can say about the talks", "burak", 2, 2]
          ]) }
      ],
      watch: [
        { id: "resin", kind: "threat", title: "Resin Runs Out if the Strait Closes", pn: 27, p: "Chance of a closure in 30 days", trend: [6, 9, 18, 24, 27],
          impact: "Jubail resin stops. With 11 days of cover, all three lines stop in week two unless the Singapore resin is qualified and flowing.",
          signal: { text: "PP resin days of cover", now: 11, at: 8, unit: " days", dir: "below" },
          steps: [["Switch every line to the Singapore grade", "selma", 4], ["Cut to two shifts on Lines 1 and 2", "elif", 2], ["Pull planned maintenance into the idle days", "derya", 3]] },
        { id: "strike-w", kind: "threat", title: "Strike at the Gebze Plant", pn: 16, p: "Chance before November 1", trend: [5, 8, 13, 16],
          impact: "Lines stop for the length of the walkout. Every day out costs about 6,200 units, and the EU washer launch slips after five days.",
          signal: { text: "Overtime refusals", now: 12, at: 20, unit: "%", dir: "above" },
          steps: [["Run the shutdown sequence line by line", "derya", 4], ["Keep the agreed essential roles staffed", "burak", 2], ["Shift EU washer orders to Pune", "elif", 3]] },
        { id: "redsea-e", kind: "threat", title: "Red Sea Shuts to Traffic", pn: 31, p: "Chance in 30 days", trend: [22, 25, 32, 31],
          impact: "Resin and Bursa parts ships go round the Cape, adding 11 days to every inbound lot.",
          signal: { text: "Bab el-Mandeb transits", now: 64, at: 50, unit: "% of normal", dir: "below" },
          steps: [["Add 11 days to every inbound in the plan", "selma", 3], ["Ask Bursa for a road shipment of seat assemblies", "selma", 1]] },
        { id: "pune", kind: "opportunity", title: "Spare Capacity at the Pune Plant", p: "18% free this quarter",
          impact: "Pune can take some EU washer orders, which would protect the launch if Gebze has to stop.",
          signal: { text: "Pune spare capacity", now: 18, at: 10, unit: "%", dir: "below" },
          steps: [["Agree which washer SKUs Pune could make", "elif", 3]] }
      ],
      fixed: [[0, "08:00", "Shift handover"], [2, "", "Hakan back from Bursa"], [3, "", "Line 1 maintenance (planned)"], [4, "", "Saturday shift, if approved"], [6, "10:00", "Plant review with Murat"]],
      asks: [["Capacity", "How long can Gebze run on Singapore resin alone?"], ["What if", "What if the first Singapore lot lands a week late?"], ["Exposure", "Which products would Gebze stop making first if resin runs short?"], ["Forecast", "Would a Hormuz closure make a strike at Gebze more likely?"]]
    },

    layla: {
      first: "Layla", name: "Layla Mansour", role: "Head of key accounts, GCC", team: "Key accounts, GCC", short: "GCC key accounts",
      boss: { name: "Karim Haddad", first: "Karim", role: "GM, MENA" },
      title: "Keep Every GCC Key Account Ahead of the Delays",
      lede: "The Khor Fakkan diversion approved this morning adds a day and a half to Middle East deliveries. Al Noor Hypermarkets and Gulf Home Electronics can both claim penalties after 7 days short.",
      lead: "No key account should hear about a delay from anyone but Halvorsen. The order desk has hundreds of delivery promises to change, and only Ravi has access to change them in the order system.",
      priorities: [
        ["Call Al Noor this week", "A call with a protection plan, before the delays reach the shelf, lets Al Noor move its promotions instead of running out."],
        ["Reset the delivery promises", "Every open Middle East order needs the extra day and a half by Thursday, and Ravi is already at 40 of 45 hours."],
        ["Free 400 pallets at the Dubai DC", "The diverted boxes need the room. Slow fridge SKUs take 260 of those spaces."]
      ],
      rides: { v: 7.6, what: "the Khor Fakkan diversion, which your team carries to customers" },
      people: people([
        ["layla", "Layla Mansour", "Head of key accounts", "Days", "Dubai", 34, 45, ["Account strategy", "Negotiation"], null, null],
        ["omar", "Omar Farouk", "Key account manager, Al Noor Hypermarkets", "Days", "Dubai", 38, 45, ["Al Noor", "Promotions"], null, "hessa"],
        ["hessa", "Hessa Al Suwaidi", "Key account manager, Gulf Home Electronics", "Days", "Riyadh", 31, 45, ["Gulf Home", "KSA retail"], null, "omar"],
        ["ravi", "Ravi Menon", "Order desk lead", "Days", "Dubai", 40, 45, ["Order system", "Delivery promises"], null, null],
        ["lina", "Lina Aziz", "Customer service lead", "Days", "Dubai", 33, 45, ["Customer letters", "Claims"], null, null],
        ["yusuf", "Yusuf Demir", "Channel planner", "Days", "Dubai", 30, 45, ["Allocation", "Forecasting"], null, null],
        ["dana", "Dana Khoury", "Trade marketing", "Days", "Dubai", 22, 45, ["Promotions", "In-store"], "Traveling to Riyadh Wed–Thu", null]
      ]),
      gaps: [
        { text: "Only Ravi can change delivery promises in the order system, and the diversion means changing hundreds.", fix: "Give Yusuf order-system access for this month", who: "ravi", day: 0, hours: 1 },
        { text: "Al Noor and Gulf Home both have penalty clauses after 7 days short, and nobody owns tracking the clock.", fix: "Make Yusuf the owner of the penalty clock", who: "yusuf", day: 0, hours: 1 }
      ],
      decisions: [
        { id: "warn", q: "Tell Al Noor Hypermarkets about possible delays now?", due: [2, "12:00"],
          context: "Al Noor’s penalty clause starts after 7 days short. The diversion adds a day and a half to Middle East deliveries.",
          opts: [{ t: "Call this week with a protection plan", sub: "Omar leads; you join", add: { text: "Call Al Noor’s buyer with the protection plan", who: "omar", day: 2, hours: 2 } }, { t: "Send a written notice", sub: "Formal, but colder" }, { t: "Wait for a closure", sub: "No noise unless it happens" }],
          pick: 0, why: "Customers who hear early, with a plan, rarely invoke penalties. Calling first also lets Al Noor move its promotions instead of running out on shelf." },
        { id: "discount", q: "Offer 3% off to move slow fridge stock out of the Dubai DC?", due: [3, "17:00"],
          context: "Making room for the diverted boxes needs 400 pallet spaces. Slow fridge SKUs take 260 of them.",
          opts: [{ t: "Offer 3% to two accounts", sub: "About $21k; frees 260 pallets", add: { text: "Offer the slow fridge SKUs at 3% off to Al Noor and Gulf Home", who: "hessa", day: 3, hours: 2 } }, { t: "Move them to the Dammam DC", sub: "Trucking cost, no discount" }, { t: "Leave them", sub: "The DC runs short of space" }],
          pick: 0, why: "Space at the Dubai DC is worth more this month than the margin on slow SKUs, and the accounts get a deal before any shortage news." },
        { id: "ramadan", q: "Start planning the Ramadan promotion two weeks earlier?", due: [6, "10:00"],
          context: "Retailers are asking for earlier stock commitments, and supply may be tight in November.",
          opts: [{ t: "Bring it forward", sub: "Lock volumes before any shortage", add: { text: "Bring the Ramadan promotion plan forward two weeks", who: "dana", day: 6, hours: 6 } }, { t: "Keep the usual plan", sub: "Decide in November" }],
          pick: 0, why: "Committing volumes while stock is available protects the season’s biggest promotion if Gulf supply tightens." }
      ],
      directives: [
        { id: "protect", title: "Protect GCC Key Accounts Through the Gulf Disruption", by: "Karim Haddad, GM, MENA", approved: "Set after this morning’s brief",
          part: "No key account is surprised, and none goes 7 days short on its top sellers.", due: 3,
          tasks: tasks([
            ["l-top", "Rank the top 20 SKUs for each account", "yusuf", 1, 4, "doing"],
            ["l-sub", "Agree substitution rules with each buyer", "omar", 3, 4],
            ["l-letter", "Draft the customer letter for a closure", "lina", 2, 3],
            ["l-clock", "Track days short against each penalty clause", "yusuf", 1, 2]
          ]) },
        { id: "divert-l", brief: true, title: "Divert Four Jebel Ali Sailings to Khor Fakkan", by: "Tomas Varga, VP Logistics", approved: "Approved by the COO in this morning’s brief",
          part: "Every Middle East delivery promise reflects the extra day and a half.", due: 2,
          tasks: tasks([
            ["l-promise", "Update delivery promises on open Middle East orders", "ravi", 2, 12],
            ["l-tell", "Tell account managers which orders move", "ravi", 2, 2]
          ]) }
      ],
      watch: [
        { id: "mena", kind: "threat", title: "Middle East Stock-Outs if the Strait Closes", pn: 27, p: "Chance of a closure in 30 days", trend: [6, 9, 18, 24, 27],
          impact: "The Dubai and Dammam DCs run dry within two weeks, and two key accounts can invoke penalties after 7 days short.",
          signal: { text: "Washer stock at the Dubai DC", now: 14, at: 7, unit: " days", dir: "below" },
          steps: [["Allocate remaining stock to top SKUs by account", "yusuf", 4], ["Call every key account the same day", "layla", 3], ["Send the agreed customer letter", "lina", 2]] },
        { id: "feeders-l", kind: "threat", title: "Feeder Sanctions Hold Dammam Deliveries", pn: 15, p: "Chance in 30 days", trend: [9, 10, 13, 15],
          impact: "Gulf Home’s Saudi stores lose about a week of deliveries while boxes are screened.",
          signal: { text: "Listing of the feeders’ technical manager", dir: "event", status: "Not yet" },
          steps: [["Warn Gulf Home’s buyer", "hessa", 1], ["Serve Saudi stores from Dubai by road", "ravi", 4]] },
        { id: "rival", kind: "opportunity", title: "A Rival Brand Is Short in Saudi Arabia", p: "Seen in 4 of 10 store checks",
          impact: "A competitor’s washers are missing from Gulf Home shelves. Extra facings now could hold share after the competitor recovers.",
          signal: { text: "Store checks with the rival out of stock", now: 4, at: 6, unit: " of 10", dir: "above" },
          steps: [["Offer Gulf Home extra washer facings", "hessa", 2], ["Shift 300 washers to Saudi stores", "yusuf", 2]] }
      ],
      fixed: [[0, "09:00", "Account team huddle"], [1, "", "Dana in Riyadh"], [2, "", "Dana in Riyadh"], [3, "11:00", "Gulf Home quarterly review"], [6, "10:00", "Commercial review with Karim"]],
      asks: [["Exposure", "Which customers would feel a Jebel Ali delay first?"], ["What if", "What if Al Noor invokes its penalty clause?"], ["Capacity", "How many washers could Saudi stores take from Dubai by road?"], ["Forecast", "How likely are the Dammam feeders to be sanctioned this month?"]]
    }
  };
  // the brief's three decisions protect $25.0M in all
  var BRIEF_PROTECTS = 25.0;

  // tasks that can't start until another is done
  var AFTER = { "t-customs": "t-slots", "t-gate": "t-slots", "e-seq": "e-trial", "l-tell": "l-promise" };
  // tasks only someone certified can do, so a handoff suggestion never passes them to the wrong person
  var SKILL = { "t-customs": "Customs filings", "e-trial": "Moulding trials", "l-promise": "Order system" };
  var STATUS = { todo: "To do", doing: "In progress", done: "Done", blocked: "Stuck" };
  var NEXT = { todo: "doing", doing: "done", done: "todo", blocked: "doing" };

  /* ================= State: one per manager, kept while switching between them ================= */
  var S = {}, pid = "farah", P, st;
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function init(id) {
    if (S[id]) return S[id];
    var p = PERSONAS[id], s = { decided: {}, tasks: {}, dirs: [], own: [], prepared: {}, active: {}, planned: {}, escalated: {}, member: p.people[0].id, watch: p.watch[0].id, draft: null, autodraft: true, sent: false, seq: 0 };
    p.directives.forEach(function (d) {
      var c = clone(d); c.taskIds = c.tasks.map(function (t) { s.tasks[t.id] = t; return t.id; }); delete c.tasks; s.dirs.push(c);
    });
    return (S[id] = s);
  }
  function persona(id) { pid = id; P = PERSONAS[id]; st = init(id); try { localStorage.setItem("daybreak.team.as", id); } catch (e) {} }
  function person(id) { return P.people.filter(function (x) { return x.id === id; })[0]; }
  function allTasks() { return Object.keys(st.tasks).map(function (k) { return st.tasks[k]; }); }
  function addTask(text, who, day, hours, group) {
    var id = "x" + (++st.seq);
    st.tasks[id] = { id: id, text: text, who: who, day: day, hours: hours, status: "todo", blocker: "" };
    if (group) group.push(id); else st.own.push(id);
    return id;
  }
  function removeTask(id) {
    delete st.tasks[id];
    st.own = st.own.filter(function (x) { return x !== id; });
    st.dirs.forEach(function (d) { d.taskIds = d.taskIds.filter(function (x) { return x !== id; }); });
  }
  function hoursOf(id) {
    var p = person(id);
    return p.base + allTasks().reduce(function (h, t) { return h + (t.who === id && t.status !== "done" ? t.hours : 0); }, 0);
  }
  function waitsOn(t) { var a = AFTER[t.id]; return a && st.tasks[a] && st.tasks[a].status !== "done" ? st.tasks[a] : null; }
  function isMe(id) { return id === P.people[0].id; }

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
  function initials(n) { return n.split(" ").map(function (w) { return w.charAt(0); }).join("").slice(0, 2); }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many || one + "s"); }
  // small counts in words in running text: "Two decisions", "three threats"
  var WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  function words(n, one, many) { return (WORDS[n] || n) + " " + (n === 1 ? one : many || one + "s"); }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function byDue(a, b) { return a.due[0] - b.due[0] || a.due[1].localeCompare(b.due[1]); }
  function dayText(d, time) { return (d === 0 ? "Today" : d === 1 ? "Tomorrow" : DAYS[d].split(" ")[0]) + (time ? " " + time : ""); }
  // mid-sentence: "today", "tomorrow", but weekdays keep their capital
  function dayLow(d, time) { var t = dayText(d, time); return d <= 1 ? t.charAt(0).toLowerCase() + t.slice(1) : t; }
  function first(id) { return isMe(id) ? "you" : person(id).name.split(" ")[0]; }
  function First(id) { return isMe(id) ? "You" : person(id).name.split(" ")[0]; }
  // rounded-square initials in a warm color picked from the name, as on the agents page
  var COLORS = ["#7a1f2b", "#161412", "#c2410c", "#8a5a2b", "#a33a2a", "#a16207"];
  function avatar(p, cls) {
    var h = 0; for (var i = 0; i < p.name.length; i++) h = (h * 31 + p.name.charCodeAt(i)) >>> 0;
    var a = el("span", { class: "av" + (cls ? " " + cls : ""), "aria-hidden": "true" }, initials(p.name));
    a.style.setProperty("--av", COLORS[h % COLORS.length]);
    return a;
  }
  function button(text, cls, fn, attrs) { var b = el("button", Object.assign({ type: "button", class: cls }, attrs || {}), text); b.addEventListener("click", fn); return b; }
  function changed() { render(); }
  function glide(id, offset) {
    var t = byId(id); if (!t) return;
    var bar = document.querySelector(".bar").getBoundingClientRect().bottom;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - bar - (offset == null ? 24 : offset), behavior: REDUCE ? "auto" : "smooth" });
  }
  // a card picked out from elsewhere on the page washes pale red, then settles
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

  /* ================= Head and the managers ================= */
  function renderHead() {
    $("kicker").textContent = "Workflows for " + P.name + ", " + P.role.charAt(0).toLowerCase() + P.role.slice(1) + ", Tuesday, October 6, 2026";
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
  // the white pill slides behind the chosen name
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
  function closestSignal() {
    return P.watch.filter(function (w) { return w.kind === "threat"; }).map(function (w) { return { w: w, s: signalState(w) }; })
      .sort(function (a, b) { return b.s.rank - a.s.rank || a.s.gap - b.s.gap; })[0];
  }
  function renderBottom() {
    $("bl-lead").textContent = P.lead;
    var kp = byId("kp"); kp.textContent = "";
    P.priorities.forEach(function (x, i) {
      var li = el("li"); li.appendChild(el("span", "kp__n", String(i + 1)));
      var t = el("div"); t.appendChild(el("b", null, x[0])); t.appendChild(el("p", null, x[1])); li.appendChild(t);
      kp.appendChild(li);
    });
    $("rides-k").textContent = "Riding on " + P.first + "’s team";
    var rv = $("rides-v"); rv.textContent = DB.money(P.rides.v);
    if (rv._src) rv._src = null; // a redraw before the first count: the count would bring back the old figure
    $("rides-bar").style.width = (100 * P.rides.v / BRIEF_PROTECTS).toFixed(1) + "%";
    $("rides-what").textContent = "of the $" + BRIEF_PROTECTS.toFixed(1) + "M the brief’s three decisions protect: " + P.rides.what + ".";

    var open = P.decisions.filter(function (d) { return st.decided[d.id] == null; });
    var next = open.slice().sort(function (a, b) { return a.due[0] - b.due[0] || a.due[1].localeCompare(b.due[1]); })[0];
    var lead = [].concat.apply([], st.dirs.map(function (d) { return d.taskIds; })).map(function (id) { return st.tasks[id]; }).filter(Boolean);
    var done = lead.filter(function (t) { return t.status === "done"; }).length, stuck = lead.filter(function (t) { return t.status === "blocked"; }).length;
    var here = P.people.filter(function (p) { return !p.away; });
    var h = here.reduce(function (s, p) { return s + hoursOf(p.id); }, 0), cap = here.reduce(function (s, p) { return s + p.cap; }, 0);
    var over = here.filter(function (p) { return hoursOf(p.id) > p.cap; });
    var close = closestSignal();
    var cells = [
      ["waiting", "Decisions waiting", String(open.length), next ? "Next due " + dayLow(next.due[0], next.due[1]) : "All made", open.length ? "red" : ""],
      ["leadership", "Leadership’s tasks done", done + " of " + lead.length, stuck ? plural(stuck, "task") + " stuck" : "Nothing stuck", ""],
      ["team", "Team load this week", Math.round(100 * h / cap) + "%", over.length ? over.map(function (p) { return first(p.id); }).join(" and ") + " over capacity" : "Nobody over capacity", over.length ? "red" : ""],
      ["watch", "Closest signal", close.s.short, close.w.title, close.s.rank >= 2 ? "red" : ""]
    ];
    var box = byId("stats");
    counted(".stat__v", function () {
      box.textContent = "";
      cells.forEach(function (c) {
        var b = el("button", { type: "button", class: "stat" + (c[4] ? " is-" + c[4] : "") });
        b.appendChild(el("span", "stat__k", c[1]));
        b.appendChild(el("b", "stat__v", c[2]));
        b.appendChild(el("span", "stat__n", c[3]));
        b.addEventListener("click", function () { glide(c[0]); });
        box.appendChild(b);
      });
    });
  }

  /* ================= 2. Waiting for you ================= */
  var fresh = null; // the decision just made or changed, which settles in
  function renderWeek() {
    var box = byId("week"); box.textContent = "";
    DAYS.forEach(function (label, d) {
      var due = P.decisions.filter(function (x) { return x.due[0] === d; });
      var openDue = due.filter(function (x) { return st.decided[x.id] == null; });
      var n = allTasks().filter(function (t) { return t.day === d && t.status !== "done"; }).length;
      var li = el("li", "week__day" + (d === 0 ? " is-today" : "") + (openDue.length ? " is-due" : due.length ? " is-done" : ""));
      li.appendChild(el("b", null, label));
      var ul = el("ul");
      P.fixed.forEach(function (f) { if (f[0] === d) ul.appendChild(el("li", null, (f[1] ? f[1] + " " : "") + f[2])); });
      due.forEach(function (x) {
        var r = el("li", st.decided[x.id] == null ? "is-dec" : "is-decided");
        r.appendChild(button((st.decided[x.id] == null ? "Decide by " : "Decided: ") + x.due[1] + ", " + x.short, "week__go", function () { flash("dec-" + x.id); }));
        ul.appendChild(r);
      });
      if (n) ul.appendChild(el("li", "is-n", plural(n, "task") + " due"));
      li.appendChild(ul);
      box.appendChild(li);
    });
  }
  function renderDecisions() {
    var open = P.decisions.filter(function (d) { return st.decided[d.id] == null; }).length, c = byId("wait-n");
    c.textContent = open; c.hidden = !open; c.setAttribute("aria-label", open + " waiting");
    $("wait-note").textContent = "Calls that are yours to make without escalating, with the Totality engine’s suggestion for each.";
    var box = byId("decisions"); box.textContent = "";
    P.decisions.slice().sort(byDue).forEach(function (d, n) {
      var made = st.decided[d.id], li = el("li", { class: "dec" + (made != null ? " is-made" : ""), id: "dec-" + d.id });
      li.appendChild(el("span", { class: "dec__n", "aria-hidden": "true" }, String(n + 1)));
      var body = el("div", "dec__body");
      body.appendChild(el("h3", "dec__q", d.q));
      if (made != null) {
        var o = d.opts[made.i];
        var res = el("p", "dec__made"); res.appendChild(el("b", null, "Decided: " + o.t + ". ")); res.appendChild(document.createTextNode(made.note));
        body.appendChild(res);
        li.appendChild(body);
        var act = el("div", "dec__act"); act.appendChild(button("Change", "btn-q", function () { undoDecision(d); }));
        li.appendChild(act);
      } else {
        body.appendChild(el("p", "dec__ctx", d.context));
        var meta = el("p", "dec__meta"); meta.appendChild(el("span", "pill pill--red", "Decide by " + dayLow(d.due[0], d.due[1])));
        body.appendChild(meta);
        li.appendChild(body);
        var opts = el("div", { class: "dec__opts", role: "group", "aria-label": d.q });
        d.opts.forEach(function (o, i) {
          var b = el("button", { type: "button", class: "opt" + (i === d.pick ? " is-pick" : "") });
          if (i === d.pick) b.appendChild(el("span", "pill pill--red opt__tag", "Totality suggests"));
          b.appendChild(el("b", null, o.t)); b.appendChild(el("small", null, o.sub));
          b.addEventListener("click", function () { decide(d, i); });
          opts.appendChild(b);
        });
        var why = el("p", "dec__why"); why.appendChild(el("b", null, "Why Totality suggests it: ")); why.appendChild(document.createTextNode(d.why));
        var panel = el("div", "dec__panel"); panel.appendChild(opts); panel.appendChild(why);
        li.appendChild(panel);
      }
      if (fresh === d.id && !REDUCE && li.animate) li.animate([{ opacity: 0.4, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 360, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)" });
      box.appendChild(li);
    });
    fresh = null;
  }
  function decide(d, i) {
    var o = d.opts[i], rec = { i: i };
    if (o.done && st.tasks[o.done]) { rec.done = o.done; rec.was = st.tasks[o.done].status; st.tasks[o.done].status = "done"; rec.note = "That finishes “" + st.tasks[o.done].text + "”."; }
    else if (o.add) { rec.added = addTask(o.add.text, o.add.who, o.add.day, o.add.hours); rec.note = "Added a task for " + first(o.add.who) + ", due " + dayLow(o.add.day) + ": “" + o.add.text + "”."; }
    else rec.note = "Logged in your update for " + P.boss.first + ".";
    st.decided[d.id] = rec; fresh = d.id;
    DB.toast("Decided: " + o.t + ".");
    changed();
  }
  function undoDecision(d) {
    var rec = st.decided[d.id];
    if (rec.done && st.tasks[rec.done]) st.tasks[rec.done].status = rec.was;
    if (rec.added) removeTask(rec.added);
    delete st.decided[d.id]; fresh = d.id;
    changed();
  }

  /* ================= 3. From leadership ================= */
  var flagging = null; // the task whose "what's in the way" box is open
  function taskRow(t) {
    var li = el("li", { class: "task is-" + t.status, id: "task-" + t.id });
    li.appendChild(button(STATUS[t.status], "task__status", function () {
      if (t.status === "blocked") { t.blocker = ""; delete st.escalated[t.id]; }
      t.status = NEXT[t.status]; changed();
    }, { "aria-label": "Status: " + STATUS[t.status] + ". Move it on to " + STATUS[NEXT[t.status]].toLowerCase() }));
    var body = el("div", "task__body");
    body.appendChild(el("p", "task__text", t.text));
    var w = waitsOn(t);
    if (t.status === "blocked") {
      var bl = el("p", "task__block"); bl.appendChild(document.createTextNode(t.blocker + " "));
      if (st.escalated[t.id]) bl.appendChild(el("b", null, "Raised with " + P.boss.first + "."));
      else bl.appendChild(button("Raise with " + P.boss.first, "btn-q btn-q--sm", function () { st.escalated[t.id] = true; DB.toast("Added to your update for " + P.boss.first + "."); changed(); }));
      body.appendChild(bl);
    } else if (w) body.appendChild(el("p", "task__wait", "Starts once " + first(w.who) + (isMe(w.who) ? "’ve" : " has") + " finished: " + w.text.charAt(0).toLowerCase() + w.text.slice(1)));
    if (flagging === t.id) {
      var f = el("form", "task__flag");
      var inp = el("input", { class: "task__input", type: "text", placeholder: "What’s in the way?", "aria-label": "What’s in the way of: " + t.text, maxlength: 140 });
      f.appendChild(inp); f.appendChild(el("button", { type: "submit", class: "btn btn--primary btn--sm" }, "Flag"));
      f.appendChild(button("Cancel", "btn-q btn-q--sm", function () { flagging = null; render(); }));
      f.addEventListener("submit", function (e) { e.preventDefault(); if (!inp.value.trim()) return; t.status = "blocked"; t.blocker = inp.value.trim().replace(/\.?$/, "."); flagging = null; changed(); });
      body.appendChild(f);
      setTimeout(function () { inp.focus(); }, 0);
    }
    li.appendChild(body);
    li.appendChild(ownerPicker(t));
    li.appendChild(el("span", "task__due" + (t.day <= 1 && t.status !== "done" ? " is-soon" : ""), dayText(t.day)));
    li.appendChild(el("span", "task__hrs", t.hours + " h"));
    var more = el("span", "task__more");
    if (t.status !== "blocked" && t.status !== "done" && flagging !== t.id) more.appendChild(button("Flag a problem", "btn-q btn-q--sm", function () { flagging = t.id; render(); }));
    li.appendChild(more);
    return li;
  }
  // the owner of a task: a chip that opens a menu of the team with each person's free hours
  var openPicker = null;
  function closePicker() { if (openPicker) { var o = openPicker; openPicker = null; o.close(); } }
  document.addEventListener("click", function (e) { if (openPicker && !openPicker.box.contains(e.target)) closePicker(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && openPicker) { var b = openPicker.btn; closePicker(); b.focus(); } });
  function freeFor(p, t) { return p.cap - hoursOf(p.id) + (t && t.who === p.id && t.status !== "done" ? t.hours : 0); }
  function ownerPicker(t) {
    var box = el("div", "who"), cur = person(t.who);
    var btn = el("button", { type: "button", class: "who__btn", "aria-haspopup": "listbox", "aria-expanded": "false", "aria-label": "Owner: " + (isMe(t.who) ? "you" : cur.name) + ". Change who does: " + t.text });
    btn.appendChild(avatar(cur, "av--sm"));
    btn.appendChild(el("span", "who__name", First(t.who)));
    btn.appendChild(el("span", { class: "who__caret", "aria-hidden": "true" }));
    box.appendChild(btn);
    var menu = null;
    function close() { if (menu) { menu.remove(); menu = null; } btn.setAttribute("aria-expanded", "false"); }
    function open() {
      closePicker();
      menu = el("ul", { class: "who__menu", role: "listbox", "aria-label": "Who does: " + t.text });
      P.people.forEach(function (p) {
        var left = freeFor(p, t), on = p.id === t.who;
        var li = el("li", { role: "option", "aria-selected": String(on), tabindex: "-1", class: "who__opt" + (on ? " is-on" : "") + (p.away ? " is-away" : left < t.hours ? " is-tight" : "") });
        li.appendChild(avatar(p, "av--sm"));
        var tx = el("span", "who__txt"); tx.appendChild(el("b", null, isMe(p.id) ? "You" : p.name)); tx.appendChild(el("small", null, p.role)); li.appendChild(tx);
        li.appendChild(el("span", "who__free", p.away ? "Away" : Math.max(0, left) + " h free"));
        function pick() { closePicker(); if (p.id === t.who) return; handTo(t, p.id); }
        li.addEventListener("click", function (e) { e.stopPropagation(); pick(); });
        li.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); }
          else if (e.key === "ArrowDown" && li.nextSibling) { e.preventDefault(); li.nextSibling.focus(); }
          else if (e.key === "ArrowUp" && li.previousSibling) { e.preventDefault(); li.previousSibling.focus(); }
        });
        menu.appendChild(li);
      });
      box.appendChild(menu);
      btn.setAttribute("aria-expanded", "true");
      openPicker = { box: box, btn: btn, close: close };
      (menu.querySelector(".is-on") || menu.firstChild).focus();
    }
    btn.addEventListener("click", function (e) { e.stopPropagation(); if (menu) closePicker(); else open(); });
    btn.addEventListener("keydown", function (e) { if (e.key === "ArrowDown" && !menu) { e.preventDefault(); open(); } });
    return box;
  }
  function handTo(t, to) { var from = First(t.who); t.who = to; DB.toast("Handed from " + from + " to " + first(to) + ": " + t.text + "."); changed(); }
  function directiveCard(d, opts) {
    opts = opts || {};
    var ts = d.taskIds.map(function (id) { return st.tasks[id]; }).filter(Boolean);
    var done = ts.filter(function (t) { return t.status === "done"; }).length, stuck = ts.filter(function (t) { return t.status === "blocked"; }).length;
    var card = el("article", { class: "dir" + (opts.cls ? " " + opts.cls : ""), id: "dir-" + d.id });
    var head = el("div", "dir__head");
    var hl = el("div", "dir__words");
    hl.appendChild(el("p", "dir__by", d.by + ". " + d.approved + "."));
    hl.appendChild(el("h3", "dir__title", d.title));
    if (d.part) { var part = el("p", "dir__part"); part.appendChild(el("b", null, opts.partLabel || "Your team’s part: ")); part.appendChild(document.createTextNode(d.part)); hl.appendChild(part); }
    head.appendChild(hl);
    var prog = el("div", "dir__prog");
    prog.appendChild(el("b", "dir__done", done + " of " + ts.length));
    prog.appendChild(el("span", "dir__lab", "tasks done"));
    var bar = el("span", "meter"); var fill = el("i"); fill.style.width = (ts.length ? 100 * done / ts.length : 0) + "%"; bar.appendChild(fill); prog.appendChild(bar);
    if (stuck) prog.appendChild(el("span", "pill pill--amber", plural(stuck, "task") + " stuck"));
    else if (d.due != null) prog.appendChild(el("span", "dir__due", "Due " + dayLow(d.due)));
    head.appendChild(prog);
    card.appendChild(head);
    var ul = el("ol", "tasks");
    ts.forEach(function (t) { ul.appendChild(taskRow(t)); });
    card.appendChild(ul);
    if (d.brief || opts.stop) {
      var foot = el("div", "dir__foot");
      if (d.brief) { var a = el("a", { class: "btn-q", href: "briefing.html#waiting" }, "See the decision in the daily brief"); foot.appendChild(a); }
      if (opts.stop) foot.appendChild(button("Stand the playbook down", "btn-q", opts.stop));
      card.appendChild(foot);
    }
    return card;
  }
  function renderDirectives() {
    var n = st.dirs.length, fromBrief = st.dirs.filter(function (d) { return d.brief; }).length;
    $("dir-note").textContent = fromBrief === n
      ? cap(words(n, "decision")) + " from this morning’s brief " + (n === 1 ? "lands" : "land") + " on your team, broken into " + (n === 1 ? "its" : "their") + " tasks."
      : "Leadership’s directives for your team, broken into their tasks. " + cap(words(fromBrief, "comes", "come")) + " from this morning’s brief.";
    var box = byId("dirs");
    counted(".dir__done", function () {
      box.textContent = "";
      st.dirs.forEach(function (d) { box.appendChild(directiveCard(d)); });
      P.watch.forEach(function (w) {
        if (!st.active[w.id]) return;
        box.appendChild(directiveCard({ id: "play-" + w.id, title: (w.kind === "threat" ? "Playbook: " : "Acting On: ") + w.title, by: "Started by you", approved: "Running since " + st.active[w.id].at, part: w.impact, taskIds: st.active[w.id].ids }, {
          cls: "dir--play", partLabel: w.kind === "threat" ? "Why: " : "The opening: ",
          stop: function () { st.active[w.id].ids.forEach(removeTask); delete st.active[w.id]; changed(); }
        }));
      });
      if (st.own.length) box.appendChild(directiveCard({ id: "own", title: "Tasks You’ve Added", by: "From your decisions, gaps, and preparations", approved: "Not part of a directive", taskIds: st.own }, { cls: "dir--own" }));
    });
  }

  /* ================= 4. Who has room ================= */
  function loadBar(p) {
    var h = hoursOf(p.id), bar = el("span", "load" + (h > p.cap ? " is-over" : "")), fill = el("span", "load__fill"), base = el("i", "load__base"), add = el("i", "load__add");
    var all = Math.min(100, 100 * h / p.cap);
    fill.style.width = all + "%";
    base.style.flexGrow = Math.min(p.base, h); add.style.flexGrow = Math.max(0, h - p.base);
    fill.appendChild(base); fill.appendChild(add); bar.appendChild(fill);
    return bar;
  }
  // for someone over capacity: the largest task of theirs that a teammate with room could take
  function handoff(p) {
    var mine = allTasks().filter(function (t) { return t.who === p.id && t.status !== "done"; }).sort(function (a, b) { return b.hours - a.hours; });
    for (var i = 0; i < mine.length; i++) {
      var t = mine[i];
      var to = P.people.filter(function (q) { return q.id !== p.id && !q.away && freeFor(q) >= t.hours && (!SKILL[t.id] || q.skills.indexOf(SKILL[t.id]) >= 0); }).sort(function (a, b) { return freeFor(b) - freeFor(a); })[0];
      if (to) return { t: t, to: to };
    }
    return null;
  }
  function renderTeam() {
    var here = P.people.filter(function (p) { return !p.away; }), away = P.people.length - here.length;
    var free = here.reduce(function (s, p) { return s + Math.max(0, p.cap - hoursOf(p.id)); }, 0);
    $("team-note").textContent = cap(words(here.length, "person", "people")) + " working this week" + (away ? " and " + WORDS[away] + " away" : "") + ", with " + free + " hours free between them.";
    var box = byId("roster"); box.textContent = "";
    P.people.forEach(function (p) {
      var h = hoursOf(p.id), mine = allTasks().filter(function (t) { return t.who === p.id && t.status !== "done"; });
      var li = el("li");
      var b = el("button", { type: "button", class: "mate" + (st.member === p.id ? " is-on" : "") + (p.away ? " is-away" : "") + (h > p.cap ? " is-over" : ""), "aria-pressed": String(st.member === p.id) });
      var top = el("span", "mate__top");
      top.appendChild(avatar(p));
      var nm = el("span", "mate__name"); nm.appendChild(el("b", null, isMe(p.id) ? p.name + " (you)" : p.name)); nm.appendChild(el("span", null, p.role)); top.appendChild(nm);
      b.appendChild(top);
      b.appendChild(loadBar(p));
      var hr = el("span", "mate__hrs");
      hr.appendChild(el("b", null, p.away ? "Away" : h + " of " + p.cap + " h"));
      hr.appendChild(el("span", null, p.away ? p.away.replace(/^On leave /, "Leave ") : plural(mine.length, "task")));
      b.appendChild(hr);
      b.addEventListener("click", function () { st.member = p.id; render(); });
      li.appendChild(b);
      box.appendChild(li);
    });
    renderMember();
    var gb = byId("gaps"); gb.textContent = "";
    P.gaps.forEach(function (g, i) {
      var li = el("li", "gap" + (st.planned[i] ? " is-planned" : ""));
      li.appendChild(el("span", st.planned[i] ? "pill" : "pill pill--amber", st.planned[i] ? "Covered" : "One person deep"));
      var t = el("div", "gap__words"); t.appendChild(el("p", null, g.text));
      t.appendChild(el("p", "gap__fix", (st.planned[i] ? "Planned: " : "Cover: ") + g.fix + " (" + first(g.who) + ", " + dayLow(g.day) + ", " + g.hours + " h)."));
      li.appendChild(t);
      if (st.planned[i]) li.appendChild(button("Undo", "btn-q", function () { removeTask(st.planned[i]); delete st.planned[i]; changed(); }));
      else li.appendChild(button("Plan the cover", "btn-q", function () { st.planned[i] = addTask(g.fix, g.who, g.day, g.hours); DB.toast("Added a task for " + first(g.who) + "."); changed(); }));
      gb.appendChild(li);
    });
  }
  function renderMember() {
    var box = byId("member"), p = person(st.member), h = hoursOf(p.id); box.textContent = "";
    var head = el("div", "member__head");
    head.appendChild(avatar(p, "av--lg"));
    var t = el("div"); t.appendChild(el("h3", "member__name", p.name)); t.appendChild(el("p", "member__role", p.role + ". " + p.shift + ", " + p.place + ".")); head.appendChild(t);
    box.appendChild(head);
    var dl = el("dl", "facts");
    function fact(k, v) { var d = el("div"); d.appendChild(el("dt", null, k)); d.appendChild(el("dd", null, v)); dl.appendChild(d); }
    fact("This week", p.away ? p.away : h + " of " + p.cap + " h, " + p.base + " h of it routine work");
    fact("Certified for", p.skills.join(", "));
    fact("Covers for them", p.backup ? person(p.backup).name : "Nobody yet");
    box.appendChild(dl);
    if (!p.away && h > p.cap) {
      var o = el("div", "member__over");
      o.appendChild(el("p", null, plural(h - p.cap, "hour") + " over capacity this week."));
      var s = handoff(p);
      if (s) {
        o.appendChild(el("p", "member__sugg", "Totality suggests handing “" + s.t.text + "” (" + s.t.hours + " h) to " + s.to.name.split(" ")[0] + ", who has " + freeFor(s.to) + " h free."));
        o.appendChild(button("Hand it to " + s.to.name.split(" ")[0], "btn btn--primary btn--sm", function () { handTo(s.t, s.to.id); }));
      } else o.appendChild(el("p", null, "Nobody with room is certified for the rest of " + p.name.split(" ")[0] + "’s work this week."));
      box.appendChild(o);
    }
    var mine = allTasks().filter(function (x) { return x.who === p.id && x.status !== "done"; }).sort(function (a, b) { return a.day - b.day; });
    box.appendChild(el("p", "member__h", mine.length ? "On " + (isMe(p.id) ? "your" : p.name.split(" ")[0] + "’s") + " plate" : "Nothing on " + (isMe(p.id) ? "your" : p.name.split(" ")[0] + "’s") + " plate from these directives"));
    if (mine.length) {
      var ul = el("ul", "member__tasks");
      mine.forEach(function (x) {
        var li = el("li");
        li.appendChild(button(x.text, "member__go", function () { flash("task-" + x.id); }));
        li.appendChild(el("span", "pill" + (x.status === "blocked" ? " pill--amber" : ""), STATUS[x.status] + ", " + dayLow(x.day)));
        ul.appendChild(li);
      });
      box.appendChild(ul);
    }
  }

  /* ================= 5. What could change the week ================= */
  // where the early signal sits against its trigger
  function signalState(w) {
    var s = w.signal;
    if (s.dir === "event") return { rank: 0, gap: 9, cls: "", label: "Watching", short: s.status, text: s.text + ": " + s.status.toLowerCase() };
    var hit = s.dir === "below" ? s.now <= s.at : s.now >= s.at, gap = Math.abs(s.now - s.at) / Math.max(1, Math.abs(s.at));
    var rank = hit ? 3 : gap < 0.1 ? 2 : 1;
    return { rank: rank, gap: gap, cls: rank === 3 ? "pill--red" : rank === 2 ? "pill--amber" : "", label: rank === 3 ? "Triggered" : rank === 2 ? "Close to its trigger" : "Watching",
      short: s.now + s.unit.replace(/ a week| a truck| of normal/, ""), text: s.text + " at " + s.now + s.unit + ", against a trigger " + (s.dir === "below" ? "below " : "above ") + s.at + s.unit };
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
  function renderWatch() {
    var threats = P.watch.filter(function (w) { return w.kind === "threat"; }).length;
    $("watch-note").textContent = cap(words(threats, "threat")) + " and " + words(P.watch.length - threats, "opportunity", "opportunities") + " that would land on your team, each with an early signal and a playbook.";
    var box = byId("watch-list"); box.textContent = "";
    box.style.setProperty("--n", P.watch.length);
    P.watch.forEach(function (w) {
      var s = signalState(w), r = readiness(w), on = st.watch === w.id;
      var b = el("button", { type: "button", role: "tab", "aria-selected": String(on), class: "wi" + (on ? " is-on" : "") });
      var top = el("span", "wi__top");
      top.appendChild(el("span", "pill" + (w.kind === "opportunity" ? " pill--red" : ""), w.kind === "threat" ? "Threat" : "Opportunity"));
      top.appendChild(el("span", "pill " + (st.active[w.id] ? "pill--red" : s.cls), st.active[w.id] ? "Playbook running" : s.label));
      b.appendChild(top);
      b.appendChild(el("b", "wi__title", w.title));
      var row = el("span", "wi__row");
      if (w.pn != null) { row.appendChild(el("span", "wi__p", w.pn + "%")); }
      if (w.trend) row.appendChild(spark(w.trend));
      b.appendChild(row);
      b.appendChild(el("span", "wi__lab", w.p));
      b.appendChild(el("span", "wi__ready", r.n === r.of ? "Playbook ready" : r.n + " of " + r.of + " steps ready"));
      b.addEventListener("click", function () { if (st.watch !== w.id) { st.watch = w.id; render(); } });
      box.appendChild(b);
    });
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
    left.appendChild(el("p", "play__kind", (w.kind === "threat" ? "Threat" : "Opportunity") + (w.pn != null ? ", " + w.pn + "% " + w.p.charAt(0).toLowerCase() + w.p.slice(1) : ", " + w.p.charAt(0).toLowerCase() + w.p.slice(1))));
    left.appendChild(el("h3", "play__title", w.title));
    left.appendChild(el("p", "play__impact", w.impact));
    // the early signal against its trigger
    var sig = el("div", "signal");
    var sl = el("p", "signal__k"); sl.appendChild(el("span", null, "Early signal")); sl.appendChild(el("span", "pill " + s.cls, s.label)); sig.appendChild(sl);
    sig.appendChild(el("p", "signal__t", w.signal.dir === "event" ? w.signal.text + ": " + w.signal.status.toLowerCase() + "." : s.text + "."));
    if (w.signal.dir !== "event") {
      var lo = Math.min(w.signal.now, w.signal.at), hi = Math.max(w.signal.now, w.signal.at), span = (hi - lo) || 1, pad = span * 0.6, a = lo - pad, z = hi + pad;
      var X = function (v) { return (100 * (v - a) / (z - a)).toFixed(1) + "%"; };
      var m = el("div", { class: "signal__meter", role: "img", "aria-label": s.text });
      var zone = el("i", "signal__zone");
      if (w.signal.dir === "below") { zone.style.left = "0"; zone.style.width = X(w.signal.at); } else { zone.style.left = X(w.signal.at); zone.style.right = "0"; }
      m.appendChild(zone);
      var trig = el("i", "signal__trig"); trig.style.left = X(w.signal.at); m.appendChild(trig);
      var now = el("i", "signal__now" + (s.rank === 3 ? " is-hit" : "")); now.style.left = X(w.signal.now); m.appendChild(now);
      sig.appendChild(m);
      var legend = el("p", "signal__legend");
      // labels in the same left-to-right order as the marks
      [[w.signal.now, "Now " + w.signal.now + w.signal.unit, "now"], [w.signal.at, "Trigger " + w.signal.at + w.signal.unit, "trig"]].sort(function (x, y) { return x[0] - y[0]; })
        .forEach(function (x, i) { var sp = el("span", "signal__" + x[2] + "-k" + (i ? " is-r" : ""), x[1]); sp.style.left = X(x[0]); legend.appendChild(sp); });
      sig.appendChild(legend);
    }
    left.appendChild(sig);
    box.appendChild(left);

    var right = el("div", "play__steps");
    var sh = el("div", "play__h");
    sh.appendChild(el("h4", null, w.kind === "threat" ? "If It Happens" : "To Take It"));
    sh.appendChild(el("span", null, r.n + " of " + r.of + " steps ready"));
    right.appendChild(sh);
    var ol = el("ol", "steps");
    var prep = st.prepared[w.id] || (st.prepared[w.id] = {});
    w.steps.forEach(function (step, i) {
      var li = el("li", "step" + (prep[i] ? " is-ready" : ""));
      li.appendChild(avatar(person(step[1]), "av--sm"));
      var t = el("div", "step__txt"); t.appendChild(el("b", null, step[0])); t.appendChild(el("span", null, (isMe(step[1]) ? "You" : person(step[1]).name) + ", about " + step[2] + " h")); li.appendChild(t);
      if (prep[i]) li.appendChild(el("span", "pill", "Ready"));
      else li.appendChild(button("Get ready", "btn-q btn-q--sm", function () {
        prep[i] = addTask("Get ready to " + step[0].charAt(0).toLowerCase() + step[0].slice(1), step[1], 2, 1);
        DB.toast("Added a prep task for " + first(step[1]) + ".");
        changed();
      }));
      ol.appendChild(li);
    });
    right.appendChild(ol);
    var acts = el("div", "play__acts");
    if (st.active[w.id]) {
      acts.appendChild(el("p", "play__running", "Running: " + plural(w.steps.length, "task") + " handed out under From Leadership."));
      acts.appendChild(button("See the tasks", "btn-q", function () { flash("dir-play-" + w.id); }));
    } else {
      acts.appendChild(button(w.kind === "threat" ? "Run the playbook" : "Act on it now", "btn btn--primary btn--sm", function () {
        st.active[w.id] = { at: "07:10 GST", ids: w.steps.map(function (step, i) { return addTask(step[0], step[1], i < 2 ? 0 : 1, step[2], []); }) };
        DB.toast((w.kind === "threat" ? "Playbook running. " : "On it. ") + plural(w.steps.length, "task") + " handed out.");
        changed();
        setTimeout(function () { flash("dir-play-" + w.id); }, 80);
      }));
    }
    right.appendChild(acts);
    box.appendChild(right);
    // a new threat or opportunity: the panel eases to its new height and its contents fade up
    if (swap && !REDUCE && box.animate) {
      var h1 = box.offsetHeight;
      box.style.overflow = "hidden";
      box.animate([{ height: h0 + "px" }, { height: h1 + "px" }], { duration: 340, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)" }).onfinish = function () { box.style.overflow = ""; };
      [left, right].forEach(function (x, i) { x.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 320, delay: i * 50, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)", fill: "backwards" }); });
    }
  }

  /* ================= 6. Your update ================= */
  var upText = byId("update-text");
  function draft() {
    var L = ["Hi " + P.boss.first + ",", "", "Where the team stands this morning, Tuesday, October 6:", ""];
    st.dirs.forEach(function (d) {
      var ts = d.taskIds.map(function (id) { return st.tasks[id]; }).filter(Boolean);
      var done = ts.filter(function (t) { return t.status === "done"; }).length, doing = ts.filter(function (t) { return t.status === "doing"; }).length;
      var next = ts.filter(function (t) { return t.status !== "done"; }).sort(function (a, b) { return a.day - b.day; })[0];
      var line = d.title + ": " + done + " of " + ts.length + " tasks done" + (doing ? ", " + doing + " in progress" : "") + ".";
      if (next) line += " Next: " + next.text.charAt(0).toLowerCase() + next.text.slice(1) + " (" + (isMe(next.who) ? "me" : person(next.who).name.split(" ")[0]) + ", " + dayLow(next.day) + ").";
      L.push(line);
      ts.filter(function (t) { return t.status === "blocked"; }).forEach(function (t) {
        L.push("  Stuck: " + t.blocker + (st.escalated[t.id] ? " Could you help unblock this?" : ""));
      });
    });
    P.watch.forEach(function (w) { if (st.active[w.id]) L.push((w.kind === "threat" ? "Running the playbook for “" : "Acting on “") + w.title + "”."); });
    var made = P.decisions.filter(function (d) { return st.decided[d.id] != null; }), open = P.decisions.filter(function (d) { return st.decided[d.id] == null; });
    if (made.length) { L.push("", "Decided today:"); made.forEach(function (d) { L.push("- " + d.q.replace(/\?$/, "") + ": " + d.opts[st.decided[d.id].i].t.charAt(0).toLowerCase() + d.opts[st.decided[d.id].i].t.slice(1) + "."); }); }
    if (open.length) { L.push("", "Still to decide:"); open.forEach(function (d) { L.push("- " + d.q.replace(/\?$/, "") + " (by " + dayLow(d.due[0], d.due[1]) + ")."); }); }
    var watching = P.watch.map(function (w) { return { w: w, s: signalState(w) }; }).filter(function (x) { return x.s.rank >= 2 && !st.active[x.w.id]; });
    if (watching.length) { L.push("", "Watching closely:"); watching.forEach(function (x) { var r = readiness(x.w); L.push("- " + x.w.title + ". " + x.s.text + ". Playbook " + r.n + " of " + r.of + " steps ready."); }); }
    var gaps = P.gaps.filter(function (g, i) { return !st.planned[i]; });
    if (gaps.length) { L.push("", "Gaps I’m covering:"); gaps.forEach(function (g) { L.push("- " + g.text); }); }
    var over = P.people.filter(function (p) { return !p.away && hoursOf(p.id) > p.cap; });
    if (over.length) L.push("", "Capacity: " + over.map(function (p) { return p.name.split(" ")[0] + " is " + (hoursOf(p.id) - p.cap) + " h over"; }).join("; ") + " this week.");
    L.push("", P.first);
    return L.join("\n");
  }
  function renderUpdate() {
    $("up-note").textContent = "A draft for " + P.boss.name + ", written from this page and kept current as it changes until you edit it.";
    $("update-to").textContent = "To " + P.boss.name + ", " + P.boss.role + (st.sent ? ". Sent at 07:10; send again to share the latest." : "");
    if (st.autodraft) upText.value = draft(); else upText.value = st.draft;
    byId("update-send").textContent = st.sent ? "Send again" : "Send to " + P.boss.first;
  }
  upText.addEventListener("input", function () { st.draft = upText.value; st.autodraft = false; });
  byId("update-redraft").addEventListener("click", function () { st.draft = null; st.autodraft = true; renderUpdate(); DB.toast("Redrafted from the page."); });
  byId("update-copy").addEventListener("click", function () {
    if (navigator.clipboard) navigator.clipboard.writeText(upText.value).then(function () { DB.toast("Copied."); }, function () { DB.toast("Couldn’t reach the clipboard."); });
  });
  byId("update-send").addEventListener("click", function () { st.sent = true; renderUpdate(); DB.toast("Sent to " + P.boss.name + "."); });

  /* ================= 7. You might also ask ================= */
  function renderAsks() {
    var box = byId("asks"); box.textContent = "";
    P.asks.forEach(function (a) {
      var li = el("li"), link = el("a", { class: "ask-q", href: "ask.html?q=" + encodeURIComponent(a[1]) });
      link.appendChild(el("span", "ask-q__kind", a[0])); link.appendChild(el("span", "ask-q__text", a[1]));
      li.appendChild(link); box.appendChild(li);
    });
  }

  /* ================= Render ================= */
  // a short name for each decision on the week strip
  var SHORTS = { "kf-slots": "Khor Fakkan slots", yard: "early yard release", nights: "Saturday night overtime", surcharge: "AE7 surcharge",
    offspec: "high-melt resin lot", saturday: "Saturday Line 2 shift", maint: "Line 1 maintenance", warn: "warning Al Noor", discount: "fridge discount", ramadan: "Ramadan promotion" };
  Object.keys(PERSONAS).forEach(function (k) { PERSONAS[k].decisions.forEach(function (d) { d.short = SHORTS[d.id]; }); });
  function render() {
    renderHead(); renderBottom(); renderWeek(); renderDecisions(); renderDirectives(); renderTeam(); renderWatch(); renderUpdate(); renderAsks();
  }

  // arriving from the brief: open the team that carries out that decision and pick out its part
  var q = new URLSearchParams(window.location.search), FROM = { divert: ["farah", "divert"], cover: ["farah", "cover"], bridge: ["elif", "bridge"] };
  var as = q.get("as"), dir = FROM[q.get("directive")];
  var saved = null; try { saved = localStorage.getItem("daybreak.team.as"); } catch (e) {}
  persona(dir ? dir[0] : PERSONAS[as] ? as : PERSONAS[saved] ? saved : "farah");
  render();
  requestAnimationFrame(function () { requestAnimationFrame(function () { byId("mgrs").classList.add("is-ready"); }); });
  // figures count in and bars grow the first time each section scrolls into view; later redraws stay put
  CountIn(".rides__v, .odds__p");
  Reveal("#bottom-line, #leadership, #team, #watch", 0.15);
  if (dir) setTimeout(function () { flash("dir-" + dir[1]); DB.toast("From this morning’s brief: " + P.first + "’s part."); }, 350);
})();
