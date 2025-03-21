import React from 'react';

import {Key} from '@gravity-ui/icons';
import type {Column} from '@gravity-ui/react-data-table';
import DataTable from '@gravity-ui/react-data-table';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DatasetField, DatasetRls} from 'shared';
import {sortRslColumn} from 'ui/units/datasets/components/DatasetTable/utils';

const b = block('dataset-table');
const i18n = I18n.keyset('dataset.dataset-editor.modify');

type GetHiddenColumnArgs = {
    onUpdate: (row: DatasetField) => void;
    rls: DatasetRls;
};

export const getRlsColumn = ({onUpdate, rls}: GetHiddenColumnArgs): Column<DatasetField> => ({
    name: 'rls',
    className: b('column'),
    align: DataTable.CENTER,
    width: 70,
    sortable: true,
    sortAscending: (row1, row2) => sortRslColumn(row1, row2, rls),
    header: <Icon className={b('header-icon')} data={Key} width="24" />,
    render: function RlsColumnItem({index, row}) {
        const isRls = Boolean(Array.isArray(rls[row.guid]) ? rls[row.guid].length : rls[row.guid]);

        return (
            <Button
                key={index}
                className={b('btn-hidden')}
                view="flat"
                title={i18n('button_row-level-security')}
                onClick={() => onUpdate(row)}
            >
                <Icon className={b('hidden', {hidden: isRls})} data={Key} width="16" height="16" />
            </Button>
        );
    },
});
