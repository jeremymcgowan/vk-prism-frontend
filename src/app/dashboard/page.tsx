import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import LogoutButton from '../components/LogoutButton'
import CrmCoreWorkspace from '../components/CrmCoreWorkspace'

interface PageProps {
  searchParams: Promise<{ id?: string }> | { id?: string }
}

export default async function DashboardPage({ searchParams }: PageProps) {
  // Safe resolution for Next.js App Router query handling
  const resolvedParams = await searchParams
  const activeId = resolvedParams?.id ?? '0'

  // Open secure server-side database channel matching your middleware standards
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  // 👤 SECURITY CHECK: Fetch the active authenticated identity directly from Supabase
  const { data: { user } } = await supabase.auth.getUser()
  
  // Extract dynamic branding telemetry from the user token
  const userEmail = user?.email ?? 'no-session@vkpartners.co'
  // If they signed in via Google, grab their actual name, otherwise fall back to their email prefix
  const userDisplayName = user?.user_metadata?.full_name || userEmail.split('@')[0]

  // 1. FETCH CRM CORE WITH RELATIONAL JOINS (View ID: 1)
  let crmData: any[] = []
  if (activeId === '1') {
    // 🔗 This pulls the entity AND its attached contacts in one query.
    const { data } = await supabase
      .from('crm_entities')
      .select(`
        *,
        crm_contacts (
          first_name,
          last_name,
          email,
          phone,
          is_primary_contact
        )
      `)
      .order('created_at', { ascending: false })
    crmData = data || []
  }

  // 2. FETCH PROPOSALS & BILLING (View ID: 2)
  let billingData: any[] = []
  if (activeId === '2') {
    const { data } = await supabase.from('proposals_billing').select('*').order('created_at', { ascending: false })
    billingData = data || []
  }

  // 3. FETCH COGNITIVE CALENDAR EVENTS (View ID: 3)
  let calendarData: any[] = []
  if (activeId === '3') {
    const { data } = await supabase.from('calendar_events').select('*').order('start_time', { ascending: true })
    calendarData = data || []
  }

  return (
    <div className="flex h-screen bg-black text-white font-sans antialiased select-none">
      
      {/* 🧭 NAVIGATION SIDEBAR */}
      <aside className="w-72 border-r border-zinc-900 bg-zinc-950/40 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded border border-amber-500/30 flex items-center justify-center text-amber-500 font-sans font-bold">VK</div>
            <div>
              <h1 className="text-sm font-bold tracking-widest text-zinc-200">V&K PARTNERS</h1>
              <p className="text-[10px] font-bold tracking-[0.3em] text-amber-500/80">PRISM</p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link href="/dashboard?id=0" className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded text-xs font-semibold tracking-wider transition ${activeId === '0' ? 'bg-zinc-900 text-amber-400 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'}`}>
              <span>🎛️</span> <span>ECOSYSTEM OVERVIEW</span>
            </Link>
            <Link href="/dashboard?id=1" className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded text-xs font-semibold tracking-wider transition ${activeId === '1' ? 'bg-zinc-900 text-amber-400 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'}`}>
              <span>🏢</span> <span>CRM CORE</span>
            </Link>
            <Link href="/dashboard?id=2" className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded text-xs font-semibold tracking-wider transition ${activeId === '2' ? 'bg-zinc-900 text-amber-400 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'}`}>
              <span>💳</span> <span>PROPOSALS & BILLING</span>
            </Link>
            <Link href="/dashboard?id=3" className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded text-xs font-semibold tracking-wider transition ${activeId === '3' ? 'bg-zinc-900 text-amber-400 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'}`}>
              <span>📅</span> <span>COGNITIVE CALENDAR</span>
            </Link>
          </nav>
        </div>

        {/* 👤 LIVE PROFILE FOOTER */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-between gap-3 overflow-hidden">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-zinc-200 truncate capitalize">{userDisplayName}</div>
            <div className="text-[10px] text-zinc-500 font-mono tracking-tight truncate">{userEmail}</div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* 🖥️ DYNAMIC CONTENT VIEW PANE */}
      <main className="flex-1 flex flex-col bg-zinc-950/20">
        <header className="h-16 border-b border-zinc-900 px-8 flex items-center justify-between">
          <div className="text-xs font-mono text-zinc-500 tracking-wider">
            {/* Omni-search handled inside the CRM Core Client Component to prevent cluttering global header */}
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono tracking-widest text-emerald-500 font-bold">TELEMETRY CONNECTED</span>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          
          {/* VIEW 0: ECOSYSTEM OVERVIEW */}
          {activeId === '0' && (
             <div className="space-y-6 max-w-4xl">
             <h2 className="text-2xl font-bold tracking-tight font-sans text-zinc-100">ECOSYSTEM OVERVIEW</h2>
             <p className="text-sm text-zinc-400 leading-relaxed">Welcome to the V&K Prism master operations terminal. Live database telemetries and CRM views are synchronized.</p>
             <div className="grid grid-cols-3 gap-4 pt-4">
               <div className="p-5 border border-zinc-900 rounded-xl bg-zinc-950/40"><h3 className="text-xs font-bold tracking-widest text-zinc-400 mb-2">OPERATIONAL STATUS</h3><p className="text-xs text-zinc-500 leading-normal">System parameters verified. Core analytical functions running standard network telemetry.</p></div>
               <div className="p-5 border border-zinc-900 rounded-xl bg-zinc-950/40"><h3 className="text-xs font-bold tracking-widest text-zinc-400 mb-2">COMPLIANCE LOGS</h3><p className="text-xs text-zinc-500 leading-normal">Intake queues mapped. Client onboarding structures configured for deep corporate entity evaluations.</p></div>
               <div className="p-5 border border-zinc-900 rounded-xl bg-zinc-950/40"><h3 className="text-xs font-bold tracking-widest text-zinc-400 mb-2">REVENUE STREAMS</h3><p className="text-xs text-zinc-500 leading-normal">Financial ledger initialized. Core payment processors stand ready to distribute billing metrics.</p></div>
             </div>
           </div>
          )}

          {/* VIEW 1: CRM CORE (Injected Client Component) */}
          {activeId === '1' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight font-sans text-zinc-100 mb-6">CRM CORE</h2>
              <CrmCoreWorkspace initialData={crmData} />
            </div>
          )}

          {/* VIEW 2: PROPOSALS & BILLING */}
          {activeId === '2' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight font-sans text-zinc-100">PROPOSALS & BILLING</h2>
              {billingData.length === 0 ? (
                <div className="p-8 border border-dashed border-zinc-900 rounded-xl text-center text-xs text-zinc-500 font-mono">No active invoices or proposals recorded inside proposals_billing.</div>
              ) : (
                <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/40">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead><tr className="border-b border-zinc-900 bg-zinc-900/20 text-zinc-400 font-bold font-mono"><th className="p-3">INVOICE TITLE</th><th className="p-3">AMOUNT</th><th className="p-3">DUE DATE</th><th className="p-3">STATUS</th></tr></thead>
                    <tbody>
                      {billingData.map((row) => (
                        <tr key={row.id} className="border-b border-zinc-900/50 hover:bg-zinc-900/10"><td className="p-3 font-semibold text-zinc-200">{row.title}</td><td className="p-3 font-mono text-emerald-400">${Number(row.amount).toFixed(2)}</td><td className="p-3 text-zinc-400 font-mono">{row.due_date}</td><td className="p-3"><span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono">{row.status?.toUpperCase()}</span></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: COGNITIVE CALENDAR */}
          {activeId === '3' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight font-sans text-zinc-100">COGNITIVE CALENDAR</h2>
                
                <a 
                  href="/api/calendar/feed" 
                  target="_blank"
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-400 rounded-lg text-[10px] font-mono font-bold tracking-wider transition-all duration-200"
                >
                  🔗 COPY GOOGLE CALENDAR SYNC LINK
                </a>
              </div>
              
              {calendarData.length === 0 ? (
                <div className="p-8 border border-dashed border-zinc-900 rounded-xl text-center text-xs text-zinc-500 font-mono">No synchronized schedule matrices found inside calendar_events.</div>
              ) : (
                <div className="space-y-2">
                  {calendarData.map((row) => (
                    <div key={row.id} className="p-4 border border-zinc-900 bg-zinc-950/40 rounded-xl flex justify-between items-center">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-zinc-200 tracking-wide">{row.title}</h4>
                        <p className="text-[11px] text-zinc-500">{row.description || 'No additional contextual metadata recorded.'}</p>
                      </div>
                      <div className="text-right font-mono text-[10px] text-zinc-400 space-y-0.5">
                        <p className="font-bold text-zinc-300">{new Date(row.start_time).toLocaleDateString()}</p>
                        <p className="text-zinc-500">{new Date(row.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}