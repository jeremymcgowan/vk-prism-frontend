'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface QuestionnaireSubmission {
  id: string
  company_name: string
  contact_name: string
  contact_email: string
  crm_system: string
  collaboration_tool: string
  automation_status: string
  created_at: string
}

export default function QuestionnaireSubmissionsManager() {
  const [submissions, setSubmissions] = useState<QuestionnaireSubmission[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchSubmissions()
  }, [])

  async function fetchSubmissions() {
    setLoading(true)
    setErrorMsg(null)

    const { data, error } = await supabase
      .from('crm_questionnaire_submissions')
      .select('id, company_name, contact_name, contact_email, crm_system, collaboration_tool, automation_status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setErrorMsg(`Failed to fetch leads: ${error.message}`)
    } else if (data) {
      setSubmissions(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="text-xs font-mono text-zinc-500 animate-pulse uppercase tracking-widest">QUERYING ONBOARDING PIPELINE...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase font-mono">
            Onboarding Leads Pipeline (crm_questionnaire_submissions)
          </h3>
          <p className="text-[11px] text-zinc-500 font-sans">
            Live client intake submissions harvested from the onboarding workflow.
          </p>
        </div>
        <button 
          onClick={fetchSubmissions}
          className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded font-mono text-[10px] hover:text-white transition"
        >
          REFRESH
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/30 border border-red-900/50 text-red-400 text-xs font-mono rounded-lg">
          {errorMsg}
        </div>
      )}

      <div className="border border-zinc-900 rounded-xl overflow-x-auto bg-zinc-950/40 w-full block">
        <table className="w-full text-left border-collapse text-xs min-w-[900px]">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 font-bold font-mono">
              <th className="p-3">SUBMITTED</th>
              <th className="p-3">COMPANY NAME</th>
              <th className="p-3">PRIMARY CONTACT</th>
              <th className="p-3">EMAIL IDENTITY</th>
              <th className="p-3">CURRENT CRM</th>
              <th className="p-3">COLLAB TOOL</th>
              <th className="p-3">AUTOMATION STATUS</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-600 font-mono text-xs">
                  NO ONBOARDING LEADS FOUND IN PIPELINE.
                </td>
              </tr>
            ) : (
              submissions.map((sub) => {
                const formattedDate = new Date(sub.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })

                return (
                  <tr key={sub.id} className="border-b border-zinc-900/40 hover:bg-zinc-900/10 transition">
                    <td className="p-3 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                      {formattedDate}
                    </td>
                    <td className="p-3 font-semibold text-zinc-200">
                      {sub.company_name}
                    </td>
                    <td className="p-3 text-zinc-300">
                      {sub.contact_name}
                    </td>
                    <td className="p-3 font-mono text-amber-400">
                      {sub.contact_email}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-mono bg-zinc-900 px-2 py-0.5 rounded text-zinc-400 border border-zinc-800/60">
                        {sub.crm_system || 'NONE'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-zinc-400">
                      {sub.collaboration_tool || 'N/A'}
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        sub.automation_status === 'ZAPIER' 
                          ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40' 
                          : sub.automation_status === 'CUSTOM_AI' 
                          ? 'bg-purple-950/40 text-purple-400 border border-purple-800/40'
                          : 'bg-zinc-900 text-zinc-400'
                      }`}>
                        {sub.automation_status || 'MANUAL'}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}