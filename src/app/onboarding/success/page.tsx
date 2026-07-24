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
    // Phase 4: Solid Gold Action Button Fade-In (3.2s)
    const t4 = setTimeout(() => setStage(4), 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    // UPGRADED: Standardized to #050507 obsidian background with clean sans-serif base font
    <div className="relative min-h-screen bg-[#050507] flex flex-col justify-center items-center overflow-hidden font-sans text-[#E4E4E7] p-6 md:p-10 antialiased">
      
      {/* Phase 1: Top-Down Black Curtain Paint */}
      <div 
        className={`fixed inset-0 bg-black z-0 transition-transform duration-1000 ease-out pointer-events-none ${
          stage >= 1 ? 'translate-y-0' : '-translate-y-full'
        }`}
      />

      {/* UPGRADED: Responsive scaling container (max-w-3xl lg:max-w-4xl) with expanded halo wrapper */}
      <div className="w-full max-w-3xl lg:max-w-4xl relative my-8 z-20">
        
        {/* UPGRADED EXPANSIVE GOLD HALO: -inset-3 and blur-3xl aura bound to Phase 2 animation */}
        <div 
          className={`absolute -inset-2 md:-inset-3 bg-gradient-to-r from-[#C5A880]/35 via-[#8B7325]/20 to-[#C5A880]/35 rounded-[2rem] blur-3xl pointer-events-none transition-all duration-1000 ${
            stage >= 2 ? 'opacity-85 scale-100' : 'opacity-0 scale-90'
          }`}
        />

        {/* MAIN CARD: Obsidian glass panel with enhanced padding and double-layered gold glow */}
        <div 
          className={`relative w-full bg-[#0A0A0C]/95 glass-panel border border-[#C5A880]/40 hover:border-[#C5A880]/60 rounded-2xl p-8 md:p-12 lg:p-14 text-center shadow-[0_10px_50px_rgba(0,0,0,0.9),0_0_40px_-5px_rgba(197,168,128,0.25)] transition-all duration-1000 transform overflow-hidden ${
            stage >= 2 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          {/* Internal Corner Accent Glow */}
          <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#C5A880]/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* V&K Knight Logo Header */}
          <div className="flex justify-center mb-8">
            <img 
              src="/knight_only.png" 
              alt="Vanderbilt & Knight" 
              className={`h-24 md:h-28 w-auto object-contain filter drop-shadow-[0_0_25px_rgba(197,168,128,0.5)] transition-all duration-1000 ${
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
            <h2 className="text-xs font-bold tracking-[0.3em] text-[#C5A880] uppercase">
              Corporate Profile Registered
            </h2>

            <h1 className={`${cinzel.className} text-3xl lg:text-4xl font-light text-white tracking-wide`}>
              Welcome to <span className="text-[#C5A880] font-normal not-italic">V&amp;K Prism</span>
            </h1>

            <p className="text-sm md:text-base text-neutral-400 leading-relaxed max-w-lg mx-auto pt-2">
              Your corporate entity, infrastructure parameters, and operational preferences have been successfully saved to our secure databases. Your custom institutional portal is live.
            </p>
          </div>

          {/* Phase 4: Solid Gold "Enter V&K Console Dashboard" Button */}
          <div 
            className={`mt-12 pt-4 transition-all duration-1000 ${
              stage >= 4 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-6'
            }`}
          >
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full sm:w-auto px-10 py-4 bg-[#C5A880] hover:bg-[#D4B990] text-[#050507] font-extrabold text-xs tracking-[0.2em] uppercase rounded-xl transition-all duration-300 shadow-[0_0_25px_rgba(197,168,128,0.3)] hover:shadow-[0_0_40px_rgba(197,168,128,0.6)] active:scale-[0.99] group cursor-pointer"
            >
              Enter V&amp;K Console Dashboard <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 pl-1">→</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}