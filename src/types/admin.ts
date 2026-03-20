export type UserLevel = "ADMIN" | "COORDINATOR" | "MEMBER";
export type RegisterRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AdminRegisterRequestItem {
  id: string;
  name: string;
  state: string;
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
}

export interface RegisterRequestFilters {
  name?: string;
  state?: string;
  city?: string;
  phone?: string;
  status?: RegisterRequestStatus | "";
  createdFrom?: string;
  createdTo?: string;
}

export type GetRegisterRequestsParams = RegisterRequestFilters & {
  page?: number;
  pageSize?: number;
};

export interface ApproveRegisterRequestPayload {
  approvedLevel: UserLevel;
  name?: string;
  state?: string;
  city?: string;
  email?: string;
  phone?: string;
}

export type RegisterRequestRow = {
  id: string;
  name: string;
  state: string;
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

export type PaginatedRegisterRequestsResponse = {
  data: RegisterRequestRow[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export interface RejectRegisterRequestPayload {
  rejectionReason: string;
}