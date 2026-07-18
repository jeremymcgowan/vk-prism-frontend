import React from 'react';

export default function DashboardPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-vk-pure-black text-white font-body">
      
      {/* =========================================================================
          1. THE SIDEBAR NAVIGATION PANEL (FIXED LEFT CHASSIS)
          ========================================================================= */}
      <aside className="flex h-full w-64 flex-col border-r border-vk-border bg-vk-surface-dark px-4 py-6 z-10 shrink-0 items-center">
        
        {/* Corporate Identity Logo & Centered Title Architecture */}
        <div className="mb-6 px-2 flex flex-col items-center text-center border-b border-vk-border pb-6 w-full">
          <img 
            src="https://vkpartners.co/knight_only.png" 
            alt="V&K Crest Logo" 
            className="h-12 w-auto object-contain mb-3 filter brightness-110"
          />
          <h2 className="font-heading text-white text-sm font-medium tracking-[2px] uppercase m-0 leading-tight">
            V&K Partners
          </h2>
          <h3 className="font-heading text-vk-gold text-[10px] font-bold tracking-[6px] uppercase mt-1.5 pl-[6px] m-0">
            PRISM
          </h3>
        </div>

        {/* Primary App Workspaces Navigation Links (Aligned with vkpartners.co Design DNA) */}
        <nav className="w-full flex-1 space-y-2">
          <button className="w-full flex items-center px-3.5 py-3 text-[11px] font-semibold tracking-[1.5px] uppercase bg-vk-surface-light text-vk-gold border border-vk-border text-left cursor-pointer outline-none font-body transition-all">
            <span className="text-sm mr-3 shrink-0">🎛️</span>
            <span className="truncate">Ecosystem Overview</span>
          </button>
          
          <button className="w-full flex items-center px-3.5 py-3 text-[11px] font-semibold tracking-[1.5px] uppercase text-vk-muted hover:text-white hover:bg-vk-surface-light border border-transparent hover:border-vk-border text-left cursor-pointer outline-none font-body transition-all">
            <span className="text-sm mr-3 shrink-0">🏢</span>
            <span className="truncate">CRM Entities</span>
          </button>
          
          <button className="w-full flex items-center px-3.5 py-3 text-[11px] font-semibold tracking-[1.5px] uppercase text-vk-muted hover:text-white hover:bg-vk-surface-light border border-transparent hover:border-vk-border text-left cursor-pointer outline-none font-body transition-all">
            <span className="text-sm mr-3 shrink-0">💳</span>
            <span className="truncate">Proposals & Billing</span>
          </button>
          
          <button className="w-full flex items-center px-3.5 py-3 text-[11px] font-semibold tracking-[1.5px] uppercase text-vk-muted hover:text-white hover:bg-vk-surface-light border border-transparent hover:border-vk-border text-left cursor-pointer outline-none font-body transition-all">
            <span className="text-sm mr-3 shrink-0">📅</span>
            <span className="truncate">Cognitive Calendar</span>
          </button>
        </nav>

        {/* User Workspace Status Profile Footprint */}
        <div className="w-full mt-auto border-t border-vk-border pt-4 flex items-center space-x-3">
          <div className="h-8 w-8 bg-vk-surface-light border border-vk-border flex items-center justify-center font-heading text-xs text-vk-gold font-bold shrink-0">
            VK
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold text-white truncate">Tenant #1 (Admin)</span>
            <span className="text-[10px] text-vk-gold-dim tracking-wider truncate">console.vkpartners.co</span>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. THE MAIN WORKING WINDOW (DYNAMIC STAGE)
          ========================================================================= */}
      <div className="flex flex-col flex-1 h-full min-w-0 bg-vk-pure-black">
        
        {/* Universal Top Console Operations Strip */}
        <header className="flex h-16 items-center justify-between border-b border-vk-border px-6 bg-vk-surface-dark shrink-0">
          <div className="w-96">
            <input 
              type="text" 
              placeholder="Search Entities, Tasks, or Invoices (Ctrl+K)..." 
              className="w-full bg-vk-surface-light border border-vk-border px-3 py-1.5 text-xs text-white placeholder-vk-muted outline-none focus:border-vk-gold transition-all"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] tracking-widest text-emerald-500 font-semibold uppercase">
                Telemetry Connected
              </span>
            </div>
          </div>
        </header>

        {/* Core Workspace Canvas Scroll Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {/* Subtle brand glow vector backplate */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-vk-gold/[0.015] filter blur-[100px] pointer-events-none" />

          {/* Page Structure Header Blocks */}
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-medium tracking-[3px] text-white uppercase mb-2">
              Ecosystem Overview
            </h1>
            <p className="text-xs text-vk-muted tracking-wide leading-relaxed">
              Welcome to the V&K Prism master operations terminal. Live database telemetries and CRM telemetry views will populate here.
            </p>
          </div>

          {/* Core Status Component Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-vk-surface-dark border border-vk-border p-6 transition-all hover:border-vk-gold/30">
              <h3 className="font-heading text-xs font-bold tracking-wider uppercase text-vk-gold mb-3">
                Operational Status
              </h3>
              <p className="text-xs text-vk-muted leading-relaxed">
                System parameters are verified. Core analytical functions are processing normal network telemetry patterns.
              </p>
            </div>

            <div className="bg-vk-surface-dark border border-vk-border p-6 transition-all hover:border-vk-gold/30">
              <h3 className="font-heading text-xs font-bold tracking-wider uppercase text-vk-gold mb-3">
                Compliance Logs
              </h3>
              <p className="text-xs text-vk-muted leading-relaxed">
                Intake queues mapped. Client onboarding structures are configured to run deep corporate entity checks.
              </p>
            </div>

            <div className="bg-vk-surface-dark border border-vk-border p-6 transition-all hover:border-vk-gold/30">
              <h3 className="font-heading text-xs font-bold tracking-wider uppercase text-vk-gold mb-3">
                Revenue Streams
              </h3>
              <p className="text-xs text-vk-muted leading-relaxed">
                Financial ledger connections initialized. Core payment processors stand ready to distribute invoice requests.
              </p>
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}