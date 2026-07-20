"use client"

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Message {
  id: string
  sender_email: string
  recipient_email: string
  subject: string
  payload: string
  status: string
  created_at: string
}

interface SuggestionItem {
  type: 'INDIVIDUAL' | 'DEPARTMENT' | 'ALL_USERS'
  label: string
  subLabel: string
  routingKey: string // Can be an email or a formatted department routing token
}

export default function PrismSecureInbox() {
  const [loading, setLoading] = useState(true)
  const [dispatching, setDispatching] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  
  // 👥 Identity States
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('CLIENT_STAFF')
  const [companyName, setCompanyName] = useState<string>('')
  const [myDepartment, setMyDepartment] = useState<string>('')

  // 📬 Inbox States
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [activeFolder, setActiveFolder] = useState<'INBOX' | 'SENT'>('INBOX')

  // 📝 Advanced Autocomplete & Form States
  const [searchQuery, setSearchQuery] = useState('')
  const [resolvedRecipient, setResolvedRecipient] = useState<SuggestionItem | null>(null)
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [subjectLine, setSubjectLine] = useState('')
  const [payloadData, setPayloadData] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 🔐 Initialize Master Session & Profile Data
  useEffect(() => {
    async function initializeSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email || null)

      const { data: profile } = await supabase
        .from('crm_contacts')
        .select('role, company_name, department')
        .eq('email', user.email)
        .single()

      if (profile) {
        setUserRole(profile.role || 'CLIENT_STAFF')
        setCompanyName(profile.company_name || '')
        setMyDepartment(profile.department || '')
      }
      setLoading(false)
    }
    initializeSession()
  }, [])

  // 📥 Load Reactive Inbox Ledger
  useEffect(() => {
    if (!userEmail) return

    async function fetchMailboxData() {
      let query = supabase.from('crm_messages').select('*')
      
      if (activeFolder === 'INBOX') {
        query = query.or(`recipient_email.eq.${userEmail},recipient_email.eq.${companyName}_ALL,recipient_email.eq.${companyName}_DEPT_${myDepartment}`)
      } else {
        query = query.eq('sender_email', userEmail)
      }

      const { data } = await query.order('created_at', { ascending: false })
      if (data) {
        setMessages(data)
        if (data.length > 0 && !selectedMessage) setSelectedMessage(data[0])
      }
    }
    fetchMailboxData()
  }, [userEmail, activeFolder, companyName, myDepartment])

  // 🔍 Multi-Layered Autocomplete Query Engine (Admin/Staff Tracker)
  useEffect(() => {
    if (userRole !== 'SYSTEM_ADMIN' || searchQuery.length < 2 || resolvedRecipient) {
      setSuggestions([])
      return
    }

    const buildIntelligentSuggestions = async () => {
      const { data: matches } = await supabase
        .from('crm_contacts')
        .select('email, name, company_name, department, title')
        .or(`company_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
        .limit(10)

      if (!matches) return

      const compiledList: SuggestionItem[] = []
      const processedCompanies = new Set<string>()

      matches.forEach(contact => {
        const comp = contact.company_name || 'Individual Node'

        // 1. Map Individual User Profile
        compiledList.push({
          type: 'INDIVIDUAL',
          label: comp,
          subLabel: `${contact.name || 'Unassigned'} — ${contact.title || 'No Title'} (${contact.email})`,
          routingKey: contact.email
        })

        // 2. Map Broadcast & Department Layers if it's a corporate client
        if (contact.company_name && !processedCompanies.has(contact.company_name)) {
          processedCompanies.add(contact.company_name)

          // Global Corporate Broadcast Route
          compiledList.push({
            type: 'ALL_USERS',
            label: contact.company_name,
            subLabel: `📢 Broadcast to All Associated Users`,
            routingKey: `${contact.company_name}_ALL`
          })

          // Detect active client departments present in current lookup rows
          if (contact.department) {
            compiledList.push({
              type: 'DEPARTMENT',
              label: contact.company_name,
              subLabel: `👥 ${contact.department.replace('_', ' ')} Team Node`,
              routingKey: `${contact.company_name}_DEPT_${contact.department}`
            })
          }
        }
      })

      setSuggestions(compiledList)
    }

    const delayDebounce = setTimeout(() => {
      buildIntelligentSuggestions()
    }, 200)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery, userRole, resolvedRecipient])

  // 🚀 Intelligent Payload Routing Dispatch
  const handleDispatchPayload = async (e: React.FormEvent) => {
    e.preventDefault()
    setDispatching(true)
    setStatusMessage('')

    try {
      if (!userEmail) throw new Error("Unauthorized security footprint.")
      let targetRoutingKey = ''

      if (userRole === 'SYSTEM_ADMIN') {
        if (!resolvedRecipient) throw new Error("Please select a verified operational routing channel.")
        targetRoutingKey = resolvedRecipient.routingKey
      } else {
        // 🔒 Client Sandbox Routing Framework
        if (searchQuery === 'V&K Executive Matrix') targetRoutingKey = 'admin@vkpartners.co'
        else if (searchQuery === 'V&K Tactical Support') targetRoutingKey = 'support@vkpartners.co'
        else if (searchQuery.startsWith('INTERNAL_DEPT_')) {
          const targetedDept = searchQuery.replace('INTERNAL_DEPT_', '')
          targetRoutingKey = `${companyName}_DEPT_${targetedDept}`
        }
      }

      const { error } = await supabase
        .from('crm_messages')
        .insert({
          sender_email: userEmail,
          recipient_email: targetRoutingKey,
          subject: subjectLine,
          payload: payloadData,
          status: 'DELIVERED',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      setStatusMessage(`🚀 Payload securely locked and routed to channel node.`)
      setSubjectLine('')
      setPayloadData('')
      setSearchQuery('')
      setResolvedRecipient(null)
    } catch (err: any) {
      setStatusMessage(`❌ Dispatch Aborted: ${err.message}`)
    } bits: { setDispatching(false) }
  }

  if (loading) return <div className="p-6 text-xs font-mono text-zinc-500">INITIALIZING SECURITY MATRIX...</div>

  return (
    <div className="w-full bg-black text-zinc-100 min-h-screen p-6 font-mono">
      {/* Top Banner Status Info */}
      <div className="border border-zinc-900 bg-zinc-950/20 p-4 rounded-xl mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xs font-bold tracking-widest text-zinc-300">SECURE OPERATIONS PORTAL</h1>
          <div className="text-[10px] text-zinc-500 mt-0.5">Clearance: <span className="text-amber-500">{userRole}</span> // {userEmail}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Column */}
        <div className="lg:col-span-3 space-y-2">
          {(['INBOX', 'SENT'] as const).map(f => (
            <button key={f} onClick={() => setActiveFolder(f)} className={`w-full p-3 text-left border text-xs font-bold rounded-lg transition ${activeFolder === f ? 'bg-zinc-900 border-amber-500 text-amber-500' : 'bg-zinc-950 border-zinc-900 text-zinc-400'}`}>
              {f === 'INBOX' ? '📥 ' : '📤 '} {f} FEED
            </button>
          ))}
        </div>

        {/* Messaging Feed Grid Item */}
        <div className="lg:col-span-4 border border-zinc-900 bg-zinc-950/40 rounded-xl min-h-[400px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="p-6 text-center text-zinc-600 text-[11px]">NO RECORDS REGISTERED.</div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} onClick={() => setSelectedMessage(msg)} className={`p-3 border-b border-zinc-900/40 cursor-pointer transition ${selectedMessage?.id === msg.id ? 'bg-zinc-900/40' : ''}`}>
                <div className="text-[9px] text-zinc-500 flex justify-between">
                  <span className="truncate max-w-[120px]">{msg.sender_email}</span>
                  <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-xs font-bold text-zinc-300 truncate mt-0.5">{msg.subject}</div>
              </div>
            ))
          )}
        </div>

        {/* Outbound Transaction Composer Panel */}
        <div className="lg:col-span-5 space-y-4">
          {selectedMessage && (
            <div className="border border-zinc-900 bg-zinc-950/60 p-4 rounded-xl text-left space-y-2">
              <div className="text-[10px] text-zinc-500 uppercase font-bold">Encrypted Payload View</div>
              <div className="text-xs font-bold text-amber-500">{selectedMessage.subject}</div>
              <p className="text-xs text-zinc-300 bg-black/40 p-3 border border-zinc-900/50 rounded-lg whitespace-pre-wrap font-sans">{selectedMessage.payload}</p>
            </div>
          )}

          <div className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-xl space-y-4 text-left">
            <h3 className="text-xs font-bold tracking-widest text-amber-500 uppercase">NEW SECURE TRANSMISSION</h3>

            <form onSubmit={handleDispatchPayload} className="space-y-4 text-xs">
              <div className="relative space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase">Recipient Destination Channel</label>
                
                {userRole === 'SYSTEM_ADMIN' ? (
                  <>
                    {resolvedRecipient ? (
                      <div className="w-full bg-zinc-900 border border-amber-500/40 p-2.5 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded mr-2">{resolvedRecipient.type}</span>
                          <span className="text-xs text-zinc-200 font-bold">{resolvedRecipient.label}</span>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{resolvedRecipient.subLabel}</div>
                        </div>
                        <button type="button" onClick={() => { setResolvedRecipient(null); setSearchQuery(''); }} className="text-zinc-500 hover:text-red-400 text-xs">✕</button>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={searchQuery}
                        placeholder="Search client companies, names, or domains..."
                        onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none"
                        required
                      />
                    )}

                    {showDropdown && suggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-zinc-950 border border-zinc-900 rounded-lg max-h-60 overflow-y-auto divide-y divide-zinc-900">
                        {suggestions.map((item, idx) => (
                          <div key={idx} onClick={() => { setResolvedRecipient(item); setShowDropdown(false); }} className="p-3 hover:bg-zinc-900/80 cursor-pointer space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-200 font-bold">{item.label}</span>
                              <span className="text-[9px] bg-zinc-900 border border-zinc-800 px-1 text-zinc-500 rounded font-bold">{item.type}</span>
                            </div>
                            <div className="text-[10px] text-zinc-400 truncate">{item.subLabel}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <select
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 appearance-none cursor-pointer"
                  >
                    <option value="V&K Executive Matrix">V&K Executive Matrix (Operations Desk)</option>
                    <option value="V&K Tactical Support">V&K Tactical Support (Infrastructure Support)</option>
                    {['EXECUTIVE', 'FINANCE', 'HUMAN_RESOURCES', 'OPERATIONS', 'LEGAL', 'TECHNICAL_SUPPORT'].map(dept => (
                      <option key={dept} value={`INTERNAL_DEPT_${dept}`}>👥 My Company — {dept.replace('_', ' ')} Team</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase">Subject Parameters</label>
                <input type="text" value={subjectLine} onChange={(e) => setSubjectLine(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none" required />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase">Payload Metrics</label>
                <textarea value={payloadData} onChange={(e) => setPayloadData(e.target.value)} rows={4} className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none resize-none font-sans" required />
              </div>

              {statusMessage && <div className="text-[10px] p-2 rounded border border-zinc-800 bg-zinc-900 text-amber-400">{statusMessage}</div>}

              <button type="submit" disabled={dispatching} className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-lg transition hover:bg-amber-600 disabled:opacity-50">
                {dispatching ? 'PROCESSING...' : '🚀 DISPATCH PAYLOAD'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}