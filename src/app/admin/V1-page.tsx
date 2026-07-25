'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Lora } from 'next/font/google'
import EcosystemEntitiesManager from '../components/EcosystemEntitiesManager'
import EcosystemContactsManager from '../components/EcosystemContactsManager'
import PrismUserManagement from '../components/PrismUserManagement'

const lora = Lora({ subsets: ['latin'], weight: ['400', '700'] })

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>('0')
  const [entityCount, setEntityCount] = useState<number>(0)
  const [staffCount, setStaffCount] = useState<number>(0)
  const [vendorCount, setVendorCount] = useState<number>(0)
  const [contractorCount, setContractorCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function calculateTelemetry() {
      setLoading(true)
      
      // 1. Count global entity nodes
      const { count: entities } = await supabase
        .from('crm_entities')
        .select('*', { count: 'exact', head: true })

      // 2. Count distinct human actors by their true database designations
      const { data: contacts } = await supabase
        .from('crm_contacts')
        .select('actor_type')

      if (contacts) {
        setStaffCount(contacts.filter(c => c.actor_type === 'STAFF').length)
        setVendorCount(contacts.filter(c => c.actor_type === 'VENDOR').length)
        setContractorCount(contacts.filter(c => c.actor_type === 'CONTRACTOR').length)
      }

      setEntityCount(entities || 0)
      setLoading(false)
    }

    calculateTelemetry()
  }, [])

  return (
    <div className="flex h-screen bg-black text-zinc-100 font-sans antialiased">
      {/* Dynamic Terminal Sidebar */}
      <div className="w-64 border-r border-zinc-900 bg-zinc-950/70 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-mono text-xs font-bold tracking-widest text-zinc-400 uppercase">V&K Prism System</span>
          </div>
          
          <nav className="flex flex-col space-y-1.5 font-mono text-xs">
            <button 
              onClick={() => setActiveTab('0')}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition ${activeTab === '0' ? 'bg-zinc-900 text-amber-400 border border-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              📈 INTELLIGENCE ENGINE
            </button>
            <button 
              onClick={() => setActiveTab('1')}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition ${activeTab === '1' ? 'bg-zinc-900 text-amber-400 border border-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              👥 GLOBAL USER MANAGER
            </button>
          </nav>
        </div>

        <div className="border-t border-zinc-900/60 pt-4 font-mono text-[10px] text-zinc-600 space-y-1">
          <div>OPERATOR: j.mcgowan@hawkmail.hccfl.edu</div>
          <div className="text-emerald-500/80 tracking-tight">CUSTODIAN MODE ACTIVE</div>
        </div>
      </div>

      {/* Main Control Console Window */}
      <div className="flex-1 overflow-y-auto p-8 bg-zinc-950/20">
        {loading ? (
          <div className="text-xs font-mono text-zinc-600 animate-pulse uppercase tracking-widest">Recalibrating Core System Metrics...</div>
        ) : (
          <>
            {activeTab === '0' && (
              <div className="space-y-8 max-w-6xl">
                <div>
                  <h2 className={`text-3xl font-bold tracking-tight text-zinc-100 ${lora.className}`}>Ecosystem Intelligence</h2>
                  <p className="text-xs text-zinc-500 mt-1">Telemetry tracking direct client networks and downstream asset structural parameters.</p>
                </div>

                {/* Live Database Telemetry Counters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border border-zinc-900 bg-zinc-950/40 rounded-xl space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Total Entity Nodes</div>
                    <div className="text-2xl font-bold text-zinc-100 font-mono">{entityCount}</div>
                  </div>
                  <div className="p-4 border border-zinc-900 bg-zinc-950/40 rounded-xl space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Internal Employees</div>
                    <div className="text-2xl font-bold text-zinc-100 font-mono">{staffCount}</div>
                  </div>
                  <div className="p-4 border border-zinc-900 bg-zinc-950/40 rounded-xl space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Verified Vendors</div>
                    <div className="text-2xl font-bold text-amber-500 font-mono">{vendorCount}</div>
                  </div>
                  <div className="p-4 border border-zinc-900 bg-zinc-950/40 rounded-xl space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Contractors Linked</div>
                    <div className="text-2xl font-bold text-purple-400 font-mono">{contractorCount}</div>
                  </div>
                </div>

                {/* Live Management Grid */}
                <EcosystemEntitiesManager />
              </div>
            )}

            {activeTab === '1' && (
              <div className="space-y-8 max-w-6xl">
                <PrismUserManagement />
                <div className="h-px bg-zinc-900 my-8" />
                <EcosystemContactsManager />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}