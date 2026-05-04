import React, { useState } from 'react';
import { getTagColor, MODEL_COLORS, UNRE } from '../data.js';

export function TagPill({ tag, active, onClick, removable, onRemove, size = 'md' }) {
  const c = getTagColor(tag);
  return (
    <span
      className={`tag-pill${active ? ' act' : ''}`}
      onClick={onClick}
      style={{
        background: active ? c : 'var(--bg-sub)',
        border: 'var(--nb-border-sm)',
        color: active ? '#000' : 'var(--text)',
        fontSize: size === 'sm' ? 10 : 11,
        padding: size === 'sm' ? '3px 8px' : '4px 12px',
        boxShadow: active ? '2px 2px 0px 0px #000' : 'none',
      }}
    >
      {tag.toUpperCase()}
      {removable && (
        <span
          onClick={e => { e.stopPropagation(); onRemove?.(); }}
          style={{ fontWeight: 900, fontSize: 14, lineHeight: 1, marginLeft: 6, cursor: 'pointer' }}
        >×</span>
      )}
    </span>
  );
}

function varColorToHex(c) {
  // Utility to handle color mapping if needed, but for NB we often just use the vibrant tokens
  return c;
}

export function ModelBadge({ model, color, size = 'md' }) {
  const c = color || MODEL_COLORS[model] || '#cccccc';
  return (
    <span style={{
      background: c,
      border: 'var(--nb-border-sm)',
      color: '#000',
      padding: size === 'sm' ? '3px 8px' : '4px 12px',
      borderRadius: 0,
      fontSize: size === 'sm' ? 9 : 10,
      fontFamily: 'JetBrains Mono, monospace',
      fontWeight: 800,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      boxShadow: size === 'sm' ? '1px 1px 0px 0px #000' : 'var(--nb-shadow-sm)',
    }}>
      {model}
    </span>
  );
}

export function Toast({ toasts }) {
  const typeStyle = {
    cyan:   { bg: 'var(--copy-color)', color: '#000' },
    violet: { bg: 'var(--primary)', color: '#000' },
    pink:   { bg: 'var(--accent)', color: '#000' },
    danger: { bg: 'var(--danger)', color: '#fff' },
  };
  return (
    <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {toasts.map(t => {
        const s = typeStyle[t.type] || typeStyle.cyan;
        return (
          <div key={t.id} className="toast" style={{ background: s.bg, color: s.color, transition: 'all 0.2s' }}>
            {t.msg.toUpperCase()}
          </div>
        );
      })}
    </div>
  );
}

export function Divider({ margin = '16px 0' }) {
  return <hr style={{ border: 'none', borderTop: 'var(--nb-border-sm)', margin }} />;
}

export function Label({ children }) {
  return <span className="lbl">{children}</span>;
}

export function StatRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px', borderBottom: '1px solid var(--text-dim)' }}>
      <span className="ft" style={{ fontSize: 10, color: 'var(--text)', fontWeight: 700, letterSpacing: 0.5 }}>{label}</span>
      <span className="ft" style={{ fontSize: 14, fontWeight: 900, color: color || 'var(--text)' }}>{value}</span>
    </div>
  );
}

export const VarHighlight = React.memo(function VarHighlight({ text }) {
  if (!text) return null;
  const parts = text.split(UNRE);
  return (
    <>
      {parts.map((p, i) =>
        UNRE.test(p)
          ? <span key={i} style={{ 
              background: 'rgba(242, 140, 40, 0.12)', 
              color: '#F28C28', 
              padding: '0 4px', 
              borderRadius: 0,
              border: '0.5px solid rgba(242, 140, 40, 0.3)', 
              fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace'
            }}>{p}</span>
          : <span key={i}>{p}</span>
      )}
    </>
  );
});

export const ResolvedHighlight = React.memo(function ResolvedHighlight({ text, vals = {} }) {
  if (!text) return null;
  const parts = text.split(UNRE);
  return (
    <>
      {parts.map((p, i) => {
        if (UNRE.test(p)) {
          // Extract name from any of the formats: {{name}}, ${name}, [name], %name%
          const name = p.replace(/[{}$[\]%]/g, '').trim();
          const val = vals[name];
          
          if (val && val.trim()) {
            return <span key={i} style={{ 
              color: '#61afef', 
              background: 'rgba(97, 175, 239, 0.12)',
              padding: '0 4px',
              border: '0.5px solid rgba(97, 175, 239, 0.3)',
              fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace'
            }}>{val}</span>
          } else {
            return <span key={i} style={{ 
              color: '#F28C28', 
              background: 'rgba(242, 140, 40, 0.12)',
              padding: '0 4px',
              border: '0.5px solid rgba(242, 140, 40, 0.3)',
              fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace'
            }}>{p}</span>
          }
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
});

export function UsageChart({ history = [], uses }) {
  const data = history.length ? history : [uses];
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, padding: 4, border: 'var(--nb-border-sm)', background: 'var(--bg)' }}>
      {data.map((v, i) => {
        const pct = v / max;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${Math.max(10, pct * 100)}%`,
              background: 'var(--accent)',
              border: 'var(--nb-border-sm)',
              transition: 'height 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          />
        );
      })}
    </div>
  );
}

export function ConfirmModal({ title, message, type = 'confirm', inputPlaceholder, onConfirm, onCancel }) {
  const [val, setVal] = useState('');
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div 
        className="industrial-modal" 
        onClick={e => e.stopPropagation()} 
      >
        <div style={{ padding: '24px', borderBottom: '1px solid #1e2128', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <span className="ft" style={{ fontSize: 13, fontWeight: 800, color: '#f0a532', letterSpacing: 1.5 }}>{title || 'CONFIRMATION_REQUIRED'}</span>
          <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: '24px', fontSize: 14, color: '#c4ccd8', lineHeight: 1.6 }}>
          {message}
          {type === 'prompt' && (
            <input 
              autoFocus
              className="studio-var-input"
              value={val} 
              onChange={e => setVal(e.target.value)} 
              placeholder={inputPlaceholder || "Type here..."} 
              onKeyDown={e => e.key === 'Enter' && onConfirm(val)}
              style={{ marginTop: 16, width: '100%' }}
            />
          )}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #1e2128', display: 'flex', gap: 12, justifyContent: 'flex-end', background: 'rgba(255,255,255,0.02)' }}>
          <button className="btn btn-d" onClick={onCancel} style={{ padding: '10px 24px', fontSize: 11 }}>CANCEL</button>
          <button className="btn btn-v" onClick={() => onConfirm(type === 'prompt' ? val : true)} style={{ padding: '10px 24px', fontSize: 11 }}>{type === 'prompt' ? 'SUBMIT' : 'CONFIRM'}</button>
        </div>
      </div>
    </div>
  );
}
