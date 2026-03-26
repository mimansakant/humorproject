import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Allow auth routes through before any network calls
  if (pathname.startsWith('/login') || pathname.startsWith('/auth')) {
    return supabaseResponse
  }

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // If auth check fails, treat as unauthenticated
  }

  // Redirect already-authenticated users away from login
  if (pathname.startsWith('/login') && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Public routes — no auth required
  if (pathname === '/') {
    return supabaseResponse
  }

  // All other routes require authentication
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
