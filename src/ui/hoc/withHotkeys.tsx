import React, {forwardRef} from 'react';

import {useHotkeysContext} from 'react-hotkeys-hook';

import {useSetHotkeysScope} from '../hooks/useSetHotkeysScope';

/**
 * Adds methods to set or unset needed hotkeys context
 */
export function withHotkeys<T>(WrappedComponent: React.ComponentType<T>, componentScope: string) {
    const WithHotkeys = forwardRef((props: T, ref) => {
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

    WithHotkeys.displayName = `WithHotkeys(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    }`;

    return WithHotkeys;
}
