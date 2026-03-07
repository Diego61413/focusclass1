import { Router } from "express";
import Mensaje from "../models/Mensaje.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

// GET todos (público para que los vea el login)
router.get("/", async (_req, res) => {
  const items = await Mensaje.find().sort({ fecha: -1 }).lean();
  res.json(items);
});

// POST crear (autenticado)
router.post("/", requireAuth, async (req, res) => {
  const { texto } = req.body || {};
  if (!texto?.trim()) return res.status(400).json({ error: "texto es requerido" });

  const doc = await Mensaje.create({
    autor: req.user.nombre, // viene del token
    texto: texto.trim(),
    fecha: new Date()
  });

  // si usas socket.io, emite aquí (io debe pasarse o importar desde index)
  // req.app.get("io").emit("nuevo-mensaje", doc);

  res.status(201).json(doc);
});

// DELETE (solo profesor)
router.delete("/:id", requireAuth, requireRole("profesor"), async (req, res) => {
  const { id } = req.params;
  await Mensaje.findByIdAndDelete(id);
  res.json({ ok: true });
});

export default router;
