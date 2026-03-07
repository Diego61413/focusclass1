// client/src/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import API from "./api";

export const AuthCtx = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // intentar restaurar sesión
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return;
    API.get("/auth/me")
      .then((r) => {
        if (r?.user) setUser(r.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      });
  }, []);

  async function register({ nombre, email, password, rol = "alumno" }) {
    try {
      const r = await API.post("/auth/register", {
        nombre,
        email,
        password,
        rol: (rol || "").toLowerCase(),   // 👈 importante
      });
      if (r?.error) return r;
      if (r?.token) {
        localStorage.setItem("token", r.token);
        setUser(r.user);
      }
      return r;
    } catch (e) {
      return { error: "Error de red al registrar" };
    }
  }

  async function login(email, password) {
    try {
      const r = await API.post("/auth/login", { email, password });
      if (r?.error) return r;
      if (r?.token) {
        localStorage.setItem("token", r.token);
        setUser(r.user);
      }
      return r;
    } catch {
      return { error: "Error de red al iniciar sesión" };
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
