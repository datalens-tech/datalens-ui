import React from 'react';

export function useMountedState(deps?: React.DependencyList): () => boolean {
    const mountedRef = React.useRef<boolean>(false);
    const get = React.useCallback(() => mountedRef.current, []);

    React.useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    }, deps);

    return get;
}
