import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { unitService } from "@/services/unit.service";
import {
    ibgeService,
    type CityOption,
    type StateOption,
} from "@/services/ibge.service";
import type { Unit } from "@/types/unit";
import {
    type AdminUnitRow,
    buildAdminUnitsColumns,
} from "@/features/admin/AdminUnitsColumns";
import { UnitEditModal } from "@/components/units/UnitEditModal";

type Filters = {
    name: string;
    state: string;
    city: string;
};

type AppliedFilters = Filters;

type UnitsListResponse = {
    items: Unit[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};

const DEFAULT_FILTERS: Filters = {
    name: "",
    state: "",
    city: "",
};

export default function AdminUnitsPage() {
    const navigate = useNavigate();

    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const [appliedFilters, setAppliedFilters] =
        useState<AppliedFilters>(DEFAULT_FILTERS);

    const [items, setItems] = useState<Unit[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);

    const [states, setStates] = useState<StateOption[]>([]);
    const [cities, setCities] = useState<CityOption[]>([]);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    const loadUnits = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = (await unitService.listUnits({
                page,
                pageSize,
                name: appliedFilters.name || undefined,
                state: appliedFilters.state || undefined,
                city: appliedFilters.city || undefined,
            })) as UnitsListResponse;

            setItems(response.items ?? []);
            setTotal(response.total ?? 0);
            setTotalPages(response.totalPages ?? 1);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar as unidades."
            );
            setItems([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, appliedFilters]);

    useEffect(() => {
        void loadUnits();
    }, [loadUnits]);

    useEffect(() => {
        async function loadStates() {
            try {
                setLoadingStates(true);
                const response = await ibgeService.getStates();
                setStates(response ?? []);
            } catch {
                setStates([]);
            } finally {
                setLoadingStates(false);
            }
        }

        void loadStates();
    }, []);

    useEffect(() => {
        async function loadCitiesByState() {
            if (!filters.state) {
                setCities([]);
                return;
            }

            try {
                setLoadingCities(true);
                const response = await ibgeService.getCitiesByState(filters.state);
                setCities(response ?? []);
            } catch {
                setCities([]);
            } finally {
                setLoadingCities(false);
            }
        }

        void loadCitiesByState();
    }, [filters.state]);

    function handleFilterSubmit(e?: React.FormEvent<HTMLFormElement>) {
        e?.preventDefault();
        setPage(1);
        setAppliedFilters({
            name: filters.name.trim(),
            state: filters.state.trim(),
            city: filters.city.trim(),
        });
    }

    function handleClearFilters() {
        setFilters(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
        setCities([]);
        setPage(1);
        setPageSize(10);
    }

    function handleOpenEdit(unitId: string) {
        setSelectedUnitId(unitId);
        setEditModalOpen(true);
    }

    function handleCloseEdit() {
        setEditModalOpen(false);
        setSelectedUnitId(null);
    }

    async function handleRefreshAfterEdit() {
        await loadUnits();
    }

    const rows = useMemo<AdminUnitRow[]>(() => {
        return items.map((unit) => {
            const activeLocations = (unit.locations ?? []).filter((item) => item.active);
            const firstLocation = activeLocations[0];

            return {
                id: unit.id,
                name: unit.name,
                active: unit.active,
                state: firstLocation?.state ?? "-",
                city: firstLocation?.city ?? "-",
                locationsCount: activeLocations.length,
                coordinatorsCount: (unit.coordinators ?? []).filter((item) => item.active)
                    .length,
                updatedAt: unit.updatedAt,
            };
        });
    }, [items]);

    const columns = useMemo(
        () =>
            buildAdminUnitsColumns({
                onEdit: handleOpenEdit,
            }),
        []
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Unidades</h1>
                <p className="text-sm text-slate-600">
                    Consulte, filtre e edite as unidades cadastradas.
                </p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleFilterSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Nome
                                </label>
                                <Input
                                    value={filters.name}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Buscar por nome"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Estado
                                </label>
                                <Select
                                    value={filters.state || undefined}
                                    onValueChange={(value) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            state: value,
                                            city: "",
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue
                                            placeholder={
                                                loadingStates
                                                    ? "Carregando estados..."
                                                    : "Selecione o estado"
                                            }
                                        />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {states.map((state) => (
                                            <SelectItem
                                                key={state.sigla}
                                                value={state.sigla}
                                            >
                                                {state.sigla} - {state.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Cidade
                                </label>
                                <Select
                                    value={filters.city || undefined}
                                    onValueChange={(value) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            city: value,
                                        }))
                                    }
                                    disabled={!filters.state || loadingCities}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue
                                            placeholder={
                                                !filters.state
                                                    ? "Selecione o estado primeiro"
                                                    : loadingCities
                                                        ? "Carregando cidades..."
                                                        : "Selecione a cidade"
                                            }
                                        />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {cities.map((city) => (
                                            <SelectItem
                                                key={city.nome}
                                                value={city.nome}
                                            >
                                                {city.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                onClick={() => navigate("/admin/unidades/nova")}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Nova unidade
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClearFilters}
                                className="gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Limpar
                            </Button>

                            <Button type="submit" variant="outline" className="gap-2">
                                <Search className="h-4 w-4" />
                                Filtrar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="space-y-4 pt-6">
                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <DataTable
                        columns={columns}
                        data={rows}
                        emptyMessage={
                            loading
                                ? "Carregando unidades..."
                                : "Nenhuma unidade encontrada."
                        }
                        initialPageSize={pageSize}
                        pageSizeOptions={[10, 20, 30, 40, 50]}
                    />

                    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
                        <div className="text-sm text-slate-600">
                            Total de registros: <strong>{total}</strong>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600">
                                    Itens por página
                                </span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                                >
                                    {[10, 20, 30, 40, 50].map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="text-sm text-slate-600">
                                Página {page} de {Math.max(totalPages, 1)}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={loading || page <= 1}
                                >
                                    Anterior
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setPage((prev) =>
                                            Math.min(prev + 1, Math.max(totalPages, 1))
                                        )
                                    }
                                    disabled={loading || page >= totalPages}
                                >
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <UnitEditModal
                open={editModalOpen}
                unitId={selectedUnitId}
                onClose={handleCloseEdit}
                onSaved={handleRefreshAfterEdit}
            />
        </div>
    );
}