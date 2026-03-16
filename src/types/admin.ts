export type RegisterRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type UserLevel = "MEMBER" | "ADMIN";

export type AdminRegisterRequestItem = {
  id: string;
  name: string;
  city: string;
  email: string;
  phone: string;
  status: RegisterRequestStatus;
  approvedLevel: UserLevel | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  createdUserId: string | null;
  createdAt: string;
  updatedAt: string;
};