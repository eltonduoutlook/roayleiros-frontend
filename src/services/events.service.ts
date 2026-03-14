import { eventsMock } from "@/data/eventsMock";
import { unitsMock } from "@/data/unitsMock";
import type {
  EventFilters,
  EventItem,
  EventParticipant,
  EventReaction,
} from "@/types/event";

const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const cloneEvent = (event: EventItem): EventItem => ({
  ...event,
  meetingPoints: event.meetingPoints.map((point) => ({ ...point })),
  goingParticipants: event.goingParticipants.map((participant) => ({
    ...participant,
  })),
  interestedParticipants: event.interestedParticipants.map((participant) => ({
    ...participant,
  })),
});

const cloneEvents = (events: EventItem[]): EventItem[] =>
  events.map((event) => cloneEvent(event));

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

const removeParticipantById = (
  participants: EventParticipant[],
  userId: string,
) => participants.filter((participant) => participant.id !== userId);

const hasParticipant = (
  participants: EventParticipant[],
  userId: string,
) => participants.some((participant) => participant.id === userId);

export const eventsService = {
  async getUnits() {
    await wait();
    return unitsMock;
  },

  async getMonthsWithEvents() {
    await wait();
    return [...new Set(eventsMock.map((event) => new Date(event.date).getMonth()))];
  },

  async getDaysWithEventsByMonth(year: number, monthIndex: number) {
    await wait();

    return [
      ...new Set(
        eventsMock
          .filter((event) => {
            const [eventYear, eventMonth] = event.date.split("-").map(Number);
            return eventYear === year && eventMonth - 1 === monthIndex;
          })
          .map((event) => Number(event.date.split("-")[2])),
      ),
    ].sort((a, b) => a - b);
  },

  async getEventCountsByMonth(year: number, monthIndex: number) {
    await wait();

    return eventsMock
      .filter((event) => {
        const [eventYear, eventMonth] = event.date.split("-").map(Number);
        return eventYear === year && eventMonth - 1 === monthIndex;
      })
      .reduce<Record<number, number>>((acc, event) => {
        const day = Number(event.date.split("-")[2]);
        acc[day] = (acc[day] ?? 0) + 1;
        return acc;
      }, {});
  },

  async getEventsByDate(date: string, filters?: EventFilters): Promise<EventItem[]> {
    await wait();

    const events = eventsMock
      .filter((event) => event.date === date)
      .filter((event) => (filters?.unitId ? event.unitId === filters.unitId : true))
      .sort((a, b) => a.time.localeCompare(b.time));

    return cloneEvents(events);
  },

  async getEventById(id: string) {
    await wait();

    const event = eventsMock.find((event) => event.id === id) ?? null;
    return event ? cloneEvent(event) : null;
  },

  async getUnitById(id: string) {
    await wait();
    return unitsMock.find((unit) => unit.id === id) ?? null;
  },

  async getEventCountsByMonthList(year: number) {
    await wait();

    return eventsMock
      .filter((event) => Number(event.date.split("-")[0]) === year)
      .reduce<Record<number, number>>((acc, event) => {
        const month = new Date(event.date).getMonth();
        acc[month] = (acc[month] ?? 0) + 1;
        return acc;
      }, {});
  },

  async getAvailableYears() {
    await wait();

    return [...new Set(eventsMock.map((event) => Number(event.date.split("-")[0])))]
      .sort((a, b) => a - b);
  },

  async setEventReaction(eventId: string, reaction: EventReaction) {
    await wait();

    const loggedUser = getLoggedUser();

    if (!loggedUser) {
      throw new Error("Usuário logado não encontrado.");
    }

    const event = eventsMock.find((item) => item.id === eventId);

    if (!event) {
      throw new Error("Evento não encontrado.");
    }

    const alreadyGoing = hasParticipant(event.goingParticipants, loggedUser.id);
    const alreadyInterested = hasParticipant(
      event.interestedParticipants,
      loggedUser.id,
    );

    if (reaction === "going") {
      event.interestedParticipants = removeParticipantById(
        event.interestedParticipants,
        loggedUser.id,
      );

      if (alreadyGoing) {
        event.goingParticipants = removeParticipantById(
          event.goingParticipants,
          loggedUser.id,
        );
      } else {
        event.goingParticipants = [
          ...removeParticipantById(event.goingParticipants, loggedUser.id),
          loggedUser,
        ];
      }
    }

    if (reaction === "interested") {
      event.goingParticipants = removeParticipantById(
        event.goingParticipants,
        loggedUser.id,
      );

      if (alreadyInterested) {
        event.interestedParticipants = removeParticipantById(
          event.interestedParticipants,
          loggedUser.id,
        );
      } else {
        event.interestedParticipants = [
          ...removeParticipantById(event.interestedParticipants, loggedUser.id),
          loggedUser,
        ];
      }
    }

    return cloneEvent(event);
  },
};