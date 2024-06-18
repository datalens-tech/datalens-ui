import React from 'react';

// import {Hashtag} from '@gravity-ui/icons';
import type {Column} from '@gravity-ui/react-data-table';
import DataTable from '@gravity-ui/react-data-table';
import {Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {DatasetField, DatasetSelectionMap} from 'shared';

const b = block('dataset-table');

export const getIndexColumn = ({
    selectedRows,
    isSelectedAll,
    onSelectChange,
    onSelectAllChange,
}: {
    selectedRows: DatasetSelectionMap;
    isSelectedAll?: boolean;
    onSelectChange: (isSelected: boolean, fields: (keyof DatasetSelectionMap)[]) => void;
    onSelectAllChange: (isSelected: boolean) => void;
}): Column<DatasetField> => ({
    name: 'index',
    className: b('column'),
    align: DataTable.CENTER,
    width: 50,
    sortable: false,
    // header: <Icon className={b('header-icon-table-count')} data={Hashtag} size={14} />,
    header: <Checkbox size={'l'} checked={isSelectedAll} onUpdate={onSelectAllChange} />,
    render: function IndexColumnItem({index, row}) {
        return (
            <React.Fragment>
                <div className={b('btn-select')}>
                    <Checkbox
                        checked={selectedRows[row.guid] ?? false}
                        size={'l'}
                        onUpdate={(value) => onSelectChange(value, [row.guid])}
                    />
                </div>
                <div className={b('title-index')}>{index + 1}</div>
            </React.Fragment>
        );
    },
});
