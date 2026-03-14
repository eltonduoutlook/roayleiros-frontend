import { buildDate, isPastDay, isToday } from "./date";

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

export function buildMonthCalendarDays(
  year: number,
  month: number,
  enabledDays: number[],
  eventCounts: Record<number, number> = {},
) {
  const totalDays = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  const leadingEmptyDays = Array.from({ length: firstDayOfWeek }, (_, index) => ({
    key: `empty-start-${index}`,
    type: "empty" as const,
  }));

  const days = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    const date = buildDate(year, month, day);

    return {
      key: `day-${day}`,
      type: "day" as const,
      day,
      enabled: enabledDays.includes(day),
      date,
      count: eventCounts[day] ?? 0,
      isPast: isPastDay(date),
      today: isToday(year, month, day),
    };
  });

  return [...leadingEmptyDays, ...days];
}