import type { Unit, UnitListResponse, UnitPayload } from "@/types/unit";
import type {
    UnitCoordinatorItem,
    UpdateUnitCoordinatorsPayload,
} from "@/types/unitCoordinator";
import { api } from "./api";

type ListParams = {
    page?: number;
    pageSize?: number;
    search?: string;
};

export const unitService = {
    async createUnit(payload: UnitPayload): Promise<Unit> {
        return api.post<Unit>("/admin/units", payload);
    },

    async listUnits(params: ListParams = {}): Promise<UnitListResponse> {
        return api.get<UnitListResponse>("/admin/units", {
            page: params.page,
            pageSize: params.pageSize,
            search: params.search?.trim() || undefined,
        });
    },

    async getUnitById(id: string): Promise<Unit> {
        return api.get<Unit>(`/admin/units/${id}`);
    },

    async updateUnit(id: string, payload: UnitPayload): Promise<Unit> {
        return api.put<Unit>(`/admin/units/${id}`, payload);
    },

    async getCoordinators(unitId: string): Promise<UnitCoordinatorItem[]> {
        return api.get<UnitCoordinatorItem[]>(`/units/${unitId}/coordinators`);
    },

    async updateCoordinators(
        unitId: string,
        payload: UpdateUnitCoordinatorsPayload,
    ): Promise<UnitCoordinatorItem[]> {
        return api.put<UnitCoordinatorItem[]>(
            `/units/${unitId}/coordinators`,
            payload,
        );
    },
};