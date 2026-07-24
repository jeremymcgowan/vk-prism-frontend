'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from './components/OnboardingHeader';
import { useOnboarding } from '@/app/onboarding/OnboardingContext';

export default function StepOneGateway() {
  const router = useRouter();
  const { formData, updateFormData, isHydrated } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isHydrated) return null; // Prevents UI flicker while loading sessionStorage

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  // Helper to persist draft payload before proceeding
  const saveDraftAndNavigate = (mode: 'EXPRESS_CONCIERGE' | 'STANDARD_AUDIT', isFastTrack: boolean) => {
    setIsSubmitting(true);
    
    updateFormData({
      is_fast_track: isFastTrack,
      onboarding_mode: mode,
      step_completed: 1,
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
        
        {/* Responsive scaling container (max-w-3xl lg:max-w-4xl) with expanded halo wrapper */}
        <div className="w-full max-w-3xl lg:max-w-4xl relative my-8">
          
          {/* UPGRADED EXPANSIVE GOLD HALO: Increased to -inset-3 and blur-3xl for a wider, ambient aura */}
          <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-[#C5A880]/30 via-[#8B7325]/15 to-[#C5A880]/30 rounded-[2rem] blur-3xl opacity-80 pointer-events-none transition-all duration-700"></div>

          {/* MAIN CARD: Obsidian glass panel with enhanced padding and double-layered gold glow */}
          <div className="relative w-full bg-[#0A0A0C]/95 glass-panel border border-[#C5A880]/40 hover:border-[#C5A880]/60 shadow-[0_10px_50px_rgba(0,0,0,0.9),0_0_40px_-5px_rgba(197,168,128,0.25)] p-8 md:p-12 lg:p-14 rounded-2xl transition-all duration-500 overflow-hidden">
            
            {/* Internal Corner Accent Glow */}
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#C5A880]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-10">
              <h2 className="text-xs font-bold tracking-[0.25em] text-[#C5A880] uppercase mb-3">
                Step 1 of 6: Prism Gateway Intake
              </h2>
              <h1 className="text-3xl lg:text-4xl font-light text-white tracking-tight">
                Initialize Your Corporate Profile
              </h1>
            </div>

            <form onSubmit={handleStandardNext} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                    Company Name <span className="text-[#C5A880]">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    required
                    value={formData.company_name || ''}
                    onChange={handleChange}
                    placeholder="e.g. Acme Industries, Inc."
                    className="w-full bg-[#121215] border border-[#27272A] text-white p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                    Primary Contact Name <span className="text-[#C5A880]">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    required
                    value={formData.contact_name || ''}
                    onChange={handleChange}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-[#121215] border border-[#27272A] text-white p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                    Corporate Email <span className="text-[#C5A880]">*</span>
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    required
                    value={formData.contact_email || ''}
                    onChange={handleChange}
                    placeholder="jane@company.com"
                    className="w-full bg-[#121215] border border-[#27272A] text-white p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone || ''}
                    onChange={handleChange}
                    placeholder="(555) 000-0000"
                    className="w-full bg-[#121215] border border-[#27272A] text-white p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                  />
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

              {/* Express Fast-Track Card */}
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

              {/* UPGRADED PRIMARY ACTION BUTTON: Solid Champagne Gold background for 100% cross-browser reliability */}
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