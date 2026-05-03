import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ── CONSTANTS ─────────────────────────────────────────── */
const OR = "#f97316";
const PATS = [
  { re:/\{\{([^}]+)\}\}/g, syn:"handlebars", o:"{{", c:"}}" },
  { re:/\$\{([^}]+)\}/g,   syn:"template",   o:"${", c:"}"  },
  { re:/\[([A-Z_][A-Z0-9_]*)\]/g, syn:"bracket", o:"[", c:"]" },
  { re:/%([A-Z_][A-Z0-9_]*)%/g,   syn:"percent",  o:"%", c:"%" },
];
const UNRE = /(\{\{[^}]+\}\}|\$\{[^}]+\}|\[[A-Z_][A-Z0-9_]*\]|%[A-Z_][A-Z0-9_]*%)/g;
const SCOL = { handlebars:"#fb923c", template:"#22d3ee", bracket:"#c4b5fd", percent:"#6ee7b7" };
const VTYPES = ["text","number","date","email","url","textarea","select"];
const VM = { text:{e:"✏️",l:"Text"}, number:{e:"🔢",l:"Num"}, date:{e:"📅",l:"Date"}, email:{e:"📧",l:"Email"}, url:{e:"🔗",l:"URL"}, textarea:{e:"📝",l:"Long"}, select:{e:"🔽",l:"Select"} };
const TH = {
  dark:  { bg:"#0a0a0c", s1:"#111116", s2:"#18181d", s3:"#222228", s4:"#2e2e36", s5:"#3a3a44", bd:"rgba(255,255,255,.07)", bh:"rgba(255,255,255,.04)", bh2:"rgba(255,255,255,.08)", tx:"#f4f4f5", tx2:"#a1a1aa", tx3:"#52525b" },
  light: { bg:"#f0f0f4", s1:"#e8e8ec", s2:"#dcdce2", s3:"#d0d0d8", s4:"#b8b8c2", s5:"#9898a8", bd:"rgba(0,0,0,.09)", bh:"rgba(0,0,0,.04)", bh2:"rgba(0,0,0,.08)", tx:"#18181b", tx2:"#52525b", tx3:"#a1a1aa" },
  amoled:{ bg:"#000",    s1:"#080808", s2:"#0e0e0e", s3:"#141414", s4:"#1c1c1c", s5:"#242424", bd:"rgba(255,255,255,.055)", bh:"rgba(255,255,255,.025)", bh2:"rgba(255,255,255,.05)", tx:"#f4f4f5", tx2:"#a1a1aa", tx3:"#52525b" },
};
const IC = {
  bolt:"M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  save:"M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8",
  copy:"M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-2M16 4h2a2 2 0 012 2v2M11 4h4v4h-4z",
  check:"M20 6L9 17l-5-5", trash:"M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  plus:"M12 5v14M5 12h14", close:"M18 6L6 18M6 6l12 12",
  search:"M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  edit:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z",
  vars:"M4 6h16M4 12h16M4 18h7",
  reset:"M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15",
  clock:"M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2",
  lib:"M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V4h16v13M12 10v4M10 12h4",
  map:"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z",
  user:"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  chain:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  exp:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  sun:"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 17a5 5 0 100-10 5 5 0 000 10z",
  moon:"M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  share:"M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13",
  folder:"M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
};
const LS = { PR:"pf_p6", FO:"pf_f6", PF:"pf_pf6", CH:"pf_ch6", TH:"pf_th6" };
const EX = `{\n  "system": "You are a {{role}} for {{domain}}.",\n  "prompt": "Hi {{user_name}}, your task is \${task}.",\n  "config": { "language": "{{language}}", "tone": "{{tone}}" }\n}`;

/* ── HELPERS ───────────────────────────────────────────── */
function lget(k,d){try{return JSON.parse(localStorage.getItem(k))||d;}catch{return d;}}
function lset(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}

function flatten(o,p,r){
  p=p||"";r=r||{};
  if(typeof o!=="object"||!o){r[p]=o;return r;}
  for(const[k,v]of Object.entries(o)){
    const key=p?p+"."+k:k;
    typeof v==="object"&&v&&!Array.isArray(v)?flatten(v,key,r):r[key]=v;
  }
  return r;
}
function extractVars(obj){
  const out={};
  for(const[path,val]of Object.entries(flatten(obj))){
    if(typeof val!=="string")continue;
    for(const p of PATS){
      const re=new RegExp(p.re.source,"g");let m;
      while((m=re.exec(val))!==null){
        const n=m[1].trim();
        if(!out[n])out[n]={syn:p.syn,paths:[],count:0};
        out[n].count++;
        if(!out[n].paths.includes(path))out[n].paths.push(path);
      }
    }
  }
  return out;
}
function buildOut(obj,vals){
  let s=JSON.stringify(obj,null,2);
  for(const p of PATS){
    const re=new RegExp(p.re.source,"g");
    s=s.replace(re,(_,n)=>{const t=n.trim();return vals[t]?vals[t]:p.o+n+p.c;});
  }
  return s;
}

