'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from '../components/OnboardingHeader';
import VendorValueWedge from '../components/VendorValueWedge';
import { useOnboarding } from '@/app/onboarding/OnboardingContext';

export default function StepThreeCapital() {
  const router = useRouter();
  const { formData, updateFormData, isHydrated } = useOnboarding();
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

  // --- Auto-Currency Formatting, Rounding Up & Threshold Validation ---
  const handleRaiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9.]/g, '');
    setFormattedRaise(e.target.value); // Allow free typing while focused
    updateFormData({ target_raise: rawVal });
    setRaiseError('');
  };

  const handleRaiseBlur = () => {
    const rawVal = formData.target_raise;
    if (!rawVal || isSelfFunded) {
      setFormattedRaise('');
      setRaiseError('');
      return;
    }

    const numVal = parseFloat(rawVal);
    if (!isNaN(numVal) && numVal > 0) {
      // Round UP to the next multiple of 10 ending in .00 (e.g., 5201.13 -> 5210.00)
      const roundedVal = Math.ceil(numVal / 10) * 10;
      
      // Update both visible UI string and underlying stored data
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

  const handleIgnoranceBypass = async () => {
    setIsSubmitting(true);
    
    updateFormData({
      accounting_vendor_audit: formData.accounting_software && formData.accounting_software !== 'NONE' ? accountingAudit : null,
      funding_stage: formData.funding_stage || 'UNKNOWN',
      has_bylaws: formData.has_bylaws || null,
      audit_flag: 'NEEDS_GOVERNANCE_FINANCIAL_REVIEW'
    });

    router.push('/onboarding/step-4');
  };

  const handleStandardNext = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce Minimum Raise Check on Submission
    if (!isSelfFunded && formData.target_raise) {
      const numVal = parseFloat(formData.target_raise);
      if (numVal < 5000) {
        setRaiseError('Please specify a target raise of at least $5,000.00 USD, or select Self-Funded.');
        return;
      }
    }

    setIsSubmitting(true);
    
    updateFormData({
      accounting_vendor_audit: formData.accounting_software !== 'NONE' ? accountingAudit : null,
    });

    router.push('/onboarding/step-4');
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#E4E4E7] flex flex-col font-mono antialiased">
      <OnboardingHeader currentStep={3} />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Main Card */}
        <div className="w-full max-w-2xl bg-[#0A0A0C]/90 glass-panel border border-[#1F1F1F] shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-8 my-6 relative overflow-hidden rounded-2xl">
          
          {/* Subtle Champagne Gold Glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold tracking-[0.2em] text-[#C5A880] uppercase mb-2">
              Step 3 of 6: Capital, Governance &amp; Financial Operations
            </h2>
            <h1 className="text-2xl font-light text-white tracking-wide">
              What is your funding &amp; financial status?
            </h1>
          </div>

          {/* Form Container */}
          <form onSubmit={handleStandardNext} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                  Funding Stage <span className="text-[#C5A880]">*</span>
                </label>
                <select 
                  name="funding_stage"
                  required
                  value={formData.funding_stage || ''}
                  onChange={handleStageChange}
                  className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
                >
                  <option value="" disabled>Please Select Funding Stage...</option>
                  <option value="BOOTSTRAPPED">Bootstrapped</option>
                  <option value="PRE_SEED">Pre-Seed</option>
                  <option value="SEED">Seed</option>
                  <option value="SERIES_A">Series A+</option>
                  <option value="FRIENDS_FAMILY">Friends &amp; Family</option>
                  <option value="ANGEL">Angel Funded</option>
                  <option value="DEBT_SBA">Debt / SBA / Revenue-Backed</option>
                  <option value="GRANT">Grant / Non-Equity Funded</option>
                  <option value="SELF_FUNDED">Not Seeking External Capital (Self-Funded)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400">
                    Target Raise ($ USD)
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
                  className={`w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all ${
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
              <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                Are your Corporate Bylaws &amp; Board Resolutions up to date? <span className="text-[#C5A880]">*</span>
              </label>
              <select 
                name="has_bylaws"
                required
                value={String(formData.has_bylaws || '')}
                onChange={(e) => updateFormData({ has_bylaws: e.target.value })}
                className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
              >
                <option value="" disabled>Please Select Bylaws Status...</option>
                <option value="YES">Yes, 100% compliant</option>
                <option value="NO">No, we need to draft them</option>
                <option value="IN_PROGRESS">Currently working on it</option>
              </select>
            </div>

            {/* Accounting Software & Value Wedge */}
            <div className="pt-2">
              <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                Primary Accounting &amp; Bookkeeping Software <span className="text-[#C5A880]">*</span>
              </label>
              <select 
                name="accounting_software"
                required
                value={formData.accounting_software || ''}
                onChange={(e) => updateFormData({ accounting_software: e.target.value })}
                className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
              >
                <option value="" disabled>Please Select Accounting Software...</option>
                <option value="QUICKBOOKS_ONLINE">QuickBooks Online</option>
                <option value="QUICKBOOKS_DESKTOP">QuickBooks Desktop</option>
                <option value="FRESHBOOKS">FreshBooks</option>
                <option value="XERO">Xero</option>
                <option value="NETSUITE">Oracle NetSuite</option>
                <option value="SAGE_WAVE">Sage / Wave</option>
                <option value="NONE">Manual Spreadsheets / None</option>
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
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#27272A]/80"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-medium">
                <span className="px-4 bg-[#0A0A0C] text-neutral-500 uppercase tracking-widest">OR</span>
              </div>
            </div>

            {/* Fast-Track Bypass Card */}
            <button
              type="button"
              onClick={handleIgnoranceBypass}
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-[#C5A880]/20 via-transparent to-[#8B7325]/20 border border-[#C5A880]/30 p-[1px] rounded-xl hover:border-[#C5A880]/70 hover:shadow-[0_0_25px_rgba(197,168,128,0.2)] transition-all duration-300 cursor-pointer"
            >
              <div className="relative w-full bg-[#121215]/90 backdrop-blur-sm px-6 py-4 rounded-xl flex items-center justify-between group-hover:bg-[#161619] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(197,168,128,0.4)] group-hover:scale-110 transition-transform">🤷‍♂️</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white tracking-wide">I Honestly Don't Know</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-tight">Skip this section. Have the V&amp;K Governance &amp; Financial team run an audit for me.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880] group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Request Audit →</span>
              </div>
            </button>

            {/* Primary Action Button */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => router.push('/onboarding/step-2')}
                className="px-6 py-3 border border-[#27272A] text-neutral-400 hover:text-white hover:border-neutral-500 text-xs font-semibold uppercase tracking-[0.2em] rounded-xl transition-colors cursor-pointer"
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