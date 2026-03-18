import VoiceQuizCreator from "./VoiceQuizCreator"
// client/src/ProfessorPanel.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import TabActividades from "./GamesManager";
import CoursesPanel from "./CoursesPanel.jsx";

/* ─── Mock API (reemplazar con tu API real) ─────────────────── */
const API = {
  get: async (url) => {
    await new Promise(r => setTimeout(r, 400));
    if (url.includes("stats"))    return { usuarios: 34, mensajesHoy: 12, totalMensajes: 287 };
    if (url.includes("usuarios")) return [
      { _id:"u1", nombre:"Ana Torres",    rol:"alumno", email:"ana@edutec.mx" },
      { _id:"u2", nombre:"Carlos Ruiz",   rol:"alumno", email:"carlos@edutec.mx" },
      { _id:"u3", nombre:"Sofía Mendez",  rol:"alumno", email:"sofia@edutec.mx" },
      { _id:"u4", nombre:"Luis Pérez",    rol:"alumno", email:"luis@edutec.mx" },
      { _id:"u5", nombre:"María García",  rol:"alumno", email:"maria@edutec.mx" },
    ];
    if (url.includes("mensajes")) return [
      { _id:"m1", autor:"Ana Torres",   texto:"¿Habrá clase el viernes?", fecha: new Date(Date.now()-3600000).toISOString() },
      { _id:"m2", autor:"Carlos Ruiz",  texto:"Número de control 24280902", fecha: new Date(Date.now()-7200000).toISOString() },
      { _id:"m3", autor:"Sofía Mendez", texto:"Entregué la tarea ayer.", fecha: new Date(Date.now()-86400000).toISOString() },
    ];
    return null;
  },
  del: async () => ({ ok: true }),
};

