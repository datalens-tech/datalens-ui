import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

const b = block('conn-form-file');
const i18n = I18n.keyset('connections.file.view');

type ColumnFilterProps = {
    onUpdate: (value: string) => void;
    value: string;
};

export const ColumnFilter = ({onUpdate, value}: ColumnFilterProps) => {
    return (
        <div className={b('column-filter')}>
            <TextInput
                className={b('column-filter-input')}
                placeholder={i18n('label_filter-by-column')}
                value={value}
                onUpdate={onUpdate}
            />
        </div>
    );
};
