'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-[#0A0A0C] text-[#E4E4E7] font-sans antialiased">
      <div className="w-full max-w-md rounded-lg border border-[#1F1F23] bg-[#0E0E11] p-8 shadow-2xl">
        
        {/* Unified Pulsing Gold Logo & Corporate Header */}
        <div className="mb-8 flex flex-col items-center justify-center space-y-3 text-center">
          <div className="h-6 w-6 bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] rounded-sm animate-pulse shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
          <div>
            <span className="block font-mono text-[10px] font-bold tracking-widest text-[#71717A] uppercase">V&K Partners</span>
            <h1 className="mt-1 font-mono text-lg font-bold tracking-tight text-white uppercase">Prism Core Auth</h1>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#A1A1AA] mb-2">Terminal Identity (Email)</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[#27272A] bg-[#141417] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#D4AF37]/70 focus:ring-1 focus:ring-[#D4AF37]/30 focus:outline-none transition-all font-sans"
              placeholder="admin@vkpartners.co"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#A1A1AA] mb-2">Security Key (Password)</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[#27272A] bg-[#141417] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#D4AF37]/70 focus:ring-1 focus:ring-[#D4AF37]/30 focus:outline-none transition-all font-sans"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded border border-red-900/50 bg-red-950/20 px-3 py-2 text-xs text-red-400 font-mono">
              ERR: {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-md bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#B38728] py-3 text-xs font-mono font-bold uppercase tracking-wider text-black hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_20px_rgba(212,175,55,0.15)]"
          >
            {loading ? 'Verifying Telemetry...' : 'Establish Secure Link'}
          </button>
        </form>
      </div>
    </div>
  )
}