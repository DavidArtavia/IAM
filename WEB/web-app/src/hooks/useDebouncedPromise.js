import debounce from "lodash.debounce";
import { useCallback, useMemo } from "react";
export const useDebouncedPromise = (fn, wait = 300) => {
    const debounced = useMemo(() => debounce((input, resolve, reject) => {
        fn(input).then(resolve).catch(reject);
    }, wait), [fn, wait]);
    return useCallback((input) => new Promise((resolve, reject) => {
        debounced(input, resolve, reject);
    }), [debounced]);
};
