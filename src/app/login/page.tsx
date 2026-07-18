'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client' // Ensure you have a client initialization utility or use standard supabase-js client layout

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

    // Quick client instantiation fallback logic
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
    <div className="flex min-h-screen w-screen items-center justify-center bg-[#0A0A0C] text-[#E4E4E7] antialiased">
      <div className="w-full max-w-md rounded-lg border border-[#1F1F23] bg-[#0E0E11] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <span className="font-mono text-xs font-bold tracking-widest text-[#71717A]">V&K PARTNERS</span>
          <h1 className="mt-2 font-mono text-xl font-bold tracking-tight text-white">PRISM CORE AUTH</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#A1A1AA] mb-2">Terminal Identity (Email)</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[#27272A] bg-[#141417] px-3 py-2 text-sm text-white placeholder-[#52525B] focus:border-purple-500 focus:outline-none transition-all"
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
              className="w-full rounded-md border border-[#27272A] bg-[#141417] px-3 py-2 text-sm text-white placeholder-[#52525B] focus:border-purple-500 focus:outline-none transition-all"
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
            className="w-full rounded-md bg-gradient-to-r from-cyan-600 to-purple-600 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying Telemetry...' : 'Establish Secure Link'}
          </button>
        </form>
      </div>
    </div>
  )
}