import React from 'react';

import {Flex, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {ErrorBoundary} from '../ErrorBoundary/ErrorBoundary';

import type {MarkdownEditorProps, MarkdownEditorRef} from './MarkdownEditorDefault';

import './WysiwygEditor.scss';

const b = block('wysiwyg-editor');
const i18n = I18n.keyset('component.wysiwyg-editor.view');

export type WysiwygEditorRef = MarkdownEditorRef;
type WysiwygEditorProps = MarkdownEditorProps & {
    disabled?: boolean;
    onError?: (error: Error) => void;
};

const MarkdownEditor = React.lazy(() => import('./MarkdownEditorDefault'));

const Fallback: React.FC = () => (
    <Flex alignItems="center" justifyContent="center" className={b('fallback')}>
        <Flex alignItems="center" justifyContent="center">
            <Loader size="m" />
        </Flex>
    </Flex>
);

export const WysiwygEditor = React.forwardRef<MarkdownEditorRef, WysiwygEditorProps>(
    ({className, disabled, ...props}, ref) => {
        const renderError = React.useCallback(() => {
            return <div>{i18n('label_failed-to-load')}</div>;
        }, []);

        return (
            <ErrorBoundary renderError={renderError} onError={props.onError}>
                <React.Suspense fallback={<Fallback />}>
                    <div className={b('wrapper')}>
                        <MarkdownEditor
                            className={b('content', {disabled}, className)}
                            ref={ref}
                            {...props}
                        />
                    </div>
                </React.Suspense>
            </ErrorBoundary>
        );
    },
);

WysiwygEditor.displayName = 'WysiwygEditor';
