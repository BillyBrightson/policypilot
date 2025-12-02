"use client";

import { frameworks } from "@/lib/frameworks-data";
import { FrameworkCard } from "@/components/frameworks/framework-card";
import ProtectedLayout from "@/components/protected-layout";
import { ShieldCheck } from "lucide-react";

export default function FrameworksPage() {
    // In a real app, we would fetch progress from the DB here
    // For now, we'll mock it or pass 0

    return (
        <ProtectedLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Compliance Frameworks</h1>
                    <p className="text-muted-foreground">
                        Select a framework to view requirements and track your compliance progress.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {frameworks.map((framework) => (
                        <FrameworkCard key={framework.id} framework={framework} progress={0} />
                    ))}
                </div>
            </div>
        </ProtectedLayout>
    );
}
