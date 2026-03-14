import { Navigate, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { MonthCard } from "@/components/calendar/MonthCard";
import { Button } from "@/components/ui/button";
import { monthNames, isPastMonth } from "@/lib/date";
import { eventsService } from "@/services/events.service";
import { useAsyncData } from "@/hooks/useAsyncData";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";

export default function HomePage() {
  const navigate = useNavigate();
  const { year } = useParams();

  const currentYear = new Date().getFullYear();
  const selectedYear = year ? Number(year) : currentYear;

  const isInvalidYear = Number.isNaN(selectedYear);

  const { data: availableYears, loading: loadingYears } = useAsyncData(
    () => eventsService.getAvailableYears(),
    [],
    [],
  );

  const {
    data: monthEventCounts,
    loading,
    error,
  } = useAsyncData(
    () => eventsService.getEventCountsByMonthList(selectedYear),
    {},
    [selectedYear],
  );

  if (isInvalidYear) {
    return <Navigate to={`/ano/${currentYear}`} replace />;
  }

  const previousYear =
    [...availableYears]
      .filter((year) => year < selectedYear)
      .sort((a, b) => b - a)[0] ?? null;

  const nextYear =
    [...availableYears]
      .filter((year) => year > selectedYear)
      .sort((a, b) => a - b)[0] ?? null;

  return (
    <section className="space-y-6">
      <PageHeader
        actions={
          <div className="grid w-full grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="h-11 w-full cursor-pointer justify-center whitespace-nowrap px-3"
              disabled={!previousYear || loadingYears}
              onClick={() => previousYear && navigate(`/ano/${previousYear}`)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span className="md:inline">{previousYear ?? `${selectedYear - 1}`}</span>
              <span className="hidden md:inline">{previousYear ?? `${selectedYear - 1} não há eventos`}</span>
            </Button>

            <div className="flex h-11 w-full items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-3 text-xl font-bold whitespace-nowrap text-blue-700">
              <span className="truncate">{selectedYear}</span>
            </div>

            <Button
              variant="outline"
              className="h-11 w-full cursor-pointer justify-center whitespace-nowrap px-3"
              disabled={!nextYear || loadingYears}
              onClick={() => nextYear && navigate(`/ano/${nextYear}`)}
            >
              <span className="md:inline">{previousYear ?? `${selectedYear + 1}`}</span>
              <span className="hidden md:inline">{previousYear ?? `${selectedYear + 1} não há eventos`}</span>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        }
      />

      {loading && <FullScreenLoader text="Carregando o calendário..." />}

      {error && (
        <div className="rounded-2xl border bg-white p-6 text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {monthNames.map((month, index) => (
            <MonthCard
              key={month}
              title={month}
              enabled={(monthEventCounts[index] ?? 0) > 0}
              eventCount={monthEventCounts[index] ?? 0}
              isPast={isPastMonth(selectedYear, index + 1)}
              onClick={() => navigate(`/ano/${selectedYear}/mes/${index + 1}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
