import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { UnitCoordinatorsField } from "@/components/units/UnitCoordinatorsField";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { unitService } from "@/services/unit.service";
import {
    ibgeService,
    type CityOption,
    type StateOption,
} from "@/services/ibge.service";
import type { UnitPayload } from "@/types/unit";
import type { EligibleCoordinator } from "@/types/users";
import {
    buildUnitLocationsColumns,
    type UnitLocationRow,
} from "@/features/admin/UnitLocationsColumns";
import {
    buildSelectedUnitCoordinatorsColumns,
} from "@/features/admin/SelectedUnitCoordinatorsColumns";
import { Plus } from "lucide-react";

type UnitLocationPayload = {
    state: string;
    city: string;
};

export default function AdminUnitCreatePage() {
    const navigate = useNavigate();

    const [form, setForm] = useState<UnitPayload>({
        name: "",
        active: true,
        coordinatorIds: [],
        locations: [],
    });

    const [locationDraft, setLocationDraft] = useState<UnitLocationPayload>({
        state: "",
        city: "",
    });

    const [selectedCoordinators, setSelectedCoordinators] = useState<
        EligibleCoordinator[]
    >([]);
    const [states, setStates] = useState<StateOption[]>([]);
    const [cities, setCities] = useState<CityOption[]>([]);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const disabled = useMemo(
        () => saving || loadingStates || loadingCities,
        [saving, loadingStates, loadingCities],
    );

    function updateField<K extends keyof UnitPayload>(
        field: K,
        value: UnitPayload[K],
    ) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    function normalizeLocation(location: UnitLocationPayload) {
        return {
            state: location.state.trim(),
            city: location.city.trim(),
        };
    }

    function isDuplicateLocation(
        location: UnitLocationPayload,
        locations: UnitLocationPayload[],
    ) {
        const normalized = normalizeLocation(location);

        return locations.some((item) => {
            const current = normalizeLocation(item);

            return (
                current.state.toLowerCase() === normalized.state.toLowerCase() &&
                current.city.toLowerCase() === normalized.city.toLowerCase()
            );
        });
    }

    function handleAddLocation() {
        const nextLocation = normalizeLocation(locationDraft);

        if (!nextLocation.state || !nextLocation.city) {
            setError("Selecione um estado e uma cidade para adicionar.");
            return;
        }

        if (isDuplicateLocation(nextLocation, form.locations)) {
            setError("Esse local já foi adicionado à unidade.");
            return;
        }

        updateField("locations", [...form.locations, nextLocation]);
        setLocationDraft({
            state: "",
            city: "",
        });
        setCities([]);
        setError(null);
    }

    function handleRemoveLocation(row: UnitLocationRow) {
        updateField(
            "locations",
            form.locations.filter(
                (item) =>
                    !(
                        item.city === row.city &&
                        item.state === row.state
                    ),
            ),
        );
        setError(null);
    }

    function handleRemoveCoordinator(user: EligibleCoordinator) {
        updateField(
            "coordinatorIds",
            form.coordinatorIds.filter((id) => id !== user.id),
        );

        setSelectedCoordinators((prev) =>
            prev.filter((item) => item.id !== user.id),
        );
    }

    function getFriendlyUnitError(err: unknown) {
        const defaultMessage = "Não foi possível cadastrar a unidade.";

        if (!(err instanceof Error)) {
            return defaultMessage;
        }

        const message = err.message;

        if (
            message.includes("Unique constraint failed") &&
            message.includes("state") &&
            message.includes("city")
        ) {
            return `Esta combinação de estado/cidade já está vinculada a outra unidade.`;
        }

        return message || defaultMessage;
    }

    useEffect(() => {
        async function loadStates() {
            try {
                setLoadingStates(true);
                setError(null);

                const data = await ibgeService.getStates();
                setStates(data);
            } catch {
                setError("Não foi possível carregar os estados.");
            } finally {
                setLoadingStates(false);
            }
        }

        void loadStates();
    }, []);

    useEffect(() => {
        async function loadCities() {
            if (!locationDraft.state) {
                setCities([]);
                return;
            }

            try {
                setLoadingCities(true);
                setError(null);

                const data = await ibgeService.getCitiesByState(locationDraft.state);
                setCities(data);
            } catch {
                setCities([]);
                setError("Não foi possível carregar as cidades.");
            } finally {
                setLoadingCities(false);
            }
        }

        void loadCities();
    }, [locationDraft.state]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setSaving(true);
            setError(null);

            if (form.locations.length === 0) {
                setError("Adicione pelo menos um local para a unidade.");
                return;
            }

            await unitService.createUnit({
                ...form,
                name: form.name.trim(),
                coordinatorIds: form.coordinatorIds,
                locations: form.locations.map((location) => ({
                    state: location.state.trim(),
                    city: location.city.trim(),
                })),
            });

            navigate("/admin/units");
        } catch (err) {
            setError(getFriendlyUnitError(err));
        } finally {
            setSaving(false);
        }
    }

    const locationRows = useMemo<UnitLocationRow[]>(
        () =>
            form.locations.map((location) => ({
                id: `${location.state}-${location.city}`,
                city: location.city,
                state: location.state,
            })),
        [form.locations],
    );

    const locationsColumns = useMemo(
        () =>
            buildUnitLocationsColumns({
                onRemove: handleRemoveLocation,
                disabled,
            }),
        [disabled],
    );

    const selectedCoordinatorColumns = useMemo(
        () =>
            buildSelectedUnitCoordinatorsColumns({
                onRemove: handleRemoveCoordinator,
                disabled,
            }),
        [disabled],
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Cadastrar unidade
                </h1>
                <p className="text-sm text-slate-600">
                    Preencha os dados da unidade e vincule seus coordenadores.
                </p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
                            <div className="space-y-2 md:col-span-3">
                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Nome da unidade
                                </label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    placeholder="Digite o nome da unidade"
                                    disabled={disabled}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="state"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Estado
                                </label>
                                <select
                                    id="state"
                                    value={locationDraft.state}
                                    onChange={(e) => {
                                        setLocationDraft((prev) => ({
                                            ...prev,
                                            state: e.target.value,
                                            city: "",
                                        }));
                                    }}
                                    disabled={disabled || loadingStates}
                                    className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                                >
                                    <option value="">
                                        {loadingStates
                                            ? "Carregando estados..."
                                            : "Selecione um estado"}
                                    </option>
                                    {states.map((state) => (
                                        <option key={state.id} value={state.sigla}>
                                            {state.nome} ({state.sigla})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="city"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Cidade
                                </label>
                                <select
                                    id="city"
                                    value={locationDraft.city}
                                    onChange={(e) => {
                                        setLocationDraft((prev) => ({
                                            ...prev,
                                            city: e.target.value,
                                        }));
                                    }}
                                    disabled={disabled || !locationDraft.state || loadingCities}
                                    className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-100"
                                >
                                    <option value="">
                                        {!locationDraft.state
                                            ? "Selecione um estado primeiro"
                                            : loadingCities
                                                ? "Carregando cidades..."
                                                : "Selecione uma cidade"}
                                    </option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.nome}>
                                            {city.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex md:h-9 md:items-center">
                                <Button
                                    type="button"
                                    onClick={handleAddLocation}
                                    disabled={
                                        disabled ||
                                        !locationDraft.state ||
                                        !locationDraft.city
                                    }
                                    className="gap-2 whitespace-nowrap"
                                >
                                    <Plus className="h-4 w-4" />
                                    Adicionar
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm font-medium text-slate-700">
                                Locais adicionados
                            </div>

                            <DataTable
                                columns={locationsColumns}
                                data={locationRows}
                                emptyMessage="Nenhum local adicionado."
                                initialPageSize={5}
                                pageSizeOptions={[5]}
                            />
                        </div>

                        <UnitCoordinatorsField
                            value={form.coordinatorIds}
                            onChange={(ids) => updateField("coordinatorIds", ids)}
                            selectedCoordinators={selectedCoordinators}
                            onSelectedCoordinatorsChange={setSelectedCoordinators}
                            disabled={disabled}
                        />

                        <div className="space-y-2">
                            <div className="text-sm font-medium text-slate-700">
                                Selecionados ({selectedCoordinators.length})
                            </div>

                            <DataTable
                                columns={selectedCoordinatorColumns}
                                data={selectedCoordinators}
                                emptyMessage="Nenhum coordenador selecionado."
                                initialPageSize={5}
                                pageSizeOptions={[5]}
                            />
                        </div>

                        {error && (
                            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/admin/units")}
                                disabled={disabled}
                            >
                                Cancelar
                            </Button>

                            <Button type="submit" disabled={disabled}>
                                {saving ? "Salvando..." : "Salvar unidade"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}