// client/src/api.js
const API = {
  base: import.meta.env.VITE_API_URL || "http://localhost:4000",
  async get(path) {
    const r = await fetch(this.base + path, { headers: authHeader() });
    return r.json();
  },
  async post(path, body) {
    const r = await fetch(this.base + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(body),
    });
    return r.json();
  },
  async del(path) {
    const r = await fetch(this.base + path, {
      method: "DELETE",
      headers: authHeader(),
    });
    return r.json();
  },
};

function authHeader() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export default API;