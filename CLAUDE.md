# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Decision Model UI v2 is a clickable mockup for **Penumbra** (renamed 2026-10-16; earlier the company was ByNine and,
until 2026-10-13, Daybreak), a geopolitical decision model. Its forecasting model is the **Totality engine**.
The demo client is Halvorsen Group, a fictional Fortune 500 appliance maker, facing a
Strait of Hormuz closure. It is plain static HTML/CSS/JS: no framework, no build step and
no tests. To preview, open `index.html` in a browser; there's no server.

## Architecture

- Pages: `index.html` (landing), `briefing.html` (daily brief), `memo.html` ("sample memo"), `team.html` ("workflows" in the nav; team workflows for middle
  managers), `workbench.html` (world-model editor for data/IT), `agents.html` (Penumbra steering a team's agents) and `ask.html` (chat). `wargame.html` is only a
  redirect to `team.html`; the wargame it used to hold was replaced.
- Product pages (`t-night`, defined in `app.css`) share the landing's structure, but each page has its own small
  palette taken from its sky (the user found a tour-wide five-hue scheme incoherent and not very informative,
  2026-10-16): `--accent` (controls, selection, the lit answer, anything good: protected money, done, healthy),
  `--good` (a paler accent for good beside the accent), `--alert` (money at risk, losses, overload, late),
  `--alert-2` (softer warnings); alerts sit next to the sky's hue rather than opposite it (the user found
  orange-on-blue and red-on-green harsh), and moonlight for everything else ("yours", e.g. your plan in a chart, is plain
  white). Brief `sky-warm`: amber / pale gold / coral. Memo `sky-green` (green nebula, green-black ground): mint / pale mint / honey-gold pastel (a warm gold: a greener gold read as chartreuse against the green sky). Workflows
  `sky-plum`: violet / lilac / red-rose. Workbench (the defaults): blue / pale cyan / orchid. Ask
  `sky-violet`: periwinkle / pale periwinkle / pink. The older names the page rules use (`--blue`, `--teal`,
  `--rose`, `--gold`, `--violet`, `--ember`, `--safe`, `--loss` ...) are aliases redefined on `.t-night`, and tints
  are `color-mix()` of the tokens, so a page's palette is four values on its `sky-*` class. bench.js sets SVG colors
  through `style` (attributes can't read var()).
  Ground: deep blue-black (`#070a14`) under a nebula haze and stars (`space.js`), dark glass cards (`--card`,
  70% over a blur so the haze shows softly through), moonlight type with `--moon-3` a step lighter than the
  landing's so labels hold 4.5:1 over bright haze, solid hairlines, no pins, tilts, cargo tags or dashes. Maps:
  the workbench's is navy sea `#122042`, slate land `#3a4763` with `#56658a` coasts, labels in moonlight on navy
  halos; the brief's is a warm paper chart as on the Daybreak brief (parchment sea `#dccdb8`, sand land `#c9ae8c`, ink
  labels, dimmed a step at the user's request, deeper loss and safe shades scoped to `.map__svg`). The user found black-on-gray maps unreadable. `.instrument` is only for code, a step darker than the panels.
  Card states (audit 2026-10-16): off, unselected or muted cards keep the dark `--card` glass and dim their text
  (`> * { opacity: 0.6 }`); never a white film (`rgba(236,238,242,.05)`) or a faded whole card, which the haze turns
  milky. Selection is an accent tint (`--card-on`), hover `--card-hover`. Notes that sit on the sky (`.section__note`)
  carry a dark halo; small analytic type goes in glass.
- `assets/css/base.css` holds shared tokens (the Penumbra palette; the old dawn names such as `--dawn`, `--ember`,
  `--paper` are aliases onto it) and components, including the logo mark (`.logo`); `app.css` the product-page
  chrome, and `landing.css`, `brief.css`, `memo.css`, `team.css`, `bench.css` and `ask.css` are per page.
- `assets/js/model.js` is the single source of truth for every loss figure. The
  ask page and workbench run it live. The brief's numbers are static but were computed from
  it, so if you change `BASE`, recompute and update `briefing.html`. Money is in $M.
- `assets/js/space.js` draws the product pages' sky (`Space.stars()`): a nebula haze (`.haze`: the landing's
  domain-warped fractal noise with dark dust lanes, painted once at 200px wide, stretched to 110vw x 150vh and
  blurred; it slides up a third of a screen over the page's scroll) under a starfield that twinkles and drifts
  slightly (~15fps, paused when hidden). Both still under reduced motion. Each page has its own sky in `SKIES`
  (seed, color ramp, peak opacity, gamma), every one rendered against stand-in cards before it was chosen: the brief
  warm amber-orange (first light; gamma 1.35 so only dense cores glow, since thin orange reads brown), the memo green, workflows violet with red running through it (`sky-plum`: plum-black ground), the workbench blue and cyan, ask violet and blue and the
  quietest. Only the sky changes per page; the data colors mean the same thing everywhere. The brief's body also
  has `sky-warm`: warm-black ground and neutral glass. It replaced the dawn site's drifting clouds (`sky.js`).
- `briefing.html` + `assets/css/brief.css` + `assets/js/brief.js`, the daily brief for the COO (Tue Oct 6), rebuilt from the
  ground up in the house style on 2026-11-07 (body `app house brief-page`, no sky or space.js; the dark brief is in git
  history): a serif title-case head with a one-sentence lede; the stakes as one white card (the chance with a sparkline that
  draws in, the loss if we do nothing in red with its causes in steps of red, the loss if we act with net value protected in
  a cream panel); numbered sections with the number in the margin: 1 the week's deadlines as a strip, then the three
  decisions as white cards (Approve turns ink and swaps the deadline pill for "Approved, owner notified"; "See the team's
  part" opens team.html?directive=); 2 the map in the report's colors (sand sea, white land, red for what's trapped, the Hormuz danger zone ringed and pulsing paler to deeper red like the memo's error band, ink
  diversion routes that light from the route cards) beside the losses table, grouped by orders or products on a cream track
  with a sliding white pill, and the ways around as white cards, the recommended one lifted; 3 the engine parts as tiles
  (declined hatched, the fused 27% lifted in red) and the waterfall and signposts in one card; 4 three horizon cards. Its
  figures still come from model.js; keep them in sync with the workbench, workflows, and agents pages.
- `memo.html` + `assets/js/memo.js` (since 2026-11-06 in the house style like the Red Sea report: body `app house memo-page`,
  no sky, the house layer at the end of memo.css; serif title-case headings with section numbers in the margin and the note
  beneath, white cards with cream panels, red for risk and what pushes the odds up, amber for where interests pull apart,
  confidence pills color coded, the odds' error band pulsing in color, paler to deeper red (a pulse in width was undone), the declined part hatched, the plan picker a track with a white pill that slides between plans, red Gantt bars)
  is a sample strategic options memo, dated Wed 7 Oct, answering the CEO's
  "How should we respond to the potential of new sanctions by the Trump Administration?" Static HTML holds the bottom
  line (key judgments with confidence, 41% ±7 by 6 Dec on an estimative-words scale) and the drivers tug-of-war
  (22% on 1 Aug, +24/−5, 41% today); `memo.js` renders the rest from data: `INTERESTS`, `OPTIONS` (cost, expected
  value protected at P = 0.41, pros/cons, a fit per interest), `PLANS` (week-grid Gantt steps, decision points,
  tripwires), `TRENDS` (three weekly line charts with hover readouts) and `ASKS`, which open `ask.html?q=` with the
  question typed in. Choices persist in localStorage (`daybreak.memo.choice`). It reuses the brief's resin, Dubai
  and feeder exposures and the 29 Sep talks collapse, so keep those in sync.
- `ask.html` (fifth tab, `assets/css/ask.css`, body `app house ask-page` since 2026-11-06: the house layer at the end of
  ask.css; serif title-case headline, white starters, assumptions, user bubbles and composer, Penumbra's speaker mark a
  plain dark disc, the send button and a reply's first action red, follow-ups soft cream; one centred column: before the
  first question the headline, lede and a larger question box sit mid-screen with the suggested questions (`STARTERS`, ten,
  each answerable) drifting past beneath in two opposite rows like a news chyron, paused under the pointer; the old
  "Assuming" panel is now the top of the settings sheet, "The situation behind each answer", with its reset and
  workbench link, and standing questions sit at the sheet's foot; near the top of the page the sheet opens downward)
  is the "ask the model" chat. `assets/js/chat.js`
  answers scripted intents (capacity, what-if, best move, forecast, signposts, decline) live from `model.js`.
  The assumed scenario is kept in `sessionStorage["daybreak.scenario"]`; its "Explore in the workbench" button links out.
  Question options (slider button in the composer, `#qopts`): how often it runs (`CADENCE`, with stop and notify
  rules), resolution criteria (text, resolve-by date, source of truth, a suggested wording), and extra documents
  (names only; read in the browser) plus connected `SOURCES`. Active options show as chips, travel with the
  message as tags, add a `.track` card to the reply, and recurring questions list under "Standing questions".
- `team.html` + `assets/js/team.js` is Penumbra for the people who carry decisions out. `PERSONAS` holds three
  managers (Farah, port operations; Elif, Gebze production; Layla, GCC key accounts), switched under "Viewing as"
  and remembered in localStorage. Each has `people` (role, shift, base hours, cap, skills, away, backup), `gaps`,
  `decisions` (options can finish a task or add one), `directives` from leadership broken into `tasks`
  (status, owner, day, hours, blocker; `AFTER` holds dependencies), `watch` items (threats and opportunities with
  an early `signal` against its trigger and playbook `steps`), and `fixed` calendar events. Day 0 is Tue 6 Oct,
  the morning of the brief. State is per manager (`S[pid]`); everything re-renders from it, including the drafted
  update to their boss. The brief's "See the team's part" opens `team.html?directive=bridge|divert|cover`.
- `workbench.html` + `assets/js/bench.js` follows one decision through six stages, with a sticky "thread" strip
  showing each stage's live result: 1 Forecast (each event's sub-questions per engine, declined part, fused
  probability ±band, override), 2 Contingencies (the `events` data: include, severity, assets hit first),
  3 Impact (a dark map in the brief's style, Türkiye to Korea, drawn by `drawMap()` from `GEO` lon/lat and sea-lane
  waypoints in `LANES`, with an enlarged Gulf inset; land comes from `assets/js/bench-map.js`, generated by
  `tools/bench-map.py`; then exact `stats(A)` over event combinations: money, operations, customers, people and `TRIGGERS`
  commitments; `reach()` propagates hits down asset dependencies, price events with `cost: true` don't spread),
  4 Decide (`ACTIONS` with value/net, and the "best plan at every budget" chart of staffable plans valued in full), 5 Deliver (team board; each team's people from `PEOPLE`,
  each action's way, crew and start; `CAPACITY` is kept in the engine but has no control), 6 Consequences (the stage 3 figures for
  doing nothing against the plan as delivered). `readiness()` splits an action's hours across its crew in proportion
  to free hours; overload stretches lead time, lateness and a scaled-back way cut its protection `f`, and
  `delivered()` blends that shortfall into every figure. A followed event (`focus`) carries through the stages.
  "Your model and data" is a separate mode: network, asset register (edit `PROPS`), teams (edit people's free hours)
  data (CSV, signals, sources, SDK) and the change log. "Reset to baseline" sits at the left of every stage's footer (scenario mode only); after a reset it reads
  "Reset" with a tick until the next change (`justReset`, cleared in `changed()`); committing
  happens from the foot of Consequences. Hormuz/Red Sea losses come from `model.js`; other events are layered on in
  `lossOf()`. "Ask Penumbra" (`#askdrawer`, moved to `<body>` at init to clear `.page`'s stacking context; it rises from the
  sparkle button and sinks back via `drawer-in`/`drawer-out`, a bottom sheet on phones) is a scripted assistant: `answer()` matches intents by regex, computes replies from the live engine and offers actions.
- `agents.html` + `assets/css/agents.css` + `assets/js/agents.js`, `agents-views.js` and `agents-ui.js` ("agents" in the
  nav, between workbench and ask; 2026-11-03, settled 2026-11-04) imagines Penumbra with a team's agents: the Totality
  engine as the brain, agents as the edge, in a positive feedback loop overseen by the decision-maker. Headline "Agentic
  Orchestration" (title case, no period, at the user's request). Information agents report in; Totality re-forecasts,
  values what's still unknown by how much it could change the decision, retasks them toward it, and rewrites the briefs
  of workflow agents. "Your questions" picks the question (`QUERIES`: Hormuz closes, as on the brief, Tue 6 Oct, 27% at
  06:00 and 33% by 07:30 with its three decisions, so keep them in sync; Red Sea shuts, Gebze strike and feeder
  sanctions, as on the workbench); each question has its linked agents, feed, `coming` reports, asks, queue, deadline and
  per-question briefs. Agents are the organization's (`POOL`), can serve several questions (a problem shows on each, with
  "Also affects"), and some aren't linked yet. "New question" opens a dialog: the question, a resolve-by horizon, and the
  pool with switches; Totality suggests agents by matching `tags` to the wording (suggested ones float up and link
  themselves until the user changes one; `drawNq()` moves only rows out of place, since moving a row cut its switch's
  slide short); the new question splits, its agents report a baseline, and a first forecast arrives a few ticks later.
  Who acts: manual by default; automatic for small decisions, small reversible changes under a $1k/$10k/$50k limit,
  never signing, paying, sending or committing; done stays done, with Undo; "Acts on its own" appears only in automatic
  mode and the limit drops down (grid-row 0fr to 1fr). A simulated clock from 08:20, a minute every 5 s (the user
  rejected a replay with a play button). Segmented controls slide a highlight behind the chosen option (`slider()`).
  Views (`agents-views.js`, 2026-11-04, because one long page read as cluttered): a short intro, your questions, then a
  sticky tab bar (overview: the status strip, needs attention with `PROBLEMS` and fixes, who acts; live map; activity, a
  filtered feed; waiting for you; negotiation, Hormuz only, the resin buyer's brief following the live forecast, with
  version history; every agent, a table) with counts on overview and waiting. One view shows at a time and slides in
  from its tab's side; the hash keeps it, so Back works. Selecting an agent or Totality slides the side panel in as a
  drawer (agent: problem and fixes, surfacing, waiting changes, brief, also serving, stats, log, pause, autonomy;
  Totality: chart, what moved it, what it wants to know next; on wide screens the page makes room, on narrow ones a
  scrim covers). It works without touching agents.js: it takes over `scrollIntoView`, so agents.js's jumps switch views
  and its scroll to the side panel opens the drawer, and it opens the drawer when a select click redraws `#d-side`.
  The live map: agents either side of the Totality hub, links meeting the circle at evenly spaced points per side and
  lighting when information moves along them (a brighter copy draws in the direction of travel, then fades; the user
  disliked dots running along the lines, and a sense/weigh/steer/act ring).
  Style, from the Looo landing page (`references/loo snapshot.jpeg`, `references/looo closeup.png`): the user wanted its
  general design format only; a take that copied its set pieces (a giant hero, cards tilted on a red base, a band of
  names, numbered steps, window cards with mac dots, a red closing band) was rejected, as were Lemonade, blend and Privy
  takes, a warm-paper version with Instrument Serif and a white click-through version (all in git history). A warm
  off-white ground `#f4efe8` with the top and tab bars in the same cream; white cards on a very soft shadow, cream panels
  inside; DM Serif Display (Google Fonts) for the headline, the view titles (title case, "Waiting for You"; capitals were
  rejected), card titles and big figures, small gray Switzer for the rest; tomato red `#db3324` for buttons ("New
  question" too), counts and what waits for you, amber for a problem, working, protected and fixed neutral (the user
  wants it warm, no green). Status as soft pills, a pale wash of the color with no ring, dot or blinking (the user
  called dots a vibe-code giveaway, found plain colored labels bland, then disliked a halo ring and a hairline); no glow
  or pulse round Totality or the Live label (plain red text, which the user likes). The view tabs a cream track with a
  sliding white pill, centered (`placeThumb()` skips a snap when the pill is already headed to its tab, else show()'s
  relayout cut the slide short); once the question cards scroll away the chosen question fades into the empty space on
  their left (`#vq` in agents-ui.js: its name in a white pill after a gray "Question", which scrolls back up to the
  cards; no chance, and no dropdown, which the user disliked; at 1000px and under, or with the drawer open, the tabs sit
  left and the pill alone opens a space before them: the tabs slide right to its measured width `--vq-w`, then it fades in,
  and the reverse on leaving; opening or shutting the drawer glides the tabs between centered and left with a FLIP). The feed's filters a smaller copy of that track (ink pills were out of
  step). Every segmented control's hover only darkens the label, as on the tabs (the resolve-by
  choices once lit a white box). The feed's kinds (Report, Problem, Fixed, Change) are the same soft pills as status (Change red, Problem amber). Red buttons glow only on hover (as the landing's used to); secondary buttons (Decline, Edit the brief, Cancel)
  a soft cream fill with no outline, deepening and lifting on hover, white on cream cards (the user disliked a thin
  ring); a disabled red button stays gray, a shade darker on hover. Who acts' chosen option a white card lifted off the
  cream with a red dot (a black one that flipped light on hover was bizarre). The chosen question lifts with its chance
  in red, no outline and no sliding highlight, the others' text faded to 55% (full under the pointer); the scroller is padded so its shadow isn't clipped. The live map light on a
  white card with no key under it, its tiles with rounded-square initial avatars (agents-ui.js, colored from the name),
  Totality a white disc that reads as a gauge: a pale track with a red arc as long as the chance (`#hub-arc`, set in
  agents-ui.js from `#hub-p`), a larger chance and the question, no "Totality" label and no "sense"/"act" beside the
  column heads (the disc is drawn under the ring so the two thicken alike when selected). Body `ag-page`, no `.t-night`
  or sky, styles scoped to `.ag-page` so the dialog gets them.
