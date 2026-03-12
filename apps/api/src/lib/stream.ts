/**
 * Read request body with a maximum size (for large webhook payloads e.g. slip images).
 * Prevents OOM on huge bodies.
 */
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024 // 2MB

export async function readBodyWithLimit(
  stream: ReadableStream<Uint8Array> | null,
  maxBytes: number = DEFAULT_MAX_BYTES
): Promise<Uint8Array> {
  if (!stream) return new Uint8Array(0)
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        total += value.length
        if (total > maxBytes) {
          reader.cancel()
          throw new Error(`Body too large (max ${maxBytes} bytes)`)
        }
        chunks.push(value)
      }
    }
  } finally {
    reader.releaseLock()
  }
  const out = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

export async function parseJsonWithLimit(
  stream: ReadableStream<Uint8Array> | null,
  maxBytes: number = DEFAULT_MAX_BYTES
): Promise<unknown> {
  const body = await readBodyWithLimit(stream, maxBytes)
  const text = new TextDecoder().decode(body)
  return JSON.parse(text || '{}')
}
