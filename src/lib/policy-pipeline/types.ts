import type {
  PolicyControlCoverage,
  PolicyDraftSection,
  PolicyOutlineSection,
} from "@/lib/types";

export type PipelineStepId =
  | "ingest_sources"
  | "build_control_mappings"
  | "retrieve_context"
  | "generate_outline"
  | "draft_sections"
  | "verify_controls"
  | "finalize_document"
  | "store_policy_version"
  | "notify_frontend";

export type PipelineStepStatus = "pending" | "running" | "complete" | "error";

export interface PipelineProgressUpdate {
  step: PipelineStepId;
  status: PipelineStepStatus;
  detail?: string;
}

export interface PolicyPipelineRequest {
  tenantId: string;
  tenantName: string;
  userId: string;
  policyType: string;
  industry: string;
  jurisdiction: string;
  businessSize?: string;
  profileId?: string | null;
}

export interface PolicyPipelineResult {
  policyId: string;
  versionId: string;
  outline: PolicyOutlineSection[];
  sections: PolicyDraftSection[];
  document: string;
  summary: string;
  provenanceJson: Record<string, any>;
  controlCoverage: PolicyControlCoverage;
}

