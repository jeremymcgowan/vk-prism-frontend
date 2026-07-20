"use client"

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function ClientProfileSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  // 📋 Profile State Fields
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('crm_contacts')
        .select('name, company_name, phone')
        .eq('email', user.email)
        .single()

      if (data) {
        setFullName(data.name || '')
        setCompanyName(data.company_name || '')
        setPhone(data.phone || '')
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from('crm_contacts')
      .update({
        name: fullName,
        company_name: companyName,
        phone: phone
      })
      .eq('email', user?.email)

    if (error) {
      setMessage('❌ Update failed: ' + error.message)
    } else {
      setMessage('✅ Profile metrics synchronized successfully.')
    }
    setSaving(false)
  }

  if (loading) return <div className="text-xs font-mono text-zinc-500">LOADING PROFILE DATA NODE...</div>

  return (
    <div className="max-w-xl mx-auto border border-zinc-900 bg-zinc-950/40 p-6 rounded-xl space-y-6 text-left">
      <div>
        <h2 className="text-sm font-bold font-mono tracking-widest text-amber-500 uppercase">SOVEREIGN NODE SETTINGS</h2>
        <p className="text-[11px] text-zinc-500 font-mono mt-1">Manage your corporate entity parameters and passport metadata identifiers.</p>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-4 font-mono">
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 uppercase">Authorized Principal Name</label>
          <input 
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 uppercase">Institutional Entity Name</label>
          <input 
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 uppercase">Secure Contact Line</label>
          <input 
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800"
          />
        </div>

        {message && (
          <div className={`text-[11px] p-3 rounded-lg border ${message.startsWith('❌') ? 'border-red-900/30 bg-red-500/5 text-red-400' : 'border-emerald-900/30 bg-emerald-500/5 text-emerald-400'}`}>
            {message}
          </div>
        )}

        <button 
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg transition disabled:opacity-50"
        >
          {saving ? 'SYNCHRONIZING...' : '💾 SAVE SETTINGS'}
        </button>
      </form>
    </div>
  )
}