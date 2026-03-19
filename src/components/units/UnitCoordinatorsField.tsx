import { useEffect, useMemo, useRef, useState } from "react";

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

function onlyDigits(value: string) {
    return value.replace(/\D/g, "");
}

function normalizeText(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function formatPhone(value?: string | null) {
    if (!value) return "Sem telefone";

    const digits = onlyDigits(value);

    if (digits.length === 11) {
        return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }

    if (digits.length === 10) {
        return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }

    return value;
}

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
    const [openResults, setOpenResults] = useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const debounceRef = useRef<number | null>(null);

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

        return safeResults
            .filter((item) => !selectedIds.has(item.id))
            .slice(0, 10);
    }, [results, value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!containerRef.current) return;

            if (!containerRef.current.contains(event.target as Node)) {
                setOpenResults(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (disabled) {
            setResults([]);
            setOpenResults(false);
            return;
        }

        const normalizedSearch = search.trim();

        if (!normalizedSearch) {
            setResults([]);
            setOpenResults(false);
            return;
        }

        if (debounceRef.current) {
            window.clearTimeout(debounceRef.current);
        }

        debounceRef.current = window.setTimeout(async () => {
            try {
                setLoading(true);

                const response = await unitService.listCoordinatorUsers({
                    search: normalizedSearch,
                    page: 1,
                    pageSize: 10,
                });

                const items = Array.isArray(response.items) ? response.items : [];
                const normalizedQuery = normalizeText(normalizedSearch);
                const digitsQuery = onlyDigits(normalizedSearch);

                const refinedItems = items.filter((item) => {
                    const text = normalizeText(
                        [item.name, item.email, item.phone, item.city]
                            .filter(Boolean)
                            .join(" "),
                    );

                    const phoneDigits = onlyDigits(item.phone || "");

                    const matchesText = text.includes(normalizedQuery);
                    const matchesPhone = digitsQuery
                        ? phoneDigits.includes(digitsQuery)
                        : false;

                    return matchesText || matchesPhone;
                });

                setResults(refinedItems.slice(0, 10));
                setOpenResults(true);
            } catch {
                setResults([]);
                setOpenResults(true);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) {
                window.clearTimeout(debounceRef.current);
            }
        };
    }, [search, disabled]);

    function handleAddCoordinator(item: EligibleCoordinator) {
        if (value.includes(item.id)) return;

        onChange([...value, item.id]);
        setEffectiveSelectedCoordinators([...effectiveSelectedCoordinators, item]);
        setResults([]);
        setSearch("");
        setOpenResults(false);
    }

    return (
        <div ref={containerRef} className="relative space-y-2">
            <Input
                value={search}
                onChange={(event) => {
                    setSearch(event.target.value);
                    setOpenResults(true);
                }}
                onFocus={() => {
                    if (search.trim()) {
                        setOpenResults(true);
                    }
                }}
                placeholder="Buscar coordenador por nome, e-mail, telefone ou cidade"
                disabled={disabled}
            />

            {openResults && search.trim() && (
                <div className="absolute z-20 w-full rounded-xl border border-slate-200 bg-white shadow-sm">
                    {loading ? (
                        <div className="px-4 py-3 text-sm text-slate-500">
                            Buscando...
                        </div>
                    ) : filteredResults.length === 0 ? (
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
                                            {[formatPhone(item.phone), item.city || "Sem cidade"]
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