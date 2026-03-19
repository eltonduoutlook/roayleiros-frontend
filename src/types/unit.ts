import type { UnitCoordinatorItem } from "./unitCoordinator";

export type UnitLocation = {
  id: string;
  unitId: string;
  state: string;
  city: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Unit = {
  id: string;
  name: string;
  city: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  locations: UnitLocation[];
  coordinators: UnitCoordinatorItem[];
};

export type CreateUnitPayload = {
  name: string;
  active: boolean;
  coordinatorIds: string[];
  locations: Array<{
    state: string;
    city: string;
  }>;
};

export type UpdateUnitPayload = {
  name: string;
  active: boolean;
};

export type UnitListResponse = {
  items: Unit[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};