import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type UnitLocationInput = {
    state: string;
    city: string;
};

type UnitLocationsFieldProps = {
    value: UnitLocationInput[];
    onChange: (locations: UnitLocationInput[]) => void;
    disabled?: boolean;
};

function normalizeText(value: string) {
    return value.trim().replace(/\s+/g, " ");
}

function buildLocationKey(location: UnitLocationInput) {
    return `${normalizeText(location.state).toLowerCase()}::${normalizeText(location.city).toLowerCase()}`;
}

export function UnitLocationsField({
    value,
    onChange,
    disabled = false,
}: UnitLocationsFieldProps) {
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [error, setError] = useState<string | null>(null);

    const normalizedItems = useMemo(() => {
        return value.map((item) => ({
            ...item,
            state: normalizeText(item.state),
            city: normalizeText(item.city),
            key: buildLocationKey(item),
        }));
    }, [value]);

    function handleAddLocation() {
        const nextState = normalizeText(state);
        const nextCity = normalizeText(city);

        if (!nextState || !nextCity) {
            setError("Informe estado e cidade.");
            return;
        }

        const nextItem: UnitLocationInput = {
            state: nextState,
            city: nextCity,
        };

        const nextKey = buildLocationKey(nextItem);
        const alreadyExists = normalizedItems.some((item) => item.key === nextKey);

        if (alreadyExists) {
            setError("Essa localização já foi adicionada.");
            return;
        }

        onChange([...value, nextItem]);
        setState("");
        setCity("");
        setError(null);
    }

    function handleRemoveLocation(index: number) {
        onChange(value.filter((_, currentIndex) => currentIndex !== index));
        setError(null);
    }

    return (
        <div className="space-y-3">
            <div className="grid gap-2 md:grid-cols-[140px_minmax(0,1fr)_auto]">
                <Input
                    placeholder="UF"
                    value={state}
                    onChange={(e) => {
                        setState(e.target.value.toUpperCase());
                        if (error) setError(null);
                    }}
                    maxLength={2}
                    disabled={disabled}
                />

                <Input
                    placeholder="Cidade"
                    value={city}
                    onChange={(e) => {
                        setCity(e.target.value);
                        if (error) setError(null);
                    }}
                    disabled={disabled}
                />

                <Button
                    type="button"
                    onClick={handleAddLocation}
                    disabled={disabled}
                >
                    Adicionar
                </Button>
            </div>

            {error ? (
                <div className="text-sm text-red-600">{error}</div>
            ) : null}

            <div className="space-y-2">
                {normalizedItems.length === 0 ? (
                    <div className="rounded-md border border-dashed p-3 text-sm text-slate-500">
                        Nenhuma localização adicionada.
                    </div>
                ) : (
                    normalizedItems.map((item, index) => (
                        <div
                            key={item.key}
                            className="flex items-center justify-between rounded-md border p-3"
                        >
                            <div className="text-sm text-slate-700">
                                <span className="font-medium">{item.city}</span>
                                {" - "}
                                <span>{item.state}</span>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleRemoveLocation(index)}
                                disabled={disabled}
                            >
                                Remover
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}