'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from '../components/OnboardingHeader';

export default function StepTwoIdentity() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skipAddress, setSkipAddress] = useState(false);
  
  const [formData, setFormData] = useState({
    legal_structure: '', // Initialized to empty string to force selection
    formation_year: '',
    hq_address_line_1: '',
    hq_city: '',
    hq_state: '',
    hq_postal_code: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVirtualOfficeBypass = async () => {
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      hq_address_type: 'VK_VIRTUAL_OFFICE_PENDING',
      hq_address_verified_usps: false
    };

    console.log("Virtual Office / Co-Working Fast-Track Triggered:", payload);
    router.push('/onboarding/step-3');
  };

  const handleStandardNext = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      hq_address_type: skipAddress ? 'SKIP_VERIFY_LATER' : 'PHYSICAL',
      hq_address_verified_usps: false
    };

    console.log("Step 2 Standard Data Submitted:", payload);
    router.push('/onboarding/step-3');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <OnboardingHeader currentStep={2} />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Main Card */}
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-8 my-6 relative overflow-hidden">
          
          {/* Subtle Accent Glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-2">
              Step 2 of 6: Identity & Infrastructure
            </h2>
            <h1 className="text-3xl font-light text-white">
              Where is your headquarters?
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleStandardNext} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Legal Structure <span className="text-emerald-400">*</span>
                </label>
                <select 
                  name="legal_structure"
                  required
                  value={formData.legal_structure}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="" disabled>Please Select Legal Structure...</option>
                  <option value="DELAWARE_C_CORP">Delaware C-Corp (VC-Ready)</option>
                  <option value="C_CORP_OTHER">C-Corp (Other State)</option>
                  <option value="LLC">LLC (Limited Liability Co.)</option>
                  <option value="S_CORP">S-Corp</option>
                  <option value="LLP_LP">LLP / LP (Partnership)</option>
                  <option value="SOLE_PROP">Sole Proprietorship</option>
                  <option value="B_CORP">B-Corp / Benefit Corp</option>
                  <option value="UNKNOWN">I'm not sure yet / Unincorporated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Formation Year</label>
                <input
                  type="number"
                  name="formation_year"
                  value={formData.formation_year}
                  onChange={handleChange}
                  placeholder="e.g. 2024"
                  className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Address Input Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-slate-300">HQ Physical Address</label>
                
                {/* Skip Address Toggle with Tooltip */}
                <div className="relative group flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="skipAddress"
                    checked={skipAddress}
                    onChange={(e) => setSkipAddress(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                  />
                  <label htmlFor="skipAddress" className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1">
                    Skip address for now ⓘ
                  </label>

                  <div className="absolute right-0 bottom-full mb-2 w-72 p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-20">
                    💡 All benefits and features of VK Prism cannot be unlocked until address verification is completed. You are entirely welcome to complete this at your convenience.
                  </div>
                </div>
              </div>

              {!skipAddress && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <input
                      type="text"
                      name="hq_address_line_1"
                      value={formData.hq_address_line_1}
                      onChange={handleChange}
                      placeholder="123 Business Blvd, Suite 400"
                      className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <input
                        type="text"
                        name="hq_city"
                        value={formData.hq_city}
                        onChange={handleChange}
                        placeholder="City"
                        className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="text"
                        name="hq_state"
                        value={formData.hq_state}
                        onChange={handleChange}
                        placeholder="State (e.g. DE)"
                        className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="text"
                        name="hq_postal_code"
                        value={formData.hq_postal_code}
                        onChange={handleChange}
                        placeholder="ZIP Code"
                        className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
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

            {/* Co-Working & Virtual Office Bypass Card */}
            <button
              type="button"
              onClick={handleVirtualOfficeBypass}
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/30 p-[1px] rounded-xl hover:border-emerald-500/60 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)] transition-all duration-300"
            >
              <div className="relative w-full bg-slate-950/80 backdrop-blur-sm px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-slate-900/80 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">🏢</span>
                  <div className="text-left">
                    <p className="text-base font-medium text-white">Tell Me about Co-Working and Virtual Offices in My Prism Portal!</p>
                    <p className="text-xs text-slate-400 mt-0.5">Learn how V&K provides corporate address compliance, mail scanning, and co-working space access.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Explore Options →</span>
              </div>
            </button>

            {/* Primary Action Button (Anchored Below Fast Track) */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_-5px_rgba(16,185,129,0.7)] active:scale-[0.98] disabled:opacity-50"
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