// client/src/ActivityRunner.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import API from "./api.js";

/* ─── Estilos inlineados (mismo tema EduTec) ──────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');

.ar-root{
  min-height:100vh;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:
    radial-gradient(ellipse 70vw 50vh at 15% -5%,rgba(99,102,241,.08),transparent),
    radial-gradient(ellipse 50vw 40vh at 90% 110%,rgba(240,192,96,.05),transparent),
    #080c18;
  font-family:'DM Sans',sans-serif;
  color:#e8eeff;
  -webkit-font-smoothing:antialiased;
  padding:24px;
  user-select:none;
}

/* Topbar del runner */
.ar-topbar{
  width:100%;max-width:740px;
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  margin-bottom:20px;flex-wrap:wrap;
}
.ar-brand{
  font-family:'Instrument Serif',serif;font-style:italic;font-size:18px;
  background:linear-gradient(120deg,#c7d2fe,#f0c060);
  -webkit-background-clip:text;background-clip:text;color:transparent;
}
.ar-info{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.ar-chip{
  font-family:'DM Mono',monospace;font-size:10px;font-weight:500;
  letter-spacing:.08em;text-transform:uppercase;
  padding:3px 10px;border-radius:999px;
  border:1px solid rgba(99,102,241,.28);background:rgba(99,102,241,.1);color:#818cf8;
}
.ar-chip.ok{border-color:rgba(52,211,153,.3);background:rgba(52,211,153,.1);color:#34d399}
.ar-chip.warn{border-color:rgba(251,191,36,.3);background:rgba(251,191,36,.1);color:#fbbf24}
.ar-chip.danger{border-color:rgba(248,113,113,.3);background:rgba(248,113,113,.1);color:#f87171}

/* Card principal */
.ar-card{
  width:100%;max-width:740px;
  background:linear-gradient(160deg,rgba(255,255,255,.035) 0%,transparent 50%),
             linear-gradient(180deg,#0d1426,#060914);
  border:1px solid rgba(99,102,241,.18);
  border-radius:22px;padding:32px;
  box-shadow:0 16px 48px rgba(0,0,0,.6),0 1px 0 rgba(255,255,255,.05) inset;
  position:relative;overflow:hidden;
}
.ar-card::before{
  content:'';position:absolute;top:0;left:24px;right:24px;height:1px;
  background:linear-gradient(90deg,transparent,rgba(99,102,241,.5),rgba(240,192,96,.3),transparent);
}

/* Barra de progreso superior */
.ar-progress-bar{
  width:100%;height:4px;background:rgba(255,255,255,.06);border-radius:999px;
  overflow:hidden;margin-bottom:28px;
}
.ar-progress-fill{
  height:100%;border-radius:999px;
  background:linear-gradient(90deg,#6366f1,#f0c060);
  transition:width .5s cubic-bezier(.16,1,.3,1);
}

/* Cabecera pregunta */
.ar-q-header{
  display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap;
}
.ar-q-num{
  font-family:'DM Mono',monospace;font-size:11px;color:#4e6090;
  letter-spacing:.1em;text-transform:uppercase;
}
.ar-type-badge{
  font-family:'DM Mono',monospace;font-size:10px;font-weight:500;
  padding:2px 9px;border-radius:999px;border:1px solid;
}

/* Enunciado */
.ar-enunciado{
  font-size:clamp(16px,2.2vw,20px);font-weight:600;line-height:1.45;
  margin-bottom:24px;color:#e8eeff;
}

/* Opciones múltiple */
.ar-options{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
.ar-option{
  display:flex;align-items:center;gap:14px;
  padding:14px 18px;border-radius:14px;
  border:1px solid rgba(99,102,241,.16);
  background:linear-gradient(160deg,#111c38,#0d1426);
  cursor:pointer;
  transition:border-color .18s,background .18s,transform .12s;
  font-size:14px;color:#8fa0c8;
}
.ar-option:hover{
  border-color:rgba(99,102,241,.35);color:#e8eeff;transform:translateX(3px);
}
.ar-option.selected{
  border-color:#6366f1;
  background:linear-gradient(160deg,rgba(99,102,241,.16),rgba(67,56,202,.08));
  color:#e8eeff;
  box-shadow:0 0 0 3px rgba(99,102,241,.12);
}
.ar-option.correct{
  border-color:#34d399;background:rgba(52,211,153,.1);color:#34d399;
  box-shadow:0 0 0 3px rgba(52,211,153,.1);
}
.ar-option.wrong{
  border-color:#f87171;background:rgba(248,113,113,.08);color:#f87171;
}
.ar-option-letter{
  width:28px;height:28px;border-radius:8px;
  display:grid;place-items:center;flex-shrink:0;
  font-family:'DM Mono',monospace;font-size:12px;font-weight:700;
  background:rgba(99,102,241,.15);color:#818cf8;
  transition:background .18s,color .18s;
}
.ar-option.selected .ar-option-letter{background:#6366f1;color:#fff}
.ar-option.correct  .ar-option-letter{background:#34d399;color:#080c18}
.ar-option.wrong    .ar-option-letter{background:#f87171;color:#fff}

/* V/F */
.ar-tf-row{display:flex;gap:14px;margin-bottom:24px}
.ar-tf-btn{
  flex:1;padding:22px 10px;border-radius:16px;border:2px solid rgba(99,102,241,.16);
  background:linear-gradient(160deg,#111c38,#0d1426);
  cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif;
  display:flex;flex-direction:column;align-items:center;gap:8px;
}
.ar-tf-btn:hover{transform:translateY(-2px)}
.ar-tf-btn .tf-icon{font-size:36px}
.ar-tf-btn .tf-label{font-size:15px;font-weight:700;}
.ar-tf-btn.sel-true{ border-color:#34d399;background:rgba(52,211,153,.1); color:#34d399; box-shadow:0 0 0 4px rgba(52,211,153,.1)}
.ar-tf-btn.sel-false{border-color:#f87171;background:rgba(248,113,113,.08);color:#f87171;box-shadow:0 0 0 4px rgba(248,113,113,.08)}
.ar-tf-btn.res-correct{border-color:#34d399;background:rgba(52,211,153,.12);color:#34d399}
.ar-tf-btn.res-wrong  {border-color:#f87171;background:rgba(248,113,113,.08);color:#f87171;opacity:.6}

/* Respuesta abierta */
.ar-open-area{
  width:100%;font-family:'DM Sans',sans-serif;font-size:14px;
  color:#e8eeff;background:#060914;
  border:1px solid rgba(99,102,241,.18);border-radius:14px;
  padding:14px 16px;outline:none;resize:vertical;min-height:120px;
  transition:border-color .2s,box-shadow .2s;caret-color:#818cf8;
  margin-bottom:24px;
}
.ar-open-area:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.18)}
.ar-open-area::placeholder{color:#4e6090}

/* Ordenar */
.ar-sort-list{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.ar-sort-item{
  display:flex;align-items:center;gap:12px;
  padding:12px 16px;border-radius:12px;
  border:1px solid rgba(99,102,241,.16);background:linear-gradient(160deg,#111c38,#0d1426);
  cursor:grab;transition:border-color .18s,box-shadow .18s,transform .12s;
  font-size:14px;color:#8fa0c8;
}
.ar-sort-item:active{cursor:grabbing;transform:scale(1.01)}
.ar-sort-item.dragging{opacity:.5;border-color:#6366f1}
.ar-sort-handle{font-size:16px;color:#4e6090;flex-shrink:0;cursor:grab}
.ar-sort-num{
  width:26px;height:26px;border-radius:7px;display:grid;place-items:center;
  font-family:'DM Mono',monospace;font-size:11px;font-weight:700;flex-shrink:0;
  background:rgba(99,102,241,.15);color:#818cf8;
}

/* Explicación post-respuesta */
.ar-explanation{
  padding:14px 16px;border-radius:12px;margin-bottom:20px;font-size:13px;line-height:1.6;
  display:flex;gap:10px;align-items:flex-start;
}
.ar-explanation.ok {background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.25);color:#34d399}
.ar-explanation.err{background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.25);color:#f87171}

/* Barra de tiempo */
.ar-timer{
  display:flex;align-items:center;gap:10px;margin-bottom:20px;
}
.ar-timer-bar{flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:999px;overflow:hidden}
.ar-timer-fill{height:100%;border-radius:999px;transition:width 1s linear,background .5s}
.ar-timer-num{
  font-family:'DM Mono',monospace;font-size:13px;font-weight:700;
  min-width:40px;text-align:right;
}

/* Navegación */
.ar-nav{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.ar-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
  font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;
  border:none;border-radius:11px;padding:11px 20px;cursor:pointer;
  transition:transform .12s,box-shadow .2s,filter .2s;
  position:relative;overflow:hidden;
}
.ar-btn::after{content:'';position:absolute;inset:0;background:radial-gradient(circle,rgba(255,255,255,.12),transparent 70%);opacity:0;transition:opacity .1s}
.ar-btn:active::after{opacity:1}
.ar-btn:active{transform:translateY(1px) scale(.985)!important}
.ar-btn:disabled{opacity:.35;cursor:not-allowed;pointer-events:none}
.ar-btn-primary{background:linear-gradient(160deg,#6366f1,#4338ca);color:#fff;box-shadow:0 6px 20px rgba(99,102,241,.28),inset 0 1px 0 rgba(255,255,255,.15)}
.ar-btn-primary:hover{transform:translateY(-2px);filter:brightness(1.08)}
.ar-btn-ghost{background:rgba(13,20,38,.6);color:#8fa0c8;border:1px solid rgba(99,102,241,.18)}
.ar-btn-ghost:hover{border-color:rgba(99,102,241,.32);color:#e8eeff;transform:translateY(-1px)}
.ar-btn-gold{background:linear-gradient(160deg,#f0c060,#d4943a);color:#080c18;font-weight:700}
.ar-btn-gold:hover{transform:translateY(-2px);filter:brightness(1.06)}

/* Mapa de preguntas */
.ar-qmap{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:28px}
.ar-qmap-dot{
  width:30px;height:30px;border-radius:8px;display:grid;place-items:center;
  font-family:'DM Mono',monospace;font-size:11px;font-weight:700;cursor:pointer;
  border:1px solid rgba(99,102,241,.18);background:#0d1426;color:#4e6090;
  transition:all .18s;
}
.ar-qmap-dot.answered{background:rgba(99,102,241,.2);border-color:#6366f1;color:#818cf8}
.ar-qmap-dot.current{background:#6366f1;border-color:#6366f1;color:#fff;box-shadow:0 0 0 3px rgba(99,102,241,.3)}
.ar-qmap-dot.q-ok{background:rgba(52,211,153,.2);border-color:#34d399;color:#34d399}
.ar-qmap-dot.q-err{background:rgba(248,113,113,.15);border-color:#f87171;color:#f87171}

/* Pantalla de resultado final */
.ar-result{text-align:center;padding:16px 0}
.ar-result-score{
  font-size:64px;font-weight:900;line-height:1;
  font-variant-numeric:tabular-nums;margin:16px 0 8px;
}
.ar-result-label{font-size:14px;color:#4e6090;text-transform:uppercase;letter-spacing:.1em;font-family:'DM Mono',monospace}
.ar-result-title{font-family:'Instrument Serif',serif;font-style:italic;font-size:26px;margin:12px 0 6px}
.ar-result-sub{font-size:14px;color:#8fa0c8;font-weight:300;margin-bottom:24px}
.ar-stat-row{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:16px 0 24px}
.ar-stat-box{padding:14px 20px;border-radius:14px;border:1px solid rgba(99,102,241,.18);background:#0d1426;text-align:center}
.ar-stat-box-val{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
.ar-stat-box-lbl{font-size:10px;color:#4e6090;text-transform:uppercase;letter-spacing:.08em;margin-top:3px;font-family:'DM Mono',monospace}

/* Pantalla bloqueada */
.ar-blocked{text-align:center;padding:16px 0}
.ar-blocked-icon{font-size:64px;margin-bottom:12px}

/* Warning banner */
.ar-warning{
  position:fixed;top:0;left:0;right:0;z-index:999;
  padding:12px 20px;
  background:linear-gradient(90deg,rgba(248,113,113,.2),rgba(239,68,68,.15));
  border-bottom:1px solid rgba(248,113,113,.4);
  display:flex;align-items:center;gap:10px;justify-content:center;
  font-size:13px;font-weight:600;color:#f87171;
  animation:slideDown .3s cubic-bezier(.16,1,.3,1) both;
}
@keyframes slideDown{from{transform:translateY(-100%)}to{transform:none}}

/* Indicadores anti-trampa */
.ar-shield{
  display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;padding:12px 14px;
  background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.18);border-radius:12px;
}
.ar-shield-item{font-size:12px;color:#4e6090;display:flex;align-items:center;gap:5px}
.ar-shield-item.active{color:#34d399}

@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

/* ─── Inject styles ────────────────────────────────────────────── */
if (!document.getElementById("ar-styles")) {
  const s = document.createElement("style");
  s.id = "ar-styles";
  s.textContent = STYLES;
  document.head.appendChild(s);
}

const LETRAS = ["A","B","C","D","E","F","G","H"];

/* ─── Tipos de pregunta ────────────────────────────────────────── */
function PreguntaMultiple({ pregunta, respuesta, onElegir, revisando, mostrarExplicacion }) {
  return (
    <div className="ar-options">
      {(pregunta.opciones||[]).map((op,i)=>{
        const isSelected = respuesta === op;
        const isCorrect  = revisando && op === pregunta.correcta;
        const isWrong    = revisando && isSelected && op !== pregunta.correcta;
        return (
          <div key={i}
            className={`ar-option${isSelected&&!revisando?" selected":""}${isCorrect?" correct":""}${isWrong?" wrong":""}`}
            onClick={()=>!revisando&&onElegir(op)}>
            <div className="ar-option-letter">{LETRAS[i]}</div>
            <span>{op}</span>
            {isCorrect && <span style={{marginLeft:"auto",fontSize:16}}>✓</span>}
            {isWrong   && <span style={{marginLeft:"auto",fontSize:16}}>✕</span>}
          </div>
        );
      })}
      {revisando && mostrarExplicacion && pregunta.explicacion && (
        <div className={`ar-explanation ${respuesta===pregunta.correcta?"ok":"err"}`}>
          <span style={{fontSize:18,flexShrink:0}}>{respuesta===pregunta.correcta?"💡":"📖"}</span>
          <span>{pregunta.explicacion}</span>
        </div>
      )}
    </div>
  );
}

function PreguntaVF({ pregunta, respuesta, onElegir, revisando }) {
  const sel = respuesta; // true | false | undefined
  const correcta = pregunta.tfRespuesta ?? true;
  return (
    <div className="ar-tf-row">
      {[true, false].map(val=>{
        const isSelected = sel === val;
        const isCorrect  = revisando && val === correcta;
        const isWrong    = revisando && isSelected && val !== correcta;
        return (
          <button key={String(val)}
            className={`ar-tf-btn${isSelected&&!revisando?(val?" sel-true":" sel-false"):""}${isCorrect?" res-correct":""}${isWrong?" res-wrong":""}`}
            onClick={()=>!revisando&&onElegir(val)}>
            <span className="tf-icon">{val?"✅":"❌"}</span>
            <span className="tf-label">{val?"Verdadero":"Falso"}</span>
            {revisando && val===correcta && <span style={{fontSize:12,marginTop:2,opacity:.8}}>Respuesta correcta</span>}
          </button>
        );
      })}
    </div>
  );
}

function PreguntaAbierta({ respuesta, onElegir, revisando, mostrarExplicacion, pregunta }) {
  return (
    <div>
      <textarea className="ar-open-area"
        placeholder="Escribe tu respuesta aquí…"
        value={respuesta||""}
        onChange={e=>!revisando&&onElegir(e.target.value)}
        readOnly={revisando}
      />
      {revisando && pregunta.abiertaRespuesta && (
        <div className="ar-explanation ok" style={{marginBottom:20}}>
          <span style={{fontSize:18,flexShrink:0}}>📖</span>
          <div><b>Respuesta de referencia:</b><br/>{pregunta.abiertaRespuesta}</div>
        </div>
      )}
    </div>
  );
}

function PreguntaOrdenar({ pregunta, respuesta, onElegir, revisando }) {
  const orden = respuesta || pregunta.opciones || [];
  const dragIdx = useRef(null);
  const [lista, setLista] = useState(orden);

  useEffect(()=>{ if(!respuesta) setLista([...pregunta.opciones]); },[pregunta]);
  useEffect(()=>{ onElegir(lista); },[lista]);

  const onDragStart = (i)=>{ dragIdx.current=i; };
  const onDragOver  = (e,i)=>{ e.preventDefault(); if(dragIdx.current===null||dragIdx.current===i) return; const arr=[...lista]; const [item]=arr.splice(dragIdx.current,1); arr.splice(i,0,item); dragIdx.current=i; setLista(arr); };
  const onDragEnd   = ()=>{ dragIdx.current=null; };

  const correcta = pregunta.opciones||[];

  return (
    <div>
      <div style={{fontSize:12,color:"#4e6090",marginBottom:10,fontFamily:"'DM Mono',monospace",letterSpacing:".06em",textTransform:"uppercase"}}>Arrastra para ordenar</div>
      <div className="ar-sort-list">
        {lista.map((item,i)=>(
          <div key={item} className="ar-sort-item"
            draggable={!revisando}
            onDragStart={()=>onDragStart(i)}
            onDragOver={e=>onDragOver(e,i)}
            onDragEnd={onDragEnd}
            style={revisando?(item===correcta[i]?{borderColor:"#34d399",color:"#34d399"}:{borderColor:"#f87171",color:"#f87171"}):{}}>
            <span className="ar-sort-handle">⠿</span>
            <div className="ar-sort-num">{i+1}</div>
            <span style={{flex:1}}>{item}</span>
            {revisando && (item===correcta[i] ? <span>✓</span> : <span>✕</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Timer ────────────────────────────────────────────────────── */
function Timer({ total, left }) {
  if (!total) return null;
  const pct = (left/total)*100;
  const color = pct>50?"#34d399":pct>20?"#fbbf24":"#f87171";
  const mins = String(Math.floor(left/60)).padStart(2,"0");
  const secs = String(left%60).padStart(2,"0");
  return (
    <div className="ar-timer">
      <span style={{fontSize:16,flexShrink:0}}>⏱️</span>
      <div className="ar-timer-bar">
        <div className="ar-timer-fill" style={{width:`${pct}%`,background:color}}/>
      </div>
      <div className="ar-timer-num" style={{color}}>{mins}:{secs}</div>
    </div>
  );
}

/* ─── Componente principal ─────────────────────────────────────── */
/**
 * Props:
 *  - activityId : string
 *  - alumno     : string
 *  - quiz       : { titulo, preguntas:[{tipo,enunciado,opciones,correcta,tfRespuesta,abiertaRespuesta,explicacion,puntaje}], tiempo? }
 *  - onClose    : () => void
 *  - modoRevision: bool  (true = solo ver respuestas, sin anti-trampa)
 */
export default function ActivityRunner({ activityId, alumno, quiz, onClose, modoRevision = false }) {
  const [idx,          setIdx]          = useState(0);
  const [respuestas,   setRespuestas]   = useState({});
  const [estado,       setEstado]       = useState("running"); // running|finished|blocked|revision
  const [revisando,    setRevisando]    = useState(modoRevision);
  const [score,        setScore]        = useState(0);
  const [detalle,      setDetalle]      = useState([]); // [{puntos,max,correcto}]
  const [razonBloqueo, setRazonBloqueo] = useState("");
  const [warning,      setWarning]      = useState("");
  const [strikes,      setStrikes]      = useState(0);
  const [timeLeft,     setTimeLeft]     = useState(()=>Number(quiz?.tiempo||0)*60);
  const tiempoTotal                     = Number(quiz?.tiempo||0)*60;

  const leavingRef  = useRef(false);
  const socketRef   = useRef(null);
  const warningTimer= useRef(null);

  const preguntas = useMemo(()=>quiz?.preguntas||[],[quiz]);
  const total     = preguntas.length;

  /* ── Socket ── */
  useEffect(()=>{
    if (modoRevision) return;
    const ACT_URL = (typeof import.meta!=="undefined"&&import.meta.env?.VITE_SOCKET_URL)||"http://localhost:4000";
    const s = io(ACT_URL,{autoConnect:true,transports:["websocket"]});
    socketRef.current = s;
    s.emit("activity:join",{activityId,alumno});
    s.on("disconnect",()=>cancelarActividad("Desconexión de la sala / red"));
    return ()=>{ s.emit("activity:leave",{activityId,alumno}); s.disconnect(); };
  },[activityId,alumno,modoRevision]);

  /* ── Anti-trampa ── */
  const mostrarWarning = useCallback((msg)=>{
    setWarning(msg);
    clearTimeout(warningTimer.current);
    warningTimer.current = setTimeout(()=>setWarning(""),3500);
  },[]);

  const cancelarActividad = useCallback(async (motivo)=>{
    if (leavingRef.current||estado!=="running"||modoRevision) return;
    leavingRef.current=true;
    setRazonBloqueo(motivo||"Motivo no especificado");
    setEstado("blocked");
    try {
      await API.post?.(`/api/activities/${activityId}/cheat`,{alumno,reason:motivo||"cheat"});
      socketRef.current?.emit("activity:cheat",{activityId,alumno,reason:motivo||"cheat"});
    } catch { /* no-op */ }
  },[estado,activityId,alumno,modoRevision]);

  useEffect(()=>{
    if (modoRevision) return;
    let strikesLocal = 0;
    const markStrike = (motivo)=>{
      if (estado!=="running"||leavingRef.current) return;
      strikesLocal++;
      setStrikes(strikesLocal);
      if (strikesLocal===1) { mostrarWarning(`⚠️ Advertencia: ${motivo}. Si vuelves a salir, la actividad se cancelará.`); return; }
      cancelarActividad(motivo);
    };
    const onVis     = ()=>{ if(document.visibilityState==="hidden") markStrike("Pestaña oculta"); };
    const onBlur    = ()=>markStrike("Ventana sin foco");
    const onUnload  = (e)=>{ e.preventDefault(); e.returnValue=""; cancelarActividad("Cierre/recarga de página"); };
    const onPhide   = ()=>markStrike("Página oculta");
    document.addEventListener("visibilitychange",onVis);
    window.addEventListener("blur",onBlur);
    window.addEventListener("beforeunload",onUnload);
    window.addEventListener("pagehide",onPhide);
    return ()=>{
      document.removeEventListener("visibilitychange",onVis);
      window.removeEventListener("blur",onBlur);
      window.removeEventListener("beforeunload",onUnload);
      window.removeEventListener("pagehide",onPhide);
    };
  },[estado,modoRevision,cancelarActividad,mostrarWarning]);

  /* ── Timer ── */
  useEffect(()=>{
    if (!tiempoTotal||estado!=="running"||modoRevision) return;
    const t = setInterval(()=>{
      setTimeLeft(s=>{
        if (s<=1){ clearInterval(t); finalizar(); return 0; }
        return s-1;
      });
    },1000);
    return ()=>clearInterval(t);
  },[tiempoTotal,estado,modoRevision]);

  /* ── Respuesta ── */
  const elegir = (opcion) => setRespuestas(r=>({...r,[idx]:opcion}));

  /* ── Calificación ── */
  const calcularScore = useCallback((resps)=>{
    let pts=0, maxPts=0;
    const det=preguntas.map((p,i)=>{
      const puntaje = Number(p.puntaje||1);
      maxPts+=puntaje;
      const r = resps[i];
      let correcto=false;
      if (p.tipo==="multiple")        correcto = r===p.correcta;
      else if (p.tipo==="verdadero_falso") correcto = r===(p.tfRespuesta??true);
      else if (p.tipo==="abierta")    correcto = true; // revisión manual
      else if (p.tipo==="ordenar")    correcto = Array.isArray(r)&&r.every((v,j)=>v===(p.opciones||[])[j]);
      else correcto = r===p.correcta;
      if(correcto) pts+=puntaje;
      return {puntos:correcto?puntaje:0,max:puntaje,correcto};
    });
    return {pts,maxPts,det};
  },[preguntas]);

  /* ── Finalizar ── */
  const finalizar = useCallback(async()=>{
    if (estado!=="running") return;
    const {pts,maxPts,det} = calcularScore(respuestas);
    setScore(pts); setDetalle(det); setEstado("finished");
    try {
      await API.post?.(`/api/activities/${activityId}/finish`,{alumno,score:pts,total:maxPts});
      socketRef.current?.emit("activity:finish",{activityId,alumno,score:pts,total:maxPts});
    } catch { /* no-op */ }
  },[estado,respuestas,activityId,alumno,calcularScore]);

  /* ── Revisar respuestas ── */
  const verRevision = ()=>{ setRevisando(true); setEstado("revision"); setIdx(0); };

  /* ── Empty guard ── */
  if (!quiz||!total) return (
    <div className="ar-root">
      <div className="ar-card" style={{maxWidth:500,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>📭</div>
        <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:22,marginBottom:8}}>Sin preguntas</div>
        <div style={{color:"#8fa0c8",marginBottom:20}}>Esta actividad no tiene preguntas configuradas.</div>
        <button className="ar-btn ar-btn-ghost" onClick={onClose}>← Volver</button>
      </div>
    </div>
  );

  const p = preguntas[idx];
  const tipoLabel = { multiple:"Opción múltiple", verdadero_falso:"Verdadero / Falso", abierta:"Respuesta abierta", ordenar:"Ordenar" };
  const tipoColor = { multiple:"rgba(99,102,241,.3)", verdadero_falso:"rgba(52,211,153,.3)", abierta:"rgba(240,192,96,.3)", ordenar:"rgba(167,139,250,.3)" };
  const pct = total>0 ? ((Object.keys(respuestas).length/total)*100).toFixed(0) : 0;

  /* ─────────────── RENDER ─────────────── */
  return (
    <div className="ar-root">
      {/* Banner warning anti-trampa */}
      {warning && <div className="ar-warning">🛡️ {warning}</div>}

      {/* Topbar */}
      <div className="ar-topbar">
        <div className="ar-brand">EduTec</div>
        <div className="ar-info">
          <span className="ar-chip">👤 {alumno}</span>
          <span className={`ar-chip ${estado==="finished"||estado==="revision"?"ok":estado==="blocked"?"danger":"ok"}`}>
            {estado==="running"?"🟢 En curso":estado==="finished"?"✅ Entregado":estado==="revision"?"🔍 Revisión":"🚫 Cancelado"}
          </span>
          {strikes>0 && <span className="ar-chip warn">⚠️ {strikes} {strikes===1?"advertencia":"advertencias"}</span>}
        </div>
      </div>

      {/* ═══ PANTALLA: BLOQUEADO ═══ */}
      {estado==="blocked" && (
        <div className="ar-card">
          <div className="ar-blocked">
            <div className="ar-blocked-icon">🚫</div>
            <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:26,marginBottom:8,color:"#f87171"}}>Actividad cancelada</div>
            <div style={{color:"#8fa0c8",fontSize:14,marginBottom:8}}>Motivo:</div>
            <div style={{padding:"12px 16px",background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.25)",borderRadius:12,color:"#f87171",fontSize:14,marginBottom:24}}>{razonBloqueo}</div>
            <div style={{fontSize:13,color:"#4e6090",marginBottom:24,lineHeight:1.6}}>Esta acción ha sido reportada al profesor. Tu resultado es <b style={{color:"#f87171"}}>0 puntos</b>.</div>
            <button className="ar-btn ar-btn-ghost" onClick={onClose}>← Volver al inicio</button>
          </div>
        </div>
      )}

      {/* ═══ PANTALLA: RESULTADO FINAL ═══ */}
      {(estado==="finished"||estado==="revision") && !revisando && (
        <div className="ar-card">
          <div className="ar-result">
            {/* Score */}
            {(() => {
              const maxPts = preguntas.reduce((s,p)=>s+Number(p.puntaje||1),0);
              const pctScore = maxPts>0?Math.round((score/maxPts)*100):0;
              const emoji = pctScore>=90?"🏆":pctScore>=70?"🎉":pctScore>=50?"👍":"📚";
              const msg   = pctScore>=90?"¡Excelente trabajo!":pctScore>=70?"¡Buen resultado!":pctScore>=50?"Puedes mejorar":"Sigue practicando";
              return (<>
                <div style={{fontSize:56,marginBottom:8}}>{emoji}</div>
                <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:26,marginBottom:4}}>{msg}</div>
                <div style={{color:"#8fa0c8",fontSize:13,marginBottom:20}}>{quiz?.titulo||"Actividad"}</div>
                <div className="ar-stat-row">
                  <div className="ar-stat-box">
                    <div className="ar-stat-box-val" style={{color:"#6366f1"}}>{score}</div>
                    <div className="ar-stat-box-lbl">Puntos obtenidos</div>
                  </div>
                  <div className="ar-stat-box">
                    <div className="ar-stat-box-val">{maxPts}</div>
                    <div className="ar-stat-box-lbl">Puntos máximos</div>
                  </div>
                  <div className="ar-stat-box">
                    <div className="ar-stat-box-val" style={{color:pctScore>=70?"#34d399":"#f87171"}}>{pctScore}%</div>
                    <div className="ar-stat-box-lbl">Calificación</div>
                  </div>
                  <div className="ar-stat-box">
                    <div className="ar-stat-box-val" style={{color:"#34d399"}}>{detalle.filter(d=>d.correcto).length}</div>
                    <div className="ar-stat-box-lbl">Correctas</div>
                  </div>
                  <div className="ar-stat-box">
                    <div className="ar-stat-box-val" style={{color:"#f87171"}}>{detalle.filter(d=>!d.correcto).length}</div>
                    <div className="ar-stat-box-lbl">Incorrectas</div>
                  </div>
                </div>
                {/* Mini resumen por pregunta */}
                <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>
                  {detalle.map((d,i)=>(
                    <div key={i} style={{width:32,height:32,borderRadius:8,display:"grid",placeItems:"center",fontSize:11,fontWeight:700,background:d.correcto?"rgba(52,211,153,.15)":"rgba(248,113,113,.12)",border:`1px solid ${d.correcto?"#34d399":"#f87171"}`,color:d.correcto?"#34d399":"#f87171",fontFamily:"'DM Mono',monospace"}}>
                      {i+1}
                    </div>
                  ))}
                </div>
              </>);
            })()}
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="ar-btn ar-btn-primary" onClick={verRevision}>🔍 Revisar respuestas</button>
              <button className="ar-btn ar-btn-ghost"   onClick={onClose}>← Volver</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PANTALLA: REVISIÓN / EN CURSO ═══ */}
      {(estado==="running"||(estado==="revision"&&revisando)) && (
        <div className="ar-card">
          {/* Anti-trampa shield (solo en curso) */}
          {estado==="running" && !modoRevision && (
            <div className="ar-shield">
              {[["🛡️","Actividad protegida",true],["👁️","Sin cambio de pestaña",true],["🔒","Supervisión activa",true]].map(([ic,tx,ok])=>(
                <div key={tx} className={`ar-shield-item${ok?" active":""}`}><span>{ic}</span>{tx}</div>
              ))}
            </div>
          )}

          {/* Barra de progreso global */}
          <div className="ar-progress-bar">
            <div className="ar-progress-fill" style={{width:`${((idx+1)/total)*100}%`}}/>
          </div>

          {/* Timer */}
          {estado==="running" && tiempoTotal>0 && <Timer total={tiempoTotal} left={timeLeft}/>}

          {/* Mapa de preguntas */}
          <div className="ar-qmap">
            {preguntas.map((_,i)=>{
              const isAnswered = respuestas[i]!==undefined;
              const isCurrent  = i===idx;
              const qOk  = revisando && detalle[i]?.correcto;
              const qErr = revisando && !detalle[i]?.correcto;
              return (
                <div key={i}
                  className={`ar-qmap-dot${isCurrent?" current":qOk?" q-ok":qErr?" q-err":isAnswered?" answered":""}`}
                  onClick={()=>setIdx(i)}>
                  {i+1}
                </div>
              );
            })}
          </div>

          {/* Header pregunta */}
          <div className="ar-q-header">
            <span className="ar-q-num">Pregunta {idx+1} de {total}</span>
            <span className="ar-type-badge" style={{borderColor:tipoColor[p.tipo]||"rgba(99,102,241,.3)",color:"#8fa0c8",background:"transparent",fontSize:10}}>
              {tipoLabel[p.tipo]||p.tipo}
            </span>
            {p.puntaje && <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#4e6090",marginLeft:"auto"}}>⭐ {p.puntaje} pts</span>}
          </div>

          {/* Enunciado */}
          <div className="ar-enunciado">{p.enunciado||<span style={{color:"#4e6090",fontStyle:"italic"}}>Sin enunciado</span>}</div>

          {/* Cuerpo según tipo */}
          {(p.tipo==="multiple"||!p.tipo) && (
            <PreguntaMultiple pregunta={p} respuesta={respuestas[idx]} onElegir={elegir}
              revisando={revisando} mostrarExplicacion={true}/>
          )}
          {p.tipo==="verdadero_falso" && (
            <PreguntaVF pregunta={p} respuesta={respuestas[idx]} onElegir={elegir} revisando={revisando}/>
          )}
          {p.tipo==="abierta" && (
            <PreguntaAbierta pregunta={p} respuesta={respuestas[idx]} onElegir={elegir}
              revisando={revisando} mostrarExplicacion={true}/>
          )}
          {p.tipo==="ordenar" && (
            <PreguntaOrdenar pregunta={p} respuesta={respuestas[idx]} onElegir={elegir} revisando={revisando}/>
          )}

          {/* Navegación */}
          <div className="ar-nav">
            <button className="ar-btn ar-btn-ghost" onClick={()=>setIdx(x=>Math.max(0,x-1))} disabled={idx===0}>
              ← Anterior
            </button>

            {/* Indicador de respuestas pendientes */}
            {estado==="running" && (
              <span style={{fontSize:12,color:"#4e6090",fontFamily:"'DM Mono',monospace",marginLeft:4}}>
                {Object.keys(respuestas).length}/{total} respondidas
              </span>
            )}

            <div style={{flex:1}}/>

            {revisando ? (
              <>
                {idx < total-1
                  ? <button className="ar-btn ar-btn-primary" onClick={()=>setIdx(x=>x+1)}>Siguiente →</button>
                  : <button className="ar-btn ar-btn-gold" onClick={onClose}>✅ Cerrar revisión</button>
                }
              </>
            ) : (
              idx < total-1
                ? <button className="ar-btn ar-btn-primary" onClick={()=>setIdx(x=>x+1)} disabled={respuestas[idx]===undefined}>
                    Siguiente →
                  </button>
                : <button className="ar-btn ar-btn-gold" onClick={finalizar} disabled={respuestas[idx]===undefined}>
                    ✅ Enviar actividad
                  </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}