import React, {forwardRef} from 'react';

import {useHotkeysContext} from 'react-hotkeys-hook';

/**
 * Adds methods to set or unset needed hotkeys context
 */
export function withHotkeysContext<T>(WrappedComponent: React.ComponentType<T>) {
    const WithHotkeysContext = forwardRef((props: T, ref) => {
        const hotkeysContext = useHotkeysContext();

        return <WrappedComponent {...props} ref={ref} hotkeysContext={hotkeysContext} />;
    });

    WithHotkeysContext.displayName = `WithHotkeysContext(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    }`;

    return WithHotkeysContext;
}
