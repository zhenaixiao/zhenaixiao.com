# zhenaixiao.com — to do

## French (FR-CA) — homepage done, awaiting review
`/fr/` is built as a real indexed page (not an in-page swap), matching how
`/cn/` works. Search engines see the French; a shared French link previews in
French. `hreflang` tags on all three pages point at each other.

The page reuses the `page-index` stylesheet — French is Latin script, so no
CSS fork was needed, unlike `/cn/`.

### Still English-only
- **`/coaching/`** — the French nav and the About callout both link here, so a
  French visitor lands on an English page. Biggest remaining gap.
- **`/privacy/`** — footer links to it as *Politique de confidentialité*.

## Open decisions
- **"Trusted By" label.** The strip carries Atelier du Bund alongside two client
  logos. FR uses *Ils me font confiance*.
- **Apostrophes.** The whole site uses straight `'`, including the new French
  page (kept consistent on purpose). Careful French typography wants the curly
  `’`, and French uses apostrophes twice as often as English. Worth a
  site-wide pass if you want it — all three languages together, not just FR.
