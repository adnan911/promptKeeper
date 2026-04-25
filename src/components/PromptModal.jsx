import { useState, useMemo } from 'react';
import { TagPill, VarHighlight, Divider, ModelBadge } from './UI.jsx';
import { MODEL_COLORS, extractVars } from '../data.js';

export default function PromptModal({ initial, prompts, categories, modelColors, onSave, onClose }) {
  const empty = { title: '', body: '', tags: [], category: 'Coding', model: Object.keys(modelColors)[0] || 'Claude', fav: false, notes: '', linkedPromptId: null };
  const [form, setForm] = useState(initial || empty);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

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

  function save() {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.body.trim()) { setError('Prompt body is required'); return; }
    onSave({
      ...form,
      id: initial?.id || Date.now(),
      uses: initial?.uses || 0,
      created: initial?.created || Date.now(),
      history: initial?.history || [],
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="asu"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 720, maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-sub)',
          border: 'var(--nb-border)',
          boxShadow: 'var(--nb-shadow-lg)',
          borderRadius: 0,
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: 'var(--nb-border-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: 'var(--primary)' }}>
          <span className="ft" style={{ fontSize: 18, fontWeight: 900, color: '#000', textTransform: 'uppercase' }}>
            {initial ? 'EDIT PROMPT' : 'NEW PROMPT'}
          </span>
          <button onClick={onClose} style={{ background: '#000', color: '#fff', fontSize: 20, padding: '2px 10px', border: '1px solid #000', boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.5)', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, background: 'var(--bg-sub)' }}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div style={{ background: 'var(--danger)', color: '#fff', border: 'var(--nb-border-sm)', padding: '10px 16px', fontSize: 12, fontWeight: 900 }}>
                ⚠ ERROR: {error.toUpperCase()}
              </div>
            )}

            <div>
              <label className="lbl">PROMPT TITLE</label>
              <input
                value={form.title}
                onChange={e => { setForm({ ...form, title: e.target.value }); setError(''); }}
                placeholder="NAME YOUR CREATION..."
                style={{ fontSize: 14, fontWeight: 700, border: 'var(--nb-border-sm)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="lbl">COLLECTION</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ border: 'var(--nb-border-sm)', fontWeight: 700 }}>
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">TARGET AI MODEL</label>
                <select value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} style={{ border: 'var(--nb-border-sm)', fontWeight: 700 }}>
                  {Object.keys(modelColors).map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="lbl" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span>PROMPT CONTENT</span>
                <span style={{ color: 'var(--text-dim)', fontSize: 9, fontWeight: 800 }}>
                  TIP: USE {'{{VAR}}'} FOR INPUTS
                </span>
              </label>
              <textarea
                value={form.body}
                onChange={e => { setForm({ ...form, body: e.target.value }); setError(''); }}
                placeholder="CONSTRUCT YOUR PROMPT TEMPLATE...&#10;&#10;EXAMPLE: WRITE A {{TONE}} TALE ABOUT {{SUBJECT}}."
                style={{ minHeight: 220, fontSize: 13, lineHeight: 1.6, border: 'var(--nb-border-sm)', fontWeight: 500 }}
              />
              {vars.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className="ft" style={{ fontSize: 9, color: 'var(--text)', fontWeight: 900 }}>VARS:</span>
                  {vars.map(v => (
                    <span key={v} style={{ fontSize: 10, color: '#000', background: 'var(--accent)', padding: '2px 8px', border: '1px solid #000', fontWeight: 800 }}>
                      {`{{${v.toUpperCase()}}}`}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <label className="lbl">SEARCH TAGS</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                  placeholder="TYPE + PRESS ENTER..."
                  style={{ flex: 1, fontSize: 12, border: 'var(--nb-border-sm)' }}
                />
                <button className="btn btn-v" onClick={() => addTag()} style={{ flexShrink: 0, padding: '0 20px', fontWeight: 900 }}>ADD</button>
              </div>
              
              {suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: 'var(--bg-sub)', border: 'var(--nb-border-sm)',
                  zIndex: 10, marginTop: 4, boxShadow: 'var(--nb-shadow-sm)'
                }}>
                  {suggestions.map(t => (
                    <div
                      key={t}
                      onClick={() => addTag(t)}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--text-dim)', fontSize: 11, fontWeight: 700, color: 'var(--text)' }}
                      onMouseOver={e => e.target.style.background = 'var(--accent)'}
                      onMouseOut={e => e.target.style.background = 'var(--bg-sub)'}
                    >
                      #{t.toUpperCase()}
                    </div>
                  ))}
                </div>
              )}

              {form.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  {form.tags.map(t => (
                    <TagPill key={t} tag={t} removable onRemove={() => setForm({ ...form, tags: form.tags.filter(x => x !== t) })} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="lbl">ADDITIONAL NOTES</label>
              <textarea
                value={form.notes || ''}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="EXTRA CONTEXT OR TIPS..."
                style={{ minHeight: 80, fontSize: 12, border: 'var(--nb-border-sm)', fontWeight: 500 }}
              />
            </div>

            <div>
              <label className="lbl">LINK TO RELATED PROMPT (CHAINING)</label>
              <select 
                value={form.linkedPromptId || ''} 
                onChange={e => setForm({ ...form, linkedPromptId: e.target.value || null })} 
                style={{ border: 'var(--nb-border-sm)', fontWeight: 700 }}
              >
                <option value="">NO LINK</option>
                {prompts.filter(p => p.id !== initial?.id).map(p => (
                  <option key={p.id} value={p.id}>{p.title.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
              <input
                type="checkbox"
                id="fav-cb"
                checked={form.fav}
                onChange={e => setForm({ ...form, fav: e.target.checked })}
                style={{ width: 20, height: 20, border: '2px solid var(--text)', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="fav-cb" style={{ fontSize: 13, color: 'var(--text)', cursor: 'pointer', fontWeight: 800 }}>
                 PIN TO FAVORITES ★
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 24px', borderTop: 'var(--nb-border-sm)', display: 'flex', gap: 12, flexShrink: 0, background: 'var(--bg-sub)' }}>
          <button className="btn btn-v btn-fw btn-lg" onClick={save} style={{ fontWeight: 900 }}>
            {initial ? 'UPDATE VAULT ✓' : 'CREATE PROMPT ✓'}
          </button>
          <button className="btn btn-d btn-lg" onClick={onClose} style={{ flexShrink: 0, padding: '0 24px', fontWeight: 900 }}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
