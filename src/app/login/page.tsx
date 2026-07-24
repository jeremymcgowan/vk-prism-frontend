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
    <div className="flex min-h-screen w-screen items-center justify-center bg-[#050507] text-[#E4E4E7] font-[family-name:var(--font-inter)] antialiased p-6">
      
      {/* Expanded container width (max-w-lg) to match institutional onboarding presence */}
      <div className="w-full max-w-lg relative my-8">
        
        {/* EXPANSIVE GOLD HALO: Double-layered ambient glow */}
        <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-[#C5A880]/30 via-[#8B7325]/15 to-[#C5A880]/30 rounded-[2rem] blur-3xl opacity-80 pointer-events-none transition-all duration-700"></div>

        {/* MAIN CARD: Obsidian glass panel with enhanced padding and corner accent */}
        <div className="relative w-full rounded-2xl border border-[#C5A880]/40 hover:border-[#C5A880]/60 bg-[#0A0A0C]/95 p-8 md:p-12 shadow-[0_10px_50px_rgba(0,0,0,0.9),0_0_40px_-5px_rgba(197,168,128,0.25)] transition-all duration-500 overflow-hidden">
          
          {/* Internal Corner Accent Glow */}
          <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#C5A880]/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Master Brand Crest & Editorial Typography Header */}
          <div className="mb-10 flex flex-col items-center justify-center text-center relative z-10">
            <div className="mb-3 flex h-16 w-16 items-center justify-center">
              <img 
                src="/knight_only.png" 
                alt="V&K Partners Official Knight Crest" 
                className="h-full w-full object-contain filter drop-shadow-[0_0_15px_rgba(197,168,128,0.4)]"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png"
                }}
              />
            </div>
            <span className="text-xs font-bold tracking-[0.25em] text-[#C5A880] uppercase">V&amp;K Partners</span>
            <h1 className="mt-1.5 font-[family-name:var(--font-cinzel)] text-xl sm:text-2xl font-light tracking-wider text-white uppercase">Prism Core Login</h1>
            <div className="mt-4 h-[1px] w-12 bg-gradient-to-r from-transparent via-[#C5A880]/40 to-transparent" />
          </div>

          {step === 'credentials' ? (
            /* Step 1: Primary Credentials Layout Form */
            <div className="space-y-6 relative z-10">
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase mb-2">Email</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#27272A] bg-[#121215] px-4 py-3.5 text-sm text-white placeholder-neutral-600 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner tracking-wide"
                    placeholder="admin@vkpartners.co"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase mb-2">Password</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#27272A] bg-[#121215] px-4 py-3.5 text-sm text-white placeholder-neutral-600 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner tracking-wide"
                    placeholder="••••••••••••••"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-xs text-red-400 font-mono shadow-inner">
                    SIGN_IN_ERROR // {error}
                  </div>
                )}

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full rounded-xl bg-[#C5A880] hover:bg-[#D4B990] py-3.5 text-xs font-extrabold uppercase tracking-[0.2em] text-[#050507] transition-all shadow-[0_0_25px_rgba(197,168,128,0.3)] hover:shadow-[0_0_35px_rgba(197,168,128,0.5)] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Verifying Credentials...' : 'Establish Secure Link'}
                  </button>
                </div>
              </form>

              {/* Visual Editorial Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#27272A]/80"></div>
                </div>
                <span className="relative bg-[#0A0A0C] px-4 text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">Or</span>
              </div>

              {/* Premium Google Authentication Trigger Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#27272A] bg-[#121215]/95 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-300 hover:text-white hover:bg-[#161619] hover:border-[#C5A880]/40 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-inner"
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
            <form onSubmit={handleVerifyMfa} className="space-y-6 relative z-10">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">MFA Security Token</label>
                  <span className="text-[9px] font-bold tracking-wider text-[#C5A880] uppercase bg-[#C5A880]/10 px-2 py-0.5 rounded border border-[#C5A880]/30">Escalated Protocol</span>
                </div>
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.6em] font-bold rounded-xl border border-[#C5A880]/40 bg-[#121215] px-4 py-3.5 text-lg text-[#C5A880] placeholder-neutral-800 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                  placeholder="000000"
                />
                <p className="mt-2 text-center text-[11px] text-neutral-400 leading-normal">
                  Input the 6-digit cryptographic challenge factor to verify terminal clearance.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-xs text-red-400 font-mono shadow-inner">
                  MFA_VERIFY_ERROR // {error}
                </div>
              )}

              <div className="flex flex-col space-y-4 pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full rounded-xl bg-[#C5A880] hover:bg-[#D4B990] py-3.5 text-xs font-extrabold uppercase tracking-[0.2em] text-[#050507] transition-all shadow-[0_0_25px_rgba(197,168,128,0.3)] hover:shadow-[0_0_35px_rgba(197,168,128,0.5)] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Validating Factor...' : 'Verify Security Token'}
                </button>
                
                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setError(null); }}
                  className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-300 transition-colors pt-1 cursor-pointer"
                >
                  Cancel Validation
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

    </div>
  )
}