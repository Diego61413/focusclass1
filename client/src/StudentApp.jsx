// client/src/StudentApp.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import API from "./api.js";
import "./App.css";

const socket = io("http://localhost:4000", { autoConnect: true });

/* ══════════════════════════════════════════════════════════════
   ESTILOS — EduTec Student Shell
   Dark tech · Indigo/Gold · Glassmorphism · Instrument Serif
══════════════════════════════════════════════════════════════ */
const ST = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');

:root{
  --bg:#080c18; --panel:#0d1426; --glass:rgba(13,20,38,.75);
  --surface:#111c38; --raised:#172040;
  --ind:#6366f1; --ind-lt:#818cf8; --ind-dim:rgba(99,102,241,.15);
  --ind-glow:rgba(99,102,241,.35);
  --gold:#f0c060; --gold-dim:rgba(240,192,96,.13);
  --ok:#34d399; --ok-dim:rgba(52,211,153,.12);
  --warn:#fbbf24; --danger:#f87171;
  --txt:#e8eeff; --txt2:#8fa0c8; --txt3:#4e6090;
  --b1:rgba(99,102,241,.14); --b2:rgba(99,102,241,.32);
  --r:14px; --rsm:9px; --rpill:999px;
  --sh:0 8px 32px rgba(0,0,0,.6),0 1px 0 rgba(255,255,255,.04) inset;
  --ease:cubic-bezier(.16,1,.3,1);
}
*{box-sizing:border-box;margin:0;padding:0}

.es-shell{
  position:fixed;inset:0;z-index:20;
  display:flex;
  background:radial-gradient(ellipse 80vw 60vh at 20% -10%,rgba(99,102,241,.07),transparent),
             radial-gradient(ellipse 50vw 40vh at 80% 110%,rgba(240,192,96,.05),transparent),
             var(--bg);
  font-family:'DM Sans',sans-serif;color:var(--txt);overflow:hidden;
}

/* Rail */
.es-rail{
  width:72px;flex-shrink:0;
  display:flex;flex-direction:column;align-items:center;
  padding:14px 0 10px;gap:4px;
  background:rgba(8,12,24,.92);border-right:1px solid var(--b1);
  backdrop-filter:blur(20px);z-index:2;
}
.es-logo{
  width:40px;height:40px;border-radius:12px;
  background:linear-gradient(135deg,var(--ind),#4338ca);
  display:grid;place-items:center;
  font-family:'Instrument Serif',serif;font-style:italic;
  font-size:20px;font-weight:700;color:#fff;margin-bottom:12px;flex-shrink:0;
  box-shadow:0 0 0 1px var(--b2),0 8px 20px rgba(99,102,241,.3);
}
.es-rail-btn{
  width:48px;height:48px;border-radius:12px;border:none;background:transparent;
  color:var(--txt3);display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:3px;cursor:pointer;position:relative;
  transition:background .18s,color .18s,transform .15s;font-family:'DM Sans',sans-serif;
}
.es-rail-btn:hover{background:var(--raised);color:var(--txt2);transform:translateY(-1px)}
.es-rail-btn.active{background:var(--ind-dim);color:var(--ind-lt)}
.es-rail-btn.active::after{
  content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);
  width:3px;height:22px;background:var(--ind);border-radius:0 3px 3px 0;
}
.es-rail-icon{font-size:19px;line-height:1}
.es-rail-label{font-size:9px;font-weight:600;letter-spacing:.04em;text-transform:uppercase}
.es-rail-spacer{flex:1}
.es-avatar-btn{
  width:36px;height:36px;border-radius:50%;
  background:linear-gradient(135deg,var(--ind),#7c3aed);
  display:grid;place-items:center;font-size:12px;font-weight:700;color:#fff;
  cursor:pointer;border:2px solid var(--b2);
  transition:transform .15s,box-shadow .15s;font-family:'DM Sans',sans-serif;
  margin:8px 0 4px;
}
.es-avatar-btn:hover{transform:scale(1.08);box-shadow:0 0 0 3px var(--ind-dim)}

/* Main */
.es-main{flex:1;display:flex;flex-direction:column;overflow:hidden}

/* Topbar */
.es-top{
  height:52px;flex-shrink:0;display:flex;align-items:center;gap:14px;
  padding:0 22px;background:rgba(8,12,24,.8);border-bottom:1px solid var(--b1);
  backdrop-filter:blur(16px);
}
.es-top-title{
  font-family:'Instrument Serif',serif;font-style:italic;
  font-size:18px;color:var(--txt);white-space:nowrap;
}
.es-search{
  flex:1;max-width:380px;height:32px;background:rgba(17,28,56,.8);
  border:1px solid var(--b1);border-radius:10px;
  display:flex;align-items:center;gap:8px;padding:0 12px;
  transition:border-color .2s,box-shadow .2s;
}
.es-search:focus-within{border-color:var(--ind);box-shadow:0 0 0 3px var(--ind-dim)}
.es-search input{
  background:transparent;border:none;outline:none;
  color:var(--txt);font-size:13px;font-family:'DM Sans',sans-serif;width:100%;
}
.es-search input::placeholder{color:var(--txt3)}
.es-top-spacer{flex:1}
.es-top-btn{
  background:transparent;border:1px solid var(--b1);color:var(--txt2);
  font-size:12px;font-family:'DM Sans',sans-serif;font-weight:500;
  padding:7px 14px;border-radius:10px;cursor:pointer;
  display:flex;align-items:center;gap:6px;transition:all .18s;white-space:nowrap;
}
.es-top-btn:hover{border-color:var(--b2);color:var(--txt);background:var(--raised)}

/* Body */
.es-body{flex:1;overflow-y:auto;padding:26px 24px}
.es-body::-webkit-scrollbar{width:4px}
.es-body::-webkit-scrollbar-thumb{background:var(--raised);border-radius:999px}

/* Section */
.es-section{margin-bottom:32px}
.es-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:10px}
.es-section-left{display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none}
.es-eyebrow{
  font-family:'DM Mono',monospace;font-size:10px;
  letter-spacing:.14em;text-transform:uppercase;color:var(--ind-lt);
}
.es-section-title{
  font-family:'Instrument Serif',serif;font-style:italic;font-size:19px;color:var(--txt);
}
.es-chevron{font-size:13px;color:var(--txt3);transition:transform .2s var(--ease)}
.es-chevron.closed{transform:rotate(-90deg)}

