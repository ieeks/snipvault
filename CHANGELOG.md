# Changelog

All notable changes to SnipVault are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned

**Medium**
- Firebase / Firestore backend — sync across devices, replace localStorage
- Inline edit — edit code directly in the detail panel (contenteditable or CodeMirror CDN) instead of modal

**Larger**
- Mobile view — responsive redesign with bottom sheet (Design M-B from original wireframe)
- Drag & drop — reorder snippets and categories
- GitHub Gist sync — alternative to Firebase, no backend required
- Browser extension — save a snippet directly from any webpage

---

## [0.12.0] — 2026-05-04

### Changed
- **Extended search** — search now matches against description and code content in addition to title and tags

---

## [0.11.0] — 2026-05-04

### Added
- **Sort by last used** — `↕ Recent` toggle button in the topbar sorts the snippet list by most recently copied/edited; each snippet gains a `lastUsedAt` timestamp updated on copy and save; toggling back restores insertion order

### Fixed
- **Copy counter not persisted** — `snip.copies` was incremented in memory but `saveSnippets()` was never called in the copy handler; now saved alongside `lastUsedAt` on every copy

---

## [0.10.0] — 2026-05-03

### Added
- **Copy-link / deep-link** — `?id=<snippetId>` in the URL selects the matching snippet on page load; `selectSnippet()` updates the URL via `history.replaceState` on every selection; a **⛓ Link** button in the detail footer copies the shareable URL to the clipboard

---

## [0.9.0] — 2026-05-03

### Added
- **⌘N / Ctrl+N keyboard shortcut** — opens the New Snippet modal from anywhere; ignored when the modal is already open

---

## [0.8.0] — 2026-05-03

### Fixed
- **Sidebar category counts** — counts were stale after create, edit, duplicate, delete, and import; `renderSidebar()` is now called alongside `renderList()` in all five mutation paths

---

## [0.7.0] — 2026-05-03

### Added
- **Tag-based filtering** — clicking any tag pill in the detail panel filters the snippet list to only snippets sharing that tag; an accent-coloured indicator bar appears at the top of the list with an `×` to clear the filter; switching categories resets the tag filter automatically
- **Empty state** — when the vault contains no snippets the detail panel shows a friendly prompt with a "New snippet" button instead of a blank panel

---

## [0.6.0] — 2026-05-03

### Fixed
- **Syntax highlighting now works** — two root causes resolved:
  - `prism-github.css` does not exist in `prism-themes`; correct name is `prism-ghcolors.css` (was causing 404 → no theme loaded at all)
  - `color: var(--text-mid)` on `.code-block pre` was cascading into Prism token `<span>`s and suppressing token colors; moved to `code:not([class])` so only un-highlighted code (Excel, ABAP) gets the fallback color
- **New Snippet button broken** — `openModal` was passed directly as event handler, so the `MouseEvent` was received as `editSnip`; wrapped in `() => openModal()`
- **Custom delete confirmation dialog** — replaced `window.confirm()` with on-brand modal

### Changed
- Prism themes now use two separate CDNs (jsDelivr has One Dark, cdnjs has Solarized Light):
  - Dark: `prism-one-dark.css` via jsDelivr
  - Light: `prism-solarizedlight.min.css` via cdnjs

---

## [0.5.0] — 2026-05-03

### Added
- **Dynamic categories** — add new categories inline from the sidebar; auto-icon assigned from a pool; persisted to `localStorage` under `snipvault-categories`
- **⚠ Clear all data** — wipes all snippets and categories from state and localStorage; intended for clearing demo data before a GitHub Pages deploy; uses custom confirm dialog
- **Edit snippet** — Edit button opens modal pre-filled with all fields; saves in-place without changing the ID
- **Duplicate snippet** — clones the snippet below the original with `(copy)` suffix; auto-selected

### Changed
- Sidebar category items are now rendered dynamically by `renderSidebar()` instead of being hardcoded in HTML
- Category dropdown in the New / Edit modal now reads from `state.categories` instead of a static array
- `loadSnippets()` now distinguishes between "key not set" (first visit → seed data) and "key is empty array" (user cleared data → stay empty)

---

## [0.4.0] — 2026-05-03

### Added
- **localStorage persistence** — snippets auto-save on every mutation; survive page reloads
- **JSON Export** — downloads all snippets as `snipvault-YYYY-MM-DD.json`
- **JSON Import** — loads snippets from a `.json` file; replaces current set
- Export / Import buttons in sidebar footer

---

## [0.3.0] — 2026-05-03

### Added
- **Prism.js syntax highlighting** — `prism-tomorrow` (dark) / `prism-solarizedlight` (light); switches with theme toggle; replaces broken highlight.js integration
- **Keyboard navigation** in search — `↑`/`↓` moves through filtered list, `Enter` selects, `Escape` clears
- **Category dropdown** in "New Snippet" modal (replaces free-text input)
- **Delete snippet** — custom confirm dialog (no browser `confirm()`), list updates automatically

### Fixed
- highlight.js integrity hash was causing silent script block → replaced with Prism.js
- Star toggle in list no longer also triggered snippet selection

---

## [0.2.0] — 2026-05-03

### Added
- "New Snippet" modal with form fields
- Save creates snippet, selects it immediately
- Cancel and backdrop-click close the modal

### Fixed
- Modal opened automatically on load (`display: flex` overriding `[hidden]` attribute) → added `[hidden] { display: none !important }` to reset

---

## [0.1.0] — 2026-05-03

### Added
- Initial implementation from Claude Design handoff (Layout A)
- Three-column layout: sidebar · snippet list · detail panel
- Dark/light mode with FOUC-safe init script, persisted to `localStorage`
- Search with `⌘K` shortcut
- All / Starred filter
- Copy to clipboard with usage counter
- Star / unstar (synced between list and detail)
- Sample data: API (JS), VBA, SAP, Excel, Python
- Fonts: DM Sans + DM Mono
