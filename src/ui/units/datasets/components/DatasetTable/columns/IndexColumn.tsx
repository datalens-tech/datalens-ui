import React, {useCallback} from 'react';

import type {Column} from '@gravity-ui/react-data-table';
import DataTable from '@gravity-ui/react-data-table';
import {Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {DatasetField, DatasetSelectionMap} from 'shared';

const b = block('dataset-table');

export const getIndexColumn = ({
    selectedRows,
    isAllSelected,
    indeterminate,
    onSelectChange,
    onSelectAllChange,
}: {
    selectedRows: DatasetSelectionMap;
    isAllSelected?: boolean;
    indeterminate?: boolean;
    onSelectChange: (
        isSelected: boolean,
        guids: (keyof DatasetSelectionMap)[],
        clickedIndex: number,
        modifier: {shiftKey: boolean},
    ) => void;
    onSelectAllChange: (isSelected: boolean) => void;
}): Column<DatasetField> => ({
    name: 'index',
    className: b('column'),
    align: DataTable.CENTER,
    width: 50,
    sortable: false,
    header: (
        <Checkbox
            size={'l'}
            checked={isAllSelected}
            indeterminate={indeterminate}
            onUpdate={onSelectAllChange}
        />
    ),
    render: function IndexColumnItem({index, row}) {
        const {guid} = row;

        const handleCheckboxChange = useCallback(
            (event: React.ChangeEvent<HTMLInputElement>) => {
                const {checked} = event.target;

                onSelectChange(checked, [guid], index, {
                    shiftKey: Boolean(
                        event.nativeEvent instanceof MouseEvent && event.nativeEvent.shiftKey,
                    ),
                });
            },
            [guid, index],
        );

        return (
            <React.Fragment>
                <Checkbox
                    className={b('btn-select')}
                    checked={selectedRows[guid] ?? false}
                    size={'l'}
                    onChange={handleCheckboxChange}
                />
                <div className={b('title-index')}>{index + 1}</div>
            </React.Fragment>
        );
    },
});
