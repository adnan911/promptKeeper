import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { TagPill, ModelBadge, Divider, VarHighlight, UsageChart } from './UI.jsx';
import { extractVars } from '../data.js';
import ForgePanel from './ForgePanel.jsx';

export default function DetailPanel({ p, onClose, onEdit, onStudio, onDelete, onFav, onCopy, onUpdate, onJump, linkedPrompt, isOpen, modelColors, requestConfirm }) {
  const [tab, setTab] = useState('details');
  const [varVals, setVarVals] = useState({});
  const [copied, setCopied] = useState(false);
  const vars = extractVars(p.body);

  useEffect(() => { 
    setVarVals({}); 
    setTab('details');
  }, [p.id]);

  const filled = p.body.replace(/\{\{(\w+)\}\}/g, (_, k) => varVals[k] || `{{${k}}}`);
  const allFilled = vars.every(v => varVals[v.name]?.trim());

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
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.02)' }}>
        <span className="ft" style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 700, letterSpacing: 1.2 }}>PROMPT INSPECTOR</span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, width: 28, height: 28, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', padding: '4px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-light)' }}>
        <button 
          onClick={() => setTab('details')}
          style={{ 
            flex: 1, padding: '10px', fontSize: 11, fontWeight: 700, border: 'none', borderRadius: '4px',
            background: tab === 'details' ? 'var(--bg-glass)' : 'transparent',
            color: tab === 'details' ? 'var(--primary)' : 'var(--text-dim)',
            transition: 'all 0.2s', cursor: 'pointer', letterSpacing: 1
          }}
        >DETAILS</button>
        <button 
          onClick={() => setTab('forge')}
          style={{ 
            flex: 1, padding: '10px', fontSize: 11, fontWeight: 700, border: 'none', borderRadius: '4px',
            background: tab === 'forge' ? 'var(--bg-glass)' : 'transparent',
            color: tab === 'forge' ? 'var(--primary)' : 'var(--text-dim)',
            transition: 'all 0.2s', cursor: 'pointer', letterSpacing: 1
          }}
        >THE FORGE ⚡</button>
      </div>

      <div style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'details' ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Title & meta */}
            <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div className="ft" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, textTransform: 'capitalize' }}>
                  {p.title}
                </div>
                <button onClick={() => onFav(p.id)} style={{ background: p.fav ? 'var(--primary-glow)' : 'transparent', color: p.fav ? 'var(--primary)' : 'var(--text-dim)', border: 'none', fontSize: 20, cursor: 'pointer', padding: '2px', borderRadius: '50%' }}>
                  {p.fav ? '★' : '☆'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <ModelBadge model={p.model} color={modelColors?.[p.model]} />
                <span style={{ fontSize: 10, color: 'var(--text)', background: 'var(--bg-glass)', border: '1px solid var(--border-light)', borderRadius: '100px', padding: '4px 10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {p.category}
                </span>
              </div>
              <div className="ft" style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 12, fontWeight: 500, letterSpacing: 0.5 }}>
                CREATED {createdDate.toUpperCase()} &nbsp;&bull;&nbsp; {p.uses} USES
              </div>
            </div>

            {/* Prompt body */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-light)' }}>
              <span className="lbl" style={{ fontSize: 11, marginBottom: 8, opacity: 0.6 }}>PROMPT TEMPLATE</span>
              <div style={{
                background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)',
                padding: '16px', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text)',
                maxHeight: 280, overflowY: 'auto', fontFamily: 'JetBrains Mono,monospace',
              }}>
                <VarHighlight text={p.body} />
              </div>
            </div>

            {/* Notes */}
            {p.notes && (
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-light)' }}>
                <span className="lbl" style={{ fontSize: 11, marginBottom: 8, opacity: 0.6 }}>NOTES</span>
                <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5, background: 'var(--bg-glass)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: '12px 16px' }}>
                  {p.notes}
                </div>
              </div>
            )}



            {/* Tags */}
            <div style={{ padding: '12px 20px' }}>
              <span className="lbl" style={{ fontSize: 11, marginBottom: 8, opacity: 0.6 }}>TAGS</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {p.tags.map(t => <TagPill key={t} tag={t} />)}
              </div>
            </div>

            {/* Chaining */}
            {linkedPrompt && (
              <div style={{ padding: '24px', background: 'var(--bg-glass)', borderTop: '1px solid var(--border-light)' }}>
                <span className="ft" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', letterSpacing: 0.5 }}>NEXT IN CHAIN</span>
                <div onClick={() => onJump(linkedPrompt.id)} style={{ cursor: 'pointer', fontSize: 15, fontWeight: 600, color: 'var(--accent)', marginTop: 8 }}>
                  ➔ {linkedPrompt.title}
                </div>
              </div>
            )}

            {/* Usage history */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-light)' }}>
              <span className="lbl" style={{ fontSize: 11, marginBottom: 12, opacity: 0.6 }}>USAGE ACTIVITY</span>
              <UsageChart history={p.history} uses={p.uses} />
              <div className="ft" style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 12, textAlign: 'right', fontWeight: 500, letterSpacing: 0.5 }}>
                {p.uses} TOTAL EXECUTIONS
              </div>
            </div>

            {/* Attached Image (Primary) Moved to bottom */}
            {(() => {
              const imgSrc = p.images?.[0] || p.thumbnail;
              if (!imgSrc) return null;
              
              return (
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.03)' }}>
                  <span className="lbl" style={{ fontSize: 11, marginBottom: 10, display: 'block', opacity: 0.8, color: 'var(--primary)', fontWeight: 800 }}>ATTACHED IMAGE</span>
                  <div style={{ 
                    width: '100%', height: 240, background: '#000', 
                    border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                  }}>
                    <img 
                      src={imgSrc.startsWith('data:') || imgSrc.startsWith('blob:') ? imgSrc : Capacitor.convertFileSrc(imgSrc)} 
                      alt="attachment" 
                      key={imgSrc} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                      onError={(e) => { 
                        console.error("Detail image load failed", imgSrc.substring(0, 50));
                        e.target.style.display = 'none'; 
                        e.target.parentElement.innerText = 'IMAGE_LOAD_ERROR'; 
                      }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <ForgePanel p={p} onUpdate={onUpdate} onCopy={onCopy} requestConfirm={requestConfirm} />
        )}
      </div>

      {/* Actions (Only visible in Details tab) */}
      {tab === 'details' && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0, background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-c btn-fw" onClick={copyRaw} style={{ flex: 1, height: 44, fontWeight: 600, letterSpacing: 1, fontSize: 11 }}>COPY RAW</button>
            <button className="btn btn-sm" onClick={() => onStudio(p)} style={{ width: 44, height: 44, background: 'var(--bg-panel)', border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: 16, fontWeight: 900 }} title="Open in Studio (JSON Editor)">⚡</button>
            <button className="btn btn-d" onClick={() => {
              requestConfirm({
                title: 'DELETE PROMPT',
                message: `Are you sure you want to delete "${p.title}"?`,
                onConfirm: () => onDelete(p.id)
              });
            }} style={{ width: 44, height: 44 }}>🗑</button>
          </div>
        </div>
      )}
    </div>
  );
}
