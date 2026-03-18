import type { EligibleCoordinator } from "@/types/users";
import { api } from "./api";

export const userService = {
    async listEligibleCoordinators(search: string): Promise<EligibleCoordinator[]> {
        const term = search.trim();

        if (!term) {
            return [];
        }

        const searchParams = new URLSearchParams({
            search: term,
        });

        return api.get<EligibleCoordinator[]>(
            `/users/eligible-coordinators?${searchParams.toString()}`,
        );
    },

    async searchEligibleCoordinators(search: string): Promise<EligibleCoordinator[]> {
        const query = new URLSearchParams({ search }).toString();
        return api.get<EligibleCoordinator[]>(`/users/eligible-coordinators?${query}`);
    }
};