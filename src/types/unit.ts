import type { UserSummary } from "./users";

export type UnitLocation = {
  state: string;
  city: string;
};

export type UnitLocationPayload = {
  state: string;
  city: string;
};

export type UnitPayload = {
  name: string;
  active: boolean;
  coordinatorIds: string[];
  locations: UnitLocationPayload[];
};

export type Unit = {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  coordinatorIds?: string[];
  locations: UnitLocation[];
};

export type UnitListResponse = {
  items: Unit[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};