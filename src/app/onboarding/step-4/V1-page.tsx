'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StepFourShield() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    mdm_provider: 'NONE',
    antivirus_status: 'UNMANAGED',
    backup_frequency: 'NONE',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // The Magic VK Shield Management Bypass Logic
  const handleShieldBypass = async () => {
    setIsSubmitting(true);
    
    // Flags for full turnkey IT management package
    const payload = {
      ...formData,
      mdm_provider: 'REQUESTED_VK_SHIELD',
      antivirus_status: 'REQUESTED_VK_SHIELD',
      backup_frequency: 'REQUESTED_VK_SHIELD',
      shield_managed_service_opt_in: true
    };

    console.log("VK Shield Managed Fast-Track Triggered:", payload);
    // Move to Step 5
    router.push('/onboarding/step-5');
  };

  const handleStandardNext = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log("Standard IT Stack Submitted:", formData);
    // Move to Step 5
    router.push('/onboarding/step-5');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Container */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-10 mt-10 mb-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold tracking-widest text-cyan-500 uppercase mb-2">
            Step 4 of 6: IT Infrastructure & Cyber Risk
          </h2>
          <h1 className="text-3xl font-light text-white">
            How do you manage device security?
          </h1>
        </div>

        {/* Standard Input Form */}
        <form onSubmit={handleStandardNext} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Mobile Device Management (MDM)</label>
            <select 
              name="mdm_provider"
              value={formData.mdm_provider}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="NONE">None / Bring Your Own Device (BYOD)</option>
              <option value="JAMF">Jamf (Apple)</option>
              <option value="INTUNE">Microsoft Intune</option>
              <option value="KANDJI">Kandji</option>
              <option value="OTHER">Other Provider</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Endpoint Antivirus</label>
              <select 
                name="antivirus_status"
                value={formData.antivirus_status}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="UNMANAGED">Basic / Free Antivirus</option>
                <option value="EDR_MANAGED">Managed EDR (CrowdStrike, Defender, SentinelOne)</option>
                <option value="NONE">No Protection Active</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Cloud Backup Strategy</label>
              <select 
                name="backup_frequency"
                value={formData.backup_frequency}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="DAILY_AUTOMATED">Daily Automated Backups</option>
                <option value="WEEKLY_MANUAL">Weekly / Manual Backups</option>
                <option value="NONE">No Backups Set Up</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Continue →
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

        {/* The VK Shield Managed Bypass Button */}
        <button
          onClick={handleShieldBypass}
          disabled={isSubmitting}
          className="w-full group relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 p-[1px] rounded-xl hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.4)] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative w-full bg-slate-950/50 backdrop-blur-sm px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-slate-900/50 transition-colors">
            <div className="flex items-center gap-4">
              <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform">🛡️</span>
              <div className="text-left">
                <p className="text-lg font-medium text-white">I need Turnkey IT Security!</p>
                <p className="text-sm text-slate-400">Deploy VK Shield across all our workstations automatically.</p>
              </div>
            </div>
            <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">Protect Us →</span>
          </div>
        </button>

      </div>
    </div>
  );
}