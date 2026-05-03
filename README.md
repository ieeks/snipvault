# SnipVault

A personal code snippet manager — local-first, no backend, no build step. Single-page app in vanilla HTML/CSS/JS.

## Features

- **Three-column layout** — categories · list · detail (Layout A)
- **Syntax highlighting** via [Prism.js](https://prismjs.com/) — One Dark (dark) / Solarized Light (light), switches automatically
- **Keyboard navigation** — `⌘K` focuses search, `↑`/`↓` navigates results, `Enter` selects, `⌘N` opens new snippet modal
- **Dark / Light mode** — FOUC-free init, persisted via `localStorage`
- **Dynamic categories** — add from sidebar, auto-icon, persisted
- **Snippet CRUD** — add, edit (pre-filled modal), duplicate, delete (custom confirm dialog)
- **Tag-based filtering** — click any tag in the detail panel to filter the list; active tag shown as a dismissible bar; stacks with category and search filters
- **Star / Favourite** — filter to starred only
- **Copy to clipboard** — one-click, copy counter per snippet
- **Copy link / deep-link** — `⛓ Link` button copies a `?id=` URL; opening that URL pre-selects the snippet
- **Empty state** — friendly prompt with a "New snippet" button when the vault is empty
- **localStorage persistence** — auto-saves on every mutation, survives reloads
- **JSON Export / Import** — portable backup, works across browsers and devices
- **Clear all data** — wipes everything for a clean deploy

## Stack

```
index.html   — structure
styles.css   — design tokens, layout, components, dark mode, Prism overrides
script.js    — state, rendering, filtering, keyboard nav, modal, persistence
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

| Key                    | Contains                        |
|------------------------|---------------------------------|
| `snipvault-snippets`   | Array of snippet objects        |
| `snipvault-categories` | Array of `{name, icon}` objects |
| `snipvault-theme`      | `"dark"` or `"light"`           |

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
