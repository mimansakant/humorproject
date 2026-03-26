import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { ALLOWED_EMAILS } from '@/lib/allowlist'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user?.email && ALLOWED_EMAILS.includes(user.email)) {
        return NextResponse.redirect(`${origin}/`)
      }

      // Email not in allowlist — sign out and deny access
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/login?error=access_denied`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
