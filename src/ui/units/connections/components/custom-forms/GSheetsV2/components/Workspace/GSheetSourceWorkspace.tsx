import React from 'react';

import type {ListItemData} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {clone, get} from 'lodash';
import TableWidget from 'ui/libs/DatalensChartkit/ChartKit/plugins/Table/renderer/TableWidget';

import type {ApplySourceSettings, GSheetSource} from '../../../../../store';
import {ColumnFilter, ColumnsHeaderSwitcher} from '../../../components';
import {useFileSourceTableWidgetData} from '../../../hooks/useFileSourceTableWidgetData';
import type {UpdateColumnFilter} from '../../types';

import {getGSheetSourceWorkspaceData} from './utils';

const b = block('conn-form-gsheets');

type GSheeteSourceWorkspaceProps = {
    columnFilter: string;
    item: ListItemData<GSheetSource>;
    updateColumnFilter: UpdateColumnFilter;
    updateSourceSettings: ApplySourceSettings;
};

export const GSheetSourceWorkspace = (props: GSheeteSourceWorkspaceProps) => {
    const {item, columnFilter, updateColumnFilter, updateSourceSettings} = props;
    const {preview, schema, firstLineIsHeader} = getGSheetSourceWorkspaceData(item);

    const updateColumnsHeaderSwitcher = React.useCallback(
        (value: boolean) => {
            const fileId = get(item, ['data', 'file_id']);
            const sourceId = get(item, ['data', 'source', 'source_id']);
            const settings = clone(get(item, ['data', 'data_settings']));
            settings.first_line_is_header = value;
            updateSourceSettings(fileId, sourceId, settings);
        },
        [item, updateSourceSettings],
    );
    const tableWidgetData = useFileSourceTableWidgetData({
        fileSourcePreview: preview,
        fileSourceSchema: schema,
        columnFilterValue: columnFilter,
    });

    return (
        <React.Fragment>
            {item.type === 'gsheetEditableSource' && (
                <div className={b('settings')}>
                    <ColumnsHeaderSwitcher
                        value={firstLineIsHeader}
                        onUpdate={updateColumnsHeaderSwitcher}
                    />
                </div>
            )}
            <ColumnFilter value={columnFilter} onUpdate={updateColumnFilter} />
            <TableWidget
                id="standalone-source-workspace-table"
                data={tableWidgetData}
                className={b('preview-table')}
            />
        </React.Fragment>
    );
};
