import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Pause, Play, Plus, X } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/common/DataTable";
import { unitService } from "@/services/unit.service";
import {
    ibgeService,
    type CityOption,
    type StateOption,
} from "@/services/ibge.service";
import type { Unit, UpdateUnitPayload } from "@/types/unit";
import type { UnitCoordinatorItem } from "@/types/unitCoordinator";
import type { EligibleCoordinator } from "@/types/users";
import { UnitCoordinatorsField } from "@/components/units/UnitCoordinatorsField";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FullScreenLoader } from "../common/FullScreenLoader";
import { Badge } from "../ui/badge";
import { StatusBadge } from "../common/status/StatusBadge";
import { StatusBooleanBadge } from "../common/status/BooleanStatusBadge";
import { registerRequestStatusConfig } from "../common/status/statusConfigs";

type UnitEditModalProps = {
    open: boolean;
    unitId: string | null;
    onClose: () => void;
    onSaved?: () => Promise<void> | void;
};

type LocationDraft = {
    state: string;
    city: string;
};

type CoordinatorRow = {
    linkId: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    active: boolean;
    level: EligibleCoordinator["level"];
};

type LocationRow = {
    id: string;
    state: string;
    city: string;
    active: boolean;
    isBase: boolean;
};

function normalizeText(value: string) {
    return value.trim().replace(/\s+/g, " ");
}

function normalizeCompare(value?: string | null) {
    return (value ?? "").trim().toLowerCase();
}

function isValidCoordinatorItem(
    item: UnitCoordinatorItem | null | undefined,
): item is UnitCoordinatorItem {
    return Boolean(item?.id && item?.user?.id);
}

function mapCoordinatorToEligible(item: UnitCoordinatorItem): EligibleCoordinator {
    return {
        id: item.user.id,
        name: item.user.name ?? "",
        email: item.user.email ?? "",
        phone: item.user.phone ?? "",
        city: item.user.city ?? "",
        active: item.active,
        level: item.user.level,
    };
}

function mapCoordinatorToRow(item: UnitCoordinatorItem): CoordinatorRow {
    return {
        linkId: item.id,
        userId: item.user.id,
        name: item.user.name ?? "",
        email: item.user.email ?? "",
        phone: item.user.phone ?? "",
        city: item.user.city ?? "",
        active: item.active,
        level: item.user.level,
    };
}



function upsertLocationList(
    list: Unit["locations"] = [],
    item: Unit["locations"][number],
) {
    if (!item?.id) return list ?? [];

    const safeList = (list ?? []).filter((current) => Boolean(current?.id));

    const existingIndex = safeList.findIndex((current) => current.id === item.id);

    if (existingIndex >= 0) {
        return safeList.map((current) => (current.id === item.id ? item : current));
    }

    const itemState = normalizeCompare(item.state);
    const itemCity = normalizeCompare(item.city);

    const samePlaceIndex = safeList.findIndex((current) => {
        const currentState = normalizeCompare(current.state);
        const currentCity = normalizeCompare(current.city);

        return currentState === itemState && currentCity === itemCity;
    });

    if (samePlaceIndex >= 0) {
        return safeList.map((current, index) => (index === samePlaceIndex ? item : current));
    }

    return [...safeList, item];
}

function upsertCoordinatorList(
    list: Unit["coordinators"] = [],
    item: UnitCoordinatorItem | null | undefined,
) {
    const safeList = (list ?? []).filter(isValidCoordinatorItem);

    if (!isValidCoordinatorItem(item)) {
        return safeList;
    }

    const existingIndex = safeList.findIndex((current) => current.id === item.id);

    if (existingIndex >= 0) {
        return safeList.map((current) => (current.id === item.id ? item : current));
    }

    const sameUserIndex = safeList.findIndex(
        (current) => current.user.id === item.user.id,
    );

    if (sameUserIndex >= 0) {
        return safeList.map((current, index) => (index === sameUserIndex ? item : current));
    }

    return [...safeList, item];
}

