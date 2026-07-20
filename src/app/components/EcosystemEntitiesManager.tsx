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

export default function EcosystemEntitiesManager() {
  const [nodes, setNodes] = useState<Pick<EntityTelemetry, 'id' | 'display_name' | 'status'>[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [telemetry, setTelemetry] = useState<EntityTelemetry | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchNodes()
  }, [])

  async function fetchNodes() {
    const { data, error } = await supabase
      .from('crm_entities')
      .select('id, display_name, status')
      .order('display_name', { ascending: true })

    if (!error && data) {
      setNodes(data)
      if (data.length > 0) {
        setSelectedId(data[0].id)
        fetchProfile(data[0].id)
      }
    }
    setLoading(false)
  }

  async function fetchProfile(id: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('crm_entities')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (!error && data) {
      setTelemetry(data)
    }
    setLoading(false)
  }

  const handleSelectChange = (id: string) => {
    setSelectedId(id)
    if (id) fetchProfile(id)
    else setTelemetry(null)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!telemetry) return
    setSaving(true)

    const { error } = await supabase
      .from('crm_entities')
      .update({ ...telemetry })
      .eq('id', telemetry.id)

    setSaving(false)
    if (error) {
      triggerToast('error', `Write operation rejected: ${error.message}`)
    } else {
      triggerToast('success', `Telemetry matrix committed for [${telemetry.display_name}]`)
      fetchNodes()
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
    <div className="space-y-6">
      {/* 🛠️ Top Filter Bar Configuration */}
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

      {telemetry ? (
        <form onSubmit={handleUpdate} className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 🏢 PANEL 1: CORPORATE BASELINE & VENUE FLIGHT */}
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
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500">EIN LOG NUMBER</label>
                  <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono" value={telemetry.ein_number || ''} onChange={e => setTelemetry({...telemetry, ein_number: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500">SECTOR MATRIX</label>
                  <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200" value={telemetry.industry || ''} onChange={e => setTelemetry({...telemetry, industry: e.target.value})} />
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

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                  <input type="checkbox" className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800" checked={telemetry.is_seeking_funding} onChange={e => setTelemetry({...telemetry, is_seeking_funding: e.target.checked})} />
                  <span>Seeking Active Venture Capital</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                  <input type="checkbox" className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800" checked={telemetry.crunchbase_active} onChange={e => setTelemetry({...telemetry, crunchbase_active: e.target.checked})} />
                  <span>Crunchbase Profile Verified</span>
                </label>
              </div>
            </div>

            {/* 🛡️ PANEL 2: SECOPS HARDWARE & SSO INFRASTRUCTURE */}
            <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase border-b border-zinc-900 pb-2">
                Section 02 // Threat Vector & Security Infrastructure
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500">MANAGED IT VECTOR</label>
                  <select className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono" value={telemetry.has_managed_it} onChange={e => setTelemetry({...telemetry, has_managed_it: e.target.value})}>
                    <option value="TRUE">INTERNAL_MSP_ACTIVE</option>
                    <option value="FALSE">UNMANAGED_EXPOSURE</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500">ANTIVIRUS ENGINE STATUS</label>
                  <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono" value={telemetry.it_antivirus_status || ''} onChange={e => setTelemetry({...telemetry, it_antivirus_status: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500">ANTIVIRUS AGENT VENDOR</label>
                  <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200" value={telemetry.it_antivirus_vendor || ''} onChange={e => setTelemetry({...telemetry, it_antivirus_vendor: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500">MDM ENFORCEMENT LOG</label>
                  <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono" value={telemetry.it_mdm_status || ''} onChange={e => setTelemetry({...telemetry, it_mdm_status: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500">SSO GATEWAY STATUS</label>
                  <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono" value={telemetry.it_sso_status || ''} onChange={e => setTelemetry({...telemetry, it_sso_status: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500">SSO GATEWAY VENDOR</label>
                  <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200" value={telemetry.it_sso_vendor || ''} onChange={e => setTelemetry({...telemetry, it_sso_vendor: e.target.value})} />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                  <input type="checkbox" className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800" checked={telemetry.it_encryption_enabled} onChange={e => setTelemetry({...telemetry, it_encryption_enabled: e.target.checked})} />
                  <span>End-To-End Hardware Storage Encryption Enabled</span>
                </label>
              </div>
            </div>

            {/* 👥 PANEL 3: COMPLIANCE, JURISDICTION & WORKFORCE PAYROLL */}
            <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase border-b border-zinc-900 pb-2">
                Section 03 // Workforce Management & Compliance Exposure
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500">PAYROLL PLATFORM PLATFORM</label>
                  <input type="text" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200" value={telemetry.hr_payroll_platform || ''} onChange={e => setTelemetry({...telemetry, hr_payroll_platform: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500">MULTISTATE TAX EXPOSURE</label>
                  <select className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-red-400 font-mono" value={telemetry.hr_multistate_tax_registered || ''} onChange={e => setTelemetry({...telemetry, hr_multistate_tax_registered: e.target.value})}>
                    <option value="CLEAR">CLEAR_NO_NEXUS</option>
                    <option value="EXPOSED">NEXUS_EXPOSED_RISK</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                  <input type="checkbox" className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800" checked={telemetry.hr_benefits_active} onChange={e => setTelemetry({...telemetry, hr_benefits_active: e.target.checked})} />
                  <span>Healthcare / Corporate Benefits Network Active</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                  <input type="checkbox" className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800" checked={telemetry.hr_all_staff_piia_signed} onChange={e => setTelemetry({...telemetry, hr_all_staff_piia_signed: e.target.checked})} />
                  <span>Proprietary Information & Inventions Agreements Signed (PIIA)</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                  <input type="checkbox" className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800" checked={telemetry.ins_commercial_policy_active} onChange={e => setTelemetry({...telemetry, ins_commercial_policy_active: e.target.checked})} />
                  <span>Active General Commercial Liability Protection Policy</span>
                </label>
              </div>
            </div>

            {/* 📊 PANEL 4: WORKFLOW EFFICIENCY & MARKETING TELEMETRY */}
            <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase border-b border-zinc-900 pb-2">
                Section 04 // Pipeline Friction & Optimization Analytics
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500">DISCONNECTED TOOL COUNT</label>
                  <input type="number" className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono" value={telemetry.flow_disconnected_tool_count || 0} onChange={e => setTelemetry({...telemetry, flow_disconnected_tool_count: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500">WEB MATRIX LEADS RATING</label>
                  <select className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono" value={telemetry.web_design_satisfaction || ''} onChange={e => setTelemetry({...telemetry, web_design_satisfaction: e.target.value})}>
                    <option value="SATISFIED">OPTIMIZED_LEADS</option>
                    <option value="UNSATISFIED">CONVERSION_FRICTON</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                  <input type="checkbox" className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800" checked={telemetry.flow_unstructured_pdf_parsing_manual} onChange={e => setTelemetry({...telemetry, flow_unstructured_pdf_parsing_manual: e.target.checked})} />
                  <span>Manual Unstructured Document Data Extraction Active</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                  <input type="checkbox" className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800" checked={telemetry.web_yields_leads} onChange={e => setTelemetry({...telemetry, web_yields_leads: e.target.checked})} />
                  <span>Core Frontend Inbound Engine Captures Conversion Handles</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                  <input type="checkbox" className="accent-amber-500 h-3.5 w-3.5 rounded bg-black border-zinc-800" checked={telemetry.web_analytics_active} onChange={e => setTelemetry({...telemetry, web_analytics_active: e.target.checked})} />
                  <span>Global Web Traffic Trackers Active (Google Analytics / Plausible)</span>
                </label>
              </div>
            </div>

          </div>

          {/* ⚡ Execution Bar Footer */}
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
          Awaiting matrix node registration hook. Select an active entity package above to open write parameters.
        </div>
      )}
    </div>
  )
}