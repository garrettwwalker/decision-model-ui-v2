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
  managers), `workbench.html` (world-model editor for data/IT) and `ask.html` (chat). `wargame.html` is only a
  redirect to `team.html`; the wargame it used to hold was replaced.
- Product pages (`t-night`, defined in `app.css`) share the landing's structure, but each page has its own small
  palette taken from its sky (the user found a tour-wide five-hue scheme incoherent and not very informative,
  2026-10-16): `--accent` (controls, selection, the lit answer, anything good: protected money, done, healthy),
  `--good` (a paler accent for good beside the accent), `--alert` (money at risk, losses, overload, late),
  `--alert-2` (softer warnings); alerts sit next to the sky's hue rather than opposite it (the user found
  orange-on-blue and red-on-green harsh), and moonlight for everything else ("yours", e.g. your plan in a chart, is plain
  white). Brief `sky-warm`: amber / pale gold / coral. Memo `sky-green` (green nebula, green-black ground): mint / pale mint / muted gold. Workflows
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
- `memo.html` + `assets/js/memo.js` is a sample strategic options memo, dated Wed 7 Oct, answering the CEO's
  "How should we respond to the potential of new sanctions by the Trump Administration?" Static HTML holds the bottom
  line (key judgments with confidence, 41% ±7 by 6 Dec on an estimative-words scale) and the drivers tug-of-war
  (22% on 1 Aug, +24/−5, 41% today); `memo.js` renders the rest from data: `INTERESTS`, `OPTIONS` (cost, expected
  value protected at P = 0.41, pros/cons, a fit per interest), `PLANS` (week-grid Gantt steps, decision points,
  tripwires), `TRENDS` (three weekly line charts with hover readouts) and `ASKS`, which open `ask.html?q=` with the
  question typed in. Choices persist in localStorage (`daybreak.memo.choice`). It reuses the brief's resin, Dubai
  and feeder exposures and the 29 Sep talks collapse, so keep those in sync.
- `ask.html` (fifth tab, `assets/css/ask.css`, body class `ask-page`) is the "ask the model" chat. `assets/js/chat.js`
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
  `--logo-ring`, a full-spectrum conic gradient the user chose for the logo (the page's warm `--mark` drives the corona). Don't use the JPEG itself. Below the hero: fixed starfield canvas (no coloured background glows: the user removed them as
  tints), a faint white pointer glow, aurora-edged card spotlights (`.spot`, `--mx/--my`), headings revealed
  word by word, "what should you do?" (after gray swans) as a moon chart (`.lunes`, heading styled like the other sections), introduced by
  the world-model lines moved from the plan section: the four responses,
  worst to best, waxing from crescent to half, gibbous and full moon on an orbit line (launch enterprise 265, flagged "Best move";
  build hosting 260; launch all four 249, 172-320; delay 154, 148-160); each moon stands alone with no intro and stays short: the action, the figure and "expected revenue", no ranges and no Brazil (the user found more too text-heavy); the best glows. Phases are static SVG paths.
  a nebula behind gray swans (`.nebula`: two gas layers and dark dust lanes from domain-warped
  fractal noise, painted once at low resolution, plus specks; CSS drifts each layer and scroll parts them by depth),
  and "here's the plan." (the old node-link section) beside the constellation Sagittarius (`.cst`, static SVG of Stellarium's western stick figure, the
  24 "Sgr" HIP pairs, with SIMBAD J2000 positions and V magnitudes; east left, north up, star size by magnitude;
  over faint field stars; twinkling, lines drawing once in view; bleeds toward the page edge). No text, no cursor
  reaction: the user tried a labelled hub and spoke and a cursor-reactive version first. Nebula layers don't travel or fade: each painted layer is redrawn ~15 times a second through a slow,
  zero-mean undulating displacement field (its own wavelengths and speeds), so wisps sway against each other in
  place. The user rejected rigid drift (read as wind) and twin crossfades (read as fading). No cursor effect on them (the user tried several and removed them). The top bar hides while scrolling down once the hero's bottom edge has passed it and returns on any scroll up. The page closes in a second nebula (`.nebula--close`, same renderer, its own seeds) behind the contact form, thinning to black before the solid black footer; the user preferred it to a northern-lights effect. Headings are solid moonlight (`--moon`, white for the hero's second line); the user rejected gradient text. Tiles are dark glass (`--card`, part-clear over `--glass` blur, no shadow, no outline), dividers solid hairlines (no dashes), and only the answer is lit: the fused forecast, the best moon, a card's money figure (the overnight card's percentage shares its color); labels such as the mode cards' audience lines stay `--moon-3`. Gray swan cards are written for a first-time reader: a plain headline, one line of why, then a foot with the probability as a large percentage beside a short plain label and "Affects ..." (no jargon like p(...), GNSS or TEU, no "not on your watchlist" pill). `penumbra.js` is a fork of
- Motion between views: `assets/js/nav.js` (in every page's `<head>`) records which way the clicked page lies in the
  nav order; the new page slides in from that side (cross-document view transitions where supported, with the
  `.bar` held still; otherwise a CSS entrance on `main` and the footer, keyed on `html[data-slide]`). In the
  workbench, `slideTo()` slides stages, model views and the two modes in sequence order (`.slide-in`/`.slide-out`).
  All of it is off under reduced motion.
- `assets/js/app.js` holds the shared helpers (`DB.money`, `DB.toast`, `DB.rng`, range fills).
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
