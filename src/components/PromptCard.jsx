import { TagPill, ModelBadge } from './UI.jsx';
import { extractVars } from '../data.js';

export default function PromptCard({ p, isActive, onClick, onFav, onCopy, modelColors }) {
  const vars = extractVars(p.body);
  const preview = p.body
    .replace(/\{\{(\w+)\}\}/g, '[$1]')
    .replace(/```[\s\S]*?```/g, '[code block]')
    .replace(/#+\s/g, '')
    .trim()
    .slice(0, 110) + '…';

  return (
    <div
      className={`card-hover afu ${isActive ? 'active-card' : 'glass-panel'}`}
      onClick={() => onClick(p)}
      style={{
        padding: 16,
        cursor: 'pointer',
        background: isActive ? 'rgba(46, 156, 160, 0.2)' : 'var(--bg-panel)',
        border: isActive ? '1px solid var(--secondary)' : '1px solid var(--border-light)',
        boxShadow: isActive ? 'var(--shadow-glow)' : 'var(--shadow-soft)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        borderRadius: 'var(--radius)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}
    >
      {/* Top row: Title + Fav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div className="ft" style={{ fontSize: 16, fontWeight: 700, color: isActive ? '#fff' : 'var(--text)', lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {p.title}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onFav(p.id); }}
          style={{ 
            background: p.fav ? 'rgba(239, 160, 15, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
            border: p.fav ? '1px solid rgba(239, 160, 15, 0.5)' : '1px solid var(--border-light)', 
            fontSize: 14, 
            color: p.fav ? 'var(--primary)' : 'var(--text-sub)', 
            padding: '2px 6px', 
            borderRadius: '50%',
            transition: 'all .2s ease', 
            flexShrink: 0
          }}
        >
          {p.fav ? '★' : '☆'}
        </button>
      </div>
      {/* Preview */}
      <div style={{ fontSize: 12, color: isActive ? '#fff' : 'var(--text-sub)', lineHeight: 1.5, fontWeight: 400, flexGrow: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
        {preview}
      </div>

      {/* Tags & Model */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <ModelBadge model={p.model} color={modelColors?.[p.model]} size="sm" />
        {p.tags.slice(0, 3).map(t => <TagPill key={t} tag={t} size="sm" />)}
        {p.tags.length > 3 && (
          <span style={{ fontSize: 10, color: 'var(--text-dim)', alignSelf: 'center', fontWeight: 600 }}>+{p.tags.length - 3}</span>
        )}
        {p.images?.length > 0 && (
          <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 2 }}>
            🖼️ {p.images.length}
          </span>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: 12, marginTop: 'auto' }}>
        <span className="ft" style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 600, letterSpacing: 0.5 }}>
          USED {p.uses}×
          {p.category && <span style={{ color: 'var(--secondary)', marginLeft: 6, fontWeight: 700 }}>/ {p.category.toUpperCase()}</span>}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {vars.length > 0 && (
            <span style={{
              background: 'rgba(83, 57, 70, 0.3)', border: '1px solid rgba(83, 57, 70, 0.5)',
              color: 'var(--text)', padding: '4px 10px', fontSize: 10,
              fontWeight: 600, borderRadius: 'var(--radius-sm)'
            }}>
              VARS: {vars.length}
            </span>
          )}
          <button
            className="btn btn-c btn-sm"
            onClick={e => { e.stopPropagation(); onCopy(p); }}
            style={{ fontWeight: 600, padding: '6px 12px' }}
          >
            COPY
          </button>
        </div>
      </div>
    </div>
  );
}
