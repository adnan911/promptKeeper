import { useState, useMemo, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { extractVars, PATS } from '../data.js';
import { VarHighlight, ResolvedHighlight } from './UI.jsx';
import '../studio.css';

/* ── ICONS ───────────────────────────────────────────────── */
const IC = {
  back: "M15 18l-6-6 6-6",
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  attach: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zm0 0v2m0-10V5m7 7h2m-16 0H3m14 4.5l1.5 1.5m-13-13L5 5m12 0l-1.5 1.5m-10 10L5 19",
  play: "M5 3l14 9-14 9V3z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
};

function Ic({ n, s = 14, col }) {
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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="industrial-modal" style={{ padding: 24 }}>
        {children}
      </div>
    </div>
  );
}

export default function ForgeStudio({ initial, onSave, onClose, categories, modelColors }) {
  const [jsonInput, setJsonInput] = useState(() => {
    if (initial) {
      try {
        JSON.parse(initial.body);
        return initial.body;
      } catch (e) {
        return JSON.stringify({
          prompt: initial.body,
          negative_prompt: initial.negative_prompt || "",
          parameters: initial.parameters || {}
        }, null, 2);
      }
    }
    return JSON.stringify({
      prompt: "Cinematic portrait of {{subject}}, high quality 8k.",
      negative_prompt: "blurry, noise",
      parameters: { subject: "Cyberpunk Samurai" }
    }, null, 2);
  });

  const [title, setTitle] = useState(initial?.title || '');
  const [category, setCategory] = useState(initial?.category || 'Coding');
  const [model, setModel] = useState(initial?.model || 'GPT-4');
  const [vals, setVals] = useState(initial?.vals || {});
  const [images, setImages] = useState(initial?.images || []);
  const [activeTab, setActiveTab] = useState('editor'); // editor | preview | config
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  const vars = useMemo(() => {
    try {
      return extractVars(jsonInput);
    } catch { return []; }
  }, [jsonInput]);

  useEffect(() => {
    const nextVals = { ...vals };
    vars.forEach(v => { if (nextVals[v.name] === undefined) nextVals[v.name] = ''; });
    setVals(nextVals);
  }, [vars]);

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

  const handleAttachImage = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await Camera.getPhoto({ quality: 90, allowEditing: false, resultType: CameraResultType.Uri });
        const fileName = `img_${Date.now()}.jpg`;
        await Filesystem.copy({ from: image.path, to: fileName, toDirectory: Directory.Data });
        const uriResult = await Filesystem.getUri({ path: fileName, directory: Directory.Data });
        setImages([uriResult.uri]);
      } catch (e) { console.error("Camera error", e); }
    } else {
      document.getElementById('studio-file-attach').click();
    }
  };

  const handleWebUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImages([ev.target.result]);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!title.trim()) { setIsVaultOpen(true); return; }
    onSave({
      ...initial,
      id: initial?.id || Date.now(),
      title, 
      body: jsonInput, 
      category, 
      model, 
      vals, 
      images,
      thumbnail: images[0] || initial?.thumbnail || null,
      created: initial?.created || Date.now(),
      tags: initial?.tags || ['forge'],
    });
  };

  const [showCopyDone, setShowCopyDone] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rendered);
    setShowCopyDone(true);
  };

  return (
    <div className="studio-root">
      
      {/* Top Bar */}
      <div className="studio-topbar">
        <div className="studio-topbar-back" onClick={onClose}>
          <Ic n="back" /> BACK
        </div>
        <div className="studio-topbar-title">Studio Core</div>
        <div className="studio-topbar-actions">
          <div className="studio-icon-btn" onClick={handleSave} title="Save"><Ic n="save" /></div>
          <div 
            className="studio-icon-btn" 
            onClick={handleAttachImage} 
            title="Attach"
            style={{ position: 'relative', overflow: 'visible' }}
          >
            <Ic n="attach" />
            {images.length > 0 && (
              <div style={{ 
                position: 'absolute', bottom: -2, left: 4, right: 4, 
                height: 3, background: '#f0a532', borderRadius: 1.5,
                boxShadow: '0 0 8px rgba(240, 165, 50, 0.6)'
              }} />
            )}
            <input 
              id="studio-file-attach" 
              type="file" 
              accept="image/*" 
              onChange={handleWebUpload} 
              style={{ display: 'none' }} 
            />
          </div>
        </div>
      </div>

      {/* Tab Row */}
      <div className="studio-tab-row">
        <div className={`studio-tab ${activeTab === 'editor' ? 'active' : ''}`} onClick={() => setActiveTab('editor')}>Editor</div>
        <div className={`studio-tab ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>Preview</div>
        <div className={`studio-tab ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>Config</div>
      </div>

      {/* Body */}
      <div className="studio-body">
        
        {/* EDITOR PANEL */}
        <div className={`studio-tab-panel ${activeTab === 'editor' ? 'active' : ''}`} style={{ display: activeTab === 'editor' ? 'flex' : 'none', flex: 1, flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="studio-section-label" style={{ margin: 0 }}>System Prompt / JSON</div>
            <button 
              className="btn btn-v btn-sm" 
              onClick={handleSave}
              style={{ fontSize: 10, fontWeight: 900, padding: '4px 12px' }}
            >
              SAVE TO VAULT
            </button>
          </div>
          <div className="studio-editor-wrap">
            <div className="studio-editor-header">
              <div className="studio-editor-filename" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                {title.toLowerCase().replace(/\s+/g, '_') || 'prompt'}.json
              </div>
              <div className="studio-editor-lang">JSON</div>
            </div>
            <textarea 
              className="studio-textarea" 
              value={jsonInput} 
              onChange={e => setJsonInput(e.target.value)}
              spellCheck={false}
              placeholder="// Enter prompt schema..."
            />
          </div>

          <div className="studio-section-label">Variables</div>
          <div className="studio-card">
            {vars.map(v => (
              <div key={v.name} className="studio-var-row">
                <div className="studio-var-label">{v.name}</div>
                <input 
                  className="studio-var-input" 
                  value={vals[v.name] || ''} 
                  onChange={e => setVals({...vals, [v.name]: e.target.value})}
                  placeholder="Value..."
                />
              </div>
            ))}
            {vars.length === 0 && <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: '#4a5060' }}>No variables detected</div>}
          </div>
        </div>

        {/* PREVIEW PANEL */}
        <div className={`studio-tab-panel ${activeTab === 'preview' ? 'active' : ''}`} style={{ display: activeTab === 'preview' ? 'flex' : 'none', flex: 1, flexDirection: 'column' }}>
          <div className="studio-section-label">Rendered Output</div>
          <div className="studio-card" style={{ padding: 20, minHeight: 200, background: '#050505', color: '#E2E8F0', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            <ResolvedHighlight text={jsonInput} vals={vals} />
          </div>
          
          <div className="studio-section-label">Attached Image</div>
          <div style={{ padding: '0 16px' }}>
            {images.length > 0 ? (
              <div style={{ position: 'relative', width: '100%', height: 160, border: '1px solid #1e2128', borderRadius: 8, overflow: 'hidden', background: '#000' }}>
                <img 
                  src={images[0].startsWith('data:') || images[0].startsWith('blob:') ? images[0] : Capacitor.convertFileSrc(images[0])} 
                  alt="Attachment" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <button 
                  onClick={() => setImages([])} 
                  style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(239,68,68,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >×</button>
              </div>
            ) : (
              <div style={{ padding: 24, textAlign: 'center', border: '1px dashed #1e2128', borderRadius: 8, fontSize: 11, color: '#4a5060' }}>
                No image attached.
              </div>
            )}
          </div>
        </div>

        {/* CONFIG PANEL */}
        <div className={`studio-tab-panel ${activeTab === 'config' ? 'active' : ''}`} style={{ display: activeTab === 'config' ? 'flex' : 'none', flex: 1, flexDirection: 'column' }}>
          <div className="studio-section-label">Runtime Config</div>
          <div className="studio-card">
            <div className="studio-config-row">
              <div className="studio-config-key">Target Model</div>
              <select 
                className="studio-var-input" 
                style={{ width: 140 }}
                value={model} 
                onChange={e => setModel(e.target.value)}
              >
                {Object.keys(modelColors).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="studio-config-row">
              <div className="studio-config-key">Category</div>
              <select 
                className="studio-var-input" 
                style={{ width: 140 }}
                value={category} 
                onChange={e => setCategory(e.target.value)}
              >
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="studio-config-row">
              <div className="studio-config-key">Sync Metadata</div>
              <div className="studio-toggle"></div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="studio-bottom-bar">
        <button className="studio-run-btn" onClick={handleCopy}>
          <Ic n="play" /> Run & Copy Prompt
        </button>
      </div>

      {/* Vault Modal */}
      {isVaultOpen && (
        <StudioOverlay onClose={() => setIsVaultOpen(false)}>
          <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 20, color: '#f0a532' }}>SAVE_AS_PROMPT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 6 }}>TITLE</div>
              <input className="studio-var-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Project Name..." style={{ width: '100%' }} />
            </div>
            <button className="studio-run-btn" onClick={handleSave} style={{ marginTop: 8 }}>PUSH TO VAULT</button>
          </div>
        </StudioOverlay>
      )}

      {/* Copy Success Modal */}
      {showCopyDone && (
        <StudioOverlay onClose={() => setShowCopyDone(false)}>
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⚡</div>
            <div className="ft" style={{ fontSize: 16, fontWeight: 900, color: '#f0a532', marginBottom: 8 }}>PROMPT_READY</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>
              The resolved prompt has been copied to your clipboard and is ready for use.
            </div>
            <div className="studio-card" style={{ background: '#080a10', textAlign: 'left', maxHeight: 200, overflowY: 'auto', marginBottom: 24 }}>
               <pre style={{ fontSize: 11, color: '#61afef', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{rendered}</pre>
            </div>
            <button className="studio-run-btn" onClick={() => setShowCopyDone(false)}>DISMISS</button>
          </div>
        </StudioOverlay>
      )}

    </div>
  );
}
