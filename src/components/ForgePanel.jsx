import { useState, useMemo, useEffect } from 'react';
import { extractVars, PATS, UNRE } from '../data.js';
import { Divider, VarHighlight, ResolvedHighlight } from './UI.jsx';

const VTYPES = ['text', 'number', 'date', 'email', 'url', 'textarea', 'select'];
const VM = {
  text:     { e: '✏️', l: 'Text' },
  number:   { e: '🔢', l: 'Num' },
  date:     { e: '📅', l: 'Date' },
  email:    { e: '📧', l: 'Email' },
  url:      { e: '🔗', l: 'URL'  },
  textarea: { e: '📝', l: 'Long' },
  select:   { e: '🔽', l: 'Select' }
};

const SCOL = { 
  handlebars: '#fb923c', 
  template:   '#22d3ee', 
  bracket:    '#c4b5fd', 
  percent:    '#6ee7b7' 
};

export default function ForgePanel({ p, onUpdate, onCopy, requestConfirm }) {
  const vars = useMemo(() => extractVars(p.body), [p.body]);
  const [vals, setVals] = useState({});
  const [vtypes, setVtypes] = useState(p.variableConfig?.types || {});
  const [vopts, setVopts] = useState(p.variableConfig?.options || {});
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedVar, setExpandedVar] = useState(null);

  const handleSave = () => {
    onUpdate({ ...p, variableConfig: { ...p.variableConfig, types: vtypes, options: vopts } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  useEffect(() => {
    const nextVals = { ...vals };
    vars.forEach(v => {
      if (nextVals[v.name] === undefined) nextVals[v.name] = '';
    });
    setVals(nextVals);
  }, [vars]);

  const rendered = useMemo(() => {
    let s = p.body;
    PATS.forEach(pat => {
      const re = new RegExp(pat.re.source, 'g');
      s = s.replace(re, (_, n) => {
        const t = n.trim();
        return vals[t] ? vals[t] : pat.o + n + pat.c;
      });
    });
    return s;
  }, [p.body, vals]);

  const isValidJson = useMemo(() => {
    try { JSON.parse(rendered); return true; } catch { return false; }
  }, [rendered]);

  const handleCopy = () => {
    onCopy(p, true, rendered);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateVarType = (name, type) => {
    const nextTypes = { ...vtypes, [name]: type };
    setVtypes(nextTypes);
    onUpdate({ ...p, variableConfig: { ...p.variableConfig, types: nextTypes } });
  };

  const updateVarOptions = (name, optString) => {
    const opts = optString.split(',').map(o => o.trim()).filter(Boolean);
    const nextOpts = { ...vopts, [name]: opts };
    setVopts(nextOpts);
    onUpdate({ ...p, variableConfig: { ...p.variableConfig, options: nextOpts, types: vtypes } });
  };

  // local renderHighOut replaced by VarHighlight

  return (
    <div className="forge-container">
      <div className="forge-scroll">
        
        {/* Variables Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🛠️</span>
            <span className="ft" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', letterSpacing: 1.5 }}>INPUTS ({vars.length})</span>
          </div>
          <button 
            className="btn btn-sm btn-p" 
            style={{ borderRadius: '100px', padding: '6px 14px' }}
            onClick={() => {
              requestConfirm({
                title: 'SAVE PRESET',
                message: 'Enter a name for this preset:',
                type: 'prompt',
                inputPlaceholder: 'e.g. Test Scenario A',
                onConfirm: (name) => {
                  if (!name) return;
                  const newPresets = [...(p.presets || []), { name, values: { ...vals }, config: { types: vtypes, options: vopts } }];
                  onUpdate({ ...p, presets: newPresets });
                }
              });
            }}
          >+ PRESET</button>
        </div>

        {/* Presets Row */}
        {p.presets?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-light)' }}>
            {p.presets.map((pre, idx) => (
              <button 
                key={idx}
                className="btn btn-sm"
                onClick={() => {
                  setVals(pre.values);
                  if (pre.config) {
                    setVtypes(pre.config.types || {});
                    setVopts(pre.config.options || {});
                  }
                }}
                style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-light)', padding: '6px 12px', borderRadius: '100px', fontSize: 10 }}
              >
                {pre.name.toUpperCase()}
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ ...p, presets: p.presets.filter((_, i) => i !== idx) });
                  }}
                  style={{ marginLeft: 8, color: 'var(--danger)', fontSize: 12 }}
                >✕</span>
              </button>
            ))}
          </div>
        )}

        {/* Variable Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {vars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5, fontStyle: 'italic' }}>
              No variables detected. Use {"{{var}}"}, ${"{var}"}, [var], or %var% in your prompt.
            </div>
          ) : vars.map(v => (
            <div key={v.name} className="forge-input-group">
              <label>
                <span style={{ color: '#F28C28' }}>{v.name}</span>
              </label>

              {expandedVar === v.name && (
                <div style={{ marginBottom: 12, padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 8 }}>FIELD CONFIGURATION</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                    {VTYPES.map(t => (
                      <button 
                        key={t}
                        onClick={() => updateVarType(v.name, t)}
                        style={{ 
                          padding: '4px 8px', borderRadius: 4, fontSize: 10, 
                          border: '1px solid ' + (vtypes[v.name] === t ? 'var(--primary)' : 'var(--border-light)'),
                          background: vtypes[v.name] === t ? 'rgba(239,160,15,0.1)' : 'transparent',
                          color: vtypes[v.name] === t ? 'var(--primary)' : 'var(--text-dim)'
                        }}
                      >
                        {VM[t].e} {VM[t].l}
                      </button>
                    ))}
                  </div>
                  {vtypes[v.name] === 'select' && (
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 4 }}>OPTIONS (COMMA SEPARATED)</div>
                      <input 
                        value={vopts[v.name]?.join(', ') || ''} 
                        onChange={e => updateVarOptions(v.name, e.target.value)}
                        placeholder="Option A, Option B"
                        style={{ height: 36, fontSize: 12 }}
                      />
                    </div>
                  )}
                </div>
              )}

              {vtypes[v.name] === 'textarea' ? (
                <textarea 
                  value={vals[v.name] || ''}
                  onChange={e => setVals({ ...vals, [v.name]: e.target.value })}
                  placeholder={`Enter ${v.name}...`}
                  style={{ minHeight: 80, fontSize: 14, resize: 'vertical' }}
                />
              ) : vtypes[v.name] === 'select' ? (
                <select 
                  value={vals[v.name] || ''}
                  onChange={e => setVals({ ...vals, [v.name]: e.target.value })}
                  style={{ fontSize: 14 }}
                >
                  <option value="">Select {v.name}...</option>
                  {vopts[v.name]?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input 
                  type={vtypes[v.name] || 'text'}
                  value={vals[v.name] || ''}
                  onChange={e => setVals({ ...vals, [v.name]: e.target.value })}
                  placeholder={`Enter ${v.name}...`}
                  style={{ fontSize: 14 }}
                />
              )}
            </div>
          ))}
        </div>

        <Divider margin="16px 0" />

        {/* Live Preview Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>✨</span>
            <span className="ft" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', letterSpacing: 1.5 }}>LIVE OUTPUT</span>
          </div>
          {isValidJson && <span className="forge-badge forge-badge-valid">JSON VALID</span>}
        </div>

        {/* Preview Content */}
        <div className="forge-render-container fm">
          <ResolvedHighlight text={p.body} vals={vals} />
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', display: 'flex', gap: 12 }}>
        <button 
          className={`btn ${copied ? 'btn-v' : 'btn-p'} btn-fw`}
          onClick={handleCopy}
          style={{ height: 52, fontSize: 13, fontWeight: 700, letterSpacing: 1, flex: 1 }}
        >
          {copied ? '✓ COPIED' : 'COPY'}
        </button>
        <button 
          className="btn btn-v btn-fw"
          onClick={handleSave}
          style={{ height: 52, fontSize: 13, fontWeight: 700, letterSpacing: 1, flex: 1 }}
        >
          {saved ? '✓ SAVED' : 'SAVE'}
        </button>
      </div>
    </div>
  );
}
