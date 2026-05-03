'use strict';

/* ── DATA ─────────────────────────────────────────────────── */
const SNIPPETS = [
  {
    id: 1, title: 'HTTP Auth Header', desc: 'Bearer token builder for REST APIs',
    tags: ['api', 'auth'], cat: 'API', starred: true, lang: 'javascript',
    lastUsed: '2h ago', copies: 14,
    code: `const buildAuthHeader = (token) => ({
  Authorization: \`Bearer \${token}\`,
  'Content-Type': 'application/json',
});

// Usage
fetch(url, {
  headers: buildAuthHeader(myToken)
});`,
  },
  {
    id: 2, title: 'Rate Limit Handler', desc: 'Exponential backoff with jitter',
    tags: ['api', 'js'], cat: 'API', starred: false, lang: 'javascript',
    lastUsed: '1d ago', copies: 7,
    code: `async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try { return await fn(); }
    catch (e) {
      if (i === maxRetries - 1) throw e;
      await sleep(2 ** i * 1000 + Math.random() * 500);
    }
  }
}`,
  },
  {
    id: 3, title: 'OAuth2 PKCE Flow', desc: 'Auth code + verifier generation',
    tags: ['api', 'auth'], cat: 'API', starred: false, lang: 'javascript',
    lastUsed: '3d ago', copies: 3,
    code: `const generateVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/[+/=]/g, c => ({'+':'-','/':'_','=':''})[c]);
};`,
  },
  {
    id: 4, title: 'VBA Macro Runner', desc: 'Macro with error trapping',
    tags: ['vba', 'excel'], cat: 'VBA', starred: false, lang: 'vba',
    lastUsed: '5d ago', copies: 22,
    code: `Sub RunMacroSafe()
  On Error GoTo ErrHandler
  ' Your macro logic here
  Dim ws As Worksheet
  Set ws = ThisWorkbook.Sheets("Data")
  ws.Range("A1").Value = Now()
  Exit Sub
ErrHandler:
  MsgBox "Error: " & Err.Description
End Sub`,
  },
  {
    id: 5, title: 'VLOOKUP Template', desc: 'Multi-sheet lookup with fallback',
    tags: ['excel', 'formula'], cat: 'Excel', starred: true, lang: 'excel',
    lastUsed: '1h ago', copies: 31,
    code: `=IFERROR(
  VLOOKUP(A2, Sheet2!$A:$D, 3, FALSE),
  VLOOKUP(A2, Sheet3!$A:$D, 3, FALSE)
)

' Or with XLOOKUP (Excel 365):
=XLOOKUP(A2, Sheet2!A:A, Sheet2!C:C, "Not found")`,
  },
  {
    id: 6, title: 'SAP RFC Call', desc: 'BAPI function module wrapper',
    tags: ['sap', 'abap'], cat: 'SAP', starred: false, lang: 'abap',
    lastUsed: '2d ago', copies: 9,
    code: `CALL FUNCTION 'BAPI_MATERIAL_GET_DETAIL'
  EXPORTING
    material = lv_matnr
  IMPORTING
    material_general_data = ls_mara
  EXCEPTIONS
    material_not_found = 1
    OTHERS = 2.

IF sy-subrc <> 0.
  MESSAGE e001(zz) WITH 'Material not found'.
ENDIF.`,
  },
  {
    id: 7, title: 'Python Dict Merge', desc: 'Deep merge two dicts recursively',
    tags: ['python'], cat: 'Python', starred: false, lang: 'python',
    lastUsed: '4h ago', copies: 5,
    code: `def deep_merge(base: dict, override: dict) -> dict:
    result = base.copy()
    for key, value in override.items():
        if key in result and isinstance(result[key], dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result`,
  },
];

/* ── DEFAULT CATEGORIES ────────────────────────────────────── */
const DEFAULT_CATEGORIES = [
  { name: 'API',    icon: '⬡' },
  { name: 'VBA',    icon: '⬢' },
  { name: 'SAP',    icon: '◆' },
  { name: 'Excel',  icon: '▦' },
  { name: 'Python', icon: '◎' },
];

/* ── PRISM LANGUAGE MAP ────────────────────────────────────── */
const PRISM_LANG = {
  javascript: 'javascript',
  python:     'python',
  vba:        'vbscript',
  excel:      '',     // no Prism grammar — plain monospace
  abap:       '',     // no Prism grammar — plain monospace
};

/* ── PERSISTENCE ───────────────────────────────────────────── */
const STORAGE_KEY      = 'snipvault-snippets';
const STORAGE_KEY_CATS = 'snipvault-categories';
const CAT_ICONS        = ['◉', '◈', '◎', '⬡', '⬢', '◆', '▦', '▣', '◐', '◑', '◒', '◓', '⬟', '⬠'];

