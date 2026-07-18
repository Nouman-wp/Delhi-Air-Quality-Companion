/**
 * Lightweight, dependency-free text embedding using the hashing trick with
 * TF weighting and L2 normalization. Avoids requiring an external embeddings
 * API key or a large local model download, while still producing stable,
 * comparable dense vectors for Elasticsearch kNN search.
 */
const VECTOR_DIMS = 256;

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "and", "or", "to", "of",
  "in", "on", "for", "it", "this", "that", "with", "as", "be", "at", "by",
  "i", "my", "me", "can", "should", "will", "do", "does", "if",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function hashToken(token: string): number {
  let hash = 2166136261;
  for (let i = 0; i < token.length; i++) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function embedText(text: string): number[] {
  const vector = new Array(VECTOR_DIMS).fill(0);
  const tokens = tokenize(text);
  for (const token of tokens) {
    const h = hashToken(token);
    const idx = h % VECTOR_DIMS;
    const sign = h % 2 === 0 ? 1 : -1;
    vector[idx] += sign;
  }
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / magnitude);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

export const EMBEDDING_DIMS = VECTOR_DIMS;
