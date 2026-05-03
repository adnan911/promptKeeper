import { useState } from 'react';
import { TagPill, ModelBadge, StatRow, Divider } from './UI.jsx';
import { MODEL_COLORS, PREMIUM_GRADIENTS } from '../data.js';
import logo from '../assets/logo.jpg';

export default function Sidebar({ prompts, categories, catFilter, setCatFilter, modelFilter, setModelFilter, tagFilter, setTagFilter, onNew, onImportExport, isOpen, onClose, catColors, setCatColor, onAddCat, onRenameCat, onDeleteCat, onRenameTag, onDeleteTag, onReorderCat, modelColors, onAddModel, onUpdateModelColor, onRenameModel, onDeleteModel, theme, toggleTheme, requestConfirm }) {
  const [tagsExpanded, setTagsExpanded] = useState(true);
  const [modelsExpanded, setModelsExpanded] = useState(true);
  const [catsExpanded, setCatsExpanded] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState(null);
  const [editCatVal, setEditCatVal] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [editTagVal, setEditTagVal] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [pickingColorFor, setPickingColorFor] = useState(null);

  const BRAND_COLORS = [
    '#10A37F', // OpenAI Green
    '#D97757', // Claude Rust
    '#4285F4', // Gemini Blue
    '#0081FB', // Meta/Llama Blue
    '#FF7000', // Mistral Orange
    '#00A392', // Perplexity Teal
    '#8B5CF6', // Violet
    '#F59E0B', // Gold
    '#1E4445', // Deep Teal
  ];

  const allTags = [...new Set(prompts.flatMap(p => p.tags))].sort();
  const topTag = allTags.map(t => ({ t, n: prompts.filter(p => p.tags.includes(t)).length })).sort((a, b) => b.n - a.n)[0];

  const catCount = c => c === 'All' ? prompts.length : prompts.filter(p => p.category === c).length;
  const modelCount = m => prompts.filter(p => p.model === m).length;

  return (
    <div className={`sidebar-mobile ${isOpen ? 'open' : ''}`} style={{
      width: 280,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-panel)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border-light)',
      overflowY: 'auto',
      overflowX: 'hidden',
      zIndex: 100,
      height: '100%',
    }}>
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', color: '#fff', width: 32, height: 32, borderRadius: '50%', border: 'none', display: 'var(--mobile-close-display, none)', alignItems: 'center', justifyContent: 'center', fontWeight: 600, zIndex: 110 }}
        className="show-mobile-flex"
      >✕</button>
      {/* Logo */}
      <div style={{ padding: '32px 24px 24px', borderBottom: '1px solid var(--border-light)' }}>
        <img src={logo} alt="Prompt Keeper" style={{ width: '100%', display: 'block', borderRadius: 'var(--radius-sm)', opacity: 0.9 }} />
      </div>

      {/* Stats */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)' }}>
        <StatRow label="TOTAL PROMPTS" value={prompts.length} />
        <StatRow label="FAVORITES" value={prompts.filter(p => p.fav).length} color="var(--primary)" />
      </div>

      <div style={{ padding: '24px 0', flex: 1 }}>
        <div style={{ padding: '0 16px 24px' }}>
          <button className="btn btn-c btn-fw" onClick={onNew} style={{ padding: '14px', fontSize: 13, gap: 10, borderRadius: 0, fontWeight: 900 }}>
            <span style={{ fontSize: 18 }}>+</span> NEW PROMPT
          </button>
        </div>

        {/* Collections Box */}
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', margin: '0 16px 20px', padding: '16px 12px', boxShadow: 'var(--shadow-soft)' }}>
          <div
            className="ft"
            onClick={() => setCatsExpanded(x => !x)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 12px', cursor: 'pointer' }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Collections</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button 
                className="btn btn-sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddingCat(true);
                }}
                style={{ padding: '4px 10px', fontSize: 10, background: 'rgba(255,255,255,0.1)', border: 'none' }}
              >+ ADD</button>
              <span style={{ fontSize: 12, color: 'var(--text)' }}>{catsExpanded ? '▾' : '▸'}</span>
            </div>
          </div>

        {isAddingCat && (
          <div style={{ padding: '0 8px 12px', display: 'flex', gap: 8 }}>
            <input
              autoFocus
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { onAddCat(newCatName); setNewCatName(''); setIsAddingCat(false); }
                if (e.key === 'Escape') { setIsAddingCat(false); setNewCatName(''); }
              }}
              placeholder="COLLECTION NAME..."
              style={{ flex: 1, fontSize: 12, padding: '8px 12px', height: 36 }}
            />
            <button 
              className="btn btn-sm btn-v" 
              onClick={() => { onAddCat(newCatName); setNewCatName(''); setIsAddingCat(false); }}
              style={{ padding: '0 14px', height: 36 }}
            >✓</button>
          </div>
        )}

        {catsExpanded && categories.map((c, idx) => {
          const isActive = catFilter === c;
          const catCol = catColors[c] || catColors['All'];
          return (
            <div
              key={c}
              className={`si${isActive ? ' act' : ''}`}
              onClick={() => { setCatFilter(c); setTagFilter(''); }}
              style={{ 
                marginBottom: 6, 
                background: isActive ? `${catCol}20` : 'transparent',
                color: isActive ? catCol : 'var(--text)',
                border: isActive ? `1px solid ${catCol}50` : '1px solid transparent',
                position: 'relative',
                padding: '12px 14px',
                transition: 'all 0.2s ease',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span className="ft" style={{ fontSize: 13, fontWeight: 500 }}>{c === 'All' ? '◈ ALL PROMPTS' : c.toUpperCase()}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
                <span style={{ fontSize: 12, fontWeight: 600, opacity: isActive ? 1 : 0.6 }}>
                  {catCount(c)}
                </span>
                {c !== 'All' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentIdx = PREMIUM_GRADIENTS.indexOf(catCol);
                        const nextCol = PREMIUM_GRADIENTS[(currentIdx + 1) % PREMIUM_GRADIENTS.length];
                        setCatColor(c, nextCol);
                      }}
                      style={{ 
                        width: 14, height: 14, borderRadius: '50%', 
                        background: catCol, cursor: 'pointer', flexShrink: 0,
                        boxShadow: isActive ? `0 0 10px ${catCol}80` : 'none'
                      }}
                      title="Change Color"
                    />
                    {editingCat === c ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          autoFocus
                          value={editCatVal}
                          onChange={e => setEditCatVal(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { onRenameCat(c, editCatVal); setEditingCat(null); }
                            if (e.key === 'Escape') { setEditingCat(null); }
                          }}
                          style={{ width: 100, fontSize: 11, padding: '4px 8px', height: 28 }}
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); onRenameCat(c, editCatVal); setEditingCat(null); }}
                          style={{ background: 'var(--secondary)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: 11, padding: '0 8px', cursor: 'pointer' }}
                        >✓</button>
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCat(c);
                          setEditCatVal(c);
                        }}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 14, color: isActive ? catCol : 'var(--text)', opacity: 0.6 }}
                      >✎</button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        requestConfirm({
                          title: 'DELETE COLLECTION',
                          message: `DELETE COLLECTION "${c}"? PROMPTS WILL BE MOVED TO ALL PROMPTS.`,
                          onConfirm: () => onDeleteCat(c)
                        });
                      }}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 14, color: 'var(--danger)', opacity: 0.6 }}
                    >✕</button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onReorderCat(idx, -1); }}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 10, color: isActive ? catCol : 'var(--text)', opacity: 0.6 }}
                        disabled={idx === 0}
                      >▲</button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onReorderCat(idx, 1); }}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 10, color: isActive ? catCol : 'var(--text)', opacity: 0.6 }}
                        disabled={idx === categories.length - 1}
                      >▼</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>

        {/* AI Models Box */}
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', margin: '0 16px 20px', padding: '16px 12px', boxShadow: 'var(--shadow-soft)' }}>
        <div 
          className="ft" 
          onClick={() => setModelsExpanded(x => !x)}
          style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600, padding: '0 8px 12px', textTransform: 'uppercase', letterSpacing: 0.5, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>AI Models</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button 
              className="btn btn-sm" 
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingModel(true);
              }}
              style={{ padding: '4px 10px', fontSize: 10, background: 'rgba(255,255,255,0.1)', border: 'none' }}
            >+ ADD</button>
            <span style={{ fontSize: 12 }}>{modelsExpanded ? '▾' : '▸'}</span>
          </div>
        </div>

        {isAddingModel && (
          <div style={{ padding: '0 8px 12px', display: 'flex', gap: 8 }}>
            <input
              autoFocus
              value={newModelName}
              onChange={e => setNewModelName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { onAddModel(newModelName); setNewModelName(''); setIsAddingModel(false); }
                if (e.key === 'Escape') { setIsAddingModel(false); setNewModelName(''); }
              }}
              placeholder="MODEL NAME..."
              style={{ flex: 1, fontSize: 12, padding: '8px 12px', height: 36 }}
            />
            <button 
              className="btn btn-sm btn-v" 
              onClick={() => { onAddModel(newModelName); setNewModelName(''); setIsAddingModel(false); }}
              style={{ padding: '0 14px', height: 36 }}
            >✓</button>
          </div>
        )}
        
        {modelsExpanded && (
          <>
            <div
              className={`si${modelFilter === 'All' ? ' act' : ''}`}
              onClick={() => setModelFilter('All')}
              style={{ marginBottom: 6, borderRadius: 'var(--radius-sm)' }}
            >
              <span className="ft" style={{ fontSize: 13, fontWeight: 500 }}>ALL MODELS</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{prompts.length}</span>
            </div>
            {Object.entries(modelColors).map(([m, c]) => {
              const isAM = modelFilter === m;
              return (
                <div
                  key={m}
                  className={`si${isAM ? ' act' : ''}`}
                  onClick={() => setModelFilter(m)}
                  style={{ 
                    marginBottom: 6, 
                    position: 'relative',
                    borderRadius: 'var(--radius-sm)',
                    ...(isAM ? { background: `${c}20`, color: c, border: `1px solid ${c}50` } : { background: 'transparent' }) 
                  }}
                >
                  <span className="ft" style={{ fontSize: 13, fontWeight: 500 }}>{m.toUpperCase()}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, opacity: isAM ? 1 : 0.6 }}>
                      {modelCount(m)}
                    </span>
                    {editingCat === m ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          autoFocus
                          value={editCatVal}
                          onChange={e => setEditCatVal(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { onRenameModel(m, editCatVal); setEditingCat(null); }
                            if (e.key === 'Escape') { setEditingCat(null); }
                          }}
                          style={{ width: 100, fontSize: 11, padding: '4px 8px', height: 28 }}
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); onRenameModel(m, editCatVal); setEditingCat(null); }}
                          style={{ background: 'var(--secondary)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: 11, padding: '0 8px', cursor: 'pointer' }}
                        >✓</button>
                      </div>
                    ) : (
                      <>
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setPickingColorFor(pickingColorFor === m ? null : m);
                          }}
                          style={{ 
                            width: 14, height: 14, borderRadius: '50%', 
                            background: c, 
                            cursor: 'pointer', flexShrink: 0,
                            boxShadow: pickingColorFor === m ? `0 0 0 2px rgba(255,255,255,0.5), 0 0 10px ${c}` : 'none'
                          }}
                          title="Pick Model Color"
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCat(m);
                            setEditCatVal(m);
                          }}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 14, color: isAM ? c : 'var(--text)', opacity: 0.6 }}
                        >✎</button>
                      </>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        requestConfirm({
                          title: 'DELETE MODEL',
                          message: `DELETE MODEL "${m}"? PROMPTS WILL BE MOVED TO ALL.`,
                          onConfirm: () => onDeleteModel(m)
                        });
                      }}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 14, color: 'var(--danger)', opacity: 0.6 }}
                    >✕</button>
                  </div>

                  {pickingColorFor === m && (
                    <div 
                      onClick={e => e.stopPropagation()}
                      style={{ 
                        position: 'absolute', top: '100%', right: 0, 
                        background: 'var(--bg-panel)', border: '1px solid var(--border-light)', 
                        padding: 12, zIndex: 50, marginTop: 8, borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-soft)', display: 'grid', backdropFilter: 'blur(16px)',
                        gridTemplateColumns: 'repeat(3, 1fr)', gap: 8
                      }}
                    >
                      {BRAND_COLORS.map(col => (
                        <div 
                          key={col}
                          onClick={() => { onUpdateModelColor(m, col); setPickingColorFor(null); }}
                          style={{ 
                            width: 24, height: 24, borderRadius: '50%', 
                            background: col, 
                            cursor: 'pointer', transition: 'all 0.2s ease',
                            border: col === c ? '2px solid #fff' : 'none',
                            boxShadow: `0 2px 8px ${col}60`
                          }}
                          onMouseOver={e => e.target.style.transform = 'scale(1.15)'}
                          onMouseOut={e => e.target.style.transform = 'scale(1)'}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
        </div>

        {/* Tags Box */}
        {allTags.length > 0 && (
          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', margin: '0 16px 16px', padding: '16px 12px', boxShadow: 'var(--shadow-soft)' }}>
            <div
              className="ft"
              onClick={() => setTagsExpanded(x => !x)}
              style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600, padding: '0 8px 12px', letterSpacing: 0.5, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
            >
              <span>TAGS</span>
              <span style={{ fontSize: 12, color: 'var(--text)' }}>{tagsExpanded ? '▾' : '▸'}</span>
            </div>
            {tagsExpanded && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 8px' }}>
                {allTags.map(t => (
                  <div key={t} className="tag-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <TagPill
                      tag={t}
                      size="sm"
                      active={tagFilter === t}
                      onClick={() => setTagFilter(tagFilter === t ? '' : t)}
                    />
                    <div className="tag-actions" style={{ 
                      position: 'absolute', top: -10, right: -10, display: 'none', gap: 4, zIndex: 10 
                    }}>
                      {editingTag === t ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <input
                            autoFocus
                            value={editTagVal}
                            onChange={e => setEditTagVal(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') { onRenameTag(t, editTagVal); setEditingTag(null); }
                              if (e.key === 'Escape') { setEditingTag(null); }
                            }}
                            style={{ width: 80, fontSize: 10, padding: '4px 6px', height: 24 }}
                          />
                          <button 
                            onClick={(e) => { e.stopPropagation(); onRenameTag(t, editTagVal); setEditingTag(null); }}
                            style={{ background: 'var(--secondary)', color: '#fff', border: 'none', borderRadius: '4px', padding: '0 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}
                          >✓</button>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTag(t);
                              setEditTagVal(t);
                            }}
                            style={{ background: 'var(--bg-panel)', color: 'var(--text)', border: '1px solid var(--border-light)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, cursor: 'pointer', boxShadow: 'var(--shadow-soft)' }}
                          >✎</button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              requestConfirm({
                                title: 'DELETE TAG',
                                message: `DELETE TAG "${t}"?`,
                                onConfirm: () => onDeleteTag(t)
                              });
                            }}
                            style={{ background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, cursor: 'pointer', boxShadow: 'var(--shadow-soft)' }}
                          >✕</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-panel)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-g btn-fw" onClick={onImportExport} style={{ padding: '12px', fontSize: 12, flex: 1 }}>
            ⇅ DATA MANAGEMENT
          </button>
          <button className="btn btn-g" onClick={toggleTheme} title="Toggle Dark Mode" style={{ width: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <div className="ft hide-mobile" style={{ fontSize: 10, color: 'var(--text-dim)', textAlign: 'center', paddingTop: 8, fontWeight: 600, letterSpacing: 0.5 }}>
          ⌘K SEARCH &nbsp;//&nbsp; ⌘N NEW
        </div>
      </div>
    </div>
  );
}
