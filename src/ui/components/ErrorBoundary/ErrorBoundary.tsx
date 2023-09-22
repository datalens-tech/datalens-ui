import React from 'react';

import logger from '../../libs/logger';

export type ErrorBoundaryProps = {
    renderError: (error: Error) => React.ReactNode;
    onError?: (error: Error) => void;
};

type ErrorBoundaryState = {
    error?: Error;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    static getDerivedStateFromError(error: Error) {
        return {error};
    }

    state: ErrorBoundaryState = {};

    componentDidCatch(error: Error) {
        this.props.onError?.(error);
        logger.logError('ErrorBoundary componentDidCatch', error);
    }

    render() {
        if (this.state.error) {
            return this.props.renderError(this.state.error);
        }
        return this.props.children;
    }
}
