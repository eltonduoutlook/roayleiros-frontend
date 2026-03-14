import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type MonthCardProps = {
  title: string;
  enabled: boolean;
  isPast?: boolean;
  eventCount?: number;
  onClick: () => void;
};

export function MonthCard({
  title,
  enabled,
  isPast = false,
  eventCount = 0,
  onClick,
}: MonthCardProps) {
  const cardClass = isPast
    ? "border-amber-200 bg-amber-50 opacity-80"
    : enabled
      ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg"
      : "opacity-50";

  return (
    <Card
      onClick={enabled && !isPast ? onClick : undefined}
      className={["rounded-2xl border transition-all", cardClass].join(" ")}
    >
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {isPast
              ? "Mês encerrado"
              : enabled
                ? `${eventCount > 99 ? "99+" : eventCount} evento${eventCount !== 1 ? "s" : ""}`
                : "Sem eventos"}
          </p>
        </div>

        <CalendarDays
          className={
            isPast ? "h-8 w-8 text-amber-600" : "h-8 w-8 text-slate-600"
          }
        />
      </CardContent>
    </Card>
  );
}