/* ─── Paleta & Estilos base (inyectados en <head>) ─────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');

:root {
  --bg:#080c18; --panel:#0d1426; --surface:#111c38; --raised:#172040;
  --indigo:#6366f1; --indigo-lt:#818cf8; --indigo-dim:rgba(99,102,241,.14);
  --indigo-glow:rgba(99,102,241,.28);
  --gold:#f0c060; --gold-dim:rgba(240,192,96,.14);
  --ok:#34d399; --ok-dim:rgba(52,211,153,.12);
  --warn:#fbbf24; --warn-dim:rgba(251,191,36,.12);
  --danger:#f87171; --danger-dim:rgba(248,113,113,.12);
  --txt:#e8eeff; --txt2:#8fa0c8; --txt3:#4e6090;
  --border:rgba(99,102,241,.14); --border2:rgba(99,102,241,.28);
  --r:14px; --r-sm:9px; --r-lg:20px; --r-pill:999px;
  --shadow:0 8px 28px rgba(0,0,0,.55),0 1px 0 rgba(255,255,255,.05) inset;
  --ease:cubic-bezier(.16,1,.3,1);
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--txt);font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--raised);border-radius:999px}
.prof-panel{min-height:100vh;display:flex;flex-direction:column;background:radial-gradient(ellipse 70vw 50vh at 15% -5%,rgba(99,102,241,.07),transparent),var(--bg)}
/* topbar */
.pp-top{display:flex;align-items:center;gap:14px;padding:14px 24px;border-bottom:1px solid var(--border);background:rgba(8,12,24,.85);backdrop-filter:blur(14px);position:sticky;top:0;z-index:200;flex-wrap:wrap}
.pp-brand{font-family:'Instrument Serif',serif;font-style:italic;font-size:20px;background:linear-gradient(120deg,#c7d2fe,var(--gold));-webkit-background-clip:text;background-clip:text;color:transparent;white-space:nowrap}
.pp-top-badge{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ok);background:var(--ok-dim);border:1px solid rgba(52,211,153,.25);padding:3px 9px;border-radius:var(--r-pill)}
.pp-spacer{flex:1}
.pp-back{background:transparent;border:1px solid var(--border);color:var(--txt3);font-size:12px;font-family:'DM Sans',sans-serif;padding:7px 14px;border-radius:10px;cursor:pointer;transition:all .2s;font-weight:500}
.pp-back:hover{border-color:var(--border2);color:var(--txt2)}
/* nav tabs */
.pp-nav{display:flex;gap:2px;padding:0 24px;border-bottom:1px solid var(--border);background:rgba(8,12,24,.6);overflow-x:auto;flex-shrink:0}
.pp-nav::-webkit-scrollbar{height:0}
.pp-tab{display:flex;align-items:center;gap:7px;padding:13px 16px;font-size:13px;font-weight:500;color:var(--txt3);border:none;background:transparent;cursor:pointer;border-bottom:2px solid transparent;transition:color .2s,border-color .2s;white-space:nowrap;font-family:'DM Sans',sans-serif}
.pp-tab:hover{color:var(--txt2)}
.pp-tab.active{color:var(--indigo-lt);border-bottom-color:var(--indigo)}
.pp-tab-icon{font-size:16px}
.pp-tab-badge{font-size:10px;background:var(--indigo-dim);color:var(--indigo-lt);border-radius:var(--r-pill);padding:1px 7px;font-family:'DM Mono',monospace}
/* body */
.pp-body{flex:1;padding:24px;overflow-y:auto;max-width:1200px;width:100%;margin:0 auto}
/* cards */
.card{background:linear-gradient(160deg,rgba(255,255,255,.03) 0%,transparent 60%),linear-gradient(180deg,var(--panel) 0%,#060914 100%);border:1px solid var(--border);border-radius:var(--r-lg);padding:22px;box-shadow:var(--shadow);position:relative;overflow:hidden;transition:border-color .2s,box-shadow .2s,transform .2s}
.card::before{content:'';position:absolute;top:0;left:20px;right:20px;height:1px;background:linear-gradient(90deg,transparent,rgba(99,102,241,.45),rgba(240,192,96,.25),transparent);pointer-events:none}
.card:hover{border-color:var(--border2);transform:translateY(-1px)}
.card-title{font-family:'Instrument Serif',serif;font-style:italic;font-size:19px;margin-bottom:4px}
.card-sub{color:var(--txt3);font-size:13px;font-weight:300;margin-bottom:18px}
/* eyebrow */
.eyebrow{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--indigo-lt);margin-bottom:8px}
/* grid layouts */
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
@media(max-width:860px){.grid-2,.grid-3{grid-template-columns:1fr}}
.stack{display:flex;flex-direction:column;gap:14px}
/* stat cards */
.stat-card{background:linear-gradient(160deg,var(--surface) 0%,var(--panel) 100%);border:1px solid var(--border);border-radius:var(--r);padding:18px;transition:border-color .2s,transform .2s}
.stat-card:hover{border-color:var(--border2);transform:translateY(-2px)}
.stat-icon{font-size:22px;margin-bottom:8px}
.stat-val{font-size:26px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1}
.stat-lbl{font-size:11px;color:var(--txt3);font-weight:500;letter-spacing:.06em;text-transform:uppercase;margin-top:4px}
/* fields */
.field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.field label{font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--txt3)}
.field input,.field textarea,.field select{font-family:'DM Sans',sans-serif;font-size:14px;color:var(--txt);background:#060914;border:1px solid var(--border);border-radius:11px;padding:11px 14px;outline:none;transition:border-color .2s,box-shadow .2s,transform .1s;caret-color:var(--indigo-lt);width:100%}
.field textarea{resize:vertical;min-height:90px}
.field input::placeholder,.field textarea::placeholder{color:var(--txt3);font-weight:300}
.field input:focus,.field textarea:focus,.field select:focus{border-color:var(--indigo);box-shadow:0 0 0 3px rgba(99,102,241,.18);transform:translateY(-1px)}
.field select{cursor:pointer;-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234e6090' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center}
/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;border:none;border-radius:10px;padding:10px 18px;cursor:pointer;white-space:nowrap;position:relative;overflow:hidden;transition:transform .12s var(--ease),box-shadow .2s,filter .2s;letter-spacing:.01em}
.btn::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at center,rgba(255,255,255,.12),transparent 70%);opacity:0;transition:opacity .1s}
.btn:active::after{opacity:1}
.btn:active{transform:translateY(1px) scale(.985)!important}
.btn:disabled{opacity:.4;cursor:not-allowed;pointer-events:none}
.btn-primary{background:linear-gradient(160deg,#6366f1,#4338ca);color:#fff;box-shadow:0 6px 20px rgba(99,102,241,.28),inset 0 1px 0 rgba(255,255,255,.15)}
.btn-primary:hover{transform:translateY(-2px);filter:brightness(1.08);box-shadow:0 10px 28px rgba(99,102,241,.38)}
.btn-gold{background:linear-gradient(160deg,#f0c060,#d4943a);color:#080c18;font-weight:700;box-shadow:0 6px 18px rgba(240,192,96,.2)}
.btn-gold:hover{transform:translateY(-2px);filter:brightness(1.06)}
.btn-ghost{background:rgba(13,20,38,.6);color:var(--txt2);border:1px solid var(--border);backdrop-filter:blur(8px)}
.btn-ghost:hover{border-color:var(--border2);color:var(--txt);transform:translateY(-1px)}
.btn-danger{background:var(--danger-dim);color:var(--danger);border:1px solid rgba(248,113,113,.25)}
.btn-danger:hover{background:rgba(248,113,113,.2);transform:translateY(-1px)}
.btn-sm{font-size:11px;padding:6px 12px;border-radius:8px}
.btn-icon{padding:8px;aspect-ratio:1;border-radius:9px}
/* badges */
.badge{display:inline-flex;align-items:center;gap:5px;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.06em;padding:3px 9px;border-radius:var(--r-pill);border:1px solid var(--border);background:var(--surface);color:var(--indigo-lt)}
.badge-ok{background:var(--ok-dim);border-color:rgba(52,211,153,.3);color:var(--ok)}
.badge-warn{background:var(--warn-dim);border-color:rgba(251,191,36,.3);color:var(--warn)}
.badge-danger{background:var(--danger-dim);border-color:rgba(248,113,113,.3);color:var(--danger)}
.badge-gold{background:var(--gold-dim);border-color:rgba(240,192,96,.3);color:var(--gold)}
/* list items */
.item{background:linear-gradient(160deg,var(--surface) 0%,var(--panel) 100%);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;transition:border-color .2s,transform .2s,box-shadow .2s;animation:fadeUp .3s var(--ease) both}
.item:hover{border-color:var(--border2);transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.3)}
.item-meta{font-size:11px;color:var(--txt3);display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px}
.item-title{font-weight:600;font-size:15px;margin-bottom:3px}
.item-desc{font-size:13px;color:var(--txt2);font-weight:300;line-height:1.5}
/* divider */
.divider{height:1px;background:linear-gradient(90deg,transparent,var(--border2),transparent);border:none;margin:20px 0}
/* section header */
.sec-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.sec-title{font-family:'Instrument Serif',serif;font-style:italic;font-size:20px}
/* quiz builder */
.q-card{background:linear-gradient(160deg,var(--surface) 0%,var(--panel) 100%);border:1px solid var(--border);border-radius:var(--r);padding:16px;margin-bottom:12px;position:relative;transition:border-color .2s;animation:fadeUp .3s var(--ease) both}
.q-card:hover{border-color:var(--border2)}
.q-card::before{content:attr(data-num);position:absolute;top:14px;left:-34px;font-family:'DM Mono',monospace;font-size:11px;color:var(--txt3);font-weight:500}
.q-type-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.q-type-btn{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:6px 12px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--txt3);cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif}
.q-type-btn.active{border-color:var(--indigo);background:var(--indigo-dim);color:var(--indigo-lt)}
.q-type-btn:hover:not(.active){border-color:var(--border2);color:var(--txt2)}
.option-row{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.option-correct{width:18px;height:18px;border-radius:50%;border:2px solid var(--border);background:transparent;cursor:pointer;flex-shrink:0;transition:all .18s;display:grid;place-items:center}
.option-correct.selected{border-color:var(--ok);background:var(--ok)}
.option-correct.selected::after{content:'✓';font-size:10px;color:#080c18;font-weight:700}
/* toggle */
.toggle-row{display:flex;gap:8px;margin-bottom:8px}
.toggle-btn{flex:1;padding:9px;border-radius:9px;border:1px solid var(--border);background:var(--surface);color:var(--txt3);font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif}
.toggle-btn.active-true{border-color:var(--ok);background:var(--ok-dim);color:var(--ok)}
.toggle-btn.active-false{border-color:var(--danger);background:var(--danger-dim);color:var(--danger)}
/* live feed */
.live-dot{width:8px;height:8px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 3px var(--ok-dim),0 0 12px var(--ok);animation:pulseDot 2s infinite;flex-shrink:0}
.feed{display:flex;flex-direction:column;gap:8px;max-height:50vh;overflow-y:auto;padding-right:4px}
.feed-item{background:linear-gradient(160deg,var(--surface) 0%,var(--panel) 100%);border:1px solid var(--border);border-radius:11px;padding:10px 13px;animation:fadeUp .25s var(--ease) both}
/* modal overlay */
.modal-overlay{position:fixed;inset:0;background:rgba(6,9,20,.8);backdrop-filter:blur(8px);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s var(--ease)}
.modal{background:linear-gradient(160deg,rgba(255,255,255,.04),transparent 50%),linear-gradient(180deg,var(--panel),#060914);border:1px solid var(--border2);border-radius:var(--r-lg);padding:28px;max-width:680px;width:100%;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 24px 60px rgba(0,0,0,.7)}
.modal::before{content:'';position:absolute;top:0;left:20px;right:20px;height:1px;background:linear-gradient(90deg,transparent,rgba(99,102,241,.5),rgba(240,192,96,.3),transparent)}
.modal-close{position:absolute;top:16px;right:16px;background:var(--surface);border:1px solid var(--border);color:var(--txt3);border-radius:8px;width:30px;height:30px;display:grid;place-items:center;cursor:pointer;font-size:16px;transition:all .2s;flex-shrink:0}
.modal-close:hover{border-color:var(--border2);color:var(--txt)}
/* empty state */
.empty{text-align:center;padding:36px 20px;color:var(--txt3);font-size:14px}
.empty-icon{font-size:36px;margin-bottom:10px;display:block}
/* toast */
.toast{position:fixed;bottom:24px;right:24px;padding:12px 18px;border-radius:13px;border:1px solid;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.5);z-index:400;animation:slideUp .3s var(--ease) both;display:flex;align-items:center;gap:8px;max-width:360px}
.toast-ok{background:rgba(52,211,153,.15);border-color:rgba(52,211,153,.3);color:var(--ok)}
.toast-err{background:var(--danger-dim);border-color:rgba(248,113,113,.3);color:var(--danger)}
.toast-info{background:var(--indigo-dim);border-color:var(--border2);color:var(--indigo-lt)}
/* keyframes */
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes pulseDot{0%,100%{box-shadow:0 0 0 3px var(--ok-dim),0 0 10px var(--ok)}50%{box-shadow:0 0 0 6px var(--ok-dim),0 0 20px var(--ok)}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

/* ─── Inyectar estilos una vez ──────────────────────────────── */
if (!document.getElementById("pp-styles")) {
  const s = document.createElement("style");
  s.id = "pp-styles";
  s.textContent = STYLES;
  document.head.appendChild(s);
}

/* ─── Utilidades ─────────────────────────────────────────────── */
const uid  = () => Math.random().toString(36).slice(2, 9);
const fmt  = (d) => new Date(d).toLocaleDateString("es-MX", { day:"2-digit", month:"short", year:"numeric" });
const fmtT = (d) => new Date(d).toLocaleString("es-MX", { hour:"2-digit", minute:"2-digit", day:"2-digit", month:"short" });

/* ─── Toast ──────────────────────────────────────────────────── */
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, []);
  const icon = type==="ok" ? "✓" : type==="err" ? "✕" : "ℹ";
  return <div className={`toast toast-${type}`}><span>{icon}</span><span>{msg}</span></div>;
}
function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type="ok") => setToast({ msg, type, id: uid() });
  const el = toast ? <Toast key={toast.id} msg={toast.msg} type={toast.type} onDone={() => setToast(null)}/> : null;
  return [el, show];
}

/* ═══════════════════════════════════════════════════════════════
   MÓDULO: TABLERO (Dashboard)
═══════════════════════════════════════════════════════════════ */

/* ── Avatar con inicial y color único por nombre ── */
const AVATAR_COLORS = [
  ["#6366f1","#4338ca"],["#f0c060","#d4943a"],["#34d399","#059669"],
  ["#f87171","#dc2626"],["#a78bfa","#7c3aed"],["#38bdf8","#0284c7"],
];
function Avatar({ nombre, size=34 }) {
  const idx = (nombre?.charCodeAt(0)||65) % AVATAR_COLORS.length;
  const [a,b] = AVATAR_COLORS[idx];
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${a},${b})`,display:"grid",placeItems:"center",fontSize:size*0.38,fontWeight:700,flexShrink:0,color:"#fff",border:`1px solid ${a}55`}}>
      {(nombre||"?")[0].toUpperCase()}
    </div>
  );
}

/* ── Modal Agregar / Editar Alumno ── */
const INIT_ALU = { nombre:"", email:"", rol:"alumno", clase:"Programación Web", numero_control:"" };
function ModalAlumno({ alumno, onSave, onClose }) {
  const [form, setForm] = useState(alumno ? { ...alumno } : INIT_ALU);
  const isNew = !alumno;
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="eyebrow">Alumnos</div>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:22,marginBottom:20}}>{isNew?"Agregar alumno":"Editar alumno"}</h2>
        <div className="grid-2">
          <div className="field"><label>Nombre completo</label><input placeholder="Ej. Ana Torres" value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))}/></div>
          <div className="field"><label>Número de control</label><input placeholder="Ej. 24280902" value={form.numero_control} onChange={e=>setForm(f=>({...f,numero_control:e.target.value}))}/></div>
        </div>
        <div className="field"><label>Correo electrónico</label><input type="email" placeholder="alumno@edutec.mx" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
        <div className="grid-2">
          <div className="field"><label>Rol</label>
            <select value={form.rol} onChange={e=>setForm(f=>({...f,rol:e.target.value}))}>
              <option value="alumno">Alumno</option>
              <option value="profesor">Profesor</option>
              <option value="ayudante">Ayudante</option>
            </select>
          </div>
          <div className="field"><label>Clase principal</label>
            <select value={form.clase} onChange={e=>setForm(f=>({...f,clase:e.target.value}))}>
              {["Programación Web","Base de Datos","Sistemas Operativos","Inteligencia Artificial"].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {isNew && (
          <div className="field"><label>Contraseña inicial</label><input type="password" placeholder="Mín. 6 caracteres" value={form.password||""} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/></div>
        )}
        <div style={{display:"flex",gap:10,marginTop:6}}>
          <button className="btn btn-primary" onClick={()=>onSave(form)}>{isNew?"Agregar alumno":"Guardar cambios"}</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal Detalle de Mensajes ── */
function ModalMensajes({ mensajes, titulo, onClose }) {
  const [q, setQ] = useState("");
  const filtered = mensajes.filter(m=>{
    const ql=q.toLowerCase();
    return !ql || (m.texto||"").toLowerCase().includes(ql) || (m.autor||"").toLowerCase().includes(ql);
  });
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:720}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="eyebrow">Mensajes</div>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:22,marginBottom:16}}>{titulo}</h2>
        <input style={{width:"100%",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--txt)",background:"#060914",border:"1px solid var(--border)",borderRadius:10,padding:"9px 13px",outline:"none",marginBottom:14}} placeholder="Buscar en mensajes…" value={q} onChange={e=>setQ(e.target.value)}/>
        <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:"55vh",overflowY:"auto",paddingRight:4}}>
          {filtered.length===0 && <div style={{textAlign:"center",padding:"24px 0",color:"var(--txt3)",fontSize:13}}>Sin mensajes que coincidan.</div>}
          {filtered.map(m=>(
            <div key={m._id||m.id} style={{background:"linear-gradient(160deg,var(--surface),var(--panel))",border:"1px solid var(--border)",borderRadius:11,padding:"11px 14px"}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                <Avatar nombre={m.autor} size={26}/>
                <span style={{fontSize:13,fontWeight:600}}>{m.autor||"Anónimo"}</span>
                <span style={{fontSize:11,color:"var(--txt3)",marginLeft:"auto"}}>{fmtT(m.fecha)}</span>
              </div>
              <div style={{fontSize:14,color:"var(--txt2)",lineHeight:1.5}}>{m.texto}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:14,fontSize:12,color:"var(--txt3)",textAlign:"right"}}>{filtered.length} de {mensajes.length} mensajes</div>
      </div>
    </div>
  );
}

function TabDashboard({ stats: initStats, usuarios: initUsuarios, mensajes: initMensajes, loading, showToast }) {
  /* ── Estado local para gestión completa ── */
  const [usuarios,  setUsuarios]  = useState(initUsuarios);
  const [mensajes,  setMensajes]  = useState(initMensajes);
  const [modalAlu,  setModalAlu]  = useState(null); // null | "new" | { alumno }
  const [modalMsg,  setModalMsg]  = useState(null); // null | "hoy" | "total"
  const [searchAlu, setSearchAlu] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroCls, setFiltroCls] = useState("");
  const [confirmDel,setConfirmDel]= useState(null);

  useEffect(()=>{ setUsuarios(initUsuarios); },[initUsuarios]);
  useEffect(()=>{ setMensajes(initMensajes); },[initMensajes]);

  /* ── Métricas calculadas en vivo ── */
  const todayStr = new Date().toDateString();
  const msgsHoy   = mensajes.filter(m=>new Date(m.fecha).toDateString()===todayStr);
  const msgsTotal = mensajes;

  const stats = {
    ...initStats,
    usuarios: usuarios.length,
    mensajesHoy: msgsHoy.length || initStats.mensajesHoy,
    totalMensajes: msgsTotal.length || initStats.totalMensajes,
  };
  const pct = Math.min(100, Math.round((stats.mensajesHoy/(stats.totalMensajes||1))*100));

  /* ── Actividad por hora (simulada) ── */
  const horasData = Array.from({length:8},(_,i)=>({ h:`${8+i}h`, n: Math.floor(Math.random()*8) }));
  const maxH = Math.max(...horasData.map(x=>x.n),1);

  /* ── Alumnos filtrados ── */
  const aluFiltrados = useMemo(()=>{
    const ql = searchAlu.toLowerCase();
    return usuarios.filter(u=>{
      const okS = !ql || (u.nombre||"").toLowerCase().includes(ql) || (u.email||"").toLowerCase().includes(ql) || (u.numero_control||"").includes(ql);
      const okR = !filtroRol || u.rol===filtroRol;
      const okC = !filtroCls || u.clase===filtroCls;
      return okS && okR && okC;
    });
  },[usuarios,searchAlu,filtroRol,filtroCls]);

  /* ── CRUD alumnos ── */
  const agregarAlumno = (form)=>{
    if (!form.nombre.trim()||!form.email.trim()) { showToast("Nombre y correo son requeridos","err"); return; }
    setUsuarios(prev=>[...prev,{...form,_id:"u"+uid()}]);
    setModalAlu(null);
    showToast("Alumno agregado correctamente");
  };
  const editarAlumno = (form)=>{
    setUsuarios(prev=>prev.map(u=>u._id===form._id?form:u));
    setModalAlu(null);
    showToast("Alumno actualizado");
  };
  const eliminarAlumno = (id)=>{
    setUsuarios(prev=>prev.filter(u=>u._id!==id));
    setConfirmDel(null);
    showToast("Alumno eliminado","info");
  };

  /* ── Distribución por clase ── */
  const claseCount = useMemo(()=>{
    const m={};
    usuarios.forEach(u=>{ m[u.clase||"Sin clase"]=(m[u.clase||"Sin clase"]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);
  },[usuarios]);

  const clases = ["Programación Web","Base de Datos","Sistemas Operativos","Inteligencia Artificial"];

  return (
    <div className="stack">

      {/* ── KPI Cards ── */}
      <div className="grid-3">
        {/* Alumnos — clickable */}
        <div className="stat-card" style={{cursor:"pointer",position:"relative"}} onClick={()=>document.getElementById("sec-alumnos")?.scrollIntoView({behavior:"smooth"})}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div className="stat-icon">👥</div>
            <span className="badge-ok badge" style={{fontSize:9}}>Ver todos ↓</span>
          </div>
          <div className="stat-val" style={{marginTop:8}}>{stats.usuarios}</div>
          <div className="stat-lbl">Alumnos registrados</div>
          <div style={{marginTop:10,height:3,background:"var(--surface)",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min(100,stats.usuarios/50*100)}%`,background:"linear-gradient(90deg,var(--indigo),#a78bfa)",borderRadius:99}}/>
          </div>
        </div>

        {/* Mensajes hoy — clickable */}
        <div className="stat-card" style={{cursor:"pointer"}} onClick={()=>setModalMsg("hoy")}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div className="stat-icon">💬</div>
            <span className="badge badge-warn" style={{fontSize:9}}>Ver detalle ↗</span>
          </div>
          <div className="stat-val" style={{marginTop:8}}>{stats.mensajesHoy}</div>
          <div className="stat-lbl">Mensajes hoy</div>
          <div style={{marginTop:10,display:"flex",gap:3,alignItems:"flex-end",height:28}}>
            {horasData.map((h,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{width:"100%",height:`${Math.max(4,(h.n/maxH)*24)}px`,background:`rgba(251,191,36,${0.3+h.n/maxH*0.7})`,borderRadius:"3px 3px 0 0",transition:"height .4s var(--ease)"}}/>
              </div>
            ))}
          </div>
        </div>

        {/* Total mensajes — clickable */}
        <div className="stat-card" style={{cursor:"pointer"}} onClick={()=>setModalMsg("total")}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div className="stat-icon">📋</div>
            <span className="badge" style={{fontSize:9}}>Ver todos ↗</span>
          </div>
          <div className="stat-val" style={{marginTop:8}}>{stats.totalMensajes}</div>
          <div className="stat-lbl">Total mensajes</div>
          <div style={{marginTop:10,height:3,background:"var(--surface)",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,var(--indigo),var(--gold))",borderRadius:99,transition:"width .8s var(--ease)"}}/>
          </div>
          <div style={{fontSize:11,color:"var(--txt3)",marginTop:4}}>{pct}% corresponden a hoy</div>
        </div>
      </div>

      {/* ── Actividad + Distribución ── */}
      <div className="grid-2">
        <div className="card">
          <div className="eyebrow">Participación del día</div>
          <div className="card-title">Mensajes por hora</div>
          <div style={{display:"flex",gap:4,alignItems:"flex-end",height:60,marginTop:16,marginBottom:6}}>
            {horasData.map((h,i)=>(
              <div key={i} title={`${h.h}: ${h.n} msgs`} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"default"}}>
                <div style={{width:"100%",height:`${Math.max(4,(h.n/maxH)*54)}px`,background:`linear-gradient(180deg,var(--indigo),#4338ca)`,borderRadius:"4px 4px 0 0",opacity:0.4+h.n/maxH*0.6,transition:"height .6s var(--ease)"}}/>
                <span style={{fontSize:9,color:"var(--txt3)"}}>{h.h}</span>
              </div>
            ))}
          </div>
          <hr className="divider" style={{margin:"10px 0"}}/>
          <div style={{display:"flex",gap:16}}>
            <div><div style={{fontSize:18,fontWeight:700,color:"var(--ok)"}}>{stats.mensajesHoy}</div><div style={{fontSize:10,color:"var(--txt3)",textTransform:"uppercase",letterSpacing:".06em"}}>Hoy</div></div>
            <div><div style={{fontSize:18,fontWeight:700,color:"var(--indigo-lt)"}}>{stats.totalMensajes}</div><div style={{fontSize:10,color:"var(--txt3)",textTransform:"uppercase",letterSpacing:".06em"}}>Total</div></div>
            <div><div style={{fontSize:18,fontWeight:700,color:"var(--gold)"}}>{pct}%</div><div style={{fontSize:10,color:"var(--txt3)",textTransform:"uppercase",letterSpacing:".06em"}}>Actividad</div></div>
          </div>
        </div>

        <div className="card">
          <div className="eyebrow">Distribución</div>
          <div className="card-title">Alumnos por clase</div>
          <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:10}}>
            {claseCount.length===0 && <div style={{color:"var(--txt3)",fontSize:13}}>Sin datos aún.</div>}
            {claseCount.map(([cls,cnt])=>(
              <div key={cls}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                  <span style={{color:"var(--txt2)",fontWeight:500}}>{cls}</span>
                  <span style={{color:"var(--txt3)",fontFamily:"'DM Mono',monospace"}}>{cnt}</span>
                </div>
                <div style={{height:5,background:"var(--surface)",borderRadius:99,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(cnt/usuarios.length||0)*100}%`,background:"linear-gradient(90deg,var(--indigo),var(--gold))",borderRadius:99,transition:"width .8s var(--ease)"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SECCIÓN: GESTIÓN DE ALUMNOS
      ══════════════════════════════════════════════════ */}
      <div id="sec-alumnos" className="card" style={{overflow:"visible"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:18}}>
          <div>
            <div className="eyebrow">Gestión</div>
            <div className="card-title" style={{marginBottom:0}}>Alumnos registrados <span style={{fontSize:15,fontWeight:400,color:"var(--txt3)"}}>({aluFiltrados.length})</span></div>
          </div>
          <button className="btn btn-primary" onClick={()=>setModalAlu("new")}>+ Agregar alumno</button>
        </div>

        {/* Filtros */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
          <input
            style={{flex:"1 1 200px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--txt)",background:"#060914",border:"1px solid var(--border)",borderRadius:10,padding:"9px 13px",outline:"none",transition:"border-color .2s"}}
            placeholder="🔍 Buscar por nombre, correo o N° control…"
            value={searchAlu} onChange={e=>setSearchAlu(e.target.value)}
            onFocus={e=>e.target.style.borderColor="var(--indigo)"}
            onBlur={e=>e.target.style.borderColor="var(--border)"}
          />
          <select style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--txt)",background:"#060914",border:"1px solid var(--border)",borderRadius:10,padding:"9px 13px",outline:"none",cursor:"pointer"}} value={filtroRol} onChange={e=>setFiltroRol(e.target.value)}>
            <option value="">Todos los roles</option>
            <option value="alumno">Alumno</option>
            <option value="profesor">Profesor</option>
            <option value="ayudante">Ayudante</option>
          </select>
          <select style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--txt)",background:"#060914",border:"1px solid var(--border)",borderRadius:10,padding:"9px 13px",outline:"none",cursor:"pointer"}} value={filtroCls} onChange={e=>setFiltroCls(e.target.value)}>
            <option value="">Todas las clases</option>
            {clases.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Tabla de alumnos */}
        {loading && <div style={{color:"var(--txt3)",fontSize:14,padding:"16px 0"}}>Cargando alumnos…</div>}
        {!loading && aluFiltrados.length===0 && (
          <div className="empty"><span className="empty-icon">👤</span>No se encontraron alumnos con ese filtro.</div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {aluFiltrados.map((u,i)=>(
            <div key={u._id} className="item" style={{animationDelay:`${i*30}ms`,display:"flex",alignItems:"center",gap:12,padding:"12px 14px"}}>
              <Avatar nombre={u.nombre} size={38}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:14,marginBottom:2}}>{u.nombre}</div>
                <div style={{fontSize:12,color:"var(--txt3)",display:"flex",gap:10,flexWrap:"wrap"}}>
                  {u.email && <span>✉️ {u.email}</span>}
                  {u.numero_control && <span>🔢 {u.numero_control}</span>}
                  {u.clase && <span>🏫 {u.clase}</span>}
                </div>
              </div>
              <span className={`badge${u.rol==="profesor"?" badge-gold":u.rol==="ayudante"?" badge-warn":""}`}>{u.rol||"alumno"}</span>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button className="btn btn-ghost btn-sm btn-icon" title="Editar" onClick={()=>setModalAlu(u)}>✏️</button>
                <button className="btn btn-danger btn-sm btn-icon" title="Eliminar" onClick={()=>setConfirmDel(u)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen footer */}
        {usuarios.length>0 && (
          <div style={{marginTop:14,display:"flex",gap:14,flexWrap:"wrap",borderTop:"1px solid var(--border)",paddingTop:14}}>
            {[
              ["Alumnos",   usuarios.filter(u=>u.rol==="alumno"||!u.rol).length, "var(--indigo-lt)"],
              ["Profesores",usuarios.filter(u=>u.rol==="profesor").length,        "var(--gold)"],
              ["Ayudantes", usuarios.filter(u=>u.rol==="ayudante").length,        "var(--warn)"],
            ].map(([l,n,c])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:c}}/>
                <span style={{fontSize:12,color:"var(--txt3)"}}>{l}: <b style={{color:"var(--txt2)"}}>{n}</b></span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modales ── */}
      {modalAlu==="new" && <ModalAlumno onSave={agregarAlumno} onClose={()=>setModalAlu(null)}/>}
      {modalAlu && modalAlu!=="new" && <ModalAlumno alumno={modalAlu} onSave={editarAlumno} onClose={()=>setModalAlu(null)}/>}

      {/* Confirm eliminar */}
      {confirmDel && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setConfirmDel(null)}>
          <div className="modal" style={{maxWidth:400}}>
            <div style={{textAlign:"center",paddingBottom:8}}>
              <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
              <h2 style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:20,marginBottom:8}}>¿Eliminar alumno?</h2>
              <p style={{color:"var(--txt2)",fontSize:14,marginBottom:20}}>Se eliminará a <b>{confirmDel.nombre}</b> del sistema. Esta acción no se puede deshacer.</p>
              <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                <button className="btn btn-danger" onClick={()=>eliminarAlumno(confirmDel._id)}>Sí, eliminar</button>
                <button className="btn btn-ghost" onClick={()=>setConfirmDel(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal mensajes hoy */}
      {modalMsg==="hoy" && (
        <ModalMensajes
          mensajes={msgsHoy.length ? msgsHoy : mensajes.slice(0,3)}
          titulo={`Mensajes de hoy (${msgsHoy.length || stats.mensajesHoy})`}
          onClose={()=>setModalMsg(null)}
        />
      )}

      {/* Modal todos los mensajes */}
      {modalMsg==="total" && (
        <ModalMensajes
          mensajes={mensajes.length ? mensajes : [
            {_id:"x1",autor:"Ana Torres",texto:"¿Habrá clase el viernes?",fecha:new Date(Date.now()-3600000).toISOString()},
            {_id:"x2",autor:"Carlos Ruiz",texto:"Número de control 24280902",fecha:new Date(Date.now()-7200000).toISOString()},
            {_id:"x3",autor:"Sofía Mendez",texto:"Entregué la tarea ayer.",fecha:new Date(Date.now()-86400000).toISOString()},
          ]}
          titulo={`Todos los mensajes (${stats.totalMensajes})`}
          onClose={()=>setModalMsg(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MÓDULO: ANUNCIOS
═══════════════════════════════════════════════════════════════ */
const INIT_ANN = {
  titulo:"", cuerpo:"", tipo:"aviso", prioridad:"normal",
  programado:false, fechaVis:"", destinatarios:"todos", archivos:[]
};

function TabAnuncios({ showToast }) {
  const [anuncios, setAnuncios] = useState([
    { id:uid(), titulo:"Bienvenida al semestre", cuerpo:"Bienvenidos a Programación Web. Revisen el temario adjunto.", tipo:"aviso", prioridad:"alta", fecha:new Date().toISOString(), destinatarios:"todos", archivos:[] },
    { id:uid(), titulo:"Entrega parcial 1 — Próximo viernes", cuerpo:"Recuerden que el primer parcial se entrega el viernes a las 23:59.", tipo:"recordatorio", prioridad:"urgente", fecha:new Date(Date.now()-86400000*2).toISOString(), destinatarios:"todos", archivos:[] },
  ]);
  const [form, setForm]       = useState(INIT_ANN);
  const [modal, setModal]     = useState(false);
  const [editId, setEditId]   = useState(null);
  const fileRef               = useRef();

  const prioColor = { normal:"badge", alta:"badge-warn", urgente:"badge-danger" };
  const tipoIcon  = { aviso:"📢", recordatorio:"🔔", material:"📎", evento:"📅" };

  const guardar = () => {
    if (!form.titulo.trim() || !form.cuerpo.trim()) { showToast("Completa título y contenido","err"); return; }
    if (editId) {
      setAnuncios(prev => prev.map(a => a.id===editId ? { ...form, id:editId, fecha:a.fecha } : a));
      showToast("Anuncio actualizado");
    } else {
      setAnuncios(prev => [{ ...form, id:uid(), fecha:new Date().toISOString() }, ...prev]);
      showToast("Anuncio publicado");
    }
    setForm(INIT_ANN); setModal(false); setEditId(null);
  };

  const editar = (a) => { setForm({ ...a }); setEditId(a.id); setModal(true); };
  const borrar = (id) => { setAnuncios(prev => prev.filter(a=>a.id!==id)); showToast("Anuncio eliminado","info"); };

  return (
    <div className="stack">
      <div className="sec-head">
        <div><div className="eyebrow">Comunicación</div><div className="sec-title">Anuncios</div></div>
        <button className="btn btn-primary" onClick={()=>{setForm(INIT_ANN);setEditId(null);setModal(true)}}>+ Nuevo anuncio</button>
      </div>
      {anuncios.length===0 && <div className="empty"><span className="empty-icon">📢</span>Sin anuncios publicados aún.</div>}
      {anuncios.map(a => (
        <div key={a.id} className="item">
          <div className="item-meta">
            <span>{tipoIcon[a.tipo]} {a.tipo}</span>
            <span className={prioColor[a.prioridad]}>{a.prioridad}</span>
            <span>{fmtT(a.fecha)}</span>
            <span>→ {a.destinatarios}</span>
          </div>
          <div className="item-title">{a.titulo}</div>
          <div className="item-desc">{a.cuerpo}</div>
          {a.archivos?.length>0 && <div style={{marginTop:8,fontSize:12,color:"var(--txt3)"}}>📎 {a.archivos.join(", ")}</div>}
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>editar(a)}>✏️ Editar</button>
            <button className="btn btn-danger btn-sm" onClick={()=>borrar(a.id)}>🗑️ Eliminar</button>
          </div>
        </div>
      ))}

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&(setModal(false),setEditId(null))}>
          <div className="modal">
            <button className="modal-close" onClick={()=>{setModal(false);setEditId(null)}}>✕</button>
            <div className="eyebrow">Anuncios</div>
            <h2 style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:22,marginBottom:18}}>{editId?"Editar anuncio":"Nuevo anuncio"}</h2>
            <div className="field"><label>Título del anuncio</label><input placeholder="Ej. Cambio de horario" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))}/></div>
            <div className="field"><label>Contenido</label><textarea placeholder="Escribe el mensaje completo…" value={form.cuerpo} onChange={e=>setForm(f=>({...f,cuerpo:e.target.value}))}/></div>
            <div className="grid-2">
              <div className="field"><label>Tipo</label>
                <select value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))}>
                  <option value="aviso">📢 Aviso</option>
                  <option value="recordatorio">🔔 Recordatorio</option>
                  <option value="material">📎 Material</option>
                  <option value="evento">📅 Evento</option>
                </select>
              </div>
              <div className="field"><label>Prioridad</label>
                <select value={form.prioridad} onChange={e=>setForm(f=>({...f,prioridad:e.target.value}))}>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>
            <div className="field"><label>Destinatarios</label>
              <select value={form.destinatarios} onChange={e=>setForm(f=>({...f,destinatarios:e.target.value}))}>
                <option value="todos">Todos los alumnos</option>
                <option value="Programación Web">Programación Web</option>
                <option value="Base de Datos">Base de Datos</option>
                <option value="Sistemas Operativos">Sistemas Operativos</option>
              </select>
            </div>
            <div className="field">
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <input type="checkbox" checked={form.programado} onChange={e=>setForm(f=>({...f,programado:e.target.checked}))} style={{width:"auto",accentColor:"var(--indigo)"}}/>
                Programar visibilidad
              </label>
              {form.programado && <input type="datetime-local" value={form.fechaVis} onChange={e=>setForm(f=>({...f,fechaVis:e.target.value}))}/>}
            </div>
            <div className="field"><label>Adjuntar archivos (simulado)</label>
              <input ref={fileRef} type="file" multiple style={{display:"none"}} onChange={e=>{const ns=[...e.target.files].map(f=>f.name);setForm(f=>({...f,archivos:[...(f.archivos||[]),...ns]}))}}/>
              <button className="btn btn-ghost btn-sm" onClick={()=>fileRef.current.click()}>📎 Adjuntar archivo</button>
              {form.archivos?.length>0 && <div style={{marginTop:6,fontSize:12,color:"var(--txt3)"}}>{form.archivos.join(", ")} <span style={{cursor:"pointer",color:"var(--danger)"}} onClick={()=>setForm(f=>({...f,archivos:[]}))}>✕ limpiar</span></div>}
            </div>
            <div style={{display:"flex",gap:10,marginTop:6}}>
              <button className="btn btn-primary" onClick={guardar}>{editId?"Guardar cambios":"Publicar anuncio"}</button>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setEditId(null)}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MÓDULO: TAREAS
═══════════════════════════════════════════════════════════════ */
const INIT_TASK = {
  titulo:"", instrucciones:"", clase:"Programación Web", tipo:"tarea",
  puntos:100, fechaEntrega:"", permitirTarde:false, adjuntos:[]
};

function TabTareas({ showToast }) {
  const [tareas, setTareas]   = useState([
    { id:uid(), titulo:"Práctica 1 — HTML semántico", instrucciones:"Crea una página web usando etiquetas HTML5 semánticas.", clase:"Programación Web", tipo:"tarea", puntos:100, fechaEntrega:new Date(Date.now()+86400000*3).toISOString(), permitirTarde:false, adjuntos:[], entregas:7 },
    { id:uid(), titulo:"Reporte — Normalización DB", instrucciones:"Entrega un reporte de al menos 3 páginas sobre las formas normales.", clase:"Base de Datos", tipo:"proyecto", puntos:150, fechaEntrega:new Date(Date.now()+86400000*7).toISOString(), permitirTarde:true, adjuntos:[], entregas:3 },
  ]);
  const [form, setForm]       = useState(INIT_TASK);
  const [modal, setModal]     = useState(false);
  const [editId, setEditId]   = useState(null);
  const [viewId, setViewId]   = useState(null);
  const fileRef               = useRef();

  const tipoColor = { tarea:"badge", proyecto:"badge-gold", examen:"badge-danger", lectura:"badge-warn" };

  const vencida = (f) => new Date(f) < new Date();

  const guardar = () => {
    if (!form.titulo.trim()||!form.fechaEntrega) { showToast("Completa título y fecha de entrega","err"); return; }
    if (editId) {
      setTareas(prev=>prev.map(t=>t.id===editId?{...form,id:editId,entregas:t.entregas}:t));
      showToast("Tarea actualizada");
    } else {
      setTareas(prev=>[{...form,id:uid(),entregas:0},...prev]);
      showToast("Tarea publicada");
    }
    setForm(INIT_TASK); setModal(false); setEditId(null);
  };

  const tarea = viewId ? tareas.find(t=>t.id===viewId) : null;

  return (
    <div className="stack">
      <div className="sec-head">
        <div><div className="eyebrow">Asignaciones</div><div className="sec-title">Tareas y proyectos</div></div>
        <button className="btn btn-primary" onClick={()=>{setForm(INIT_TASK);setEditId(null);setModal(true)}}>+ Nueva tarea</button>
      </div>
      {tareas.length===0 && <div className="empty"><span className="empty-icon">📁</span>Sin tareas asignadas aún.</div>}
      {tareas.map(t => (
        <div key={t.id} className="item" style={vencida(t.fechaEntrega)?{borderColor:"rgba(248,113,113,.2)"}:{}}>
          <div className="item-meta">
            <span className={tipoColor[t.tipo]}>{t.tipo}</span>
            <span>🏫 {t.clase}</span>
            <span>🎯 {t.puntos} pts</span>
            <span className={vencida(t.fechaEntrega)?"badge-danger":"badge-ok"}>
              {vencida(t.fechaEntrega)?"Vencida":"Entrega:"} {fmt(t.fechaEntrega)}
            </span>
          </div>
          <div className="item-title">{t.titulo}</div>
          <div className="item-desc" style={{WebkitLineClamp:2,overflow:"hidden",display:"-webkit-box",WebkitBoxOrient:"vertical"}}>{t.instrucciones}</div>
          <div style={{display:"flex",gap:10,marginTop:12,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:"var(--txt3)"}}>📩 {t.entregas} entregas</span>
            <button className="btn btn-ghost btn-sm" onClick={()=>setViewId(t.id)}>👁️ Ver detalle</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>{setForm({...t});setEditId(t.id);setModal(true)}}>✏️ Editar</button>
            <button className="btn btn-danger btn-sm" onClick={()=>{setTareas(p=>p.filter(x=>x.id!==t.id));showToast("Tarea eliminada","info")}}>🗑️</button>
          </div>
        </div>
      ))}

      {/* Modal crear/editar */}
      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&(setModal(false),setEditId(null))}>
          <div className="modal">
            <button className="modal-close" onClick={()=>{setModal(false);setEditId(null)}}>✕</button>
            <div className="eyebrow">Tareas</div>
            <h2 style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:22,marginBottom:18}}>{editId?"Editar tarea":"Nueva tarea"}</h2>
            <div className="field"><label>Título</label><input placeholder="Ej. Práctica 2 — CSS Grid" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))}/></div>
            <div className="field"><label>Instrucciones</label><textarea placeholder="Describe qué deben entregar los alumnos…" value={form.instrucciones} onChange={e=>setForm(f=>({...f,instrucciones:e.target.value}))}/></div>
            <div className="grid-2">
              <div className="field"><label>Clase</label>
                <select value={form.clase} onChange={e=>setForm(f=>({...f,clase:e.target.value}))}>
                  {["Programación Web","Base de Datos","Sistemas Operativos","Inteligencia Artificial"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field"><label>Tipo</label>
                <select value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))}>
                  <option value="tarea">Tarea</option>
                  <option value="proyecto">Proyecto</option>
                  <option value="examen">Examen</option>
                  <option value="lectura">Lectura</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="field"><label>Puntos</label><input type="number" min="1" value={form.puntos} onChange={e=>setForm(f=>({...f,puntos:e.target.value}))}/></div>
              <div className="field"><label>Fecha de entrega</label><input type="datetime-local" value={form.fechaEntrega?.slice(0,16)||""} onChange={e=>setForm(f=>({...f,fechaEntrega:new Date(e.target.value).toISOString()}))}/></div>
            </div>
            <div className="field">
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <input type="checkbox" checked={form.permitirTarde} onChange={e=>setForm(f=>({...f,permitirTarde:e.target.checked}))} style={{width:"auto",accentColor:"var(--indigo)"}}/>
                Permitir entregas tardías
              </label>
            </div>
            <div className="field">
              <label>Material de apoyo (archivos)</label>
              <input ref={fileRef} type="file" multiple style={{display:"none"}} onChange={e=>{const ns=[...e.target.files].map(x=>x.name);setForm(f=>({...f,adjuntos:[...(f.adjuntos||[]),...ns]}))}}/>
              <button className="btn btn-ghost btn-sm" onClick={()=>fileRef.current.click()}>📎 Adjuntar</button>
              {form.adjuntos?.length>0 && <div style={{marginTop:6,fontSize:12,color:"var(--txt3)"}}>{form.adjuntos.join(", ")}</div>}
            </div>
            <div style={{display:"flex",gap:10,marginTop:6}}>
              <button className="btn btn-primary" onClick={guardar}>{editId?"Guardar cambios":"Publicar tarea"}</button>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setEditId(null)}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {tarea && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setViewId(null)}>
          <div className="modal">
            <button className="modal-close" onClick={()=>setViewId(null)}>✕</button>
            <div className="eyebrow">Detalle de tarea</div>
            <h2 style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:22,marginBottom:6}}>{tarea.titulo}</h2>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
              <span className={tipoColor[tarea.tipo]}>{tarea.tipo}</span>
              <span className="badge">🏫 {tarea.clase}</span>
              <span className="badge">🎯 {tarea.puntos} pts</span>
              <span className={vencida(tarea.fechaEntrega)?"badge badge-danger":"badge badge-ok"}>📅 {fmt(tarea.fechaEntrega)}</span>
            </div>
            <div style={{fontSize:14,color:"var(--txt2)",lineHeight:1.65,marginBottom:16}}>{tarea.instrucciones}</div>
            <hr className="divider"/>
            <div style={{fontWeight:600,marginBottom:10}}>📩 Entregas ({tarea.entregas})</div>
            {tarea.entregas===0 ? <div className="empty" style={{padding:"14px 0"}}><span style={{fontSize:24}}>📭</span><br/>Sin entregas aún.</div>
              : Array.from({length:tarea.entregas}).map((_,i)=>(
                <div key={i} className="item" style={{marginBottom:8}}>
                  <div className="item-meta"><span>Alumno {i+1}</span><span>{fmt(new Date(Date.now()-Math.random()*86400000*2))}</span></div>
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <input style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--txt)",background:"#060914",border:"1px solid var(--border)",borderRadius:8,padding:"6px 10px",outline:"none",width:80}} type="number" placeholder="Nota" min="0" max={tarea.puntos}/>
                    <button className="btn btn-gold btn-sm">Calificar</button>
                    <button className="btn btn-ghost btn-sm">Ver entrega</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MÓDULO: QUIZ BUILDER
═══════════════════════════════════════════════════════════════ */
const mkPregunta = () => ({
  id:uid(), tipo:"multiple", enunciado:"",
  opciones:["","","",""], correcta:0,
  tfRespuesta:true, abiertaRespuesta:"",
  puntaje:10, explicacion:""
});
const INIT_QUIZ = {
  titulo:"", descripcion:"", clase:"Programación Web",
  tiempo:0, intentos:1, mostrarResultados:true,
  aleatorio:false, preguntas:[mkPregunta()]
};

function QuizBuilder({ quiz, setQuiz }) {
  const setQ = (qid, fn) => setQuiz(qz=>({...qz, preguntas:qz.preguntas.map(p=>p.id===qid?fn(p):p)}));

  const addPregunta = () => setQuiz(qz=>({...qz, preguntas:[...qz.preguntas, mkPregunta()]}));
  const delPregunta = (qid) => setQuiz(qz=>({...qz, preguntas:qz.preguntas.filter(p=>p.id!==qid)}));
  const dupeP = (qid) => {
    const p = quiz.preguntas.find(x=>x.id===qid);
    const np = {...p, id:uid()};
    setQuiz(qz=>({...qz, preguntas:[...qz.preguntas, np]}));
  };

  const TIPOS = [
    { k:"multiple", label:"Opción múltiple", icon:"🔘" },
    { k:"verdadero_falso", label:"V / F", icon:"✅" },
    { k:"abierta", label:"Respuesta abierta", icon:"✍️" },
    { k:"ordenar", label:"Ordenar elementos", icon:"🔢" },
  ];

  return (
    <div>
      {/* Config general */}
      <div className="card" style={{marginBottom:16}}>
        <div className="eyebrow">Configuración del quiz</div>
        <div className="grid-2" style={{marginTop:10}}>
          <div className="field"><label>Título del quiz</label><input placeholder="Ej. Examen Unidad 1" value={quiz.titulo} onChange={e=>setQuiz(qz=>({...qz,titulo:e.target.value}))}/></div>
          <div className="field"><label>Clase</label>
            <select value={quiz.clase} onChange={e=>setQuiz(qz=>({...qz,clase:e.target.value}))}>
              {["Programación Web","Base de Datos","Sistemas Operativos","Inteligencia Artificial"].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="field"><label>Descripción / instrucciones</label><textarea placeholder="Instrucciones para los alumnos…" value={quiz.descripcion} onChange={e=>setQuiz(qz=>({...qz,descripcion:e.target.value}))}/></div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <div className="field" style={{flex:"1 1 140px"}}><label>Tiempo límite (min, 0 = sin límite)</label><input type="number" min="0" value={quiz.tiempo} onChange={e=>setQuiz(qz=>({...qz,tiempo:e.target.value}))}/></div>
          <div className="field" style={{flex:"1 1 120px"}}><label>Intentos permitidos</label><input type="number" min="1" value={quiz.intentos} onChange={e=>setQuiz(qz=>({...qz,intentos:e.target.value}))}/></div>
        </div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:4}}>
          {[["mostrarResultados","Mostrar resultados al terminar"],["aleatorio","Orden aleatorio de preguntas"]].map(([k,l])=>(
            <label key={k} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:13,color:"var(--txt2)"}}>
              <input type="checkbox" checked={quiz[k]} onChange={e=>setQuiz(qz=>({...qz,[k]:e.target.checked}))} style={{accentColor:"var(--indigo)",width:"auto"}}/>
              {l}
            </label>
          ))}
        </div>
      </div>

      {/* Preguntas */}
      <div style={{paddingLeft:40}}>
        {quiz.preguntas.map((p, idx) => (
          <div key={p.id} className="q-card" data-num={idx+1}>
            {/* Selector de tipo */}
            <div className="q-type-row">
              {TIPOS.map(t=>(
                <button key={t.k} className={`q-type-btn${p.tipo===t.k?" active":""}`} onClick={()=>setQ(p.id,x=>({...x,tipo:t.k}))}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Enunciado */}
            <div className="field" style={{marginBottom:12}}>
              <label>Pregunta {idx+1}</label>
              <textarea placeholder="Escribe la pregunta aquí…" value={p.enunciado} onChange={e=>setQ(p.id,x=>({...x,enunciado:e.target.value}))} style={{minHeight:70}}/>
            </div>

            {/* Cuerpo según tipo */}
            {p.tipo==="multiple" && (
              <div>
                <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".06em",color:"var(--txt3)",fontWeight:600,marginBottom:8}}>Opciones (marca la correcta)</div>
                {(p.opciones||[]).map((op,i)=>(
                  <div key={i} className="option-row">
                    <div className={`option-correct${p.correcta===i?" selected":""}`} onClick={()=>setQ(p.id,x=>({...x,correcta:i}))}/>
                    <input style={{flex:1,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--txt)",background:"#060914",border:"1px solid var(--border)",borderRadius:9,padding:"8px 12px",outline:"none",transition:"border-color .2s"}} placeholder={`Opción ${i+1}`} value={op} onChange={e=>{const arr=[...p.opciones];arr[i]=e.target.value;setQ(p.id,x=>({...x,opciones:arr}))}} onFocus={e=>e.target.style.borderColor="var(--indigo)"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
                    {p.opciones.length>2 && <button className="btn btn-danger btn-icon btn-sm" onClick={()=>{const arr=p.opciones.filter((_,j)=>j!==i);setQ(p.id,x=>({...x,opciones:arr,correcta:0}))}}>✕</button>}
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" style={{marginTop:6}} onClick={()=>setQ(p.id,x=>({...x,opciones:[...x.opciones,""]}))}>+ Agregar opción</button>
              </div>
            )}

            {p.tipo==="verdadero_falso" && (
              <div>
                <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".06em",color:"var(--txt3)",fontWeight:600,marginBottom:8}}>Respuesta correcta</div>
                <div className="toggle-row">
                  <button className={`toggle-btn${p.tfRespuesta===true?" active-true":""}`} onClick={()=>setQ(p.id,x=>({...x,tfRespuesta:true}))}>✅ Verdadero</button>
                  <button className={`toggle-btn${p.tfRespuesta===false?" active-false":""}`} onClick={()=>setQ(p.id,x=>({...x,tfRespuesta:false}))}>❌ Falso</button>
                </div>
              </div>
            )}

            {p.tipo==="abierta" && (
              <div>
                <div className="field">
                  <label>Respuesta esperada (referencia para calificación)</label>
                  <textarea placeholder="Escribe la respuesta modelo o criterios de evaluación…" value={p.abiertaRespuesta} onChange={e=>setQ(p.id,x=>({...x,abiertaRespuesta:e.target.value}))} style={{minHeight:70}}/>
                </div>
              </div>
            )}

            {p.tipo==="ordenar" && (
              <div>
                <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".06em",color:"var(--txt3)",fontWeight:600,marginBottom:8}}>Elementos (en orden correcto de arriba a abajo)</div>
                {(p.opciones||[]).map((op,i)=>(
                  <div key={i} className="option-row">
                    <span style={{fontSize:12,color:"var(--txt3)",fontFamily:"'DM Mono',monospace",width:20,flexShrink:0}}>{i+1}.</span>
                    <input style={{flex:1,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--txt)",background:"#060914",border:"1px solid var(--border)",borderRadius:9,padding:"8px 12px",outline:"none",transition:"border-color .2s"}} placeholder={`Elemento ${i+1}`} value={op} onChange={e=>{const arr=[...p.opciones];arr[i]=e.target.value;setQ(p.id,x=>({...x,opciones:arr}))}} onFocus={e=>e.target.style.borderColor="var(--indigo)"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
                    {p.opciones.length>2 && <button className="btn btn-danger btn-icon btn-sm" onClick={()=>{const arr=p.opciones.filter((_,j)=>j!==i);setQ(p.id,x=>({...x,opciones:arr}))}}>✕</button>}
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" style={{marginTop:6}} onClick={()=>setQ(p.id,x=>({...x,opciones:[...x.opciones,""]}))}>+ Agregar elemento</button>
              </div>
            )}

            {/* Puntaje y explicación */}
            <div style={{display:"flex",gap:10,marginTop:12,flexWrap:"wrap",alignItems:"flex-end"}}>
              <div className="field" style={{width:120,marginBottom:0}}>
                <label>Puntaje</label>
                <input type="number" min="0" value={p.puntaje} onChange={e=>setQ(p.id,x=>({...x,puntaje:e.target.value}))}/>
              </div>
              <div className="field" style={{flex:1,marginBottom:0}}>
                <label>Explicación de respuesta (opcional)</label>
                <input placeholder="Se mostrará al alumno después del quiz…" value={p.explicacion} onChange={e=>setQ(p.id,x=>({...x,explicacion:e.target.value}))}/>
              </div>
            </div>

            {/* Acciones pregunta */}
            <div style={{display:"flex",gap:8,marginTop:12,justifyContent:"flex-end"}}>
              <button className="btn btn-ghost btn-sm" onClick={()=>dupeP(p.id)}>⧉ Duplicar</button>
              {quiz.preguntas.length>1 && <button className="btn btn-danger btn-sm" onClick={()=>delPregunta(p.id)}>🗑️ Eliminar pregunta</button>}
            </div>
          </div>
        ))}
        <button className="btn btn-ghost" style={{width:"100%",marginTop:4}} onClick={addPregunta}>+ Agregar pregunta</button>
      </div>
    </div>
  );
}

function TabQuiz({ showToast }) {
  const [quizzes, setQuizzes] = useState([
    { id:uid(), titulo:"Examen Parcial 1 — HTML & CSS", clase:"Programación Web", preguntas:5, publicado:true, fecha:new Date().toISOString() },
    { id:uid(), titulo:"Repaso — Álgebra Relacional", clase:"Base de Datos", preguntas:8, publicado:false, fecha:new Date(Date.now()-86400000).toISOString() },
  ]);
  const [voiceModal, setVoiceModal] = useState(false);
  const [building, setBuilding] = useState(false);
  const [draft, setDraft]       = useState(INIT_QUIZ);
  const [editId, setEditId]     = useState(null);

  const totalPts = draft.preguntas.reduce((s,p)=>s+Number(p.puntaje||0),0);

  const publicar = () => {
    if (!draft.titulo.trim()) { showToast("Escribe un título para el quiz","err"); return; }
    if (draft.preguntas.some(p=>!p.enunciado.trim())) { showToast("Hay preguntas sin enunciado","err"); return; }
    if (editId) {
      setQuizzes(prev=>prev.map(q=>q.id===editId?{...q,titulo:draft.titulo,clase:draft.clase,preguntas:draft.preguntas.length,publicado:true}:q));
      showToast("Quiz actualizado y publicado");
    } else {
      setQuizzes(prev=>[{id:uid(),titulo:draft.titulo,clase:draft.clase,preguntas:draft.preguntas.length,publicado:true,fecha:new Date().toISOString()},...prev]);
      showToast("Quiz publicado");
    }
    setBuilding(false); setDraft(INIT_QUIZ); setEditId(null);
  };

  const guardarBorrador = () => {
    if (!draft.titulo.trim()) { showToast("Escribe un título primero","err"); return; }
    setQuizzes(prev=>[{id:uid(),titulo:draft.titulo,clase:draft.clase,preguntas:draft.preguntas.length,publicado:false,fecha:new Date().toISOString()},...prev]);
    showToast("Guardado como borrador","info");
    setBuilding(false); setDraft(INIT_QUIZ); setEditId(null);
  };

  if (building) return (
    <div>
      <div className="sec-head">
        <div>
          <div className="eyebrow">Quiz Builder</div>
          <div className="sec-title">{editId?"Editar quiz":"Crear nuevo quiz"}</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:12,color:"var(--txt3)",alignSelf:"center"}}>{draft.preguntas.length} pregunta{draft.preguntas.length!==1?"s":""} · {totalPts} pts totales</span>
          <button className="btn btn-ghost" onClick={guardarBorrador}>💾 Borrador</button>
          <button className="btn btn-primary" onClick={publicar}>🚀 Publicar</button>
          <button className="btn btn-ghost" onClick={()=>{setBuilding(false);setDraft(INIT_QUIZ);setEditId(null)}}>← Cancelar</button>
        </div>
      </div>
      <QuizBuilder quiz={draft} setQuiz={setDraft}/>
    </div>
  );

 return (
    <div className="stack">
      <div className="sec-head">
        <div><div className="eyebrow">Evaluaciones</div><div className="sec-title">Mis quizzes</div></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button className="btn btn-gold" onClick={()=>setVoiceModal(true)}
            style={{display:"flex",alignItems:"center",gap:7}}>
            🎙️ Crear con voz
          </button>
          <button className="btn btn-ghost" onClick={()=>{setDraft(INIT_QUIZ);setEditId(null);setBuilding(true)}}>
            ✏️ Manual
          </button>
        </div>
      </div>
      {quizzes.length===0 && <div className="empty"><span className="empty-icon">🧠</span>No has creado ningún quiz aún.</div>}
      {quizzes.map(q=>(
        <div key={q.id} className="item">
          <div className="item-meta">
            <span>🏫 {q.clase}</span>
            <span>❓ {q.preguntas} preguntas</span>
            <span className={q.publicado?"badge-ok":"badge-warn"}>{q.publicado?"Publicado":"Borrador"}</span>
            {q._fromVoice && (
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,background:"rgba(240,192,96,.14)",border:"1px solid rgba(240,192,96,.3)",color:"var(--gold)",padding:"2px 8px",borderRadius:999,display:"inline-flex",alignItems:"center",gap:4}}>🎙️ IA</span>
            )}
            <span>{fmt(q.fecha)}</span>
          </div>
          <div className="item-title">{q.titulo}</div>
          <div style={{display:"flex",gap:8,marginTop:10}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>{showToast("Ver resultados — conecta con tu backend","info")}}>📊 Resultados</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>{setDraft({...INIT_QUIZ,titulo:q.titulo,clase:q.clase});setEditId(q.id);setBuilding(true)}}>✏️ Editar</button>
            <button className="btn btn-danger btn-sm" onClick={()=>{setQuizzes(p=>p.filter(x=>x.id!==q.id));showToast("Quiz eliminado","info")}}>🗑️</button>
          </div>
        </div>
      ))}
      {voiceModal && (
        <VoiceQuizCreator
          onQuizCreado={(quizGenerado) => {
            setQuizzes(prev => [{
              id: uid(),
              titulo: quizGenerado.titulo,
              clase: quizGenerado.clase,
              preguntas: quizGenerado.preguntas.length,
              publicado: true,
              fecha: new Date().toISOString(),
              _fromVoice: true,
            }, ...prev]);
          }}
          onClose={()=>setVoiceModal(false)}
          showToast={showToast}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MÓDULO: EN VIVO
═══════════════════════════════════════════════════════════════ */
function TabEnVivo({ showToast }) {
  const [activityId] = useState(() => crypto.randomUUID().slice(0,8));
  const [enCurso, setEnCurso] = useState(false);
  const [log, setLog]         = useState([]);
  const [alumnos, setAlumnos] = useState(0);

  const push = (msg) => setLog(p=>[{ts:Date.now(),...msg},...p].slice(0,200));

  // Simulación de eventos en vivo
  useEffect(() => {
    if (!enCurso) return;
    const names = ["Ana Torres","Carlos Ruiz","Sofía Mendez","Luis Pérez","María García"];
    const scores = [8,10,7,9,6];
    let i=0;
    const t = setInterval(()=>{
      if(i<names.length){
        push({type:"joined",alumno:names[i]});
        setAlumnos(a=>a+1);
        setTimeout(()=>{push({type:"finished",alumno:names[i],score:scores[i],total:10})},2000+Math.random()*3000);
        i++;
      } else clearInterval(t);
    }, 1200);
    return ()=>clearInterval(t);
  },[enCurso]);

  const start = ()=>{ setEnCurso(true); setLog([]); setAlumnos(0); push({type:"started",activityId}); showToast("Actividad en vivo iniciada"); };
  const stop  = ()=>{ setEnCurso(false); push({type:"stopped",activityId}); showToast("Actividad detenida","info"); };

  const typeStyle = { joined:"", finished:"state-ok", left:"state-danger", started:"", stopped:"" };
  const typeLabel = { joined:"Se unió", finished:"Entrega", left:"Abandonó", started:"🚀 Iniciada", stopped:"🛑 Detenida" };

  return (
    <div className="stack">
      <div className="sec-head">
        <div><div className="eyebrow">Tiempo real</div><div className="sec-title">Actividad en vivo</div></div>
        {enCurso
          ? <button className="btn btn-danger" onClick={stop}>⏹ Detener actividad</button>
          : <button className="btn btn-primary" onClick={start}>▶️ Iniciar actividad</button>
        }
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="eyebrow">ID de actividad</div>
          <div style={{display:"flex",gap:10,alignItems:"center",marginTop:8,flexWrap:"wrap"}}>
            <code style={{fontFamily:"'DM Mono',monospace",fontSize:20,fontWeight:700,color:"var(--indigo-lt)",letterSpacing:".1em"}}>{activityId}</code>
            <button className="btn btn-ghost btn-sm" onClick={()=>{navigator.clipboard?.writeText(activityId);showToast("ID copiado","info")}}>📋 Copiar</button>
          </div>
          <div style={{fontSize:12,color:"var(--txt3)",marginTop:8}}>Comparte este ID con tus alumnos para que se unan.</div>
          <hr className="divider"/>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            <div><div style={{fontSize:22,fontWeight:700}}>{alumnos}</div><div style={{fontSize:11,color:"var(--txt3)",textTransform:"uppercase",letterSpacing:".06em"}}>Conectados</div></div>
            <div><div style={{fontSize:22,fontWeight:700}}>{log.filter(e=>e.type==="finished").length}</div><div style={{fontSize:11,color:"var(--txt3)",textTransform:"uppercase",letterSpacing:".06em"}}>Entregaron</div></div>
            <div><div style={{fontSize:22,fontWeight:700}}>{log.filter(e=>e.type==="left").length}</div><div style={{fontSize:11,color:"var(--txt3)",textTransform:"uppercase",letterSpacing:".06em"}}>Abandonaron</div></div>
          </div>
          {enCurso && <div style={{display:"flex",alignItems:"center",gap:8,marginTop:14,padding:"8px 12px",background:"var(--ok-dim)",border:"1px solid rgba(52,211,153,.25)",borderRadius:10}}><div className="live-dot"/><span style={{fontSize:13,fontWeight:600,color:"var(--ok)"}}>Actividad en curso</span></div>}
        </div>
        <div className="card">
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            {enCurso&&<div className="live-dot"/>}
            <div className="eyebrow" style={{marginBottom:0}}>Feed de eventos</div>
          </div>
          <div className="feed">
            {log.length===0 && <div style={{fontSize:13,color:"var(--txt3)",textAlign:"center",padding:"20px 0"}}>Sin eventos aún. Inicia una actividad.</div>}
            {log.map((e,i)=>(
              <div key={i} className={`feed-item ${typeStyle[e.type]||""}`}>
                <div className="item-meta">
                  <span style={{fontWeight:600}}>{typeLabel[e.type]||e.type}</span>
                  <span>{new Date(e.ts).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span>
                </div>
                <div style={{fontSize:13,color:"var(--txt2)"}}>
                  {e.type==="joined"   && <>{e.alumno} se unió a la actividad.</>}
                  {e.type==="finished" && <>{e.alumno} terminó — <b style={{color:"var(--ok)"}}>{e.score}/{e.total} pts</b></>}
                  {e.type==="left"     && <>{e.alumno} abandonó.</>}
                  {e.type==="started"  && <>ID <b>{e.activityId}</b> en curso.</>}
                  {e.type==="stopped"  && <>Actividad detenida.</>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MÓDULO: MODERACIÓN
═══════════════════════════════════════════════════════════════ */
function TabModeracion({ mensajes: initMsgs, usuarios, loading, showToast }) {
  const [msgs, setMsgs]           = useState(initMsgs);
  const [q, setQ]                 = useState("");
  const [autor, setAutor]         = useState("");
  const [sel, setSel]             = useState(new Set());
  const [confirmLimpiar, setConfirmLimpiar] = useState(false); // modal limpiar todo
  const [limpiarScope, setLimpiarScope]     = useState("hoy"); // "hoy" | "todo"

  useEffect(()=>{ setMsgs(initMsgs); },[initMsgs]);

  const todayStr = new Date().toDateString();
  const msgsHoy  = msgs.filter(m=>new Date(m.fecha).toDateString()===todayStr);

  const autores = useMemo(()=>{
    const s = new Set(msgs.map(m=>m.autor||"Anónimo"));
    return ["",...Array.from(s).sort()];
  },[msgs]);

  const filtered = useMemo(()=>{
    const ql = q.trim().toLowerCase();
    return msgs.filter(m=>{
      const okA = !autor||(m.autor||"Anónimo")===autor;
      const okT = !ql||(m.texto||"").toLowerCase().includes(ql)||(m.autor||"").toLowerCase().includes(ql);
      return okA&&okT;
    });
  },[msgs,q,autor]);

  const del = (id) => { setMsgs(p=>p.filter(m=>(m._id||m.id)!==id)); setSel(p=>{p.delete(id);return new Set(p)}); showToast("Mensaje eliminado","info"); };
  const delSel = () => { setMsgs(p=>p.filter(m=>!sel.has(m._id||m.id))); showToast(`${sel.size} mensajes eliminados`,"info"); setSel(new Set()); };
  const toggleSel = (id) => setSel(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n});
  const exportCSV = () => {
    const rows = filtered.map(m=>({ fecha:new Date(m.fecha).toISOString(), autor:m.autor||"Anónimo", texto:(m.texto||"").replace(/\n/g," "), id:(m._id||m.id||"") }));
    const head = ["fecha","autor","texto","id"];
    const csv  = [head.join(","),...rows.map(r=>head.map(k=>`"${String(r[k]??"").replaceAll('"','""')}"`).join(","))].join("\n");
    const a = Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([csv],{type:"text/csv"})),download:`mensajes_${new Date().toISOString().slice(0,10)}.csv`});
    document.body.appendChild(a); a.click(); a.remove();
    showToast("CSV exportado");
  };

  /* ── Limpiar chat ── */
  const ejecutarLimpiar = () => {
    if (limpiarScope==="hoy") {
      const antes = msgs.length;
      setMsgs(p=>p.filter(m=>new Date(m.fecha).toDateString()!==todayStr));
      showToast(`Chat de hoy limpiado (${msgsHoy.length} mensajes eliminados)`);
    } else {
      setMsgs([]);
      showToast("Chat completamente limpiado","info");
    }
    setSel(new Set());
    setConfirmLimpiar(false);
  };

  return (
    <div className="stack">
      <div className="sec-head">
        <div><div className="eyebrow">Control</div><div className="sec-title">Moderación de mensajes</div></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {sel.size>0 && <button className="btn btn-danger btn-sm" onClick={delSel}>🗑️ Eliminar {sel.size} seleccionados</button>}
          <button className="btn btn-ghost btn-sm" onClick={exportCSV} disabled={!filtered.length}>📥 CSV ({filtered.length})</button>
          <button className="btn btn-danger btn-sm" disabled={msgs.length===0} onClick={()=>setConfirmLimpiar(true)}
            style={{display:"flex",alignItems:"center",gap:6}}>
            🧹 Limpiar chat
          </button>
        </div>
      </div>

      {/* Banner informativo cuando hay muchos mensajes */}
      {msgs.length > 20 && (
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"rgba(251,191,36,.08)",border:"1px solid rgba(251,191,36,.22)",borderRadius:12}}>
          <span style={{fontSize:20}}>⚠️</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--warn)"}}>El chat tiene {msgs.length} mensajes acumulados</div>
            <div style={{fontSize:12,color:"var(--txt3)"}}>Considera limpiar los mensajes de hoy ({msgsHoy.length}) al terminar la clase.</div>
          </div>
          <button className="btn btn-sm" style={{background:"rgba(251,191,36,.15)",border:"1px solid rgba(251,191,36,.3)",color:"var(--warn)"}}
            onClick={()=>{ setLimpiarScope("hoy"); setConfirmLimpiar(true); }}>
            Limpiar hoy
          </button>
        </div>
      )}

      {/* Modal confirmación limpiar */}
      {confirmLimpiar && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setConfirmLimpiar(false)}>
          <div className="modal" style={{maxWidth:440}}>
            <div style={{textAlign:"center",padding:"8px 0 16px"}}>
              <div style={{fontSize:48,marginBottom:14}}>🧹</div>
              <h2 style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:22,marginBottom:10}}>Limpiar chat</h2>
              <p style={{color:"var(--txt2)",fontSize:14,marginBottom:20,lineHeight:1.6}}>Selecciona qué mensajes deseas eliminar. Esta acción <b>no se puede deshacer</b>.</p>

              {/* Selector de alcance */}
              <div style={{display:"flex",gap:10,marginBottom:22}}>
                <button onClick={()=>setLimpiarScope("hoy")}
                  style={{flex:1,padding:"14px 10px",borderRadius:12,border:`2px solid ${limpiarScope==="hoy"?"var(--warn)":"var(--border)"}`,background:limpiarScope==="hoy"?"rgba(251,191,36,.1)":"var(--surface)",color:limpiarScope==="hoy"?"var(--warn)":"var(--txt2)",cursor:"pointer",transition:"all .2s",fontFamily:"'DM Sans',sans-serif"}}>
                  <div style={{fontSize:22,marginBottom:6}}>🌅</div>
                  <div style={{fontWeight:700,fontSize:14}}>Solo hoy</div>
                  <div style={{fontSize:11,marginTop:3,opacity:.8}}>{msgsHoy.length} mensajes</div>
                </button>
                <button onClick={()=>setLimpiarScope("todo")}
                  style={{flex:1,padding:"14px 10px",borderRadius:12,border:`2px solid ${limpiarScope==="todo"?"var(--danger)":"var(--border)"}`,background:limpiarScope==="todo"?"rgba(248,113,113,.1)":"var(--surface)",color:limpiarScope==="todo"?"var(--danger)":"var(--txt2)",cursor:"pointer",transition:"all .2s",fontFamily:"'DM Sans',sans-serif"}}>
                  <div style={{fontSize:22,marginBottom:6}}>🗑️</div>
                  <div style={{fontWeight:700,fontSize:14}}>Todo el chat</div>
                  <div style={{fontSize:11,marginTop:3,opacity:.8}}>{msgs.length} mensajes</div>
                </button>
              </div>

              <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                <button className={`btn ${limpiarScope==="todo"?"btn-danger":"btn-gold"}`} onClick={ejecutarLimpiar}>
                  {limpiarScope==="hoy"?"🧹 Limpiar mensajes de hoy":"🗑️ Limpiar todo el chat"}
                </button>
                <button className="btn btn-ghost" onClick={()=>setConfirmLimpiar(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <input style={{flex:"1 1 200px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--txt)",background:"#060914",border:"1px solid var(--border)",borderRadius:10,padding:"9px 13px",outline:"none"}} placeholder="Buscar en mensajes…" value={q} onChange={e=>setQ(e.target.value)}/>
        <select style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--txt)",background:"#060914",border:"1px solid var(--border)",borderRadius:10,padding:"9px 13px",outline:"none",cursor:"pointer"}} value={autor} onChange={e=>setAutor(e.target.value)}>
          {autores.map(a=><option key={a||"_"} value={a}>{a||"Todos los autores"}</option>)}
        </select>
      </div>
      {/* Usuarios */}
      <div className="card">
        <div className="eyebrow">Alumnos registrados ({usuarios.length})</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
          {usuarios.map(u=>(
            <div key={u._id} style={{display:"flex",alignItems:"center",gap:8,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"7px 12px"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,var(--indigo),#4338ca)",display:"grid",placeItems:"center",fontSize:11,fontWeight:700}}>{(u.nombre||"?")[0]}</div>
              <div><div style={{fontSize:13,fontWeight:500}}>{u.nombre}</div><div style={{fontSize:10,color:"var(--txt3)"}}>{u.rol}</div></div>
            </div>
          ))}
          {loading && <div style={{color:"var(--txt3)",fontSize:13}}>Cargando…</div>}
        </div>
      </div>
      {/* Mensajes */}
      {filtered.length===0 && !loading && <div className="empty"><span className="empty-icon">💬</span>Sin mensajes que coincidan.</div>}
      {loading && <div style={{color:"var(--txt3)",fontSize:14,padding:16}}>Cargando mensajes…</div>}
      {filtered.map(m=>{
        const id = m._id||m.id;
        const isSel = sel.has(id);
        return (
          <div key={id} className="item" style={isSel?{borderColor:"rgba(248,113,113,.3)",background:"rgba(248,113,113,.04)"}:{}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <input type="checkbox" checked={isSel} onChange={()=>toggleSel(id)} style={{marginTop:3,accentColor:"var(--indigo)",flexShrink:0}}/>
              <div style={{flex:1}}>
                <div className="item-meta"><b>{m.autor||"Anónimo"}</b><span>·</span><span>{fmtT(m.fecha)}</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--txt3)"}}>#{(id||"").toString().slice(-6)}</span></div>
                <div style={{fontSize:14,color:"var(--txt2)"}}>{m.texto}</div>
              </div>
              <button className="btn btn-danger btn-icon btn-sm" onClick={()=>del(id)} title="Eliminar">🗑️</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL PRINCIPAL
═══════════════════════════════════════════════════════════════ */
const TABS = [
  { id:"dashboard",   label:"Tablero",     icon:"📊" },
  { id:"anuncios",    label:"Anuncios",     icon:"📢" },
  { id:"tareas",      label:"Tareas",       icon:"📁" },
  { id:"quiz",        label:"Quiz",         icon:"🧠" },
  { id:"actividades", label:"Actividades",  icon:"🎮" },
  { id:"live",        label:"En vivo",      icon:"⚡" },
  { id:"moderacion",  label:"Moderación",   icon:"🛡️" },
  { id:"cursos", label:"Cursos", icon:"🎓" },
];

export default function ProfessorPanel({ onClose }) {
  const [tab,       setTab]       = useState("dashboard");
  const [loading,   setLoading]   = useState(true);
  const [stats,     setStats]     = useState({ usuarios:0, mensajesHoy:0, totalMensajes:0 });
  const [usuarios,  setUsuarios]  = useState([]);
  const [mensajes,  setMensajes]  = useState([]);
  const [toastEl,   showToast]    = useToast();

  useEffect(()=>{
    let alive=true;
    (async()=>{
      setLoading(true);
      try {
        const [s,us,ms] = await Promise.all([
          API.get("/api/stats"),
          API.get("/api/usuarios"),
          API.get("/api/mensajes?limit=200"),
        ]);
        if(!alive) return;
        setStats({ usuarios:s?.usuarios??us?.length??0, mensajesHoy:s?.mensajesHoy??0, totalMensajes:s?.totalMensajes??ms?.length??0 });
        setUsuarios(us||[]);
        setMensajes(ms||[]);
      } finally { if(alive) setLoading(false); }
    })();
    return ()=>{alive=false};
  },[]);

  return (
    <div className="prof-panel">
      {/* Topbar */}
      <div className="pp-top">
        <div className="pp-brand">EduTec</div>
        <span className="pp-top-badge">Panel del profesor</span>
        <div className="pp-spacer"/>
        {onClose && <button className="pp-back" onClick={onClose}>← Volver</button>}
      </div>

      {/* Nav */}
      <div className="pp-nav">
        {TABS.map(t=>(
          <button key={t.id} className={`pp-tab${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>
            <span className="pp-tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="pp-body">
        {tab==="dashboard"   && <TabDashboard   stats={stats} usuarios={usuarios} mensajes={mensajes} loading={loading} showToast={showToast}/>}
        {tab==="anuncios"    && <TabAnuncios    showToast={showToast}/>}
        {tab==="tareas"      && <TabTareas      showToast={showToast}/>}
        {tab==="quiz"        && <TabQuiz        showToast={showToast}/>}
        {tab==="actividades" && <TabActividades showToast={showToast}/>}
        {tab==="live"        && <TabEnVivo      showToast={showToast}/>}
        {tab==="moderacion"  && <TabModeracion  mensajes={mensajes} usuarios={usuarios} loading={loading} showToast={showToast}/>}
        {tab==="cursos" && <CoursesPanel mode="professor" showToast={showToast}/>}
      </div>

      {toastEl}
    </div>
  );
}
