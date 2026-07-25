'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface EntityTelemetry {
  id: string
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
  has_managed_it: string
  it_antivirus_status: string
  it_antivirus_vendor: string
  it_encryption_enabled: boolean
  it_mdm_status: string
  it_sso_status: string
  it_sso_vendor: string
  web_design_satisfaction: string
  web_yields_leads: boolean
  web_analytics_active: boolean
  hr_payroll_platform: string
  hr_multistate_tax_registered: string
  hr_benefits_active: boolean
  hr_all_staff_piia_signed: boolean
  flow_disconnected_tool_count: number
  flow_unstructured_pdf_parsing_manual: boolean
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

export default function EcosystemEntitiesManager() {
  const [nodes, setNodes] = useState<Pick<EntityTelemetry, 'id' | 'display_name' | 'status'>[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  
  const [telemetry, setTelemetry] = useState<EntityTelemetry | null>(null)
  const [assessment, setAssessment] = useState<ITAssessment | null>(null)
  const [banners, setBanners] = useState<PlatformBanner[]>([])
  
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
    const digits = ein.replace(/\D/g, '')
    return digits.length === 9
  }

  async function fetchInitialData(preserveId?: string) {
    setLoading(true)
    const { data: entData } = await supabase
      .from('crm_entities')
      .select('id, display_name, status')
      .order('display_name', { ascending: true })

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
        accounting_software_platform: 'Gusto',
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!telemetry || !assessment) return

    // Strict EIN format validation guard
    if (telemetry.ein_number && !isValidEIN(telemetry.ein_number)) {
      triggerToast('error', 'EIN Validation Failed: Must contain exactly 9 numeric digits (XX-XXXXXXX).')
      return
    }

    setSaving(true)

    const { 
      id: entityUuid, 
      parent_entity_id, 
      created_at, 
      updated_at, 
      ...cleanTelemetryPayload 
    } = telemetry as any

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
      // Lock all sections back after a successful save
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

  return (
    <div className="space-y-6">
      {/* Master Filter Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-zinc-900 bg-zinc-950/80 rounded-xl">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Active Entity Target</label>
          <select
            className="bg-black border border-zinc-800 text-amber-400 font-mono text-xs rounded-lg px-3 py-2 w-full sm:w-72 focus:outline-none focus:border-amber-500"
            value={selectedId}
            onChange={(e) => handleSelectChange(e.target.value)}
          >
            <option value="">-- SELECT CORPORATE MATRIX NODE --</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.display_name} ({n.status})
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
                    <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase">
                      Section 01 // Corporate Baseline & Capital Vetting
                    </h3>
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
                        value={telemetry.legal_structure || ''} 
                        onChange={e => setTelemetry({...telemetry, legal_structure: e.target.value})}
                      >
                        <option value="LLC">LLC</option>
                        <option value="C_CORP">C_CORP</option>
                        <option value="S_CORP">S_CORP</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">REGISTRATION STATE</label>
                      <select 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.registration_state || ''} 
                        onChange={e => setTelemetry({...telemetry, registration_state: e.target.value})}
                      >
                        {US_STATES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">FORMATION YEAR</label>
                      <input 
                        type="number" 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.formation_year || 0} 
                        onChange={e => setTelemetry({...telemetry, formation_year: safeParseInt(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">
                        EIN NUMBER <span className="text-zinc-600">(XX-XXXXXXX)</span>
                      </label>
                      <input 
                        type="text" 
                        maxLength={10}
                        disabled={!editingSections.sec01}
                        placeholder="12-3456789"
                        className={`w-full bg-black border rounded px-2.5 py-1.5 text-xs font-mono disabled:opacity-50 disabled:cursor-not-allowed ${
                          telemetry.ein_number && !isValidEIN(telemetry.ein_number)
                            ? 'border-rose-800 text-rose-400 focus:border-rose-500'
                            : 'border-zinc-800 text-zinc-200 focus:border-amber-500'
                        }`} 
                        value={telemetry.ein_number || ''} 
                        onChange={e => setTelemetry({...telemetry, ein_number: formatEIN(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">INDUSTRY SECTOR</label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.industry || ''} 
                        onChange={e => setTelemetry({...telemetry, industry: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">NODE STATUS</label>
                      <select 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.status || 'ACTIVE'} 
                        onChange={e => setTelemetry({...telemetry, status: e.target.value})}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="PENDING">PENDING</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                      </select>
                    </div>
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
                        <option value="PRE_SEED">PRE_SEED</option>
                        <option value="SEED">SEED</option>
                        <option value="SERIES_A">SERIES_A</option>
                        <option value="SERIES_B">SERIES_B</option>
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
                      <label className="text-[10px] font-mono text-zinc-500">V&K AUDIT STATUS</label>
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

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-900/40">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                        <input type="checkbox" disabled={!editingSections.sec01} className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-50" checked={telemetry.is_seeking_funding} onChange={e => setTelemetry({...telemetry, is_seeking_funding: e.target.checked})} />
                        <span>Seeking Funding</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                        <input type="checkbox" disabled={!editingSections.sec01} className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-50" checked={telemetry.crunchbase_active} onChange={e => setTelemetry({...telemetry, crunchbase_active: e.target.checked})} />
                        <span>Crunchbase Profile Verified</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                        <input type="checkbox" disabled={!editingSections.sec01} className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-50" checked={telemetry.sells_tangible_goods} onChange={e => setTelemetry({...telemetry, sells_tangible_goods: e.target.checked})} />
                        <span>Sells Tangible Goods</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                        <input type="checkbox" disabled={!editingSections.sec01} className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-50" checked={telemetry.has_duns_number} onChange={e => setTelemetry({...telemetry, has_duns_number: e.target.checked})} />
                        <span>Has DUNS Tracker</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/40 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">DUNS NUMBER ID</label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.duns_number || ''} 
                        onChange={e => setTelemetry({...telemetry, duns_number: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">BBB WEDGE SENTIMENT</label>
                      <select 
                        disabled={!editingSections.sec01}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.bbb_wedge_sentiment || 'SATISFIED'} 
                        onChange={e => setTelemetry({...telemetry, bbb_wedge_sentiment: e.target.value})}
                      >
                        <option value="SATISFIED">SATISFIED</option>
                        <option value="UNSATISFIED">UNSATISFIED</option>
                        <option value="NEUTRAL">NEUTRAL</option>
                        <option value="UNRATED">UNRATED</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 🛡️ SECTION 02 */}
                <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase">
                      Section 02 // Threat Vector & Security Infrastructure
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
                      <label className="text-[10px] font-mono text-zinc-500">MANAGED IT VECTOR (MSP)</label>
                      <select 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.has_managed_it || 'FALSE'} 
                        onChange={e => setTelemetry({...telemetry, has_managed_it: e.target.value})}
                      >
                        <option value="TRUE">TRUE (MANAGED MSP)</option>
                        <option value="FALSE">FALSE (INTERNAL / NONE)</option>
                        <option value="HYBRID">HYBRID</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">ANTIVIRUS ENGINE STATUS</label>
                      <select 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.it_antivirus_status || 'ACTIVE'} 
                        onChange={e => setTelemetry({...telemetry, it_antivirus_status: e.target.value})}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="DEGRADED">DEGRADED</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">ANTIVIRUS AGENT VENDOR</label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.it_antivirus_vendor || ''} 
                        onChange={e => setTelemetry({...telemetry, it_antivirus_vendor: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">MDM ENFORCEMENT LOG</label>
                      <select 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.it_mdm_status || 'DEPLOYED'} 
                        onChange={e => setTelemetry({...telemetry, it_mdm_status: e.target.value})}
                      >
                        <option value="DEPLOYED">DEPLOYED</option>
                        <option value="PARTIAL">PARTIAL</option>
                        <option value="NOT_ENFORCED">NOT_ENFORCED</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">SSO GATEWAY VENDOR</label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.it_sso_vendor || ''} 
                        onChange={e => setTelemetry({...telemetry, it_sso_vendor: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">SSO GATEWAY STATUS</label>
                      <select 
                        disabled={!editingSections.sec02}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.it_sso_status || 'ACTIVE'} 
                        onChange={e => setTelemetry({...telemetry, it_sso_status: e.target.value})}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="PARTIAL">PARTIAL</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-zinc-900/60">
                    <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                      <input type="checkbox" disabled={!editingSections.sec02} className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-50" checked={telemetry.it_encryption_enabled} onChange={e => setTelemetry({...telemetry, it_encryption_enabled: e.target.checked})} />
                      <span>Local Device Storage Encryption Enforced</span>
                    </label>
                  </div>
                </div>

                {/* 👥 SECTION 03 */}
                <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase">
                      Section 03 // Workforce Administration & Compliance Exposure
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">PAYROLL PROCESSING PLATFORM</label>
                      <input 
                        type="text" 
                        disabled={!editingSections.sec03}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.hr_payroll_platform || ''} 
                        onChange={e => setTelemetry({...telemetry, hr_payroll_platform: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">MULTISTATE TAX EXPOSURE STATUS</label>
                      <select 
                        disabled={!editingSections.sec03}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-red-400 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.hr_multistate_tax_registered || ''} 
                        onChange={e => setTelemetry({...telemetry, hr_multistate_tax_registered: e.target.value})}
                      >
                        <option value="CLEAR">CLEAR_NO_NEXUS</option>
                        <option value="EXPOSED">NEXUS_EXPOSED_RISK</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-900/60">
                    <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                      <input type="checkbox" disabled={!editingSections.sec03} className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-50" checked={telemetry.hr_benefits_active} onChange={e => setTelemetry({...telemetry, hr_benefits_active: e.target.checked})} />
                      <span>Active Group Benefits Network Infrastructure</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                      <input type="checkbox" disabled={!editingSections.sec03} className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-50" checked={telemetry.hr_all_staff_piia_signed} onChange={e => setTelemetry({...telemetry, hr_all_staff_piia_signed: e.target.checked})} />
                      <span>Proprietary Information & Inventions Agreements Signed (PIIA)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                      <input type="checkbox" disabled={!editingSections.sec03} className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-50" checked={telemetry.ins_commercial_policy_active} onChange={e => setTelemetry({...telemetry, ins_commercial_policy_active: e.target.checked})} />
                      <span>Active General Commercial Liability Protection Policy</span>
                    </label>
                  </div>
                </div>

                {/* 📊 SECTION 04 */}
                <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase">
                      Section 04 // Pipeline Friction & Optimization Analytics
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">DISCONNECTED UTILITY COUNTER</label>
                      <input 
                        type="number" 
                        max={2147483647}
                        disabled={!editingSections.sec04}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.flow_disconnected_tool_count || 0} 
                        onChange={e => setTelemetry({...telemetry, flow_disconnected_tool_count: safeParseInt(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">WEB LAYOUT SATISFACTION</label>
                      <select 
                        disabled={!editingSections.sec04}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        value={telemetry.web_design_satisfaction || ''} 
                        onChange={e => setTelemetry({...telemetry, web_design_satisfaction: e.target.value})}
                      >
                        <option value="SATISFIED">OPTIMIZED_CONVERSION</option>
                        <option value="UNSATISFIED">CONVERSION_FRICTION</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-900/60">
                    <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                      <input type="checkbox" disabled={!editingSections.sec04} className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-50" checked={telemetry.flow_unstructured_pdf_parsing_manual} onChange={e => setTelemetry({...telemetry, flow_unstructured_pdf_parsing_manual: e.target.checked})} />
                      <span>Manual Processing of Unstructured Document Formats Active</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                      <input type="checkbox" disabled={!editingSections.sec04} className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-50" checked={telemetry.web_yields_leads} onChange={e => setTelemetry({...telemetry, web_yields_leads: e.target.checked})} />
                      <span>Inbound Capture Funnels Harvest Leads Effectively</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                      <input type="checkbox" disabled={!editingSections.sec04} className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800 disabled:opacity-50" checked={telemetry.web_analytics_active} onChange={e => setTelemetry({...telemetry, web_analytics_active: e.target.checked})} />
                      <span>Traffic Performance Analytics Trackers Active</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* 📈 SECTION 05 */}
              <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4 block w-full">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <div>
                    <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase">
                      Section 05 // Regulatory Compliance Matrix & Framework Safeguards (Module 5)
                    </h3>
                    <p className="text-[10px] text-zinc-600 mt-0.5 font-mono uppercase tracking-tight">
                      System Vetting Ledger for Security and Jurisdictional Mandates
                    </p>
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
                      Section 06 // Dynamic Platform Banner & Ad Routing Registry (Module 6)
                    </h3>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Configure contextual application updates and promo scripts running directly across consumer-facing dashboards.
                    </p>
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
                  className="bg-amber-500 hover:bg-amber-400 font-bold font-mono text-black text-xs px-6 py-2.5 rounded-lg transition disabled:opacity-40 w-full sm:w-auto"
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