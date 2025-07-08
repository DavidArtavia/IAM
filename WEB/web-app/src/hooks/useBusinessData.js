// src/hooks/useBusinessData.ts
import { useState, useEffect, useCallback } from 'react';
export function useBusinessData(fetchFn, selectedId) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const load = useCallback(() => {
        if (selectedId == null)
            return;
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
