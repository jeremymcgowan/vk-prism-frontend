'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from '../components/OnboardingHeader';
import { useOnboarding } from '@/app/onboarding/OnboardingContext';

// Valid 2-letter US State & Territory codes
const VALID_US_STATES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", 
  "DC", "PR", "VI", "GU", "MP", "AS"
]);

export default function StepTwoIdentity() {
  const router = useRouter();
  const { formData, updateFormData, isHydrated } = useOnboarding();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skipAddress, setSkipAddress] = useState(
    formData.hq_address_type === 'SKIP_VERIFY_LATER'
  );
  const [stateError, setStateError] = useState('');
  const [yearError, setYearError] = useState('');

  if (!isHydrated) return null; // Prevents UI flicker while loading sessionStorage

  // --- State Abbreviation Logic ---
  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uppercaseVal = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
    setStateError('');
    updateFormData({ hq_state: uppercaseVal });
  };

  const handleStateBlur = () => {
    const val = formData.hq_state || '';
    if (val.length > 0 && val.length < 2) {
      setStateError('Please enter a 2-letter state abbreviation.');
    } else if (val.length === 2 && !VALID_US_STATES.has(val)) {
      setStateError('Please enter a valid US state code (e.g. DE, FL, NY).');
    } else {
      setStateError('');
    }
  };

  // --- Formation Year Logic ---
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
    setYearError('');
    updateFormData({ formation_year: digitsOnly });
  };

  const handleYearBlur = () => {
    const val = formData.formation_year;
    if (val && val.length > 0) {
      const yearNum = parseInt(val, 10);
      if (val.length < 4 || yearNum < 1900 || yearNum > 2026) {
        setYearError('Formation year must be a 4-digit year between 1900 and 2026.');
      } else {
        setYearError('');
      }
    } else {
      setYearError('');
    }
  };

  // --- Virtual Office Bypass Action ---
  const handleVirtualOfficeBypass = async () => {
    setIsSubmitting(true);
    
    updateFormData({
      hq_address_type: 'VK_VIRTUAL_OFFICE_PENDING',
      hq_address_verified_usps: false
    });

    router.push('/onboarding/step-3');
  };

  // --- Standard Form Submit ---
  const handleStandardNext = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate State
    const stateVal = formData.hq_state || '';
    if (!skipAddress && stateVal && (!VALID_US_STATES.has(stateVal) || stateVal.length !== 2)) {
      setStateError('Please provide a valid 2-letter US state code.');
      return;
    }

    // Validate Formation Year
    const yearVal = formData.formation_year;
    if (yearVal) {
      const yearNum = parseInt(yearVal, 10);
      if (yearVal.length < 4 || yearNum < 1900 || yearNum > 2026) {
        setYearError('Formation year must be a 4-digit year between 1900 and 2026.');
        return;
      }
    }

    setIsSubmitting(true);

    updateFormData({
      hq_address_type: skipAddress ? 'SKIP_VERIFY_LATER' : 'PHYSICAL',
      hq_address_verified_usps: false
    });

    router.push('/onboarding/step-3');
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#E4E4E7] flex flex-col font-mono antialiased">
      <OnboardingHeader currentStep={2} />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Main Card */}
        <div className="w-full max-w-2xl bg-[#0A0A0C]/90 glass-panel border border-[#1F1F1F] shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-8 my-6 relative overflow-hidden rounded-2xl">
          
          {/* Subtle Champagne Gold Glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold tracking-[0.2em] text-[#C5A880] uppercase mb-2">
              Step 2 of 6: Identity &amp; Infrastructure
            </h2>
            <h1 className="text-2xl font-light text-white tracking-wide">
              Where is your headquarters?
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleStandardNext} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                  Legal Structure <span className="text-[#C5A880]">*</span>
                </label>
                <select 
                  name="legal_structure"
                  required
                  value={formData.legal_structure || ''}
                  onChange={(e) => updateFormData({ legal_structure: e.target.value })}
                  className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
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
                <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">Formation Year</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  name="formation_year"
                  value={formData.formation_year || ''}
                  onChange={handleYearChange}
                  onBlur={handleYearBlur}
                  placeholder="e.g. 2024"
                  className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
                />
                {yearError && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {yearError}
                  </p>
                )}
              </div>
            </div>

            {/* Address Input Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[11px] font-medium uppercase tracking-widest text-neutral-300">HQ Physical Address</label>
                
                {/* Skip Address Toggle with Tooltip */}
                <div className="relative group flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="skipAddress"
                    checked={skipAddress}
                    onChange={(e) => setSkipAddress(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#121215] border-[#27272A] text-[#C5A880] focus:ring-[#C5A880] focus:ring-offset-[#0A0A0C]"
                  />
                  <label htmlFor="skipAddress" className="text-xs text-neutral-400 group-hover:text-neutral-200 transition-colors cursor-pointer flex items-center gap-1">
                    Skip address for now ⓘ
                  </label>

                  <div className="absolute right-0 bottom-full mb-2 w-72 p-3 bg-[#121215] border border-[#27272A] rounded-xl text-xs text-neutral-300 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-20">
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
                      value={formData.hq_address_line_1 || ''}
                      onChange={(e) => updateFormData({ hq_address_line_1: e.target.value })}
                      placeholder="123 Business Blvd, Suite 400"
                      className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <input
                        type="text"
                        name="hq_city"
                        value={formData.hq_city || ''}
                        onChange={(e) => updateFormData({ hq_city: e.target.value })}
                        placeholder="City"
                        className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="text"
                        name="hq_state"
                        maxLength={2}
                        value={formData.hq_state || ''}
                        onChange={handleStateChange}
                        onBlur={handleStateBlur}
                        placeholder="State (e.g. DE)"
                        className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none uppercase transition-all"
                      />
                      {stateError && (
                        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                          <span>⚠️</span> {stateError}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <input
                        type="text"
                        name="hq_postal_code"
                        maxLength={10}
                        value={formData.hq_postal_code || ''}
                        onChange={(e) => updateFormData({ hq_postal_code: e.target.value })}
                        placeholder="ZIP Code"
                        className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
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

            {/* Co-Working & Virtual Office Bypass Card */}
            <button
              type="button"
              onClick={handleVirtualOfficeBypass}
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-[#C5A880]/20 via-transparent to-[#8B7325]/20 border border-[#C5A880]/30 p-[1px] rounded-xl hover:border-[#C5A880]/70 hover:shadow-[0_0_25px_rgba(197,168,128,0.2)] transition-all duration-300 cursor-pointer"
            >
              <div className="relative w-full bg-[#121215]/90 backdrop-blur-sm px-6 py-4 rounded-xl flex items-center justify-between group-hover:bg-[#161619] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(197,168,128,0.4)] group-hover:scale-110 transition-transform">🏢</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white tracking-wide">Tell Me about Co-Working and Virtual Offices in My Prism Portal!</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-tight">Learn how V&amp;K provides corporate address compliance, mail scanning, and co-working space access.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880] group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Explore Options →</span>
              </div>
            </button>

            {/* Primary Action Button */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => router.push('/onboarding/step-1')}
                className="px-6 py-3 border border-[#27272A] text-neutral-400 hover:text-white hover:border-neutral-500 text-xs font-semibold uppercase tracking-[0.2em] rounded-xl transition-colors"
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