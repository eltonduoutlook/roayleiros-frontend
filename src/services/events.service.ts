import { api } from "@/services/api";
import type {
  EventFilters,
  EventItem,
  EventParticipant,
  EventReaction,
} from "@/types/event";

type BackendUnit = {
  id: string;
  name: string;
  city?: string | null;
  createdAt: string;
  updatedAt: string;
};

type BackendParticipantStatus = "GOING" | "MAYBE" | "NOT_GOING";

type BackendParticipant = {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string | null;
  status: BackendParticipantStatus;
  createdAt: string;
  updatedAt: string;
};

type BackendEvent = {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  timeLabel?: string | null;
  location?: string | null;
  address?: string | null;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  maxParticipants?: number | null;
  createdAt: string;
  updatedAt: string;
  unitId?: string | null;
  unit?: BackendUnit | null;
  participants?: BackendParticipant[] | null;
  _count?: {
    participants: number;
  };
};

const ensureArray = <T,>(value: T[] | null | undefined): T[] => {
  return Array.isArray(value) ? value : [];
};

const formatDateOnly = (isoDate: string) => {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatTimeOnly = (isoDate: string) => {
  const date = new Date(isoDate);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

const toFrontendParticipant = (
  participant: BackendParticipant,
): EventParticipant => ({
  id: participant.id,
  name: participant.name,
  email: participant.email,
});

const mapBackendEventToEventItem = (event: BackendEvent): EventItem => {
  const participants = ensureArray(event.participants);

  const goingParticipants = participants
    .filter((participant) => participant.status === "GOING")
    .map(toFrontendParticipant);

  const interestedParticipants = participants
    .filter((participant) => participant.status === "MAYBE")
    .map(toFrontendParticipant);

  return {
    id: event.id,
    title: event.title,
    description: event.description ?? "",
    date: formatDateOnly(event.date),
    time: event.timeLabel?.trim() || formatTimeOnly(event.date),
    location: event.location ?? event.address ?? "",
    unitId: event.unitId ?? "",
    meetingPoints: [],
    goingParticipants,
    interestedParticipants,
  };
};

const getLoggedUser = (): EventParticipant | null => {
  const raw = localStorage.getItem("mock:user");
  if (!raw) return null;

  try {
    const user = JSON.parse(raw);

    return {
      id: String(user.id),
      name: String(user.name),
      email: String(user.email),
    };
  } catch {
    return null;
  }
};

const reactionToBackendStatus = (
  reaction: EventReaction,
): BackendParticipantStatus => {
  if (reaction === "going") return "GOING";
  return "MAYBE";
};

export const eventsService = {
  async getUnits() {
    const units = await api.get<BackendUnit[] | null>("/units");
    return ensureArray(units);
  },

  async getMonthsWithEvents() {
    const events = ensureArray(
      await api.get<BackendEvent[] | null>("/events", {
        status: "PUBLISHED",
      }),
    );

    return [...new Set(events.map((event) => new Date(event.date).getMonth() + 1))].sort(
      (a, b) => a - b,
    );
  },

  async getDaysWithEventsByMonth(year: number, month: number) {
    const events = ensureArray(
      await api.get<BackendEvent[] | null>("/events", {
        year,
        month,
        status: "PUBLISHED",
      }),
    );

    return [...new Set(events.map((event) => new Date(event.date).getDate()))].sort(
      (a, b) => a - b,
    );
  },

  async getEventCountsByMonth(year: number, month: number) {
    const events = ensureArray(
      await api.get<BackendEvent[] | null>("/events", {
        year,
        month,
        status: "PUBLISHED",
      }),
    );

    return events.reduce<Record<number, number>>((acc, event) => {
      const day = new Date(event.date).getDate();
      acc[day] = (acc[day] ?? 0) + 1;
      return acc;
    }, {});
  },

  async getEventsByDate(date: string, filters?: EventFilters): Promise<EventItem[]> {
    const [year, month] = date.split("-").map(Number);

    const events = ensureArray(
      await api.get<BackendEvent[] | null>("/events", {
        year,
        month,
        status: "PUBLISHED",
      }),
    );

    return events
      .filter((event) => formatDateOnly(event.date) === date)
      .filter((event) => (filters?.unitId ? event.unitId === filters.unitId : true))
      .map(mapBackendEventToEventItem)
      .sort((a, b) => a.time.localeCompare(b.time));
  },

  async getEventById(id: string) {
    try {
      const event = await api.get<BackendEvent>(`/events/${id}`);
      return mapBackendEventToEventItem(event);
    } catch {
      return null;
    }
  },

  async getUnitById(id: string) {
    try {
      return await api.get<BackendUnit>(`/units/${id}`);
    } catch {
      return null;
    }
  },

  async getEventCountsByMonthList(year: number) {
    const events = ensureArray(
      await api.get<BackendEvent[] | null>("/events", {
        year,
        status: "PUBLISHED",
      }),
    );

    return events.reduce<Record<number, number>>((acc, event) => {
      const month = new Date(event.date).getMonth() + 1;
      acc[month] = (acc[month] ?? 0) + 1;
      return acc;
    }, {});
  },

  async getAvailableYears() {
    const events = ensureArray(
      await api.get<BackendEvent[] | null>("/events", {
        status: "PUBLISHED",
      }),
    );

    return [...new Set(events.map((event) => new Date(event.date).getFullYear()))].sort(
      (a, b) => a - b,
    );
  },

  async setEventReaction(eventId: string, reaction: EventReaction) {
    const loggedUser = getLoggedUser();

    if (!loggedUser) {
      throw new Error("Usuário logado não encontrado.");
    }

    await api.post(`/events/${eventId}/rsvp`, {
      name: loggedUser.name,
      email: loggedUser.email,
      status: reactionToBackendStatus(reaction),
    });

    const updatedEvent = await api.get<BackendEvent>(`/events/${eventId}`);
    return mapBackendEventToEventItem(updatedEvent);
  },
};