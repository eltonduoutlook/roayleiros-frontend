import type { CoordinatorOption } from "./users";

export type UnitCoordinatorItem = {
  id: string;
  unitId: string;
  userId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  user: CoordinatorOption;
};