"use client"

import { useState, useEffect, useRef } from 'react'
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
  type: 'INDIVIDUAL' | 'DEPARTMENT' | 'ALL_USERS' | 'VK_CORE'
  label: string
  subLabel: string
  routingKey: string
}

export default function PrismSecureInbox() {
  const [loading, setLoading] = useState(true)
  const [dispatching, setDispatching] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  
  // 👥 Authenticated Session Footprints
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('CLIENT_STAFF')
  const [companyName, setCompanyName] = useState<string>('')
  const [myDepartment, setMyDepartment] = useState<string>('')

  // 📬 Dynamic Mailbox Ledger Pillars
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [activeFolder, setActiveFolder] = useState<'INBOX' | 'SENT' | 'DRAFTS' | 'ARCHIVE'>('INBOX')

  // 📝 Intelligent Autocomplete Search States
  const [searchQuery, setSearchQuery] = useState('')
  const [resolvedRecipient, setResolvedRecipient] = useState<SuggestionItem | null>(null)
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [subjectLine, setSubjectLine] = useState('')
  const [payloadData, setPayloadData] = useState('')
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 🔐 Initialize Sovereign Identity Permissions
  useEffect(() => {
    async function initializeSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !user.email) {
        setLoading(false)
        return
      }

      const activeEmail = user.email
      setUserEmail(activeEmail)

      // 1. Check Core Governance RBAC Table First (Hardcoded Groups Alignment)
      const { data: clearance } = await supabase
        .from('system_permissions')
        .select('security_group, title')
        .ilike('email', activeEmail)
        .maybeSingle()

      if (clearance && (clearance.security_group === 'VKOwners' || clearance.security_group === 'VKStaff' || clearance.security_group === 'VKFinancial')) {
        setUserRole('SYSTEM_ADMIN')
        setCompanyName('V&K Partners')
        setMyDepartment('EXECUTIVE')
        setLoading(false)
        return
      }

      // 2. Fallback to Multi-Tenant Client Contact Directory
      const { data: profile } = await supabase
        .from('crm_contacts')
        .select('role, company_name, department')
        .ilike('email', activeEmail)
        .maybeSingle()

      if (profile) {
        setUserRole(profile.role || 'CLIENT_STAFF')
        setCompanyName(profile.company_name || '')
        setMyDepartment(profile.department || '')
      }
      setLoading(false)
    }
    initializeSession()
  }, [])

  // 📥 Reactive Folder Content Dispatcher
  useEffect(() => {
    if (!userEmail) return

    async function fetchMailboxData() {
      let query = supabase.from('crm_messages').select('*')

      if (activeFolder === 'INBOX') {
        if (userRole === 'SYSTEM_ADMIN') {
          query = query.or(`recipient_email.ilike.${userEmail},recipient_email.eq.admin@vkpartners.co`)
        } else {
          query = query.or(`recipient_email.ilike.${userEmail},recipient_email.eq.${companyName}_ALL,recipient_email.eq.${companyName}_DEPT_${myDepartment}`)
        }
      } else if (activeFolder === 'SENT') {
        query = query.eq('sender_email', userEmail)
      } else {
        query = query.eq('sender_email', userEmail).ilike('status', activeFolder)
      }

      const { data } = await query.order('created_at', { ascending: false })
      if (data) {
        setMessages(data)
        if (data.length > 0) setSelectedMessage(data[0])
        else setSelectedMessage(null)
      }
    }
    fetchMailboxData()
  }, [userEmail, activeFolder, companyName, myDepartment, userRole])

  // Dropdown UI Dismissal Listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 🔍 Multi-Tiered Directory Search Matrix Engine
  useEffect(() => {
    if (searchQuery.length === 0 && showDropdown) {
      if (userRole === 'SYSTEM_ADMIN') {
        setSuggestions([
          { type: 'VK_CORE', label: 'V&K Executive Matrix', subLabel: 'Root Operations Channel', routingKey: 'admin@vkpartners.co' },
          { type: 'VK_CORE', label: 'V&K Tactical Support', subLabel: 'Infrastructure Core Support', routingKey: 'support@vkpartners.co' }
        ])
      } else {
        setSuggestions([
          { type: 'VK_CORE', label: 'V&K Executive Matrix', subLabel: 'Contact Managing Partners', routingKey: 'admin@vkpartners.co' },
          { type: 'VK_CORE', label: 'V&K Tactical Support', subLabel: 'Contact Technical Support Desk', routingKey: 'support@vkpartners.co' }
        ])
      }
      return
    }

    if (searchQuery.length < 2 || resolvedRecipient) return

    const executeAutocompleteHandshake = async () => {
      let queryBuilder = supabase.from('crm_contacts').select('email, company_name, department, title')
      
      if (userRole !== 'SYSTEM_ADMIN') {
        queryBuilder = queryBuilder.eq('company_name', companyName)
      }

      const { data: matches } = await queryBuilder
        .or(`company_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(12)

      if (!matches) return

      const compiledSuggestions: SuggestionItem[] = []
      const uniquelyMappedCompanies = new Set<string>()

      matches.forEach(row => {
        const targetCompany = row.company_name || 'Individual Entity'

        // 🏢 1. COMPANY LOOKUP MATCHING SEGMENTS
        if (row.company_name && row.company_name.toLowerCase().includes(searchQuery.toLowerCase())) {
          if (!uniquelyMappedCompanies.has(row.company_name)) {
            uniquelyMappedCompanies.add(row.company_name)

            compiledSuggestions.push({
              type: 'ALL_USERS',
              label: targetCompany,
              subLabel: `📢 All Personnel Broadcast Node`,
              routingKey: `${targetCompany}_ALL`
            })

            const departments = ['EXECUTIVE', 'FINANCE', 'HUMAN_RESOURCES', 'OPERATIONS', 'LEGAL', 'TECHNICAL_SUPPORT']
            departments.forEach(dept => {
              compiledSuggestions.push({
                type: 'DEPARTMENT',
                label: targetCompany,
                subLabel: `👥 — ${dept.replace('_', ' ')} Team Node`,
                routingKey: `${targetCompany}_DEPT_${dept}`
              })
            })
          }
        }

        // 👥 2. INDIVIDUAL WORKFORCE RECORD MATCHING SEGMENTS
        if (row.email.toLowerCase().includes(searchQuery.toLowerCase())) {
          const userHandle = row.email.split('@')[0].toUpperCase()
          compiledSuggestions.push({
            type: 'INDIVIDUAL',
            label: userHandle,
            subLabel: `👤 ${row.title || 'Staff Member'} // ${targetCompany} (${row.email})`,
            routingKey: row.email
          })
        }
      })

      setSuggestions(compiledSuggestions.slice(0, 8))
    }

    const searchDebounceLoop = setTimeout(() => {
      executeAutocompleteHandshake()
    }, 200)

    return () => clearTimeout(searchDebounceLoop)
  }, [searchQuery, userRole, companyName, resolvedRecipient, showDropdown])

  const handleDispatchPayload = async (e: React.FormEvent) => {
    e.preventDefault()
    setDispatching(true)
    setStatusMessage('')

    try {
      if (!userEmail) throw new Error("Unauthorized validation footprint.")
      let ultimateRouteKey = ''

      if (userRole === 'SYSTEM_ADMIN') {
        if (!resolvedRecipient) throw new Error("Please select a verified operational routing destination.")
        ultimateRouteKey = resolvedRecipient.routingKey
      } else {
        if (resolvedRecipient) {
          ultimateRouteKey = resolvedRecipient.routingKey
        } else if (searchQuery === 'V&K Executive Matrix') {
          ultimateRouteKey = 'admin@vkpartners.co'
        } else if (searchQuery === 'V&K Tactical Support') {
          ultimateRouteKey = 'support@vkpartners.co'
        } else {
          throw new Error("Target destination outside authorized sandbox parameters.")
        }
      }

      const { error } = await supabase
        .from('crm_messages')
        .insert({
          sender_email: userEmail,
          recipient_email: ultimateRouteKey,
          subject: subjectLine,
          payload: payloadData,
          status: 'DELIVERED',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      setStatusMessage(`🚀 Payload successfully synchronized to channel key: [${ultimateRouteKey}]`)
      setSubjectLine('')
      setPayloadData('')
      setSearchQuery('')
      setResolvedRecipient(null)
    } catch (err: any) {
      setStatusMessage(`❌ Transmission Aborted: ${err.message}`)
    } finally {
      setDispatching(false)
    }
  }

  if (loading) return <div className="p-6 text-xs font-mono text-zinc-500 animate-pulse">SYNCHRONIZING PRISM SECURE COMMUNICATIONS CORE...</div>

  return (
    <div className="w-full bg-black text-zinc-100 min-h-screen p-4 md:p-6 font-mono selection:bg-amber-500/20 selection:text-amber-400">
      
      {/* Upper Terminal Metadata Ribbon */}
      <div className="border border-zinc-900 bg-zinc-950/20 p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xs font-bold tracking-widest text-zinc-300 uppercase">SECURE COMMUNICATIONS INTERFACE</h1>
          <div className="text-[10px] text-zinc-500 mt-0.5 uppercase">
            Clearance Authority: <span className="text-amber-500">{userRole}</span> // {userEmail}
          </div>
        </div>
        <div className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1 rounded font-bold uppercase tracking-widest">
          Node Status: Operational
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Sidebar Pillars (Always Visible 4-Folder Tree) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/40 divide-y divide-zinc-900/50 text-xs">
            {(['INBOX', 'SENT', 'DRAFTS', 'ARCHIVE'] as const).map((folder) => (
              <button
                key={folder}
                onClick={() => { setActiveFolder(folder); setSelectedMessage(null); }}
                className={`w-full p-3.5 text-left transition flex items-center gap-2.5 font-bold tracking-wide uppercase ${activeFolder === folder ? 'bg-zinc-900 text-amber-500 border-l-2 border-amber-500' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'}`}
              >
                <span>{folder === 'INBOX' ? '📥' : folder === 'SENT' ? '📤' : folder === 'DRAFTS' ? '📝' : '🗄️'}</span>
                {folder} Matrix
              </button>
            ))}
          </div>
        </div>

        {/* Transmission Registry Ledger Feed */}
        <div className="lg:col-span-4 border border-zinc-900 bg-zinc-950/40 rounded-xl min-h-[480px] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-zinc-900 bg-zinc-950 text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
            {activeFolder} Transaction Index Ledger
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/40 max-h-[600px]">
            {messages.length === 0 ? (
              <div className="p-6 text-center text-zinc-600 text-[11px] uppercase tracking-wide">No localized logs registered in context file.</div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} onClick={() => setSelectedMessage(msg)} className={`p-3.5 text-left cursor-pointer transition ${selectedMessage?.id === msg.id ? 'bg-zinc-900/40 border-r-2 border-amber-500' : 'hover:bg-zinc-900/10'}`}>
                  <div className="text-[9px] text-zinc-500 flex justify-between gap-2">
                    <span className="truncate max-w-[140px] font-bold">{activeFolder === 'INBOX' ? msg.sender_email : msg.recipient_email}</span>
                    <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs font-bold text-zinc-300 truncate mt-1">{msg.subject || '(No Classification Subject)'}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Workspace Operations Composition Framework */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Log Inspector Panel */}
          {selectedMessage && (
            <div className="border border-zinc-900 bg-zinc-950/60 p-4 rounded-xl text-left space-y-3">
              <div className="border-b border-zinc-900 pb-2">
                <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Secure Payload Inspector Decryption</div>
                <div className="text-xs font-bold text-amber-500 mt-1">{selectedMessage.subject}</div>
              </div>
              <p className="text-xs text-zinc-300 bg-black/40 p-3 border border-zinc-900/50 rounded-lg whitespace-pre-wrap font-sans leading-relaxed">
                {selectedMessage.payload}
              </p>
            </div>
          )}

          {/* Composition Controls */}
          <div className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-xl space-y-4 text-left">
            <h3 className="text-xs font-bold tracking-widest text-amber-500 uppercase">INITIALIZE SECURE INBOUND TRANSIT</h3>

            <form onSubmit={handleDispatchPayload} className="space-y-4 text-xs" autoComplete="off">
              
              {/* Dynamic Recipient Entry Field Matrix */}
              <div className="relative space-y-1" ref={dropdownRef}>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Recipient Destination Target</label>
                
                {resolvedRecipient ? (
                  <div className="w-full bg-zinc-900 border border-amber-500/30 p-2.5 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded mr-2 uppercase tracking-wide font-mono">{resolvedRecipient.type}</span>
                      <span className="text-xs text-zinc-200 font-bold">{resolvedRecipient.label}</span>
                      <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">{resolvedRecipient.subLabel}</div>
                    </div>
                    <button type="button" onClick={() => { setResolvedRecipient(null); setSearchQuery(''); }} className="text-zinc-500 hover:text-red-400 font-bold px-2 text-sm">✕</button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={searchQuery}
                    placeholder="Start Typing or Select Recipient..."
                    onFocus={() => setShowDropdown(true)}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800 tracking-wide font-mono"
                    required
                  />
                )}

                {/* Unified Structured Suggestion Overlay Menu */}
                {showDropdown && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-zinc-950 border border-zinc-900 rounded-lg max-h-64 overflow-y-auto divide-y divide-zinc-900 shadow-2xl">
                    {suggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => { setResolvedRecipient(item); setShowDropdown(false); }}
                        className="p-3 hover:bg-zinc-900/80 cursor-pointer space-y-0.5 text-left transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-200 font-bold tracking-wide">{item.label}</span>
                          <span className="text-[8px] border border-zinc-800 bg-zinc-900 px-1.5 text-zinc-500 rounded uppercase font-mono font-bold tracking-widest">{item.type}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono truncate">{item.subLabel}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Subject Parameters</label>
                <input type="text" value={subjectLine} onChange={(e) => setSubjectLine(e.target.value)} placeholder="Specify metadata subject classification classifications..." className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800 font-mono" required />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Payload Ledger Metrics</label>
                <textarea value={payloadData} onChange={(e) => setPayloadData(e.target.value)} placeholder="Type communication details or tactical payload strings here..." rows={4} className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800 resize-none font-sans leading-relaxed" required />
              </div>

              {statusMessage && <div className="text-[10px] p-2.5 rounded border border-zinc-800 bg-zinc-900 text-amber-400 font-bold font-mono">{statusMessage}</div>}

              <button type="submit" disabled={dispatching} className="px-5 py-2.5 bg-amber-500 text-black font-bold text-xs rounded-lg transition hover:bg-amber-600 disabled:opacity-50 tracking-widest uppercase font-mono">
                {dispatching ? 'SYNCHRONIZING CORE...' : '🚀 DISPATCH PAYLOAD'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}