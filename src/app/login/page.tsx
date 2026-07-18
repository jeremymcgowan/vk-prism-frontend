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

  // Step 1: Verify Primary Email & Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Check if Supabase requires an outstanding MFA challenge factor
    const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors()
    
    if (!factorError && factors?.all && factors.all.length > 0) {
      // User has MFA enabled, advance view layout to the MFA challenge input screen
      setStep('mfa')
      setLoading(false)
    } else {
      // No MFA factor pinned to account, transition directly to console cockpit
      router.push('/dashboard')
      router.refresh()
    }
  }

  // Step 2: Challenge Verification Code Submission
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
    const escalatedFactor = factors?.all[0]

    if (!escalatedFactor) {
      setError('ERR: No active Multi-Factor target discovered on account schema.')
      setLoading(false)
      return
    }

    // Submit the 6-digit challenge token to Supabase
    const { error: mfaError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: escalatedFactor.id,
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
    <div className="flex min-h-screen w-screen items-center justify-center bg-obsidian-bg text-terminal-text font-mono antialiased">
      <div className="w-full max-w-md rounded-md border border-obsidian-border bg-obsidian-card p-8 shadow-2xl">
        
        {/* Unified Pulsing Antique Gold Logo Block & Header */}
        <div className="mb-8 flex flex-col items-center justify-center space-y-3 text-center">
          {/* Brand Icon SVG Wrapper */}
          <div className="flex h-10 w-10 items-center justify-center rounded border border-brand-bronze/30 bg-neutral-900/40 p-2 shadow-[0_0_15px_rgba(197,168,128,0.05)]">
            <svg className="h-full w-full text-brand-gold animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-5.25v9" />
            </svg>
          </div>
          <div>
            <span className="block text-[10px] font-bold tracking-widest text-terminal-gray uppercase">V&K Partners</span>
            <h1 className="mt-1 text-sm font-bold tracking-widest text-white uppercase">Prism Core Auth</h1>
          </div>
        </div>

        {step === 'credentials' ? (
          /* Step 1: Core Credentials Layout Form */
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 focus:outline-none transition-all tracking-wide"
                placeholder="admin@vkpartners.co"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 focus:outline-none transition-all tracking-wide"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded border border-red-900/50 bg-red-950/20 px-3 py-2 text-[11px] text-red-400">
                ERR: {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-md bg-gradient-to-r from-brand-bronze via-brand-gold to-brand-darkgold py-3 text-xs font-bold uppercase tracking-widest text-obsidian-bg hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_15px_rgba(154,123,86,0.1)]"
            >
              {loading ? 'Verifying Telemetry...' : 'Establish Secure Link'}
            </button>
          </form>
        ) : (
          /* Step 2: Multi-Factor Authentication Prompt Form */
          <form onSubmit={handleVerifyMfa} className="space-y-5 animate-fadeIn">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400">MFA Verification Code</label>
                <span className="text-[9px] text-brand-gold font-bold uppercase tracking-wider">Escalated Security Required</span>
              </div>
              <input 
                type="text" 
                required
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.5em] font-bold rounded-md border border-brand-gold/30 bg-neutral-900/50 px-3 py-3 text-base text-brand-gold placeholder-neutral-700 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 focus:outline-none transition-all"
                placeholder="000000"
              />
              <p className="mt-2 text-[10px] text-neutral-500 leading-normal">
                Input the 6-digit code from your linked authenticator node to unlock access parameters.
              </p>
            </div>

            {error && (
              <div className="rounded border border-red-900/50 bg-red-950/20 px-3 py-2 text-[11px] text-red-400">
                ERR: {error}
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-md bg-gradient-to-r from-brand-bronze via-brand-gold to-brand-darkgold py-3 text-xs font-bold uppercase tracking-widest text-obsidian-bg hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_15px_rgba(154,123,86,0.1)]"
              >
                {loading ? 'Validating Token...' : 'Verify Cryptographic Key'}
              </button>
              
              <button
                type="button"
                onClick={() => { setStep('credentials'); setError(null); }}
                className="text-center text-[10px] uppercase tracking-wider text-neutral-500 hover:text-neutral-300 transition-colors pt-1 cursor-pointer"
              >
                Return to Credentials
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}