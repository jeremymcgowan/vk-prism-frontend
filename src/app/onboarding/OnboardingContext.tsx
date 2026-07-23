"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "vk_prism_onboarding_payload";

// Complete form payload type structure
export interface OnboardingData {
  // Step 1: Gateway
  company_name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  
  // Step 2: Identity
  legal_structure?: string;
  formation_year?: string;
  hq_address_line_1?: string;
  hq_city?: string;
  hq_state?: string;
  hq_postal_code?: string;
  
  // Step 3: Capital
  funding_stage?: string;
  target_raise?: string;
  has_bylaws?: boolean | null;
  
  // Step 4: Shield
  email_workspace_suite?: string;
  antivirus_status?: string;
  backup_frequency?: string;
  mdm_provider?: string;
  
  // Step 5: People
  headcount_range?: string;
  payroll_provider?: string;
  accounting_software?: string;
  
  // Step 6: Flow
  crm_system?: string;
  collaboration_tool?: string;
  automation_status?: string;

  [key: string]: any;
}

interface OnboardingContextType {
  formData: OnboardingData;
  updateFormData: (fields: Partial<OnboardingData>) => void;
  clearFormData: () => void;
  isHydrated: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<OnboardingData>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Hydrate from sessionStorage on initial client load
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        setFormData(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not read onboarding data from sessionStorage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Update state and write to sessionStorage
  const updateFormData = (fields: Partial<OnboardingData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...fields };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save onboarding data to sessionStorage:", e);
      }
      return updated;
    });
  };

  // 3. Clear storage upon completion
  const clearFormData = () => {
    setFormData({});
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Could not clear sessionStorage:", e);
    }
  };

  return (
    <OnboardingContext.Provider value={{ formData, updateFormData, clearFormData, isHydrated }}>
      {children}
    </OnboardingContext.Provider>
  );
}

// THIS IS THE EXACT HOOK VERCEL CANNOT FIND right now:
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}