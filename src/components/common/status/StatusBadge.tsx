import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

export type StatusConfig = {
    label: string;
    icon?: LucideIcon;
    className?: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
};

type Props<T extends string> = {
    status: T;
    config: Record<T, StatusConfig>;
};

export function StatusBadge<T extends string>({ status, config }: Props<T>) {
    const current = config[status];

    if (!current) {
        return <Badge variant="outline">{status}</Badge>;
    }

    const Icon = current.icon;

    return (
        <Badge
            variant={current.variant ?? "default"}
            className={`gap-1 ${current.className ?? ""}`}
        >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {current.label}
        </Badge>
    );
}