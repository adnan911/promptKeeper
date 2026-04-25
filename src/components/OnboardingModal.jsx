import React from 'react';

export default function OnboardingModal({ onChoose }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="asu" style={{ 
        width: '90%', maxWidth: 440, background: 'var(--bg-sub)', border: 'var(--nb-border)', 
        boxShadow: 'var(--nb-shadow-lg)', padding: '40px 24px', textAlign: 'center',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        <div className="ft" style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, color: 'var(--text)', lineHeight: 1.1 }}>
          WELCOME TO PROMPT KEEPER
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 32, lineHeight: 1.6, fontWeight: 500 }}>
          Your ultimate prompt engineering vault. <br/>
          Choose how you want to start your journey. <br/>
          <span style={{ color: 'var(--accent)', fontWeight: 800 }}>All data stays locally in your browser.</span>
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button 
            className="btn btn-c btn-lg" 
            onClick={() => onChoose('fresh')}
            style={{ fontWeight: 900, height: 56, fontSize: 14 }}
          >
            START FRESH (EMPTY)
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--text-dim)' }} />
            <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800 }}>OR EXPLORE THE TOOLS</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--text-dim)' }} />
          </div>

          <button 
            className="btn btn-v btn-lg" 
            onClick={() => onChoose('demo')}
            style={{ fontWeight: 900, height: 56, fontSize: 14 }}
          >
            LOAD DEMO PROMPTS
          </button>
        </div>

        <div style={{ marginTop: 24, fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.5 }}>
          v1.2.0 PREMIUM EDITION
        </div>
      </div>
    </div>
  );
}
