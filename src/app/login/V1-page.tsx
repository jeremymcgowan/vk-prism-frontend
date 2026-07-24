'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Step 1: Verify Core Identity Credentials via Email/Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors()
    
    if (!factorError && factors?.all && factors.all.length > 0) {
      setStep('mfa')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  // Step 2: Google OAuth Authentication Gateway
  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const { createBrowserClient } = await import('@supabase/ssr')
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Instructs Supabase to pass the session token right back to your application's secure handoff lane
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (oauthError) {
        setError(oauthError.message)
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected OAuth error occurred.')
      setLoading(false)
    }
  }

  // Step 3: Verify Multi-Factor Cryptographic Factor Token
  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: factors } = await supabase.auth.mfa.listFactors()
    const activeFactor = factors?.all[0]

    if (!activeFactor) {
      setError('ERR: No active Multi-Factor authentication factor discovered.')
      setLoading(false)
      return
    }

    const { error: mfaError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: activeFactor.id,
      code: mfaCode,
    })

    if (mfaError) {
      setError(mfaError.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-[#050507] text-[#E4E4E7] font-[family-name:var(--font-inter)] antialiased">
      <div className="w-full max-w-md rounded-md border border-[#1C1A16]/40 bg-[#0A0A0C] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        
        {/* Master Brand Crest & Editorial Typography Header */}
        <div className="mb-10 flex flex-col items-center justify-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center">
            <img 
              src="/knight_only.png" 
              alt="V&K Partners Official Knight Crest" 
              className="h-full w-full object-contain filter drop-shadow-[0_0_15px_rgba(197,168,128,0.2)]"
              onError={(e) => {
                e.currentTarget.src = "/logo.png"
              }}
            />
          </div>
          <span className="text-base font-medium tracking-[0.2em] text-[#C5A880] uppercase">V&K Partners</span>
          <h1 className="mt-1.5 font-[family-name:var(--font-cinzel)] text-xl font-semibold tracking-widest text-white uppercase">Prism Core Login</h1>
          <div className="mt-4 h-[1px] w-12 bg-gradient-to-r from-transparent via-[#C5A880]/30 to-transparent" />
        </div>

        {step === 'credentials' ? (
          /* Step 1: Primary Credentials Layout Form */
          <div className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[11px] font-medium tracking-widest text-[#A1A1AA] uppercase mb-2">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-[#27272A] bg-[#121215] px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-[#C5A880]/40 focus:ring-1 focus:ring-[#C5A880]/10 focus:outline-none transition-all tracking-wide"
                  placeholder="admin@vkpartners.co"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium tracking-widest text-[#A1A1AA] uppercase mb-2">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded border border-[#27272A] bg-[#121215] px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-[#C5A880]/40 focus:ring-1 focus:ring-[#C5A880]/10 focus:outline-none transition-all tracking-wide"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="rounded border border-red-900/30 bg-red-950/10 px-4 py-2.5 text-xs text-red-400 font-mono">
                  SIGN_IN_ERROR // {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full rounded bg-gradient-to-r from-[#9A7B56] via-[#C5A880] to-[#7C643F] py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#050507] hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_25px_rgba(197,168,128,0.15)]"
              >
                {loading ? 'Verifying Credentials...' : 'Establish Secure Link'}
              </button>
            </form>

            {/* Visual Editorial Divider */}
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#27272A]/60"></div>
              </div>
              <span className="relative bg-[#0A0A0C] px-3 text-[10px] font-medium tracking-widest text-neutral-500 uppercase">Or</span>
            </div>

            {/* Premium Google Authentication Trigger Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded border border-[#27272A] bg-[#121215] py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#E4E4E7] hover:bg-[#161619] hover:border-[#C5A880]/20 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
            >
              <svg className="h-4 w-4 text-neutral-400" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Identity Protocol (Google)
            </button>
          </div>
        ) : (
          /* Step 3: Multi-Factor Authentication Challenge Form */
          <form onSubmit={handleVerifyMfa} className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-[11px] font-medium tracking-widest text-[#A1A1AA] uppercase">MFA Security Token</label>
                <span className="text-[9px] font-bold tracking-wider text-[#C5A880] uppercase">Escalated Protocol</span>
              </div>
              <input 
                type="text" 
                required
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.6em] font-semibold rounded border border-[#C5A880]/30 bg-[#121215] px-4 py-3 text-lg text-[#C5A880] placeholder-neutral-800 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/10 focus:outline-none transition-all"
                placeholder="000000"
              />
              <p className="mt-2 text-center text-[11px] text-neutral-500 leading-normal">
                Input the 6-digit cryptographic challenge factor to verify terminal clearance.
              </p>
            </div>

            {error && (
              <div className="rounded border border-red-900/30 bg-red-950/10 px-4 py-2.5 text-xs text-red-400 font-mono">
                MFA_VERIFY_ERROR // {error}
              </div>
            )}

            <div className="flex flex-col space-y-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full rounded bg-gradient-to-r from-[#9A7B56] via-[#C5A880] to-[#7C643F] py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#05070A] hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_25px_rgba(197,168,128,0.15)]"
              >
                {loading ? 'Validating Factor...' : 'Verify Security Token'}
              </button>
              
              <button
                type="button"
                onClick={() => { setStep('credentials'); setError(null); }}
                className="text-center text-[11px] uppercase tracking-widest text-neutral-500 hover:text-neutral-300 transition-colors pt-1 cursor-pointer"
              >
                Cancel Validation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}