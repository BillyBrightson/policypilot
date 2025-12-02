import { describe, expect, it } from "vitest";
import { __pipelineInternals } from "@/lib/policy-pipeline/pipeline";
import type { PolicyDraftSection } from "@/lib/types";

const { ingestSources, buildControlMappings, verifyControls, generateOutline, draftSections, retrieveContext } =
  __pipelineInternals;

describe("policy pipeline internals", () => {
  it("ingests public sources for known policy types", () => {
    const chunks = ingestSources("Privacy Policy", "technology", "United Kingdom");
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.some((chunk) => chunk.source.name.includes("ICO"))).toBeTruthy();
  });

  it("flags missing controls when sections do not cover them", () => {
    const controls = [
      {
        id: "CTRL-TEST-01",
        title: "Test Control 1",
        description: "Example",
        framework: "Test",
        tags: [],
      },
      {
        id: "CTRL-TEST-02",
        title: "Test Control 2",
        description: "Example",
        framework: "Test",
        tags: [],
      },
    ];

    const sections: PolicyDraftSection[] = [
      {
        id: "section-1",
        title: "Section One",
        content: "content",
        controlsCovered: ["CTRL-TEST-01"],
        provenance: [],
      },
    ];

    const report = verifyControls(controls, sections);
    expect(report.covered).toContain("CTRL-TEST-01");
    expect(report.missing).toContain("CTRL-TEST-02");
    expect(report.coverageByControl["CTRL-TEST-02"].status).toBe("missing");
  });

  it("generates outline and drafts sections with provenance", () => {
    const controls = buildControlMappings("Information Security Policy").slice(0, 2);
    const outline = generateOutline("Information Security Policy", controls);
    const chunks = ingestSources("Information Security Policy", "technology", "United States");
    const context = retrieveContext(controls, chunks, "Information Security Policy technology United States");
    const sections = draftSections(outline.slice(0, 1), context, {
      tenantId: "tenant-1",
      tenantName: "Acme Corp",
      userId: "user-1",
      policyType: "Information Security Policy",
      industry: "technology",
      jurisdiction: "United States",
    });

    expect(outline.length).toBeGreaterThan(0);
    expect(sections[0].provenance.length).toBeGreaterThan(0);
  });
});

