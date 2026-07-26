'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import OnboardingHeader from '../components/OnboardingHeader';
import { useOnboarding } from '@/app/onboarding/OnboardingContext';

const US_STATES = [
  'DE', 'CA', 'NY', 'TX', 'FL', 'NV', 'WY', 'IL', 'MA', 'WA', 'CO', 'GA', 'NC', 'OH',
  'PA', 'VA', 'AZ', 'MI', 'NJ', 'TN', 'OR', 'MO', 'UT', 'MD', 'MN', 'IN', 'SC', 'CT',
  'WI', 'AL', 'OK', 'KY', 'IA', 'LA', 'KS', 'AR', 'NE', 'MS', 'NM', 'ID', 'NH', 'WV',
  'HI', 'ME', 'RI', 'MT', 'ND', 'SD', 'AK', 'VT'
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper Tooltip Component
function Tooltip({ text }: { text: string }) {
  return (
    <span className="relative group inline-block ml-1 cursor-help">
      <span className="text-[#C5A880] text-xs font-bold hover:text-white transition-colors">ⓘ</span>
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-30 w-max max-w-[250px] animate-fadeIn">
        <span className="bg-[#18181B] text-[#C5A880] text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-[#C5A880]/40 shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-center leading-tight whitespace-normal">
          {text}
        </span>
        <span className="w-2 h-2 bg-[#18181B] border-r border-b border-[#C5A880]/40 rotate-45 -mt-1"></span>
      </span>
    </span>
  );
}

export default function StepTwoStructure() {
  const router = useRouter();
  const { formData, updateFormData, isHydrated } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const hasPhysicalHq = formData.has_physical_hq !== false; // Default true

  // --- Initialize Google Places Autocomplete ---
  const initAutocomplete = () => {
    if (!addressInputRef.current || typeof window === 'undefined') return;
    const google = (window as any).google;
    if (!google?.maps?.places) return;

    try {
      const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place || !place.address_components) return;

        let streetNumber = '';
        let route = '';
        let city = '';
        let state = '';
        let zip = '';

        for (const component of place.address_components) {
          const types = component.types;
          if (types.includes('street_number')) streetNumber = component.long_name;
          if (types.includes('route')) route = component.long_name;
          if (types.includes('locality')) city = component.long_name;
          if (types.includes('administrative_area_level_1')) state = component.short_name;
          if (types.includes('postal_code')) zip = component.long_name;
        }

        const line1 = `${streetNumber} ${route}`.trim() || place.formatted_address || '';

        updateFormData({
          hq_address_line1: line1,
          hq_city: city,
          hq_state: state,
          hq_zip: zip,
        });
      });
    } catch (err) {
      console.warn('Google Places Init Notice:', err);
    }
  };

  useEffect(() => {
    if (hasPhysicalHq && (googleScriptLoaded || (window as any).google?.maps?.places)) {
      initAutocomplete();
    }
  }, [hasPhysicalHq, googleScriptLoaded]);

  if (!isHydrated) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValidationError(null);
    updateFormData({ [e.target.name]: e.target.value });
  };

  // Eradicate Leading Zeros (e.g., 0434 -> 434) & Clamp (0 - 99,999)
  const handleNumberChange = (name: string, val: string) => {
    setValidationError(null);
    const sanitizedStr = val.replace(/^0+(?=\d)/, '');
    if (sanitizedStr === '') {
      updateFormData({ [name]: 0 });
      return;
    }
    const cleanNum = Math.min(99999, Math.max(0, parseInt(sanitizedStr, 10) || 0));
    updateFormData({ [name]: cleanNum });
  };

  // Auto-Formatting EIN Tax ID: XX-XXXXXXX
  const handleEINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    updateFormData({ ein_number: formatted });
  };

  // Formation Year Sanitization & Clamping
  const sanitizeFormationYear = (val: string): string => {
    const trimmed = (val || '').trim();
    if (!trimmed || trimmed.toUpperCase() === 'N/A') return 'N/A';
    const num = parseInt(trimmed, 10);
    if (!isNaN(num)) {
      const currentYear = new Date().getFullYear();
      if (num < 1900) return '1900';
      if (num > currentYear + 1) return String(currentYear);
      return String(num);
    }
    return trimmed;
  };

  // HQ Toggle Logic
  const handleHqToggle = (hasPhysical: boolean) => {
    setValidationError(null);
    updateFormData({
      has_physical_hq: hasPhysical,
      is_virtual_hq_candidate: !hasPhysical
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate Partial EIN Entry
    const rawEinDigits = (formData.ein_number || '').replace(/\D/g, '');
    if (rawEinDigits.length > 0 && rawEinDigits.length < 9) {
      setValidationError('EIN Tax ID must be exactly 9 digits (XX-XXXXXXX) or left blank for pending startups.');
      return;
    }

    setIsSubmitting(true);

    // Physical Address Blank Fallback Check
    const isAddressBlank =
      !formData.hq_address_line1?.trim() &&
      !formData.hq_city?.trim() &&
      !formData.hq_zip?.trim();

    const effectiveHasPhysical = hasPhysicalHq && !isAddressBlank;

    updateFormData({
      step_completed: 2,
      legal_structure: formData.legal_structure || 'STARTUP_NOT_FORMED',
      registration_state: formData.registration_state || 'UNDECIDED',
      formation_year: sanitizeFormationYear(formData.formation_year || ''),
      ein_number: rawEinDigits.length === 9 ? formData.ein_number : 'Startup - Need EIN',
      fiscal_year_end_month: formData.fiscal_year_end_month || 'December',
      employee_count_w2_ft: Math.min(99999, Math.max(0, formData.employee_count_w2_ft ?? 1)),
      employee_count_w2_pt: Math.min(99999, Math.max(0, formData.employee_count_w2_pt ?? 0)),
      contractor_count_1099: Math.min(99999, Math.max(0, formData.contractor_count_1099 ?? 0)),
      has_physical_hq: effectiveHasPhysical,
      is_virtual_hq_candidate: !effectiveHasPhysical
    });

    router.push('/onboarding/step-3');
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="min-h-screen bg-[#050507] text-[#E4E4E7] flex flex-col font-sans antialiased">
      {/* Load Google Maps Places Library Script */}
      {apiKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
          strategy="afterInteractive"
          onLoad={() => {
            setGoogleScriptLoaded(true);
            initAutocomplete();
          }}
        />
      )}

      <OnboardingHeader currentStep={2} />

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
        
        <div className="w-full max-w-3xl lg:max-w-4xl relative my-8">
          
          {/* EXPANSIVE GOLD HALO */}
          <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-[#C5A880]/30 via-[#8B7325]/15 to-[#C5A880]/30 rounded-[2rem] blur-3xl opacity-80 pointer-events-none transition-all duration-700"></div>

          {/* MAIN CARD */}
          <div className="relative w-full bg-[#0A0A0C]/95 glass-panel border border-[#C5A880]/40 hover:border-[#C5A880]/60 shadow-[0_10px_50px_rgba(0,0,0,0.9),0_0_40px_-5px_rgba(197,168,128,0.25)] p-8 md:p-12 lg:p-14 rounded-2xl transition-all duration-500 overflow-hidden">
            
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#C5A880]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-10">
              <h2 className="text-xs font-bold tracking-[0.25em] text-[#C5A880] uppercase mb-3">
                Step 2 of 6: Governance &amp; Operations
              </h2>
              <h1 className="text-3xl lg:text-4xl font-light text-white tracking-tight">
                Corporate Structure &amp; Workforce
              </h1>
            </div>

            {/* Validation Banner */}
            {validationError && (
              <div className="mb-6 p-4 bg-red-950/50 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-3 animate-fadeIn">
                <span>⚠️</span>
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* SECTION A: LEGAL STRUCTURE & REGISTRATION */}
              <div className="space-y-4 border-b border-[#27272A]/80 pb-6">
                <h3 className="text-xs font-bold tracking-[0.2em] text-[#C5A880] uppercase">
                  01 // Legal Registration &amp; Tax Telemetry
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                      Entity Structure <Tooltip text="Select your registered legal structure or flag as 'Startup / Not Yet Formed'." />
                    </label>
                    <select
                      name="legal_structure"
                      value={formData.legal_structure || ''}
                      onChange={handleChange}
                      className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#0A0A0C] text-neutral-500">Please Select</option>
                      <option value="STARTUP_NOT_FORMED" className="bg-[#0A0A0C] text-white">Startup / Not Yet Formed</option>
                      <option value="C_CORP" className="bg-[#0A0A0C] text-white">C-Corporation</option>
                      <option value="S_CORP" className="bg-[#0A0A0C] text-white">S-Corporation</option>
                      <option value="LLC" className="bg-[#0A0A0C] text-white">LLC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                      Formation State <Tooltip text="Primary jurisdiction where corporate filing documents are registered." />
                    </label>
                    <select
                      name="registration_state"
                      value={formData.registration_state || ''}
                      onChange={handleChange}
                      className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#0A0A0C] text-neutral-500">Please Select</option>
                      <option value="UNDECIDED" className="bg-[#0A0A0C] text-white">Undecided / N/A</option>
                      {US_STATES.map((st) => (
                        <option key={st} value={st} className="bg-[#0A0A0C] text-white">{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                      Formation Year <Tooltip text="Year of incorporation or legal state registration." />
                    </label>
                    <input
                      type="text"
                      name="formation_year"
                      placeholder="e.g. 2026 or N/A"
                      value={formData.formation_year || ''}
                      onChange={handleChange}
                      className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                      EIN Tax ID (XX-XXXXXXX) <Tooltip text="9-digit IRS Federal Tax ID. Leave blank if pending." />
                    </label>
                    <input
                      type="text"
                      name="ein_number"
                      maxLength={10}
                      placeholder="12-3456789 (or leave blank if pending)"
                      value={formData.ein_number || ''}
                      onChange={handleEINChange}
                      className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                      Fiscal Year-End Month <Tooltip text="The closing month of your annual financial accounting cycle." />
                    </label>
                    <select
                      name="fiscal_year_end_month"
                      value={formData.fiscal_year_end_month || ''}
                      onChange={handleChange}
                      className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#0A0A0C] text-neutral-500">Please Select</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m} className="bg-[#0A0A0C] text-white">{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION B: 👥 WORKFORCE BREAKDOWN */}
              <div className="space-y-4 border-b border-[#27272A]/80 pb-6">
                <div>
                  <h3 className="text-xs font-bold tracking-[0.2em] text-[#C5A880] uppercase">
                    02 // 👥 Workforce &amp; Team Distribution <Tooltip text="Enter active headcount numbers across your W2 payroll and 1099 contractor workforce." />
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Quantify active staffing assets across your corporate perimeter.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#121215] border border-[#27272A] p-4 rounded-xl space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-200">
                      W2 Full-Time (Default: 1 Founder)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={99999}
                      value={formData.employee_count_w2_ft ?? 1}
                      onChange={(e) => handleNumberChange('employee_count_w2_ft', e.target.value)}
                      className="w-full bg-[#0A0A0C] border border-[#27272A] text-[#C5A880] font-bold p-3 text-base rounded-lg focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div className="bg-[#121215] border border-[#27272A] p-4 rounded-xl space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-200">
                      W2 Part-Time
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={99999}
                      value={formData.employee_count_w2_pt ?? 0}
                      onChange={(e) => handleNumberChange('employee_count_w2_pt', e.target.value)}
                      className="w-full bg-[#0A0A0C] border border-[#27272A] text-[#C5A880] font-bold p-3 text-base rounded-lg focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div className="bg-[#121215] border border-[#27272A] p-4 rounded-xl space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-200">
                      1099 Contractors
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={99999}
                      value={formData.contractor_count_1099 ?? 0}
                      onChange={(e) => handleNumberChange('contractor_count_1099', e.target.value)}
                      className="w-full bg-[#0A0A0C] border border-[#27272A] text-[#C5A880] font-bold p-3 text-base rounded-lg focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION C: 🏢 HEADQUARTERS ADDRESS & VIRTUAL HQ TOGGLE */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold tracking-[0.2em] text-[#C5A880] uppercase">
                      03 // 🏢 Principal Headquarters <Tooltip text="Unselect if operating virtually to flag entity for V&K Virtual HQ & Registered Agent forwarding." />
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Does your organization maintain a physical headquarters facility?
                    </p>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer bg-[#121215] border border-[#27272A] px-4 py-2 rounded-xl hover:border-[#C5A880]/50 transition-colors self-start sm:self-auto">
                    <input
                      type="checkbox"
                      checked={hasPhysicalHq}
                      onChange={(e) => handleHqToggle(e.target.checked)}
                      className="accent-[#C5A880] h-4 w-4 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white tracking-wide">
                      Physical HQ
                    </span>
                  </label>
                </div>

                {hasPhysicalHq ? (
                  <div className="space-y-4 bg-[#121215]/60 p-5 rounded-xl border border-[#27272A] animate-fadeIn">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-200 mb-1.5">
                        Street Address (Start typing for Google Places Autocomplete)
                      </label>
                      <input
                        ref={addressInputRef}
                        type="text"
                        name="hq_address_line1"
                        placeholder="100 Tech Boulevard, Suite 400"
                        value={formData.hq_address_line1 || ''}
                        onChange={handleChange}
                        className="w-full bg-[#0A0A0C] border border-[#27272A] text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3 text-sm rounded-xl focus:border-[#C5A880] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-200 mb-1.5">City</label>
                        <input
                          type="text"
                          name="hq_city"
                          placeholder="San Francisco"
                          value={formData.hq_city || ''}
                          onChange={handleChange}
                          className="w-full bg-[#0A0A0C] border border-[#27272A] text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3 text-sm rounded-xl focus:border-[#C5A880] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-200 mb-1.5">State</label>
                        <select
                          name="hq_state"
                          value={formData.hq_state || ''}
                          onChange={handleChange}
                          className="w-full bg-[#0A0A0C] border border-[#27272A] text-[#C5A880] font-semibold p-3 text-sm rounded-xl focus:border-[#C5A880] focus:outline-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-[#0A0A0C] text-neutral-500">Please Select</option>
                          {US_STATES.map((st) => (
                            <option key={st} value={st} className="bg-[#0A0A0C] text-white">{st}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-200 mb-1.5">Zip Code</label>
                        <input
                          type="text"
                          name="hq_zip"
                          placeholder="94107"
                          value={formData.hq_zip || ''}
                          onChange={handleChange}
                          className="w-full bg-[#0A0A0C] border border-[#27272A] text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3 text-sm rounded-xl focus:border-[#C5A880] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-xl space-y-1 animate-fadeIn">
                    <p className="text-xs font-bold text-[#C5A880] uppercase tracking-wider">
                      ⚡ Virtual HQ &amp; Mail Processing Candidate Flagged
                    </p>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Skipping physical HQ automatically flags your corporate entity for V&amp;K Virtual Office &amp; Registered Agent Mail Forwarding provisioning.
                    </p>
                  </div>
                )}
              </div>

              {/* NAVIGATION BUTTONS */}
              <div className="flex justify-between items-center pt-6 border-t border-[#27272A]/80">
                <button
                  type="button"
                  onClick={() => router.push('/onboarding')}
                  className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white px-4 py-2 transition-colors cursor-pointer"
                >
                  ← Back to Step 1
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-3.5 bg-[#C5A880] hover:bg-[#D4B990] text-[#050507] text-xs font-extrabold uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_0_25px_rgba(197,168,128,0.3)] hover:shadow-[0_0_35px_rgba(197,168,128,0.5)] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  Continue to Step 3 →
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
}