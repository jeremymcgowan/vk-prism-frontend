'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from '../components/OnboardingHeader';
import VendorValueWedge from '../components/VendorValueWedge';
import { useOnboarding } from '@/app/onboarding/OnboardingContext';

export default function StepFivePeople() {
  const router = useRouter();
  const { formData, updateFormData, isHydrated } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [payrollAudit, setPayrollAudit] = useState({
    satisfaction: formData.payroll_vendor_audit?.satisfaction || 'GREAT',
    costPerception: formData.payroll_vendor_audit?.costPerception || 'FAIR',
  });
  
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(
    formData.benefits_offered && Array.isArray(formData.benefits_offered)
      ? formData.benefits_offered
      : ['HEALTH_VISION_DENTAL']
  );

  const benefitOptions = [
    { id: 'HEALTH_VISION_DENTAL', label: '🏥 Medical / Dental / Vision' },
    { id: 'RETIREMENT_401K', label: '💰 401(k) / Roth 401(k)' },
    { id: 'SIMPLE_IRA', label: '📈 SIMPLE IRA / SEP IRA' },
    { id: 'EQUITY_ESOP', label: '📊 Stock Options (ESOP / Equity Pool)' },
    { id: 'STIPEND_PERKS', label: '🌴 Remote Work / Health Stipends' },
  ];

  if (!isHydrated) return null; // Prevents UI flicker while loading sessionStorage

  const toggleBenefit = (id: string) => {
    const updated = selectedBenefits.includes(id)
      ? selectedBenefits.filter((item) => item !== id)
      : [...selectedBenefits, id];
    
    setSelectedBenefits(updated);
    updateFormData({ benefits_offered: updated });
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  const handlePayrollAuditChange = (field: 'satisfaction' | 'costPerception', value: string) => {
    const updated = { ...payrollAudit, [field]: value };
    setPayrollAudit(updated);
    updateFormData({ payroll_vendor_audit: updated });
  };

  const handlePeopleBypass = async () => {
    setIsSubmitting(true);
    
    updateFormData({
      payroll_vendor_audit: formData.payroll_provider && formData.payroll_provider !== 'NONE' ? payrollAudit : null,
      benefits_offered: selectedBenefits,
      people_managed_service_opt_in: true,
      headcount_range: formData.headcount_range || '1_TO_5',
      payroll_provider: formData.payroll_provider || 'NONE'
    });

    router.push('/onboarding/step-6');
  };

  const handleStandardNext = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    updateFormData({
      payroll_vendor_audit: formData.payroll_provider !== 'NONE' ? payrollAudit : null,
      benefits_offered: selectedBenefits,
      people_managed_service_opt_in: false
    });

    router.push('/onboarding/step-6');
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#E4E4E7] flex flex-col font-mono antialiased">
      <OnboardingHeader currentStep={5} />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Main Card */}
        <div className="w-full max-w-2xl bg-[#0A0A0C]/90 glass-panel border border-[#1F1F1F] shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-8 my-6 relative overflow-hidden rounded-2xl">
          
          {/* Subtle Champagne Gold Glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold tracking-[0.2em] text-[#C5A880] uppercase mb-2">
              Step 5 of 6: VK People — HR &amp; Payroll Operations
            </h2>
            <h1 className="text-2xl font-light text-white tracking-wide">
              How is your team managed?
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleStandardNext} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                  Team Headcount <span className="text-[#C5A880]">*</span>
                </label>
                <select 
                  name="headcount_range"
                  required
                  value={formData.headcount_range || ''}
                  onChange={handleChange}
                  className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
                >
                  <option value="" disabled>Please Select Headcount...</option>
                  <option value="SOLO">1 (Founder Only)</option>
                  <option value="1_TO_5">2 – 5 Employees</option>
                  <option value="6_TO_20">6 – 20 Employees</option>
                  <option value="21_TO_50">21 – 50 Employees</option>
                  <option value="50_PLUS">50+ Employees</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
                  Payroll System <span className="text-[#C5A880]">*</span>
                </label>
                <select 
                  name="payroll_provider"
                  required
                  value={formData.payroll_provider || ''}
                  onChange={handleChange}
                  className="w-full bg-[#121215] border border-[#27272A] text-white p-3 text-sm rounded-lg focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all"
                >
                  <option value="" disabled>Please Select Payroll System...</option>
                  <option value="GUSTO">Gusto</option>
                  <option value="RIPPLING">Rippling</option>
                  <option value="ADP">ADP</option>
                  <option value="PAYCHEX">Paychex</option>
                  <option value="QUICKBOOKS_PAYROLL">QuickBooks Payroll</option>
                  <option value="NONE">Manual / No Payroll Yet</option>
                </select>
              </div>
            </div>

            {formData.payroll_provider && formData.payroll_provider !== 'NONE' && (
              <div className="mt-4">
                <VendorValueWedge 
                  vendorName={formData.payroll_provider.replace('_', ' ')}
                  data={payrollAudit}
                  onChange={handlePayrollAuditChange}
                />
              </div>
            )}

            {/* Benefits Suite Checkboxes */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-300 mb-3">Corporate Benefits &amp; Incentives Offered</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {benefitOptions.map((b) => {
                  const isChecked = selectedBenefits.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBenefit(b.id)}
                      className={`p-3 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between cursor-pointer ${
                        isChecked 
                          ? 'bg-[#C5A880]/10 border-[#C5A880]/50 text-[#C5A880]' 
                          : 'bg-[#121215] border-[#27272A] text-neutral-400 hover:border-neutral-600'
                      }`}
                    >
                      <span>{b.label}</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                        isChecked ? 'bg-[#C5A880] border-[#C5A880] text-[#050507] font-bold' : 'border-[#27272A]'
                      }`}>
                        {isChecked ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
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

            {/* People Fast-Track Card */}
            <button
              type="button"
              onClick={handlePeopleBypass}
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-[#C5A880]/20 via-transparent to-[#8B7325]/20 border border-[#C5A880]/30 p-[1px] rounded-xl hover:border-[#C5A880]/70 hover:shadow-[0_0_25px_rgba(197,168,128,0.2)] transition-all duration-300 cursor-pointer"
            >
              <div className="relative w-full bg-[#121215]/90 backdrop-blur-sm px-6 py-4 rounded-xl flex items-center justify-between group-hover:bg-[#161619] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(197,168,128,0.4)] group-hover:scale-110 transition-transform">👥</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white tracking-wide">I Need Turnkey HR &amp; Payroll!</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-tight">Let V&amp;K structure compliant multi-state payroll, health insurance, and 401(k) plans.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880] group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Deploy People →</span>
              </div>
            </button>

            {/* Primary Action Button */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => router.push('/onboarding/step-4')}
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