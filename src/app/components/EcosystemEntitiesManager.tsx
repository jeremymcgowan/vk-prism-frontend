'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface EntityProfile {
  id: string
  display_name: string
  legal_name: string
  industry: string
  status: string
  vk_audit_status: string
  hr_payroll_platform: string | null
  it_antivirus_vendor: string | null
  funding_target_amount: number | null
}

export default function EcosystemEntitiesManager() {
  const [entities, setEntities] = useState<EntityProfile[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<EntityProfile>>({})
  const [status, setStatus] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchEntities()
  }, [])

  async function fetchEntities() {
    setLoading(true)
    const { data, error } = await supabase
      .from('crm_entities')
      .select('id, display_name, legal_name, industry, status, vk_audit_status, hr_payroll_platform, it_antivirus_vendor, funding_target_amount')
      .order('display_name', { ascending: true })

    if (!error && data) setEntities(data)
    setLoading(false)
  }

  const startEditing = (ent: EntityProfile) => {
    setEditingId(ent.id)
    setEditForm({ ...ent })
  }

  const handleSave = async (id: string) => {
    const { error } = await supabase
      .from('crm_entities')
      .update({
        display_name: editForm.display_name,
        legal_name: editForm.legal_name,
        industry: editForm.industry,
        status: editForm.status,
        vk_audit_status: editForm.vk_audit_status,
        hr_payroll_platform: editForm.hr_payroll_platform,
        it_antivirus_vendor: editForm.it_antivirus_vendor,
        funding_target_amount: editForm.funding_target_amount ? Number(editForm.funding_target_amount) : null
      })
      .eq('id', id)

    if (error) {
      setStatus(`Error: ${error.message}`)
    } else {
      setStatus('Ecosystem node configuration updated.')
      setEditingId(null)
      fetchEntities()
    }
  }

  if (loading) return <div className="text-xs font-mono text-zinc-500 animate-pulse">QUERYING MASTER ENTITIES NODE...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Ecosystem Telemetry Layout (crm_entities)</h3>
        {status && <span className="text-[10px] font-mono text-amber-400 uppercase">{status}</span>}
      </div>

      <div className="border border-zinc-900 rounded-xl overflow-x-auto bg-zinc-950/40 w-full block">
        <table className="w-full text-left border-collapse text-xs min-w-[900px]">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 font-bold font-mono">
              <th className="p-3">DISPLAY LABEL</th>
              <th className="p-3">LEGAL REGISTERED NAME</th>
              <th className="p-3">SECTOR</th>
              <th className="p-3">NODE STATUS</th>
              <th className="p-3">AUDIT VETTING</th>
              <th className="p-3">PAYROLL / AV PLATFORMS</th>
              <th className="p-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((e) => {
              const isEditing = editingId === e.id
              return (
                <tr key={e.id} className="border-b border-zinc-900/40 hover:bg-zinc-900/10">
                  <td className="p-3">
                    {isEditing ? (
                      <input type="text" className="bg-black border border-zinc-800 text-zinc-200 p-1 w-28" value={editForm.display_name || ''} onChange={el => setEditForm({...editForm, display_name: el.target.value})} />
                    ) : (
                      <span className="font-semibold text-zinc-200">{e.display_name}</span>
                    )}
                  </td>
                  <td className="p-3 text-zinc-400">
                    {isEditing ? (
                      <input type="text" className="bg-black border border-zinc-800 text-zinc-200 p-1 w-40" value={editForm.legal_name || ''} onChange={el => setEditForm({...editForm, legal_name: el.target.value})} />
                    ) : (
                      e.legal_name
                    )}
                  </td>
                  <td className="p-3 font-mono text-zinc-400">
                    {isEditing ? (
                      <input type="text" className="bg-black border border-zinc-800 text-zinc-200 p-1 w-24 font-mono" value={editForm.industry || ''} onChange={el => setEditForm({...editForm, industry: el.target.value})} />
                    ) : (
                      e.industry
                    )}
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <input type="text" className="bg-black border border-zinc-800 text-zinc-200 p-1 w-20 font-mono" value={editForm.status || ''} onChange={el => setEditForm({...editForm, status: el.target.value})} />
                    ) : (
                      <span className="text-[10px] font-mono bg-zinc-900 px-2 py-0.5 rounded text-zinc-300">{e.status}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <input type="text" className="bg-black border border-zinc-800 text-amber-400 p-1 w-24 font-mono" value={editForm.vk_audit_status || ''} onChange={el => setEditForm({...editForm, vk_audit_status: el.target.value})} />
                    ) : (
                      <span className="font-mono text-amber-500">{e.vk_audit_status}</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-zinc-500">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <input type="text" placeholder="HR" className="bg-black border border-zinc-800 text-zinc-300 p-1 w-16" value={editForm.hr_payroll_platform || ''} onChange={el => setEditForm({...editForm, hr_payroll_platform: el.target.value})} />
                        <input type="text" placeholder="AV" className="bg-black border border-zinc-800 text-zinc-300 p-1 w-16" value={editForm.it_antivirus_vendor || ''} onChange={el => setEditForm({...editForm, it_antivirus_vendor: el.target.value})} />
                      </div>
                    ) : (
                      <span>[HR: {e.hr_payroll_platform || 'N/A'}] [AV: {e.it_antivirus_vendor || 'N/A'}]</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {isEditing ? (
                      <div className="space-x-1">
                        <button onClick={() => handleSave(e.id)} className="bg-amber-500 text-black px-2 py-0.5 rounded font-mono text-[10px] font-bold">SAVE</button>
                        <button onClick={() => setEditingId(null)} className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono text-[10px]">CANCEL</button>
                      </div>
                    ) : (
                      <button onClick={() => startEditing(e)} className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono text-[10px] hover:text-white">EDIT</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}