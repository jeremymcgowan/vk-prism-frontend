import React from 'react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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
          <Link href="/dashboard" className="w-full flex items-center px-3.5 py-3 text-[11px] font-semibold tracking-[1.5px] uppercase bg-vk-surface-light text-vk-gold border border-vk-border text-left font-body transition-all no-underline">
            <span className="text-sm mr-3 shrink-0">🎛️</span>
            <span className="truncate">Ecosystem Overview</span>
          </Link>
          
          <Link href="/dashboard/entities" className="w-full flex items-center px-3.5 py-3 text-[11px] font-semibold tracking-[1.5px] uppercase text-vk-muted hover:text-white hover:bg-vk-surface-light border border-transparent hover:border-vk-border text-left font-body transition-all no-underline">
            <span className="text-sm mr-3 shrink-0">🏢</span>
            <span className="truncate">CRM Entities</span>
          </Link>
          
          <Link href="/dashboard/billing" className="w-full flex items-center px-3.5 py-3 text-[11px] font-semibold tracking-[1.5px] uppercase text-vk-muted hover:text-white hover:bg-vk-surface-light border border-transparent hover:border-vk-border text-left font-body transition-all no-underline">
            <span className="text-sm mr-3 shrink-0">💳</span>
            <span className="truncate">Proposals & Billing</span>
          </Link>
          
          <Link href="/dashboard/calendar" className="w-full flex items-center px-3.5 py-3 text-[11px] font-semibold tracking-[1.5px] uppercase text-vk-muted hover:text-white hover:bg-vk-surface-light border border-transparent hover:border-vk-border text-left font-body transition-all no-underline">
            <span className="text-sm mr-3 shrink-0">📅</span>
            <span className="truncate">Cognitive Calendar</span>
          </Link>
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

        {/* Core Workspace Canvas Scroll Container */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-vk-gold/[0.015] filter blur-[100px] pointer-events-none" />
          {children}
        </main>
      </div>

    </div>
  );
}