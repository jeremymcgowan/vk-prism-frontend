'use client';

import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['600', '700'],
});

export default function OnboardingHeader({ currentStep = 1 }) {
  return (
    <header className="w-full bg-[#0A0A0C]/90 backdrop-blur-md border-b border-[#1F1F1F] px-6 py-4 flex items-center justify-between">
      
      {/* Brand Title in Gold & Cinzel Font */}
      <div className="flex items-center gap-3">
        <h1 
          className={`${cinzel.className} text-xl tracking-[0.2em] font-bold text-[#C5A880] uppercase drop-shadow-[0_0_12px_rgba(197,168,128,0.25)]`}
        >
          V&K Prism
        </h1>
      </div>

      {/* Onboarding Steps Progress Bar */}
      <nav 
        className="hidden md:flex items-center gap-2 text-xs text-neutral-400"
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
                  ? 'bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/40 font-bold'
                  : currentStep > step.num
                  ? 'text-neutral-300'
                  : 'text-neutral-600'
              }`}
            >
              {step.num}. {step.label}
            </span>
            {idx < 5 && <span className="text-neutral-700">→</span>}
          </div>
        ))}
      </nav>

    </header>
  );
}