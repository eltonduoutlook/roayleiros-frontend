import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BreadcrumbNav } from "@/components/common/BreadcrumbNav";
import { PageHeader } from "@/components/common/PageHeader";
import { EventCard } from "@/components/calendar/EventCard";

import { formatDateBR, monthNames } from "@/lib/date";
import { eventsService } from "@/services/events.service";
import { useAsyncData } from "@/hooks/useAsyncData";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";
import { UnitFilter } from "@/components/filters/UnitFilter";

export default function EventListPage() {
  const navigate = useNavigate();
  const { date } = useParams();
  const [unitId, setUnitId] = useState("");

  const isInvalidDate = !date;
  const safeDate = date ?? "2000-01-01";

  const [yearString, monthString] = safeDate.split("-");
  const eventYear = Number(yearString);
  const monthIndex = Number(monthString) - 1;

  const { data: units, loading: loadingUnits } = useAsyncData(
    () => eventsService.getUnits(),
    [],
    [],
  );

  const {
    data: events,
    loading,
    error,
  } = useAsyncData(
    () =>
      eventsService.getEventsByDate(safeDate, {
        unitId: unitId || undefined,
      }),
    [],
    [safeDate, unitId],
  );

  const unitsMap = useMemo(() => {
    return new Map(units.map((unit) => [String(unit.id), unit.name]));
  }, [units]);

  const subtitle = useMemo(() => {
    if (loading) return "Carregando eventos...";
    return `${events.length} evento(s) encontrado(s).`;
  }, [events.length, loading]);

  const selectedUnitName = unitsMap.get(String(unitId)) ?? "";

  const emptyMessage = selectedUnitName
    ? `Nenhum evento encontrado no dia ${formatDateBR(safeDate)} para a unidade ${selectedUnitName}.`
    : `Nenhum evento encontrado no dia ${formatDateBR(safeDate)}.`;

  if (isInvalidDate) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="space-y-6">
      <BreadcrumbNav
        items={[
          { label: "Home", to: `/ano/${eventYear}` },
          { label: String(eventYear), to: `/ano/${eventYear}` },
          {
            label: monthNames[monthIndex],
            to: `/ano/${eventYear}/mes/${monthIndex + 1}`,
          },
          { label: formatDateBR(safeDate) },
        ]}
      />

      <PageHeader
        title={`Eventos em ${formatDateBR(safeDate)}`}
        subtitle={subtitle}
      />

      {!loadingUnits && (
        <UnitFilter units={units} value={unitId} onChange={setUnitId} />
      )}

      {loading && <FullScreenLoader text="Carregando eventos..." />}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          {emptyMessage}
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="grid gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              time={event.time}
              unitName={`Unidade: ${unitsMap.get(String(event.unitId)) ?? "não encontrada"}`}
              location={`Destino: ${event.location}`}
              description={event.description}
              onClick={() => navigate(`/evento/${event.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}