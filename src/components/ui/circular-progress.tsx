import React from "react";

interface CircularProgressProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    sublabel?: string;
    color?: string;
}

export function CircularProgress({
    value,
    max = 100,
    size = 120,
    strokeWidth = 10,
    label,
    sublabel,
    color,
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(Math.max(value, 0), max);
    const dashoffset = circumference - (progress / max) * circumference;

    // Determine color based on value if not provided
    const getColor = (val: number) => {
        if (color) return color;
        if (val < 30) return "text-green-500";
        if (val < 70) return "text-yellow-500";
        return "text-red-500";
    };

    const progressColor = getColor(value);

    return (
        <div className="relative flex flex-col items-center justify-center">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-muted/20"
                />
                {/* Progress Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ease-out ${progressColor}`}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold">{value}</span>
                {label && <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>}
            </div>
            {sublabel && <p className="mt-2 text-sm text-muted-foreground">{sublabel}</p>}
        </div>
    );
}
