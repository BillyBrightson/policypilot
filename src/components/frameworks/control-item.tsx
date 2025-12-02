import { CheckCircle2, Circle, AlertCircle, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FrameworkControl } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ControlItemProps {
    control: FrameworkControl;
    status: "compliant" | "in_progress" | "not_applicable" | "not_started";
    onStatusChange: (status: "compliant" | "in_progress" | "not_applicable" | "not_started") => void;
}

export function ControlItem({ control, status, onStatusChange }: ControlItemProps) {
    const getStatusIcon = () => {
        switch (status) {
            case "compliant":
                return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            case "in_progress":
                return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            case "not_applicable":
                return <MinusCircle className="h-5 w-5 text-muted-foreground" />;
            default:
                return <Circle className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case "compliant":
                return "bg-green-50 border-green-200";
            case "in_progress":
                return "bg-yellow-50 border-yellow-200";
            case "not_applicable":
                return "bg-muted/50 border-muted";
            default:
                return "bg-card border-border";
        }
    };

    return (
        <div className={cn("border rounded-lg p-4 transition-colors", getStatusColor())}>
            <div className="flex items-start gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0 hover:bg-transparent">
                            {getStatusIcon()}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => onStatusChange("compliant")}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                            Compliant
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange("in_progress")}>
                            <AlertCircle className="mr-2 h-4 w-4 text-yellow-600" />
                            In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange("not_applicable")}>
                            <MinusCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                            Not Applicable
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange("not_started")}>
                            <Circle className="mr-2 h-4 w-4 text-muted-foreground" />
                            Not Started
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium px-2 py-0.5 bg-background rounded border">
                            {control.code}
                        </span>
                        <h4 className="font-medium text-sm">{control.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{control.description}</p>
                    {control.category && (
                        <span className="inline-block text-[10px] text-muted-foreground uppercase tracking-wider mt-2">
                            {control.category}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