- agents 2 (the agents page in sans, reached from a dropdown on "agents") was removed with its dropdown on 2026-11-06 (in
  git history).
- **House style (2026-11-05): the agents page's look is the default for new pages.** The user likes it and asked for
  it on new pages and on at a glance. `assets/css/house.css` holds it for any page: `body class="app house"`, DM Serif
  Display from Google Fonts, then house.css after app.css (tokens, the cream bar, black logo, red current-tab mark,
  `.h-display`/`.h-kicker`/`.h-fig` type, `.h-card`/`.h-panel`, red `.btn--primary` that glows only on hover, the cream
  `.btn-q`, soft `.pill`/`.pill--red`/`.pill--amber`, thin rounded scrollbars kept clear of a tile's rounded corners, since
  the browser's ran square past them, shown only while a panel scrolls and faded out after (nav.js animates the registered
  `--sb` color the thumb inherits); agents.css has the same). Charts make an entrance the first time they scroll into view (the
  user asked for opening animations on graphs generally): `assets/js/reveal.js`'s `Reveal(selector)` adds `.is-in` and
  `html.rv`, and the page styles `.rv ... :not(.is-in)`: lines draw (pathLength 1), bars grow from their axis, charts that
  redraw on every change wipe in with clip-path (the report keeps its own copy, `html.rs-anim`). Its rules: cream ground, white cards on a soft shadow, serif
  titles in title case with no period, one tomato red (money at risk is red; protected neutral ink), amber for a
  problem, no green, gold or blue, no outline rings (a lit or chosen card lifts), no status dots or glows. agents.css
  keeps its own copy (body `ag-page`) and is the reference; the daily brief, at a glance, the report, the tree, the sample memo and ask use house.css; the other existing
  pages keep their own styles unless asked.
