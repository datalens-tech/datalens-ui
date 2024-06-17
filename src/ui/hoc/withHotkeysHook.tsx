import React, {forwardRef} from 'react';

import {useHotkeysContext} from 'react-hotkeys-hook';

import {useSetHotkeysScope} from '../hooks/useSetHotkeysScope';

export function withHotkeysHook<T>(
    WrappedComponent: React.ComponentType<T>,
    componentScope: string,
) {
    const WithHotkeysHook = forwardRef((props: T, ref) => {
        const hotkeysContext = useHotkeysContext();

        const {setHotkeysScope, unsetHotkeysScope} = useSetHotkeysScope({
            hotkeysContext,
            componentScope,
        });

        return (
            <WrappedComponent
                {...props}
                ref={ref}
                hotkeysContext={hotkeysContext}
                setHotkeysScope={setHotkeysScope}
                unsetHotkeysScope={unsetHotkeysScope}
            />
        );
    });

    WithHotkeysHook.displayName = `WithHotkeysHook(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    }`;

    return WithHotkeysHook;
}
