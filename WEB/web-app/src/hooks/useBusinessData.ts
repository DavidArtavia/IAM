// src/hooks/useBusinessData.ts
import { useState, useEffect, useCallback } from 'react';

export function useBusinessData<T>(
    fetchFn: (id: number) => Promise<T[]>,
    selectedId: number | null
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(() => {
        if (selectedId == null) return;
        setLoading(true);
        setError(null);
        fetchFn(selectedId)
            .then(setData)
            .catch(e => setError(e.message ?? 'Error inesperado'))
            .finally(() => setLoading(false));
    }, [fetchFn, selectedId]);

    useEffect(() => { load(); }, [load]);

    return { data, loading, error, reload: load };
}
