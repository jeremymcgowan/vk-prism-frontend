'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface QuestionnaireSubmission {
  id: string
  company_name: string
  contact_name: string
  contact_email: string
  crm_system: string
  collaboration_tool: string
  automation_status: string
  status: string
  created_at: string
}

export default function QuestionnaireSubmissionsManager() {
  const [submissions, setSubmissions] = useState<QuestionnaireSubmission[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Inspector Drawer State
  const [selectedLead, setSelectedLead] = useState<QuestionnaireSubmission | null>(null)
  const [editForm, setEditForm] = useState<QuestionnaireSubmission | null>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const [promoting, setPromoting] = useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchSubmissions()
  }, [])

  // Keyboard shortcut listener to close drawer on 'Esc'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedLead) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedLead])

  async function fetchSubmissions() {
    setLoading(true)
    setErrorMsg(null)

    const { data, error } = await supabase
      .from('crm_questionnaire_submissions')
      .select('id, company_name, contact_name, contact_email, crm_system, collaboration_tool, automation_status, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setErrorMsg(`Failed to fetch leads: ${error.message}`)
    } else if (data) {
      setSubmissions(data)
    }
    setLoading(false)
  }

  const handleRowClick = (lead: QuestionnaireSubmission) => {
    setSelectedLead(lead)
    setEditForm({ ...lead, status: lead.status || 'PENDING' })
    setSaveSuccess(null)
    setErrorMsg(null)
  }

  const handleClose = () => {
    setSelectedLead(null)
    setEditForm(null)
    setSaveSuccess(null)
  }

  const handleInputChange = (field: keyof QuestionnaireSubmission, value: string) => {
    if (!editForm) return
    setEditForm({ ...editForm, [field]: value })
  }

  // Regular Save (Edits metadata without promoting)
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm || !selectedLead) return

    setSaving(true)
    setErrorMsg(null)
    setSaveSuccess(null)

    const { error } = await supabase
      .from('crm_questionnaire_submissions')
      .update({
        company_name: editForm.company_name,
        contact_name: editForm.contact_name,
        contact_email: editForm.contact_email,
        crm_system: editForm.crm_system,
        collaboration_tool: editForm.collaboration_tool,
        automation_status: editForm.automation_status,
        status: editForm.status || 'PENDING',
      })
      .eq('id', selectedLead.id)

    if (error) {
      setErrorMsg(`Failed to update lead: ${error.message}`)
    } else {
      setSaveSuccess('✓ RECORD UPDATED IN SUPABASE')
      setSubmissions((prev) =>
        prev.map((item) => (item.id === selectedLead.id ? { ...editForm } : item))
      )
      setSelectedLead({ ...editForm })
    }
    setSaving(false)
  }

  // Promote Lead to Full Corporate Entity Node
  const handlePromoteLead = async () => {
    if (!editForm || !selectedLead) return

    setPromoting(true)
    setErrorMsg(null)
    setSaveSuccess(null)

    try {
      // 1. Create Entity in crm_entities
      const { data: entityData, error: entityError } = await supabase
        .from('crm_entities')
        .insert({
          display_name: editForm.company_name,
          legal_corporate_name: editForm.company_name,
          node_status: 'ACTIVE',
          industry_sector: 'B2B SaaS',
        })
        .select()
        .single()

      if (entityError) throw new Error(`Entity creation failed: ${entityError.message}`)

      // 2. Create Primary Contact in crm_contacts linked to Entity
      if (entityData) {
        await supabase
          .from('crm_contacts')
          .insert({
            entity_id: entityData.id,
            full_name: editForm.contact_name,
            email_identity: editForm.contact_email,
            universal_routing_handle: 'CLIENT_PRIMARY',
          })
      }

      // 3. Mark Submission Status as 'ACTIVE'
      const updatedForm = { ...editForm, status: 'ACTIVE' }
      const { error: subError } = await supabase
        .from('crm_questionnaire_submissions')
        .update({ status: 'ACTIVE' })
        .eq('id', selectedLead.id)

      if (subError) throw new Error(`Submission status update failed: ${subError.message}`)

      setSaveSuccess('🎉 LEAD PROMOTED! CREATED ACTIVE ENTITY NODE & CONTACT RECORD.')
      setSubmissions((prev) =>
        prev.map((item) => (item.id === selectedLead.id ? updatedForm : item))
      )
      setSelectedLead(updatedForm)
      setEditForm(updatedForm)
    } catch (err: any) {
      setErrorMsg(err.message || 'Promotion failed.')
    } finally {
      setPromoting(false)
    }
  }

  if (loading) {
    return <div className="text-xs font-mono text-zinc-500 animate-pulse uppercase tracking-widest">QUERYING ONBOARDING PIPELINE...</div>
  }

  return (
    <div className="space-y-4 relative">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase font-mono">
            Onboarding Leads Pipeline (crm_questionnaire_submissions)
          </h3>
          <p className="text-[11px] text-zinc-500 font-sans">
            Live client intake submissions. Click on any record to view, edit, or promote leads to full ecosystem entities.
          </p>
        </div>
        <button 
          onClick={fetchSubmissions}
          className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded font-mono text-[10px] hover:text-white transition"
        >
          REFRESH
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/30 border border-red-900/50 text-red-400 text-xs font-mono rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Main Table */}
      <div className="border border-zinc-900 rounded-xl overflow-x-auto bg-zinc-950/40 w-full block">
        <table className="w-full text-left border-collapse text-xs min-w-[950px]">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 font-bold font-mono">
              <th className="p-3">STATUS</th>
              <th className="p-3">SUBMITTED</th>
              <th className="p-3">COMPANY NAME</th>
              <th className="p-3">PRIMARY CONTACT</th>
              <th className="p-3">EMAIL IDENTITY</th>
              <th className="p-3">CURRENT CRM</th>
              <th className="p-3">COLLAB TOOL</th>
              <th className="p-3">AUTOMATION</th>
              <th className="p-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-zinc-600 font-mono text-xs">
                  NO ONBOARDING LEADS FOUND IN PIPELINE.
                </td>
              </tr>
            ) : (
              submissions.map((sub) => {
                const formattedDate = new Date(sub.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })

                const isSelected = selectedLead?.id === sub.id
                const leadStatus = sub.status || 'PENDING'

                return (
                  <tr 
                    key={sub.id} 
                    onClick={() => handleRowClick(sub)}
                    className={`border-b border-zinc-900/40 cursor-pointer transition ${
                      isSelected ? 'bg-amber-950/20 border-l-2 border-l-amber-500' : 'hover:bg-zinc-900/30'
                    }`}
                  >
                    <td className="p-3">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        leadStatus === 'ACTIVE'
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50'
                          : leadStatus === 'REJECTED'
                          ? 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                          : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                      }`}>
                        {leadStatus}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                      {formattedDate}
                    </td>
                    <td className="p-3 font-semibold text-zinc-200">
                      {sub.company_name}
                    </td>
                    <td className="p-3 text-zinc-300">
                      {sub.contact_name}
                    </td>
                    <td className="p-3 font-mono text-amber-400">
                      {sub.contact_email}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-mono bg-zinc-900 px-2 py-0.5 rounded text-zinc-400 border border-zinc-800/60">
                        {sub.crm_system || 'NONE'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-zinc-400">
                      {sub.collaboration_tool || 'N/A'}
                    </td>
                    <td className="p-3 font-mono text-zinc-400 text-[11px]">
                      {sub.automation_status || 'MANUAL'}
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-[10px] font-mono text-amber-500 hover:underline">
                        INSPECT →
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over Inspector Panel / Drawer */}
      {selectedLead && editForm && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          <div className="w-full max-w-lg bg-zinc-950 border-l border-zinc-800 h-full p-6 flex flex-col justify-between overflow-y-auto shadow-2xl">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">LEAD INSPECTOR</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                      editForm.status === 'ACTIVE' 
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' 
                        : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                    }`}>
                      {editForm.status || 'PENDING'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-100 font-sans mt-1">{selectedLead.company_name}</h3>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">UUID: {selectedLead.id}</p>
                </div>
                <button 
                  type="button"
                  onClick={handleClose}
                  className="text-zinc-500 hover:text-zinc-200 font-mono text-sm px-2 py-1 bg-zinc-900 rounded border border-zinc-800"
                >
                  ✕
                </button>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs font-mono rounded-lg">
                  {saveSuccess}
                </div>
              )}

              {/* Form Fields */}
              <form id="lead-edit-form" onSubmit={handleSaveChanges} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 text-[10px] uppercase">Company Name</label>
                  <input 
                    type="text" 
                    value={editForm.company_name || ''} 
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 text-[10px] uppercase">Primary Contact Name</label>
                  <input 
                    type="text" 
                    value={editForm.contact_name || ''} 
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 text-[10px] uppercase">Contact Email Identity</label>
                  <input 
                    type="email" 
                    value={editForm.contact_email || ''} 
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 text-[10px] uppercase">CRM System</label>
                    <select
                      value={editForm.crm_system || 'OTHER'}
                      onChange={(e) => handleInputChange('crm_system', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="SALESFORCE">SALESFORCE</option>
                      <option value="HUBSPOT">HUBSPOT</option>
                      <option value="NOTION">NOTION</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 text-[10px] uppercase">Collaboration Tool</label>
                    <select
                      value={editForm.collaboration_tool || 'SLACK'}
                      onChange={(e) => handleInputChange('collaboration_tool', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="SLACK">SLACK</option>
                      <option value="TEAMS">TEAMS</option>
                      <option value="DISCORD">DISCORD</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 text-[10px] uppercase">Automation Status</label>
                    <select
                      value={editForm.automation_status || 'MANUAL'}
                      onChange={(e) => handleInputChange('automation_status', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="MANUAL">MANUAL</option>
                      <option value="ZAPIER">ZAPIER</option>
                      <option value="MAKE">MAKE</option>
                      <option value="CUSTOM_AI">CUSTOM_AI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 text-[10px] uppercase">Pipeline Status</label>
                    <select
                      value={editForm.status || 'PENDING'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-500 mb-1 text-[10px] uppercase">Submission Timestamp</label>
                  <input 
                    type="text" 
                    disabled 
                    value={new Date(selectedLead.created_at).toLocaleString()}
                    className="w-full bg-zinc-900/50 border border-zinc-900 rounded px-3 py-2 text-zinc-500 cursor-not-allowed font-mono text-[11px]"
                  />
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 border-t border-zinc-900 space-y-3 font-mono text-xs">
              {editForm.status !== 'ACTIVE' && (
                <button 
                  type="button" 
                  onClick={handlePromoteLead}
                  disabled={promoting}
                  className="w-full py-2.5 rounded bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
                >
                  {promoting ? 'PROMOTING TO ENTITY...' : '⚡ APPROVE & PROMOTE TO ENTITY'}
                </button>
              )}

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleClose}
                  className="px-4 py-2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white transition"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  form="lead-edit-form"
                  disabled={saving}
                  className="px-4 py-2 rounded bg-amber-500 text-black font-bold hover:bg-amber-400 transition disabled:opacity-50"
                >
                  {saving ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}