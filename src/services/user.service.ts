import type { EligibleCoordinator } from "@/types/users";
import { api } from "./api";

type ListEligibleCoordinatorsParams = {
    search?: string;
    page?: number;
    pageSize?: number;
};

export const userService = {
    async listEligibleCoordinators(
        params: ListEligibleCoordinatorsParams = {},
    ): Promise<EligibleCoordinator[]> {
        const searchParams = new URLSearchParams();

        if (params.search?.trim()) {
            searchParams.set("search", params.search.trim());
        }

        if (params.page) {
            searchParams.set("page", String(params.page));
        }

        if (params.pageSize) {
            searchParams.set("pageSize", String(params.pageSize));
        }

        const query = searchParams.toString();

        return api.get<EligibleCoordinator[]>(
            `/admin/units/coordinators/users${query ? `?${query}` : ""}`,
        );
    },
};