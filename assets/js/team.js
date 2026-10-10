/* Team: Daybreak for the people who carry decisions out. One manager's week: the calls that are
   theirs to make, leadership's directives broken into their team's tasks, who has room, what to
   watch and how the team adapts, and the update that goes back up. Three managers to view as.
   Today is Tue 6 Oct, the morning of the brief; day 0 below is today. Every figure is illustrative. */
(function () {
  var DAYS = ["Tue 6 Oct", "Wed 7 Oct", "Thu 8 Oct", "Fri 9 Oct", "Sat 10 Oct", "Sun 11 Oct", "Mon 12 Oct"];
  var SHORT = ["Today", "Tomorrow", "Thu", "Fri", "Sat", "Sun", "Mon"];

  // tasks: [id, text, who, day, hours, status, blocker]; decisions' options can finish a task (done) or add one (add)
  var PEOPLE_FIELDS = ["id", "name", "role", "shift", "place", "base", "cap", "skills", "away", "backup"];
  function people(rows) { return rows.map(function (r) { var o = {}; PEOPLE_FIELDS.forEach(function (k, i) { o[k] = r[i]; }); return o; }); }
  function tasks(rows) { return rows.map(function (r) { return { id: r[0], text: r[1], who: r[2], day: r[3], hours: r[4], status: r[5] || "todo", blocker: r[6] || "" }; }); }

  var PERSONAS = {
    farah: {
      first: "Farah", name: "Farah Saleh", role: "Port operations manager", team: "Port operations, UAE", dept: "Logistics",
      place: "Jebel Ali", boss: { name: "Tomas Varga", first: "Tomas", role: "VP Logistics" }, short: "Port operations, UAE",
      people: people([
        ["farah", "Farah Saleh", "Port operations manager", "Days", "Jebel Ali", 30, 45, ["Berth planning", "Carrier relations"], null, null],
        ["rashid", "Rashid Al Mansoori", "Shift supervisor", "Days", "Jebel Ali", 33, 45, ["Yard planning", "Customs liaison"], null, "nadia"],
        ["nadia", "Nadia Haddad", "Shift supervisor", "Nights", "Jebel Ali", 30, 45, ["Yard planning", "Reefers"], null, "rashid"],
        ["joel", "Joel Fernandes", "Documentation lead", "Days", "Jebel Ali", 38, 45, ["Customs filings", "Bills of lading"], null, null],
        ["sanjay", "Sanjay Pillai", "Trucking coordinator", "Days", "Khor Fakkan", 26, 45, ["Haulier contracts", "Road permits"], null, null],
        ["aisha", "Aisha Karim", "Lead reach-stacker operator", "Nights", "Jebel Ali", 36, 45, ["Reach-stacker certified", "Hazmat"], null, "tariq"],
        ["tariq", "Tariq Nasser", "Reach-stacker operator", "Nights", "Jebel Ali", 0, 45, ["Reach-stacker certified"], "On leave until Sun 11 Oct", "aisha"],
        ["meilin", "Mei Lin Tan", "Operations analyst", "Days, part time", "Remote", 14, 22, ["TMS", "Reporting"], null, null]
      ]),
      gaps: [
        { text: "Only Joel can file customs entries at Khor Fakkan, and the diversion doubles his filings this week.", fix: "Have Rashid shadow Joel on Khor Fakkan filings", who: "rashid", day: 1, hours: 4 },
        { text: "Aisha is the only certified reach-stacker operator on nights until Tariq is back on Sunday.", fix: "Ask Nadia to borrow a certified operator from the day pool", who: "nadia", day: 0, hours: 1 },
        { text: "Sanjay is the only one with the Khor Fakkan hauliers' numbers.", fix: "Share the haulier contact sheet with Rashid", who: "sanjay", day: 0, hours: 1 }
      ],
      decisions: [
        { id: "kf-slots", q: "Book Khor Fakkan berth slots before Thursday's cutoff?", due: [2, "14:00"],
          context: "Leadership approved the diversion this morning. Khor Fakkan is 70% booked and won't hold slots past the cutoff.",
          opts: [{ t: "Book 4 slots", sub: "$12.8k; $1.6k a slot to cancel", done: "t-slots" }, { t: "Book 2 now, 2 on Thursday", sub: "$6.4k now; the last 2 may be gone" }, { t: "Wait for Monday's forecast", sub: "Nothing spent; likely no slots left" }],
          pick: 0, why: "The directive needs four sailings moved, and if the strait closes every Gulf shipper will want these berths. Cancelling later costs far less than missing the cutoff." },
        { id: "yard", q: "Release boxes from the Jebel Ali yard early?", due: [1, "12:00"],
          context: "212 Halvorsen boxes are in the yard. Dwell time is 71 hours and climbing; your trigger is 72.",
          opts: [{ t: "Release the 90 fast movers", sub: "The DC can take them without overtime", add: { text: "Release 90 fast-moving boxes to the Dubai DC", who: "rashid", day: 1, hours: 6 } }, { t: "Release all 212", sub: "The DC needs a Saturday shift", add: { text: "Release all 212 boxes to the Dubai DC", who: "rashid", day: 1, hours: 12 } }, { t: "Hold until Monday", sub: "Dwell keeps climbing" }],
          pick: 0, why: "Moving the fast movers clears the boxes most likely to be needed if inbound stops, without paying the DC for a weekend shift." },
        { id: "nights", q: "Approve overtime for Saturday's night gate shift?", due: [3, "17:00"],
          context: "With Tariq on leave, Aisha is the only certified operator on nights, and three vessels bunch up on Saturday.",
          opts: [{ t: "Approve 6 hours", sub: "$1.1k; two cranes all night", add: { text: "Schedule a second certified operator for Saturday night", who: "nadia", day: 3, hours: 1 } }, { t: "Move Rashid to nights", sub: "Free, but days lose a supervisor" }, { t: "Decline", sub: "One crane on Saturday night" }],
          pick: 0, why: "One crane can't turn three vessels overnight, and a missed window pushes the boxes into next week's dwell." },
        { id: "surcharge", q: "Accept the carrier's $180-a-box war-risk surcharge on AE7?", due: [1, "17:00"],
          context: "The carrier wants an answer for this week's sailing. Treasury is binding war-risk cover today.",
          opts: [{ t: "Ask Treasury first", sub: "Answer the carrier tomorrow", add: { text: "Ask Treasury whether the new cover overlaps the AE7 surcharge", who: "farah", day: 0, hours: 1 } }, { t: "Accept for this week", sub: "About $38k on this sailing" }, { t: "Push back", sub: "Risks a rolled booking" }],
          pick: 0, why: "If Treasury's cover already insures this cargo, you'd be paying twice. One message to Treasury settles it before the carrier's deadline." }
      ],
      directives: [
        { id: "divert", title: "Divert four Jebel Ali sailings to Khor Fakkan and truck the boxes to the Dubai DC", by: "Tomas Varga, VP Logistics", approved: "approved by the COO in this morning's brief",
          part: "Get every diverted box from Khor Fakkan to the Dubai DC within 36 hours of discharge.", due: 2,
          tasks: tasks([
            ["t-slots", "Book four Khor Fakkan berth slots", "farah", 2, 2],
            ["t-trucks", "Line up 14 trucks a sailing with Khor Fakkan hauliers", "sanjay", 1, 8, "doing"],
            ["t-customs", "File transit customs entries for the diverted boxes", "joel", 2, 10, "todo", ""],
            ["t-eta", "Update arrival times for 212 boxes in the TMS", "meilin", 1, 4, "done"],
            ["t-dc", "Give the Dubai DC its new arrival windows", "rashid", 1, 2],
            ["t-gate", "Brief the night shift on the new gate plan", "nadia", 2, 2]
          ]) },
        { id: "cover", title: "Bind war-risk cover on Gulf calls and hedge Q4 bunker", by: "Hanne Sørli, Group Treasurer", approved: "approved by the CFO in this morning's brief",
          part: "Give Treasury what it needs to put every Gulf call on the cover before the quote expires Wednesday.", due: 1,
          tasks: tasks([
            ["t-calls", "Send Treasury the Gulf calls for the next 30 days", "joel", 1, 3],
            ["t-hull", "Confirm each vessel's insured value with the carrier", "rashid", 1, 3, "blocked", "The carrier hasn't sent the hull value for Sable Orchid."],
            ["t-hold", "Hold the AE7 surcharge until the cover is confirmed", "farah", 1, 1]
          ]) }
      ],
      watch: [
        { id: "hormuz", kind: "threat", title: "Strait of Hormuz closes", p: "27% in 30 days", trend: [6, 9, 18, 27],
          impact: "Jebel Ali inbound drops to almost nothing, three ships are stuck inside, and the team's work moves to Khor Fakkan and Sohar overnight.",
          signal: { text: "Daily strait transits", now: 71, at: 40, unit: "% of normal", dir: "below" },
          steps: [["Switch every inbound booking to Khor Fakkan or Sohar", "farah", 3], ["Run trucks to the Dubai DC around the clock", "sanjay", 8], ["Move two operators to Khor Fakkan", "nadia", 2], ["Release every box in the Jebel Ali yard to the DC", "rashid", 10], ["Daily 07:30 call with Tomas until it reopens", "farah", 1]] },
        { id: "dwell", kind: "threat", title: "Jebel Ali yard congestion", p: "Likely within 2 weeks", trend: [48, 55, 63, 71],
          impact: "Boxes wait days for a gate slot, demurrage starts after 5 days, and the DC's stock runs down while cargo sits in port.",
          signal: { text: "Average container dwell", now: 71, at: 72, unit: " hours", dir: "above" },
          steps: [["Release fast movers to the DC early", "rashid", 6], ["Open a Saturday gate", "nadia", 6], ["Ask the DC for overflow yard space", "farah", 1]] },
        { id: "feeders", kind: "threat", title: "Sanctions hit two ME4 feeders", p: "19% in 30 days", trend: [11, 12, 16, 19],
          impact: "About 480 boxes a week bound for Dammam are held for screening, and the documentation team is buried in checks.",
          signal: { text: "Listing of the feeders' technical manager", now: 0, at: 1, unit: "", dir: "event", status: "Not yet" },
          steps: [["Pre-book slots on the rival Gulf shuttle", "sanjay", 2], ["Prepare a cargo screening checklist", "joel", 4], ["Warn the Dammam DC of a possible gap", "farah", 1]] },
        { id: "kf-room", kind: "opportunity", title: "Spare berth space at Khor Fakkan", p: "Open now, likely gone next week", trend: null,
          impact: "600 TEU a week is free and quoted 8% below Jebel Ali. Standing slots now would make the diversion cheaper and keep it open for a month.",
          signal: { text: "Free capacity at Khor Fakkan", now: 600, at: 200, unit: " TEU a week", dir: "below" },
          steps: [["Book standing slots for the next four weeks", "farah", 2], ["Negotiate the rate on a four-week commitment", "farah", 2]] },
        { id: "trucks", kind: "opportunity", title: "Truck rates on the Khor Fakkan road at a three-month low", p: "This month", trend: null,
          impact: "Locking a month of haulage now saves about $9k against spot and guarantees trucks if every shipper diverts at once.",
          signal: { text: "Spot rate, Khor Fakkan to Dubai", now: 610, at: 700, unit: " AED a truck", dir: "above" },
          steps: [["Lock a one-month haulage contract with two hauliers", "sanjay", 3]] }
      ],
      fixed: [[0, "07:30", "Team stand-up"], [1, "17:00", "War-risk quote expires (Treasury)"], [2, "14:00", "Khor Fakkan booking cutoff"], [4, "", "Three vessels due at Jebel Ali"], [5, "", "Tariq back from leave"], [6, "09:00", "Weekly review with Tomas"]]
    },

    elif: {
      first: "Elif", name: "Elif Şahin", role: "Production manager", team: "Production, Gebze plant", dept: "Plant ops, Gebze",
      place: "Gebze", boss: { name: "Murat Kaya", first: "Murat", role: "Plant director" }, short: "Gebze production",
      people: people([
        ["elif", "Elif Şahin", "Production manager", "Days", "Gebze", 32, 45, ["Line scheduling", "Lean"], null, null],
        ["kemal", "Kemal Aydın", "Line 1 supervisor, washers", "Days", "Gebze", 36, 45, ["Washer line", "Changeovers"], null, "zeynep"],
        ["zeynep", "Zeynep Kaya", "Line 2 supervisor, dishwashers", "Days", "Gebze", 34, 45, ["Dishwasher line", "Changeovers"], null, "kemal"],
        ["ozan", "Ozan Çelik", "Line 3 supervisor, dryers", "Nights", "Gebze", 38, 45, ["Dryer line"], null, null],
        ["selma", "Selma Arslan", "Materials planner", "Days", "Gebze", 37, 45, ["Resin planning", "MRP"], null, null],
        ["hakan", "Hakan Doğan", "Quality engineer", "Days", "Supplier audit, Bursa", 30, 45, ["Resin qualification", "Moulding trials"], "At a supplier audit until Thu 8 Oct", null],
        ["derya", "Derya Polat", "Maintenance planner", "Days", "Gebze", 28, 45, ["Planned maintenance", "Moulds"], null, null],
        ["burak", "Burak Aydın", "Labour relations", "Days", "Gebze", 20, 30, ["Union liaison"], null, null]
      ]),
      gaps: [
        { text: "Only Hakan can sign off a new resin grade, and he's at a supplier audit until Thursday.", fix: "Ask Hakan to approve the trial plan remotely so trials start Thursday", who: "hakan", day: 1, hours: 1 },
        { text: "Line 3 has no backup supervisor on nights if Ozan is out.", fix: "Train Zeynep's deputy on the dryer line", who: "zeynep", day: 3, hours: 6 }
      ],
      decisions: [
        { id: "offspec", q: "Accept 40 t of Singapore resin with a slightly high melt index?", due: [1, "10:00"],
          context: "The first bridge-buy lot tested inside spec for dryer drums but at the edge for washer tubs.",
          opts: [{ t: "Accept for Line 3 only", sub: "Dryers run it; washers wait for the next lot", add: { text: "Route the 40 t lot to Line 3's silo", who: "selma", day: 1, hours: 2 } }, { t: "Reject and wait", sub: "Next lot in 9 days" }, { t: "Accept for every line", sub: "Higher scrap risk on washer tubs" }],
          pick: 0, why: "Dryer drums tolerate the higher melt index, so Line 3 uses the lot safely and saves the in-spec resin for washers." },
        { id: "saturday", q: "Run Line 2 on Saturday to build dishwasher stock?", due: [2, "16:00"],
          context: "The metalworkers' contract expires 1 November and the strike risk is 18%. Leadership asked for a strike contingency.",
          opts: [{ t: "Run Saturday", sub: "$38k overtime; about 1,100 units ahead", add: { text: "Staff Line 2 for Saturday", who: "zeynep", day: 3, hours: 3 } }, { t: "Half shift on Sunday", sub: "$19k; about 550 units" }, { t: "Don't run", sub: "No stock ahead" }],
          pick: 0, why: "Each Saturday now is a day of dishwashers in the bank if talks fail, and it still uses resin before any Gulf disruption makes it scarce." },
        { id: "maint", q: "Move Line 1's planned maintenance?", due: [3, "12:00"],
          context: "Maintenance is set for Friday. Resin cover is thinnest around 15 Oct, when the line may idle anyway.",
          opts: [{ t: "Move to Thu 15 Oct", sub: "Maintain while waiting for resin", add: { text: "Re-book Line 1's maintenance crew for Thu 15 Oct", who: "derya", day: 2, hours: 2 } }, { t: "Keep Friday", sub: "Lose a full production day now" }],
          pick: 0, why: "If Line 1 is going to wait for resin around the 15th, doing maintenance then costs no output at all." }
      ],
      directives: [
        { id: "bridge", title: "Bridge-buy resin from Singapore", by: "Aylin Demir, VP Procurement", approved: "approved by the COO in this morning's brief",
          part: "Be ready to run every line on Singapore resin when it lands on day 14, with no scrap spike.", due: 3,
          tasks: tasks([
            ["e-trial", "Run a moulding trial with the Singapore grade on Line 1", "hakan", 3, 8, "blocked", "Hakan is at a supplier audit until Thursday."],
            ["e-seq", "Re-sequence the lines so Singapore resin goes to washers first", "selma", 2, 6],
            ["e-silo", "Agree silo space for 4,200 t arriving from Ambarlı", "selma", 1, 2, "doing"],
            ["e-cover", "Report resin days of cover to Murat every morning", "selma", 0, 1, "done"]
          ]) },
        { id: "strike", title: "Prepare a strike contingency for 1 November", by: "Murat Kaya, Plant director", approved: "asked of every plant manager this week",
          part: "Know exactly which work continues, which stops and in what order, before the contract expires.", due: 3,
          tasks: tasks([
            ["e-roles", "List the roles that keep running during a legal strike", "burak", 3, 4],
            ["e-ahead", "Build two days of washer stock by 30 October", "kemal", 6, 10],
            ["e-shut", "Write a safe shutdown sequence for each line", "derya", 3, 6],
            ["e-brief", "Brief supervisors on what they can say about the talks", "burak", 2, 2]
          ]) }
      ],
      watch: [
        { id: "resin", kind: "threat", title: "Resin runs out if the Strait of Hormuz closes", p: "27% in 30 days", trend: [6, 9, 18, 27],
          impact: "Jubail resin stops. With 11 days of cover, all three lines stop in week two unless the Singapore resin is qualified and flowing.",
          signal: { text: "Resin days of cover", now: 11, at: 8, unit: " days", dir: "below" },
          steps: [["Switch every line to the Singapore grade", "selma", 4], ["Cut to two shifts on Lines 1 and 2", "elif", 2], ["Pull planned maintenance into the idle days", "derya", 3]] },
        { id: "strike-w", kind: "threat", title: "Strike at the Gebze plant", p: "18% before 1 November", trend: [5, 8, 14, 18],
          impact: "Lines stop for the length of the walkout. Every day out costs about 6,200 units, and the EU washer launch slips after five days.",
          signal: { text: "Overtime refusals", now: 12, at: 20, unit: "%", dir: "above" },
          steps: [["Run the shutdown sequence line by line", "derya", 4], ["Keep the agreed essential roles staffed", "burak", 2], ["Shift EU washer orders to Pune", "elif", 3]] },
        { id: "redsea-e", kind: "threat", title: "Red Sea shuts to traffic", p: "34% in 30 days", trend: [22, 25, 31, 34],
          impact: "Resin and Bursa parts ships go round the Cape, adding 11 days to every inbound lot.",
          signal: { text: "Bab el-Mandeb transits", now: 64, at: 50, unit: "% of normal", dir: "below" },
          steps: [["Add 11 days to every inbound in the plan", "selma", 3], ["Ask Bursa for a road shipment of seat assemblies", "selma", 1]] },
        { id: "pune", kind: "opportunity", title: "Spare capacity at the Pune plant", p: "18% free this quarter", trend: null,
          impact: "Pune can take some EU washer orders, which would protect the launch if Gebze has to stop.",
          signal: { text: "Pune spare capacity", now: 18, at: 10, unit: "%", dir: "below" },
          steps: [["Agree which washer SKUs Pune could make", "elif", 3]] }
      ],
      fixed: [[0, "08:00", "Shift handover"], [2, "", "Hakan back from Bursa"], [3, "", "Line 1 maintenance (planned)"], [4, "", "Saturday shift, if approved"], [6, "10:00", "Plant review with Murat"]]
    },

    layla: {
      first: "Layla", name: "Layla Mansour", role: "Head of key accounts, GCC", team: "Key accounts, GCC", dept: "Commercial, MENA",
      place: "Dubai", boss: { name: "Karim Haddad", first: "Karim", role: "GM, MENA" }, short: "GCC key accounts",
      people: people([
        ["layla", "Layla Mansour", "Head of key accounts", "Days", "Dubai", 34, 45, ["Account strategy", "Negotiation"], null, null],
        ["omar", "Omar Farouk", "Key account manager, Al Noor Hypermarkets", "Days", "Dubai", 38, 45, ["Al Noor", "Promotions"], null, "hessa"],
        ["hessa", "Hessa Al Suwaidi", "Key account manager, Gulf Home Electronics", "Days", "Riyadh", 31, 45, ["Gulf Home", "KSA retail"], null, "omar"],
        ["ravi", "Ravi Menon", "Order desk lead", "Days", "Dubai", 40, 45, ["Order system", "Delivery promises"], null, null],
        ["lina", "Lina Aziz", "Customer service lead", "Days", "Dubai", 33, 45, ["Customer letters", "Claims"], null, null],
        ["yusuf", "Yusuf Demir", "Channel planner", "Days", "Dubai", 30, 45, ["Allocation", "Forecasting"], null, null],
        ["dana", "Dana Khoury", "Trade marketing", "Days", "Dubai", 22, 45, ["Promotions", "In-store"], "Travelling to Riyadh Wed–Thu", null]
      ]),
      gaps: [
        { text: "Only Ravi can change delivery promises in the order system, and the diversion means changing hundreds.", fix: "Give Yusuf order-system access for this month", who: "ravi", day: 0, hours: 1 },
        { text: "Al Noor and Gulf Home both have penalty clauses after 7 days short; nobody owns tracking the clock.", fix: "Make Yusuf the owner of the penalty clock", who: "yusuf", day: 0, hours: 1 }
      ],
      decisions: [
        { id: "warn", q: "Tell Al Noor Hypermarkets about possible delays now?", due: [2, "12:00"],
          context: "Al Noor's penalty clause starts after 7 days short. The diversion adds a day and a half to MENA deliveries.",
          opts: [{ t: "Call this week with a protection plan", sub: "Omar leads; you join", add: { text: "Call Al Noor's buyer with the protection plan", who: "omar", day: 2, hours: 2 } }, { t: "Send a written notice", sub: "Formal, but colder" }, { t: "Wait for a closure", sub: "No noise unless it happens" }],
          pick: 0, why: "Customers who hear early, with a plan, rarely invoke penalties. Calling first also lets Al Noor move its promotions instead of running out on shelf." },
        { id: "discount", q: "Offer 3% off to move slow fridge stock out of the Dubai DC?", due: [3, "17:00"],
          context: "Making room for diverted boxes needs 400 pallet spaces. Slow fridge SKUs take 260 of them.",
          opts: [{ t: "Offer 3% to two accounts", sub: "About $21k; frees 260 pallets", add: { text: "Offer the slow fridge SKUs at 3% off to Al Noor and Gulf Home", who: "hessa", day: 3, hours: 2 } }, { t: "Move them to the Dammam DC", sub: "Trucking cost, no discount" }, { t: "Leave them", sub: "The DC runs short of space" }],
          pick: 0, why: "Space at the DC is worth more this month than the margin on slow SKUs, and the accounts get a deal before any shortage news." },
        { id: "ramadan", q: "Start planning the Ramadan promotion two weeks earlier?", due: [6, "10:00"],
          context: "Retailers are asking for earlier stock commitments. Supply may be tight in November.",
          opts: [{ t: "Bring it forward", sub: "Lock volumes before any shortage", add: { text: "Bring the Ramadan promotion plan forward two weeks", who: "dana", day: 6, hours: 6 } }, { t: "Keep the usual plan", sub: "Decide in November" }],
          pick: 0, why: "Committing volumes while stock is available protects the season's biggest promotion if Gulf supply tightens." }
      ],
      directives: [
        { id: "protect", title: "Protect GCC key accounts through the Gulf disruption", by: "Karim Haddad, GM MENA", approved: "following this morning's brief",
          part: "No key account is surprised, and none goes 7 days short on its top sellers.", due: 3,
          tasks: tasks([
            ["l-top", "Rank the top 20 SKUs for each account", "yusuf", 1, 4, "doing"],
            ["l-sub", "Agree substitution rules with each buyer", "omar", 3, 4],
            ["l-letter", "Draft the customer letter for a closure", "lina", 2, 3],
            ["l-clock", "Track days short against each penalty clause", "yusuf", 1, 2]
          ]) },
        { id: "divert-l", title: "Divert four Jebel Ali sailings to Khor Fakkan", by: "Tomas Varga, VP Logistics", approved: "approved by the COO in this morning's brief",
          part: "Every MENA delivery promise reflects the extra day and a half.", due: 2,
          tasks: tasks([
            ["l-promise", "Update delivery promises on open MENA orders", "ravi", 2, 12, "todo"],
            ["l-tell", "Tell account managers which orders move", "ravi", 2, 2]
          ]) }
      ],
      watch: [
        { id: "mena", kind: "threat", title: "MENA stock-outs if the Strait of Hormuz closes", p: "27% in 30 days", trend: [6, 9, 18, 27],
          impact: "The Dubai and Dammam DCs run dry within two weeks. Two partners can invoke penalties after 7 days short.",
          signal: { text: "Dubai DC days of cover", now: 11, at: 7, unit: " days", dir: "below" },
          steps: [["Allocate remaining stock to top SKUs by account", "yusuf", 4], ["Call every key account the same day", "layla", 3], ["Send the agreed customer letter", "lina", 2]] },
        { id: "feeders-l", kind: "threat", title: "Dammam deliveries held by feeder sanctions", p: "19% in 30 days", trend: [11, 12, 16, 19],
          impact: "Gulf Home's KSA stores lose about a week of deliveries while boxes are screened.",
          signal: { text: "Listing of the feeders' technical manager", now: 0, at: 1, unit: "", dir: "event", status: "Not yet" },
          steps: [["Warn Gulf Home's buyer", "hessa", 1], ["Serve KSA stores from Dubai by road", "ravi", 4]] },
        { id: "rival", kind: "opportunity", title: "A rival brand is short in KSA", p: "Seen in 4 of 10 store checks", trend: null,
          impact: "A competitor's washers are missing from Gulf Home shelves. Extra facings now could hold share after they recover.",
          signal: { text: "Store checks with the rival out of stock", now: 4, at: 6, unit: " of 10", dir: "above" },
          steps: [["Offer Gulf Home extra washer facings", "hessa", 2], ["Shift 300 washers to KSA", "yusuf", 2]] }
      ],
      fixed: [[0, "09:00", "Account team huddle"], [1, "", "Dana in Riyadh"], [2, "", "Dana in Riyadh"], [3, "11:00", "Gulf Home quarterly review"], [6, "10:00", "Commercial review with Karim"]]
    }
  };

  // tasks that can't start until another is done
  var AFTER = { "t-customs": "t-slots", "t-gate": "t-slots", "e-seq": "e-trial", "l-tell": "l-promise" };
  var STATUS = { todo: "To do", doing: "In progress", done: "Done", blocked: "Stuck" };
  var NEXT = { todo: "doing", doing: "done", done: "todo", blocked: "doing" };

  /* ================= State: one per manager, kept while you switch between them ================= */
  var S = {}, pid = "farah", P, st;
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function init(id) {
    if (S[id]) return S[id];
    var p = PERSONAS[id], s = { decided: {}, tasks: {}, dirs: [], own: [], prepared: {}, active: {}, planned: {}, escalated: {}, member: p.people[0].id, watch: p.watch[0].id, draft: null, sent: false, seq: 0 };
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

  /* ================= Helpers ================= */
  var $ = function (k) { return document.querySelector('[data-out="' + k + '"]'); };
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function svg(tag, attrs) { var e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function initials(n) { return n.split(" ").map(function (w) { return w.charAt(0); }).join("").slice(0, 2); }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many || one + "s"); }
  function dayText(d, time) { return (d === 0 ? "Today" : d === 1 ? "Tomorrow" : DAYS[d].split(" ")[0]) + (time ? " " + time : ""); }
  // mid-sentence: "today", "tomorrow", but weekdays keep their capital
  function dayLow(d, time) { var t = dayText(d, time); return d <= 1 ? t.charAt(0).toLowerCase() + t.slice(1) : t; }
  function firstName(id) { var p = person(id); return id === P.people[0].id ? "you" : p.name.split(" ")[0]; }
  function avatar(p, cls) { return el("span", { class: "av" + (cls ? " " + cls : ""), "aria-hidden": "true" }, initials(p.name)); }
  function button(text, cls, fn, attrs) { var b = el("button", Object.assign({ type: "button", class: cls }, attrs || {}), text); b.addEventListener("click", fn); return b; }
  function log(msg) { /* the update picks this up */ st.lastAction = msg; }
  function changed(msg) { if (msg) log(msg); render(); }

  /* ================= Page head and the persona switch ================= */
  var personaBox = document.getElementById("persona");
  function renderHead() {
    $("kicker").textContent = P.team + ", in " + P.dept + ". You report to " + P.boss.name + ", " + P.boss.role + ".";
    $("hello").textContent = "good morning, " + P.first.toLowerCase() + ".";
    personaBox.textContent = "";
    personaBox.appendChild(el("span", { class: "persona__label" }, "Viewing as"));
    Object.keys(PERSONAS).forEach(function (id) {
      var q = PERSONAS[id], on = id === pid;
      var b = el("button", { type: "button", role: "radio", "aria-checked": String(on), class: "persona__opt" + (on ? " is-on" : "") });
      b.appendChild(el("b", null, q.name)); b.appendChild(el("span", null, q.short));
      b.addEventListener("click", function () { if (id !== pid) { persona(id); render(); window.scrollTo({ top: 0, behavior: "smooth" }); } });
      personaBox.appendChild(b);
    });
  }

  /* ================= At a glance ================= */
  function renderGlance() {
    var box = document.getElementById("glance"); box.textContent = "";
    var open = P.decisions.filter(function (d) { return st.decided[d.id] == null; });
    var next = open.slice().sort(function (a, b) { return a.due[0] - b.due[0] || a.due[1].localeCompare(b.due[1]); })[0];
    var lead = [].concat.apply([], st.dirs.map(function (d) { return d.taskIds; })).map(function (id) { return st.tasks[id]; });
    var done = lead.filter(function (t) { return t.status === "done"; }).length, stuck = lead.filter(function (t) { return t.status === "blocked"; }).length;
    var here = P.people.filter(function (p) { return !p.away; });
    var h = here.reduce(function (s, p) { return s + hoursOf(p.id); }, 0), cap = here.reduce(function (s, p) { return s + p.cap; }, 0);
    var over = here.filter(function (p) { return hoursOf(p.id) > p.cap; });
    var threats = P.watch.filter(function (w) { return w.kind === "threat"; });
    var close = threats.map(function (w) { return { w: w, s: signalState(w) }; }).sort(function (a, b) { return b.s.rank - a.s.rank; })[0];
    var tiles = [
      ["dec-title", "Decisions waiting", open.length ? String(open.length) : "None", next ? "Next due: " + dayText(next.due[0], next.due[1]) : "All made for today", open.length ? "" : "is-good"],
      ["dir-title", "Leadership's tasks", done + " of " + lead.length + " done", stuck ? plural(stuck, "task") + " stuck" : "Nothing stuck", stuck ? "is-warn" : ""],
      ["team-title", "Team load this week", Math.round(100 * h / cap) + "%", over.length ? over.map(function (p) { return p.name.split(" ")[0]; }).join(" and ") + " over capacity" : plural(here.length, "person", "people") + " in, none over capacity", over.length ? "is-warn" : ""],
      ["watch-title", "Closest signal", close.w.title, close.s.text, close.s.rank >= 2 ? "is-warn" : ""]
    ];
    tiles.forEach(function (t) {
      var b = el("button", { type: "button", class: "glance__tile " + t[4] });
      b.appendChild(el("span", { class: "glance__lab" }, t[1]));
      b.appendChild(el("b", { class: "glance__val" }, t[2]));
      b.appendChild(el("span", { class: "glance__sub" }, t[3]));
      b.addEventListener("click", function () { var h2 = document.getElementById(t[0]); window.scrollTo({ top: h2.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" }); });
      box.appendChild(b);
    });
  }

  /* ================= Needs you today ================= */
  function renderDecisions() {
    var box = document.getElementById("decisions"); box.textContent = "";
    P.decisions.forEach(function (d) {
      var made = st.decided[d.id], li = el("li", { class: "dec" + (made != null ? " is-made" : ""), id: "dec-" + d.id });
      var top = el("div", { class: "dec__top" });
      top.appendChild(el("h3", { class: "dec__q" }, d.q));
      top.appendChild(el("span", { class: "pill " + (d.due[0] <= 1 ? "pill--loss" : "pill--warn") }, "Due " + dayLow(d.due[0], d.due[1])));
      li.appendChild(top);
      if (made != null) {
        var o = d.opts[made.i];
        var res = el("p", { class: "dec__made" });
        res.appendChild(el("b", null, "You chose: " + o.t + ". "));
        res.appendChild(document.createTextNode(made.note || ""));
        li.appendChild(res);
        li.appendChild(button("Change this decision", "link-btn", function () { undoDecision(d); }));
      } else {
        li.appendChild(el("p", { class: "dec__ctx" }, d.context));
        var opts = el("div", { class: "dec__opts", role: "group", "aria-label": d.q });
        d.opts.forEach(function (o, i) {
          var b = el("button", { type: "button", class: "dec__opt" + (i === d.pick ? " is-pick" : "") });
          if (i === d.pick) b.appendChild(el("span", { class: "dec__tag" }, "Daybreak suggests"));
          b.appendChild(el("b", null, o.t)); b.appendChild(el("small", null, o.sub));
          b.addEventListener("click", function () { decide(d, i); });
          opts.appendChild(b);
        });
        li.appendChild(opts);
        li.appendChild(el("p", { class: "dec__why" }, "Why: " + d.why));
      }
      box.appendChild(li);
    });
  }
  function decide(d, i) {
    var o = d.opts[i], rec = { i: i };
    if (o.done && st.tasks[o.done]) { rec.done = o.done; rec.was = st.tasks[o.done].status; st.tasks[o.done].status = "done"; rec.note = "That finishes “" + st.tasks[o.done].text + "”."; }
    else if (o.add) { rec.added = addTask(o.add.text, o.add.who, o.add.day, o.add.hours); rec.note = "Added a task for " + firstName(o.add.who) + ": “" + o.add.text + "”, due " + dayLow(o.add.day) + "."; }
    else rec.note = "Logged.";
    st.decided[d.id] = rec;
    DB.toast("Decided: " + o.t + ".");
    changed("Decided " + d.q);
  }
  function undoDecision(d) {
    var rec = st.decided[d.id];
    if (rec.done && st.tasks[rec.done]) st.tasks[rec.done].status = rec.was;
    if (rec.added) removeTask(rec.added);
    delete st.decided[d.id];
    changed();
  }

  /* ================= This week ================= */
  function renderWeek() {
    var box = document.getElementById("week"); box.textContent = "";
    DAYS.forEach(function (label, d) {
      var items = [];
      P.fixed.forEach(function (f) { if (f[0] === d) items.push({ t: f[2], time: f[1], cls: "is-event" }); });
      P.decisions.forEach(function (x) { if (x.due[0] === d && st.decided[x.id] == null) items.push({ t: "Decide: " + x.q.replace(/\?$/, ""), time: x.due[1], cls: "is-decision", go: "dec-" + x.id }); });
      allTasks().forEach(function (t) { if (t.day === d && t.status !== "done") items.push({ t: t.text + " (" + firstName(t.who) + ")", time: "", cls: t.status === "blocked" ? "is-stuck" : "is-task", go: "task-" + t.id }); });
      P.people.forEach(function (p) { if (p.away && d === 0) items.push({ t: p.name.split(" ")[0] + ": " + p.away.charAt(0).toLowerCase() + p.away.slice(1), time: "", cls: "is-away" }); });
      var li = el("li", { class: "wday" + (d === 0 ? " is-today" : "") });
      li.appendChild(el("p", { class: "wday__label" }, d === 0 ? "Today, " + label : label));
      if (!items.length) li.appendChild(el("p", { class: "wday__none" }, "Nothing due"));
      var ul = el("ul", { class: "wday__items" });
      items.sort(function (a, b) { return (a.time || "99").localeCompare(b.time || "99"); }).forEach(function (it) {
        var row = el("li", { class: "witem " + it.cls });
        if (it.time) row.appendChild(el("time", null, it.time));
        if (it.go) row.appendChild(button(it.t, "witem__go", function () { flash(it.go); }));
        else row.appendChild(el("span", null, it.t));
        ul.appendChild(row);
      });
      li.appendChild(ul);
      box.appendChild(li);
    });
  }
  function flash(id) {
    var t = document.getElementById(id); if (!t) return;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 140, behavior: "smooth" });
    t.classList.remove("is-flash"); void t.offsetWidth; t.classList.add("is-flash");
  }

  /* ================= From leadership ================= */
  var flagging = null; // the task whose "what's in the way" box is open
  function taskRow(t) {
    var li = el("li", { class: "task is-" + t.status, id: "task-" + t.id });
    var sb = button(STATUS[t.status], "task__status", function () {
      if (t.status === "blocked") { t.blocker = ""; delete st.escalated[t.id]; }
      t.status = NEXT[t.status]; changed();
    }, { "aria-label": "Status: " + STATUS[t.status] + ". Move on" });
    li.appendChild(sb);
    var body = el("div", { class: "task__body" });
    body.appendChild(el("p", { class: "task__text" }, t.text));
    var w = waitsOn(t);
    if (t.status === "blocked") {
      var bl = el("p", { class: "task__block" }, "Stuck: " + t.blocker + " ");
      if (st.escalated[t.id]) bl.appendChild(el("b", null, "Raised with " + P.boss.first + "."));
      else bl.appendChild(button("Raise it with " + P.boss.first, "link-btn", function () { st.escalated[t.id] = true; DB.toast("Added to your update for " + P.boss.first + "."); changed(); }));
      body.appendChild(bl);
    } else if (w) body.appendChild(el("p", { class: "task__wait" }, "Waits on: " + w.text + " (" + firstName(w.who) + ")"));
    if (flagging === t.id) {
      var f = el("form", { class: "task__flag" });
      var inp = el("input", { class: "num-input", type: "text", placeholder: "What's in the way?", "aria-label": "What's in the way of: " + t.text, maxlength: 140 });
      f.appendChild(inp); f.appendChild(el("button", { type: "submit", class: "btn btn--primary btn--sm" }, "Flag it"));
      f.appendChild(button("Cancel", "btn btn--ghost btn--sm", function () { flagging = null; render(); }));
      f.addEventListener("submit", function (e) { e.preventDefault(); if (!inp.value.trim()) return; t.status = "blocked"; t.blocker = inp.value.trim().replace(/\.?$/, "."); flagging = null; changed("Flagged " + t.text); });
      body.appendChild(f);
      setTimeout(function () { inp.focus(); }, 0);
    }
    li.appendChild(body);
    li.appendChild(ownerPicker(t));
    var meta = el("div", { class: "task__meta" });
    meta.appendChild(el("span", { class: "task__due" + (t.day <= 1 && t.status !== "done" ? " is-soon" : "") }, dayText(t.day)));
    meta.appendChild(el("span", { class: "task__hrs" }, t.hours + " h"));
    if (t.status !== "blocked" && t.status !== "done") meta.appendChild(button("Flag a problem", "link-btn", function () { flagging = t.id; render(); }));
    li.appendChild(meta);
    return li;
  }
  // the owner of a task: a chip that opens a menu of the team with each person's free hours
  var openPicker = null;
  function closePicker() { if (openPicker) { var o = openPicker; openPicker = null; o.close(); } }
  document.addEventListener("click", function (e) { if (openPicker && !openPicker.box.contains(e.target)) closePicker(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && openPicker) { var b = openPicker.btn; closePicker(); b.focus(); } });
  function ownerPicker(t) {
    var box = el("div", { class: "who" }), cur = person(t.who);
    var btn = el("button", { type: "button", class: "who__btn", "aria-haspopup": "listbox", "aria-expanded": "false", "aria-label": "Owner: " + (t.who === P.people[0].id ? "you" : cur.name) + ". Change who does: " + t.text });
    btn.appendChild(avatar(cur, "av--sm"));
    btn.appendChild(el("span", { class: "who__name" }, t.who === P.people[0].id ? "You" : cur.name.split(" ")[0]));
    btn.appendChild(el("span", { class: "who__caret", "aria-hidden": "true" }));
    box.appendChild(btn);
    var menu = null;
    function close() { if (menu) { menu.remove(); menu = null; } btn.setAttribute("aria-expanded", "false"); }
    function open() {
      closePicker();
      menu = el("ul", { class: "who__menu", role: "listbox", "aria-label": "Who does: " + t.text });
      P.people.forEach(function (p) {
        var left = p.cap - hoursOf(p.id) + (t.who === p.id && t.status !== "done" ? t.hours : 0), on = p.id === t.who;
        var li = el("li", { role: "option", "aria-selected": String(on), tabindex: "-1", class: "who__opt" + (on ? " is-on" : "") + (p.away ? " is-away" : left < t.hours ? " is-tight" : "") });
        li.appendChild(avatar(p, "av--sm"));
        var tx = el("span", { class: "who__txt" }); tx.appendChild(el("b", null, p.id === P.people[0].id ? "You" : p.name)); tx.appendChild(el("small", null, p.role)); li.appendChild(tx);
        li.appendChild(el("span", { class: "who__free" }, p.away ? "Away" : Math.max(0, left) + " h free"));
        function pick() { closePicker(); if (p.id === t.who) return; var from = firstName(t.who); t.who = p.id; DB.toast("Handed from " + from + " to " + firstName(p.id) + "."); changed(); }
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
  function directiveCard(d, opts) {
    opts = opts || {};
    var ts = d.taskIds.map(function (id) { return st.tasks[id]; }).filter(Boolean);
    var done = ts.filter(function (t) { return t.status === "done"; }).length, stuck = ts.filter(function (t) { return t.status === "blocked"; }).length;
    var card = el("article", { class: "panel dir" + (opts.cls ? " " + opts.cls : ""), id: "dir-" + d.id });
    var head = el("div", { class: "dir__head" });
    var hl = el("div");
    hl.appendChild(el("p", { class: "dir__by" }, d.by + (d.approved ? ", " + d.approved : "")));
    hl.appendChild(el("h3", { class: "dir__title" }, d.title));
    if (d.part) { var part = el("p", { class: "dir__part" }); part.appendChild(el("b", null, "Your team's part: ")); part.appendChild(document.createTextNode(d.part)); hl.appendChild(part); }
    head.appendChild(hl);
    var prog = el("div", { class: "dir__prog" });
    prog.appendChild(el("b", null, done + " of " + ts.length + " done"));
    var bar = el("span", { class: "meter" }); var fill = el("i"); fill.style.width = (ts.length ? 100 * done / ts.length : 0) + "%"; bar.appendChild(fill); prog.appendChild(bar);
    prog.appendChild(el("span", { class: stuck ? "is-warn" : "" }, stuck ? plural(stuck, "task") + " stuck" : d.due != null ? "Team's part due " + dayLow(d.due) : ""));
    if (opts.stop) prog.appendChild(button("Stand the playbook down", "link-btn", opts.stop));
    head.appendChild(prog);
    card.appendChild(head);
    var ul = el("ol", { class: "tasks" });
    ts.forEach(function (t) { ul.appendChild(taskRow(t)); });
    card.appendChild(ul);
    return card;
  }
  function renderDirectives() {
    var box = document.getElementById("directives"); box.textContent = "";
    st.dirs.forEach(function (d) { box.appendChild(directiveCard(d)); });
    P.watch.forEach(function (w) {
      if (!st.active[w.id]) return;
      box.appendChild(directiveCard({ id: "play-" + w.id, title: (w.kind === "threat" ? "Running the playbook: " : "Acting on: ") + w.title, by: "Started by you", part: w.impact, taskIds: st.active[w.id] }, {
        cls: "dir--play", stop: function () { st.active[w.id].forEach(removeTask); delete st.active[w.id]; changed(); }
      }));
    });
    if (st.own.length) box.appendChild(directiveCard({ id: "own", title: "Tasks you've added", by: "From your decisions, gaps and preparations", taskIds: st.own }, { cls: "dir--own" }));
  }

  /* ================= Your team ================= */
  function loadBar(p) {
    var h = hoursOf(p.id), bar = el("span", { class: "meter" + (h > p.cap ? " is-over" : "") }), base = el("i", { class: "meter__base" }), add = el("i");
    base.style.width = Math.min(100, 100 * p.base / p.cap) + "%";
    add.style.width = Math.max(0, Math.min(100, 100 * h / p.cap) - Math.min(100, 100 * p.base / p.cap)) + "%";
    bar.appendChild(base); bar.appendChild(add);
    return bar;
  }
  function renderTeam() {
    var box = document.getElementById("roster"); box.textContent = "";
    P.people.forEach(function (p) {
      var h = hoursOf(p.id), mine = allTasks().filter(function (t) { return t.who === p.id && t.status !== "done"; });
      var li = el("li");
      var b = el("button", { type: "button", class: "mate" + (st.member === p.id ? " is-sel" : "") + (p.away ? " is-away" : "") + (h > p.cap ? " is-over" : ""), "aria-pressed": String(st.member === p.id) });
      var top = el("span", { class: "mate__top" });
      top.appendChild(avatar(p, h > p.cap ? "is-over" : mine.length ? "is-busy" : ""));
      var nm = el("span", { class: "mate__name" }); nm.appendChild(el("b", null, p.id === P.people[0].id ? p.name + " (you)" : p.name)); nm.appendChild(el("span", null, p.role)); top.appendChild(nm);
      b.appendChild(top);
      b.appendChild(el("span", { class: "mate__where" }, p.away ? p.away : p.shift + ", " + p.place));
      b.appendChild(loadBar(p));
      b.appendChild(el("span", { class: "mate__hrs" }, p.away ? "Not available" : h + " of " + p.cap + " h this week" + (mine.length ? ", " + plural(mine.length, "task") : "")));
      b.addEventListener("click", function () { st.member = p.id; render(); });
      li.appendChild(b);
      box.appendChild(li);
    });
    renderMember();
    var gb = document.getElementById("gaps"); gb.textContent = "";
    P.gaps.forEach(function (g, i) {
      var li = el("li", { class: "gap" + (st.planned[i] ? " is-planned" : "") });
      li.appendChild(el("p", null, g.text));
      if (st.planned[i]) li.appendChild(el("p", { class: "gap__done" }, "Planned: " + g.fix + " (" + firstName(g.who) + ", " + dayLow(g.day) + ")."));
      else li.appendChild(button("Plan cover: " + g.fix, "btn btn--ghost btn--sm", function () { st.planned[i] = addTask(g.fix, g.who, g.day, g.hours); changed(); }));
      gb.appendChild(li);
    });
  }
  function renderMember() {
    var box = document.getElementById("member"), p = person(st.member); box.textContent = "";
    var head = el("div", { class: "member__head" });
    head.appendChild(avatar(p, "av--lg"));
    var t = el("div"); t.appendChild(el("h3", { class: "member__name" }, p.name)); t.appendChild(el("p", { class: "member__role" }, p.role + ". " + p.shift + ", " + p.place + ".")); head.appendChild(t);
    box.appendChild(head);
    if (p.away) box.appendChild(el("p", { class: "member__away" }, p.away + "."));
    var dl = el("dl", { class: "facts" });
    function fact(k, v) { var d = el("div"); d.appendChild(el("dt", null, k)); d.appendChild(el("dd", null, v)); dl.appendChild(d); }
    fact("This week", p.away ? "Away" : hoursOf(p.id) + " of " + p.cap + " h (" + p.base + " h routine work)");
    fact("Certified for", p.skills.join(", "));
    fact("Covers for them", p.backup ? person(p.backup).name : "Nobody yet");
    box.appendChild(dl);
    var mine = allTasks().filter(function (x) { return x.who === p.id && x.status !== "done"; }).sort(function (a, b) { return a.day - b.day; });
    box.appendChild(el("p", { class: "member__h" }, mine.length ? "On their plate" : "Nothing on their plate from this page"));
    if (mine.length) {
      var ul = el("ul", { class: "member__tasks" });
      mine.forEach(function (x) {
        var li = el("li");
        li.appendChild(button(x.text, "witem__go", function () { flash("task-" + x.id); }));
        li.appendChild(el("span", { class: "pill " + (x.status === "blocked" ? "pill--loss" : x.status === "doing" ? "pill--warn" : "pill--quiet") }, STATUS[x.status] + ", " + dayLow(x.day)));
        ul.appendChild(li);
      });
      box.appendChild(ul);
    }
    if (hoursOf(p.id) > p.cap) box.appendChild(el("p", { class: "member__over" }, plural(hoursOf(p.id) - p.cap, "hour") + " over this week. Hand a task to someone with room using the menus in each task."));
  }

  /* ================= What to watch ================= */
  // where the early signal sits relative to its trigger
  function signalState(w) {
    var s = w.signal;
    if (s.dir === "event") return { rank: 0, text: s.text + ": " + s.status.toLowerCase(), cls: "pill--quiet", label: "Watching" };
    var hit = s.dir === "below" ? s.now <= s.at : s.now >= s.at, gap = Math.abs(s.now - s.at) / Math.max(1, Math.abs(s.at));
    var rank = hit ? 3 : gap < 0.1 ? 2 : 1;
    return { rank: rank, cls: rank === 3 ? "pill--loss" : rank === 2 ? "pill--warn" : "pill--quiet", label: rank === 3 ? "Triggered" : rank === 2 ? "Close" : "Watching",
      text: s.text + " at " + s.now + s.unit + ", trigger " + (s.dir === "below" ? "below " : "above ") + s.at + s.unit };
  }
  function spark(trend) {
    var W = 64, H = 20, max = Math.max.apply(null, trend) * 1.1, s = svg("svg", { class: "spark", viewBox: "0 0 " + W + " " + H, "aria-hidden": "true" });
    s.appendChild(svg("path", { d: trend.map(function (v, i) { return (i ? "L" : "M") + (i * (W - 4) / (trend.length - 1) + 2).toFixed(1) + " " + (H - 2 - v / max * (H - 4)).toFixed(1); }).join(" "), class: "spark__line" }));
    var last = trend[trend.length - 1];
    s.appendChild(svg("circle", { cx: W - 2, cy: (H - 2 - last / max * (H - 4)).toFixed(1), r: 2.4, class: "spark__dot" }));
    return s;
  }
  function readiness(w) { var n = Object.keys(st.prepared[w.id] || {}).length; return { n: n, of: w.steps.length }; }
  function renderWatch() {
    var box = document.getElementById("watch"); box.textContent = "";
    P.watch.forEach(function (w) {
      var s = signalState(w), r = readiness(w), on = st.watch === w.id;
      var li = el("li");
      var b = el("button", { type: "button", role: "tab", "aria-selected": String(on), class: "wi wi--" + w.kind + (on ? " is-on" : "") });
      var top = el("span", { class: "wi__top" });
      top.appendChild(el("span", { class: "wi__kind" }, w.kind === "threat" ? "Threat" : "Opportunity"));
      top.appendChild(el("span", { class: "pill " + s.cls }, st.active[w.id] ? "Playbook running" : s.label));
      b.appendChild(top);
      b.appendChild(el("b", { class: "wi__title" }, w.title));
      var row = el("span", { class: "wi__row" });
      row.appendChild(el("span", null, w.p));
      if (w.trend) row.appendChild(spark(w.trend));
      b.appendChild(row);
      b.appendChild(el("span", { class: "wi__ready" }, r.n === r.of ? "Playbook ready" : r.n + " of " + r.of + " steps ready"));
      b.addEventListener("click", function () { st.watch = w.id; render(); });
      li.appendChild(b); box.appendChild(li);
    });
    renderPlay();
  }
  function renderPlay() {
    var box = document.getElementById("play"), w = P.watch.filter(function (x) { return x.id === st.watch; })[0]; box.textContent = "";
    var s = signalState(w), r = readiness(w);
    box.appendChild(el("p", { class: "play__kind" }, (w.kind === "threat" ? "Threat, " : "Opportunity, ") + w.p.charAt(0).toLowerCase() + w.p.slice(1)));
    box.appendChild(el("h3", { class: "play__title" }, w.title));
    box.appendChild(el("p", { class: "play__impact" }, w.impact));
    // the early signal against its trigger
    var sig = el("div", { class: "signal" });
    sig.appendChild(el("p", { class: "signal__lab" }, "Early signal. " + (w.signal.dir === "event" ? w.signal.text + ": " + w.signal.status.toLowerCase() : s.text) + "."));
    if (w.signal.dir !== "event") {
      var lo = Math.min(w.signal.now, w.signal.at), hi = Math.max(w.signal.now, w.signal.at), span = (hi - lo) || 1, pad = span * 0.6, a = lo - pad, z = hi + pad;
      var X = function (v) { return (100 * (v - a) / (z - a)).toFixed(1) + "%"; };
      var m = el("div", { class: "signal__meter", role: "img", "aria-label": s.text });
      var zone = el("i", { class: "signal__zone" });
      if (w.signal.dir === "below") { zone.style.left = "0"; zone.style.width = X(w.signal.at); } else { zone.style.left = X(w.signal.at); zone.style.right = "0"; }
      m.appendChild(zone);
      var trig = el("i", { class: "signal__trig" }); trig.style.left = X(w.signal.at); m.appendChild(trig);
      var now = el("i", { class: "signal__now " + s.cls }); now.style.left = X(w.signal.now); m.appendChild(now);
      sig.appendChild(m);
      var legend = el("p", { class: "signal__legend" });
      // labels in the same left-to-right order as the marks
      var labs = [[w.signal.now, "Now " + w.signal.now + w.signal.unit], [w.signal.at, "Trigger " + w.signal.at + w.signal.unit]].sort(function (x, y) { return x[0] - y[0]; });
      labs.forEach(function (x) { legend.appendChild(el("span", null, x[1])); });
      sig.appendChild(legend);
    }
    box.appendChild(sig);
    // the playbook
    box.appendChild(el("p", { class: "play__h" }, (w.kind === "threat" ? "If it happens, the team will" : "To take it, the team will") + " (" + r.n + " of " + r.of + " steps ready)"));
    var ol = el("ol", { class: "steps" });
    var prep = st.prepared[w.id] || (st.prepared[w.id] = {});
    w.steps.forEach(function (step, i) {
      var li = el("li", { class: "step" + (prep[i] ? " is-ready" : "") });
      var t = el("div", { class: "step__txt" }); t.appendChild(el("b", null, step[0])); t.appendChild(el("span", null, (step[1] === P.people[0].id ? "You" : person(step[1]).name) + ", about " + step[2] + " h")); li.appendChild(t);
      if (prep[i]) li.appendChild(el("span", { class: "step__ok" }, "Ready"));
      else li.appendChild(button("Get this ready", "btn btn--ghost btn--sm", function () {
        prep[i] = addTask("Get ready to: " + step[0].charAt(0).toLowerCase() + step[0].slice(1), step[1], 2, 1);
        DB.toast("Added a prep task for " + firstName(step[1]) + ".");
        changed();
      }));
      ol.appendChild(li);
    });
    box.appendChild(ol);
    var acts = el("div", { class: "play__acts" });
    if (st.active[w.id]) {
      acts.appendChild(el("p", { class: "play__running" }, "Running: the steps are in your task list under “from leadership”."));
      acts.appendChild(button("See the tasks", "btn btn--ghost btn--sm", function () { flash("dir-play-" + w.id); }));
    } else {
      acts.appendChild(button(w.kind === "threat" ? "It's happening: run the playbook" : "Act on it now", "btn btn--primary btn--sm", function () {
        st.active[w.id] = w.steps.map(function (step, i) { return addTask(step[0], step[1], i < 2 ? 0 : 1, step[2], []); });
        DB.toast((w.kind === "threat" ? "Playbook running. " : "On it. ") + plural(w.steps.length, "task") + " handed out.");
        changed("Ran the playbook for " + w.title);
        setTimeout(function () { flash("dir-play-" + w.id); }, 80);
      }));
    }
    box.appendChild(acts);
  }

  /* ================= Your update ================= */
  var upText = document.getElementById("update-text");
  upText.addEventListener("input", function () { st.draft = upText.value; });
  function draft() {
    var L = ["Hi " + P.boss.first + ",", "", "Where " + P.team + " stands this morning, " + DAYS[0] + ":", ""];
    st.dirs.forEach(function (d) {
      var ts = d.taskIds.map(function (id) { return st.tasks[id]; }).filter(Boolean);
      var done = ts.filter(function (t) { return t.status === "done"; }).length, doing = ts.filter(function (t) { return t.status === "doing"; }).length;
      var next = ts.filter(function (t) { return t.status !== "done"; }).sort(function (a, b) { return a.day - b.day; })[0];
      var line = d.title + ": " + done + " of " + ts.length + " tasks done" + (doing ? ", " + doing + " in progress" : "") + ".";
      if (next) line += " Next: " + next.text.charAt(0).toLowerCase() + next.text.slice(1) + " (" + (next.who === P.people[0].id ? "me" : person(next.who).name.split(" ")[0]) + ", " + dayLow(next.day) + ").";
      L.push(line);
      ts.filter(function (t) { return t.status === "blocked"; }).forEach(function (t) {
        L.push("  Stuck: " + t.blocker + (st.escalated[t.id] ? " Could you help unblock this?" : ""));
      });
    });
    P.watch.forEach(function (w) { if (st.active[w.id]) L.push((w.kind === "threat" ? "Running the playbook for “" : "Acting on “") + w.title + "”."); });
    var made = P.decisions.filter(function (d) { return st.decided[d.id] != null; }), open = P.decisions.filter(function (d) { return st.decided[d.id] == null; });
    if (made.length) { L.push("", "Decided today:"); made.forEach(function (d) { L.push("- " + d.q.replace(/\?$/, "") + ": " + d.opts[st.decided[d.id].i].t.toLowerCase() + "."); }); }
    if (open.length) { L.push("", "Still to decide:"); open.forEach(function (d) { L.push("- " + d.q.replace(/\?$/, "") + " (by " + dayLow(d.due[0], d.due[1]) + ")."); }); }
    var watching = P.watch.map(function (w) { return { w: w, s: signalState(w) }; }).filter(function (x) { return x.s.rank >= 2 && !st.active[x.w.id]; });
    if (watching.length) { L.push("", "Watching closely:"); watching.forEach(function (x) { var r = readiness(x.w); L.push("- " + x.w.title + ". " + x.s.text + ". Playbook " + r.n + " of " + r.of + " steps ready."); }); }
    var gaps = P.gaps.filter(function (g, i) { return !st.planned[i]; });
    if (gaps.length) { L.push("", "Gaps I'm covering:"); gaps.forEach(function (g) { L.push("- " + g.text); }); }
    var over = P.people.filter(function (p) { return !p.away && hoursOf(p.id) > p.cap; });
    if (over.length) L.push("", "Capacity: " + over.map(function (p) { return p.name.split(" ")[0] + " is " + (hoursOf(p.id) - p.cap) + " h over"; }).join("; ") + " this week.");
    L.push("", P.first);
    return L.join("\n");
  }
  function renderUpdate() {
    $("update-to").textContent = "To " + P.boss.name + ", " + P.boss.role + (st.sent ? ". Sent earlier this morning; send again to share the latest." : "");
    if (st.draft == null || st.autodraft) { upText.value = draft(); st.autodraft = true; }
    else upText.value = st.draft;
    document.getElementById("update-send").textContent = "Send to " + P.boss.first;
  }
  upText.addEventListener("input", function () { st.autodraft = false; });
  document.getElementById("update-redraft").addEventListener("click", function () { st.draft = null; st.autodraft = true; renderUpdate(); DB.toast("Redrafted from the page."); });
  document.getElementById("update-copy").addEventListener("click", function () {
    if (navigator.clipboard) navigator.clipboard.writeText(upText.value).then(function () { DB.toast("Copied."); }, function () { DB.toast("Couldn't reach the clipboard."); });
  });
  document.getElementById("update-send").addEventListener("click", function () { st.sent = true; renderUpdate(); DB.toast("Sent to " + P.boss.name + "."); });

  /* ================= Render ================= */
  function render() {
    renderHead(); renderGlance(); renderDecisions(); renderWeek(); renderDirectives(); renderTeam(); renderWatch(); renderUpdate();
  }

  // arriving from the brief: open the team that carries out that action and point at it
  var q = new URLSearchParams(window.location.search), FROM = { divert: ["farah", "divert"], cover: ["farah", "cover"], bridge: ["elif", "bridge"] };
  var as = q.get("as"), dir = FROM[q.get("directive")];
  var saved = null; try { saved = localStorage.getItem("daybreak.team.as"); } catch (e) {}
  persona(dir ? dir[0] : PERSONAS[as] ? as : PERSONAS[saved] ? saved : "farah");
  render();
  if (dir) setTimeout(function () { flash("dir-" + dir[1]); DB.toast("From this morning's brief: here's " + P.first + "'s part."); }, 250);
})();
