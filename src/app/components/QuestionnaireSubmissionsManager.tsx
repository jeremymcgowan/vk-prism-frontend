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
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)

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
      .select('id, company_name, contact_name, contact_email, crm_system, collaboration_tool, automation_status, created_at')
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
    setEditForm({ ...lead })
    setSaveSuccess(false)
    setErrorMsg(null)
  }

  const handleClose = () => {
    setSelectedLead(null)
    setEditForm(null)
    setSaveSuccess(false)
  }

  const handleInputChange = (field: keyof QuestionnaireSubmission, value: string) => {
    if (!editForm) return
    setEditForm({ ...editForm, [field]: value })
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm || !selectedLead) return

    setSaving(true)
    setErrorMsg(null)
    setSaveSuccess(false)

    const { error } = await supabase
      .from('crm_questionnaire_submissions')
      .update({
        company_name: editForm.company_name,
        contact_name: editForm.contact_name,
        contact_email: editForm.contact_email,
        crm_system: editForm.crm_system,
        collaboration_tool: editForm.collaboration_tool,
        automation_status: editForm.automation_status,
      })
      .eq('id', selectedLead.id)

    if (error) {
      setErrorMsg(`Failed to update lead: ${error.message}`)
    } else {
      setSaveSuccess(true)
      setSubmissions((prev) =>
        prev.map((item) => (item.id === selectedLead.id ? { ...editForm } : item))
      )
      setSelectedLead({ ...editForm })
    }
    setSaving(false)
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
            Live client intake submissions. Click on any record to view and modify lead metadata.
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
        <table className="w-full text-left border-collapse text-xs min-w-[900px]">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 font-bold font-mono">
              <th className="p-3">SUBMITTED</th>
              <th className="p-3">COMPANY NAME</th>
              <th className="p-3">PRIMARY CONTACT</th>
              <th className="p-3">EMAIL IDENTITY</th>
              <th className="p-3">CURRENT CRM</th>
              <th className="p-3">COLLAB TOOL</th>
              <th className="p-3">AUTOMATION STATUS</th>
              <th className="p-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-zinc-600 font-mono text-xs">
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

                return (
                  <tr 
                    key={sub.id} 
                    onClick={() => handleRowClick(sub)}
                    className={`border-b border-zinc-900/40 cursor-pointer transition ${
                      isSelected ? 'bg-amber-950/20 border-l-2 border-l-amber-500' : 'hover:bg-zinc-900/30'
                    }`}
                  >
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
                    <td className="p-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        sub.automation_status === 'ZAPIER' 
                          ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40' 
                          : sub.automation_status === 'CUSTOM_AI' 
                          ? 'bg-purple-950/40 text-purple-400 border border-purple-800/40'
                          : 'bg-zinc-900 text-zinc-400'
                      }`}>
                        {sub.automation_status || 'MANUAL'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-[10px] font-mono text-amber-500 hover:underline">
                        EDIT →
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
                  <div className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">LEAD INSPECTOR</div>
                  <h3 className="text-lg font-bold text-zinc-100 font-sans mt-0.5">{selectedLead.company_name}</h3>
                  <p className="text-[11px] font-mono text-zinc-500 mt-1">UUID: {selectedLead.id}</p>
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
                  ✓ RECORD SAVED SUCCESSFULLY IN SUPABASE
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

            {/* Footer Controls */}
            <div className="pt-6 border-t border-zinc-900 flex justify-end gap-3 font-mono text-xs">
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
      )}
    </div>
  )
}