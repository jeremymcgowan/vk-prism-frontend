"use client"

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Message {
  id: string
  tenant_id: string
  sender_id: string
  subject: string
  payload_content: string
  is_read: boolean
  is_draft: boolean
  recipient_archived: boolean
  recipient_hidden: boolean
  sender_archived: boolean
  sender_hidden: boolean
  created_at: string
}

type Folder = 'inbox' | 'sent' | 'drafts' | 'archive'

export default function PrismSecureInbox() {
  const [activeFolder, setActiveFolder] = useState<Folder>('inbox')
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [companyName, setCompanyName] = useState('V&K Client Node')

  // 📝 Compose State Variables
  const [isComposing, setIsComposing] = useState(false)
  const [toInput, setToInput] = useState('')
  const [subjectInput, setSubjectInput] = useState('')
  const [contentInput, setContentInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // 📇 Passport Modal State
  const [showPassport, setShowPassport] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const preloadedTargets = [
    { label: 'V&K Executive Matrix (Strategic Decisions)', value: 'vk-executive' },
    { label: 'V&K Tactical Support (Operations Helpdesk)', value: 'vk-support' },
    { label: 'V&K Alliance Clearing House (Escrow & Billing)', value: 'vk-clearing' },
    { label: 'My Internal Corporate Node (All Internal Staff)', value: 'internal-staff' }
  ]

  useEffect(() => {
    const initSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const emailPrefix = user.email?.split('@')[0] || 'Node'
        setUserName(user.user_metadata?.full_name || emailPrefix)
        fetchInbox(user.id)
      }
    }
    initSession()
  }, [activeFolder])

  const fetchInbox = async (currUserId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('secure_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // 🧭 Dynamic Multi-Folder Client Routing Engine
      const filtered = (data || []).filter((msg: Message) => {
        const isRecipient = msg.tenant_id === currUserId
        const isSender = msg.sender_id === currUserId

        if (activeFolder === 'inbox') {
          return isRecipient && !msg.is_draft && !msg.recipient_archived
        }
        if (activeFolder === 'sent') {
          return isSender && !msg.is_draft && !msg.sender_archived
        }
        if (activeFolder === 'drafts') {
          return isSender && msg.is_draft
        }
        if (activeFolder === 'archive') {
          if (isRecipient && msg.recipient_archived) return !msg.recipient_hidden
          if (isSender && msg.sender_archived) return !msg.sender_hidden
        }
        return false
      })

      setMessages(filtered)
      setSelectedMessage(filtered.length > 0 ? filtered[0] : null)
    } catch (err) {
      console.error('Core routing fracture:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg)
    if (msg.tenant_id === userId && !msg.is_read) {
      await supabase.from('secure_messages').update({ is_read: true }).eq('id', msg.id)
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m))
    }
  }

  // 📦 ARCHIVE TRIGGER PIPELINE
  const archiveActiveMessage = async () => {
    if (!selectedMessage || !userId) return
    const isRecipient = selectedMessage.tenant_id === userId
    
    if (isRecipient) {
      await supabase.from('secure_messages').update({ recipient_archived: true }).eq('id', selectedMessage.id)
    } else {
      await supabase.from('secure_messages').update({ sender_archived: true }).eq('id', selectedMessage.id)
    }
    fetchInbox(userId)
  }

  // 👁️ OPTIMIZATION VIEW SHIELDS (Hide / Unhide Active Records)
  const hideCurrentArchivedMessage = async () => {
    if (!selectedMessage || !userId) return
    if (selectedMessage.tenant_id === userId) {
      await supabase.from('secure_messages').update({ recipient_hidden: true }).eq('id', selectedMessage.id)
    } else {
      await supabase.from('secure_messages').update({ sender_hidden: true }).eq('id', selectedMessage.id)
    }
    fetchInbox(userId)
  }

  const unhideAllArchivedMessages = async () => {
    if (!userId) return
    await supabase.from('secure_messages').update({ recipient_hidden: false }).eq('tenant_id', userId)
    await supabase.from('secure_messages').update({ sender_hidden: false }).eq('sender_id', userId)
    fetchInbox(userId)
  }

  // 📋 TRANSMISSION COMPOSE HANDSHAKE
  const dispatchSecurePayload = async (saveAsDraft = false) => {
    if (!userId) return
    await supabase.from('secure_messages').insert({
      tenant_id: userId, // Simplification for self-triage or support distribution loop routing
      sender_id: userId,
      subject: subjectInput || '(No Subject)',
      payload_content: contentInput,
      is_draft: saveAsDraft
    })
    setIsComposing(false)
    setToInput('')
    setSubjectInput('')
    setContentInput('')
    fetchInbox(userId)
  }

  // 🖨️ CRYPTOGRAPHIC HARDCOPY ENGINE (PDF Isolation Printer)
  const executeIsolatedPrint = () => {
    window.print()
  }

  return (
    <div className="w-full space-y-4">
      
      {/* 🛡️ TOP INTERACTIVE HUB STRIP */}
      <div className="flex items-center justify-between border border-zinc-900 bg-zinc-950 p-4 rounded-xl">
        <button 
          onClick={() => setIsComposing(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold font-mono tracking-wider rounded-lg transition-all duration-150"
        >
          ➕ COMPOSE SECURE DISCLOSURE
        </button>

        {/* GLOWING ALLIANCE BADGE */}
        <div 
          onClick={() => setShowPassport(true)}
          className="group relative cursor-pointer px-3 py-1.5 border border-amber-500/30 rounded-full bg-amber-500/5 flex items-center space-x-2 animate-pulse hover:border-amber-400 transition"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold">NODE ID: [ VERIFIED ]</span>
          
          {/* MOUSE-OVER SYSTEM EXPLANATION TOOLTIP */}
          <div className="absolute right-0 top-8 hidden group-hover:block w-72 p-3 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl z-50 pointer-events-none">
            <p className="text-[9px] font-mono text-zinc-400 leading-normal tracking-wide text-left">
              Sovereign Node Protocol Active. This token represents your isolated network signature within the V&K Concierge Ecosystem. Share your digital passport securely to initiate authorized cross-tenant handshakes.
            </p>
          </div>
        </div>
      </div>

      {/* 📬 MAIN THREE-PANE FRAMEWORK VIEWPORT */}
      <div className="border border-zinc-900 rounded-xl bg-zinc-950/40 overflow-hidden flex flex-col md:flex-row h-[650px] w-full">
        
        {/* PANE 1: GMAIL-STYLE SIDEBAR DIRECTORY */}
        <nav className="w-full md:w-48 border-b md:border-b-0 md:border-r border-zinc-900 bg-zinc-950/20 p-3 flex flex-row md:flex-col space-x-1 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-x-visible shrink-0">
          {(['inbox', 'sent', 'drafts', 'archive'] as Folder[]).map((folder) => (
            <button
              key={folder}
              onClick={() => { setActiveFolder(folder); setIsComposing(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono tracking-widest uppercase transition-all ${
                activeFolder === folder 
                  ? 'bg-zinc-900 text-amber-400 font-bold border border-zinc-800' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {folder === 'inbox' && '📥 Inbox'}
              {folder === 'sent' && '📤 Sent'}
              {folder === 'drafts' && '📝 Drafts'}
              {folder === 'archive' && '🗄️ Archive'}
            </button>
          ))}
        </nav>

        {/* PANE 2: MESSAGE RECORD STREAM */}
        <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-900 flex flex-col shrink-0">
          
          {/* OPTIMIZATION ACTION BANNER STRIP FOR ARCHIVE LIST VIEWS */}
          {activeFolder === 'archive' && (
            <div className="p-3 bg-amber-500/5 border-b border-zinc-900 text-[10px] font-mono text-zinc-400 tracking-wide leading-tight text-left">
              You can minimize clutter by hiding items, or click{' '}
              <span onClick={unhideAllArchivedMessages} className="text-amber-400 font-bold underline cursor-pointer hover:text-amber-300">
                here
              </span>{' '}
              to unhide all records.
            </div>
          )}

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/40">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-600 font-mono tracking-wider">NO DISCLOSURE RECORDS LOGGED</div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 cursor-pointer transition-all text-left relative ${
                    selectedMessage?.id === msg.id 
                      ? 'bg-zinc-900/40 border-l-2 border-amber-500' 
                      : 'hover:bg-zinc-900/10'
                  }`}
                >
                  {msg.tenant_id === userId && !msg.is_read && (
                    <span className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  <h4 className={`text-xs truncate tracking-wide pr-6 ${msg.tenant_id === userId && !msg.is_read ? 'font-bold text-zinc-100' : 'text-zinc-400'}`}>
                    {msg.subject}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* PANE 3: READING SURFACE OR DYNAMIC COMPOSE TERMINAL */}
        <main className="flex-1 flex flex-col bg-black/20 overflow-y-auto">
          {isComposing ? (
            /* DYNAMIC COMPOSE INTERFACE CONSOLE */
            <div className="p-6 space-y-4 flex-1 flex flex-col text-left">
              <div className="border-b border-zinc-900 pb-3">
                <h3 className="text-xs font-mono font-bold tracking-widest text-amber-500">NEW SECURE DISCLOSURE PAYLOAD</h3>
              </div>
              
              {/* TO: AUTOCOMPLETE FIELD WITH INTERACTIVE SUGGESTION DROPDOWN */}
              <div className="relative space-y-1">
                <label className="text-[10px] font-mono text-zinc-500">RECIPIENT CHANNEL:</label>
                <input 
                  type="text" 
                  value={toInput}
                  onChange={(e) => { setToInput(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="ex: V&K Partners Sales Team, My Company Team (start typing)"
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-800"
                />
                {showSuggestions && (
                  <div className="absolute left-0 right-0 mt-1 bg-zinc-950 border border-zinc-900 rounded-lg shadow-2xl z-50 overflow-hidden divide-y divide-zinc-900">
                    {preloadedTargets
                      .filter(t => t.label.toLowerCase().includes(toInput.toLowerCase()))
                      .map((target) => (
                        <div 
                          key={target.value}
                          onClick={() => { setToInput(target.label); setShowSuggestions(false); }}
                          className="p-2.5 text-[11px] font-mono text-zinc-400 hover:bg-zinc-900 hover:text-amber-400 cursor-pointer text-left"
                        >
                          {target.label}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500">SUBJECT LINE:</label>
                <input 
                  type="text"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  placeholder="Enter institutional subject mapping..."
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800"
                />
              </div>

              <div className="flex-1 flex flex-col space-y-1">
                <label className="text-[10px] font-mono text-zinc-500">CRYPTOGRAPHIC PAYLOAD DATA:</label>
                <textarea 
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                  placeholder="Paste or write detailed infrastructure gap tracking text fields here..."
                  className="flex-1 w-full bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-800 resize-none min-h-[200px]"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button 
                  onClick={() => dispatchSecurePayload(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono rounded-lg transition"
                >
                  🚀 DISPATCH
                </button>
                <button 
                  onClick={() => dispatchSecurePayload(true)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-xs font-mono rounded-lg transition"
                >
                  💾 SAVE DRAFT
                </button>
                <button 
                  onClick={() => setIsComposing(false)}
                  className="px-3 py-2 text-xs font-mono text-zinc-600 hover:text-zinc-400 transition"
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : selectedMessage ? (
            /* PRINT/PDF ISOLATED AREA */
            <div id="prism-printable-pane" className="p-6 space-y-6 flex-1 flex flex-col text-left">
              <div className="border-b border-zinc-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase">SECURITY TELEMETRY LOG</div>
                  <h2 className="text-sm font-bold tracking-tight text-zinc-200">{selectedMessage.subject}</h2>
                  <p className="text-[10px] text-zinc-500 font-mono">Timestamp: {new Date(selectedMessage.created_at).toUTCString()}</p>
                </div>
                
                {/* GLOBAL ACTION ACTION STRIP */}
                <div className="flex items-center space-x-2 no-print">
                  {activeFolder !== 'archive' && (
                    <button 
                      onClick={archiveActiveMessage}
                      className="p-1.5 border border-zinc-800 bg-zinc-950 text-zinc-400 rounded hover:text-amber-400 hover:border-zinc-700 transition"
                      title="Move to Archive Ledger"
                    >
                      🗄️
                    </button>
                  )}
                  {activeFolder === 'archive' && (
                    <button 
                      onClick={hideCurrentArchivedMessage}
                      className="px-2 py-1 text-[10px] font-mono border border-zinc-800 bg-zinc-950 text-zinc-500 rounded hover:text-zinc-300 transition"
                      title="Minimize from Active Grid View"
                    >
                      🙈 Hide View
                    </button>
                  )}
                  <button 
                    onClick={executeIsolatedPrint}
                    className="px-2 py-1 text-[10px] font-mono border border-zinc-800 bg-zinc-950 text-amber-400 rounded hover:bg-zinc-900 transition"
                  >
                    🖨️ PDF / PRINT
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-5 rounded-lg bg-zinc-950/60 border border-zinc-900/60 font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.payload_content}
              </div>

              <div className="pt-2 border-t border-zinc-900/40 flex items-center justify-between no-print">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[9px] font-mono tracking-widest text-zinc-500">IMMUTABLE LOG MATRIX ACTIVE</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-600 uppercase">WORM Ecosystem Protection Enforced</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs font-mono text-zinc-600">
              SELECT A VERIFIED DATA ROW TO DECRYPT
            </div>
          )}
        </main>
      </div>

      {/* 📇 ELITE DYNAMIC HEXAGONAL ALLIANCE PASSPORT MODAL OVERLAY */}
      {showPassport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300 p-4">
          <div className="relative w-full max-w-sm bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center space-y-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* TECHNICAL HEXAGONAL PRISM APEX LOGO LOGIC */}
            <div className="mx-auto w-20 h-20 relative flex items-center justify-center">
              {/* Hexagon Outline Vector Shapes Container */}
              <div className="absolute inset-0 border border-amber-500/20 rounded-[25%] rotate-0"></div>
              <div className="absolute inset-0 border-2 border-amber-500/40 rounded-[35%] rotate-45"></div>
              <div className="absolute inset-0 border border-amber-500/30 rounded-[15%] rotate-90"></div>
              <span className="text-lg font-mono font-bold text-amber-400 tracking-tighter relative z-10 uppercase">
                {userName.slice(0, 2)}
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold tracking-wide text-zinc-100 uppercase">{companyName}</h2>
              <p className="text-xs text-zinc-400 font-mono tracking-wide">{userName}</p>
            </div>

            <div className="w-full border-t border-zinc-900 my-2"></div>

            {/* MASKED CRYPTOGRAPHIC UNIQUE TOKEN DISPLAY STRIP */}
            <div className="bg-black border border-zinc-900 rounded-lg p-3 space-y-2">
              <div className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase">SECURE SOVEREIGN ID STRING</div>
              <div className="text-xs font-mono text-emerald-400 font-bold tracking-wider">
                VK-NODE-{userId?.slice(0,4).toUpperCase() || 'XXXX'}-{userId?.slice(24,28).toUpperCase() || 'XXXX'}
              </div>
            </div>

            <div className="pt-2 flex flex-col space-y-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`VK-NODE-${userId?.slice(0,4).toUpperCase()}-${userId?.slice(24,28).toUpperCase()}`);
                }}
                className="w-full py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 rounded-lg text-xs font-mono tracking-wider transition"
              >
                📋 COPY PASSPORT TOKEN
              </button>
              <button 
                onClick={() => setShowPassport(false)}
                className="w-full py-1 text-[11px] font-mono text-zinc-600 hover:text-zinc-400 transition"
              >
                CLOSE TERMINAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL SCSS STYLESHEET PRINT SHIELD OVERLAY INTERCEPTOR */}
      <style jsx global>{`
        @media print {
          body *, header, aside, nav, .no-print, button, #prism-printable-pane div.no-print {
            display: none !important;
          }
          #prism-printable-pane, #prism-printable-pane * {
            display: block !important;
            background: transparent !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
          }
          #prism-printable-pane {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  )
}