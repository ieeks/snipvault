# Snippet & Category Data Schema

Reference for the data structures used in `script.js`.

---

## Snippet Object

```js
{
  id:       Number,    // unique — integer for built-ins, Date.now() for user-created
  title:    String,    // display name, required
  desc:     String,    // one-line description
  cat:      String,    // must match a category name in state.categories
  tags:     String[],  // free-form, lowercase, comma-separated on input
  starred:  Boolean,
  lang:     String,    // drives Prism.js highlighting (see PRISM_LANG map)
  lastUsed: String,    // human-readable, e.g. "2h ago" or "just now"
  copies:   Number,    // incremented on copy-to-clipboard
  code:     String,    // the actual code content
}
```

## Category Object

```js
{
  name: String,   // display name and key — must be unique (case-insensitive check on add)
  icon: String,   // single Unicode symbol, auto-assigned from CAT_ICONS pool
}
```

---

## localStorage Keys

| Key                    | Type       | Description                                    |
|------------------------|------------|------------------------------------------------|
| `snipvault-snippets`   | `Snippet[]`  | Full snippet array, saved on every mutation  |
| `snipvault-categories` | `Category[]` | Full category array, saved on every mutation |
| `snipvault-theme`      | `string`     | `"dark"` or `"light"`                        |

**First-visit behaviour:** if a key is `null` (never set), seed data is loaded from the hardcoded arrays in `script.js`. If a key is `"[]"` (explicitly cleared), the app starts empty.

To reset to factory defaults:
```js
localStorage.removeItem('snipvault-snippets');
localStorage.removeItem('snipvault-categories');
location.reload();
```

---

## Prism Language Map (`PRISM_LANG`)

```js
const PRISM_LANG = {
  javascript: 'javascript',   // ✓ full highlighting
  python:     'python',       // ✓ full highlighting
  vba:        'vbscript',     // ✓ approximate (VBScript grammar)
  excel:      '',             // plain monospace — no Prism grammar
  abap:       '',             // plain monospace — no Prism grammar
};
```

Custom categories added at runtime fall through to `langForCat()` which checks `LANG_MAP` first and returns `'plaintext'` for unknown entries.

---

## Adding Built-in Snippets

Add entries to the `SNIPPETS` array at the top of `script.js`. Use small integer IDs (1, 2, 3 …) — user-created snippets use `Date.now()`, so there's no collision risk.

## Adding Built-in Categories

Add entries to `DEFAULT_CATEGORIES`:
```js
{ name: 'Go', icon: '◐' }
```

Also add a Prism language mapping if one exists:
```js
const PRISM_LANG = { ..., go: 'go' };
const LANG_MAP   = { ..., Go: 'go' };
```
