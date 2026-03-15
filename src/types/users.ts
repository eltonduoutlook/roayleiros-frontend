export type UserLevel = "admin" | "manager" | "user";

export type UserItem = {
  id: string;
  name: string;
  city: string;
  email: string;
  phone: string;
  active: boolean;
  level: UserLevel;
  accessCode?: number | null;
};

export type PublicUserItem = Omit<UserItem, "accessCode">;

export type RegisterRequestInput = {
    name: string;
    city: string;
    email: string;
    phone: string;
};

export type RegisterRequestResponse = {
    success: boolean;
    message: string;
};