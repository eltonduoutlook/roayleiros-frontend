import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BreadcrumbNav } from "@/components/common/BreadcrumbNav";
import { PageHeader } from "@/components/common/PageHeader";
import { EventCard } from "@/components/calendar/EventCard";
import { UnitFilter } from "@/components/filters/UnitFilter";
import { formatDateBR, monthNames } from "@/lib/date";
import { eventsService } from "@/services/events.service";
import { useAsyncData } from "@/hooks/useAsyncData";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";

export default function EventListPage() {
  const navigate = useNavigate();
  const { date } = useParams();
  const [unitId, setUnitId] = useState("");

  const safeDate = date ?? "2000-01-01";
  const isInvalidDate = !date;

  const eventYear = new Date(safeDate).getFullYear();
  const monthIndex = new Date(safeDate).getMonth();

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
      eventsService.getEventsByDate(safeDate, { unitId: unitId || undefined }),
    [],
    [safeDate, unitId],
  );

  const subtitle = useMemo(() => {
    if (loading) return "Carregando eventos...";
    return `${events.length} evento(s) encontrado(s).`;
  }, [events.length, loading]);

  if (isInvalidDate) {
    return <Navigate to="/" replace />;
  }

  const selectedUnitName =
    units.find((unit) => String(unit.id) === String(unitId))?.name ?? "";

  const emptyMessage =
    safeDate && selectedUnitName
      ? `Nenhum evento encontrado no dia ${formatDateBR(safeDate)} para a expansão ${selectedUnitName}.`
      : safeDate
        ? `Nenhum evento encontrado no dia ${formatDateBR(safeDate)}.`
        : selectedUnitName
          ? `Nenhum evento encontrado para a expansão ${selectedUnitName}.`
          : "Nenhum evento encontrado para esta combinação de filtros.";

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

      {loading && <FullScreenLoader text="Carregando detalhes do evento..." />}

      {error && (
        <div className="rounded-2xl border bg-white p-6 text-red-500">
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
          {events.map((event) => {
            const unit = units.find((item) => String(item.id) === String(event.unitId));

            return (
              <EventCard
                key={event.id}
                title={event.title}
                time={event.time}
                unitName={`Expansão: ${unit?.name ?? "não encontrada"}`}
                destinationCity={`Destino: ${event.destinationCity}`}
                description={event.description}
                onClick={() => navigate(`/evento/${event.id}`)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}