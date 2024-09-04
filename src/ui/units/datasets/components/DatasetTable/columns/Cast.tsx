import React from 'react';

import type {Column} from '@gravity-ui/react-data-table';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DATASET_FIELD_TYPES, DatasetField, DatasetOptionFieldItem} from 'shared';

import {TypeSelect} from '../components/TypeSelect/TypeSelect';
import {sortCastColumn} from '../utils';

const b = block('dataset-table');
const i18n = I18n.keyset('dataset.dataset-editor.modify');

type GetCastColumnArgs = {
    fields: DatasetOptionFieldItem[];
    onUpdate: (row: DatasetField, cast: DATASET_FIELD_TYPES) => void;
};

export const getCastColumn = ({fields, onUpdate}: GetCastColumnArgs): Column<DatasetField> => ({
    name: 'cast',
    className: b('column', b('column-cast')),
    width: 206,
    sortable: true,
    sortAscending: sortCastColumn,
    header: <div className={b('header-cast')}>{i18n('column_field-cast')}</div>,
    render: function CastColumnItem({value, index, row}) {
        const {casts = []} = fields.find(({guid}) => guid === row.guid) || {};

        const handleOnUpdate = (type: DATASET_FIELD_TYPES) => {
            onUpdate(row, type);
        };

        return (
            <TypeSelect
                key={index}
                selectedType={value as DATASET_FIELD_TYPES}
                types={casts}
                onSelect={handleOnUpdate}
            />
        );
    },
});
