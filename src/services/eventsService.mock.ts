
import { eventsMock } from "@/data/eventsMock";
import { unitsMock } from "@/data/unitsMock";
import { usersMock } from "@/data/usersMock";
import type {
  CreateEventInput,
  EventFilters,
  EventItem,
  UpdateEventReactionInput,
} from "@/types/event";
import type { Unit } from "@/types/unit";

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cloneEvent(event: EventItem): EventItem {
  return JSON.parse(JSON.stringify(event));
}

export const mockEventsService = {
  async getEvents(filters?: EventFilters): Promise<EventItem[]> {
    await delay();

    let result = [...eventsMock];

    if (filters?.unitId) {
      result = result.filter((event) => event.unitId === filters.unitId);
    }

    if (filters?.year) {
      result = result.filter(
        (event) => Number(event.date.slice(0, 4)) === filters.year,
      );
    }

    if (filters?.month) {
      result = result.filter(
        (event) => Number(event.date.slice(5, 7)) === filters.month,
      );
    }

    if (filters?.date) {
      result = result.filter((event) => event.date === filters.date);
    }

    return result.map(cloneEvent);
  },

  async getEventById(id: string): Promise<EventItem | null> {
    await delay();

    const event = eventsMock.find((item) => item.id === id);
    return event ? cloneEvent(event) : null;
  },

  async getUnits(): Promise<Unit[]> {
    await delay();
    return JSON.parse(JSON.stringify(unitsMock));
  },

  async createEvent(input: CreateEventInput): Promise<EventItem> {
    await delay();

    const newEvent: EventItem = {
      id: crypto.randomUUID(),
      title: input.title,
      date: input.date,
      time: input.time,
      unitId: input.unitId,
      location: input.location,
      state: input.state,
      description: input.description,
      meetingPoints: input.meetingPoints.map((point) => ({
        id: crypto.randomUUID(),
        name: point.name,
        time: point.time,
        mapLink: point.mapLink,
      })),
      goingParticipants: [],
      interestedParticipants: [],
    };

    eventsMock.push(newEvent);

    return cloneEvent(newEvent);
  },

  async updateEvent(id: string, input: CreateEventInput): Promise<EventItem> {
    await delay();

    const index = eventsMock.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error("Evento não encontrado");
    }

    const currentEvent = eventsMock[index];

    eventsMock[index] = {
      ...currentEvent,
      ...input,
      meetingPoints: input.meetingPoints.map((point, pointIndex) => ({
        id: currentEvent.meetingPoints[pointIndex]?.id ?? crypto.randomUUID(),
        name: point.name,
        time: point.time,
        mapLink: point.mapLink,
      })),
    };

    return cloneEvent(eventsMock[index]);
  },

  async deleteEvent(id: string): Promise<void> {
    await delay();

    const index = eventsMock.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error("Evento não encontrado");
    }

    eventsMock.splice(index, 1);
  },

  async updateReaction(id: string, input: UpdateEventReactionInput): Promise<EventItem> {
    await delay();

    const event = eventsMock.find((item) => item.id === id);

    if (!event) {
      throw new Error("Evento não encontrado");
    }

    const user = usersMock.find((item) => item.id === input.userId);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const participant = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    event.goingParticipants = event.goingParticipants.filter(
      (item) => item.id !== user.id,
    );
    event.interestedParticipants = event.interestedParticipants.filter(
      (item) => item.id !== user.id,
    );

    if (input.reaction === "going") {
      event.goingParticipants.push(participant);
    } else {
      event.interestedParticipants.push(participant);
    }

    return cloneEvent(event);
  },

  async removeReaction(eventId: string, userId: string): Promise<EventItem> {
    await delay();

    const event = eventsMock.find((item) => item.id === eventId);

    if (!event) {
      throw new Error("Evento não encontrado");
    }

    event.goingParticipants = event.goingParticipants.filter(
      (item) => item.id !== userId,
    );
    event.interestedParticipants = event.interestedParticipants.filter(
      (item) => item.id !== userId,
    );

    return cloneEvent(event);
  },
};