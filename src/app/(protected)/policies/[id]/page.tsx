"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getPolicy, updatePolicyStatus, updatePolicyContent, getLatestPolicyVersion } from "@/lib/db";
import { exportToPDF, exportToDOCX } from "@/lib/export-policy";
import { useToast } from "@/hooks/use-toast";
import type { Policy, PolicyVersion } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PolicyEditor } from "@/components/policy-editor";
import ProtectedLayout from "@/components/protected-layout";
import { FileText, CheckCircle, Download, ArrowLeft, Save, FileDown } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PolicyProvenancePanel } from "@/components/policy-provenance-panel";

export default function PolicyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant, loading: authLoading } = useAuth();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [latestVersion, setLatestVersion] = useState<PolicyVersion | null>(null);
  const [versionLoading, setVersionLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && params.id) {
      loadPolicy();
    }
  }, [params.id, authLoading]);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      const policyData = await getPolicy(params.id as string);
      setPolicy(policyData);
      if (policyData) {
        setEditedContent(policyData.content);
        await loadLatestVersion(policyData.id);
      } else {
        setLatestVersion(null);
      }
    } catch (error) {
      console.error("Error loading policy:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLatestVersion = async (policyId: string) => {
    try {
      setVersionLoading(true);
      const version = await getLatestPolicyVersion(policyId);
      setLatestVersion(version);
    } catch (error) {
      console.error("Error loading policy version:", error);
      setLatestVersion(null);
    } finally {
      setVersionLoading(false);
    }
  };

  const handleContentChange = (content: string) => {
    setEditedContent(content);
    setHasChanges(content !== policy?.content);
  };

  const handleSave = async () => {
    if (!policy) return;

    setSaving(true);
    try {
      await updatePolicyContent(policy.id, editedContent);
      setPolicy({ ...policy, content: editedContent });
      setHasChanges(false);
      toast({
        variant: "success",
        title: "Success",
        description: "Policy saved successfully!",
      });
    } catch (error) {
      console.error("Error saving policy:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save policy. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkFinal = async () => {
    if (!policy) return;

    // Save changes first if there are any
    if (hasChanges) {
      setShowConfirmDialog(true);
      return;
    }

    await performMarkFinal();
  };

  const performMarkFinal = async () => {
    if (!policy) return;

    // Save changes if user confirmed
    if (hasChanges && showConfirmDialog) {
      await handleSave();
    }

    setUpdating(true);
    try {
      await updatePolicyStatus(policy.id, "final");
      setPolicy({ ...policy, status: "final" });
      toast({
        variant: "success",
        title: "Success",
        description: "Policy marked as final successfully!",
      });
    } catch (error) {
      console.error("Error updating policy:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update policy status. Please try again.",
      });
    } finally {
      setUpdating(false);
      setShowConfirmDialog(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!policy) return;
    try {
      await exportToPDF(policy.title, editedContent || policy.content);
      toast({
        variant: "success",
        title: "Success",
        description: "Policy exported as PDF successfully!",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export PDF. Please try again.",
      });
    }
  };

  const handleDownloadDOCX = async () => {
    if (!policy) return;
    try {
      await exportToDOCX(policy.title, editedContent || policy.content);
      toast({
        variant: "success",
        title: "Success",
        description: "Policy exported as Word document successfully!",
      });
    } catch (error) {
      console.error("Error exporting DOCX:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export Word document. Please try again.",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading policy...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (!policy) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Policy not found</p>
            <Link href="/policies">
              <Button variant="outline">Back to Policies</Button>
            </Link>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/policies">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Policies
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">{policy.title}</h1>
                <p className="text-muted-foreground">{policy.type}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleMarkFinal}
              disabled={updating}
              variant={policy.status === "final" ? "outline" : "default"}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {updating ? "Updating..." : policy.status === "final" ? "Marked as Final" : "Mark as Final"}
            </Button>
            {policy.status === "final" && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Final</span>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadDOCX}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Download as Word (.docx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid lg:grid-cols-[3fr_1fr] gap-6">
          <Card className="order-2 lg:order-1 h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>
                  {policy.status === "final" ? "Final Policy" : "Draft Policy"} • Last updated:{" "}
                  {policy.lastGeneratedAt ? new Date(policy.lastGeneratedAt).toLocaleDateString() : "N/A"}
                </CardDescription>
                <div className="flex items-center gap-2">
                  {hasChanges && (
                    <span className="text-sm text-yellow-600 font-medium">You have unsaved changes</span>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    variant="outline"
                    size="icon"
                    title={hasChanges ? "Save changes" : "No changes to save"}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PolicyEditor
                content={editedContent}
                onChange={handleContentChange}
                placeholder="Start editing your policy content..."
              />
            </CardContent>
          </Card>

          <div className="order-1 lg:order-2">
            <PolicyProvenancePanel version={latestVersion} loading={versionLoading} />
          </div>
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Would you like to save them before marking this policy as final?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={performMarkFinal}>
                Save and Mark as Final
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedLayout>
  );
}

