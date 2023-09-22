import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {MonacoDiffEditorProps, MonacoEditorProps} from 'react-monaco-editor';

import './LazyMonaco.scss';

const b = block('dl-lazy-monaco');
const i18n = I18n.keyset('component.monaco.view');

const loadReactMonacoEditor = () =>
    import(/* webpackChunkName: "monaco-editor" */ 'react-monaco-editor');

export type {MonacoEditorProps};
export type {MonacoDiffEditorProps};

const Fallback = () => (
    <div className={b('fallback')}>
        <div className={b('loader')}>
            <Loader size="s" />
        </div>
    </div>
);

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
    static getDerivedStateFromError() {
        return {hasError: true};
    }

    state: ErrorBoundaryState = {
        hasError: false,
    };

    componentDidCatch(error: Error) {
        console.warn('Failed to load monaco', error);
    }

    render() {
        if (this.state.hasError) {
            return <div>{i18n('label_failed-to-load')}</div>;
        }
        return this.props.children;
    }
}

const MonacoEditor = React.lazy(() => loadReactMonacoEditor());

export const LazyMonacoEditor = (props: MonacoEditorProps) => {
    return (
        <ErrorBoundary>
            <React.Suspense fallback={<Fallback />}>
                <MonacoEditor {...props} />
            </React.Suspense>
        </ErrorBoundary>
    );
};

const MonacoDiffEditor = React.lazy(() =>
    loadReactMonacoEditor().then((module) => ({
        default: module.MonacoDiffEditor,
    })),
);

export const LazyMonacoDiffEditor = (props: MonacoDiffEditorProps) => {
    return (
        <ErrorBoundary>
            <React.Suspense fallback={<Fallback />}>
                <MonacoDiffEditor {...props} />
            </React.Suspense>
        </ErrorBoundary>
    );
};