/* Grid */
.es-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}

/* Card */
.es-card{
  background:linear-gradient(160deg,rgba(255,255,255,.03) 0%,transparent 60%),
             linear-gradient(180deg,var(--panel) 0%,#060914 100%);
  border:1px solid var(--b1);border-radius:18px;
  overflow:hidden;cursor:pointer;
  transition:border-color .2s,box-shadow .2s,transform .2s;
  display:flex;flex-direction:column;position:relative;
  animation:esFadeUp .35s var(--ease) both;
}
.es-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(99,102,241,.5),rgba(240,192,96,.2),transparent);
  pointer-events:none;
}
.es-card:hover{border-color:var(--b2);box-shadow:var(--sh),0 0 40px rgba(99,102,241,.1);transform:translateY(-3px)}
.es-card-glow{
  position:absolute;top:-30px;right:-30px;width:120px;height:120px;
  border-radius:50%;opacity:.06;pointer-events:none;filter:blur(30px);transition:opacity .3s;
}
.es-card:hover .es-card-glow{opacity:.14}
.es-card-top{padding:18px 18px 14px;display:flex;align-items:flex-start;gap:14px;flex:1}
.es-card-thumb{
  width:52px;height:52px;border-radius:14px;
  display:grid;place-items:center;font-size:15px;font-weight:800;color:#fff;
  flex-shrink:0;letter-spacing:-.5px;box-shadow:0 4px 14px rgba(0,0,0,.4);
  position:relative;
}
.es-card-thumb-badge{
  position:absolute;bottom:-4px;right:-4px;width:16px;height:16px;border-radius:50%;
  background:var(--ok);border:2px solid var(--panel);display:none;
}
.es-card.live .es-card-thumb-badge{display:block}
.es-card-info{flex:1;min-width:0}
.es-card-nombre{font-size:15px;font-weight:700;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.es-card-meta{font-size:11px;color:var(--txt2);display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.es-card-dot{width:5px;height:5px;border-radius:50%;background:var(--txt3);display:inline-block}
.es-card-menu{
  background:transparent;border:none;color:var(--txt3);font-size:18px;cursor:pointer;
  padding:2px 6px;border-radius:6px;transition:background .15s,color .15s;line-height:1;
  flex-shrink:0;align-self:flex-start;
}
.es-card-menu:hover{background:var(--raised);color:var(--txt2)}
.es-card-footer{border-top:1px solid var(--b1);padding:10px 16px;display:flex;gap:6px}
.es-card-action{
  display:flex;align-items:center;gap:5px;background:transparent;border:none;
  color:var(--txt3);font-size:12px;font-weight:500;padding:5px 9px;border-radius:8px;
  cursor:pointer;transition:background .15s,color .15s;font-family:'DM Sans',sans-serif;
}
.es-card-action:hover{background:var(--raised);color:var(--txt2)}
.es-card-action-icon{font-size:14px}

/* Empty */
.es-empty{text-align:center;padding:48px 20px;color:var(--txt3)}
.es-empty-icon{font-size:44px;display:block;margin-bottom:12px;filter:grayscale(.4)}
.es-empty-title{font-size:16px;font-weight:600;color:var(--txt2);margin-bottom:6px;font-family:'Instrument Serif',serif;font-style:italic}
.es-empty-sub{font-size:13px;line-height:1.5}

/* Modal */
.es-overlay{
  position:fixed;inset:0;background:rgba(4,6,16,.75);backdrop-filter:blur(10px);
  z-index:100;display:flex;align-items:center;justify-content:center;
  padding:20px;animation:esFadeIn .2s var(--ease);
}
.es-modal{
  background:linear-gradient(160deg,rgba(255,255,255,.04),transparent 50%),
             linear-gradient(180deg,var(--panel),#060914);
  border:1px solid var(--b2);border-radius:20px;padding:30px;
  max-width:460px;width:100%;box-shadow:0 30px 70px rgba(0,0,0,.7);
  position:relative;animation:esSlideUp .3s var(--ease);
}
.es-modal::before{
  content:'';position:absolute;top:0;left:20px;right:20px;height:1px;
  background:linear-gradient(90deg,transparent,rgba(99,102,241,.5),rgba(240,192,96,.3),transparent);
}
.es-modal-close{
  position:absolute;top:14px;right:14px;background:var(--surface);
  border:1px solid var(--b1);color:var(--txt3);width:28px;height:28px;
  border-radius:8px;display:grid;place-items:center;cursor:pointer;font-size:14px;transition:all .18s;
}
.es-modal-close:hover{border-color:var(--b2);color:var(--txt)}
.es-modal h3{font-family:'Instrument Serif',serif;font-style:italic;font-size:22px;margin-bottom:6px}
.es-modal p{font-size:13px;color:var(--txt2);margin-bottom:20px;line-height:1.55}
.es-field{margin-bottom:14px}
.es-field label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--txt3);display:block;margin-bottom:6px}
.es-field input{
  width:100%;background:#060914;border:1px solid var(--b1);border-radius:12px;
  padding:11px 14px;font-size:14px;color:var(--txt);font-family:'DM Sans',sans-serif;
  outline:none;transition:border-color .2s,box-shadow .2s;letter-spacing:.08em;
}
.es-field input:focus{border-color:var(--ind);box-shadow:0 0 0 3px var(--ind-dim)}
.es-field input::placeholder{color:var(--txt3);letter-spacing:0}
.es-modal-btns{display:flex;gap:10px;justify-content:flex-end;margin-top:6px}

/* Buttons */
.es-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
  font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;
  border:none;border-radius:10px;padding:10px 18px;cursor:pointer;
  transition:transform .12s var(--ease),filter .2s,box-shadow .2s;
  position:relative;overflow:hidden;
}
.es-btn:active{transform:scale(.97)!important}
.es-btn:disabled{opacity:.4;cursor:not-allowed;pointer-events:none}
.es-btn.primary{
  background:linear-gradient(160deg,var(--ind),#4338ca);color:#fff;
  box-shadow:0 6px 18px rgba(99,102,241,.28),inset 0 1px 0 rgba(255,255,255,.14);
}
.es-btn.primary:hover{transform:translateY(-2px);filter:brightness(1.1);box-shadow:0 10px 28px rgba(99,102,241,.4)}
.es-btn.ghost{background:var(--raised);color:var(--txt2);border:1px solid var(--b1)}
.es-btn.ghost:hover{border-color:var(--b2);color:var(--txt);transform:translateY(-1px)}
.es-btn.gold-btn{
  background:linear-gradient(160deg,var(--gold),#d4943a);color:#080c18;font-weight:700;
  box-shadow:0 6px 18px rgba(240,192,96,.2);
}
.es-btn.gold-btn:hover{transform:translateY(-2px);filter:brightness(1.07)}
.es-btn.sm{font-size:11px;padding:6px 12px;border-radius:8px}

/* Clase view */
.es-class-shell{display:flex;flex-direction:column;height:100%}
.es-class-banner{
  flex-shrink:0;padding:16px 22px;background:rgba(8,12,24,.7);
  border-bottom:1px solid var(--b1);display:flex;align-items:center;gap:14px;
  backdrop-filter:blur(12px);
}
.es-class-thumb{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0}
.es-class-name{font-size:16px;font-weight:700}
.es-class-sub{font-size:11px;color:var(--txt2);margin-top:1px}

/* Tabs */
.es-tabs{
  display:flex;gap:2px;padding:0 22px;background:rgba(8,12,24,.6);
  border-bottom:1px solid var(--b1);overflow-x:auto;flex-shrink:0;
}
.es-tabs::-webkit-scrollbar{height:0}
.es-tab{
  padding:12px 16px;font-size:13px;font-weight:500;color:var(--txt3);
  border:none;background:transparent;border-bottom:2px solid transparent;
  cursor:pointer;white-space:nowrap;font-family:'DM Sans',sans-serif;transition:color .18s,border-color .18s;
}
.es-tab:hover{color:var(--txt2)}
.es-tab.active{color:var(--ind-lt);border-bottom-color:var(--ind)}
.es-tab-body{flex:1;overflow-y:auto;padding:20px 22px}
.es-tab-body::-webkit-scrollbar{width:4px}
.es-tab-body::-webkit-scrollbar-thumb{background:var(--raised);border-radius:999px}

/* Chat */
.es-chat{display:flex;flex-direction:column;height:100%;gap:0}
.es-feed{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding-bottom:14px;padding-right:4px}
.es-feed::-webkit-scrollbar{width:4px}
.es-feed::-webkit-scrollbar-thumb{background:var(--raised);border-radius:999px}
.es-msg{display:flex;gap:10px;animation:esFadeUp .2s var(--ease) both}
.es-msg-av{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0}
.es-msg-bubble{flex:1}
.es-msg-meta{display:flex;gap:8px;align-items:baseline;margin-bottom:2px}
.es-msg-autor{font-size:13px;font-weight:600}
.es-msg-time{font-size:10px;color:var(--txt3);font-family:'DM Mono',monospace}
.es-msg-text{font-size:14px;color:var(--txt2);line-height:1.55}
.es-composer{
  flex-shrink:0;display:flex;align-items:flex-end;gap:10px;
  background:rgba(17,28,56,.8);border:1px solid var(--b1);border-radius:14px;
  padding:10px 14px;margin-top:12px;backdrop-filter:blur(8px);transition:border-color .2s,box-shadow .2s;
}
.es-composer:focus-within{border-color:var(--ind);box-shadow:0 0 0 3px var(--ind-dim)}
.es-composer textarea{
  flex:1;background:transparent;border:none;outline:none;color:var(--txt);
  font-size:14px;font-family:'DM Sans',sans-serif;resize:none;
  min-height:22px;max-height:90px;line-height:1.45;
}
.es-composer textarea::placeholder{color:var(--txt3)}
.es-send{
  width:34px;height:34px;border-radius:10px;
  background:linear-gradient(135deg,var(--ind),#4338ca);border:none;color:#fff;
  font-size:14px;cursor:pointer;display:grid;place-items:center;flex-shrink:0;
  transition:filter .15s,transform .12s;box-shadow:0 4px 12px rgba(99,102,241,.3);
}
.es-send:hover{filter:brightness(1.12);transform:scale(1.05)}
.es-send:disabled{opacity:.35;cursor:not-allowed;transform:none}

/* Tareas */
.es-tarea{
  background:linear-gradient(160deg,var(--surface),var(--panel));
  border:1px solid var(--b1);border-radius:14px;padding:14px 16px;margin-bottom:10px;
  display:flex;align-items:center;gap:14px;cursor:pointer;
  transition:border-color .18s,transform .18s;animation:esFadeUp .3s var(--ease) both;
}
.es-tarea:hover{border-color:var(--b2);transform:translateY(-1px)}
.es-tarea-icon{font-size:22px;flex-shrink:0}
.es-tarea-info{flex:1;min-width:0}
.es-tarea-title{font-size:14px;font-weight:600;margin-bottom:3px}
.es-tarea-meta{font-size:11px;color:var(--txt2);display:flex;gap:10px;flex-wrap:wrap}
.es-badge{font-size:10px;font-weight:600;padding:3px 9px;border-radius:var(--rpill);border:1px solid;white-space:nowrap;font-family:'DM Mono',monospace}
.es-badge.ok{background:var(--ok-dim);border-color:rgba(52,211,153,.3);color:var(--ok)}
.es-badge.warn{background:rgba(251,191,36,.1);border-color:rgba(251,191,36,.25);color:var(--warn)}
.es-badge.danger{background:rgba(248,113,113,.1);border-color:rgba(248,113,113,.25);color:var(--danger)}
.es-badge.gold{background:var(--gold-dim);border-color:rgba(240,192,96,.3);color:var(--gold)}
.es-badge.ind{background:var(--ind-dim);border-color:var(--b2);color:var(--ind-lt)}

/* Personas */
.es-persona-grid{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}
.es-persona{display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--b1);border-radius:12px;padding:10px 14px;transition:border-color .18s}
.es-persona:hover{border-color:var(--b2)}
.es-persona-av{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0}
.es-persona-dot{width:8px;height:8px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 2px rgba(52,211,153,.2);margin-left:2px}

/* Archivo */
.es-archivo{
  display:flex;align-items:center;gap:12px;background:var(--surface);border:1px solid var(--b1);
  border-radius:12px;padding:12px 16px;margin-bottom:8px;cursor:pointer;
  transition:border-color .18s;animation:esFadeUp .25s var(--ease) both;
}
.es-archivo:hover{border-color:var(--b2)}
.es-archivo-icon{font-size:24px;flex-shrink:0}
.es-archivo-info{flex:1;min-width:0}
.es-archivo-name{font-size:13px;font-weight:600}
.es-archivo-meta{font-size:11px;color:var(--txt3);margin-top:2px}

/* Live dot */
.es-live-dot{width:8px;height:8px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 3px var(--ok-dim),0 0 10px var(--ok);animation:esPulse 2s infinite;flex-shrink:0}

@keyframes esFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes esFadeIn {from{opacity:0}to{opacity:1}}
@keyframes esSlideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes esPulse{0%,100%{box-shadow:0 0 0 3px var(--ok-dim),0 0 8px var(--ok)}50%{box-shadow:0 0 0 6px var(--ok-dim),0 0 18px var(--ok)}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

if (!document.getElementById("es-styles")) {
  const s = document.createElement("style");
  s.id = "es-styles";
  s.textContent = ST;
  document.head.appendChild(s);
}

/* ─── Helpers ──────────────────────────────────────────────── */
const uid      = () => Math.random().toString(36).slice(2, 9);
const fmtT     = (d) => new Date(d).toLocaleTimeString("es-MX", { hour:"2-digit", minute:"2-digit" });
const fmtDate  = (d) => new Date(d).toLocaleDateString("es-MX", { day:"2-digit", month:"short" });
const initials = (n) => (n||"?").split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()||"").join("");
const PALETA   = [
  ["#1e40af","#3b82f6"],["#7c3aed","#a78bfa"],["#be185d","#f472b6"],
  ["#065f46","#34d399"],["#92400e","#f59e0b"],["#0f766e","#2dd4bf"],
  ["#6d28d9","#c084fc"],["#9f1239","#fb7185"],["#b45309","#fbbf24"],
  ["#1e3a8a","#60a5fa"],
];
const paleta = (nombre) => PALETA[(nombre?.charCodeAt(0)||65) % PALETA.length];

const MOCK = [
  { _id:"c1", nombre:"Programación Web",       abr:"PW", semestre:"Sem 4", profesor:"Ing. García",  alumnos:28 },
  { _id:"c2", nombre:"Base de Datos",           abr:"BD", semestre:"Sem 4", profesor:"Dra. Reyes",   alumnos:25 },
  { _id:"c3", nombre:"Sistemas Operativos",     abr:"SO", semestre:"Sem 5", profesor:"Mtro. Torres", alumnos:30 },
  { _id:"c4", nombre:"Inteligencia Artificial", abr:"IA", semestre:"Sem 6", profesor:"Ing. Mendoza", alumnos:22 },
];

/* ══ ClaseCard ══════════════════════════════════════════════ */
function ClaseCard({ clase, onClick, delay=0 }) {
  const [a,b] = paleta(clase.nombre);
  const abr   = clase.abr || initials(clase.nombre);
  return (
    <div className="es-card" onClick={onClick} style={{ animationDelay:`${delay}ms` }}>
      <div className="es-card-glow" style={{ background:a }} />
      <div className="es-card-top">
        <div className="es-card-thumb" style={{ background:`linear-gradient(135deg,${a},${b})` }}>
          {abr}
          <div className="es-card-thumb-badge" />
        </div>
        <div className="es-card-info">
          <div className="es-card-nombre">{clase.nombre}</div>
          <div className="es-card-meta">
            {clase.profesor && <span>{clase.profesor}</span>}
            {clase.semestre && <><span className="es-card-dot"/><span>{clase.semestre}</span></>}
            {clase.alumnos  && <><span className="es-card-dot"/><span>{clase.alumnos} alumnos</span></>}
          </div>
        </div>
        <button className="es-card-menu" onClick={e=>e.stopPropagation()}>⋯</button>
      </div>
      <div className="es-card-footer">
        <button className="es-card-action" onClick={e=>e.stopPropagation()}><span className="es-card-action-icon">💬</span> Posts</button>
        <button className="es-card-action" onClick={e=>e.stopPropagation()}><span className="es-card-action-icon">📁</span> Archivos</button>
        <button className="es-card-action" onClick={e=>e.stopPropagation()}><span className="es-card-action-icon">✅</span> Tareas</button>
      </div>
    </div>
  );
}

/* ══ ClaseView ══════════════════════════════════════════════ */
function ClaseView({ clase, yo, onBack }) {
  const [tab,      setTab]      = useState("posts");
  const [mensajes, setMensajes] = useState([
    { _id:"m1", autor:"Ing. García", texto:"Bienvenidos al canal. Aquí publicaré anuncios y material de clase.", fecha:new Date(Date.now()-86400000*2).toISOString() },
    { _id:"m2", autor:"Ana Torres",  texto:"¿Cuándo sube el material de la unidad 2?", fecha:new Date(Date.now()-3600000*4).toISOString() },
    { _id:"m3", autor:"Ing. García", texto:"Esta tarde lo subo. Mientras revisen el repo.", fecha:new Date(Date.now()-3600000*2).toISOString() },
  ]);
  const [tareas,   setTareas]   = useState([
    { _id:"t1", titulo:"Práctica 1 — HTML semántico", fechaEntrega:new Date(Date.now()+86400000*3).toISOString(), estado:"pendiente", puntos:100 },
    { _id:"t2", titulo:"Reporte — Normalización",      fechaEntrega:new Date(Date.now()-86400000).toISOString(),  estado:"entregada", puntos:50  },
    { _id:"t3", titulo:"Proyecto Final — API REST",   fechaEntrega:new Date(Date.now()+86400000*12).toISOString(),estado:"pendiente", puntos:200 },
  ]);
  const [archivos, setArchivos] = useState([
    { _id:"a1", nombre:"Unidad 1 — Intro HTML5.pdf", tipo:"PDF",  tamanio:"2.4 MB", fecha:new Date(Date.now()-86400000*5).toISOString() },
    { _id:"a2", nombre:"Ejercicios Semana 2.zip",    tipo:"ZIP",  tamanio:"780 KB", fecha:new Date(Date.now()-86400000*3).toISOString() },
    { _id:"a3", nombre:"Slides Clase 3.pptx",        tipo:"PPTX", tamanio:"4.1 MB", fecha:new Date(Date.now()-86400000).toISOString() },
  ]);
  const [presentes,setPresentes]= useState([]);
  const [texto,    setTexto]    = useState("");
  const feedRef = useRef(null);
  const [a,b] = paleta(clase.nombre);

  useEffect(()=>{
    socket.emit("class:join",{ nombre:yo, clase:clase._id, rol:"alumno" });
    const onP  = (lista) => setPresentes(lista||[]);
    const onMsg= (m)     => setMensajes(p=>[...p,m]);
    socket.on("class:presence",onP);
    socket.on("class:mensaje", onMsg);
    Promise.all([
      API.get(`/api/clases/${clase._id}/mensajes`).catch(()=>null),
      API.get(`/api/clases/${clase._id}/tareas`).catch(()=>null),
      API.get(`/api/clases/${clase._id}/archivos`).catch(()=>null),
    ]).then(([msgs,tasks,files])=>{
      if(msgs?.length)  setMensajes(msgs);
      if(tasks?.length) setTareas(tasks);
      if(files?.length) setArchivos(files);
    });
    return ()=>{
      socket.off("class:presence",onP);
      socket.off("class:mensaje", onMsg);
      socket.emit("class:leave",{ nombre:yo, clase:clase._id });
    };
  },[clase._id,yo]);

  useEffect(()=>{ if(feedRef.current) feedRef.current.scrollTop=feedRef.current.scrollHeight; },[mensajes]);

  const enviar = ()=>{
    const t=texto.trim(); if(!t) return;
    const msg={ _id:uid(), autor:yo, texto:t, fecha:new Date().toISOString() };
    setMensajes(p=>[...p,msg]);
    socket.emit("class:mensaje",{ ...msg, clase:clase._id });
    setTexto("");
  };
  const marcarHecha=(id)=>{
    setTareas(p=>p.map(t=>t._id===id?{...t,estado:"entregada"}:t));
    API.post(`/api/tareas/${id}/done`).catch(()=>{});
  };
  const archivoIcon={ PDF:"📄", ZIP:"🗜️", PPTX:"📊", DOCX:"📝", MP4:"🎥" };
  const TABS=[{id:"posts",label:"💬  Posts"},{id:"tareas",label:"✅  Tareas"},{id:"archivos",label:"📁  Archivos"},{id:"personas",label:"👥  Personas"}];

  return (
    <div className="es-class-shell">
      <div className="es-class-banner">
        <button onClick={onBack}
          style={{ background:"transparent",border:"none",color:"var(--txt2)",cursor:"pointer",fontSize:18,padding:"4px 8px",borderRadius:8,transition:"all .15s" }}
          onMouseEnter={e=>e.currentTarget.style.background="var(--raised)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}
        >←</button>
        <div className="es-class-thumb" style={{ background:`linear-gradient(135deg,${a},${b})` }}>
          {clase.abr||initials(clase.nombre)}
        </div>
        <div style={{ flex:1,minWidth:0 }}>
          <div className="es-class-name">{clase.nombre}</div>
          <div className="es-class-sub">
            {clase.profesor}{clase.semestre&&` · ${clase.semestre}`}
            {presentes.length>0&&(
              <span style={{ marginLeft:8,display:"inline-flex",alignItems:"center",gap:5 }}>
                <span className="es-live-dot" style={{ width:6,height:6 }}/>
                {presentes.length} en línea
              </span>
            )}
          </div>
        </div>
        <button className="es-btn primary sm">⚡ En vivo</button>
      </div>
      <div className="es-tabs">
        {TABS.map(t=>(
          <button key={t.id} className={`es-tab${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="es-tab-body">
        {tab==="posts"&&(
          <div className="es-chat">
            <div className="es-feed" ref={feedRef}>
              {mensajes.map(m=>{
                const [ma,mb]=paleta(m.autor);
                return(
                  <div key={m._id} className="es-msg">
                    <div className="es-msg-av" style={{ background:`linear-gradient(135deg,${ma},${mb})` }}>{initials(m.autor)}</div>
                    <div className="es-msg-bubble">
                      <div className="es-msg-meta">
                        <span className="es-msg-autor">{m.autor}</span>
                        <span className="es-msg-time">{fmtT(m.fecha)}</span>
                      </div>
                      <div className="es-msg-text">{m.texto}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="es-composer">
              <textarea placeholder={`Escribe en ${clase.nombre}…`} value={texto} rows={1}
                onChange={e=>setTexto(e.target.value)}
                onKeyDown={e=>{ if((e.ctrlKey||e.metaKey)&&e.key==="Enter") enviar(); }}/>
              <button className="es-send" onClick={enviar} disabled={!texto.trim()}>➤</button>
            </div>
          </div>
        )}
        {tab==="tareas"&&(
          <div>
            {tareas.length===0&&<div className="es-empty"><span className="es-empty-icon">✅</span><div className="es-empty-title">Sin tareas</div><div className="es-empty-sub">El profesor publicará tareas aquí.</div></div>}
            {tareas.map((t,i)=>{
              const vencida=new Date(t.fechaEntrega)<new Date()&&t.estado!=="entregada";
              const hecha  =t.estado==="entregada"||t.estado==="hecha";
              return(
                <div key={t._id} className="es-tarea" style={{ animationDelay:`${i*50}ms` }}>
                  <div className="es-tarea-icon">{hecha?"✅":vencida?"⚠️":"📋"}</div>
                  <div className="es-tarea-info">
                    <div className="es-tarea-title">{t.titulo}</div>
                    <div className="es-tarea-meta"><span>Entrega: {fmtDate(t.fechaEntrega)}</span>{t.puntos&&<span>· {t.puntos} pts</span>}</div>
                  </div>
                  <span className={`es-badge ${hecha?"ok":vencida?"danger":"warn"}`}>{hecha?"Entregada":vencida?"Vencida":"Pendiente"}</span>
                  {!hecha&&!vencida&&<button className="es-btn gold-btn sm" onClick={()=>marcarHecha(t._id)}>Entregar</button>}
                </div>
              );
            })}
          </div>
        )}
        {tab==="archivos"&&(
          <div>
            {archivos.length===0?<div className="es-empty"><span className="es-empty-icon">📁</span><div className="es-empty-title">Sin archivos</div><div className="es-empty-sub">El profesor publicará material aquí.</div></div>
              :archivos.map((f,i)=>(
              <div key={f._id} className="es-archivo" style={{ animationDelay:`${i*50}ms` }}>
                <div className="es-archivo-icon">{archivoIcon[f.tipo]||"📎"}</div>
                <div className="es-archivo-info">
                  <div className="es-archivo-name">{f.nombre}</div>
                  <div className="es-archivo-meta">{f.tipo} · {f.tamanio} · {fmtDate(f.fecha)}</div>
                </div>
                <span className="es-badge ind">{f.tipo}</span>
                <button className="es-btn ghost sm">⬇ Descargar</button>
              </div>
            ))}
          </div>
        )}
        {tab==="personas"&&(
          <div>
            <div style={{ fontSize:13,color:"var(--txt2)",marginBottom:14,display:"flex",alignItems:"center",gap:8 }}>
              <span className="es-live-dot"/>
              {presentes.length>0?`${presentes.length} conectado${presentes.length!==1?"s":""}  ahora`:"Nadie conectado en este momento"}
            </div>
            <div className="es-persona-grid">
              {presentes.length===0
                ?<div className="es-empty" style={{ padding:"24px 0",flex:1 }}><span className="es-empty-icon" style={{ fontSize:32 }}>👥</span><div className="es-empty-sub">Cuando alguien entre aparecerá aquí.</div></div>
                :presentes.map((p,i)=>{ const nombre=p.nombre||p; const [pa,pb]=paleta(nombre); return(
                  <div key={i} className="es-persona">
                    <div className="es-persona-av" style={{ background:`linear-gradient(135deg,${pa},${pb})` }}>{initials(nombre)}</div>
                    <span style={{ fontSize:13,fontWeight:500 }}>{nombre}</span>
                    <div className="es-persona-dot"/>
                  </div>
                );})
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══ Nav ════════════════════════════════════════════════════ */
const NAV=[
  { id:"actividad",  icon:"🔔", label:"Actividad" },
  { id:"chat",       icon:"💬", label:"Chat"       },
  { id:"clases",     icon:"🎓", label:"Clases"     },
  { id:"tareas",     icon:"✅", label:"Tareas"     },
  { id:"calendario", icon:"📅", label:"Agenda"     },
  { id:"llamadas",   icon:"📞", label:"Llamadas"   },
];

/* ══ StudentApp ═════════════════════════════════════════════ */
export default function StudentApp({ user, onClose }) {
  const yo = useMemo(()=>(user?.nombre||"Alumno").trim(),[user?.nombre]);
  const [clases,       setClases]       = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [claseAbierta, setClaseAbierta] = useState(null);
  const [nav,          setNav]          = useState("clases");
  const [searchQ,      setSearchQ]      = useState("");
  const [modalUnirse,  setModalUnirse]  = useState(false);
  const [codigoUnirse, setCodigoUnirse] = useState("");
  const [secClases,    setSecClases]    = useState(true);
  const [secEquipos,   setSecEquipos]   = useState(true);
  const ini = initials(yo);

  useEffect(()=>{
    (async()=>{
      setCargando(true);
      try{
        const data=await API.get("/api/clases?mine=1").catch(()=>null);
        setClases(data?.length ? data.map(c=>({...c,_color:paleta(c.nombre)})) : MOCK.map(c=>({...c,_color:paleta(c.nombre)})));
      } finally{ setCargando(false); }
    })();
  },[]);

  const unirse=async()=>{
    if(!codigoUnirse.trim()) return;
    const result=await API.post("/api/clases/unirse",{ codigo:codigoUnirse.trim() }).catch(()=>null);
    if(result?.clase) setClases(p=>[...p,{ ...result.clase,_color:paleta(result.clase.nombre) }]);
    setModalUnirse(false); setCodigoUnirse("");
  };

  const clasesFiltradas=clases.filter(c=>!searchQ||c.nombre.toLowerCase().includes(searchQ.toLowerCase()));

  const TAREAS_GLOBAL=[
    { _id:"g1", titulo:"Práctica 1 — HTML semántico", clase:"Programación Web",       fechaEntrega:new Date(Date.now()+86400000*3).toISOString(),  estado:"pendiente", puntos:100 },
    { _id:"g2", titulo:"Reporte — Álgebra Relacional", clase:"Base de Datos",          fechaEntrega:new Date(Date.now()+86400000*6).toISOString(),  estado:"pendiente", puntos:80  },
    { _id:"g3", titulo:"Instalación de VM — Linux",    clase:"Sistemas Operativos",    fechaEntrega:new Date(Date.now()-86400000).toISOString(),    estado:"entregada", puntos:50  },
  ];

  const renderBody=()=>{
    if(claseAbierta) return <ClaseView clase={claseAbierta} yo={yo} onBack={()=>setClaseAbierta(null)}/>;

    return(
      <div className="es-body">

        {nav==="clases"&&(
          <>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:10 }}>
              <div>
                <div className="es-eyebrow">Mi espacio educativo</div>
                <div style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:24,marginTop:2 }}>Clases y equipos</div>
              </div>
              <button className="es-btn gold-btn" onClick={()=>setModalUnirse(true)}>✦ Unirse a una clase</button>
            </div>

            <div className="es-section">
              <div className="es-section-head">
                <div className="es-section-left" onClick={()=>setSecClases(v=>!v)}>
                  <span className={`es-chevron${secClases?"":" closed"}`}>▾</span>
                  <div>
                    <div className="es-eyebrow">Inscrito en</div>
                    <div className="es-section-title">Clases</div>
                  </div>
                </div>
                <span style={{ fontFamily:"'DM Mono',monospace",fontSize:11,color:"var(--txt3)" }}>{clases.length} clase{clases.length!==1?"s":""}</span>
              </div>
              {secClases&&(
                cargando
                  ?<div style={{ color:"var(--txt3)",fontSize:13,padding:"16px 0" }}>Cargando clases…</div>
                  :clasesFiltradas.length===0
                    ?<div className="es-empty"><span className="es-empty-icon">📚</span><div className="es-empty-title">Sin clases aún</div><div className="es-empty-sub">Usa el código de tu profesor para unirte.</div></div>
                    :<div className="es-grid">
                      {clasesFiltradas.map((c,i)=>(
                        <ClaseCard key={c._id} clase={c} delay={i*45} onClick={()=>setClaseAbierta(c)}/>
                      ))}
                    </div>
              )}
            </div>

            <div className="es-section">
              <div className="es-section-head">
                <div className="es-section-left" onClick={()=>setSecEquipos(v=>!v)}>
                  <span className={`es-chevron${secEquipos?"":" closed"}`}>▾</span>
                  <div>
                    <div className="es-eyebrow">Colaboración</div>
                    <div className="es-section-title">Equipos</div>
                  </div>
                </div>
              </div>
              {secEquipos&&<div className="es-empty" style={{ padding:"28px 0" }}><span className="es-empty-icon" style={{ fontSize:36 }}>👥</span><div className="es-empty-sub">No perteneces a ningún equipo aún.</div></div>}
            </div>
          </>
        )}

        {nav==="actividad"&&<div><div className="es-eyebrow" style={{ marginBottom:6 }}>Resumen</div><div style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:24,marginBottom:22 }}>Actividad reciente</div><div className="es-empty"><span className="es-empty-icon">🔔</span><div className="es-empty-title">Sin notificaciones</div><div className="es-empty-sub">Respuestas, menciones y alertas aparecerán aquí.</div></div></div>}

        {nav==="chat"&&<div><div className="es-eyebrow" style={{ marginBottom:6 }}>Mensajes</div><div style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:24,marginBottom:22 }}>Chat directo</div><div className="es-empty"><span className="es-empty-icon">💬</span><div className="es-empty-title">Sin conversaciones</div><div className="es-empty-sub">Los chats con profesores y compañeros aparecerán aquí.</div></div></div>}

        {nav==="tareas"&&(
          <div>
            <div className="es-eyebrow" style={{ marginBottom:6 }}>Pendientes</div>
            <div style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:24,marginBottom:22 }}>Mis tareas</div>
            {TAREAS_GLOBAL.map((t,i)=>{
              const vencida=new Date(t.fechaEntrega)<new Date()&&t.estado!=="entregada";
              const hecha  =t.estado==="entregada";
              return(
                <div key={t._id} className="es-tarea" style={{ animationDelay:`${i*50}ms` }}>
                  <div className="es-tarea-icon">{hecha?"✅":vencida?"⚠️":"📋"}</div>
                  <div className="es-tarea-info">
                    <div className="es-tarea-title">{t.titulo}</div>
                    <div className="es-tarea-meta"><span>🏫 {t.clase}</span><span>· Entrega: {fmtDate(t.fechaEntrega)}</span><span>· {t.puntos} pts</span></div>
                  </div>
                  <span className={`es-badge ${hecha?"ok":vencida?"danger":"warn"}`}>{hecha?"Entregada":vencida?"Vencida":"Pendiente"}</span>
                </div>
              );
            })}
          </div>
        )}

        {nav==="calendario"&&<div><div className="es-eyebrow" style={{ marginBottom:6 }}>Próximos eventos</div><div style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:24,marginBottom:22 }}>Agenda</div><div className="es-empty"><span className="es-empty-icon">📅</span><div className="es-empty-title">Sin eventos próximos</div><div className="es-empty-sub">Fechas de entrega y clases en vivo aparecerán aquí.</div></div></div>}

        {nav==="llamadas"&&<div><div className="es-eyebrow" style={{ marginBottom:6 }}>Videollamadas</div><div style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:24,marginBottom:22 }}>Llamadas</div><div className="es-empty"><span className="es-empty-icon">📞</span><div className="es-empty-title">Sin llamadas recientes</div><div className="es-empty-sub">Videollamadas y grabaciones aparecerán aquí.</div></div></div>}

      </div>
    );
  };

  return(
    <div className="es-shell">
      {/* Rail */}
      <nav className="es-rail">
        <div className="es-logo">E</div>
        {NAV.map(item=>(
          <button key={item.id}
            className={`es-rail-btn${nav===item.id&&!claseAbierta?" active":""}`}
            onClick={()=>{ setNav(item.id); setClaseAbierta(null); }}
            title={item.label}
          >
            <span className="es-rail-icon">{item.icon}</span>
            <span className="es-rail-label">{item.label}</span>
          </button>
        ))}
        <div className="es-rail-spacer"/>
        <button className="es-rail-btn" onClick={onClose} title="Volver al inicio">
          <span className="es-rail-icon">🚪</span>
          <span className="es-rail-label">Salir</span>
        </button>
        <button className="es-avatar-btn" title={yo}>{ini}</button>
      </nav>

      {/* Main */}
      <main className="es-main">
        {!claseAbierta&&(
          <header className="es-top">
            <div className="es-top-title">
              {nav==="clases"?"Clases":nav==="actividad"?"Actividad":nav==="chat"?"Chat":nav==="tareas"?"Mis tareas":nav==="calendario"?"Agenda":"Llamadas"}
            </div>
            <div className="es-search">
              <span style={{ fontSize:13,color:"var(--txt3)" }}>⌕</span>
              <input placeholder="Buscar clases, tareas, personas…" value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
            </div>
            <div className="es-top-spacer"/>
            <button className="es-top-btn" onClick={onClose}>← Inicio</button>
          </header>
        )}
        {renderBody()}
      </main>

      {/* Modal unirse */}
      {modalUnirse&&(
        <div className="es-overlay" onClick={e=>e.target===e.currentTarget&&setModalUnirse(false)}>
          <div className="es-modal">
            <button className="es-modal-close" onClick={()=>setModalUnirse(false)}>✕</button>
            <div className="es-eyebrow" style={{ marginBottom:8 }}>Acceso</div>
            <h3>Unirse a una clase</h3>
            <p>Introduce el código que te dio tu profesor. Puede ser alfanumérico como <code style={{ fontFamily:"'DM Mono',monospace",background:"var(--surface)",padding:"2px 7px",borderRadius:6,fontSize:12 }}>AB3X7K</code>.</p>
            <div className="es-field">
              <label>Código de clase</label>
              <input placeholder="Ej. AB3X7K" value={codigoUnirse}
                onChange={e=>setCodigoUnirse(e.target.value.toUpperCase())}
                onKeyDown={e=>e.key==="Enter"&&unirse()} autoFocus/>
            </div>
            <div className="es-modal-btns">
              <button className="es-btn ghost" onClick={()=>{ setModalUnirse(false); setCodigoUnirse(""); }}>Cancelar</button>
              <button className="es-btn primary" onClick={unirse} disabled={!codigoUnirse.trim()}>Unirse →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}