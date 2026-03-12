import type { ApiErrorBody } from '@armai/shared'

export function jsonError(c: {
  status: number
  body: ApiErrorBody
  header?: (name: string, value: string) => void
}): Response {
  const res = new Response(JSON.stringify(c.body), {
    status: c.status,
    headers: {
      'Content-Type': 'application/json',
      ...(c.header ? {} : {}),
    },
  })
  if (c.header) {
    c.header('Content-Type', 'application/json')
  }
  return res
}

export function correlationId(): string {
  return crypto.randomUUID()
}
