'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from '../components/OnboardingHeader';
import VendorValueWedge from '../components/VendorValueWedge';
import { useOnboarding } from '@/app/onboarding/OnboardingContext';

// Helper Tooltip Component
function Tooltip({ text }: { text: string }) {
  return (
    <span className="relative group inline-block ml-1 cursor-help">
      <span className="text-[#C5A880] text-xs font-bold hover:text-white transition-colors">ⓘ</span>
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-30 w-max max-w-[260px] animate-fadeIn">
        <span className="bg-[#18181B] text-[#C5A880] text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-[#C5A880]/40 shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-center leading-tight whitespace-normal">
          {text}
        </span>
        <span className="w-2 h-2 bg-[#18181B] border-r border-b border-[#C5A880]/40 rotate-45 -mt-1"></span>
      </span>
    </span>
  );
}

export default function StepThreeCapital() {
  const router = useRouter();
  // ADDED submitPartialPayload to the destructuring here
  const { formData, updateFormData, isHydrated, submitPartialPayload } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Local state for formatted UI strings and validation feedback
  const [formattedRaise, setFormattedRaise] = useState<string>(
    formData.target_raise ? `$${Number(formData.target_raise).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''
  );
  const [raiseError, setRaiseError] = useState<string>('');

  const [accountingAudit, setAccountingAudit] = useState({
    satisfaction: formData.accounting_vendor_audit?.satisfaction || 'GREAT',
    costPerception: formData.accounting_vendor_audit?.costPerception || 'FAIR',
  });

  if (!isHydrated) return null; // Prevents UI flicker while loading sessionStorage

  const isSelfFunded = formData.funding_stage === 'SELF_FUNDED';

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'SELF_FUNDED') {
      setFormattedRaise('');
      setRaiseError('');
      updateFormData({ funding_stage: val, target_raise: '' });
    } else {
      updateFormData({ funding_stage: val });
    }
  };

  // --- Auto-Currency Formatting, Leading Zero Stripping & Max Bounds ($999M) ---
  const handleRaiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    if (!digits) {
      setFormattedRaise('');
      updateFormData({ target_raise: '' });
      setRaiseError('');
      return;
    }

    const numVal = Math.min(999999999, parseInt(digits, 10));
    setFormattedRaise(numVal.toString());
    updateFormData({ target_raise: numVal.toString() });
    setRaiseError('');
  };

  const handleRaiseBlur = () => {
    const rawVal = formData.target_raise;
    if (!rawVal || isSelfFunded) {
      setFormattedRaise('');
      setRaiseError('');
      return;
    }

    const numVal = typeof rawVal === 'string' ? parseFloat(rawVal) : Number(rawVal);
    if (!isNaN(numVal) && numVal > 0) {
      const clampedVal = Math.min(999999999, numVal);
      const roundedVal = Math.ceil(clampedVal / 10) * 10;
      
      setFormattedRaise(`$${roundedVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      updateFormData({ target_raise: roundedVal.toString() });
      
      if (roundedVal < 5000) {
        setRaiseError('Target raise is below the $5,000.00 threshold typically evaluated for VC/Angel structures.');
      } else {
        setRaiseError('');
      }
    } else {
      setFormattedRaise('');
      setRaiseError('');
    }
  };

  const handleAccountingAuditChange = (field: 'satisfaction' | 'costPerception', value: string) => {
    const updated = { ...accountingAudit, [field]: value };
    setAccountingAudit(updated);
    updateFormData({ accounting_vendor_audit: updated });
  };

  // --- Map Bylaws Token to Readable Status for Admin Console Compatibility ---
  const handleBylawsChange = (val: string) => {
    let readableStatus = 'Currently working on it';
    if (val === 'YES') readableStatus = 'Yes, 100% compliant';
    if (val === 'NO') readableStatus = 'No, we need to draft them';

    updateFormData({
      has_bylaws: val,
      bylaws_governance_status: readableStatus
    });
  };

  const handleIgnoranceBypass = async () => {
    setIsSubmitting(true);
    
    updateFormData({
      step_completed: 3,
      accounting_vendor_audit: formData.accounting_software && formData.accounting_software !== 'NONE' ? accountingAudit : null,
      funding_stage: formData.funding_stage || 'UNKNOWN',
      has_bylaws: formData.has_bylaws || null,
      audit_flag: 'NEEDS_GOVERNANCE_FINANCIAL_REVIEW',
      readiness_completion_pct: Math.max(formData.readiness_completion_pct || 15, 50)
    });

    router.push('/onboarding/step-4');
  };

  const handleStandardNext = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce Minimum Raise Check on Submission
    if (!isSelfFunded && formData.target_raise) {
      const numVal = typeof formData.target_raise === 'string' ? parseFloat(formData.target_raise) : Number(formData.target_raise);
      if (numVal < 5000) {
        setRaiseError('Please specify a target raise of at least $5,000.00 USD, or select Self-Funded.');
        return;
      }
    }

    setIsSubmitting(true);
    
    updateFormData({
      step_completed: 3,
      accounting_vendor_audit: formData.accounting_software !== 'NONE' ? accountingAudit : null,
      readiness_completion_pct: Math.max(formData.readiness_completion_pct || 15, 50)
    });

    router.push('/onboarding/step-4');
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#E4E4E7] flex flex-col font-sans antialiased">
      <OnboardingHeader currentStep={3} />

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
        
        {/* Responsive scaling container */}
        <div className="w-full max-w-3xl lg:max-w-4xl relative my-8">
          
          {/* EXPANSIVE GOLD HALO */}
          <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-[#C5A880]/30 via-[#8B7325]/15 to-[#C5A880]/30 rounded-[2rem] blur-3xl opacity-80 pointer-events-none transition-all duration-700"></div>

          {/* MAIN CARD */}
          <div className="relative w-full bg-[#0A0A0C]/95 glass-panel border border-[#C5A880]/40 hover:border-[#C5A880]/60 shadow-[0_10px_50px_rgba(0,0,0,0.9),0_0_40px_-5px_rgba(197,168,128,0.25)] p-8 md:p-12 lg:p-14 rounded-2xl transition-all duration-500 overflow-hidden">
            
            {/* Internal Corner Accent Glow */}
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#C5A880]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-10">
              <h2 className="text-xs font-bold tracking-[0.25em] text-[#C5A880] uppercase mb-3">
                Step 3 of 6: Capital, Governance &amp; Financial Operations
              </h2>
              <h1 className="text-3xl lg:text-4xl font-light text-white tracking-tight">
                What is your funding &amp; financial status?
              </h1>
            </div>

            <form onSubmit={handleStandardNext} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                    Funding Stage <span className="text-[#C5A880]">*</span> <Tooltip text="Select your current capitalization phase so V&K can align governance requirements." />
                  </label>
                  <select 
                    name="funding_stage"
                    required
                    value={formData.funding_stage || ''}
                    onChange={handleStageChange}
                    className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#0A0A0C] text-neutral-500">Please Select Funding Stage...</option>
                    <option value="BOOTSTRAPPED" className="bg-[#0A0A0C] text-white">Bootstrapped</option>
                    <option value="PRE_SEED" className="bg-[#0A0A0C] text-white">Pre-Seed</option>
                    <option value="SEED" className="bg-[#0A0A0C] text-white">Seed</option>
                    <option value="SERIES_A" className="bg-[#0A0A0C] text-white">Series A+</option>
                    <option value="FRIENDS_FAMILY" className="bg-[#0A0A0C] text-white">Friends &amp; Family</option>
                    <option value="ANGEL" className="bg-[#0A0A0C] text-white">Angel Funded</option>
                    <option value="DEBT_SBA" className="bg-[#0A0A0C] text-white">Debt / SBA / Revenue-Backed</option>
                    <option value="GRANT" className="bg-[#0A0A0C] text-white">Grant / Non-Equity Funded</option>
                    <option value="SELF_FUNDED" className="bg-[#0A0A0C] text-white">Not Seeking External Capital (Self-Funded)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200">
                      Target Raise ($ USD) <Tooltip text="Enter your planned capital target in USD ($5,000 minimum up to $999M)." />
                    </label>
                    {!isSelfFunded && (
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Min: $5,000.00</span>
                    )}
                  </div>
                  <input
                    type="text"
                    name="target_raise"
                    disabled={isSelfFunded}
                    value={isSelfFunded ? '' : formattedRaise}
                    onChange={handleRaiseChange}
                    onBlur={handleRaiseBlur}
                    placeholder={isSelfFunded ? "N/A (Self-Funded)" : "e.g. $500,000.00"}
                    className={`w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold placeholder:text-neutral-600 p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner ${
                      isSelfFunded ? 'opacity-40 cursor-not-allowed border-[#1F1F1F] bg-[#0A0A0C]' : ''
                    }`}
                  />
                  {raiseError && (
                    <div className="mt-2 p-2.5 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-lg text-[#C5A880] text-xs flex items-start gap-2 animate-fade-in">
                      <span className="text-sm">💡</span>
                      <span>{raiseError}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                  Are your Corporate Bylaws &amp; Board Resolutions up to date? <span className="text-[#C5A880]">*</span> <Tooltip text="Corporate Bylaws (Corps) or Operating Agreements (LLCs) dictate official governance rules." />
                </label>
                <select 
                  name="has_bylaws"
                  required
                  value={String(formData.has_bylaws || '')}
                  onChange={(e) => handleBylawsChange(e.target.value)}
                  className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner cursor-pointer"
                >
                  <option value="" disabled className="bg-[#0A0A0C] text-neutral-500">Please Select Bylaws Status...</option>
                  <option value="YES" className="bg-[#0A0A0C] text-white">Yes, 100% compliant</option>
                  <option value="NO" className="bg-[#0A0A0C] text-white">No, we need to draft them</option>
                  <option value="IN_PROGRESS" className="bg-[#0A0A0C] text-white">Currently working on it</option>
                </select>
              </div>

              {/* Accounting Software & Value Wedge */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-2">
                  Primary Accounting &amp; Bookkeeping Software <span className="text-[#C5A880]">*</span> <Tooltip text="Your primary bookkeeping tool used for general ledger management and financial reporting." />
                </label>
                <select 
                  name="accounting_software"
                  required
                  value={formData.accounting_software || ''}
                  onChange={(e) => updateFormData({ accounting_software: e.target.value })}
                  className="w-full bg-[#121215] border border-[#27272A] text-[#C5A880] font-semibold p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner cursor-pointer"
                >
                  <option value="" disabled className="bg-[#0A0A0C] text-neutral-500">Please Select Accounting Software...</option>
                  <option value="QUICKBOOKS_ONLINE" className="bg-[#0A0A0C] text-white">QuickBooks Online</option>
                  <option value="QUICKBOOKS_DESKTOP" className="bg-[#0A0A0C] text-white">QuickBooks Desktop</option>
                  <option value="FRESHBOOKS" className="bg-[#0A0A0C] text-white">FreshBooks</option>
                  <option value="XERO" className="bg-[#0A0A0C] text-white">Xero</option>
                  <option value="NETSUITE" className="bg-[#0A0A0C] text-white">Oracle NetSuite</option>
                  <option value="SAGE_WAVE" className="bg-[#0A0A0C] text-white">Sage / Wave</option>
                  <option value="NONE" className="bg-[#0A0A0C] text-white">Manual Spreadsheets / None</option>
                </select>

                {/* Conditional Spend & Value Audit */}
                {formData.accounting_software && (
                  <div className="mt-4">
                    <VendorValueWedge 
                      vendorName={formData.accounting_software.replace('_', ' ')}
                      data={accountingAudit}
                      onChange={handleAccountingAuditChange}
                    />
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

              {/* Fast-Track Bypass Card */}
              <button
                type="button"
                onClick={handleIgnoranceBypass}
                disabled={isSubmitting}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-[#C5A880]/20 via-transparent to-[#8B7325]/20 border border-[#C5A880]/40 p-[1px] rounded-xl hover:border-[#C5A880] hover:shadow-[0_0_30px_rgba(197,168,128,0.25)] transition-all duration-300 cursor-pointer"
              >
                <div className="relative w-full bg-[#121215]/95 backdrop-blur-md px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-[#161619] transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(197,168,128,0.4)] group-hover:scale-110 transition-transform">🤷‍♂️</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white tracking-wide">I Honestly Don't Know</p>
                      <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">Skip this section. Have the V&amp;K Governance &amp; Financial team run an audit for me.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880] group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Request Audit →</span>
                </div>
              </button>

              {/* UPGRADED NAVIGATION BUTTONS: Includes the global skip/eject action */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[#27272A]/80 gap-4">
                
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => router.push('/onboarding/step-2')}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-[#27272A] text-neutral-400 hover:text-white hover:border-neutral-500 text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-colors cursor-pointer w-full sm:w-auto disabled:opacity-50"
                >
                  ← Back
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  
                  {/* The New "Eject" Skip Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsSubmitting(true);
                      submitPartialPayload(router);
                    }}
                    disabled={isSubmitting}
                    className="text-[#71717A] hover:text-[#E4E4E7] text-sm font-medium tracking-wide transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Skip remaining steps for now ➔'}
                  </button>

                  {/* Primary Continue Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-10 py-3.5 bg-[#C5A880] hover:bg-[#D4B990] text-[#050507] text-xs font-extrabold uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_0_25px_rgba(197,168,128,0.3)] hover:shadow-[0_0_35px_rgba(197,168,128,0.5)] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Processing...' : 'Continue to IT Shield →'}
                  </button>
                </div>
                
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}