// Shared types and interfaces for PolicyPilot

export type UserRole = "owner" | "admin" | "staff";
export type SubscriptionPlan = "basic" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trial";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PolicyStatus = "draft" | "final";

export interface Tenant {
  id: string;
  name: string;
  industry: string;
  country: string;
  createdAt: Date | string;
  ownerUserId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  createdAt: Date | string;
}

export interface ComplianceProfile {
  id: string;
  tenantId: string;
  industry: string;
  businessSize: string;
  country: string;
  answers: Record<string, any>; // JSON of questionnaire answers
  riskScore: number; // 0-100
  summary: string;
  recommendedActions: string[];
  createdAt: Date | string;
}

export interface PolicyControlCoverage {
  covered: string[];
  missing: string[];
  coverageByControl: Record<
    string,
    {
      status: "covered" | "missing";
      sections: string[];
    }
  >;
}

export interface PolicyProvenanceTag {
  sourceId: string;
  sourceName: string;
  jurisdiction: string;
  industryTags: string[];
  citation: string;
  chunkId: string;
  confidence: number;
}

export interface PolicyOutlineSection {
  id: string;
  title: string;
  objective: string;
  controls: string[];
}

export interface PolicyDraftSection {
  id: string;
  title: string;
  content: string;
  controlsCovered: string[];
  provenance: PolicyProvenanceTag[];
}

export interface PolicyVersion {
  id: string;
  policyId: string;
  tenantId: string;
  versionNumber: number;
  summary: string;
  outline: PolicyOutlineSection[];
  sections: PolicyDraftSection[];
  controlCoverage: PolicyControlCoverage;
  document: string; // Final markdown
  provenanceJson: Record<string, any>;
  createdAt: Date | string;
}

export interface Policy {
  id: string;
  tenantId: string;
  type: string; // e.g., "Privacy Policy", "Employee Handbook"
  title: string;
  content: string; // Rich text / markdown
  status: PolicyStatus;
  lastGeneratedAt: Date | string | null;
  relatedComplianceProfileId: string | null;
  currentVersionId: string | null;
  summary?: string | null;
  controlCoverage?: PolicyControlCoverage | null;
}

export interface TrainingModule {
  id: string;
  tenantId: string | null; // null if global
  title: string;
  category: string;
  description: string;
  estimatedMinutes: number;
  videoUrl: string | null;
  quizQuestions: QuizQuestion[];
  isGlobal: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface TrainingCompletion {
  id: string;
  tenantId: string;
  moduleId: string;
  userId: string;
  score: number;
  passed: boolean;
  completedAt: Date | string;
  certificateUrl: string | null;
}

export interface TrainerProfile {
  id: string;
  name: string;
  specialization: string;
  location: string;
  bio: string;
  contactEmail: string;
  rating: number;
  isActive: boolean;
}

export interface TrainerBooking {
  id: string;
  tenantId: string;
  trainerId: string;
  requestedByUserId: string;
  status: BookingStatus;
  topic: string;
  preferredDate: string | null;
  notes: string | null;
  createdAt: Date | string;
}

export interface Subscription {
  id: string;
  tenantId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingProvider: string | null; // For future Stripe/Paystack
  createdAt: Date | string;
  renewsAt: Date | string | null;
}

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  createdAt: Date | string;
}


export interface FrameworkControl {
  id: string;
  code: string;
  title: string;
  description: string;
  category?: string;
}

export interface Framework {
  id: string;
  name: string;
  description: string;
  category: "ISO" | "Ghana" | "International";
  controls: FrameworkControl[];
}

export interface FrameworkProgress {
  frameworkId: string;
  tenantId: string;
  controlsStatus: Record<string, "compliant" | "in_progress" | "not_applicable" | "not_started">;
  lastUpdated: Date | string;
}
