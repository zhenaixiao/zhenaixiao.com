# Design Guide — zhenaixiao.com

The design language for **Zhenai Xiao — Communications & Market Development Consultant**.
This document captures the visual system so every page feels like one considered, premium brand:
editorial, calm, and quietly confident. The site should read like a high-end print magazine
that happens to live on the web — never a generic SaaS template.

---

## 1. Brand personality

| Trait | What it means for design |
|---|---|
| **Editorial** | Generous whitespace, serif display headlines, asymmetric layouts, magazine-style eyebrows and section labels. |
| **Warm & human** | Beige "paper" backgrounds and a subtle grain texture instead of stark white. The work is about people and trust. |
| **Precise** | Tight letter-spacing on headlines, hairline rules, restrained palette. Nothing decorative without a reason. |
| **Confident, not loud** | One accent color (aqua). Emphasis comes from typography and space, not from many colors or heavy UI. |

Tone in copy: direct, declarative, lightly literary. Short lines. Italics for emphasis, not bold.

---

## 2. Color

Defined as CSS custom properties on `:root`.

```css
--ink:       #0C0C0C;   /* near-black — body text, headlines, high contrast */
--paper:     #FAF7F2;   /* warm beige — primary page background */
--paper-2:   #F2EBDF;   /* slightly deeper beige — alternating sections */
--aqua:      #A2D5DC;   /* Aqua Mist — primary accent, hero blocks */
--aqua-deep: #7BB7C2;   /* darker aqua — hover, labels, emphasis */
--aqua-navy: #1F4D5C;   /* deep navy-aqua — high-contrast text on aqua */
--aqua-bg:   #E8F2F4;   /* faintest aqua — soft section / card backgrounds */
--muted:     #6E6E6E;   /* secondary / supporting text */
--rule:      rgba(12,12,12,0.10); /* hairline borders & dividers */
```

**Usage rules**
- Backgrounds rotate between `--paper`, `--paper-2`, `--aqua-bg`, and white to give long pages rhythm. Never two identical adjacent sections.
- **Aqua is the only accent.** Use it for eyebrows, section labels, hairline accents, hover states, and italic emphasis inside headings — sparingly.
- Pure white (`#fff`) is reserved for cards and the occasional clean section, not the page base.
- For text on an aqua background, use `--ink` or `--aqua-navy` — never light gray.
- A fixed full-page **paper grain** overlay (~5% opacity SVG noise) sits above everything at low opacity for warmth. Keep it subtle.

---

## 3. Typography

Two families, loaded from Google Fonts / CDN:

```css
--f-display: 'The Seasons', 'Cormorant Garamond', Georgia, serif;  /* headlines */
--f-body:    'Poppins', system-ui, sans-serif;                     /* everything else */
```

- **Display serif (The Seasons)** — all headlines, hero lines, card titles, pull quotes. Weight 400 only. Often set in *italic* for the second line of a headline or for emphasized words.
- **Body sans (Poppins)** — paragraphs, navigation, labels, buttons. Body copy is **light (300)**; labels and buttons step up to 500–600.

**Type scale (fluid, via `clamp()`):**

| Role | Size | Notes |
|---|---|---|
| Hero headline | `clamp(34px, 5.2vw, 76px)` | line-height 1.05, letter-spacing −0.02em, serif |
| Section heading | `clamp(34px, 4.4vw, 60px)` | line-height 1.08, serif, `em` → aqua italic |
| Card title | `clamp(24px, 2.4vw, 30px)` | serif 400 |
| Hero tagline | `clamp(20px, 2.2vw, 30px)` | serif italic |
| Body | 16px | weight 300, line-height 1.6–1.65, max ~60ch |
| Eyebrow / label | 11px | weight 500, uppercase, letter-spacing 0.18–0.28em |
| Card body / fine | 13–14px | weight 300, color `--muted` |

**Rules of thumb**
- Headlines: tight tracking (negative), serif, 400 weight. Let size + space carry the weight — avoid bold.
- Labels & eyebrows: tiny, uppercase, wide tracking, often paired with a 28–36px hairline rule (`::before`).
- Keep measure narrow: headings ≤ 22ch, body ≤ 60ch.

---

## 4. Layout & spacing

```css
--max: 1240px;                    /* content container */
--pad: clamp(24px, 5vw, 80px);    /* consistent horizontal gutter */
```

