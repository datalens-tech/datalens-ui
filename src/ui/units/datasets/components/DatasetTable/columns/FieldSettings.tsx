import React from 'react';

import {Brush} from '@gravity-ui/icons';
import type {Column, SortedDataItem} from '@gravity-ui/react-data-table';
import DataTable from '@gravity-ui/react-data-table';
import {ActionTooltip, Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DatasetField} from 'shared';
import {isDisplaySettingsAvailable, isFieldWithDisplaySettings} from 'shared/utils';

const b = block('dataset-table');
const i18n = I18n.keyset('dataset.dataset-editor.modify');

type GetHiddenColumnArgs = {
    onUpdate: (row: DatasetField) => void;
};

const sortAscending = (row1: SortedDataItem<DatasetField>, row2: SortedDataItem<DatasetField>) => {
    const value1 = isFieldWithDisplaySettings({field: row1.row});
    const value2 = isFieldWithDisplaySettings({field: row2.row});
    return Number(value1) - Number(value2);
};

export const getFieldSettingsColumn = ({onUpdate}: GetHiddenColumnArgs): Column<DatasetField> => ({
    name: 'field-settings',
    className: b('column'),
    align: DataTable.CENTER,
    width: 70,
    sortable: true,
    sortAscending: sortAscending,
    header: <Icon className={b('header-icon')} data={Brush} width="24" />,
    render: function FieldSettingsColumnItem({index, row}) {
        if (!isDisplaySettingsAvailable({field: row})) {
            return null;
        }

        const fieldHasSettings = isFieldWithDisplaySettings({field: row});
        const tooltipText = i18n('text_no-field-settings');

        return (
            <ActionTooltip disabled={fieldHasSettings} title={tooltipText}>
                <Button
                    key={index}
                    className={b('btn-hidden')}
                    view="flat"
                    title={i18n('button_field-settings')}
                    onClick={() => onUpdate(row)}
                >
                    <Icon
                        className={b('hidden', {hidden: fieldHasSettings})}
                        data={Brush}
                        width="16"
                        height="16"
                    />
                </Button>
            </ActionTooltip>
        );
    },
});
