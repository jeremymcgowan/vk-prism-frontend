'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from '../components/OnboardingHeader';
import VendorValueWedge from '../components/VendorValueWedge';

export default function StepSixFlow() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    crm_system: '', // Initialized empty to force selection
    collaboration_tool: '', // Initialized empty
    automation_status: '', // Initialized empty
  });

  const [crmAudit, setCrmAudit] = useState({ satisfaction: 'GREAT', costPerception: 'FAIR' });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFlowBypass = async () => {
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      crm_vendor_audit: formData.crm_system && formData.crm_system !== 'NONE' ? crmAudit : null,
      flow_managed_service_opt_in: true
    };

    console.log("VK Flow Fast-Track Triggered:", payload);
    router.push('/onboarding/success');
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      crm_vendor_audit: formData.crm_system !== 'NONE' ? crmAudit : null,
    };

    console.log("Step 6 Final Submission:", payload);
    router.push('/onboarding/success');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <OnboardingHeader currentStep={6} />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Main Card */}
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-8 my-6 relative overflow-hidden">
          
          {/* Subtle Accent Glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold tracking-widest text-fuchsia-400 uppercase mb-2">
              Step 6 of 6: VK Flow — Workflows & Automation
            </h2>
            <h1 className="text-3xl font-light text-white">
              How does your business run day-to-day?
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleStandardSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Primary CRM & Customer Data System <span className="text-fuchsia-400">*</span>
              </label>
              <select 
                name="crm_system"
                required
                value={formData.crm_system}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
              >
                <option value="" disabled>Please Select CRM System...</option>
                <option value="HUBSPOT">HubSpot</option>
                <option value="SALESFORCE">Salesforce</option>
                <option value="NOTION">Notion / Airtable</option>
                <option value="OTHER">Other CRM</option>
                <option value="NONE">No CRM / Spreadsheets Only</option>
              </select>

              <VendorValueWedge 
                vendorName={formData.crm_system !== 'NONE' ? formData.crm_system : ''}
                data={crmAudit}
                onChange={(f, v) => setCrmAudit((prev) => ({ ...prev, [f]: v }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Team Communication <span className="text-fuchsia-400">*</span>
                </label>
                <select 
                  name="collaboration_tool"
                  required
                  value={formData.collaboration_tool}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                >
                  <option value="" disabled>Please Select Communication Tool...</option>
                  <option value="SLACK">Slack</option>
                  <option value="TEAMS">Microsoft Teams</option>
                  <option value="DISCORD">Discord</option>
                  <option value="EMAIL">Email / SMS Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Current Automation Level <span className="text-fuchsia-400">*</span>
                </label>
                <select 
                  name="automation_status"
                  required
                  value={formData.automation_status}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                >
                  <option value="" disabled>Please Select Automation Level...</option>
                  <option value="MANUAL">100% Manual Processes</option>
                  <option value="ZAPIER">Basic Zapier / Make Zaps</option>
                  <option value="CUSTOM_AI">Custom AI & API Workflows</option>
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-slate-900 text-slate-500 uppercase tracking-wider">OR</span>
              </div>
            </div>

            {/* Flow Fast-Track Card */}
            <button
              type="button"
              onClick={handleFlowBypass}
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-fuchsia-600/30 to-pink-600/30 border border-fuchsia-500/30 p-[1px] rounded-xl hover:border-fuchsia-500/60 hover:shadow-[0_0_30px_-10px_rgba(217,70,239,0.4)] transition-all duration-300"
            >
              <div className="relative w-full bg-slate-950/80 backdrop-blur-sm px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-slate-900/80 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(217,70,239,0.3)] group-hover:scale-110 transition-transform">⚡</span>
                  <div className="text-left">
                    <p className="text-base font-medium text-white">I Need Turnkey AI & Workflows!</p>
                    <p className="text-xs text-slate-400 mt-0.5">Automate operations with V&K custom agents and automated software integrations.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-fuchsia-400 group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Automate Us →</span>
              </div>
            </button>

            {/* Primary Action Button (Anchored Below Fast Track) */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-semibold rounded-xl hover:from-fuchsia-500 hover:to-pink-500 transition-all shadow-[0_0_25px_-5px_rgba(217,70,239,0.5)] hover:shadow-[0_0_35px_-5px_rgba(217,70,239,0.7)] active:scale-[0.98] disabled:opacity-50"
              >
                Complete Onboarding ✨
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}