import React from 'react';

import type {ErrorPageProps} from './ErrorPage';
import ErrorPage from './ErrorPage';

interface WithErrorPageState {
    error: null | Error;
}

// TODO: make ability to insert in compose

function withErrorPage<T = unknown>(
    WrappedComponent: React.ComponentType<T>,
    action?: ErrorPageProps['action'],
    style?: React.CSSProperties,
) {
    const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    return class WithErrorPage extends React.Component<T, WithErrorPageState> {
        static displayName = `withErrorPage(${componentName})`;

        static getDerivedStateFromError(error: Error) {
            return {error};
        }

        state: WithErrorPageState = {
            error: null,
        };

        render() {
            if (this.state.error) {
                return <ErrorPage error={this.state.error} action={action} style={style} />;
            }

            return <WrappedComponent {...this.props} />;
        }
    };
}

export default withErrorPage;
