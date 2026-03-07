// client/src/Welcome.jsx
import { useContext, useEffect, useState } from "react";
import { AuthCtx } from "./AuthContext.jsx";
import { io } from "socket.io-client";
import API from "./api.js";
import "./App.css";

const socket = io("http://localhost:4000", { autoConnect: true });

export default function Welcome({
  onEnterChat,
  onBackToWelcome,
  onLogout,
  onOpenPanel,
  onOpenStudent,
}) {
  const { user } = useContext(AuthCtx);

  // ── Stats en tiempo real ──────────────────────────────────────
  const [onlineCount,   setOnlineCount]   = useState(0);
  const [mensajesHoy,   setMensajesHoy]   = useState(0);
  const [salasActivas,  setSalasActivas]  = useState(1);
  const [actividades,   setActividades]   = useState([]);
  const [cargandoActs,  setCargandoActs]  = useState(true);

  useEffect(() => {
    // Escuchar presencia en tiempo real
    const onPresencia = (lista) => setOnlineCount(Array.isArray(lista) ? lista.length : lista ?? 0);
    const onMsgNuevo  = () => setMensajesHoy((n) => n + 1);
    const onSalas     = (n) => setSalasActivas(n ?? 1);

    socket.on("class:presence",  onPresencia);
    socket.on("nuevo-mensaje",   onMsgNuevo);
    socket.on("salas:count",     onSalas);

    // Solicitar estado actual
    socket.emit("class:join", { nombre: user?.nombre || "?", rol: user?.rol || "alumno" });
    socket.emit("stats:request");

    // Carga inicial de datos
    (async () => {
      try {
        const [msgs, acts] = await Promise.all([
          API.get("/api/mensajes").catch(() => []),
          user?.rol === "alumno"
            ? API.get("/api/actividades?mine=1").catch(() => [])
            : Promise.resolve([]),
        ]);

        // Mensajes de hoy
        const hoy = new Date().toDateString();
        const hoyCount = (msgs || []).filter(
          (m) => new Date(m.fecha).toDateString() === hoy
        ).length;
        setMensajesHoy(hoyCount);
        setActividades(acts || []);
      } finally {
        setCargandoActs(false);
      }
    })();

    return () => {
      socket.off("class:presence",  onPresencia);
      socket.off("nuevo-mensaje",   onMsgNuevo);
      socket.off("salas:count",     onSalas);
    };
  }, [user]);

  // ── Helpers ───────────────────────────────────────────────────
  const saludo = (() => {
    const h = new Date().getHours();
    if (h < 6)  return "Buenas noches";
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  })();

  const iniciales = (() => {
    const n = (user?.nombre || "").trim();
    if (!n) return "👤";
    return n.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
  })();

  const pendientes = actividades.filter(
    (a) => (a.estado || "pendiente") === "pendiente"
  ).length;

  // ── Sub-componentes ───────────────────────────────────────────
  const Stat = ({ label, value, emoji, onClick, live }) => (
    <div
      className="w-stat"
      role="status"
      aria-label={label}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <div className="w-stat-top">
        <span className="w-stat-emoji" aria-hidden="true">{emoji}</span>
        {live && <span className="w-dot" style={{ background: "#34d399", boxShadow: "0 0 0 3px rgba(52,211,153,.25)" }} />}
      </div>
      <div className="w-stat-value">{value}</div>
      <div className="w-stat-label">{label}</div>
    </div>
  );

  const ActividadRow = ({ a, onAbrir }) => {
    const id       = a.id || a._id;
    const hecha    = a.estado === "hecha";
    const vencida  = a.fechaEntrega && new Date(a.fechaEntrega) < new Date() && !hecha;

    return (
      <div
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px",
          background: "rgba(255,255,255,.03)",
          border: `1px solid ${vencida ? "rgba(248,113,113,.25)" : hecha ? "rgba(52,211,153,.2)" : "rgba(99,102,241,.14)"}`,
          borderRadius: 10,
          transition: "border-color .2s",
        }}
      >
        <span style={{ fontSize: 18 }}>{hecha ? "✅" : vencida ? "⚠️" : "📌"}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: hecha ? "var(--txt3, #8fa0c8)" : "inherit" }}>
            {a.titulo || "Actividad"}
          </div>
          {a.fechaEntrega && (
            <div style={{ fontSize: 11, color: vencida ? "#f87171" : "var(--txt3, #8fa0c8)", marginTop: 2 }}>
              Entrega: {new Date(a.fechaEntrega).toLocaleDateString("es-MX")}
            </div>
          )}
        </div>
        <span
          style={{
            fontSize: 10, fontWeight: 600, padding: "3px 8px",
            borderRadius: 999, letterSpacing: ".05em",
            background: hecha
              ? "rgba(52,211,153,.12)"
              : vencida
              ? "rgba(248,113,113,.12)"
              : "rgba(251,191,36,.1)",
            color: hecha ? "#34d399" : vencida ? "#f87171" : "#fbbf24",
            border: `1px solid ${hecha ? "rgba(52,211,153,.25)" : vencida ? "rgba(248,113,113,.25)" : "rgba(251,191,36,.2)"}`,
          }}
        >
          {hecha ? "Hecha" : vencida ? "Vencida" : "Pendiente"}
        </span>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="app w-welcome">
      {/* HERO */}
      <div className="w-hero">
        <div className="w-hero-bg" />
        <div className="shell w-hero-inner">

          {/* Izquierda */}
          <div className="w-hero-left">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 44, height: 44, borderRadius: "999px",
                  display: "grid", placeItems: "center",
                  background: "linear-gradient(135deg,#2b4ec0,#6a4dff)",
                  fontWeight: 800,
                }}
                title={user?.nombre}
              >
                {iniciales}
              </div>
              <div className="badge" title="Rol actual">
                {user?.rol === "profesor" ? "Profesor" : "Alumno"}
              </div>
            </div>

            <h1 className="w-title" aria-live="polite">
              {saludo}, <span className="w-gradient">{user?.nombre || "usuario"}</span> 👋
            </h1>
            <p className="w-subtitle">
              Estás conectado como <b>{user?.rol}</b>. Desde aquí puedes entrar al chat,
              abrir tu módulo ({user?.rol === "profesor" ? "panel" : "actividades"}) y revisar lo que viene.
            </p>

            <div className="w-cta-row" role="group" aria-label="Acciones principales">
              <button className="btn w-btn-primary" onClick={onEnterChat} aria-label="Entrar al chat">
                Entrar al chat <span className="w-shine" aria-hidden="true">💬</span>
              </button>

              {user?.rol === "alumno" ? (
                <button
                  className="btn w-btn-ghost"
                  onClick={onOpenStudent}
                  style={{ position: "relative" }}
                >
                  Mis actividades
                  {pendientes > 0 && (
                    <span style={{
                      position: "absolute", top: -6, right: -6,
                      background: "#f87171", color: "#fff",
                      fontSize: 10, fontWeight: 700,
                      width: 18, height: 18, borderRadius: "50%",
                      display: "grid", placeItems: "center",
                      border: "2px solid var(--bg, #080c18)",
                    }}>
                      {pendientes}
                    </span>
                  )}
                </button>
              ) : (
                <button className="btn w-btn-ghost" onClick={onOpenPanel}>
                  Panel del profesor
                </button>
              )}

              <button className="btn link w-btn-link" onClick={onBackToWelcome} aria-label="Volver a bienvenida">
                Volver a bienvenida
              </button>

              <button className="btn link w-btn-link" onClick={onLogout} aria-label="Cerrar sesión" style={{ opacity: 0.85 }}>
                Cerrar sesión
              </button>
            </div>

            <div className="w-tips" aria-label="Atajos y tips">
              <span className="w-kbd">Ctrl</span> + <span className="w-kbd">Enter</span> envía mensajes ·
              Sonido al recibir 📥 · Moderación para <b>profesores</b>
            </div>
          </div>

          {/* Stats en tiempo real */}
          <div className="w-hero-right">
            <Stat
              label="Usuarios online"
              value={onlineCount > 0 ? onlineCount : "En vivo"}
              emoji="🟢"
              live={true}
              onClick={onEnterChat}
            />
            <Stat
              label="Mensajes hoy"
              value={mensajesHoy > 0 ? mensajesHoy : "Tiempo real"}
              emoji="⚡"
              live={true}
              onClick={onEnterChat}
            />
            <Stat
              label="Salas activas"
              value={salasActivas > 0 ? `${salasActivas} (global)` : "1 (global)"}
              emoji="🌐"
              live={true}
            />
          </div>
        </div>
      </div>

      {/* CONTENIDO — Actividades del alumno o acceso rápido del profesor */}
      <div className="shell w-content">

        {user?.rol === "alumno" && (
          <div className="card w-panel">
            <div className="w-panel-head">
              <div>
                <div className="w-panel-title">Mis actividades</div>
                <div className="w-panel-sub">
                  {cargandoActs
                    ? "Cargando actividades…"
                    : actividades.length === 0
                    ? "No tienes actividades asignadas aún."
                    : `${pendientes} pendiente${pendientes !== 1 ? "s" : ""} · ${actividades.length} en total`}
                </div>
              </div>
              <button className="btn w-btn-primary" onClick={onOpenStudent}>
                Ver todas →
              </button>
            </div>

            {cargandoActs ? (
              <div style={{ color: "var(--txt3, #8fa0c8)", fontSize: 13, padding: "12px 0" }}>
                Cargando…
              </div>
            ) : actividades.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 0", color: "var(--txt3, #8fa0c8)", fontSize: 14 }}>
                <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>📭</span>
                Tu profesor aún no ha publicado actividades.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                {actividades.slice(0, 4).map((a) => (
                  <ActividadRow key={a.id || a._id} a={a} onAbrir={onOpenStudent} />
                ))}
                {actividades.length > 4 && (
                  <button
                    className="btn link"
                    onClick={onOpenStudent}
                    style={{ fontSize: 12, padding: "6px 0", textAlign: "center" }}
                  >
                    Ver {actividades.length - 4} más →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {user?.rol === "profesor" && (
          <div className="card w-panel">
            <div className="w-panel-head">
              <div>
                <div className="w-panel-title">Panel del profesor</div>
                <div className="w-panel-sub">
                  Gestiona alumnos, anuncios, tareas, quizzes y actividades en vivo.
                </div>
              </div>
              <button className="btn w-btn-primary" onClick={onOpenPanel}>
                Abrir panel →
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginTop: 8 }}>
              {[
                { emoji: "📊", label: "Tablero",    desc: "Estadísticas generales" },
                { emoji: "📢", label: "Anuncios",   desc: "Publica avisos al instante" },
                { emoji: "📁", label: "Tareas",     desc: "Asigna y califica entregas" },
                { emoji: "🧠", label: "Quizzes",    desc: "Crea evaluaciones interactivas" },
                { emoji: "⚡", label: "En vivo",   desc: "Actividades en tiempo real" },
                { emoji: "🛡️", label: "Moderación", desc: "Controla el chat del aula" },
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={onOpenPanel}
                  style={{
                    padding: "14px 12px",
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(99,102,241,.14)",
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "border-color .2s, transform .15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(99,102,241,.35)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(99,102,241,.14)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{item.emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "var(--txt3, #8fa0c8)", marginTop: 3 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}