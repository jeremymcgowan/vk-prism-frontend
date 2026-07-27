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

  // Governance & HQ Extensions (Standardized Schema)
  has_bylaws?: string | null
  fiscal_year_end_month?: string | null
  has_physical_hq?: boolean | null
  is_virtual_hq_candidate?: boolean | null
  hq_address_line_1?: string | null
  hq_address_line1?: string | null
  hq_city?: string | null
  hq_state?: string | null
  hq_postal_code?: string | null
  hq_zip?: string | null

  // Security & IT
  has_managed_it: string
  email_workspace_suite?: string | null
  mdm_provider?: string | null
  antivirus_status?: string | null
  backup_frequency?: string | null
  it_antivirus_status: string
  it_antivirus_vendor: string
  it_encryption_enabled: boolean
  it_mdm_status: string
  it_sso_status: string
  it_sso_vendor: string

  // Workforce & Benefits
  employee_count_w2_ft?: number | null
  employee_count_w2_pt?: number | null
  contractor_count_1099?: number | null
  benefits_offered?: string[] | null
  hr_payroll_platform: string
  payroll_provider?: string | null
  hr_multistate_tax_registered: string
  hr_benefits_active: boolean
  hr_all_staff_piia_signed: boolean

  // Flow & Systems
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
  { id: 'DENTAL', label: '🦷 Dental Coverage' },
  { id: 'VISION', label: '👓 Vision Coverage' },
  { id: 'RETIREMENT_401K', label: '💰 401(k) / Roth' },
  { id: 'SIMPLE_IRA', label: '📈 SIMPLE / SEP IRA' },
  { id: 'EQUITY_ESOP', label: '📊 Stock Options (ESOP)' },
  { id: 'STIPEND_PERKS', label: '🌴 Remote / Health Stipends' },
]

