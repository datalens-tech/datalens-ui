import React from 'react';

export function useMountedState(): () => boolean {
    const mountedRef = React.useRef<boolean>(false);
    const get = React.useCallback(() => mountedRef.current, []);

    React.useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    });

    return get;
}
