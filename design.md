# Design Guide — zhenaixiao.com

The design language for **Zhenai Xiao — Communications & Market Development Consultant**.
This document captures the visual system and front-end architecture so every page feels
like one considered, premium brand: editorial, calm, and quietly confident. The site should
read like a high-end print magazine that happens to live on the web — never a generic SaaS template.

---

## 1. Brand personality

| Trait | What it means for design |
|---|---|
| **Editorial** | Generous whitespace, serif display headlines, asymmetric layouts, magazine-style eyebrows and section labels. |
| **Warm & human** | A subtle paper-grain texture sits over every page. The work is about people and trust. |
| **Precise** | Tight letter-spacing on headlines, hairline rules, restrained palette. Nothing decorative without a reason. |
| **Confident, not loud** | One accent color per surface (crimson for the main site, aqua for coaching). Emphasis comes from typography and space, not from many colors or heavy UI. |

Tone in copy: direct, declarative, lightly literary. Short lines. Italics for emphasis, not bold.

---

## 2. Site structure

A static site hosted on GitHub Pages, served at the apex domain via `CNAME` (`zhenaixiao.com`).
Each page is a directory with an `index.html`, so URLs are clean and never expose a filename.

| URL | File | Purpose | Theme |
|---|---|---|---|
| `/` | `index.html` | Main consulting site (English). Hero: "Your company is ready to scale. / Your brand may not be." | Crimson |
| `/cn/` | `cn/index.html` | Chinese-language version of the consulting site. Mirrors the layout; adds CJK fonts. | Crimson |
| `/coaching/` | `coaching/index.html` | 1:1 Coaching — communications & professional image. | Aqua |
| `/privacy/` | `privacy/index.html` | Privacy policy. Same shell, simplified single-column body. | Crimson accent |

**All internal links and asset references are root-absolute** — `/`, `/cn/`, `/coaching/`,
`/privacy/`, `/assets/…`, `/images/…` — so navigation behaves identically from any directory
depth and never points at an `index.html` file. The EN ⇄ 中文 toggle in the nav links `/` and `/cn/`.

---

## 3. Front-end architecture

Everything is shared and external — no inline CSS, JS, or base64 in the HTML.

```
/assets/style.css   one stylesheet for all pages
/assets/main.js     one script for all pages
/images/            extracted raster assets (photos, partner logos)
```

**Stylesheet (`/assets/style.css`)** — organised with cascade layers:

```css
@layer reset, tokens, pages;
```

- **reset** — universal box-sizing reset, `html { scroll-behavior: smooth }`, and a
  `@media (prefers-reduced-motion: reduce)` block that neutralises animation/transition.
- **tokens** — global design tokens on `:root`, then per-page theme overrides on
  `body.page-index`, `body.page-ch`, `body.page-coaching`, `body.page-privacy`.
- **pages** — each page's rules, **scoped under its `body.page-*` class** and authored with
  **native CSS nesting** (`&:hover`, `& .child`, nested `@media`). Scoping is what lets the
  crimson site and the aqua coaching page coexist in a single file without colliding.
  Keyframes are namespaced per page (`ix-`, `ch-`, `cg-`).

**Script (`/assets/main.js`)** — small IIFE modules, each **guarded by element presence**, so a
page only runs the features it actually contains. `<body class="page-*">` selects behaviour
(e.g. the scroll-reveal variant); Chinese form copy is localised via `document.documentElement.lang`.

**Body class** is the single source of page identity for both CSS scoping and JS branching:
`page-index`, `page-ch`, `page-coaching`, `page-privacy`.

Two tiny, theme-coloured SVGs (the page-grain overlay and the `<select>` chevron) stay inline
in the CSS as `url(...)` data URIs — they are part of styling, not content.

---

## 4. Color

Tokens are CSS custom properties. Truly shared values live on `:root`; everything theme-specific
lives on the page's `body.page-*` scope.

**Global (`:root`)**

```css
--ink:   #0C0C0C;                 /* near-black — body text & headlines */
--muted: #6E6E6E;                 /* secondary / supporting text */
--rule:  rgba(12,12,12,0.10);     /* hairline borders & dividers */
--pad:   clamp(24px, 5vw, 80px);  /* shared horizontal gutter */
--f-display: 'The Seasons', 'Cormorant Garamond', Georgia, serif;
```

**Site theme — `page-index`, `page-ch`, `page-privacy`** (crimson on white)

