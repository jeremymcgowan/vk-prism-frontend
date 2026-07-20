"use client"

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Message {
  id: string
  subject: string
  payload_content: string
  is_read: boolean
  created_at: string
  sender_id: string
}

export default function PrismSecureInbox() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 📡 FETCH SECURE LEDGER
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const { data, error } = await supabase
          .from('secure_messages')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setMessages(data || [])
        if (data && data.length > 0) {
          setSelectedMessage(data[0]) // Auto-mount the most recent alert
        }
      } catch (err) {
        console.error('Failed to pull secure vault:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInbox()
  }, [])

  // 🔒 MARK AS READ PROTOCOL
  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg)
    if (!msg.is_read) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m))
      await supabase
        .from('secure_messages')
        .update({ is_read: true })
        .eq('id', msg.id)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-zinc-500 tracking-widest animate-pulse">
        DECRYPTING SECURE STORAGE VAULT...
      </div>
    )
  }

  return (
    <div className="border border-zinc-900 rounded-xl bg-zinc-950/40 overflow-hidden flex flex-col md:flex-row h-[600px] w-full">
      
      {/* 📬 LEFT PANE: SECURE ALERT STREAM */}
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-900 flex flex-col shrink-0">
        <div className="p-4 bg-zinc-900/20 border-b border-zinc-900 flex justify-between items-center">
          <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400">INBOUND PAYLOADS</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-amber-400">
            {messages.filter(m => !m.is_read).length} UNREAD
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/50">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-600 font-mono">No secure records found.</div>
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
                {!msg.is_read && (
                  <span className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
                <h4 className={`text-xs truncate tracking-wide pr-4 ${!msg.is_read ? 'font-bold text-zinc-100' : 'text-zinc-400'}`}>
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

      {/* 🖥️ RIGHT PANE: SECURE DECRYPTOR DISCLOSURE */}
      <main className="flex-1 flex flex-col bg-black/20 overflow-y-auto">
        {selectedMessage ? (
          <div className="p-6 space-y-6 flex-1 flex flex-col text-left">
            <div className="border-b border-zinc-900 pb-4 space-y-1">
              <div className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase">SECURITY TELEMETRY LOG</div>
              <h2 className="text-sm font-bold tracking-tight text-zinc-200">{selectedMessage.subject}</h2>
              <p className="text-[10px] text-zinc-500 font-mono">Timestamp: {new Date(selectedMessage.created_at).toUTCString()}</p>
            </div>
            
            {/* Monospace decrypted print block */}
            <div className="flex-1 p-5 rounded-lg bg-zinc-950/60 border border-zinc-900/60 font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap max-w-none">
              {selectedMessage.payload_content}
            </div>

            <div className="pt-2 border-t border-zinc-900/40 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[9px] font-mono tracking-widest text-zinc-500">ISOLATION SHIELD ACTIVE</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs font-mono text-zinc-600">
            SELECT A COMPLIANCE PAYLOAD TO DECRYPT
          </div>
        )}
      </main>
    </div>
  )
}