import { useMemo, useState } from "react";
import type { KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { unitService } from "@/services/unit.service";
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
    selectedCoordinators,
    onSelectedCoordinatorsChange,
    disabled = false,
}: UnitCoordinatorsFieldProps) {
    const [internalSelectedCoordinators, setInternalSelectedCoordinators] = useState<EligibleCoordinator[]>([]);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<EligibleCoordinator[]>([]);
    const [loading, setLoading] = useState(false);

    const effectiveSelectedCoordinators =
        selectedCoordinators ?? internalSelectedCoordinators;

    const setEffectiveSelectedCoordinators = (items: EligibleCoordinator[]) => {
        if (onSelectedCoordinatorsChange) {
            onSelectedCoordinatorsChange(items);
            return;
        }

        setInternalSelectedCoordinators(items);
    };

    const filteredResults = useMemo(() => {
        const safeResults = Array.isArray(results) ? results : [];
        const selectedIds = new Set(value);

        return safeResults.filter((item) => !selectedIds.has(item.id));
    }, [results, value]);

    async function handleSearch() {
        const normalizedSearch = search.trim();

        if (!normalizedSearch) {
            setResults([]);
            return;
        }

        try {
            setLoading(true);

            const response = await unitService.listCoordinatorUsers({
                search: normalizedSearch,
                page: 1,
                pageSize: 10,
            });

            setResults(Array.isArray(response.items) ? response.items : []);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    function handleAddCoordinator(item: EligibleCoordinator) {
        if (value.includes(item.id)) return;

        onChange([...value, item.id]);
        setEffectiveSelectedCoordinators([...effectiveSelectedCoordinators, item]);
        setResults([]);
        setSearch("");
    }

    function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        void handleSearch();
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Buscar coordenador por nome, e-mail, telefone ou cidade"
                    disabled={disabled || loading}
                />

                <Button
                    type="button"
                    onClick={() => void handleSearch()}
                    disabled={disabled || loading || !search.trim()}
                >
                    {loading ? "Buscando..." : "Buscar coordenador"}
                </Button>
            </div>

            {search.trim() && (
                <div className="rounded-xl border border-slate-200">
                    {filteredResults.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500">
                            Nenhum coordenador encontrado.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {filteredResults.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleAddCoordinator(item)}
                                    disabled={disabled}
                                    className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <div className="min-w-0">
                                        <div className="font-medium text-slate-900">
                                            {item.name}
                                        </div>

                                        <div className="truncate text-sm text-slate-600">
                                            {item.email || "Sem e-mail"}
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            {[item.phone || "Sem telefone", item.city || "Sem cidade"]
                                                .filter(Boolean)
                                                .join(" • ")}
                                        </div>
                                    </div>

                                    <span className="ml-4 shrink-0 text-sm font-medium text-blue-600">
                                        Selecionar
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}