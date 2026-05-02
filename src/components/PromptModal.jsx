import { useState, useMemo } from 'react';
import { TagPill, VarHighlight, Divider, ModelBadge } from './UI.jsx';
import { MODEL_COLORS, extractVars } from '../data.js';

export default function PromptModal({ initial, prompts, categories, modelColors, onSave, onClose, onAddCat, onAddModel }) {
  const empty = { title: '', body: '', tags: [], category: 'Coding', model: Object.keys(modelColors)[0] || 'Claude', fav: false, notes: '', linkedPromptId: null };
  const [form, setForm] = useState(initial || empty);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState('');

  const vars = extractVars(form.body);

  const allTags = useMemo(() => {
    const set = new Set();
    prompts.forEach(p => p.tags?.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [prompts]);

  const suggestions = useMemo(() => {
    if (!tagInput) return [];
    const q = tagInput.toLowerCase();
    return allTags.filter(t => t.toLowerCase().includes(q) && !form.tags.includes(t)).slice(0, 5);
  }, [tagInput, allTags, form.tags]);

  function addTag(tagOverride) {
    const t = (tagOverride || tagInput).trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !form.tags.includes(t)) setForm({ ...form, tags: [...form.tags, t] });
    setTagInput('');
  }

  function toggleJsonMode() {
    if (jsonMode) {
      try {
        const parsed = JSON.parse(jsonText);
        setForm({ ...form, ...parsed });
        setError('');
        setJsonMode(false);
      } catch (e) {
        setError('Invalid JSON: ' + e.message);
      }
    } else {
      setJsonText(JSON.stringify(form, null, 2));
      setError('');
      setJsonMode(true);
    }
  }

  function save() {
    let finalForm = form;
    if (jsonMode) {
      try {
        finalForm = { ...form, ...JSON.parse(jsonText) };
      } catch (e) {
        setError('Invalid JSON: ' + e.message);
        return;
      }
    }
    
    if (!finalForm.title?.trim()) { setError('Title is required'); return; }
    if (!finalForm.body?.trim()) { setError('Prompt body is required'); return; }
    
    if (finalForm.category && onAddCat) onAddCat(finalForm.category);
    if (finalForm.model && onAddModel) onAddModel(finalForm.model);

    onSave({
      ...finalForm,
      id: initial?.id || Date.now(),
      uses: initial?.uses || 0,
      created: initial?.created || Date.now(),
      history: initial?.history || [],
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <div
        className="asu glass-panel"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 760, maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          margin: '20px',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.02)' }}>
          <span className="ft" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 1 }}>
            {initial ? 'EDIT PROMPT' : 'NEW PROMPT'}
          </span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button 
              onClick={toggleJsonMode}
              className="btn btn-sm"
              style={{ background: jsonMode ? 'var(--text)' : 'transparent', color: jsonMode ? 'var(--bg)' : 'var(--text)', border: '1px solid var(--text)', fontWeight: 600, fontSize: 11, padding: '6px 12px', borderRadius: '100px', transition: 'all 0.2s ease', marginRight: 24 }}
            >
              {jsonMode ? 'SWITCH TO UI' : '{ } JSON MODE'}
            </button>
          </div>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 20, width: 36, height: 36, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s', zIndex: 10 }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {error && (
              <div style={{ background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                ⚠ ERROR: {error.toUpperCase()}
              </div>
            )}

            {jsonMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <label className="lbl" style={{ marginBottom: 12 }}>RAW JSON DATA</label>
                <textarea
                  value={jsonText}
                  onChange={e => { setJsonText(e.target.value); setError(''); }}
                  style={{ 
                    minHeight: 440, 
                    fontSize: 13, 
                    lineHeight: 1.6, 
                    border: '1px solid var(--border-light)', 
                    background: 'rgba(0,0,0,0.2)',
                    color: 'var(--text)',
                    fontFamily: 'JetBrains Mono,monospace',
                    fontWeight: 400,
                    padding: '20px',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  spellCheck={false}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="lbl" style={{ marginBottom: 12 }}>PROMPT TITLE</label>
                  <input
                    value={form.title}
                    onChange={e => { setForm({ ...form, title: e.target.value }); setError(''); }}
                    placeholder="NAME YOUR CREATION..."
                    style={{ fontSize: 16, fontWeight: 500, border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 'var(--radius-sm)', color: 'var(--text)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label className="lbl" style={{ marginBottom: 12 }}>COLLECTION</label>
                    <input 
                      list="cat-list" 
                      value={form.category} 
                      onChange={e => setForm({ ...form, category: e.target.value })} 
                      placeholder="SELECT OR TYPE..."
                      style={{ border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: 14, fontWeight: 500, width: '100%' }}
                    />
                    <datalist id="cat-list">
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="lbl" style={{ marginBottom: 12 }}>TARGET AI MODEL</label>
                    <input 
                      list="model-list" 
                      value={form.model} 
                      onChange={e => setForm({ ...form, model: e.target.value })} 
                      placeholder="SELECT OR TYPE..."
                      style={{ border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: 14, fontWeight: 500, width: '100%' }}
                    />
                    <datalist id="model-list">
                      {Object.keys(modelColors).map(m => <option key={m} value={m} />)}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="lbl" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span>PROMPT CONTENT</span>
                    <span style={{ color: 'var(--text-sub)', fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>
                      TIP: USE {'{{VAR}}'} FOR INPUTS
                    </span>
                  </label>
                  <textarea
                    value={form.body}
                    onChange={e => { setForm({ ...form, body: e.target.value }); setError(''); }}
                    placeholder="CONSTRUCT YOUR PROMPT TEMPLATE...&#10;&#10;EXAMPLE: WRITE A {{TONE}} TALE ABOUT {{SUBJECT}}."
                    style={{ minHeight: 240, fontSize: 14, lineHeight: 1.7, border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontWeight: 400, fontFamily: 'JetBrains Mono,monospace', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                  {vars.length > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="ft" style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600, letterSpacing: 0.5 }}>DETECTED VARS:</span>
                      {vars.map(v => (
                        <span key={v} style={{ fontSize: 11, color: 'var(--primary)', background: 'var(--primary-glow)', padding: '4px 10px', borderRadius: '100px', border: '1px solid var(--primary)', fontWeight: 600 }}>
                          {`{{${v.toUpperCase()}}}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <label className="lbl" style={{ marginBottom: 12 }}>SEARCH TAGS</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                      placeholder="TYPE + PRESS ENTER..."
                      style={{ flex: 1, fontSize: 14, border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', color: 'var(--text)' }}
                    />
                    <button className="btn btn-v" onClick={() => addTag()} style={{ flexShrink: 0, padding: '0 24px', fontWeight: 600, letterSpacing: 0.5 }}>ADD</button>
                  </div>
                  
                  {suggestions.length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      background: 'var(--bg-panel)', border: '1px solid var(--border-light)',
                      zIndex: 10, marginTop: 8, boxShadow: 'var(--shadow-soft)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backdropFilter: 'blur(16px)'
                    }}>
                      {suggestions.map(t => (
                        <div
                          key={t}
                          onClick={() => addTag(t)}
                          style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', fontSize: 13, fontWeight: 500, color: 'var(--text)', transition: 'background 0.2s' }}
                          onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                          onMouseOut={e => e.target.style.background = 'transparent'}
                        >
                          #{t.toUpperCase()}
                        </div>
                      ))}
                    </div>
                  )}

                  {form.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                      {form.tags.map(t => (
                        <TagPill key={t} tag={t} removable onRemove={() => setForm({ ...form, tags: form.tags.filter(x => x !== t) })} />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="lbl" style={{ marginBottom: 12 }}>ADDITIONAL NOTES</label>
                  <textarea
                    value={form.notes || ''}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="EXTRA CONTEXT OR TIPS..."
                    style={{ minHeight: 100, fontSize: 14, border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontWeight: 400 }}
                  />
                </div>

                <div>
                  <label className="lbl" style={{ marginBottom: 12 }}>LINK TO RELATED PROMPT (CHAINING)</label>
                  <select 
                    value={form.linkedPromptId || ''} 
                    onChange={e => setForm({ ...form, linkedPromptId: e.target.value || null })} 
                    style={{ border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: 14, fontWeight: 500 }}
                  >
                    <option value="" style={{ background: 'var(--bg-panel)' }}>NO LINK</option>
                    {prompts.filter(p => p.id !== initial?.id).map(p => (
                      <option key={p.id} value={p.id} style={{ background: 'var(--bg-panel)' }}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', marginTop: 8 }}>
                  <input
                    type="checkbox"
                    id="fav-cb"
                    checked={form.fav}
                    onChange={e => setForm({ ...form, fav: e.target.checked })}
                    style={{ width: 22, height: 22, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <label htmlFor="fav-cb" style={{ fontSize: 14, color: 'var(--text)', cursor: 'pointer', fontWeight: 600, letterSpacing: 0.5 }}>
                     PIN TO FAVORITES ★
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 16, flexShrink: 0, background: 'rgba(255,255,255,0.02)', borderRadius: '0 0 var(--radius) var(--radius)' }}>
          <button className="btn btn-v btn-fw btn-lg" onClick={save} style={{ fontWeight: 600, letterSpacing: 1 }}>
            {initial ? 'UPDATE VAULT' : 'CREATE PROMPT'}
          </button>
          <button className="btn btn-d btn-lg" onClick={onClose} style={{ flexShrink: 0, padding: '0 32px', fontWeight: 600, letterSpacing: 1 }}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
