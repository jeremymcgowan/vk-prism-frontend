// src/constants/GapAnalysisDictionary.ts

export type GapTier = 
  | 'Legal & Liability Safeguards' 
  | 'Advanced Cyber & Architecture' 
  | 'Human Resources & Compliance' 
  | 'Growth & Operational Flow';

export interface GapField {
  dbKey: string; // The exact column name in crm_entities
  tier: GapTier;
  title: string;
  description: string;
}

export const gapAnalysisDictionary: GapField[] = [
  // TIER 1: Legal & Liability
  {
    dbKey: 'legal_trademarks_filed',
    tier: 'Legal & Liability Safeguards',
    title: 'Trademark & IP Protection',
    description: 'Without registered trademarks, your brand equity is at risk of being legally hijacked. Investors view unprotected IP as a critical liability that can delay or kill funding rounds.'
  },
  {
    dbKey: 'ins_epli_coverage_active',
    tier: 'Legal & Liability Safeguards',
    title: 'Employment Practices Liability (EPLI)',
    description: 'EPLI protects your company against lawsuits from employees (e.g., wrongful termination). Securing this policy shows institutional investors that your board is actively insulating capital against operational risks.'
  },

  // TIER 2: Cyber & Architecture
  {
    dbKey: 'flow_secrets_vaulted',
    tier: 'Advanced Cyber & Architecture',
    title: 'API Secrets & Key Vaulting',
    description: 'Hardcoding API keys into your software is a massive security vulnerability. Transitioning to a secure vaulting system ensures you pass technical due diligence when investors audit your codebase.'
  },
  {
    dbKey: 'web_security_tested',
    tier: 'Advanced Cyber & Architecture',
    title: 'Web Asset Penetration Testing',
    description: 'A single data breach can destroy client trust. Regular, documented security testing on your digital assets proves your infrastructure is hardened against modern threat vectors.'
  },

  // TIER 3: HR & Compliance
  {
    dbKey: 'hr_handbook_compliant',
    tier: 'Human Resources & Compliance',
    title: 'Compliant Employee Handbook',
    description: 'A legally compliant, multi-state handbook sets the rules of engagement for your workforce. It prevents costly misclassification lawsuits and establishes a professional corporate culture.'
  },
  {
    dbKey: 'hr_termination_protocol_documented',
    tier: 'Human Resources & Compliance',
    title: 'Standardized Termination Protocol',
    description: 'Handling terminations poorly leads to litigation and reputational damage. Documented protocols protect the company and ensure compliance with state-specific separation laws.'
  },

  // TIER 4: Growth & Operations
  {
    dbKey: 'is_developing_ip_rd',
    tier: 'Growth & Operational Flow',
    title: 'R&D Tax Credit Eligibility',
    description: 'If you are developing proprietary technology, you may be eligible for non-dilutive capital through R&D tax credits. Flagging this allows us to help you reclaim cash directly from the IRS.'
  },
  {
    dbKey: 'has_duns_number',
    tier: 'Growth & Operational Flow',
    title: 'Dun & Bradstreet Registration (DUNS)',
    description: 'A DUNS number establishes your corporate credit profile. It is essential for securing business loans, government contracts, and favorable vendor terms without using personal guarantees.'
  }
];