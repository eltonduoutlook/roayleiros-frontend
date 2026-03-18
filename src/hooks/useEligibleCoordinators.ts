import { useCallback, useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import type { EligibleCoordinator } from "@/types/users";

export function useEligibleCoordinators(search: string) {
  const [items, setItems] = useState<EligibleCoordinator[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.listEligibleCoordinators({
        search,
        page: 1,
        pageSize: 10,
      });

      setItems(Array.isArray(response) ? response : []);
      setTotal(Array.isArray(response) ? response.length : 0);
    } catch (err) {
      console.error(err);
      setItems([]);
      setTotal(0);
      setError("Não foi possível carregar os coordenadores disponíveis.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void load();
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [load]);

  return {
    items,
    total,
    loading,
    error,
    reload: load,
  };
}