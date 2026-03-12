/**
 * Retention cleanup helpers for raw event tables.
 * Call from admin/scheduler; do NOT run automatically in normal request path.
 * retention_class: short (e.g. 30d), medium (e.g. 90d), long (e.g. 1y). retained_until: eligible after this time.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

const SHORT_RETENTION_DAYS = 30
const MEDIUM_RETENTION_DAYS = 90
const LONG_RETENTION_DAYS = 365

function cutoffDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

/**
 * Delete webhook_events older than retention. Uses retention_class or default short.
 * Returns count of deleted (or 0 if table lacks column). Run via admin/scheduler only.
 */
export async function purgeWebhookEvents(
  supabase: SupabaseClient,
  options?: { shortDays?: number }
): Promise<number> {
  const cutoff = cutoffDays(options?.shortDays ?? SHORT_RETENTION_DAYS)
  const { data: rows, error } = await supabase
    .from('webhook_events')
    .select('id')
    .lt('created_at', cutoff)
    .limit(1000)
  if (error || !rows?.length) return 0
  const ids = rows.map((r: { id: string }) => r.id)
  const { error: delErr } = await supabase.from('webhook_events').delete().in('id', ids)
  if (delErr) return 0
  return ids.length
}

/**
 * Delete telegram_messages older than retention. Run via admin/scheduler only.
 */
export async function purgeTelegramMessages(
  supabase: SupabaseClient,
  options?: { shortDays?: number }
): Promise<number> {
  const cutoff = cutoffDays(options?.shortDays ?? SHORT_RETENTION_DAYS)
  const { data: rows, error } = await supabase
    .from('telegram_messages')
    .select('id')
    .lt('created_at', cutoff)
    .limit(500)
  if (error || !rows?.length) return 0
  const ids = rows.map((r: { id: string }) => r.id)
  const { error: delErr } = await supabase.from('telegram_messages').delete().in('id', ids)
  if (delErr) return 0
  return ids.length
}

/**
 * Delete bank_raw_notification_events older than retention. Run via admin/scheduler only.
 */
export async function purgeBankRawEvents(
  supabase: SupabaseClient,
  options?: { shortDays?: number }
): Promise<number> {
  try {
    const cutoff = cutoffDays(options?.shortDays ?? SHORT_RETENTION_DAYS)
    const { data: rows, error } = await supabase
      .from('bank_raw_notification_events')
      .select('id')
      .lt('received_at', cutoff)
      .limit(500)
    if (error || !rows?.length) return 0
    const ids = rows.map((r: { id: string }) => r.id)
    const { error: delErr } = await supabase
      .from('bank_raw_notification_events')
      .delete()
      .in('id', ids)
    if (delErr) return 0
    return ids.length
  } catch {
    return 0
  }
}
