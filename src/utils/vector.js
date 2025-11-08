// src/utils/vector.js
export function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function norm(a) {
  return Math.sqrt(dot(a, a));
}

export function cosineSimilarity(a, b) {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const denom = norm(a) * norm(b);
  if (denom === 0) return 0;
  return dot(a, b) / denom;
}

// export function topNByScore(items, scoreFn, n = 10) {
//   // compute scores
//   const scored = items.map((it) => ({ item: it, score: scoreFn(it) }));
//   scored.sort((a, b) => b.score - a.score);
//   return scored.slice(0, n).map((s) => ({ ...s.item, _score: s.score }));
// }
