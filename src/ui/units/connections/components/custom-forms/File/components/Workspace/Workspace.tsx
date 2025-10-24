import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import get from 'lodash/get';
import type {NonNullableBy} from 'shared';
import {ConnectionsWorkspaceQA} from 'shared';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import TableWidget from 'ui/libs/DatalensChartkit/ChartKit/plugins/Table/renderer/TableWidget';

import {Interpolate} from '../../../../../../../components/Interpolate';
import {Veil} from '../../../../../../../components/Veil/Veil';
import type {
    FileSourceInfoItem,
    FileSourceItem,
    ListItemProps,
    StandaloneFileSource,
    UploadedFile,
} from '../../../../../store';
import {ErrorView} from '../../../../ErrorView/ErrorView';
import {useFileSourceTableWidgetData} from '../../../hooks/useFileSourceTableWidgetData';
import {getFileSourcePreviewTableColumns} from '../../../utils/render';
import {useFileContext} from '../../context';
import {getAcceptedExtensions, getCreatingSourceColumns} from '../../utils';

import {ColumnFilter} from './ColumnFilter';
import {FileSettings} from './FileSettings';

const b = block('conn-form-file');
const i18n = I18n.keyset('connections.file.view');

type WorkspaceProps = {
    columnFilter: string;
    item?: ListItemProps;
};

const EmptyWorkspace = () => {
    const acceptedExtensions = getAcceptedExtensions();
    const text = i18n('label_file-promo', {
        formats: acceptedExtensions.replace(/\./g, ' ').toUpperCase(),
    });
    return (
        <div className={b('workspace-empty')}>
            <PlaceholderIllustration
                name="template"
                description={
                    <Interpolate
                        text={text}
                        matches={{
                            br() {
                                return <br />;
                            },
                        }}
                    />
                }
            />
        </div>
    );
};

const FileWorkspace = ({item}: {item: UploadedFile}) => {
    if (item.error) {
        return <ErrorView error={item.error} title={i18n('label_file-download-failure')} />;
    }

    // Case: the user skipped the dialog for selecting sheets from an xlsx file
    if (item.sourcesInfo) {
        return null;
    }

    return <Loader className={b('workspace-file-loader')} size="m" />;
};

const SourceInfoWorkspace = ({item}: {item: FileSourceInfoItem}) => {
    if (item.error) {
        return <ErrorView error={item.error} title={i18n('label_source-download-failure')} />;
    }

    return null;
};

const SourceWorkspace = ({item, columnFilter}: {item: FileSourceItem; columnFilter: string}) => {
    const {handleFileSourceUpdate, handleFileColumnFilterUpdate, handleSourceSettingsApply} =
        useFileContext();
    const preview = get(item, ['source', 'preview']);
    const tableWidgetData = useFileSourceTableWidgetData({
        fileSourcePreview: preview,
        getColumns: () => {
            return item.options
                ? getCreatingSourceColumns({
                      handleFileSourceUpdate,
                      item: item as NonNullableBy<FileSourceItem, 'options'>,
                      filter: columnFilter,
                  })
                : getFileSourcePreviewTableColumns({
                      schema: item.source.raw_schema,
                      filter: columnFilter,
                  });
        },
    });

    return (
        <>
            <FileSettings item={item} onUpdate={handleSourceSettingsApply} />
            <ColumnFilter value={columnFilter} onUpdate={handleFileColumnFilterUpdate} />
            {item.error ? (
                <ErrorView
                    error={item.error}
                    className={b('settings-error')}
                    title={i18n('label_settings-update-failure')}
                />
            ) : (
                <TableWidget
                    id="source-workspace-table"
                    emptyDataMessage={i18n('label_no-preview-data')}
                    data={tableWidgetData}
                    className={b('preview-table')}
                />
            )}
        </>
    );
};

const StandaloneSourceWorkspace = ({
    item,
    columnFilter,
}: {
    item: StandaloneFileSource;
    columnFilter: string;
}) => {
    const {handleFileColumnFilterUpdate} = useFileContext();
    const preview = get(item, ['preview']);
    const tableWidgetData = useFileSourceTableWidgetData({
        fileSourcePreview: preview,
        fileSourceSchema: item.raw_schema,
        columnFilterValue: columnFilter,
    });

    return (
        <>
            <ColumnFilter value={columnFilter} onUpdate={handleFileColumnFilterUpdate} />
            <TableWidget
                id="standalone-source-workspace-table"
                emptyDataMessage={i18n('label_no-preview-data')}
                data={tableWidgetData}
                className={b('preview-table')}
            />
        </>
    );
};

export const Workspace = ({item, columnFilter}: WorkspaceProps) => {
    const itemPolling = item && 'source' in item && item.polling;
    let content: React.ReactNode = <EmptyWorkspace />;
    let standalone = false;

    if (item && 'file' in item) {
        content = <FileWorkspace item={item} />;
    }

    if (item && 'source_id' in item) {
        content = <SourceInfoWorkspace item={item} />;
    }

    if (item && 'source' in item) {
        content = <SourceWorkspace item={item} columnFilter={columnFilter} />;
    }

    if (item && 'id' in item && 'raw_schema' in item) {
        content = <StandaloneSourceWorkspace item={item} columnFilter={columnFilter} />;
        standalone = true;
    }

    return (
        <div className={b('workspace', {standalone})} data-qa={ConnectionsWorkspaceQA.WORKSPACE}>
            {content}
            {itemPolling && <Veil />}
        </div>
    );
};
