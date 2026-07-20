"use client"

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Operator {
  id: string
  email: string
  security_group: 'VKOwners' | 'VKStaff' | 'VKFinancial'
  title: string
}

interface PendingInvite {
  id: string
  email: string
  target_group: string
  target_title: string
  invite_token: string
  expires_at: string
  is_redeemed: boolean
}

export default function PrismUserManagement() {
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')

  // 🌍 Global Resale Configurations
  const [allowedDomains, setAllowedDomains] = useState<string[]>([])

  // 📊 Portal State Ledgers
  const [operators, setOperators] = useState<Operator[]>([])
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])

  // 📝 Setup Invitation Card Form States
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteGroup, setInviteGroup] = useState<'VKStaff' | 'VKFinancial'>('VKStaff')
  const [inviteTitle, setInviteTitle] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 🔐 Initial Core Matrix Hydration Loop
  useEffect(() => {
    async function hydrateManagementCore() {
      const { data: config } = await supabase
        .from('global_system_config')
        .select('config_value')
        .eq('config_key', 'allowed_workforce_domains')
        .maybeSingle()

      if (config) {
        const domainsArray = config.config_value.split(',').map((d: string) => d.trim().toLowerCase())
        setAllowedDomains(domainsArray)
      }

      // Sorted by email to match the exact schema definitions available in system_permissions
      const { data: staffList } = await supabase
        .from('system_permissions')
        .select('*')
        .order('email', { ascending: true })

      if (staffList) setOperators(staffList)

      const { data: inviteList } = await supabase
        .from('vk_invite_vault')
        .select('*')
        .eq('is_redeemed', false)
        .order('email', { ascending: true })

      if (inviteList) setPendingInvites(inviteList)

      setLoading(false)
    }
    hydrateManagementCore()
  }, [])

  // 🚀 The Dual-Delivery Token Invitation Handler
  const handleGenerateInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setErrorMessage('')
    setSuccessMessage('')
    setGeneratedLink('')

    try {
      const emailTarget = inviteEmail.trim().toLowerCase()
      const extractedDomain = emailTarget.split('@')[1]

      if (!extractedDomain) {
        throw new Error("Invalid format matrix structure encountered in target email address string.")
      }

      const isDomainAuthorized = allowedDomains.includes(extractedDomain)
      if (!isDomainAuthorized) {
        throw new Error(`Security Violation: Extension [@${extractedDomain}] is unauthorized. Access to system operator parameters restricted to: [${allowedDomains.join(', ')}].`)
      }

      const secureToken = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')

      const { error } = await supabase
        .from('vk_invite_vault')
        .insert({
          email: emailTarget,
          target_group: inviteGroup,
          target_title: inviteTitle,
          invite_token: secureToken,
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        })

      if (error) throw error

      const localizedActivationUrl = `${window.location.origin}/activate?token=${secureToken}`
      setGeneratedLink(localizedActivationUrl)

      setSuccessMessage(`⚡ System Validation Matrix Confirmed. Background mail worker dispatched invitation notification packet securely to automated routing destination: [${emailTarget}].`)
      
      const { data: refreshedInvites } = await supabase
        .from('vk_invite_vault')
        .select('*')
        .eq('is_redeemed', false)
        .order('email', { ascending: true })
      if (refreshedInvites) setPendingInvites(refreshedInvites)

      setInviteEmail('')
      setInviteTitle('')
    } catch (err: any) {
      setErrorMessage(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleSuspendOperator = async (operatorId: string, operatorEmail: string) => {
    if (operatorEmail === 'jp@vkpartners.co') {
      alert("Operational Guardrail: The master root administrative owner account cannot be suspended or deleted.")
      return
    }
    if (!confirm(`Confirm core system suspension protocols for operator account [${operatorEmail}]?`)) return

    await supabase.from('system_permissions').delete().eq('id', operatorId)
    setOperators(operators.filter(op => op.id !== operatorId))
  }

  if (loading) return <div className="p-6 text-xs font-mono text-zinc-500 animate-pulse">HYDRATING JOOMLA MANAGEMENT FRAMEWORK CORE...</div>

  return (
    <div className="w-full bg-black text-zinc-100 min-h-screen p-4 md:p-6 font-mono selection:bg-amber-500/20 selection:text-amber-400">
      <div className="border border-zinc-900 bg-zinc-950/20 p-4 rounded-xl mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        <div>
          <div className="text-[9px] text-zinc-500 tracking-widest uppercase">Total VK Operators</div>
          <div className="text-lg font-bold text-zinc-200 mt-1">{operators.length} Active</div>
        </div>
        <div>
          <div className="text-[9px] text-zinc-500 tracking-widest uppercase">Clearance Level: Owners</div>
          <div className="text-lg font-bold text-amber-500 mt-1">{operators.filter(o => o.security_group === 'VKOwners').length} Seat</div>
        </div>
        <div>
          <div className="text-[9px] text-zinc-500 tracking-widest uppercase">Clearance Level: Staff/Fin</div>
          <div className="text-lg font-bold text-zinc-400 mt-1">{operators.filter(o => o.security_group !== 'VKOwners').length} Allocated</div>
        </div>
        <div>
          <div className="text-[9px] text-zinc-500 tracking-widest uppercase">Pending Vault Invites</div>
          <div className="text-lg font-bold text-amber-400 mt-1">{pendingInvites.length} Staged</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 border border-zinc-900 bg-zinc-950/40 rounded-xl overflow-hidden text-left">
          <div className="p-3.5 border-b border-zinc-900 bg-zinc-950 text-[10px] font-bold text-zinc-400 tracking-widest uppercase">
            👥 INTERNAL WORKFORCE OPERATOR REGISTRY GENERAL MATRIX
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider text-[10px] bg-zinc-950/60">
                  <th className="p-3">Operator Identity</th>
                  <th className="p-3">Security Assignment Group</th>
                  <th className="p-3">Operational Functional Title</th>
                  <th className="p-3 text-right">System Configuration Parameters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40">
                {operators.map((op) => (
                  <tr key={op.id} className="hover:bg-zinc-900/10 transition">
                    <td className="p-3 font-bold text-zinc-300">{op.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${op.security_group === 'VKOwners' ? 'bg-amber-500 text-black' : op.security_group === 'VKStaff' ? 'bg-blue-900/50 text-blue-400 border border-blue-800/30' : 'bg-purple-900/50 text-purple-400 border border-purple-800/30'}`}>
                        {op.security_group}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-400">{op.title}</td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => handleSuspendOperator(op.id, op.email)}
                        disabled={op.email === 'jp@vkpartners.co'}
                        className="text-[9px] uppercase border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-zinc-500 rounded hover:text-red-400 hover:border-red-900/40 disabled:opacity-30 disabled:hover:text-zinc-500 tracking-widest transition font-bold"
                      >
                        SUSPEND CORE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-xl space-y-4 text-left">
            <h3 className="text-xs font-bold tracking-widest text-amber-500 uppercase">⚡ ENROLL INTERNAL OPERATION TARGET</h3>
            
            <form onSubmit={handleGenerateInvitation} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 uppercase tracking-widest">Employee Identity Email</label>
                <input 
                  type="email" 
                  value={inviteEmail} 
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@vkpartners.co" 
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-zinc-200 focus:outline-none focus:border-zinc-800 tracking-wide font-mono"
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 uppercase tracking-widest">Security Group Mapping Profile</label>
                <select 
                  value={inviteGroup} 
                  onChange={(e) => setInviteGroup(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-zinc-300 focus:outline-none focus:border-zinc-800 font-mono"
                >
                  <option value="VKStaff">VKStaff (Technical Shield Operations)</option>
                  <option value="VKFinancial">VKFinancial (Fiscal Ledger Operations)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 uppercase tracking-widest">Corporate Operational Title Title</label>
                <input 
                  type="text" 
                  value={inviteTitle} 
                  onChange={(e) => setInviteTitle(e.target.value)}
                  placeholder="e.g., VK Shield Analyst" 
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-zinc-200 focus:outline-none focus:border-zinc-800 font-mono"
                  required 
                />
              </div>

              {errorMessage && <div className="text-[10px] p-2.5 rounded border border-red-950 bg-red-950/20 text-red-400 font-bold leading-relaxed">{errorMessage}</div>}
              {successMessage && <div className="text-[10px] p-2.5 rounded border border-zinc-800 bg-zinc-900 text-amber-400 font-bold leading-relaxed">{successMessage}</div>}

              {generatedLink && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-[9px] text-amber-500 uppercase font-bold tracking-widest flex items-center gap-1">📋 CLIPBOARD ADMINISTRATIVE ACTION LINK</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={generatedLink} 
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-full bg-black border border-amber-500/30 text-amber-400 p-2 rounded text-[11px] font-mono select-all focus:outline-none cursor-pointer"
                  />
                  <span className="text-[8px] text-zinc-500 block">Click inside the field above to select all and instantly copy to secure signal strings.</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={processing} 
                className="w-full py-2.5 bg-amber-500 text-black font-bold text-xs rounded-lg transition hover:bg-amber-600 disabled:opacity-50 tracking-widest uppercase font-mono"
              >
                {processing ? 'COMPUTING GATE SECURITY...' : '⚡ GENERATE WORKFORCE TOKEN'}
              </button>
            </form>
          </div>

          <div className="border border-zinc-900 bg-zinc-950/20 p-4 rounded-xl text-left space-y-2.5">
            <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">🔒 GLOBAL WHITE-LABEL RESALE CONSTRAINTS</div>
            <div className="text-xs font-bold text-zinc-300">Active Authorized Operator Domains Matrix</div>
            <div className="flex flex-wrap gap-1.5">
              {allowedDomains.map((domain, index) => (
                <code key={index} className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[10px] font-bold">@{domain}</code>
              ))}
            </div>
            <p className="text-[9px] text-zinc-500 leading-relaxed pt-1 border-t border-zinc-900">
              Operational Guideline: Domain constraints are packageable variables queried on initialization. Any invitation text outside these keys will trigger a UI block exception loop automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}