export default function EcosystemEntitiesManager() {
  const [nodes, setNodes] = useState<Pick<EntityTelemetry, 'id' | 'display_name' | 'status'>[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  
  const [telemetry, setTelemetry] = useState<EntityTelemetry | null>(null)
  const [assessment, setAssessment] = useState<ITAssessment | null>(null)
  const [banners, setBanners] = useState<PlatformBanner[]>([])
  
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
    
    // Validated query strictly targeting existing columns on crm_entities
    const { data: entData, error: entErr } = await supabase
      .from('crm_entities')
      .select('id, display_name, status')
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

    if (ent) setTelemetry(ent)
    
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
    setTelemetry({ ...telemetry, benefits_offered: updated })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!telemetry || !assessment) return

    if (telemetry.ein_number && telemetry.ein_number !== 'Startup - Need EIN' && !isValidEIN(telemetry.ein_number)) {
      triggerToast('error', 'EIN Validation Failed: Must contain exactly 9 numeric digits (XX-XXXXXXX).')
      return
    }

    setSaving(true)

    // Clean payload and handle address column mappings
    const { 
      id: entityUuid, 
      parent_entity_id, 
      created_at, 
      updated_at, 
      node_id,
      hq_address_line1,
      hq_zip,
      ...rawTelemetryPayload 
    } = telemetry as any

    const cleanTelemetryPayload = {
      ...rawTelemetryPayload,
      hq_address_line_1: telemetry.hq_address_line_1 || hq_address_line1 || null,
      hq_postal_code: telemetry.hq_postal_code || hq_zip || null,
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

  if (loading && nodes.length === 0) {
    return <div className="text-xs font-mono text-zinc-500 animate-pulse uppercase tracking-wider">Synchronizing Node Registry...</div>
  }

  const currentNodeBadge = telemetry ? `VK-${telemetry.id.slice(0, 8).toUpperCase()}` : 'VK-NODE'

  return (
    <div className="space-y-6">
      {/* Master Filter Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-zinc-900 bg-zinc-950/80 rounded-xl">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Active Entity Target</label>
          <select
            className="bg-black border border-zinc-800 text-amber-400 font-mono text-xs rounded-lg px-3 py-2 w-full sm:w-80 focus:outline-none focus:border-amber-500"
            value={selectedId}
            onChange={(e) => handleSelectChange(e.target.value)}
          >
            <option value="">-- SELECT CORPORATE MATRIX NODE --</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                [VK-{n.id.slice(0, 6).toUpperCase()}] {n.display_name} ({n.status})
              </option>
            ))}
          </select>
        </div>

        {statusMessage && (
          <div className={`text-[10px] font-mono px-4 py-2 rounded-lg border uppercase tracking-wider max-w-xl ${
            statusMessage.type === 'success' ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400' : 'bg-red-950/20 border-red-900 text-red-400'
          }`}>
            {statusMessage.text}
          </div>
        )}
      </div>

      {telemetry && assessment ? (
        <form onSubmit={handleUpdate} className="space-y-6 animate-fadeIn">
          {loading ? (
            <div className="text-xs font-mono text-zinc-600 animate-pulse uppercase py-12 text-center">Interlocking Profile Matrices...</div>
          ) : (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* 🏢 SECTION 01 */}
                <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase">
                        Section 01 // Corporate Baseline &amp; Capital Vetting
                      </h3>
                      <button
                        type="button"
                        onClick={() => copyNodeIdToClipboard(currentNodeBadge)}
                        className="font-mono text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded hover:bg-amber-500/20 transition cursor-pointer"
                      >
                        {copiedNodeId ? '✓ COPIED' : `NODE ID: ${currentNodeBadge}`}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSectionEdit('sec01')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors border ${
                        editingSections.sec01
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {editingSections.sec01 ? '🔓 UNLOCKED' : '🔒 EDIT SECTION'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">DISPLAY NAME</label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.display_name || ''} 
                        onChange={e => setTelemetry({...telemetry, display_name: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">LEGAL CORPORATE NAME</label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.legal_name || ''} 
                        onChange={e => setTelemetry({...telemetry, legal_name: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">LEGAL STRUCTURE</label>
                      <select 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.legal_structure || 'STARTUP_NOT_FORMED'} 
                        onChange={e => setTelemetry({...telemetry, legal_structure: e.target.value})}
                      >
                        <option value="STARTUP_NOT_FORMED">Startup / Not Yet Formed</option>
                        <option value="DELAWARE_C_CORP">Delaware C-Corporation</option>
                        <option value="LLC">LLC</option>
                        <option value="C_CORP">C-Corporation (Other State)</option>
                        <option value="S_CORP">S-Corporation</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">REGISTRATION STATE</label>
                      <select 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.registration_state || 'UNDECIDED'} 
                        onChange={e => setTelemetry({...telemetry, registration_state: e.target.value})}
                      >
                        <option value="UNDECIDED">Undecided / N/A</option>
                        {US_STATES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">FORMATION YEAR</label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.formation_year || ''} 
                        onChange={e => setTelemetry({...telemetry, formation_year: safeParseInt(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">
                        EIN TAX ID
                      </label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec01}
                        placeholder="12-3456789 or Startup - Need EIN"
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.ein_number || 'Startup - Need EIN'} 
                        onChange={e => setTelemetry({...telemetry, ein_number: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">FISCAL YEAR-END MONTH</label>
                      <select
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                        value={telemetry.fiscal_year_end_month || 'December'}
                        onChange={e => setTelemetry({...telemetry, fiscal_year_end_month: e.target.value})}
                      >
                        {MONTHS.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">BYLAWS &amp; GOVERNANCE STATUS</label>
                      <select 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-amber-400 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.has_bylaws || 'YES'} 
                        onChange={e => setTelemetry({...telemetry, has_bylaws: e.target.value})}
                      >
                        <option value="YES">Yes, 100% compliant</option>
                        <option value="NO">No, we need to draft them</option>
                        <option value="IN_PROGRESS">Currently working on it</option>
                      </select>
                    </div>
                  </div>

                  {/* Principal HQ Telemetry & Address (Standardized Keys) */}
                  <div className="pt-3 border-t border-zinc-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                        <input 
                          type="checkbox" 
                          disabled={!editingSections.sec01} 
                          className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-50" 
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
                        <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                          ⚡ VIRTUAL HQ CANDIDATE FLAGGED
                        </span>
                      )}
                    </div>

                    {telemetry.has_physical_hq !== false ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/40 p-3 rounded-lg border border-zinc-900">
                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-[9px] font-mono text-zinc-500">STREET ADDRESS</label>
                          <input 
                            type="text" 
                            disabled={!editingSections.sec01}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-300 disabled:opacity-50" 
                            value={telemetry.hq_address_line_1 || telemetry.hq_address_line1 || ''} 
                            onChange={e => setTelemetry({
                              ...telemetry, 
                              hq_address_line_1: e.target.value,
                              hq_address_line1: e.target.value
                            })} 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-500">CITY</label>
                          <input 
                            type="text" 
                            disabled={!editingSections.sec01}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-300 disabled:opacity-50" 
                            value={telemetry.hq_city || ''} 
                            onChange={e => setTelemetry({...telemetry, hq_city: e.target.value})} 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-500">STATE</label>
                          <select 
                            disabled={!editingSections.sec01}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-300 disabled:opacity-50" 
                            value={telemetry.hq_state || ''} 
                            onChange={e => setTelemetry({...telemetry, hq_state: e.target.value})} 
                          >
                            <option value="">Select State</option>
                            {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-500">ZIP CODE</label>
                          <input 
                            type="text" 
                            disabled={!editingSections.sec01}
                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-300 disabled:opacity-50" 
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
                      <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg text-amber-400 text-xs font-mono">
                        ⚡ Physical HQ skipped. Entity flagged for V&amp;K Virtual Office &amp; Registered Agent Forwarding provisioning.
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-zinc-900/60 pt-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">FUNDING STAGE</label>
                      <select 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-purple-400 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.funding_stage || ''} 
                        onChange={e => setTelemetry({...telemetry, funding_stage: e.target.value})}
                      >
                        <option value="BOOTSTRAPPED">BOOTSTRAPPED</option>
                        <option value="PRE_SEED">PRE_SEED</option>
                        <option value="SEED">SEED</option>
                        <option value="SERIES_A">SERIES_A</option>
                        <option value="SELF_FUNDED">SELF_FUNDED</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">TARGET CAPITAL ($)</label>
                      <input 
                        type="number" 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.funding_target_amount || 0} 
                        onChange={e => setTelemetry({...telemetry, funding_target_amount: safeParseInt(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">V&amp;K AUDIT STATUS</label>
                      <select 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-amber-400 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.vk_audit_status || ''} 
                        onChange={e => setTelemetry({...telemetry, vk_audit_status: e.target.value})}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PASSED">PASSED</option>
                        <option value="FAILED">FAILED</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 🛡️ SECTION 02 */}
                <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase">
                      Section 02 // Threat Vector &amp; Security Infrastructure
                    </h3>
                    <button
                      type="button"
                      onClick={() => toggleSectionEdit('sec02')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors border ${
                        editingSections.sec02
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {editingSections.sec02 ? '🔓 UNLOCKED' : '🔒 EDIT SECTION'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">EMAIL &amp; WORKSPACE SUITE</label>
                      <select 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-amber-400 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.email_workspace_suite || 'GOOGLE_WORKSPACE'} 
                        onChange={e => setTelemetry({...telemetry, email_workspace_suite: e.target.value})}
                      >
                        <option value="GOOGLE_WORKSPACE">Google Workspace</option>
                        <option value="MICROSOFT_365">Microsoft 365</option>
                        <option value="ZOHO">Zoho Workplace</option>
                        <option value="PROTON">Proton Mail / Encrypted</option>
                        <option value="NEED_WORKSPACE">Need Provisioned (V&amp;K Setup)</option>
                        <option value="NONE">Other / Basic Webmail</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">MOBILE DEVICE MANAGEMENT (MDM)</label>
                      <select 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.mdm_provider || 'NONE'} 
                        onChange={e => setTelemetry({...telemetry, mdm_provider: e.target.value})}
                      >
                        <option value="JAMF">Jamf Pro / Jamf Now</option>
                        <option value="KANDJI">Kandji</option>
                        <option value="INTUNE">Microsoft Intune</option>
                        <option value="RIPPLING_MDM">Rippling IT / MDM</option>
                        <option value="NONE">No MDM / Manual Fleet</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">ENDPOINT PROTECTION (AV/EDR)</label>
                      <select 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.antivirus_status || 'ACTIVE_EDR'} 
                        onChange={e => setTelemetry({...telemetry, antivirus_status: e.target.value})}
                      >
                        <option value="ACTIVE_EDR">Managed EDR (CrowdStrike/Defender)</option>
                        <option value="BASIC_AV">Basic Consumer Antivirus</option>
                        <option value="NONE">Default OS Defense Only</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">BACKUP &amp; DISASTER RECOVERY</label>
                      <select 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.backup_frequency || 'DAILY_AUTOMATED'} 
                        onChange={e => setTelemetry({...telemetry, backup_frequency: e.target.value})}
                      >
                        <option value="DAILY_AUTOMATED">Daily Immutable Cloud Backups</option>
                        <option value="WEEKLY">Weekly / Manual Backups</option>
                        <option value="NONE">No Formal Backup System</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 👥 SECTION 03 */}
                <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase">
                      Section 03 // Workforce Administration &amp; Benefits
                    </h3>
                    <button
                      type="button"
                      onClick={() => toggleSectionEdit('sec03')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors border ${
                        editingSections.sec03
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {editingSections.sec03 ? '🔓 UNLOCKED' : '🔒 EDIT SECTION'}
                    </button>
                  </div>

                  {/* Unbundled Workforce Breakdown */}
                  <div className="grid grid-cols-3 gap-3 bg-black/40 p-3 rounded-lg border border-zinc-900">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500">W2 FULL-TIME</label>
                      <input 
                        type="number" 
                        min={0}
                        disabled={!editingSections.sec03}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1 text-xs text-amber-400 font-bold font-mono disabled:opacity-50" 
                        value={telemetry.employee_count_w2_ft ?? 1} 
                        onChange={e => setTelemetry({...telemetry, employee_count_w2_ft: safeParseInt(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500">W2 PART-TIME</label>
                      <input 
                        type="number" 
                        min={0}
                        disabled={!editingSections.sec03}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1 text-xs text-amber-400 font-bold font-mono disabled:opacity-50" 
                        value={telemetry.employee_count_w2_pt ?? 0} 
                        onChange={e => setTelemetry({...telemetry, employee_count_w2_pt: safeParseInt(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500">1099 CONTRACTORS</label>
                      <input 
                        type="number" 
                        min={0}
                        disabled={!editingSections.sec03}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1 text-xs text-amber-400 font-bold font-mono disabled:opacity-50" 
                        value={telemetry.contractor_count_1099 ?? 0} 
                        onChange={e => setTelemetry({...telemetry, contractor_count_1099: safeParseInt(e.target.value)})} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">PAYROLL PROCESSING SYSTEM</label>
                      <select 
                        disabled={!editingSections.sec03}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.payroll_provider || 'GUSTO'} 
                        onChange={e => setTelemetry({...telemetry, payroll_provider: e.target.value, hr_payroll_platform: e.target.value})} 
                      >
                        <option value="GUSTO">Gusto</option>
                        <option value="RIPPLING">Rippling</option>
                        <option value="ADP">ADP</option>
                        <option value="PAYCHEX">Paychex</option>
                        <option value="QUICKBOOKS_PAYROLL">QuickBooks Payroll</option>
                        <option value="NONE">Manual / No Payroll Yet</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">MULTISTATE TAX EXPOSURE STATUS</label>
                      <select 
                        disabled={!editingSections.sec03}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-red-400 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.hr_multistate_tax_registered || 'CLEAR'} 
                        onChange={e => setTelemetry({...telemetry, hr_multistate_tax_registered: e.target.value})}
                      >
                        <option value="CLEAR">CLEAR_NO_NEXUS</option>
                        <option value="EXPOSED">NEXUS_EXPOSED_RISK</option>
                      </select>
                    </div>
                  </div>

                  {/* Unbundled Benefits Badges */}
                  <div className="space-y-2 pt-2 border-t border-zinc-900/60">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Active Group Benefits Infrastructure</label>
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
                                ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                                : 'bg-black border-zinc-900 text-zinc-600'
                            }`}
                          >
                            <span>{b.label}</span>
                            <span className="text-[10px]">{isChecked ? '✓ ACTIVE' : '○ OFF'}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* 📊 SECTION 04 */}
                <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase">
                      Section 04 // Flow, CRM &amp; Operations Automation
                    </h3>
                    <button
                      type="button"
                      onClick={() => toggleSectionEdit('sec04')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors border ${
                        editingSections.sec04
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {editingSections.sec04 ? '🔓 UNLOCKED' : '🔒 EDIT SECTION'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">PRIMARY CRM SYSTEM</label>
                      <select 
                        disabled={!editingSections.sec04}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-amber-400 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.crm_system || 'HUBSPOT'} 
                        onChange={e => setTelemetry({...telemetry, crm_system: e.target.value})}
                      >
                        <option value="HUBSPOT">HubSpot</option>
                        <option value="SALESFORCE">Salesforce</option>
                        <option value="NOTION">Notion / Airtable</option>
                        <option value="OTHER">Other CRM</option>
                        <option value="NONE">No CRM / Spreadsheets Only</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">TEAM COLLABORATION</label>
                      <select 
                        disabled={!editingSections.sec04}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.collaboration_tool || 'SLACK'} 
                        onChange={e => setTelemetry({...telemetry, collaboration_tool: e.target.value})}
                      >
                        <option value="SLACK">Slack</option>
                        <option value="TEAMS">Microsoft Teams</option>
                        <option value="DISCORD">Discord</option>
                        <option value="EMAIL">Email / SMS Only</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">AUTOMATION LEVEL</label>
                      <select 
                        disabled={!editingSections.sec04}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.automation_status || 'MANUAL'} 
                        onChange={e => setTelemetry({...telemetry, automation_status: e.target.value})}
                      >
                        <option value="MANUAL">100% Manual Processes</option>
                        <option value="ZAPIER">Basic Zapier / Make Zaps</option>
                        <option value="CUSTOM_AI">Custom AI &amp; API Workflows</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {/* 📈 SECTION 05 */}
              <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4 block w-full">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <div>
                    <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase">
                      Section 05 // Regulatory Compliance Matrix &amp; Framework Safeguards
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSectionEdit('sec05')}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors border ${
                      editingSections.sec05
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {editingSections.sec05 ? '🔓 UNLOCKED' : '🔒 EDIT SECTION'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-zinc-900/60 pb-4">
                  {[
                    { label: 'HIPAA Regulatory Protocol', key: 'is_hipaa_compliant' },
                    { label: 'PCI Transaction Safeguard', key: 'is_pci_compliant' },
                    { label: 'FINRA Brokerage Retention', key: 'is_finra_compliant' },
                    { label: 'SOC2 Trust Framework', key: 'is_soc2_compliant' },
                    { label: 'NIST Military Standard', key: 'is_nist_compliant' },
                    { label: 'GDPR Privacy Protection', key: 'is_gdpr_compliant' },
                  ].map((f) => {
                    const currentValue = (assessment as any)[f.key]
                    const isCompliant = currentValue === 'yes'

                    return (
                      <div key={f.key} className="flex items-center justify-between p-3 bg-black rounded-xl border border-zinc-900/60 hover:border-zinc-800 transition-colors">
                        <span className="text-[11px] font-mono font-bold tracking-wide text-zinc-400 uppercase">
                          {f.label}
                        </span>
                        <select
                          disabled={!editingSections.sec05}
                          className={`bg-zinc-950 border px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider text-center focus:outline-none min-w-[125px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            isCompliant 
                              ? 'border-emerald-900 text-emerald-400 bg-emerald-950/10' 
                              : currentValue === 'no'
                              ? 'border-rose-900 text-rose-400 bg-rose-950/10 animate-pulse'
                              : 'border-zinc-800 text-zinc-500 bg-zinc-900/20'
                          }`}
                          value={currentValue}
                          onChange={(e) => setAssessment({ ...assessment, [f.key]: e.target.value })}
                        >
                          <option value="yes" className="bg-black text-emerald-400">PASS</option>
                          <option value="no" className="bg-black text-rose-400">FAIL</option>
                          <option value="exempt" className="bg-black text-zinc-500">EXEMPT</option>
                        </select>
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Accounting Ledger Platform</label>
                    <input 
                      type="text" 
                      disabled={!editingSections.sec05}
                      className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                      value={assessment.accounting_software_platform || ''} 
                      onChange={e => setAssessment({...assessment, accounting_software_platform: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Weekly Manual Friction (Hours)</label>
                    <input 
                      type="number" 
                      max={2147483647}
                      disabled={!editingSections.sec05}
                      className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                      value={assessment.manual_data_hours_weekly || 0} 
                      onChange={e => setAssessment({...assessment, manual_data_hours_weekly: safeParseInt(e.target.value)})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">VK Shield Security Sensitivity</label>
                    <select 
                      disabled={!editingSections.sec05}
                      className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      value={assessment.infrastructure_security_concerned ? 'true' : 'false'}
                      onChange={e => setAssessment({...assessment, infrastructure_security_concerned: e.target.value === 'true'})}
                    >
                      <option value="false">STABLE // STANDARD PROTOCOL</option>
                      <option value="true">EXPOSED // HIGH CRITICAL AUDIT</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 🔄 SECTION 06 */}
              <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <div>
                    <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase">
                      Section 06 // Dynamic Platform Banner &amp; Ad Routing Registry
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSectionEdit('sec06')}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors border ${
                      editingSections.sec06
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {editingSections.sec06 ? '🔓 UNLOCKED' : '🔒 EDIT SECTION'}
                  </button>
                </div>

                <div className="space-y-3">
                  {banners.length === 0 ? (
                    <div className="text-center py-6 text-xs font-mono text-zinc-600 uppercase border border-dashed border-zinc-900 rounded-xl bg-black/40">
                      Zero promotion tracks initialized in crm_ecosystem_banners registry ledger.
                    </div>
                  ) : (
                    banners.map((b) => (
                      <div key={b.id} className="p-4 border border-zinc-900/60 bg-black rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] text-purple-400 font-bold bg-purple-950/10 border border-purple-900/20 px-2 py-0.5 rounded">
                              {b.banner_key}
                            </span>
                            <h4 className="text-xs font-bold text-zinc-200">{b.display_title}</h4>
                          </div>
                          <p className="text-[11px] text-zinc-500 italic truncate select-all">{b.promo_text}</p>
                          <div className="text-[10px] font-mono text-zinc-600 truncate">
                            ROUTE: <span className="text-zinc-400">{b.action_url}</span> | TRIGGER: <span className="text-zinc-400">[{b.button_label}]</span>
                          </div>
                        </div>

                        <div className="flex items-center shrink-0">
                          <button
                            type="button"
                            disabled={!editingSections.sec06}
                            onClick={() => handleBannerToggle(b.id, !b.is_active)}
                            className={`font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors border disabled:opacity-50 disabled:cursor-not-allowed ${
                              b.is_active 
                                ? 'bg-emerald-950/30 border-emerald-900 text-emerald-400' 
                                : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'
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

              {/* Commit Button */}
              <div className="flex justify-end p-4 border border-zinc-900 bg-zinc-950/60 rounded-xl pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-500 hover:bg-amber-400 font-bold font-mono text-black text-xs px-6 py-2.5 rounded-lg transition disabled:opacity-40 w-full sm:w-auto cursor-pointer"
                >
                  {saving ? 'COMMITTING PARAMS TO MASTER DATABASE...' : 'COMMIT FULL CONFIGURATION LAYOUT'}
                </button>
              </div>

            </div>
          )}
        </form>
      ) : (
        <div className="p-12 border border-dashed border-zinc-900 bg-zinc-950/20 text-center text-xs text-zinc-500 font-mono rounded-xl">
          Awaiting core system selection hook. Select a corporate node from the matrix above to edit.
        </div>
      )}
    </div>
  )
}