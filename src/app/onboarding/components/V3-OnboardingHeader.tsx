'use client';

import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['600', '700'],
});

export default function OnboardingHeader({ currentStep = 5 }) {
  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      
      {/* Brand Title in Gold & Cinzel Font */}
      <div className="flex items-center gap-3">
        <h1 
          className={`${cinzel.className} text-xl tracking-[0.2em] font-bold text-[#C5A059] uppercase drop-shadow-[0_0_12px_rgba(197,160,89,0.25)]`}
        >
          V&K Prism
        </h1>
        
        {/* Terminal Active Badge */}
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Terminal Active
        </span>
      </div>

      {/* Onboarding Steps Progress Bar */}
      <nav className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400">
        {[
          { num: 1, label: 'Gateway' },
          { num: 2, label: 'Identity' },
          { num: 3, label: 'Capital' },
          { num: 4, label: 'Shield' },
          { num: 5, label: 'People' },
          { num: 6, label: 'Flow' },
        ].map((step, idx) => (
          <div key={step.num} className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded transition-colors ${
                currentStep === step.num
                  ? 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 font-bold'
                  : currentStep > step.num
                  ? 'text-slate-300'
                  : 'text-slate-600'
              }`}
            >
              {step.num}. {step.label}
            </span>
            {idx < 5 && <span className="text-slate-700">→</span>}
          </div>
        ))}
      </nav>

    </header>
  );
}