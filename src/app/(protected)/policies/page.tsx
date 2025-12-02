"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getPoliciesByTenant, getLatestComplianceProfile } from "@/lib/db";
import { runPolicyGenerationPipeline, type PipelineStepId, type PipelineStepStatus } from "@/lib/policy-pipeline";
import { useToast } from "@/hooks/use-toast";
import type { Policy, ComplianceProfile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedLayout from "@/components/protected-layout";
import Link from "next/link";
import { FileText, Plus, CheckCircle, Clock } from "lucide-react";
import { PolicyGenerationModal } from "@/components/policy-generation-modal";

const POLICY_TYPES = [
  "Privacy Policy",
  "Employee Handbook",
  "Data Protection Policy",
  "Information Security Policy",
  "Acceptable Use Policy",
  "Incident Response Policy",
  "Code of Conduct",
  "Health and Safety Policy",
];

interface PipelineStepState {
  id: PipelineStepId;
  label: string;
  status: PipelineStepStatus;
  detail?: string;
}

const PIPELINE_STEP_ORDER: { id: PipelineStepId; label: string }[] = [
  { id: "ingest_sources", label: "Ingest public sources" },
  { id: "build_control_mappings", label: "Build control mappings" },
  { id: "retrieve_context", label: "Retrieve context" },
  { id: "generate_outline", label: "Generate outline" },
  { id: "draft_sections", label: "Draft sections" },
  { id: "verify_controls", label: "Verify controls" },
  { id: "finalize_document", label: "Finalize document" },
  { id: "store_policy_version", label: "Store version & provenance" },
  { id: "notify_frontend", label: "Notify team" },
];

export default function PoliciesPage() {
  const router = useRouter();
  const { tenant, user, loading: authLoading } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [complianceProfile, setComplianceProfile] = useState<ComplianceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStepState[]>(
    PIPELINE_STEP_ORDER.map((step) => ({ ...step, status: "pending" }))
  );
  const { toast } = useToast();

  const resetPipelineSteps = () =>
    setPipelineSteps(PIPELINE_STEP_ORDER.map((step) => ({ ...step, status: "pending", detail: undefined })));

  useEffect(() => {
    if (!authLoading && tenant) {
      loadPolicies();
    }
  }, [tenant, authLoading]);

  const loadPolicies = async () => {
    if (!tenant) return;

    try {
      setLoading(true);
      const policiesList = await getPoliciesByTenant(tenant.id);
      setPolicies(policiesList);

      const profile = await getLatestComplianceProfile(tenant.id);
      setComplianceProfile(profile);
    } catch (error) {
      console.error("Error loading policies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!tenant || !selectedType || !user?.uid) {
      toast({
        variant: "destructive",
        title: "Missing data",
        description: "We need an authenticated user and tenant to run the pipeline.",
      });
      return;
    }

    setGenerating(true);
    resetPipelineSteps();

    try {
      const request = {
        tenantId: tenant.id,
        tenantName: tenant.name,
        userId: user.uid,
        policyType: selectedType,
        industry: complianceProfile?.industry || tenant.industry,
        jurisdiction: complianceProfile?.country || tenant.country,
        businessSize: complianceProfile?.businessSize || "medium",
        profileId: complianceProfile?.id || null,
      };

      const result = await runPolicyGenerationPipeline(request, (update) => {
        setPipelineSteps((prev) =>
          prev.map((step) =>
            step.id === update.step
              ? { ...step, status: update.status, detail: update.detail }
              : step
          )
        );
      });

      toast({
        variant: "success",
        title: "Policy Ready",
        description: result.summary,
      });

      setDialogOpen(false);
      setSelectedType("");
      resetPipelineSteps();
      await loadPolicies();
      router.push(`/policies/${result.policyId}`);
    } catch (error: any) {
      console.error("Error generating policy:", error);
      toast({
        variant: "destructive",
        title: "Pipeline Error",
        description: error?.message || "Failed to generate policy. Please try again.",
      });
      setPipelineSteps((prev) =>
        prev.map((step) =>
          step.id === "notify_frontend"
            ? step
            : { ...step, status: step.status === "complete" ? step.status : "error" }
        )
      );
    } finally {
      setGenerating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading policies...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Policies</h1>
            <p className="text-muted-foreground">
              Manage and generate compliance policies for your business
            </p>
          </div>
          <Button onClick={() => {
            resetPipelineSteps();
            setDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Generate New Policy
          </Button>
        </div>

        {policies.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Policies Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate your first AI-powered policy document to get started
                </p>
                <Button
                  onClick={() => {
                    resetPipelineSteps();
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Your First Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {policies.map((policy) => (
              <Link key={policy.id} href={`/policies/${policy.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <FileText className="h-8 w-8 text-primary" />
                      {policy.status === "final" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <CardTitle className="text-lg">{policy.title}</CardTitle>
                    <CardDescription>{policy.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{policy.status === "final" ? "Final" : "Draft"}</span>
                      <span>
                        {policy.lastGeneratedAt
                          ? new Date(policy.lastGeneratedAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <PolicyGenerationModal
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            setGenerating(false);
          } else {
            resetPipelineSteps();
            setDialogOpen(true);
          }
        }}
        policyTypes={POLICY_TYPES}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        steps={pipelineSteps}
        generating={generating}
        onGenerate={handleGenerate}
        complianceProfile={complianceProfile}
      />
    </ProtectedLayout>
  );
}

