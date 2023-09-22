import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {ObjectInspectorProps} from 'react-inspector';

import {ErrorBoundary} from '../../../../../components/ErrorBoundary/ErrorBoundary';

import './Inspector.scss';

const b = block('dl-editor-inspector');
const i18n = I18n.keyset('component.editor-console.view');

const loadReactInspector = () =>
    import(/* webpackChunkName: "react-inspector" */ 'react-inspector');

const Fallback = () => (
    <div className={b('fallback')}>
        <div className={b('loader')}>
            <Loader size="s" />
        </div>
    </div>
);

const InspectorLazy = React.lazy(() =>
    loadReactInspector().then((module) => ({
        default: module.ObjectInspector as React.ExoticComponent<ObjectInspectorProps>,
    })),
);

export const Inspector = (props: ObjectInspectorProps) => {
    const renderError = React.useCallback(() => {
        return <div>{i18n('label_failed-loading-logs')}</div>;
    }, []);

    return (
        <ErrorBoundary renderError={renderError}>
            <React.Suspense fallback={<Fallback />}>
                <InspectorLazy {...props} />
            </React.Suspense>
        </ErrorBoundary>
    );
};
