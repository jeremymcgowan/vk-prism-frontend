'use client';

export default function OnboardingHeader({ currentStep }: { currentStep: number }) {
  const steps = [
    'Gateway',
    'Identity',
    'Capital',
    'Shield',
    'People',
    'Flow',
  ];

  return (
    <header className="w-full bg-black/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-white font-bold tracking-widest text-lg">V&K PRISM</span>
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Terminal Active
        </span>
      </div>

      {/* Progress Trail */}
      <div className="hidden md:flex items-center gap-2">
        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isComplete = stepNum < currentStep;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300' 
                  : isComplete 
                  ? 'bg-slate-900 text-slate-400 border border-slate-800' 
                  : 'text-slate-600'
              }`}>
                <span>{stepNum}.</span>
                <span>{label}</span>
              </div>
              {idx < steps.length - 1 && <span className="text-slate-800 text-xs">→</span>}
            </div>
          );
        })}
      </div>

      <div className="text-xs text-slate-500 font-mono">
        Step {currentStep} of 6
      </div>
    </header>
  );
}