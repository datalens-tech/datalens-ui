import React from 'react';

import type {Column} from '@gravity-ui/react-data-table';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DatasetField} from 'shared';

import {TableTextInput} from '../components';
import type {ColumnItem} from '../types';
import {sortIdColumn} from '../utils';

const b = block('dataset-table');
const i18n = I18n.keyset('dataset.dataset-editor.modify');

type GetIdColumnArgs = {
    width: string;
    setActiveRow: ColumnItem['setActiveRow'];
    onUpdate: (row: DatasetField, value: string) => void;
    readonly: boolean;
};

export const getIdColumn = (args: GetIdColumnArgs) => {
    const {width, setActiveRow, onUpdate, readonly} = args;

    const getUpdateHandler = (row: DatasetField) => {
        return (nextGuid: string) => onUpdate(row, nextGuid);
    };

    const column: Column<DatasetField> = {
        name: 'id',
        className: b('column', {'with-padding-right': true}),
        // TODO: the type will be repaired after - CHARTS-5343
        // @ts-ignore
        width,
        sortable: true,
        sortAscending: sortIdColumn,
        header: <div className={b('header')}>{i18n('label_column-field-id')}</div>,
        render: function TitleColumnItem({index, row}) {
            return (
                <TableTextInput
                    key={`id-input-${index}`}
                    text={row.guid}
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
