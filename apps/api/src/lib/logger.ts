/**
 * Structured JSON logging for Cloudflare Logs (Logpush / dashboard).
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export function structuredLog(
  level: LogLevel,
  message: string,
  meta: Record<string, unknown> = {}
): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  }
  console.log(JSON.stringify(payload))
}

export function logRequest(
  path: string,
  correlationId: string | undefined,
  extra: Record<string, unknown> = {}
): void {
  structuredLog('info', 'request', { path, correlationId, ...extra })
}

export function logError(message: string, correlationId: string | undefined, err?: unknown): void {
  structuredLog('error', message, {
    correlationId,
    error: err instanceof Error ? err.message : String(err),
  })
}
