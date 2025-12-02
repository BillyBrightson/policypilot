import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    actionHref?: string;
    actionLabel?: string;
    className?: string;
}

export function StatsCard({
    title,
    value,
    icon,
    description,
    trend,
    actionHref,
    actionLabel = "View Details",
    className,
}: StatsCardProps) {
    return (
        <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {icon}
                    </div>
                    {trend && (
                        <div
                            className={cn(
                                "text-xs font-medium px-2 py-1 rounded-full",
                                trend.isPositive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            )}
                        >
                            {trend.isPositive ? "+" : ""}
                            {trend.value}%
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                    <div className="text-2xl font-bold">{value}</div>
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                </div>

                {actionHref && (
                    <div className="mt-4 pt-4 border-t">
                        <Link
                            href={actionHref}
                            className="text-sm font-medium text-primary flex items-center hover:underline"
                        >
                            {actionLabel}
                            <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
