export const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
];

export function formatDateBR(date: string) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
}

export function getDaysInMonth(year: number, monthIndex: number) {
    return new Date(year, monthIndex + 1, 0).getDate();
}

export function buildDate(year: number, month: number, day: number) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isPastMonth(year: number, month: number) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    return year < currentYear || (year === currentYear && month < currentMonth);
}

export function isPastDay(dateString: string) {
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const [year, month, day] = dateString.split("-").map(Number);
    const targetDate = new Date(year, month - 1, day);

    return targetDate < todayOnly;
}

export function isToday(year: number, month: number, day: number) {
    const today = new Date();
    return (
        today.getFullYear() === year &&
        today.getMonth() + 1 === month &&
        today.getDate() === day
    );
}

export function getPreviousMonth(month: number) {
    if (month <= 1) return null;
    return month - 1;
}

export function getNextMonth(month: number) {
    if (month >= 12) return null;
    return month + 1;
}

export function getYearFromDate(date: string) {
    return Number(date.split("-")[0]);
}

export function getMonthFromDate(date: string) {
    return Number(date.split("-")[1]);
}

export function getAvailableYears(dates: string[]) {
    return [...new Set(dates.map((date) => getYearFromDate(date)))].sort((a, b) => a - b);
}

export function getMonthNavigation(
    year: number,
    month: number,
    availableYears: number[],
) {
    const minYear = Math.min(...availableYears);
    const maxYear = Math.max(...availableYears);

    let previous: { year: number; month: number } | null = null;
    let next: { year: number; month: number } | null = null;

    if (month > 1) {
        previous = { year, month: month - 1 };
    } else if (year > minYear) {
        previous = { year: year - 1, month: 12 };
    }

    if (month < 12) {
        next = { year, month: month + 1 };
    } else if (year < maxYear) {
        next = { year: year + 1, month: 1 };
    }

    return { previous, next };
}
