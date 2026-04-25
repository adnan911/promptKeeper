import { useState, useEffect } from 'react';
import { TagPill, ModelBadge, Divider, VarHighlight, UsageChart } from './UI.jsx';
import { extractVars } from '../data.js';

export default function DetailPanel({ p, onClose, onEdit, onDelete, onFav, onCopy, onUpdate, onJump, linkedPrompt, isOpen, modelColors }) {
  const [varVals, setVarVals] = useState({});
  const [copied, setCopied] = useState(false);
  const vars = extractVars(p.body);

  useEffect(() => { setVarVals({}); }, [p.id]);

  const filled = p.body.replace(/\{\{(\w+)\}\}/g, (_, k) => varVals[k] || `{{${k}}}`);
  const allFilled = vars.every(v => varVals[v]?.trim());

  function copyFilled() {
    navigator.clipboard.writeText(filled).catch(() => {});
    onCopy(p, true);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function copyRaw() {
    navigator.clipboard.writeText(p.body).catch(() => {});
    onCopy(p, false);
  }

  const createdDate = new Date(p.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`detail-panel-mobile ${isOpen ? 'open' : ''}`} style={{
      width: 360,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-sub)',
      borderLeft: 'var(--nb-border)',
      height: '100%',
      overflow: 'hidden',
      zIndex: 150,
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: 'var(--nb-border-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: 'var(--accent)' }}>
        <span className="ft" style={{ fontSize: 11, color: '#000', fontWeight: 900 }}>DETAIL VIEW</span>
        <button onClick={onClose} style={{ background: '#000', color: '#fff', fontSize: 18, lineHeight: 1, padding: '2px 8px', border: '1px solid #000', boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.5)' }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Title & meta */}
        <div style={{ padding: '20px' }}>
          <div className="ft" style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', lineHeight: 1.2, marginBottom: 14, textTransform: 'uppercase' }}>
            {p.title}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <ModelBadge model={p.model} color={modelColors?.[p.model]} />
            <span style={{ fontSize: 10, color: '#000', background: 'var(--primary)', border: '1px solid #000', padding: '4px 12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {p.category}
            </span>
          </div>
          <div className="ft" style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 16, fontWeight: 700, letterSpacing: 0.5 }}>
            CREATED: {createdDate.toUpperCase()} // {p.uses} EXECUTIONS
          </div>
        </div>

        <Divider margin="0" />

        {/* Favorite Action */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #eee' }}>
           <button
              onClick={() => onFav(p.id)}
              className="btn btn-fw"
              style={{ background: p.fav ? 'var(--primary)' : 'var(--bg-sub)', color: p.fav ? '#000' : 'var(--text)', border: 'var(--nb-border-sm)', fontWeight: 900 }}
            >
              <span style={{ color: p.fav ? '#FFD700' : 'inherit' }}>{p.fav ? '★' : '☆'}</span> {p.fav ? 'FAVORITED' : 'ADD TO FAVORITES'}
            </button>
        </div>

        {/* Prompt body */}
        <div style={{ padding: '16px 20px' }}>
          <span className="lbl">PROMPT TEMPLATE</span>
          <div style={{
            background: 'var(--bg)',
            border: 'var(--nb-border-sm)',
            padding: '14px',
            fontSize: 12,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            color: 'var(--text)',
            maxHeight: 240,
            overflowY: 'auto',
            fontFamily: 'JetBrains Mono,monospace',
            fontWeight: 500,
            boxShadow: 'inset 2px 2px 0px 0px rgba(0,0,0,0.2)',
          }}>
            <VarHighlight text={p.body} />
          </div>
        </div>

        <Divider margin="0" />

        {/* Variables */}
        {vars.length > 0 && (
          <>
            <div style={{ padding: '16px 20px', background: 'var(--bg-sub)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="lbl" style={{ margin: 0 }}>⚡ QUICK FILL ({vars.length})</span>
                <button 
                  className="btn btn-sm btn-p" 
                  onClick={() => {
                    const name = prompt('PRESET NAME:');
                    if (!name) return;
                    const newPresets = [...(p.presets || []), { name, values: { ...varVals } }];
                    onUpdate({ ...p, presets: newPresets });
                  }}
                  style={{ padding: '2px 8px' }}
                >+ SAVE AS PRESET</button>
              </div>

              {p.presets?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {p.presets.map((pre, idx) => (
                    <button 
                      key={idx}
                      className="btn btn-sm"
                      onClick={() => setVarVals(pre.values)}
                      style={{ fontSize: 9, background: 'var(--bg)', border: '1px solid #000' }}
                    >
                      {pre.name.toUpperCase()}
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = p.presets.filter((_, i) => i !== idx);
                          onUpdate({ ...p, presets: next });
                        }}
                        style={{ marginLeft: 6, color: 'var(--danger)', fontSize: 10 }}
                      >✕</span>
                    </button>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {vars.map(v => (
                  <div key={v}>
                    <div style={{ fontSize: 10, color: 'var(--text)', marginBottom: 4, fontWeight: 800 }}>{`{{${v.toUpperCase()}}}`}</div>
                    <input
                      value={varVals[v] || ''}
                      onChange={e => setVarVals({ ...varVals, [v]: e.target.value })}
                      placeholder={`TYPE ${v.toUpperCase()}...`}
                      style={{ fontSize: 12, border: 'var(--nb-border-sm)' }}
                    />
                  </div>
                ))}
              </div>
              <button
                className={`btn ${allFilled ? 'btn-v' : 'btn-g'} btn-fw`}
                onClick={copyFilled}
                style={{ marginTop: 16, padding: '12px', fontSize: 12, fontWeight: 900 }}
              >
                {copied ? '✓ COPIED!' : `⊕ COPY WITH VARIABLES`}
              </button>
            </div>
            <Divider margin="0" />
          </>
        )}

        {/* Notes */}
        {p.notes && (
          <div style={{ padding: '16px 20px' }}>
            <span className="lbl">NOTES</span>
            <div style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.6, fontWeight: 500, background: 'var(--bg)', border: 'var(--nb-border-sm)', padding: '10px' }}>
              {p.notes}
            </div>
          </div>
        )}

        {/* Tags */}
        <div style={{ padding: '16px 20px' }}>
          <span className="lbl">TAGS</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {p.tags.map(t => <TagPill key={t} tag={t} />)}
          </div>
        </div>

        {/* Chaining */}
        {linkedPrompt && (
          <div style={{ padding: '16px 20px', background: 'var(--secondary)', color: '#000', borderTop: 'var(--nb-border-sm)' }}>
            <span className="ft" style={{ fontSize: 10, fontWeight: 900 }}>NEXT IN CHAIN //</span>
            <div 
              onClick={() => onJump(linkedPrompt.id)}
              style={{ cursor: 'pointer', fontSize: 14, fontWeight: 900, textDecoration: 'underline', marginTop: 4 }}
            >
              ➔ {linkedPrompt.title.toUpperCase()}
            </div>
          </div>
        )}

        {/* Usage history */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #eee' }}>
          <span className="lbl">USAGE ACTIVITY</span>
          <UsageChart history={p.history} uses={p.uses} />
          <div className="ft" style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 8, textAlign: 'right', fontWeight: 800 }}>
            {p.uses} TOTAL EXECUTIONS
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '20px', borderTop: 'var(--nb-border)', display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0, background: 'var(--bg-sub)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-c btn-fw" onClick={copyRaw} style={{ flex: 2, height: 48, fontWeight: 900 }}>COPY RAW</button>
          <button className="btn btn-v" onClick={() => onEdit(p)} style={{ width: 60, height: 48 }}>✎</button>
          <button className="btn btn-d" onClick={() => onDelete(p.id)} style={{ width: 60, height: 48 }}>🗑</button>
        </div>
      </div>
    </div>
  );
}
