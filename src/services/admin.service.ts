import { ApproveRegisterRequestPayload, GetRegisterRequestsParams, PaginatedRegisterRequestsResponse, RejectRegisterRequestPayload } from "@/types/admin";


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