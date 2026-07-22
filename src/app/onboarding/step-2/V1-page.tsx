'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StepTwoIdentity() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Standard Form State
  const [formData, setFormData] = useState({
    legal_structure: 'LLC',
    formation_year: '',
    ein_number: '',
    hq_address_line_1: '',
    hq_city: '',
    hq_state: '',
    hq_postal_code: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // The Magic Virtual Office Bypass Logic
  const handleVirtualOfficeBypass = async () => {
    setIsSubmitting(true);
    
    // Flags the entity for V&K Virtual Office Upsell
    const payload = {
      ...formData,
      hq_address_type: 'VK_VIRTUAL_OFFICE_PENDING',
      hq_address_verified_usps: false
    };

    console.log("Virtual Office Fast-Track Triggered:", payload);
    // Move to Step 3
    router.push('/onboarding/step-3');
  };

  const handleStandardNext = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log("Standard HQ Address Submitted:", formData);
    // Move to Step 3
    router.push('/onboarding/step-3');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Container */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-10 mt-10 mb-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold tracking-widest text-emerald-500 uppercase mb-2">
            Step 2 of 6: Identity & Infrastructure
          </h2>
          <h1 className="text-3xl font-light text-white">
            Where is your headquarters?
          </h1>
        </div>

        {/* Standard Input Form */}
        <form onSubmit={handleStandardNext} className="space-y-6">
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Legal Structure</label>
              <select 
                name="legal_structure"
                value={formData.legal_structure}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="LLC">LLC</option>
                <option value="C-CORP">C-Corp</option>
                <option value="S-CORP">S-Corp</option>
                <option value="SOLE_PROP">Sole Proprietorship</option>
                <option value="UNKNOWN">I'm not sure yet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Formation Year</label>
              <input
                type="number"
                name="formation_year"
                value={formData.formation_year}
                onChange={handleChange}
                placeholder="e.g. 2024"
                className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Physical Address (Line 1)</label>
            <input
              type="text"
              name="hq_address_line_1"
              value={formData.hq_address_line_1}
              onChange={handleChange}
              placeholder="123 Business Blvd"
              className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-400 mb-2">City</label>
              <input
                type="text"
                name="hq_city"
                value={formData.hq_city}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-400 mb-2">State</label>
              <input
                type="text"
                name="hq_state"
                value={formData.hq_state}
                onChange={handleChange}
                placeholder="FL"
                className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-400 mb-2">ZIP</label>
              <input
                type="text"
                name="hq_postal_code"
                value={formData.hq_postal_code}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Continue →
            </button>
          </div>
        </form>

        {/* The Fast-Track Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-slate-900 text-slate-500">OR</span>
          </div>
        </div>

        {/* The Virtual Office Bypass Button */}
        <button
          onClick={handleVirtualOfficeBypass}
          disabled={isSubmitting}
          className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 p-[1px] rounded-xl hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative w-full bg-slate-950/50 backdrop-blur-sm px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-slate-900/50 transition-colors">
            <div className="flex items-center gap-4">
              <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform">🏢</span>
              <div className="text-left">
                <p className="text-lg font-medium text-white">I need a Virtual Office!</p>
                <p className="text-sm text-slate-400">Keep your home address private. We'll set up a corporate address for you.</p>
              </div>
            </div>
            <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">Add Service →</span>
          </div>
        </button>

      </div>
    </div>
  );
}