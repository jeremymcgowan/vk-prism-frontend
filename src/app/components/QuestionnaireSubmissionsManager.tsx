'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface QuestionnaireSubmission {
  id: string
  created_at: string
  status: string
  
  // Section 01: Core Identity
  company_name: string
  company_url?: string | null
  contact_name: string
  contact_email: string
  contact_phone?: string | null
  industry?: string | null

  // Section 02: Governance & Operations
  legal_structure?: string | null
  registration_state?: string | null
  formation_year?: string | null
  ein_number?: string | null
  fiscal_year_end_month?: string | null
  employee_count_w2_ft?: number | null
  employee_count_w2_pt?: number | null
  contractor_count_1099?: number | null
  has_physical_hq?: boolean | null
  is_virtual_hq_candidate?: boolean | null
  hq_address_line_1?: string | null
  hq_city?: string | null
  hq_state?: string | null
  hq_postal_code?: string | null

  // Section 03: Capital & Governance
  funding_stage?: string | null
  target_raise?: string | null
  has_bylaws?: string | null
  accounting_software?: string | null
  accounting_vendor_audit?: any

  // Section 04: Shield Security
  email_workspace_suite?: string | null
  workspace_vendor_audit?: any
  mdm_provider?: string | null
  mdm_vendor_audit?: any
  antivirus_status?: string | null
  backup_frequency?: string | null

  // Section 05: People & Workforce
  headcount_range?: string | null
  payroll_provider?: string | null
  payroll_vendor_audit?: any
  benefits_offered?: string[] | null

  // Section 06: Flow & Automation
  crm_system?: string | null
  crm_vendor_audit?: any
  collaboration_tool?: string | null
  automation_status?: string | null

  // Raw JSON Backup
  raw_step_payloads?: any
  node_id?: string | null
}

interface ProfileStaff {
  id: string
  full_name: string
  email: string
}