- Center content in a `--max` container; pad the page edges with `--pad` everywhere (nav, hero, sections, footer all share it).
- **Vertical section padding:** `clamp(80px, 11vw, 130px)` top and bottom. Sections should breathe.
- Structure: `.section-wrap` (sets the background color) → `.section` (sets max-width + padding). This separation lets full-bleed color bands wrap centered content.
- Prefer asymmetry and clear grids over centered everything. Multi-item areas use CSS grid that collapses gracefully (e.g. 5 → 3 → 2 → 1 columns).

**Standard section opener pattern:**
1. `.section-label` — tiny aqua uppercase eyebrow with a leading hairline.
2. `.section-heading` — large serif headline (with optional aqua `em` italic).
3. `.section-sub` — one muted supporting paragraph, max 60ch.
4. Content grid below, with generous top margin.

---

## 5. Components

**Navigation** — fixed top bar, `--pad` gutters. Tinted aqua + `backdrop-filter: blur(14px)` over the hero; on scroll, swaps to translucent paper (`.scrolled`). Left: a small aqua dot + serif name mark. Right: uppercase 11px links (active link gets an aqua underline) and an outlined `.nav-cta` button. Below 880px the links collapse into a full-screen dark `.mobile-drawer` with oversized serif links.

**Buttons / CTAs**
- *Outline CTA* (`.nav-cta`): 1px ink border, uppercase 11px tracked label, fills to ink-on-paper on hover.
- *Primary connect button* (`.connect-btn`): solid, paired with a small arrow glyph (`.connect-btn-arrow`) that nudges right on hover.
- Keep buttons rectangular and restrained — no large radii, no gradients, no shadows by default.

**Cards** — white or `--aqua-bg`, `1px` hairline border, `border-radius: 14px`, padding ~32–36px. Hover lift: `translateY(-4px)` + soft aqua shadow `0 12px 32px rgba(123,183,194,0.18)` + border darkens to `--aqua-deep`. Used for the method "flow" cards, archetype grid, and work pillars.

**Hairline rules** — 1px lines in `--rule` or `--aqua-deep`, 22–36px wide, used as quiet dividers under labels and card titles. A signature detail; use liberally but thin.

---

## 6. Motion

- **Entrance:** hero elements fade/float in on load — `fadeIn` and `floatDown` (translateY −12px → 0) on a `cubic-bezier(0.16, 1, 0.3, 1)` ease, staggered ~0.2s → 1.8s so the headline reveals line by line.
- **Scroll reveal:** content uses a `.js-reveal` pattern (IntersectionObserver) to fade up as it enters the viewport.
- **Hover:** 0.2–0.4s transitions on color, transform, shadow, border. Subtle and quick.
- `html { scroll-behavior: smooth; }`.
- Keep all motion gentle and short — it should feel composed, never bouncy. Respect `prefers-reduced-motion` where possible.

---

## 7. Pages

| File | Purpose | Notes |
|---|---|---|
| `index.html` | Main consulting site — *Communications & Market Development Consultant*. | Hero: "Your company is ready to scale. / Your brand may not be." |
| `coaching.html` | 1:1 Coaching — communications & professional image. | Sections: Method (Clarity → Contrast → Knowledge), Archetypes, Work pillars (Voice & Speech, Image & Presence, Positioning & Narrative), contact. |
| `ch.html` | Chinese-language version of the consulting site. | Mirror layout/system; toggled via `.lang-pill`. |
| `privacy.html` | Privacy policy. | Same shell, simplified single-column body. |
| `CNAME` | Custom domain → `zhenaixiao.com`. | Static hosting (GitHub Pages style). |

All pages share the same nav, footer, color tokens, type system, and grain overlay so the brand stays seamless across languages and offerings.

---

## 8. Responsive

- Single fluid system via `clamp()` for type and padding — minimal hard breakpoints.
- Key breakpoints: **1080px** and **720px** (grid column counts step down), **880px** (nav collapses to drawer; multi-column flows stack to one column), **480px** (single-column cards).
- Stacked grids switch from horizontal arrows/connectors to vertical (e.g. `.flow-arrow` rotates 90°).
- Test the hero, nav drawer, and every grid at 1440 / 1024 / 768 / 390px widths.

---

## 9. Do / Don't

**Do**
- Lead with serif headlines, whitespace, and one calm accent.
- Use italics and size for emphasis.
- Alternate background bands to pace long pages.
- Keep copy tight and declarative.

**Don't**
- Introduce a second accent color or use bright/saturated UI colors.
- Use heavy drop shadows, gradients, or large border-radii.
- Bold-weight headlines or center everything.
- Crowd sections — when in doubt, add space.
