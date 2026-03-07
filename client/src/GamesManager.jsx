// client/src/GamesManager.jsx
// Importar en ProfessorPanel:  import TabActividades from "./GamesManager";
import { useState } from "react";

/* ─── Utilidades (propias, no dependen de ProfessorPanel) ──── */
const uid  = () => Math.random().toString(36).slice(2, 9);
const fmt  = d => new Date(d).toLocaleDateString("es-MX", { day:"2-digit", month:"short", year:"numeric" });
const fmtT = d => new Date(d).toLocaleString("es-MX", { hour:"2-digit", minute:"2-digit", day:"2-digit", month:"short" });

/* ─── Materias predefinidas ─────────────────────────────────── */
const MATERIAS = [
  "Programación Web","Base de Datos","Cálculo","Álgebra Lineal",
  "Sistemas Operativos","Inteligencia Artificial","Física","Química","Historia","Inglés",
];

/* ─── Estilos propios (no duplican los de ProfessorPanel) ───── */
const ACT_STYLES = `
.act-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
.act-card{background:linear-gradient(160deg,var(--surface) 0%,var(--panel) 100%);border:1px solid var(--border);border-radius:16px;padding:18px;cursor:pointer;transition:border-color .2s,transform .2s,box-shadow .2s;position:relative;overflow:hidden;animation:fadeUp .3s var(--ease) both}
.act-card:hover{border-color:var(--border2);transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.4)}
.act-card-accent{position:absolute;top:0;left:0;right:0;height:3px;border-radius:16px 16px 0 0}
.editor-section{background:linear-gradient(160deg,var(--surface),var(--panel));border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px}
.editor-section-title{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--indigo-lt);margin-bottom:14px;display:flex;align-items:center;gap:8px}
.q-row{display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;animation:fadeUp .25s var(--ease) both}
.q-num{width:24px;height:24px;border-radius:50%;background:var(--indigo-dim);border:1px solid var(--border2);display:grid;place-items:center;font-size:11px;font-weight:700;color:var(--indigo-lt);flex-shrink:0;margin-top:8px}
.q-input{flex:1;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--txt);background:#060914;border:1px solid var(--border);border-radius:9px;padding:8px 12px;outline:none;transition:border-color .2s,box-shadow .2s;resize:vertical}
.q-input:focus{border-color:var(--indigo);box-shadow:0 0 0 3px rgba(99,102,241,.15)}
.q-input::placeholder{color:var(--txt3);font-weight:300}
.opt-input{font-family:'DM Sans',sans-serif;font-size:12px;color:var(--txt);background:#060914;border:1px solid var(--border);border-radius:8px;padding:6px 10px;outline:none;flex:1;transition:border-color .2s}
.opt-input:focus{border-color:var(--indigo)}
.correct-dot{width:16px;height:16px;border-radius:50%;border:2px solid var(--border);cursor:pointer;flex-shrink:0;transition:all .15s;display:grid;place-items:center;margin-top:2px}
.correct-dot.on{border-color:var(--ok);background:var(--ok)}
.correct-dot.on::after{content:'✓';font-size:9px;color:#060914;font-weight:900}
.mode-btn{flex:1;padding:12px;border-radius:12px;border:2px solid var(--border);background:var(--surface);cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;text-align:center}
.mode-btn.sel-live{border-color:var(--ok);background:rgba(52,211,153,.1);color:var(--ok)}
.mode-btn.sel-prog{border-color:var(--indigo);background:var(--indigo-dim);color:var(--indigo-lt)}
.live-badge{display:inline-flex;align-items:center;gap:5px;background:var(--ok-dim);border:1px solid rgba(52,211,153,.3);color:var(--ok);font-size:10px;font-weight:700;letter-spacing:.06em;padding:2px 8px;border-radius:999px;font-family:'DM Mono',monospace}
.prog-badge{display:inline-flex;align-items:center;gap:5px;background:var(--indigo-dim);border:1px solid var(--border2);color:var(--indigo-lt);font-size:10px;font-weight:700;letter-spacing:.06em;padding:2px 8px;border-radius:999px;font-family:'DM Mono',monospace}
.draft-badge{display:inline-flex;align-items:center;gap:5px;background:var(--warn-dim);border:1px solid rgba(251,191,36,.3);color:var(--warn);font-size:10px;font-weight:700;letter-spacing:.06em;padding:2px 8px;border-radius:999px;font-family:'DM Mono',monospace}
`;

if (!document.getElementById("act-styles")) {
  const s = document.createElement("style");
  s.id = "act-styles";
  s.textContent = ACT_STYLES;
  document.head.appendChild(s);
}

/* ─── Definición de los 10 tipos de juego ────────────────────── */
const TIPOS_JUEGO = [
  { id:"ruleta",     icon:"🎯", nombre:"Ruleta de preguntas",      color:"#6366f1", desc:"Selecciona alumnos al azar para responder preguntas." },
  { id:"duelo",      icon:"⚡", nombre:"Duelo de rapidez",          color:"#f0c060", desc:"Quien responde primero y bien gana puntos." },
  { id:"vf_live",    icon:"✅", nombre:"Votación V / F",             color:"#34d399", desc:"Votación en tiempo real sobre afirmaciones." },
  { id:"nube",       icon:"☁️", nombre:"Nube de palabras",           color:"#38bdf8", desc:"Respuestas abiertas que forman una nube visual." },
  { id:"equipos",    icon:"👥", nombre:"Trabajo en equipos",         color:"#a78bfa", desc:"Divide la clase y asigna retos por equipo." },
  { id:"bingo",      icon:"🎱", nombre:"Bingo de conceptos",         color:"#f472b6", desc:"Cartones con términos clave de la unidad." },
  { id:"escape",     icon:"🔐", nombre:"Escape room digital",        color:"#fb923c", desc:"Retos encadenados: resuelve uno para desbloquear el siguiente." },
  { id:"debate",     icon:"⏱️", nombre:"Debate cronometrado",        color:"#e879f9", desc:"Dos bandos argumentan con tiempo límite visible." },
  { id:"meme",       icon:"😂", nombre:"Explícalo con un meme",      color:"#4ade80", desc:"Los alumnos explican conceptos con memes y votan." },
  { id:"termometro", icon:"🌡️", nombre:"Termómetro de comprensión",  color:"#f87171", desc:"Diagnóstico rápido de comprensión con emojis." },
];

/* ══════════════════════════════════════════════════════════════
   HELPERS DE CAMPOS (reutilizados en todos los editores)
══════════════════════════════════════════════════════════════ */
const Fld = ({ label, children }) => (
  <div className="field">{label && <label>{label}</label>}{children}</div>
);
const Inp = ({ value, onChange, placeholder, type = "text", style, ...p }) => (
  <input
    className="q-input"
    style={{ minHeight:"unset", resize:"none", ...style }}
    type={type} value={value} onChange={onChange} placeholder={placeholder}
    onFocus={e => e.target.style.borderColor = "var(--indigo)"}
    onBlur={e  => e.target.style.borderColor = "var(--border)"}
    {...p}
  />
);
const Sel = ({ value, onChange, children, style }) => (
  <select
    className="q-input"
    style={{ minHeight:"unset", cursor:"pointer", paddingRight:32,
      backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234e6090' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
      backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center",
      WebkitAppearance:"none", appearance:"none", ...style }}
    value={value} onChange={onChange}
  >{children}</select>
);
const MatSel = ({ value, onChange }) => (
  <Sel value={value} onChange={onChange}>
    {MATERIAS.map(m => <option key={m}>{m}</option>)}
  </Sel>
);
const DelBtn = ({ onClick }) => (
  <button className="btn btn-danger btn-icon btn-sm" onClick={onClick}>✕</button>
);