function dedupeLocationsByPlace(items: Unit["locations"] = []) {
    const map = new Map<string, Unit["locations"][number]>();

    for (const item of items ?? []) {
        if (!item?.id) continue;

        const key = `${normalizeCompare(item.state)}::${normalizeCompare(item.city)}`;
        const existing = map.get(key);

        if (!existing) {
            map.set(key, item);
            continue;
        }

        if (item.isBase && !existing.isBase) {
            map.set(key, item);
            continue;
        }

        if (item.active && !existing.active) {
            map.set(key, item);
            continue;
        }

        const existingDate = new Date(existing.updatedAt).getTime();
        const currentDate = new Date(item.updatedAt).getTime();

        if (currentDate >= existingDate) {
            map.set(key, item);
        }
    }

    return Array.from(map.values());
}

function dedupeCoordinatorsByUser(items: Unit["coordinators"] = []) {
    const map = new Map<string, UnitCoordinatorItem>();

    for (const item of items ?? []) {
        if (!isValidCoordinatorItem(item)) continue;

        const key = item.user.id;
        const existing = map.get(key);

        if (!existing) {
            map.set(key, item);
            continue;
        }

        const existingDate = new Date(existing.updatedAt).getTime();
        const currentDate = new Date(item.updatedAt).getTime();

        if (currentDate >= existingDate) {
            map.set(key, item);
        }
    }

    return Array.from(map.values());
}

