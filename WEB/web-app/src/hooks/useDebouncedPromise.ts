import debounce from "lodash.debounce";
import { useCallback, useMemo } from "react";

export const useDebouncedPromise = <T>(
    fn: (input: string) => Promise<T>,
    wait = 300
): (input: string) => Promise<T> => {
    const debounced = useMemo(
        () =>
            debounce(
                (
                    input: string,
                    resolve: (res: T) => void,
                    reject: (err: undefined) => void
                ) => {
                    fn(input).then(resolve).catch(reject);
                },
                wait
            ),
        [fn, wait]
    );

    return useCallback(
        (input: string) =>
            new Promise<T>((resolve, reject) => {
                debounced(input, resolve, reject);
            }),
        [debounced]
    );
};