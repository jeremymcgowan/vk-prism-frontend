'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from '../components/OnboardingHeader';
import VendorValueWedge from '../components/VendorValueWedge';

export default function StepFourShield() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    email_workspace_suite: '', // Initialized empty to force selection
    mdm_provider: '', // Initialized empty
    antivirus_status: '', // Initialized empty
    backup_frequency: '', // Initialized empty
  });

  const [workspaceAudit, setWorkspaceAudit] = useState({ satisfaction: 'GREAT', costPerception: 'FAIR' });
  const [mdmAudit, setMdmAudit] = useState({ satisfaction: 'GREAT', costPerception: 'FAIR' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShieldBypass = async () => {
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      workspace_vendor_audit: formData.email_workspace_suite && formData.email_workspace_suite !== 'NONE' ? workspaceAudit : null,
      mdm_vendor_audit: formData.mdm_provider && formData.mdm_provider !== 'NONE' ? mdmAudit : null,
      shield_managed_service_opt_in: true
    };

    console.log("VK Shield Managed IT Bypass Triggered:", payload);
    router.push('/onboarding/step-5');
  };

  const handleStandardNext = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      workspace_vendor_audit: formData.email_workspace_suite !== 'NONE' ? workspaceAudit : null,
      mdm_vendor_audit: formData.mdm_provider !== 'NONE' ? mdmAudit : null,
    };

    console.log("Step 4 Standard Data Submitted:", payload);
    router.push('/onboarding/step-5');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <OnboardingHeader currentStep={4} />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Main Card */}
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-8 my-6 relative overflow-hidden">
          
          {/* Subtle Accent Glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold tracking-widest text-cyan-400 uppercase mb-2">
              Step 4 of 6: VK Shield — IT & Cyber Security
            </h2>
            <h1 className="text-3xl font-light text-white">
              How is your fleet secured?
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleStandardNext} className="space-y-6">
            
            {/* Email / Workspace Suite */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Primary Email & Workspace Suite <span className="text-cyan-400">*</span>
              </label>
              <select 
                name="email_workspace_suite"
                required
                value={formData.email_workspace_suite}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="" disabled>Please Select Workspace Suite...</option>
                <option value="GOOGLE_WORKSPACE">Google Workspace (Gmail, Docs, Drive)</option>
                <option value="MICROSOFT_365">Microsoft 365 (Outlook, Teams, Office)</option>
                <option value="ZOHO">Zoho Workplace</option>
                <option value="PROTON">Proton Mail / Encrypted</option>
                <option value="NEED_WORKSPACE">Need Workspace Provisioned (V&K Setup)</option>
                <option value="NONE">Other / Basic Webmail</option>
              </select>

              <VendorValueWedge 
                vendorName={formData.email_workspace_suite.replace('_', ' ')}
                data={workspaceAudit}
                onChange={(f, v) => setWorkspaceAudit((prev) => ({ ...prev, [f]: v }))}
              />
            </div>

            {/* MDM Provider with Tooltip */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-400">
                  Mobile Device Management (MDM) <span className="text-cyan-400">*</span>
                </label>
                <div className="relative group flex items-center cursor-pointer">
                  <span className="text-xs text-slate-400 hover:text-slate-200">What is MDM? ⓘ</span>
                  <div className="absolute right-0 bottom-full mb-2 w-72 p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-20">
                    💡 Software that keeps company laptops & mobile devices secure—allowing remote wipes, security updates, and compliance enforcement.
                  </div>
                </div>
              </div>

              <select 
                name="mdm_provider"
                required
                value={formData.mdm_provider}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="" disabled>Please Select MDM Provider...</option>
                <option value="JAMF">Jamf Pro / Jamf Now (Apple)</option>
                <option value="KANDJI">Kandji</option>
                <option value="INTUNE">Microsoft Intune</option>
                <option value="RIPPLING_MDM">Rippling IT / MDM</option>
                <option value="NONE">No MDM / Manual Fleet</option>
              </select>

              <VendorValueWedge 
                vendorName={formData.mdm_provider !== 'NONE' ? formData.mdm_provider : ''}
                data={mdmAudit}
                onChange={(f, v) => setMdmAudit((prev) => ({ ...prev, [f]: v }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Endpoint Protection (Antivirus) <span className="text-cyan-400">*</span>
                </label>
                <select 
                  name="antivirus_status"
                  required
                  value={formData.antivirus_status}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="" disabled>Please Select Endpoint Protection...</option>
                  <option value="ACTIVE_EDR">Managed EDR (CrowdStrike / Defender)</option>
                  <option value="BASIC_AV">Basic Consumer Antivirus</option>
                  <option value="NONE">Default OS Defense Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Backup & Disaster Recovery <span className="text-cyan-400">*</span>
                </label>
                <select 
                  name="backup_frequency"
                  required
                  value={formData.backup_frequency}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="" disabled>Please Select Backup System...</option>
                  <option value="DAILY_AUTOMATED">Daily Immutable Cloud Backups</option>
                  <option value="WEEKLY">Weekly / Manual Backups</option>
                  <option value="NONE">No Formal Backup System</option>
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

            {/* Shield Fast-Track Card */}
            <button
              type="button"
              onClick={handleShieldBypass}
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 p-[1px] rounded-xl hover:border-cyan-500/60 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.4)] transition-all duration-300"
            >
              <div className="relative w-full bg-slate-950/80 backdrop-blur-sm px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-slate-900/80 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(6,182,212,0.3)] group-hover:scale-110 transition-transform">🛡️</span>
                  <div className="text-left">
                    <p className="text-base font-medium text-white">I Need Turnkey IT & Cyber Security!</p>
                    <p className="text-xs text-slate-400 mt-0.5">Let VK Shield manage device MDM, antivirus, backups, and security policies.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Deploy Shield →</span>
              </div>
            </button>

            {/* Primary Action Button (Anchored Below Fast Track) */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all shadow-[0_0_25px_-5px_rgba(6,182,212,0.5)] hover:shadow-[0_0_35px_-5px_rgba(6,182,212,0.7)] active:scale-[0.98] disabled:opacity-50"
              >
                Continue →
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}