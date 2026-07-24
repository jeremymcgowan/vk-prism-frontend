'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import OnboardingHeader from '../components/OnboardingHeader';
import VendorValueWedge from '../components/VendorValueWedge';
import { useOnboarding } from '@/app/onboarding/OnboardingContext';

export default function StepSixFlow() {
  const router = useRouter();
  const { formData, updateFormData, clearFormData, isHydrated } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [crmAudit, setCrmAudit] = useState({
    satisfaction: formData.crm_vendor_audit?.satisfaction || 'GREAT',
    costPerception: formData.crm_vendor_audit?.costPerception || 'FAIR',
  });

  if (!isHydrated) return null; // Prevents UI flicker while loading sessionStorage

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  const handleCrmAuditChange = (field: 'satisfaction' | 'costPerception', value: string) => {
    const updated = { ...crmAudit, [field]: value };
    setCrmAudit(updated);
    updateFormData({ crm_vendor_audit: updated });
  };

  // Master Submission Handler: Maps context state directly to Supabase table columns
  const executeFinalSubmission = async (flowOptIn: boolean) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Initialize Standard Supabase Client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      let userId = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || null;
      } catch {
        // Fallback for anonymous or unauthenticated sessions
      }

      // 2. Map all collected form state into exact database columns
      const dbPayload = {
        user_id: userId,
        company_name: formData.company_name || 'Unspecified Entity',
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        legal_structure: formData.legal_structure || null,
        formation_year: formData.formation_year || null,
        hq_address_line_1: formData.hq_address_line_1 || null,
        hq_city: formData.hq_city || null,
        hq_state: formData.hq_state || null,
        hq_postal_code: formData.hq_postal_code || null,
        hq_address_type: formData.hq_address_type || null,
        funding_stage: formData.funding_stage || null,
        target_raise: formData.target_raise || null,
        has_bylaws: formData.has_bylaws || null,
        accounting_software: formData.accounting_software || null,
        accounting_vendor_audit: formData.accounting_vendor_audit || null,
        email_workspace_suite: formData.email_workspace_suite || null,
        workspace_vendor_audit: formData.workspace_vendor_audit || null,
        mdm_provider: formData.mdm_provider || null,
        mdm_vendor_audit: formData.mdm_vendor_audit || null,
        antivirus_status: formData.antivirus_status || null,
        backup_frequency: formData.backup_frequency || null,
        headcount_range: formData.headcount_range || null,
        payroll_provider: formData.payroll_provider || null,
        payroll_vendor_audit: formData.payroll_vendor_audit || null,
        benefits_offered: formData.benefits_offered || null,
        
        // Step 6 Fields
        crm_system: formData.crm_system || (flowOptIn ? 'NONE' : null),
        crm_vendor_audit: formData.crm_system && formData.crm_system !== 'NONE' ? crmAudit : null,
        collaboration_tool: formData.collaboration_tool || (flowOptIn ? 'SLACK' : null),
        automation_status: formData.automation_status || (flowOptIn ? 'MANUAL' : null),

        // Full Raw JSON Audit Backup
        raw_step_payloads: {
          ...formData,
          flow_managed_service_opt_in: flowOptIn,
          completed_at: new Date().toISOString()
        }
      };

      if (supabaseUrl && supabaseAnonKey) {
        const { error: insertError } = await supabase
          .from('crm_questionnaire_submissions')
          .insert([dbPayload]);

        if (insertError) {
          console.warn('Supabase DB Insert Notice:', insertError.message);
        }
      }

      // 3. Clear both session context and any legacy local storage cache
      clearFormData();
      localStorage.removeItem('prism_onboarding_draft');

      // 4. Route to Onboarding Success Screen
      router.push('/onboarding/success');

    } catch (err: unknown) {
      console.error('FINAL_SUBMISSION_ERROR:', err);
      const message = err instanceof Error ? err.message : 'Failed to transmit onboarding dataset.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlowBypass = () => executeFinalSubmission(true);

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeFinalSubmission(false);
  };

  return (
    // UPGRADED: Changed font-mono to font-sans for a modern, secure executive banking feel
    <div className="min-h-screen bg-[#050507] text-[#E4E4E7] flex flex-col font-sans antialiased">
      <OnboardingHeader currentStep={6} />

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
        
        {/* Responsive scaling container (max-w-3xl lg:max-w-4xl) with expanded halo wrapper */}
        <div className="w-full max-w-3xl lg:max-w-4xl relative my-8">
          
          {/* UPGRADED EXPANSIVE GOLD HALO: -inset-3 and blur-3xl for a wider, ambient aura */}
          <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-[#C5A880]/30 via-[#8B7325]/15 to-[#C5A880]/30 rounded-[2rem] blur-3xl opacity-80 pointer-events-none transition-all duration-700"></div>

          {/* MAIN CARD: Obsidian glass panel with enhanced padding and double-layered gold glow */}
          <div className="relative w-full bg-[#0A0A0C]/95 glass-panel border border-[#C5A880]/40 hover:border-[#C5A880]/60 shadow-[0_10px_50px_rgba(0,0,0,0.9),0_0_40px_-5px_rgba(197,168,128,0.25)] p-8 md:p-12 lg:p-14 rounded-2xl transition-all duration-500 overflow-hidden">
            
            {/* Internal Corner Accent Glow */}
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#C5A880]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-10">
              <h2 className="text-xs font-bold tracking-[0.25em] text-[#C5A880] uppercase mb-3">
                Step 6 of 6: VK Flow — Workflows &amp; Automation
              </h2>
              <h1 className="text-3xl lg:text-4xl font-light text-white tracking-tight">
                How does your business run day-to-day?
              </h1>
            </div>

            <form onSubmit={handleStandardSubmit} className="space-y-6">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                  Primary CRM &amp; Customer Data System <span className="text-[#C5A880]">*</span>
                </label>
                <select 
                  name="crm_system"
                  required
                  value={formData.crm_system || ''}
                  onChange={handleChange}
                  className="w-full bg-[#121215] border border-[#27272A] text-white p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                >
                  <option value="" disabled>Please Select CRM System...</option>
                  <option value="HUBSPOT">HubSpot</option>
                  <option value="SALESFORCE">Salesforce</option>
                  <option value="NOTION">Notion / Airtable</option>
                  <option value="OTHER">Other CRM</option>
                  <option value="NONE">No CRM / Spreadsheets Only</option>
                </select>

                {formData.crm_system && formData.crm_system !== 'NONE' && (
                  <div className="mt-4">
                    <VendorValueWedge 
                      vendorName={formData.crm_system}
                      data={crmAudit}
                      onChange={handleCrmAuditChange}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                    Team Communication <span className="text-[#C5A880]">*</span>
                  </label>
                  <select 
                    name="collaboration_tool"
                    required
                    value={formData.collaboration_tool || ''}
                    onChange={handleChange}
                    className="w-full bg-[#121215] border border-[#27272A] text-white p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                  >
                    <option value="" disabled>Please Select Communication Tool...</option>
                    <option value="SLACK">Slack</option>
                    <option value="TEAMS">Microsoft Teams</option>
                    <option value="DISCORD">Discord</option>
                    <option value="EMAIL">Email / SMS Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                    Current Automation Level <span className="text-[#C5A880]">*</span>
                  </label>
                  <select 
                    name="automation_status"
                    required
                    value={formData.automation_status || ''}
                    onChange={handleChange}
                    className="w-full bg-[#121215] border border-[#27272A] text-white p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                  >
                    <option value="" disabled>Please Select Automation Level...</option>
                    <option value="MANUAL">100% Manual Processes</option>
                    <option value="ZAPIER">Basic Zapier / Make Zaps</option>
                    <option value="CUSTOM_AI">Custom AI &amp; API Workflows</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-5 py-3 text-xs text-red-400 font-mono shadow-inner">
                  SUBMISSION_ERROR // {error}
                </div>
              )}

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#27272A]/80"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold">
                  <span className="px-4 bg-[#0A0A0C] text-neutral-500 uppercase tracking-[0.2em]">OR</span>
                </div>
              </div>

              {/* Flow Fast-Track Card */}
              <button
                type="button"
                onClick={handleFlowBypass}
                disabled={isSubmitting}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-[#C5A880]/20 via-transparent to-[#8B7325]/20 border border-[#C5A880]/40 p-[1px] rounded-xl hover:border-[#C5A880] hover:shadow-[0_0_30px_rgba(197,168,128,0.25)] transition-all duration-300 cursor-pointer"
              >
                <div className="relative w-full bg-[#121215]/95 backdrop-blur-md px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-[#161619] transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(197,168,128,0.4)] group-hover:scale-110 transition-transform">⚡</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white tracking-wide">I Need Turnkey AI &amp; Workflows!</p>
                      <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">Automate operations with V&amp;K custom agents and automated software integrations.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880] group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Automate Us →</span>
                </div>
              </button>

              {/* UPGRADED PRIMARY ACTION BUTTON: Solid Champagne Gold background for 100% cross-browser reliability */}
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/onboarding/step-5')}
                  className="px-6 py-3 border border-[#27272A] text-neutral-400 hover:text-white hover:border-neutral-500 text-xs font-semibold uppercase tracking-[0.2em] rounded-xl transition-colors cursor-pointer"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-3.5 bg-[#C5A880] hover:bg-[#D4B990] text-[#050507] text-xs font-extrabold uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_0_25px_rgba(197,168,128,0.3)] hover:shadow-[0_0_35px_rgba(197,168,128,0.5)] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Transmitting Dataset...' : 'Complete Onboarding ✨'}
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}