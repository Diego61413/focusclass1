// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";

import User from "./models/User.js";
import Mensaje from "./models/Mensaje.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new IOServer(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://focusclass1.vercel.app"],
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 4000;

/* =======================================================
   🔧 Middlewares
======================================================= */
app.use(cors({ 
  origin: ["http://localhost:5173", "https://focusclass1.vercel.app"], 
  credentials: true 
}));
app.use(express.json());

/* =======================================================
   💾 Conexión a MongoDB
======================================================= */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB conectado correctamente"))
  .catch((err) => console.error("❌ Error al conectar con MongoDB:", err));

/* =======================================================
   🧠 Helpers
======================================================= */
function signToken(user) {
  return jwt.sign(
    { id: user._id, nombre: user.nombre, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

function onlyProfesor(req, res, next) {
  if (req.user?.rol !== "profesor") {
    return res.status(403).json({ error: "Solo profesor" });
  }
  next();
}

/* =======================================================
   🌐 Rutas
======================================================= */
app.get("/", (_req, res) =>
  res.send("🚀 Servidor EduTec activo y escuchando correctamente.")
);

// Registro
app.post("/auth/register", async (req, res) => {
  try {
    const { nombre, email, password, rol = "alumno" } = req.body;
    if (!nombre?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: "Faltan campos" });
    }
    const existe = await User.findOne({ email });
    if (existe) return res.status(409).json({ error: "Email ya registrado" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      nombre: nombre.trim(),
      email: email.trim(),
      password: hash,
      rol,
    });
    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error en registro" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error en login" });
  }
});

// Perfil actual
app.get("/auth/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("_id nombre email rol");
  res.json({ user });
});

/* =======================================================
   💬 Mensajes (chat)
======================================================= */

// Obtener mensajes
app.get("/api/mensajes", async (_req, res) => {
  const items = await Mensaje.find().sort({ createdAt: -1 }).lean();
  res.json(items);
});

// Crear mensaje
app.post("/api/mensajes", auth, async (req, res) => {
  try {
    const texto = (req.body?.texto || "").trim();
    if (!texto) return res.status(400).json({ error: "texto requerido" });

    const doc = await Mensaje.create({
      autor: req.user.nombre,
      texto,
      fecha: new Date(),
    });

    io.emit("nuevo-mensaje", {
      _id: doc._id,
      autor: doc.autor,
      texto: doc.texto,
      fecha: doc.fecha,
    });

    res.status(201).json({ ok: true, ...doc.toObject() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al crear mensaje" });
  }
});

// Eliminar (solo profesor)
app.delete("/api/mensajes/:id", auth, onlyProfesor, async (req, res) => {
  try {
    const { id } = req.params;
    const del = await Mensaje.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ error: "No encontrado" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al eliminar" });
  }
});

/* =======================================================
   ⚡ Socket.io - Chat global
======================================================= */
io.on("connection", (socket) => {
  console.log("🔌 Cliente conectado:", socket.id);
});

/* =======================================================
   🧩 Namespace /activity – Actividades tipo Kahoot/Quiz
======================================================= */
const activityState = {};
const ACT_HB_TIMEOUT = 10000;
const activityNs = io.of("/activity");

activityNs.on("connection", (socket) => {
  socket.on("activity:start", ({ activityId, meta, asTeacher }) => {
    if (!activityId) return;
    socket.join(`activity:${activityId}`);
    if (!activityState[activityId])
      activityState[activityId] = { teacherSocketId: null, students: {}, meta };
    if (asTeacher) activityState[activityId].teacherSocketId = socket.id;
    activityNs.to(`activity:${activityId}`).emit("activity:open", { activityId, meta });
  });

  socket.on("activity:join", ({ activityId, alumno }) => {
    if (!activityId || !alumno) return;
    socket.join(`activity:${activityId}`);
    const A = activityState[activityId] || (activityState[activityId] = { teacherSocketId: null, students: {}, meta: {} });
    A.students[socket.id] = { alumno, lastSeen: Date.now(), status: "running", score: 0 };
    activityNs.to(`activity:${activityId}`).emit("activity:student-joined", { activityId, alumno, sid: socket.id });
  });

  socket.on("activity:hb", ({ activityId }) => {
    const A = activityState[activityId];
    const S = A?.students?.[socket.id];
    if (S && S.status === "running") S.lastSeen = Date.now();
  });

  socket.on("activity:left", ({ activityId, reason = "left_page" }) => {
    const A = activityState[activityId];
    const S = A?.students?.[socket.id];
    if (!A || !S || S.status !== "running") return;
    S.status = "cancelled";
    S.score = 0;
    activityNs.to(`activity:${activityId}`).emit("activity:student-left", {
      activityId,
      alumno: S.alumno,
      reason,
      sid: socket.id,
    });
  });

  socket.on("activity:finish", ({ activityId, score = 0 }) => {
    const A = activityState[activityId];
    const S = A?.students?.[socket.id];
    if (!A || !S || S.status !== "running") return;
    S.status = "finished";
    S.score = score;
    activityNs.to(`activity:${activityId}`).emit("activity:student-finished", {
      activityId,
      alumno: S.alumno,
      score,
      sid: socket.id,
    });
  });

  socket.on("disconnect", () => {
    for (const [aid, A] of Object.entries(activityState)) {
      const S = A.students[socket.id];
      if (S && S.status === "running") {
        S.status = "cancelled";
        S.score = 0;
        activityNs.to(`activity:${aid}`).emit("activity:student-left", {
          activityId: aid,
          alumno: S.alumno,
          reason: "disconnect",
          sid: socket.id,
        });
      }
    }
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [aid, A] of Object.entries(activityState)) {
    for (const [sid, S] of Object.entries(A.students)) {
      if (S.status === "running" && now - S.lastSeen > ACT_HB_TIMEOUT) {
        S.status = "cancelled";
        S.score = 0;
        activityNs.to(`activity:${aid}`).emit("activity:student-left", {
          activityId: aid,
          alumno: S.alumno,
          reason: "timeout",
          sid,
        });
      }
    }
  }
}, 2000);

/* =======================================================
   🚀 Iniciar Servidor
======================================================= */
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor EduTec corriendo en puerto ${PORT}`);
});