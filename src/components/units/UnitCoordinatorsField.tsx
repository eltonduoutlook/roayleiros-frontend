import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEligibleCoordinators } from "@/hooks/useEligibleCoordinators";
import type { EligibleCoordinator } from "@/types/users";

type UnitCoordinatorsFieldProps = {
    value: string[];
    onChange: (coordinatorIds: string[]) => void;
    selectedCoordinators?: EligibleCoordinator[];
    onSelectedCoordinatorsChange?: (items: EligibleCoordinator[]) => void;
    disabled?: boolean;
};

export function UnitCoordinatorsField({
    value,
    onChange,
    selectedCoordinators = [],
    onSelectedCoordinatorsChange,
    disabled = false,
}: UnitCoordinatorsFieldProps) {
    const [search, setSearch] = useState("");

    const { items = [], loading, error } = useEligibleCoordinators(search);

    const selectedIds = useMemo(() => new Set(value ?? []), [value]);

    const availableResults = useMemo(() => {
        return (items ?? []).filter((item) => !selectedIds.has(item.id));
    }, [items, selectedIds]);

    function handleAddCoordinator(item: EligibleCoordinator) {
        if (selectedIds.has(item.id)) return;

        onChange([...value, item.id]);
        onSelectedCoordinatorsChange?.([...selectedCoordinators, item]);
        setSearch("");
    }

    function handleRemoveCoordinator(userId: string) {
        onChange(value.filter((id) => id !== userId));
        onSelectedCoordinatorsChange?.(
            selectedCoordinators.filter((item) => item.id !== userId),
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    Coordenadores da unidade
                </label>

                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por nome ou e-mail"
                    disabled={disabled}
                />

                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {(search.trim().length > 0 || loading) && (
                    <div className="rounded-lg border border-slate-200 bg-white">
                        {loading ? (
                            <div className="px-3 py-3 text-sm text-slate-500">Carregando...</div>
                        ) : availableResults.length === 0 ? (
                            <div className="px-3 py-3 text-sm text-slate-500">
                                Nenhum usuário elegível encontrado.
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {availableResults.map((item) => (
                                    <li key={item.id}>
                                        <div className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-slate-50">
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleAddCoordinator(item)}
                                                disabled={disabled}
                                                aria-label={`Adicionar ${item.name}`}
                                                title={`Adicionar ${item.name}`}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>

                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium text-slate-800">
                                                    {item.name}
                                                </div>
                                                <div className="truncate text-xs text-slate-500">
                                                    {item.email}
                                                    {item.city ? ` • ${item.city}` : ""}
                                                    {item.phone ? ` • ${item.phone}` : ""}
                                                    {item.level ? ` • ${item.level}` : ""}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <div className="text-sm font-medium text-slate-700">
                    Selecionados ({selectedCoordinators.length})
                </div>

                {selectedCoordinators.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                        Nenhum coordenador selecionado.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {selectedCoordinators.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                            >
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-slate-800">
                                        {item.name}
                                    </div>
                                    <div className="truncate text-xs text-slate-500">
                                        {item.email}
                                        {item.city ? ` • ${item.city}` : ""}
                                        {item.phone ? ` • ${item.phone}` : ""}
                                        {item.level ? ` • ${item.level}` : ""}
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    disabled={disabled}
                                    onClick={() => handleRemoveCoordinator(item.id)}
                                    aria-label={`Remover ${item.name}`}
                                    title={`Remover ${item.name}`}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}