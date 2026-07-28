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

  const isSeekingIncentive = formData.is_seeking_incentive !== false; // Default opt-in to rewards!

  if (!isHydrated) return null; // Prevents UI flicker while loading sessionStorage

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValidationError(null);
    updateFormData({ [e.target.name]: e.target.value });
  };

  // --- Auto-Format Contact Name (Initials -> UPPERCASE, Words -> Title Case) ---
  const formatContactName = (rawName: string): string => {
    const trimmed = rawName.trim();
    if (!trimmed) return '';

    return trimmed
      .split(/\s+/)
      .map((part) => {
        // Handle initials e.g. "jp" -> "JP"
        if (/^[a-zA-Z\.]{2,4}$/.test(part) && !part.includes('.')) {
          if (part.length <= 3) return part.toUpperCase();
        }
        if (/^[a-zA-Z]$/.test(part)) return part.toUpperCase();
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      })
      .join(' ');
  };

  const handleNameBlur = () => {
    if (formData.contact_name) {
      const formatted = formatContactName(formData.contact_name);
      updateFormData({ contact_name: formatted });
    }
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

  // --- Incentive Toggle Handler ---
  const handleIncentiveToggle = (optIn: boolean) => {
    updateFormData({
      is_seeking_incentive: optIn,
      readiness_completion_pct: optIn ? 25 : 15
    });
  };

  // --- Strict Email, Phone & Name Validation Check ---
  const validateStepOne = (): boolean => {
    if (!formData.company_name?.trim()) {
      setValidationError('Please enter your Company Name.');
      return false;
    }

    // Strict Contact Name Check: Alpha, spaces, hyphens, dots, apostrophes only; min 2 alpha chars
    const rawName = (formData.contact_name || '').trim();
    const nameRegex = /^[a-zA-Z\s\-\'\.]+$/;
    const alphaCount = rawName.replace(/[^a-zA-Z]/g, '').length;

    if (!rawName || !nameRegex.test(rawName) || alphaCount < 2) {
      setValidationError('Please enter a valid Primary Contact Name (minimum 2 letters, no numbers or special symbols).');
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
    
    // Auto-format name before proceeding
    const formattedName = formatContactName(formData.contact_name || '');

    updateFormData({
      // --- Standardized crm_entities 1:1 Schema Mapping ---
      display_name: formData.company_name || '',
      legal_name: formData.company_name || '',
      website_url: formData.company_url || null,
      owner_name: formattedName,
      owner_email: formData.contact_email || '',
      owner_phone: formData.contact_phone || '',
      industry: formData.industry || '',

      // --- Legacy UI Compatibility Keys ---
      company_name: formData.company_name || '',
      company_url: formData.company_url || null,
      contact_name: formattedName,
      contact_email: formData.contact_email || '',
      contact_phone: formData.contact_phone || '',
      
      // --- Flow Routing & Status Flags ---
      is_fast_track: isFastTrack,
      onboarding_mode: mode,
      step_completed: 1,
      status: 'ONBOARDING',
      is_seeking_incentive: isSeekingIncentive,
      readiness_completion_pct: isSeekingIncentive ? 25 : 15
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
              
              {/* Row 1: Company Identity */}
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
                    Company Website URL <span className="text-neutral-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="company_url"
                    value={formData.company_url || ''}
                    onChange={handleChange}
                    placeholder="e.g. https://acme.io or acme.com"
                    className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Row 2: Primary Contact & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    onBlur={handleNameBlur}
                    placeholder="e.g. Jane Doe or J.P."
                    className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                  />
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

              {/* Row 3: Industry & Phone */}
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
              </div>

              {/* 💎 THE GAMIFIED B2B FINTECH INCENTIVE BANNER */}
              <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#121215] via-[#18181B] to-[#0A0A0C] border-2 border-[#C5A880]/60 shadow-[0_0_30px_rgba(197,168,128,0.15)] overflow-hidden transition-all duration-300 my-8">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#C5A880]/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#C5A880] text-black font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                        Exclusive Reward
                      </span>
                      <span className="text-xs font-mono font-bold text-[#C5A880] uppercase tracking-wider">
                        V&amp;K Ecosystem Acceleration
                      </span>
                    </div>

                    <h4 className="text-lg md:text-xl font-bold text-white tracking-tight">
                      Unlock a $500 Ledger Credit &amp; 1-Hour Executive Architecture Roadmap Review
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Complete your full deep-dive corporate telemetry across Steps 02 to 06. We apply a <strong>$500 credit</strong> instantly toward your first V&amp;K operational sprint and schedule your complimentary compliance architecture session ($750 retail value).
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleIncentiveToggle(true)}
                      className={`w-full py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isSeekingIncentive
                          ? 'bg-[#C5A880] text-black shadow-[0_0_20px_rgba(197,168,128,0.4)] ring-2 ring-white/50 scale-[1.02]'
                          : 'bg-[#18181B] text-neutral-400 border border-neutral-700 hover:text-white'
                      }`}
                    >
                      <span>💎 Opt-In to Full Telemetry</span>
                      {isSeekingIncentive && <span className="text-black font-black">✓</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleIncentiveToggle(false)}
                      className={`w-full py-2 px-4 rounded-lg font-semibold text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center ${
                        !isSeekingIncentive
                          ? 'text-[#C5A880] underline font-bold'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      ⚡ Skip Rewards // Brief Baseline Only
                    </button>
                  </div>
                </div>
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