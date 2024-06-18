import React from 'react';

import type {HotkeysContextType} from 'react-hotkeys-hook/dist/HotkeysProvider';

/**
 * Adds useEffect with enabling and disabling hotkeys scope for current container
 */
export function useAutodetectHotkeysScope({
    hotkeysContext,
    scope,
}: {
    hotkeysContext: HotkeysContextType;
    scope: string;
}) {
    React.useEffect(() => {
        hotkeysContext.enableScope(scope);

        return () => {
            hotkeysContext.disableScope(scope);
        };
    }, []);
}
