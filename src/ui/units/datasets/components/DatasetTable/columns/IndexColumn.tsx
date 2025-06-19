import React, {useRef} from 'react';

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
    onSelectToggleByHotkey,
}: {
    selectedRows: DatasetSelectionMap;
    isAllSelected?: boolean;
    indeterminate?: boolean;
    onSelectChange: (isSelected: boolean, fields: (keyof DatasetSelectionMap)[]) => void;
    onSelectAllChange: (isSelected: boolean) => void;
    onSelectToggleByHotkey: (row: DatasetField, index: number, event: React.MouseEvent) => void;
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
        const lockCheckbox = useRef(false);

        return (
            <React.Fragment>
                <Checkbox
                    controlProps={{
                        onClick: (event) => {
                            event.stopPropagation();

                            if (event.shiftKey || event.ctrlKey || event.metaKey) {
                                lockCheckbox.current = true;
                                onSelectToggleByHotkey(row, index, event);
                            }
                        },
                    }}
                    className={b('btn-select')}
                    checked={selectedRows[guid] ?? false}
                    size={'l'}
                    onUpdate={(value) => {
                        if (!lockCheckbox.current) {
                            onSelectChange(value, [guid]);
                        }
                        lockCheckbox.current = false;
                    }}
                />
                <div className={b('title-index')}>{index + 1}</div>
            </React.Fragment>
        );
    },
});
