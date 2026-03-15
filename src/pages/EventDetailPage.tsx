import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Clock,
  Clock3,
  MapPin,
  Navigation,
  Calendar,
  Star,
  Hand,
} from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BreadcrumbNav } from "@/components/common/BreadcrumbNav";
import { PageHeader } from "@/components/common/PageHeader";
import { formatDateBR, monthNames } from "@/lib/date";
import { eventsService } from "@/services/events.service";
import { useAsyncData } from "@/hooks/useAsyncData";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";

export default function EventDetailPage() {
  const { id } = useParams();

  const safeId = id ?? "";
  const isInvalidId = !id;

  const {
    data: event,
    loading,
    error,
  } = useAsyncData(() => eventsService.getEventById(safeId), null, [safeId]);

  const { data: units, loading: loadingUnits } = useAsyncData(
    () => eventsService.getUnits(),
    [],
    [],
  );

  const [eventState, setEventState] = useState<typeof event>(null);
  const [updatingReaction, setUpdatingReaction] = useState(false);

  useEffect(() => {
    if (event) {
      setEventState(event);
    }
  }, [event]);

  const loggedUser = useMemo(() => {
    const raw = localStorage.getItem("mock:user");
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  if (isInvalidId) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <FullScreenLoader text="Carregando detalhes do evento..." />
      </section>
    );
  }

  if (error || !event) {
    return <Navigate to="/404" replace />;
  }

  const viewEvent = eventState ?? event;

  const unit = units.find(
    (item) => String(item.id) === String(viewEvent.unitId),
  );

  const [yearString, monthString] = viewEvent.date.split("-");
  const eventYear = Number(yearString);
  const monthIndex = Number(monthString) - 1;

  const goingParticipants = viewEvent.goingParticipants ?? [];
  const interestedParticipants = viewEvent.interestedParticipants ?? [];
  const meetingPoints = viewEvent.meetingPoints ?? [];

  const goingCount = goingParticipants.length;
  const interestedCount = interestedParticipants.length;

  const isGoing =
    !!loggedUser &&
    goingParticipants.some(
      (participant) => String(participant.id) === String(loggedUser.id),
    );

  const isInterested =
    !!loggedUser &&
    interestedParticipants.some(
      (participant) => String(participant.id) === String(loggedUser.id),
    );

  const handleReaction = async (reaction: "going" | "interested") => {
    if (updatingReaction) return;

    try {
      setUpdatingReaction(true);
      const updatedEvent = await eventsService.setEventReaction(safeId, reaction);
      setEventState(updatedEvent);
    } catch (err) {
      console.error("Erro ao atualizar participação:", err);
    } finally {
      setUpdatingReaction(false);
    }
  };

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
          { label: formatDateBR(viewEvent.date), to: `/eventos/${viewEvent.date}` },
          { label: viewEvent.title },
        ]}
      />

      <PageHeader
        title={viewEvent.title}
        subtitle="Detalhes completos do evento selecionado."
      />

      <Card className="rounded-2xl">
        <CardContent className="space-y-6 sm:p-4 md:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="inline-flex h-10 items-center gap-2 rounded-xl border border-blue-200 bg-blue-100 px-3 text-sm font-medium text-blue-700 sm:px-4">
                <Calendar className="h-4 w-4" />
                {formatDateBR(viewEvent.date)}
              </Badge>

              <Badge
                className="inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition sm:px-4"
                variant="secondary"
              >
                <Clock className="h-4 w-4" />
                {viewEvent.time}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={() => void handleReaction("going")}
                disabled={updatingReaction}
                className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition sm:h-10 sm:w-auto ${
                  isGoing
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <Star className="h-4 w-4 shrink-0" />
                <span>Eu vou</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isGoing
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {goingCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => void handleReaction("interested")}
                disabled={updatingReaction}
                className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition sm:h-10 sm:w-auto ${
                  isInterested
                    ? "border-amber-500 bg-amber-500 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <Hand className="h-4 w-4 shrink-0" />
                <span>Tenho interesse</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isInterested
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {interestedCount}
                </span>
              </button>
            </div>
          </div>

          <div className="grid gap-6 text-sm md:grid-cols-1">
            <div className="space-y-2">
              <p className="font-medium text-slate-900">Expansão</p>
              <p className="flex items-center gap-2 text-slate-500">
                <Building2 className="h-4 w-4" />
                {loadingUnits ? (
                  <span className="text-slate-400">Carregando expansão...</span>
                ) : unit ? (
                  unit.city ? `${unit.name} — ${unit.city}` : unit.name
                ) : (
                  "Expansão não encontrada"
                )}
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-slate-900">Destino</p>
              <p className="flex items-center gap-2 text-slate-500">
                <MapPin className="h-4 w-4" />
                {viewEvent.location}
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-slate-900">Horário</p>
              <p className="flex items-center gap-2 text-slate-500">
                <Clock3 className="h-4 w-4" />
                {viewEvent.time}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-slate-900">Descrição</p>
            <p className="leading-7 text-slate-600">{viewEvent.description}</p>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-slate-900">Pontos de encontro</p>

            <ul className="space-y-2 text-slate-600">
              {meetingPoints.map((point) => (
                <li key={point.id} className="rounded-lg border bg-slate-50">
                  <a
                    href={point.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span>{point.time}</span>
                      </div>

                      <div className="flex min-w-0 items-center gap-1">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="max-w-[160px] truncate sm:max-w-none">
                          {point.name}
                        </span>
                      </div>
                    </div>

                    <Navigation className="h-5 w-5 shrink-0 text-blue-700" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}