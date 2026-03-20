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

function buildQueryParams(filters?: GetRegisterRequestsParams) {
  const params = new URLSearchParams();

  if (!filters) {
    return params;
  }

  if (filters.name?.trim()) {
    params.set("name", filters.name.trim());
  }

  if (filters.state?.trim()) {
    params.set("state", filters.state.trim());
  }

  if (filters.city?.trim()) {
    params.set("city", filters.city.trim());
  }

  if (filters.phone?.trim()) {
    params.set("phone", filters.phone.trim());
  }

  if (filters.status?.trim()) {
    params.set("status", filters.status.trim());
  }

  if (filters.createdFrom?.trim()) {
    params.set("createdFrom", filters.createdFrom.trim());
  }

  if (filters.createdTo?.trim()) {
    params.set("createdTo", filters.createdTo.trim());
  }

  if (typeof filters.page === "number" && filters.page > 0) {
    params.set("page", String(filters.page));
  }

  if (typeof filters.pageSize === "number" && filters.pageSize > 0) {
    params.set("pageSize", String(filters.pageSize));
  }

  return params;
}

export const adminService = {
  async getRegisterRequests(
    filters?: GetRegisterRequestsParams
  ): Promise<PaginatedRegisterRequestsResponse> {
    const params = buildQueryParams(filters);
    const queryString = params.toString();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/register-requests${queryString ? `?${queryString}` : ""
      }`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Não foi possível carregar as solicitações de cadastro.");
    }

    const result = await response.json();

    return {
      data: result.data ?? [],
      meta: {
        page: result.meta?.page ?? 1,
        pageSize: result.meta?.pageSize ?? 10,
        total: result.meta?.total ?? 0,
        totalPages: result.meta?.totalPages ?? 1,
      },
    };
  },

  async approveRegisterRequest(
    id: string,
    payload: ApproveRegisterRequestPayload
  ) {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/register-requests/${id}/approve`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      let message = "Não foi possível aprovar a solicitação.";

      try {
        const error = await response.json();
        message = error?.message ?? message;
      } catch { }

      throw new Error(message);
    }

    return response.json();
  },

  async rejectRegisterRequest(
    id: string,
    payload: RejectRegisterRequestPayload
  ) {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/register-requests/${id}/reject`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      let message = "Não foi possível rejeitar a solicitação.";

      try {
        const error = await response.json();
        message = error?.message ?? message;
      } catch { }

      throw new Error(message);
    }

    return response.json();
  },
};