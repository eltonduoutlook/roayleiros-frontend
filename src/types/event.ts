export type EventItem = {
    id: string;
    title: string;
    date: string;
    time: string;
    unitId: string;
    destinationCity: string;
    state?: string;
    description: string;
    meetingPoints: MeetingPoint[];
    goingParticipants: EventParticipant[];
    interestedParticipants: EventParticipant[];
};

export type EventFilters = {
  unitId?: string;
  year?: number;
  month?: number;
  date?: string;
};

export type MeetingPoint = {
    id: string;
    name: string;
    time: string;
    mapLink: string;
};

export type EventParticipant = {
    id: string;
    name: string;
    email: string;
};

export type EventReaction = "going" | "interested";

export type CreateMeetingPointInput = {
  name: string;
  time: string;
  mapLink: string;
};

export type CreateEventInput = {
  title: string;
  date: string;
  time: string;
  unitId: string;
  destinationCity: string;
  state?: string;
  description: string;
  meetingPoints: CreateMeetingPointInput[];
};

export type UpdateEventReactionInput = {
  userId: string;
  reaction: EventReaction;
};

export type LoginInput = {
  email: string;
  accessCode: number;
};