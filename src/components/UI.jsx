import { getTagColor, MODEL_COLORS } from '../data.js';

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

export function VarHighlight({ text }) {
  const parts = text.split(/(\{\{\w+\}\})/g);
  return (
    <>
      {parts.map((p, i) =>
        /\{\{\w+\}\}/.test(p)
          ? <span key={i} style={{ background: 'var(--accent)', color: '#000', padding: '0 4px', border: '1px solid #000', fontWeight: 800 }}>{p}</span>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

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

