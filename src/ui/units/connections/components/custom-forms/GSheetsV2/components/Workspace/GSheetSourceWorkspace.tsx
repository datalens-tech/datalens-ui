import React from 'react';

import DataTable from '@gravity-ui/react-data-table';
import type {ListItemData} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {clone, get} from 'lodash';

import type {ApplySourceSettings, GSheetSource} from '../../../../../store';
import {ColumnFilter, ColumnsHeaderSwitcher} from '../../../components';
import {getColumnsWithTypeIcons} from '../../../utils/render';
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
    const columns = getColumnsWithTypeIcons({schema, filter: columnFilter});

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
            {/* @ts-ignore theme is required value but has default - https://github.com/gravity-ui/react-data-table/blob/71c52e923a98ff38af6107754bb73490b396e71b/src/lib/DataTable.tsx#L985 */}
            <DataTable
                columns={columns}
                data={preview}
                settings={{
                    stickyHead: 'fixed',
                    syncHeadOnResize: true,
                    highlightRows: true,
                    displayIndices: false,
                }}
            />
        </React.Fragment>
    );
};
