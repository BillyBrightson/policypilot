import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ActionItem {
    title: string;
    description?: string;
    href?: string;
    priority?: "high" | "medium" | "low";
}

interface ActionListProps {
    actions: string[] | ActionItem[];
    title?: string;
}

export function ActionList({ actions, title = "Recommended Actions" }: ActionListProps) {
    // Normalize actions to ActionItem[]
    const normalizedActions: ActionItem[] = actions.map((action) => {
        if (typeof action === "string") {
            return { title: action, priority: "high" };
        }
        return action;
    });

    if (normalizedActions.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="font-semibold text-lg">All Caught Up!</h3>
                    <p className="text-muted-foreground">You have no pending actions.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y">
                    {normalizedActions.map((action, index) => (
                        <div
                            key={index}
                            className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{action.title}</p>
                                    {action.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {action.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {action.href && (
                                <Link href={action.href}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
