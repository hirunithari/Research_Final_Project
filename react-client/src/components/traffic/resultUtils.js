// src/components/traffic/resultUtils.js
// Pure helpers (easy to test)

export function percent(n) {
    if (n == null || Number.isNaN(n)) return "—";
    return `${(n * 100).toFixed(1)}%`;
  }
  
  export function round(n, digits = 1) {
    if (n == null || Number.isNaN(n)) return null;
    const p = Math.pow(10, digits);
    return Math.round(n * p) / p;
  }
  
  /** Return top-k array sorted descending by prob; guards shape. */
  export function normalizeTopk(topk) {
    if (!Array.isArray(topk)) return [];
    return [...topk]
      .filter(x => x && typeof x.label === "string" && typeof x.prob === "number")
      .sort((a, b) => b.prob - a.prob);
  }
  