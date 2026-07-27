'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface EntityTelemetry {
  id: string
  node_id?: string | null
  parent_entity_id: string | null
  display_name: string
  legal_name: string
  legal_structure: string
  registration_state: string
  formation_year: number
  ein_number: string
  industry: string
  status: string
  sells_tangible_goods: boolean
  has_duns_number: boolean
  duns_number: string
  bbb_registered: boolean
  bbb_wedge_sentiment: string
  crunchbase_active: boolean
  is_seeking_funding: boolean
  funding_target_amount: number | null
  funding_stage: string
  readiness_completion_pct: number
  vk_audit_status: string

  // Governance & HQ Extensions
  has_bylaws?: string | null
  bylaws_resolutions_active?: boolean
  fiscal_year_end_month?: string | null
  has_physical_hq?: boolean | null
  is_virtual_hq_candidate?: boolean | null
  hq_address_line_1?: string | null
  hq_address_line1?: string | null
  hq_city?: string | null
  hq_state?: string | null
  hq_postal_code?: string | null
  hq_zip?: string | null

  // Security & IT Telemetry (Native Columns)
  has_managed_it: string
  it_groupware_platform?: string | null
  email_workspace_suite?: string | null
  mdm_provider?: string | null
  it_mdm_vendor?: string | null
  antivirus_status?: string | null
  backup_frequency?: string | null
  it_backup_strategy?: string | null
  it_antivirus_status: string
  it_antivirus_vendor: string
  it_encryption_enabled: boolean
  it_mdm_status: string
  it_sso_status: string
  it_sso_vendor: string

  // Workforce & Benefits (Native Columns)
  employee_count_w2_ft?: number | null
  employee_count_w2_pt?: number | null
  contractor_count_1099?: number | null
  benefits_offered?: string[] | null
  hr_payroll_platform: string
  payroll_provider?: string | null
  hr_multistate_tax_registered: string
  hr_benefits_active: boolean
  hr_all_staff_piia_signed: boolean

  // Flow & Systems (Native Columns)
  crm_system?: string | null
  collaboration_tool?: string | null
  automation_status?: string | null
  flow_disconnected_tool_count: number
  flow_unstructured_pdf_parsing_manual: boolean
  web_design_satisfaction: string
  web_yields_leads: boolean
  web_analytics_active: boolean
  ins_commercial_policy_active: boolean
}

interface ITAssessment {
  id?: string
  entity_id: string
  website_design_satisfied: boolean
  client_attraction_satisfied: boolean
  has_accounting_software: boolean
  accounting_software_platform: string
  infrastructure_security_concerned: boolean
  is_hipaa_compliant: string
  is_pci_compliant: string
  is_finra_compliant: string
  is_soc2_compliant: string
  is_nist_compliant: string
  is_gdpr_compliant: string
  has_international_workers: boolean
  manual_data_hours_weekly: number
}

interface PlatformBanner {
  id: string
  banner_key: string
  display_title: string
  promo_text: string
  action_url: string
  button_label: string
  is_active: boolean
}

const US_STATES = [
  'DE', 'CA', 'NY', 'TX', 'FL', 'NV', 'WY', 'IL', 'MA', 'WA', 'CO', 'GA', 'NC', 'OH', 
  'PA', 'VA', 'AZ', 'MI', 'NJ', 'TN', 'OR', 'MO', 'UT', 'MD', 'MN', 'IN', 'SC', 'CT', 
  'WI', 'AL', 'OK', 'KY', 'IA', 'LA', 'KS', 'AR', 'NE', 'MS', 'NM', 'ID', 'NH', 'WV', 
  'HI', 'ME', 'RI', 'MT', 'ND', 'SD', 'AK', 'VT'
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
]

const BENEFIT_TOGGLES = [
  { id: 'MEDICAL', label: '🏥 Medical Insurance' },
  { id: 'DENTAL', label: 'DENTAL', labelText: '🦷 Dental Coverage' },
  { id: 'VISION', label: '👓 Vision Coverage' },
  { id: 'RETIREMENT_401K', label: '💰 401(k) / Roth' },
  { id: 'SIMPLE_IRA', label: '📈 SIMPLE / SEP IRA' },
  { id: 'EQUITY_ESOP', label: '📊 Stock Options (ESOP)' },
  { id: 'STIPEND_PERKS', label: '🌴 Remote / Health Stipends' },
]

