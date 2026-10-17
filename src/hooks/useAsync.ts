import { useCallback, useEffect, useRef, useState } from 'react';

/** Runs an async loader on mount and whenever `deps` change. Ignores stale responses. */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const run = useRef(0);

  const load = useCallback(() => {
    const id = ++run.current;
    setLoading(true);
    setError(null);
    loader()
      .then((d) => run.current === id && setData(d))
      .catch((e) => run.current === id && setError(e?.message || 'Something went wrong.'))
      .finally(() => run.current === id && setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, loading, reload: load, setData };
}

export function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
