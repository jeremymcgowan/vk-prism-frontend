"use client"

import { useState, useMemo } from 'react'

export default function CrmCoreWorkspace({ initialData }: { initialData: any[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

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

  return (
    <div className="space-y-6">
      {/* 🎛️ ACTION HEADER */}
      <div className="flex items-center space-x-4 relative">
        
        {/* GOLD EXECUTION BUTTON */}
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold tracking-widest rounded shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
        >
          {isFormOpen ? 'CLOSE PANEL' : '+ ADD CLIENT'}
        </button>

        {/* OMNI-SEARCH BAR */}
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
          
          {/* PREDICTIVE DROPDOWN */}
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
          <h3 className="text-xs font-bold tracking-widest text-amber-500 border-b border-zinc-900 pb-2">PROVISION NEW CORPORATE RECORD</h3>
          <form className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono text-zinc-500 tracking-wider">ENTITY INFRASTRUCTURE</h4>
              <input type="text" placeholder="Display Name (e.g. Acme Corp)" className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200" />
              <input type="text" placeholder="Legal Name (e.g. Acme Corporation, LLC)" className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200" />
              <input type="text" placeholder="Corporate Website" className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200" />
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono text-zinc-500 tracking-wider">PRIMARY STAKEHOLDER</h4>
              <div className="flex space-x-3">
                <input type="text" placeholder="First Name" className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200" />
                <input type="text" placeholder="Last Name" className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200" />
              </div>
              <input type="email" placeholder="Direct Email Address" className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200" />
              <input type="tel" placeholder="Direct Phone Line" className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200" />
            </div>
            <div className="col-span-2 pt-2">
              <button type="button" className="px-6 py-2 bg-zinc-100 hover:bg-white text-black text-xs font-bold tracking-wider rounded transition-colors">
                EXECUTE DUAL-INGESTION PROTOCOL
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
                  <tr key={entity.id} className="border-b border-zinc-900/50 hover:bg-zinc-900/30 cursor-pointer transition-colors">
                    <td className="p-4 font-semibold text-zinc-200">{entity.display_name}</td>
                    <td className="p-4 text-zinc-400">{contact ? `${contact.first_name} ${contact.last_name}` : '—'}</td>
                    <td className="p-4 font-mono text-zinc-500">{contact?.email || '—'}</td>
                    <td className="p-4 font-mono text-zinc-500">{contact?.phone || '—'}</td>
                    <td className="p-4 font-mono text-zinc-500">{contact?.phone || '—'} <span className="text-[9px] text-zinc-700">(Linked)</span></td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${
                        entity.status === 'active' ? 'bg-emerald-950/50 border-emerald-900 text-emerald-400' :
                        entity.status === 'lead' ? 'bg-amber-950/50 border-amber-900 text-amber-400' :
                        'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}>
                        {entity.status?.toUpperCase() || 'UNKNOWN'}
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