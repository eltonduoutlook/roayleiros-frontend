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

            const data = await unitService.listUnitCoordinators(unitId);
            setItems(data);
        } catch (err) {
            console.error(err);
            setError("Não foi possível carregar os coordenadores da unidade.");
        } finally {
            setLoading(false);
        }
    }, [unitId]);

    const addCoordinator = useCallback(
        async (userId: string) => {
            if (!unitId) return null;

            try {
                setSaving(true);
                setError(null);

                const data = await unitService.addUnitCoordinator(unitId, { userId });

                setItems((prev) => {
                    const existingIndex = prev.findIndex(
                        (item) => item.userId === data.userId,
                    );

                    if (existingIndex >= 0) {
                        return prev.map((item, index) =>
                            index === existingIndex ? data : item,
                        );
                    }

                    return [...prev, data];
                });

                return data;
            } catch (err) {
                console.error(err);
                setError("Não foi possível adicionar o coordenador à unidade.");
                throw err;
            } finally {
                setSaving(false);
            }
        },
        [unitId],
    );

    const inactivateCoordinator = useCallback(
        async (userId: string) => {
            if (!unitId) return null;

            try {
                setSaving(true);
                setError(null);

                const data = await unitService.inactivateUnitCoordinator(unitId, userId);

                setItems((prev) =>
                    prev.map((item) => (item.userId === userId ? data : item)),
                );

                return data;
            } catch (err) {
                console.error(err);
                setError("Não foi possível inativar o coordenador da unidade.");
                throw err;
            } finally {
                setSaving(false);
            }
        },
        [unitId],
    );

    const removeCoordinator = useCallback(
        async (userId: string) => {
            if (!unitId) return null;

            try {
                setSaving(true);
                setError(null);

                await unitService.removeUnitCoordinator(unitId, userId);

                setItems((prev) => prev.filter((item) => item.userId !== userId));

                return true;
            } catch (err) {
                console.error(err);
                setError("Não foi possível remover o coordenador da unidade.");
                throw err;
            } finally {
                setSaving(false);
            }
        },
        [unitId],
    );

    useEffect(() => {
        void fetchItems();
    }, [fetchItems]);

    return {
        items,
        loading,
        saving,
        error,
        refetch: fetchItems,
        addCoordinator,
        inactivateCoordinator,
        removeCoordinator,
    };
}