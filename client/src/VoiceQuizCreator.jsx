// VoiceQuizCreator.jsx
// Agregar este componente en ProfessorPanel.jsx
// 1. Importar al inicio del archivo: import VoiceQuizCreator from "./VoiceQuizCreator";
// 2. En TabQuiz, añadir el botón y el estado del modal (ver instrucciones al final)

import { useEffect, useRef, useState } from "react";

/* ─── Estilos adicionales para VoiceQuizCreator ─────────────── */
const VQC_STYLES = `
.vqc-overlay{position:fixed;inset:0;background:rgba(6,9,20,.88);backdrop-filter:blur(12px);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .22s cubic-bezier(.16,1,.3,1)}
.vqc-modal{background:linear-gradient(160deg,rgba(255,255,255,.04),transparent 50%),linear-gradient(180deg,#0d1426,#060914);border:1px solid rgba(99,102,241,.28);border-radius:22px;padding:32px;max-width:620px;width:100%;position:relative;box-shadow:0 32px 80px rgba(0,0,0,.8);overflow:hidden}
.vqc-modal::before{content:'';position:absolute;top:0;left:20px;right:20px;height:1px;background:linear-gradient(90deg,transparent,rgba(99,102,241,.55),rgba(240,192,96,.3),transparent);pointer-events:none}
.vqc-modal::after{content:'';position:absolute;top:-80px;right:-80px;width:260px;height:260px;background:radial-gradient(circle,rgba(99,102,241,.08),transparent 70%);pointer-events:none}
/* mic button */
.vqc-mic-wrap{display:flex;flex-direction:column;align-items:center;gap:16px;margin:24px 0}
.vqc-mic-btn{width:88px;height:88px;border-radius:50%;border:none;cursor:pointer;display:grid;place-items:center;font-size:34px;position:relative;transition:transform .2s cubic-bezier(.16,1,.3,1),box-shadow .2s;outline:none}
.vqc-mic-btn.idle{background:linear-gradient(160deg,#1a2040,#0d1426);border:1.5px solid rgba(99,102,241,.3);box-shadow:0 0 0 0 rgba(99,102,241,0)}
.vqc-mic-btn.idle:hover{transform:scale(1.06);border-color:rgba(99,102,241,.6);box-shadow:0 0 28px rgba(99,102,241,.2)}
.vqc-mic-btn.recording{background:linear-gradient(160deg,#3d1a1a,#1a0808);border:1.5px solid rgba(248,113,113,.5);animation:micPulse 1.2s ease-in-out infinite;box-shadow:0 0 0 8px rgba(248,113,113,.08)}
.vqc-mic-btn.processing{background:linear-gradient(160deg,#1a1a3d,#0d1426);border:1.5px solid rgba(99,102,241,.5);animation:micSpin .8s linear infinite}
@keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,.25),0 0 0 8px rgba(248,113,113,.08)}50%{box-shadow:0 0 0 14px rgba(248,113,113,.15),0 0 0 22px rgba(248,113,113,.04)}}
@keyframes micSpin{0%{box-shadow:0 0 0 0 rgba(99,102,241,.4),0 0 0 12px rgba(99,102,241,.1)}100%{box-shadow:0 0 0 16px rgba(99,102,241,.0),0 0 0 24px rgba(99,102,241,.0)}}
/* transcript box */
.vqc-transcript{background:#060914;border:1px solid rgba(99,102,241,.18);border-radius:13px;padding:14px 16px;font-size:14px;color:#e8eeff;line-height:1.6;min-height:60px;margin-bottom:14px;position:relative;transition:border-color .2s}
.vqc-transcript:focus-within{border-color:rgba(99,102,241,.45)}
.vqc-transcript textarea{width:100%;background:transparent;border:none;outline:none;resize:none;font-family:'DM Sans',sans-serif;font-size:14px;color:#e8eeff;line-height:1.6;min-height:60px;caret-color:#818cf8}
.vqc-transcript textarea::placeholder{color:#4e6090}
/* chips de sugerencia */
.vqc-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.vqc-chip{font-size:12px;padding:5px 12px;border-radius:999px;border:1px solid rgba(99,102,241,.22);background:rgba(99,102,241,.08);color:#818cf8;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif;font-weight:500}
.vqc-chip:hover{border-color:rgba(99,102,241,.5);background:rgba(99,102,241,.16);color:#c7d2fe}
/* preview card */
.vqc-preview{background:linear-gradient(160deg,#111c38,#0d1426);border:1px solid rgba(99,102,241,.25);border-radius:15px;padding:18px;margin-top:16px;animation:fadeUp .3s cubic-bezier(.16,1,.3,1)}
.vqc-preview-title{font-family:'Instrument Serif',serif;font-style:italic;font-size:19px;margin-bottom:6px}
.vqc-preview-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.vqc-preview-q{background:#060914;border:1px solid rgba(99,102,241,.14);border-radius:10px;padding:10px 13px;margin-bottom:8px;font-size:13px;color:#8fa0c8;animation:fadeUp .25s cubic-bezier(.16,1,.3,1) both}
.vqc-preview-q-num{font-family:'DM Mono',monospace;font-size:10px;color:#4e6090;margin-bottom:4px}
/* estados */
.vqc-status{font-size:13px;color:#4e6090;text-align:center;min-height:20px;transition:color .2s}
.vqc-status.active{color:#818cf8}
.vqc-status.error{color:#f87171}
/* progress dots */
.vqc-dots{display:flex;gap:5px;justify-content:center;margin:6px 0}
.vqc-dot{width:6px;height:6px;border-radius:50%;background:#4e6090;animation:dotBounce 1.2s ease-in-out infinite}
.vqc-dot:nth-child(2){animation-delay:.18s}
.vqc-dot:nth-child(3){animation-delay:.36s}
@keyframes dotBounce{0%,80%,100%{transform:scale(.8);opacity:.4}40%{transform:scale(1.2);opacity:1}}
/* waveform animado */
.vqc-wave{display:flex;gap:3px;align-items:flex-end;height:28px;justify-content:center}
.vqc-bar{width:3px;border-radius:3px;background:#f87171;animation:waveAnim 0.8s ease-in-out infinite}
.vqc-bar:nth-child(1){animation-delay:0s;height:8px}
.vqc-bar:nth-child(2){animation-delay:.1s;height:16px}
.vqc-bar:nth-child(3){animation-delay:.2s;height:22px}
.vqc-bar:nth-child(4){animation-delay:.3s;height:14px}
.vqc-bar:nth-child(5){animation-delay:.4s;height:20px}
.vqc-bar:nth-child(6){animation-delay:.5s;height:10px}
.vqc-bar:nth-child(7){animation-delay:.6s;height:18px}
@keyframes waveAnim{0%,100%{transform:scaleY(1);opacity:.7}50%{transform:scaleY(1.8);opacity:1}}
`;