- `index.html` + `assets/css/landing.css` + `assets/js/landing.js` is the landing, Penumbra (it was a preview at
  `penumbra.html` from 2026-10-15 until the switchover on 2026-10-16; `penumbra.html` now only redirects home). Same
  sections as the old ByNine landing, with the Daybreak engine renamed the **Totality engine** and dawn lines
  recast for the eclipse ("out of the shadow. let's talk."), but moon-dark ground with one warm accent, the light at an eclipse's edge: pink, rose, red, orange, amber, pale gold (`--a-*`,
  `--aurora`, and the conic `--mark`). The user rejected the logo JPEG's full rainbow on the page (the logo alone keeps it); keep the page
  off blues, greens and violets (one exception the user asked for: the "Done" status pill on the team workflows card is green), and keep lines, bars and borders one color, not gradients. Protected money
  (`--safe`) is pale gold here, not green. Hero: one screen-sized eclipse. A white sun fills most of the viewport; scroll slides the
  moon over it from the lower left (`--cover`), the rim lights at totality (`--ring`, `--flash`) and then bursts
  into the page's spectrum (`--burst`: blurred corona, conic ray streamers, a sky-wide wash); the headline is "risk lies in shadow." as "look around the bend"
  arrives. Before the burst the headline is a white copy in `mix-blend-mode: difference` (black on the sun, white on
  space), crossfading to the real `h1`; `.hero__copy` has no z-index so the blend reaches the sun. The mark keeps the shape of `references/Penumbra Logo Color.jpeg` (ring with
  a four-point spark at 45°) but not its colors, which clashed: it's inline SVG masks in `base.css` (`.logo`) filled with
  `--logo-ring`, a full-spectrum conic gradient the user chose for the logo (the page's warm `--mark` drives the corona). Don't use the JPEG itself. To the left of "While the world sleeps" (the thesis; stacked on phones, it follows the text) is a decorative Sputnik 1 (`.spk`, inline SVG generated by `tools/sputnik.py`, which projects a 3D model: 58 cm polished sphere, the hemisphere flange square to the flight axis with its 36 bolts, four whip antennas on the front hemisphere in two pairs of 2.4 and 2.9 m at true scale, each swept back 35 degrees; the ball hides what's behind it). Stylized on purpose: a slow drift and the radio beep as rings that swell and fade, all still under reduced motion; no orbit line or warm rim light (the user removed both). It replaced the cycling "Flagged overnight" card on 2026-10-16; a Hubble-style satellite was tried first and reverted. The engine section is headed "an engine for every question."; its example's fourth part is a "Prediction market baseline"
  ("Will the incumbent party lose next month's elections?", 31%) beside the three engines. Each part's label
  is a tint of its source's warm color halfway between bright and pastel (the user found the bright ones too
  loud and the pastels too washed out), no dots: judgment peach,
  telemetry butter, procedure pink, the market coral. The horizon chart's judgment line is orange. The product section is "for
  whatever you need.", placed after "here's the plan" and before "showing our work" (the agents card read out of place
  first), with four cards (daily brief, team workflows, workbench, agentic orchestration; the brief's card
  shows figures, not sliders; the agents card describes the screen, not the loop ("A live view of every agent working on your questions..."), so it
  doesn't repeat "here's the plan", which alone explains the loop, and "what should you do?" is only about choosing; it shows an eclipse that doubles as a system map: the moon in its corona, straight rays from its rim, long ones
  fading out before the edges of the card's dark inner box (kept: the user likes it) and fainter streamers between, all long enough to fade out at the same distance (the user asked for even lengths), only the glow pulsing
  slightly; no text, nodes or moving dots (the user
  found a labelled diagram busy), deliberately unlike the workflows card's task rows, and no card has a button: the user removed them). Split screen (601-1100px): the hero lines scale with the width, and the
  stacked thesis text and Sputnik are larger. Below the hero: fixed starfield canvas (no coloured background glows: the user removed them as
  tints), a faint white pointer glow, aurora-edged card spotlights (`.spot`, `--mx/--my`), headings revealed
  word by word, "what should you do?" (after gray swans) as a moon chart (`.lunes`, heading styled like the other sections), introduced by
  the world-model lines moved from the plan section: the four responses,
  worst to best, waxing from crescent to half, gibbous and full moon on an orbit line (launch enterprise 265, flagged "Best move";
  build hosting 260; launch all four 249, 172-320; delay 154, 148-160); each moon stands alone with no intro and stays short: the action, the figure and "expected revenue", no ranges and no Brazil (the user found more too text-heavy); the best glows. Phases are static SVG paths.
  a nebula behind gray swans (`.nebula`: two gas layers and dark dust lanes from domain-warped
  fractal noise, painted once at low resolution, plus specks; CSS drifts each layer and scroll parts them by depth),
  and "here's the plan." (the old node-link section; since 2026-11-03 its copy is the agent loop, agents sense and act,
  Totality weighs, retasks and rewrites briefs, you sign off, small reversible calls can run on their own, with a
  no button: the user doesn't want links added there), its copy on the right of the constellation Sagittarius (left; stacked, it follows the copy) (`.cst`, static SVG of Stellarium's western stick figure, the
  24 "Sgr" HIP pairs, with SIMBAD J2000 positions and V magnitudes; east left, north up, star size by magnitude;
  over faint field stars; twinkling by dimming their colour (opaque, so the lines meeting under them never show through), lines drawing once in view; bleeds toward the page edge). No text, no cursor
  reaction: the user tried a labelled hub and spoke and a cursor-reactive version first. Nebula layers don't travel or fade: each painted layer is redrawn ~15 times a second through a slow,
  zero-mean undulating displacement field (its own wavelengths and speeds), so wisps sway against each other in
  place. The user rejected rigid drift (read as wind) and twin crossfades (read as fading). No cursor effect on them (the user tried several and removed them). The top bar hides while scrolling down once the hero's bottom edge has passed it and returns on any scroll up. The page closes in a second nebula (`.nebula--close`, same renderer, its own seeds) behind the contact form (beside the heading; since 2026-11-06 compact: no labels above the fields, each field's name
  as its placeholder, "Message (optional)" last, underline fields lit gold on focus; a wide panel under the heading was undone),
  thinning to black before the solid black footer; the user preferred it to a northern-lights effect. Headings are solid moonlight (`--moon`, white for the hero's second line); the user rejected gradient text. Tiles are dark glass (`--card`, part-clear over `--glass` blur, no shadow, no outline), dividers solid hairlines (no dashes), and only the answer is lit: the fused forecast, the best moon, a card's money figure (the overnight card's percentage shares its color); labels such as the mode cards' audience lines stay `--moon-3`. Gray swan cards are written for a first-time reader: a plain headline, one line of why, then a foot with the probability as a large percentage beside a short plain label and "Affects ..." (no jargon like p(...), GNSS or TEU, no "not on your watchlist" pill). `penumbra.js` is a fork of
- Red Sea demo (2026-11-03): a second group in the product nav (`.tabs__group`, "Red Sea demo") testing a calmer,
  leader-first style, because the user found the main tour pages too busy and text-heavy (the power-user detail
  should stay available, but a leader must see at once what's happening, what it hits and how to respond). Three
  layers, each a deliberately different visual take so the user can pick one later and standardize: `redsea.html`
  (at a glance: big numbers, then a three-column board of events, Halvorsen assets and teams joined by curves that
  light up as a chain on hover; stacked, cards name their links), `redsea-report.html` (the narrative, in the
  strategic options memo's shape, on a light page (`.rs-light`, in at a glance's colors; the user doesn't want the dark ground kept by default):
  trend with hover readouts, a drivers tug of war, a real map of the lanes and the Cape detour (land from `assets/js/redsea-map.js`, generated by
  `tools/redsea-map.py` from Natural Earth; lanes are lon/lat sea waypoints in redsea-report.js; the user found an
  unmapped schematic bizarre), and a plan lab
  (`assets/js/redsea-report.js`) where presets A/B/C or any mix of the five moves, the attack chance and the attack
  date redraw the headline numbers, exposure by asset, Gebze's compressor stock, the chance the loss passes each
  amount, all 32 plans by cost and loss left (select a dot to load it) and the section 4 timeline; every change tweens (`tween()`: numbers count,
  bars slide, curves morph, dots glide; the user asked for smooth shifts), and figures draw in as they scroll into view
  (`.rs-anim`, `.is-in`), all off under reduced motion; the user asked
  for more visuals and to explore how each plan changes the landscape) and `redsea-tree.html`
  (the decomposition, with a side panel for resolution criteria and cross-links, a bottom sheet on phones; three views
  over one zoom position, for the user to compare: Cards, one level at a time as a grid of full-size cards you drill
  into (the chance as a number, a plain word and a bar in a warm ramp by probability, yellow to rose-red, the user
  found gray bars dull; each bar is one solid color, not a gradient, its probability's point on the ramp; hatched where declined; easing shown by its tag, not color; how many questions inside, in
  words, no "likeliest"; a chevron and points where the chance moved since yesterday, on some cards only, from the
  generator's `dd`; a key above; a quiet lighter card for the selection; where you are shown as a route line (`.route`): a stop per level with
  its kind, chance and short title, the current one ringed, earlier ones clickable to go up. The user found a strip of
  tick marks, a yellow-and-white selection, an "Up a level" button, a "Back to ..." pill and text crumbs unclear or
  unappealing); Branches, the question, its
  children and one child's children joined by curves, long families folding into "N more"; and List, the outline. The
  user found the list alone boring, and rejected a zoomable icicle because its slim blocks were impossible to click). The user disliked the reference's radial "sonar" style as vibe-coded but
  said its information and connections are right. As of Wed 1 Apr 2026, horizon 1 Oct, matching the lattice.
  Shared: `assets/js/redsea.js` (the only source for events, assets, teams and money: a small exact model, six
  independent events, a loss per asset per event, and moves that cut shares of those losses and overlap rather
  than add; every page computes its figures from `RS.stats()`, so change the model there, not the copy), `assets/css/redsea.css`
  (`.rs` palette: the landing's warm set, amber accent, rose-red loss, pale gold protected; `.rs-light` its
  paper version) and no nebula (space.js skips the haze for these pages). All three are now light, each a different
  take at first (2026-11-03, "don't include the landing page background", so no starfield either), then on 2026-11-04
  all set to at a glance's white gallery at the user's request (same white ground, broadly the same colors): at a glance
  (since 2026-11-05 in the house style instead: body `app house rs rs-glance`, its layer `.house.rs-glance` in
  redsea.css; the facts one white strip, serif titles in title case, tracing lifts the chain's cards and lights its curves red), the report
  (since 2026-11-05 in the house style too: body `app house rs rs-light rs-report`, its layer `.house.rs-report` in
  redsea.css retokens the `--r-*` colors: loss red, protected pale red `#f2b3ab` bars (the user disliked tan; no gold);
  the bottom line, figures, table and off-list cards white cards, the map with no card; the plan lab on the page like
  the other sections (not a card) with its presets, moves, KPIs and figures as white cards; section numbers in the left
  margin from 1100px so title and text share an edge; confidence pills color coded (high deeper gray, moderate amber,
  recommendation red); the timeline's bars red on pale tracks like the loss bars (black read as bland, per-team colors out of
  step); its axis runs six weeks or stretches to keep a June or July attack and the first turned-round ships (the gray
  line, attack + 5 days, now labelled) on the chart; the stepper centered under its choices with no note beside it;
  the off-list sparklines red; once the lab's four figure tiles pass under the top bar they fold into a strip beneath it (`#kbar`, built in
  redsea-report.js, the cream of the agents page's sticky tab bar; each label and figure glides from its tile, FLIP), kept
  in step with the tiles to the foot of the page, with a "Current Plan" button (just that, at the user's request) that
  scrolls back up to the lab, as the agents page's question pill does; the presets styled as the agents page's question
  cards (white, the chosen lifted, the others' text faded to 55%; a cream track for them was tried and undone); the five
  moves as one white list with hairlines and switches (five more cards read as crowded); the signposts in "What Would
  Change Our Minds" numbered in italic DM Serif roman numerals (the report loads the italic); the attack start picked on a
  four-stop line (`.when`, the chosen stop a red dot; a 2x2 grid on gray read poorly); links to the tree as soft `.btn-q`
  buttons under their paragraph (the user dislikes inline links); serif titles in title case, the headline split into a title and a one-line lede, the step's plus black) and the
  tree (since 2026-11-06 in the house style too: body `app house rs rs-tree`, its layer `.house.rs-tree` at the end of
  redsea.css; the question a serif title in title case, the tally one white strip of serif figures, the tools one row
  sharing the body's columns: the view switch a cream track and sliding white pill, then "Search keywords" running to
  the cards' right edge (focus deepens its shadow, no ring: the user disliked the red one), the filters as switches over the panel; every question a white
  card, the chosen one lifted with its kind in red, no ring; chances in serif on a ramp of the house red from pale to deep
  in `ramp()` and `--ramp`, stops packed into the low range so neighbouring odds read apart; the route ink stops with the
  current one red; drawCrumbs() keeps the stops that stay, so the line grows to a new stop and draws back from one that
  goes, and at the top level the route fades and folds away (a fixed-height row was tried and undone); opening a card in Cards grows that card into the "Looking into" spot, and one level up the header
  shrinks back into its grid slot (`runMorph()`: a white shell, `.cd-ghost`, with the old and new contents crossfading
  inside it at their own sizes so the text never rewraps; while it travels the route snaps to its new height rather than
  folding, since chasing a header the route was still pushing made the shell overshoot "Looking into", and the header
  skips its slide-in, which replayed on landing); each level's bars grow in as its cards slide in; the side panel fades out and back in when the question changes, easing to its new height (`showDetail()`, wide screens only); in List a branch drops open and folds shut, `setOpen()` animating the
  group's height around the redraw); all with the black logo. No thin gray outlines ("pencil outlines")
  around cards, buttons or panels on these pages (the user dislikes them, 2026-11-03): a surface stands on its fill or a
  soft shadow; an accent ring is kept only to mark a selection or a traced chain. The tree reads `assets/js/redsea-lattice.js`, generated by
  `tools/redsea-lattice.py` from `references/red-sea-lattice-v0.html`; the reference has no probabilities, so the
  script adds illustrative ones (hand-set for branches and for the nodes the summary cites, which must match
  `redsea.js`) and drops leakage flags, which stay private.
- Checkboxes (2026-11-03): the user found the browser's default boxes dated, so `base.css` draws every
  `input[type="checkbox"]` as a rounded square that fills with the page's control color (`--cb-on`, default
  `--ctl`) and draws a check (`--cb-mark`). But the user prefers switches as a general rule: use the `.switch`
  toggle from `app.css` for a labelled row, or `class="tgl"` on a lone checkbox (the report's moves, the workbench's
  plan table, ask's sources), and keep a plain checkbox only where a switch would look awkward.
- Sliders (2026-11-03): the user found the workbench's sliders not useful, so it has none. In their place `picker()` in
  bench.js (`.pick` and `.nudge` in app.css): three values that mean something, each with a plain word (Totality's forecast
  and the ends of its error band; shorter, expected, longer; how far a signal moves the forecast), and a −/+ nudge for
  anything between, centred under the choices; holding − or + repeats, faster the longer it's held. The report's plan lab uses the same idea (`.chooser` and `.step`). Prefer it to a slider elsewhere.
- Motion between views: `assets/js/nav.js` (in every page's `<head>`) records which way the clicked page lies in the
  nav order; the new page slides in from that side (cross-document view transitions where supported, with the
  `.bar` held still; otherwise a CSS entrance on `main` and the footer, keyed on `html[data-slide]`). The landing opts out of the view transition
  (`@view-transition { navigation: none }` in landing.css): its nav isn't a `.bar`, so the product bar's snapshot smeared
  over it on the way home; it gets the CSS entrance instead. In the
  workbench, `slideTo()` slides stages, model views and the two modes in sequence order (`.slide-in`/`.slide-out`).
  All of it is off under reduced motion. Between the three Red Sea demo pages the moon crosses instead (2026-11-03, the user's
  idea, "the black sphere is the moon"): a plain black disc wider than the screen (`.moon`, in `redsea.css`; its warm rim glow was
  removed, the crossing being too quick for it) slides over the page from the side the next page lies on, the next page stays dark (`html[data-moon]`)
  until the moon is over it, and the moon slides off the far side as soon as the page is drawn, giving the fonts at most 120ms (the user found it
  lingered), on an exit that starts fast so the page shows at once;
  the next page is prefetched when a pointer goes over its link. The user asked for it fast: 0.2s over, 0.26s off.
  No view transition there.
- `assets/js/app.js` holds the shared helpers (`DB.money`, `DB.toast`, `DB.rng`, range fills).
- Copy (the user's audit, 2026-11-06): plain and human, not punchy. No slogan lines ("Three decisions, not three hundred
  alerts", "We'd rather tell you that than guess"), no "X, not Y" flourishes, and no lists of three in every explanation. Say
  what "it", "each one" or a bare percentage refers to; when a later sentence cites a probability from earlier, name what it's
  the chance of. Spell out figures (a bad case "1 in 20", not P95; "58%", not p 0.58; percentage points as "pts"). Oxford
  commas in every list. US dates: "August 1", "Tuesday, October 6, 2026", "Oct 9" (not "1 August"); the date helpers in
  redsea-report.js, redsea-tree.js and chat.js build them that way. Em dashes are fine; the user wants them kept. Contractions are welcome where they sound more natural ("It's about even odds", "We'd move"), without
  overdoing it.
- Type: Switzer (Fontshare), self-hosted in `assets/fonts/`, for everything, on a major-third scale; data uses
  tabular figures. JetBrains Mono appears only in the workbench's code, diff and log panels. Labels are sentence
  case, with no all-caps eyebrows, middle-dot meta strings or decorative arrows.
- Landing page: `landing.js` splits every text block below the hero into words that darken, in reading order, as they cross the
  reading line (`.w` / `.w.on`). Tiles (cards, tags, chain rows, bubbles, the form) are never split: each
  fades in whole (`.tile.on`) once its top crosses 85% of the viewport. Unread text color comes from `--unread`.
- Palette tokens: `base.css` holds the landing's (`--void`, `--moon`/`--moon-2`/`--moon-3`, warm accents `--a-pink`
  to `--a-yellow`; money at risk `--loss` rose-red, protected `--safe` pale gold; the landing's Done pill is green at
  the user's request). `app.css`'s `.t-night` swaps in the product tour's logo-spectrum set (see above).

## Product messaging

Naming: say **Penumbra** for the company and the product (wordmark, titles, footers, "Ask Penumbra", the SDK's
`from penumbra import World`, anything the customer uses or buys). Say **the Totality engine** (lowercase "engine")
when the copy describes the model doing analysis: splitting questions, running its three engines, fusing,
forecasting, declining, suggesting. Tight labels may shorten it to "Totality" ("Totality's read", "How Totality got
27%"). Storage keys and SVG mask IDs say `daybreak` from the first company name; they're internal, so leave them.

Source docs: `references/Decision Model Pitch.docx` (overview) and
`references/Sector-Agnostic Decision Notes.docx` (technical breakdown). The site names three
contributions as things no one else in the field does, in plain language:
1. **Query decomposition:** hard questions are split into forecastable sub-questions; parts with
   no skill at the horizon are declined, not guessed.
2. **Three-class structure:** judgment, telemetry and procedure engines, each with its own horizon of skill.
3. **Forecast fusion:** engine outputs are fused into one calibrated probability with error bars (not averaged).

Keep private: specific models and vendors, fusion and calibration methods, the event-sequence
model, leakage controls, competitor names and patent issues. The Hormuz example's engine figures
(33 / 26 / 22%, fused 27%, one sub-question declined) appear on the brief and the workbench;
keep them in sync. The team page reuses the brief's actions, dates and probabilities, so keep those in sync too. The landing page deliberately spans industries: an automaker's
strike question (engines), a tech company's launch (the moon chart), and mixed-sector gray swans.

## Repository

- Remote: https://github.com/garrettwwalker/decision-model-ui-v2 (public), default branch `main`.
- Commit identity is configured per-repo (`git config user.name` / `user.email`), not globally.

## Git workflow

- Commit regularly: make a commit after each logical unit of work rather than batching unrelated changes.
- Push to GitHub (`git push`) after committing so the remote stays current; this is pre-authorized for this repo.
- Write clean commit messages: a concise imperative summary line (≤ 72 chars, e.g. "Add decision tree editor"), optionally followed by a blank line and a short body explaining why.

## Design reference

The user's chosen visual model is `references/convodesign101-full-page.png` (a full-page
capture of convodesign101.xyz, a Framer site). Per §2 of the standards below, match its
direction. Open the image before any UI work; it is 1895×19466, so view it in vertical slices.

**User override (2026-10-16): the Penumbra landing is now the design system for the whole site.** Every page
follows its structure (see Architecture): dark ground, stars, dark glass cards, moonlight type, solid hairlines. The
landing keeps its warm eclipse palette; the product tour uses the logo ring's spectrum with a blue-violet-teal haze. The convodesign capture and the dawn override (2026-10-06) below are history:
keep their composition habits (offset left-hung headlines, narrow reading columns, scroll-read copy on the landing),
not their sky-blue or dawn palette, clouds, pinned paper, tilted notes, cargo tags or dashed dividers.

- **Palette** (sampled from the capture and its CSS):
  - Sky `#33CBEA`: the page ground for nearly the whole scroll
  - Deep sky `#19B5D6`: tone-on-tone text (unread copy, giant watermark section titles)
  - Ink `#000000` / `#131415`: headlines and "read" body copy
  - Cloud white `#FFFFFF`: clouds, speech bubbles, cards, the full-bleed white band
  - Night `#082A38`: the footer; body background is
    `linear-gradient(180deg, #33CBEA 89%, #082A38 94%)` so the page ends in night
  - Night cyan `#0AAED6`-ish: footer headline; soft pink (stamps, stars) as the rare accent
- **Type:** one heavy, tight-tracked geometric grotesk throughout (lowercase display
  headlines like "conversation design", "fixed context"); bold ~28px body set in a narrow
  centered-left column; tiny 11–12px captions. The exact face isn't in the capture.
  Pick a close match (e.g. Satoshi / General Sans Bold) and confirm with the user.
- **Signature moves:**
  - Scroll-driven reading: body copy starts in deep-sky tone-on-tone and turns ink as it's
    read.
  - Soft 3D clouds frame section edges; the sky gives way to a night scene (moon, stars)
    at the footer.
  - Chat-bubble annotations: a small avatar + white speech bubble used as narrator asides.
  - Real UI widgets inline in prose (a "Buttons ↗" chip, a "Sliders" toggle).
  - Collectible objects as content: postage stamps for a timeline, translucent folders for
    resource groups, pinned white note cards for trends.
  - Subtle grain/dot texture over flat color; dashed hairline dividers.
- **Composition:** mostly a narrow column, but offset: left-hung headlines, side notes,
  staggered cards. Keep that asymmetry so it doesn't fall into the centered-everything ban.

## Website Design Standards

This section governs how you build websites in this project. The goal is a site that looks
**deliberately designed by a human studio**, not generated. Every rule below exists to keep
the output from sliding into the default "AI / vibe-coded" look. Follow it on every build.

### 0. The one rule that matters most

If a stranger could glance at the page for two seconds and say "an AI made this," you have
failed, regardless of whether the code works. Distinctiveness and restraint are the job, not
a bonus. When in doubt, make a *specific* choice tied to the subject instead of a safe,
generic one.

### 1. Hard bans (never ship these)

These are the fingerprints of a vibe-coded site. Do not use them.

- **No purple/violet/indigo as the primary brand color.** This is the single biggest tell.
  Avoid `#7c3aed`, `#8b5cf6`, `#a855f7`, `#6366f1` and their neighbors as the dominant hue.
- **No emoji inside headings or section titles** (🚀 ✨ 🔒 etc.). Use real iconography instead.
- **No "Why Choose [Brand]?" sections.** Same for "Transform your X into Y," "Start it. Build
  it. Launch it." and other interchangeable SaaS slogans.
- **No pill-badge clutter** ("99.9% Uptime", "GDPR Compliant", "24/7 Support 🔒") stacked under
  the hero.
- **No default centered-everything layout** with a single column of centered text from top to
  bottom. Use real composition.
- **No raw system font / unstyled Inter** as the entire type system (see §3).
- **No rainbow of soft drop shadows** on every card. Shadow is an accent, not a texture.
- **No "fingernail" accents:** no thick colored stripe down one edge of a card, tile or callout
  (`border-left: 3px solid <accent>` on a rounded, tinted box). Let a card stand on its fill, a full
  hairline outline, an icon or its type instead.

If a design brief or reference *explicitly* asks for one of these (e.g. the client genuinely
wants purple), the brief wins — but confirm it's intentional, and execute it with care so it
still looks designed rather than defaulted.

### 2. Follow the user's references first

If the user provides design examples, screenshots, links, or a brand, **those override
everything below except the hard bans.** Before designing:

1. Identify the reference's palette (pull actual hex values), type style, spacing rhythm,
   and the one signature move that makes it feel like itself.
2. Match that direction. Do not "improve" it toward a generic look.
3. If the reference conflicts with a hard ban (e.g. it's purple), tell the user and ask
   whether to match it or adapt it.

No references provided? Then pin the brief yourself: name the concrete subject, its audience,
and the page's single job, and design specifically for that.

### 3. Typography (always beautiful, always intentional)

Type carries the personality. Never leave it as a default.

- **Pair two faces with intent:** a characterful display/heading face used with restraint,
  plus a clean, legible body face. Optionally a third utility face for captions or data.
- **Avoid the tired defaults** as your whole system: plain Inter, Roboto, Open Sans, system-ui.
  They're fine as a *body* in some briefs, but pair them with a real display face and a
  deliberate scale.
- **Good starting palettes** (mix display + body, pick to fit the subject, not by habit):
  - Editorial / trustworthy: *Fraunces* or *Libre Caslon* display + *Inter Tight* body
  - Modern / technical: *Space Grotesk* or *General Sans* + *IBM Plex Sans*
  - Warm / human: *Bricolage Grotesque* + *Source Serif* body
  - Sharp / premium: *Geist* or *Satoshi* + *Newsreader* for long copy
- **Set a real type scale.** Define explicit sizes, weights, line-heights, and letter-spacing.
  Headlines get tighter leading and tracking; body copy gets generous line-height (~1.5–1.7).
- **Load fonts properly** (self-host or use a reliable CDN), set `font-display: swap`, and
  always declare fallbacks.

### 4. Color

- **Choose a palette of 4–6 named hex values** derived from the subject or reference — not a
  framework default.
- Anchor on a confident neutral base, add **one** disciplined accent, and use it sparingly.
- Ensure text/background contrast meets **WCAG AA** (4.5:1 for body, 3:1 for large text).
- If you want energy, get it from composition, type, and a single bold accent — not from a
  gradient.

### 5. Layout & composition

- The hero is a thesis: open with the most characteristic thing about the subject, not a
  centered slogan + two buttons + stat row.
- Use real composition — asymmetry, an editorial grid, intentional whitespace. Vary section
  rhythm; don't stack identical centered blocks.
- Structural devices (numbers, eyebrows, dividers, labels) must encode something true.
  Don't add `01 / 02 / 03` unless the content is genuinely a sequence.
- Match complexity to the vision: minimal directions need precise spacing and detail;
  maximal directions need committed execution.

### 6. Responsive: desktop AND mobile, every time

Non-negotiable. The site must look intentional at every width.

- Type, spacing, and layout all adapt — don't just let a desktop layout shrink.
- Tap targets ≥ 44×44px; no horizontal scroll; no overlapping or clipped elements on small
  screens.
- Images and media are responsive (`max-width: 100%`, correct aspect ratios, sensible
  `srcset` where relevant).
- Navigation collapses sensibly on mobile (and the mobile menu actually works).

### 7. Quality floor (build this in silently)

- Visible keyboard focus states on all interactive elements.
- Semantic HTML, alt text on meaningful images, labelled form controls.
- Watch CSS specificity — don't let `.section` and element selectors cancel each other's
  padding/margins. Verify spacing actually applies.

### 8. Always check your work when done

After building, **do a real review pass before calling it finished.** Do not just stop when
the code runs.

1. **Screenshot / preview** the page at desktop and mobile widths if the environment allows.
   A picture is worth 1000 tokens.
2. **Run the vibe-code checklist** below. If any box is checked, fix it.
3. **Read your own copy** — does it sound like an interchangeable SaaS template? Rewrite it
   to be specific and plain.
4. **Click through** key interactions (nav, mobile menu, buttons, forms) and confirm they work.
5. Apply Chanel's rule: look at the finished page and remove one thing that isn't earning its
   place.
6. Report back what you checked and what you changed.

#### Vibe-code checklist (every item must be NO)
- [ ] Is purple/violet the dominant color?
- [ ] Are there emoji in headings?
- [ ] Is there a "Why Choose us?" or generic SaaS-slogan section?
- [ ] Is everything centered in one column?
- [ ] Is the type just default Inter/system with no display face?
- [ ] Does any card carry a colored stripe down one edge?
- [ ] Does it break or look unstyled on mobile?

### 9. Process summary

Brainstorm → pin the brief / match the reference → draft a small token system (color, type,
layout, one signature element) → critique the plan against this file (would I produce this for
*any* site? then change it) → build → check your work (§8) → critique again.

Distinctiveness comes from the subject. Restraint makes it look designed. Beautiful type and a
clean responsive build are the floor, not the goal.
