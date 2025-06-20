import React, {useRef} from 'react';

import type {Column} from '@gravity-ui/react-data-table';
import DataTable from '@gravity-ui/react-data-table';
import {Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {DatasetField, DatasetSelectionMap} from 'shared';

const b = block('dataset-table');

const MODIFIER_DEFAULT = {
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
};

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
        modifier: {shiftKey: boolean; ctrlKey: boolean; metaKey: boolean},
        clickedIndex: number,
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
        const modifierRef = useRef<{shiftKey: boolean; ctrlKey: boolean; metaKey: boolean}>(
            MODIFIER_DEFAULT,
        );

        const handleCheckboxClick = (event: React.MouseEvent) => {
            event.stopPropagation();

            modifierRef.current = {
                shiftKey: event.shiftKey,
                ctrlKey: event.ctrlKey,
                metaKey: event.metaKey,
            };
        };

        const handleCheckboxChange = (isSelected: boolean) => {
            onSelectChange(isSelected, [guid], modifierRef.current, index);

            modifierRef.current = MODIFIER_DEFAULT;
        };

        return (
            <React.Fragment>
                <Checkbox
                    controlProps={{
                        onClick: handleCheckboxClick,
                    }}
                    className={b('btn-select')}
                    checked={selectedRows[guid] ?? false}
                    size={'l'}
                    onUpdate={handleCheckboxChange}
                />
                <div className={b('title-index')}>{index + 1}</div>
            </React.Fragment>
        );
    },
});