if (!document.getElementById("vqc-styles")) {
  const s = document.createElement("style");
  s.id = "vqc-styles";
  s.textContent = VQC_STYLES;
  document.head.appendChild(s);
}

const uid = () => Math.random().toString(36).slice(2, 9);

const SUGERENCIAS = [
  "Mañana examen, 20 preguntas, opción múltiple sobre HTML",
  "Quiz rápido de 5 preguntas V/F sobre normalización",
  "10 preguntas de programación orientada a objetos, con tiempo de 15 min",
  "Examen parcial de Base de Datos, 15 preguntas mixtas",
];

/* ─── Llama a Anthropic API para parsear el comando de voz ─── */
async function parseVoiceCommand(texto) {
  const prompt = `Eres un asistente para profesores. El profesor dijo: "${texto}"

Extrae y genera un quiz completo en JSON con este formato exacto:
{
  "titulo": "string",
  "clase": "Programación Web" | "Base de Datos" | "Sistemas Operativos" | "Inteligencia Artificial",
  "descripcion": "string breve",
  "tiempo": number (minutos, 0 si no se menciona),
  "intentos": 1,
  "mostrarResultados": true,
  "aleatorio": false,
  "preguntas": [
    {
      "id": "uid único de 7 chars",
      "tipo": "multiple" | "verdadero_falso" | "abierta",
      "enunciado": "Pregunta completa y específica sobre el tema",
      "opciones": ["opción A", "opción B", "opción C", "opción D"],
      "correcta": 0,
      "tfRespuesta": true,
      "abiertaRespuesta": "",
      "puntaje": 10,
      "explicacion": "Explicación breve de por qué es correcta"
    }
  ]
}

Reglas importantes:
- Si dice "opción múltiple", usa tipo:"multiple" con 4 opciones reales y relevantes al tema
- Si dice "V/F" o "verdadero/falso", usa tipo:"verdadero_falso"
- Genera TODAS las preguntas que pide (el número exacto)
- Las preguntas deben ser académicamente válidas y variadas sobre el tema mencionado
- Si no menciona clase, infiere de los temas mencionados, default "Programación Web"
- Si no menciona tiempo y es examen, ponle 30 min; si es quiz corto, 0
- Responde SOLO el JSON válido, sin explicaciones ni markdown`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const text = data.content?.find(b => b.type === "text")?.text || "";

  // Limpiar posibles backticks
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  // Garantizar IDs únicos en cada pregunta
  parsed.preguntas = parsed.preguntas.map(p => ({ ...p, id: uid() }));
  return parsed;
}