/* ══════════════════════════════════════════════════════════════
   EDITORES — uno por tipo de juego
══════════════════════════════════════════════════════════════ */

/* ── 1. Ruleta de preguntas ─────────────────────────────────── */
function EditorRuleta({ data, onChange }) {
  const d = { titulo:"", materia:"Programación Web", preguntas:[""], alumnos:[""], tiempo:30, ...data };
  const set = k => v => onChange({ ...d, [k]:v });
  const updArr = (arr, i, val, key) => { const a = [...arr]; a[i] = val; onChange({ ...d, [key]:a }); };

  return (
    <>
      <div className="editor-section">
        <div className="editor-section-title">⚙️ Configuración general</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Fld label="Título"><Inp value={d.titulo} onChange={e => set("titulo")(e.target.value)} placeholder="Ej. Repaso Unidad 2"/></Fld>
          <Fld label="Materia"><MatSel value={d.materia} onChange={e => set("materia")(e.target.value)}/></Fld>
        </div>
        <Fld label="Tiempo por pregunta (seg)">
          <Inp type="number" min="5" value={d.tiempo} onChange={e => set("tiempo")(e.target.value)} style={{ width:120 }}/>
        </Fld>
      </div>

      <div className="editor-section">
        <div className="editor-section-title">❓ Preguntas de la ruleta</div>
        {d.preguntas.map((p, i) => (
          <div key={i} className="q-row">
            <div className="q-num">{i + 1}</div>
            <textarea className="q-input" rows={2} value={p}
              onChange={e => updArr(d.preguntas, i, e.target.value, "preguntas")}
              placeholder={`Pregunta ${i + 1}`}/>
            {d.preguntas.length > 1 && <DelBtn onClick={() => onChange({ ...d, preguntas: d.preguntas.filter((_, j) => j !== i) })}/>}
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={() => onChange({ ...d, preguntas:[...d.preguntas, ""] })}>+ Agregar pregunta</button>
      </div>

      <div className="editor-section">
        <div className="editor-section-title">👤 Lista de alumnos (selección aleatoria)</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8 }}>
          {d.alumnos.map((a, i) => (
            <div key={i} style={{ display:"flex", gap:6 }}>
              <Inp value={a} onChange={e => updArr(d.alumnos, i, e.target.value, "alumnos")} placeholder={`Alumno ${i + 1}`}/>
              {d.alumnos.length > 1 && <DelBtn onClick={() => onChange({ ...d, alumnos: d.alumnos.filter((_, j) => j !== i) })}/>}
            </div>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginTop:8 }} onClick={() => onChange({ ...d, alumnos:[...d.alumnos, ""] })}>+ Agregar alumno</button>
      </div>
    </>
  );
}

/* ── 2. Duelo de rapidez ────────────────────────────────────── */
function EditorDuelo({ data, onChange }) {
  const d = { titulo:"", materia:"Cálculo", preguntas:[{ enunciado:"", opciones:["","","",""], correcta:0, puntos:10 }], tiempo:20, mostrarPos:true, ...data };
  const set  = k => v => onChange({ ...d, [k]:v });
  const setP = (i, fn) => { const ps = [...d.preguntas]; ps[i] = fn(ps[i]); onChange({ ...d, preguntas:ps }); };

  return (
    <>
      <div className="editor-section">
        <div className="editor-section-title">⚙️ Configuración</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Fld label="Título"><Inp value={d.titulo} onChange={e => set("titulo")(e.target.value)} placeholder="Ej. Speed Quiz — Derivadas"/></Fld>
          <Fld label="Materia"><MatSel value={d.materia} onChange={e => set("materia")(e.target.value)}/></Fld>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <Fld label="Segundos por pregunta"><Inp type="number" min="5" value={d.tiempo} onChange={e => set("tiempo")(e.target.value)} style={{ width:110 }}/></Fld>
          <Fld label=" ">
            <label style={{ display:"flex", alignItems:"center", gap:7, marginTop:20, cursor:"pointer", fontSize:13, color:"var(--txt2)" }}>
              <input type="checkbox" checked={d.mostrarPos} onChange={e => set("mostrarPos")(e.target.checked)} style={{ accentColor:"var(--indigo)", width:"auto" }}/>
              Mostrar posiciones en vivo
            </label>
          </Fld>
        </div>
      </div>

      <div className="editor-section">
        <div className="editor-section-title">❓ Preguntas y opciones</div>
        {d.preguntas.map((p, i) => (
          <div key={i} style={{ background:"var(--raised)", border:"1px solid var(--border)", borderRadius:12, padding:14, marginBottom:12 }}>
            <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
              <div className="q-num" style={{ margin:0 }}>{i + 1}</div>
              <textarea className="q-input" rows={2} value={p.enunciado}
                onChange={e => setP(i, x => ({ ...x, enunciado:e.target.value }))}
                placeholder="Escribe la pregunta…" style={{ flex:1 }}/>
              <Inp type="number" min="1" value={p.puntos}
                onChange={e => setP(i, x => ({ ...x, puntos:e.target.value }))}
                placeholder="Pts" style={{ width:70 }}/>
              {d.preguntas.length > 1 && <DelBtn onClick={() => onChange({ ...d, preguntas: d.preguntas.filter((_, j) => j !== i) })}/>}
            </div>
            <div style={{ paddingLeft:32 }}>
              <div style={{ fontSize:11, color:"var(--txt3)", marginBottom:6, textTransform:"uppercase", letterSpacing:".06em", fontWeight:600 }}>
                Opciones (marca la correcta ✓)
              </div>
              {p.opciones.map((op, oi) => (
                <div key={oi} style={{ display:"flex", gap:7, alignItems:"center", marginBottom:6 }}>
                  <div className={`correct-dot${p.correcta === oi ? " on" : ""}`} onClick={() => setP(i, x => ({ ...x, correcta:oi }))}/>
                  <input className="opt-input" value={op}
                    onChange={e => { const arr = [...p.opciones]; arr[oi] = e.target.value; setP(i, x => ({ ...x, opciones:arr })); }}
                    placeholder={`Opción ${oi + 1}`}
                    onFocus={e => e.target.style.borderColor = "var(--indigo)"}
                    onBlur={e  => e.target.style.borderColor = "var(--border)"}/>
                  {p.opciones.length > 2 && <DelBtn onClick={() => setP(i, x => ({ ...x, opciones: x.opciones.filter((_, j) => j !== oi), correcta:0 }))}/>}
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={() => setP(i, x => ({ ...x, opciones:[...x.opciones, ""] }))}>+ Opción</button>
            </div>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm"
          onClick={() => onChange({ ...d, preguntas:[...d.preguntas, { enunciado:"", opciones:["","","",""], correcta:0, puntos:10 }] })}>
          + Agregar pregunta
        </button>
      </div>
    </>
  );
}

/* ── 3. Votación V/F ────────────────────────────────────────── */
function EditorVF({ data, onChange }) {
  const d = { titulo:"", materia:"Física", afirmaciones:[{ texto:"", correcta:true, explicacion:"" }], tiempo:15, ...data };
  const set  = k => v => onChange({ ...d, [k]:v });
  const setA = (i, fn) => { const as = [...d.afirmaciones]; as[i] = fn(as[i]); onChange({ ...d, afirmaciones:as }); };

  return (
    <>
      <div className="editor-section">
        <div className="editor-section-title">⚙️ Configuración</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Fld label="Título"><Inp value={d.titulo} onChange={e => set("titulo")(e.target.value)} placeholder="Ej. V/F — Leyes de Newton"/></Fld>
          <Fld label="Materia"><MatSel value={d.materia} onChange={e => set("materia")(e.target.value)}/></Fld>
        </div>
        <Fld label="Segundos para votar">
          <Inp type="number" min="5" value={d.tiempo} onChange={e => set("tiempo")(e.target.value)} style={{ width:110 }}/>
        </Fld>
      </div>

      <div className="editor-section">
        <div className="editor-section-title">📋 Afirmaciones</div>
        {d.afirmaciones.map((a, i) => (
          <div key={i} style={{ background:"var(--raised)", border:"1px solid var(--border)", borderRadius:12, padding:14, marginBottom:10 }}>
            <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:10 }}>
              <div className="q-num" style={{ margin:0 }}>{i + 1}</div>
              <textarea className="q-input" rows={2} value={a.texto}
                onChange={e => setA(i, x => ({ ...x, texto:e.target.value }))}
                placeholder="Escribe la afirmación…" style={{ flex:1 }}/>
              {d.afirmaciones.length > 1 && <DelBtn onClick={() => onChange({ ...d, afirmaciones: d.afirmaciones.filter((_, j) => j !== i) })}/>}
            </div>
            <div style={{ paddingLeft:32, display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
              <span style={{ fontSize:12, color:"var(--txt3)", fontWeight:600 }}>Correcta:</span>
              {[true, false].map(v => (
                <button key={String(v)} onClick={() => setA(i, x => ({ ...x, correcta:v }))}
                  style={{ padding:"6px 16px", borderRadius:8,
                    border:`1px solid ${a.correcta === v ? (v ? "var(--ok)" : "var(--danger)") : "var(--border)"}`,
                    background: a.correcta === v ? (v ? "var(--ok-dim)" : "var(--danger-dim)") : "var(--surface)",
                    color: a.correcta === v ? (v ? "var(--ok)" : "var(--danger)") : "var(--txt3)",
                    fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  {v ? "✅ Verdadero" : "❌ Falso"}
                </button>
              ))}
              <Inp value={a.explicacion} onChange={e => setA(i, x => ({ ...x, explicacion:e.target.value }))}
                placeholder="Explicación (opcional)" style={{ flex:1, minWidth:180 }}/>
            </div>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm"
          onClick={() => onChange({ ...d, afirmaciones:[...d.afirmaciones, { texto:"", correcta:true, explicacion:"" }] })}>
          + Agregar afirmación
        </button>
      </div>
    </>
  );
}

/* ── 4. Nube de palabras ────────────────────────────────────── */
function EditorNube({ data, onChange }) {
  const d = { titulo:"", materia:"Historia", pregunta:"", maxPalabras:3, tiempo:60, semillas:[], ...data };
  const set = k => v => onChange({ ...d, [k]:v });

  return (
    <>
      <div className="editor-section">
        <div className="editor-section-title">⚙️ Configuración</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Fld label="Título"><Inp value={d.titulo} onChange={e => set("titulo")(e.target.value)} placeholder="Ej. ¿Qué sé sobre integrales?"/></Fld>
          <Fld label="Materia"><MatSel value={d.materia} onChange={e => set("materia")(e.target.value)}/></Fld>
        </div>
        <Fld label="Consigna para los alumnos">
          <textarea className="q-input" rows={2} value={d.pregunta}
            onChange={e => set("pregunta")(e.target.value)}
            placeholder="Ej. Escribe 3 palabras que asocies con 'derivada'"/>
        </Fld>
        <div style={{ display:"flex", gap:12 }}>
          <Fld label="Máx. palabras por alumno">
            <Inp type="number" min="1" max="10" value={d.maxPalabras} onChange={e => set("maxPalabras")(e.target.value)} style={{ width:90 }}/>
          </Fld>
          <Fld label="Tiempo abierto (seg)">
            <Inp type="number" min="10" value={d.tiempo} onChange={e => set("tiempo")(e.target.value)} style={{ width:90 }}/>
          </Fld>
        </div>
      </div>

      <div className="editor-section">
        <div className="editor-section-title">🌱 Palabras semilla (opcionales)</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          {d.semillas.map((s, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:4, background:"var(--indigo-dim)", border:"1px solid var(--border2)", borderRadius:999, padding:"4px 10px" }}>
              <span style={{ fontSize:13, color:"var(--indigo-lt)" }}>{s}</span>
              <button style={{ background:"none", border:"none", cursor:"pointer", color:"var(--txt3)", fontSize:12, padding:0 }}
                onClick={() => set("semillas")(d.semillas.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          <input className="opt-input" style={{ width:160 }} placeholder="Agregar + Enter"
            onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { set("semillas")([...d.semillas, e.target.value.trim()]); e.target.value = ""; } }}
            onFocus={e => e.target.style.borderColor = "var(--indigo)"}
            onBlur={e  => e.target.style.borderColor = "var(--border)"}/>
        </div>
      </div>
    </>
  );
}

/* ── 5. Trabajo en equipos ──────────────────────────────────── */
function EditorEquipos({ data, onChange }) {
  const d = { titulo:"", materia:"Álgebra Lineal", numEquipos:4, retos:[{ equipo:1, reto:"", recursos:"" }], tiempo:25, metodoDivision:"aleatorio", ...data };
  const set  = k => v => onChange({ ...d, [k]:v });
  const setR = (i, fn) => { const rs = [...d.retos]; rs[i] = fn(rs[i]); onChange({ ...d, retos:rs }); };

  return (
    <>
      <div className="editor-section">
        <div className="editor-section-title">⚙️ Configuración de equipos</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Fld label="Título"><Inp value={d.titulo} onChange={e => set("titulo")(e.target.value)} placeholder="Ej. Taller — Matrices por equipos"/></Fld>
          <Fld label="Materia"><MatSel value={d.materia} onChange={e => set("materia")(e.target.value)}/></Fld>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <Fld label="Número de equipos">
            <Inp type="number" min="2" max="10" value={d.numEquipos} onChange={e => set("numEquipos")(e.target.value)} style={{ width:90 }}/>
          </Fld>
          <Fld label="Tiempo (min)">
            <Inp type="number" min="5" value={d.tiempo} onChange={e => set("tiempo")(e.target.value)} style={{ width:90 }}/>
          </Fld>
          <Fld label="División">
            <Sel value={d.metodoDivision} onChange={e => set("metodoDivision")(e.target.value)}>
              <option value="aleatorio">Aleatoria</option>
              <option value="manual">Manual</option>
              <option value="habilidad">Por nivel</option>
            </Sel>
          </Fld>
        </div>
      </div>

      <div className="editor-section">
        <div className="editor-section-title">📋 Retos por equipo</div>
        {d.retos.map((r, i) => (
          <div key={i} style={{ background:"var(--raised)", border:"1px solid var(--border)", borderRadius:12, padding:14, marginBottom:10 }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8 }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"var(--indigo-lt)", fontWeight:700, background:"var(--indigo-dim)", border:"1px solid var(--border2)", padding:"3px 10px", borderRadius:999 }}>
                Equipo {r.equipo}
              </div>
              <Sel value={r.equipo} onChange={e => setR(i, x => ({ ...x, equipo:Number(e.target.value) }))} style={{ width:120 }}>
                {Array.from({ length: Number(d.numEquipos) || 4 }, (_, j) => <option key={j + 1} value={j + 1}>{j + 1}</option>)}
              </Sel>
              {d.retos.length > 1 && <DelBtn onClick={() => onChange({ ...d, retos: d.retos.filter((_, j) => j !== i) })}/>}
            </div>
            <Fld label="Reto / Problema">
              <textarea className="q-input" rows={2} value={r.reto}
                onChange={e => setR(i, x => ({ ...x, reto:e.target.value }))}
                placeholder="Describe el problema o actividad del equipo…"/>
            </Fld>
            <Fld label="Recursos o pistas">
              <Inp value={r.recursos} onChange={e => setR(i, x => ({ ...x, recursos:e.target.value }))} placeholder="Ej. Ver sección 3.2 del libro…"/>
            </Fld>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm"
          onClick={() => onChange({ ...d, retos:[...d.retos, { equipo:1, reto:"", recursos:"" }] })}>
          + Agregar reto
        </button>
      </div>
    </>
  );
}

/* ── 6. Bingo de conceptos ──────────────────────────────────── */
function EditorBingo({ data, onChange }) {
  const d = { titulo:"", materia:"Base de Datos", conceptos:[{ termino:"", definicion:"" }], tamanio:"3x3", ...data };
  const set  = k => v => onChange({ ...d, [k]:v });
  const setC = (i, fn) => { const cs = [...d.conceptos]; cs[i] = fn(cs[i]); onChange({ ...d, conceptos:cs }); };
  const minimo = { "3x3":9, "4x4":16, "5x5":25 }[d.tamanio] || 9;

  return (
    <>
      <div className="editor-section">
        <div className="editor-section-title">⚙️ Configuración</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          <Fld label="Título"><Inp value={d.titulo} onChange={e => set("titulo")(e.target.value)} placeholder="Ej. Bingo SQL"/></Fld>
          <Fld label="Materia"><MatSel value={d.materia} onChange={e => set("materia")(e.target.value)}/></Fld>
          <Fld label="Tamaño del cartón">
            <Sel value={d.tamanio} onChange={e => set("tamanio")(e.target.value)}>
              <option value="3x3">3×3 (9 casillas)</option>
              <option value="4x4">4×4 (16 casillas)</option>
              <option value="5x5">5×5 (25 casillas)</option>
            </Sel>
          </Fld>
        </div>
        <div style={{ padding:"8px 12px", background:"var(--warn-dim)", border:"1px solid rgba(251,191,36,.25)", borderRadius:9, fontSize:12, color:"var(--warn)" }}>
          ⚠️ Necesitas mínimo <b>{minimo} conceptos</b> para cartón {d.tamanio}. Tienes: <b>{d.conceptos.length}</b>
        </div>
      </div>

      <div className="editor-section">
        <div className="editor-section-title">📝 Conceptos y definiciones</div>
        {d.conceptos.map((c, i) => (
          <div key={i} className="q-row">
            <div className="q-num">{i + 1}</div>
            <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1.5fr", gap:8 }}>
              <Inp value={c.termino}    onChange={e => setC(i, x => ({ ...x, termino:e.target.value }))}    placeholder={`Término ${i + 1}`}/>
              <Inp value={c.definicion} onChange={e => setC(i, x => ({ ...x, definicion:e.target.value }))} placeholder="Definición que leerá el profesor…"/>
            </div>
            {d.conceptos.length > 1 && <DelBtn onClick={() => onChange({ ...d, conceptos: d.conceptos.filter((_, j) => j !== i) })}/>}
          </div>
        ))}
        <button className="btn btn-ghost btn-sm"
          onClick={() => onChange({ ...d, conceptos:[...d.conceptos, { termino:"", definicion:"" }] })}>
          + Agregar concepto
        </button>
      </div>
    </>
  );
}

/* ── 7. Escape room ─────────────────────────────────────────── */
function EditorEscape({ data, onChange }) {
  const d = {
    titulo:"", materia:"Programación Web", tiempo:40,
    estaciones:[{ nombre:"Estación 1", descripcion:"", pista:"", tipo:"quiz", preguntas:[{ texto:"", respuesta:"" }] }],
    ...data
  };
  const set  = k => v => onChange({ ...d, [k]:v });
  const setE = (i, fn) => { const es = [...d.estaciones]; es[i] = fn(es[i]); onChange({ ...d, estaciones:es }); };
  const setEQ = (ei, qi, fn) => {
    const es = [...d.estaciones];
    es[ei] = { ...es[ei], preguntas: es[ei].preguntas.map((q, j) => j === qi ? fn(q) : q) };
    onChange({ ...d, estaciones:es });
  };

  return (
    <>
      <div className="editor-section">
        <div className="editor-section-title">⚙️ Configuración</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Fld label="Título"><Inp value={d.titulo} onChange={e => set("titulo")(e.target.value)} placeholder="Ej. Escape — Fundamentos HTML"/></Fld>
          <Fld label="Materia"><MatSel value={d.materia} onChange={e => set("materia")(e.target.value)}/></Fld>
        </div>
        <Fld label="Tiempo total (min)">
          <Inp type="number" min="10" value={d.tiempo} onChange={e => set("tiempo")(e.target.value)} style={{ width:100 }}/>
        </Fld>
      </div>

      <div className="editor-section">
        <div className="editor-section-title">🔐 Estaciones</div>
        {d.estaciones.map((e, ei) => (
          <div key={ei} style={{ background:"var(--raised)", border:`1px solid ${ei === 0 ? "rgba(240,192,96,.3)" : "var(--border)"}`, borderRadius:12, padding:14, marginBottom:12 }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"var(--gold)", fontWeight:700, background:"rgba(240,192,96,.12)", border:"1px solid rgba(240,192,96,.25)", padding:"3px 10px", borderRadius:999 }}>
                #{ei + 1}
              </div>
              <Inp value={e.nombre} onChange={ev => setE(ei, x => ({ ...x, nombre:ev.target.value }))} placeholder="Nombre de estación" style={{ flex:1 }}/>
              <Sel value={e.tipo} onChange={ev => setE(ei, x => ({ ...x, tipo:ev.target.value }))} style={{ width:150 }}>
                <option value="quiz">Quiz</option>
                <option value="abierta">Respuesta abierta</option>
                <option value="codigo">Fragmento de código</option>
              </Sel>
              {d.estaciones.length > 1 && <DelBtn onClick={() => onChange({ ...d, estaciones: d.estaciones.filter((_, j) => j !== ei) })}/>}
            </div>
            <Fld label="Descripción del reto">
              <textarea className="q-input" rows={2} value={e.descripcion}
                onChange={ev => setE(ei, x => ({ ...x, descripcion:ev.target.value }))}
                placeholder="Qué debe hacer el alumno…"/>
            </Fld>
            <Fld label="Pista">
              <Inp value={e.pista} onChange={ev => setE(ei, x => ({ ...x, pista:ev.target.value }))} placeholder="Pista opcional si pide ayuda…"/>
            </Fld>
            <div style={{ fontSize:11, color:"var(--txt3)", textTransform:"uppercase", letterSpacing:".06em", fontWeight:600, margin:"10px 0 6px" }}>
              Preguntas de verificación
            </div>
            {e.preguntas.map((q, qi) => (
              <div key={qi} style={{ display:"flex", gap:8, marginBottom:6 }}>
                <Inp value={q.texto}     onChange={ev => setEQ(ei, qi, x => ({ ...x, texto:ev.target.value }))}     placeholder="Pregunta"/>
                <Inp value={q.respuesta} onChange={ev => setEQ(ei, qi, x => ({ ...x, respuesta:ev.target.value }))} placeholder="Respuesta correcta" style={{ width:160 }}/>
                {e.preguntas.length > 1 && <DelBtn onClick={() => setE(ei, x => ({ ...x, preguntas: x.preguntas.filter((_, j) => j !== qi) }))}/>}
              </div>
            ))}
            <button className="btn btn-ghost btn-sm"
              onClick={() => setE(ei, x => ({ ...x, preguntas:[...x.preguntas, { texto:"", respuesta:"" }] }))}>
              + Pregunta
            </button>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm"
          onClick={() => onChange({ ...d, estaciones:[...d.estaciones, { nombre:`Estación ${d.estaciones.length + 1}`, descripcion:"", pista:"", tipo:"quiz", preguntas:[{ texto:"", respuesta:"" }] }] })}>
          + Agregar estación
        </button>
      </div>
    </>
  );
}

/* ── 8. Debate cronometrado ─────────────────────────────────── */
function EditorDebate({ data, onChange }) {
  const d = { titulo:"", materia:"Inglés", tema:"", posicionA:"A favor", posicionB:"En contra", argumentos:[{ bando:"A", argumento:"" }], tiempoArgumento:90, tiempoReplica:45, ...data };
  const set  = k => v => onChange({ ...d, [k]:v });
  const setA = (i, fn) => { const as = [...d.argumentos]; as[i] = fn(as[i]); onChange({ ...d, argumentos:as }); };

  return (
    <>
      <div className="editor-section">
        <div className="editor-section-title">⚙️ Configuración del debate</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Fld label="Título"><Inp value={d.titulo} onChange={e => set("titulo")(e.target.value)} placeholder="Ej. Debate — IA en la educación"/></Fld>
          <Fld label="Materia"><MatSel value={d.materia} onChange={e => set("materia")(e.target.value)}/></Fld>
        </div>
        <Fld label="Tema del debate">
          <textarea className="q-input" rows={2} value={d.tema}
            onChange={e => set("tema")(e.target.value)} placeholder="Ej. ¿Debe permitirse el uso de IA en los exámenes?"/>
        </Fld>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10 }}>
          <Fld label="Posición A (Verde)"><Inp value={d.posicionA} onChange={e => set("posicionA")(e.target.value)}/></Fld>
          <Fld label="Posición B (Roja)"><Inp value={d.posicionB} onChange={e => set("posicionB")(e.target.value)}/></Fld>
          <Fld label="Argumento (seg)"><Inp type="number" min="30" value={d.tiempoArgumento} onChange={e => set("tiempoArgumento")(e.target.value)}/></Fld>
          <Fld label="Réplica (seg)"><Inp type="number" min="15" value={d.tiempoReplica} onChange={e => set("tiempoReplica")(e.target.value)}/></Fld>
        </div>
      </div>

      <div className="editor-section">
        <div className="editor-section-title">💬 Puntos de partida</div>
        {d.argumentos.map((a, i) => (
          <div key={i} className="q-row">
            <div className="q-num">{i + 1}</div>
            <Sel value={a.bando} onChange={e => setA(i, x => ({ ...x, bando:e.target.value }))} style={{ width:130, flex:"none" }}>
              <option value="A">Bando A</option>
              <option value="B">Bando B</option>
            </Sel>
            <Inp value={a.argumento} onChange={e => setA(i, x => ({ ...x, argumento:e.target.value }))} placeholder="Argumento inicial o guía…"/>
            {d.argumentos.length > 1 && <DelBtn onClick={() => onChange({ ...d, argumentos: d.argumentos.filter((_, j) => j !== i) })}/>}
          </div>
        ))}
        <button className="btn btn-ghost btn-sm"
          onClick={() => onChange({ ...d, argumentos:[...d.argumentos, { bando:"A", argumento:"" }] })}>
          + Agregar argumento
        </button>
      </div>
    </>
  );
}

/* ── 9. Meme educativo ──────────────────────────────────────── */
function EditorMeme({ data, onChange }) {
  const d = {
    titulo:"", materia:"Programación Web", concepto:"", tiempo:15,
    plantillas:["Drakeposting","Distracted Boyfriend","Two Buttons","Expanding Brain","Change My Mind"],
    criterios:["Claridad del concepto","Creatividad","Humor relacionado al tema"],
    ...data
  };
  const set = k => v => onChange({ ...d, [k]:v });
  const updArr = (arr, i, val, key) => { const a = [...arr]; a[i] = val; set(key)(a); };

  return (
    <>
      <div className="editor-section">
        <div className="editor-section-title">⚙️ Configuración</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Fld label="Título"><Inp value={d.titulo} onChange={e => set("titulo")(e.target.value)} placeholder="Ej. Explica recursión con un meme"/></Fld>
          <Fld label="Materia"><MatSel value={d.materia} onChange={e => set("materia")(e.target.value)}/></Fld>
        </div>
        <Fld label="Concepto a explicar">
          <Inp value={d.concepto} onChange={e => set("concepto")(e.target.value)} placeholder="Ej. Recursión, Herencia en POO…"/>
        </Fld>
        <Fld label="Tiempo para crear (min)">
          <Inp type="number" min="5" value={d.tiempo} onChange={e => set("tiempo")(e.target.value)} style={{ width:100 }}/>
        </Fld>
      </div>

      <div className="editor-section">
        <div className="editor-section-title">🖼️ Plantillas disponibles</div>
        {d.plantillas.map((p, i) => (
          <div key={i} className="q-row">
            <div className="q-num">{i + 1}</div>
            <Inp value={p} onChange={e => updArr(d.plantillas, i, e.target.value, "plantillas")} placeholder="Nombre de plantilla"/>
            {d.plantillas.length > 1 && <DelBtn onClick={() => set("plantillas")(d.plantillas.filter((_, j) => j !== i))}/>}
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={() => set("plantillas")([...d.plantillas, ""])}>+ Agregar plantilla</button>
      </div>

      <div className="editor-section">
        <div className="editor-section-title">🏆 Criterios de votación</div>
        {d.criterios.map((c, i) => (
          <div key={i} className="q-row">
            <div className="q-num">{i + 1}</div>
            <Inp value={c} onChange={e => updArr(d.criterios, i, e.target.value, "criterios")} placeholder="Criterio"/>
            {d.criterios.length > 1 && <DelBtn onClick={() => set("criterios")(d.criterios.filter((_, j) => j !== i))}/>}
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={() => set("criterios")([...d.criterios, ""])}>+ Agregar criterio</button>
      </div>
    </>
  );
}

/* ── 10. Termómetro de comprensión ──────────────────────────── */
function EditorTermometro({ data, onChange }) {
  const d = {
    titulo:"", materia:"Sistemas Operativos",
    preguntaProfesor:"¿Cómo van con el tema?",
    mostrarAnonimo:true,
    opciones:[
      { emoji:"😎", etiqueta:"Todo claro",          color:"#34d399" },
      { emoji:"🤔", etiqueta:"Tengo dudas",          color:"#fbbf24" },
      { emoji:"😵", etiqueta:"Perdido/a",            color:"#f87171" },
      { emoji:"💡", etiqueta:"Tengo una pregunta",   color:"#818cf8" },
    ],
    ...data
  };
  const set  = k => v => onChange({ ...d, [k]:v });
  const setO = (i, fn) => { const os = [...d.opciones]; os[i] = fn(os[i]); onChange({ ...d, opciones:os }); };

  return (
    <>
      <div className="editor-section">
        <div className="editor-section-title">⚙️ Configuración</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Fld label="Título"><Inp value={d.titulo} onChange={e => set("titulo")(e.target.value)} placeholder="Ej. Termómetro — Derivadas"/></Fld>
          <Fld label="Materia"><MatSel value={d.materia} onChange={e => set("materia")(e.target.value)}/></Fld>
        </div>
        <Fld label="Pregunta que verán los alumnos">
          <Inp value={d.preguntaProfesor} onChange={e => set("preguntaProfesor")(e.target.value)} placeholder="Ej. ¿Cómo vas con el tema de hoy?"/>
        </Fld>
        <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--txt2)", cursor:"pointer" }}>
          <input type="checkbox" checked={d.mostrarAnonimo} onChange={e => set("mostrarAnonimo")(e.target.checked)} style={{ accentColor:"var(--indigo)", width:"auto" }}/>
          Respuestas anónimas para los alumnos
        </label>
      </div>

      <div className="editor-section">
        <div className="editor-section-title">😊 Opciones de respuesta</div>
        {d.opciones.map((o, i) => (
          <div key={i} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8, padding:"8px 12px", background:"var(--raised)", borderRadius:10, border:"1px solid var(--border)" }}>
            <Inp value={o.emoji}    onChange={e => setO(i, x => ({ ...x, emoji:e.target.value }))}    style={{ width:54, textAlign:"center", fontSize:20 }}/>
            <Inp value={o.etiqueta} onChange={e => setO(i, x => ({ ...x, etiqueta:e.target.value }))} placeholder="Etiqueta" style={{ flex:1 }}/>
            <input type="color" value={o.color} onChange={e => setO(i, x => ({ ...x, color:e.target.value }))}
              style={{ width:36, height:32, borderRadius:6, border:"1px solid var(--border)", cursor:"pointer", background:"none", padding:2 }}/>
            {d.opciones.length > 2 && <DelBtn onClick={() => onChange({ ...d, opciones: d.opciones.filter((_, j) => j !== i) })}/>}
          </div>
        ))}
        <button className="btn btn-ghost btn-sm"
          onClick={() => onChange({ ...d, opciones:[...d.opciones, { emoji:"🙂", etiqueta:"Nueva opción", color:"#8fa0c8" }] })}>
          + Agregar opción
        </button>
      </div>
    </>
  );
}

/* ── Mapa tipo → editor ──────────────────────────────────────── */
const EDITORES = {
  ruleta:     EditorRuleta,
  duelo:      EditorDuelo,
  vf_live:    EditorVF,
  nube:       EditorNube,
  equipos:    EditorEquipos,
  bingo:      EditorBingo,
  escape:     EditorEscape,
  debate:     EditorDebate,
  meme:       EditorMeme,
  termometro: EditorTermometro,
};

/* ══════════════════════════════════════════════════════════════
   TabActividades — componente exportado
══════════════════════════════════════════════════════════════ */
export default function TabActividades({ showToast }) {
  const [vista,       setVista]       = useState("lista"); // lista | selector | crear | editar
  const [actividades, setActividades] = useState([
    {
      id:uid(), tipo:"duelo", titulo:"Speed Quiz — Derivadas", materia:"Cálculo",
      modo:"live", estado:"borrador", fecha:new Date().toISOString(),
      data:{ titulo:"Speed Quiz — Derivadas", materia:"Cálculo", tiempo:20, mostrarPos:true,
        preguntas:[
          { enunciado:"¿Cuál es la derivada de x²?", opciones:["2x","x","x³","2"], correcta:0, puntos:10 },
          { enunciado:"¿Qué representa la integral definida?", opciones:["Área bajo la curva","Pendiente","Límite","Derivada"], correcta:0, puntos:10 },
        ]},
    },
    {
      id:uid(), tipo:"vf_live", titulo:"V/F — Leyes de Newton", materia:"Física",
      modo:"programado", estado:"publicado", fechaProg:new Date(Date.now() + 86400000 * 2).toISOString(),
      fecha:new Date(Date.now() - 3600000).toISOString(),
      data:{ titulo:"V/F — Leyes de Newton", materia:"Física", tiempo:15,
        afirmaciones:[
          { texto:"La masa y el peso son la misma magnitud.", correcta:false, explicacion:"La masa es cantidad de materia; el peso es fuerza gravitacional." },
          { texto:"En ausencia de fuerzas, un objeto en movimiento continúa moviéndose.", correcta:true, explicacion:"Primera Ley de Newton — Inercia." },
        ]},
    },
    {
      id:uid(), tipo:"bingo", titulo:"Bingo SQL", materia:"Base de Datos",
      modo:"live", estado:"borrador", fecha:new Date(Date.now() - 86400000).toISOString(),
      data:{ titulo:"Bingo SQL", materia:"Base de Datos", tamanio:"3x3",
        conceptos:[
          { termino:"JOIN",        definicion:"Combina filas de dos o más tablas" },
          { termino:"SELECT",      definicion:"Recupera datos de una tabla" },
          { termino:"WHERE",       definicion:"Filtra filas según una condición" },
          { termino:"GROUP BY",    definicion:"Agrupa filas con valores iguales" },
          { termino:"ORDER BY",    definicion:"Ordena el resultado" },
          { termino:"INSERT",      definicion:"Agrega nuevas filas" },
          { termino:"DELETE",      definicion:"Elimina filas" },
          { termino:"UPDATE",      definicion:"Modifica filas existentes" },
          { termino:"PRIMARY KEY", definicion:"Identificador único de una fila" },
        ]},
    },
  ]);
  const [editingId,  setEditingId]  = useState(null);
  const [draft,      setDraft]      = useState(null);
  const [tipoSel,    setTipoSel]    = useState(null);
  const [detalleId,  setDetalleId]  = useState(null);
  const [filtroMat,  setFiltroMat]  = useState("");
  const [filtroEst,  setFiltroEst]  = useState("");
  const [buscar,     setBuscar]     = useState("");

  const tipoInfo = id => TIPOS_JUEGO.find(t => t.id === id) || {};

  /* ── Filtros ── */
  const listaFiltrada = actividades.filter(a => {
    const okM = !filtroMat || a.materia === filtroMat;
    const okE = !filtroEst || a.estado  === filtroEst;
    const ql  = buscar.toLowerCase();
    const okQ = !ql || a.titulo.toLowerCase().includes(ql) || a.materia.toLowerCase().includes(ql);
    return okM && okE && okQ;
  });

  /* ── CRUD ── */
  const iniciarCrear  = tipo => { setTipoSel(tipo); setEditingId(null); setDraft({ titulo:"", materia:"Programación Web", modo:"live", fechaProg:"" }); setVista("crear"); };
  const iniciarEditar = act  => { setTipoSel(act.tipo); setEditingId(act.id); setDraft({ ...act.data, modo:act.modo, fechaProg:act.fechaProg || "" }); setVista("editar"); };

  const guardar = estado => {
    if (!draft?.titulo?.trim()) { showToast("Escribe un título para la actividad", "err"); return; }
    const base = { tipo:tipoSel, titulo:draft.titulo, materia:draft.materia || "General", modo:draft.modo || "live", estado, fecha:new Date().toISOString(), fechaProg:draft.fechaProg || "", data:draft };
    if (editingId) {
      setActividades(p => p.map(a => a.id === editingId ? { ...a, ...base } : a));
      showToast("Actividad actualizada");
    } else {
      setActividades(p => [{ id:uid(), ...base }, ...p]);
      showToast(estado === "publicado" ? "Actividad publicada" : "Guardada como borrador");
    }
    setVista("lista"); setDraft(null); setEditingId(null);
  };

  const eliminar    = id => { setActividades(p => p.filter(a => a.id !== id)); showToast("Actividad eliminada", "info"); };
  const lanzarAhora = id => { setActividades(p => p.map(a => a.id === id ? { ...a, modo:"live", estado:"publicado", enCurso:true } : a)); showToast("¡Actividad lanzada en vivo! 🚀"); };
  const detener     = id => { setActividades(p => p.map(a => a.id === id ? { ...a, enCurso:false, estado:"finalizado" } : a)); showToast("Actividad detenida", "info"); };

  const detalleAct = actividades.find(a => a.id === detalleId);

  /* ── Vista: selector de tipo ── */
  if (vista === "selector") return (
    <div className="stack">
      <div className="sec-head">
        <div><div className="eyebrow">Nueva actividad</div><div className="sec-title">Elige el tipo de juego</div></div>
        <button className="btn btn-ghost" onClick={() => setVista("lista")}>← Cancelar</button>
      </div>
      <div className="act-grid">
        {TIPOS_JUEGO.map(t => (
          <div key={t.id} className="act-card" onClick={() => iniciarCrear(t.id)}>
            <div className="act-card-accent" style={{ background:`linear-gradient(90deg,${t.color},transparent)` }}/>
            <div style={{ fontSize:32, marginBottom:10 }}>{t.icon}</div>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:5 }}>{t.nombre}</div>
            <div style={{ fontSize:12, color:"var(--txt2)", lineHeight:1.55 }}>{t.desc}</div>
            <div style={{ marginTop:14, fontSize:11, color:t.color, fontWeight:600 }}>Personalizar →</div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── Vista: editor ── */
  if (vista === "crear" || vista === "editar") {
    const Editor = EDITORES[tipoSel];
    const tInfo  = tipoInfo(tipoSel);
    return (
      <div className="stack">
        <div className="sec-head" style={{ flexWrap:"wrap", gap:10 }}>
          <div>
            <div className="eyebrow" style={{ color:tInfo.color }}>{tInfo.icon} {tInfo.nombre}</div>
            <div className="sec-title">{vista === "editar" ? "Editar actividad" : "Nueva actividad"}</div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => guardar("borrador")}>💾 Borrador</button>
            <button className="btn btn-gold btn-sm"  onClick={() => guardar("publicado")}>🚀 Publicar</button>
            <button className="btn btn-ghost" onClick={() => { setVista("lista"); setDraft(null); setEditingId(null); }}>← Cancelar</button>
          </div>
        </div>

        {/* Modo de lanzamiento */}
        <div className="editor-section">
          <div className="editor-section-title">📅 ¿Cuándo lanzar?</div>
          <div style={{ display:"flex", gap:10 }}>
            {[{ k:"live", label:"⚡ En vivo ahora", cls:"sel-live", sub:"Lanzas de inmediato" },
              { k:"programado", label:"📅 Programado", cls:"sel-prog", sub:"Estableces fecha y hora" }].map(m => (
              <button key={m.k} className={`mode-btn${draft?.modo === m.k ? " " + m.cls : ""}`}
                onClick={() => setDraft(d => ({ ...d, modo:m.k }))}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>{m.label}</div>
                <div style={{ fontSize:11, color:"var(--txt3)" }}>{m.sub}</div>
              </button>
            ))}
          </div>
          {draft?.modo === "programado" && (
            <div style={{ marginTop:12 }}>
              <Fld label="Fecha y hora de lanzamiento">
                <input type="datetime-local" className="q-input" style={{ width:"auto" }}
                  value={draft?.fechaProg?.slice(0, 16) || ""}
                  onChange={e => setDraft(d => ({ ...d, fechaProg: new Date(e.target.value).toISOString() }))}/>
              </Fld>
            </div>
          )}
        </div>

        {Editor && <Editor data={draft} onChange={nd => setDraft(nd)}/>}

        <div style={{ display:"flex", gap:10, paddingTop:8 }}>
          <button className="btn btn-primary" onClick={() => guardar("publicado")}>
            🚀 {draft?.modo === "live" ? "Publicar y lanzar" : "Programar actividad"}
          </button>
          <button className="btn btn-ghost" onClick={() => guardar("borrador")}>💾 Guardar borrador</button>
          <button className="btn btn-ghost" onClick={() => { setVista("lista"); setDraft(null); setEditingId(null); }}>Cancelar</button>
        </div>
      </div>
    );
  }

  /* ── Vista: lista principal ── */
  return (
    <div className="stack">
      <div className="sec-head">
        <div>
          <div className="eyebrow">Aula dinámica</div>
          <div className="sec-title">Actividades & juegos</div>
        </div>
        <button className="btn btn-primary" onClick={() => setVista("selector")}>+ Nueva actividad</button>
      </div>

      {/* Filtros */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        <input
          style={{ flex:"1 1 200px", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"var(--txt)", background:"#060914", border:"1px solid var(--border)", borderRadius:10, padding:"9px 13px", outline:"none" }}
          placeholder="🔍 Buscar actividad…" value={buscar} onChange={e => setBuscar(e.target.value)}
          onFocus={e => e.target.style.borderColor = "var(--indigo)"}
          onBlur={e  => e.target.style.borderColor = "var(--border)"}/>
        <select style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"var(--txt)", background:"#060914", border:"1px solid var(--border)", borderRadius:10, padding:"9px 13px", outline:"none", cursor:"pointer" }}
          value={filtroMat} onChange={e => setFiltroMat(e.target.value)}>
          <option value="">Todas las materias</option>
          {MATERIAS.map(m => <option key={m}>{m}</option>)}
        </select>
        <select style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"var(--txt)", background:"#060914", border:"1px solid var(--border)", borderRadius:10, padding:"9px 13px", outline:"none", cursor:"pointer" }}
          value={filtroEst} onChange={e => setFiltroEst(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="borrador">Borrador</option>
          <option value="publicado">Publicado</option>
          <option value="finalizado">Finalizado</option>
        </select>
      </div>

      {listaFiltrada.length === 0 && (
        <div className="empty"><span className="empty-icon">🎮</span>No hay actividades. ¡Crea la primera!</div>
      )}

      {listaFiltrada.map((a, i) => {
        const tInfo = tipoInfo(a.tipo);
        return (
          <div key={a.id} className="item" style={{ animationDelay:`${i * 30}ms`, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, bottom:0, width:3, background:tInfo.color, borderRadius:"14px 0 0 14px" }}/>
            <div style={{ paddingLeft:10 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
                <span style={{ fontSize:26, flexShrink:0 }}>{tInfo.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:5 }}>
                    <span style={{ fontWeight:700, fontSize:15 }}>{a.titulo}</span>
                    {a.estado === "publicado" && !a.enCurso && <span className="prog-badge">Publicado</span>}
                    {a.estado === "borrador"  && <span className="draft-badge">Borrador</span>}
                    {a.estado === "finalizado"&& <span style={{ background:"var(--surface)", border:"1px solid var(--border)", color:"var(--txt3)", fontSize:10, fontWeight:700, letterSpacing:".06em", padding:"2px 8px", borderRadius:999, fontFamily:"'DM Mono',monospace" }}>Finalizado</span>}
                    {a.enCurso && (
                      <span className="live-badge">
                        <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--ok)", boxShadow:"0 0 8px var(--ok)", animation:"pulseDot 2s infinite", display:"inline-block" }}/>
                        EN VIVO
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize:12, color:"var(--txt3)", display:"flex", gap:10, flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:tInfo.color, background:`${tInfo.color}18`, border:`1px solid ${tInfo.color}40`, padding:"1px 8px", borderRadius:999 }}>{tInfo.nombre}</span>
                    <span>🏫 {a.materia}</span>
                    <span>{a.modo === "live" ? "⚡ En vivo" : "📅 Programado"}</span>
                    {a.fechaProg && <span>→ {fmtT(a.fechaProg)}</span>}
                    <span>{fmt(a.fecha)}</span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0, flexWrap:"wrap" }}>
                  {!a.enCurso && a.estado !== "finalizado" && <button className="btn btn-primary btn-sm" onClick={() => lanzarAhora(a.id)}>▶ Lanzar</button>}
                  {a.enCurso  && <button className="btn btn-danger btn-sm" onClick={() => detener(a.id)}>⏹ Detener</button>}
                  <button className="btn btn-ghost btn-sm" onClick={() => iniciarEditar(a)}>✏️</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setDetalleId(a.id)}>👁️</button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => eliminar(a.id)}>🗑️</button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal detalle */}
      {detalleAct && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetalleId(null)}>
          <div className="modal" style={{ maxWidth:600 }}>
            <button className="modal-close" onClick={() => setDetalleId(null)}>✕</button>
            {(() => {
              const t = tipoInfo(detalleAct.tipo);
              const d = detalleAct.data || {};
              return (
                <>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${t.color},transparent)` }}/>
                  <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:16 }}>
                    <span style={{ fontSize:36 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:t.color, letterSpacing:".12em", textTransform:"uppercase", marginBottom:4 }}>{t.nombre}</div>
                      <h2 style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:20, lineHeight:1.1 }}>{detalleAct.titulo}</h2>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
                    <span className="badge">🏫 {detalleAct.materia}</span>
                    <span className="badge">{detalleAct.modo === "live" ? "⚡ En vivo" : "📅 Programado"}</span>
                    {detalleAct.fechaProg && <span className="badge">→ {fmtT(detalleAct.fechaProg)}</span>}
                    {detalleAct.enCurso   && <span className="live-badge">EN VIVO</span>}
                  </div>

                  {d.preguntas?.length > 0 && (
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:".08em", color:"var(--txt3)", fontWeight:600, marginBottom:8 }}>Preguntas ({d.preguntas.length})</div>
                      {d.preguntas.slice(0, 4).map((p, i) => (
                        <div key={i} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:9, padding:"8px 12px", marginBottom:6, fontSize:13, color:"var(--txt2)" }}>
                          <span style={{ color:"var(--txt3)", fontFamily:"'DM Mono',monospace", fontSize:10, marginRight:8 }}>{i + 1}.</span>
                          {p.enunciado || p.texto || p}
                        </div>
                      ))}
                      {d.preguntas.length > 4 && <div style={{ fontSize:12, color:"var(--txt3)", textAlign:"center" }}>+{d.preguntas.length - 4} más…</div>}
                    </div>
                  )}
                  {d.afirmaciones?.length > 0 && (
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:".08em", color:"var(--txt3)", fontWeight:600, marginBottom:8 }}>Afirmaciones ({d.afirmaciones.length})</div>
                      {d.afirmaciones.map((a, i) => (
                        <div key={i} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:9, padding:"8px 12px", marginBottom:6, fontSize:13, display:"flex", gap:8, alignItems:"center" }}>
                          <span style={{ color: a.correcta ? "var(--ok)" : "var(--danger)", fontWeight:700, fontSize:11 }}>{a.correcta ? "✅V" : "❌F"}</span>
                          <span style={{ color:"var(--txt2)" }}>{a.texto}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {d.conceptos?.length > 0 && (
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:".08em", color:"var(--txt3)", fontWeight:600, marginBottom:8 }}>Conceptos ({d.conceptos.length})</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {d.conceptos.map((c, i) => (
                          <span key={i} style={{ background:"var(--indigo-dim)", border:"1px solid var(--border2)", borderRadius:999, padding:"3px 10px", fontSize:12, color:"var(--indigo-lt)" }}>
                            {c.termino || c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display:"flex", gap:10, marginTop:16 }}>
                    {!detalleAct.enCurso && detalleAct.estado !== "finalizado" && (
                      <button className="btn btn-primary" onClick={() => { lanzarAhora(detalleAct.id); setDetalleId(null); }}>▶ Lanzar ahora</button>
                    )}
                    <button className="btn btn-ghost" onClick={() => { iniciarEditar(detalleAct); setDetalleId(null); }}>✏️ Editar</button>
                    <button className="btn btn-ghost" onClick={() => setDetalleId(null)}>Cerrar</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
