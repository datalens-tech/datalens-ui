import React from 'react';

import {Hashtag} from '@gravity-ui/icons';
import DataTable, {Column} from '@gravity-ui/react-data-table';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DatasetField} from 'shared';

const b = block('dataset-table');

export const getIndexColumn = (): Column<DatasetField> => ({
    name: 'index',
    className: b('column'),
    align: DataTable.CENTER,
    width: 50,
    sortable: false,
    header: <Icon className={b('header-icon-table-count')} data={Hashtag} size={14} />,
    render: function IndexColumnItem({index}) {
        return index + 1;
    },
});
