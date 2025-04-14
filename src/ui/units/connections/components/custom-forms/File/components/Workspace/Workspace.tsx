import React from 'react';

import DataTable from '@gravity-ui/react-data-table';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {get} from 'lodash';
import type {NonNullableBy} from 'shared';
import {ConnectionsWorkspaceQA} from 'shared';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';

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
import {getColumnsWithTypeIcons} from '../../../utils/render';
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
    const columns = item.options
        ? getCreatingSourceColumns({
              handleFileSourceUpdate,
              item: item as NonNullableBy<FileSourceItem, 'options'>,
              filter: columnFilter,
          })
        : getColumnsWithTypeIcons({schema: item.source.raw_schema, filter: columnFilter});

    return (
        <React.Fragment>
            <FileSettings item={item} onUpdate={handleSourceSettingsApply} />
            <ColumnFilter value={columnFilter} onUpdate={handleFileColumnFilterUpdate} />
            {item.error ? (
                <ErrorView
                    error={item.error}
                    className={b('settings-error')}
                    title={i18n('label_settings-update-failure')}
                />
            ) : (
                // @ts-ignore theme is required value but has default - https://github.com/gravity-ui/react-data-table/blob/71c52e923a98ff38af6107754bb73490b396e71b/src/lib/DataTable.tsx#L985 */}
                <DataTable
                    emptyDataMessage={i18n('label_no-preview-data')}
                    columns={columns}
                    data={preview}
                    settings={{
                        stickyHead: 'fixed',
                        syncHeadOnResize: true,
                        highlightRows: true,
                        displayIndices: false,
                    }}
                />
            )}
        </React.Fragment>
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
    const columns = getColumnsWithTypeIcons({schema: item.raw_schema, filter: columnFilter});

    return (
        <React.Fragment>
            <ColumnFilter value={columnFilter} onUpdate={handleFileColumnFilterUpdate} />
            {/* @ts-ignore theme is required value but has default - https://github.com/gravity-ui/react-data-table/blob/71c52e923a98ff38af6107754bb73490b396e71b/src/lib/DataTable.tsx#L985 */}
            <DataTable
                emptyDataMessage={i18n('label_no-preview-data')}
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
