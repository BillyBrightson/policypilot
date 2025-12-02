import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PipelineStepId, PipelineStepStatus } from "@/lib/policy-pipeline";
import type { ComplianceProfile } from "@/lib/types";
import { BadgeCheck, CheckCircle2, CircleDashed, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Fragment } from "react";

interface PipelineStepState {
  id: PipelineStepId;
  label: string;
  status: PipelineStepStatus;
  detail?: string;
}

interface PolicyGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policyTypes: string[];
  selectedType: string;
  onTypeChange: (value: string) => void;
  steps: PipelineStepState[];
  generating: boolean;
  onGenerate: () => void;
  complianceProfile?: ComplianceProfile | null;
}

const statusIconMap: Record<PipelineStepStatus, React.JSX.Element> = {
  pending: <CircleDashed className="h-4 w-4 text-muted-foreground" />,
  running: <Loader2 className="h-4 w-4 text-primary animate-spin" />,
  complete: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  error: <XCircle className="h-4 w-4 text-destructive" />,
};

const statusLabelMap: Record<PipelineStepStatus, string> = {
  pending: "Waiting",
  running: "Running",
  complete: "Complete",
  error: "Error",
};

export function PolicyGenerationModal({
  open,
  onOpenChange,
  policyTypes,
  selectedType,
  onTypeChange,
  steps,
  generating,
  onGenerate,
  complianceProfile,
}: PolicyGenerationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Automated Policy Generation</DialogTitle>
          <DialogDescription>
            Launch the ingestion, retrieval, drafting, and verification pipeline for a selected policy type.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="policyType">Policy Type *</Label>
            <Select value={selectedType} onValueChange={onTypeChange}>
              <SelectTrigger id="policyType">
                <SelectValue placeholder="Select policy type" />
              </SelectTrigger>
              <SelectContent>
                {policyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {complianceProfile && (
            <div className="rounded-md border p-3 text-sm space-y-1 bg-muted/40">
              <p className="font-medium flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Using latest compliance profile
              </p>
              <p>
                {complianceProfile.industry} • {complianceProfile.country}
              </p>
              <p>Risk Score: {complianceProfile.riskScore ?? "N/A"}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Pipeline Progress</p>
            <div className="rounded-md border divide-y">
              {steps.map((step) => (
                <Fragment key={step.id}>
                  <div className="flex items-center justify-between p-3 gap-3">
                    <div className="flex items-center gap-3">
                      {statusIconMap[step.status]}
                      <div>
                        <p className="font-medium text-sm">{step.label}</p>
                        {step.detail && (
                          <p className="text-xs text-muted-foreground">{step.detail}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        step.status === "complete" && "text-green-600",
                        step.status === "running" && "text-primary",
                        step.status === "error" && "text-destructive",
                        step.status === "pending" && "text-muted-foreground"
                      )}
                    >
                      {statusLabelMap[step.status]}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
            Cancel
          </Button>
          <Button onClick={onGenerate} disabled={!selectedType || generating}>
            {generating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Running Pipeline...
              </span>
            ) : (
              "Generate Policy"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

