import { useState, useEffect } from 'react';
import { TagPill, ModelBadge, Divider, VarHighlight, UsageChart } from './UI.jsx';
import { extractVars } from '../data.js';

export default function DetailPanel({ p, onClose, onEdit, onDelete, onFav, onCopy, onUpdate, onJump, linkedPrompt, isOpen, modelColors, requestConfirm }) {
  const [varVals, setVarVals] = useState({});
  const [copied, setCopied] = useState(false);
  const vars = extractVars(p.body);

  useEffect(() => { setVarVals({}); }, [p.id]);

  const filled = p.body.replace(/\{\{(\w+)\}\}/g, (_, k) => varVals[k] || `{{${k}}}`);
  const allFilled = vars.every(v => varVals[v]?.trim());

  function copyFilled() {
    onCopy(p, true, filled);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function copyRaw() {
    onCopy(p, false);
  }

  const createdDate = new Date(p.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`detail-panel-mobile ${isOpen ? 'open' : ''}`} style={{
      width: 400,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-panel)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderLeft: '1px solid var(--border-light)',
      height: '100%',
      overflow: 'hidden',
      zIndex: 150,
      boxShadow: '-8px 0 32px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.02)' }}>
        <span className="ft" style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, letterSpacing: 1 }}>DETAIL VIEW</span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 18, lineHeight: 1, padding: '0', width: 36, height: 36, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Title & meta */}
        <div style={{ padding: '28px 24px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
            <div className="ft" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, textTransform: 'capitalize' }}>
              {p.title}
            </div>
            <button
              onClick={() => onFav(p.id)}
              style={{
                background: p.fav ? 'var(--primary-glow)' : 'transparent',
                color: p.fav ? 'var(--primary)' : 'var(--text-dim)',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '50%',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                marginTop: -4
              }}
              title={p.fav ? 'Remove from Favorites' : 'Add to Favorites'}
              onMouseOver={e => e.currentTarget.style.color = p.fav ? 'var(--primary)' : 'var(--text)'}
              onMouseOut={e => e.currentTarget.style.color = p.fav ? 'var(--primary)' : 'var(--text-dim)'}
            >
              {p.fav ? '★' : '☆'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <ModelBadge model={p.model} color={modelColors?.[p.model]} />
            <span style={{ fontSize: 11, color: 'var(--text)', background: 'var(--bg-glass)', border: '1px solid var(--border-light)', borderRadius: '100px', padding: '6px 14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {p.category}
            </span>
          </div>
          <div className="ft" style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 20, fontWeight: 500, letterSpacing: 0.5 }}>
            CREATED {createdDate.toUpperCase()} &nbsp;&bull;&nbsp; {p.uses} EXECUTIONS
          </div>
        </div>

        <Divider margin="0" />

        {/* Prompt body */}
        <div style={{ padding: '24px' }}>
          <span className="lbl" style={{ fontSize: 12, marginBottom: 12 }}>PROMPT TEMPLATE</span>
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius)',
            padding: '20px',
            fontSize: 14,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            color: 'var(--text)',
            maxHeight: 320,
            overflowY: 'auto',
            fontFamily: 'JetBrains Mono,monospace',
            fontWeight: 400,
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
          }}>
            <VarHighlight text={p.body} />
          </div>
        </div>

        <Divider margin="0" />

        {/* Variables */}
        {vars.length > 0 && (
          <>
            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span className="lbl" style={{ margin: 0, fontSize: 12 }}>⚡ QUICK FILL ({vars.length})</span>
                <button 
                  className="btn btn-sm btn-p" 
                  onClick={() => {
                    requestConfirm({
                      title: 'SAVE PRESET',
                      message: 'Enter a name for this preset:',
                      type: 'prompt',
                      inputPlaceholder: 'Preset name...',
                      onConfirm: (name) => {
                        if (!name) return;
                        const newPresets = [...(p.presets || []), { name, values: { ...varVals } }];
                        onUpdate({ ...p, presets: newPresets });
                      }
                    });
                  }}
                  style={{ padding: '6px 12px', borderRadius: '100px' }}
                >+ SAVE AS PRESET</button>
              </div>

              {p.presets?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  {p.presets.map((pre, idx) => (
                    <button 
                      key={idx}
                      className="btn btn-sm"
                      onClick={() => setVarVals(pre.values)}
                      style={{ fontSize: 11, background: 'var(--bg-glass)', border: '1px solid var(--border-light)', padding: '6px 12px', borderRadius: '100px' }}
                    >
                      {pre.name.toUpperCase()}
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = p.presets.filter((_, i) => i !== idx);
                          onUpdate({ ...p, presets: next });
                        }}
                        style={{ marginLeft: 8, color: 'var(--danger)', fontSize: 12, cursor: 'pointer' }}
                      >✕</span>
                    </button>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {vars.map(v => (
                  <div key={v}>
                    <div style={{ fontSize: 11, color: 'var(--text-sub)', marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>{`{{${v.toUpperCase()}}}`}</div>
                    <input
                      value={varVals[v] || ''}
                      onChange={e => setVarVals({ ...varVals, [v]: e.target.value })}
                      placeholder={`TYPE ${v.toUpperCase()}...`}
                      style={{ fontSize: 14, border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                ))}
              </div>
              <button
                className={`btn ${allFilled ? 'btn-v' : 'btn-g'} btn-fw`}
                onClick={copyFilled}
                style={{ marginTop: 24, padding: '14px', fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}
              >
                {copied ? '✓ COPIED!' : `⊕ COPY WITH VARIABLES`}
              </button>
            </div>
            <Divider margin="0" />
          </>
        )}

        {/* Notes */}
        {p.notes && (
          <div style={{ padding: '24px' }}>
            <span className="lbl" style={{ fontSize: 12, marginBottom: 12 }}>NOTES</span>
            <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6, fontWeight: 400, background: 'var(--bg-glass)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: '16px' }}>
              {p.notes}
            </div>
          </div>
        )}

        {/* Tags */}
        <div style={{ padding: '24px' }}>
          <span className="lbl" style={{ fontSize: 12, marginBottom: 12 }}>TAGS</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {p.tags.map(t => <TagPill key={t} tag={t} />)}
          </div>
        </div>

        {/* Chaining */}
        {linkedPrompt && (
          <div style={{ padding: '24px', background: 'var(--bg-glass)', borderTop: '1px solid var(--border-light)' }}>
            <span className="ft" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', letterSpacing: 0.5 }}>NEXT IN CHAIN</span>
            <div 
              onClick={() => onJump(linkedPrompt.id)}
              style={{ cursor: 'pointer', fontSize: 15, fontWeight: 600, color: 'var(--accent)', marginTop: 8 }}
            >
              ➔ {linkedPrompt.title}
            </div>
          </div>
        )}

        {/* Usage history */}
        <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)' }}>
          <span className="lbl" style={{ fontSize: 12, marginBottom: 16 }}>USAGE ACTIVITY</span>
          <UsageChart history={p.history} uses={p.uses} />
          <div className="ft" style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 12, textAlign: 'right', fontWeight: 500, letterSpacing: 0.5 }}>
            {p.uses} TOTAL EXECUTIONS
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0, background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-c btn-fw" onClick={copyRaw} style={{ flex: 2, height: 52, fontWeight: 600, letterSpacing: 1 }}>COPY RAW</button>
          <button className="btn btn-v" onClick={() => onEdit(p)} style={{ width: 64, height: 52 }}>✎</button>
          <button className="btn btn-d" onClick={() => {
            requestConfirm({
              title: 'DELETE PROMPT',
              message: `Are you sure you want to delete "${p.title}"?`,
              onConfirm: () => onDelete(p.id)
            });
          }} style={{ width: 64, height: 52 }}>🗑</button>
        </div>
      </div>
    </div>
  );
}
