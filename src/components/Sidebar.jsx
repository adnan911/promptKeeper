import { useState } from 'react';
import { TagPill, ModelBadge, StatRow, Divider } from './UI.jsx';
import { MODEL_COLORS, PREMIUM_GRADIENTS } from '../data.js';
import logo from '../assets/logo.jpg';

export default function Sidebar({ prompts, categories, catFilter, setCatFilter, modelFilter, setModelFilter, tagFilter, setTagFilter, onNew, onImportExport, isOpen, onClose, catColors, setCatColor, onAddCat, onRenameCat, onDeleteCat, onRenameTag, onDeleteTag, onReorderCat, modelColors, onAddModel, onUpdateModelColor, onRenameModel, onDeleteModel }) {
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
      width: 260,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-sub)',
      borderRight: 'var(--nb-border)',
      overflowY: 'auto',
      overflowX: 'hidden',
      zIndex: 100,
      height: '100%',
    }}>
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        style={{ position: 'absolute', top: 16, right: 16, background: '#000', color: '#fff', width: 32, height: 32, borderRadius: 0, border: 'var(--nb-border-sm)', display: 'var(--mobile-close-display, none)', alignItems: 'center', justifyContent: 'center', fontWeight: 900, zIndex: 110 }}
        className="show-mobile-flex"
      >✕</button>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: 'var(--nb-border-sm)', background: '#2a2522' }}>
        <img src={logo} alt="Prompt Keeper" style={{ width: '100%', display: 'block' }} />
      </div>

      {/* Stats */}
      <div style={{ padding: '12px 16px', borderBottom: 'var(--nb-border-sm)', background: '#2a2522' }}>
        <StatRow label="TOTAL PROMPTS" value={prompts.length} />
        <StatRow label="FAVORITES" value={prompts.filter(p => p.fav).length} color="var(--primary)" />
      </div>

      <div style={{ padding: '16px 0', flex: 1 }}>
        {/* Collections Box */}
        <div style={{ background: '#2a2522', border: 'var(--nb-border-sm)', margin: '0 12px 16px', padding: '12px 10px', boxShadow: 'var(--nb-shadow-sm)' }}>
          <div
            className="ft"
            onClick={() => setCatsExpanded(x => !x)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 6px 10px', cursor: 'pointer' }}
          >
            <div style={{ fontSize: 10, color: 'var(--text)', fontWeight: 900, textTransform: 'uppercase' }}>Collections</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button 
                className="btn btn-sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddingCat(true);
                }}
                style={{ padding: '2px 8px', fontSize: 10, background: 'var(--accent)' }}
              >+ ADD</button>
              <span style={{ fontSize: 12, color: 'var(--text)' }}>{catsExpanded ? '▾' : '▸'}</span>
            </div>
          </div>

        {isAddingCat && (
          <div style={{ padding: '0 6px 12px', display: 'flex', gap: 6 }}>
            <input
              autoFocus
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { onAddCat(newCatName); setNewCatName(''); setIsAddingCat(false); }
                if (e.key === 'Escape') { setIsAddingCat(false); setNewCatName(''); }
              }}
              placeholder="COLLECTION NAME..."
              style={{ flex: 1, fontSize: 11, padding: '4px 8px', border: 'var(--nb-border-sm)', background: 'var(--bg)' }}
            />
            <button 
              className="btn btn-sm btn-v" 
              onClick={() => { onAddCat(newCatName); setNewCatName(''); setIsAddingCat(false); }}
              style={{ padding: '0 10px', fontSize: 10 }}
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
                background: isActive ? catCol : 'var(--bg-sub)',
                color: isActive ? '#000' : 'var(--text)',
                border: 'var(--nb-border-sm)',
                boxShadow: isActive ? 'var(--nb-shadow-sm)' : 'none',
                position: 'relative',
                padding: '12px 14px',
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              <span className="ft" style={{ fontSize: 11, fontWeight: 900 }}>{c === 'All' ? '◈ ALL PROMPTS' : c.toUpperCase()}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                <span style={{ fontSize: 11, fontWeight: 900, opacity: isActive ? 1 : 0.6 }}>
                  {catCount(c)}
                </span>
                {c !== 'All' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentIdx = PREMIUM_GRADIENTS.indexOf(catCol);
                        const nextCol = PREMIUM_GRADIENTS[(currentIdx + 1) % PREMIUM_GRADIENTS.length];
                        setCatColor(c, nextCol);
                      }}
                      style={{ 
                        width: 12, height: 12, borderRadius: '50%', 
                        background: catCol, border: '1px solid #000', 
                        cursor: 'pointer', flexShrink: 0,
                        boxShadow: isActive ? '1px 1px 0px 0px #fff' : 'none'
                      }}
                      title="Change Color"
                    />
                    {editingCat === c ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <input
                          autoFocus
                          value={editCatVal}
                          onChange={e => setEditCatVal(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { onRenameCat(c, editCatVal); setEditingCat(null); }
                            if (e.key === 'Escape') { setEditingCat(null); }
                          }}
                          style={{ width: 80, fontSize: 10, padding: '2px 4px', border: '1px solid #000' }}
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); onRenameCat(c, editCatVal); setEditingCat(null); }}
                          style={{ background: 'var(--accent)', border: '1px solid #000', fontSize: 10, padding: '0 4px', cursor: 'pointer' }}
                        >✓</button>
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCat(c);
                          setEditCatVal(c);
                        }}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: isActive ? '#000' : 'var(--text)', opacity: 0.6 }}
                      >✎</button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`DELETE COLLECTION "${c}"? PROMPTS WILL BE MOVED TO PERSONAL.`)) onDeleteCat(c);
                      }}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: isActive ? '#000' : 'var(--text)', opacity: 0.6 }}
                    >✕</button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onReorderCat(idx, -1); }}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 8, color: isActive ? '#000' : 'var(--text)', opacity: 0.6 }}
                        disabled={idx === 0}
                      >▲</button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onReorderCat(idx, 1); }}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 8, color: isActive ? '#000' : 'var(--text)', opacity: 0.6 }}
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
        <div style={{ background: '#2a2522', border: 'var(--nb-border-sm)', margin: '0 12px 16px', padding: '12px 10px', boxShadow: 'var(--nb-shadow-sm)' }}>
        <div 
          className="ft" 
          onClick={() => setModelsExpanded(x => !x)}
          style={{ fontSize: 10, color: 'var(--text)', fontWeight: 900, padding: '10px 6px', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>AI Models</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button 
              className="btn btn-sm" 
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingModel(true);
              }}
              style={{ padding: '2px 8px', fontSize: 10, background: 'var(--accent)' }}
            >+ ADD</button>
            <span style={{ fontSize: 12 }}>{modelsExpanded ? '▾' : '▸'}</span>
          </div>
        </div>

        {isAddingModel && (
          <div style={{ padding: '0 6px 12px', display: 'flex', gap: 6 }}>
            <input
              autoFocus
              value={newModelName}
              onChange={e => setNewModelName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { onAddModel(newModelName); setNewModelName(''); setIsAddingModel(false); }
                if (e.key === 'Escape') { setIsAddingModel(false); setNewModelName(''); }
              }}
              placeholder="MODEL NAME..."
              style={{ flex: 1, fontSize: 11, padding: '4px 8px', border: 'var(--nb-border-sm)', background: 'var(--bg)' }}
            />
            <button 
              className="btn btn-sm btn-v" 
              onClick={() => { onAddModel(newModelName); setNewModelName(''); setIsAddingModel(false); }}
              style={{ padding: '0 10px', fontSize: 10 }}
            >✓</button>
          </div>
        )}
        
        {modelsExpanded && (
          <>
            <div
              className={`si${modelFilter === 'All' ? ' act' : ''}`}
              onClick={() => setModelFilter('All')}
              style={{ marginBottom: 4 }}
            >
              <span>ALL MODELS</span>
              <span style={{ fontSize: 11, fontWeight: 900 }}>{prompts.length}</span>
            </div>
            {Object.entries(modelColors).map(([m, c]) => {
              const isAM = modelFilter === m;
              return (
                <div
                  key={m}
                  className={`si${isAM ? ' act' : ''}`}
                  onClick={() => setModelFilter(m)}
                  style={{ 
                    marginBottom: 4, 
                    position: 'relative',
                    ...(isAM ? { background: c, color: '#000', boxShadow: 'var(--nb-shadow-sm)' } : {}) 
                  }}
                >
                  <span>{m.toUpperCase()}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                    <span style={{ fontSize: 11, fontWeight: 900, opacity: isAM ? 1 : 0.6 }}>
                      {modelCount(m)}
                    </span>
                    {editingCat === m ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <input
                          autoFocus
                          value={editCatVal}
                          onChange={e => setEditCatVal(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { onRenameModel(m, editCatVal); setEditingCat(null); }
                            if (e.key === 'Escape') { setEditingCat(null); }
                          }}
                          style={{ width: 80, fontSize: 10, padding: '2px 4px', border: '1px solid #000' }}
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); onRenameModel(m, editCatVal); setEditingCat(null); }}
                          style={{ background: 'var(--accent)', border: '1px solid #000', fontSize: 10, padding: '0 4px', cursor: 'pointer' }}
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
                            background: c, border: '1px solid #000', 
                            cursor: 'pointer', flexShrink: 0,
                            boxShadow: pickingColorFor === m ? '0 0 0 2px #fff, 0 0 0 3px #000' : 'none'
                          }}
                          title="Pick Model Color"
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCat(m);
                            setEditCatVal(m);
                          }}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: isAM ? '#000' : 'var(--text)', opacity: 0.6 }}
                        >✎</button>
                      </>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`DELETE MODEL "${m}"? PROMPTS WILL BE MOVED TO ANY.`)) onDeleteModel(m);
                      }}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: isAM ? '#000' : 'var(--text)', opacity: 0.6 }}
                    >✕</button>
                  </div>

                  {pickingColorFor === m && (
                    <div 
                      onClick={e => e.stopPropagation()}
                      style={{ 
                        position: 'absolute', top: '100%', right: 0, 
                        background: 'var(--bg-sub)', border: 'var(--nb-border-sm)', 
                        padding: 8, zIndex: 50, marginTop: 4,
                        boxShadow: 'var(--nb-shadow-sm)', display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)', gap: 6
                      }}
                    >
                      {BRAND_COLORS.map(col => (
                        <div 
                          key={col}
                          onClick={() => { onUpdateModelColor(m, col); setPickingColorFor(null); }}
                          style={{ 
                            width: 20, height: 20, borderRadius: '50%', 
                            background: col, border: '1px solid #000', 
                            cursor: 'pointer', transition: 'transform 0.1s'
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
          <div style={{ background: '#2a2522', border: 'var(--nb-border-sm)', margin: '0 12px 16px', padding: '12px 10px', boxShadow: 'var(--nb-shadow-sm)' }}>
            <div
              className="ft"
              onClick={() => setTagsExpanded(x => !x)}
              style={{ fontSize: 10, color: 'var(--text)', fontWeight: 900, padding: '0 6px 10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
            >
              <span>TAGS</span>
              <span style={{ fontSize: 12, color: 'var(--text)' }}>{tagsExpanded ? '▾' : '▸'}</span>
            </div>
            {tagsExpanded && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 6px 4px' }}>
                {allTags.map(t => (
                  <div key={t} className="tag-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <TagPill
                      tag={t}
                      size="sm"
                      active={tagFilter === t}
                      onClick={() => setTagFilter(tagFilter === t ? '' : t)}
                    />
                    <div className="tag-actions" style={{ 
                      position: 'absolute', top: -8, right: -8, display: 'none', gap: 2, zIndex: 10 
                    }}>
                      {editingTag === t ? (
                        <div style={{ display: 'flex', gap: 2 }}>
                          <input
                            autoFocus
                            value={editTagVal}
                            onChange={e => setEditTagVal(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') { onRenameTag(t, editTagVal); setEditingTag(null); }
                              if (e.key === 'Escape') { setEditingTag(null); }
                            }}
                            style={{ width: 60, fontSize: 8, padding: '1px 2px', border: '1px solid #000' }}
                          />
                          <button 
                            onClick={(e) => { e.stopPropagation(); onRenameTag(t, editTagVal); setEditingTag(null); }}
                            style={{ background: 'var(--accent)', color: '#000', border: '1px solid #000', padding: '0 4px', fontSize: 8, fontWeight: 900, cursor: 'pointer' }}
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
                            style={{ background: 'var(--accent)', color: '#000', border: '1px solid #000', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, cursor: 'pointer' }}
                          >✎</button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`DELETE TAG "${t}"?`)) onDeleteTag(t);
                            }}
                            style={{ background: 'var(--danger)', color: '#fff', border: '1px solid #000', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, cursor: 'pointer' }}
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

      <div style={{ padding: '16px', borderTop: 'var(--nb-border-sm)', display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg)' }}>
        <button className="btn btn-v btn-fw btn-lg" onClick={onNew} style={{ padding: '14px', fontWeight: 900 }}>
          + ADD NEW PROMPT
        </button>
        <button className="btn btn-g btn-fw" onClick={onImportExport} style={{ padding: '10px', fontSize: 11 }}>
          ⇅ DATA MGMT
        </button>
        <div className="ft hide-mobile" style={{ fontSize: 9, color: 'var(--text-dim)', textAlign: 'center', paddingTop: 6, fontWeight: 700 }}>
          ⌘K SEARCH // ⌘N NEW
        </div>
      </div>
    </div>
  );
}
