import { useCallback, useEffect, useState } from "react";

export interface AdminFeatureStatItem {
  count: number;
  label: string;
}

export type AdminFeatureStatsMap = Record<string, AdminFeatureStatItem | undefined>;

function formatCounter(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function useAdminFeatureStats() {
  const [stats, setStats] = useState<AdminFeatureStatsMap>({});
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/register-requests?status=PENDING&page=1&pageSize=1`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Não foi possível carregar os indicadores do admin.");
      }

      const result = await response.json();

      const pendingRequestsCount =
        result?.meta?.total ??
        result?.data?.length ??
        0;

      setStats({
        solicitacoes: {
          count: pendingRequestsCount,
          label: `${formatCounter(pendingRequestsCount)} pendente${
            pendingRequestsCount === 1 ? "" : "s"
          }`,
        },
      });
    } catch (error) {
      console.error(error);
      setStats({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    reload: loadStats,
  };
}