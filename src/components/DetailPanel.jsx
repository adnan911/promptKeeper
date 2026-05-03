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
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.02)' }}>
        <span className="ft" style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 700, letterSpacing: 1.5 }}>PROMPT INSPECTOR</span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16, width: 32, height: 32, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
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
            <div style={{ padding: '28px 24px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                <div className="ft" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, textTransform: 'capitalize' }}>
                  {p.title}
                </div>
                <button onClick={() => onFav(p.id)} style={{ background: p.fav ? 'var(--primary-glow)' : 'transparent', color: p.fav ? 'var(--primary)' : 'var(--text-dim)', border: 'none', fontSize: 24, cursor: 'pointer', padding: '4px', borderRadius: '50%' }}>
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
                background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)',
                padding: '20px', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text)',
                maxHeight: 320, overflowY: 'auto', fontFamily: 'JetBrains Mono,monospace',
              }}>
                <VarHighlight text={p.body} />
              </div>
            </div>

            <Divider margin="0" />

            {/* Notes */}
            {p.notes && (
              <div style={{ padding: '24px' }}>
                <span className="lbl" style={{ fontSize: 12, marginBottom: 12 }}>NOTES</span>
                <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6, background: 'var(--bg-glass)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: '16px' }}>
                  {p.notes}
                </div>
              </div>
            )}

            {/* Images */}
            {p.images?.length > 0 && (
              <div style={{ padding: '24px' }}>
                <span className="lbl" style={{ fontSize: 12, marginBottom: 12 }}>ATTACHED IMAGES</span>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                  {p.images.map((img, i) => (
                    <div key={i} style={{ 
                      flex: '0 0 120px', height: 120, background: '#000', 
                      border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: 'var(--text-dim)', overflow: 'hidden'
                    }}>
                      <img 
                        src={Capacitor.convertFileSrc(img)} 
                        alt="attachment" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = 'IMG_ERR'; }}
                      />
                    </div>
                  ))}
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
                <div onClick={() => onJump(linkedPrompt.id)} style={{ cursor: 'pointer', fontSize: 15, fontWeight: 600, color: 'var(--accent)', marginTop: 8 }}>
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
        ) : (
          <ForgePanel p={p} onUpdate={onUpdate} onCopy={onCopy} requestConfirm={requestConfirm} />
        )}
      </div>

      {/* Actions (Only visible in Details tab) */}
      {tab === 'details' && (
        <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0, background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-c btn-fw" onClick={copyRaw} style={{ flex: 2, height: 52, fontWeight: 600, letterSpacing: 1 }}>COPY RAW</button>
            <button className="btn btn-sm" onClick={() => onStudio(p)} style={{ width: 64, height: 52, background: 'var(--bg-panel)', border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: 18, fontWeight: 900 }} title="Open in Studio (JSON Editor)">⚡</button>
            <button className="btn btn-d" onClick={() => {
              requestConfirm({
                title: 'DELETE PROMPT',
                message: `Are you sure you want to delete "${p.title}"?`,
                onConfirm: () => onDelete(p.id)
              });
            }} style={{ width: 64, height: 52 }}>🗑</button>
          </div>
        </div>
      )}
    </div>
  );
}