function loadSnippets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // null = key never set → first visit → show sample data
    if (raw !== null) return JSON.parse(raw);
  } catch (e) {}
  return JSON.parse(JSON.stringify(SNIPPETS));
}

function loadCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATS);
    if (raw !== null) return JSON.parse(raw);
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
}

function saveSnippets() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.snippets)); } catch (e) {}
}

function saveCategories() {
  try { localStorage.setItem(STORAGE_KEY_CATS, JSON.stringify(state.categories)); } catch (e) {}
}

function clearAllData() {
  showConfirm('Delete all snippets and categories? This cannot be undone.', () => {
    state.snippets    = [];
    state.categories  = [];
    state.selectedId  = null;
    state.cat         = 'all';
    saveSnippets();
    saveCategories();
    renderSidebar();
    renderList();
    renderDetail();
  });
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(state.snippets, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `snipvault-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('Expected array');
      state.snippets   = data;
      state.selectedId = data[0]?.id ?? null;
      saveSnippets();
      renderList();
      renderDetail();
    } catch {
      alert('Invalid JSON file — could not import snippets.');
    }
  };
  reader.readAsText(file);
}

/* ── STATE ─────────────────────────────────────────────────── */
const state = {
  cat:        'all',
  search:     '',
  starred:    false,
  selectedId: null,
  kbdIndex:   -1,
  snippets:   loadSnippets(),
  categories: loadCategories(),
};

/* ── ELEMENTS ──────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const els = {
  themeToggle:   $('theme-toggle'),
  themeIcon:     $('theme-toggle').querySelector('.theme-icon'),
  searchInput:   $('search-input'),
  searchKbd:     $('search-kbd'),
  searchClear:   $('search-clear'),
  catNav:        $('cat-nav'),
  snippetList:   $('snippet-list'),
  detailPanel:   $('detail-panel'),
  newSnippetBtn: $('new-snippet-btn'),
  modalBackdrop: $('modal-backdrop'),
  modal:         $('modal'),
  modalCancel:   $('modal-cancel'),
  modalSave:     $('modal-save'),
  filterBtns:    document.querySelectorAll('.filter-btn'),
};

/* ── THEME ─────────────────────────────────────────────────── */
const PRISM_DARK  = 'https://cdn.jsdelivr.net/npm/prism-themes@1.9.0/themes/prism-one-dark.css';
const PRISM_LIGHT = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-solarizedlight.min.css';

function getTheme() {
  return document.documentElement.getAttribute('data-theme');
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('snipvault-theme', theme); } catch (e) {}
  document.getElementById('prism-theme').href = theme === 'dark' ? PRISM_DARK : PRISM_LIGHT;
  updateThemeIcon();
  setTimeout(renderDetail, 80); // re-highlight once new stylesheet has loaded
}

function updateThemeIcon() {
  els.themeIcon.textContent = getTheme() === 'dark' ? '☀' : '☾';
}

els.themeToggle.addEventListener('click', () => {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
});

updateThemeIcon();

/* ── SEARCH ────────────────────────────────────────────────── */
els.searchInput.addEventListener('input', () => {
  state.search   = els.searchInput.value;
  state.kbdIndex = -1;
  const hasVal   = state.search.length > 0;
  els.searchKbd.hidden   = hasVal;
  els.searchClear.hidden = !hasVal;
  renderList();
});

els.searchInput.addEventListener('keydown', e => {
  const filtered = getFiltered();
  if (!filtered.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    state.kbdIndex = state.kbdIndex < filtered.length - 1 ? state.kbdIndex + 1 : 0;
    renderList();
    scrollKbdFocusIntoView();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    state.kbdIndex = state.kbdIndex > 0 ? state.kbdIndex - 1 : filtered.length - 1;
    renderList();
    scrollKbdFocusIntoView();
  } else if (e.key === 'Enter' && state.kbdIndex >= 0) {
    e.preventDefault();
    const target = filtered[state.kbdIndex];
    if (target) {
      selectSnippet(target.id);
      state.kbdIndex = -1;
      els.searchInput.blur();
    }
  } else if (e.key === 'Escape') {
    els.searchInput.blur();
    state.kbdIndex = -1;
    renderList();
  }
});

function scrollKbdFocusIntoView() {
  const focused = els.snippetList.querySelector('.kbd-focus');
  if (focused) focused.scrollIntoView({ block: 'nearest' });
}

els.searchClear.addEventListener('click', () => {
  state.search   = '';
  state.kbdIndex = -1;
  els.searchInput.value  = '';
  els.searchKbd.hidden   = false;
  els.searchClear.hidden = true;
  els.searchInput.focus();
  renderList();
});

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    els.searchInput.focus();
    els.searchInput.select();
  }
  if (e.key === 'Escape') {
    if (!els.modalBackdrop.hidden) closeModal();
    if (!$('confirm-backdrop').hidden) $('confirm-backdrop').hidden = true;
  }
});

/* ── FILTER BUTTONS ────────────────────────────────────────── */
els.filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    els.filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.starred  = btn.dataset.filter === 'starred';
    state.kbdIndex = -1;
    renderList();
  });
});

/* ── SIDEBAR RENDER ────────────────────────────────────────── */
function renderSidebar() {
  const nav = els.catNav;
  const allCount = state.snippets.length;

  nav.innerHTML = `
    <div class="sidebar-item${state.cat === 'all' ? ' active' : ''}" data-cat="all">
      <span class="cat-icon">◈</span>
      <span class="cat-label">All</span>
      <span class="cat-count">${allCount}</span>
    </div>
    ${state.categories.map(c => {
      const count  = state.snippets.filter(s => s.cat === c.name).length;
      const active = state.cat === c.name;
      return `
        <div class="sidebar-item${active ? ' active' : ''}" data-cat="${escHtml(c.name)}">
          <span class="cat-icon">${escHtml(c.icon)}</span>
          <span class="cat-label">${escHtml(c.name)}</span>
          <span class="cat-count">${count}</span>
        </div>`;
    }).join('')}
  `;
}

/* ── CATEGORY NAV ──────────────────────────────────────────── */
els.catNav.addEventListener('click', e => {
  const item = e.target.closest('.sidebar-item');
  if (!item) return;
  state.cat      = item.dataset.cat;
  state.kbdIndex = -1;
  renderSidebar();
  renderList();
});

/* ── ADD CATEGORY ──────────────────────────────────────────── */
$('add-cat-btn').addEventListener('click', () => {
  $('add-cat-btn').hidden  = true;
  $('add-cat-form').hidden = false;
  $('add-cat-input').value = '';
  $('add-cat-input').focus();
});

function commitAddCategory() {
  const name = $('add-cat-input').value.trim();
  $('add-cat-btn').hidden  = false;
  $('add-cat-form').hidden = true;
  if (!name) return;
  if (state.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) return;
  const icon = CAT_ICONS[state.categories.length % CAT_ICONS.length];
  state.categories.push({ name, icon });
  saveCategories();
  renderSidebar();
}

$('add-cat-input').addEventListener('keydown', e => {
  if (e.key === 'Enter')  { e.preventDefault(); commitAddCategory(); }
  if (e.key === 'Escape') {
    $('add-cat-btn').hidden  = false;
    $('add-cat-form').hidden = true;
  }
});

$('add-cat-input').addEventListener('blur', commitAddCategory);

/* ── FILTERING ─────────────────────────────────────────────── */
function getFiltered() {
  return state.snippets.filter(s => {
    const matchCat    = state.cat === 'all' || s.cat === state.cat;
    const q           = state.search.toLowerCase();
    const matchSearch = !q || s.title.toLowerCase().includes(q) || s.tags.some(t => t.includes(q));
    const matchStar   = !state.starred || s.starred;
    return matchCat && matchSearch && matchStar;
  });
}

/* ── RENDER LIST ───────────────────────────────────────────── */
function renderList() {
  const filtered  = getFiltered();
  const container = els.snippetList;
  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = '<div class="snip-empty">No snippets found</div>';
    return;
  }

  filtered.forEach((s, idx) => {
    const active   = s.id === state.selectedId;
    const kbdFocus = idx === state.kbdIndex;
    const div      = document.createElement('div');
    div.className  = 'snip-row'
      + (active   ? ' active'    : '')
      + (kbdFocus ? ' kbd-focus' : '');
    div.dataset.id = s.id;

    const tagsHTML = s.tags.map(t =>
      `<span class="tag${active ? ' active' : ''}">${escHtml(t)}</span>`
    ).join('');

    div.innerHTML = `
      <div class="snip-header">
        <span class="snip-title">${escHtml(s.title)}</span>
        <button class="snip-star${s.starred ? ' starred' : ''}" data-id="${s.id}" aria-label="Toggle star">
          ${s.starred ? '★' : '☆'}
        </button>
      </div>
      <div class="snip-desc">${escHtml(s.desc)}</div>
      <div class="snip-tags">${tagsHTML}</div>
    `;

    div.addEventListener('click', e => {
      if (e.target.closest('.snip-star')) {
        const id   = Number(e.target.closest('.snip-star').dataset.id);
        const snip = state.snippets.find(x => x.id === id);
        if (snip) {
          snip.starred = !snip.starred;
          saveSnippets();
          renderList();
          if (state.selectedId === id) renderDetail();
        }
        return;
      }
      selectSnippet(s.id);
    });

    container.appendChild(div);
  });
}

/* ── SELECT SNIPPET ────────────────────────────────────────── */
function selectSnippet(id) {
  state.selectedId = id;
  renderList();
  renderDetail();
}

/* ── RENDER DETAIL ─────────────────────────────────────────── */
function renderDetail() {
  const panel = els.detailPanel;
  const snip  = state.snippets.find(s => s.id === state.selectedId);

  if (!snip) {
    panel.innerHTML = '<div class="detail-empty">Select a snippet</div>';
    return;
  }

  const tagsHTML  = snip.tags.map(t => `<span class="tag active">${escHtml(t)}</span>`).join('');
  const prismLang = PRISM_LANG[snip.lang] ?? '';

  panel.innerHTML = `
    <div class="detail-header">
      <div class="detail-title-row">
        <div>
          <div class="detail-title">${escHtml(snip.title)}</div>
          <div class="detail-desc">${escHtml(snip.desc)}</div>
        </div>
        <button class="detail-star${snip.starred ? ' starred' : ''}" id="detail-star-btn" aria-label="Toggle star">
          ${snip.starred ? '★' : '☆'}
        </button>
      </div>
      <div class="detail-meta">
        ${tagsHTML}
        <div class="detail-stats">
          <div class="stat"><div class="stat-label">Cat.</div><div class="stat-value">${escHtml(snip.cat)}</div></div>
          <div class="stat"><div class="stat-label">Last used</div><div class="stat-value">${escHtml(snip.lastUsed)}</div></div>
          <div class="stat"><div class="stat-label">Copies</div><div class="stat-value">×${snip.copies}</div></div>
        </div>
      </div>
    </div>

    <div class="detail-body">
      <div class="code-lang">${escHtml(snip.lang)}</div>
      <div class="code-block">
        <button class="copy-btn" id="copy-btn">⎘ Copy</button>
        <pre><code class="${prismLang ? `language-${prismLang}` : ''}">${escHtml(snip.code)}</code></pre>
      </div>
    </div>

    <div class="detail-footer">
      <button class="action-btn" id="edit-btn">Edit</button>
      <button class="action-btn" id="duplicate-btn">Duplicate</button>
      <div class="spacer"></div>
      <button class="action-btn danger" id="delete-btn">Delete</button>
    </div>
  `;

  // Syntax highlighting
  const codeEl = panel.querySelector('code');
  if (prismLang && window.Prism) Prism.highlightElement(codeEl);

  // Copy
  $('copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(snip.code).then(() => {
      const btn = $('copy-btn');
      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      snip.copies++;
      setTimeout(() => {
        if ($('copy-btn')) { btn.textContent = '⎘ Copy'; btn.classList.remove('copied'); }
      }, 1800);
    });
  });

  // Star
  $('detail-star-btn').addEventListener('click', () => {
    snip.starred = !snip.starred;
    saveSnippets();
    renderList();
    renderDetail();
  });

  // Edit
  $('edit-btn').addEventListener('click', () => openModal(snip));

  // Duplicate
  $('duplicate-btn').addEventListener('click', () => {
    const copy = {
      ...JSON.parse(JSON.stringify(snip)),
      id:       Date.now(),
      title:    snip.title + ' (copy)',
      lastUsed: 'just now',
      copies:   0,
    };
    const idx = state.snippets.findIndex(s => s.id === snip.id);
    state.snippets.splice(idx + 1, 0, copy);
    state.selectedId = copy.id;
    saveSnippets();
    renderList();
    renderDetail();
  });

  // Delete
  $('delete-btn').addEventListener('click', () => {
    showConfirm(`Delete "${snip.title}"?`, () => {
      state.snippets = state.snippets.filter(s => s.id !== snip.id);
      saveSnippets();
      const filtered = getFiltered();
      state.selectedId = filtered.length ? filtered[0].id : null;
      renderList();
      renderDetail();
    });
  });
}

/* ── MODAL ─────────────────────────────────────────────────── */
function buildCategoryOptions(selected) {
  return state.categories.map(c =>
    `<option value="${escHtml(c.name)}"${c.name === selected ? ' selected' : ''}>${escHtml(c.name)}</option>`
  ).join('');
}

const LANG_MAP = { API: 'javascript', VBA: 'vba', SAP: 'abap', Excel: 'excel', Python: 'python' };
function langForCat(cat) { return LANG_MAP[cat] || 'plaintext'; }

// editSnip = existing snippet when editing, null/undefined for new
function openModal(editSnip) {
  const isEdit = !!editSnip;
  els.modal.innerHTML = `
    <div class="modal-title">${isEdit ? 'Edit Snippet' : 'New Snippet'}</div>
    <div class="form-field">
      <label>Title</label>
      <input id="m-title" type="text" placeholder="Title…" value="${isEdit ? escHtml(editSnip.title) : ''}" />
    </div>
    <div class="form-field">
      <label>Description</label>
      <input id="m-desc" type="text" placeholder="Short description…" value="${isEdit ? escHtml(editSnip.desc) : ''}" />
    </div>
    <div class="form-field">
      <label>Category</label>
      <select id="m-cat">${buildCategoryOptions(isEdit ? editSnip.cat : 'API')}</select>
    </div>
    <div class="form-field">
      <label>Tags <span style="font-weight:400;opacity:.6">(comma-separated)</span></label>
      <input id="m-tags" type="text" placeholder="api, auth, …" value="${isEdit ? escHtml(editSnip.tags.join(', ')) : ''}" />
    </div>
    <div class="form-field">
      <label>Code</label>
      <textarea id="m-code" placeholder="Paste your code here…" rows="6">${isEdit ? escHtml(editSnip.code) : ''}</textarea>
    </div>
    <div class="modal-actions">
      <button class="action-btn" id="modal-cancel">Cancel</button>
      <button class="btn-primary" id="modal-save">${isEdit ? 'Save changes' : 'Save snippet'}</button>
    </div>
  `;

  els.modalBackdrop.hidden = false;
  $('m-title').focus();

  $('modal-cancel').addEventListener('click', closeModal);
  $('modal-save').addEventListener('click', () => commitModal(editSnip));
}

function closeModal() {
  els.modalBackdrop.hidden = true;
}

function commitModal(editSnip) {
  const title   = $('m-title').value.trim();
  const desc    = $('m-desc').value.trim();
  const cat     = $('m-cat').value;
  const tagsRaw = $('m-tags').value.trim();
  const code    = $('m-code').value.trim();

  if (!title) { $('m-title').focus(); return; }

  if (editSnip) {
    // Update in-place
    const snip    = state.snippets.find(s => s.id === editSnip.id);
    snip.title    = title;
    snip.desc     = desc;
    snip.cat      = cat;
    snip.lang     = langForCat(cat);
    snip.tags     = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
    snip.code     = code;
    snip.lastUsed = 'just now';
  } else {
    // Create new
    const newSnip = {
      id:       Date.now(),
      title,
      desc:     desc || '',
      cat,
      tags:     tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
      starred:  false,
      lang:     langForCat(cat),
      lastUsed: 'just now',
      copies:   0,
      code:     code || '',
    };
    state.snippets.unshift(newSnip);
    state.selectedId = newSnip.id;
  }

  saveSnippets();
  closeModal();
  renderList();
  renderDetail();
}

els.newSnippetBtn.addEventListener('click', () => openModal());
$('export-btn').addEventListener('click', exportJSON);
$('clear-btn').addEventListener('click', clearAllData);
$('import-input').addEventListener('change', e => {
  if (e.target.files[0]) importJSON(e.target.files[0]);
  e.target.value = '';
});

els.modalBackdrop.addEventListener('click', e => {
  if (e.target === els.modalBackdrop) closeModal();
});

/* ── CONFIRM DIALOG ────────────────────────────────────────── */
function showConfirm(message, onConfirm) {
  const backdrop = $('confirm-backdrop');
  $('confirm-message').textContent = message;
  backdrop.hidden = false;
  $('confirm-ok').focus();

  function cleanup() {
    backdrop.hidden = true;
    $('confirm-ok').removeEventListener('click', handleOk);
    $('confirm-cancel').removeEventListener('click', handleCancel);
    backdrop.removeEventListener('click', handleBackdrop);
  }
  function handleOk()       { cleanup(); onConfirm(); }
  function handleCancel()   { cleanup(); }
  function handleBackdrop(e){ if (e.target === backdrop) cleanup(); }

  $('confirm-ok').addEventListener('click', handleOk);
  $('confirm-cancel').addEventListener('click', handleCancel);
  backdrop.addEventListener('click', handleBackdrop);
}

/* ── UTIL ──────────────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── INIT ──────────────────────────────────────────────────── */
state.selectedId = state.snippets[0]?.id ?? null;
renderSidebar();
renderList();
renderDetail();
