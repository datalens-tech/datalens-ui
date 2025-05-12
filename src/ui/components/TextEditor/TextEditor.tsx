import React from 'react';

import {LogoMarkdown} from '@gravity-ui/icons';
import type {TextAreaProps} from '@gravity-ui/uikit';
import {TextArea} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import './TextEditor.scss';

export type TextareaEditorProps = {
    autofocus?: boolean;
    className?: string;
    placeholder?: string;
    onTextUpdate: (val: string) => void;
    text?: string;
    id?: string;
    controlRef?: TextAreaProps['controlRef'];
};
const b = block('text-editor');
export const TextEditor = (props: TextareaEditorProps) => {
    const {autofocus, placeholder, onTextUpdate, text, id, className, controlRef} = props;

    const handleUpdate = React.useCallback(
        (val) => {
            onTextUpdate(val);
        },
        [onTextUpdate],
    );

    return (
        <div className={b(null, className)}>
            <TextArea
                id={id}
                autoFocus={autofocus}
                value={text}
                placeholder={placeholder || i18n('dash.text-dialog.edit', 'context_fill-text')}
                rows={8}
                className={b('textarea')}
                onUpdate={handleUpdate}
                controlProps={{
                    className: b('textarea-control'),
                }}
                controlRef={controlRef}
            />
            <div className={b('info')}>
                <span className={b('info-text')}>
                    {i18n('dash.text-dialog.edit', 'label_syntax')}
                </span>
                <LogoMarkdown />
            </div>
        </div>
    );
};
