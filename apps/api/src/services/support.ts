import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Start support access session: log to support_access_logs. Read-only; no session impersonation.
 */
export async function startSupportAccess(
  supabase: SupabaseClient,
  payload: { actorId: string; merchantId: string; ipAddress?: string; userAgent?: string }
) {
  const { data, error } = await supabase
    .from('support_access_logs')
    .insert({
      actor_id: payload.actorId,
      merchant_id: payload.merchantId,
      ip_address: payload.ipAddress,
      user_agent: payload.userAgent,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data!.id;
}

export async function logAudit(
  supabase: SupabaseClient,
  payload: { actorId: string; action: string; resourceType?: string; resourceId?: string; details?: unknown }
) {
  const { error } = await supabase.from('audit_logs').insert({
    actor_id: payload.actorId,
    action: payload.action,
    resource_type: payload.resourceType,
    resource_id: payload.resourceId,
    details: payload.details as Record<string, unknown> | null,
  });
  if (error) throw new Error(error.message);
}
