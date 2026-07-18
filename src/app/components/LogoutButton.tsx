'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh() // Wipes server-side session cache
    router.push('/') // Redirects directly to the clean login screen
  }

  return (
    <button
      onClick={handleLogout}
      className="text-[10px] font-mono tracking-wider font-bold px-2.5 py-1 bg-red-950/20 text-red-400 border border-red-900/30 rounded hover:bg-red-900/30 transition-all duration-200"
    >
      LOGOUT
    </button>
  )
}