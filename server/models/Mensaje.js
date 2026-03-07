import mongoose from "mongoose";

const mensajeSchema = new mongoose.Schema(
  {
    autor: { type: String, required: true, trim: true },
    texto:  { type: String, required: true, trim: true },
    fecha:  { type: Date,  default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.Mensaje || mongoose.model("Mensaje", mensajeSchema);
