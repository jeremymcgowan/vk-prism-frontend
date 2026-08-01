"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const STORAGE_KEY = "vk_prism_onboarding_payload";

// Complete form payload type structure with index signature for build resilience
export interface OnboardingData {
  company_name?: string;
  company_url?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  legal_structure?: string;
  formation_year?: string;
  registration_state?: string;
  ein_number?: string;
  fiscal_year_end_month?: string;
  employee_count_w2_ft?: number;
  employee_count_w2_pt?: number;
  contractor_count_1099?: number;
  hq_address_line_1?: string;
  hq_address_line1?: string;
  hq_city?: string;
  hq_state?: string;
  hq_postal_code?: string;
  hq_zip?: string;
  hq_address_type?: string;
  hq_address_verified_usps?: boolean;
  is_seeking_incentive?: boolean; // Holds the $500 Credit flag!
  funding_stage?: string;
  target_raise?: string;
  has_bylaws?: string | null;
  bylaws_governance_status?: string;
  accounting_software?: string;
  accounting_vendor_audit?: any;
  email_workspace_suite?: string;
  workspace_vendor_audit?: any;
  mdm_provider?: string;
  mdm_vendor_audit?: any;
  shield_managed_service_opt_in?: boolean;
  antivirus_status?: string;
  backup_frequency?: string;
  has_remote_workers?: string;
  has_vpn?: string;
  vpn_lead_flag?: boolean;
  headcount_range?: string;
  team_headcount?: string;
  payroll_provider?: string;
  payroll_system?: string;
  payroll_vendor_audit?: any;
  people_managed_service_opt_in?: boolean;
  benefits_offered?: string[];
  corporate_benefits?: string[];
  crm_provider?: string;
  crm_system?: string;
  crm_vendor_audit?: any;
  collaboration_tool?: string;
  automation_platform?: string;
  automation_status?: string;
  industry?: string;
  // Metadata & Status
  is_fast_track?: boolean;
  onboarding_mode?: string;
  step_completed?: number;
  audit_flag?: string;
  readiness_completion_pct?: number;
  status?: string;
  // Index signature: Allows dynamic form fields without breaking builds
  [key: string]: any;
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

  // --- Global Submission Handler for the "Skip" Path ---
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
        email_workspace_suite: formData.email_workspace_suite || null,
        mdm_provider: formData.mdm_provider || null,
        antivirus_status: formData.antivirus_status || null,
        headcount_range: formData.headcount_range || null,
        payroll_provider: formData.payroll_provider || null,
        benefits_offered: formData.benefits_offered || null,
        crm_provider: formData.crm_provider || null,
        readiness_completion_pct: 35,
        status: 'ONBOARDING_PARTIAL'
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