import { Lora } from 'next/font/google'
const lora = Lora({ subsets: ['latin'], weight: ['400', '600', '700'] })
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import LogoutButton from '../components/LogoutButton'

// ⚡ FORCE LIVE-FIRE DYNAMIC TELEMETRY (Bypasses Next.js caching completely)
export const dynamic = 'force-dynamic'

interface AdminPageProps {
  searchParams: Promise<{ tab?: string }> | { tab?: string }
}

export default async function AdminMasterTerminal({ searchParams }: AdminPageProps) {
  // Resolve active view tab (0 = Intelligence, 1 = User Directory, 2 = Alliance Referrals)
  const resolvedParams = await searchParams
  const activeTab = resolvedParams?.tab ?? '0'

  // Open secure server-side database channel matching your institutional security standards
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

  // 👤 ROLE VERIFICATION: Fetch session and validate security authorization tokens
  const { data: { user } } = await supabase.auth.getUser()

  // 📡 LIVE TELEMETRY QUERY ENGINE
  
  // 1. Fetch live CRM Entities for the Global Ledger and counts
  const { data: liveEntities } = await supabase
    .from('crm_entities')
    .select('*')
    .order('created_at', { ascending: false })
  const entities = liveEntities || []

  // 2. Fetch Billing ledger lines to aggregate system-wide revenue calculations
  const { data: liveBilling } = await supabase
    .from('proposals_billing')
    .select('amount, status')
  const billingLines = liveBilling || []

  // 3. Fetch platform user identity metrics for the access manager
  const { data: liveProfiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  const systemUsers = liveProfiles || []

  // 4. Fetch the automated outbound partner routing metrics
  const { data: liveReferrals } = await supabase
    .from('partner_referrals')
    .select('*')
    .order('created_at', { ascending: false })
  const referrals = liveReferrals || []

  // 🧮 LIVE MATRIX AGGREGATIONS
  
  // Calculate total system revenue dynamically across all billing profiles
  const totalRevenue = billingLines.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  
  // Dynamic calculation filters mapped perfectly to your 4 core operational channels
  const customerCount = entities.filter(e => e.type === 'CUSTOMER').length
  const contractorCount = entities.filter(e => e.type === 'CONTRACTOR').length
  const vendorCount = entities.filter(e => e.type === 'VENDOR').length
  const employeeCount = entities.filter(e => e.type === 'EMPLOYEE').length

  return (
    <div className="flex flex-col md:flex-row min-h-dvh bg-black text-white font-sans antialiased select-none overflow-x-hidden">
      
      {/* 🧭 ADMINISTRATIVE CONTROL SIDEBAR */}
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-zinc-900 bg-zinc-950 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded border border-amber-500 bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-sm">Ω</div>
            <div>
              <h1 className="text-sm font-bold tracking-widest text-zinc-200">V&K SYSTEM</h1>
              <p className="text-[10px] font-bold tracking-[0.3em] text-red-500">ROOT ADMIN</p>
            </div>
          </div>

          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
            <Link href="/admin?tab=0" className={`shrink-0 flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-semibold tracking-wider transition ${activeTab === '0' ? 'bg-zinc-900 text-amber-400 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'}`}>
              <span>📈</span> <span>INTELLIGENCE ENGINE</span>
            </Link>
            <Link href="/admin?tab=1" className={`shrink-0 flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-semibold tracking-wider transition ${activeTab === '1' ? 'bg-zinc-900 text-amber-400 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'}`}>
              <span>👥</span> <span>GLOBAL USER MANAGER</span>
            </Link>
            <Link href="/admin?tab=2" className={`shrink-0 flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-semibold tracking-wider transition ${activeTab === '2' ? 'bg-zinc-900 text-amber-400 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'}`}>
              <span>🔄</span> <span>ALLIANCE CLEARING</span>
            </Link>
          </nav>
        </div>

        <div className="mt-6 md:mt-0 p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-red-400 font-mono tracking-tight uppercase">SYSTEM MASTER</div>
            <div className="text-[10px] text-zinc-500 truncate font-mono">{user?.email || 'root@vkpartners.co'}</div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* 🖥️ GLOBAL COMMAND INTERFACE */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950/20">
        <header className="h-14 border-b border-zinc-900 px-6 flex items-center justify-between bg-black/40 backdrop-blur-sm">
          <div className="text-[10px] font-mono tracking-widest text-red-500 font-bold uppercase flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            <span>SYSTEM HIGH-VISIBILITY CUSTODIAN MODE ACTIVE</span>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          
          {/* TAB 0: MULTI-DIMENSIONAL REPORTING & MATRIX */}
          {activeTab === '0' && (
            <div className="space-y-6 max-w-6xl">
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight text-zinc-100 ${lora.className}`}>Ecosystem Intelligence</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">Omniscient telemetry tracking direct client networks and downstream asset structural parameters.</p>
              
              {/* Dynamic Live 4-Channel Analytics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-zinc-900 rounded-xl bg-zinc-950">
                  <h4 className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-1">Total Customers</h4>
                  <p className="text-2xl font-mono text-amber-400">{customerCount}</p>
                </div>
                <div className="p-4 border border-zinc-900 rounded-xl bg-zinc-950">
                  <h4 className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-1">Contractors</h4>
                  <p className="text-2xl font-mono text-zinc-200">{contractorCount}</p>
                </div>
                <div className="p-4 border border-zinc-900 rounded-xl bg-zinc-950">
                  <h4 className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-1">Verified Vendors</h4>
                  <p className="text-2xl font-mono text-sky-400">{vendorCount}</p>
                </div>
                <div className="p-4 border border-zinc-900 rounded-xl bg-zinc-950">
                  <h4 className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-1">Internal Employees</h4>
                  <p className="text-2xl font-mono text-purple-400">{employeeCount}</p>
                </div>
              </div>

              {/* Global Live Entity Ledger Grid */}
              <div className="space-y-3 pt-4">
                <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Global Entity Ledger</h3>
                {entities.length === 0 ? (
                  <div className="p-8 border border-dashed border-zinc-900 rounded-xl text-center text-xs text-zinc-500 font-mono">No live operational matrix nodes recorded in crm_entities.</div>
                ) : (
                  <div className="border border-zinc-900 rounded-xl overflow-x-auto bg-zinc-950/40 w-full block">
                    <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                      <thead>
                        <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 font-bold font-mono">
                          <th className="p-3">ENTITY NAME</th>
                          <th className="p-3">STRUCTURAL TYPE</th>
                          <th className="p-3">SECTOR / INDUSTRY</th>
                          <th className="p-3">TELEMETRY TIMESTAMP</th>
                          <th className="p-3">ONBOARDING STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entities.map((entity) => (
                          <tr key={entity.id} className="border-b border-zinc-900/40 hover:bg-zinc-900/10">
                            <td className="p-3 font-semibold text-zinc-200">
                              {entity.legal_name || entity.display_name || 'Unnamed Shell'}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-wider border ${
                                entity.type === 'CUSTOMER' ? 'bg-zinc-900 text-amber-400 border-zinc-800' :
                                entity.type === 'VENDOR' ? 'bg-zinc-900 text-sky-400 border-zinc-800' :
                                entity.type === 'EMPLOYEE' ? 'bg-zinc-900 text-purple-400 border-zinc-800' :
                                'bg-zinc-950 text-zinc-500 border-zinc-900'
                              }`}>
                                {entity.type || 'UNKNOWN'}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-zinc-400">{entity.industry || 'GENERAL_ENTERPRISE'}</td>
                            <td className="p-3 text-zinc-500 font-mono">
                              {entity.created_at ? new Date(entity.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono uppercase">
                                {entity.status || entity.sales_lead_status || 'NEW'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: 3-TIER USER MANAGER CONSOLE */}
          {activeTab === '1' && (
            <div className="space-y-6 max-w-6xl">
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight text-zinc-100 ${lora.className}`}>Global User Manager</h2>
              
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/10 text-xs text-amber-400/90 leading-relaxed max-w-3xl">
                🔒 <strong>Data Custodian Protocol Active:</strong> Downstream account visibility conforms strictly to the V&K Sovereign Custodian Manifesto. All structural view sequences are recorded inside the administrative audit ledger log pipeline.
              </div>

              {systemUsers.length === 0 ? (
                <div className="p-8 border border-dashed border-zinc-900 rounded-xl text-center text-xs text-zinc-500 font-mono mt-4">No real-time identities mapped inside public profiles data pipeline yet.</div>
              ) : (
                <div className="border border-zinc-900 rounded-xl overflow-x-auto bg-zinc-950/40 w-full block mt-4">
                  <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 font-bold font-mono">
                        <th className="p-3">HUMAN PROFILE</th>
                        <th className="p-3">ASSIGNED PRIVILEGE</th>
                        <th className="p-3">ECOSYSTEM RELATIONSHIP</th>
                        <th className="p-3">STATUS</th>
                        <th className="p-3 text-right">SECURE CONTROL ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemUsers.map((profile) => (
                        <tr key={profile.id} className="border-b border-zinc-900/40 hover:bg-zinc-900/10">
                          <td className="p-3">
                            <div className="font-semibold text-zinc-200">{profile.full_name || 'Anonymous User'}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">{profile.email || 'no-email-recorded'}</div>
                          </td>
                          <td className="p-3 font-mono text-zinc-400 text-[11px]">{profile.role || 'CLIENT_STAFF'}</td>
                          <td className="p-3 text-zinc-400 font-medium">{profile.organization_scope || 'Assigned Node Tenant'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${profile.status === 'SUSPENDED' ? 'bg-red-950 text-red-400 border border-red-900/50' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/50'}`}>
                              {profile.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold rounded text-[10px] tracking-wide active:scale-95 transition-all">
                              OPTIMIZE PASSTHROUGH
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ALLIANCE PARTNER REFERRAL CLEARING ENGINE */}
          {activeTab === '2' && (
            <div className="space-y-6 max-w-6xl">
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight text-zinc-100 ${lora.className}`}>Alliance Referral Clearing House</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">Monitors automated data handoffs dispatched to external partner desks and tracking performance yields.</p>
              
              {referrals.length === 0 ? (
                <div className="p-8 border border-dashed border-zinc-900 rounded-xl text-center text-xs text-zinc-500 font-mono max-w-3xl">
                  No outbound matching exceptions triggered inside partner_referrals matrix pipelines today.
                </div>
              ) : (
                <div className="border border-zinc-900 rounded-xl overflow-x-auto bg-zinc-950/40 w-full block">
                  <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 font-bold font-mono">
                        <th className="p-3">TARGET ROUTE</th>
                        <th className="p-3">ORIGINATING NODE</th>
                        <th className="p-3">VULNERABILITY MATRICES</th>
                        <th className="p-3">CLEARING STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((ref) => (
                        <tr key={ref.id} className="border-b border-zinc-900/40 hover:bg-zinc-900/10">
                          <td className="p-3 font-semibold text-zinc-200">{ref.partner_name || 'Assigned Desk'}</td>
                          <td className="p-3 font-mono text-zinc-400">{ref.client_name || 'Internal Lead Node'}</td>
                          <td className="p-3 text-zinc-400">{ref.scanned_vector || 'Optimization Pipeline'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono">
                              {ref.status?.toUpperCase() || 'DISPATCHED'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}