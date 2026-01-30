import React from 'react';

import block from 'bem-cn-lite';

import type {MarkdownControlProps} from '../../registry/units/common/types/components/MarkdownControl';
import type {WysiwygEditorRef} from '../WysiwygEditor/WysiwygEditor';
import {WysiwygEditor} from '../WysiwygEditor/WysiwygEditor';

import './MarkdownControl.scss';

const b = block('markdown-control');

export const MarkdownControl = (props: MarkdownControlProps) => {
    const {value, onChange, enableExtensions, disabled, className} = props;

    const handleMarkupChange = (editor: WysiwygEditorRef) => {
        onChange(editor.getValue());
    };

    return (
        <div className={b('wrapper', className)}>
            <WysiwygEditor
                autofocus={false}
                className={b('wysiwyg-editor')}
                initial={{
                    markup: value,
                }}
                onMarkupChange={handleMarkupChange}
                enableExtensions={enableExtensions}
                disabled={disabled}
            />
        </div>
    );
};
