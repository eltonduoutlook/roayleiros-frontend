import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BreadcrumbNav } from "@/components/common/BreadcrumbNav";
import { PageHeader } from "@/components/common/PageHeader";
import { CalendarMonthGrid } from "@/components/calendar/CalendarMonthGrid";
import { Button } from "@/components/ui/button";
import { getMonthNavigation, monthNames } from "@/lib/date";
import { eventsService } from "@/services/events.service";
import { useAsyncData } from "@/hooks/useAsyncData";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";

export default function MonthDaysPage() {
  const navigate = useNavigate();
  const { year, month } = useParams();
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  const selectedYear = Number(year);
  const monthNumber = Number(month);

  const isInvalid =
    !year ||
    !month ||
    Number.isNaN(selectedYear) ||
    Number.isNaN(monthNumber) ||
    monthNumber < 1 ||
    monthNumber > 12;

  const safeYear = isInvalid ? new Date().getFullYear() : selectedYear;
  const safeMonthNumber = isInvalid ? 1 : monthNumber;
  const monthIndex = safeMonthNumber - 1;

  const { data: availableYears } = useAsyncData(
    () => eventsService.getAvailableYears(),
    [],
    [],
  );

  const {
    data: enabledDays,
    loading: loadingDays,
    error: daysError,
  } = useAsyncData(
    () => eventsService.getDaysWithEventsByMonth(safeYear, monthIndex),
    [],
    [safeYear, monthIndex],
  );

  const {
    data: eventCounts,
    loading: loadingCounts,
    error: countsError,
  } = useAsyncData(
    () => eventsService.getEventCountsByMonth(safeYear, monthIndex),
    {},
    [safeYear, monthIndex],
  );

  if (isInvalid) {
    return <Navigate to="/" replace />;
  }

  const navigation =
    availableYears.length > 0
      ? getMonthNavigation(safeYear, safeMonthNumber, availableYears)
      : { previous: null, next: null };

  const loading = loadingDays || loadingCounts;
  const error = daysError || countsError;

  return (
    <section className="space-y-6">
      {loading ? (
        <FullScreenLoader text={`Carregando o mês de ${monthNames[monthIndex]}`} />
      ) : (
        <BreadcrumbNav
          items={[
            { label: "Home", to: `/ano/${safeYear}` },
            { label: String(safeYear), to: `/ano/${safeYear}` },
            { label: monthNames[monthIndex] },
          ]}
        />
      )}
      <PageHeader
        actions={
          <div className="grid w-full grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="h-11 w-full cursor-pointer justify-center whitespace-nowrap px-3"
              disabled={!navigation.previous}
              onClick={() => {
                if (!navigation.previous) return;
                setSlideDirection(-1);
                navigate(
                  `/ano/${navigation.previous.year}/mes/${navigation.previous.month}`,
                );
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4 shrink-0" />
              {navigation.previous ? (
                <span className="truncate">
                  <span className="md:hidden">
                    {monthNames[navigation.previous.month - 1].slice(0, 3)}
                  </span>

                  <span className="hidden md:inline">
                    {monthNames[navigation.previous.month - 1]}
                    {navigation.previous.year !== safeYear
                      ? ` ${navigation.previous.year}`
                      : ""}
                  </span>
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  <span className="md:inline">{safeYear - 1}</span>
                  <span className="hidden md:inline">{safeYear - 1} não há eventos</span>
                </span>
              )}
            </Button>

            <div className="flex h-11 w-full items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-3 text-xl font-bold whitespace-nowrap text-blue-700">
              <span className="truncate">
                <span className="md:hidden">
                  {monthNames[monthIndex].slice(0, 3)}
                </span>
                <span className="hidden md:inline">
                  {monthNames[monthIndex]}
                </span>
              </span>
            </div>

            <Button
              variant="outline"
              className="h-11 w-full cursor-pointer justify-center whitespace-nowrap px-3"
              disabled={!navigation.next}
              onClick={() => {
                if (!navigation.next) return;
                setSlideDirection(1);
                navigate(
                  `/ano/${navigation.next.year}/mes/${navigation.next.month}`,
                );
              }}
            >
              {navigation.next ? (
                <span className="truncate">
                  <span className="md:hidden">
                    {monthNames[navigation.next.month - 1].slice(0, 3)}
                  </span>

                  <span className="hidden md:inline">
                    {monthNames[navigation.next.month - 1]}
                    {navigation.next.year !== safeYear
                      ? ` ${navigation.next.year}`
                      : ""}
                  </span>
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  <span className="md:inline">{safeYear + 1}</span>
                  <span className="hidden md:inline">{safeYear + 1} não há eventos</span>
                </span>
              )}
              <ChevronRight className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </div>
        }
      />

      {error && (
        <div className="rounded-2xl border bg-white p-6 text-red-500">
          {error}
        </div>
      )}

      {!error && (
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={slideDirection}>
            <motion.div
              key={`${safeYear}-${safeMonthNumber}`}
              custom={slideDirection}
              initial={{ x: slideDirection > 0 ? 120 : -120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: slideDirection > 0 ? -120 : 120, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <CalendarMonthGrid
                year={safeYear}
                month={safeMonthNumber}
                enabledDays={enabledDays}
                eventCounts={eventCounts}
                loading={loading}
                onSelectDay={(date) => navigate(`/eventos/${date}`)}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
