'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cinzel } from 'next/font/google';

// Load Cinzel display font
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function OnboardingSuccess() {
  const router = useRouter();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Phase 1: Top-Down Black Paint Sweep (0.1s)
    const t1 = setTimeout(() => setStage(1), 100);
    // Phase 2: Card & Knight Logo Fade-In (1.2s)
    const t2 = setTimeout(() => setStage(2), 1200);
    // Phase 3: Text & Message Fade-In (2.2s)
    const t3 = setTimeout(() => setStage(3), 2200);
    // Phase 4: Dark Gold Action Button Fade-In (3.2s)
    const t4 = setTimeout(() => setStage(4), 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col justify-center items-center overflow-hidden font-sans text-white">
      
      {/* Phase 1: Top-Down Black Curtain Paint */}
      <div 
        className={`fixed inset-0 bg-black z-0 transition-transform duration-1000 ease-out pointer-events-none ${
          stage >= 1 ? 'translate-y-0' : '-translate-y-full'
        }`}
      />

      {/* Refined Ambient Gold Halo Accent */}
<div 
  className={`absolute w-[420px] h-[420px] bg-[#C5A059]/5 rounded-full blur-[80px] pointer-events-none z-10 transition-opacity duration-1000 ${
    stage >= 2 ? 'opacity-100' : 'opacity-0'
  }`}
/>

      {/* Main Success Card Container */}
      <div 
        className={`relative z-20 w-full max-w-xl bg-[#0a0a0a] border border-[#C5A059]/30 rounded-2xl p-10 text-center shadow-[0_0_50px_-10px_rgba(197,160,89,0.15)] transition-all duration-1000 transform ${
          stage >= 2 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-8 scale-95'
        }`}
      >
        {/* V&K Knight Logo Header */}
        <div className="flex justify-center mb-6">
          <img 
            src="/knight_only.png" 
            alt="Vanderbilt & Knight" 
            className={`h-24 w-auto object-contain filter drop-shadow-[0_0_20px_rgba(197,160,89,0.4)] transition-all duration-1000 ${
              stage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
          />
        </div>

        {/* Phase 3: Text & Message */}
        <div 
          className={`space-y-4 transition-all duration-1000 ${
            stage >= 3 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
        >
          <h2 className="text-xs font-bold tracking-[0.3em] text-[#C5A059] uppercase">
            Corporate Profile Registered
          </h2>

          <h1 className={`${cinzel.className} text-3xl font-light text-white tracking-wide`}>
            Welcome to <span className="text-[#C5A059] font-normal not-italic">V&K Prism</span>
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto pt-2">
            Your corporate entity, infrastructure parameters, and operational preferences have been successfully saved. Your custom portal is live.
          </p>
        </div>

        {/* Phase 4: "Enter V&K Console Dashboard" Button */}
        <div 
          className={`mt-10 pt-4 transition-all duration-1000 ${
            stage >= 4 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-6'
          }`}
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto px-8 py-4 bg-[#050505] border border-[#C5A059] text-[#C5A059] font-medium text-xs tracking-[0.2em] uppercase rounded-xl hover:bg-[#C5A059] hover:text-black hover:border-[#C5A059] transition-all duration-500 shadow-[0_0_20px_-5px_rgba(197,160,89,0.3)] hover:shadow-[0_0_35px_0px_rgba(197,160,89,0.6)] active:scale-[0.98] group"
          >
            Enter V&K Console Dashboard <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>

      </div>
    </div>
  );
}