export function UnitEditModal({
    open,
    unitId,
    onClose,
    onSaved,
}: UnitEditModalProps) {
    const [unit, setUnit] = useState<Unit | null>(null);

    const [form, setForm] = useState<UpdateUnitPayload>({
        name: "",
        active: true,
    });

    const [locationDraft, setLocationDraft] = useState<LocationDraft>({
        state: "",
        city: "",
    });

    const [states, setStates] = useState<StateOption[]>([]);
    const [cities, setCities] = useState<CityOption[]>([]);

    const [loading, setLoading] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [savingBase, setSavingBase] = useState(false);
    const [savingLocation, setSavingLocation] = useState(false);
    const [savingCoordinatorAction, setSavingCoordinatorAction] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [coordinatorIds, setCoordinatorIds] = useState<string[]>([]);
    const [selectedCoordinators, setSelectedCoordinators] = useState<EligibleCoordinator[]>([]);

    const previousCoordinatorIdsRef = useRef<string[]>([]);

    const isBusy = loading || savingBase || savingLocation || savingCoordinatorAction;
    const isLocationBusy = loading || loadingCities || savingLocation;

    const showActionOverlay =
        savingBase || savingLocation || savingCoordinatorAction;



    async function loadUnit() {
        if (!open || !unitId) return;

        try {
            setLoading(true);
            setError(null);

            const [unitData, statesData] = await Promise.all([
                unitService.getUnitById(unitId),
                ibgeService.getStates(),
            ]);

            const normalizedUnit: Unit = {
                ...unitData,
                locations: dedupeLocationsByPlace(unitData.locations ?? []),
                coordinators: dedupeCoordinatorsByUser(unitData.coordinators ?? []),
            };

            setUnit(normalizedUnit);

            setForm({
                name: normalizedUnit.name ?? "",
                active: normalizedUnit.active,
            });

            setStates(statesData ?? []);

            const activeCoordinators = (normalizedUnit.coordinators ?? []).filter(
                (item) => item.active,
            );

            const activeIds = activeCoordinators.map((item) => item.user.id);
            const activeSelected = activeCoordinators.map(mapCoordinatorToEligible);

            setCoordinatorIds(activeIds);
            setSelectedCoordinators(activeSelected);
            previousCoordinatorIdsRef.current = activeIds;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Não foi possível carregar a unidade.",
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadUnit();
    }, [open, unitId]);

    useEffect(() => {
        if (!open) {
            setUnit(null);
            setForm({
                name: "",
                active: true,
            });
            setLocationDraft({
                state: "",
                city: "",
            });
            setStates([]);
            setCities([]);
            setCoordinatorIds([]);
            setSelectedCoordinators([]);
            previousCoordinatorIdsRef.current = [];
            setError(null);
            setLoading(false);
            setLoadingCities(false);
            setSavingBase(false);
            setSavingLocation(false);
            setSavingCoordinatorAction(false);
        }
    }, [open]);

    useEffect(() => {
        async function loadCities() {
            if (!locationDraft.state) {
                setCities([]);
                return;
            }

            try {
                setLoadingCities(true);
                const data = await ibgeService.getCitiesByState(locationDraft.state);
                setCities(data ?? []);
            } catch {
                setCities([]);
            } finally {
                setLoadingCities(false);
            }
        }

        void loadCities();
    }, [locationDraft.state]);

    const allLocationRows = useMemo<LocationRow[]>(() => {
        const deduped = dedupeLocationsByPlace(unit?.locations ?? []);

        return deduped.map((item) => ({
            id: item.id,
            state: item.state ?? "",
            city: item.city ?? "",
            active: item.active,
            isBase: item.isBase,
        }));
    }, [unit?.locations]);

    const allCoordinatorRows = useMemo<CoordinatorRow[]>(() => {
        const deduped = dedupeCoordinatorsByUser(unit?.coordinators ?? []);
        return deduped.map(mapCoordinatorToRow);
    }, [unit?.coordinators]);

    const locationTableKey = useMemo(
        () => allLocationRows
            .map((item) => `${item.id}:${item.active}:${item.isBase}`)
            .join("|"),
        [allLocationRows],
    );

    const coordinatorTableKey = useMemo(
        () => allCoordinatorRows.map((item) => `${item.linkId}:${item.active}`).join("|"),
        [allCoordinatorRows],
    );

    const coordinatorFieldKey = useMemo(
        () => [...coordinatorIds].sort().join("|"),
        [coordinatorIds],
    );

    async function handleSaveBase() {
        if (!unit) return;

        const payload: UpdateUnitPayload = {
            name: normalizeText(form.name),
            active: form.active,
        };

        if (!payload.name) {
            setError("Informe o nome da unidade.");
            return;
        }

        try {
            setSavingBase(true);
            setError(null);

            const updated = await unitService.updateUnit(unit.id, payload);

            setUnit((prev) =>
                prev
                    ? {
                        ...prev,
                        name: updated.name,
                        active: updated.active,
                        updatedAt: updated.updatedAt,
                    }
                    : prev,
            );

            await onSaved?.();
            onClose();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Não foi possível salvar a unidade.",
            );
        } finally {
            setSavingBase(false);
        }
    }

    async function handleAddLocation() {
        if (!unit) return;

        const payload = {
            state: normalizeText(locationDraft.state),
            city: normalizeText(locationDraft.city),
        };

        if (!payload.state || !payload.city) {
            setError("Selecione um estado e uma cidade.");
            return;
        }

        try {
            setSavingLocation(true);
            setError(null);

            const response = await unitService.addUnitLocation(unit.id, payload);

            setUnit((prev) =>
                prev
                    ? {
                        ...prev,
                        locations: upsertLocationList(prev.locations ?? [], response.item),
                    }
                    : prev,
            );

            setLocationDraft({ state: "", city: "" });
            setCities([]);

            await onSaved?.();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Não foi possível adicionar a cidade.",
            );
        } finally {
            setSavingLocation(false);
        }
    }

    async function handleDeactivateLocation(locationId: string) {
        if (!unit) return;

        try {
            setSavingLocation(true);
            setError(null);

            const response = await unitService.removeUnitLocation(unit.id, locationId);

            setUnit((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    locations: (prev.locations ?? []).map((item) =>
                        item.id === locationId ? response.item : item,
                    ),
                };
            });

            await onSaved?.();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Não foi possível desativar a cidade.",
            );
        } finally {
            setSavingLocation(false);
        }
    }

    async function handleReactivateLocation(row: LocationRow) {
        if (!unit) return;

        try {
            setSavingLocation(true);
            setError(null);

            const response = await unitService.addUnitLocation(unit.id, {
                state: row.state,
                city: row.city,
            });

            setUnit((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    locations: upsertLocationList(prev.locations ?? [], response.item),
                };
            });

            await onSaved?.();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Não foi possível reativar a cidade.",
            );
        } finally {
            setSavingLocation(false);
        }
    }

    async function handleSetBaseLocation(locationId: string) {
        if (!unit) return;

        try {
            setSavingLocation(true);
            setError(null);

            const response = await unitService.setBaseLocation(unit.id, locationId);

            setUnit((prev) => {
                if (!prev) return prev;

                const updatedLocations = (prev.locations ?? [])
                    .map((item) => ({
                        ...item,
                        isBase: item.id === response.item.id,
                    }))
                    .sort((a, b) => {
                        if (a.isBase && !b.isBase) return -1;
                        if (!a.isBase && b.isBase) return 1;

                        const byState = (a.state ?? "").localeCompare(b.state ?? "", "pt-BR");
                        if (byState !== 0) return byState;

                        return (a.city ?? "").localeCompare(b.city ?? "", "pt-BR");
                    });

                return {
                    ...prev,
                    locations: updatedLocations,
                };
            });

            await onSaved?.();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível definir a cidade base.",
            );
        } finally {
            setSavingLocation(false);
        }
    }

    function syncCoordinatorStatesFromList(items: UnitCoordinatorItem[]) {
        const deduped = dedupeCoordinatorsByUser(items);
        const activeItems = deduped.filter((item) => item.active);

        const nextIds = activeItems.map((item) => item.user.id);
        const nextSelected = activeItems.map(mapCoordinatorToEligible);

        setCoordinatorIds(nextIds);
        setSelectedCoordinators(nextSelected);
        previousCoordinatorIdsRef.current = nextIds;
    }

    async function handleAddCoordinator(userId: string) {
        if (!unit) return;

        try {
            setSavingCoordinatorAction(true);
            setError(null);

            const response = await unitService.addUnitCoordinator(unit.id, { userId });

            setUnit((prev) => {
                if (!prev) return prev;

                const nextCoordinators = upsertCoordinatorList(
                    prev.coordinators ?? [],
                    response,
                );

                syncCoordinatorStatesFromList(nextCoordinators);

                return {
                    ...prev,
                    coordinators: nextCoordinators,
                };
            });

            await onSaved?.();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível adicionar o coordenador.",
            );
        } finally {
            setSavingCoordinatorAction(false);
        }
    }

    async function handleDeactivateCoordinator(userId: string) {
        if (!unit) return;

        try {
            setSavingCoordinatorAction(true);
            setError(null);

            const response = await unitService.inactivateUnitCoordinator(unit.id, userId);

            setUnit((prev) => {
                if (!prev) return prev;

                const nextCoordinators = upsertCoordinatorList(
                    prev.coordinators ?? [],
                    response,
                );

                syncCoordinatorStatesFromList(nextCoordinators);

                return {
                    ...prev,
                    coordinators: nextCoordinators,
                };
            });

            await onSaved?.();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível desativar o coordenador.",
            );
        } finally {
            setSavingCoordinatorAction(false);
        }
    }

    async function handleReactivateCoordinator(userId: string) {
        if (!unit) return;

        try {
            setSavingCoordinatorAction(true);
            setError(null);

            const response = await unitService.addUnitCoordinator(unit.id, { userId });

            setUnit((prev) => {
                if (!prev) return prev;

                const nextCoordinators = upsertCoordinatorList(
                    prev.coordinators ?? [],
                    response,
                );

                syncCoordinatorStatesFromList(nextCoordinators);

                return {
                    ...prev,
                    coordinators: nextCoordinators,
                };
            });

            await onSaved?.();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível reativar o coordenador.",
            );
        } finally {
            setSavingCoordinatorAction(false);
        }
    }

    async function handleCoordinatorIdsChange(nextIds: string[]) {
        if (!unit || savingCoordinatorAction) return;

        const previousIds = previousCoordinatorIdsRef.current;
        const addedId = nextIds.find((id) => !previousIds.includes(id));

        setCoordinatorIds(nextIds);
        previousCoordinatorIdsRef.current = nextIds;

        if (!addedId) {
            return;
        }

        await handleAddCoordinator(addedId);
    }

    const locationColumns: ColumnDef<LocationRow>[] = [
        {
            id: "location",
            header: "Cidades",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-800">
                        {row.original.city}
                    </span>
                    <span className="text-xs text-slate-500">
                        {row.original.state}
                    </span>
                </div>
            ),
        },
        {
            id: "type",
            header: "Tipo",
            cell: ({ row }) =>
                row.original.isBase ? (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        Base
                    </Badge>
                ) : (
                    <Badge variant="secondary">
                        Afiliada
                    </Badge>
                ),
        },
        {
            accessorKey: "active",
            header: "Status",
            cell: ({ row }) => (
                <StatusBooleanBadge value={row.original.active} />
            ),
        },
        {
            id: "actions",
            header: "Ação",
            cell: ({ row }) => {
                const item = row.original;

                return (
                    <div className="flex flex-wrap gap-2">
                        {item.active && !item.isBase ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="h-8 gap-2 border-green-300 text-green-600 hover:bg-green-50"
                                onClick={() => void handleDeactivateLocation(item.id)}
                                disabled={savingLocation}
                            >
                                <Pause className="h-4 w-4" />
                                Desativar
                            </Button>
                        ) : null}

                        {!item.active ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="h-8 gap-2 border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => void handleReactivateLocation(item)}
                                disabled={savingLocation}
                            >
                                <Play className="h-4 w-4" />
                                Ativar
                            </Button>
                        ) : null}

                        {item.active && !item.isBase ? (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                                onClick={() => void handleSetBaseLocation(item.id)}
                                disabled={savingLocation}
                                title="Tornar unidade base"
                            >
                                Tornar unidade base
                            </Button>
                        ) : null}
                    </div>
                );
            },
        },
    ];

    const coordinatorColumns: ColumnDef<CoordinatorRow>[] = [
        {
            accessorKey: "name",
            header: "Nome",
        },
        {
            accessorKey: "email",
            header: "E-mail",
        },
        {
            accessorKey: "phone",
            header: "Telefone",
        },
        {
            accessorKey: "city",
            header: "Cidade",
        },
        {
            accessorKey: "level",
            header: "Perfil",
        },
        {
            accessorKey: "active",
            header: "Status",
            cell: ({ row }) => (
                <StatusBooleanBadge value={row.original.active} />
            ),
        },
        {
            id: "actions",
            header: "Ação",
            cell: ({ row }) => {
                const item = row.original;
                const isActive = item.active;

                return (
                    <Button
                        type="button"
                        variant="outline"
                        className={`h-8 gap-2 ${isActive
                            ? "border-green-300 text-green-600 hover:bg-green-50"
                            : "border-red-300 text-red-600 hover:bg-red-50"
                            }`}
                        onClick={() =>
                            isActive
                                ? void handleDeactivateCoordinator(item.userId)
                                : void handleReactivateCoordinator(item.userId)
                        }
                        disabled={savingCoordinatorAction}
                    >
                        {isActive ? (
                            <>
                                <Pause className="h-4 w-4" />
                                Desativar
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4" />
                                Ativar
                            </>
                        )}
                    </Button>
                );
            },
        },
    ];

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="max-h-[95vh] w-[96vw] overflow-y-auto rounded-2xl bg-white shadow-xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Editar unidade</h2>
                        <p className="text-sm text-slate-600">
                            Atualize os dados básicos, cidades e coordenadores da unidade.
                        </p>
                    </div>

                    <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="relative space-y-6 p-6">
                    {showActionOverlay && <FullScreenLoader text="Processando..." />}

                    {loading ? (
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            Carregando unidade...
                        </div>
                    ) : !unit ? (
                        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            Unidade não encontrada.
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div className="rounded-xl border border-slate-200 p-5">
                                <div className="mb-4 text-sm font-medium text-slate-700">
                                    Dados básicos
                                </div>

                                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
                                    <div className="space-y-2">
                                        <Label htmlFor="unit-name">Nome da unidade</Label>
                                        <Input
                                            id="unit-name"
                                            value={form.name}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            disabled={savingBase}
                                            placeholder="Digite o nome da unidade"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select
                                            value={String(form.active)}
                                            onValueChange={(value) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    active: value === "true",
                                                }))
                                            }
                                            disabled={savingBase}
                                        >
                                            <SelectTrigger className="h-10 w-full">
                                                <SelectValue placeholder="Selecione o status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Ativa</SelectItem>
                                                <SelectItem value="false">Inativa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                                <div className="rounded-xl border border-slate-200 p-5">
                                    <div className="mb-4 text-sm font-medium text-slate-700">
                                        Cidades da unidade
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[180px_minmax(0,1fr)_180px]">
                                        <div className="space-y-2">
                                            <Label>Estado</Label>
                                            <Select
                                                value={locationDraft.state}
                                                onValueChange={(value) =>
                                                    setLocationDraft((prev) => ({
                                                        ...prev,
                                                        state: value,
                                                        city: "",
                                                    }))
                                                }
                                                disabled={isLocationBusy}
                                            >
                                                <SelectTrigger className="h-10 w-full">
                                                    <SelectValue placeholder="Selecione um estado" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {states.map((state) => (
                                                        <SelectItem key={state.id} value={state.sigla}>
                                                            {state.nome} ({state.sigla})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Cidade</Label>
                                            <Select
                                                value={locationDraft.city}
                                                onValueChange={(value) =>
                                                    setLocationDraft((prev) => ({
                                                        ...prev,
                                                        city: value,
                                                    }))
                                                }
                                                disabled={
                                                    isLocationBusy ||
                                                    !locationDraft.state ||
                                                    loadingCities
                                                }
                                            >
                                                <SelectTrigger className="h-10 w-full">
                                                    <SelectValue
                                                        placeholder={
                                                            !locationDraft.state
                                                                ? "Selecione um estado primeiro"
                                                                : loadingCities
                                                                    ? "Carregando cidades..."
                                                                    : "Selecione uma cidade"
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {cities.map((city) => (
                                                        <SelectItem key={city.id} value={city.nome}>
                                                            {city.nome}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-end">
                                            <Button
                                                type="button"
                                                onClick={() => void handleAddLocation()}
                                                disabled={
                                                    isLocationBusy ||
                                                    !locationDraft.state ||
                                                    !locationDraft.city
                                                }
                                                className="h-10 w-full gap-2 whitespace-nowrap"
                                            >
                                                {savingLocation ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Plus className="h-4 w-4" />
                                                )}
                                                Adicionar cidade
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        <DataTable
                                            key={locationTableKey}
                                            columns={locationColumns}
                                            data={allLocationRows}
                                            emptyMessage="Nenhuma cidade encontrada."
                                            initialPageSize={5}
                                            pageSizeOptions={[5, 10]}
                                        />
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-200 p-5">
                                    <UnitCoordinatorsField
                                        key={coordinatorFieldKey}
                                        value={coordinatorIds}
                                        onChange={(ids) => {
                                            void handleCoordinatorIdsChange(ids);
                                        }}
                                        selectedCoordinators={selectedCoordinators}
                                        onSelectedCoordinatorsChange={(items) => {
                                            setSelectedCoordinators(items);
                                        }}
                                        disabled={savingCoordinatorAction}
                                    />

                                    <div className="mt-5">
                                        <DataTable
                                            key={coordinatorTableKey}
                                            columns={coordinatorColumns}
                                            data={allCoordinatorRows}
                                            emptyMessage="Nenhum coordenador encontrado."
                                            initialPageSize={5}
                                            pageSizeOptions={[5, 10]}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isBusy}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type="button"
                                    onClick={() => void handleSaveBase()}
                                    disabled={isBusy}
                                >
                                    {savingBase ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        "Salvar"
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}