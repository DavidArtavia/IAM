export declare function useBusinessData<T>(fetchFn: (id: number) => Promise<T[]>, selectedId: number | null): {
    data: T[];
    loading: boolean;
    error: string | null;
    reload: () => void;
};
