import React from 'react';

import {TextArea, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import type {TextFormOptions, TextareaFormOptions} from '../../../store/types';
import type {OnSourceUpdate} from '../types';
import {getTranslate} from '../utils';

import type {ParamSelectorProps, RenderParamSelector} from './ParamSelector';
import {SourceHelpTooltip} from './SourceHelpTooltip';

const b = block('source-editor-dialog');
const i18n = I18n.keyset('dataset.sources-tab.modify');

export type InputFormItemProps = (TextFormOptions | TextareaFormOptions) & {
    onUpdate: OnSourceUpdate;
    sourceType: string;
    error?: string;
    qa?: string;
    renderParamSelector?: RenderParamSelector;
    value?: string;
};

interface Selection {
    start: number;
    end: number;
}

// In case the key didn't come from the backup, but we must have a transfer
const getFieldDocKey = (options: InputFormItemProps) => {
    const {field_doc_key, name, sourceType} = options;
    return field_doc_key || (`${sourceType}/${name}` as InputFormItemProps['field_doc_key']);
};

export const InputFormItem: React.FC<InputFormItemProps> = (props) => {
    const {onUpdate, renderParamSelector, name = '', value = '', input_type, error, qa} = props;
    const selection = React.useRef<Selection>({start: 0, end: 0});
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
    const textInputRef = React.useRef<HTMLInputElement>(null);
    const isTextArea = input_type === 'textarea';

    const handleInputUpdate = React.useCallback(
        (nextValue: string) => {
            onUpdate({[name]: nextValue});
        },
        [onUpdate, name],
    );

    const handleInputSelect = React.useCallback(() => {
        const control = textAreaRef.current || textInputRef.current;
        if (!control) {
            return;
        }
        selection.current = {
            start: control.selectionStart || 0,
            end: control.selectionEnd || 0,
        };
    }, []);

    const handleSelectParam = React.useCallback<ParamSelectorProps['onParamSelect']>(
        (param) => {
            const {start, end} = selection.current;
            const nextValue = `${value.substring(0, start)}{{${param.title}}}${value.substring(end)}`;
            onUpdate({[name]: nextValue});
        },
        [name, value, onUpdate],
    );

    let input = isTextArea ? (
        <TextArea
            controlRef={textAreaRef}
            value={value}
            error={error}
            qa={qa}
            rows={10}
            onUpdate={handleInputUpdate}
            controlProps={{onSelect: handleInputSelect}}
        />
    ) : (
        <TextInput
            controlRef={textInputRef}
            value={value}
            error={error}
            qa={qa}
            onUpdate={handleInputUpdate}
            controlProps={{onSelect: handleInputSelect}}
        />
    );

    if (renderParamSelector) {
        input = (
            <div className={b('param-content', {column: isTextArea})}>
                {input}
                {renderParamSelector({
                    buttonText: isTextArea ? i18n('button_insert-param') : undefined,
                    onParamSelect: handleSelectParam,
                })}
            </div>
        );
    }

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
