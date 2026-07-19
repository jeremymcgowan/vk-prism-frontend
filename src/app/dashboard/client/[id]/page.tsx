import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Cinzel } from 'next/font/google'

// 🎨 Inject V&K Brand Font for Headers
const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '600', '700'] })

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDossier({ params }: PageProps) {
  // 🐛 FIX 1: Await params to safely extract the client UUID in Next.js 15
  const resolvedParams = await params
  const clientId = resolvedParams.id

  // 🐛 FIX 2: Await cookies and use getAll() to perfectly match your master auth standards
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

  // 🔒 Security Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 📥 Fetch Entity + Contacts
  const { data: entity, error } = await supabase
    .from('crm_entities')
    .select(`
      *,
      crm_contacts (*)
    `)
    .eq('id', clientId)
    .single()

  // Throw Secure 404 if invalid ID or error
  if (error || !entity) {
    console.error("Database fetch rejection:", error)
    notFound()
  }

  const primaryContact = entity.crm_contacts?.find((c: any) => c.is_primary_contact) || entity.crm_contacts?.[0]

  return (
    <div className="min-h-screen bg-black text-zinc-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 🧭 TOP NAVIGATION BAR */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 text-xs font-mono text-zinc-500 tracking-wider">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard?id=1" className="hover:text-amber-400 transition-colors bg-zinc-900/50 px-3 py-1.5 rounded border border-zinc-800">
              ← RETURN TO CRM CORE
            </Link>
            <span>/ DOSSIER / {entity.id}</span>
          </div>
          <div className="flex items-center text-emerald-500 font-bold">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            SECURE CHANNEL
          </div>
        </div>

        {/* 📇 CORPORATE IDENTITY MODULE */}
        <div className="border border-zinc-900 rounded-xl bg-zinc-950/40 p-8 flex justify-between items-start">
          <div className="space-y-4">
            <div>
              {/* ✨ CINZEL BRAND HEADER */}
              <h1 className={`text-5xl font-bold text-zinc-100 tracking-tight mb-2 ${cinzel.className}`}>
                {entity.display_name}
              </h1>
              <p className="text-zinc-500 font-mono text-sm">{entity.legal_name || entity.display_name}</p>
            </div>
            <div className="flex space-x-3 text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className={`px-2 py-1 rounded border ${
                entity.status === 'ACTIVE' ? 'bg-emerald-950/50 border-emerald-900 text-emerald-400' :
                entity.status === 'ONBOARDING' ? 'bg-amber-950/50 border-amber-900 text-amber-400' :
                'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}>
                STATUS: {entity.status || 'UNKNOWN'}
              </span>
              <span className="px-2 py-1 rounded border bg-zinc-900 border-zinc-800 text-zinc-400">
                TYPE: {entity.type || 'CUSTOMER'}
              </span>
            </div>
          </div>

          <div className="text-right space-y-2">
            <h3 className="text-[10px] font-bold text-amber-500 font-mono tracking-widest uppercase">PRIMARY STAKEHOLDER</h3>
            {primaryContact ? (
              <>
                <p className="text-lg font-bold text-zinc-200">{primaryContact.first_name} {primaryContact.last_name}</p>
                <p className="text-sm font-mono text-zinc-500">
                  <a href={`mailto:${primaryContact.email}`} className="hover:text-amber-400 transition-colors">
                    {primaryContact.email}
                  </a>
                </p>
                <p className="text-sm font-mono text-zinc-500">{primaryContact.phone || 'No phone on file'}</p>
              </>
            ) : (
              <p className="text-sm font-mono text-zinc-600 italic">No stakeholder assigned.</p>
            )}
          </div>
        </div>

        {/* 🧩 DATA MODULES GRID */}
        <div className="grid grid-cols-3 gap-8">
          
          {/* LEFT COLUMN (2/3 width) - SECURE COMMS */}
          <div className="col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 font-mono tracking-widest uppercase border-b border-zinc-900 pb-2">
              SECURE COMMUNICATIONS LOG
            </h3>
            <div className="border border-zinc-900 rounded-xl bg-zinc-950/40 p-6 min-h-[300px] flex flex-col items-start justify-between">
              <div className="w-full">
                <div className="text-xs font-mono text-zinc-600 italic mb-4">
                  <span className="text-zinc-500 mr-2">🔒</span> 
                  Communications log standing by. Internal messages module not yet initialized.
                </div>
              </div>
              <button className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 text-xs font-bold tracking-widest rounded transition-all mt-4">
                + ADD NOTE
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN (1/3 width) - BILLING & FILES */}
          <div className="space-y-8">
            
            {/* INVOICES MODULE */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 font-mono tracking-widest uppercase border-b border-zinc-900 pb-2">
                ACTIVE INVOICES
              </h3>
              <div className="border border-zinc-900 border-dashed rounded-xl bg-zinc-950/20 p-8 text-center">
                <p className="text-xs font-mono text-zinc-500">No active billing records attached to this entity.</p>
              </div>
            </div>

            {/* FILES MODULE */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 font-mono tracking-widest uppercase border-b border-zinc-900 pb-2">
                ECOSYSTEM FILES
              </h3>
              <div className="border border-zinc-900 border-dashed rounded-xl bg-zinc-950/20 p-8 text-center">
                <p className="text-xs font-mono text-zinc-500">No file repositories mapped.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}