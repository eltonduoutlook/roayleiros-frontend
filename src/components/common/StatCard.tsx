import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type StatColor = "info" | "warning" | "success" | "danger";

type StatCardProps = {
    title: string;
    value: number;
    icon: LucideIcon;
    color?: StatColor;
};

const colorStyles: Record<
    StatColor,
    {
        card: string;
        title: string;
        value: string;
        icon: string;
    }
> = {
    info: {
        card: "border-blue-200 bg-blue-50 hover:bg-blue-100",
        title: "text-blue-700",
        value: "text-blue-900",
        icon: "text-blue-600",
    },
    warning: {
        card: "border-yellow-200 bg-yellow-50 hover:bg-yellow-100",
        title: "text-yellow-700",
        value: "text-yellow-900",
        icon: "text-yellow-600",
    },
    success: {
        card: "border-green-200 bg-green-50 hover:bg-green-100",
        title: "text-green-700",
        value: "text-green-900",
        icon: "text-green-600",
    },
    danger: {
        card: "border-red-200 bg-red-50 hover:bg-red-100",
        title: "text-red-700",
        value: "text-red-900",
        icon: "text-red-600",
    },
};

export function StatCard({
    title,
    value,
    icon: Icon,
    color = "info",
}: StatCardProps) {
    const styles = colorStyles[color];

    return (
        <Card className={`${styles.card} transition`}>
            <CardContent className="flex items-center justify-between p-4">
                <div>
                    <p className={`text-sm ${styles.title}`}>{title}</p>
                    <p className={`text-2xl font-bold ${styles.value}`}>{value}</p>
                </div>

                <Icon className={`h-6 w-6 ${styles.icon}`} />
            </CardContent>
        </Card>
    );
}