import { api } from "@/services/api";
import type {
  CreateEventInput,
  EventFilters,
  EventItem,
  UpdateEventReactionInput,
} from "@/types/event";
import type { Unit } from "@/types/unit";

export const eventsService = {
  async getEvents(filters?: EventFilters): Promise<EventItem[]> {
    return api.get<EventItem[]>("/events", filters);
  },

  async getEventById(id: string): Promise<EventItem | null> {
    try {
      return await api.get<EventItem>(`/events/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes("404")) {
        return null;
      }
      throw error;
    }
  },

  async getUnits(): Promise<Unit[]> {
    return api.get<Unit[]>("/units");
  },

  async createEvent(input: CreateEventInput): Promise<EventItem> {
    return api.post<EventItem>("/events", input);
  },

  async updateEvent(id: string, input: CreateEventInput): Promise<EventItem> {
    return api.put<EventItem>(`/events/${id}`, input);
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  },

  async updateReaction(id: string, input: UpdateEventReactionInput): Promise<EventItem> {
    return api.put<EventItem>(`/events/${id}/reaction`, input);
  },

  async removeReaction(eventId: string, userId: string): Promise<EventItem> {
    return api.delete<EventItem>(`/events/${eventId}/reaction/${userId}`);
  },
};