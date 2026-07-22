'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from './components/OnboardingHeader';

export default function StepOneGateway() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFastTrack = async () => {
    setIsSubmitting(true);
    const payload = {
      ...formData,
      is_fast_track: true,
      onboarding_mode: 'EXPRESS_CONCIERGE',
    };

    console.log('Fast-Track Express Triggered:', payload);
    router.push('/onboarding/step-2');
  };

  const handleStandardNext = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formData,
      is_fast_track: false,
      onboarding_mode: 'STANDARD_AUDIT',
    };

    console.log('Step 1 Standard Data Submitted:', payload);
    router.push('/onboarding/step-2');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <OnboardingHeader currentStep={1} />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Main Card */}
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-10 my-8 relative overflow-hidden">
          
          {/* Subtle Accent Glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-2">
              Step 1 of 6: Prism Gateway Intake
            </h2>
            <h1 className="text-3xl font-light text-white">
              Initialize Your Corporate Profile
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleStandardNext} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  required
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="e.g. Acme Industries, Inc."
                  className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Primary Contact Name</label>
                <input
                  type="text"
                  name="contact_name"
                  required
                  value={formData.contact_name}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Corporate Email</label>
                <input
                  type="email"
                  name="contact_email"
                  required
                  value={formData.contact_email}
                  onChange={handleChange}
                  placeholder="jane@company.com"
                  className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="(555) 000-0000"
                  className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Glowing Dopamine Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_-5px_rgba(16,185,129,0.7)] active:scale-[0.98] disabled:opacity-50"
              >
                Continue →
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-slate-900 text-slate-500 uppercase tracking-wider">OR</span>
            </div>
          </div>

          {/* Express Fast-Track Card */}
          <button
            onClick={handleFastTrack}
            disabled={isSubmitting}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/30 p-[1px] rounded-xl hover:border-emerald-500/60 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)] transition-all duration-300"
          >
            <div className="relative w-full bg-slate-950/80 backdrop-blur-sm px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-slate-900/80 transition-colors">
              <div className="flex items-center gap-4">
                <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">🚀</span>
                <div className="text-left">
                  <p className="text-base font-medium text-white">Express Fast-Track Onboarding</p>
                  <p className="text-xs text-slate-400 mt-0.5">Skip standard intake and request priority concierge onboarding with a V&K partner.</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Fast Track →</span>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}