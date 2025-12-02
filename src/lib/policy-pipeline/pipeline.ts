import {
  createNotification,
  createPolicy,
  createPolicyVersion,
  getLatestPolicyVersion,
  updatePolicyCurrentVersion,
} from "@/lib/db";
import type {
  PolicyControlCoverage,
  PolicyDraftSection,
  PolicyOutlineSection,
  PolicyProvenanceTag,
} from "@/lib/types";
import {
  POLICY_CONTROL_TEMPLATES,
  POLICY_OUTLINES,
  PUBLIC_SOURCE_LIBRARY,
  type PolicySourceDocument,
  type SourceControl,
} from "./data";
import type {
  PipelineProgressUpdate,
  PipelineStepId,
  PolicyPipelineRequest,
  PolicyPipelineResult,
} from "./types";

interface TokenVector {
  [token: string]: number;
}

interface SourceChunk {
  id: string;
  source: PolicySourceDocument;
  control?: SourceControl;
  text: string;
  tags: string[];
  embedding: TokenVector;
}

interface ControlMapping {
  id: string;
  title: string;
  description: string;
  framework: string;
  tags: string[];
}

interface RetrievedContext {
  controlId: string;
  chunks: SourceChunk[];
}

const PIPELINE_STEPS: PipelineStepId[] = [
  "ingest_sources",
  "build_control_mappings",
  "retrieve_context",
  "generate_outline",
  "draft_sections",
  "verify_controls",
  "finalize_document",
  "store_policy_version",
  "notify_frontend",
];

const DEFAULT_SECTIONS = [
  "Purpose",
  "Scope",
  "Responsibilities",
  "Procedures",
  "Monitoring",
  "Review",
];

const SECTION_OBJECTIVES: Record<string, string> = {
  Purpose: "Explain why the policy exists and what outcome it drives.",
  Scope: "Describe the business units, systems, and geographies covered.",
  Responsibilities: "Clarify accountable roles, approvers, and escalation paths.",
  Procedures: "Detail the required controls, workflows, and safeguards.",
  Monitoring: "Outline evidence, metrics, and inspection cadences.",
  Review: "Explain review frequency, triggers, and ownership.",
};

const emitProgress = (
  onProgress: ((update: PipelineProgressUpdate) => void) | undefined,
  step: PipelineStepId,
  status: PipelineProgressUpdate["status"],
  detail?: string
) => {
  onProgress?.({ step, status, detail });
};

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const buildVector = (text: string): TokenVector => {
  const tokens = tokenize(text);
  return tokens.reduce<TokenVector>((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});
};

const cosineSimilarity = (a: TokenVector, b: TokenVector): number => {
  const shared = Object.keys(a).filter((token) => b[token]);
  const dot = shared.reduce((sum, token) => sum + a[token] * b[token], 0);
  const mag = (vector: TokenVector) =>
    Math.sqrt(Object.values(vector).reduce((sum, value) => sum + value * value, 0));
  const denom = mag(a) * mag(b);
  if (!denom) return 0;
  return dot / denom;
};

const chunkText = (text: string, chunkSize = 70): string[] => {
  const words = tokenize(text);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    const slice = words.slice(i, i + chunkSize);
    if (slice.length) {
      chunks.push(slice.join(" "));
    }
  }
  if (!chunks.length) {
    chunks.push(text);
  }
  return chunks;
};

const ingestSources = (
  policyType: string,
  industry: string,
  jurisdiction: string
): SourceChunk[] => {
  const relevantSources = PUBLIC_SOURCE_LIBRARY.filter((source) => {
    const matchesPolicy = source.policyTypes.includes(policyType);
    const matchesIndustry =
      source.industries.includes(industry.toLowerCase()) ||
      source.industries.some((id) => industry.toLowerCase().includes(id));
    const matchesJurisdiction =
      source.jurisdiction.toLowerCase() === jurisdiction.toLowerCase() ||
      source.jurisdiction.toLowerCase().includes("global");
    return matchesPolicy || matchesIndustry || matchesJurisdiction;
  });

  const fallbackSource = PUBLIC_SOURCE_LIBRARY.map((source) => source);
  const scopedSources = relevantSources.length ? relevantSources : fallbackSource;

  const chunks: SourceChunk[] = [];

  scopedSources.forEach((source) => {
    chunkText(source.excerpt).forEach((chunk, idx) => {
      chunks.push({
        id: `${source.id}-excerpt-${idx}`,
        source,
        text: chunk,
        tags: ["overview"],
        embedding: buildVector(chunk),
      });
    });

    source.controls.forEach((control) => {
      chunkText(control.text).forEach((chunk, idx) => {
        chunks.push({
          id: `${source.id}-${control.id}-${idx}`,
          source,
          control,
          text: chunk,
          tags: control.tags,
          embedding: buildVector(chunk),
        });
      });
    });
  });

  return chunks;
};

