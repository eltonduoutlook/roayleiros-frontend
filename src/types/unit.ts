import type { UserSummary } from "./users";

export type Unit = {
  id: string;
  name: string;
  state?: string | null;
  city?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  coordinators: UserSummary[];
};

export type UnitPayload = {
  name: string;
  state?: string;
  city?: string;
  active?: boolean;
  coordinatorIds: string[];
};

export type UnitListResponse = {
  items: Unit[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};