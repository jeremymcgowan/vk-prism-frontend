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
  
  // 👥 Session Footprints
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('CLIENT_STAFF')
  const [companyName, setCompanyName] = useState<string>('')
  const [myDepartment, setMyDepartment] = useState<string>('')

  // 📬 Dynamic Folder Pillars
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [activeFolder, setActiveFolder] = useState<'INBOX' | 'SENT' | 'DRAFTS' | 'ARCHIVE'>('INBOX')

  // 📝 Intelligent Search & Composition States
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

  // 🔐 Hydrate Session and Security Clearances
  useEffect(() => {
    async function initializeSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email || null)

      // Normalize email lookup to handle any casing variations smoothly
      const { data: profile } = await supabase
        .from('crm_contacts')
        .select('role, company_name, department')
        .ilike('email', user.email)
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

  // 📥 Reactive Folder Content Loader
  useEffect(() => {
    if (!userEmail) return

    async function fetchMailboxData() {
      let query = supabase.from('crm_messages').select('*')

      if (activeFolder === 'INBOX') {
        query = query.or(`recipient_email.ilike.${userEmail},recipient_email.ilike.${companyName}_ALL,recipient_email.ilike.${companyName}_DEPT_${myDepartment}`)
      } else if (activeFolder === 'SENT') {
        query = query.eq('sender_email', userEmail)
      } else {
        // Map Drafts and Archives dynamically based on status column parameters
        query = query.eq('sender_email', userEmail).eq('status', activeFolder)
      }

      const { data } = await query.order('created_at', { ascending: false })
      if (data) {
        setMessages(data)
        if (data.length > 0) setSelectedMessage(data[0])
        else setSelectedMessage(null)
      }
    }
    fetchMailboxData()
  }, [userEmail, activeFolder, companyName, myDepartment])

  // Click outside listener to clean up suggestions dropdown view
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 🔍 Multi-Tiered Directory Search Matcher
  useEffect(() => {
    if (searchQuery.length === 0 && showDropdown) {
      // Hydrate baseline options when clicking empty input field
      if (userRole === 'SYSTEM_ADMIN') {
        setSuggestions([
          { type: 'VK_CORE', label: 'V&K Executive Matrix', subLabel: 'Root Operations Channel', routingKey: 'admin@vkpartners.co' },
          { type: 'VK_CORE', label: 'V&K Tactical Support', subLabel: 'Infrastructure Core Support', routingKey: 'support@vkpartners.co' }
        ])
      } else {
        setSuggestions([
          { type: 'VK_CORE', label: 'V&K Executive Matrix', subLabel: 'Contact Managing Partners', routingKey: 'admin@vkpartners.co' },
          { type: 'VK_CORE', label: 'V&K Tactical Support', subLabel: 'Contact Technical Support Desk', routingKey: 'support@vkpartners.co' },
          { type: 'DEPARTMENT', label: `${companyName || 'Internal'} Team`, subLabel: 'Broadcast to Your EXECUTIVE Department', routingKey: `INTERNAL_DEPT_EXECUTIVE` },
          { type: 'DEPARTMENT', label: `${companyName || 'Internal'} Team`, subLabel: 'Broadcast to Your FINANCE Department', routingKey: `INTERNAL_DEPT_FINANCE` }
        ])
      }
      return
    }

    if (searchQuery.length < 2 || resolvedRecipient) return

    const executeAutocompleteHandshake = async () => {
      let queryBuilder = supabase.from('crm_contacts').select('email, name, company_name, department, title')
      
      // 🔒 SECURITY GATE: Force sandbox matching rules if current user is not a root admin
      if (userRole !== 'SYSTEM_ADMIN') {
        queryBuilder = queryBuilder.eq('company_name', companyName)
      }

      const { data: matches } = await queryBuilder
        .or(`company_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
        .limit(8)

      if (!matches) return

      const compiledSuggestions: SuggestionItem[] = []
      const uniquelyMappedCompanies = new Set<string>()

      matches.forEach(row => {
        const targetCompany = row.company_name || 'Individual Entity'

        // 1. Grouped Company Matching Layout Switch
        if (row.company_name && !uniquelyMappedCompanies.has(row.company_name)) {
          uniquelyMappedCompanies.add(row.company_name)

          // Suggest Main User / Broadcast Node
          compiledSuggestions.push({
            type: 'ALL_USERS',
            label: targetCompany,
            subLabel: `📢 All Personnel Broadcast Node`,
            routingKey: `${targetCompany}_ALL`
          })

          // Append explicit structural department routing suggestions
          const standardDepartments = ['EXECUTIVE', 'FINANCE', 'HUMAN_RESOURCES', 'OPERATIONS', 'LEGAL', 'TECHNICAL_SUPPORT']
          standardDepartments.forEach(dept => {
            compiledSuggestions.push({
              type: 'DEPARTMENT',
              label: targetCompany,
              subLabel: `👥 ${dept.replace('_', ' ')} Department Team`,
              routingKey: `${targetCompany}_DEPT_${dept}`
            })
          })
        }

        // 2. Individual Name / Identity Character Matching Layout
        compiledSuggestions.push({
          type: 'INDIVIDUAL',
          label: row.name || row.email.split('@')[0],
          subLabel: `${row.title || 'Staff Node'} — ${row.company_name || 'External'} (${row.email})`,
          routingKey: row.email
        })
      })

      // Dynamic baseline sorting filter to keep matching letters at the top row layers
      setSuggestions(compiledSuggestions.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.subLabel.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8))
    }

    const searchDebounceLoop = setTimeout(() => {
      executeAutocompleteHandshake()
    }, 200)

    return () => clearTimeout(searchDebounceLoop)
  }, [searchQuery, userRole, companyName, resolvedRecipient, showDropdown])

  // 🚀 Transactional Output Dispatch Form Handler
  const handleDispatchPayload = async (e: React.FormEvent) => {
    e.preventDefault()
    setDispatching(true)
    setStatusMessage('')

    try {
      if (!userEmail) throw new Error("Unauthorized identity validation signature.")
      let ultimateRouteKey = ''

      if (userRole === 'SYSTEM_ADMIN') {
        if (!resolvedRecipient) throw new Error("Please select a verified operational suggestion node.")
        ultimateRouteKey = resolvedRecipient.routingKey
      } else {
        // Safe Client Sandbox Parsing Architecture
        if (searchQuery === 'V&K Executive Matrix') ultimateRouteKey = 'admin@vkpartners.co'
        else if (searchQuery === 'V&K Tactical Support') ultimateRouteKey = 'support@vkpartners.co'
        else if (resolvedRecipient) ultimateRouteKey = resolvedRecipient.routingKey
        else if (searchQuery.startsWith('INTERNAL_DEPT_')) {
          const parsingDept = searchQuery.replace('INTERNAL_DEPT_', '')
          ultimateRouteKey = `${companyName}_DEPT_${parsingDept}`
        } else {
          throw new Error("Invalid destination channel within sandboxed client perimeters.")
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

      setStatusMessage(`🚀 Payload successfully synchronized to route key: [${ultimateRouteKey}]`)
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

  if (loading) return <div className="p-6 text-xs font-mono text-zinc-500 animate-pulse">HYDRATING PRISM NETWORK PERIMETERS...</div>

  return (
    <div className="w-full bg-black text-zinc-100 min-h-screen p-6 font-mono">
      
      {/* Upper Context Header Panel */}
      <div className="border border-zinc-900 bg-zinc-950/20 p-4 rounded-xl mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xs font-bold tracking-widest text-zinc-300">SECURE OPERATIONS INBOX</h1>
          <div className="text-[10px] text-zinc-500 mt-0.5">Clearance Profile: <span className="text-amber-500">{userRole}</span> // {userEmail}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Column (1. Restored Folders Array Links) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/40 divide-y divide-zinc-900/50 text-xs">
            {(['INBOX', 'SENT', 'DRAFTS', 'ARCHIVE'] as const).map((folder) => (
              <button
                key={folder}
                onClick={() => { setActiveFolder(folder); setSelectedMessage(null); }}
                className={`w-full p-3 text-left transition flex items-center gap-2 font-bold tracking-wide uppercase ${activeFolder === folder ? 'bg-zinc-900 text-amber-500 border-l-2 border-amber-500' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'}`}
              >
                <span>{folder === 'INBOX' ? '📥' : folder === 'SENT' ? '📤' : folder === 'DRAFTS' ? '📝' : '🗄️'}</span>
                {folder} Feed
              </button>
            ))}
          </div>
        </div>

        {/* Communications Ledger Index Feed Box */}
        <div className="lg:col-span-4 border border-zinc-900 bg-zinc-950/40 rounded-xl min-h-[450px] overflow-y-auto">
          <div className="p-3 border-b border-zinc-900 bg-zinc-950 text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
            {activeFolder} Transmission Ledger
          </div>
          <div className="divide-y divide-zinc-900/40">
            {messages.length === 0 ? (
              <div className="p-6 text-center text-zinc-600 text-[11px]">NO RECORDS CURRENTLY STAGED.</div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} onClick={() => setSelectedMessage(msg)} className={`p-3 text-left cursor-pointer transition ${selectedMessage?.id === msg.id ? 'bg-zinc-900/40 border-r-2 border-amber-500' : 'hover:bg-zinc-900/10'}`}>
                  <div className="text-[9px] text-zinc-500 flex justify-between">
                    <span className="truncate max-w-[140px]">{activeFolder === 'INBOX' ? msg.sender_email : msg.recipient_email}</span>
                    <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs font-bold text-zinc-300 truncate mt-0.5">{msg.subject}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Workspace Composition Framework Canvas */}
        <div className="lg:col-span-5 space-y-4">
          {selectedMessage && (
            <div className="border border-zinc-900 bg-zinc-950/60 p-4 rounded-xl text-left space-y-2">
              <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Decrypted Transmission Layer</div>
              <div className="text-xs font-bold text-amber-500">{selectedMessage.subject}</div>
              <p className="text-xs text-zinc-300 bg-black/40 p-3 border border-zinc-900/50 rounded-lg whitespace-pre-wrap font-sans leading-relaxed">{selectedMessage.payload}</p>
            </div>
          )}

          <div className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-xl space-y-4 text-left">
            <h3 className="text-xs font-bold tracking-widest text-amber-500 uppercase">NEW SECURE DISCLOSURE DISPATCH</h3>

            <form onSubmit={handleDispatchPayload} className="space-y-4 text-xs" autoComplete="off">
              
              {/* 2 & 3. Advanced Autocomplete Input Layer Box */}
              <div className="relative space-y-1" ref={dropdownRef}>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Recipient Destination Target</label>
                
                {resolvedRecipient ? (
                  <div className="w-full bg-zinc-900 border border-amber-500/30 p-2.5 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded mr-2 uppercase tracking-wide">{resolvedRecipient.type}</span>
                      <span className="text-xs text-zinc-200 font-bold">{resolvedRecipient.label}</span>
                      <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">{resolvedRecipient.subLabel}</div>
                    </div>
                    <button type="button" onClick={() => { setResolvedRecipient(null); setSearchQuery(''); }} className="text-zinc-500 hover:text-red-400 text-sm font-bold px-2">✕</button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={searchQuery}
                    placeholder="Start Typing or Select Recipient..."
                    onFocus={() => setShowDropdown(true)}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800 tracking-wide"
                    required
                  />
                )}

                {/* Intelligent Grouped Autocomplete Overlay Canvas Menu */}
                {showDropdown && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-zinc-950 border border-zinc-900 rounded-lg max-h-64 overflow-y-auto divide-y divide-zinc-900 shadow-2xl">
                    {suggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => { setResolvedRecipient(item); setShowDropdown(false); }}
                        className="p-2.5 hover:bg-zinc-900/80 cursor-pointer space-y-0.5 text-left transition"
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
                <input type="text" value={subjectLine} onChange={(e) => setSubjectLine(e.target.value)} placeholder="Enter payload subject classifications..." className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800" required />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Payload Metrics</label>
                <textarea value={payloadData} onChange={(e) => setPayloadData(e.target.value)} placeholder="Write data ledger rows here..." rows={4} className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800 resize-none font-sans leading-relaxed" required />
              </div>

              {statusMessage && <div className="text-[10px] p-2.5 rounded border border-zinc-800 bg-zinc-900 text-amber-400 font-bold">{statusMessage}</div>}

              <button type="submit" disabled={dispatching} className="px-5 py-2.5 bg-amber-500 text-black font-bold text-xs rounded-lg transition hover:bg-amber-600 disabled:opacity-50 tracking-widest uppercase">
                {dispatching ? 'ROUTING TRANSIT...' : '🚀 DISPATCH PAYLOAD'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}