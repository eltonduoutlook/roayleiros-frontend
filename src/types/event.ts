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