export default function EcosystemEntitiesManager() {
  const [nodes, setNodes] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  const [telemetry, setTelemetry] = useState<EntityTelemetry | null>(null)
  const [assessment, setAssessment] = useState<ITAssessment | null>(null)
  const [banners, setBanners] = useState<PlatformBanner[]>([])
  
  const [originalEin, setOriginalEin] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copiedNodeId, setCopiedNodeId] = useState<boolean>(false)

  // Per-section edit locks (default locked)
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({
    sec01: false,
    sec02: false,
    sec03: false,
    sec04: false,
    sec05: false,
    sec06: false,
  })

  const toggleSectionEdit = (secKey: string) => {
    setEditingSections(prev => ({ ...prev, [secKey]: !prev[secKey] }))
  }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchInitialData()
  }, [])

  const safeParseInt = (val: string, maxVal: number = 2147483647): number => {
    const parsed = parseInt(val, 10)
    if (isNaN(parsed)) return 0
    return Math.min(parsed, maxVal)
  }

  const formatEIN = (val: string): string => {
    const digits = val.replace(/\D/g, '').slice(0, 9)
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)}-${digits.slice(2)}`
  }

  const isValidEIN = (ein: string): boolean => {
    if (!ein || ein === 'Startup - Need EIN') return true
    const digits = ein.replace(/\D/g, '')
    return digits.length === 9
  }

  const copyNodeIdToClipboard = (nodeIdText: string) => {
    navigator.clipboard.writeText(nodeIdText)
    setCopiedNodeId(true)
    setTimeout(() => setCopiedNodeId(false), 2000)
  }

  async function fetchInitialData(preserveId?: string) {
    setLoading(true)
    
    // Expanded select fields to make matrix search robust
    const { data: entData, error: entErr } = await supabase
      .from('crm_entities')
      .select('id, display_name, legal_name, ein_number, status')
      .order('display_name', { ascending: true })

    if (entErr) {
      console.error('Failed to fetch crm_entities:', entErr.message)
      triggerToast('error', `Failed to load corporate nodes: ${entErr.message}`)
    }

    const { data: banData } = await supabase
      .from('crm_ecosystem_banners')
      .select('*')
      .order('banner_key', { ascending: true })

    if (entData) setNodes(entData)
    if (banData) setBanners(banData)
    
    const activeTargetId = preserveId || selectedId || (entData && entData.length > 0 ? entData[0].id : '')
    if (activeTargetId) {
      setSelectedId(activeTargetId)
      await fetchProfileData(activeTargetId)
    }
    setLoading(false)
  }

  async function fetchProfileData(id: string) {
    const { data: ent } = await supabase
      .from('crm_entities')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    const { data: assess } = await supabase
      .from('crm_it_assessments')
      .select('*')
      .eq('entity_id', id)
      .maybeSingle()

    if (ent) {
      setTelemetry(ent)
      setOriginalEin(ent.ein_number || 'Startup - Need EIN')
    }
    
    if (assess) {
      setAssessment(assess)
    } else {
      setAssessment({
        entity_id: id,
        website_design_satisfied: true,
        client_attraction_satisfied: true,
        has_accounting_software: true,
        accounting_software_platform: 'QuickBooks Online',
        infrastructure_security_concerned: false,
        is_hipaa_compliant: 'yes',
        is_pci_compliant: 'yes',
        is_finra_compliant: 'yes',
        is_soc2_compliant: 'yes',
        is_nist_compliant: 'yes',
        is_gdpr_compliant: 'yes',
        has_international_workers: false,
        manual_data_hours_weekly: 0
      })
    }
  }

  const handleSelectChange = async (id: string) => {
    setSelectedId(id)
    if (id) {
      setLoading(true)
      await fetchProfileData(id)
      setLoading(false)
    } else {
      setTelemetry(null)
      setAssessment(null)
    }
  }

  const toggleBenefitArray = (benefitId: string) => {
    if (!telemetry) return
    const currentList = Array.isArray(telemetry.benefits_offered) ? telemetry.benefits_offered : []
    const updated = currentList.includes(benefitId)
      ? currentList.filter(b => b !== benefitId)
      : [...currentList, benefitId]
    setTelemetry({ ...telemetry, benefits_offered: updated, hr_benefits_active: updated.length > 0 })
  }

  // Enforce XX-XXXXXXX format strictly on blur and revert if invalid
  const handleEinBlur = () => {
    if (!telemetry) return
    const currentEin = (telemetry.ein_number || '').trim()
    if (!currentEin || currentEin === 'Startup - Need EIN') return

    const einRegex = /^\d{2}-\d{7}$/
    if (!einRegex.test(currentEin)) {
      alert('EIN Validation Error: Format must be exactly XX-XXXXXXX (2 digits, hyphen, 7 digits). Reverting to original value.')
      triggerToast('error', 'EIN Format Error: Must be exactly XX-XXXXXXX. Reverted.')
      setTelemetry({ ...telemetry, ein_number: originalEin })
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!telemetry || !assessment) return

    // Strict EIN check prior to database commit
    if (telemetry.ein_number && telemetry.ein_number !== 'Startup - Need EIN') {
      const einRegex = /^\d{2}-\d{7}$/
      if (!einRegex.test(telemetry.ein_number.trim())) {
        alert('EIN Validation Error: Format must be exactly XX-XXXXXXX (2 digits, hyphen, 7 digits). Reverting to original value.')
        triggerToast('error', 'EIN Format Error: Must be exactly XX-XXXXXXX. Reverted.')
        setTelemetry({ ...telemetry, ein_number: originalEin })
        return
      }
    }

    setSaving(true)

    // Strictly separate DB columns from transient UI state variables
    const { 
      id: entityUuid, 
      parent_entity_id, 
      created_at, 
      updated_at, 
      node_id,
      hq_address_line1,
      hq_zip,

      // UI Transient Keys — Strip ONLY UI aliases that map to other DB columns
      email_workspace_suite,
      mdm_provider,
      antivirus_status,
      backup_frequency,
      payroll_provider,
      has_bylaws,
      has_physical_hq,
      is_virtual_hq_candidate,

      ...rawTelemetryPayload 
    } = telemetry as any

    // Map UI selections directly to verified physical columns
    const cleanTelemetryPayload = {
      ...rawTelemetryPayload,
      employee_count_w2_ft: telemetry.employee_count_w2_ft ?? 1,
      employee_count_w2_pt: telemetry.employee_count_w2_pt ?? 0,
      contractor_count_1099: telemetry.contractor_count_1099 ?? 0,
      benefits_offered: Array.isArray(telemetry.benefits_offered) ? telemetry.benefits_offered : [],
      crm_system: telemetry.crm_system || 'HUBSPOT',
      collaboration_tool: telemetry.collaboration_tool || 'SLACK',
      automation_status: telemetry.automation_status || 'MANUAL',
      fiscal_year_end_month: telemetry.fiscal_year_end_month || 'December',
      hq_address_line_1: telemetry.hq_address_line_1 || hq_address_line1 || null,
      hq_city: telemetry.hq_city || null,
      hq_state: telemetry.hq_state || null,
      hq_postal_code: telemetry.hq_postal_code || hq_zip || null,
      it_groupware_platform: email_workspace_suite || telemetry.it_groupware_platform || null,
      it_mdm_vendor: mdm_provider || telemetry.it_mdm_vendor || null,
      it_antivirus_status: antivirus_status || telemetry.it_antivirus_status || 'ACTIVE',
      it_backup_strategy: backup_frequency || telemetry.it_backup_strategy || null,
      hr_payroll_platform: payroll_provider || telemetry.hr_payroll_platform || 'GUSTO',
      bylaws_resolutions_active: has_bylaws === 'YES',
      hr_benefits_active: (Array.isArray(telemetry.benefits_offered) && telemetry.benefits_offered.length > 0) || (telemetry.hr_benefits_active ?? false),
      
      // Explicitly preserve all restored native DB columns
      is_seeking_funding: telemetry.is_seeking_funding ?? false,
      crunchbase_active: telemetry.crunchbase_active ?? false,
      sells_tangible_goods: telemetry.sells_tangible_goods ?? false,
      has_duns_number: telemetry.has_duns_number ?? false,
      duns_number: telemetry.duns_number || null,
      bbb_wedge_sentiment: telemetry.bbb_wedge_sentiment || 'SATISFIED',
      bbb_registered: telemetry.bbb_registered ?? false,
      has_managed_it: telemetry.has_managed_it || 'FALSE',
      it_antivirus_vendor: telemetry.it_antivirus_vendor || null,
      it_sso_vendor: telemetry.it_sso_vendor || null,
      it_sso_status: telemetry.it_sso_status || 'ACTIVE',
      it_encryption_enabled: telemetry.it_encryption_enabled ?? false,
      hr_all_staff_piia_signed: telemetry.hr_all_staff_piia_signed ?? false,
      ins_commercial_policy_active: telemetry.ins_commercial_policy_active ?? false,
      flow_disconnected_tool_count: telemetry.flow_disconnected_tool_count ?? 0,
      web_design_satisfaction: telemetry.web_design_satisfaction || 'SATISFIED',
      flow_unstructured_pdf_parsing_manual: telemetry.flow_unstructured_pdf_parsing_manual ?? false,
      web_yields_leads: telemetry.web_yields_leads ?? false,
      web_analytics_active: telemetry.web_analytics_active ?? false,
    }

    const { 
      id: assessmentUuid, 
      entity_id, 
      created_at: assessCreated, 
      updated_at: assessUpdated, 
      ...cleanAssessmentPayload 
    } = assessment as any

    const { error: entErr } = await supabase
      .from('crm_entities')
      .update(cleanTelemetryPayload)
      .eq('id', telemetry.id)

    const { error: assessErr } = await supabase
      .from('crm_it_assessments')
      .upsert(
        { entity_id: telemetry.id, ...cleanAssessmentPayload }, 
        { onConflict: 'entity_id' }
      )

    setSaving(false)

    if (entErr || assessErr) {
      const err = entErr || assessErr
      console.error('Supabase Write Rejected:', err)
      triggerToast('error', `Write Rejected: ${err?.message} (${err?.details || err?.hint || 'Check DB schema'})`)
    } else {
      triggerToast('success', `All system configurations committed securely.`)
      setOriginalEin(cleanTelemetryPayload.ein_number || 'Startup - Need EIN')
      setEditingSections({ sec01: false, sec02: false, sec03: false, sec04: false, sec05: false, sec06: false })
      await fetchInitialData(telemetry.id)
    }
  }

  const handleBannerToggle = async (id: string, activeState: boolean) => {
    const { error } = await supabase
      .from('crm_ecosystem_banners')
      .update({ is_active: activeState })
      .eq('id', id)

    if (!error) {
      setBanners(banners.map(b => b.id === id ? { ...b, is_active: activeState } : b))
      triggerToast('success', 'Global banner tracking parameters updated.')
    }
  }

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => setStatusMessage(null), 5000)
  }

  // Filter entities list across name, legal name, status, EIN, ID, and VK badge prefix
  const filteredNodes = nodes.filter((n) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const badge = `vk-${(n.id || '').slice(0, 8).toLowerCase()}`
    const shortBadge = `vk-${(n.id || '').slice(0, 6).toLowerCase()}`
    return (
      n.display_name?.toLowerCase().includes(q) ||
      n.legal_name?.toLowerCase().includes(q) ||
      n.status?.toLowerCase().includes(q) ||
      n.ein_number?.toLowerCase().includes(q) ||
      n.id?.toLowerCase().includes(q) ||
      badge.includes(q) ||
      shortBadge.includes(q)
    )
  })

  if (loading && nodes.length === 0) {
    return <div className="text-xs font-mono text-[#C5A880] animate-pulse uppercase tracking-wider">Synchronizing Node Registry...</div>
  }

  const currentNodeBadge = telemetry ? `VK-${telemetry.id.slice(0, 8).toUpperCase()}` : 'VK-NODE'

  return (
    <div className="space-y-6">
      
      {/* KPI Header Cards removed to eliminate duplication with parent layout */}

      {/* Master Filter Controller with Direct Gold Border (#C5A880) */}
      <div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-2 bg-zinc-950/80 rounded-xl shadow-[0_0_20px_rgba(197,168,128,0.15)]"
        style={{ borderColor: '#C5A880' }}
      >
        <div className="space-y-1 flex-1 max-w-md">
          <label className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest block font-bold">Active Entity Target</label>
          <select
            className="bg-black border border-zinc-800 text-[#C5A880] font-mono text-xs rounded-lg px-3 py-2 w-full focus:outline-none focus:border-[#C5A880] font-bold cursor-pointer transition-colors"
            value={selectedId}
            onChange={(e) => handleSelectChange(e.target.value)}
          >
            <option value="" className="text-[#C5A880] bg-black">-- SELECT CORPORATE MATRIX NODE --</option>
            {filteredNodes.map((n) => (
              <option key={n.id} value={n.id} className="text-[#C5A880] bg-black">
                [VK-{n.id.slice(0, 6).toUpperCase()}] {n.display_name} ({n.status})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          {/* Active Entity Search Box */}
          <div className="space-y-1 flex-1 max-w-xs">
            <label className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest block font-bold">Search Matrix Nodes</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, status, ID, EIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredNodes.length > 0) {
                    e.preventDefault()
                    handleSelectChange(filteredNodes[0].id)
                  }
                }}
                className="bg-black border border-zinc-800 text-[#C5A880] placeholder-zinc-600 font-mono text-xs rounded-lg pl-3 pr-8 py-2 w-full focus:outline-none focus:border-[#C5A880] font-bold transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#C5A880] hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {statusMessage && (
            <div className={`text-[10px] font-mono px-4 py-2 rounded-lg border uppercase tracking-wider font-bold ${
              statusMessage.type === 'success' 
                ? 'bg-[#00FF66]/10 border-[#00FF66] text-[#00FF66]' 
                : 'bg-yellow-950/30 border-yellow-500 text-yellow-400'
            }`}>
              {statusMessage.text}
            </div>
          )}
        </div>
      </div>

      {telemetry && assessment ? (
        <form onSubmit={handleUpdate} className="space-y-6 animate-fadeIn">
          {loading ? (
            <div className="text-xs font-mono text-zinc-300 animate-pulse uppercase py-12 text-center">Interlocking Profile Matrices...</div>
          ) : (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* 🏢 SECTION 01 */}
                <div 
                  className="border-2 bg-zinc-950/40 rounded-xl p-5 space-y-4 shadow-[0_0_15px_rgba(197,168,128,0.1)]"
                  style={{ borderColor: '#C5A880' }}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-200 uppercase">
                        Section 01 // Corporate Baseline &amp; Capital Vetting
                      </h3>
                      <button
                        type="button"
                        onClick={() => copyNodeIdToClipboard(currentNodeBadge)}
                        className="font-mono text-[10px] bg-[#C5A880]/15 border border-[#C5A880]/40 text-[#C5A880] px-2 py-0.5 rounded hover:bg-[#C5A880]/25 transition cursor-pointer font-bold"
                      >
                        {copiedNodeId ? '✓ COPIED' : `NODE ID: ${currentNodeBadge}`}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSectionEdit('sec01')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors border ${
                        editingSections.sec01
                          ? 'bg-[#C5A880]/20 border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880]/30'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-zinc-100'
                      }`}
                    >
                      {editingSections.sec01 ? '🔓 UNLOCKED' : '🔒 EDIT SECTION'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">DISPLAY NAME</label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-semibold disabled:opacity-70 disabled:cursor-not-allowed" 
                        value={telemetry.display_name || ''} 
                        onChange={e => setTelemetry({...telemetry, display_name: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">LEGAL CORPORATE NAME</label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-semibold disabled:opacity-70 disabled:cursor-not-allowed" 
                        value={telemetry.legal_name || ''} 
                        onChange={e => setTelemetry({...telemetry, legal_name: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">LEGAL STRUCTURE</label>
                      <select 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.legal_structure || 'STARTUP_NOT_FORMED'} 
                        onChange={e => setTelemetry({...telemetry, legal_structure: e.target.value})}
                      >
                        <option value="STARTUP_NOT_FORMED" className="bg-black text-zinc-200">Startup / Not Yet Formed</option>
                        <option value="DELAWARE_C_CORP" className="bg-black text-zinc-200">Delaware C-Corporation</option>
                        <option value="LLC" className="bg-black text-zinc-200">LLC</option>
                        <option value="C_CORP" className="bg-black text-zinc-200">C-Corporation (Other State)</option>
                        <option value="S_CORP" className="bg-black text-zinc-200">S-Corporation</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">REGISTRATION STATE</label>
                      <select 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.registration_state || 'UNDECIDED'} 
                        onChange={e => setTelemetry({...telemetry, registration_state: e.target.value})}
                      >
                        <option value="UNDECIDED" className="bg-black text-zinc-200">Undecided / N/A</option>
                        {US_STATES.map(st => (
                          <option key={st} value={st} className="bg-black text-zinc-200">{st}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">FORMATION YEAR</label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed" 
                        value={telemetry.formation_year || ''} 
                        onChange={e => setTelemetry({...telemetry, formation_year: safeParseInt(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">
                        EIN TAX ID <span className="text-zinc-500">(XX-XXXXXXX)</span>
                      </label>
                      <input 
                        type="text" 
                        maxLength={10}
                        disabled={!editingSections.sec01}
                        placeholder="12-3456789 or Startup - Need EIN"
                        onBlur={handleEinBlur}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed" 
                        value={telemetry.ein_number || 'Startup - Need EIN'} 
                        onChange={e => setTelemetry({...telemetry, ein_number: formatEIN(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">INDUSTRY SECTOR</label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-semibold disabled:opacity-70 disabled:cursor-not-allowed" 
                        value={telemetry.industry || ''} 
                        onChange={e => setTelemetry({...telemetry, industry: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">NODE STATUS</label>
                      <select 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.status || 'ACTIVE'} 
                        onChange={e => setTelemetry({...telemetry, status: e.target.value})}
                      >
                        <option value="ACTIVE" className="bg-black text-zinc-200">ACTIVE</option>
                        <option value="PENDING" className="bg-black text-zinc-200">PENDING</option>
                        <option value="INACTIVE" className="bg-black text-zinc-200">INACTIVE</option>
                        <option value="SUSPENDED" className="bg-black text-zinc-200">SUSPENDED</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">FISCAL YEAR-END MONTH</label>
                      <select
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                        value={telemetry.fiscal_year_end_month || 'December'}
                        onChange={e => setTelemetry({...telemetry, fiscal_year_end_month: e.target.value})}
                      >
                        {MONTHS.map(m => (
                          <option key={m} value={m} className="bg-black text-zinc-200">{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">BYLAWS &amp; GOVERNANCE STATUS</label>
                      <select 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.has_bylaws || (telemetry.bylaws_resolutions_active ? 'YES' : 'NO')} 
                        onChange={e => setTelemetry({...telemetry, has_bylaws: e.target.value})}
                      >
                        <option value="YES" className="bg-black text-zinc-200">Yes, 100% compliant</option>
                        <option value="NO" className="bg-black text-zinc-200">No, we need to draft them</option>
                        <option value="IN_PROGRESS" className="bg-black text-zinc-200">Currently working on it</option>
                      </select>
                    </div>
                  </div>

                  {/* Principal HQ Telemetry & Address */}
                  <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs text-zinc-200 cursor-pointer">
                        <input 
                          type="checkbox" 
                          disabled={!editingSections.sec01} 
                          className="accent-[#C5A880] h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-70" 
                          checked={telemetry.has_physical_hq !== false} 
                          onChange={e => setTelemetry({
                            ...telemetry, 
                            has_physical_hq: e.target.checked,
                            is_virtual_hq_candidate: !e.target.checked
                          })} 
                        />
                        <span className="font-bold text-zinc-200">Maintains Physical Headquarters Facility</span>
                      </label>

                      {telemetry.is_virtual_hq_candidate && (
                        <span className="text-[10px] font-mono bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/40 px-2 py-0.5 rounded font-bold">
                          ⚡ VIRTUAL HQ CANDIDATE FLAGGED
                        </span>
                      )}
                    </div>

                    {telemetry.has_physical_hq !== false ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/40 p-3 rounded-lg border border-zinc-800/80">
                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-[9px] font-mono text-zinc-300 font-semibold block">STREET ADDRESS</label>
                          <input 
                            type="text" 
                            disabled={!editingSections.sec01}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 font-semibold disabled:opacity-70" 
                            value={telemetry.hq_address_line_1 || telemetry.hq_address_line1 || ''} 
                            onChange={e => setTelemetry({
                              ...telemetry, 
                              hq_address_line_1: e.target.value,
                              hq_address_line1: e.target.value
                            })} 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-300 font-semibold block">CITY</label>
                          <input 
                            type="text" 
                            disabled={!editingSections.sec01}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 font-semibold disabled:opacity-70" 
                            value={telemetry.hq_city || ''} 
                            onChange={e => setTelemetry({...telemetry, hq_city: e.target.value})} 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-300 font-semibold block">STATE</label>
                          <select 
                            disabled={!editingSections.sec01}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 font-semibold disabled:opacity-70 cursor-pointer" 
                            value={telemetry.hq_state || ''} 
                            onChange={e => setTelemetry({...telemetry, hq_state: e.target.value})} 
                          >
                            <option value="" className="bg-black text-zinc-200">Select State</option>
                            {US_STATES.map(st => <option key={st} value={st} className="bg-black text-zinc-200">{st}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-300 font-semibold block">ZIP CODE</label>
                          <input 
                            type="text" 
                            disabled={!editingSections.sec01}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 font-semibold disabled:opacity-70" 
                            value={telemetry.hq_postal_code || telemetry.hq_zip || ''} 
                            onChange={e => setTelemetry({
                              ...telemetry, 
                              hq_postal_code: e.target.value,
                              hq_zip: e.target.value
                            })} 
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-lg text-[#C5A880] text-xs font-mono font-bold">
                        ⚡ Physical HQ skipped. Entity flagged for V&amp;K Virtual Office &amp; Registered Agent Forwarding provisioning.
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-zinc-800/80 pt-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">FUNDING STAGE</label>
                      <select 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-bold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.funding_stage || ''} 
                        onChange={e => setTelemetry({...telemetry, funding_stage: e.target.value})}
                      >
                        <option value="BOOTSTRAPPED" className="bg-black text-zinc-200">BOOTSTRAPPED</option>
                        <option value="PRE_SEED" className="bg-black text-zinc-200">PRE_SEED</option>
                        <option value="SEED" className="bg-black text-zinc-200">SEED</option>
                        <option value="SERIES_A" className="bg-black text-zinc-200">SERIES_A</option>
                        <option value="SELF_FUNDED" className="bg-black text-zinc-200">SELF_FUNDED</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">TARGET CAPITAL ($)</label>
                      <input 
                        type="number" 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-bold disabled:opacity-70 disabled:cursor-not-allowed" 
                        value={telemetry.funding_target_amount || 0} 
                        onChange={e => setTelemetry({...telemetry, funding_target_amount: safeParseInt(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">V&amp;K AUDIT STATUS</label>
                      <select 
                        disabled={!editingSections.sec01}
                        className={`w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono font-extrabold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer ${
                          telemetry.vk_audit_status === 'PASSED' 
                            ? 'text-[#00FF66]' 
                            : telemetry.vk_audit_status === 'FAILED'
                            ? 'text-yellow-400'
                            : 'text-zinc-200'
                        }`} 
                        value={telemetry.vk_audit_status || ''} 
                        onChange={e => setTelemetry({...telemetry, vk_audit_status: e.target.value})}
                      >
                        <option value="PENDING" className="bg-black text-zinc-200 font-bold">PENDING</option>
                        <option value="PASSED" className="bg-black text-[#00FF66] font-extrabold">PASSED</option>
                        <option value="FAILED" className="bg-black text-yellow-400 font-extrabold">FAILED</option>
                      </select>
                    </div>
                  </div>

                  {/* Restored Native Checkboxes Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/80">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-xs text-zinc-200 cursor-pointer">
                        <input type="checkbox" disabled={!editingSections.sec01} className="accent-[#C5A880] h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-70" checked={telemetry.is_seeking_funding ?? false} onChange={e => setTelemetry({...telemetry, is_seeking_funding: e.target.checked})} />
                        <span className="font-bold text-zinc-200">Seeking Funding</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs text-zinc-200 cursor-pointer">
                        <input type="checkbox" disabled={!editingSections.sec01} className="accent-[#C5A880] h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-70" checked={telemetry.crunchbase_active ?? false} onChange={e => setTelemetry({...telemetry, crunchbase_active: e.target.checked})} />
                        <span className="font-bold text-zinc-200">Crunchbase Profile Verified</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs text-zinc-200 cursor-pointer">
                        <input type="checkbox" disabled={!editingSections.sec01} className="accent-[#C5A880] h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-70" checked={telemetry.bbb_registered ?? false} onChange={e => setTelemetry({...telemetry, bbb_registered: e.target.checked})} />
                        <span className="font-bold text-zinc-200">BBB Registered Entity</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-xs text-zinc-200 cursor-pointer">
                        <input type="checkbox" disabled={!editingSections.sec01} className="accent-[#C5A880] h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-70" checked={telemetry.sells_tangible_goods ?? false} onChange={e => setTelemetry({...telemetry, sells_tangible_goods: e.target.checked})} />
                        <span className="font-bold text-zinc-200">Sells Tangible Goods</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs text-zinc-200 cursor-pointer">
                        <input type="checkbox" disabled={!editingSections.sec01} className="accent-[#C5A880] h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-70" checked={telemetry.has_duns_number ?? false} onChange={e => setTelemetry({...telemetry, has_duns_number: e.target.checked})} />
                        <span className="font-bold text-zinc-200">Has DUNS Tracker</span>
                      </label>
                    </div>
                  </div>

                  {/* Restored DUNS & BBB Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">DUNS NUMBER ID</label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-70 disabled:cursor-not-allowed" 
                        value={telemetry.duns_number || ''} 
                        onChange={e => setTelemetry({...telemetry, duns_number: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">BBB WEDGE SENTIMENT</label>
                      <select 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.bbb_wedge_sentiment || 'SATISFIED'} 
                        onChange={e => setTelemetry({...telemetry, bbb_wedge_sentiment: e.target.value})}
                      >
                        <option value="SATISFIED" className="bg-black text-zinc-200">SATISFIED</option>
                        <option value="UNSATISFIED" className="bg-black text-zinc-200">UNSATISFIED</option>
                        <option value="NEUTRAL" className="bg-black text-zinc-200">NEUTRAL</option>
                        <option value="UNRATED" className="bg-black text-zinc-200">UNRATED</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 🛡️ SECTION 02 */}
                <div 
                  className="border-2 bg-zinc-950/40 rounded-xl p-5 space-y-4 shadow-[0_0_15px_rgba(197,168,128,0.1)]"
                  style={{ borderColor: '#C5A880' }}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-200 uppercase">
                      Section 02 // Threat Vector &amp; Security Infrastructure
                    </h3>
                    <button
                      type="button"
                      onClick={() => toggleSectionEdit('sec02')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors border ${
                        editingSections.sec02
                          ? 'bg-[#C5A880]/20 border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880]/30'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-zinc-100'
                      }`}
                    >
                      {editingSections.sec02 ? '🔓 UNLOCKED' : '🔒 EDIT SECTION'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">EMAIL &amp; WORKSPACE SUITE</label>
                      <select 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.email_workspace_suite || telemetry.it_groupware_platform || 'GOOGLE_WORKSPACE'} 
                        onChange={e => setTelemetry({...telemetry, email_workspace_suite: e.target.value, it_groupware_platform: e.target.value})}
                      >
                        <option value="GOOGLE_WORKSPACE" className="bg-black text-zinc-200">Google Workspace</option>
                        <option value="MICROSOFT_365" className="bg-black text-zinc-200">Microsoft 365</option>
                        <option value="ZOHO" className="bg-black text-zinc-200">Zoho Workplace</option>
                        <option value="PROTON" className="bg-black text-zinc-200">Proton Mail / Encrypted</option>
                        <option value="NEED_WORKSPACE" className="bg-black text-zinc-200">Need Provisioned (V&amp;K Setup)</option>
                        <option value="NONE" className="bg-black text-zinc-200">Other / Basic Webmail</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">MANAGED IT VECTOR (MSP)</label>
                      <select 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.has_managed_it || 'FALSE'} 
                        onChange={e => setTelemetry({...telemetry, has_managed_it: e.target.value})}
                      >
                        <option value="TRUE" className="bg-black text-zinc-200">TRUE (MANAGED MSP)</option>
                        <option value="FALSE" className="bg-black text-zinc-200">FALSE (INTERNAL / NONE)</option>
                        <option value="HYBRID" className="bg-black text-zinc-200">HYBRID</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">MOBILE DEVICE MANAGEMENT (MDM)</label>
                      <select 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.mdm_provider || telemetry.it_mdm_vendor || 'NONE'} 
                        onChange={e => setTelemetry({...telemetry, mdm_provider: e.target.value, it_mdm_vendor: e.target.value})}
                      >
                        <option value="JAMF" className="bg-black text-zinc-200">Jamf Pro / Jamf Now</option>
                        <option value="KANDJI" className="bg-black text-zinc-200">Kandji</option>
                        <option value="INTUNE" className="bg-black text-zinc-200">Microsoft Intune</option>
                        <option value="RIPPLING_MDM" className="bg-black text-zinc-200">Rippling IT / MDM</option>
                        <option value="NONE" className="bg-black text-zinc-200">No MDM / Manual Fleet</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">MDM ENFORCEMENT LOG</label>
                      <select 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.it_mdm_status || 'DEPLOYED'} 
                        onChange={e => setTelemetry({...telemetry, it_mdm_status: e.target.value})}
                      >
                        <option value="DEPLOYED" className="bg-black text-zinc-200">DEPLOYED</option>
                        <option value="PARTIAL" className="bg-black text-zinc-200">PARTIAL</option>
                        <option value="NOT_ENFORCED" className="bg-black text-zinc-200">NOT_ENFORCED</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">ENDPOINT PROTECTION (AV/EDR STATUS)</label>
                      <select 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.antivirus_status || telemetry.it_antivirus_status || 'ACTIVE'} 
                        onChange={e => setTelemetry({...telemetry, antivirus_status: e.target.value, it_antivirus_status: e.target.value})}
                      >
                        <option value="ACTIVE" className="bg-black text-zinc-200">ACTIVE // MANAGED EDR</option>
                        <option value="DEGRADED" className="bg-black text-zinc-200">DEGRADED // BASIC AV</option>
                        <option value="INACTIVE" className="bg-black text-zinc-200">INACTIVE // OS DEFENSE ONLY</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">ANTIVIRUS AGENT VENDOR</label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 disabled:opacity-70 disabled:cursor-not-allowed" 
                        value={telemetry.it_antivirus_vendor || ''} 
                        onChange={e => setTelemetry({...telemetry, it_antivirus_vendor: e.target.value})} 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">BACKUP &amp; DISASTER RECOVERY</label>
                      <select 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.backup_frequency || telemetry.it_backup_strategy || 'DAILY_AUTOMATED'} 
                        onChange={e => setTelemetry({...telemetry, backup_frequency: e.target.value, it_backup_strategy: e.target.value})}
                      >
                        <option value="DAILY_AUTOMATED" className="bg-black text-zinc-200">Daily Immutable Cloud Backups</option>
                        <option value="WEEKLY" className="bg-black text-zinc-200">Weekly / Manual Backups</option>
                        <option value="NONE" className="bg-black text-zinc-200">No Formal Backup System</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">SSO GATEWAY VENDOR</label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 disabled:opacity-70 disabled:cursor-not-allowed" 
                        value={telemetry.it_sso_vendor || ''} 
                        onChange={e => setTelemetry({...telemetry, it_sso_vendor: e.target.value})} 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">SSO GATEWAY STATUS</label>
                      <select 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.it_sso_status || 'ACTIVE'} 
                        onChange={e => setTelemetry({...telemetry, it_sso_status: e.target.value})}
                      >
                        <option value="ACTIVE" className="bg-black text-zinc-200">ACTIVE</option>
                        <option value="PARTIAL" className="bg-black text-zinc-200">PARTIAL</option>
                        <option value="INACTIVE" className="bg-black text-zinc-200">INACTIVE</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80">
                    <label className="flex items-center space-x-2 text-xs text-zinc-200 cursor-pointer">
                      <input type="checkbox" disabled={!editingSections.sec02} className="accent-[#C5A880] h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-70" checked={telemetry.it_encryption_enabled ?? false} onChange={e => setTelemetry({...telemetry, it_encryption_enabled: e.target.checked})} />
                      <span className="font-bold text-zinc-200">Local Device Storage Encryption Enforced</span>
                    </label>
                  </div>
                </div>

                {/* 👥 SECTION 03 */}
                <div 
                  className="border-2 bg-zinc-950/40 rounded-xl p-5 space-y-4 shadow-[0_0_15px_rgba(197,168,128,0.1)]"
                  style={{ borderColor: '#C5A880' }}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-200 uppercase">
                      Section 03 // Workforce Administration &amp; Benefits
                    </h3>
                    <button
                      type="button"
                      onClick={() => toggleSectionEdit('sec03')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors border ${
                        editingSections.sec03
                          ? 'bg-[#C5A880]/20 border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880]/30'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-zinc-100'
                      }`}
                    >
                      {editingSections.sec03 ? '🔓 UNLOCKED' : '🔒 EDIT SECTION'}
                    </button>
                  </div>

                  {/* Unbundled Workforce Breakdown */}
                  <div className="grid grid-cols-3 gap-3 bg-black/40 p-3 rounded-lg border border-zinc-800/80">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-300 font-semibold block">W2 FULL-TIME</label>
                      <input 
                        type="number" 
                        min={0}
                        disabled={!editingSections.sec03}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 font-bold font-mono disabled:opacity-70" 
                        value={telemetry.employee_count_w2_ft ?? 1} 
                        onChange={e => setTelemetry({...telemetry, employee_count_w2_ft: safeParseInt(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-300 font-semibold block">W2 PART-TIME</label>
                      <input 
                        type="number" 
                        min={0}
                        disabled={!editingSections.sec03}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 font-bold font-mono disabled:opacity-70" 
                        value={telemetry.employee_count_w2_pt ?? 0} 
                        onChange={e => setTelemetry({...telemetry, employee_count_w2_pt: safeParseInt(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-300 font-semibold block">1099 CONTRACTORS</label>
                      <input 
                        type="number" 
                        min={0}
                        disabled={!editingSections.sec03}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 font-bold font-mono disabled:opacity-70" 
                        value={telemetry.contractor_count_1099 ?? 0} 
                        onChange={e => setTelemetry({...telemetry, contractor_count_1099: safeParseInt(e.target.value)})} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">PAYROLL PROCESSING SYSTEM</label>
                      <select 
                        disabled={!editingSections.sec03}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.payroll_provider || telemetry.hr_payroll_platform || 'GUSTO'} 
                        onChange={e => setTelemetry({...telemetry, payroll_provider: e.target.value, hr_payroll_platform: e.target.value})} 
                      >
                        <option value="GUSTO" className="bg-black text-zinc-200">Gusto</option>
                        <option value="RIPPLING" className="bg-black text-zinc-200">Rippling</option>
                        <option value="ADP" className="bg-black text-zinc-200">ADP</option>
                        <option value="PAYCHEX" className="bg-black text-zinc-200">Paychex</option>
                        <option value="QUICKBOOKS_PAYROLL" className="bg-black text-zinc-200">QuickBooks Payroll</option>
                        <option value="NONE" className="bg-black text-zinc-200">Manual / No Payroll Yet</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">MULTISTATE TAX EXPOSURE STATUS</label>
                      <select 
                        disabled={!editingSections.sec03}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-zinc-200" 
                        value={telemetry.hr_multistate_tax_registered || 'CLEAR'} 
                        onChange={e => setTelemetry({...telemetry, hr_multistate_tax_registered: e.target.value})}
                      >
                        <option value="CLEAR" className="bg-black text-zinc-200">CLEAR_NO_NEXUS</option>
                        <option value="EXPOSED" className="bg-black text-yellow-400 font-bold">NEXUS_EXPOSED_RISK</option>
                      </select>
                    </div>
                  </div>

                  {/* Group Benefits Infrastructure */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <label className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest block font-bold">Active Group Benefits Infrastructure</label>
                    <div className="grid grid-cols-2 gap-2">
                      {BENEFIT_TOGGLES.map(b => {
                        const activeList = Array.isArray(telemetry.benefits_offered) ? telemetry.benefits_offered : []
                        const isChecked = activeList.includes(b.id)
                        return (
                          <button
                            key={b.id}
                            type="button"
                            disabled={!editingSections.sec03}
                            onClick={() => toggleBenefitArray(b.id)}
                            className={`px-3 py-2 rounded-lg border text-left text-xs font-mono font-semibold flex items-center justify-between transition ${
                              isChecked
                                ? 'bg-[#00FF66]/15 border-[#00FF66] text-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.25)] font-bold'
                                : 'bg-black border-zinc-800 text-zinc-200 hover:border-zinc-700'
                            }`}
                          >
                            <span>{b.label}</span>
                            <span className="text-[10px] font-extrabold">{isChecked ? '✓ ACTIVE' : '○ OFF'}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Restored Workforce & Liability Checkboxes */}
                  <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                    <label className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest block font-bold">Workforce &amp; Liability Compliance Checkpoints</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-xs text-zinc-200 cursor-pointer">
                        <input type="checkbox" disabled={!editingSections.sec03} className="accent-[#C5A880] h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-70" checked={(Array.isArray(telemetry.benefits_offered) && telemetry.benefits_offered.length > 0) || (telemetry.hr_benefits_active ?? false)} onChange={e => setTelemetry({...telemetry, hr_benefits_active: e.target.checked})} />
                        <span className="font-bold text-zinc-200">Active Group Benefits Network Infrastructure</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs text-zinc-200 cursor-pointer">
                        <input type="checkbox" disabled={!editingSections.sec03} className="accent-[#C5A880] h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-70" checked={telemetry.hr_all_staff_piia_signed ?? false} onChange={e => setTelemetry({...telemetry, hr_all_staff_piia_signed: e.target.checked})} />
                        <span className="font-bold text-zinc-200">Proprietary Information &amp; Inventions Agreements Signed (PIIA)</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs text-zinc-200 cursor-pointer">
                        <input type="checkbox" disabled={!editingSections.sec03} className="accent-[#C5A880] h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-70" checked={telemetry.ins_commercial_policy_active ?? false} onChange={e => setTelemetry({...telemetry, ins_commercial_policy_active: e.target.checked})} />
                        <span className="font-bold text-zinc-200">Active General Commercial Liability Protection Policy</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 📊 SECTION 04 */}
                <div 
                  className="border-2 bg-zinc-950/40 rounded-xl p-5 space-y-4 shadow-[0_0_15px_rgba(197,168,128,0.1)]"
                  style={{ borderColor: '#C5A880' }}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-200 uppercase">
                      Section 04 // Flow, CRM &amp; Operations Automation
                    </h3>
                    <button
                      type="button"
                      onClick={() => toggleSectionEdit('sec04')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors border ${
                        editingSections.sec04
                          ? 'bg-[#C5A880]/20 border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880]/30'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-zinc-100'
                      }`}
                    >
                      {editingSections.sec04 ? '🔓 UNLOCKED' : '🔒 EDIT SECTION'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">PRIMARY CRM SYSTEM</label>
                      <select 
                        disabled={!editingSections.sec04}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.crm_system || 'HUBSPOT'} 
                        onChange={e => setTelemetry({...telemetry, crm_system: e.target.value})}
                      >
                        <option value="HUBSPOT" className="bg-black text-zinc-200">HubSpot</option>
                        <option value="SALESFORCE" className="bg-black text-zinc-200">Salesforce</option>
                        <option value="NOTION" className="bg-black text-zinc-200">Notion / Airtable</option>
                        <option value="OTHER" className="bg-black text-zinc-200">Other CRM</option>
                        <option value="NONE" className="bg-black text-zinc-200">No CRM / Spreadsheets Only</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">TEAM COLLABORATION</label>
                      <select 
                        disabled={!editingSections.sec04}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.collaboration_tool || 'SLACK'} 
                        onChange={e => setTelemetry({...telemetry, collaboration_tool: e.target.value})}
                      >
                        <option value="SLACK" className="bg-black text-zinc-200">Slack</option>
                        <option value="TEAMS" className="bg-black text-zinc-200">Microsoft Teams</option>
                        <option value="DISCORD" className="bg-black text-zinc-200">Discord</option>
                        <option value="EMAIL" className="bg-black text-zinc-200">Email / SMS Only</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">AUTOMATION LEVEL</label>
                      <select 
                        disabled={!editingSections.sec04}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.automation_status || 'MANUAL'} 
                        onChange={e => setTelemetry({...telemetry, automation_status: e.target.value})}
                      >
                        <option value="MANUAL" className="bg-black text-zinc-200">100% Manual Processes</option>
                        <option value="ZAPIER" className="bg-black text-zinc-200">Basic Zapier / Make Zaps</option>
                        <option value="CUSTOM_AI" className="bg-black text-zinc-200">Custom AI &amp; API Workflows</option>
                      </select>
                    </div>
                  </div>

                  {/* Restored Utility Counter & Layout Satisfaction */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">DISCONNECTED UTILITY COUNTER</label>
                      <input 
                        type="number" 
                        max={2147483647}
                        disabled={!editingSections.sec04}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-bold disabled:opacity-70 disabled:cursor-not-allowed" 
                        value={telemetry.flow_disconnected_tool_count || 0} 
                        onChange={e => setTelemetry({...telemetry, flow_disconnected_tool_count: safeParseInt(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-300 font-semibold block">WEB LAYOUT SATISFACTION</label>
                      <select 
                        disabled={!editingSections.sec04}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-semibold disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" 
                        value={telemetry.web_design_satisfaction || 'SATISFIED'} 
                        onChange={e => setTelemetry({...telemetry, web_design_satisfaction: e.target.value})}
                      >
                        <option value="SATISFIED" className="bg-black text-zinc-200">OPTIMIZED_CONVERSION</option>
                        <option value="UNSATISFIED" className="bg-black text-zinc-200">CONVERSION_FRICTION</option>
                      </select>
                    </div>
                  </div>

                  {/* Restored Automation & Analytics Checkboxes */}
                  <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                    <label className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest block font-bold">Flow &amp; Web Funnel Checkpoints</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-xs text-zinc-200 cursor-pointer">
                        <input type="checkbox" disabled={!editingSections.sec04} className="accent-[#C5A880] h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-70" checked={telemetry.flow_unstructured_pdf_parsing_manual ?? false} onChange={e => setTelemetry({...telemetry, flow_unstructured_pdf_parsing_manual: e.target.checked})} />
                        <span className="font-bold text-zinc-200">Manual Processing of Unstructured Document Formats Active</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs text-zinc-200 cursor-pointer">
                        <input type="checkbox" disabled={!editingSections.sec04} className="accent-[#C5A880] h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-70" checked={telemetry.web_yields_leads ?? false} onChange={e => setTelemetry({...telemetry, web_yields_leads: e.target.checked})} />
                        <span className="font-bold text-zinc-200">Inbound Capture Funnels Harvest Leads Effectively</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs text-zinc-200 cursor-pointer">
                        <input type="checkbox" disabled={!editingSections.sec04} className="accent-[#C5A880] h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-70" checked={telemetry.web_analytics_active ?? false} onChange={e => setTelemetry({...telemetry, web_analytics_active: e.target.checked})} />
                        <span className="font-bold text-zinc-200">Traffic Performance Analytics Trackers Active</span>
                      </label>
                    </div>
                  </div>
                </div>

              </div>

              {/* 📈 SECTION 05 */}
              <div 
                className="border-2 bg-zinc-950/40 rounded-xl p-5 space-y-4 block w-full shadow-[0_0_15px_rgba(197,168,128,0.1)]"
                style={{ borderColor: '#C5A880' }}
              >
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <div>
                    <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-200 uppercase">
                      Section 05 // Regulatory Compliance Matrix &amp; Framework Safeguards
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSectionEdit('sec05')}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors border ${
                      editingSections.sec05
                        ? 'bg-[#C5A880]/20 border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880]/30'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-zinc-100'
                    }`}
                  >
                    {editingSections.sec05 ? '🔓 UNLOCKED' : '🔒 EDIT SECTION'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-zinc-800/80 pb-4">
                  {[
                    { label: 'HIPAA Regulatory Protocol', key: 'is_hipaa_compliant' },
                    { label: 'PCI Transaction Safeguard', key: 'is_pci_compliant' },
                    { label: 'FINRA Brokerage Retention', key: 'is_finra_compliant' },
                    { label: 'SOC2 Trust Framework', key: 'is_soc2_compliant' },
                    { label: 'NIST Military Standard', key: 'is_nist_compliant' },
                    { label: 'GDPR Privacy Protection', key: 'is_gdpr_compliant' },
                  ].map((f) => {
                    const currentValue = (assessment as any)[f.key]

                    return (
                      <div key={f.key} className="flex items-center justify-between p-3 bg-black rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                        <span className="text-[11px] font-mono font-bold tracking-wide text-zinc-200 uppercase">
                          {f.label}
                        </span>
                        <select
                          disabled={!editingSections.sec05}
                          className={`bg-zinc-950 border-2 px-3 py-1.5 rounded-lg text-xs font-mono font-black tracking-wider text-center focus:outline-none min-w-[125px] transition-all disabled:opacity-90 disabled:cursor-not-allowed cursor-pointer ${
                            currentValue === 'yes'
                              ? 'border-[#00FF66] text-[#00FF66] bg-[#00FF66]/15 shadow-[0_0_12px_rgba(0,255,102,0.3)]' 
                              : currentValue === 'no'
                              ? 'border-yellow-400 text-yellow-400 bg-yellow-950/30 font-bold'
                              : 'border-pink-500 text-pink-400 bg-pink-950/30 font-bold'
                          }`}
                          value={currentValue || 'exempt'}
                          onChange={(e) => setAssessment({ ...assessment, [f.key]: e.target.value })}
                        >
                          <option value="yes" className="bg-black text-[#00FF66] font-black">PASS</option>
                          <option value="no" className="bg-black text-yellow-400 font-extrabold">FAIL</option>
                          <option value="exempt" className="bg-black text-pink-400 font-extrabold">EXEMPT</option>
                        </select>
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-300 uppercase tracking-wider block font-semibold">Accounting Ledger Platform</label>
                    <input 
                      type="text" 
                      disabled={!editingSections.sec05}
                      className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono font-semibold focus:outline-none focus:border-[#C5A880] disabled:opacity-70 disabled:cursor-not-allowed" 
                      value={assessment.accounting_software_platform || ''} 
                      onChange={e => setAssessment({...assessment, accounting_software_platform: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-300 uppercase tracking-wider block font-semibold">Weekly Manual Friction (Hours)</label>
                    <input 
                      type="number" 
                      max={2147483647}
                      disabled={!editingSections.sec05}
                      className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono font-bold focus:outline-none focus:border-[#C5A880] disabled:opacity-70 disabled:cursor-not-allowed" 
                      value={assessment.manual_data_hours_weekly || 0} 
                      onChange={e => setAssessment({...assessment, manual_data_hours_weekly: safeParseInt(e.target.value)})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-300 uppercase tracking-wider block font-semibold">VK Shield Security Sensitivity</label>
                    <select 
                      disabled={!editingSections.sec05}
                      className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 font-bold focus:outline-none focus:border-[#C5A880] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                      value={assessment.infrastructure_security_concerned ? 'true' : 'false'}
                      onChange={e => setAssessment({...assessment, infrastructure_security_concerned: e.target.value === 'true'})}
                    >
                      <option value="false" className="bg-black text-zinc-200">STABLE // STANDARD PROTOCOL</option>
                      <option value="true" className="bg-black text-yellow-400 font-bold">EXPOSED // HIGH CRITICAL AUDIT</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 🔄 SECTION 06 */}
              <div 
                className="border-2 bg-zinc-950/40 rounded-xl p-5 space-y-4 shadow-[0_0_15px_rgba(197,168,128,0.1)]"
                style={{ borderColor: '#C5A880' }}
              >
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <div>
                    <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-200 uppercase">
                      Section 06 // Dynamic Platform Banner &amp; Ad Routing Registry
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSectionEdit('sec06')}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors border ${
                      editingSections.sec06
                        ? 'bg-[#C5A880]/20 border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880]/30'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-zinc-100'
                    }`}
                  >
                    {editingSections.sec06 ? '🔓 UNLOCKED' : '🔒 EDIT SECTION'}
                  </button>
                </div>

                <div className="space-y-3">
                  {banners.length === 0 ? (
                    <div className="text-center py-6 text-xs font-mono text-zinc-400 uppercase border border-dashed border-zinc-800 rounded-xl bg-black/40 font-bold">
                      Zero promotion tracks initialized in crm_ecosystem_banners registry ledger.
                    </div>
                  ) : (
                    banners.map((b) => (
                      <div key={b.id} className="p-4 border border-zinc-800 bg-black rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] text-purple-400 font-bold bg-purple-950/10 border border-purple-900/20 px-2 py-0.5 rounded">
                              {b.banner_key}
                            </span>
                            <h4 className="text-xs font-bold text-zinc-200">{b.display_title}</h4>
                          </div>
                          <p className="text-[11px] text-zinc-400 italic truncate select-all">{b.promo_text}</p>
                          <div className="text-[10px] font-mono text-zinc-400 truncate">
                            ROUTE: <span className="text-zinc-200 font-semibold">{b.action_url}</span> | TRIGGER: <span className="text-zinc-200 font-bold">[{b.button_label}]</span>
                          </div>
                        </div>

                        <div className="flex items-center shrink-0">
                          <button
                            type="button"
                            disabled={!editingSections.sec06}
                            onClick={() => handleBannerToggle(b.id, !b.is_active)}
                            className={`font-mono text-[10px] font-black px-3 py-1.5 rounded-lg transition-all border disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer ${
                              b.is_active 
                                ? 'bg-[#00FF66]/15 border-[#00FF66] text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.3)]' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                            }`}
                          >
                            {b.is_active ? '● PROPAGATING // LIVE' : '○ DEACTIVATED // SLEEP'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Commit Button Box */}
              <div 
                className="flex justify-end p-4 border-2 bg-zinc-950/60 rounded-xl pt-4 shadow-[0_0_20px_rgba(197,168,128,0.15)]"
                style={{ borderColor: '#C5A880' }}
              >
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#C5A880] hover:bg-[#D4B990] font-extrabold font-mono text-[#050507] text-xs px-8 py-3 rounded-lg transition-all disabled:opacity-40 w-full sm:w-auto cursor-pointer shadow-[0_0_20px_rgba(197,168,128,0.3)] hover:shadow-[0_0_30px_rgba(197,168,128,0.5)] active:scale-[0.99]"
                >
                  {saving ? 'COMMITTING PARAMS TO MASTER DATABASE...' : 'COMMIT FULL CONFIGURATION LAYOUT'}
                </button>
              </div>

            </div>
          )}
        </form>
      ) : (
        <div className="p-12 border border-dashed border-zinc-800 bg-zinc-950/20 text-center text-xs text-zinc-400 font-mono font-bold rounded-xl">
          Awaiting core system selection hook. Select a corporate node from the matrix above to edit.
        </div>
      )}
    </div>
  )
}