import React from 'react';

import {Column} from '@gravity-ui/react-data-table';
import block from 'bem-cn-lite';
import {DatasetField} from 'shared';

import {FieldActionsPopup, FieldActionsPopupProps} from '../components';
import {ColumnItem} from '../types';

const b = block('dataset-table');

type GetMoreColumnArgs = {
    setActiveRow: ColumnItem['setActiveRow'];
    onItemClick: FieldActionsPopupProps['onItemClick'];
};

export const getMoreColumn = ({
    setActiveRow,
    onItemClick,
}: GetMoreColumnArgs): Column<DatasetField> => ({
    name: 'more',
    className: b('column', b('column-more')),
    width: 70,
    sortable: false,
    header: null,
    render: function MoreColumnItem({index, row}) {
        return (
            <FieldActionsPopup
                className={b('more-dropdown')}
                field={row}
                index={index}
                setActiveRow={setActiveRow}
                onItemClick={onItemClick}
            />
        );
    },
});
