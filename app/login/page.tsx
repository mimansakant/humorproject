import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createAuthClient } from '@/lib/supabase-server'

async function signInWithGoogle() {
  'use server'
  const headersList = await headers()
  const origin =
    headersList.get('origin') ??
    `${headersList.get('x-forwarded-proto') ?? 'http'}://${headersList.get('host') ?? 'localhost:3000'}`

  const supabase = await createAuthClient()
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (data.url) redirect(data.url)
}

export default async function LoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#111118' }}
    >
      <div
        className="text-center rounded-2xl px-10 py-12 w-full"
        style={{ maxWidth: '380px', backgroundColor: '#1a1a24', border: '1px solid #2a2a38' }}
      >
        <h1
          className="text-white/80 text-base tracking-[0.25em] mb-1"
          style={{ fontFamily: '"Courier New", Courier, monospace' }}
        >
          SHAKE TO REVEAL PHOTO
        </h1>
        <p
          className="text-white/25 text-[10px] tracking-widest mb-8"
          style={{ fontFamily: '"Courier New", Courier, monospace' }}
        >
          sign in to continue
        </p>

<form action={signInWithGoogle}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all bg-white text-gray-900 hover:bg-gray-100 hover:scale-[1.02] active:scale-95"
          >
            <GoogleIcon />
            Sign in with Google
          </button>
        </form>
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908C16.658 14.108 17.64 11.8 17.64 9.2z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}
