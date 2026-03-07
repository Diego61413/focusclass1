// client/src/App.jsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthCtx } from "./AuthContext.jsx";
import API from "./api.js";
import { io } from "socket.io-client";
import Welcome from "./Welcome.jsx";
import ProfessorPanel from "./ProfessorPanel.jsx";
import StudentApp from "./StudentApp.jsx";
import SplashScreen from "./SplashScreen.jsx";
import "./App.css";

const socket = io("http://localhost:4000");

export default function App() {
  const { user, login, register, logout } = useContext(AuthCtx);

  const INITIAL_FORM = { nombre: "", email: "", password: "", rol: "alumno" };

  const [form, setForm] = useState(INITIAL_FORM);
  const [uiError, setUiError] = useState("");
  const [texto, setTexto] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [loginMode, setLoginMode] = useState("login");

  const [showWelcome, setShowWelcome] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [showStudent, setShowStudent] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [authEpoch, setAuthEpoch] = useState(0);

  const yo = useMemo(() => (user?.nombre || "").trim().toLowerCase(), [user?.nombre]);
  const feedRef = useRef(null);

  const ding = useMemo(() => {
    const a = new Audio("data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAA...");
    a.volume = 0.25;
    return a;
  }, []);

  useEffect(() => {
    if (user) { setShowWelcome(true); setShowPanel(false); setShowStudent(false); }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    API.get("/api/mensajes").then((data) => mounted && setMensajes(data || [])).catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handler = (m) => {
      setMensajes((prev) => [m, ...prev]);
      if (user && m.autor?.toLowerCase() !== yo) ding.play().catch(() => {});
    };
    socket.on("nuevo-mensaje", handler);
    return () => socket.off("nuevo-mensaje", handler);
  }, [ding, user, yo]);

  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
  }, [mensajes]);

  const onLogin = async (e) => {
    e?.preventDefault();
    setUiError("");
    const email = (form.email || "").trim();
    const pwd = form.password || "";
    if (!email || !pwd) return setUiError("Completa email y contraseña.");
    const r = await login(email, pwd);
    if (r?.error) { setUiError(r.error); }
    else { setShowSplash(true); }
  };

  const onRegister = async (e) => {
    e?.preventDefault();
    setUiError("");
    const payload = {
      ...form,
      nombre: (form.nombre || "").trim(),
      email: (form.email || "").trim(),
      rol: (form.rol || "").toLowerCase(),
    };
    if (!payload.nombre || !payload.email || !payload.password)
      return setUiError("Completa nombre, email y contraseña.");
    const r = await register(payload);
    if (r?.error) { setUiError(r.error); }
    else { setShowSplash(true); }
  };

  const handleLogout = async () => {
    try { await logout(); }
    finally {
      setForm(INITIAL_FORM); setUiError(""); setTexto("");
      setShowWelcome(true); setShowPanel(false); setShowStudent(false);
      setShowSplash(true); setLoginMode("login");
      setAuthEpoch((n) => n + 1);
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    const t = texto.trim();
    if (!t) return;
    try {
      const creado = await API.post("/api/mensajes", { texto: t });
      if (creado?.error) return alert(creado.error);
      setTexto("");
    } catch { alert("No se pudo enviar el mensaje."); }
  };

  const borrar = async (id) => {
    if (!confirm("¿Eliminar mensaje?")) return;
    const r = await API.del(`/api/mensajes/${id}`);
    if (r?.ok) setMensajes((p) => p.filter((x) => (x._id || x.id) !== id));
    else if (r?.error) alert(r.error);
  };

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") enviar(e);
  };

  // 0) Splash
  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />;

  // 1) Panel del profesor
  if (user && showPanel) return <ProfessorPanel onClose={() => setShowPanel(false)} />;

  // 2) Módulo del alumno
  if (user && showStudent) return <StudentApp user={user} onClose={() => setShowStudent(false)} />;

  // 3) Bienvenida
  if (user && showWelcome) {
    return (
      <Welcome
        onEnterChat={() => setShowWelcome(false)}
        onBackToWelcome={() => setShowWelcome(true)}
        onOpenPanel={() => setShowPanel(true)}
        onOpenStudent={() => setShowStudent(true)}
        onLogout={handleLogout}
      />
    );
  }

  // 4) LOGIN REDISEÑADO
  if (!user) {
    return (
      <div className="login-root" key={authEpoch}>
        <div className="login-bg">
          <div className="login-orb login-orb-1" />
          <div className="login-orb login-orb-2" />
          <div className="login-orb login-orb-3" />
          <div className="login-grid" />
        </div>

        <div className="login-wrapper">
          <div className="login-brand">
            <div className="login-brand-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="none" stroke="url(#hexGrad)" strokeWidth="2"/>
                <polygon points="20,8 32,14.5 32,25.5 20,32 8,25.5 8,14.5" fill="url(#hexGradFill)" opacity="0.3"/>
                <text x="20" y="25" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" fontFamily="serif">E</text>
                <defs>
                  <linearGradient id="hexGrad" x1="0" y1="0" x2="40" y2="40">
                    <stop offset="0%" stopColor="#60a5fa"/>
                    <stop offset="100%" stopColor="#a78bfa"/>
                  </linearGradient>
                  <linearGradient id="hexGradFill" x1="0" y1="0" x2="40" y2="40">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="login-brand-text">
              <span className="login-brand-name">EduTec</span>
              <span className="login-brand-sub">Aprende · Colabora · En vivo</span>
            </div>
          </div>

          <div className="login-card">
            <div className="login-tabs">
              <button
                className={`login-tab ${loginMode === "login" ? "active" : ""}`}
                onClick={() => { setLoginMode("login"); setUiError(""); }}
              >
                Iniciar sesión
              </button>
              <button
                className={`login-tab ${loginMode === "register" ? "active" : ""}`}
                onClick={() => { setLoginMode("register"); setUiError(""); }}
              >
                Crear cuenta
              </button>
              <div className={`login-tab-indicator ${loginMode === "register" ? "right" : ""}`} />
            </div>

            <div className="login-fields">
              {loginMode === "register" && (
                <div className="login-field">
                  <label className="login-label">Nombre completo</label>
                  <input
                    className="login-input"
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    autoComplete="off"
                  />
                </div>
              )}

              <div className="login-field">
                <label className="login-label">Correo electrónico</label>
                <input
                  className="login-input"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  autoComplete="off"
                  inputMode="email"
                />
              </div>

              <div className="login-field">
                <label className="login-label">Contraseña</label>
                <input
                  className="login-input"
                  placeholder={loginMode === "register" ? "Mínimo 6 caracteres" : "Tu contraseña"}
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  autoComplete="new-password"
                  minLength={loginMode === "register" ? 6 : undefined}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") loginMode === "login" ? onLogin(e) : onRegister(e);
                  }}
                />
              </div>

              {loginMode === "register" && (
                <div className="login-field">
                  <label className="login-label">Rol</label>
                  <div className="login-role-group">
                    {["alumno", "profesor"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`login-role-btn ${form.rol === r ? "active" : ""}`}
                        onClick={() => setForm((f) => ({ ...f, rol: r }))}
                      >
                        <span>{r === "alumno" ? "🎓" : "📋"}</span>
                        <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {uiError && (
                <div className="login-error"><span>⚠</span> {uiError}</div>
              )}

              <button
                className="login-submit"
                onClick={loginMode === "login" ? onLogin : onRegister}
                type="button"
              >
                <span>{loginMode === "login" ? "Entrar" : "Crear cuenta"}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>

          <p className="login-footer">Plataforma educativa en tiempo real · v1.0</p>
        </div>
      </div>
    );
  }

  // 5) Chat principal
  return (
    <div className="app">
      <div className="shell">
        <div className="card">
          <h1 className="title">💬 Conexión React + Node</h1>
          <p className="subtitle">¡Servidor Node.js conectado correctamente! 🚀</p>
          <div className="row" style={{ alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="badge">
              Conectado como <b>{user.nombre}</b> · Rol: <b>{user.rol}</b>
            </span>
            <button className="btn link" onClick={() => { setShowPanel(false); setShowStudent(false); setShowWelcome(true); }}>
              Volver
            </button>
            {user.rol === "profesor" && (
              <button className="btn link" onClick={() => { setShowWelcome(false); setShowStudent(false); setShowPanel(true); }}>Panel</button>
            )}
            {user.rol === "alumno" && (
              <button className="btn link" onClick={() => { setShowWelcome(false); setShowPanel(false); setShowStudent(true); }}>Alumno</button>
            )}
          </div>
          <form className="form" onSubmit={enviar}>
            <textarea placeholder="Escribe tu mensaje…" value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={onKeyDown} aria-label="Mensaje" rows={4} />
            <div className="actions">
              <button className="btn" type="submit" disabled={!texto.trim()}>Enviar</button>
            </div>
          </form>
        </div>
        <div className="card list">
          <h3>Mensajes ({mensajes.length})</h3>
          <div className="feed" ref={feedRef}>
            {mensajes.length === 0 && <div className="msg">Aún no hay mensajes. ¡Escribe el primero! ✍️</div>}
            {mensajes.map((m) => {
              const soyYo = yo && m.autor?.toLowerCase() === yo;
              const id = m._id || m.id;
              return (
                <div key={id} className={`msg ${soyYo ? "me" : ""}`}>
                  <div className="meta">
                    <b>{m.autor || "Anónimo"}</b>
                    <span>• {new Date(m.fecha).toLocaleString()}</span>
                  </div>
                  <div>{m.texto}</div>
                  {user.rol === "profesor" && (
                    <div style={{ marginTop: 8 }}>
                      <button className="btn link" onClick={() => borrar(id)}>Eliminar</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}