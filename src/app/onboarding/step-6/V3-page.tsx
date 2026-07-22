'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from '../components/OnboardingHeader';
import VendorValueWedge from '../components/VendorValueWedge';

export default function StepSixFlow() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    crm_system: '',
    collaboration_tool: '',
    automation_status: '',
  });

  const [crmAudit, setCrmAudit] = useState({ satisfaction: 'GREAT', costPerception: 'FAIR' });

  // Load any existing draft values if user returns to Step 6
  useEffect(() => {
    const savedDraft = localStorage.getItem('prism_onboarding_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData((prev) => ({
          ...prev,
          crm_system: parsed.crm_system || '',
          collaboration_tool: parsed.collaboration_tool || '',
          automation_status: parsed.automation_status || '',
        }));
      } catch (e) {
        console.error('Failed to restore Step 6 draft:', e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Master Submission Handler: Collects Steps 1-6 & writes to Supabase
  const executeFinalSubmission = async (flowOptIn: boolean) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Pull accumulated draft data from Steps 1-5
      const draftData = JSON.parse(localStorage.getItem('prism_onboarding_draft') || '{}');

      // 2. Build complete payload
      const finalPayload = {
        ...draftData,
        ...formData,
        crm_vendor_audit: formData.crm_system && formData.crm_system !== 'NONE' ? crmAudit : null,
        flow_managed_service_opt_in: flowOptIn,
        completed_at: new Date().toISOString(),
        status: 'PENDING_REVIEW',
      };

      console.log('✨ Executing Supabase Insert Payload:', finalPayload);

      // 3. Insert into Supabase
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();

      const { data, error: insertError } = await supabase
        .from('crm_questionnaire_submissions')
        .insert([
          {
            user_id: user?.id || null,
            payload: finalPayload,
            company_name: finalPayload.company_name || 'Unspecified Entity',
            contact_email: finalPayload.contact_email || null,
            status: 'PENDING_REVIEW',
          },
        ])
        .select();

      if (insertError) {
        console.warn('Supabase DB Insert Notice:', insertError.message);
        // Continue flow so user isn't blocked if offline or in anonymous state
      }

      // 4. Clear local draft cache
      localStorage.removeItem('prism_onboarding_draft');

      // 5. Route to Console Dashboard or Success Screen
      router.push('/dashboard?onboarding=complete');

    } catch (err: any) {
      console.error('FINAL_SUBMISSION_ERROR:', err);
      setError(err.message || 'Failed to finalize submission payload.');
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
    <div className="min-h-screen bg-[#050507] text-[#E4E4E7] flex flex-col font-mono antialiased">
      <OnboardingHeader currentStep={6} />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-[#0A0A0C]/90 glass-panel border border-[#1F1F1F] shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-8 my-6 relative overflow-hidden">
          
          {/* Subtle Accent Glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold tracking-[0.2em] text-[#C5A880] uppercase mb-2">
              Step 6 of 6: VK Flow — Workflows & Automation
            </h2>
            <h1 className="text-2xl font-light text-white tracking-wide">
              How does your business run day-to-day?
            </h1>
          </div>

          <form onSubmit={handleStandardSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                Primary CRM & Customer Data System <span className="text-[#C5A880]">*</span>
              </label>
              <select 
                name="crm_system"
                required
                value={formData.crm_system}
                onChange={handleChange}
                className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm focus:border-[#C5A880]/60 focus:ring-1 focus:ring-[#C5A880]/20 focus:outline-none transition-all"
              >
                <option value="" disabled>Please Select CRM System...</option>
                <option value="HUBSPOT">HubSpot</option>
                <option value="SALESFORCE">Salesforce</option>
                <option value="NOTION">Notion / Airtable</option>
                <option value="OTHER">Other CRM</option>
                <option value="NONE">No CRM / Spreadsheets Only</option>
              </select>

              {formData.crm_system && formData.crm_system !== 'NONE' && (
                <VendorValueWedge 
                  vendorName={formData.crm_system}
                  data={crmAudit}
                  onChange={(f, v) => setCrmAudit((prev) => ({ ...prev, [f]: v }))}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                  Team Communication <span className="text-[#C5A880]">*</span>
                </label>
                <select 
                  name="collaboration_tool"
                  required
                  value={formData.collaboration_tool}
                  onChange={handleChange}
                  className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm focus:border-[#C5A880]/60 focus:ring-1 focus:ring-[#C5A880]/20 focus:outline-none transition-all"
                >
                  <option value="" disabled>Please Select Communication Tool...</option>
                  <option value="SLACK">Slack</option>
                  <option value="TEAMS">Microsoft Teams</option>
                  <option value="DISCORD">Discord</option>
                  <option value="EMAIL">Email / SMS Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                  Current Automation Level <span className="text-[#C5A880]">*</span>
                </label>
                <select 
                  name="automation_status"
                  required
                  value={formData.automation_status}
                  onChange={handleChange}
                  className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm focus:border-[#C5A880]/60 focus:ring-1 focus:ring-[#C5A880]/20 focus:outline-none transition-all"
                >
                  <option value="" disabled>Please Select Automation Level...</option>
                  <option value="MANUAL">100% Manual Processes</option>
                  <option value="ZAPIER">Basic Zapier / Make Zaps</option>
                  <option value="CUSTOM_AI">Custom AI & API Workflows</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="rounded border border-red-900/30 bg-red-950/10 px-4 py-2.5 text-xs text-red-400 font-mono">
                SUBMISSION_ERROR // {error}
              </div>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#27272A]/80"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-medium">
                <span className="px-4 bg-[#0A0A0C] text-neutral-500 uppercase tracking-widest">OR</span>
              </div>
            </div>

            {/* Flow Fast-Track Card */}
            <button
              type="button"
              onClick={handleFlowBypass}
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-[#C5A880]/20 via-transparent to-[#8B7325]/20 border border-[#C5A880]/30 p-[1px] hover:border-[#C5A880]/70 hover:shadow-[0_0_25px_rgba(197,168,128,0.2)] transition-all duration-300 cursor-pointer"
            >
              <div className="relative w-full bg-[#121215]/90 backdrop-blur-sm px-6 py-4 flex items-center justify-between group-hover:bg-[#161619] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(197,168,128,0.4)] group-hover:scale-110 transition-transform">⚡</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white tracking-wide">I Need Turnkey AI & Workflows!</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-tight">Automate operations with V&K custom agents and automated software integrations.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880] group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Automate Us →</span>
              </div>
            </button>

            {/* Primary Final Action Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-[#9A7B56] via-[#C5A880] to-[#7C643F] text-[#050507] text-xs font-semibold uppercase tracking-[0.2em] hover:opacity-95 active:scale-[0.99] transition-all shadow-[0_4px_25px_rgba(197,168,128,0.15)] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Transmitting Dataset...' : 'Complete Onboarding ✨'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}