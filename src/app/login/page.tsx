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

  // Step 1: Verify Core Identity Credentials
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

  // Step 2: Verify Multi-Factor Cryptographic Factor Token
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
            {/* Direct Brand Logo Integration Channel */}
            <img 
              src="https://vkpartners.co/knight-only.png" 
              alt="V&K Partners Official Knight Crest" 
              className="h-full w-full object-contain filter drop-shadow-[0_0_15px_rgba(197,168,128,0.2)] "
              onError={(e) => {
                // Failure mitigation handler: falls back to local file if path differs
                e.currentTarget.src = "/logo.png"
              }}
            />
          </div>
          <span className="text-sm font-medium tracking-[0.2em] text-[#A39074] uppercase">V&K Partners</span>
          <h1 className="mt-1.5 font-[family-name:var(--font-cinzel)] text-xl font-semibold tracking-widest text-white uppercase">Prism Core Login</h1>
          <div className="mt-4 h-[1px] w-12 bg-gradient-to-r from-transparent via-[#C5A880]/30 to-transparent" />
        </div>

        {step === 'credentials' ? (
          /* Step 1: Primary Credentials Layout Form */
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
        ) : (
          /* Step 2: Multi-Factor Authentication Challenge Form */
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