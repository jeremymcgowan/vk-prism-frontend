'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface QuestionnaireSubmission {
  id: string
  created_at: string
  status: string
  
  // Section 01: Core Baseline & Capital Vetting
  display_name?: string | null
  legal_name?: string | null
  company_name?: string | null
  website_url?: string | null
  company_url?: string | null
  owner_name?: string | null
  contact_name?: string | null
  owner_email?: string | null
  contact_email?: string | null
  owner_phone?: string | null
  contact_phone?: string | null
  owner_profile_url?: string | null
  is_strategic_partner?: boolean | null
  industry?: string | null
  industry_sector?: string | null

  // Section 01 Governance
  legal_structure?: string | null
  registration_state?: string | null
  formation_year?: any
  ein_number?: string | null
  fiscal_year_end_month?: string | null
  has_bylaws?: string | null
  bylaws_resolutions_active?: boolean | null
  has_physical_hq?: boolean | null
  hq_address_line_1?: string | null
  hq_city?: string | null
  hq_state?: string | null
  hq_postal_code?: string | null

  // Section 01 Capital & Vetting Badges
  funding_stage?: string | null
  target_raise?: string | null
  funding_target_amount?: number | null
  is_seeking_funding?: boolean | null
  is_crunchbase_verified?: boolean | null
  is_bbb_registered?: boolean | null
  sells_tangible_goods?: boolean | null
  has_duns_tracker?: boolean | null
  duns_number_id?: string | null
  bbb_wedge_sentiment?: string | null

  // Section 02: Threat Vector & Security Infrastructure
  is_it_outsourced?: boolean | null
  it_lead_name?: string | null
  it_lead_email?: string | null
  it_lead_phone?: string | null
  it_lead_profile_url?: string | null
  email_workspace_suite?: string | null
  it_groupware_platform?: string | null
  managed_it_vector?: string | null
  mdm_provider?: string | null
  it_mdm_vendor?: string | null
  mdm_enforcement_log?: string | null
  it_mdm_status?: string | null
  antivirus_status?: string | null
  it_antivirus_status?: string | null
  antivirus_vendor?: string | null
  backup_frequency?: string | null
  it_backup_strategy?: string | null
  sso_gateway_vendor?: string | null
  sso_gateway_status?: string | null
  is_disk_encryption_enforced?: boolean | null

  // Section 03: Workforce Administration & Benefits
  is_hr_outsourced?: boolean | null
  hr_lead_name?: string | null
  hr_lead_email?: string | null
  hr_lead_phone?: string | null
  hr_lead_profile_url?: string | null
  employee_count_w2_ft?: number | null
  employee_count_w2_pt?: number | null
  contractor_count_1099?: number | null
  payroll_provider?: string | null
  hr_payroll_platform?: string | null
  multistate_tax_exposure?: string | null
  benefits_offered?: string[] | null
  has_piia_signed?: boolean | null
  has_commercial_liability_policy?: boolean | null

  // Section 04: Flow, CRM & Operations Automation
  is_sales_outsourced?: boolean | null
  sales_lead_name?: string | null
  sales_lead_email?: string | null
  sales_lead_phone?: string | null
  sales_lead_profile_url?: string | null
  crm_system?: string | null
  collaboration_tool?: string | null
  automation_status?: string | null
  disconnected_utility_counter?: number | null
  web_layout_satisfaction?: string | null
  has_unstructured_doc_processing?: boolean | null
  has_inbound_capture_funnels?: boolean | null
  has_traffic_analytics?: boolean | null

  // Section 05: Regulatory Compliance Matrix
  is_compliance_outsourced?: boolean | null
  compliance_officer_name?: string | null
  compliance_officer_email?: string | null
  compliance_officer_phone?: string | null
  compliance_officer_profile_url?: string | null
  hipaa_status?: string | null
  pci_status?: string | null
  finra_status?: string | null
  soc2_status?: string | null
  nist_status?: string | null
  gdpr_status?: string | null
  accounting_software?: string | null
  weekly_manual_friction_hours?: number | null
  security_sensitivity_tier?: string | null

  // Raw JSON Backup
  raw_step_payloads?: any
  node_id?: string | null
}

interface ProfileStaff {
  id: string
  full_name: string
  email: string
}

const US_STATES = [
  'DE', 'TX', 'FL', 'CA', 'NY', 'NV', 'WY', 'IL', 'MA', 'WA', 'CO', 'GA', 'NC', 
  'OH', 'PA', 'VA', 'AZ', 'MI', 'NJ', 'TN', 'OR', 'MO', 'UT', 'MD', 'MN', 'IN', 
  'SC', 'CT', 'WI', 'AL', 'OK', 'KY', 'IA', 'LA', 'KS', 'AR', 'NE', 'MS', 'NM', 
  'ID', 'NH', 'WV', 'HI', 'ME', 'RI', 'MT', 'ND', 'SD', 'AK', 'VT', 'UNDECIDED'
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
]

const AVAILABLE_BENEFITS = [
  { id: 'MEDICAL', label: '🏥 Medical Insurance' },
  { id: 'DENTAL', label: '🦷 Dental Coverage' },
  { id: 'VISION', label: '👓 Vision Coverage' },
  { id: '401K', label: '💰 401(k) / Roth' },
  { id: 'EQUITY_ESOP', label: '📊 Stock Options (ESOP)' },
  { id: 'HEALTH_STIPENDS', label: '🌴 Remote / Health Stipends' }
]

const INDUSTRY_SECTORS = [
  'FinTech / Financial Services',
  'Healthcare / MedTech',
  'SaaS / Software',
  'E-Commerce / Retail',
  'Manufacturing / Logistics',
  'Professional Services / Agency',
  'Real Estate / PropTech',
  'Education / EdTech',
  'Non-Profit / Government',
  'Other / Unspecified'
]

// HELPER: Limits string to 2 chars max for State DB insertions
const cleanTwoChar = (val: any): string | null => {
  if (!val || val === 'UNDECIDED' || val === 'Please Select') return null
  const str = String(val).trim()
  return str.length >= 2 ? str.slice(0, 2).toUpperCase() : str.toUpperCase()
}

