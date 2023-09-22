import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import './ColumnFilter.scss';

const b = block('conn-column-filter');
const i18n = I18n.keyset('connections.file.view');

type ColumnFilterProps = {
    value: string;
    onUpdate: (value: string) => void;
};

export const ColumnFilter = ({onUpdate, value}: ColumnFilterProps) => {
    return (
        <div className={b()}>
            <TextInput
                className={b('input')}
                placeholder={i18n('label_filter-by-column')}
                value={value}
                onUpdate={onUpdate}
            />
        </div>
    );
};
