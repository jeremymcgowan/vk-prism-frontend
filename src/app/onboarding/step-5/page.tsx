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
    // UPGRADED: Changed font-mono to font-sans for a modern, secure executive banking feel
    <div className="min-h-screen bg-[#050507] text-[#E4E4E7] flex flex-col font-sans antialiased">
      <OnboardingHeader currentStep={5} />

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
        
        {/* Responsive scaling container (max-w-3xl lg:max-w-4xl) with expanded halo wrapper */}
        <div className="w-full max-w-3xl lg:max-w-4xl relative my-8">
          
          {/* UPGRADED EXPANSIVE GOLD HALO: -inset-3 and blur-3xl for a wider, ambient aura */}
          <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-[#C5A880]/30 via-[#8B7325]/15 to-[#C5A880]/30 rounded-[2rem] blur-3xl opacity-80 pointer-events-none transition-all duration-700"></div>

          {/* MAIN CARD: Obsidian glass panel with enhanced padding and double-layered gold glow */}
          <div className="relative w-full bg-[#0A0A0C]/95 glass-panel border border-[#C5A880]/40 hover:border-[#C5A880]/60 shadow-[0_10px_50px_rgba(0,0,0,0.9),0_0_40px_-5px_rgba(197,168,128,0.25)] p-8 md:p-12 lg:p-14 rounded-2xl transition-all duration-500 overflow-hidden">
            
            {/* Internal Corner Accent Glow */}
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#C5A880]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-10">
              <h2 className="text-xs font-bold tracking-[0.25em] text-[#C5A880] uppercase mb-3">
                Step 5 of 6: VK People — HR &amp; Payroll Operations
              </h2>
              <h1 className="text-3xl lg:text-4xl font-light text-white tracking-tight">
                How is your team managed?
              </h1>
            </div>

            <form onSubmit={handleStandardNext} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                    Team Headcount <span className="text-[#C5A880]">*</span>
                  </label>
                  <select 
                    name="headcount_range"
                    required
                    value={formData.headcount_range || ''}
                    onChange={handleChange}
                    className="w-full bg-[#121215] border border-[#27272A] text-white p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
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
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                    Payroll System <span className="text-[#C5A880]">*</span>
                  </label>
                  <select 
                    name="payroll_provider"
                    required
                    value={formData.payroll_provider || ''}
                    onChange={handleChange}
                    className="w-full bg-[#121215] border border-[#27272A] text-white p-3.5 text-sm rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] focus:outline-none transition-all shadow-inner"
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
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-300 mb-3">Corporate Benefits &amp; Incentives Offered</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {benefitOptions.map((b) => {
                    const isChecked = selectedBenefits.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => toggleBenefit(b.id)}
                        className={`p-3.5 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between cursor-pointer ${
                          isChecked 
                            ? 'bg-[#C5A880]/15 border-[#C5A880] text-[#C5A880] shadow-[0_0_15px_rgba(197,168,128,0.15)]' 
                            : 'bg-[#121215] border-[#27272A] text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 shadow-inner'
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
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#27272A]/80"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold">
                  <span className="px-4 bg-[#0A0A0C] text-neutral-500 uppercase tracking-[0.2em]">OR</span>
                </div>
              </div>

              {/* People Fast-Track Card */}
              <button
                type="button"
                onClick={handlePeopleBypass}
                disabled={isSubmitting}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-[#C5A880]/20 via-transparent to-[#8B7325]/20 border border-[#C5A880]/40 p-[1px] rounded-xl hover:border-[#C5A880] hover:shadow-[0_0_30px_rgba(197,168,128,0.25)] transition-all duration-300 cursor-pointer"
              >
                <div className="relative w-full bg-[#121215]/95 backdrop-blur-md px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-[#161619] transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(197,168,128,0.4)] group-hover:scale-110 transition-transform">👥</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white tracking-wide">I Need Turnkey HR &amp; Payroll!</p>
                      <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">Let V&amp;K structure compliant multi-state payroll, health insurance, and 401(k) plans.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880] group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Deploy People →</span>
                </div>
              </button>

              {/* UPGRADED PRIMARY ACTION BUTTON: Solid Champagne Gold background for 100% cross-browser reliability */}
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