'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface ContactProfile {
  id?: string
  first_name: string
  last_name: string
  email: string
  relationship_context: string
  actor_type: string
  department: string
  universal_routing_handle: string
  referral_id_token: string
  referred_by_token: string | null
}

export default function EcosystemContactsManager() {
  const [contacts, setContacts] = useState<ContactProfile[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [editingEmail, setEditingEmail] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<ContactProfile>>({})
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchContacts()
  }, [])

  async function fetchContacts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .order('email', { ascending: true })

    if (!error && data) setContacts(data)
    setLoading(false)
  }

  const startEditing = (contact: ContactProfile) => {
    setEditingEmail(contact.email)
    setEditForm({ ...contact })
  }

  const handleSave = async (email: string) => {
    const { error } = await supabase
      .from('crm_contacts')
      .update({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        relationship_context: editForm.relationship_context,
        actor_type: editForm.actor_type,
        department: editForm.department,
        universal_routing_handle: editForm.universal_routing_handle,
        referral_id_token: editForm.referral_id_token,
        referred_by_token: editForm.referred_by_token || null
      })
      .eq('email', email)

    if (error) {
      setStatus({ type: 'error', text: `Failed to update directory: ${error.message}` })
    } else {
      setStatus({ type: 'success', text: `Directory updated for ${email}` })
      setEditingEmail(null)
      fetchContacts()
    }
  }

  if (loading) return <div className="text-xs font-mono text-zinc-500 animate-pulse">QUERYING CRM DIRECTORY...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Ecosystem Directory (crm_contacts)</h3>
        {status && <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">{status.text}</span>}
      </div>

      <div className="border border-zinc-900 rounded-xl overflow-x-auto bg-zinc-950/40 w-full block">
        <table className="w-full text-left border-collapse text-xs min-w-[1000px]">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 font-bold font-mono">
              <th className="p-3">FULL NAME</th>
              <th className="p-3">EMAIL IDENTITY</th>
              <th className="p-3">RELATION / ACTOR</th>
              <th className="p-3">DEPARTMENT</th>
              <th className="p-3">ROUTING HANDLE</th>
              <th className="p-3">PASSPORT / CATALYST TOKENS</th>
              <th className="p-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => {
              const isEditing = editingEmail === c.email
              return (
                <tr key={c.email} className="border-b border-zinc-900/40 hover:bg-zinc-900/10">
                  <td className="p-3">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <input type="text" className="bg-black border border-zinc-800 text-zinc-200 p-1 w-20 rounded" value={editForm.first_name || ''} onChange={e => setEditForm({...editForm, first_name: e.target.value})} />
                        <input type="text" className="bg-black border border-zinc-800 text-zinc-200 p-1 w-20 rounded" value={editForm.last_name || ''} onChange={e => setEditForm({...editForm, last_name: e.target.value})} />
                      </div>
                    ) : (
                      <span className="font-semibold text-zinc-200">{c.first_name} {c.last_name}</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-zinc-400">{c.email}</td>
                  <td className="p-3">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <input type="text" className="bg-black border border-zinc-800 text-zinc-200 p-1 w-20 font-mono" value={editForm.relationship_context || ''} onChange={e => setEditForm({...editForm, relationship_context: e.target.value})} />
                        <input type="text" className="bg-black border border-zinc-800 text-zinc-200 p-1 w-20 font-mono" value={editForm.actor_type || ''} onChange={e => setEditForm({...editForm, actor_type: e.target.value})} />
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400">{c.relationship_context} / {c.actor_type}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <input type="text" className="bg-black border border-zinc-800 text-zinc-200 p-1 w-28 font-mono" value={editForm.department || ''} onChange={e => setEditForm({...editForm, department: e.target.value})} />
                    ) : (
                      <span className="font-mono text-zinc-400">{c.department}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <input type="text" className="bg-black border border-zinc-800 text-purple-400 p-1 w-44 font-mono" value={editForm.universal_routing_handle || ''} onChange={e => setEditForm({...editForm, universal_routing_handle: e.target.value})} />
                    ) : (
                      <span className="font-mono text-purple-400">{c.universal_routing_handle}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <input type="text" className="bg-black border border-zinc-800 text-amber-400 p-1 w-28 font-mono" value={editForm.referral_id_token || ''} onChange={e => setEditForm({...editForm, referral_id_token: e.target.value})} />
                        <input type="text" className="bg-black border border-zinc-800 text-zinc-500 p-1 w-28 font-mono" placeholder="None" value={editForm.referred_by_token || ''} onChange={e => setEditForm({...editForm, referred_by_token: e.target.value})} />
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] text-amber-500">{c.referral_id_token} <span className="text-zinc-600">← {c.referred_by_token || 'DIRECT'}</span></span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {isEditing ? (
                      <div className="space-x-1">
                        <button onClick={() => handleSave(c.email)} className="bg-amber-500 text-black px-2 py-0.5 rounded font-mono text-[10px] font-bold">SAVE</button>
                        <button onClick={() => setEditingEmail(null)} className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono text-[10px]">CANCEL</button>
                      </div>
                    ) : (
                      <button onClick={() => startEditing(c)} className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono text-[10px] hover:text-white">EDIT</button>
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