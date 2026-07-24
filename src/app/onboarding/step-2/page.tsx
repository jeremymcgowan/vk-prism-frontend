'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [isAddressVerified, setIsAddressVerified] = useState(
    Boolean(formData.hq_address_verified_usps)
  );

  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // --- Google Places Autocomplete Script Loader ---
  useEffect(() => {
    if (skipAddress) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    const initAutocomplete = () => {
      if (!addressInputRef.current || !window.google?.maps?.places) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'formatted_address', 'geometry'],
        }
      );

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.address_components) return;

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
          else if (!city && types.includes('sublocality_level_1')) city = component.long_name;
          if (types.includes('administrative_area_level_1')) state = component.short_name;
          if (types.includes('postal_code')) zip = component.long_name;
        }

        const addressLine1 = streetNumber ? `${streetNumber} ${route}` : route;

        updateFormData({
          hq_address_line_1: addressLine1,
          hq_city: city,
          hq_state: state,
          hq_postal_code: zip,
          hq_address_verified_usps: true,
        });

        setIsAddressVerified(true);
        setStateError('');
      });
    };

    // Load Google Maps script if not already present
    if (window.google?.maps?.places) {
      initAutocomplete();
    } else {
      const existingScript = document.getElementById('google-maps-places-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-maps-places-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = () => initAutocomplete();
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener('load', initAutocomplete);
      }
    }
  }, [skipAddress]);

  if (!isHydrated) return null; // Prevents UI flicker while loading sessionStorage

  // --- State Abbreviation Logic ---
  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uppercaseVal = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
    setStateError('');
    updateFormData({ hq_state: uppercaseVal, hq_address_verified_usps: false });
    setIsAddressVerified(false);
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
    });

    router.push('/onboarding/step-3');
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#E4E4E7] flex flex-col font-sans antialiased">
      <OnboardingHeader currentStep={2} />

      {/* Inject custom CSS to style Google Places Autocomplete dropdown in Obsidian Dark Mode */}
      <style jsx global>{`
        .pac-container {
          background-color: #0A0A0C !important;
          border: 1px solid rgba(197, 168, 128, 0.4) !important;
          border-radius: 0.75rem !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.9) !important;
          font-family: inherit !important;
          margin-top: 6px !important;
          z-index: 9999 !important;
        }
        .pac-item {
          color: #E4E4E7 !important;
          border-top: 1px solid #27272A !important;
          padding: 10px 14px !important;
          cursor: pointer !important;
          font-size: 13px !important;
        }
        .pac-item:hover, .pac-item-selected {
          background-color: #161619 !important;
        }
        .pac-item-query {
          color: #FFFFFF !important;
          font-weight: 600 !important;
        }
        .pac-matched {
          color: #C5A880 !important;
        }
        .pac-icon {
          display: none !important;
        }
      `}</style>

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
        
        <div className="w-full max-w-3xl lg:max-w-4xl relative my-8">
          
          <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-[#C5A880]/30 via-[#8B7325]/15 to-[#C5A880]/30 rounded-[2rem] blur-3xl opacity-80 pointer-events-none transition-all duration-700"></div>

          <div className="relative w-full bg-[#0A0A0C]/95 glass-panel border border-[#C5A880]/40 hover:border-[#C5A880]/60 shadow-[0_10px_50px_rgba(0,0,0,0.9),0_0_40px_-5px_rgba(197,168,128,0.25)] p-8 md:p-12 lg:p-14 rounded-2xl transition-all duration-500 overflow-hidden">
            
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#C5A880]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-10">
              <h2 className="text-xs font-bold tracking-[0.25em] text-[#C5A880] uppercase mb-3">
                Step 2 of 6: Identity &amp; Infrastructure
              </h2>
              <h1 className="text-3xl lg:text-4xl font-light text-white tracking-tight">
                Where is your headquarters?
              </h1>
            </div>

            <form onSubmit={handleStandardNext} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                    Legal Structure <span className="text-[#C5A880]">*</span>
                  </label>
                  <select 
                    name="legal_structure"
                    required
                    value={formData.legal_structure || ''}
                    onChange={(e) => updateFormData({ legal_structure: e.target.value })}
                    className="w-full bg-[#121215] border border-[#27272A] text-white p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
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
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Formation Year</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    name="formation_year"
                    value={formData.formation_year || ''}
                    onChange={handleYearChange}
                    onBlur={handleYearBlur}
                    placeholder="e.g. 2024"
                    className="w-full bg-[#121215] border border-[#27272A] text-white p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
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
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-neutral-300">HQ Physical Address</label>
                    {isAddressVerified && (
                      <span className="px-2 py-0.5 bg-[#C5A880]/15 border border-[#C5A880]/40 text-[#C5A880] text-[10px] font-bold rounded-full animate-fade-in flex items-center gap-1">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  
                  {/* Skip Address Toggle */}
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
                        ref={addressInputRef}
                        type="text"
                        name="hq_address_line_1"
                        value={formData.hq_address_line_1 || ''}
                        onChange={(e) => {
                          updateFormData({ hq_address_line_1: e.target.value, hq_address_verified_usps: false });
                          setIsAddressVerified(false);
                        }}
                        placeholder="Start typing street address (e.g. 700 S Rosemary Ave)..."
                        className="w-full bg-[#121215] border border-[#27272A] text-white p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <input
                          type="text"
                          name="hq_city"
                          value={formData.hq_city || ''}
                          onChange={(e) => {
                            updateFormData({ hq_city: e.target.value, hq_address_verified_usps: false });
                            setIsAddressVerified(false);
                          }}
                          placeholder="City"
                          className="w-full bg-[#121215] border border-[#27272A] text-white p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
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
                          className="w-full bg-[#121215] border border-[#27272A] text-white p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none uppercase transition-all shadow-inner"
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
                          onChange={(e) => {
                            updateFormData({ hq_postal_code: e.target.value, hq_address_verified_usps: false });
                            setIsAddressVerified(false);
                          }}
                          placeholder="ZIP Code"
                          className="w-full bg-[#121215] border border-[#27272A] text-white p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                )}
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

              {/* Co-Working & Virtual Office Bypass Card */}
              <button
                type="button"
                onClick={handleVirtualOfficeBypass}
                disabled={isSubmitting}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-[#C5A880]/20 via-transparent to-[#8B7325]/20 border border-[#C5A880]/40 p-[1px] rounded-xl hover:border-[#C5A880] hover:shadow-[0_0_30px_rgba(197,168,128,0.25)] transition-all duration-300 cursor-pointer"
              >
                <div className="relative w-full bg-[#121215]/95 backdrop-blur-md px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-[#161619] transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(197,168,128,0.4)] group-hover:scale-110 transition-transform">🏢</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white tracking-wide">Tell Me about Co-Working and Virtual Offices in My Prism Portal!</p>
                      <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">Learn how V&amp;K provides corporate address compliance, mail scanning, and co-working space access.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880] group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Explore Options →</span>
                </div>
              </button>

              {/* PRIMARY ACTION BUTTON */}
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/onboarding')}
                  className="px-6 py-3 border border-[#27272A] text-neutral-400 hover:text-white hover:border-neutral-500 text-xs font-semibold uppercase tracking-[0.2em] rounded-xl transition-colors cursor-pointer"
                >
                  ← Back
                </button>

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