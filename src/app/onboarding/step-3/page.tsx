'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from '../components/OnboardingHeader';
import VendorValueWedge from '../components/VendorValueWedge';

export default function StepThreeCapital() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    funding_stage: '', // Initialized empty to force selection
    target_raise: '',
    has_bylaws: '', // Initialized empty
    accounting_software: '', // Initialized empty
  });

  const [accountingAudit, setAccountingAudit] = useState({
    satisfaction: 'GREAT',
    costPerception: 'FAIR',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAccountingAuditChange = (field: 'satisfaction' | 'costPerception', value: string) => {
    setAccountingAudit((prev) => ({ ...prev, [field]: value }));
  };

  const isSelfFunded = formData.funding_stage === 'SELF_FUNDED';

  const handleIgnoranceBypass = async () => {
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      accounting_vendor_audit: formData.accounting_software && formData.accounting_software !== 'NONE' ? accountingAudit : null,
      funding_stage: formData.funding_stage || 'UNKNOWN',
      has_bylaws: formData.has_bylaws || 'UNKNOWN',
      audit_flag: 'NEEDS_GOVERNANCE_FINANCIAL_REVIEW'
    };

    console.log("Governance & Financial Rescue Triggered:", payload);
    router.push('/onboarding/step-4');
  };

  const handleStandardNext = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      accounting_vendor_audit: formData.accounting_software !== 'NONE' ? accountingAudit : null,
    };

    console.log("Step 3 Standard Data Submitted:", payload);
    router.push('/onboarding/step-4');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <OnboardingHeader currentStep={3} />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Main Card */}
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-8 my-6 relative overflow-hidden">
          
          {/* Subtle Accent Glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold tracking-widest text-purple-400 uppercase mb-2">
              Step 3 of 6: Capital, Governance & Financial Operations
            </h2>
            <h1 className="text-3xl font-light text-white">
              What is your funding & financial status?
            </h1>
          </div>

          {/* Form Container */}
          <form onSubmit={handleStandardNext} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Funding Stage <span className="text-purple-400">*</span>
                </label>
                <select 
                  name="funding_stage"
                  required
                  value={formData.funding_stage}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="" disabled>Please Select Funding Stage...</option>
                  <option value="BOOTSTRAPPED">Bootstrapped</option>
                  <option value="PRE_SEED">Pre-Seed</option>
                  <option value="SEED">Seed</option>
                  <option value="SERIES_A">Series A+</option>
                  <option value="FRIENDS_FAMILY">Friends & Family</option>
                  <option value="ANGEL">Angel Funded</option>
                  <option value="DEBT_SBA">Debt / SBA / Revenue-Backed</option>
                  <option value="GRANT">Grant / Non-Equity Funded</option>
                  <option value="SELF_FUNDED">Not Seeking External Capital (Self-Funded)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Target Raise ($)
                </label>
                <input
                  type="number"
                  name="target_raise"
                  disabled={isSelfFunded}
                  value={isSelfFunded ? '' : formData.target_raise}
                  onChange={handleChange}
                  placeholder={isSelfFunded ? "N/A (Self-Funded)" : "e.g. 500000"}
                  className={`w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all ${
                    isSelfFunded ? 'opacity-40 cursor-not-allowed border-slate-800' : ''
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Are your Corporate Bylaws & Board Resolutions up to date? <span className="text-purple-400">*</span>
              </label>
              <select 
                name="has_bylaws"
                required
                value={formData.has_bylaws}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="" disabled>Please Select Bylaws Status...</option>
                <option value="YES">Yes, 100% compliant</option>
                <option value="NO">No, we need to draft them</option>
                <option value="IN_PROGRESS">Currently working on it</option>
              </select>
            </div>

            {/* Accounting Software & Value Wedge */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Primary Accounting & Bookkeeping Software <span className="text-purple-400">*</span>
              </label>
              <select 
                name="accounting_software"
                required
                value={formData.accounting_software}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
              <VendorValueWedge 
                vendorName={formData.accounting_software.replace('_', ' ')}
                data={accountingAudit}
                onChange={handleAccountingAuditChange}
              />
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-slate-900 text-slate-500 uppercase tracking-wider">OR</span>
              </div>
            </div>

            {/* Fast-Track Bypass Card */}
            <button
              type="button"
              onClick={handleIgnoranceBypass}
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden bg-slate-950 border border-slate-800 p-[1px] rounded-xl hover:border-purple-500/50 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)] transition-all duration-300"
            >
              <div className="relative w-full bg-slate-950/80 backdrop-blur-sm px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-slate-900/80 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-3xl opacity-80 group-hover:opacity-100 transition-opacity">🤷‍♂️</span>
                  <div className="text-left">
                    <p className="text-base font-medium text-white">I Honestly Don't Know</p>
                    <p className="text-xs text-slate-400 mt-0.5">Skip this section. Have the V&K Governance & Financial team run an audit for me.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all whitespace-nowrap pl-4">Request Audit →</span>
              </div>
            </button>

            {/* Primary Action Button (Anchored Below Fast Track) */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-indigo-400 transition-all shadow-[0_0_25px_-5px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_-5px_rgba(168,85,247,0.7)] active:scale-[0.98] disabled:opacity-50"
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