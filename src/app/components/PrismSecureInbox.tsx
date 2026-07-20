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

export default function PrismSecureInbox() {
  const [loading, setLoading] = useState(true)
  const [dispatching, setDispatching] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  
  // 👥 Identity & Access States
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('CLIENT_STAFF')
  const [companyName, setCompanyName] = useState<string>('')

  // 📬 Messaging States
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [activeFolder, setActiveFolder] = useState<'INBOX' | 'SENT' | 'DRAFTS' | 'ARCHIVE'>('INBOX')

  // 📝 Compose Form States
  const [recipientChannel, setRecipientChannel] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [subjectLine, setSubjectLine] = useState('')
  const [payloadData, setPayloadData] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 🔐 Initialize Session & Roles
  useEffect(() => {
    async function initializeSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email || null)

      // Hydrate user profile security credentials
      const { data: profile } = await supabase
        .from('crm_contacts')
        .select('role, company_name')
        .eq('email', user.email)
        .single()

      if (profile) {
        setUserRole(profile.role || 'CLIENT_STAFF')
        setCompanyName(profile.company_name || '')
        // Pre-set default selection for client selector dropdown
        if (profile.role !== 'SYSTEM_ADMIN') {
          setRecipientChannel('V&K Executive Matrix')
        }
      }
      setLoading(false)
    }
    initializeSession()
  }, [])

  // 📥 Fetch Dynamic Mailbox Folders
  useEffect(() => {
    if (!userEmail) return

    async function fetchMailboxData() {
      let query = supabase.from('crm_messages').select('*')

      if (activeFolder === 'INBOX') {
        query = query.eq('recipient_email', userEmail)
      } else if (activeFolder === 'SENT') {
        query = query.eq('sender_email', userEmail)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      if (data) {
        setMessages(data)
        if (data.length > 0 && !selectedMessage) {
          setSelectedMessage(data[0])
        }
      }
    }
    fetchMailboxData()
  }, [userEmail, activeFolder])

  // 🔍 Live Directory Autocomplete Keystroke Listener (Admin Only)
  useEffect(() => {
    if (userRole !== 'SYSTEM_ADMIN' || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    const fetchDirectorySuggestions = async () => {
      const { data } = await supabase
        .from('crm_contacts')
        .select('email, name, company_name')
        .or(`email.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
        .limit(5)

      if (data) setSuggestions(data)
    }

    const delayDebounce = setTimeout(() => {
      fetchDirectorySuggestions()
    }, 250)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery, userRole])

  // 🚀 Secure Payload Transmission Handshake
  const handleDispatchPayload = async (e: React.FormEvent) => {
    e.preventDefault()
    setDispatching(true)
    setStatusMessage('')

    try {
      if (!userEmail) throw new Error("Unauthorized identity footprint.")
      let targetEmail = ''

      // 🛡️ ROLE-BASED ACCESS ROUTING ENGINE
      if (userRole === 'SYSTEM_ADMIN') {
        if (!recipientChannel) throw new Error("Please select a verified node from directory.")
        targetEmail = recipientChannel
      } else {
        // 🔒 Sandboxed Client Logic Matrix
        if (recipientChannel === 'V&K Tactical Support') {
          targetEmail = 'support@vkpartners.co'
        } else if (recipientChannel === 'V&K Executive Matrix') {
          targetEmail = 'admin@vkpartners.co'
        } else if (recipientChannel === 'My Internal Team') {
          const { data: teamRecord } = await supabase
            .from('crm_contacts')
            .select('email')
            .eq('company_name', companyName)
            .neq('email', userEmail)
            .limit(1)
            .single()

          if (!teamRecord) throw new Error("Dynamic Routing Failure: No alternative corporate team nodes registered.")
          targetEmail = teamRecord.email
        }
      }

      // Execute Ledger Transaction Insertion
      const { error: dispatchError } = await supabase
        .from('crm_messages')
        .insert({
          sender_email: userEmail,
          recipient_email: targetEmail,
          subject: subjectLine,
          payload: payloadData,
          status: 'DELIVERED',
          created_at: new Date().toISOString()
        })

      if (dispatchError) throw dispatchError

      setStatusMessage(`🚀 Payload successfully routed to node: [${targetEmail}]`)
      setSubjectLine('')
      setPayloadData('')
      setSearchQuery('')
    } catch (err: any) {
      setStatusMessage(`❌ Dispatch Aborted: ${err.message}`)
    } finally {
      setDispatching(false)
    }
  }

  if (loading) return <div className="p-6 text-xs font-mono text-zinc-500 animate-pulse">SYNCHRONIZING PRISM SECURE COMMUNICATIONS CORE...</div>

  return (
    <div className="w-full bg-black text-zinc-100 min-h-screen p-4 md:p-6 font-mono selection:bg-amber-500/20 selection:text-amber-400">
      
      {/* Upper Terminal Banner */}
      <div className="w-full border border-zinc-900 bg-zinc-950/20 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-sm font-bold tracking-widest text-zinc-300">SECURE OPERATIONS INBOX</h1>
          <div className="text-[10px] text-zinc-500 uppercase">Clearance Status: <span className="text-amber-500">{userRole}</span> // {userEmail}</div>
        </div>
        <div className="border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 rounded text-[10px] tracking-widest text-amber-500 font-bold uppercase">
          NODE ID: [ VERIFIED ]
        </div>
      </div>

      {/* Main Split Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Sidebar Pillars (3/12 cols) */}
        <div className="lg:col-span-3 space-y-2">
          <button className="w-full text-left p-3 border border-amber-600/30 bg-amber-500 text-black font-bold text-xs rounded-lg uppercase tracking-wider transition">
            ➕ COMPOSE SECURE DISCLOSURE
          </button>
          
          <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/40 divide-y divide-zinc-900/50 text-xs">
            {(['INBOX', 'SENT', 'DRAFTS', 'ARCHIVE'] as const).map((folder) => (
              <button
                key={folder}
                onClick={() => { setActiveFolder(folder); setSelectedMessage(null); }}
                className={`w-full p-3 text-left transition flex items-center gap-2 font-bold tracking-wide uppercase ${activeFolder === folder ? 'bg-zinc-900/80 text-amber-500 border-l-2 border-amber-500' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'}`}
              >
                <span>{folder === 'INBOX' ? '📥' : folder === 'SENT' ? '📤' : folder === 'DRAFTS' ? '📝' : '🗄️'}</span>
                {folder}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Ledger Feed Box (4/12 cols) */}
        <div className="lg:col-span-4 border border-zinc-900 bg-zinc-950/40 rounded-xl min-h-[500px] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-zinc-900 bg-zinc-950 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            {activeFolder} Ledger Feed Matrix
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/40 max-h-[600px]">
            {messages.length === 0 ? (
              <div className="p-6 text-center text-zinc-600 text-[11px]">NO PAYLOAD RECORD ENTRIES DETECTED IN THIS FOLDER.</div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`p-3.5 text-left cursor-pointer transition space-y-1 ${selectedMessage?.id === msg.id ? 'bg-zinc-900/50 border-r-2 border-amber-500' : 'hover:bg-zinc-900/20'}`}
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400 font-bold truncate max-w-[150px]">
                      {activeFolder === 'INBOX' ? `From: ${msg.sender_email}` : `To: ${msg.recipient_email}`}
                    </span>
                    <span className="text-zinc-600">{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-200 truncate">{msg.subject || '(No Subject)'}</h4>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Context Panel Slot (5/12 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active View Payload Card */}
          {selectedMessage && (
            <div className="border border-zinc-900 bg-zinc-950/60 p-4 rounded-xl space-y-4 text-left">
              <div className="border-b border-zinc-900 pb-3 space-y-1">
                <div className="text-[10px] text-zinc-500 uppercase">TRANSMISSION HEADER DETECTED</div>
                <h3 className="text-xs font-bold text-amber-500">{selectedMessage.subject}</h3>
                <div className="text-[10px] text-zinc-400 font-mono pt-1">
                  <div>Sender Footprint: {selectedMessage.sender_email}</div>
                  <div>Receiver Routing: {selectedMessage.recipient_email}</div>
                </div>
              </div>
              <p className="text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed bg-black/40 p-3 border border-zinc-900/50 rounded-lg">
                {selectedMessage.payload}
              </p>
            </div>
          )}

          {/* New Secure Disclosure Output Composer Form */}
          <div className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-xl space-y-5 text-left">
            <div>
              <h3 className="text-xs font-bold font-mono tracking-widest text-amber-500 uppercase">NEW SECURE DISCLOSURE PAYLOAD</h3>
              <p className="text-[10px] text-zinc-500 mt-1">Initialize dynamic end-to-end infrastructure handshake triggers across cluster environments.</p>
            </div>

            <form onSubmit={handleDispatchPayload} className="space-y-4 text-xs">
              
              {/* Recipient Channel Control Slot */}
              <div className="relative space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">RECIPIENT CHANNEL TARGET</label>
                
                {userRole === 'SYSTEM_ADMIN' ? (
                  /* 👑 ROOT ADMIN VIEW: Dynamic Search Field Box */
                  <>
                    <input
                      type="text"
                      value={searchQuery}
                      placeholder="Type email, principal name, or corporate entity name..."
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setRecipientChannel(e.target.value)
                        setShowDropdown(true)
                      }}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800"
                      required
                    />

                    {/* Autocomplete Suggestions Menu */}
                    {showDropdown && suggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-zinc-950 border border-zinc-900 rounded-lg shadow-2xl max-h-52 overflow-y-auto divide-y divide-zinc-900/60">
                        {suggestions.map((contact) => (
                          <div
                            key={contact.email}
                            onClick={() => {
                              setSearchQuery(contact.email)
                              setRecipientChannel(contact.email)
                              setShowDropdown(false)
                            }}
                            className="p-2.5 text-left hover:bg-zinc-900/80 cursor-pointer transition space-y-0.5"
                          >
                            <div className="text-[11px] text-zinc-200 font-bold">{contact.company_name || 'Individual Identity'}</div>
                            <div className="text-[10px] text-zinc-500 flex justify-between">
                              <span>{contact.email}</span>
                              {contact.name && <span className="text-zinc-600">({contact.name})</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  /* 🔒 CLIENT SANDBOX VIEW: Immutable Isolated Select Dropdown */
                  <select
                    value={recipientChannel}
                    onChange={(e) => setRecipientChannel(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800 appearance-none cursor-pointer"
                  >
                    <option value="V&K Executive Matrix">V&K Executive Matrix (Root Operations Desk)</option>
                    <option value="V&K Tactical Support">V&K Tactical Support (Infrastructure Core)</option>
                    <option value="My Internal Team">My Internal Corporate Node (All Internal Staff)</option>
                  </select>
                )}
              </div>

              {/* Subject Text Input Field */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">SUBJECT LINE</label>
                <input
                  type="text"
                  value={subjectLine}
                  onChange={(e) => setSubjectLine(e.target.value)}
                  placeholder="Enter institutional subject mapping parameters..."
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800"
                  required
                />
              </div>

              {/* Secure Payload Textarea Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">CRYPTOGRAPHIC PAYLOAD DATA</label>
                <textarea
                  value={payloadData}
                  onChange={(e) => setPayloadData(e.target.value)}
                  placeholder="Paste or write detailed infrastructure gap tracking text fields here..."
                  rows={5}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800 font-sans leading-relaxed resize-none"
                  required
                />
              </div>

              {/* Action Log Status Warnings */}
              {statusMessage && (
                <div className={`text-[11px] p-3 rounded-lg border ${statusMessage.startsWith('❌') ? 'border-red-900/30 bg-red-500/5 text-red-400' : 'border-emerald-900/30 bg-emerald-500/5 text-emerald-400'}`}>
                  {statusMessage}
                </div>
              )}

              {/* Action Trigger Buttons */}
              <div className="flex flex-wrap gap-3 items-center pt-2">
                <button
                  type="submit"
                  disabled={dispatching}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg transition uppercase tracking-wider disabled:opacity-50"
                >
                  {dispatching ? 'ROUTING TRANSIT...' : '🚀 DISPATCH'}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs rounded-lg transition uppercase tracking-wider"
                >
                  💾 SAVE DRAFT
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  )
}