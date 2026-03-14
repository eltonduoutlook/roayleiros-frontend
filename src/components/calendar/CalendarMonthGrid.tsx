import { buildDate, isPastDay } from "@/lib/date";

type CalendarMonthGridProps = {
  year: number;
  month: number; // 1-12
  enabledDays: number[];
  eventCounts?: Record<number, number>;
  onSelectDay: (date: string) => void;
  loading?: boolean;
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

export function CalendarMonthGrid({
  year,
  month,
  enabledDays,
  eventCounts = {},
  onSelectDay,
  loading = false,
}: CalendarMonthGridProps) {
  if (loading) {
    return (
      <div className="flex min-h-105 items-center justify-center rounded-2xl border bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="text-sm text-slate-500">Carregando calendário...</span>
        </div>
      </div>
    );
  }

  const totalDays = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  const leadingEmptyDays = Array.from(
    { length: firstDayOfWeek },
    (_, index) => ({
      key: `empty-start-${index}`,
      type: "empty" as const,
    }),
  );

  const days = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    const enabled = enabledDays.includes(day);
    const date = buildDate(year, month, day);
    const count = eventCounts[day] ?? 0;
    const isPast = isPastDay(date);

    return {
      key: `day-${day}`,
      type: "day" as const,
      day,
      enabled,
      date,
      count,
      isPast,
    };
  });

  const cells = [...leadingEmptyDays, ...days];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((weekDay) => (
          <div
            key={weekDay}
            className="rounded-xl border bg-slate-100 px-2 py-3 text-center text-sm font-medium text-slate-700"
          >
            {weekDay}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell) => {
          if (cell.type === "empty") {
            return (
              <div
                key={cell.key}
                className="min-h-24 rounded-2xl bg-transparent"
              />
            );
          }

          return (
            <div
              key={cell.key}
              onClick={
                cell.enabled && !cell.isPast
                  ? () => onSelectDay(cell.date)
                  : undefined
              }
              className={[
                "min-h-24 rounded-2xl border p-2 transition-all",
                cell.enabled && !cell.isPast
                  ? "cursor-pointer border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300 active:scale-[0.98]"
                  : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60",
              ].join(" ")}
            >
              <div className="flex h-full flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <span
                    className={[
                      "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                      cell.isPast
                        ? "bg-amber-200 text-amber-800"
                        : cell.enabled
                          ? "bg-slate-900 text-white"
                          : "bg-slate-200 text-slate-500",
                      cell.count == 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700",
                    ].join(" ")}
                  >
                    {cell.day}
                  </span>

                  {cell.count > 0 ? (
                    <span
                      className={[
                        "rounded-full px-2 py-1 text-xs font-medium",
                        cell.isPast
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700",
                        cell.count == 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700",
                      ].join(" ")}
                    >
                      {cell.count > 99 ? "99+" : cell.count} evento
                      {cell.count !== 1 ? "s" : ""}
                    </span>
                  ) : null}
                </div>

                <div
                  className={[
                    "flex h-9 items-center justify-center rounded-xl text-sm font-medium",
                    cell.isPast
                      ? "bg-amber-100 text-amber-700"
                      : cell.enabled
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500",
                    cell.count == 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700",
                  ].join(" ")}
                >
                  {cell.isPast
                    ? "Encerrado"
                    : cell.enabled
                      ? "Ver eventos"
                      : "Sem eventos"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}