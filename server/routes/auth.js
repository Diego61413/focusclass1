import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

function sign(u) {
  return jwt.sign(
    { id: u._id.toString(), nombre: u.nombre, email: u.email, rol: u.rol },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password, rol = "alumno" } = req.body || {};
    if (!nombre?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: "nombre, email y password son requeridos" });
    }

    const existe = await Usuario.findOne({ email: email.toLowerCase().trim() });
    if (existe) return res.status(409).json({ error: "Ese email ya está registrado" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await Usuario.create({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      rol
    });

    const token = sign(user);
    res.status(201).json({
      token,
      user: { id: user._id, nombre: user.nombre, email: user.email, rol: user.rol }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al registrar" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await Usuario.findOne({ email: (email || "").toLowerCase().trim() });
    if (!user) return res.status(400).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password || "", user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Credenciales inválidas" });

    const token = sign(user);
    res.json({
      token,
      user: { id: user._id, nombre: user.nombre, email: user.email, rol: user.rol }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// GET /auth/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const u = await Usuario.findById(req.user.id).lean();
    if (!u) return res.status(404).json({ error: "No encontrado" });
    res.json({ id: u._id, nombre: u.nombre, email: u.email, rol: u.rol });
  } catch (e) {
    res.status(500).json({ error: "Error al obtener perfil" });
  }
});

export default router;