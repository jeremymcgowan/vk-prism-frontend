'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from './components/OnboardingHeader';
import { useOnboarding } from '@/app/onboarding/OnboardingContext';

const INDUSTRY_SECTORS = [
  'B2B SaaS',
  'E-Commerce / Consumer Goods',
  'FinTech / Financial Services',
  'HealthTech / Healthcare',
  'Professional Services / Consulting',
  'GovTech / Defense',
  'Real Estate / Construction',
  'AI & Machine Learning Infrastructure',
  'Cleantech & Energy',
  'Other / Stealth'
];

export default function StepOneGateway() {
  const router = useRouter();
  const { formData, updateFormData, isHydrated } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isHydrated) return null; // Prevents UI flicker while loading sessionStorage

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValidationError(null);
    updateFormData({ [e.target.name]: e.target.value });
  };

  // --- Auto-Formatting US Phone Number: (XXX) XXX-XXXX ---
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }

    updateFormData({ contact_phone: formatted });
  };

  // --- Strict Email & Phone Validation Check ---
  const validateStepOne = (): boolean => {
    if (!formData.company_name?.trim()) {
      setValidationError('Please enter your Company Name.');
      return false;
    }
    if (!formData.contact_name?.trim()) {
      setValidationError('Please enter your Primary Contact Name.');
      return false;
    }
    if (!formData.industry) {
      setValidationError('Please select your Primary Industry Sector.');
      return false;
    }

    // Strict Email Validation (Requires valid domain TLD like .com, .co, .io)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!formData.contact_email || !emailRegex.test(formData.contact_email)) {
      setValidationError('Please enter a valid email address with domain extension (e.g., name@company.com).');
      return false;
    }

    // Full 10-Digit Phone Check
    const rawPhoneDigits = (formData.contact_phone || '').replace(/\D/g, '');
    if (rawPhoneDigits.length < 10) {
      setValidationError('Please enter a complete 10-digit phone number.');
      return false;
    }

    return true;
  };

  const saveDraftAndNavigate = (mode: 'EXPRESS_CONCIERGE' | 'STANDARD_AUDIT', isFastTrack: boolean) => {
    if (!validateStepOne()) return;

    setIsSubmitting(true);
    
    updateFormData({
      is_fast_track: isFastTrack,
      onboarding_mode: mode,
      step_completed: 1,
      industry: formData.industry || ''
    });

    router.push('/onboarding/step-2');
  };

  const handleFastTrack = () => {
    saveDraftAndNavigate('EXPRESS_CONCIERGE', true);
  };

  const handleStandardNext = (e: React.FormEvent) => {
    e.preventDefault();
    saveDraftAndNavigate('STANDARD_AUDIT', false);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#E4E4E7] flex flex-col font-sans antialiased">
      <OnboardingHeader currentStep={1} />

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
        
        <div className="w-full max-w-3xl lg:max-w-4xl relative my-8">
          
          {/* EXPANSIVE GOLD HALO */}
          <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-[#C5A880]/30 via-[#8B7325]/15 to-[#C5A880]/30 rounded-[2rem] blur-3xl opacity-80 pointer-events-none transition-all duration-700"></div>

          {/* MAIN CARD */}
          <div className="relative w-full bg-[#0A0A0C]/95 glass-panel border border-[#C5A880]/40 hover:border-[#C5A880]/60 shadow-[0_10px_50px_rgba(0,0,0,0.9),0_0_40px_-5px_rgba(197,168,128,0.25)] p-8 md:p-12 lg:p-14 rounded-2xl transition-all duration-500 overflow-hidden">
            
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#C5A880]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-10">
              <h2 className="text-xs font-bold tracking-[0.25em] text-[#C5A880] uppercase mb-3">
                Step 1 of 6: Prism Gateway Intake
              </h2>
              <h1 className="text-3xl lg:text-4xl font-light text-white tracking-tight">
                Initialize Your Corporate Profile
              </h1>
            </div>

            {/* Validation Banner */}
            {validationError && (
              <div className="mb-6 p-4 bg-red-950/50 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-3 animate-fadeIn">
                <span>⚠️</span>
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleStandardNext} className="space-y-6">
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                    Company Name <span className="text-[#C5A880]">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    required
                    value={formData.company_name || ''}
                    onChange={handleChange}
                    placeholder="e.g. Acme Industries, Inc."
                    className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                    Primary Contact Name <span className="text-[#C5A880]">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    required
                    value={formData.contact_name || ''}
                    onChange={handleChange}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                    Primary Industry Sector <span className="text-[#C5A880]">*</span>
                  </label>
                  <select
                    name="industry"
                    required
                    value={formData.industry || ''}
                    onChange={handleChange}
                    className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#0A0A0C] text-neutral-500">
                      Please Select
                    </option>
                    {INDUSTRY_SECTORS.map((sec) => (
                      <option key={sec} value={sec} className="bg-[#0A0A0C] text-white">
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                    Corporate Email <span className="text-[#C5A880]">*</span>
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    required
                    value={formData.contact_email || ''}
                    onChange={handleChange}
                    placeholder="jane@company.com"
                    className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                  Phone Number <span className="text-[#C5A880]">*</span>
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  required
                  value={formData.contact_phone || ''}
                  onChange={handlePhoneChange}
                  placeholder="(555) 000-0000"
                  className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                />
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#27272A]/80"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold">
                  <span className="px-4 bg-[#0A0A0C] text-neutral-500 uppercase tracking-[0.2em]">OR</span>
                </div>
              </div>

              {/* Express Card */}
              <button
                type="button"
                onClick={handleFastTrack}
                disabled={isSubmitting}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-[#C5A880]/20 via-transparent to-[#8B7325]/20 border border-[#C5A880]/40 p-[1px] rounded-xl hover:border-[#C5A880] hover:shadow-[0_0_30px_rgba(197,168,128,0.25)] transition-all duration-300 cursor-pointer"
              >
                <div className="relative w-full bg-[#121215]/95 backdrop-blur-md px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-[#161619] transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(197,168,128,0.4)] group-hover:scale-110 transition-transform">🚀</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white tracking-wide">Express Fast-Track Onboarding</p>
                      <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">Skip standard intake and request priority concierge onboarding with a V&amp;K partner.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880] group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Fast Track →</span>
                </div>
              </button>

              {/* Submit */}
              <div className="flex justify-end pt-4">
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