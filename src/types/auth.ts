import type { UserLevel } from "@/types/users";

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  city: string;
  phone: string;
  active: boolean;
  level: UserLevel;
};

export type AuthSession = {
  expiresAt: string | null;
};

export type RequestAccessInput = {
  email: string;
};

export type RequestAccessCode =
  | "ACCESS_CODE_SENT"
  | "USER_NOT_FOUND"
  | "USER_INACTIVE";

export type RequestAccessResponse = {
  success: boolean;
  message: string;
  code?: RequestAccessCode;
};

export type ValidateAccessInput = {
  email: string;
  code: string;
};

export type ValidateAccessCode =
  | "ACCESS_GRANTED"
  | "INVALID_CODE"
  | "CODE_EXPIRED"
  | "USER_NOT_FOUND"
  | "USER_INACTIVE";

export type ValidateAccessResponse = {
  success?: boolean;
  message?: string;
  code?: ValidateAccessCode;
  user?: SafeUser;
  session?: AuthSession;
  data?: {
    user: SafeUser;
    session?: AuthSession;
  };
};

export type RegisterRequestInput = {
  name: string;
  state: string;
  city: string;
  email: string;
  phone: string;
};

export type RegisterRequestCode =
  | "USER_ALREADY_EXISTS"
  | "REGISTRATION_REQUEST_CREATED";

export type RegisterRequestResponse = {
  success: boolean;
  message: string;
  code?: RegisterRequestCode;
};