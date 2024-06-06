import React from 'react';

import {TextArea, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import type {TextFormOptions, TextareaFormOptions} from '../../../store/types';
import type {OnSourceUpdate} from '../types';
import {getTranslate} from '../utils';

import {SourceHelpTooltip} from './SourceHelpTooltip';

const b = block('source-editor-dialog');

export type InputFormItemProps = (TextFormOptions | TextareaFormOptions) & {
    onUpdate: OnSourceUpdate;
    sourceType: string;
    value?: string;
    error?: string;
    qa?: string;
};

// In case the key didn't come from the backup, but we must have a transfer
const getFieldDocKey = (options: InputFormItemProps) => {
    const {field_doc_key, name, sourceType} = options;
    return field_doc_key || (`${sourceType}/${name}` as InputFormItemProps['field_doc_key']);
};

export const InputFormItem: React.FC<InputFormItemProps> = (props) => {
    const {onUpdate, name = '', value, input_type, error, qa} = props;

    const _onUpdate = React.useCallback(
        (nextValue: string) => {
            onUpdate({[name]: nextValue});
        },
        [onUpdate, name],
    );

    const input =
        input_type === 'textarea' ? (
            <TextArea value={value || ''} error={error} qa={qa} rows={10} onUpdate={_onUpdate} />
        ) : (
            <TextInput value={value || ''} error={error} qa={qa} onUpdate={_onUpdate} />
        );

    return (
        <div className={b('param')}>
            <span className={b('label')}>
                {getTranslate(props.title)}
                <SourceHelpTooltip fieldDocKey={getFieldDocKey(props)} />
            </span>
            {input}
        </div>
    );
};
