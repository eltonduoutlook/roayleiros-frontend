export type UserLevel = "ADMIN" | "COORDINATOR" | "MEMBER";

export type UserSummary = {
  id: string;
  name: string;
  email: string;
  level: UserLevel;
};

export type EligibleCoordinator = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  level: Extract<UserLevel, "ADMIN" | "COORDINATOR">;
};

export type CoordinatorOption = EligibleCoordinator;

export type CoordinatorOptionsResponse = {
  data: CoordinatorOption[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};