'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from '../components/OnboardingHeader';
import VendorValueWedge from '../components/VendorValueWedge';
import { useOnboarding } from '@/app/onboarding/OnboardingContext';

export default function StepFourShield() {
  const router = useRouter();
  const { formData, updateFormData, isHydrated } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [workspaceAudit, setWorkspaceAudit] = useState({
    satisfaction: formData.workspace_vendor_audit?.satisfaction || 'GREAT',
    costPerception: formData.workspace_vendor_audit?.costPerception || 'FAIR',
  });
  const [mdmAudit, setMdmAudit] = useState({
    satisfaction: formData.mdm_vendor_audit?.satisfaction || 'GREAT',
    costPerception: formData.mdm_vendor_audit?.costPerception || 'FAIR',
  });

  if (!isHydrated) return null; // Prevents UI flicker while loading sessionStorage

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  const handleWorkspaceAuditChange = (field: 'satisfaction' | 'costPerception', value: string) => {
    const updated = { ...workspaceAudit, [field]: value };
    setWorkspaceAudit(updated);
    updateFormData({ workspace_vendor_audit: updated });
  };

  const handleMdmAuditChange = (field: 'satisfaction' | 'costPerception', value: string) => {
    const updated = { ...mdmAudit, [field]: value };
    setMdmAudit(updated);
    updateFormData({ mdm_vendor_audit: updated });
  };

  const handleShieldBypass = async () => {
    setIsSubmitting(true);
    
    updateFormData({
      workspace_vendor_audit: formData.email_workspace_suite && formData.email_workspace_suite !== 'NONE' ? workspaceAudit : null,
      mdm_vendor_audit: formData.mdm_provider && formData.mdm_provider !== 'NONE' ? mdmAudit : null,
      shield_managed_service_opt_in: true,
      email_workspace_suite: formData.email_workspace_suite || 'NEED_WORKSPACE',
      mdm_provider: formData.mdm_provider || 'NONE',
      antivirus_status: formData.antivirus_status || 'NONE',
      backup_frequency: formData.backup_frequency || 'NONE'
    });

    router.push('/onboarding/step-5');
  };

  const handleStandardNext = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    updateFormData({
      workspace_vendor_audit: formData.email_workspace_suite !== 'NONE' ? workspaceAudit : null,
      mdm_vendor_audit: formData.mdm_provider !== 'NONE' ? mdmAudit : null,
      shield_managed_service_opt_in: false
    });

    router.push('/onboarding/step-5');
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#E4E4E7] flex flex-col font-mono antialiased">
      <OnboardingHeader currentStep={4} />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Main Card */}
        <div className="w-full max-w-2xl bg-[#0A0A0C]/90 glass-panel border border-[#1F1F1F] shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-8 my-6 relative overflow-hidden rounded-2xl">
          
          {/* Subtle Champagne Gold Glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold tracking-[0.2em] text-[#C5A880] uppercase mb-2">
              Step 4 of 6: VK Shield — IT &amp; Cyber Security
            </h2>
            <h1 className="text-2xl font-light text-white tracking-wide">
              How is your fleet secured?
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleStandardNext} className="space-y-6">
            
            {/* Email / Workspace Suite */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                Primary Email &amp; Workspace Suite <span className="text-[#C5A880]">*</span>
              </label>
              <select 
                name="email_workspace_suite"
                required
                value={formData.email_workspace_suite || ''}
                onChange={handleChange}
                className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
              >
                <option value="" disabled>Please Select Workspace Suite...</option>
                <option value="GOOGLE_WORKSPACE">Google Workspace (Gmail, Docs, Drive)</option>
                <option value="MICROSOFT_365">Microsoft 365 (Outlook, Teams, Office)</option>
                <option value="ZOHO">Zoho Workplace</option>
                <option value="PROTON">Proton Mail / Encrypted</option>
                <option value="NEED_WORKSPACE">Need Workspace Provisioned (V&amp;K Setup)</option>
                <option value="NONE">Other / Basic Webmail</option>
              </select>

              {formData.email_workspace_suite && formData.email_workspace_suite !== 'NONE' && formData.email_workspace_suite !== 'NEED_WORKSPACE' && (
                <div className="mt-4">
                  <VendorValueWedge 
                    vendorName={formData.email_workspace_suite.replace('_', ' ')}
                    data={workspaceAudit}
                    onChange={handleWorkspaceAuditChange}
                  />
                </div>
              )}
            </div>

            {/* MDM Provider with Tooltip */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-medium uppercase tracking-widest text-neutral-400">
                  Mobile Device Management (MDM) <span className="text-[#C5A880]">*</span>
                </label>
                <div className="relative group flex items-center cursor-pointer">
                  <span className="text-xs text-neutral-400 hover:text-neutral-200">What is MDM? ⓘ</span>
                  <div className="absolute right-0 bottom-full mb-2 w-72 p-3 bg-[#121215] border border-[#27272A] rounded-xl text-xs text-neutral-300 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-20">
                    💡 Software that keeps company laptops &amp; mobile devices secure—allowing remote wipes, security updates, and compliance enforcement.
                  </div>
                </div>
              </div>

              <select 
                name="mdm_provider"
                required
                value={formData.mdm_provider || ''}
                onChange={handleChange}
                className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
              >
                <option value="" disabled>Please Select MDM Provider...</option>
                <option value="JAMF">Jamf Pro / Jamf Now (Apple)</option>
                <option value="KANDJI">Kandji</option>
                <option value="INTUNE">Microsoft Intune</option>
                <option value="RIPPLING_MDM">Rippling IT / MDM</option>
                <option value="NONE">No MDM / Manual Fleet</option>
              </select>

              {formData.mdm_provider && formData.mdm_provider !== 'NONE' && (
                <div className="mt-4">
                  <VendorValueWedge 
                    vendorName={formData.mdm_provider.replace('_', ' ')}
                    data={mdmAudit}
                    onChange={handleMdmAuditChange}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                  Endpoint Protection (Antivirus) <span className="text-[#C5A880]">*</span>
                </label>
                <select 
                  name="antivirus_status"
                  required
                  value={formData.antivirus_status || ''}
                  onChange={handleChange}
                  className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
                >
                  <option value="" disabled>Please Select Endpoint Protection...</option>
                  <option value="ACTIVE_EDR">Managed EDR (CrowdStrike / Defender)</option>
                  <option value="BASIC_AV">Basic Consumer Antivirus</option>
                  <option value="NONE">Default OS Defense Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                  Backup &amp; Disaster Recovery <span className="text-[#C5A880]">*</span>
                </label>
                <select 
                  name="backup_frequency"
                  required
                  value={formData.backup_frequency || ''}
                  onChange={handleChange}
                  className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
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
                <div className="w-full border-t border-[#27272A]/80"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-medium">
                <span className="px-4 bg-[#0A0A0C] text-neutral-500 uppercase tracking-widest">OR</span>
              </div>
            </div>

            {/* Shield Fast-Track Card */}
            <button
              type="button"
              onClick={handleShieldBypass}
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-[#C5A880]/20 via-transparent to-[#8B7325]/20 border border-[#C5A880]/30 p-[1px] rounded-xl hover:border-[#C5A880]/70 hover:shadow-[0_0_25px_rgba(197,168,128,0.2)] transition-all duration-300 cursor-pointer"
            >
              <div className="relative w-full bg-[#121215]/90 backdrop-blur-sm px-6 py-4 rounded-xl flex items-center justify-between group-hover:bg-[#161619] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(197,168,128,0.4)] group-hover:scale-110 transition-transform">🛡️</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white tracking-wide">I Need Turnkey IT &amp; Cyber Security!</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-tight">Let VK Shield manage device MDM, antivirus, backups, and security policies.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880] group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Deploy Shield →</span>
              </div>
            </button>

            {/* Primary Action Button */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => router.push('/onboarding/step-3')}
                className="px-6 py-3 border border-[#27272A] text-neutral-400 hover:text-white hover:border-neutral-500 text-xs font-semibold uppercase tracking-[0.2em] rounded-xl transition-colors cursor-pointer"
              >
                ← Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-[#9A7B56] via-[#C5A880] to-[#7C643F] text-[#050507] text-xs font-semibold uppercase tracking-[0.2em] rounded-xl hover:opacity-95 active:scale-[0.99] transition-all shadow-[0_4px_25px_rgba(197,168,128,0.15)] disabled:opacity-50 cursor-pointer"
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