/* ─── Componente principal ──────────────────────────────────── */
export default function VoiceQuizCreator({ onQuizCreado, onClose, showToast }) {
  const [phase, setPhase] = useState("idle"); // idle | recording | processing | preview
  const [transcript, setTranscript] = useState("");
  const [quizPreview, setQuizPreview] = useState(null);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const isRecording = phase === "recording";

  /* ── Web Speech API ── */
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Tu navegador no soporta reconocimiento de voz. Escribe el comando.", "err");
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "es-MX";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join(" ");
      setTranscript(t);
    };
    rec.onend = () => {
      if (phase === "recording") processTranscript();
    };
    rec.onerror = (e) => {
      setError("Error de micrófono: " + e.error);
      setPhase("idle");
    };
    recognitionRef.current = rec;
    rec.start();
    setPhase("recording");
    setError("");
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    processTranscript();
  };

  const processTranscript = async () => {
    const text = transcript.trim();
    if (!text) { setPhase("idle"); return; }
    setPhase("processing");
    setError("");
    try {
      const quiz = await parseVoiceCommand(text);
      setQuizPreview(quiz);
      setPhase("preview");
    } catch (e) {
      setError("No pude generar el quiz. Intenta de nuevo o sé más específico.");
      setPhase("idle");
    }
  };

  const usarSugerencia = (s) => setTranscript(s);

  const confirmarQuiz = () => {
    onQuizCreado(quizPreview);
    showToast(`Quiz "${quizPreview.titulo}" creado con ${quizPreview.preguntas.length} preguntas`);
    onClose();
  };

  const regenerar = () => {
    setPhase("idle");
    setQuizPreview(null);
  };

  /* ── Render ── */
  return (
    <div className="vqc-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="vqc-modal">
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 16, right: 16, background: "rgba(17,28,56,.8)", border: "1px solid rgba(99,102,241,.2)", color: "#4e6090", borderRadius: 8, width: 30, height: 30, display: "grid", placeItems: "center", cursor: "pointer", fontSize: 16, transition: "all .2s", zIndex: 2 }}
        >✕</button>

        {/* Header */}
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "#6366f1", marginBottom: 6 }}>
          IA · Creación por voz
        </div>
        <h2 style={{ fontFamily: "'Instrument Serif',serif", fontStyle: "italic", fontSize: 24, marginBottom: 4, background: "linear-gradient(120deg,#c7d2fe,#f0c060)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Habla y se crea el quiz
        </h2>
        <p style={{ fontSize: 13, color: "#4e6090", marginBottom: 20, fontWeight: 300 }}>
          Di cuántas preguntas, el tipo y el tema — la IA hace el resto.
        </p>

        {/* Fase: idle o recording */}
        {(phase === "idle" || phase === "recording") && (
          <>
            {/* Sugerencias */}
            {!transcript && (
              <>
                <div style={{ fontSize: 11, color: "#4e6090", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8, fontWeight: 600 }}>Ejemplos rápidos</div>
                <div className="vqc-chips">
                  {SUGERENCIAS.map((s, i) => (
                    <span key={i} className="vqc-chip" onClick={() => usarSugerencia(s)}>{s}</span>
                  ))}
                </div>
              </>
            )}

            {/* Transcript editable */}
            <div className="vqc-transcript">
              <textarea
                rows={3}
                placeholder='Ej: "Mañana examen, 20 preguntas de opción múltiple sobre JavaScript"'
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
              />
            </div>

            {/* Botón micrófono */}
            <div className="vqc-mic-wrap">
              {isRecording ? (
                <>
                  <div className="vqc-wave">
                    {[1,2,3,4,5,6,7].map(i => <div key={i} className="vqc-bar"/>)}
                  </div>
                  <button className="vqc-mic-btn recording" onClick={stopRecording}>🛑</button>
                  <span className="vqc-status active">Escuchando… haz clic para detener</span>
                </>
              ) : (
                <>
                  <button className="vqc-mic-btn idle" onClick={startRecording}>🎙️</button>
                  <span className="vqc-status">Haz clic para hablar</span>
                </>
              )}
            </div>

            {error && <div className="vqc-status error" style={{ marginBottom: 12, textAlign: "center" }}>{error}</div>}

            {/* Botón generar desde texto */}
            {transcript && !isRecording && (
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, fontFamily: "'DM Sans',sans-serif", background: "linear-gradient(160deg,#6366f1,#4338ca)", color: "#fff", border: "none", borderRadius: 11, padding: "12px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  onClick={processTranscript}
                >
                  ✨ Generar quiz con IA
                </button>
                <button
                  onClick={() => setTranscript("")}
                  style={{ padding: "12px 16px", borderRadius: 11, border: "1px solid rgba(99,102,241,.2)", background: "transparent", color: "#4e6090", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, transition: "all .2s" }}
                >
                  Limpiar
                </button>
              </div>
            )}
          </>
        )}

        {/* Fase: processing */}
        {phase === "processing" && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🧠</div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontStyle: "italic", fontSize: 18, marginBottom: 12, color: "#c7d2fe" }}>
              Generando tu quiz…
            </div>
            <div className="vqc-dots"><div className="vqc-dot"/><div className="vqc-dot"/><div className="vqc-dot"/></div>
            <div style={{ fontSize: 13, color: "#4e6090", marginTop: 12, maxWidth: 340, margin: "12px auto 0", lineHeight: 1.6 }}>
              La IA está creando las preguntas, respuestas correctas y explicaciones…
            </div>
          </div>
        )}

        {/* Fase: preview */}
        {phase === "preview" && quizPreview && (
          <div className="vqc-preview">
            {/* Título y meta */}
            <div className="vqc-preview-title">{quizPreview.titulo}</div>
            <div className="vqc-preview-meta">
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, background: "rgba(99,102,241,.14)", border: "1px solid rgba(99,102,241,.22)", color: "#818cf8", padding: "3px 9px", borderRadius: 999 }}>
                🏫 {quizPreview.clase}
              </span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, background: "rgba(52,211,153,.12)", border: "1px solid rgba(52,211,153,.25)", color: "#34d399", padding: "3px 9px", borderRadius: 999 }}>
                ❓ {quizPreview.preguntas.length} preguntas
              </span>
              {quizPreview.tiempo > 0 && (
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, background: "rgba(251,191,36,.12)", border: "1px solid rgba(251,191,36,.25)", color: "#fbbf24", padding: "3px 9px", borderRadius: 999 }}>
                  ⏱ {quizPreview.tiempo} min
                </span>
              )}
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, background: "rgba(240,192,96,.14)", border: "1px solid rgba(240,192,96,.25)", color: "#f0c060", padding: "3px 9px", borderRadius: 999 }}>
                🎯 {quizPreview.preguntas.reduce((s, p) => s + Number(p.puntaje || 10), 0)} pts
              </span>
            </div>
            {quizPreview.descripcion && (
              <div style={{ fontSize: 13, color: "#8fa0c8", marginBottom: 14, lineHeight: 1.5 }}>{quizPreview.descripcion}</div>
            )}

            {/* Preview de primeras 3 preguntas */}
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "#4e6090", marginBottom: 10, fontWeight: 600 }}>
              Vista previa de preguntas
            </div>
            {quizPreview.preguntas.slice(0, 4).map((p, i) => (
              <div key={p.id} className="vqc-preview-q" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="vqc-preview-q-num">Pregunta {i + 1} · {p.tipo === "multiple" ? "Opción múltiple" : p.tipo === "verdadero_falso" ? "V / F" : "Abierta"} · {p.puntaje} pts</div>
                <div style={{ fontSize: 13, color: "#c7d2fe", marginBottom: p.tipo === "multiple" ? 8 : 0 }}>{p.enunciado}</div>
                {p.tipo === "multiple" && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                    {p.opciones.map((op, j) => (
                      <span key={j} style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 7,
                        background: j === p.correcta ? "rgba(52,211,153,.15)" : "rgba(99,102,241,.08)",
                        border: `1px solid ${j === p.correcta ? "rgba(52,211,153,.3)" : "rgba(99,102,241,.15)"}`,
                        color: j === p.correcta ? "#34d399" : "#8fa0c8",
                        fontWeight: j === p.correcta ? 600 : 400,
                      }}>
                        {j === p.correcta ? "✓ " : ""}{op}
                      </span>
                    ))}
                  </div>
                )}
                {p.tipo === "verdadero_falso" && (
                  <span style={{ fontSize: 11, color: "#34d399", fontWeight: 600 }}>
                    ✓ {p.tfRespuesta ? "Verdadero" : "Falso"}
                  </span>
                )}
              </div>
            ))}
            {quizPreview.preguntas.length > 4 && (
              <div style={{ fontSize: 12, color: "#4e6090", textAlign: "center", padding: "8px 0" }}>
                + {quizPreview.preguntas.length - 4} preguntas más…
              </div>
            )}

            {/* Acciones */}
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                onClick={confirmarQuiz}
                style={{ flex: 1, fontFamily: "'DM Sans',sans-serif", background: "linear-gradient(160deg,#f0c060,#d4943a)", color: "#080c18", border: "none", borderRadius: 11, padding: "13px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 18px rgba(240,192,96,.2)", transition: "all .2s" }}
              >
                🚀 Publicar quiz y enviar a alumnos
              </button>
              <button
                onClick={regenerar}
                style={{ padding: "13px 16px", borderRadius: 11, border: "1px solid rgba(99,102,241,.22)", background: "transparent", color: "#818cf8", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, transition: "all .2s", whiteSpace: "nowrap" }}
              >
                ↩ Regenerar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   INSTRUCCIONES DE INTEGRACIÓN EN ProfessorPanel.jsx