```css
--paper:    #FFFFFF;              /* primary page background */
--red:      #C8102E;             /* primary accent */
--red-deep: #8A0A1F;             /* hover / emphasis */
--red-tint: rgba(200,16,46,0.06);/* faint accent wash */
--max:      1280px;              /* content container */
--gap:      clamp(72px, 10vw, 128px);
/* page-ch also: --f-body adds 'Noto Sans SC'; --f-zh: 'Noto Serif SC','Songti SC',serif */
```

Site sections alternate full-bleed bands via `.section-wrap` modifiers: `.light` (white `--paper`),
`.dark` (near-black `--ink`, white text), `.red` (crimson, white text). Never two identical
adjacent bands. The fixed nav re-tints to match the band beneath it (`on-light`/`on-dark`/`on-red`).

**Coaching theme — `page-coaching`** (aqua on warm paper)

```css
--paper:     #FAF7F2;   /* warm beige paper */
--paper-2:   #F2EBDF;   /* deeper beige for alternating sections */
--aqua:      #A2D5DC;   /* Aqua Mist — primary accent */
--aqua-deep: #7BB7C2;   /* darker aqua — hover / emphasis */
--aqua-navy: #1F4D5C;   /* deep navy-aqua — high-contrast text on aqua */
--aqua-bg:   #E8F2F4;   /* faintest aqua — soft section / card backgrounds */
--max:       1240px;
```

**Usage rules**
- Crimson is the only accent on the main site; aqua is the only accent on coaching. Never mix them.
- Use the accent for eyebrows, section labels, hairline accents, hover states, and italic emphasis
  inside headings — sparingly.
- On a colored band (crimson / near-black / aqua), text is `--ink`, white, or `--aqua-navy` —
  never light gray.
- A fixed page-grain overlay (~5% opacity SVG noise on `body::after`) sits above everything at low
  opacity for warmth. Keep it subtle.

---

## 5. Typography

```css
--f-display: 'The Seasons', 'Cormorant Garamond', Georgia, serif;  /* headlines */
--f-body:    'Poppins', system-ui, sans-serif;                     /* everything else */
```

Loaded from Google Fonts (Poppins) and a CDN (The Seasons); `/cn/` additionally loads Noto Serif SC.

- **Display serif (The Seasons)** — all headlines, hero lines, card titles, pull quotes. Weight 400
  only. Often set in *italic* for the emphasized word or the second line of a headline.
- **Body sans (Poppins)** — paragraphs, navigation, labels, buttons. Body copy is **light (300)**;
  labels and buttons step up to 500–600.

**Type scale (fluid `clamp()`, site theme):**

| Role | Selector | Size |
|---|---|---|
| Hero headline | `.hero-headline` | `clamp(36px, 5.5vw, 88px)` |
| Hero tagline | `.hero-shorthand` | `clamp(20px, 2.4vw, 32px)` (serif italic) |
| Section heading | `.section-heading` | `clamp(36px, 5vw, 68px)` |
| Contact headline | `.contact-headline` | `clamp(36px, 4.8vw, 60px)` |
| Form headline | `.form-headline` | `clamp(26px, 3.4vw, 40px)` |
| Lead paragraph | `.about-lead` | `clamp(24px, 2.6vw, 34px)` |
| Process step number | `.step-num` | `clamp(26px, 2.8vw, 36px)` |
| Card / step title | `.step-title`, `.flow-card-title` | `clamp(19px, 1.8vw, 24px)` / `clamp(22px, 2vw, 28px)` |
| Section sub | `.section-sub` | `clamp(15px, 1.3vw, 17px)`, `--muted` |
| Body | — | `16px`, weight 300, line-height 1.65 |
| Eyebrow / label | `.hero-eyebrow`, `.section-label` | `11px`, weight 500, uppercase, letter-spacing ≈0.28em |

The coaching page uses the same families with a slightly larger hero (`clamp(34px, 5.4vw, 84px)`).

**Rules of thumb**
- Headlines: tight negative tracking, serif, 400 weight. Let size + space carry the weight — avoid bold.
- Labels & eyebrows: tiny, uppercase, wide tracking, paired with a short hairline rule (`::before`).
- Keep measure narrow: headings short, body ≤ ~60ch.

---

## 6. Layout & spacing

```css
--max: 1280px;  /* site container (1240px on coaching) */
--pad: clamp(24px, 5vw, 80px);    /* shared horizontal gutter */
--gap: clamp(72px, 10vw, 128px);  /* large vertical rhythm */
```

- Center content in a `--max` container; pad page edges with `--pad` everywhere (nav, hero,
  sections, footer all share it).
- Structure: **`.section-wrap`** (full-bleed background band) → **`.section`** (max-width +
  padding). This separation lets colored bands wrap centered content.
- Standard section opener: `.section-label` (tiny accent eyebrow with leading hairline) →
  `.section-heading` (large serif, optional accent `em` italic) → `.section-sub` (one muted line)
  → content grid.
