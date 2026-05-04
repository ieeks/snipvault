# SnipVault — Claude Code Instructions

## Project constraints

- **No framework. No build step.** Exactly three files: `index.html`, `styles.css`, `script.js`.
- CDN-only external dependencies (Prism.js, Google Fonts). No npm, no bundler.
- Deploys directly to GitHub Pages from repo root — `index.html` must stay at root.

---

## Architecture

### Rendering model

Everything is vanilla JS with a simple manual-VDOM pattern:

1. **State** lives in the `state` object (single source of truth).
2. **Render functions** (`renderSidebar`, `renderList`, `renderDetail`) read from `state` and write `innerHTML`. They are cheap to call; call them liberally after mutations.
3. **Event listeners** are attached once on stable container elements (event delegation) or re-attached after each render for detail-panel buttons (which get replaced with `innerHTML`).
4. **No diffing.** If a re-render causes a visible flicker, the fix is usually `focus()` management, not a smarter render strategy.

### State shape

```js
state = {
  cat:        String,    // active category filter ('all' or category name)
  search:     String,    // current search query
  starred:    Boolean,   // starred-only filter active
  tag:        String|null, // active tag filter (null = off); set by clicking a tag in renderDetail
  sort:       String,    // 'default' (insertion order) | 'recent' (by lastUsedAt desc)
  selectedId: Number,    // id of the selected snippet (or null)
  kbdIndex:   Number,    // keyboard-focused row in search results (-1 = none)
  snippets:   Snippet[], // all snippets, mutable
  categories: Category[] // all categories, mutable
}
```

### Snippet shape

```js
{
  id:         Number,   // Date.now() for user-created, small int for seed data
  title:      String,
  desc:       String,
  cat:        String,   // must match a category name in state.categories
  tags:       String[],
  starred:    Boolean,
  lang:       String,   // drives Prism.js (see PRISM_LANG)
  lastUsed:   String,   // human-readable display string e.g. "2h ago" or "just now"
  lastUsedAt: Number,   // unix ms timestamp; updated on copy and edit; 0 = never used
  copies:     Number,   // incremented + persisted on every clipboard copy
  code:       String,
}
```

### Persistence

Every mutation must call `saveSnippets()` or `saveCategories()` before re-rendering. Do not batch saves — call them immediately after the state change. See `SNIPPETS.md` for localStorage key names and first-visit behaviour.

---

## Key functions

| Function | What it does |
|----------|-------------|
| `renderSidebar()` | Rebuilds the category nav from `state.categories` |
| `renderList()` | Rebuilds the snippet list from `getFiltered()` |
| `renderDetail()` | Rebuilds `#detail-inner` for `state.selectedId`; calls `Prism.highlightElement()` |
| `getFiltered()` | Returns filtered + searched + starred + tag-filtered + sorted snippets |
| `selectSnippet(id)` | Sets `state.selectedId`, updates `?id=` URL, renders, opens sheet on mobile |
| `saveSnippets()` | Writes `state.snippets` to localStorage |
| `saveCategories()` | Writes `state.categories` to localStorage |
| `showConfirm(msg, cb)` | Custom confirm dialog (never use `window.confirm()`) |
| `openModal(snip?)` | Opens the New/Edit modal; pass existing snippet for edit mode |
| `commitModal(snip?)` | Reads form fields, updates or creates snippet, saves, re-renders |
| `isMobile()` | Returns true when `window.matchMedia('(max-width: 640px)').matches` |
| `openSheet()` | Adds `.sheet-open` to detail panel and `.visible` to mobile backdrop |
| `closeSheet()` | Removes above classes; resets any mid-drag transform |
| `closeDrawer()` | Removes `.drawer-open` from sidebar; hides backdrop if sheet also closed |

---

## Conventions

- **Never use `window.confirm()` or `window.alert()`** — always use `showConfirm()` or the modal system to stay on-brand.
- **Escape HTML** with `escHtml()` before any string goes into `innerHTML`. Code content especially — it will contain `<`, `>`, `&`.
- **`$('id')`** is a shorthand for `document.getElementById`. Use it. Don't use `querySelector` unless selecting by class/attribute.
- **After mutations** always call `saveSnippets()` / `saveCategories()`, then the relevant render functions. Forgetting `save*` is the most common bug.
- **`state.kbdIndex`** must be reset to `-1` whenever the filtered list changes (search input, category switch, filter toggle) so keyboard focus doesn't land on the wrong row.
- **`state.tag`** must be reset to `null` when switching categories (already done in the catNav click handler). Tag filter stacks with `cat`, `search`, and `starred` — all four are applied in `getFiltered()`.
- **`[hidden]` attribute** works because the CSS reset includes `[hidden] { display: none !important }`. Don't remove that line.
- **`#detail-inner`** is a stable wrapper div inside `.detail-panel`. `renderDetail()` writes to `#detail-inner`, not to the panel directly — this keeps the `.sheet-handle` element alive across re-renders.
- **Mobile functions** (`openSheet`, `closeSheet`, `closeDrawer`) are safe to call on desktop — they're no-ops visually because the CSS classes only have effect inside the `@media (max-width: 640px)` block.

---

## Syntax highlighting (Prism.js)

- Prism is loaded with `Prism.manual = true` — it never auto-runs.
- Call `Prism.highlightElement(codeEl)` manually in `renderDetail()` after inserting the `<code>` element.
- The active Prism theme (`prism-theme` link element) is swapped by `setTheme()`.
- Language is determined by `PRISM_LANG[snip.lang]`. Empty string → no Prism call → plain monospace.
- When adding new language support: add to `PRISM_LANG`, add to `LANG_MAP`, load the Prism component script in `index.html`.

**Theme CDNs** — the two themes live on different CDNs (do not swap without checking the filename exists first):
- Dark (`PRISM_DARK`): `prism-one-dark.css` from `cdn.jsdelivr.net/npm/prism-themes@1.9.0`
- Light (`PRISM_LIGHT`): `prism-solarizedlight.min.css` from `cdnjs.cloudflare.com/libs/prism/1.29.0`

**CSS cascade rule:** never set `color` on `.code-block pre` — it cascades into Prism token `<span>`s and kills syntax colors. Use `code:not([class])` for the plain-text fallback color instead.

---

## Adding a new category (programmatically)

1. Add `{ name: 'Go', icon: '◎' }` to `DEFAULT_CATEGORIES` in `script.js`.
2. Add `go: 'go'` to `PRISM_LANG` and `Go: 'go'` to `LANG_MAP`.
3. Add the Prism component: `<script src="…/prism-go.min.js"></script>` in `index.html`.
4. Existing users won't see it (their `localStorage` takes precedence over `DEFAULT_CATEGORIES`). That's intentional — user data wins.

Note: `◐` and `◑` are reserved for the theme toggle icon — avoid them for category icons.

---

## Deploy checklist (GitHub Pages)

- [ ] Use **⚠ Clear all data** button (or leave demo data intentionally)
- [ ] Ensure `index.html`, `styles.css`, `script.js` are all committed
- [ ] No `.env`, no secrets, no build artifacts
- [ ] GitHub Pages → branch `main` → root `/`
