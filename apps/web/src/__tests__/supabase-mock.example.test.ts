import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSignInWithPassword = vi.fn().mockResolvedValue({
  data: { session: { access_token: 'mock-token' }, user: {} },
  error: null,
})
const mockSignOut = vi.fn().mockResolvedValue({ error: null })
const mockGetSession = vi.fn().mockResolvedValue({
  data: { session: null },
})
const mockOnAuthStateChange = vi
  .fn()
  .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  })),
}))

describe('Supabase mock example', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createClient returns mock client with auth methods', async () => {
    const { createClient } = await import('@supabase/supabase-js')
    const client = createClient('https://test.supabase.co', 'anon-key')
    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
    expect(typeof client.auth.signInWithPassword).toBe('function')
    expect(typeof client.auth.signOut).toBe('function')
    expect(typeof client.auth.getSession).toBe('function')
  })

  it('mock signInWithPassword resolves with session', async () => {
    const { createClient } = await import('@supabase/supabase-js')
    const client = createClient('https://x.co', 'key')
    const result = await client.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'secret',
    })
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret',
    })
    expect(result.data.session?.access_token).toBe('mock-token')
    expect(result.error).toBeNull()
  })

  it('mock signOut can be called without error', async () => {
    const { createClient } = await import('@supabase/supabase-js')
    const client = createClient('https://x.co', 'key')
    await client.auth.signOut()
    expect(mockSignOut).toHaveBeenCalled()
  })
})
