import { useCallback, useEffect, useState } from "react";

type AsyncState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  initialValue: T,
  deps: React.DependencyList = [],
): AsyncState<T> {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetcher();
      setData(result);
    } catch (err) {
      console.error("useAsyncData error:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao carregar dados.",
      );
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetcher();
        if (!active) return;

        setData(result);
      } catch (err) {
        if (!active) return;

        console.error("useAsyncData error:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao carregar dados.",
        );
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, deps);

  return {
    data,
    loading,
    error,
    reload: load,
  };
}