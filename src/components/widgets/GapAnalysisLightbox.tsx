'use client'

import React from 'react'
import { GapField } from '@/constants/GapAnalysisDictionary'

interface GapAnalysisLightboxProps {
  missingFields: GapField[]
  score: number
  onClose: () => void
  onNavigateToSettings: () => void
}

export default function GapAnalysisLightbox({ missingFields, score, onClose, onNavigateToSettings }: GapAnalysisLightboxProps) {
  // Group missing fields by their Tier for clean UI rendering
  const groupedFields = missingFields.reduce((acc, field) => {
    if (!acc[field.tier]) acc[field.tier] = []
    acc[field.tier].push(field)
    return acc
  }, {} as Record<string, GapField[]>)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4">
      <div className="w-full max-w-3xl bg-zinc-950 border border-[#C5A880]/50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800/80 flex justify-between items-start bg-black/40">
          <div>
            <span className="text-[10px] font-mono text-[#C5A880] font-bold uppercase tracking-widest">
              Strategic Due Diligence
            </span>
            <h2 className="text-2xl font-bold text-zinc-100 mt-1">Capital Readiness Gap Analysis</h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Your profile is currently at <strong className="text-[#C5A880]">{score}% readiness</strong>. 
              Institutional investors and enterprise partners require the following compliance and architectural 
              safeguards before deploying capital.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white font-mono text-xl px-3 py-1 bg-black rounded border border-zinc-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-8 bg-zinc-950/60 custom-scrollbar">
          {Object.entries(groupedFields).map(([tier, fields]) => (
            <div key={tier} className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest border-b border-zinc-900 pb-2">
                {tier}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div key={field.dbKey} className="p-4 bg-black border border-zinc-800 rounded-xl hover:border-[#C5A880]/40 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-500/80 text-[10px]">🔴</span>
                      <h4 className="text-sm font-bold text-zinc-100">{field.title}</h4>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {field.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {missingFields.length === 0 && (
            <div className="p-8 text-center border border-[#00FF66]/30 bg-[#00FF66]/5 rounded-xl">
              <span className="text-3xl block mb-2">🏆</span>
              <h3 className="text-lg font-bold text-[#00FF66]">100% Capital Ready</h3>
              <p className="text-xs text-zinc-400 mt-2">Your entity architecture meets all institutional requirements.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-zinc-900 bg-black/80 flex justify-between items-center">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">
            {missingFields.length} critical data points missing
          </span>
          <button 
            onClick={onNavigateToSettings}
            className="px-6 py-3 rounded-lg bg-[#C5A880] text-black font-extrabold uppercase text-xs tracking-widest hover:bg-[#D4B990] transition shadow-[0_0_15px_rgba(197,168,128,0.2)]"
          >
            🔓 Complete Telemetry Now
          </button>
        </div>

      </div>
    </div>
  )
}