import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createAuthClient() {
  const cookieStore = await cookies()

  return createServerClient(
    `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — cookie writes are ignored
          }
        },
      },
    }
  )
}
