import { useState } from 'react';
import { Divider } from './UI.jsx';

export default function ImportExportModal({ prompts, onImport, onClose }) {
  const [tab, setTab] = useState('export');
  const [importText, setImportText] = useState('');
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  const json = JSON.stringify(prompts, null, 2);

  function doExport() {
    const b = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = `prompt-keeper-export-${Date.now()}.json`;
    a.click();
  }

  function copyJson() {
    navigator.clipboard.writeText(json).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function doImport() {
    try {
      const d = JSON.parse(importText);
      if (!Array.isArray(d)) throw new Error('Expected a JSON array');
      const valid = d.filter(p => p.title && p.body);
      if (!valid.length) throw new Error('No valid prompts found');
      onImport(valid.map(p => ({
        ...p,
        id: p.id || Date.now() + Math.random(),
        tags: p.tags || [],
        category: p.category || 'Personal',
        model: p.model || 'Any',
        fav: p.fav || false,
        uses: p.uses || 0,
        created: p.created || Date.now(),
        history: p.history || [],
        notes: p.notes || '',
      })));
      onClose();
    } catch (e) {
      setErr(e.message || 'Invalid JSON format');
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="industrial-modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 600 }}
      >
        {/* Header / Tabs */}
        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
          {['export', 'import'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setErr(''); }}
              className="ft"
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: 14,
                letterSpacing: 1,
                fontWeight: 600,
                color: tab === t ? 'var(--text)' : 'var(--text-dim)',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all .2s ease',
                textTransform: 'uppercase',
                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1,
                opacity: tab === t ? 1 : 0.6
              }}
            >
              {t} DATA
            </button>
          ))}
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 20, width: 36, height: 36, borderRadius: '50%', border: 'none', marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>✕</button>
        </div>

        <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {tab === 'export' ? (
            <>
              <div className="ft" style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                VAULT EXPORT <span style={{ color: 'var(--text-sub)' }}>// {prompts.length} ITEMS</span>
              </div>
              <div style={{ position: 'relative' }}>
                <textarea
                  readOnly
                  value={json}
                  style={{ 
                    minHeight: 280, 
                    fontSize: 13, 
                    color: 'var(--text)', 
                    lineHeight: 1.6, 
                    cursor: 'text', 
                    border: '1px solid var(--border-light)', 
                    background: 'rgba(0,0,0,0.2)',
                    fontFamily: 'JetBrains Mono,monospace',
                    fontWeight: 400,
                    borderRadius: 'var(--radius)',
                    padding: '16px',
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <button className="btn btn-v btn-fw btn-lg" onClick={doExport} style={{ fontWeight: 600, letterSpacing: 0.5 }}>
                  ⬇ DOWNLOAD .JSON
                </button>
                <button className="btn btn-g btn-lg" onClick={copyJson} style={{ flexShrink: 0, minWidth: 160, fontWeight: 600, letterSpacing: 0.5 }}>
                  {copied ? '✓ COPIED' : 'COPY JSON'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="ft" style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                IMPORT DATA <span style={{ color: 'var(--text-sub)' }}>// PASTE JSON ARRAY</span>
              </div>
              <textarea
                value={importText}
                onChange={e => { setImportText(e.target.value); setErr(''); }}
                placeholder={'[\n  {\n    "title": "MY PROMPT",\n    "body": "...",\n    "tags": ["AI"],\n    "category": "CODING",\n    "model": "CLAUDE"\n  }\n]'}
                style={{ 
                  minHeight: 280, 
                  fontSize: 13, 
                  lineHeight: 1.6, 
                  border: '1px solid var(--border-light)', 
                  background: 'rgba(0,0,0,0.2)',
                  color: 'var(--text)',
                  fontFamily: 'JetBrains Mono,monospace',
                  fontWeight: 400,
                  borderRadius: 'var(--radius)',
                  padding: '16px',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              {err && (
                <div style={{ background: 'var(--danger)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', padding: '12px 16px', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                  ⚠ ERROR: {err.toUpperCase()}
                </div>
              )}
              <button
                className="btn btn-v btn-fw btn-lg"
                onClick={doImport}
                disabled={!importText.trim()}
                style={{ opacity: importText.trim() ? 1 : 0.4, fontWeight: 600, letterSpacing: 0.5 }}
              >
                ⬆ INITIALIZE IMPORT
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
