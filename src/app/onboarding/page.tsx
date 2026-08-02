'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from './components/OnboardingHeader';
import { useOnboarding } from '@/app/onboarding/OnboardingContext';

const INDUSTRY_SECTORS = [
  'AI & Machine Learning Infrastructure',
  'B2B SaaS & Enterprise Software',
  'Biotech, Pharma & Life Sciences',
  'Cleantech, Energy & Sustainability',
  'E-Commerce, Retail & Consumer Goods',
  'FinTech & Financial Services',
  'GovTech, Defense & Aerospace',
  'Healthcare & HealthTech',
  'Legal Services & LegalTech',
  'Logistics, Supply Chain & Distribution',
  'Manufacturing, Hardware & Industrial',
  'Professional Services & Consulting',
  'Real Estate, Property & Construction',
  'Robotics & DeepTech',
  'Software & Mobile App Development',
  'Stealth / Confidential',
  'Other'
];

export default function StepOneGateway() {
  const router = useRouter();
  const { formData, updateFormData, isHydrated } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Error State object to track field-level errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isSeekingIncentive = formData.is_seeking_incentive !== false;

  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customIndustry, setCustomIndustry] = useState('');

  useEffect(() => {
    if (formData.industry) {
      if (!INDUSTRY_SECTORS.includes(formData.industry) && formData.industry !== '') {
        setIsOtherSelected(true);
        setCustomIndustry(formData.industry);
      } else if (formData.industry === 'Other') {
        setIsOtherSelected(true);
      }
    }
  }, [formData.industry]);

  if (!isHydrated) return null;

  const clearError = (fieldName: string) => {
    setErrors((prev) => ({ ...prev, [fieldName]: '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    clearError(e.target.name);
    updateFormData({ [e.target.name]: e.target.value });
  };

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    clearError('industry');
    const selected = e.target.value;
    if (selected === 'Other') {
      setIsOtherSelected(true);
      updateFormData({ industry: 'Other' });
    } else {
      setIsOtherSelected(false);
      setCustomIndustry('');
      updateFormData({ industry: selected });
    }
  };

  const handleCustomIndustryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError('custom_industry');
    setCustomIndustry(e.target.value);
  };

  const handleUrlBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let raw = e.target.value.trim().toLowerCase();
    if (!raw || raw === 'i need a website!') return;

    raw = raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\s+/g, '');
    raw = raw.replace(/[^a-z0-9\.\-]/gi, '');
    raw = raw.replace(/[\.\/]+$/, '');

    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,11}$/;

    if (domainRegex.test(raw)) {
      updateFormData({ company_url: raw });
    } else if (raw.length > 2 && !raw.includes('.')) {
      updateFormData({ company_url: `${raw}.com` });
    } else {
      updateFormData({ company_url: '' });
    }
  };

  const handleContactNameFocus = () => {
    if (!formData.company_url || formData.company_url.trim() === '') {
      updateFormData({ company_url: 'I need a website!' });
    }
  };

  const formatContactName = (rawName: string): string => {
    const trimmed = rawName.trim();
    if (!trimmed) return '';
    return trimmed
      .split(/\s+/)
      .map((part) => {
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
      updateFormData({ contact_name: formatContactName(formData.contact_name) });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError('contact_phone');
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;
    if (digits.length > 6) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    else if (digits.length > 3) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    else if (digits.length > 0) formatted = `(${digits}`;
    updateFormData({ contact_phone: formatted });
  };

  const handleIncentiveToggle = (optIn: boolean) => {
    updateFormData({
      is_seeking_incentive: optIn,
      is_fast_track: !optIn,
      readiness_completion_pct: optIn ? 25 : 15
    });
  };

  const validateStepOne = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name?.trim()) newErrors.company_name = 'Please enter your Company Name.';

    const urlValue = (formData.company_url || '').trim().toLowerCase();
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,11}$/;
    if (urlValue !== '' && urlValue !== 'i need a website!' && !domainRegex.test(urlValue)) {
      newErrors.company_url = 'Please enter a valid domain (e.g., abc.com).';
    }

    const rawName = (formData.contact_name || '').trim();
    const nameRegex = /^[a-zA-Z\s\-\'\.]+$/;
    if (!rawName || !nameRegex.test(rawName) || rawName.replace(/[^a-zA-Z]/g, '').length < 2) {
      newErrors.contact_name = 'Please enter a valid Primary Contact Name.';
    }

    if (!formData.industry) newErrors.industry = 'Please select your Primary Industry Sector.';
    if (isOtherSelected && !customIndustry.trim()) newErrors.custom_industry = 'Please specify your industry.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!formData.contact_email || !emailRegex.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address.';
    }

    const rawPhoneDigits = (formData.contact_phone || '').replace(/\D/g, '');
    if (rawPhoneDigits.length < 10) newErrors.contact_phone = 'Please enter a complete 10-digit phone number.';

    setErrors(newErrors);

    // If errors exist, scroll to the first one
    if (Object.keys(newErrors).length > 0) {
      const firstErrField = Object.keys(newErrors)[0];
      const el = document.getElementById(`field-${firstErrField}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStepOne()) return;

    setIsSubmitting(true);
    const formattedName = formatContactName(formData.contact_name || '');
    const finalIndustry = isOtherSelected ? customIndustry.trim() : (formData.industry || '');

    updateFormData({
      display_name: formData.company_name || '',
      legal_name: formData.company_name || '',
      website_url: formData.company_url || '',
      owner_name: formattedName,
      owner_email: formData.contact_email || '',
      owner_phone: formData.contact_phone || '',
      industry: finalIndustry,

      company_name: formData.company_name || '',
      company_url: formData.company_url || '',
      contact_name: formattedName,
      contact_email: formData.contact_email || '',
      contact_phone: formData.contact_phone || '',
      
      is_fast_track: !isSeekingIncentive,
      onboarding_mode: isSeekingIncentive ? 'STANDARD_AUDIT' : 'EXPRESS_CONCIERGE',
      step_completed: 1,
      status: 'ONBOARDING',
      is_seeking_incentive: isSeekingIncentive,
      readiness_completion_pct: isSeekingIncentive ? 25 : 15
    });

    router.push('/onboarding/step-2');
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#E4E4E7] flex flex-col font-sans antialiased" style={{ colorScheme: 'dark' }}>
      
      <style jsx global>{`
        /* Autofill Overrides to fix Edge/Chrome white background issue */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #121215 inset !important;
            -webkit-text-fill-color: #C5A880 !important;
            transition: background-color 5000s ease-in-out 0s;
        }

        @keyframes slowPurplePulse {
          0%, 100% {
            background-color: #121215;
            border-color: rgba(197, 168, 128, 0.4);
            color: #C5A880;
          }
          50% {
            background-color: #3B0764;
            border-color: rgba(168, 85, 247, 0.9);
            color: #FFFFFF;
            box-shadow: 0 0 25px rgba(147, 51, 234, 0.5);
          }
        }
        .animate-purple-pulse { animation: slowPurplePulse 4s infinite ease-in-out; }
      `}</style>

      <OnboardingHeader currentStep={1} />

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-3xl lg:max-w-4xl relative my-8">
          
          <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-[#C5A880]/30 via-[#8B7325]/15 to-[#C5A880]/30 rounded-[2rem] blur-3xl opacity-80 pointer-events-none transition-all duration-700"></div>

          <div className="relative w-full bg-[#0A0A0C]/95 glass-panel border border-[#C5A880]/40 shadow-[0_10px_50px_rgba(0,0,0,0.9)] p-8 md:p-12 lg:p-14 rounded-2xl">
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#C5A880]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-10">
              <h2 className="text-xs font-bold tracking-[0.25em] text-[#C5A880] uppercase mb-3">Step 1 of 6: Prism Gateway Intake</h2>
              <h1 className="text-3xl lg:text-4xl font-light text-white tracking-tight">Initialize Your Corporate Profile</h1>
            </div>

            <form onSubmit={handleNext} className="space-y-8 mt-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* COMPANY NAME */}
                <div id="field-company_name" className="relative">
                  {errors.company_name && (
                    <div className="absolute -top-10 left-0 bg-red-950/90 border border-red-500 text-red-200 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg z-10 animate-fadeIn whitespace-nowrap">
                      ⚠️ {errors.company_name}
                      <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-950 border-b border-r border-red-500 rotate-45"></div>
                    </div>
                  )}
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                    Company Name <span className="text-[#C5A880]">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name || ''}
                    onChange={handleChange}
                    placeholder="e.g. Acme Industries, Inc."
                    className={`w-full bg-[#121215] border ${errors.company_name ? 'border-red-500' : 'border-[#27272A]'} text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:outline-none transition-all`}
                  />
                </div>

                {/* COMPANY URL */}
                <div id="field-company_url" className="relative">
                  {errors.company_url && (
                    <div className="absolute -top-10 left-0 bg-red-950/90 border border-red-500 text-red-200 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg z-10 animate-fadeIn whitespace-nowrap">
                      ⚠️ {errors.company_url}
                      <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-950 border-b border-r border-red-500 rotate-45"></div>
                    </div>
                  )}
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                    Company Website URL <span className="text-neutral-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="company_url"
                    value={formData.company_url || ''}
                    onChange={handleChange}
                    onBlur={handleUrlBlur}
                    placeholder="e.g. acme.com or acme.io (no http/https)"
                    className={`w-full bg-[#121215] border ${errors.company_url ? 'border-red-500' : 'border-[#27272A]'} text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:outline-none transition-all`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* CONTACT NAME */}
                <div id="field-contact_name" className="relative">
                  {errors.contact_name && (
                    <div className="absolute -top-10 left-0 bg-red-950/90 border border-red-500 text-red-200 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg z-10 animate-fadeIn whitespace-nowrap">
                      ⚠️ {errors.contact_name}
                      <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-950 border-b border-r border-red-500 rotate-45"></div>
                    </div>
                  )}
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                    Primary Contact Name <span className="text-[#C5A880]">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    value={formData.contact_name || ''}
                    onChange={handleChange}
                    onBlur={handleNameBlur}
                    onFocus={handleContactNameFocus}
                    placeholder="e.g. Jane Doe or J.P."
                    className={`w-full bg-[#121215] border ${errors.contact_name ? 'border-red-500' : 'border-[#27272A]'} text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:outline-none transition-all`}
                  />
                </div>

                {/* EMAIL */}
                <div id="field-contact_email" className="relative">
                  {errors.contact_email && (
                    <div className="absolute -top-10 left-0 bg-red-950/90 border border-red-500 text-red-200 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg z-10 animate-fadeIn whitespace-nowrap">
                      ⚠️ {errors.contact_email}
                      <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-950 border-b border-r border-red-500 rotate-45"></div>
                    </div>
                  )}
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                    Corporate Email <span className="text-[#C5A880]">*</span>
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email || ''}
                    onChange={handleChange}
                    placeholder="jane@company.com"
                    className={`w-full bg-[#121215] border ${errors.contact_email ? 'border-red-500' : 'border-[#27272A]'} text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:outline-none transition-all`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* INDUSTRY */}
                <div id="field-industry" className="relative">
                  {errors.industry && (
                    <div className="absolute -top-10 left-0 bg-red-950/90 border border-red-500 text-red-200 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg z-10 animate-fadeIn whitespace-nowrap">
                      ⚠️ {errors.industry}
                      <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-950 border-b border-r border-red-500 rotate-45"></div>
                    </div>
                  )}
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                    Primary Industry Sector <span className="text-[#C5A880]">*</span>
                  </label>
                  <select
                    name="industry"
                    value={isOtherSelected ? 'Other' : (formData.industry || '')}
                    onChange={handleIndustryChange}
                    className={`w-full bg-[#121215] border ${errors.industry ? 'border-red-500' : 'border-[#27272A]'} text-[#C5A880] font-semibold p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:outline-none cursor-pointer`}
                  >
                    <option value="" disabled className="bg-[#0A0A0C] text-neutral-500">Please Select</option>
                    {INDUSTRY_SECTORS.map((sec) => (
                      <option key={sec} value={sec} className="bg-[#0A0A0C] text-white">{sec}</option>
                    ))}
                  </select>

                  {isOtherSelected && (
                    <div id="field-custom_industry" className="mt-3 relative animate-fadeIn">
                      {errors.custom_industry && (
                        <div className="absolute -top-10 left-0 bg-red-950/90 border border-red-500 text-red-200 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg z-10 animate-fadeIn whitespace-nowrap">
                          ⚠️ {errors.custom_industry}
                          <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-950 border-b border-r border-red-500 rotate-45"></div>
                        </div>
                      )}
                      <input
                        type="text"
                        name="custom_industry"
                        value={customIndustry}
                        onChange={handleCustomIndustryChange}
                        placeholder="Please specify your industry sector..."
                        className={`w-full bg-[#18181B] border ${errors.custom_industry ? 'border-red-500' : 'border-[#C5A880]/60'} text-white font-medium p-3 text-xs rounded-xl focus:border-[#C5A880] focus:outline-none`}
                      />
                    </div>
                  )}
                </div>

                {/* PHONE */}
                <div id="field-contact_phone" className="relative">
                  {errors.contact_phone && (
                    <div className="absolute -top-10 left-0 bg-red-950/90 border border-red-500 text-red-200 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg z-10 animate-fadeIn whitespace-nowrap">
                      ⚠️ {errors.contact_phone}
                      <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-950 border-b border-r border-red-500 rotate-45"></div>
                    </div>
                  )}
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                    Phone Number <span className="text-[#C5A880]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone || ''}
                    onChange={handlePhoneChange}
                    placeholder="(555) 000-0000"
                    className={`w-full bg-[#121215] border ${errors.contact_phone ? 'border-red-500' : 'border-[#27272A]'} text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:outline-none`}
                  />
                </div>
              </div>

              {/* Reward Card Box */}
              <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#121215] via-[#18181B] to-[#0A0A0C] border-2 border-[#6B21A8]/70 shadow-[0_0_30px_rgba(107,33,168,0.25)] my-8">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#6B21A8]/15 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#6B21A8] text-white border border-[#A855F7]/50 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-widest">
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
                      Complete your full deep-dive corporate telemetry across <strong>Steps 3 through 6</strong>. We apply a <strong>$500 credit</strong> instantly toward your first V&amp;K operational sprint and schedule your complimentary compliance architecture session ($750 retail value).
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 shrink-0 sm:min-w-[280px]">
                    <button
                      type="button"
                      onClick={() => handleIncentiveToggle(true)}
                      className={`w-full py-3.5 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border ${
                        isSeekingIncentive
                          ? 'bg-[#6B21A8] text-white border-[#A855F7] shadow-[0_0_30px_rgba(168,85,247,0.6)] ring-2 ring-white/60 scale-[1.02]'
                          : 'bg-[#121215] text-[#C5A880] border-[#C5A880]/40 hover:border-[#C5A880]/80 shadow-none'
                      }`}
                    >
                      <span>💎 Opt-In to Full Telemetry</span>
                      {isSeekingIncentive && <span className="text-white text-sm font-black animate-bounce">✓</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleIncentiveToggle(false)}
                      className={`w-full py-2 px-4 rounded-xl text-center transition-all cursor-pointer border ${
                        !isSeekingIncentive
                          ? 'bg-[#121215] text-neutral-300 border-neutral-700 shadow-none'
                          : 'bg-transparent text-neutral-500 border-transparent hover:text-neutral-400'
                      }`}
                    >
                      <span className="block text-[11px] font-medium tracking-wide text-neutral-400">
                        Express Baseline Intake
                      </span>
                      <span className="block text-[10px] font-normal tracking-normal text-neutral-600 mt-0.5">
                        Bypass Extended Telemetry &amp; Rewards // Complete After Step 2
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#27272A]/80">
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