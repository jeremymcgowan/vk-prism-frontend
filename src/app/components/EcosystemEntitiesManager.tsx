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

export default function EcosystemEntitiesManager() {
  const [nodes, setNodes] = useState<Pick<EntityTelemetry, 'id' | 'display_name' | 'status'>[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  
  const [telemetry, setTelemetry] = useState<EntityTelemetry | null>(null)
  const [assessment, setAssessment] = useState<ITAssessment | null>(null)
  const [banners, setBanners] = useState<PlatformBanner[]>([])
  
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchInitialData()
  }, [])

  async function fetchInitialData() {
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
    
    if (entData && entData.length > 0) {
      setSelectedId(entData[0].id)
      await fetchProfileData(entData[0].id)
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
    setSaving(true)

    const { error: entErr } = await supabase
      .from('crm_entities')
      .update({ ...telemetry })
      .eq('id', telemetry.id)

    const { error: assessErr } = await supabase
      .from('crm_it_assessments')
      .upsert({ ...assessment }, { onConflict: 'entity_id' })

    setSaving(false)
    if (entErr || assessErr) {
      triggerToast('error', `Write rejected: ${entErr?.message || assessErr?.message}`)
    } else {
      triggerToast('success', `All telemetry layers securely synced down to cloud storage columns.`)
      fetchInitialData()
    }
  }

  const handleBannerToggle = async (id: string, activeState: boolean) => {
    const { error } = await supabase
      .from('crm_ecosystem_banners')
      .update({ is_active: activeState })
      .eq('id', id)

    if (!error) {
      setBanners(banners.map(b => b.id === id ? { ...b, is_active: activeState } : b))
      triggerToast('success', 'Global network route parameters updated.')
    }
  }

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => setStatusMessage(null), 4000)
  }

  if (loading && nodes.length === 0) {
    return <div className="text-xs font-mono text-zinc-500 animate-pulse uppercase tracking-wider">Synchronizing Node Registry...</div>
  }

  return (
    <div className="space-y-8">
      {/* 🛠️ Top Selector Controller */}
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
          <div className={`text-[10px] font-mono px-4 py-2 rounded-lg border uppercase tracking-wider ${
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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 🏢 SECTION 01: CORPORATE BASELINE & CAPITAL VETTING */}
                <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase border-b border-zinc-900 pb-2">
                    Section 01 // Corporate Baseline & Capital Vetting
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">DISPLAY NAME</label>
                      <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200" value={telemetry.display_name || ''} onChange={e => setTelemetry({...telemetry, display_name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">LEGAL CORPORATE NAME</label>
                      <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200" value={telemetry.legal_name || ''} onChange={e => setTelemetry({...telemetry, legal_name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">LEGAL STRUCTURE</label>
                      <select className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono" value={telemetry.legal_structure || ''} onChange={e => setTelemetry({...telemetry, legal_structure: e.target.value})}>
                        <option value="LLC">LLC</option>
                        <option value="C_CORP">C_CORP</option>
                        <option value="S_CORP">S_CORP</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">REGISTRATION STATE</label>
                      <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono" maxLength={2} value={telemetry.registration_state || ''} onChange={e => setTelemetry({...telemetry, registration_state: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-zinc-900/60 pt-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">FUNDING STAGE</label>
                      <select className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-purple-400 font-mono" value={telemetry.funding_stage || ''} onChange={e => setTelemetry({...telemetry, funding_stage: e.target.value})}>
                        <option value="PRE_SEED">PRE_SEED</option>
                        <option value="SEED">SEED</option>
                        <option value="SERIES_A">SERIES_A</option>
                        <option value="SERIES_B">SERIES_B</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">TARGET CAPITAL ($)</label>
                      <input type="number" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono" value={telemetry.funding_target_amount || 0} onChange={e => setTelemetry({...telemetry, funding_target_amount: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">V&K AUDIT STATUS</label>
                      <select className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-amber-400 font-mono" value={telemetry.vk_audit_status || ''} onChange={e => setTelemetry({...telemetry, vk_audit_status: e.target.value})}>
                        <option value="PENDING">PENDING</option>
                        <option value="PASSED">PASSED</option>
                        <option value="FAILED">FAILED</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 🛡️ SECTION 02: THREAT VECTOR & SECURITY INFRASTRUCTURE */}
                <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase border-b border-zinc-900 pb-2">
                    Section 02 // Threat Vector & Security Infrastructure
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">ANTIVIRUS AGENT VENDOR</label>
                      <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200" value={telemetry.it_antivirus_vendor || ''} onChange={e => setTelemetry({...telemetry, it_antivirus_vendor: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">MDM ENFORCEMENT LOG</label>
                      <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono" value={telemetry.it_mdm_status || ''} onChange={e => setTelemetry({...telemetry, it_mdm_status: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">SSO GATEWAY VENDOR</label>
                      <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200" value={telemetry.it_sso_vendor || ''} onChange={e => setTelemetry({...telemetry, it_sso_vendor: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">SSO GATEWAY STATUS</label>
                      <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono" value={telemetry.it_sso_status || ''} onChange={e => setTelemetry({...telemetry, it_sso_status: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                      <input type="checkbox" className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800" checked={telemetry.it_encryption_enabled} onChange={e => setTelemetry({...telemetry, it_encryption_enabled: e.target.checked})} />
                      <span>Local Device Storage Encryption Enforced</span>
                    </label>
                  </div>
                </div>

                {/* 👥 SECTION 03: WORKFORCE ADMINISTRATION & COMPLIANCE EXPOSURE */}
                <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase border-b border-zinc-900 pb-2">
                    Section 03 // Workforce Administration & Compliance Exposure
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">PAYROLL PROCESSING PLATFORM</label>
                      <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200" value={telemetry.hr_payroll_platform || ''} onChange={e => setTelemetry({...telemetry, hr_payroll_platform: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">MULTISTATE TAX EXPOSURE STATUS</label>
                      <select className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-red-400 font-mono" value={telemetry.hr_multistate_tax_registered || ''} onChange={e => setTelemetry({...telemetry, hr_multistate_tax_registered: e.target.value})}>
                        <option value="CLEAR">CLEAR_NO_NEXUS</option>
                        <option value="EXPOSED">NEXUS_EXPOSED_RISK</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                      <input type="checkbox" className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800" checked={telemetry.hr_benefits_active} onChange={e => setTelemetry({...telemetry, hr_benefits_active: e.target.checked})} />
                      <span>Active Group Benefits Network Infrastructure</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                      <input type="checkbox" className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800" checked={telemetry.hr_all_staff_piia_signed} onChange={e => setTelemetry({...telemetry, hr_all_staff_piia_signed: e.target.checked})} />
                      <span>Proprietary Information & Inventions Agreements Signed (PIIA)</span>
                    </label>
                  </div>
                </div>

                {/* 📊 SECTION 04: PIPELINE FRICTION & OPTIMIZATION ANALYTICS */}
                <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase border-b border-zinc-900 pb-2">
                    Section 04 // Pipeline Friction & Optimization Analytics
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">DISCONNECTED UTILITY COUNTER</label>
                      <input type="number" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono" value={telemetry.flow_disconnected_tool_count || 0} onChange={e => setTelemetry({...telemetry, flow_disconnected_tool_count: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500">WEB LAYOUT CONVERSION SATISFACTION</label>
                      <select className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono" value={telemetry.web_design_satisfaction || ''} onChange={e => setTelemetry({...telemetry, web_design_satisfaction: e.target.value})}>
                        <option value="SATISFIED">OPTIMIZED_CONVERSION</option>
                        <option value="UNSATISFIED">CONVERSION_FRICTION</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                      <input type="checkbox" className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800" checked={telemetry.flow_unstructured_pdf_parsing_manual} onChange={e => setTelemetry({...telemetry, flow_unstructured_pdf_parsing_manual: e.target.checked})} />
                      <span>Manual Processing of Unstructured Document Formats Active</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 📈 SECTION 05: REGULATORY COMPLIANCE SYSTEM MATRIX (MODULE 5) */}
              <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4 w-full block">
                <div>
                  <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase">
                    Section 05 // Regulatory Compliance Matrix & Framework Safeguards (Module 5)
                  </h3>
                  <p className="text-[10px] text-zinc-600 mt-0.5 font-mono uppercase tracking-tight">
                    System Vetting Ledger for Security and Jurisdictional Mandates
                  </p>
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
                          className={`bg-zinc-950 border px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider text-center focus:outline-none min-w-[125px] transition-colors ${
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
                    <input type="text" className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500" value={assessment.accounting_software_platform || ''} onChange={e => setAssessment({...assessment, accounting_software_platform: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Weekly Manual Friction (Hours)</label>
                    <input type="number" className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500" value={assessment.manual_data_hours_weekly || 0} onChange={e => setAssessment({...assessment, manual_data_hours_weekly: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">VK Shield Security Sensitivity</label>
                    <select 
                      className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500"
                      value={assessment.infrastructure_security_concerned ? 'true' : 'false'}
                      onChange={e => setAssessment({...assessment, infrastructure_security_concerned: e.target.value === 'true'})}
                    >
                      <option value="false">STABLE // STANDARD PROTOCOL</option>
                      <option value="true">EXPOSED // HIGH CRITICAL AUDIT</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ⚡ Execution Output Controls - Secured cleanly at the bottom of the form context */}
          <div className="flex justify-end p-4 border border-zinc-900 bg-zinc-950/60 rounded-xl">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-400 font-bold font-mono text-black text-xs px-6 py-2.5 rounded-lg transition disabled:opacity-40"
            >
              {saving ? 'COMMITTING PARAMS TO MASTER DATABASE...' : 'COMMIT FULL CONFIGURATION LAYOUT'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-12 border border-dashed border-zinc-900 bg-zinc-950/20 text-center text-xs text-zinc-500 font-mono rounded-xl">
          Awaiting core system selection hook. Select a corporate node from the matrix above to edit.
        </div>
      )}

      {/* 🔄 SECTION 06: GLOBAL MARKETING ROUTING REGISTRY (MODULE 6) */}
      <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase">
            Section 06 // Dynamic Platform Banner & Ad Routing Registry (Module 6)
          </h3>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            Configure contextual application updates and promo scripts running directly across consumer-facing dashboards.
          </p>
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
                    onClick={() => handleBannerToggle(b.id, !b.is_active)}
                    className={`font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors border ${
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

    </div>
  )
}