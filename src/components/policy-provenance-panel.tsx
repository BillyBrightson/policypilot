import type { PolicyVersion } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle, FileSearch } from "lucide-react";

interface PolicyProvenancePanelProps {
  version: PolicyVersion | null;
  loading?: boolean;
}

export function PolicyProvenancePanel({ version, loading }: PolicyProvenancePanelProps) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Policy Evidence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-3 bg-muted animate-pulse rounded" />
            <div className="h-3 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!version) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Policy Evidence</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground flex flex-col items-center justify-center gap-2 min-h-[200px]">
          <FileSearch className="h-6 w-6" />
          <p>No version metadata is available yet.</p>
          <p>Save the document or regenerate to capture provenance.</p>
        </CardContent>
      </Card>
    );
  }

  const covered = version.controlCoverage.covered.length;
  const missing = version.controlCoverage.missing.length;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Policy Evidence</CardTitle>
        <p className="text-sm text-muted-foreground">
          Version {version.versionNumber} • {new Date(version.createdAt).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Executive Summary</p>
          <p className="text-sm">{version.summary}</p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-green-600">
            <ShieldCheck className="h-4 w-4" />
            <span>{covered} controls covered</span>
          </div>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            <span>{missing} gaps tracked</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Sections & Provenance</p>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {version.sections.map((section) => (
              <div key={section.id} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{section.title}</p>
                  <div className="flex flex-wrap gap-1">
                    {section.controlsCovered.slice(0, 3).map((control) => (
                      <span
                        key={control}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-secondary"
                      >
                        {control}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  {section.provenance.slice(0, 2).map((prov) => (
                    <p key={prov.chunkId} className="text-xs text-muted-foreground">
                      {prov.sourceName} • {prov.jurisdiction}
                    </p>
                  ))}
                  {section.provenance.length === 0 && (
                    <p className="text-xs text-muted-foreground">No cited sources yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

