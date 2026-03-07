import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email:  { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
    rol: { type: String, enum: ["alumno", "profesor"], default: "alumno" },
  },
  { timestamps: true }
);

export default mongoose.models.Usuario || mongoose.model("Usuario", usuarioSchema);
