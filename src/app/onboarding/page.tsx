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
    <div className="min-h-screen bg-[#050507] text-[#E4E4E7] flex flex-col font-mono antialiased">
      <OnboardingHeader currentStep={1} />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-[#0A0A0C]/90 glass-panel border border-[#1F1F1F] shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-8 my-6 relative overflow-hidden rounded-2xl">
          
          {/* Subtle Ambient Gold Glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8">
            <h2 className="text-xs font-bold tracking-[0.2em] text-[#C5A880] uppercase mb-2">
              Step 1 of 6: Prism Gateway Intake
            </h2>
            <h1 className="text-2xl font-light text-white tracking-wide">
              Initialize Your Corporate Profile
            </h1>
          </div>

          <form onSubmit={handleStandardNext} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                  Company Name <span className="text-[#C5A880]">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  required
                  value={formData.company_name || ''}
                  onChange={handleChange}
                  placeholder="e.g. Acme Industries, Inc."
                  className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                  Primary Contact Name <span className="text-[#C5A880]">*</span>
                </label>
                <input
                  type="text"
                  name="contact_name"
                  required
                  value={formData.contact_name || ''}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                  Corporate Email <span className="text-[#C5A880]">*</span>
                </label>
                <input
                  type="email"
                  name="contact_email"
                  required
                  value={formData.contact_email || ''}
                  onChange={handleChange}
                  placeholder="jane@company.com"
                  className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone || ''}
                  onChange={handleChange}
                  placeholder="(555) 000-0000"
                  className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
                />
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

            {/* Express Fast-Track Card */}
            <button
              type="button"
              onClick={handleFastTrack}
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-[#C5A880]/20 via-transparent to-[#8B7325]/20 border border-[#C5A880]/30 p-[1px] rounded-xl hover:border-[#C5A880]/70 hover:shadow-[0_0_25px_rgba(197,168,128,0.2)] transition-all duration-300 cursor-pointer"
            >
              <div className="relative w-full bg-[#121215]/90 backdrop-blur-sm px-6 py-4 rounded-xl flex items-center justify-between group-hover:bg-[#161619] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(197,168,128,0.4)] group-hover:scale-110 transition-transform">🚀</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white tracking-wide">Express Fast-Track Onboarding</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-tight">Skip standard intake and request priority concierge onboarding with a V&amp;K partner.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880] group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Fast Track →</span>
              </div>
            </button>

            {/* Primary Action Button */}
            <div className="flex justify-end pt-4">
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