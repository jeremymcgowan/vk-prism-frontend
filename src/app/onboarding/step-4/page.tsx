'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from '../components/OnboardingHeader';
import VendorValueWedge from '../components/VendorValueWedge';
import { useOnboarding } from '@/app/onboarding/OnboardingContext';

// Helper Tooltip Component
function Tooltip({ text }: { text: string }) {
  return (
    <span className="relative group inline-block ml-1 cursor-help">
      <span className="text-[#C5A880] text-xs font-bold hover:text-white transition-colors">ⓘ</span>
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-30 w-max max-w-[270px] animate-fadeIn">
        <span className="bg-[#18181B] text-[#C5A880] text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-[#C5A880]/40 shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-center leading-tight whitespace-normal">
          {text}
        </span>
        <span className="w-2 h-2 bg-[#18181B] border-r border-b border-[#C5A880]/40 rotate-45 -mt-1"></span>
      </span>
    </span>
  );
}

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
    const { name, value } = e.target;
    
    // Auto-adjust VPN value if remote workforce changes to YES and VPN was previously set to NOT_APPLICABLE
    if (name === 'has_remote_workers' && value === 'YES' && formData.has_vpn === 'NOT_APPLICABLE') {
      updateFormData({ [name]: value, has_vpn: '' });
    } else {
      updateFormData({ [name]: value });
    }
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

  const isVpnNeeded = formData.has_vpn === 'NEED_VPN';

  const handleShieldBypass = async () => {
    setIsSubmitting(true);
    
    updateFormData({
      workspace_vendor_audit: formData.email_workspace_suite && formData.email_workspace_suite !== 'NONE' ? workspaceAudit : null,
      mdm_vendor_audit: formData.mdm_provider && formData.mdm_provider !== 'NONE' ? mdmAudit : null,
      shield_managed_service_opt_in: true,
      email_workspace_suite: formData.email_workspace_suite || 'NEED_WORKSPACE',
      mdm_provider: formData.mdm_provider || 'NONE',
      antivirus_status: formData.antivirus_status || 'NONE',
      backup_frequency: formData.backup_frequency || 'NONE',
      has_remote_workers: formData.has_remote_workers || 'NO',
      has_vpn: formData.has_vpn || 'NEED_VPN',
      vpn_lead_flag: true
    });

    router.push('/onboarding/step-5');
  };

  const handleStandardNext = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    updateFormData({
      workspace_vendor_audit: formData.email_workspace_suite !== 'NONE' ? workspaceAudit : null,
      mdm_vendor_audit: formData.mdm_provider !== 'NONE' ? mdmAudit : null,
      shield_managed_service_opt_in: false,
      has_remote_workers: formData.has_remote_workers || 'NO',
      has_vpn: formData.has_vpn || 'NO',
      vpn_lead_flag: isVpnNeeded
    });

    router.push('/onboarding/step-5');
  };

  const isRemoteTeam = formData.has_remote_workers === 'YES';

  return (
    <div className="min-h-screen bg-[#050507] text-[#E4E4E7] flex flex-col font-sans antialiased">
      <OnboardingHeader currentStep={4} />

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
        
        {/* Responsive scaling container */}
        <div className="w-full max-w-3xl lg:max-w-4xl relative my-8">
          
          {/* EXPANSIVE GOLD HALO */}
          <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-[#C5A880]/30 via-[#8B7325]/15 to-[#C5A880]/30 rounded-[2rem] blur-3xl opacity-80 pointer-events-none transition-all duration-700"></div>

          {/* MAIN CARD */}
          <div className="relative w-full bg-[#0A0A0C]/95 glass-panel border border-[#C5A880]/40 hover:border-[#C5A880]/60 shadow-[0_10px_50px_rgba(0,0,0,0.9),0_0_40px_-5px_rgba(197,168,128,0.25)] p-8 md:p-12 lg:p-14 rounded-2xl transition-all duration-500 overflow-hidden">
            
            {/* Internal Corner Accent Glow */}
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#C5A880]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-10">
              <h2 className="text-xs font-bold tracking-[0.25em] text-[#C5A880] uppercase mb-3">
                Step 4 of 6: VK Shield — IT &amp; Cyber Security
              </h2>
              <h1 className="text-3xl lg:text-4xl font-light text-white tracking-tight">
                How is your fleet secured?
              </h1>
            </div>

            <form onSubmit={handleStandardNext} className="space-y-6">
              
              {/* Email / Workspace Suite */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                  Primary Email &amp; Workspace Suite <span className="text-[#C5A880]">*</span> <Tooltip text="The core cloud email and document ecosystem used across your company." />
                </label>
                <select 
                  name="email_workspace_suite"
                  required
                  value={formData.email_workspace_suite || ''}
                  onChange={handleChange}
                  className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner cursor-pointer"
                >
                  <option value="" disabled className="bg-[#0A0A0C] text-neutral-500">Please Select Workspace Suite...</option>
                  <option value="GOOGLE_WORKSPACE" className="bg-[#0A0A0C] text-white">Google Workspace (Gmail, Docs, Drive)</option>
                  <option value="MICROSOFT_365" className="bg-[#0A0A0C] text-white">Microsoft 365 (Outlook, Teams, Office)</option>
                  <option value="ZOHO" className="bg-[#0A0A0C] text-white">Zoho Workplace</option>
                  <option value="PROTON" className="bg-[#0A0A0C] text-white">Proton Mail / Encrypted</option>
                  <option value="NEED_WORKSPACE" className="bg-[#0A0A0C] text-white">Need Workspace Provisioned (V&amp;K Setup)</option>
                  <option value="NONE" className="bg-[#0A0A0C] text-white">Other / Basic Webmail</option>
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

              {/* MDM Provider with Standardized Tooltip */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                  Mobile Device Management (MDM) <span className="text-[#C5A880]">*</span> <Tooltip text="Software that keeps company laptops & mobile devices secure—allowing remote wipes, security updates, and compliance enforcement." />
                </label>

                <select 
                  name="mdm_provider"
                  required
                  value={formData.mdm_provider || ''}
                  onChange={handleChange}
                  className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner cursor-pointer"
                >
                  <option value="" disabled className="bg-[#0A0A0C] text-neutral-500">Please Select MDM Provider...</option>
                  <option value="JAMF" className="bg-[#0A0A0C] text-white">Jamf Pro / Jamf Now (Apple)</option>
                  <option value="KANDJI" className="bg-[#0A0A0C] text-white">Kandji</option>
                  <option value="INTUNE" className="bg-[#0A0A0C] text-white">Microsoft Intune</option>
                  <option value="RIPPLING_MDM" className="bg-[#0A0A0C] text-white">Rippling IT / MDM</option>
                  <option value="NONE" className="bg-[#0A0A0C] text-white">No MDM / Manual Fleet</option>
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

              {/* Endpoint Protection & Backups */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                    Endpoint Protection (Antivirus) <span className="text-[#C5A880]">*</span> <Tooltip text="Managed Antivirus/EDR prevents ransomware and unauthorized execution on fleet devices." />
                  </label>
                  <select 
                    name="antivirus_status"
                    required
                    value={formData.antivirus_status || ''}
                    onChange={handleChange}
                    className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#0A0A0C] text-neutral-500">Please Select Endpoint Protection...</option>
                    <option value="ACTIVE_EDR" className="bg-[#0A0A0C] text-white">Managed EDR (CrowdStrike / Defender)</option>
                    <option value="BASIC_AV" className="bg-[#0A0A0C] text-white">Basic Consumer Antivirus</option>
                    <option value="NONE" className="bg-[#0A0A0C] text-white">Default OS Defense Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                    Backup &amp; Disaster Recovery <span className="text-[#C5A880]">*</span> <Tooltip text="Automated backups ensure business continuity in the event of hardware failure or loss." />
                  </label>
                  <select 
                    name="backup_frequency"
                    required
                    value={formData.backup_frequency || ''}
                    onChange={handleChange}
                    className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#0A0A0C] text-neutral-500">Please Select Backup System...</option>
                    <option value="DAILY_AUTOMATED" className="bg-[#0A0A0C] text-white">Daily Immutable Cloud Backups</option>
                    <option value="WEEKLY" className="bg-[#0A0A0C] text-white">Weekly / Manual Backups</option>
                    <option value="NONE" className="bg-[#0A0A0C] text-white">No Formal Backup System</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Section: Remote Workers & Corporate VPN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#27272A]/80">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                    Remote / Hybrid Workforce <span className="text-[#C5A880]">*</span> <Tooltip text="Indicate if employees or contractors access corporate systems outside the main office." />
                  </label>
                  <select 
                    name="has_remote_workers"
                    required
                    value={formData.has_remote_workers || ''}
                    onChange={handleChange}
                    className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#0A0A0C] text-neutral-500">Do you have remote workers?</option>
                    <option value="YES" className="bg-[#0A0A0C] text-white">Yes, remote or hybrid team</option>
                    <option value="NO" className="bg-[#0A0A0C] text-white">No, 100% on-site in physical office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                    Corporate VPN Infrastructure <span className="text-[#C5A880]">*</span> <Tooltip text="A Corporate VPN encrypts internet traffic from remote laptops, protecting sensitive client data and internal systems from untrusted public Wi-Fi networks." />
                  </label>
                  <select 
                    name="has_vpn"
                    required
                    value={formData.has_vpn || ''}
                    onChange={handleChange}
                    className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#0A0A0C] text-neutral-500">Do you enforce a VPN?</option>
                    
                    {/* Hide N/A option when company operates with remote/hybrid workers */}
                    {!isRemoteTeam && (
                      <option value="NOT_APPLICABLE" className="bg-[#0A0A0C] text-white">N/A (100% On-Site / No Remote Access)</option>
                    )}
                    
                    <option value="YES" className="bg-[#0A0A0C] text-white">Yes, Corporate VPN enforced</option>
                    <option value="NEED_VPN" className="bg-[#0A0A0C] text-white">No VPN / We need one!</option>
                  </select>
                </div>
              </div>

              {/* Lead Alert Banner if VPN Needed */}
              {isVpnNeeded && (
                <div className="p-4 bg-[#C5A880]/10 border border-[#C5A880]/40 rounded-xl text-xs text-[#C5A880] flex items-center gap-3 animate-fadeIn">
                  <span className="text-lg">🛡️</span>
                  <div>
                    <p className="font-bold uppercase tracking-wider">V&amp;K Shield Corporate VPN Provisioning Lead Flagged</p>
                    <p className="text-neutral-300 mt-0.5">Operating remote teams without a VPN leaves corporate traffic unencrypted. V&amp;K Shield will automatically evaluate a zero-trust VPN solution for your team.</p>
                  </div>
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

              {/* Shield Fast-Track Card */}
              <button
                type="button"
                onClick={handleShieldBypass}
                disabled={isSubmitting}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-[#C5A880]/20 via-transparent to-[#8B7325]/20 border border-[#C5A880]/40 p-[1px] rounded-xl hover:border-[#C5A880] hover:shadow-[0_0_30px_rgba(197,168,128,0.25)] transition-all duration-300 cursor-pointer"
              >
                <div className="relative w-full bg-[#121215]/95 backdrop-blur-md px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-[#161619] transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(197,168,128,0.4)] group-hover:scale-110 transition-transform">🛡️</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white tracking-wide">I Need Turnkey IT &amp; Cyber Security!</p>
                      <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">Let VK Shield manage device MDM, antivirus, backups, and security policies.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880] group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Deploy Shield →</span>
                </div>
              </button>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-[#27272A]/80">
                <button
                  type="button"
                  onClick={() => router.push('/onboarding/step-3')}
                  className="px-6 py-3 border border-[#27272A] text-neutral-400 hover:text-white hover:border-neutral-500 text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-colors cursor-pointer"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-3.5 bg-[#C5A880] hover:bg-[#D4B990] text-[#050507] text-xs font-extrabold uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_0_25px_rgba(197,168,128,0.3)] hover:shadow-[0_0_35px_rgba(197,168,128,0.5)] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  Continue →
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}