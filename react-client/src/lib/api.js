// src/lib/api.js
// Small helpers to keep URLs consistent across fetch & WebSocket.

const BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"; // per docs local default

export function apiBase() {
  return BASE.replace(/\/+$/, "");
}

export function wsBase() {
  return apiBase().replace(/^http/i, "ws");
}

export async function getJson(path) {
  const res = await fetch(`${apiBase()}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return res.json();
}
