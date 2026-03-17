export type UserLevel = "ADMIN" | "COORDINATOR" | "MEMBER";
export type RegisterRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AdminRegisterRequestItem {
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
}

export interface ApproveRegisterRequestPayload {
  approvedLevel: UserLevel;
  name?: string;
  city?: string;
  email?: string;
  phone?: string;
}

export interface RejectRegisterRequestPayload {
  rejectionReason: string;
}

export const adminService = {
  async getRegisterRequests(): Promise<AdminRegisterRequestItem[]> {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/register-requests`,
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
    return result.data ?? [];
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
      } catch {}

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
      } catch {}

      throw new Error(message);
    }

    return response.json();
  },
};