import { useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import type { EligibleCoordinator } from "@/types/users";

export function useEligibleCoordinators(search: string) {
    const [items, setItems] = useState<EligibleCoordinator[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const response = await userService.listEligibleCoordinators(search);

                if (!isMounted) return;

                setItems(response);
            } catch (err) {
                if (!isMounted) return;

                setItems([]);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar os coordenadores elegíveis."
                );
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            isMounted = false;
        };
    }, [search]);

    return {
        items,
        loading,
        error,
    };
}