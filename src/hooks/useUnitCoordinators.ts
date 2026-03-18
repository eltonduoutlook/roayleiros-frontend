import { useCallback, useEffect, useState } from "react";
import { unitService } from "@/services/unit.service";
import type { UnitCoordinatorItem } from "@/types/unitCoordinator";

export function useUnitCoordinators(unitId?: string) {
    const [items, setItems] = useState<UnitCoordinatorItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        if (!unitId) {
            setItems([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const data = await unitService.getCoordinators(unitId);
            setItems(data);
        } catch (error) {
            console.error(error);
            setError("Não foi possível carregar os coordenadores da unidade.");
        } finally {
            setLoading(false);
        }
    }, [unitId]);

    const save = useCallback(
        async (coordinatorIds: string[]) => {
            if (!unitId) return [];

            try {
                setSaving(true);
                setError(null);

                const data = await unitService.updateCoordinators(unitId, {
                    coordinatorIds,
                });

                setItems(data);
                return data;
            } catch (error) {
                console.error(error);
                setError("Não foi possível salvar os coordenadores da unidade.");
                throw error;
            } finally {
                setSaving(false);
            }
        },
        [unitId]
    );

    useEffect(() => {
        void fetchItems();
    }, [fetchItems]);

    return {
        items,
        loading,
        saving,
        error,
        save,
        refetch: fetchItems,
    };
}