import { api } from "@/services/api";
import type { AdminRegisterRequestItem } from "@/types/admin";

export const adminService = {
  async getRegisterRequests(): Promise<AdminRegisterRequestItem[]> {
    return api.get("/admin/register-requests");
  },
};