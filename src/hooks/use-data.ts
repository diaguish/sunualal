import { DependencyList, useEffect, useState } from 'react';

interface DataState<T> {
  data: T | undefined;
  /** Vrai pendant le premier chargement et après `reload()`. */
  loading: boolean;
  error: Error | undefined;
  reload: () => void;
}

/**
 * Charge une donnée asynchrone depuis `@/data/api`.
 * Quand `deps` change, l'ancienne donnée reste affichée jusqu'à l'arrivée de la nouvelle.
 *
 *   const { data: properties, loading } = useData(() => api.listProperties(), []);
 */
export function useData<T>(fetcher: () => Promise<T>, deps: DependencyList): DataState<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((value) => {
        if (cancelled) return;
        setData(value);
        setError(undefined);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // `fetcher` est recréé à chaque rendu : on ne relance que quand `deps` ou `version` changent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const reload = () => {
    setLoading(true);
    setVersion((v) => v + 1);
  };

  return { data, loading, error, reload };
}
