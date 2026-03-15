export type UserLevel = "admin" | "manager" | "user";

export type UserItem = {
  id: string;
  name: string;
  city: string;
  email: string;
  phone: string;
  active: boolean;
  level: UserLevel;
  accessCode: number;
};

export type PublicUserItem = Omit<UserItem, "accessCode">;