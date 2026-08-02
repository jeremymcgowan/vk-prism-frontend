'use client'

import React, { useState, useMemo } from 'react'
import { gapAnalysisDictionary } from '@/constants/GapAnalysisDictionary'
import GapAnalysisLightbox from './GapAnalysisLightbox'

interface CapitalReadinessScoreProps {
  entityData: any // Pass the client's row from crm_entities here
}

export default function CapitalReadinessScore({ entityData }: CapitalReadinessScoreProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  // Calculate the missing fields by comparing the DB data to our Dictionary
  const { score, missingFields } = useMemo(() => {
    if (!entityData) return { score: 0, missingFields: gapAnalysisDictionary }

    const missing = gapAnalysisDictionary.filter((field) => {
      const value = entityData[field.dbKey]
      // It's missing if it's null, undefined, false, or an empty string
      return value === null || value === undefined || value === false || value === ''
    })

    const total = gapAnalysisDictionary.length
    const completed = total - missing.length
    const calculatedScore = Math.round((completed / total) * 100)

    return { score: calculatedScore, missingFields: missing }
  }, [entityData])

  const getScoreColor = () => {
    if (score >= 80) return 'text-[#00FF66] bg-[#00FF66]/10 border-[#00FF66]/30'
    if (score >= 40) return 'text-[#C5A880] bg-[#C5A880]/10 border-[#C5A880]/30'
    return 'text-red-400 bg-red-950/40 border-red-900/50'
  }

  const handleNavigateToSettings = () => {
    setIsLightboxOpen(false)
    // Add your routing logic here (e.g., router.push('/dashboard/settings'))
    alert('Routing to settings portal...') 
  }

  return (
    <>
      {/* The Dashboard Widget */}
      <div 
        onClick={() => setIsLightboxOpen(true)}
        className="p-4 border border-zinc-800 bg-zinc-950/60 rounded-xl cursor-pointer hover:border-[#C5A880]/60 transition group flex flex-col justify-between"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest group-hover:text-white transition">
              Capital Readiness Score
            </h3>
            <p className="text-[10px] text-zinc-500 font-sans">
              Click to view institutional gap analysis.
            </p>
          </div>
          <div className={`px-2.5 py-1 rounded border font-mono font-bold text-xs ${getScoreColor()}`}>
            {score}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full bg-[#C5A880] transition-all duration-1000 ease-out"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* The Lightbox Modal */}
      {isLightboxOpen && (
        <GapAnalysisLightbox 
          missingFields={missingFields} 
          score={score} 
          onClose={() => setIsLightboxOpen(false)} 
          onNavigateToSettings={handleNavigateToSettings}
        />
      )}
    </>
  )
}