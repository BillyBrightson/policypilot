"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { frameworks } from "@/lib/frameworks-data";
import { Framework, FrameworkControl } from "@/lib/types";
import ProtectedLayout from "@/components/protected-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Filter } from "lucide-react";
import { ControlItem } from "@/components/frameworks/control-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";

export default function FrameworkDetailPage() {
    const params = useParams();
    const [framework, setFramework] = useState<Framework | null>(null);
    const [controlStatus, setControlStatus] = useState<Record<string, "compliant" | "in_progress" | "not_applicable" | "not_started">>({});

    useEffect(() => {
        const found = frameworks.find((f) => f.id === params.id);
        if (found) {
            setFramework(found);
            // Initialize status (mock)
            const initialStatus: Record<string, any> = {};
            found.controls.forEach(c => {
                initialStatus[c.id] = "not_started";
            });
            setControlStatus(initialStatus);
        }
    }, [params.id]);

    const handleStatusChange = (controlId: string, status: "compliant" | "in_progress" | "not_applicable" | "not_started") => {
        setControlStatus(prev => ({
            ...prev,
            [controlId]: status
        }));
    };

    if (!framework) {
        return (
            <ProtectedLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-muted-foreground">Framework not found</p>
                </div>
            </ProtectedLayout>
        );
    }

    // Calculate progress
    const totalControls = framework.controls.length;
    const compliantCount = Object.values(controlStatus).filter(s => s === "compliant").length;
    const progress = totalControls > 0 ? Math.round((compliantCount / totalControls) * 100) : 0;

    return (
        <ProtectedLayout>
            <div className="max-w-7xl mx-auto space-y-8 pb-8">
                <div className="flex items-center gap-4">
                    <Link href="/frameworks">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {framework.name}
                            {framework.category && (
                                <span className="text-xs font-normal px-2 py-1 bg-muted rounded-full">
                                    {framework.category}
                                </span>
                            )}
                        </h1>
                        <p className="text-muted-foreground text-sm">{framework.description}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[3fr_1fr] gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Controls Checklist</h2>
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {framework.controls.map((control) => (
                                <ControlItem
                                    key={control.id}
                                    control={control}
                                    status={controlStatus[control.id] || "not_started"}
                                    onStatusChange={(status) => handleStatusChange(control.id, status)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Progress</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center py-6">
                                <CircularProgress value={progress} size={160} strokeWidth={12} label="Compliant" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total Controls</span>
                                    <span className="font-medium">{totalControls}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Compliant</span>
                                    <span className="font-medium text-green-600">{compliantCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">In Progress</span>
                                    <span className="font-medium text-yellow-600">
                                        {Object.values(controlStatus).filter(s => s === "in_progress").length}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Not Started</span>
                                    <span className="font-medium">
                                        {Object.values(controlStatus).filter(s => s === "not_started").length}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedLayout>
    );
}
