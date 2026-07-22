'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StepSixFlow() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    crm_system: 'NONE',
    collaboration_tool: 'SLACK',
    automation_status: 'MANUAL',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // The VK Flow Fast-Track & Final Submit
  const handleFlowBypass = async () => {
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      crm_system: 'REQUESTED_VK_FLOW',
      automation_status: 'REQUESTED_VK_FLOW_AI',
      flow_managed_service_opt_in: true
    };

    console.log("VK Flow Fast-Track & Finalizing Submission:", payload);
    // Route to Success Screen
    router.push('/onboarding/success');
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log("Standard Flow Data Submitted & Finalizing:", formData);
    // Route to Success Screen
    router.push('/onboarding/success');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Container */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-10 mt-10 mb-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold tracking-widest text-fuchsia-500 uppercase mb-2">
            Step 6 of 6: Workflows & Automation
          </h2>
          <h1 className="text-3xl font-light text-white">
            How does your business run day-to-day?
          </h1>
        </div>

        {/* Standard Input Form */}
        <form onSubmit={handleStandardSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Primary CRM / Customer Data</label>
            <select 
              name="crm_system"
              value={formData.crm_system}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
            >
              <option value="NONE">No CRM / Spreadsheets Only</option>
              <option value="HUBSPOT">HubSpot</option>
              <option value="SALESFORCE">Salesforce</option>
              <option value="NOTION">Notion / Airtable</option>
              <option value="OTHER">Other CRM</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Team Communication</label>
              <select 
                name="collaboration_tool"
                value={formData.collaboration_tool}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
              >
                <option value="SLACK">Slack</option>
                <option value="TEAMS">Microsoft Teams</option>
                <option value="DISCORD">Discord</option>
                <option value="EMAIL">Email / SMS Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Current Automation</label>
              <select 
                name="automation_status"
                value={formData.automation_status}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
              >
                <option value="MANUAL">100% Manual Processes</option>
                <option value="ZAPIER">Basic Zapier / Make Zaps</option>
                <option value="CUSTOM_AI">Custom AI & API Workflows</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-medium rounded-lg hover:from-fuchsia-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-fuchsia-500/25 disabled:opacity-50"
            >
              Complete Onboarding ✨
            </button>
          </div>
        </form>

        {/* The Fast-Track Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-slate-900 text-slate-500">OR</span>
          </div>
        </div>

        {/* The VK Flow Managed Bypass Button */}
        <button
          onClick={handleFlowBypass}
          disabled={isSubmitting}
          className="w-full group relative overflow-hidden bg-gradient-to-r from-fuchsia-600 to-pink-600 p-[1px] rounded-xl hover:shadow-[0_0_40px_-10px_rgba(217,70,239,0.4)] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative w-full bg-slate-950/50 backdrop-blur-sm px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-slate-900/50 transition-colors">
            <div className="flex items-center gap-4">
              <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform">⚡</span>
              <div className="text-left">
                <p className="text-lg font-medium text-white">I need Turnkey AI & Workflows!</p>
                <p className="text-sm text-slate-400">Automate our operations with V&K custom agents and integrations.</p>
              </div>
            </div>
            <span className="text-fuchsia-400 group-hover:translate-x-1 transition-transform">Automate Us →</span>
          </div>
        </button>

      </div>
    </div>
  );
}