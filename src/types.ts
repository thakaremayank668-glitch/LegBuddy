export type LanguageCode = 'en' | 'hi' | 'gu';

export interface CitationSource {
  id: string;
  title: string;
  actOrRegulation: string;
  sectionOrRule?: string;
  ministryOrAuthority: string;
  officialUrl: string;
  verifiedDate: string;
  version: string;
  summary: string;
  verificationStatus: 'verified' | 'pending' | 'updated';
  citationsCount: number;
  category: 'business' | 'tax' | 'ipr' | 'labour' | 'licence' | 'statutory' | 'sectoral';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language: LanguageCode;
  citations?: CitationSource[];
  suggestedQuestions?: string[];
  intent?: string;
  disclaimer?: string;
}

export interface BusinessSetupRequest {
  businessName: string;
  domain: string;
  customDomain?: string;
  scale: 'micro' | 'small' | 'medium' | 'large';
  locationState: string;
  entityType?: 'proprietorship' | 'partnership' | 'llp' | 'pvt_ltd' | 'opc' | 'section8' | 'trust';
  operatesOnline: boolean;
  hasPhysicalPremises: boolean;
  employeeCountEstimate?: number;
  language?: LanguageCode;
}

export interface RequiredRegistration {
  id: string;
  name: string;
  authority: string;
  portalUrl: string;
  portalName: string;
  timeEstimate: string;
  govtFee: string;
  mandatory: boolean;
  description: string;
  applicableLaw: string;
  stepNumber: number;
}

export interface RequiredLicence {
  id: string;
  name: string;
  authority: string;
  portalUrl: string;
  validityPeriod: string;
  penaltyForNonCompliance: string;
  prerequisites: string[];
  checklist: string[];
  renewalProcess: string;
}

export interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  acceptableFormats: string;
  issuingAuthority: string;
  purpose: string;
}

export interface ComplianceCalendarItem {
  id: string;
  event: string;
  frequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual' | 'Event-Based';
  authority: string;
  dueDate: string;
  applicableLaw: string;
  penaltyWarning: string;
}

export interface BusinessRoadmap {
  businessName: string;
  domain: string;
  state: string;
  recommendedStructure: {
    type: string;
    rationale: string;
    keyAdvantages: string[];
    alternativesConsidered: string[];
  };
  registrations: RequiredRegistration[];
  licences: RequiredLicence[];
  documents: RequiredDocument[];
  implementationPlan: {
    stage: string;
    phaseTitle: string;
    timeline: string;
    actionItems: string[];
  }[];
  complianceCalendar: ComplianceCalendarItem[];
  verifiedSources: CitationSource[];
}

export interface DocumentAnalysisResult {
  documentTitle: string;
  documentType: string;
  governingLaw: string;
  executiveSummary: string;
  plainLanguageExplanation: string;
  riskRating: 'Low' | 'Moderate' | 'High' | 'Critical';
  keyClauses: {
    clauseTitle: string;
    clauseNumber?: string;
    plainMeaning: string;
    impact: 'favorable' | 'neutral' | 'risk';
    statutoryCaution?: string;
  }[];
  redFlags: {
    severity: 'high' | 'medium' | 'low';
    issue: string;
    legalRisk: string;
    statutoryReference: string;
    recommendedRemedy: string;
  }[];
  actionChecklist: {
    id: string;
    task: string;
    timelineHint: string;
    responsibleParty: string;
    completed: boolean;
  }[];
  statutoryRemedies: string[];
  verifiedSources: CitationSource[];
}

export interface ComplianceTask {
  id: string;
  title: string;
  category: 'tax' | 'registration' | 'licence' | 'statutory' | 'labour';
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  portalUrl?: string;
  formName?: string;
  authority: string;
  penaltyRisk: string;
  notes?: string;
}

export interface LicenceItem {
  id: string;
  name: string;
  licenceNumber: string;
  authority: string;
  issueDate: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'active' | 'renewal_due' | 'expired';
  portalUrl: string;
  renewalFee?: string;
}
