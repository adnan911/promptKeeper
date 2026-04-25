import { useState, useMemo, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import PromptCard from './components/PromptCard.jsx';
import DetailPanel from './components/DetailPanel.jsx';
import PromptModal from './components/PromptModal.jsx';
import ImportExportModal from './components/ImportExportModal.jsx';
import logo from './assets/logo.jpg';
import { Toast } from './components/UI.jsx';
import { useLocalStorage, useToast, useKeyboard } from './hooks.js';
import { SEED_PROMPTS, DEFAULT_CAT_COLORS } from './data.js';

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Newest' },
  { value: 'mostused', label: 'Most Used' },
  { value: 'az',       label: 'A → Z' },
  { value: 'fav',      label: 'Favorites' },
];

export default function App() {
  const [prompts, setPrompts] = useLocalStorage('pk_prompts_v2', SEED_PROMPTS);
  const [categories, setCategories] = useLocalStorage('pk_categories', ['All', 'Coding', 'Creative', 'Business', 'System', 'Research', 'Personal']);
  const [categoryColors, setCategoryColors] = useLocalStorage('pk_cat_colors', DEFAULT_CAT_COLORS);
  const [modelColors, setModelColors] = useLocalStorage('pk_model_colors', {
    'GPT-4':   '#EBA328', // Golden
    'GPT-3.5': '#EDD8DF', // Cream
    'Claude':  '#AB6937', // Rust
    'Gemini':  '#E8C2B3', // Rose
    'Llama':   '#1E4445', // Teal
    'Mistral': '#233436', // Slate
    'DeepSeek': '#3B82F6',
  });
  const { toasts, show: toast } = useToast();

  const [search, setSearch]           = useState('');
  const [catFilter, setCatFilter]     = useState('All');
  const [tagFilter, setTagFilter]     = useState('');
  const [modelFilter, setModelFilter] = useState('All');
  const [sort, setSort]               = useState('newest');
  const [activeId, setActiveId]       = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [editPrompt, setEditPrompt]   = useState(null);
  const [showIO, setShowIO]           = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme]             = useLocalStorage('pk_theme', 'dark');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useKeyboard({
    'cmd+n': () => openNew(),
    'cmd+k': () => document.getElementById('search-input')?.focus(),
    'escape': () => { setActiveId(null); setShowModal(false); setShowIO(false); setSidebarOpen(false); },
  });

  const activePrompt = useMemo(() => prompts.find(p => p.id === activeId), [prompts, activeId]);

  const filtered = useMemo(() => {
    let r = [...prompts];
    if (catFilter !== 'All')   r = r.filter(p => p.category === catFilter);
    if (modelFilter !== 'All') r = r.filter(p => p.model === modelFilter);
    if (tagFilter)             r = r.filter(p => p.tags.includes(tagFilter));
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
    }
    if (sort === 'newest')   r.sort((a, b) => b.created - a.created);
    if (sort === 'mostused') r.sort((a, b) => b.uses - a.uses);
    if (sort === 'az')       r.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'fav')      r = r.filter(p => p.fav);
    return r;
  }, [prompts, catFilter, modelFilter, tagFilter, search, sort]);

  const autoTag = useCallback((body, existingTags = []) => {
    const keywords = {
      'code': ['coding', 'dev', 'programming'],
      'react': ['react', 'frontend', 'js'],
      'email': ['email', 'writing', 'business'],
      'blog': ['writing', 'content', 'seo'],
      'story': ['creative', 'fiction'],
      'sql': ['database', 'query'],
      'css': ['styling', 'ui'],
      'fix': ['debug', 'fix'],
    };
    const newTags = [...existingTags];
    const text = body.toLowerCase();
    Object.entries(keywords).forEach(([key, tags]) => {
      if (text.includes(key)) {
        tags.forEach(t => { if (!newTags.includes(t)) newTags.push(t); });
      }
    });
    return newTags;
  }, []);

  const savePrompt = useCallback(p => {
    const finalPrompt = {
      ...p,
      tags: autoTag(p.body, p.tags),
      presets: p.presets || [] // Support for presets (Idea 2)
    };
    setPrompts(prev => {
      const exists = prev.find(x => x.id === finalPrompt.id);
      return exists ? prev.map(x => x.id === finalPrompt.id ? finalPrompt : x) : [finalPrompt, ...prev];
    });
    setShowModal(false);
    setEditPrompt(null);
    toast(p.id && editPrompt ? 'Prompt updated ✓' : 'Prompt created ✓', 'violet');
  }, [editPrompt, autoTag]);

  const deletePrompt = useCallback(id => {
    setPrompts(prev => prev
      .filter(p => p.id !== id)
      .map(p => p.linkedPromptId === String(id) || p.linkedPromptId === Number(id) ? { ...p, linkedPromptId: null } : p)
    );
    setActiveId(null);
    toast('Prompt deleted', 'danger');
  }, []);

  const toggleFav = useCallback(id => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, fav: !p.fav } : p));
  }, []);

  const copyPrompt = useCallback((p, withVars = false) => {
    navigator.clipboard.writeText(p.body).catch(() => {});
    setPrompts(prev => prev.map(x =>
      x.id === p.id ? { ...x, uses: x.uses + 1, history: [...(x.history || []), x.uses + 1] } : x
    ));
    toast(withVars ? '⚡ Copied with variables!' : '✓ Copied to clipboard', 'cyan');
  }, []);

  const importPrompts = useCallback(imported => {
    setPrompts(prev => {
      const existingIds = new Set(prev.map(p => String(p.id)));
      const newOnes = imported.filter(p => !existingIds.has(String(p.id)));
      return [...prev, ...newOnes];
    });
    toast(`Imported ${imported.length} prompts ✓`, 'cyan');
  }, []);

  const addCategory = useCallback((name) => {
    if (!name || categories.includes(name)) return;
    setCategories(prev => [...prev, name]);
    setCategoryColors(prev => ({ ...prev, [name]: DEFAULT_CAT_COLORS['All'] }));
    toast(`Collection "${name}" created`, 'violet');
  }, [categories]);

  const renameCategory = useCallback((oldName, newName) => {
    if (!newName || categories.includes(newName) || oldName === 'All') return;
    setCategories(prev => prev.map(c => c === oldName ? newName : c));
    setCategoryColors(prev => {
      const next = { ...prev, [newName]: prev[oldName] };
      delete next[oldName];
      return next;
    });
    setPrompts(prev => prev.map(p => p.category === oldName ? { ...p, category: newName } : p));
    if (catFilter === oldName) setCatFilter(newName);
    toast(`Collection renamed to "${newName}"`, 'violet');
  }, [categories, catFilter]);

  const deleteCategory = useCallback((name) => {
    if (name === 'All') return;
    setCategories(prev => prev.filter(c => c !== name));
    setPrompts(prev => prev.map(p => p.category === name ? { ...p, category: 'System' } : p));
    if (catFilter === name) setCatFilter('All');
    toast(`Collection "${name}" removed`, 'danger');
  }, [catFilter]);

  const reorderCategory = useCallback((index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= categories.length || categories[index] === 'All' || categories[newIdx] === 'All') return;
    setCategories(prev => {
      const next = [...prev];
      [next[index], next[newIdx]] = [next[newIdx], next[index]];
      return next;
    });
  }, [categories]);

  const renameTag = useCallback((oldTag, newTag) => {
    if (!newTag || oldTag === newTag) return;
    setPrompts(prev => prev.map(p => ({
      ...p,
      tags: p.tags.map(t => t === oldTag ? newTag : t)
    })));
    if (tagFilter === oldTag) setTagFilter(newTag);
    toast(`Tag updated to #${newTag}`, 'cyan');
  }, [tagFilter]);

  const deleteTag = useCallback((tag) => {
    setPrompts(prev => prev.map(p => ({
      ...p,
      tags: p.tags.filter(t => t !== tag)
    })));
    if (tagFilter === tag) setTagFilter('');
    toast(`Tag #${tag} removed`, 'danger');
  }, [tagFilter]);
  
  const addModel = useCallback((name) => {
    if (!name || modelColors[name]) return;
    setModelColors(prev => ({ ...prev, [name]: '#cccccc' }));
    toast(`Model "${name}" added`, 'violet');
  }, [modelColors]);

  const updateModelColor = useCallback((model, color) => {
    setModelColors(prev => ({ ...prev, [model]: color }));
  }, []);

  const renameModel = useCallback((oldName, newName) => {
    if (!newName || modelColors[newName] || oldName === newName) return;
    setModelColors(prev => {
      const next = { ...prev, [newName]: prev[oldName] };
      delete next[oldName];
      return next;
    });
    setPrompts(prev => prev.map(p => p.model === oldName ? { ...p, model: newName } : p));
    if (modelFilter === oldName) setModelFilter(newName);
    toast(`Model renamed to "${newName}"`, 'violet');
  }, [modelColors, modelFilter]);

  const deleteModel = useCallback((model) => {
    setModelColors(prev => {
      const next = { ...prev };
      delete next[model];
      return next;
    });
    setPrompts(prev => prev.map(p => p.model === model ? { ...p, model: 'Any' } : p));
    if (modelFilter === model) setModelFilter('All');
    toast(`Model "${model}" removed`, 'danger');
  }, [modelFilter]);

  const updatePrompt = useCallback(p => {
    setPrompts(prev => prev.map(x => x.id === p.id ? p : x));
  }, []);

  function openNew() { setEditPrompt(null); setShowModal(true); }
  function openEdit(p) { setEditPrompt(p); setShowModal(true); }

  const hasFilters = search || tagFilter || modelFilter !== 'All' || catFilter !== 'All';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar
        prompts={prompts}
        categories={categories}
        catFilter={catFilter} setCatFilter={setCatFilter}
        modelFilter={modelFilter} setModelFilter={setModelFilter}
        tagFilter={tagFilter} setTagFilter={setTagFilter}
        onNew={openNew}
        onImportExport={() => setShowIO(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        catColors={categoryColors}
        setCatColor={(cat, col) => setCategoryColors(prev => ({ ...prev, [cat]: col }))}
        onAddCat={addCategory}
        onRenameCat={renameCategory}
        onDeleteCat={deleteCategory}
        onReorderCat={reorderCategory}
        onRenameTag={renameTag}
        onDeleteTag={deleteTag}
        modelColors={modelColors}
        onAddModel={addModel}
        onUpdateModelColor={updateModelColor}
        onRenameModel={renameModel}
        onDeleteModel={deleteModel}
      />

      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Mobile Header */}
        <div className="mobile-header" style={{ background: '#2a2522' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: 24, padding: 4 }}>☰</button>
          <div className="ft" style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.5 }}>PROMPT KEEPER</div>
          <button className="btn btn-c" onClick={openNew} style={{ width: 36, height: 36, fontSize: 20, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>

        {/* Unified Toolbar Row */}
        <div style={{ 
          padding: '12px 20px', 
          borderBottom: 'var(--nb-border-sm)', 
          display: 'flex', 
          alignItems: 'center',
          gap: 16,
          background: 'var(--bg-sub)', 
          flexShrink: 0,
          flexWrap: 'wrap'
        }}>
          {/* Collection Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 800, whiteSpace: 'nowrap' }}>
              {filtered.length} ITEMS
            </span>
          </div>

          {/* Search Bar */}
          <div style={{ flex: 1, position: 'relative', minWidth: 200, display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text)', fontSize: 16, fontWeight: 900, pointerEvents: 'none' }}>⌕</span>
              <input
                id="search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={window.innerWidth <= 768 ? "SEARCH..." : "SEARCH PROMPTS... ⌘K"}
                style={{ paddingLeft: 38, fontSize: 12, border: 'var(--nb-border-sm)', height: 36, width: '100%' }}
              />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: 120, fontSize: 11, border: 'var(--nb-border-sm)', height: 36, background: 'var(--bg-sub)', color: 'var(--text)', flexShrink: 0 }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label.toUpperCase()}</option>)}
            </select>
          </div>

          {/* System Actions */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {hasFilters && (
              <button className="btn btn-d btn-sm" onClick={() => { setSearch(''); setTagFilter(''); setModelFilter('All'); setCatFilter('All'); }} style={{ height: 36, padding: '0 12px' }}>
                ✕
              </button>
            )}
            <button className="btn btn-g btn-sm" onClick={toggleTheme} title="Toggle Dark Mode" style={{ height: 36, padding: '0 10px' }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="btn btn-c btn-sm hide-mobile" onClick={openNew} style={{ padding: '0 16px', height: 36, fontWeight: 900 }}>
              + NEW
            </button>
          </div>
        </div>

        {/* Cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 32px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 20px', border: 'var(--nb-border)', background: 'var(--bg-sub)', boxShadow: 'var(--nb-shadow)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>∅</div>
              <div className="ft" style={{ fontSize: 18, marginBottom: 8, color: 'var(--text)' }}>
                {hasFilters ? 'NO MATCHES FOUND' : 'VAULT IS EMPTY'}
              </div>
              <div style={{ fontSize: 13, marginBottom: 24, fontWeight: 600 }}>
                {hasFilters ? 'TRY CLEARING YOUR FILTERS' : 'START BY CREATING YOUR FIRST PROMPT'}
              </div>
              {hasFilters
                ? <button className="btn btn-g" onClick={() => { setSearch(''); setTagFilter(''); setModelFilter('All'); setCatFilter('All'); }}>CLEAR FILTERS</button>
                : <button className="btn btn-c btn-lg" onClick={openNew}>+ CREATE PROMPT</button>
              }
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {filtered.map(p => (
                <PromptCard
                  key={p.id} p={p}
                  isActive={p.id === activeId}
                  onClick={p => setActiveId(activeId === p.id ? null : p.id)}
                  onFav={toggleFav}
                  onCopy={copyPrompt}
                  modelColors={modelColors}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {activePrompt && (
        <DetailPanel
          p={activePrompt}
          onClose={() => setActiveId(null)}
          onEdit={openEdit}
          onDelete={deletePrompt}
          onFav={toggleFav}
          onCopy={copyPrompt}
          onUpdate={updatePrompt}
          onJump={setActiveId}
          linkedPrompt={prompts.find(x => x.id == activePrompt.linkedPromptId)}
          isOpen={!!activePrompt}
          modelColors={modelColors}
        />
      )}

      {showModal && <PromptModal initial={editPrompt} prompts={prompts} categories={categories} modelColors={modelColors} onSave={savePrompt} onClose={() => { setShowModal(false); setEditPrompt(null); }} />}
      {showIO && <ImportExportModal prompts={prompts} onImport={importPrompts} onClose={() => setShowIO(false)} />}

      <Toast toasts={toasts} />

      {!showModal && !showIO && (
        <button
          className="btn hide-mobile"
          onClick={openNew}
          title="New Prompt (⌘N)"
          style={{
            position: 'fixed', bottom: 32,
            right: activePrompt ? 384 : 32,
            width: 64, height: 64, borderRadius: 0,
            background: 'var(--secondary)',
            border: 'var(--nb-border)',
            color: '#000', fontSize: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--nb-shadow)',
            zIndex: 50,
          }}
        >+</button>
      )}
    </div>
  );
}
