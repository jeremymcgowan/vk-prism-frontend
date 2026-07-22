'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingHeader from '../components/OnboardingHeader';
import VendorValueWedge from '../components/VendorValueWedge';

export default function StepFivePeople() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    headcount_range: '', // Initialized empty to force explicit selection
    payroll_provider: '', // Initialized empty
  });

  const [payrollAudit, setPayrollAudit] = useState({ satisfaction: 'GREAT', costPerception: 'FAIR' });
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(['HEALTH_VISION_DENTAL']);

  const benefitOptions = [
    { id: 'HEALTH_VISION_DENTAL', label: '🏥 Medical / Dental / Vision' },
    { id: 'RETIREMENT_401K', label: '💰 401(k) / Roth 401(k)' },
    { id: 'SIMPLE_IRA', label: '📈 SIMPLE IRA / SEP IRA' },
    { id: 'EQUITY_ESOP', label: '📊 Stock Options (ESOP / Equity Pool)' },
    { id: 'STIPEND_PERKS', label: '🌴 Remote Work / Health Stipends' },
  ];

  const toggleBenefit = (id: string) => {
    if (selectedBenefits.includes(id)) {
      setSelectedBenefits(selectedBenefits.filter((item) => item !== id));
    } else {
      setSelectedBenefits([...selectedBenefits, id]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePeopleBypass = async () => {
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      payroll_vendor_audit: formData.payroll_provider && formData.payroll_provider !== 'NONE' ? payrollAudit : null,
      benefits_offered: selectedBenefits,
      people_managed_service_opt_in: true
    };

    console.log("VK People Managed HR Bypass Triggered:", payload);
    router.push('/onboarding/step-6');
  };

  const handleStandardNext = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      payroll_vendor_audit: formData.payroll_provider !== 'NONE' ? payrollAudit : null,
      benefits_offered: selectedBenefits,
    };

    console.log("Step 5 Standard Data Submitted:", payload);
    router.push('/onboarding/step-6');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <OnboardingHeader currentStep={5} />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Main Card */}
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-8 my-6 relative overflow-hidden">
          
          {/* Subtle Accent Glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold tracking-widest text-pink-400 uppercase mb-2">
              Step 5 of 6: VK People — HR & Payroll Operations
            </h2>
            <h1 className="text-3xl font-light text-white">
              How is your team managed?
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleStandardNext} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Team Headcount <span className="text-pink-400">*</span>
                </label>
                <select 
                  name="headcount_range"
                  required
                  value={formData.headcount_range}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
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
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Payroll System <span className="text-pink-400">*</span>
                </label>
                <select 
                  name="payroll_provider"
                  required
                  value={formData.payroll_provider}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
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

            <VendorValueWedge 
              vendorName={formData.payroll_provider !== 'NONE' ? formData.payroll_provider : ''}
              data={payrollAudit}
              onChange={(f, v) => setPayrollAudit((prev) => ({ ...prev, [f]: v }))}
            />

            {/* Benefits Suite Checkboxes */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-3">Corporate Benefits & Incentives Offered</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {benefitOptions.map((b) => {
                  const isChecked = selectedBenefits.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBenefit(b.id)}
                      className={`p-3 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between ${
                        isChecked 
                          ? 'bg-pink-500/10 border-pink-500/50 text-pink-200' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>{b.label}</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                        isChecked ? 'bg-pink-500 border-pink-400 text-slate-950 font-bold' : 'border-slate-700'
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
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-slate-900 text-slate-500 uppercase tracking-wider">OR</span>
              </div>
            </div>

            {/* People Fast-Track Card */}
            <button
              type="button"
              onClick={handlePeopleBypass}
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-pink-600/30 to-rose-600/30 border border-pink-500/30 p-[1px] rounded-xl hover:border-pink-500/60 hover:shadow-[0_0_30px_-10px_rgba(236,72,153,0.4)] transition-all duration-300"
            >
              <div className="relative w-full bg-slate-950/80 backdrop-blur-sm px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-slate-900/80 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(236,72,153,0.3)] group-hover:scale-110 transition-transform">👥</span>
                  <div className="text-left">
                    <p className="text-base font-medium text-white">I Need Turnkey HR & Payroll!</p>
                    <p className="text-xs text-slate-400 mt-0.5">Let V&K structure compliant multi-state payroll, health insurance, and 401(k) plans.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-pink-400 group-hover:translate-x-1 transition-transform whitespace-nowrap pl-4">Deploy People →</span>
              </div>
            </button>

            {/* Primary Action Button (Anchored Below Fast Track) */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-400 hover:to-rose-400 transition-all shadow-[0_0_25px_-5px_rgba(236,72,153,0.5)] hover:shadow-[0_0_35px_-5px_rgba(236,72,153,0.7)] active:scale-[0.98] disabled:opacity-50"
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