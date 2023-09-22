import React from 'react';

export function withEnabledFeature<T>(
    WrappedComponent: React.ComponentType<T>,
    isEnabledFeature: boolean,
) {
    const WithEnabledFeature = (props: T) => {
        if (!isEnabledFeature) {
            return null;
        }

        //@ts-ignore migration to ts 4.9 Error in props spread
        return <WrappedComponent {...props} />;
    };

    WithEnabledFeature.displayName = `withEnabledFeature(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    }`;

    return WithEnabledFeature;
}
