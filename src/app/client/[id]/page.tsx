import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }> | { id: string }
}

export default async function ClientDossierPage({ params }: PageProps) {
  // Await the dynamic routing params safely
  const resolvedParams = await params
  const clientId = resolvedParams.id

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

  // 1. FETCH SPECIFIC ENTITY & ATTACHED STAKEHOLDERS
  const { data: entity, error } = await supabase
    .from('crm_entities')
    .select(`
      *,
      crm_contacts (*)
    `)
    .eq('id', clientId)
    .single()

  // If someone types a random ID in the URL, throw a secure Next.js 404 page
  if (error || !entity) {
    notFound()
  }

  // 2. FETCH SECURE COMMUNICATIONS LOG (Future Implementation)
  // const { data: messages } = await supabase.from('crm_internal_messages').select('*').eq('entity_id', clientId)

  // 3. FETCH ACTIVE BILLING (Future Implementation)
  // const { data: billing } = await supabase.from('proposals_billing').select('*').eq('entity_id', clientId)

  const primaryContact = entity.crm_contacts?.find((c: any) => c.is_primary_contact) || entity.crm_contacts?.[0]

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased p-8 flex flex-col space-y-8">
      
      {/* 🧭 NAVIGATION HEADER */}
      <header className="flex items-center justify-between border-b border-zinc-900 pb-6">
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard?id=1" 
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] font-bold tracking-widest rounded transition-colors"
          >
            ← RETURN TO CRM CORE
          </Link>
          <span className="text-xs font-mono text-zinc-600 tracking-wider">/ DOSSIER / {entity.id}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-mono tracking-widest text-emerald-500 font-bold">SECURE CHANNEL</span>
        </div>
      </header>

      {/* 🏛️ CORPORATE IDENTITY MODULE */}
      <div className="bg-zinc-950/40 border border-zinc-900 p-8 rounded-xl flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-bold text-zinc-100 tracking-tight">{entity.display_name}</h1>
          <p className="text-sm font-mono text-zinc-500">{entity.legal_name || 'No legal DBA on file.'}</p>
          <div className="pt-2 flex items-center space-x-3">
            <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase ${
              entity.status === 'ACTIVE' ? 'bg-emerald-950/50 border-emerald-900 text-emerald-400' :
              entity.status === 'ONBOARDING' ? 'bg-amber-950/50 border-amber-900 text-amber-400' :
              'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}>
              STATUS: {entity.status}
            </span>
            <span className="px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-[10px] font-mono font-bold uppercase text-zinc-400">
              TYPE: {entity.type}
            </span>
          </div>
        </div>

        <div className="text-right space-y-1">
          <h3 className="text-[10px] font-bold tracking-widest text-amber-500 mb-2">PRIMARY STAKEHOLDER</h3>
          {primaryContact ? (
            <>
              <p className="text-sm font-bold text-zinc-200">{primaryContact.first_name} {primaryContact.last_name}</p>
              <p className="text-xs font-mono text-zinc-400"><a href={`mailto:${primaryContact.email}`} className="hover:text-amber-400 transition-colors">{primaryContact.email}</a></p>
              <p className="text-xs font-mono text-zinc-400">{primaryContact.phone}</p>
            </>
          ) : (
            <p className="text-xs font-mono text-zinc-500">No primary stakeholder assigned.</p>
          )}
        </div>
      </div>

      {/* 📊 GRID SYSTEM FOR NOTES, PROPOSALS, AND FILES */}
      <div className="grid grid-cols-3 gap-6 flex-1">
        
        {/* COLUMN 1: COMMUNICATIONS LOG */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-xs font-bold tracking-widest text-zinc-400 border-b border-zinc-900 pb-2">SECURE COMMUNICATIONS LOG</h2>
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-6 h-96 flex flex-col items-center justify-center space-y-3">
            <span className="text-2xl opacity-50">🔒</span>
            <p className="text-xs font-mono text-zinc-500 text-center">Communications log standing by.<br/>Internal messages module not yet initialized.</p>
            <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 text-[10px] font-bold tracking-widest rounded transition-all">
              + ADD NOTE
            </button>
          </div>
        </div>

        {/* COLUMN 2: BILLING & DOCUMENTS */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 border-b border-zinc-900 pb-2">ACTIVE INVOICES</h2>
            <div className="bg-zinc-950/40 border border-dashed border-zinc-900 rounded-xl p-6 text-center">
              <p className="text-[10px] font-mono text-zinc-600">No active billing records attached to this entity.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 border-b border-zinc-900 pb-2">ECOSYSTEM FILES</h2>
            <div className="bg-zinc-950/40 border border-dashed border-zinc-900 rounded-xl p-6 text-center">
              <p className="text-[10px] font-mono text-zinc-600">No file repositories mapped.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}