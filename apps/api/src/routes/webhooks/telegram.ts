import { Hono } from 'hono'
import type { Env } from '../../env.js'
import { getSupabaseAdmin } from '../../lib/supabase.js'
import { parseJsonWithLimit } from '../../lib/stream.js'
import { structuredLog } from '../../lib/logger.js'
import * as telegram from '../../services/telegram.js'
import { processTelegramUpdate, type TelegramUpdate } from '../../services/telegram-intake.js'

const app = new Hono<{ Bindings: Env }>()

const TELEGRAM_BODY_MAX_BYTES = 5 * 1024 * 1024 // 5MB for photos/slip images

app.post('/:merchantId', async (c) => {
  const merchantId = c.req.param('merchantId')
  structuredLog('info', 'webhook telegram', { path: c.req.path, merchantId })

  let body: unknown
  try {
    body = await parseJsonWithLimit(c.req.raw.body, TELEGRAM_BODY_MAX_BYTES)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Body read failed'
    structuredLog('warn', msg, { merchantId })
    return c.json({ error: msg }, 400)
  }
  if (!body || typeof body !== 'object') {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const supabase = getSupabaseAdmin(c.env)
  const connection = await telegram.getTelegramConnection(supabase, merchantId)
  if (!connection?.bot_token_encrypted_or_bound_reference || !connection.is_active) {
    return c.json({ error: 'Telegram not configured or inactive' }, 404)
  }

  const update = body as TelegramUpdate
  const chatId = update.message?.chat?.id != null ? String(update.message.chat.id) : null
  if (!chatId || chatId !== connection.telegram_group_id) {
    return c.json({ error: 'Chat not linked to this merchant' }, 400)
  }

  try {
    const result = await processTelegramUpdate(supabase, {
      merchantId,
      update,
      connection,
    })
    return c.json({ ok: true, processed: result.processed, reply: result.reply })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    structuredLog('error', message, { merchantId })
    return c.json({ error: message }, 500)
  }
})

export default app
