import React from 'react';

import type {Column} from '@gravity-ui/react-data-table';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {type DatasetField, DatasetFieldsTabQa} from 'shared';

import {TableTextInput} from '../components';
import type {ColumnItem} from '../types';
import {sortTitleColumn} from '../utils';

const b = block('dataset-table');
const i18n = I18n.keyset('dataset.dataset-editor.modify');

type GetTitleColumnArgs = {
    width: string;
    setActiveRow: ColumnItem['setActiveRow'];
    onUpdate: (row: DatasetField, value: string) => void;
};

export const getTitleColumn = (args: GetTitleColumnArgs) => {
    const {width, setActiveRow, onUpdate} = args;

    const getUpdateHandler = (row: DatasetField) => {
        return (nextTitle: string) => onUpdate(row, nextTitle);
    };

    const column: Column<DatasetField> = {
        name: 'title',
        className: b('column', {'with-padding-right': true}),
        // TODO: the type will be repaired after - CHARTS-5343
        // @ts-ignore
        width,
        sortable: true,
        sortAscending: sortTitleColumn,
        header: <div className={b('header')}>{i18n('column_field-name')}</div>,
        render: function TitleColumnItem({value, index, row}) {
            return (
                <TableTextInput
                    key={`title-input-${index}`}
                    error={!row.valid}
                    text={value as string}
                    index={index}
                    setActiveRow={setActiveRow}
                    onUpdate={getUpdateHandler(row)}
                    qa={DatasetFieldsTabQa.FieldNameColumnInput}
                />
            );
        },
    };

    return column;
};
