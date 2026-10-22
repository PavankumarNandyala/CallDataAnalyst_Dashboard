import { useCallback, useEffect, useState } from "react";
import { fetchCalls } from "@/lib/api";

/**
 * Custom hook: loads the CDR data and exposes { calls, loading, error, refetch, lastUpdated }.
 * AbortController cancels the request if the component unmounts (avoids state updates after unmount).
 */
export function useCallData() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchCalls(controller.signal)
      .then((data) => {
        setCalls(data);
        setLastUpdated(new Date());
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { calls, loading, error, refetch, lastUpdated };
}
