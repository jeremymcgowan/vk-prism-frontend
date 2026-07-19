import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Cinzel } from 'next/font/google'
import CrmCoreWorkspace from '@/app/components/CrmCoreWorkspace'

// 🎨 Inject V&K Brand Font for Headers
const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '600', '700'] })

export default async function DashboardPage() {
  const cookieStore = cookies()
  
  // Initialize Server-Side Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // 🔒 Security Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 📥 Fetch all entities and their contacts for the data grid
  const { data: entities, error } = await supabase
    .from('crm_entities')
    .select(`
      *,
      crm_contacts (*)
    `)
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching CRM data:", error)
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 🧭 TOP BRANDING HEADER */}
        <header className="border-b border-zinc-900 pb-6 flex justify-between items-end">
          <div>
            <div className="text-emerald-500 text-xs font-mono font-bold tracking-widest mb-2 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              SYSTEM ONLINE
            </div>
            {/* ✨ CINZEL APPLIED TO MASTER HEADER ONLY */}
            <h1 className={`text-4xl font-bold text-zinc-100 tracking-tight ${cinzel.className}`}>
              CRM CORE
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-zinc-500">OPERATOR ID: {user.id.split('-')[0]}</p>
            <p className="text-xs font-mono text-zinc-500 tracking-widest">TENANT SECURE</p>
          </div>
        </header>

        {/* 🚀 INJECT THE WORKSPACE COMPONENT */}
        <main>
          <CrmCoreWorkspace initialData={entities || []} />
        </main>
        
      </div>
    </div>
  )
}