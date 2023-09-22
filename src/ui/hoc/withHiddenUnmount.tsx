import React from 'react';

interface Visible {
    visible: boolean;
}

export function withHiddenUnmount<T extends Visible>(WrappedComponent: React.ComponentType<T>) {
    const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    return class WithHiddenUnmount extends React.Component<T> {
        static displayName = `withHiddenUnmount(${componentName})`;

        render() {
            if (this.props.visible === false) {
                return null;
            }
            return <WrappedComponent {...this.props} />;
        }
    };
}