// HELPER: Formats phone visually to (xxx) xxx-xxxx 
const formatPhoneNumber = (value: string) => {
  if (!value) return ''
  const digits = value.replace(/[^\d]/g, '')
  if (digits.length < 4) return digits
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

// HELPER: Strips leading zeros and non-digits, formats currency
const formatCurrency = (value: string) => {
  if (!value) return ''
  const digits = value.replace(/[^\d]/g, '')
  if (!digits) return ''
  return `$${parseInt(digits, 10).toLocaleString()}`
}

export default function QuestionnaireSubmissionsManager() {
  const [submissions, setSubmissions] = useState<QuestionnaireSubmission[]>([])
  const [staffList, setStaffList] = useState<ProfileStaff[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'PENDING_REVIEW' | 'PROMOTED' | 'DECLINED' | 'ALL'>('PENDING_REVIEW')

  // Inspector Drawer State
  const [selectedLead, setSelectedLead] = useState<QuestionnaireSubmission | null>(null)
  const [editForm, setEditForm] = useState<QuestionnaireSubmission | null>(null)
  const [assignedManagerId, setAssignedManagerId] = useState<string>('')
  const [showRawJson, setShowRawJson] = useState<boolean>(false)
  
  // Section Edit Locks
  const [sectionLocks, setSectionLocks] = useState<Record<string, boolean>>({
    sec1: true,
    sec2: true,
    sec3: true,
    sec4: true,
    sec5: true,
    sec6: true,
  })

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

    // Pulling exclusively from the live staging table we wired up in Step 6
    const { data: subData, error: subError } = await supabase
      .from('crm_questionnaire_staging')
      .select('*')
      .order('created_at', { ascending: false })

    if (subError) {
      setErrorMsg(`Failed to fetch leads: ${subError.message}`)
    } else if (subData) {
      // Merge raw_payloads back into the main object to populate legacy UI fields
      const hydratedData = subData.map(row => {
        const raw = row.raw_step_payloads || {}
        return {
          ...row,
          ...raw, // Overlays legacy form fields into the object so the UI inputs populate
        }
      })
      setSubmissions(hydratedData)
    }

    const { data: staffData } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .order('full_name', { ascending: true })

    if (staffData) setStaffList(staffData)

    setLoading(false)
  }

  const handleRowClick = (lead: QuestionnaireSubmission) => {
    setSelectedLead(lead)
    setEditForm({ ...lead, status: lead.status || 'PENDING_REVIEW' })
    setShowRawJson(false)
    setSaveSuccess(null)
    setErrorMsg(null)
    setSectionLocks({
      sec1: true,
      sec2: true,
      sec3: true,
      sec4: true,
      sec5: true,
      sec6: true,
    })
  }

  const handleClose = () => {
    setSelectedLead(null)
    setEditForm(null)
    setSaveSuccess(null)
  }

  const toggleSectionLock = (secKey: string) => {
    setSectionLocks((prev) => ({ ...prev, [secKey]: !prev[secKey] }))
  }

  const handleInputChange = (field: keyof QuestionnaireSubmission, value: any) => {
    if (!editForm) return
    setEditForm({ ...editForm, [field]: value })
  }

  const handleToggleBenefit = (benefitId: string) => {
    if (!editForm) return
    const currentBenefits = Array.isArray(editForm.benefits_offered) ? editForm.benefits_offered : []
    const updated = currentBenefits.includes(benefitId)
      ? currentBenefits.filter((b) => b !== benefitId)
      : [...currentBenefits, benefitId]
    
    setEditForm({ ...editForm, benefits_offered: updated })
  }

  const handleSaveChanges = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!editForm || !selectedLead) return

    setSaving(true)
    setErrorMsg(null)
    setSaveSuccess(null)

    try {
      // STRICT DB PAYLOAD: Maps all UI changes securely to valid schema columns
      // Legacy fields remain in `editForm` state but are NOT sent top-level
      const dbPayload = {
        // Section 01
        display_name: editForm.display_name || editForm.company_name || null,
        legal_name: editForm.legal_name || editForm.company_name || null,
        website_url: editForm.website_url || editForm.company_url || null,
        owner_name: editForm.owner_name || editForm.contact_name || null,
        owner_email: editForm.owner_email || editForm.contact_email || null,
        owner_phone: editForm.owner_phone || editForm.contact_phone || null,
        industry: editForm.industry || editForm.industry_sector || null,
        industry_sector: editForm.industry_sector || editForm.industry || null,
        legal_structure: editForm.legal_structure || null,
        registration_state: cleanTwoChar(editForm.registration_state),
        formation_year: editForm.formation_year && !isNaN(parseInt(editForm.formation_year, 10))
          ? parseInt(editForm.formation_year, 10)
          : null,
        ein_number: editForm.ein_number || null,
        fiscal_year_end_month: editForm.fiscal_year_end_month || null,

        // Section 02
        it_groupware_platform: editForm.it_groupware_platform || editForm.email_workspace_suite || null,
        it_mdm_vendor: editForm.it_mdm_vendor || editForm.mdm_provider || null,
        it_antivirus_status: editForm.it_antivirus_status || editForm.antivirus_status || null,
        it_backup_strategy: editForm.it_backup_strategy || editForm.backup_frequency || null,

        // Section 03
        employee_count_w2_ft: editForm.employee_count_w2_ft ?? 1,
        employee_count_w2_pt: editForm.employee_count_w2_pt ?? 0,
        contractor_count_1099: editForm.contractor_count_1099 ?? 0,
        hr_payroll_platform: editForm.hr_payroll_platform || editForm.payroll_provider || null,
        benefits_offered: editForm.benefits_offered || [],

        // Section 04 & Status
        crm_system: editForm.crm_system || null,
        collaboration_tool: editForm.collaboration_tool || null,
        automation_status: editForm.automation_status || null,
        status: editForm.status || 'PENDING_REVIEW',

        // Append UI-only legacy fields into JSON vault so they aren't lost
        raw_step_payloads: {
          ...editForm.raw_step_payloads,
          company_name: editForm.company_name,
          contact_name: editForm.contact_name,
          contact_email: editForm.contact_email,
          contact_phone: editForm.contact_phone,
          is_strategic_partner: editForm.is_strategic_partner,
          has_bylaws: editForm.has_bylaws,
          funding_stage: editForm.funding_stage,
          target_raise: editForm.target_raise,
          is_seeking_funding: editForm.is_seeking_funding,
          is_crunchbase_verified: editForm.is_crunchbase_verified,
          is_bbb_registered: editForm.is_bbb_registered,
          sells_tangible_goods: editForm.sells_tangible_goods,
          has_duns_tracker: editForm.has_duns_tracker,
          duns_number_id: editForm.duns_number_id,
          bbb_wedge_sentiment: editForm.bbb_wedge_sentiment,
          is_it_outsourced: editForm.is_it_outsourced,
          it_lead_name: editForm.it_lead_name,
          it_lead_email: editForm.it_lead_email,
          it_lead_phone: editForm.it_lead_phone,
          it_lead_profile_url: editForm.it_lead_profile_url,
          email_workspace_suite: editForm.email_workspace_suite,
          managed_it_vector: editForm.managed_it_vector,
          mdm_provider: editForm.mdm_provider,
          mdm_enforcement_log: editForm.mdm_enforcement_log,
          antivirus_status: editForm.antivirus_status,
          antivirus_vendor: editForm.antivirus_vendor,
          backup_frequency: editForm.backup_frequency,
          sso_gateway_vendor: editForm.sso_gateway_vendor,
          sso_gateway_status: editForm.sso_gateway_status,
          is_disk_encryption_enforced: editForm.is_disk_encryption_enforced,
          is_hr_outsourced: editForm.is_hr_outsourced,
          hr_lead_name: editForm.hr_lead_name,
          hr_lead_email: editForm.hr_lead_email,
          hr_lead_phone: editForm.hr_lead_phone,
          hr_lead_profile_url: editForm.hr_lead_profile_url,
          payroll_provider: editForm.payroll_provider,
          multistate_tax_exposure: editForm.multistate_tax_exposure,
          has_piia_signed: editForm.has_piia_signed,
          has_commercial_liability_policy: editForm.has_commercial_liability_policy,
          is_sales_outsourced: editForm.is_sales_outsourced,
          sales_lead_name: editForm.sales_lead_name,
          sales_lead_email: editForm.sales_lead_email,
          sales_lead_phone: editForm.sales_lead_phone,
          sales_lead_profile_url: editForm.sales_lead_profile_url,
          disconnected_utility_counter: editForm.disconnected_utility_counter,
          web_layout_satisfaction: editForm.web_layout_satisfaction,
          has_unstructured_doc_processing: editForm.has_unstructured_doc_processing,
          has_inbound_capture_funnels: editForm.has_inbound_capture_funnels,
          has_traffic_analytics: editForm.has_traffic_analytics,
          is_compliance_outsourced: editForm.is_compliance_outsourced,
          compliance_officer_name: editForm.compliance_officer_name,
          compliance_officer_email: editForm.compliance_officer_email,
          compliance_officer_phone: editForm.compliance_officer_phone,
          compliance_officer_profile_url: editForm.compliance_officer_profile_url,
          hipaa_status: editForm.hipaa_status,
          pci_status: editForm.pci_status,
          finra_status: editForm.finra_status,
          soc2_status: editForm.soc2_status,
          nist_status: editForm.nist_status,
          gdpr_status: editForm.gdpr_status,
          accounting_software: editForm.accounting_software,
          weekly_manual_friction_hours: editForm.weekly_manual_friction_hours,
          security_sensitivity_tier: editForm.security_sensitivity_tier,
        }
      }

      const { error } = await supabase
        .from('crm_questionnaire_staging')
        .update(dbPayload)
        .eq('id', selectedLead.id)

      if (error) throw new Error(error.message)

      setSaveSuccess('✓ TELEMETRY RECORD UPDATED IN SUPABASE')
      setSubmissions((prev) =>
        prev.map((item) => (item.id === selectedLead.id ? { ...editForm, ...dbPayload } : item))
      )
      // Rehydrate local state with what was sent to DB
      setSelectedLead({ ...editForm, ...dbPayload })
    } catch (err: any) {
      console.error('SAVE_ERROR:', err)
      setErrorMsg(`Save failed: ${err.message || 'Database rejection'}`)
    } finally {
      setSaving(false)
    }
  }

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

  const handleDeclineLead = async () => {
    if (!selectedLead) return

    setDeclining(true)
    setErrorMsg(null)
    setSaveSuccess(null)

    try {
      const { error: subError } = await supabase
        .from('crm_questionnaire_staging')
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

  const filteredSubmissions = submissions.filter((sub) => {
    const currentStatus = sub.status || 'PENDING_REVIEW'
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
            Real-time client onboarding submissions from crm_questionnaire_staging. Inspect 6-step telemetry and promote to active entities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-black border border-zinc-800 rounded-lg p-1 text-[10px] font-mono font-bold">
            {(['PENDING_REVIEW', 'PROMOTED', 'DECLINED', 'ALL'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded transition cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#C5A880] text-black font-extrabold shadow-[0_0_10px_rgba(197,168,128,0.3)]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab === 'PENDING_REVIEW' ? 'PENDING' : tab}
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
                const leadStatus = sub.status || 'PENDING_REVIEW'
                const companyNameDisplay = sub.display_name || sub.company_name || 'Unspecified Entity'
                const companyUrlDisplay = sub.website_url || sub.company_url
                const ownerNameDisplay = sub.owner_name || sub.contact_name || 'N/A'
                const ownerEmailDisplay = sub.owner_email || sub.contact_email || 'N/A'

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
                        {leadStatus === 'PENDING_REVIEW' ? 'PENDING' : leadStatus}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {formattedDate}
                    </td>
                    <td className="p-3 font-bold text-zinc-100">
                      {companyNameDisplay}
                      {companyUrlDisplay && (
                        <span className="block text-[10px] font-mono text-zinc-500 font-normal truncate">
                          {companyUrlDisplay}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-zinc-200 font-semibold">
                      {ownerNameDisplay}
                    </td>
                    <td className="p-3 font-mono text-[#C5A880]">
                      {ownerEmailDisplay}
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

      {/* Drawer */}
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
                      {editForm.status === 'PENDING_REVIEW' ? 'PENDING' : (editForm.status || 'PENDING')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100 font-sans mt-1">
                    {editForm.display_name || editForm.company_name || 'Unspecified Entity'}
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">STAGING ID: {selectedLead.id}</p>
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

              {showRawJson ? (
                <div className="p-4 bg-black border border-zinc-800 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto space-y-2 max-h-[60vh]">
                  <span className="text-[10px] font-bold text-[#C5A880] uppercase block">Full Database Staging Payload:</span>
                  <pre>{JSON.stringify(editForm, null, 2)}</pre>
                </div>
              ) : (
                <form id="lead-edit-form" onSubmit={handleSaveChanges} className="space-y-4 font-mono text-xs">
                  
                  {/* Section 01: Corporate Baseline & Capital Vetting */}
                  <div className="p-4 border border-zinc-800 bg-black/60 rounded-xl space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider block font-bold">Section 01 // Corporate Baseline &amp; Capital Vetting</span>
                      <button
                        type="button"
                        onClick={() => toggleSectionLock('sec1')}
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded cursor-pointer transition ${
                          sectionLocks.sec1
                            ? 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                            : 'bg-[#C5A880] text-black font-extrabold shadow-[0_0_8px_rgba(197,168,128,0.4)]'
                        }`}
                      >
                        {sectionLocks.sec1 ? '🔒 EDIT SECTION' : '🔓 UNLOCKED'}
                      </button>
                    </div>

                    <fieldset disabled={sectionLocks.sec1} className="space-y-3 disabled:opacity-75">
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">COMPANY NAME</label>
                          <input 
                            type="text" 
                            value={editForm.display_name || editForm.company_name || ''} 
                            onChange={(e) => {
                              handleInputChange('display_name', e.target.value)
                              handleInputChange('company_name', e.target.value)
                            }}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-semibold focus:outline-none focus:border-[#C5A880] disabled:bg-zinc-950/60"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] font-mono text-zinc-400 block font-semibold">WEBSITE URL</label>
                            <button type="button" onClick={() => handleVisitUrl(editForm.website_url || editForm.company_url)} className="text-[10px] text-[#C5A880] hover:text-white font-bold cursor-pointer">🌐 VISIT</button>
                          </div>
                          <input 
                            type="text" 
                            placeholder="company.com"
                            value={editForm.website_url || editForm.company_url || ''} 
                            onChange={(e) => {
                              handleInputChange('website_url', e.target.value)
                              handleInputChange('company_url', e.target.value)
                            }}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-[#C5A880] disabled:bg-zinc-950/60"
                          />
                        </div>
                      </div>
                      
                      {/* Industry Sector Dropdown */}
                      <div className="space-y-1 pt-1 border-t border-zinc-900 mt-2 pt-2">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">INDUSTRY SECTOR</label>
                          <select
                            value={editForm.industry || editForm.industry_sector || ''}
                            onChange={(e) => {
                              handleInputChange('industry', e.target.value)
                              handleInputChange('industry_sector', e.target.value)
                            }}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-[#C5A880] disabled:bg-zinc-950/60 cursor-pointer"
                          >
                            <option value="" disabled>Select Industry...</option>
                            {INDUSTRY_SECTORS.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                          </select>
                      </div>

                      <div className="p-2.5 bg-black/80 border border-zinc-900 rounded-lg space-y-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-[#C5A880] uppercase font-bold">Principal Owner Contact Telemetry</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">OWNER NAME</label>
                            <input 
                              type="text" 
                              value={editForm.owner_name || editForm.contact_name || ''} 
                              onChange={(e) => {
                                handleInputChange('owner_name', e.target.value)
                                handleInputChange('contact_name', e.target.value)
                              }}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">OWNER EMAIL</label>
                            <input 
                              type="email"
                              pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                              title="Must be a valid email (e.g. user@domain.com)"
                              value={editForm.owner_email || editForm.contact_email || ''} 
                              onChange={(e) => {
                                handleInputChange('owner_email', e.target.value)
                                handleInputChange('contact_email', e.target.value)
                              }}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-[#C5A880] invalid:border-red-900 focus:invalid:ring-red-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">OWNER PHONE</label>
                            <input 
                              type="text" 
                              placeholder="(555) 555-5555"
                              value={editForm.owner_phone || editForm.contact_phone || ''} 
                              onChange={(e) => {
                                const formatted = formatPhoneNumber(e.target.value)
                                handleInputChange('owner_phone', formatted)
                                handleInputChange('contact_phone', formatted)
                              }}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 pt-1">
                            <label className="text-[9px] text-zinc-500 block">OWNER LINKEDIN PROFILE URL</label>
                            <input 
                              type="url" 
                              pattern="^https:\/\/(www\.)?linkedin\.com\/.*$"
                              title="Must be a valid LinkedIn URL (e.g. https://linkedin.com/in/username)"
                              placeholder="https://linkedin.com/in/..."
                              value={editForm.owner_profile_url || ''} 
                              onFocus={() => {
                                if (!editForm.owner_profile_url) handleInputChange('owner_profile_url', 'https://linkedin.com/in/')
                              }}
                              onBlur={(e) => {
                                if (e.target.value === 'https://linkedin.com/in/') handleInputChange('owner_profile_url', '')
                              }}
                              onChange={(e) => handleInputChange('owner_profile_url', e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200 invalid:border-red-900 focus:invalid:ring-red-500 transition-colors"
                            />
                        </div>

                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">LEGAL STRUCTURE</label>
                          <select
                            value={editForm.legal_structure || 'STARTUP_NOT_FORMED'}
                            onChange={(e) => handleInputChange('legal_structure', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 focus:outline-none focus:border-[#C5A880] cursor-pointer disabled:bg-zinc-950/60"
                          >
                            <option value="STARTUP_NOT_FORMED">Startup / Not Yet Formed</option>
                            <option value="DELAWARE_C_CORP">Delaware C-Corporation</option>
                            <option value="LLC">Limited Liability Company (LLC)</option>
                            <option value="C_CORP">C-Corporation (Other State)</option>
                            <option value="S_CORP">S-Corporation</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">STATE REGISTRATION</label>
                          <select
                            value={editForm.registration_state || editForm.hq_state || 'UNDECIDED'}
                            onChange={(e) => handleInputChange('registration_state', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 focus:outline-none focus:border-[#C5A880] cursor-pointer disabled:bg-zinc-950/60"
                          >
                            {US_STATES.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">EIN TAX ID</label>
                          <input 
                            type="text" 
                            placeholder="Startup - Need EIN"
                            value={editForm.ein_number || ''} 
                            onChange={(e) => handleInputChange('ein_number', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-[#C5A880] disabled:bg-zinc-950/60"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">FORMATION YEAR</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 2024"
                            value={editForm.formation_year || ''} 
                            onChange={(e) => handleInputChange('formation_year', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">FISCAL YEAR-END</label>
                          <select
                            value={editForm.fiscal_year_end_month || 'December'}
                            onChange={(e) => handleInputChange('fiscal_year_end_month', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 cursor-pointer"
                          >
                            {MONTHS.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">BYLAWS &amp; GOVERNANCE</label>
                          <select
                            value={editForm.has_bylaws || 'No, we need to draft them'}
                            onChange={(e) => handleInputChange('has_bylaws', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 cursor-pointer"
                          >
                            <option value="Yes, 100% compliant">Yes, 100% compliant</option>
                            <option value="Currently working on it">Currently working on it</option>
                            <option value="No, we need to draft them">No, we need to draft them</option>
                          </select>
                        </div>
                      </div>

                      {/* Capital Stack & Corporate Vetting Badges */}
                      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-zinc-900">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">FUNDING STAGE</label>
                          <select
                            value={editForm.funding_stage || 'BOOTSTRAPPED'}
                            onChange={(e) => handleInputChange('funding_stage', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-[#C5A880] cursor-pointer"
                          >
                            <option value="BOOTSTRAPPED">BOOTSTRAPPED</option>
                            <option value="SELF_FUNDED">SELF_FUNDED</option>
                            <option value="FRIENDS_FAMILY">FRIENDS &amp; FAMILY</option>
                            <option value="PRE_SEED">PRE_SEED</option>
                            <option value="SEED">SEED</option>
                            <option value="SERIES_A">SERIES_A</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">TARGET CAPITAL ($)</label>
                          <input 
                            type="text"
                            placeholder="$0"
                            value={editForm.target_raise || ''} 
                            onChange={(e) => handleInputChange('target_raise', formatCurrency(e.target.value))}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200"
                          />
                        </div>
                      </div>

                      {/* Vetting Checkboxes */}
                      <div className="p-2.5 bg-black/80 border border-zinc-900 rounded-lg space-y-2">
                        <span className="text-[9px] font-mono text-zinc-400 font-bold block uppercase">Corporate Vetting Badges &amp; Registry Checks</span>
                        
                        <div className="grid grid-cols-3 gap-2 text-[10px]">
                          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                            <input type="checkbox" checked={!!editForm.is_seeking_funding} onChange={(e) => handleInputChange('is_seeking_funding', e.target.checked)} className="accent-[#C5A880]" />
                            Seeking Funding
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                            <input type="checkbox" checked={!!editForm.is_crunchbase_verified} onChange={(e) => handleInputChange('is_crunchbase_verified', e.target.checked)} className="accent-[#C5A880]" />
                            Crunchbase Verified
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                            <input type="checkbox" checked={!!editForm.is_bbb_registered} onChange={(e) => handleInputChange('is_bbb_registered', e.target.checked)} className="accent-[#C5A880]" />
                            BBB Registered
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                            <input type="checkbox" checked={!!editForm.sells_tangible_goods} onChange={(e) => handleInputChange('sells_tangible_goods', e.target.checked)} className="accent-[#C5A880]" />
                            Sells Tangible Goods
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                            <input type="checkbox" checked={!!editForm.has_duns_tracker} onChange={(e) => handleInputChange('has_duns_tracker', e.target.checked)} className="accent-[#C5A880]" />
                            Has DUNS Tracker
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">DUNS NUMBER ID</label>
                            <input 
                              type="text" 
                              placeholder="9 Digit DUNS Number"
                              value={editForm.duns_number_id || ''} 
                              onChange={(e) => handleInputChange('duns_number_id', e.target.value.replace(/[^\d]/g, '').slice(0, 9))}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">BBB SENTIMENT</label>
                            <select
                              value={editForm.bbb_wedge_sentiment || 'SATISFIED'}
                              onChange={(e) => handleInputChange('bbb_wedge_sentiment', e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200 cursor-pointer"
                            >
                              <option value="SATISFIED">SATISFIED</option>
                              <option value="UNSATISFIED">UNSATISFIED</option>
                              <option value="NEUTRAL">NEUTRAL</option>
                              <option value="UNRATED">UNRATED</option>
                            </select>
                          </div>
                        </div>
                      </div>

                    </fieldset>
                  </div>

                  {/* Section 02: Threat Vector & Security Infrastructure */}
                  <div className="p-4 border border-zinc-800 bg-black/60 rounded-xl space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider block font-bold">Section 02 // Threat Vector &amp; Security Infrastructure</span>
                      <button
                        type="button"
                        onClick={() => toggleSectionLock('sec2')}
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded cursor-pointer transition ${
                          sectionLocks.sec2
                            ? 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                            : 'bg-[#C5A880] text-black font-extrabold shadow-[0_0_8px_rgba(197,168,128,0.4)]'
                        }`}
                      >
                        {sectionLocks.sec2 ? '🔒 EDIT SECTION' : '🔓 UNLOCKED'}
                      </button>
                    </div>

                    <fieldset disabled={sectionLocks.sec2} className="space-y-3 disabled:opacity-75">
                      
                      {/* IT Lead Telemetry */}
                      <div className="p-2.5 bg-black/80 border border-zinc-900 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-[#C5A880] uppercase font-bold">IT &amp; Security Lead Telemetry</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[9px] text-[#C5A880] font-bold">
                            <input
                              type="checkbox"
                              checked={!!editForm.is_it_outsourced}
                              onChange={(e) => handleInputChange('is_it_outsourced', e.target.checked)}
                              className="accent-[#C5A880]"
                            />
                            ⚡ IT is Outsourced (MSP / External)
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">IT LEAD NAME</label>
                            <input 
                              type="text" 
                              value={editForm.it_lead_name || ''} 
                              onChange={(e) => handleInputChange('it_lead_name', e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">IT LEAD EMAIL</label>
                            <input 
                              type="email"
                              pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                              title="Must be a valid email (e.g. user@domain.com)"
                              value={editForm.it_lead_email || ''} 
                              onChange={(e) => handleInputChange('it_lead_email', e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-[#C5A880] invalid:border-red-900 focus:invalid:ring-red-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">IT LEAD PHONE</label>
                            <input 
                              type="text" 
                              placeholder="(555) 555-5555"
                              value={editForm.it_lead_phone || ''} 
                              onChange={(e) => handleInputChange('it_lead_phone', formatPhoneNumber(e.target.value))}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">IT LINKEDIN PROFILE URL</label>
                            <input 
                              type="url" 
                              pattern="^https:\/\/(www\.)?linkedin\.com\/.*$"
                              title="Must be a valid LinkedIn URL (e.g. https://linkedin.com/in/username)"
                              placeholder="https://linkedin.com/in/..."
                              value={editForm.it_lead_profile_url || ''} 
                              onFocus={() => {
                                if (!editForm.it_lead_profile_url) handleInputChange('it_lead_profile_url', 'https://linkedin.com/in/')
                              }}
                              onBlur={(e) => {
                                if (e.target.value === 'https://linkedin.com/in/') handleInputChange('it_lead_profile_url', '')
                              }}
                              onChange={(e) => handleInputChange('it_lead_profile_url', e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200 invalid:border-red-900 focus:invalid:ring-red-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Security Stack */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">WORKSPACE SUITE</label>
                          <select
                            value={editForm.email_workspace_suite || editForm.it_groupware_platform || 'MICROSOFT_365'}
                            onChange={(e) => {
                              handleInputChange('email_workspace_suite', e.target.value)
                              handleInputChange('it_groupware_platform', e.target.value)
                            }}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 cursor-pointer"
                          >
                            <option value="MICROSOFT_365">Microsoft 365</option>
                            <option value="GOOGLE_WORKSPACE">Google Workspace</option>
                            <option value="ZOHO">Zoho Workplace</option>
                            <option value="PROTON">Proton Mail / Encrypted</option>
                            <option value="VK_PROVISION">Need Provisioned (V&amp;K Setup)</option>
                            <option value="OTHER">Other / Basic Webmail</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">MANAGED IT VECTOR</label>
                          <select
                            value={editForm.managed_it_vector || 'HYBRID'}
                            onChange={(e) => handleInputChange('managed_it_vector', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 cursor-pointer"
                          >
                            <option value="HYBRID">HYBRID</option>
                            <option value="TRUE (MANAGED MSP)">TRUE (MANAGED MSP)</option>
                            <option value="FALSE (INTERNAL / NONE)">FALSE (INTERNAL / NONE)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">MDM PROVIDER</label>
                          <select
                            value={editForm.mdm_provider || editForm.it_mdm_vendor || 'NONE'}
                            onChange={(e) => {
                              handleInputChange('mdm_provider', e.target.value)
                              handleInputChange('it_mdm_vendor', e.target.value)
                            }}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 cursor-pointer"
                          >
                            <option value="INTUNE">Microsoft Intune</option>
                            <option value="JAMF">Jamf Pro / Jamf Now</option>
                            <option value="KANDJI">Kandji</option>
                            <option value="RIPPLING">Rippling IT / MDM</option>
                            <option value="NONE">No MDM / Manual Fleet</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">AV/EDR STATUS</label>
                          <select
                            value={editForm.antivirus_status || editForm.it_antivirus_status || 'NONE'}
                            onChange={(e) => {
                              handleInputChange('antivirus_status', e.target.value)
                              handleInputChange('it_antivirus_status', e.target.value)
                            }}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 cursor-pointer"
                          >
                            <option value="ACTIVE // MANAGED EDR">ACTIVE // MANAGED EDR</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="DEGRADED // BASIC AV">DEGRADED // BASIC AV</option>
                            <option value="INACTIVE // OS DEFENSE ONLY">INACTIVE // OS DEFENSE ONLY</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">AV AGENT VENDOR</label>
                          <input 
                            type="text" 
                            placeholder="e.g. SentinelOne / CrowdStrike"
                            value={editForm.antivirus_vendor || ''} 
                            onChange={(e) => handleInputChange('antivirus_vendor', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">BACKUP FREQUENCY</label>
                          <select
                            value={editForm.backup_frequency || editForm.it_backup_strategy || 'NONE'}
                            onChange={(e) => {
                              handleInputChange('backup_frequency', e.target.value)
                              handleInputChange('it_backup_strategy', e.target.value)
                            }}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 cursor-pointer"
                          >
                            <option value="Daily Immutable Cloud Backups">Daily Immutable Cloud Backups</option>
                            <option value="Weekly / Manual Backups">Weekly / Manual Backups</option>
                            <option value="No Formal Backup System">No Formal Backup System</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-zinc-900">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">SSO GATEWAY VENDOR</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Okta / MS Azure AD"
                            value={editForm.sso_gateway_vendor || ''} 
                            onChange={(e) => handleInputChange('sso_gateway_vendor', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">SSO GATEWAY STATUS</label>
                          <select
                            value={editForm.sso_gateway_status || 'ACTIVE'}
                            onChange={(e) => handleInputChange('sso_gateway_status', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 cursor-pointer"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="PARTIAL">PARTIAL</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </select>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer text-[10px] text-zinc-300 pt-1">
                        <input
                          type="checkbox"
                          checked={!!editForm.is_disk_encryption_enforced}
                          onChange={(e) => handleInputChange('is_disk_encryption_enforced', e.target.checked)}
                          className="accent-[#C5A880]"
                        />
                        <span>🔒 Local Device Storage Encryption Enforced (BitLocker / FileVault)</span>
                      </label>

                    </fieldset>
                  </div>

                  {/* Section 03: Workforce Administration & Benefits */}
                  <div className="p-4 border border-zinc-800 bg-black/60 rounded-xl space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider block font-bold">Section 03 // Workforce Administration &amp; Benefits</span>
                      <button
                        type="button"
                        onClick={() => toggleSectionLock('sec3')}
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded cursor-pointer transition ${
                          sectionLocks.sec3
                            ? 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                            : 'bg-[#C5A880] text-black font-extrabold shadow-[0_0_8px_rgba(197,168,128,0.4)]'
                        }`}
                      >
                        {sectionLocks.sec3 ? '🔒 EDIT SECTION' : '🔓 UNLOCKED'}
                      </button>
                    </div>

                    <fieldset disabled={sectionLocks.sec3} className="space-y-3 disabled:opacity-75">
                      
                      {/* HR Lead Telemetry */}
                      <div className="p-2.5 bg-black/80 border border-zinc-900 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-[#C5A880] uppercase font-bold">Benefits Admin Lead Telemetry</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[9px] text-[#C5A880] font-bold">
                            <input
                              type="checkbox"
                              checked={!!editForm.is_hr_outsourced}
                              onChange={(e) => handleInputChange('is_hr_outsourced', e.target.checked)}
                              className="accent-[#C5A880]"
                            />
                            ⚡ HR / Benefits is Outsourced (PEO / EOR)
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">ADMIN NAME</label>
                            <input 
                              type="text" 
                              value={editForm.hr_lead_name || ''} 
                              onChange={(e) => handleInputChange('hr_lead_name', e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">ADMIN EMAIL</label>
                            <input 
                              type="email"
                              pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                              title="Must be a valid email (e.g. user@domain.com)"
                              value={editForm.hr_lead_email || ''} 
                              onChange={(e) => handleInputChange('hr_lead_email', e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-[#C5A880] invalid:border-red-900 focus:invalid:ring-red-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">ADMIN PHONE</label>
                            <input 
                              type="text" 
                              placeholder="(555) 555-5555"
                              value={editForm.hr_lead_phone || ''} 
                              onChange={(e) => handleInputChange('hr_lead_phone', formatPhoneNumber(e.target.value))}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">ADMIN LINKEDIN PROFILE URL</label>
                            <input 
                              type="url" 
                              pattern="^https:\/\/(www\.)?linkedin\.com\/.*$"
                              title="Must be a valid LinkedIn URL (e.g. https://linkedin.com/in/username)"
                              placeholder="https://linkedin.com/in/..."
                              value={editForm.hr_lead_profile_url || ''} 
                              onFocus={() => {
                                if (!editForm.hr_lead_profile_url) handleInputChange('hr_lead_profile_url', 'https://linkedin.com/in/')
                              }}
                              onBlur={(e) => {
                                if (e.target.value === 'https://linkedin.com/in/') handleInputChange('hr_lead_profile_url', '')
                              }}
                              onChange={(e) => handleInputChange('hr_lead_profile_url', e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200 invalid:border-red-900 focus:invalid:ring-red-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Headcount Numbers */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">W2 FULL-TIME</label>
                          <input 
                            type="number" 
                            value={editForm.employee_count_w2_ft ?? 0} 
                            onChange={(e) => handleInputChange('employee_count_w2_ft', parseInt(e.target.value) || 0)}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">W2 PART-TIME</label>
                          <input 
                            type="number" 
                            value={editForm.employee_count_w2_pt ?? 0} 
                            onChange={(e) => handleInputChange('employee_count_w2_pt', parseInt(e.target.value) || 0)}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">1099 CONTRACTORS</label>
                          <input 
                            type="number" 
                            value={editForm.contractor_count_1099 ?? 0} 
                            onChange={(e) => handleInputChange('contractor_count_1099', parseInt(e.target.value) || 0)}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">PAYROLL PROVIDER</label>
                          <select
                            value={editForm.payroll_provider || editForm.hr_payroll_platform || 'MANUAL_NONE'}
                            onChange={(e) => {
                              handleInputChange('payroll_provider', e.target.value)
                              handleInputChange('hr_payroll_platform', e.target.value)
                            }}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 cursor-pointer"
                          >
                            <option value="GUSTO">Gusto</option>
                            <option value="RIPPLING">Rippling</option>
                            <option value="ADP">ADP</option>
                            <option value="PAYCHEX">Paychex</option>
                            <option value="QUICKBOOKS">QuickBooks Payroll</option>
                            <option value="MANUAL_NONE">Manual / No Payroll Yet</option>
                            <option value="NONE">NONE</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">MULTISTATE TAX EXPOSURE</label>
                          <select
                            value={editForm.multistate_tax_exposure || 'CLEAR_NO_NEXUS'}
                            onChange={(e) => handleInputChange('multistate_tax_exposure', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 cursor-pointer"
                          >
                            <option value="CLEAR_NO_NEXUS">CLEAR // NO NEXUS</option>
                            <option value="NEXUS_EXPOSED_RISK">NEXUS // EXPOSED RISK</option>
                          </select>
                        </div>
                      </div>

                      {/* Benefits offered */}
                      <div className="space-y-2 pt-1">
                        <label className="text-[9px] font-mono text-zinc-400 block font-semibold">BENEFITS OFFERED</label>
                        <div className="grid grid-cols-2 gap-2">
                          {AVAILABLE_BENEFITS.map((b) => {
                            const isChecked = Array.isArray(editForm.benefits_offered) && editForm.benefits_offered.includes(b.id)
                            return (
                              <label key={b.id} className="flex items-center gap-2 cursor-pointer text-[10px] text-zinc-300">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleBenefit(b.id)}
                                  className="accent-[#C5A880] rounded cursor-pointer"
                                />
                                <span>{b.label}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      {/* Workforce Checkpoints */}
                      <div className="space-y-1.5 pt-2 border-t border-zinc-900 text-[10px]">
                        <span className="text-zinc-500 block font-mono">WORKFORCE COMPLIANCE CHECKPOINTS</span>
                        <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                          <input type="checkbox" checked={!!editForm.has_piia_signed} onChange={(e) => handleInputChange('has_piia_signed', e.target.checked)} className="accent-[#C5A880]" />
                          Proprietary Information &amp; Inventions Agreements Signed (PIIA)
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                          <input type="checkbox" checked={!!editForm.has_commercial_liability_policy} onChange={(e) => handleInputChange('has_commercial_liability_policy', e.target.checked)} className="accent-[#C5A880]" />
                          Active General Commercial Liability Protection Policy
                        </label>
                      </div>

                    </fieldset>
                  </div>

                  {/* Section 04: Flow, CRM & Operations Automation */}
                  <div className="p-4 border border-zinc-800 bg-black/60 rounded-xl space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider block font-bold">Section 04 // Flow, CRM &amp; Operations Automation</span>
                      <button
                        type="button"
                        onClick={() => toggleSectionLock('sec4')}
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded cursor-pointer transition ${
                          sectionLocks.sec4
                            ? 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                            : 'bg-[#C5A880] text-black font-extrabold shadow-[0_0_8px_rgba(197,168,128,0.4)]'
                        }`}
                      >
                        {sectionLocks.sec4 ? '🔒 EDIT SECTION' : '🔓 UNLOCKED'}
                      </button>
                    </div>

                    <fieldset disabled={sectionLocks.sec4} className="space-y-3 disabled:opacity-75">
                      
                      {/* Sales Lead Telemetry */}
                      <div className="p-2.5 bg-black/80 border border-zinc-900 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-[#C5A880] uppercase font-bold">Sales &amp; Flow Lead Telemetry</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[9px] text-[#C5A880] font-bold">
                            <input
                              type="checkbox"
                              checked={!!editForm.is_sales_outsourced}
                              onChange={(e) => handleInputChange('is_sales_outsourced', e.target.checked)}
                              className="accent-[#C5A880]"
                            />
                            ⚡ Sales / Flow is Outsourced (Agency)
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">SALES LEAD NAME</label>
                            <input 
                              type="text" 
                              value={editForm.sales_lead_name || ''} 
                              onChange={(e) => handleInputChange('sales_lead_name', e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">SALES LEAD EMAIL</label>
                            <input 
                              type="email"
                              pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                              title="Must be a valid email (e.g. user@domain.com)"
                              value={editForm.sales_lead_email || ''} 
                              onChange={(e) => handleInputChange('sales_lead_email', e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-[#C5A880] invalid:border-red-900 focus:invalid:ring-red-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">SALES LEAD PHONE</label>
                            <input 
                              type="text" 
                              placeholder="(555) 555-5555"
                              value={editForm.sales_lead_phone || ''} 
                              onChange={(e) => handleInputChange('sales_lead_phone', formatPhoneNumber(e.target.value))}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">SALES LINKEDIN PROFILE URL</label>
                            <input 
                              type="url" 
                              pattern="^https:\/\/(www\.)?linkedin\.com\/.*$"
                              title="Must be a valid LinkedIn URL (e.g. https://linkedin.com/in/username)"
                              placeholder="https://linkedin.com/in/..."
                              value={editForm.sales_lead_profile_url || ''} 
                              onFocus={() => {
                                if (!editForm.sales_lead_profile_url) handleInputChange('sales_lead_profile_url', 'https://linkedin.com/in/')
                              }}
                              onBlur={(e) => {
                                if (e.target.value === 'https://linkedin.com/in/') handleInputChange('sales_lead_profile_url', '')
                              }}
                              onChange={(e) => handleInputChange('sales_lead_profile_url', e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200 invalid:border-red-900 focus:invalid:ring-red-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* CRM & Stack */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">PRIMARY CRM</label>
                          <select
                            value={editForm.crm_system || 'NONE'}
                            onChange={(e) => handleInputChange('crm_system', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 cursor-pointer"
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
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 cursor-pointer"
                          >
                            <option value="SLACK">SLACK</option>
                            <option value="TEAMS">TEAMS</option>
                            <option value="DISCORD">DISCORD</option>
                            <option value="EMAIL">EMAIL</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">AUTOMATION LEVEL</label>
                          <select
                            value={editForm.automation_status || 'MANUAL'}
                            onChange={(e) => handleInputChange('automation_status', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 cursor-pointer"
                          >
                            <option value="MANUAL">MANUAL</option>
                            <option value="ZAPIER">ZAPIER</option>
                            <option value="CUSTOM_AI">CUSTOM_AI</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">DISCONNECTED UTILITIES</label>
                          <input 
                            type="number" 
                            value={editForm.disconnected_utility_counter ?? 0} 
                            onChange={(e) => handleInputChange('disconnected_utility_counter', parseInt(e.target.value) || 0)}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">WEB LAYOUT SATISFACTION</label>
                          <select
                            value={editForm.web_layout_satisfaction || 'CONVERSION_FRICTION'}
                            onChange={(e) => handleInputChange('web_layout_satisfaction', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 cursor-pointer"
                          >
                            <option value="OPTIMIZED_CONVERSION">OPTIMIZED_CONVERSION</option>
                            <option value="CONVERSION_FRICTION">CONVERSION_FRICTION</option>
                          </select>
                        </div>
                      </div>

                      {/* Funnel Checkpoints */}
                      <div className="space-y-1.5 pt-2 border-t border-zinc-900 text-[10px]">
                        <span className="text-zinc-500 block font-mono">FLOW &amp; WEB FUNNEL CHECKPOINTS</span>
                        <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                          <input type="checkbox" checked={!!editForm.has_unstructured_doc_processing} onChange={(e) => handleInputChange('has_unstructured_doc_processing', e.target.checked)} className="accent-[#C5A880]" />
                          Manual Processing of Unstructured Document Formats Active
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                          <input type="checkbox" checked={!!editForm.has_inbound_capture_funnels} onChange={(e) => handleInputChange('has_inbound_capture_funnels', e.target.checked)} className="accent-[#C5A880]" />
                          Inbound Capture Funnels Harvest Leads Effectively
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                          <input type="checkbox" checked={!!editForm.has_traffic_analytics} onChange={(e) => handleInputChange('has_traffic_analytics', e.target.checked)} className="accent-[#C5A880]" />
                          Traffic Performance Analytics Trackers Active
                        </label>
                      </div>

                    </fieldset>
                  </div>

                  {/* Section 05: Regulatory Compliance Matrix */}
                  <div className="p-4 border border-zinc-800 bg-black/60 rounded-xl space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider block font-bold">Section 05 // Regulatory Compliance Matrix &amp; Framework Safeguards</span>
                      <button
                        type="button"
                        onClick={() => toggleSectionLock('sec5')}
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded cursor-pointer transition ${
                          sectionLocks.sec5
                            ? 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                            : 'bg-[#C5A880] text-black font-extrabold shadow-[0_0_8px_rgba(197,168,128,0.4)]'
                        }`}
                      >
                        {sectionLocks.sec5 ? '🔒 EDIT SECTION' : '🔓 UNLOCKED'}
                      </button>
                    </div>

                    <fieldset disabled={sectionLocks.sec5} className="space-y-3 disabled:opacity-75">
                      
                      {/* Officer Telemetry */}
                      <div className="p-2.5 bg-black/80 border border-zinc-900 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-[#C5A880] uppercase font-bold">Compliance Officer Telemetry</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[9px] text-[#C5A880] font-bold">
                            <input
                              type="checkbox"
                              checked={!!editForm.is_compliance_outsourced}
                              onChange={(e) => handleInputChange('is_compliance_outsourced', e.target.checked)}
                              className="accent-[#C5A880]"
                            />
                            ⚡ Compliance is Outsourced (External Counsel)
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">OFFICER NAME</label>
                            <input 
                              type="text" 
                              value={editForm.compliance_officer_name || ''} 
                              onChange={(e) => handleInputChange('compliance_officer_name', e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">OFFICER EMAIL</label>
                            <input 
                              type="email"
                              pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                              title="Must be a valid email (e.g. user@domain.com)"
                              value={editForm.compliance_officer_email || ''} 
                              onChange={(e) => handleInputChange('compliance_officer_email', e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-[#C5A880] invalid:border-red-900 focus:invalid:ring-red-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">OFFICER PHONE</label>
                            <input 
                              type="text" 
                              placeholder="(555) 555-5555"
                              value={editForm.compliance_officer_phone || ''} 
                              onChange={(e) => handleInputChange('compliance_officer_phone', formatPhoneNumber(e.target.value))}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 block">OFFICER LINKEDIN PROFILE URL</label>
                            <input 
                              type="url" 
                              pattern="^https:\/\/(www\.)?linkedin\.com\/.*$"
                              title="Must be a valid LinkedIn URL (e.g. https://linkedin.com/in/username)"
                              placeholder="https://linkedin.com/in/..."
                              value={editForm.compliance_officer_profile_url || ''} 
                              onFocus={() => {
                                if (!editForm.compliance_officer_profile_url) handleInputChange('compliance_officer_profile_url', 'https://linkedin.com/in/')
                              }}
                              onBlur={(e) => {
                                if (e.target.value === 'https://linkedin.com/in/') handleInputChange('compliance_officer_profile_url', '')
                              }}
                              onChange={(e) => handleInputChange('compliance_officer_profile_url', e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200 invalid:border-red-900 focus:invalid:ring-red-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Framework Status Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'hipaa_status', label: 'HIPAA PROTOCOL' },
                          { key: 'pci_status', label: 'PCI SAFEGUARD' },
                          { key: 'finra_status', label: 'FINRA BROKERAGE' },
                          { key: 'soc2_status', label: 'SOC2 FRAMEWORK' },
                          { key: 'nist_status', label: 'NIST STANDARD' },
                          { key: 'gdpr_status', label: 'GDPR PRIVACY' },
                        ].map((fw) => (
                          <div key={fw.key} className="space-y-1">
                            <label className="text-[8px] font-mono text-zinc-400 block font-semibold">{fw.label}</label>
                            <select
                              value={(editForm as any)[fw.key] || 'EXEMPT'}
                              onChange={(e) => handleInputChange(fw.key as keyof QuestionnaireSubmission, e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200 cursor-pointer text-[10px]"
                            >
                              <option value="PASS">PASS</option>
                              <option value="FAIL">FAIL</option>
                              <option value="EXEMPT">EXEMPT</option>
                            </select>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-1 border-t border-zinc-900">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">ACCOUNTING PLATFORM</label>
                          <select
                            value={editForm.accounting_software || ''}
                            onChange={(e) => handleInputChange('accounting_software', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 cursor-pointer"
                          >
                            <option value="" disabled className="text-zinc-500">Select Platform...</option>
                            <option value="QUICKBOOKS">QuickBooks</option>
                            <option value="XERO">Xero</option>
                            <option value="NETSUITE">Oracle NetSuite</option>
                            <option value="SAGE">Sage</option>
                            <option value="FRESHBOOKS">FreshBooks</option>
                            <option value="WAVE">Wave</option>
                            <option value="MANUAL_NONE">Manual / Spreadsheets</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">MANUAL FRICTION (HRS/WK)</label>
                          <input 
                            type="number" 
                            value={editForm.weekly_manual_friction_hours ?? 0} 
                            onChange={(e) => handleInputChange('weekly_manual_friction_hours', parseInt(e.target.value) || 0)}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 block font-semibold">SECURITY SENSITIVITY</label>
                          <select
                            value={editForm.security_sensitivity_tier || 'STABLE // STANDARD PROTOCOL'}
                            onChange={(e) => handleInputChange('security_sensitivity_tier', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-zinc-200 cursor-pointer"
                          >
                            <option value="STABLE // STANDARD PROTOCOL">STABLE // STANDARD PROTOCOL</option>
                            <option value="EXPOSED // HIGH CRITICAL AUDIT">EXPOSED // HIGH CRITICAL AUDIT</option>
                          </select>
                        </div>
                      </div>

                    </fieldset>
                  </div>

                  {/* Section 06: Manager Assignment */}
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
              
              {(editForm.status === 'PENDING_REVIEW' || editForm.status === 'PENDING') && (
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