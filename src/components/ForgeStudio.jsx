import { useState, useMemo, useEffect, useCallback } from 'react';
import { extractVars, PATS, UNRE } from '../data.js';

/* ── CONSTANTS & UTILS ───────────────────────────────────── */
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

const IC = {
  save: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8",
  copy: "M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-2M16 4h2a2 2 0 012 2v2M11 4h4v4h-4z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  plus: "M12 5v14M5 12h14",
  close: "M18 6L6 18M6 6l12 12",
  exp: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  map: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z",
  share: "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13",
  chain: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  check: "M20 6L9 17l-5-5",
  vault: "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
};

function Ic({ n, s = 16, col }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col || "currentColor"}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={IC[n] || ""} />
    </svg>
  );
}

/* ── STUDIO MODALS ───────────────────────────────────────── */
function StudioOverlay({ children, onClose }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,.85)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: 520, margin: 20, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

export default function ForgeStudio({ onSave, onClose, categories, modelColors }) {
  // Main State
  const [jsonInput, setJsonInput] = useState(`{
  "prompt": "Ultra-realistic cinematic portrait of {{subject}}, wearing {{outfit}}, with {{accessory}}. Shot from a {{camera_angle}} perspective, emphasizing a confident and dominant expression. The subject has {{facial_features}} and {{hairstyle}}. Background is a smooth {{background_color}} gradient with dramatic studio lighting. Lighting setup includes {{lighting_style}} creating strong contrast, soft highlights, and deep shadows. Skin texture is highly detailed, natural imperfections visible. Style is {{style_reference}}, sharp focus, high dynamic range, 8k quality.",
  
  "negative_prompt": "blurry, low resolution, overexposed, underexposed, cartoon, illustration, extra limbs, distorted face, bad anatomy, noise, grainy",

  "parameters": {
    "subject": "{{name}}",
    "outfit": "black blazer with deep neckline",
    "accessory": "round black sunglasses",
    "camera_angle": "low-angle close-up shot",
    "facial_features": "sharp jawline, light beard, defined cheekbones",
    "hairstyle": "thick voluminous styled hair",
    "background_color": "warm orange to dark amber gradient",
    "lighting_style": "dramatic studio lighting with warm tones, rim light, and soft front fill",
    "style_reference": "cinematic editorial photography, luxury fashion portrait"
  },

  "render_settings": {
    "resolution": "1024x1792",
    "quality": "high",
    "style": "photorealistic",
    "aspect_ratio": "9:16"
  }
}`);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[1] || 'Coding');
  const [model, setModel] = useState(Object.keys(modelColors)[0] || 'GPT-4');
  const [vals, setVals] = useState({});
  const [vtypes, setVtypes] = useState({});
  const [vopts, setVopts] = useState({});
  const [expandedVar, setExpandedVar] = useState(null);
  const [error, setError] = useState('');

  // Modals State
  const [profiles, setProfiles] = useState(() => JSON.parse(localStorage.getItem('pf_profiles') || '[]'));
  const [isProfilesOpen, setIsProfilesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('pf_profiles', JSON.stringify(profiles));
  }, [profiles]);

  // Derived Data
  const vars = useMemo(() => {
    try {
      JSON.parse(jsonInput);
      setError('');
      return extractVars(jsonInput);
    } catch (e) {
      setError('Syntax Error: ' + e.message);
      return [];
    }
  }, [jsonInput]);

  useEffect(() => {
    const nextVals = { ...vals };
    vars.forEach(v => {
      if (nextVals[v.name] === undefined) nextVals[v.name] = '';
    });
    setVals(nextVals);
  }, [vars]);

  const displayRendered = useMemo(() => {
    let s = jsonInput;
    PATS.forEach(pat => {
      const re = new RegExp(pat.re.source, 'g');
      s = s.replace(re, (_, n) => {
        const t = n.trim();
        const val = vals[t];
        if (val) {
          return `§B§${val}§E§`; // Blue marker
        } else {
          return `§O§${pat.o + n + pat.c}§E§`; // Orange marker
        }
      });
    });
    return s;
  }, [jsonInput, vals]);

  const rendered = useMemo(() => {
    let s = jsonInput;
    PATS.forEach(pat => {
      const re = new RegExp(pat.re.source, 'g');
      s = s.replace(re, (_, n) => {
        const t = n.trim();
        return vals[t] ? vals[t] : pat.o + n + pat.c;
      });
    });
    return s;
  }, [jsonInput, vals]);

  const isValidJson = useMemo(() => {
    try { JSON.parse(rendered); return true; } catch { return false; }
  }, [rendered]);

  // Actions
  const handleSave = () => {
    if (!title.trim()) { alert('Title is required'); return; }
    onSave({
      title,
      body: jsonInput,
      category,
      model,
      tags: ['forge-studio', 'json'],
      variableConfig: { types: vtypes, options: vopts },
      fav: false
    });
    setIsVaultOpen(false);
  };

  const handleFormat = () => {
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj, null, 2));
    } catch (e) {
      alert('Invalid JSON structure');
    }
  };

  const renderHighOut = (text) => {
    if (!text) return null;
    const parts = [];
    let last = 0;
    // Regex for markers §B§...§E§ and §O§...§E§
    const re = /§([BO])§(.*?)§E§/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push({ t: text.slice(last, m.index), type: 'text' });
      parts.push({ t: m[2], type: m[1] === 'B' ? 'blue' : 'orange' });
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push({ t: text.slice(last), type: 'text' });
    
    return parts.map((part, i) => {
      if (part.type === 'orange') return <span key={i} style={{ background: 'rgba(239, 160, 15, 0.15)', color: 'var(--primary)', borderRadius: 4, padding: '0 4px', border: '1px solid rgba(239, 160, 15, 0.3)', fontWeight: 600 }}>{part.t}</span>;
      if (part.type === 'blue') return <span key={i} style={{ background: 'rgba(46, 156, 160, 0.15)', color: 'var(--primary)', opacity: 0.8, borderRadius: 4, padding: '0 4px', border: '1px solid rgba(46, 156, 160, 0.3)', fontWeight: 600 }}>{part.t}</span>;
      return <span key={i}>{part.t}</span>;
    });
  };

  const safeBtoA = (str) => {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      return btoa(str);
    }
  };

  const downloadFile = (content, fileName, contentType) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const getExportData = (fmt) => {
    if (fmt === 'json') return rendered;
    if (fmt === 'env') return Object.entries(vals).map(([k,v])=>k.toUpperCase()+'="'+(v||"")+'"').join("\n");
    if (fmt === 'curl') return `curl -X POST https://api.openai.com/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d '${rendered.replace(/'/g, "'\\''")}'`;
    return rendered;
  };

  return (
    <div className="studio-layout" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      
      {/* Pane 1: IDE Editor & Variables */}
      <div className="studio-pane" style={{ background: 'var(--bg-panel)' }}>
        <div className="studio-header" style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-sub)', backdropFilter: 'blur(10px)', height: 70, padding: '0 24px' }}>
          <div className="studio-title-group">
            <div>
              <div className="ft" style={{ fontSize: 16, fontWeight: 900, letterSpacing: 1, color: 'var(--text)' }}>FORGE STUDIO</div>
            </div>
          </div>
          <button className="studio-btn-ghost" onClick={onClose}>← EXIT</button>
        </div>
        
        <div className="studio-content" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Section A: Editor */}
          <div className="studio-textarea-wrapper" style={{ margin: '20px', flex: '0 0 420px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '10px 20px', background: 'var(--bg-sub)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="ft" style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 1.5 }}>SCHEMA.JSON</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="studio-btn-ghost" onClick={() => setIsVaultOpen(true)} title="Vault"><Ic n="vault" s={13} /></button>
                <button className="studio-btn-ghost" onClick={handleFormat} style={{ padding: '4px 10px', fontSize: 10 }}>FORMAT</button>
                <button className="studio-btn-ghost" onClick={() => setIsPreviewOpen(true)} style={{ padding: '4px 10px', fontSize: 10, background: 'rgba(239, 160, 15, 0.1)', color: 'var(--primary)', border: '1px solid rgba(239, 160, 15, 0.2)' }}>FULL VIEW</button>
              </div>
            </div>
            <div style={{ position: 'relative', flex: 1, overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
              <div 
                className="studio-code-area"
                style={{ 
                  position: 'absolute', inset: 0, padding: 20, pointerEvents: 'none', 
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'transparent', overflow: 'hidden',
                  fontFamily: "'JetBrains Mono', monospace", lineHeight: '1.8', fontSize: 14
                }}
              >
                {renderHighOut(jsonInput)}
              </div>
              <textarea 
                className="studio-code-area"
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
                onScroll={e => {
                  const target = e.target;
                  const highlighter = target.previousSibling;
                  if (highlighter) {
                    highlighter.scrollTop = target.scrollTop;
                    highlighter.scrollLeft = target.scrollLeft;
                  }
                }}
                placeholder="// Construct your JSON template..."
                spellCheck={false}
                style={{ 
                  position: 'relative', background: 'transparent', padding: 20, 
                  color: 'var(--text)', caretColor: 'var(--primary)', width: '100%', height: '100%',
                  zIndex: 1, fontFamily: "'JetBrains Mono', monospace", lineHeight: '1.8', fontSize: 14,
                  border: 'none', outline: 'none', resize: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-light)', minHeight: 0, background: 'var(--bg)' }}>
            <div style={{ padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-sub)' }}>
              <div className="ft" style={{ marginBottom: 0, fontSize: 10, color: 'var(--primary)', letterSpacing: 2 }}>VARIABLES</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="studio-btn-ghost" onClick={() => setIsProfilesOpen(true)} title="Profiles"><Ic n="chain" s={12} /></button>
                <div className="ft" style={{ fontSize: 9, fontWeight: 900, background: 'rgba(239, 160, 15, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 4 }}>{vars.length}</div>
              </div>
            </div>
            
            <div className="studio-content" style={{ padding: '24px', margin: 0, overflowY: 'auto' }}>
              {vars.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: 40, opacity: 0.3 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🛠️</div>
                  <div className="ft" style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1, color: 'var(--text-dim)' }}>NO VARIABLES FOUND</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {vars.map(v => (
                    <div key={v.name} className="glass" style={{ padding: '12px 20px', margin: 0, display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-glass)', borderRadius: 12 }}>
                      <div className="ft" style={{ flex: '0 0 140px', fontSize: 11, fontWeight: 900, color: 'var(--primary)', letterSpacing: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.name.toUpperCase()}
                      </div>

                      <div style={{ flex: 1 }}>
                        {vtypes[v.name] === 'textarea' ? (
                          <textarea 
                            id={`var-input-${v.name}`}
                            className="studio-code-area fm" 
                            style={{ width: '100%', height: 40, fontSize: 12, borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', padding: '8px 12px', color: 'var(--text)', resize: 'none' }} 
                            value={vals[v.name] || ''} 
                            onChange={e => setVals({ ...vals, [v.name]: e.target.value })} 
                            placeholder="Value..." 
                          />
                        ) : (
                          <input 
                            id={`var-input-${v.name}`}
                            type={vtypes[v.name] || 'text'} 
                            className="studio-select-dark ft" 
                            style={{ width: '100%', height: 38, fontSize: 12, borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: 'var(--text)' }} 
                            value={vals[v.name] || ''} 
                            onChange={e => setVals({ ...vals, [v.name]: e.target.value })} 
                            placeholder="Value..." 
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Preview FAB */}
        <button 
          className="btn btn-v" 
          onClick={() => setIsPreviewOpen(true)}
          style={{ 
            position: 'fixed', bottom: 32, right: 32, 
            width: 64, height: 64, borderRadius: '50%', 
            fontSize: 24, boxShadow: 'var(--shadow-primary)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          title="Live Output Preview"
        >
          👁️
        </button>
      </div>

      {/* Pane 2 Removed - Now Full-screen Overlay below */}

      {/* ── OVERLAYS ────────────────────────────────────────── */}

      {isPreviewOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'var(--bg)', display: 'flex', flexDirection: 'column', animation: 'studioSlideIn 0.3s' }}>
          <div className="studio-header" style={{ padding: '0 40px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-sub)', backdropFilter: 'blur(10px)', height: 80 }}>
            <div className="ft" style={{ fontSize: 16, fontWeight: 900, color: 'var(--primary)', letterSpacing: 2 }}>LIVE ORCHESTRATION</div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
              <button className="studio-btn-ghost" style={{ background: 'var(--bg-glass)' }} onClick={() => setIsShareOpen(true)} title="Share"><Ic n="share" s={14} /></button>
              <button className="studio-btn-ghost" style={{ background: 'var(--bg-glass)' }} onClick={() => setIsExportOpen(true)} title="Export"><Ic n="exp" s={14} /></button>
              <div style={{ 
                fontSize: 10, fontWeight: 900, 
                color: isValidJson ? '#10b981' : '#ef4444',
                background: 'rgba(0,0,0,0.2)',
                padding: '6px 16px', borderRadius: 100, border: '1px solid currentColor'
              }}>
                {isValidJson ? 'JSON VALID' : 'INVALID'}
              </div>
              <button className="studio-btn-ghost" onClick={() => setIsPreviewOpen(false)} style={{ background: 'var(--bg-glass)', color: 'var(--text)' }}>CLOSE</button>
            </div>
          </div>
          
          <div style={{ padding: '40px', flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
            <div className="glass-panel" style={{ color: 'var(--text-sub)', border: '1px solid var(--border-light)', padding: '40px', fontSize: 14, lineHeight: '1.8', whiteSpace: 'pre-wrap', maxWidth: 1000, margin: '0 auto', boxShadow: 'var(--shadow-soft)' }}>
              {renderHighOut(displayRendered)}
            </div>
          </div>
 
          <div style={{ padding: '32px 40px', background: 'var(--bg-sub)', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'center' }}>
            <button 
              className="btn btn-v"
              onClick={() => { navigator.clipboard.writeText(rendered); alert('Copied!'); }}
              style={{ height: 68, borderRadius: 20, fontWeight: 900, fontSize: 18, background: 'var(--primary)', color: 'var(--bg)', padding: '0 60px', boxShadow: 'var(--shadow-primary)' }}
            >
              COPY FINAL PROMPT
            </button>
          </div>
        </div>
      )}
      
      {isVaultOpen && (
        <StudioOverlay onClose={() => setIsVaultOpen(false)}>
          <div style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 900 }}>VAULT INTEGRATION</div>
              <button className="studio-btn-ghost" onClick={() => setIsVaultOpen(false)}><Ic n="close" s={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: '0 0 120px', fontSize: 10, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 1 }}>TITLE</div>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Analysis Pipeline" className="studio-select-dark" style={{ flex: 1, height: 44 }} />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: '0 0 120px', fontSize: 10, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 1 }}>CATEGORY</div>
                <select className="studio-select-dark" style={{ flex: 1, height: 44 }} value={category} onChange={e => setCategory(e.target.value)}>
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: '0 0 120px', fontSize: 10, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 1 }}>MODEL</div>
                <select className="studio-select-dark" style={{ flex: 1, height: 44 }} value={model} onChange={e => setModel(e.target.value)}>
                  {Object.keys(modelColors).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <button className="btn btn-p btn-fw" onClick={handleSave} style={{ height: 60, borderRadius: 16, marginTop: 12, fontWeight: 900, background: 'var(--primary)', color: 'var(--bg)' }}>
                SAVE TO VAULT
              </button>
            </div>
          </div>
        </StudioOverlay>
      )}

      {/* Other Modals (Profiles, Export, Map, Share) remain same but with StudioOverlay */}
      {isProfilesOpen && (
        <StudioOverlay onClose={() => setIsProfilesOpen(false)}>
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 900 }}>FILL PROFILES</div>
              <button className="studio-btn-ghost" onClick={() => { const n = prompt("Name:"); if(n) setProfiles([...profiles, { id: Date.now(), name: n, values: { ...vals } }]); }}><Ic n="plus" s={14} /> NEW</button>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {profiles.map(p => (
                <div key={p.id} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-v" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => { setVals(p.values); setIsProfilesOpen(false); }}>APPLY</button>
                    <button className="btn btn-p" style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.2)', color: '#ef4444' }} onClick={() => setProfiles(profiles.filter(x => x.id !== p.id))}><Ic n="trash" s={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </StudioOverlay>
      )}

      {isExportOpen && (
        <StudioOverlay onClose={() => setIsExportOpen(false)}>
          <div style={{ padding: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>EXPORT OPTIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['json', 'env', 'curl'].map(fmt => (
                <div key={fmt} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase' }}>{fmt}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="studio-btn-ghost" onClick={() => { navigator.clipboard.writeText(getExportData(fmt)); alert('Copied!'); }}><Ic n="copy" s={12} /></button>
                      <button 
                        className="studio-btn-ghost" 
                        onClick={() => {
                          const content = getExportData(fmt);
                          const ext = fmt === 'json' ? 'json' : (fmt === 'env' ? 'env' : 'txt');
                          downloadFile(content, `forge-export.${ext}`, 'text/plain');
                        }}
                      >
                        <Ic n="exp" s={12} />
                      </button>
                    </div>
                  </div>
                  <pre style={{ fontSize: 10, opacity: 0.5, whiteSpace: 'pre-wrap', maxHeight: 80, overflow: 'hidden' }}>{getExportData(fmt)}</pre>
                </div>
              ))}
            </div>
          </div>
        </StudioOverlay>
      )}


      {isShareOpen && (
        <StudioOverlay onClose={() => setIsShareOpen(false)}>
          <div style={{ padding: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>SHARE TEMPLATE</div>
            <input 
              readOnly 
              className="studio-select-dark" 
              style={{ width: '100%', fontSize: 10, color: '#f59e0b' }} 
              value={window.location.origin + "/forge?d=" + safeBtoA(JSON.stringify({ json: jsonInput, vals }))} 
            />
            <button 
              className="btn btn-v btn-fw" 
              style={{ marginTop: 12 }} 
              onClick={() => { 
                const link = window.location.origin + "/forge?d=" + safeBtoA(JSON.stringify({ json: jsonInput, vals }));
                navigator.clipboard.writeText(link); 
                alert('Link copied!'); 
              }}
            >
              COPY LINK
            </button>
          </div>
        </StudioOverlay>
      )}

    </div>
  );
}
