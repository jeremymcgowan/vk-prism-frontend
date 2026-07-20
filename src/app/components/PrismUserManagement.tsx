'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface OperatorProfile {
  id: string
  email: string
  title: string
  security_group: string
  universal_routing_handle: string
  created_at?: string
}

export default function PrismUserManagement() {
  const [operators, setOperators] = useState<OperatorProfile[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<OperatorProfile>>({})
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch all user parameter entries on mount
  useEffect(() => {
    fetchOperators()
  }, [])

  async function fetchOperators() {
    setLoading(true)
    const { data, error } = await supabase
      .from('system_permissions')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error && data) {
      setOperators(data)
    }
    setLoading(false)
  }

  // Initialize row editing state
  const startEditing = (operator: OperatorProfile) => {
    setEditingId(operator.id)
    setEditForm({ ...operator })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm({})
  }

  // Save changes back to Supabase
  const handleSave = async (id: string) => {
    if (!editForm.title || !editForm.security_group || !editForm.universal_routing_handle) {
      showStatus('error', 'All operational fields must be populated.')
      return
    }

    const { error } = await supabase
      .from('system_permissions')
      .update({
        title: editForm.title,
        security_group: editForm.security_group,
        universal_routing_handle: editForm.universal_routing_handle,
      })
      .eq('id', id)

    if (error) {
      showStatus('error', `Save aborted: ${error.message}`)
    } else {
      showStatus('success', 'Operator clearance matrix updated successfully.')
      setEditingId(null)
      fetchOperators() // Refresh layout data
    }
  }

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => setStatusMessage(null), 4000)
  }

  if (loading) {
    return <div className="text-xs font-mono text-zinc-500 animate-pulse">QUERYING INTERNAL WORKFORCE LEDGER...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
            Internal Workforce Management and Access Profiles
          </h3>
          <p className="text-[11px] text-zinc-500 mt-1">
            Configure matrix routing handles and clearance parameters straight from the master grid layout.
          </p>
        </div>
        
        {statusMessage && (
          <div className={`text-[10px] font-mono px-3 py-1 rounded border uppercase tracking-wider ${
            statusMessage.type === 'success' ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400' : 'bg-red-950/20 border-red-900 text-red-400'
          }`}>
            {statusMessage.text}
          </div>
        )}
      </div>

      <div className="border border-zinc-900 rounded-xl overflow-x-auto bg-zinc-950/40 w-full block">
        <table className="w-full text-left border-collapse text-xs min-w-[800px]">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 font-bold font-mono">
              <th className="p-3">OPERATOR IDENTITY</th>
              <th className="p-3">SECURITY ASSIGNMENT GROUP</th>
              <th className="p-3">ROUTING HANDLE (SPREADSHEET)</th>
              <th className="p-3">OPERATIONAL TITLE</th>
              <th className="p-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((op) => {
              const isEditing = editingId === op.id

              return (
                <tr key={op.id} className="border-b border-zinc-900/40 hover:bg-zinc-900/10 transition-colors">
                  {/* Column 1: Identity Handle (Read-Only) */}
                  <td className="p-3 font-mono text-zinc-300 select-all">
                    {op.email}
                  </td>

                  {/* Column 2: Security Group Dropdown */}
                  <td className="p-3">
                    {isEditing ? (
                      <select
                        className="bg-black border border-zinc-800 text-amber-400 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500 font-mono"
                        value={editForm.security_group}
                        onChange={(e) => setEditForm({ ...editForm, security_group: e.target.value })}
                      >
                        <option value="VKStaff">VKStaff</option>
                        <option value="VKFinancial">VKFinancial</option>
                        <option value="VKOwners">VKOwners</option>
                      </select>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-300">
                        {op.security_group}
                      </span>
                    )}
                  </td>

                  {/* Column 3: Universal Routing Handle Dropdown */}
                  <td className="p-3">
                    {isEditing ? (
                      <select
                        className="bg-black border border-zinc-800 text-purple-400 rounded px-2 py-1 text-xs focus:outline-none focus:border-purple-500 font-mono"
                        value={editForm.universal_routing_handle}
                        onChange={(e) => setEditForm({ ...editForm, universal_routing_handle: e.target.value })}
                      >
                        <option value="INTERNAL_STAFF_EXECUTIVE">INTERNAL_STAFF_EXECUTIVE</option>
                        <option value="CLIENT_PORTFOLIO_MANAGER">CLIENT_PORTFOLIO_MANAGER</option>
                        <option value="ECOSYSTEM_ENTITY_NODE">ECOSYSTEM_ENTITY_NODE</option>
                      </select>
                    ) : (
                      <span className="font-mono text-[11px] text-purple-400 bg-purple-950/10 border border-purple-900/30 px-2 py-0.5 rounded">
                        {op.universal_routing_handle}
                      </span>
                    )}
                  </td>

                  {/* Column 4: Operational Title Input */}
                  <td className="p-3 text-zinc-200">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full max-w-xs bg-black border border-zinc-800 text-zinc-100 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500 font-sans"
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                    ) : (
                      <span className="text-zinc-400 font-medium">{op.title || 'No Title Appended'}</span>
                    )}
                  </td>

                  {/* Column 5: Action Interface Controls */}
                  <td className="p-3 text-right space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSave(op.id)}
                          className="bg-amber-500 text-black font-bold font-mono text-[10px] px-2.5 py-1 rounded hover:bg-amber-400 transition"
                        >
                          SAVE
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[10px] px-2.5 py-1 rounded hover:bg-zinc-800 transition"
                        >
                          CANCEL
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEditing(op)}
                        className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] px-2.5 py-1 rounded hover:border-zinc-700 hover:text-white transition font-mono"
                      >
                        EDIT PARAMETERS
                      </button>
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