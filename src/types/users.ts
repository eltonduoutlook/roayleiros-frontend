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
  state?: string | null;
  active: boolean;
  level: Extract<UserLevel, "ADMIN" | "COORDINATOR">;
};

export type CoordinatorOption = EligibleCoordinator;