import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Token faltante" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    req.user = payload; // { id, nombre, email, rol }
    next();
  } catch (e) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "No auth" });
    if (!roles.includes(req.user.rol))
      return res.status(403).json({ error: "No autorizado" });
    next();
  };
}
