/**
 * Typed API client for ArmAI backend. Base URL from env.
 */

const getBaseUrl = (): string => {
  return (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '/api';
};

async function request<T>(
  path: string,
  opts: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const base = getBaseUrl();
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`;
  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body != null ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return data as T;
}

export interface MeResponse {
  userId: string;
  email: string | null;
  role: 'super_admin' | 'merchant_admin';
  merchantIds: string[];
}

export const authApi = {
  me: (token: string) => request<MeResponse>('/auth/me', { token }),
};

export interface SuperDashboardResponse {
  mrr: number;
  merchantCount: number;
  activeMerchants: number;
  systemHealth: string;
}

export interface MerchantListItem {
  id: string;
  name: string;
  slug: string;
  billing_status: string;
  created_at: string;
}

export const superApi = {
  dashboard: (token: string) => request<SuperDashboardResponse>('/super/dashboard', { token }),
  merchants: (token: string) => request<{ merchants: MerchantListItem[] }>('/super/merchants', { token }),
  createMerchant: (token: string, body: { name: string; slug: string; admin_email: string; admin_full_name?: string }) =>
    request<{ merchantId: string; userId: string }>('/super/merchants', { method: 'POST', token, body }),
  supportStart: (token: string, merchantId: string) =>
    request<{ supportSessionId: string; merchantId: string; readOnly: boolean }>('/support/start', {
      method: 'POST',
      token,
      body: { merchantId },
    }),
};

export interface MerchantDashboardResponse {
  merchantId: string;
  settings: Record<string, unknown> | null;
}

export interface OrderRow {
  id: string;
  merchant_id: string;
  status: string;
  customer_name: string | null;
  amount: number | null;
  reference_code: string | null;
  created_at: string;
  updated_at: string;
}

export const merchantApi = {
  dashboard: (token: string) => request<MerchantDashboardResponse>('/merchant/dashboard', { token }),
  orders: (token: string, params?: { status?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.limit) q.set('limit', String(params.limit));
    const query = q.toString();
    return request<{ orders: OrderRow[] }>(`/merchant/orders${query ? `?${query}` : ''}`, { token });
  },
  order: (token: string, orderId: string) => request<OrderRow>(`/merchant/orders/${orderId}`, { token }),
  bankSync: (token: string, limit?: number) =>
    request<{ bankTransactions: unknown[]; matchingResults: unknown[] }>(
      `/merchant/bank-sync${limit != null ? `?limit=${limit}` : ''}`,
      { token }
    ),
};

export interface MerchantSettingsResponse {
  merchant_id: string;
  ai_system_prompt: string | null;
  bank_parser_id: string | null;
  webhook_verify_token: string | null;
}

export const settingsApi = {
  get: (token: string) => request<MerchantSettingsResponse>('/settings', { token }),
  update: (token: string, body: Partial<{ ai_system_prompt: string | null; bank_parser_id: string | null; webhook_verify_token: string | null }>) =>
    request<{ ok: boolean }>('/settings', { method: 'PATCH', token, body }),
};

export const ordersApi = {
  confirmMatch: (token: string, matchingResultId: string, confirm: boolean) =>
    request<{ ok: boolean }>('/orders/confirm-match', { method: 'POST', token, body: { matching_result_id: matchingResultId, confirm } }),
};

export interface SupportOrdersResponse {
  orders: OrderRow[];
}

export const supportApi = {
  merchantOrders: (token: string, merchantId: string) =>
    request<SupportOrdersResponse>(`/support/merchants/${merchantId}/orders`, { token }),
  merchantSettings: (token: string, merchantId: string) =>
    request<MerchantSettingsResponse>(`/support/merchants/${merchantId}/settings`, { token }),
};
