import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { UnitCoordinatorsField } from "@/components/units/UnitCoordinatorsField";
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

export default function AdminUnitCreatePage() {
    const navigate = useNavigate();

    const [form, setForm] = useState<UnitPayload>({
        name: "",
        city: "",
        state: "",
        active: true,
        coordinatorIds: [],
    });

    const [selectedCoordinators, setSelectedCoordinators] = useState<EligibleCoordinator[]>([]);
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

    function updateField<K extends keyof UnitPayload>(field: K, value: UnitPayload[K]) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    function handleSelectedCoordinatorsChange(items: EligibleCoordinator[]) {
        setSelectedCoordinators(items);
        updateField(
            "coordinatorIds",
            items.map((item) => item.id),
        );
    }

    useEffect(() => {
        async function loadStates() {
            try {
                setLoadingStates(true);
                const data = await ibgeService.getStates();
                setStates(data);
            } catch (err) {
                setError("Não foi possível carregar os estados.");
            } finally {
                setLoadingStates(false);
            }
        }

        loadStates();
    }, []);

    useEffect(() => {
        async function loadCities() {
            if (!form.state) {
                setCities([]);
                return;
            }

            try {
                setLoadingCities(true);
                const data = await ibgeService.getCitiesByState(form.state);
                setCities(data);
            } catch (err) {
                setCities([]);
                setError("Não foi possível carregar as cidades.");
            } finally {
                setLoadingCities(false);
            }
        }

        loadCities();
    }, [form.state]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setSaving(true);
            setError(null);

            await unitService.createUnit({
                ...form,
                name: form.name.trim(),
                city: form.city?.trim() ?? "",
                state: form.state?.trim() ?? "",
                coordinatorIds: selectedCoordinators.map((item) => item.id),
            });

            navigate("/admin/units");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível cadastrar a unidade.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Cadastrar unidade</h1>
                <p className="text-sm text-slate-600">
                    Preencha os dados da unidade e vincule seus coordenadores.
                </p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <label htmlFor="name" className="text-sm font-medium text-slate-700">
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
                                <label htmlFor="state" className="text-sm font-medium text-slate-700">
                                    Estado
                                </label>
                                <select
                                    id="state"
                                    value={form.state ?? ""}
                                    onChange={(e) => {
                                        updateField("state", e.target.value);
                                        updateField("city", "");
                                    }}
                                    disabled={disabled || loadingStates}
                                    className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                                    required
                                >
                                    <option value="">
                                        {loadingStates ? "Carregando estados..." : "Selecione um estado"}
                                    </option>
                                    {states.map((state) => (
                                        <option key={state.id} value={state.sigla}>
                                            {state.nome} ({state.sigla})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="city" className="text-sm font-medium text-slate-700">
                                    Cidade
                                </label>
                                <select
                                    id="city"
                                    value={form.city ?? ""}
                                    onChange={(e) => updateField("city", e.target.value)}
                                    disabled={disabled || !form.state || loadingCities}
                                    className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-100"
                                    required
                                >
                                    <option value="">
                                        {!form.state
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
                        </div>

                        <UnitCoordinatorsField
                            value={form.coordinatorIds}
                            onChange={(ids) => updateField("coordinatorIds", ids)}
                            selectedCoordinators={selectedCoordinators}
                            onSelectedCoordinatorsChange={handleSelectedCoordinatorsChange}
                            disabled={disabled}
                        />

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