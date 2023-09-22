import React from 'react';

import {useMountedState} from 'ui/hooks';

import type {Fetcher, PaginationResponse} from './types';

export const useInfinityFetch = <Response, Pagination>({
    fetcher,
}: {
    fetcher: Fetcher<Response, Pagination>;
}) => {
    const isMounted = useMountedState();
    const ref = React.useRef<typeof fetcher>();
    const [isLoadingInitial, setIsLoadingInitial] = React.useState(false);
    const [isLoadingInfinity, setIsLoadingInfinity] = React.useState(false);
    const [resps, setResps] = React.useState<PaginationResponse<Response, Pagination>[]>([]);
    const [error, setError] = React.useState<any | null>(null);

    const pagination = React.useMemo(
        () => resps[resps.length - 1] && resps[resps.length - 1].pagination,
        [resps],
    );

    const onFetchInitial = React.useCallback(() => {
        setError(null);
        setIsLoadingInitial(true);
        ref.current = fetcher;

        return fetcher()
            .then((resp) => {
                if (!isMounted()) {
                    return;
                }
                if (ref.current !== fetcher) {
                    return;
                }

                setIsLoadingInitial(false);
                setResps([resp]);
            })
            .catch((err) => {
                setIsLoadingInitial(false);
                setResps([]);
                setError(err);
            });
    }, [fetcher, isMounted, ref]);

    const onFetchInfinity = React.useCallback(() => {
        if (!pagination) {
            return Promise.resolve();
        }

        setError(null);
        setIsLoadingInfinity(true);

        const initialFetcher = ref.current;

        return fetcher(pagination)
            .then((resp) => {
                if (!isMounted()) {
                    return;
                }
                if (initialFetcher !== ref.current) {
                    return;
                }

                setIsLoadingInfinity(false);
                setResps([...resps, resp]);
            })
            .catch((err) => {
                setIsLoadingInfinity(false);
                setResps([]);
                setError(err);
            });
    }, [fetcher, resps, pagination, isMounted, ref]);

    React.useEffect(() => {
        onFetchInitial();
    }, [onFetchInitial]);

    return {
        responses: resps,
        onFetchInitial,
        onFetchInfinity: pagination ? onFetchInfinity : undefined,
        isLoadingInitial,
        isLoadingInfinity,
        error,
    };
};