export default function QuestionnaireSubmissionsManager() {
  const [submissions, setSubmissions] = useState<QuestionnaireSubmission[]>([])
  const [staffList, setStaffList] = useState<ProfileStaff[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Queue View Filter (Default to PENDING)
  const [activeTab, setActiveTab] = useState<'PENDING' | 'PROMOTED' | 'DECLINED' | 'ALL'>('PENDING')

  // Inspector Drawer State
  const [selectedLead, setSelectedLead] = useState<QuestionnaireSubmission | null>(null)
  const [editForm, setEditForm] = useState<QuestionnaireSubmission | null>(null)
  const [assignedManagerId, setAssignedManagerId] = useState<string>('')
  const [showRawJson, setShowRawJson] = useState<boolean>(false)
  
  const [saving, setSaving] = useState<boolean>(false)
  const [promoting, setPromoting] = useState<boolean>(false)
  const [declining, setDeclining] = useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchInitialData()
  }, [])

  // Keyboard listener to close drawer on 'Esc'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedLead) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedLead])

  async function fetchInitialData() {
    setLoading(true)
    setErrorMsg(null)

    // 1. Fetch Submissions (All columns)
    const { data: subData, error: subError } = await supabase
      .from('crm_questionnaire_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (subError) {
      setErrorMsg(`Failed to fetch leads: ${subError.message}`)
    } else if (subData) {
      setSubmissions(subData)
    }

    // 2. Fetch Internal V&K Staff for Account Manager Dropdown
    const { data: staffData } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('organization_scope', 'VK_INTERNAL_STAFF')
      .order('full_name', { ascending: true })

    if (staffData) setStaffList(staffData)

    setLoading(false)
  }

  const handleRowClick = (lead: QuestionnaireSubmission) => {
    setSelectedLead(lead)
    setEditForm({ ...lead, status: lead.status || 'PENDING' })
    setShowRawJson(false)
    setSaveSuccess(null)
    setErrorMsg(null)
  }

  const handleClose = () => {
    setSelectedLead(null)
    setEditForm(null)
    setSaveSuccess(null)
  }

  const handleInputChange = (field: keyof QuestionnaireSubmission, value: any) => {
    if (!editForm) return
    setEditForm({ ...editForm, [field]: value })
  }

  // Regular Save (Updates fields directly in crm_questionnaire_submissions)
  const handleSaveChanges = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!editForm || !selectedLead) return

    setSaving(true)
    setErrorMsg(null)
    setSaveSuccess(null)

    try {
      const { error } = await supabase
        .from('crm_questionnaire_submissions')
        .update({
          company_name: editForm.company_name,
          company_url: editForm.company_url || null,
          contact_name: editForm.contact_name,
          contact_email: editForm.contact_email,
          contact_phone: editForm.contact_phone || null,
          industry: editForm.industry || null,
          legal_structure: editForm.legal_structure || null,
          registration_state: editForm.registration_state || null,
          ein_number: editForm.ein_number || null,
          funding_stage: editForm.funding_stage || null,
          target_raise: editForm.target_raise || null,
          accounting_software: editForm.accounting_software || null,
          crm_system: editForm.crm_system || null,
          collaboration_tool: editForm.collaboration_tool || null,
          automation_status: editForm.automation_status || null,
          status: editForm.status || 'PENDING',
        })
        .eq('id', selectedLead.id)

      if (error) throw new Error(error.message)

      setSaveSuccess('✓ TELEMETRY RECORD UPDATED IN SUPABASE')
      setSubmissions((prev) =>
        prev.map((item) => (item.id === selectedLead.id ? { ...editForm } : item))
      )
      setSelectedLead({ ...editForm })
    } catch (err: any) {
      console.error('SAVE_ERROR:', err)
      setErrorMsg(`Save failed: ${err.message || 'Database rejection'}`)
    } finally {
      setSaving(false)
    }
  }

  // Atomic Promotion Trigger (Calls stored procedure: promote_onboarding_submission)
  const handlePromoteLead = async () => {
    if (!selectedLead) return

    setPromoting(true)
    setErrorMsg(null)
    setSaveSuccess(null)

    try {
      const { data: newEntityId, error: rpcError } = await supabase.rpc(
        'promote_onboarding_submission',
        {
          target_submission_id: selectedLead.id,
          assigned_account_manager_id: assignedManagerId && assignedManagerId.trim() !== '' ? assignedManagerId : null,
        }
      )

      if (rpcError) throw new Error(rpcError.message)

      const entityDisplay = typeof newEntityId === 'string' 
        ? newEntityId.slice(0, 8) 
        : typeof newEntityId === 'object' && newEntityId?.id 
        ? String(newEntityId.id).slice(0, 8)
        : 'ACTIVE'

      setSaveSuccess(`⚡ PROMOTED! ENTITY GENERATED (${entityDisplay}). REFRESHING MATRIX...`)
      
      const updatedSubmission = { ...selectedLead, status: 'PROMOTED' }
      setSubmissions((prev) =>
        prev.map((item) => (item.id === selectedLead.id ? updatedSubmission : item))
      )
      
      setTimeout(() => {
        handleClose()
        fetchInitialData()
      }, 1800)

    } catch (err: any) {
      console.error('PROMOTION_ERROR:', err)
      setErrorMsg(err.message || 'Promotion transaction failed.')
    } finally {
      setPromoting(false)
    }
  }

  // Decline Lead
  const handleDeclineLead = async () => {
    if (!selectedLead) return

    setDeclining(true)
    setErrorMsg(null)
    setSaveSuccess(null)

    try {
      const { error: subError } = await supabase
        .from('crm_questionnaire_submissions')
        .update({ status: 'DECLINED' })
        .eq('id', selectedLead.id)

      if (subError) throw new Error(subError.message)

      setSaveSuccess('⛔ SUBMISSION DECLINED AND ARCHIVED.')
      
      const updatedSubmission = { ...selectedLead, status: 'DECLINED' }
      setSubmissions((prev) =>
        prev.map((item) => (item.id === selectedLead.id ? updatedSubmission : item))
      )

      setTimeout(() => {
        handleClose()
      }, 1200)

    } catch (err: any) {
      setErrorMsg(err.message || 'Decline failed.')
    } finally {
      setDeclining(false)
    }
  }

  const handleVisitUrl = (url?: string | null) => {
    if (!url) return
    const target = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
    window.open(target, '_blank', 'noopener,noreferrer')
  }

  const handleCallPhone = (phone?: string | null) => {
    if (!phone) return
    window.location.href = `tel:${phone.replace(/[^\d+]/g, '')}`
  }

  const filteredSubmissions = submissions.filter((sub) => {
    const currentStatus = sub.status || 'PENDING'
    if (activeTab === 'ALL') return true
    return currentStatus === activeTab
  })

  if (loading && submissions.length === 0) {
    return <div className="text-xs font-mono text-[#C5A880] animate-pulse uppercase tracking-widest">SYNCHRONIZING ONBOARDING PIPELINE...</div>
  }

  return (
    <div className="space-y-4 relative">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-2 bg-zinc-950/80 rounded-xl" style={{ borderColor: '#C5A880' }}>
        <div className="space-y-1">
          <h3 className="text-xs font-bold tracking-widest text-[#C5A880] uppercase font-mono">
            Onboarding Intake Pipeline
          </h3>
          <p className="text-[11px] text-zinc-400 font-sans">
            Real-time client onboarding submissions. Inspect complete 6-step telemetry, assign account managers, or promote to active nodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Selector */}
          <div className="flex bg-black border border-zinc-800 rounded-lg p-1 text-[10px] font-mono font-bold">
            {(['PENDING', 'PROMOTED', 'DECLINED', 'ALL'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded transition cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#C5A880] text-black font-extrabold shadow-[0_0_10px_rgba(197,168,128,0.3)]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button 
            onClick={fetchInitialData}
            className="bg-black border border-zinc-800 text-[#C5A880] px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold hover:bg-zinc-900 transition cursor-pointer"
          >
            ↻ REFRESH
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/30 border border-red-900/50 text-red-400 text-xs font-mono rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Main Table */}
      <div className="border-2 border-zinc-900 rounded-xl overflow-x-auto bg-zinc-950/40 w-full block shadow-lg">
        <table className="w-full text-left border-collapse text-xs min-w-[950px]">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-900/50 text-zinc-300 font-bold font-mono text-[10px] uppercase tracking-wider">
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
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-zinc-500 font-mono text-xs uppercase tracking-wider">
                  Zero onboarding submissions found in status tier [{activeTab}].
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((sub) => {
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
                    className={`border-b border-zinc-900/60 cursor-pointer transition ${
                      isSelected ? 'bg-[#C5A880]/15 border-l-4 border-l-[#C5A880]' : 'hover:bg-zinc-900/40'
                    }`}
                  >
                    <td className="p-3">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                        leadStatus === 'PROMOTED' || leadStatus === 'ACTIVE'
                          ? 'bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/40'
                          : leadStatus === 'DECLINED'
                          ? 'bg-red-950/40 text-red-400 border border-red-800/40'
                          : 'bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/40'
                      }`}>
                        {leadStatus}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {formattedDate}
                    </td>
                    <td className="p-3 font-bold text-zinc-100">
                      {sub.company_name}
                      {sub.company_url && (
                        <span className="block text-[10px] font-mono text-zinc-500 font-normal truncate">
                          {sub.company_url}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-zinc-200 font-semibold">
                      {sub.contact_name || 'N/A'}
                    </td>
                    <td className="p-3 font-mono text-[#C5A880]">
                      {sub.contact_email}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-mono bg-black px-2 py-0.5 rounded text-zinc-300 border border-zinc-800">
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
                      <span className="text-[10px] font-mono font-bold text-[#C5A880] hover:underline">
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

      {/* Slide-over Full 6-Section Inspector Drawer */}
      {selectedLead && editForm && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          <div className="w-full max-w-2xl bg-zinc-950 border-l-2 border-[#C5A880] h-full p-6 flex flex-col justify-between overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.9)]">
            <div className="space-y-6">
              
              {/* Drawer Header */}
              <div className="flex justify-between items-start border-b border-zinc-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#C5A880] font-bold uppercase tracking-widest">FULL 6-STEP ONBOARDING TELEMETRY</span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-extrabold uppercase ${
                      editForm.status === 'PROMOTED' || editForm.status === 'ACTIVE'
                        ? 'bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/40' 
                        : editForm.status === 'DECLINED'
                        ? 'bg-red-950/40 text-red-400 border border-red-800/40'
                        : 'bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/40'
                    }`}>
                      {editForm.status || 'PENDING'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100 font-sans mt-1">{selectedLead.company_name}</h3>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">SUBMISSION ID: {selectedLead.id}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="text-[10px] font-mono font-bold px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-[#C5A880] rounded cursor-pointer"
                  >
                    {showRawJson ? '📋 FORM VIEW' : '🔍 RAW JSON'}
                  </button>

                  <button 
                    type="button"
                    onClick={handleClose}
                    className="text-zinc-400 hover:text-white font-mono text-xs px-2.5 py-1 bg-black rounded border border-zinc-800 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-[#00FF66]/10 border border-[#00FF66]/40 text-[#00FF66] text-xs font-mono font-bold rounded-lg animate-fadeIn">
                  {saveSuccess}
                </div>
              )}

              {/* RAW JSON VIEW */}
              {showRawJson ? (
                <div className="p-4 bg-black border border-zinc-800 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto space-y-2 max-h-[60vh]">
                  <span className="text-[10px] font-bold text-[#C5A880] uppercase block">Full Database Record Payload:</span>
                  <pre>{JSON.stringify(editForm, null, 2)}</pre>
                </div>
              ) : (
                /* FORM VIEW: ALL 6 SECTIONS */
                <form id="lead-edit-form" onSubmit={handleSaveChanges} className="space-y-4 font-mono text-xs">
                  
                  {/* Section 01: Identity & Primary Contact */}
                  <div className="p-4 border border-zinc-800 bg-black/60 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider block font-bold">Section 01 // Corporate Identity &amp; Contact</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 block font-semibold">COMPANY NAME</label>
                        <input 
                          type="text" 
                          value={editForm.company_name || ''} 
                          onChange={(e) => handleInputChange('company_name', e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-semibold focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">WEBSITE URL</label>
                          <button type="button" onClick={() => handleVisitUrl(editForm.company_url)} className="text-[10px] text-[#C5A880] hover:text-white font-bold cursor-pointer">🌐 VISIT</button>
                        </div>
                        <input 
                          type="text" 
                          placeholder="https://company.com"
                          value={editForm.company_url || ''} 
                          onChange={(e) => handleInputChange('company_url', e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 block font-semibold">CONTACT NAME</label>
                        <input 
                          type="text" 
                          value={editForm.contact_name || ''} 
                          onChange={(e) => handleInputChange('contact_name', e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-semibold focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 block font-semibold">EMAIL IDENTITY</label>
                        <input 
                          type="email" 
                          value={editForm.contact_email || ''} 
                          onChange={(e) => handleInputChange('contact_email', e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-[#C5A880] focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">PHONE</label>
                          <button type="button" onClick={() => handleCallPhone(editForm.contact_phone)} className="text-[10px] text-[#00FF66] hover:text-white font-bold cursor-pointer">📞 CALL</button>
                        </div>
                        <input 
                          type="text" 
                          value={editForm.contact_phone || ''} 
                          onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 02: Governance, Entity & HQ Operations */}
                  <div className="p-4 border border-zinc-800 bg-black/60 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider block font-bold">Section 02 // Entity Governance &amp; Headquarters</span>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 block font-semibold">LEGAL STRUCTURE</label>
                        <input 
                          type="text" 
                          value={editForm.legal_structure || 'STARTUP_NOT_FORMED'} 
                          onChange={(e) => handleInputChange('legal_structure', e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 block font-semibold">STATE / STATE REG</label>
                        <input 
                          type="text" 
                          value={editForm.registration_state || editForm.hq_state || 'UNDECIDED'} 
                          onChange={(e) => handleInputChange('registration_state', e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 block font-semibold">EIN NUMBER</label>
                        <input 
                          type="text" 
                          value={editForm.ein_number || 'N/A'} 
                          onChange={(e) => handleInputChange('ein_number', e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-1 text-[10px]">
                      <div>
                        <span className="text-zinc-500 block">W2 Full-Time:</span>
                        <span className="font-bold text-zinc-200">{editForm.employee_count_w2_ft ?? '0'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">W2 Part-Time:</span>
                        <span className="font-bold text-zinc-200">{editForm.employee_count_w2_pt ?? '0'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">1099 Contractors:</span>
                        <span className="font-bold text-zinc-200">{editForm.contractor_count_1099 ?? '0'}</span>
                      </div>
                    </div>

                    {editForm.hq_address_line_1 && (
                      <div className="pt-2 border-t border-zinc-900 text-[10px]">
                        <span className="text-zinc-500 block">PHYSICAL HQ ADDRESS</span>
                        <span className="font-mono text-zinc-300">{editForm.hq_address_line_1}, {editForm.hq_city}, {editForm.hq_state} {editForm.hq_postal_code}</span>
                      </div>
                    )}
                  </div>

                  {/* Section 03: Capital & Governance */}
                  <div className="p-4 border border-zinc-800 bg-black/60 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider block font-bold">Section 03 // Capital Stack &amp; Accounting</span>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 block font-semibold">FUNDING STAGE</label>
                        <input 
                          type="text" 
                          value={editForm.funding_stage || 'BOOTSTRAPPED'} 
                          onChange={(e) => handleInputChange('funding_stage', e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 block font-semibold">TARGET RAISE</label>
                        <input 
                          type="text" 
                          value={editForm.target_raise || '$0'} 
                          onChange={(e) => handleInputChange('target_raise', e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 block font-semibold">ACCOUNTING SW</label>
                        <input 
                          type="text" 
                          value={editForm.accounting_software || 'NONE'} 
                          onChange={(e) => handleInputChange('accounting_software', e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 04: Shield IT Security */}
                  <div className="p-4 border border-zinc-800 bg-black/60 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider block font-bold">Section 04 // Shield IT Security Architecture</span>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <span className="text-[9px] text-zinc-500 block">WORKSPACE SUITE</span>
                        <span className="text-zinc-200 font-bold">{editForm.email_workspace_suite || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 block">MDM PROVIDER</span>
                        <span className="text-zinc-200 font-bold">{editForm.mdm_provider || 'NONE'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 block">ANTIVIRUS / BACKUP</span>
                        <span className="text-zinc-200 font-bold">{editForm.antivirus_status || 'N/A'} / {editForm.backup_frequency || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 05: People & Payroll */}
                  <div className="p-4 border border-zinc-800 bg-black/60 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider block font-bold">Section 05 // Workforce &amp; Payroll Management</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[9px] text-zinc-500 block">PAYROLL PROVIDER</span>
                        <span className="text-zinc-200 font-bold">{editForm.payroll_provider || 'NONE'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 block">BENEFITS OFFERED</span>
                        <span className="text-zinc-200 font-bold">
                          {Array.isArray(editForm.benefits_offered) && editForm.benefits_offered.length > 0 
                            ? editForm.benefits_offered.join(', ') 
                            : 'None Selected'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 06: Flow & Automation */}
                  <div className="p-4 border border-zinc-800 bg-black/60 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider block font-bold">Section 06 // Workflows &amp; CRM Automation</span>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 block font-semibold">PRIMARY CRM</label>
                        <select
                          value={editForm.crm_system || 'NONE'}
                          onChange={(e) => handleInputChange('crm_system', e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-[#C5A880] cursor-pointer"
                        >
                          <option value="HUBSPOT">HUBSPOT</option>
                          <option value="SALESFORCE">SALESFORCE</option>
                          <option value="NOTION">NOTION</option>
                          <option value="OTHER">OTHER</option>
                          <option value="NONE">NONE</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 block font-semibold">COLLABORATION</label>
                        <select
                          value={editForm.collaboration_tool || 'SLACK'}
                          onChange={(e) => handleInputChange('collaboration_tool', e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-[#C5A880] cursor-pointer"
                        >
                          <option value="SLACK">SLACK</option>
                          <option value="TEAMS">TEAMS</option>
                          <option value="DISCORD">DISCORD</option>
                          <option value="EMAIL">EMAIL</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 block font-semibold">AUTOMATION</label>
                        <select
                          value={editForm.automation_status || 'MANUAL'}
                          onChange={(e) => handleInputChange('automation_status', e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-[#C5A880] cursor-pointer"
                        >
                          <option value="MANUAL">MANUAL</option>
                          <option value="ZAPIER">ZAPIER</option>
                          <option value="CUSTOM_AI">CUSTOM_AI</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 07: Manager Assignment */}
                  <div className="p-4 border border-zinc-800 bg-black/60 rounded-xl space-y-2">
                    <label className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider block font-bold">Assign V&amp;K Account Manager Upon Promotion</label>
                    <select
                      value={assignedManagerId}
                      onChange={(e) => setAssignedManagerId(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-[#C5A880] font-mono font-bold focus:outline-none focus:border-[#C5A880] cursor-pointer"
                    >
                      <option value="" className="bg-black text-zinc-500">-- SELECT V&amp;K ACCOUNT MANAGER --</option>
                      {staffList.map((s) => (
                        <option key={s.id} value={s.id} className="bg-black text-zinc-200">
                          {s.full_name} ({s.email})
                        </option>
                      ))}
                    </select>
                  </div>

                </form>
              )}

            </div>

            {/* Footer Action Bar */}
            <div className="pt-6 border-t border-zinc-900 space-y-3 font-mono text-xs">
              
              {editForm.status === 'PENDING' && (
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={handlePromoteLead}
                    disabled={promoting || declining}
                    className="py-3 rounded-lg bg-[#C5A880] text-[#050507] font-black hover:bg-[#D4B990] transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(197,168,128,0.3)] cursor-pointer"
                  >
                    {promoting ? 'PROMOTING TO MATRIX...' : '⚡ PROMOTE & ACTIVATE'}
                  </button>

                  <button 
                    type="button" 
                    onClick={handleDeclineLead}
                    disabled={promoting || declining}
                    className="py-3 rounded-lg bg-red-950/60 text-red-400 border border-red-900/60 font-bold hover:bg-red-900/40 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {declining ? 'DECLINING...' : '⛔ DECLINE / BOT'}
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg bg-black text-zinc-400 border border-zinc-800 hover:text-white transition cursor-pointer"
                >
                  CANCEL
                </button>
                <button 
                  type="button" 
                  onClick={() => handleSaveChanges()}
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-zinc-800 text-zinc-200 font-bold hover:bg-zinc-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'SAVING...' : 'SAVE MODIFICATIONS'}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}