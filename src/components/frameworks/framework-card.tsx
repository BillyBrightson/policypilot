import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Framework } from "@/lib/types";

interface FrameworkCardProps {
    framework: Framework;
    progress?: number; // 0-100
}

export function FrameworkCard({ framework, progress = 0 }: FrameworkCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary mb-2">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    {framework.category && (
                        <span className="text-xs font-medium px-2 py-1 bg-muted rounded-full">
                            {framework.category}
                        </span>
                    )}
                </div>
                <CardTitle className="line-clamp-1">{framework.name}</CardTitle>
                <CardDescription className="line-clamp-2 h-10">
                    {framework.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto space-y-4">
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Compliance</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                <Link href={`/frameworks/${framework.id}`} className="block">
                    <Button className="w-full group">
                        View Checklist
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
