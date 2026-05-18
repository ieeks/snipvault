# SnipVault

A personal code snippet manager — local-first, no backend, no build step. Single-page app in vanilla HTML/CSS/JS.

## Features

- **Three-column layout** — categories · list · detail (Layout A)
- **Syntax highlighting** via [Prism.js](https://prismjs.com/) — One Dark (dark) / Solarized Light (light), switches automatically
- **Keyboard navigation** — `⌘K` focuses search, `⌘N` opens new snippet, `↑`/`↓` navigate results, `Enter` selects
- **Dark / Light mode** — FOUC-free init, persisted via `localStorage`; toggle shows ◐/◑ geometric icons
- **Dynamic categories** — add from sidebar, auto-icon, persisted
- **Snippet CRUD** — add, edit (pre-filled modal), duplicate, delete (custom confirm dialog)
- **Tag-based filtering** — click any tag in the detail panel to filter the list; active tag shown as a dismissible bar; stacks with category, search, and starred filters
- **Star / Favourite** — filter to starred only
- **Sort by last used** — `⇅ Recent` toggle sorts list by most recently copied/edited; `lastUsedAt` timestamp updated on every copy
- **Copy to clipboard** — one-click, copy counter per snippet (persisted)
- **Copy link / deep-link** — `Link` button copies a `?id=` URL; opening that URL pre-selects the snippet
- **Extended search** — matches title, description, tags, and code content
- **Empty state** — friendly prompt with a "New snippet" button when the vault is empty
- **Mobile view** — on screens ≤640px the snippet list fills the full width; tapping a snippet slides a bottom sheet up from below; swipe the handle down or tap the backdrop to dismiss; sidebar accessible via ☰ hamburger button
- **localStorage persistence** — auto-saves on every mutation, survives reloads
- **GitHub Gist Sync** — enter a GitHub PAT (gist scope) once; snippets and categories sync automatically across all devices via a private Gist; status indicator shows last sync time
- **Hover preview** — hover a snippet row (desktop) to see a floating code preview with syntax highlighting
- **Inline code edit** — ✎ button in the code block edits code directly in the detail panel without opening the modal
- **Drag & drop reorder** — drag snippet rows to reorder (default sort only)
- **Rename / delete categories** — hover a category to reveal ✎ and × actions; rename updates all snippets automatically
- **JSON Export / Import** — portable backup, works across browsers and devices
- **Clear all data** — wipes everything for a clean deploy

## Stack

```
index.html   — structure
styles.css   — design tokens, layout, components, dark mode, Prism overrides, mobile
script.js    — state, rendering, filtering, keyboard nav, modal, persistence, mobile sheet
```

CDN dependencies (no install):
- [Prism.js 1.29](https://cdnjs.com/libraries/prism) — syntax highlighting
- [DM Sans + DM Mono](https://fonts.google.com/) — typography

## Supported Languages

| Category | Prism grammar  |
|----------|----------------|
| API / JS | `javascript`   |
| Python   | `python`       |
| VBA      | `vbscript`     |
| SAP ABAP | plain mono     |
| Excel    | plain mono     |
| Custom   | plain mono     |

## Keyboard Shortcuts

| Key        | Action                          |
|------------|---------------------------------|
| `⌘K`       | Focus search                    |
| `⌘N`       | Open new snippet modal          |
| `↑` / `↓`  | Navigate search results         |
| `Enter`    | Select focused snippet          |
| `Escape`   | Clear focus / close modal       |

## localStorage Keys

| Key                      | Contains                                      |
|--------------------------|-----------------------------------------------|
| `snipvault-snippets`     | Array of snippet objects                      |
| `snipvault-categories`   | Array of `{name, icon}` objects               |
| `snipvault-theme`        | `"dark"` or `"light"`                         |
| `snipvault-gist-token`   | GitHub PAT for Gist Sync (if connected)       |
| `snipvault-gist-id`      | ID of the linked Gist (if connected)          |
| `snipvault-welcome`      | `"1"` once onboarding modal has been seen     |

First visit with no localStorage data → sample snippets and default categories are loaded as seed.

## Running Locally

```sh
open index.html
# or serve with any static server:
python3 -m http.server 8080
```

## Deploy to GitHub Pages

1. Clear demo data via **⚠ Clear all data** in the sidebar (or leave it for demo purposes)
2. Push `index.html`, `styles.css`, `script.js` to a repo root
3. Enable GitHub Pages → branch `main` / root

No build step. No CI needed.

## Design Origin

Designed in [Claude Design](https://claude.ai/design) — Layout A, green accent `#2d9e6b`, dark-first.
Implemented as pixel-faithful vanilla JS by Claude Code.

See [CHANGELOG.md](CHANGELOG.md) for full version history.
