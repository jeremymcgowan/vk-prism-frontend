"use client"

import { useState, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

// 🧠 REAL-TIME CAPITALIZATION ENGINE (Preserves trailing spacing fields cleanly while typing)
const capitalizeWords = (str: string) => {
  return str.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
};

export default function CrmCoreWorkspace({ initialData }: { initialData: any[] }) {
  const router = useRouter()
  
  // UI State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    displayName: '', legalName: '', website: '',
    firstName: '', lastName: '', email: '', phone: '',
    status: 'ONBOARDING', type: 'CUSTOMER'
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 🔍 OMNI-SEARCH LOGIC
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return initialData

    const query = searchQuery.toLowerCase()
    return initialData.filter((entity) => {
      const primaryContact = entity.crm_contacts?.find((c: any) => c.is_primary_contact) || entity.crm_contacts?.[0]
      const matchCompany = entity.display_name?.toLowerCase().includes(query)
      const matchFirstName = primaryContact?.first_name?.toLowerCase().includes(query)
      const matchLastName = primaryContact?.last_name?.toLowerCase().includes(query)
      const matchPhone = primaryContact?.phone?.includes(query)

      return matchCompany || matchFirstName || matchLastName || matchPhone
    })
  }, [searchQuery, initialData])

  // 🚀 DUAL-INGESTION EXECUTION PROTOCOL
  const handleIngestion = async () => {
    setValidationError('') 
    
    // --- LAYER 1: STRICT FRONTEND VALIDATION ---
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidationError('MALFORMED DATA: Email must contain an @ and a valid domain.')
      return
    }
    
    // Clean phone for DB storage (strip dashes so DB just gets +17275551234)
    const dbCleanPhone = formData.phone.replace(/[\s-()]/g, '');
    if (dbCleanPhone && !/^\+[1-9]\d{6,14}$/.test(dbCleanPhone)) {
      setValidationError('MALFORMED DATA: Phone number must be a valid 10-digit number.')
      return
    }

    // Auto-normalize website
    let normalizedWebsite = formData.website.trim()
    if (normalizedWebsite && !/^https?:\/\//i.test(normalizedWebsite)) {
      normalizedWebsite = `https://${normalizedWebsite}`
    }

    try {
      setIsSubmitting(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Unauthorized: No active session.")
      const activeTenantId = user.id

      // --- LAYER 2: DATABASE INGESTION ---
      const { data: newEntity, error: entityError } = await supabase
        .from('crm_entities')
        .insert({
          tenant_id: activeTenantId,
          type: formData.type, 
          status: formData.status, 
          display_name: formData.displayName.trim(),
          legal_name: formData.legalName.trim(),
          website: normalizedWebsite
        })
        .select('id')
        .single()

      if (entityError) throw entityError

      if (formData.firstName || formData.lastName) {
        const { error: contactError } = await supabase
          .from('crm_contacts')
          .insert({
            tenant_id: activeTenantId,
            entity_id: newEntity.id,
            is_primary_contact: true,
            first_name: formData.firstName.trim() || 'Unknown',
            last_name: formData.lastName.trim() || '',
            email: formData.email.trim(),
            phone: dbCleanPhone // Sends clean E.164 string to DB
          })
          
        if (contactError) throw contactError
      }

      setFormData({ displayName: '', legalName: '', website: '', firstName: '', lastName: '', email: '', phone: '', status: 'ONBOARDING', type: 'CUSTOMER' })
      setIsFormOpen(false)
      router.refresh()

    } catch (error: any) {
      console.error("Ingestion Error:", error)
      setValidationError(`DATABASE REJECTION: ${error.message || 'Check console for details.'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 📞 SMART NANP PHONE FORMATTER (Auto-dashes: +1-XXX-XXX-XXXX)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, ''); // Extract only numbers
    
    if (digits.length === 0) {
      setFormData({ ...formData, phone: '' });
      return;
    }

    // Force US country code '1' if they don't type it
    if (digits[0] !== '1') {
      digits = '1' + digits;
    }

    // Build the beautiful dashed string
    let formatted = '+1';
    if (digits.length > 1) formatted += '-' + digits.substring(1, 4);
    if (digits.length > 4) formatted += '-' + digits.substring(4, 7);
    if (digits.length > 7) formatted += '-' + digits.substring(7, 11);

    setFormData({ ...formData, phone: formatted });
  }

  return (
    <div className="space-y-6">
      {/* 🎛️ ACTION HEADER */}
      <div className="flex items-center space-x-4 relative">
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 text-xs font-bold tracking-widest rounded transition-all"
        >
          {isFormOpen ? 'CLOSE PANEL' : '+ ADD CLIENT'}
        </button>

        <div className="relative flex-1 max-w-xl">
          <input 
            type="text" 
            placeholder="Search company, contact name, or phone number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded px-4 py-2.5 text-xs text-zinc-200 font-mono outline-none transition-colors"
          />
          
          {isFocused && searchQuery.trim() && filteredData.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
              {filteredData.slice(0, 5).map(entity => {
                const contact = entity.crm_contacts?.find((c: any) => c.is_primary_contact) || entity.crm_contacts?.[0]
                return (
                  <div key={entity.id} className="px-4 py-3 border-b border-zinc-800 hover:bg-zinc-800/50 cursor-pointer flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-200">{entity.display_name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{contact?.first_name} {contact?.last_name} • {contact?.phone}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 📥 SLIDE-OUT INGESTION FORM */}
      {isFormOpen && (
        <div className="p-6 bg-zinc-950/80 border border-amber-500/30 rounded-xl space-y-6 animate-in slide-in-from-top-4 fade-in duration-200">
          {/* UPDATED TITLE */}
          <h3 className="text-xs font-bold tracking-widest text-amber-500 border-b border-zinc-900 pb-2">FAST-TRACK ONBOARDING</h3>
          <form className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono text-zinc-500 tracking-wider">ENTITY INFRASTRUCTURE</h4>
              <input type="text" placeholder="Display Name (e.g. Acme Corp)" value={formData.displayName} onChange={e => setFormData({...formData, displayName: capitalizeWords(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 outline-none" />
              <input type="text" placeholder="Legal Name (e.g. Acme Corporation, LLC)" value={formData.legalName} onChange={e => setFormData({...formData, legalName: capitalizeWords(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 outline-none" />
              <input type="text" placeholder="Corporate Website" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 outline-none" />
              
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})} 
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 outline-none cursor-pointer"
              >
                <option value="ONBOARDING">STATUS: ONBOARDING</option>
                <option value="ACTIVE">STATUS: ACTIVE</option>
                <option value="SUSPENDED">STATUS: SUSPENDED</option>
                <option value="ARCHIVED">STATUS: ARCHIVED</option>
              </select>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono text-zinc-500 tracking-wider">PRIMARY STAKEHOLDER</h4>
              <div className="flex space-x-3">
                <input type="text" placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: capitalizeWords(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 outline-none" />
                <input type="text" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: capitalizeWords(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 outline-none" />
              </div>
              <input type="email" placeholder="Direct Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 outline-none" />
              
              {/* SMART PHONE INPUT */}
              <input type="tel" placeholder="Direct Phone Line (e.g. 727...)" value={formData.phone} onChange={handlePhoneChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 outline-none" />

              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})} 
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 outline-none cursor-pointer"
              >
                <option value="CUSTOMER">TYPE: CUSTOMER</option>
                <option value="EMPLOYEE">TYPE: EMPLOYEE</option>
                <option value="CONTRACTOR">TYPE: CONTRACTOR</option>
                <option value="VENDOR">TYPE: VENDOR</option>
              </select>
            </div>
            
            <div className="col-span-2 pt-2 flex flex-col items-end space-y-3">
              {validationError && (
                <div className="text-[10px] font-mono font-bold text-red-500 bg-red-950/30 px-3 py-1.5 border border-red-900/50 rounded w-full text-right">
                  {validationError}
                </div>
              )}
              <button 
                type="button" 
                onClick={handleIngestion}
                disabled={isSubmitting || !formData.displayName}
                className="px-6 py-2 bg-zinc-100 hover:bg-white text-black text-xs font-bold tracking-wider rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'INGESTING...' : 'EXECUTE DUAL-INGESTION PROTOCOL'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 📊 6-COLUMN MASTER DATA GRID */}
      <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/40">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-900/20 text-zinc-400 font-bold font-mono text-[10px] tracking-wider">
              <th className="p-4">COMPANY NAME</th>
              <th className="p-4">MAIN CONTACT</th>
              <th className="p-4">CONTACT EMAIL</th>
              <th className="p-4">CONTACT PHONE</th>
              <th className="p-4">COMPANY PHONE</th>
              <th className="p-4">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono">No matching records found in database.</td>
              </tr>
            ) : (
              filteredData.map((entity) => {
                const contact = entity.crm_contacts?.find((c: any) => c.is_primary_contact) || entity.crm_contacts?.[0]
                return (
                  <tr 
                    key={entity.id} 
                    onClick={() => router.push(`/dashboard/client/${entity.id}`)}
                    className="border-b border-zinc-900/50 hover:bg-zinc-900/30 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-semibold text-zinc-200">{entity.display_name}</td>
                    <td className="p-4 text-zinc-400">{contact ? `${contact.first_name} ${contact.last_name}` : '—'}</td>
                    {/* STOP PROPAGATION ON EMAIL LINK SO IT DOESN'T TRIGGER THE ROW CLICK */}
                    <td className="p-4 font-mono text-zinc-500">
                      {contact?.email ? (
                        <a 
                          href={`mailto:${contact.email}`} 
                          onClick={(e) => e.stopPropagation()} 
                          className="hover:text-amber-400 transition-colors"
                        >
                          {contact.email}
                        </a>
                      ) : '—'}
                    </td>
                    <td className="p-4 font-mono text-zinc-500">{contact?.phone || '—'}</td>
                    <td className="p-4 font-mono text-zinc-500">{entity.company_phone || contact?.phone || '—'} <span className="text-[9px] text-zinc-700">{!entity.company_phone && '(Linked)'}</span></td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase ${
                        entity.status === 'ACTIVE' ? 'bg-emerald-950/50 border-emerald-900 text-emerald-400' :
                        entity.status === 'ONBOARDING' ? 'bg-amber-950/50 border-amber-900 text-amber-400' :
                        'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}>
                        {entity.status || 'UNKNOWN'}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}