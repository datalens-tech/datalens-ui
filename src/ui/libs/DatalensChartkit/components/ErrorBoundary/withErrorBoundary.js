import React from 'react';

import ErrorBoundary from './ErrorBoundary';

function withErrorBoundary(fallback) {
    return function withErrorBoundaryWrapper(WrappedComponent) {
        return function WithErrorBoundary(props) {
            return (
                <ErrorBoundary fallback={fallback}>
                    <WrappedComponent {...props} />
                </ErrorBoundary>
            );
        };
    };
}

export default withErrorBoundary;
