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
      className="card-hover afu"
      onClick={() => onClick(p)}
      style={{
        padding: 12,
        cursor: 'pointer',
        background: isActive ? 'var(--primary)' : 'var(--bg-sub)',
        border: 'var(--nb-border-sm)',
        boxShadow: isActive ? 'var(--nb-shadow)' : 'var(--nb-shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      {/* Top row: Title + Fav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div className="ft" style={{ fontSize: 14, fontWeight: 900, color: isActive ? '#000' : 'var(--text)', lineHeight: 1.2, textTransform: 'uppercase' }}>
          {p.title}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onFav(p.id); }}
          style={{ background: 'var(--bg-sub)', border: '1px solid var(--text)', fontSize: 14, color: p.fav ? '#FFD700' : 'var(--text)', padding: '1px 5px', transition: 'all .15s', flexShrink: 0, boxShadow: '1px 1px 0px 0px #000' }}
        >
          {p.fav ? '★' : '☆'}
        </button>
      </div>
      {/* Preview */}
      <div style={{ fontSize: 11, color: isActive ? '#000' : 'var(--text-sub)', lineHeight: 1.4, fontWeight: 500, flexGrow: 1, padding: '4px 8px', borderLeft: '2px solid var(--primary)' }}>
        {preview}
      </div>

      {/* Tags & Model */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <ModelBadge model={p.model} color={modelColors?.[p.model]} size="sm" />
        {p.tags.slice(0, 3).map(t => <TagPill key={t} tag={t} size="sm" />)}
        {p.tags.length > 3 && (
          <span style={{ fontSize: 8, color: 'var(--text-dim)', alignSelf: 'center', fontWeight: 800 }}>+{p.tags.length - 3}</span>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: 'var(--nb-border-sm)', paddingTop: 8, marginTop: 'auto' }}>
        <span className="ft" style={{ fontSize: 9, color: isActive ? '#000' : 'var(--text)', fontWeight: 700 }}>
          USED {p.uses}×
          {p.category && <span style={{ color: isActive ? '#000' : 'var(--accent)', marginLeft: 6, fontWeight: 900 }}>/ {p.category.toUpperCase()}</span>}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {vars.length > 0 && (
            <span style={{
              background: 'var(--accent)', border: '1px solid #000',
              color: '#000', padding: '4px 10px', fontSize: 9,
              fontWeight: 900,
            }}>
              VARS: {vars.length}
            </span>
          )}
          <button
            className="btn btn-c btn-sm"
            onClick={e => { e.stopPropagation(); onCopy(p); }}
            style={{ fontWeight: 900, padding: '4px 10px' }}
          >
            COPY
          </button>
        </div>
      </div>
    </div>
  );
}
