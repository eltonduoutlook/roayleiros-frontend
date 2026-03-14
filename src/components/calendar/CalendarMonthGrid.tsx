import { buildMonthCalendarDays } from "@/lib/calendar";
import { buildDate, isPastDay, isToday } from "@/lib/date";
import { CalendarX, Clock, Eye, type LucideIcon } from "lucide-react";

type CalendarMonthGridProps = {
  year: number;
  month: number; // 1-12
  enabledDays: number[];
  eventCounts?: Record<number, number>;
  onSelectDay: (date: string) => void;
  loading?: boolean;
};

type EmptyCell = {
  key: string;
  type: "empty";
};

type DayCell = {
  key: string;
  type: "day";
  day: number;
  enabled: boolean;
  date: string;
  count: number;
  isPast: boolean;
  today: boolean;
};

type CalendarCell = EmptyCell | DayCell;

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getDayBadgeClass(cell: DayCell) {
  if (cell.today) return "bg-blue-600 text-white animate-pulse";
  if (cell.isPast) return "bg-amber-200 text-amber-800";
  if (cell.enabled) return "bg-slate-900 text-white";
  return "bg-slate-200 text-slate-500";
}

function getEventCountClass(cell: DayCell) {
  return cell.isPast
    ? "bg-blue-100 text-amber-700"
    : "bg-blue-100 text-blue-700";
}

function getStatusClass(cell: DayCell) {
  if (cell.isPast) {
    return "bg-amber-100 text-amber-700";
  }

  if (cell.count === 0) {
    return "bg-gray-200 text-gray-500";
  }

  return "bg-blue-100 text-blue-700";
}

function getStatusContent(cell: DayCell): {
  Icon: LucideIcon;
  label: string;
} {
  if (cell.isPast) {
    return { Icon: Clock, label: "Encerrado" };
  }

  if (cell.enabled) {
    return { Icon: Eye, label: "Ver eventos" };
  }

  return { Icon: CalendarX, label: "Sem eventos" };
}

function formatEventCount(count: number) {
  const displayCount = count > 99 ? "99+" : count;
  return `${displayCount} evento${count !== 1 ? "s" : ""}`;
}

function LoadingCalendar() {
  return (
    <div className="flex min-h-105 items-center justify-center rounded-2xl border bg-white">
      <div className="flex flex-col items-center gap-1 md:gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-600 border-t-transparent md:h-8 md:w-8" />
        <span className="text-sm text-slate-500">Carregando calendário...</span>
      </div>
    </div>
  );
}

function EmptyCalendarCell() {
  return (
    <div className="min-h-[64px] rounded-2xl bg-transparent md:min-h-24" />
  );
}

function DayCalendarCell({
  cell,
  onSelectDay,
}: {
  cell: DayCell;
  onSelectDay: (date: string) => void;
}) {
  const clickable = cell.enabled && !cell.isPast;
  const { Icon, label } = getStatusContent(cell);

  return (
    <div
      onClick={clickable ? () => onSelectDay(cell.date) : undefined}
      className={cn(
        "min-h-[64px] rounded-2xl border p-2 transition-all md:min-h-24",
        cell.today && "border-blue-500 ring-2 ring-blue-200",
        clickable
          ? "cursor-pointer border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md active:scale-[0.98]"
          : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60",
      )}
    >
      <div className="flex h-full flex-col justify-between gap-1 md:gap-3">
        <div className="flex items-start justify-between">
          <span
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold md:h-8 md:w-8 md:text-sm",
              getDayBadgeClass(cell),
            )}
          >
            {cell.day}
          </span>

          <div className="hidden md:block">
            {cell.count > 0 ? (
              <span
                className={cn(
                  "rounded-full px-2 py-1 text-xs font-medium",
                  getEventCountClass(cell),
                )}
              >
                {formatEventCount(cell.count)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative">
          <div
            className={cn(
              "flex h-7 items-center justify-center rounded-xl text-sm font-medium md:h-9",
              getStatusClass(cell),
            )}
          >
            <Icon className="h-4 w-4 md:hidden" />
            <span className="hidden md:inline">{label}</span>
          </div>

          {cell.count > 0 && (
            <div className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white md:hidden">
              {cell.count > 99 ? "99+" : cell.count}
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
    return <LoadingCalendar />;
  }

  const cells = buildMonthCalendarDays(year, month, enabledDays, eventCounts);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((weekDay) => (
          <div
            key={weekDay}
            className="rounded-xl border bg-slate-100 px-2 py-2 text-center text-sm font-medium text-slate-700 md:py-3"
          >
            {weekDay}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell) =>
          cell.type === "empty" ? (
            <EmptyCalendarCell key={cell.key} />
          ) : (
            <DayCalendarCell
              key={cell.key}
              cell={cell}
              onSelectDay={onSelectDay}
            />
          ),
        )}
      </div>
    </div>
  );
}