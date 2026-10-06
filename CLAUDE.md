# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Decision Model UI v2 is a clickable mockup for **Daybreak**, a geopolitical decision model.
The demo client is Halvorsen Group, a fictional Fortune 500 appliance maker, facing a
Strait of Hormuz closure. It is plain static HTML/CSS/JS: no framework, no build step and
no tests. To preview, open `index.html` in a browser; there's no server.

## Architecture

- Pages: `index.html` (landing), `briefing.html` (executive brief), `wargame.html`
  (scenario sandbox) and `workbench.html` (world-model editor for data/IT).
- Each product page sets its time of day on `<body>`: `t-sunrise` (brief),
  `t-bluehour` (wargame), `t-night` (workbench). The landing page runs night → dawn on scroll.
- `assets/css/base.css` holds shared tokens and components, `app.css` the product-page
  chrome, and `landing.css`, `brief.css`, `war.css` and `bench.css` are per page.
- `assets/js/model.js` is the single source of truth for every loss figure. The
  wargame and workbench run it live. The brief's numbers are static but were computed from
  it, so if you change `BASE`, recompute and update `briefing.html`. Money is in $M.
- `assets/js/sky.js` renders the procedural SVG cloud banks (`[data-clouds]`); cloud
  colors come from `--c-*` vars on `.clouds--storm/dawn/cream`.
- `assets/js/app.js` holds the shared helpers (`DB.money`, `DB.toast`, `DB.rng`, range fills).
- Type: Switzer (Fontshare), self-hosted in `assets/fonts/`, for everything, on a major-third scale; data uses
  tabular figures. JetBrains Mono appears only in the workbench's code, diff and log panels. Labels are sentence
  case, with no all-caps eyebrows, middle-dot meta strings or decorative arrows.
- Landing page: `landing.js` splits every text block below the hero into words that darken as they cross the
  reading line (`.w` / `.w.on`), and fades in tiles (`.tile`, `--r`). Unread color comes from `--unread` per context.
- Dawn palette tokens: `--dawn`, `--dawn-deep`, `--ember`. Money at risk uses `--loss`
  (crimson) and protected money uses `--safe` (teal).

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

**User override (2026-10-06):** emulate the reference loosely. Swap its sky-blue ground for
**dawn** (the product is Daybreak): dawn gradients, dark storm clouds that part to reveal a
rising sun. Keep the reference's moves (tone-on-tone type, clouds, bubbles, collectibles)
but in the dawn palette.

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
- [ ] Does it break or look unstyled on mobile?

### 9. Process summary

Brainstorm → pin the brief / match the reference → draft a small token system (color, type,
layout, one signature element) → critique the plan against this file (would I produce this for
*any* site? then change it) → build → check your work (§8) → critique again.

Distinctiveness comes from the subject. Restraint makes it look designed. Beautiful type and a
clean responsive build are the floor, not the goal.