/* ── STYLE UTILS ───────────────────────────────────────── */
function glass(t){return{background:t.bh,border:"1px solid "+t.bd,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)"};}
function glass2(t){return{background:t==="light"?"rgba(255,255,255,.92)":"rgba(30,30,38,.92)",border:"1px solid rgba(255,255,255,.10)",backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)"};}
function inp(t,ex){return{width:"100%",background:t.bh,border:"1.5px solid "+t.s4,borderRadius:9,color:t.tx,fontSize:13,padding:"9px 13px",fontFamily:"inherit",transition:"border-color .15s",outline:"none",...ex};}
function gbtn(type,t,ex){
  const base={display:"inline-flex",alignItems:"center",gap:5,borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",border:"none",transition:"all .15s",...ex};
  if(type==="primary")return{...base,background:OR,color:"#fff",boxShadow:"0 2px 12px rgba(249,115,22,.35)",padding:"7px 14px"};
  if(type==="ghost")return{...base,background:t.bh,border:"1.5px solid "+t.bd,color:t.tx2,padding:"7px 14px"};
  if(type==="danger")return{...base,background:"rgba(239,68,68,.09)",border:"1.5px solid rgba(239,68,68,.2)",color:"#f87171",padding:"7px 10px"};
  if(type==="orange")return{...base,background:"rgba(249,115,22,.10)",border:"1.5px solid rgba(249,115,22,.28)",color:OR,padding:"7px 12px"};
  return base;
}
function gtag(col,ex){return{display:"inline-flex",alignItems:"center",padding:"2px 7px",borderRadius:99,fontSize:9,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",background:col+"20",color:col,border:"1px solid "+col+"40",...ex};}

/* ── ICON ──────────────────────────────────────────────── */
function Ic({n,s=16,col,st={}}){
  return(
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col||"currentColor"}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={st}>
      <path d={IC[n]||""}/>
    </svg>
  );
}

/* ── OVERLAY / SHEET ───────────────────────────────────── */
function Overlay({children,onClose}){
  return(
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.72)",
        backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",
        display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      {children}
    </div>
  );
}
function Sheet({t,children,wide}){
  return(
    <div style={{...glass2(t.tx),width:"100%",maxWidth:wide?640:520,
      borderRadius:"20px 20px 0 0",overflow:"hidden",maxHeight:"88vh",
      display:"flex",flexDirection:"column",
      boxShadow:"0 -4px 40px rgba(0,0,0,.5),0 0 30px rgba(249,115,22,.10)"}}>
      {children}
    </div>
  );
}
function ShHead({title,sub,t,onClose}){
  return(
    <div style={{padding:"16px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexShrink:0}}>
      <div>
        <div style={{fontSize:17,fontWeight:800,letterSpacing:"-.02em",color:t.tx}}>{title}</div>
        {sub&&<div style={{fontSize:11,color:t.tx3,marginTop:2}}>{sub}</div>}
      </div>
      <button style={gbtn("ghost",t,{padding:7,borderRadius:7})} onClick={onClose}><Ic n="close" s={14}/></button>
    </div>
  );
}

/* ── OUTPUT RENDERER ───────────────────────────────────── */
function HighOut({text,t}){
  if(!text)return<span style={{color:t.tx3,fontFamily:"monospace",fontSize:12}}>Output appears here…</span>;
  const parts=[];let last=0,m;
  const re=new RegExp(UNRE.source,"g");
  while((m=re.exec(text))!==null){
    if(m.index>last)parts.push({t:text.slice(last,m.index),h:false});
    parts.push({t:m[0],h:true});
    last=m.index+m[0].length;
  }
  if(last<text.length)parts.push({t:text.slice(last),h:false});
  return(
    <pre style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11.5,lineHeight:1.85,color:t.tx2,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
      {parts.map((p,i)=>p.h
        ?<span key={i} style={{background:"rgba(249,115,22,.12)",color:"#fb923c",borderRadius:4,padding:"0 3px",border:"1px solid rgba(249,115,22,.3)"}}>{p.t}</span>
        :<span key={i}>{p.t}</span>)}
    </pre>
  );
}

/* ── STEP BAR (mobile) ─────────────────────────────────── */
function StepBar({step,t}){
  return(
    <div style={{padding:"11px 16px 9px",display:"flex",alignItems:"center",justifyContent:"center"}}>
      {["JSON","Variables","Output"].map((l,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{width:27,height:27,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
              background:i<=step?OR:t.s4,color:i<=step?"#fff":t.tx3,fontSize:12,fontWeight:800,
              boxShadow:i===step?"0 0 12px rgba(249,115,22,.45)":"none",transition:"all .3s"}}>
              {i<step?"✓":i+1}
            </div>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase",color:i===step?OR:t.tx3}}>{l}</span>
          </div>
          {i<2&&<div style={{width:48,height:2,margin:"0 5px",marginBottom:17,borderRadius:99,background:i<step?OR:t.s4,transition:"background .3s"}}/>}
        </div>
      ))}
    </div>
  );
}

/* ── DEP MAP MODAL ─────────────────────────────────────── */
function DepMapModal({vars,t,onClose}){
  const ents=Object.entries(vars);
  const paths=[...new Set(ents.flatMap(([,m])=>m.paths))];
  const W=500,H=Math.max(140,Math.max(ents.length,paths.length)*64+60);
  return(
    <Overlay onClose={onClose}>
      <Sheet t={t}>
        <ShHead title="Dependency Map" sub="Variables mapped to JSON fields" t={t} onClose={onClose}/>
        <div style={{flex:1,overflowY:"auto",padding:"14px 20px 22px"}}>
          {ents.length===0
            ?<div style={{textAlign:"center",padding:40,color:t.tx3}}>No variables detected</div>
            :<div style={{overflowX:"auto"}}>
              <svg width="100%" viewBox={"0 0 "+W+" "+H} style={{minWidth:280}}>
                {paths.map((path,pi)=>{
                  const y=40+pi*64,x=W-185;
                  return(<g key={path}>
                    <rect x={x} y={y-13} width={178} height={26} rx="7" fill="rgba(249,115,22,.07)" stroke="rgba(249,115,22,.2)" strokeWidth="1.5"/>
                    <text x={x+7} y={y+4} fill="#fb923c" fontSize="10" fontFamily="monospace" dominantBaseline="middle">{path.length>22?path.slice(0,20)+"…":path}</text>
                  </g>);
                })}
                {ents.map(([name,meta],vi)=>{
                  const y=40+vi*60,col=SCOL[meta.syn]||"#fb923c";
                  return(<g key={name}>
                    {meta.paths.map(path=>{
                      const pi=paths.indexOf(path);if(pi<0)return null;
                      const ty=40+pi*64,x1=120,y1=y,x2=W-185,y2=ty,mx=(x1+x2)/2;
                      return<path key={path} d={"M"+x1+","+y1+" C"+mx+","+y1+" "+mx+","+y2+" "+x2+","+y2} fill="none" stroke={col} strokeWidth="1.5" strokeDasharray="4 3" opacity=".38"/>;
                    })}
                    <rect x={6} y={y-13} width={114} height={26} rx="7" fill={col+"18"} stroke={col+"40"} strokeWidth="1.5"/>
                    <text x={14} y={y+4} fill={col} fontSize="11" fontFamily="monospace" fontWeight="600" dominantBaseline="middle">{name.length>12?name.slice(0,11)+"…":name}</text>
                  </g>);
                })}
              </svg>
            </div>}
        </div>
      </Sheet>
    </Overlay>
  );
}

/* ── PROFILES MODAL ────────────────────────────────────── */
function ProfilesModal({profs,vals,t,onApply,onSave,onDel,onClose}){
  const [nm,setNm]=useState("");
  const [saving,setSaving]=useState(false);
  return(
    <Overlay onClose={onClose}>
      <Sheet t={t}>
        <ShHead title="Fill Profiles" sub="Save and swap named value sets" t={t} onClose={onClose}/>
        <div style={{flex:1,overflowY:"auto",padding:"13px 20px 0"}}>
          {profs.length===0&&<div style={{textAlign:"center",padding:"24px 0",color:t.tx3}}><div style={{fontSize:28,marginBottom:7,opacity:.25}}>👤</div><div style={{fontSize:13,fontWeight:600,color:t.tx2}}>No profiles yet</div><div style={{fontSize:11,marginTop:3}}>Save current values as a profile</div></div>}
          {profs.map(p=>(
            <div key={p.id} style={{...glass(t),borderRadius:9,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <div><div style={{fontSize:13,fontWeight:700,color:t.tx}}>{p.name}</div><div style={{fontSize:10,color:t.tx3,marginTop:2}}>{Object.values(p.values).filter(Boolean).length}/{Object.keys(p.values).length} filled</div></div>
              <div style={{display:"flex",gap:5}}>
                <button style={gbtn("orange",t,{padding:"4px 9px",fontSize:11})} onClick={()=>{onApply(p);onClose();}}>Apply</button>
                <button style={gbtn("danger",t,{padding:"4px 7px"})} onClick={()=>onDel(p.id)}><Ic n="trash" s={12}/></button>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:"11px 20px 20px",borderTop:"1px solid "+t.bd,flexShrink:0}}>
          {!saving
            ?<button style={gbtn("primary",t,{width:"100%",justifyContent:"center",gap:6})} onClick={()=>setSaving(true)}><Ic n="save" s={14}/>Save Current as Profile</button>
            :<div style={{display:"flex",gap:7}}>
              <input value={nm} onChange={e=>setNm(e.target.value)} placeholder="Profile name…" autoFocus
                style={inp(t,{flex:1,fontSize:12,padding:"7px 10px"})}
                onKeyDown={e=>{if(e.key==="Enter"&&nm.trim()){onSave(nm.trim(),vals);setSaving(false);setNm("");}if(e.key==="Escape"){setSaving(false);setNm("");}}}/>
              <button style={gbtn("primary",t,{padding:"6px 12px",fontSize:12})} onClick={()=>{if(nm.trim()){onSave(nm.trim(),vals);setSaving(false);setNm("");}}} disabled={!nm.trim()}>Save</button>
              <button style={gbtn("ghost",t,{padding:"6px 10px",fontSize:12})} onClick={()=>{setSaving(false);setNm("");}}>✕</button>
            </div>}
        </div>
      </Sheet>
    </Overlay>
  );
}

/* ── SHARE MODAL ───────────────────────────────────────── */
function ShareModal({raw,vars,vals,t,onClose}){
  const [cp,setCp]=useState(false);
  const [incVals,setIncVals]=useState(false);
  const link=useMemo(()=>{
    try{
      const d={raw,vars:Object.fromEntries(Object.entries(vars).map(([k,v])=>[k,{syn:v.syn}])),vals:incVals?vals:{}};
      return window.location.href.split("?")[0]+"?pf="+btoa(unescape(encodeURIComponent(JSON.stringify(d))));
    }catch{return "";}
  },[raw,vars,vals,incVals]);
  async function copy(){await navigator.clipboard.writeText(link);setCp(true);setTimeout(()=>setCp(false),2200);}
  return(
    <Overlay onClose={onClose}>
      <Sheet t={t}>
        <ShHead title="Share via Link" sub="No server — encoded in the URL" t={t} onClose={onClose}/>
        <div style={{padding:"16px 20px 22px",display:"flex",flexDirection:"column",gap:12}}>
          <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 12px",borderRadius:9,...glass(t)}}>
            <input type="checkbox" checked={incVals} onChange={e=>setIncVals(e.target.checked)} style={{accentColor:OR,width:15,height:15}}/>
            <div><div style={{fontSize:13,fontWeight:600,color:t.tx}}>Include my filled values</div><div style={{fontSize:11,color:t.tx3}}>Recipients see your values pre-loaded</div></div>
          </label>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:t.tx3,marginBottom:6}}>Share link</div>
            <div style={{display:"flex",gap:7}}>
              <input value={link} readOnly style={inp(t,{flex:1,fontSize:10,fontFamily:"monospace",padding:"7px 10px"})}/>
              <button style={gbtn(cp?"ghost":"primary",t,{padding:"6px 12px",fontSize:12,gap:5,color:cp?"#4ade80":undefined})} onClick={copy}>
                <Ic n={cp?"check":"copy"} s={13}/>{cp?"Copied!":"Copy"}
              </button>
            </div>
          </div>
          <div style={{padding:"9px 12px",borderRadius:8,background:"rgba(96,165,250,.06)",border:"1px solid rgba(96,165,250,.17)",fontSize:11,color:"#93c5fd",lineHeight:1.6}}>
            Encoded in the URL — no data leaves your device.
          </div>
        </div>
      </Sheet>
    </Overlay>
  );
}

/* ── EXPORT MODAL ──────────────────────────────────────── */
function ExportModal({out,vals,vars,t,onClose}){
  const [fmt,setFmt]=useState("json");
  const [cp,setCp]=useState(null);
  const FMT={
    json:{l:"JSON",    ext:"json",gen:()=>out||"{}"},
    txt: {l:"Text",    ext:"txt", gen:()=>out||""},
    env: {l:".env",    ext:"env", gen:()=>Object.entries(vals).map(([k,v])=>k.toUpperCase()+'="'+(v||"")+'"').join("\n")},
    curl:{l:"cURL",    ext:"sh",  gen:()=>'curl https://api.anthropic.com/v1/messages \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: $ANTHROPIC_API_KEY" \\\n  -d \''+(out||"{}")+"\\'"},
    schema:{l:"Schema",ext:"json",gen:()=>JSON.stringify({type:"object",properties:Object.fromEntries(Object.entries(vars).map(([k,v])=>[k,{type:"string",description:k+" ("+v.syn+")"}])),required:Object.keys(vars)},null,2)},
  };
  async function copy(){await navigator.clipboard.writeText(FMT[fmt].gen());setCp(fmt);setTimeout(()=>setCp(null),2200);}
  function dl(){const ex=FMT[fmt];const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([ex.gen()],{type:"text/plain"}));a.download="prompt."+ex.ext;a.click();}
  return(
    <Overlay onClose={onClose}>
      <Sheet t={t}>
        <ShHead title="Export" sub="Download or copy in any format" t={t} onClose={onClose}/>
        <div style={{padding:"14px 20px 22px",display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {Object.entries(FMT).map(([k,ex])=>(
              <button key={k} onClick={()=>setFmt(k)} style={{fontSize:11,padding:"4px 9px",borderRadius:6,cursor:"pointer",border:"1.5px solid "+(fmt===k?OR:t.bd),color:fmt===k?OR:t.tx3,background:fmt===k?"rgba(249,115,22,.10)":"transparent"}}>
                {ex.l}
              </button>
            ))}
          </div>
          <div style={{background:"rgba(0,0,0,.22)",borderRadius:9,padding:11,border:"1.5px solid "+t.s4,maxHeight:170,overflow:"auto"}}>
            <pre style={{fontFamily:"monospace",fontSize:11,color:t.tx2,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{FMT[fmt].gen()}</pre>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button style={gbtn("ghost",t,{padding:"6px 12px",fontSize:12,gap:5,color:cp===fmt?"#4ade80":undefined})} onClick={copy}>
              <Ic n={cp===fmt?"check":"copy"} s={13}/>{cp===fmt?"Copied!":"Copy"}
            </button>
            <button style={gbtn("primary",t,{padding:"6px 12px",fontSize:12,gap:5})} onClick={dl}>
              <Ic n="exp" s={13}/>Download .{FMT[fmt].ext}
            </button>
          </div>
        </div>
      </Sheet>
    </Overlay>
  );
}

/* ── CHAINS MODAL ──────────────────────────────────────── */
function ChainsModal({prompts,chains,t,onSave,onDel,onRun,onClose}){
  const [tab,setTab]=useState("list");
  const [cname,setCname]=useState("");
  const [sel,setSel]=useState([]);
  const toggle=id=>setSel(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const reorder=(i,d)=>{const a=[...sel];const ni=i+d;if(ni<0||ni>=a.length)return;[a[i],a[ni]]=[a[ni],a[i]];setSel(a);};
  return(
    <Overlay onClose={onClose}>
      <Sheet t={t} wide>
        <ShHead title="Prompt Chains" sub="Output of A feeds into B" t={t} onClose={onClose}/>
        <div style={{padding:"11px 20px 0",flexShrink:0}}>
          <div style={{display:"flex",...glass(t),borderRadius:8,padding:3,gap:2}}>
            {[["list","My Chains"],["create","+ New Chain"]].map(([id,l])=>(
              <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"6px 10px",borderRadius:6,fontSize:12,fontWeight:700,border:"none",cursor:"pointer",transition:"all .15s",background:tab===id?OR:"transparent",color:tab===id?"#fff":t.tx3,boxShadow:tab===id?"0 2px 9px rgba(249,115,22,.35)":"none"}}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",minHeight:0,padding:"11px 20px 20px"}}>
          {tab==="list"&&(
            chains.length===0
              ?<div style={{textAlign:"center",padding:"36px 0",color:t.tx3}}><div style={{fontSize:28,marginBottom:7,opacity:.25}}>🔗</div><div style={{fontSize:13,fontWeight:600,color:t.tx2}}>No chains yet</div></div>
              :chains.map(ch=>(
                <div key={ch.id} style={{borderRadius:10,border:"1.5px solid "+t.bd,padding:12,background:t.bh,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
                    <span style={{fontSize:14,fontWeight:700,color:t.tx}}>{ch.name}</span>
                    <div style={{display:"flex",gap:6}}>
                      <button style={gbtn("orange",t,{padding:"4px 9px",fontSize:11})} onClick={()=>onRun(ch)}>Run</button>
                      <button style={gbtn("danger",t,{padding:"4px 7px"})} onClick={()=>onDel(ch.id)}><Ic n="trash" s={12}/></button>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                    {ch.steps.map((id,i)=>{
                      const p=prompts.find(x=>x.id===id);
                      return(<div key={id} style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{padding:"3px 9px",borderRadius:99,background:"rgba(249,115,22,.10)",border:"1px solid rgba(249,115,22,.28)",fontSize:11,color:OR,fontWeight:600}}>{p?p.name:"?"}</div>
                        {i<ch.steps.length-1&&<span style={{color:OR}}>→</span>}
                      </div>);
                    })}
                  </div>
                </div>
              ))
          )}
          {tab==="create"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:t.tx3,marginBottom:6}}>Chain Name</div>
                <input value={cname} onChange={e=>setCname(e.target.value)} placeholder="e.g. Blog Writer Pipeline…" style={inp(t,{fontSize:12,padding:"8px 11px"})}/>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:t.tx3,marginBottom:6}}>Pick prompts in order</div>
                {prompts.length===0&&<div style={{color:t.tx3,fontSize:12}}>Save prompts to library first</div>}
                {prompts.map(p=>(
                  <div key={p.id} onClick={()=>toggle(p.id)} style={{padding:"8px 11px",borderRadius:7,marginBottom:5,cursor:"pointer",border:"1.5px solid "+(sel.includes(p.id)?"rgba(249,115,22,.28)":t.bd),background:sel.includes(p.id)?"rgba(249,115,22,.08)":t.bh,display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .15s"}}>
                    <span style={{fontSize:13,fontWeight:600,color:sel.includes(p.id)?OR:t.tx}}>{p.name}</span>
                    {sel.includes(p.id)&&<span style={gtag(OR,{fontSize:8})}>{sel.indexOf(p.id)+1}</span>}
                  </div>
                ))}
              </div>
              {sel.length>1&&(
                <div>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:t.tx3,marginBottom:6}}>Order</div>
                  {sel.map((id,i)=>{
                    const p=prompts.find(x=>x.id===id);
                    return(<div key={id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                      <div style={{flex:1,padding:"6px 10px",borderRadius:7,background:t.bh,border:"1.5px solid "+t.bd,fontSize:12,fontWeight:600,color:OR}}>{i+1}. {p?p.name:"?"}</div>
                      <button style={gbtn("ghost",t,{padding:"4px 7px",fontSize:12})} onClick={()=>reorder(i,-1)} disabled={i===0}>↑</button>
                      <button style={gbtn("ghost",t,{padding:"4px 7px",fontSize:12})} onClick={()=>reorder(i,1)} disabled={i===sel.length-1}>↓</button>
                    </div>);
                  })}
                </div>
              )}
              <button style={gbtn("primary",t,{width:"100%",justifyContent:"center",gap:5,opacity:(!cname.trim()||sel.length<2)?0.4:1})}
                disabled={!cname.trim()||sel.length<2}
                onClick={()=>{onSave({id:Date.now().toString(),name:cname.trim(),steps:sel,createdAt:Date.now()});setTab("list");setCname("");setSel([]);}}>
                <Ic n="chain" s={14}/>Create Chain ({sel.length} prompts)
              </button>
            </div>
          )}
        </div>
      </Sheet>
    </Overlay>
  );
}

/* ── SAVE MODAL ────────────────────────────────────────── */
function SaveModal({t,folders,act,onSave,onClose}){
  const [nm,setNm]=useState(act?.name||"");
  const [ds,setDs]=useState(act?.desc||"");
  const [fo,setFo]=useState(act?.folder||"General");
  const [nfm,setNfm]=useState(false);
  const [nfv,setNfv]=useState("");
  const ref=useRef();
  useEffect(()=>{setTimeout(()=>ref.current&&ref.current.focus(),80);},[]);
  const allF=["General",...folders];
  const submit=()=>{if(!nm.trim())return;onSave(nm.trim(),ds.trim(),nfm&&nfv.trim()?nfv.trim():fo);};
  return(
    <Overlay onClose={onClose}>
      <Sheet t={t}>
        <ShHead title="Save Prompt" sub="Stored offline in your browser" t={t} onClose={onClose}/>
        <div style={{padding:"14px 20px",display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:t.tx3,marginBottom:6}}>Name *</div>
            <input ref={ref} value={nm} onChange={e=>setNm(e.target.value)} placeholder="e.g. Customer Support Agent" style={inp(t,{})} onKeyDown={e=>e.key==="Enter"&&submit()}/>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:t.tx3,marginBottom:6}}>Description</div>
            <input value={ds} onChange={e=>setDs(e.target.value)} placeholder="Optional…" style={inp(t,{})}/>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:t.tx3,marginBottom:6}}>Folder</div>
            {!nfm
              ?<div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                {allF.map(f=><button key={f} onClick={()=>setFo(f)} style={{padding:"5px 12px",borderRadius:99,fontSize:12,fontWeight:600,cursor:"pointer",border:"1.5px solid "+(fo===f?OR:t.bd),background:fo===f?OR:t.bh,color:fo===f?"#fff":t.tx2,transition:"all .15s"}}>{f}</button>)}
                <button style={gbtn("ghost",t,{padding:"4px 8px",fontSize:11,gap:3})} onClick={()=>setNfm(true)}><Ic n="plus" s={11}/>New</button>
              </div>
              :<div style={{display:"flex",gap:7,alignItems:"center"}}>
                <input value={nfv} onChange={e=>setNfv(e.target.value)} placeholder="Folder name…" autoFocus style={inp(t,{maxWidth:160,fontSize:12,padding:"7px 10px"})} onKeyDown={e=>{if(e.key==="Enter"&&nfv.trim()){setFo(nfv.trim());setNfm(false);}if(e.key==="Escape")setNfm(false);}}/>
                <button style={gbtn("primary",t,{padding:"6px 11px",fontSize:12})} onClick={()=>{if(nfv.trim()){setFo(nfv.trim());setNfm(false);}}}>Add</button>
                <button style={gbtn("ghost",t,{padding:"6px 10px",fontSize:12})} onClick={()=>setNfm(false)}>✕</button>
              </div>}
          </div>
        </div>
        <div style={{padding:"0 20px 20px",display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button style={gbtn("ghost",t,{})} onClick={onClose}>Cancel</button>
          <button style={gbtn("primary",t,{gap:5})} onClick={submit} disabled={!nm.trim()}><Ic n="save" s={13}/>Save</button>
        </div>
      </Sheet>
    </Overlay>
  );
}

/* ── LIBRARY MODAL ─────────────────────────────────────── */
function LibModal({prompts,folders,activeId,t,onLoad,onDel,onClose}){
  const [q,setQ]=useState("");
  const [af,setAf]=useState("All");
  const allF=["All","General",...folders];
  const filt=prompts.filter(p=>{
    const mf=af==="All"||(p.folder||"General")===af;
    const ms=!q||p.name.toLowerCase().includes(q.toLowerCase())||(p.desc||"").toLowerCase().includes(q.toLowerCase());
    return mf&&ms;
  });
  return(
    <Overlay onClose={onClose}>
      <Sheet t={t} wide>
        <ShHead title="Library" sub={prompts.length+" saved prompt"+(prompts.length!==1?"s":"")} t={t} onClose={onClose}/>
        <div style={{padding:"11px 18px 0",flexShrink:0}}>
          <div style={{position:"relative",marginBottom:10}}>
            <Ic n="search" s={13} st={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:t.tx3,pointerEvents:"none"}}/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" style={inp(t,{paddingLeft:28,fontSize:12,padding:"7px 10px 7px 28px"})}/>
          </div>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10,scrollbarWidth:"none"}}>
            {allF.map(f=><button key={f} onClick={()=>setAf(f)} style={{padding:"4px 12px",borderRadius:99,fontSize:12,fontWeight:600,cursor:"pointer",border:"1.5px solid "+(af===f?OR:t.bd),background:af===f?OR:t.bh,color:af===f?"#fff":t.tx2,whiteSpace:"nowrap",flexShrink:0,transition:"all .15s"}}>{f}</button>)}
          </div>
          <div style={{height:1,background:t.bd}}/>
        </div>
        <div style={{flex:1,overflowY:"auto",minHeight:0,padding:"8px 13px"}}>
          {filt.length===0
            ?<div style={{padding:"40px 20px",textAlign:"center",color:t.tx3}}><div style={{fontSize:13,fontWeight:600,color:t.tx2}}>{prompts.length===0?"No saved prompts yet":"Nothing here"}</div></div>
            :filt.map(p=>(
              <div key={p.id} onClick={()=>onLoad(p)} style={{borderRadius:10,padding:"11px 12px",marginBottom:5,cursor:"pointer",border:"1.5px solid "+(activeId===p.id?"rgba(249,115,22,.28)":t.bd),background:activeId===p.id?"rgba(249,115,22,.08)":t.bh,transition:"all .15s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:t.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                    {p.desc&&<div style={{fontSize:11,color:t.tx3,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.desc}</div>}
                    <div style={{display:"flex",gap:8,marginTop:5,alignItems:"center"}}>
                      <span style={{fontSize:10,color:t.tx3,display:"flex",alignItems:"center",gap:3}}><Ic n="folder" s={10}/>{p.folder||"General"}</span>
                      <span style={{fontSize:10,color:t.tx3,display:"flex",alignItems:"center",gap:3}}><Ic n="clock" s={10}/>{new Date(p.savedAt).toLocaleDateString(undefined,{month:"short",day:"numeric"})}</span>
                    </div>
                  </div>
                  <button style={gbtn("danger",t,{padding:"4px 6px",flexShrink:0})} onClick={e=>{e.stopPropagation();onDel(p.id);}}><Ic n="trash" s={12}/></button>
                </div>
              </div>
            ))}
        </div>
      </Sheet>
    </Overlay>
  );
}

/* ── THEME MODAL ───────────────────────────────────────── */
function ThemeModal({theme,t,onChange,onClose}){
  return(
    <Overlay onClose={onClose}>
      <Sheet t={t}>
        <ShHead title="Theme" sub="Choose your look" t={t} onClose={onClose}/>
        <div style={{padding:"14px 20px 22px",display:"flex",flexDirection:"column",gap:7}}>
          {[["dark","Dark","moon"],["light","Light","sun"],["amoled","AMOLED","amoled"]].map(([id,l,ic])=>(
            <button key={id} onClick={()=>{onChange(id);onClose();}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderRadius:10,border:"1.5px solid "+(theme===id?OR:t.bd),background:theme===id?"rgba(249,115,22,.09)":t.bh,color:t.tx,transition:"all .15s",cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}><Ic n={ic} s={15}/><span style={{fontSize:14,fontWeight:700}}>{l}</span></div>
              {theme===id&&<span style={gtag("#4ade80",{fontSize:8})}>Active</span>}
            </button>
          ))}
        </div>
      </Sheet>
    </Overlay>
  );
}

/* ── VARS PANEL ────────────────────────────────────────── */
function VarsPanel({vars,vals,vtypes,vopts,t,onChange,onType,onOpts,onReset,onOpenProfiles}){
  const [q,setQ]=useState("");
  const [expType,setExpType]=useState(null);
  const total=Object.keys(vars).length;
  const filled=Object.values(vals).filter(Boolean).length;
  const pct=total?Math.round(filled/total*100):0;
  const list=Object.entries(vars).filter(([n])=>!q||n.toLowerCase().includes(q.toLowerCase()));

  if(total===0)return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,padding:28,textAlign:"center",gap:10}}>
      <div style={{fontSize:34,opacity:.2}}>⚙</div>
      <div style={{fontSize:14,fontWeight:700,color:t.tx2}}>No variables found</div>
      <div style={{fontSize:12,color:t.tx3}}>Add <code style={{background:t.bh,padding:"2px 6px",borderRadius:5,fontFamily:"monospace",fontSize:11}}>{"{{name}}"}</code> to your JSON</div>
    </div>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",minHeight:0}}>
      <div style={{padding:"10px 12px",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
          <span style={{fontSize:12,fontWeight:600,color:t.tx2}}>{filled}/{total} filled</span>
          <div style={{display:"flex",gap:5}}>
            <button style={gbtn("ghost",t,{padding:"3px 8px",fontSize:11,gap:3})} onClick={onOpenProfiles}><Ic n="user" s={11}/>Profiles</button>
            {filled>0&&<button style={gbtn("ghost",t,{padding:"3px 8px",fontSize:11,gap:3})} onClick={onReset}><Ic n="reset" s={11}/>Clear</button>}
          </div>
        </div>
        <div style={{height:5,background:t.s3,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:99,transition:"width .35s ease",width:pct+"%",background:pct===100?"linear-gradient(90deg,#4ade80,#22c55e)":"linear-gradient(90deg,#f97316,#fb923c)",boxShadow:pct===100?"0 0 8px rgba(74,222,128,.35)":"0 0 8px rgba(249,115,22,.35)"}}/>
        </div>
      </div>
      {total>5&&(
        <div style={{padding:"0 10px 8px",flexShrink:0}}>
          <div style={{position:"relative"}}>
            <Ic n="search" s={13} st={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:t.tx3,pointerEvents:"none"}}/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Filter…" style={inp(t,{paddingLeft:27,fontSize:12,padding:"7px 10px 7px 27px"})}/>
          </div>
        </div>
      )}
      <div style={{height:1,background:t.bd,flexShrink:0}}/>
      <div style={{flex:1,overflowY:"auto",minHeight:0,padding:"7px 9px"}}>
        {list.map(([name,meta],i)=>{
          const done=Boolean(vals[name]);
          const typ=vtypes[name]||"text";
          const exp=expType===name;
          const sc=SCOL[meta.syn]||"#fb923c";
          return(
            <div key={name} style={{borderRadius:10,padding:"11px 12px",border:"1.5px solid "+(done?"rgba(74,222,128,.14)":exp?"rgba(249,115,22,.2)":"transparent"),background:done?"rgba(74,222,128,.025)":"transparent",marginBottom:4,transition:"all .15s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,background:done?"#4ade80":t.s5,boxShadow:done?"0 0 7px rgba(74,222,128,.5)":"none",transition:"all .15s"}}/>
                  <code style={{fontSize:11.5,fontFamily:"monospace",color:OR,fontWeight:600}}>{name}</code>
                </div>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <button onClick={()=>setExpType(exp?null:name)} style={{fontSize:10,padding:"2px 6px",borderRadius:5,cursor:"pointer",background:exp?"rgba(249,115,22,.10)":t.bh,border:"1px solid "+(exp?"rgba(249,115,22,.28)":t.bd),color:exp?OR:t.tx3,display:"flex",alignItems:"center",gap:3}}>
                    <span>{VM[typ].e}</span><span>{VM[typ].l}</span>
                  </button>
                  <span style={gtag(sc,{fontSize:8})}>{meta.syn.slice(0,4)}</span>
                </div>
              </div>
              {exp&&(
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:t.tx3,marginBottom:5}}>Type</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:typ==="select"?8:0}}>
                    {VTYPES.map(tp=>(
                      <button key={tp} onClick={()=>onType(name,tp)} style={{fontSize:10,padding:"3px 7px",borderRadius:5,cursor:"pointer",border:"1.5px solid "+(typ===tp?OR:t.bd),color:typ===tp?OR:t.tx3,background:typ===tp?"rgba(249,115,22,.10)":"transparent"}}>
                        {VM[tp].e} {VM[tp].l}
                      </button>
                    ))}
                  </div>
                  {typ==="select"&&(
                    <div>
                      <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:t.tx3,marginBottom:5}}>Options (comma-separated)</div>
                      <input value={(vopts[name]||[]).join(", ")} onChange={e=>onOpts(name,e.target.value.split(",").map(s=>s.trim()).filter(Boolean))} placeholder="Option A, Option B…" style={inp(t,{fontSize:12,padding:"7px 10px"})}/>
                    </div>
                  )}
                </div>
              )}
              {typ==="textarea"
                ?<textarea value={vals[name]||""} onChange={e=>onChange(name,e.target.value)} placeholder={"Enter "+name+"…"} rows={3} style={inp(t,{fontSize:12,padding:"7px 10px",resize:"vertical",fontFamily:"monospace"})}/>
                :typ==="select"&&(vopts[name]||[]).length
                  ?<select value={vals[name]||""} onChange={e=>onChange(name,e.target.value)} style={inp(t,{fontSize:12,padding:"7px 10px",cursor:"pointer"})}><option value="">Select…</option>{(vopts[name]||[]).map(o=><option key={o} value={o}>{o}</option>)}</select>
                  :<input value={vals[name]||""} onChange={e=>onChange(name,e.target.value)} type={{number:"number",date:"date",email:"email",url:"url"}[typ]||"text"} placeholder={"Enter "+name+"…"} style={inp(t,{fontSize:12,padding:"7px 10px"})}/>
              }
              {meta.paths.length>0&&<div style={{marginTop:5,fontSize:9.5,color:t.tx3,fontFamily:"monospace"}}>{"↳ "+meta.paths.slice(0,2).join(" · ")+(meta.paths.length>2?" +"+(meta.paths.length-2):"")}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── MAIN APP ──────────────────────────────────────────── */
export default function App(){
  const [raw,setRaw]         = useState(EX);
  const [parsed,setParsed]   = useState(null);
  const [err,setErr]         = useState(null);
  const [vars,setVars]       = useState({});
  const [vals,setVals]       = useState({});
  const [vtypes,setVtypes]   = useState({});
  const [vopts,setVopts]     = useState({});
  const [out,setOut]         = useState("");
  const [step,setStep]       = useState(0);
  const [theme,setTheme]     = useState(()=>lget(LS.TH,"dark"));
  const [prompts,setPrompts] = useState(()=>lget(LS.PR,[]));
  const [folders,setFolders] = useState(()=>lget(LS.FO,[]));
  const [profs,setProfs]     = useState(()=>lget(LS.PF,[]));
  const [chains,setChains]   = useState(()=>lget(LS.CH,[]));
  const [activeId,setActiveId]= useState(null);
  const [modal,setModal]     = useState(null);
  const [toasts,setToasts]   = useState([]);
  const [copied,setCopied]   = useState(false);
  const [confetti,setConf]   = useState(false);
  const [shake,setShake]     = useState(false);
  const tRef=useRef(); const prevPct=useRef(0);

  const t = TH[theme] || TH.dark;

  const parse=useCallback((text)=>{
    try{
      const obj=JSON.parse(text); setParsed(obj); setErr(null);
      const d=extractVars(obj); setVars(d);
      setVals(prev=>{const n={};for(const k of Object.keys(d))n[k]=prev[k]||"";return n;});
    }catch(e){setParsed(null);setErr(e.message);setVars({});}
  },[]);

  useEffect(()=>{parse(EX);},[]);
  useEffect(()=>{if(parsed)setOut(buildOut(parsed,vals));else setOut("");},[parsed,vals]);

  const total=Object.keys(vars).length;
  const filled=Object.values(vals).filter(Boolean).length;
  const pct=total?Math.round(filled/total*100):0;
  const unfilled=total-filled;

  useEffect(()=>{
    if(pct===100&&prevPct.current<100&&total>0){setConf(true);setTimeout(()=>setConf(false),1200);}
    prevPct.current=pct;
  },[pct,total]);

  function toast(msg,type="success"){
    setToasts(p=>[...p,{id:Date.now(),msg,type}]);
    clearTimeout(tRef.current);
    tRef.current=setTimeout(()=>setToasts([]),2400);
  }

  function handleRaw(e){setRaw(e.target.value);parse(e.target.value);}
  function handleVal(n,v){setVals(p=>({...p,[n]:v}));}
  function resetVals(){setVals(Object.fromEntries(Object.keys(vars).map(k=>[k,""])));toast("Values cleared","info");}
  async function copyOut(){if(!out)return;await navigator.clipboard.writeText(out);setCopied(true);toast("Copied!");setTimeout(()=>setCopied(false),2200);}

  function tryNext(){
    if(err||!parsed){setShake(true);setTimeout(()=>setShake(false),400);toast("Fix JSON first","error");return;}
    setStep(s=>Math.min(s+1,2));
  }

  function savePrompt(name,desc,folder){
    const item={id:Date.now().toString(),name,desc,folder,raw,vals,vtypes,vopts,savedAt:Date.now()};
    const upd=[...prompts.filter(p=>p.id!==activeId),item];
    const nf=[...new Set([...folders,folder].filter(f=>f!=="General"))];
    setPrompts(upd);lset(LS.PR,upd);setFolders(nf);lset(LS.FO,nf);
    setActiveId(item.id);setModal(null);toast('"'+name+'" saved!');
  }
  function loadPrompt(p){
    setRaw(p.raw);parse(p.raw);
    setTimeout(()=>{setVals(p.vals||{});setVtypes(p.vtypes||{});setVopts(p.vopts||{});},65);
    setActiveId(p.id);setModal(null);toast('Loaded "'+p.name+'"',"info");setStep(1);
  }
  function delPrompt(id){const u=prompts.filter(p=>p.id!==id);setPrompts(u);lset(LS.PR,u);if(activeId===id)setActiveId(null);toast("Deleted","error");}
  function saveProf(name,values){const item={id:Date.now().toString(),name,values,savedAt:Date.now()};const u=[...profs,item];setProfs(u);lset(LS.PF,u);toast('Profile "'+name+'" saved!');}
  function saveChain(ch){const u=[...chains,ch];setChains(u);lset(LS.CH,u);setModal(null);toast('Chain "'+ch.name+'" created!');}
  function delChain(id){const u=chains.filter(c=>c.id!==id);setChains(u);lset(LS.CH,u);}
  function runChain(ch){const first=prompts.find(p=>p.id===ch.steps[0]);if(first)loadPrompt(first);toast('Running "'+ch.name+'"…',"info");}
  function changeTheme(id){setTheme(id);lset(LS.TH,id);toast(id+" theme","info");}

  const act=prompts.find(p=>p.id===activeId);
  const gl=glass(t);
  const TOOLS=[{id:"depmap",n:"map",tip:"Dependency Map"},{id:"chain",n:"chain",tip:"Chains",num:chains.length},{id:"share",n:"share",tip:"Share"},{id:"export",n:"exp",tip:"Export"},{id:"theme",n:theme==="light"?"sun":"moon",tip:"Theme"}];

  // shared panel header label style
  const plabel={fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:t.tx3};
  const pulseDot={width:7,height:7,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 7px rgba(74,222,128,.55)",flexShrink:0,animation:"pfPulse 2s infinite"};

  return(
    <div style={{position:"relative",zIndex:1,height:"100vh",display:"flex",flexDirection:"column",background:t.bg,color:t.tx,fontFamily:"'Syne',system-ui,sans-serif",WebkitFontSmoothing:"antialiased"}}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes pfPulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes pfConf{0%{opacity:1;transform:scale(0) rotate(0)}70%{opacity:.8;transform:scale(1.1) rotate(200deg)}100%{opacity:0;transform:scale(.9) translateY(-28px) rotate(360deg)}}
        @media(max-width:860px){.pf-desk{display:none!important}}
        @media(min-width:861px){.pf-mob{display:none!important}}
      `}</style>

      {/* BG mesh */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse 60% 50% at 10% 0%,rgba(249,115,22,.09),transparent 55%),radial-gradient(ellipse 50% 40% at 90% 100%,rgba(249,115,22,.06),transparent 50%),"+(t.bg)}}/>

      {/* Confetti */}
      {confetti&&Array.from({length:16},(_,i)=>(
        <div key={i} style={{position:"fixed",width:8,height:8,borderRadius:2,pointerEvents:"none",zIndex:999,left:Math.random()*100+"%",top:"40%",background:["#f97316","#fb923c","#fbbf24","#4ade80","#60a5fa","#f472b6"][i%6],animation:"pfConf .85s ease "+Math.random()*.4+"s forwards"}}/>
      ))}

      {/* HEADER */}
      <div style={{position:"relative",zIndex:1,...gl,borderBottom:"1px solid "+t.bd,padding:"0 14px",height:55,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:33,height:33,borderRadius:10,flexShrink:0,background:"linear-gradient(135deg,#f97316,#fb923c)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 14px rgba(249,115,22,.4)"}}>
            <Ic n="bolt" s={17} col="#fff"/>
          </div>
          <div>
            <div style={{fontSize:16,fontWeight:800,letterSpacing:"-.025em",lineHeight:1.1}}>PromptForge</div>
            <div style={{fontSize:9,color:t.tx3,letterSpacing:".08em",textTransform:"uppercase"}}>JSON Variable Editor</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          {parsed&&!err&&(
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:99,background:"rgba(74,222,128,.07)",border:"1px solid rgba(74,222,128,.17)"}}>
              <div style={pulseDot}/>
              <span style={{fontSize:9,color:"#4ade80",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase"}}>Live</span>
            </div>
          )}
          {TOOLS.map(b=>(
            <button key={b.id} title={b.tip} style={{...gbtn("ghost",t,{padding:7,borderRadius:7}),position:"relative"}} onClick={()=>setModal(b.id)}>
              <Ic n={b.n} s={14}/>
              {b.num?<span style={{position:"absolute",top:-4,right:-4,minWidth:16,height:16,borderRadius:99,background:OR,color:"#fff",fontSize:9,fontWeight:800,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{b.num}</span>:null}
            </button>
          ))}
          <button title="Library" style={{...gbtn("ghost",t,{padding:7,borderRadius:7}),position:"relative"}} onClick={()=>setModal("lib")}>
            <Ic n="lib" s={14}/>
            {prompts.length?<span style={{position:"absolute",top:-4,right:-4,minWidth:16,height:16,borderRadius:99,background:OR,color:"#fff",fontSize:9,fontWeight:800,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{prompts.length}</span>:null}
          </button>
          <button style={gbtn("primary",t,{padding:"6px 13px",fontSize:12,gap:5})} onClick={()=>setModal("save")} disabled={!parsed}>
            <Ic n="save" s={13}/>Save
          </button>
        </div>
      </div>

      {/* DESKTOP 3-COL */}
      <div className="pf-desk" style={{display:"grid",gridTemplateColumns:"1fr 290px 1fr",flex:1,overflow:"hidden",minHeight:0,position:"relative",zIndex:1}}>
        {/* Input */}
        <div style={{display:"flex",flexDirection:"column",overflow:"hidden",borderRight:"1px solid "+t.bd}}>
          <div style={{padding:"9px 12px 6px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}><Ic n="edit" s={12} col={OR}/><span style={plabel}>JSON Input</span></div>
            {err?<span style={gtag("#f87171",{fontSize:8})}>Invalid</span>:parsed?<span style={gtag("#4ade80",{fontSize:8})}>{total} vars</span>:null}
          </div>
          {err&&<div style={{margin:"0 10px 6px",padding:"7px 10px",borderRadius:7,background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.13)",fontSize:11,color:"#fca5a5",lineHeight:1.5,fontFamily:"monospace",flexShrink:0}}>{"⚠ "+err}</div>}
          <div style={{flex:1,padding:"0 10px 10px",minHeight:0,display:"flex",flexDirection:"column"}}>
            <textarea value={raw} onChange={handleRaw} spellCheck={false} style={inp(t,{flex:1,minHeight:0,padding:11,fontFamily:"'JetBrains Mono',monospace",fontSize:12,lineHeight:1.82,resize:"none"})} placeholder="Paste JSON prompt here…"/>
          </div>
        </div>
        {/* Vars */}
        <div style={{display:"flex",flexDirection:"column",overflow:"hidden",borderRight:"1px solid "+t.bd,background:"rgba(0,0,0,.07)"}}>
          <div style={{padding:"9px 12px 6px",flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}><Ic n="vars" s={12} col={OR}/><span style={plabel}>Variables</span></div>
            <div style={{display:"flex",gap:5,alignItems:"center"}}>
              {total>0&&<span style={gtag(OR,{fontSize:8})}>{pct}%</span>}
              <button style={gbtn("ghost",t,{padding:"3px 7px",fontSize:10,gap:3})} onClick={()=>setModal("depmap")}><Ic n="map" s={11}/>Map</button>
            </div>
          </div>
          <div style={{height:1,background:t.bd,flexShrink:0}}/>
          <VarsPanel vars={vars} vals={vals} vtypes={vtypes} vopts={vopts} t={t} onChange={handleVal} onType={(n,tp)=>setVtypes(p=>({...p,[n]:tp}))} onOpts={(n,o)=>setVopts(p=>({...p,[n]:o}))} onReset={resetVals} onOpenProfiles={()=>setModal("profiles")}/>
        </div>
        {/* Output */}
        <div style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"9px 12px 6px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}><div style={pulseDot}/><span style={plabel}>Live Output</span></div>
            <div style={{display:"flex",gap:6}}>
              {unfilled>0&&<span style={gtag(OR,{fontSize:8})}>{unfilled} unfilled</span>}
              <button style={gbtn("ghost",t,{padding:"3px 7px",fontSize:10,gap:3,color:copied?"#4ade80":undefined})} onClick={copyOut}><Ic n={copied?"check":"copy"} s={11}/>{copied?"Copied!":"Copy"}</button>
              <button style={gbtn("ghost",t,{padding:"3px 7px",fontSize:10,gap:3})} onClick={()=>setModal("export")}><Ic n="exp" s={11}/>Export</button>
            </div>
          </div>
          <div style={{height:1,background:t.bd,flexShrink:0}}/>
          <div style={{flex:1,overflowY:"auto",minHeight:0,padding:"11px 12px"}}><HighOut text={out} t={t}/></div>
        </div>
      </div>

      {/* MOBILE STEP FLOW */}
      <div className="pf-mob" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0,position:"relative",zIndex:1}}>
        <div style={{...gl,borderBottom:"1px solid "+t.bd,flexShrink:0}}><StepBar step={step} t={t}/></div>

        {step===0&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0,padding:"12px 12px 0"}}>
            {err&&<div style={{marginBottom:8,padding:"8px 11px",borderRadius:8,background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.17)",fontSize:11,color:"#fca5a5",fontFamily:"monospace",flexShrink:0,animation:shake?"pfConf .3s ease":"none"}}>{"⚠ "+err}</div>}
            <textarea value={raw} onChange={handleRaw} spellCheck={false} style={inp(t,{flex:1,minHeight:0,padding:12,fontSize:11.5,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.82,resize:"none"})} placeholder="Paste your JSON prompt here…"/>
            <div style={{padding:"12px 0",flexShrink:0}}>
              <button style={gbtn("primary",t,{width:"100%",justifyContent:"center",gap:6})} onClick={tryNext}>Detect Variables →</button>
            </div>
          </div>
        )}
        {step===1&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
            <div style={{padding:"7px 11px",borderBottom:"1px solid "+t.bd,flexShrink:0,display:"flex",gap:6}}>
              <button style={gbtn("ghost",t,{padding:"3px 8px",fontSize:11,gap:3})} onClick={()=>setModal("depmap")}><Ic n="map" s={11}/>Map</button>
              <button style={gbtn("ghost",t,{padding:"3px 8px",fontSize:11,gap:3})} onClick={()=>setModal("profiles")}><Ic n="user" s={11}/>Profiles</button>
            </div>
            <VarsPanel vars={vars} vals={vals} vtypes={vtypes} vopts={vopts} t={t} onChange={handleVal} onType={(n,tp)=>setVtypes(p=>({...p,[n]:tp}))} onOpts={(n,o)=>setVopts(p=>({...p,[n]:o}))} onReset={resetVals} onOpenProfiles={()=>setModal("profiles")}/>
            <div style={{padding:"10px 12px",borderTop:"1px solid "+t.bd,flexShrink:0,display:"flex",gap:8}}>
              <button style={gbtn("ghost",t,{padding:"6px 12px",fontSize:12,gap:4})} onClick={()=>setStep(0)}><Ic n="close" s={12}/>Back</button>
              <button style={gbtn("primary",t,{flex:1,justifyContent:"center",fontSize:12,gap:5})} onClick={()=>setStep(2)}>
                {unfilled>0?"Output ("+unfilled+" unfilled)":"View Output →"}
              </button>
            </div>
          </div>
        )}
        {step===2&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
            <div style={{padding:"9px 12px 7px",flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={pulseDot}/><span style={plabel}>Live Output</span></div>
              <div style={{display:"flex",gap:6}}>
                {unfilled>0&&<span style={gtag(OR,{fontSize:8})}>{unfilled} unfilled</span>}
                <button style={gbtn("ghost",t,{padding:"3px 7px",fontSize:10,gap:3})} onClick={()=>setModal("export")}><Ic n="exp" s={11}/>Export</button>
              </div>
            </div>
            <div style={{height:1,background:t.bd,flexShrink:0}}/>
            <div style={{flex:1,overflowY:"auto",minHeight:0,padding:12}}><HighOut text={out} t={t}/></div>
            <div style={{padding:"10px 12px",borderTop:"1px solid "+t.bd,flexShrink:0,display:"flex",gap:8}}>
              <button style={gbtn("ghost",t,{padding:"6px 12px",fontSize:12,gap:4})} onClick={()=>setStep(1)}><Ic n="vars" s={12}/>Edit</button>
              <button style={gbtn(copied?"ghost":"primary",t,{flex:1,justifyContent:"center",fontSize:12,gap:6,color:copied?"#4ade80":undefined})} onClick={copyOut}>
                <Ic n={copied?"check":"copy"} s={14}/>{copied?"Copied!":"Copy Output"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{position:"relative",zIndex:1,...gl,borderTop:"1px solid "+t.bd,padding:"4px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:9,color:t.tx3,flexShrink:0}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {[["#fb923c","{{v}}"],["#22d3ee","${v}"],["#c4b5fd","[V]"],["#6ee7b7","%V%"]].map(([c,e])=>(<span key={e} style={gtag(c,{fontSize:7,padding:"1px 5px"})}>{e}</span>))}
        </div>
        <div style={{display:"flex",gap:10}}>
          {act&&<span style={{color:OR,display:"flex",alignItems:"center",gap:4}}><span style={{width:5,height:5,borderRadius:"50%",background:OR,display:"inline-block"}}/>{act.name}</span>}
          <span>Offline ready</span>
        </div>
      </div>

      {/* MODALS */}
      {modal==="save"    &&<SaveModal     t={t} folders={folders} act={act}                                          onSave={savePrompt}                              onClose={()=>setModal(null)}/>}
      {modal==="lib"     &&<LibModal      t={t} prompts={prompts} folders={folders} activeId={activeId}              onLoad={loadPrompt} onDel={delPrompt}             onClose={()=>setModal(null)}/>}
      {modal==="depmap"  &&<DepMapModal   t={t} vars={vars}                                                                                                           onClose={()=>setModal(null)}/>}
      {modal==="profiles"&&<ProfilesModal t={t} profs={profs} vals={vals}                                           onApply={p=>setVals(p.values)} onSave={saveProf} onDel={id=>{const u=profs.filter(p=>p.id!==id);setProfs(u);lset(LS.PF,u);}} onClose={()=>setModal(null)}/>}
      {modal==="share"   &&<ShareModal    t={t} raw={raw} vars={vars} vals={vals}                                                                                     onClose={()=>setModal(null)}/>}
      {modal==="export"  &&<ExportModal   t={t} out={out} vals={vals} vars={vars}                                                                                     onClose={()=>setModal(null)}/>}
      {modal==="chain"   &&<ChainsModal   t={t} prompts={prompts} chains={chains}                                   onSave={saveChain} onDel={delChain} onRun={runChain} onClose={()=>setModal(null)}/>}
      {modal==="theme"   &&<ThemeModal    t={t} theme={theme}                                                       onChange={changeTheme}                            onClose={()=>setModal(null)}/>}

      {/* TOAST */}
      {toasts.length>0&&(()=>{
        const toast=toasts[toasts.length-1];
        const col={success:"#4ade80",error:"#f87171",info:OR}[toast.type]||t.tx;
        return(
          <div style={{position:"fixed",bottom:70,left:"50%",transform:"translateX(-50%)",zIndex:900,display:"flex",alignItems:"center",gap:9,padding:"10px 16px",borderRadius:12,...glass2(theme),fontSize:13,fontWeight:600,pointerEvents:"none",boxShadow:"0 8px 32px rgba(0,0,0,.55)",whiteSpace:"nowrap"}}>
            <span style={{color:col,fontSize:15}}>{toast.type==="success"?"✓":toast.type==="error"?"✕":"⚡"}</span>
            <span style={{color:col}}>{toast.msg}</span>
          </div>
        );
      })()}
    </div>
  );
}
