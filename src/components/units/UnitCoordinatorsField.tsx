import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Plus } from "lucide-react";

import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildUnitCoordinatorsColumns } from "@/features/admin/UnitCoordinatorsColumns";
import { userService } from "@/services/user.service";
import type { EligibleCoordinator } from "@/types/users";

type UnitCoordinatorsFieldProps = {
    value?: string[];
    onChange?: (coordinatorIds: string[]) => void;
    selectedCoordinators?: EligibleCoordinator[];
    onSelectedCoordinatorsChange?: (items: EligibleCoordinator[]) => void;
    disabled?: boolean;
};

export function UnitCoordinatorsField({
    value = [],
    onChange,
    selectedCoordinators = [],
    onSelectedCoordinatorsChange,
    disabled = false,
}: UnitCoordinatorsFieldProps) {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<EligibleCoordinator[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchMessage, setSearchMessage] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const selectedIds = useMemo(() => {
        return new Set(selectedCoordinators.map((item) => item.id));
    }, [selectedCoordinators]);

    const filteredResults = useMemo(() => {
        return results.filter((item) => !selectedIds.has(item.id));
    }, [results, selectedIds]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!wrapperRef.current) return;
            if (!wrapperRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const term = search.trim();

        if (term.length < 2) {
            setResults([]);
            setSearchMessage(
                term.length === 0 ? null : "Digite pelo menos 2 caracteres para buscar.",
            );
            setDropdownOpen(false);
            return;
        }

        const timer = window.setTimeout(async () => {
            try {
                setLoading(true);
                setSearchMessage(null);

                const response = await userService.searchEligibleCoordinators(term);
                const items = Array.isArray(response) ? response : [];

                setResults(items);
                setDropdownOpen(true);

                if (items.length === 0) {
                    setSearchMessage("Nenhum coordenador elegível encontrado para essa busca.");
                }
            } catch {
                setResults([]);
                setDropdownOpen(true);
                setSearchMessage("Não foi possível buscar coordenadores.");
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => {
            window.clearTimeout(timer);
        };
    }, [search]);

    const syncSelection = useCallback(
        (items: EligibleCoordinator[]) => {
            onSelectedCoordinatorsChange?.(items);
            onChange?.(items.map((item) => item.id));
        },
        [onChange, onSelectedCoordinatorsChange],
    );

    const handleAddCoordinator = useCallback(
        (coordinator: EligibleCoordinator) => {
            const alreadyExists = selectedCoordinators.some(
                (item) => item.id === coordinator.id,
            );

            if (alreadyExists) {
                return;
            }

            const updated = [...selectedCoordinators, coordinator];
            syncSelection(updated);

            setSearch("");
            setResults([]);
            setSearchMessage(null);
            setDropdownOpen(false);
        },
        [selectedCoordinators, syncSelection],
    );

    const handleRemoveCoordinator = useCallback(
        (id: string) => {
            const updated = selectedCoordinators.filter((item) => item.id !== id);
            syncSelection(updated);
        },
        [selectedCoordinators, syncSelection],
    );

    function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Escape") {
            setDropdownOpen(false);
        }
    }

    const columns = useMemo(() => {
        return buildUnitCoordinatorsColumns(handleRemoveCoordinator);
    }, [handleRemoveCoordinator]);

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                    Coordenadores da unidade
                </label>
                <p className="text-sm text-slate-500">
                    Busque por nome e adicione usuários com perfil administrador ou coordenador.
                </p>
            </div>

            <div ref={wrapperRef} className="relative space-y-2">
                <div className="flex gap-2">
                    <Input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        onFocus={() => {
                            if (search.trim().length >= 2) {
                                setDropdownOpen(true);
                            }
                        }}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Busque por nome ou e-mail"
                        disabled={disabled}
                    />
                </div>

                {(dropdownOpen || loading || searchMessage) && (
                    <div className="absolute z-20 w-full rounded-md border border-slate-200 bg-white shadow-md">
                        {loading ? (
                            <div className="px-3 py-2 text-sm text-slate-500">Buscando...</div>
                        ) : filteredResults.length > 0 ? (
                            <ul className="max-h-64 overflow-y-auto py-1">
                                {filteredResults.map((item) => (
                                    <li key={item.id}>
                                        <div
                                            onClick={() => handleAddCoordinator(item)}
                                            className="flex cursor-pointer items-start gap-3 px-3 py-2 transition-colors hover:bg-slate-50"
                                        >
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                    e.stopPropagation();
                                                    handleAddCoordinator(item);
                                                }}
                                                disabled={disabled}
                                                aria-label={`Adicionar ${item.name}`}
                                                title={`Adicionar ${item.name}`}
                                                className="mt-0.5 shrink-0"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>

                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-slate-800">
                                                    {item.name}
                                                </div>
                                                <div className="truncate text-xs text-slate-500">
                                                    {item.email}
                                                    {item.city ? ` • ${item.city}` : ""}
                                                    {item.phone ? ` • ${item.phone}` : ""}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-3 py-2 text-sm text-slate-500">
                                {searchMessage ?? "Nenhum resultado encontrado."}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <DataTable
                columns={columns}
                data={selectedCoordinators}
                pageSizeOptions={[5, 10, 20]}
                emptyMessage="Nenhum coordenador adicionado."
            />
        </div>
    );
}