═══════════════════════════════════════════════════════════════

1. Al inicio del archivo, agregar el import:
   import VoiceQuizCreator from "./VoiceQuizCreator";

2. En TabQuiz, agregar el estado del modal después de los estados existentes:
   const [voiceModal, setVoiceModal] = useState(false);

3. En el JSX de TabQuiz, en la sección `sec-head` donde está el botón "+ Crear quiz",
   agregar el botón de voz justo antes:

   <button
     className="btn btn-gold"
     onClick={() => setVoiceModal(true)}
     style={{ display: "flex", alignItems: "center", gap: 7 }}
   >
     🎙️ Crear con voz
   </button>

4. Agregar el handler que recibe el quiz generado por la IA:
   const recibirQuizDeIA = (quizGenerado) => {
     setQuizzes(prev => [{
       id: uid(),
       titulo: quizGenerado.titulo,
       clase: quizGenerado.clase,
       preguntas: quizGenerado.preguntas.length,
       publicado: true,
       fecha: new Date().toISOString(),
       _quizData: quizGenerado  // guarda el quiz completo para edición futura
     }, ...prev]);
   };

5. Renderizar el modal al final del componente TabQuiz (antes del return final):
   {voiceModal && (
     <VoiceQuizCreator
       onQuizCreado={recibirQuizDeIA}
       onClose={() => setVoiceModal(false)}
       showToast={showToast}
     />
   )}

═══════════════════════════════════════════════════════════════ */