const buildControlMappings = (policyType: string): ControlMapping[] => {
  const base = POLICY_CONTROL_TEMPLATES.filter((control) =>
    control.policyTypes.includes(policyType)
  );

  // Provide fallbacks if template coverage is thin
  if (!base.length) {
    return POLICY_CONTROL_TEMPLATES.slice(0, 3).map((control) => ({
      ...control,
      policyTypes: [policyType],
    }));
  }

  return base;
};

const retrieveContext = (
  controls: ControlMapping[],
  chunks: SourceChunk[],
  policyNarrative: string
): RetrievedContext[] => {
  const policyVector = buildVector(policyNarrative);
  const retrieved: RetrievedContext[] = [];

  controls.forEach((control) => {
    const controlVector = buildVector(`${control.title} ${control.description} ${control.tags.join(" ")}`);
    const ranked = chunks
      .map((chunk) => ({
        chunk,
        score:
          0.6 * cosineSimilarity(controlVector, chunk.embedding) +
          0.4 * cosineSimilarity(policyVector, chunk.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((entry) => entry.chunk);

    retrieved.push({
      controlId: control.id,
      chunks: ranked,
    });
  });

  return retrieved;
};

const generateOutline = (
  policyType: string,
  controls: ControlMapping[]
): PolicyOutlineSection[] => {
  const sectionNames = POLICY_OUTLINES[policyType] || DEFAULT_SECTIONS;

  return sectionNames.map((title, idx) => {
    const relatedControls = controls
      .filter((control, controlIdx) => controlIdx % sectionNames.length === idx % sectionNames.length)
      .map((control) => control.id);

    return {
      id: `${policyType.replace(/\s+/g, "-").toLowerCase()}-section-${idx + 1}`,
      title,
      objective: SECTION_OBJECTIVES[title] || "Detail the expectations for this policy chapter.",
      controls: relatedControls,
    };
  });
};

const draftSections = (
  outline: PolicyOutlineSection[],
  context: RetrievedContext[],
  request: PolicyPipelineRequest
): PolicyDraftSection[] => {
  return outline.map((section) => {
    const contextEntries = context.filter((ctx) => section.controls.includes(ctx.controlId));
    const paragraphs: string[] = [];
    const provenance: PolicyProvenanceTag[] = [];

    contextEntries.forEach((entry) => {
      entry.chunks.forEach((chunk) => {
        const paragraph = `Referencing ${chunk.source.name} (${chunk.source.jurisdiction}), we commit to ${chunk.text}. This applies to ${request.tenantName} operating in ${request.jurisdiction}.`;
        paragraphs.push(paragraph);
        provenance.push({
          sourceId: chunk.source.id,
          sourceName: chunk.source.name,
          jurisdiction: chunk.source.jurisdiction,
          industryTags: chunk.source.industries,
          citation: chunk.control ? chunk.control.title : chunk.source.name,
          chunkId: chunk.id,
          confidence: 0.85,
        });
      });
    });

    if (!paragraphs.length) {
      paragraphs.push(
        `${request.tenantName} documents ${section.title.toLowerCase()} expectations in alignment with regional regulators and industry frameworks. Detailed procedures will be enriched as more evidence is captured.`
      );
    }

    return {
      id: section.id,
      title: section.title,
      content: `${section.objective}\n\n${paragraphs.join("\n\n")}`,
      controlsCovered: section.controls,
      provenance,
    };
  });
};

const verifyControls = (
  controls: ControlMapping[],
  sections: PolicyDraftSection[]
): PolicyControlCoverage => {
  const coverage: PolicyControlCoverage = {
    covered: [],
    missing: [],
    coverageByControl: {},
  };

  controls.forEach((control) => {
    const coveringSections = sections.filter((section) =>
      section.controlsCovered.includes(control.id)
    );
    if (coveringSections.length) {
      coverage.covered.push(control.id);
      coverage.coverageByControl[control.id] = {
        status: "covered",
        sections: coveringSections.map((section) => section.title),
      };
    } else {
      coverage.missing.push(control.id);
      coverage.coverageByControl[control.id] = {
        status: "missing",
        sections: [],
      };
    }
  });

  return coverage;
};

const finalizeDocument = (
  request: PolicyPipelineRequest,
  sections: PolicyDraftSection[],
  coverage: PolicyControlCoverage
) => {
  const effectiveDate = new Date().toLocaleDateString();
  const header = `# ${request.policyType}

**Tenant:** ${request.tenantName}
**Jurisdiction:** ${request.jurisdiction}
**Industry:** ${request.industry}
**Effective Date:** ${effectiveDate}

`;

  const body = sections
    .map((section, idx) => `## ${idx + 1}. ${section.title}

${section.content}
`)
    .join("\n");

  const coverageSummary = `## Control Coverage Summary

- Covered Controls: ${coverage.covered.length}
- Missing Controls: ${coverage.missing.length}

`;

  const document = `${header}${body}${coverageSummary}`;

  const summary = `Generated ${request.policyType} for ${request.tenantName}, aligned to ${coverage.covered.length} mapped controls with ${coverage.missing.length} remaining gaps.`;

  const provenanceJson = {
    generatedAt: new Date().toISOString(),
    policyType: request.policyType,
    tenantId: request.tenantId,
    sections: sections.map((section) => ({
      id: section.id,
      title: section.title,
      controls: section.controlsCovered,
      provenance: section.provenance,
    })),
    coverage,
  };

  return { document, summary, provenanceJson };
};

export async function runPolicyGenerationPipeline(
  request: PolicyPipelineRequest,
  onProgress?: (update: PipelineProgressUpdate) => void
): Promise<PolicyPipelineResult> {
  const stepDetail = (step: PipelineStepId, detail: string) => emitProgress(onProgress, step, "running", detail);

  PIPELINE_STEPS.forEach((step) => emitProgress(onProgress, step, "pending"));

  emitProgress(onProgress, "ingest_sources", "running");
  const chunks = ingestSources(request.policyType, request.industry, request.jurisdiction);
  emitProgress(onProgress, "ingest_sources", "complete", `${chunks.length} chunks indexed`);

  emitProgress(onProgress, "build_control_mappings", "running");
  const controls = buildControlMappings(request.policyType);
  emitProgress(
    onProgress,
    "build_control_mappings",
    "complete",
    `${controls.length} controls mapped`
  );

  emitProgress(onProgress, "retrieve_context", "running");
  const context = retrieveContext(
    controls,
    chunks,
    `${request.policyType} ${request.industry} ${request.jurisdiction}`
  );
  emitProgress(
    onProgress,
    "retrieve_context",
    "complete",
    `${context.reduce((sum, ctx) => sum + ctx.chunks.length, 0)} context chunks selected`
  );

  emitProgress(onProgress, "generate_outline", "running");
  const outline = generateOutline(request.policyType, controls);
  emitProgress(onProgress, "generate_outline", "complete");

  emitProgress(onProgress, "draft_sections", "running");
  const sections = draftSections(outline, context, request);
  emitProgress(onProgress, "draft_sections", "complete");

  emitProgress(onProgress, "verify_controls", "running");
  const controlCoverage = verifyControls(controls, sections);
  emitProgress(
    onProgress,
    "verify_controls",
    "complete",
    `${controlCoverage.covered.length} covered / ${controlCoverage.missing.length} missing`
  );

  emitProgress(onProgress, "finalize_document", "running");
  const { document, summary, provenanceJson } = finalizeDocument(request, sections, controlCoverage);
  emitProgress(onProgress, "finalize_document", "complete");

  emitProgress(onProgress, "store_policy_version", "running");
  const title = `${request.policyType} (${request.jurisdiction})`;
  const policyId = await createPolicy({
    tenantId: request.tenantId,
    type: request.policyType,
    title,
    content: document,
    status: "draft",
    lastGeneratedAt: new Date(),
    relatedComplianceProfileId: request.profileId || null,
    currentVersionId: null,
    summary,
    controlCoverage,
  });

  const latestVersion = await getLatestPolicyVersion(policyId);
  const versionNumber = (latestVersion?.versionNumber || 0) + 1;
  const versionId = await createPolicyVersion({
    policyId,
    tenantId: request.tenantId,
    versionNumber,
    summary,
    outline,
    sections,
    controlCoverage,
    document,
    provenanceJson,
  });

  await updatePolicyCurrentVersion(policyId, versionId, summary, controlCoverage);
  emitProgress(onProgress, "store_policy_version", "complete");

  emitProgress(onProgress, "notify_frontend", "running");
  await createNotification({
    tenantId: request.tenantId,
    userId: request.userId,
    type: "success",
    title: `${request.policyType} ready`,
    description: `${request.policyType} was generated with ${controlCoverage.covered.length} mapped controls.`,
    read: false,
    createdAt: new Date(),
  });
  emitProgress(onProgress, "notify_frontend", "complete");

  return {
    policyId,
    versionId,
    outline,
    sections,
    document,
    summary,
    provenanceJson,
    controlCoverage,
  };
}

export const __pipelineInternals = {
  ingestSources,
  buildControlMappings,
  retrieveContext,
  generateOutline,
  draftSections,
  verifyControls,
};

