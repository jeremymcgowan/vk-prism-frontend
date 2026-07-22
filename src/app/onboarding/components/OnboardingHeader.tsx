'use client';

import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['600', '700'],
});

export default function OnboardingHeader({ currentStep = 1 }) {
  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      
      {/* Brand Title in Gold & Cinzel Font */}
      <div className="flex items-center gap-3">
        <h1 
          className={`${cinzel.className} text-xl tracking-[0.2em] font-bold text-[#C5A059] uppercase drop-shadow-[0_0_12px_rgba(197,160,89,0.25)]`}
        >
          V&K Prism
        </h1>
      </div>

      {/* Onboarding Steps Progress Bar — Segoe UI Font */}
      <nav 
        className="hidden md:flex items-center gap-2 text-xs text-slate-400"
        style={{ fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}
      >
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