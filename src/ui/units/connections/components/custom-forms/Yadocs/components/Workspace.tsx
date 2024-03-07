import React from 'react';

import DataTable from '@gravity-ui/react-data-table';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import clone from 'lodash/clone';
import get from 'lodash/get';
import type {FileSourcePreview, FileSourceSchema} from 'shared/schema/types';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {Veil} from 'ui/components/Veil/Veil';
import {parseError} from 'ui/utils/errors/parse';

import {ApplySourceSettings, YadocSource, isYadocSourceItem} from '../../../../store';
import type {YadocItem} from '../../../../store';
import {getYadocErrorData} from '../../../../utils';
import {ErrorView} from '../../../ErrorView/ErrorView';
import {ColumnFilter, ColumnsHeaderSwitcher} from '../../components';
import {getColumnsWithTypeIcons} from '../../utils/render';

const b = block('conn-form-yadocs');
const i18n = I18n.keyset('connections.yadocs.view');

const shouldToShowVeil = (item?: YadocItem) => {
    return Boolean(item && isYadocSourceItem(item) && item.status === 'in_progress');
};

const getYadocSourceWorkspaceData = (source: YadocSource) => {
    let preview: FileSourcePreview = [];
    let schema: FileSourceSchema = [];
    let firstLineIsHeader = false;

    switch (source.type) {
        case 'yadocEditableSource': {
            preview = get(source, ['data', 'source', 'preview']);
            schema = get(source, ['data', 'source', 'raw_schema']);
            firstLineIsHeader = get(source, ['data', 'data_settings', 'first_line_is_header']);
            break;
        }
        case 'yadocReadonlySource': {
            preview = get(source, ['data', 'preview']);
            schema = get(source, ['data', 'raw_schema']);
        }
    }

    return {preview, schema, firstLineIsHeader};
};

const EmptyWorkspace = () => {
    return (
        <PlaceholderIllustration
            name="template"
            description={i18n('label_workspace-placeholder')}
        />
    );
};

type SourceWorkspaceProps = {
    columnFilter: string;
    item: YadocSource;
    updateColumnFilter: (value: string) => void;
    updateSourceSettings: ApplySourceSettings;
};

export const SourceWorkspace = (props: SourceWorkspaceProps) => {
    const {item, columnFilter, updateColumnFilter, updateSourceSettings} = props;
    const {preview, schema, firstLineIsHeader} = getYadocSourceWorkspaceData(item);
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
            {item.type === 'yadocEditableSource' && (
                <div className={b('settings')}>
                    <ColumnsHeaderSwitcher
                        value={firstLineIsHeader}
                        onUpdate={updateColumnsHeaderSwitcher}
                    />
                </div>
            )}
            <ColumnFilter value={columnFilter} onUpdate={updateColumnFilter} />
            {columns.length ? (
                // @ts-ignore theme is required value but has default - https://github.com/gravity-ui/react-data-table/blob/71c52e923a98ff38af6107754bb73490b396e71b/src/lib/DataTable.tsx#L985
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
            ) : null}
        </React.Fragment>
    );
};

type WorkspaceContentProps = WorkspaceProps;

const WorkspaceContent = (props: WorkspaceContentProps) => {
    const {columnFilter, selectedItem, updateColumnFilter, updateSourceSettings} = props;

    if (!selectedItem) {
        return <EmptyWorkspace />;
    }

    if (selectedItem.error) {
        const {title, description} = getYadocErrorData({
            type: selectedItem.type,
            error: selectedItem.error,
        });
        const errorStatus = parseError(selectedItem.error).status;
        const permissionDenied = errorStatus === 403;

        return (
            <ErrorView
                className={b('workspace-error')}
                error={selectedItem.error}
                title={title}
                description={description}
                showDebugInfo={!permissionDenied}
            />
        );
    }

    switch (selectedItem.type) {
        case 'uploadedYadoc':
        case 'yadocSourceInfo': {
            return selectedItem.status === 'in_progress' ? (
                <Loader className={b('workspace-loader')} size="m" />
            ) : null;
        }
        case 'yadocEditableSource':
        case 'yadocReadonlySource': {
            return (
                <SourceWorkspace
                    columnFilter={columnFilter}
                    item={selectedItem}
                    updateColumnFilter={updateColumnFilter}
                    updateSourceSettings={updateSourceSettings}
                />
            );
        }
        default: {
            return null;
        }
    }
};

type WorkspaceProps = {
    columnFilter: string;
    selectedItem?: YadocItem;
    updateColumnFilter: (value: string) => void;
    updateSourceSettings: ApplySourceSettings;
};

export const Workspace = (props: WorkspaceProps) => {
    const {columnFilter, selectedItem, updateColumnFilter, updateSourceSettings} = props;
    const showVeil = shouldToShowVeil(selectedItem);
    const mods = {
        empty: !selectedItem,
        readonly: selectedItem?.type === 'yadocReadonlySource',
    };

    return (
        <div className={b('workspace', mods)}>
            <WorkspaceContent
                columnFilter={columnFilter}
                selectedItem={selectedItem}
                updateColumnFilter={updateColumnFilter}
                updateSourceSettings={updateSourceSettings}
            />
            {showVeil && <Veil />}
        </div>
    );
};
