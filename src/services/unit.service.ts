import type {
    CreateUnitPayload,
    Unit,
    UnitListResponse,
    UnitLocation,
    UpdateUnitPayload,
} from "@/types/unit";
import type { UnitCoordinatorItem } from "@/types/unitCoordinator";
import type { EligibleCoordinator } from "@/types/users";
import { api } from "./api";

type ListParams = {
    page?: number;
    pageSize?: number;
    name?: string;
    state?: string;
    city?: string;
};

type CoordinatorUsersParams = {
    page?: number;
    pageSize?: number;
    search?: string;
};

type CoordinatorUsersResponse = {
    items: EligibleCoordinator[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};

type AddUnitCoordinatorPayload = {
    userId: string;
};

type AddUnitLocationPayload = {
    state: string;
    city: string;
};

type RemoveUnitLocationResponse = {
    message: string;
    item: UnitLocation;
};

type SetBaseUnitLocationResponse = {
    message: string;
    item: UnitLocation;
};

type UnitCoordinatorResponse = {
    message: string;
    item: UnitCoordinatorItem;
};

type AddUnitLocationResponse = {
    message: string;
    item: UnitLocation;
};

export const unitService = {
    async createUnit(payload: CreateUnitPayload): Promise<Unit> {
        return api.post<Unit>("/admin/units", payload);
    },

    async listUnits(params: ListParams = {}): Promise<UnitListResponse> {
        return api.get<UnitListResponse>("/admin/units", {
            page: params.page,
            pageSize: params.pageSize,
            name: params.name?.trim() || undefined,
            state: params.state?.trim() || undefined,
            city: params.city?.trim() || undefined,
        });
    },

    async getUnitById(id: string): Promise<Unit> {
        return api.get<Unit>(`/admin/units/${id}`);
    },

    async updateUnit(id: string, payload: UpdateUnitPayload): Promise<Unit> {
        return api.put<Unit>(`/admin/units/${id}`, payload);
    },

    async activateUnit(id: string): Promise<Unit> {
        return api.patch<Unit>(`/admin/units/${id}/activate`);
    },

    async deactivateUnit(id: string): Promise<Unit> {
        return api.patch<Unit>(`/admin/units/${id}/deactivate`);
    },

    async listCoordinatorUsers(
        params: CoordinatorUsersParams = {},
    ): Promise<CoordinatorUsersResponse> {
        return api.get<CoordinatorUsersResponse>("/admin/units/coordinators/users", {
            page: params.page,
            pageSize: params.pageSize,
            search: params.search?.trim() || undefined,
        });
    },

    async listUnitCoordinators(unitId: string): Promise<UnitCoordinatorItem[]> {
        return api.get<UnitCoordinatorItem[]>(
            `/admin/units/${unitId}/coordinators`,
        );
    },

    async addUnitCoordinator(
        unitId: string,
        payload: AddUnitCoordinatorPayload,
    ): Promise<UnitCoordinatorItem> {
        const response = await api.post<UnitCoordinatorResponse>(
            `/admin/units/${unitId}/coordinators`,
            payload,
        );

        return response.item;
    },

    async inactivateUnitCoordinator(
        unitId: string,
        userId: string,
    ): Promise<UnitCoordinatorItem> {
        const response = await api.patch<UnitCoordinatorResponse>(
            `/admin/units/${unitId}/coordinators/${userId}/inactivate`,
        );

        return response.item;
    },

    async removeUnitCoordinator(
        unitId: string,
        userId: string,
    ): Promise<UnitCoordinatorResponse> {
        return api.delete<UnitCoordinatorResponse>(
            `/admin/units/${unitId}/coordinators/${userId}`,
        );
    },

    async addUnitLocation(
        unitId: string,
        payload: AddUnitLocationPayload,
    ): Promise<AddUnitLocationResponse> {
        return api.post<AddUnitLocationResponse>(
            `/admin/units/${unitId}/locations`,
            payload,
        );
    },

    async removeUnitLocation(
        unitId: string,
        locationId: string,
    ): Promise<RemoveUnitLocationResponse> {
        return api.patch<RemoveUnitLocationResponse>(
            `/admin/units/${unitId}/locations/${locationId}/inactivate`,
        );
    },

    async setBaseLocation(
        unitId: string,
        locationId: string,
    ): Promise<SetBaseUnitLocationResponse> {
        return api.patch<SetBaseUnitLocationResponse>(
            `/admin/units/${unitId}/locations/${locationId}/base`,
        );
    },
};