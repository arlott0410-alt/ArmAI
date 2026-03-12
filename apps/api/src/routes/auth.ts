import { Hono } from 'hono'
import type { Env } from '../env.js'
import { authMiddleware } from '../middleware/auth.js'

const app = new Hono<{
  Bindings: Env
  Variables: { auth: import('../middleware/auth.js').AuthContext }
}>()

app.use('/*', authMiddleware)

app.get('/me', (c) => {
  const auth = c.get('auth')
  return c.json({
    userId: auth.userId,
    email: auth.email,
    role: auth.role,
    merchantIds: auth.merchantIds,
  })
})

export default app
