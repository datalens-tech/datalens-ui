import React from 'react';

import type {Column} from '@gravity-ui/react-data-table';
import DataTable from '@gravity-ui/react-data-table';
import {Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {DatasetField, DatasetSelectionMap} from 'shared';

const b = block('dataset-table');

export const getIndexColumn = ({
    selectedRows,
    isAllSelected: isSelectedAll,
    onSelectChange,
    onSelectAllChange,
}: {
    selectedRows: DatasetSelectionMap;
    isAllSelected?: boolean;
    onSelectChange: (isSelected: boolean, fields: (keyof DatasetSelectionMap)[]) => void;
    onSelectAllChange: (isSelected: boolean) => void;
}): Column<DatasetField> => ({
    name: 'index',
    className: b('column'),
    align: DataTable.CENTER,
    width: 50,
    sortable: false,
    header: <Checkbox size={'l'} checked={isSelectedAll} onUpdate={onSelectAllChange} />,
    render: function IndexColumnItem({index, row}) {
        const {guid} = row;

        return (
            <React.Fragment>
                <Checkbox
                    className={b('btn-select')}
                    checked={selectedRows[guid] ?? false}
                    size={'l'}
                    onUpdate={(value) => onSelectChange(value, [guid])}
                />
                <div className={b('title-index')}>{index + 1}</div>
            </React.Fragment>
        );
    },
});
