// server/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email:  { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ["alumno", "profesor"], default: "alumno" },
}, { timestamps: true });

export default mongoose.model("User", userSchema);