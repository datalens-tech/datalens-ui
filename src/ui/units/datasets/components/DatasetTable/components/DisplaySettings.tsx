import React from 'react';

import {Gear} from '@gravity-ui/icons';
import {Button, Icon, Select, type SelectProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import type {EditorItemToDisplay} from '../../../store/types';

const b = block('dataset-table');
const i18n = I18n.keyset('dataset.dataset-editor.modify');
const ITEM_HIDDEN_FIELDS: EditorItemToDisplay = 'hiddenFields';
const ITEM_FIELDS_ID: EditorItemToDisplay = 'fieldsId';

const renderControl: SelectProps['renderControl'] = (args) => {
    const {triggerProps, ref} = args;

    return (
        <Button {...triggerProps} ref={ref as React.Ref<HTMLButtonElement>} size="s" view="flat">
            <Icon data={Gear} height={18} width={18} />
        </Button>
    );
};

export const DisplaySettings = ({value, onUpdate}: Pick<SelectProps, 'value' | 'onUpdate'>) => {
    return (
        <Select
            value={value}
            multiple={true}
            onUpdate={onUpdate}
            renderControl={renderControl}
            className={b('select-cog')}
        >
            <Select.Option value={ITEM_HIDDEN_FIELDS}>
                {i18n('label_display-hidden-fields')}
            </Select.Option>
            <Select.Option value={ITEM_FIELDS_ID}>{i18n('label_display-fields-id')}</Select.Option>
        </Select>
    );
};
