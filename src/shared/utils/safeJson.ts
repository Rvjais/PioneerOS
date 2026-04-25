/**
 * Safe JSON.parse wrapper that returns a fallback instead of throwing.
 */
export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    console.error('[safeJsonParse] Failed to parse:', value.slice(0, 100))
    return fallback
  }
}
