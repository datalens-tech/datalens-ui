import React from 'react';

import type {Column} from '@gravity-ui/react-data-table';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DatasetField} from 'shared';

import {TableTextInput} from '../components';
import type {ColumnItem} from '../types';
import {sortDescriptionColumn} from '../utils';

const b = block('dataset-table');
const i18n = I18n.keyset('dataset.dataset-editor.modify');

type GetDescriptionColumnArgs = {
    setActiveRow: ColumnItem['setActiveRow'];
    onUpdate: (row: DatasetField, description: string) => void;
    readonly: boolean;
};

export const getDescriptionColumn = (args: GetDescriptionColumnArgs) => {
    const {setActiveRow, onUpdate, readonly} = args;

    const getUpdateHandler = (row: DatasetField) => {
        return (nextDescription: string) => onUpdate(row, nextDescription);
    };

    const column: Column<DatasetField> = {
        name: 'description',
        className: b('column'),
        sortable: true,
        sortAscending: sortDescriptionColumn,
        header: <div className={b('header')}>{i18n('column_filed-description')}</div>,
        customStyle: () => ({minWidth: '100px'}),
        width: '10%',
        render: function DescriptionColumnItem({value, index, row}) {
            return (
                <TableTextInput
                    key={`discription-input-${index}`}
                    text={value as string}
                    index={index}
                    setActiveRow={setActiveRow}
                    onUpdate={getUpdateHandler(row)}
                    disabled={readonly}
                />
            );
        },
    };

    return column;
};
