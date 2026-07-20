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
  
  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<OperatorProfile>>({})
  
  // Creation Mode State
  const [showAddForm, setShowAddForm] = useState<boolean>(false)
  const [addForm, setAddForm] = useState({
    email: '',
    title: '',
    security_group: 'VKStaff',
    universal_routing_handle: 'INTERNAL_STAFF_EXECUTIVE'
  })

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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

  // --- CREATE ACTION ---
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!addForm.email || !addForm.title) {
      showStatus('error', 'Identity Email and Operational Title fields are required.')
      return
    }

    const { error } = await supabase
      .from('system_permissions')
      .insert([
        {
          id: crypto.randomUUID(),
          email: addForm.email.trim(),
          title: addForm.title.trim(),
          security_group: addForm.security_group,
          universal_routing_handle: addForm.universal_routing_handle
        }
      ])

    if (error) {
      showStatus('error', `Onboarding failed: ${error.message}`)
    } else {
      showStatus('success', `Identity matrix generated for ${addForm.email}`)
      setShowAddForm(false)
      setAddForm({
        email: '',
        title: '',
        security_group: 'VKStaff',
        universal_routing_handle: 'INTERNAL_STAFF_EXECUTIVE'
      })
      fetchOperators()
    }
  }

  // --- UPDATE ACTIONS ---
  const startEditing = (operator: OperatorProfile) => {
    setEditingId(operator.id)
    setEditForm({ ...operator })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSave = async (id: string) => {
    if (!editForm.title || !editForm.security_group || !editForm.universal_routing_handle) {
      showStatus('error', 'All operational parameters must be populated.')
      return
    }

    const { error } = await supabase
      .from('system_permissions')
      .update({
        title: editForm.title.trim(),
        security_group: editForm.security_group,
        universal_routing_handle: editForm.universal_routing_handle,
      })
      .eq('id', id)

    if (error) {
      showStatus('error', `Save aborted: ${error.message}`)
    } else {
      showStatus('success', 'Operator clearance parameters updated successfully.')
      setEditingId(null)
      fetchOperators()
    }
  }

  // --- DELETE ACTION ---
  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`CRITICAL SECURITY ACTION: Are you sure you want to completely revoke system access keys for [${email}]?`)) {
      return
    }

    const { error } = await supabase
      .from('system_permissions')
      .delete()
      .eq('id', id)

    if (error) {
      showStatus('error', `Revocation failed: ${error.message}`)
    } else {
      showStatus('success', `Identity handle [${email}] purged from system clearance logs.`)
      fetchOperators()
    }
  }

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => setStatusMessage(null), 5000)
  }

  if (loading) {
    return <div className="text-xs font-mono text-zinc-500 animate-pulse">QUERYING INTERNAL WORKFORCE LEDGER...</div>
  }

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
            Internal Workforce Management and Access Profiles
          </h3>
          <p className="text-[11px] text-zinc-500 mt-1">
            Configure matrix routing handles and clearance parameters straight from the master grid layout.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="self-start sm:self-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-amber-400 font-mono text-xs px-4 py-2 rounded transition"
        >
          {showAddForm ? '✕ CLOSE PANEL' : '＋ ONBOARD NEW OPERATOR'}
        </button>
      </div>

      {/* Global Toast Alert Notifications */}
      {statusMessage && (
        <div className={`text-[10px] font-mono p-3 rounded border uppercase tracking-wider ${
          statusMessage.type === 'success' ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400' : 'bg-red-950/20 border-red-900 text-red-400'
        }`}>
          {statusMessage.type === 'success' ? '⚡ SUCCESS: ' : '⚠️ EXCEPTION: '} {statusMessage.text}
        </div>
      )}

      {/* --- CREATE ROW PANEL (Toggled Open) --- */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="p-4 border border-zinc-900 bg-zinc-950/60 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-4 items-end animate-fadeIn">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Operator Identity Email</label>
            <input
              type="email"
              required
              placeholder="name@vkpartners.co"
              className="w-full bg-black border border-zinc-800 text-zinc-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 font-mono"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Security Group</label>
            <select
              className="w-full bg-black border border-zinc-800 text-amber-400 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 font-mono"
              value={addForm.security_group}
              onChange={(e) => setAddForm({ ...addForm, security_group: e.target.value })}
            >
              <option value="VKStaff">VKStaff</option>
              <option value="VKFinancial">VKFinancial</option>
              <option value="VKOwners">VKOwners</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Routing Handle</label>
            <select
              className="w-full bg-black border border-zinc-800 text-purple-400 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500 font-mono"
              value={addForm.universal_routing_handle}
              onChange={(e) => setAddForm({ ...addForm, universal_routing_handle: e.target.value })}
            >
              <option value="INTERNAL_STAFF_EXECUTIVE">INTERNAL_STAFF_EXECUTIVE</option>
              <option value="CLIENT_PORTFOLIO_MANAGER">CLIENT_PORTFOLIO_MANAGER</option>
              <option value="ECOSYSTEM_ENTITY_NODE">ECOSYSTEM_ENTITY_NODE</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Operational Title / Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Thomas Mark"
              className="w-full bg-black border border-zinc-800 text-zinc-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
              value={addForm.title}
              onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 text-black font-bold font-mono text-xs py-2 rounded hover:bg-amber-400 transition"
          >
            EXECUTE ONBOARDING
          </button>
        </form>
      )}

      {/* --- MASTER MATRIX DISPLAY DATA TABLE --- */}
      <div className="border border-zinc-900 rounded-xl overflow-x-auto bg-zinc-950/40 w-full block">
        <table className="w-full text-left border-collapse text-xs min-w-[850px]">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 font-bold font-mono">
              <th className="p-3">OPERATOR IDENTITY</th>
              <th className="p-3">SECURITY ASSIGNMENT GROUP</th>
              <th className="p-3">ROUTING HANDLE (SPREADSHEET)</th>
              <th className="p-3">OPERATIONAL TITLE / NAME</th>
              <th className="p-3 text-right">SYSTEM CONTROLS</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((op) => {
              const isEditing = editingId === op.id

              return (
                <tr key={op.id} className="border-b border-zinc-900/40 hover:bg-zinc-900/10 transition-colors">
                  {/* Column 1: Identity Handle (Always Read-Only to maintain data audit Integrity) */}
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
                      <span className="font-mono text-[10px] text-purple-400 bg-purple-950/10 border border-purple-900/30 px-2 py-0.5 rounded">
                        {op.universal_routing_handle}
                      </span>
                    )}
                  </td>

                  {/* Column 4: Operational Title Input */}
                  <td className="p-3 text-zinc-200">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full max-w-xs bg-black border border-zinc-800 text-zinc-100 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                    ) : (
                      <span className="text-zinc-400 font-medium">{op.title || 'No Parameter Associated'}</span>
                    )}
                  </td>

                  {/* Column 5: Actions Matrix Interface Controls */}
                  <td className="p-3 text-right space-x-2 whitespace-nowrap">
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
                      <>
                        <button
                          onClick={() => startEditing(op)}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] px-2.5 py-1 rounded hover:border-zinc-700 hover:text-white transition font-mono"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => handleDelete(op.id, op.email)}
                          className="border border-red-950/60 bg-red-950/10 text-red-400 text-[10px] px-2.5 py-1 rounded hover:bg-red-950/30 hover:border-red-900 transition font-mono"
                        >
                          REVOKE
                        </button>
                      </>
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