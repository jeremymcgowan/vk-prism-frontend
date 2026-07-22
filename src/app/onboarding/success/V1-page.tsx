'use client';

import { useRouter } from 'next/navigation';

export default function OnboardingSuccess() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-10 text-center relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
          </div>

          <h1 className="text-3xl font-light text-white mb-3">
            Welcome to V&K Prism
          </h1>
          
          <p className="text-slate-400 mb-8 leading-relaxed">
            Your corporate profile and infrastructure preferences have been registered. Your customized console workspace is ready.
          </p>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
          >
            Enter V&K Console Dashboard →
          </button>
        </div>

      </div>
    </div>
  );
}