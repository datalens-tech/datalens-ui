import React from 'react';

/**
 * Memo callback hook that updates link for function only when deps list changed
 * But always updates callback that passed to it
 */
export const useMemoCallback = <T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList,
) => {
    const callbackRef = React.useRef(callback);
    callbackRef.current = callback;

    return React.useMemo(() => {
        return (...args: any[]) => callbackRef.current(...args);
    }, [...deps]);
};