- Prefer asymmetry and clear grids that collapse gracefully (e.g. 4 → 2 → 1 columns).

---

## 7. Components

**Navigation (site)** — fixed `<nav>` with `--pad` gutters and `backdrop-filter: blur`.
`.nav-mark` (an accent `.nav-dot` + serif `.nav-name`) on the left; `.nav-links` (uppercase 11px),
the serif-italic `.nav-coaching` link, the `.lang-toggle` (`.lang-opt` EN | 中文), and the outline
`.nav-cta` ("Let's Work Together") on the right. The bar re-tints to `on-red` / `on-light` /
`on-dark` to match the `[data-bg]` band beneath it (set by JS). Below **880px** the links collapse
into a full-screen `.mobile-drawer` opened by `.nav-menu-btn`.

**Navigation (coaching)** — `#topNav` with links Consulting / 1:1 Coaching / About / Contact and a
smaller `.nav-cta` ("Request a Session"). Gains a translucent-paper `.scrolled` state after half a viewport.

**Buttons / CTAs** — `.nav-cta` is a 1px outline, uppercase 11px tracked label that fills on hover.
Keep buttons rectangular and restrained — no large radii, no gradients, no default shadows.

**Hero** — `.hero` band with `.hero-eyebrow`, a two-line `.hero-headline` (`.line-1` / `.line-2`,
the second often accent italic), and a serif `.hero-shorthand` tagline.

**Cards** — white or faint-accent background, `1px var(--rule)` hairline border,
`border-radius: 14px`, generous padding. Hover: gentle lift + soft accent shadow + border darkens.
Used for coaching method `.flow-card`s and the site's numbered `.process-step`s.

**Carousel (site About)** — `.carousel` › `.carousel-track` › `.carousel-slide`, with
`.carousel-dot` indicators and `.carousel-nav` prev/next. Auto-advances every 3.5s; manual control
pauses for 8s.

**Trusted-by** — `.trusted` strip with `.trusted-logo` partner marks (CIPP, Chaîne de Vie).

**Form** — `.form-section` with `.form-field`s, `.form-label`s, checkbox group, `.form-submit`, and
a `.form-status` line that shows `success` / `error` states. Submits via AJAX to Formspree.

**Floating contacts (site)** — `.floating-contacts` rail of `.fc-item`s (email, WhatsApp, LinkedIn)
plus a `.fc-wechat` popover. Fades in ~2.8s after load.

**Hairline rules** — 1px lines in `--rule` or the accent, ~22–36px wide, used as quiet dividers
under labels and titles. A signature detail; use liberally but thin.

---

## 8. Motion

- **Entrance:** hero elements fade/float in on load via per-page keyframes (`fadeIn`, `floatDown`,
  `arrowPulse`, namespaced `ix-`/`ch-`/`cg-`) on a `cubic-bezier(0.16, 1, 0.3, 1)` ease, staggered
  so the headline reveals line by line.
- **Scroll reveal:** elements marked `.js-reveal` are observed with an `IntersectionObserver`. The
  site/`cn` add `.visible` and stagger siblings ~100ms; coaching adds `.in-view` with a bottom
  `rootMargin`.
- **Hover:** 0.2–0.4s transitions on color, transform, shadow, border. Subtle and quick.
- `html { scroll-behavior: smooth }`.
- **Reduced motion:** a `@media (prefers-reduced-motion: reduce)` block in the reset layer
  collapses animations and transitions for users who request it.

---

## 9. Responsive

- One fluid system via `clamp()` for type and padding — minimal hard breakpoints.
- Key breakpoints: **1080 / 960px** (grid column counts step down), **880px** (nav collapses to the
  mobile drawer; multi-column flows stack to one), **760 / 720 / 640px** (further stacking),
  **540 / 480px** (single-column cards).
- Stacked grids switch horizontal connectors/arrows to vertical.
- Test the hero, nav drawer, and every grid at 1440 / 1024 / 768 / 390px widths.

---

## 10. Do / Don't

**Do**
- Lead with serif headlines, whitespace, and one calm accent per surface.
- Use italics and size for emphasis.
- Alternate background bands to pace long pages.
- Keep copy tight and declarative.
- Keep everything external and scoped: edit `/assets/style.css` and `/assets/main.js`, not the HTML.

**Don't**
- Mix crimson and aqua, or introduce a third accent / bright saturated UI colors.
- Use heavy drop shadows, gradients, or large border-radii.
- Bold-weight headlines or center everything.
- Inline CSS/JS or base64 images back into the HTML.
- Crowd sections — when in doubt, add space.
