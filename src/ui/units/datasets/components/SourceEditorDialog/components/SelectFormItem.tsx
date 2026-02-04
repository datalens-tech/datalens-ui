import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';
import {Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';
import type {SelectFormOptions} from 'shared/schema';

import type {OnSourceUpdate} from '../types';
import {getTranslate} from '../utils';

import {SourceHelpTooltip} from './SourceHelpTooltip';

const b = block('source-editor-dialog');

type SelectFormItemProps = SelectFormOptions & {
    onUpdate: OnSourceUpdate;
    value?: string;
    error?: string;
};

export const SelectFormItem: React.FC<SelectFormItemProps> = (props) => {
    const {onUpdate, name = '', value, field_doc_key, select_options, error} = props;
    const items: SelectOption[] = React.useMemo(
        () =>
            select_options.map(
                (option): SelectOption => ({
                    value: option,
                    content: option,
                }),
            ),
        [select_options],
    );

    const _onUpdate = React.useCallback(
        (nextValue: string[]) => {
            onUpdate({[name]: nextValue[0]});
        },
        [onUpdate, name],
    );

    const selectedValue = value ? [value] : undefined;

    return (
        <div className={b('param')}>
            <span className={b('label')}>
                {getTranslate(props.title)}
                <SourceHelpTooltip fieldDocKey={field_doc_key} />
            </span>
            <FieldWrapper error={error}>
                <Select
                    className={b('select-form-item')}
                    options={items}
                    value={selectedValue}
                    onUpdate={_onUpdate}
                />
            </FieldWrapper>
        </div>
    );
};
