import React from 'react';

import type {Column} from '@gravity-ui/react-data-table';
import block from 'bem-cn-lite';
import type {DatasetField} from 'shared';

import type {FieldActionsPopupProps} from '../components';
import {FieldActionsPopup} from '../components';
import type {ColumnItem} from '../types';

const b = block('dataset-table');

type GetMoreColumnArgs = {
    setActiveRow: ColumnItem['setActiveRow'];
    onItemClick: FieldActionsPopupProps['onItemClick'];
    readonly: boolean;
};

export const getMoreColumn = ({
    setActiveRow,
    onItemClick,
    readonly,
}: GetMoreColumnArgs): Column<DatasetField> => ({
    name: 'more',
    className: b('column', b('column-more')),
    width: 70,
    sortable: false,
    header: null,
    render: function MoreColumnItem({index, row}) {
        return (
            <FieldActionsPopup
                readonly={readonly}
                className={b('more-dropdown')}
                field={row}
                index={index}
                setActiveRow={setActiveRow}
                onItemClick={onItemClick}
            />
        );
    },
});
