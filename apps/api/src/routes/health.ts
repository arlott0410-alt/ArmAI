import { Hono } from 'hono'
import type { Env } from '../env.js'

const app = new Hono<{ Bindings: Env }>()

app.get('/', (c) => {
  return c.json({
    ok: true,
    service: 'armai-api',
    environment: c.env.ENVIRONMENT ?? 'unknown',
  })
})

export default app
