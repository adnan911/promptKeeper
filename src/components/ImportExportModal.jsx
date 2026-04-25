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
        className="asu"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 580, background: '#fff',
          border: 'var(--nb-border)',
          boxShadow: 'var(--nb-shadow-lg)',
          borderRadius: 0,
        }}
      >
        {/* Header / Tabs */}
        <div style={{ padding: '0 24px', borderBottom: 'var(--nb-border-sm)', display: 'flex', alignItems: 'center', background: '#fff' }}>
          {['export', 'import'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setErr(''); }}
              className="ft"
              style={{
                background: tab === t ? 'var(--accent)' : 'none',
                border: 'none',
                borderRight: '1px solid #000',
                fontSize: 12,
                letterSpacing: 1,
                fontWeight: 900,
                color: '#000',
                padding: '20px 24px',
                cursor: 'pointer',
                transition: 'all .1s',
                textTransform: 'uppercase',
                borderBottom: tab === t ? '2px solid #000' : 'none',
                marginBottom: -1,
              }}
            >
              {t} DATA
            </button>
          ))}
          <button onClick={onClose} style={{ background: '#000', color: '#fff', fontSize: 18, padding: '0 10px', height: 32, border: '1px solid #000', marginLeft: 'auto', fontWeight: 900 }}>×</button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tab === 'export' ? (
            <>
              <div style={{ fontSize: 13, color: '#000', fontWeight: 800, textTransform: 'uppercase' }}>
                VAULT EXPORT <span style={{ color: '#666' }}>// {prompts.length} ITEMS</span>
              </div>
              <div style={{ position: 'relative' }}>
                <textarea
                  readOnly
                  value={json}
                  style={{ 
                    minHeight: 240, 
                    fontSize: 11, 
                    color: '#000', 
                    lineHeight: 1.5, 
                    cursor: 'text', 
                    border: 'var(--nb-border-sm)', 
                    background: '#f8f8f8',
                    fontFamily: 'JetBrains Mono,monospace',
                    fontWeight: 500
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-v btn-fw btn-lg" onClick={doExport} style={{ fontWeight: 900 }}>
                  ⬇ DOWNLOAD .JSON
                </button>
                <button className="btn btn-g btn-lg" onClick={copyJson} style={{ flexShrink: 0, minWidth: 140, fontWeight: 900 }}>
                  {copied ? '✓ COPIED' : 'COPY JSON'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13, color: '#000', fontWeight: 800, textTransform: 'uppercase' }}>
                IMPORT DATA <span style={{ color: '#666' }}>// PASTE JSON ARRAY</span>
              </div>
              <textarea
                value={importText}
                onChange={e => { setImportText(e.target.value); setErr(''); }}
                placeholder={'[\n  {\n    "title": "MY PROMPT",\n    "body": "...",\n    "tags": ["AI"],\n    "category": "CODING",\n    "model": "CLAUDE"\n  }\n]'}
                style={{ 
                  minHeight: 240, 
                  fontSize: 12, 
                  lineHeight: 1.6, 
                  border: 'var(--nb-border-sm)', 
                  background: '#fff',
                  fontFamily: 'JetBrains Mono,monospace',
                  fontWeight: 500
                }}
              />
              {err && (
                <div style={{ background: 'var(--danger)', border: 'var(--nb-border-sm)', color: '#fff', padding: '10px 16px', fontSize: 12, fontWeight: 900 }}>
                  ⚠ ERROR: {err.toUpperCase()}
                </div>
              )}
              <button
                className="btn btn-v btn-fw btn-lg"
                onClick={doImport}
                disabled={!importText.trim()}
                style={{ opacity: importText.trim() ? 1 : 0.4, fontWeight: 900 }}
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
