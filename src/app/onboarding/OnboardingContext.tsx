"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const STORAGE_KEY = "vk_prism_onboarding_payload";

// Complete form payload type structure
export interface OnboardingData {
  company_name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  legal_structure?: string;
  formation_year?: string;
  hq_address_line_1?: string;
  hq_city?: string;
  hq_state?: string;
  hq_postal_code?: string;
  hq_address_type?: string;
  hq_address_verified_usps?: boolean; // Required for Step 2
  funding_stage?: string;
  target_raise?: string;
  has_bylaws?: string | null;
  bylaws_governance_status?: string; // Required for Step 3
  accounting_software?: string;
  accounting_vendor_audit?: any;
  email_workspace_suite?: string;
  workspace_vendor_audit?: any;
  mdm_provider?: string;
  mdm_vendor_audit?: any;
  shield_managed_service_opt_in?: boolean; // Required for Step 4
  antivirus_status?: string;
  backup_frequency?: string;
  headcount_range?: string;
  payroll_provider?: string;
  payroll_vendor_audit?: any;
  people_managed_service_opt_in?: boolean; // Required for Step 5
  benefits_offered?: string[];
  crm_provider?: string;
  crm_vendor_audit?: any;
  collaboration_tool?: string;
  automation_platform?: string;
  // Metadata
  is_fast_track?: boolean;
  onboarding_mode?: string;
  step_completed?: number;
  audit_flag?: string;
  readiness_completion_pct?: number; // Required for partial submission
  status?: string; // Required for partial submission
}

interface OnboardingContextType {
  formData: OnboardingData;
  updateFormData: (data: Partial<OnboardingData>) => void;
  clearFormData: () => void;
  isHydrated: boolean;
  submitPartialPayload: (router: any) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<OnboardingData>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Load draft from Session Storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse onboarding draft", e);
      }
    }
    setIsHydrated(true);
  }, []);

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...data };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearFormData = () => {
    setFormData({});
    sessionStorage.removeItem(STORAGE_KEY);
  };

  // --- NEW: Global Submission Handler for the "Skip" Path ---
  const submitPartialPayload = async (router: any) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      let userId = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || null;
      } catch {
        // Anonymous submission fallback
      }

      const dbPayload = {
        user_id: userId,
        company_name: formData.company_name || 'Unspecified Entity',
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        legal_structure: formData.legal_structure || null,
        formation_year: formData.formation_year || null,
        hq_address_line_1: formData.hq_address_line_1 || null,
        hq_city: formData.hq_city || null,
        hq_state: formData.hq_state || null,
        hq_postal_code: formData.hq_postal_code || null,
        hq_address_type: formData.hq_address_type || null,
        funding_stage: formData.funding_stage || null,
        target_raise: formData.target_raise || null,
        has_bylaws: formData.has_bylaws || null,
        accounting_software: formData.accounting_software || null,
        accounting_vendor_audit: formData.accounting_vendor_audit || null,
        email_workspace_suite: formData.email_workspace_suite || null, // Will be null if skipped
        mdm_provider: formData.mdm_provider || null, // Will be null if skipped
        antivirus_status: formData.antivirus_status || null, // Will be null if skipped
        headcount_range: formData.headcount_range || null, // Will be null if skipped
        payroll_provider: formData.payroll_provider || null, // Will be null if skipped
        benefits_offered: formData.benefits_offered || null, // Will be null if skipped
        crm_provider: formData.crm_provider || null, // Will be null if skipped
        readiness_completion_pct: 35, // Flags as a partial profile
        status: 'ONBOARDING_PARTIAL' // Special status for your admin pipeline
      };

      const { error } = await supabase
        .from('crm_questionnaire_staging')
        .insert([dbPayload]);

      if (error) throw error;

      clearFormData();
      router.push('/onboarding/success');
      
    } catch (err) {
      console.error('Submission failed:', err);
      alert('There was an error saving your data. Please try again.');
    }
  };

  return (
    <OnboardingContext.Provider value={{ formData, updateFormData, clearFormData, isHydrated, submitPartialPayload }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}