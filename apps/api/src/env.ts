/**
 * Cloudflare bindings and env. All secrets from Dashboard; no hardcoding.
 */
export interface Env {
  ENVIRONMENT: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  GEMINI_API_KEY: string;
  FACEBOOK_APP_SECRET: string;
  /** Token for Facebook webhook GET verification (hub.verify_token). */
  FACEBOOK_VERIFY_TOKEN?: string;
  SLIP_BUCKET: R2Bucket;
}
