import React from 'react';

import type {ListItemData} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

import type {
    FileSource,
    FileSourceInfoItem,
    FileSourceItem,
    StandaloneFileSource,
} from '../../../../../store';
import {ListItem} from '../../../components';
import type {ListItemAction} from '../../../components';
import {useFileContext} from '../../context';
import {getCreatingSourceItemDescription} from '../../utils';

const i18n = I18n.keyset('connections.file.view');

const SourceInfoItem = (item: ListItemData<FileSourceInfoItem>) => {
    const {file_id, source_id, title, error} = item;
    const {handleFileSourceUpdate, deleteFileSource} = useFileContext();

    const handleErrorClick = React.useCallback(() => {
        handleFileSourceUpdate(file_id, source_id);
    }, [handleFileSourceUpdate, file_id, source_id]);

    const handleDeleteClick = React.useCallback(() => {
        deleteFileSource(source_id);
    }, [deleteFileSource, source_id]);

    const actions: ListItemAction[] = [{type: 'delete', item, onClick: handleDeleteClick}];

    if (error) {
        actions.unshift({
            type: 'error',
            item,
            message: i18n('label_source-download-failure'),
            onClick: handleErrorClick,
        });
    }

    return (
        <ListItem
            actions={actions}
            title={title}
            description={i18n(error ? 'label_list-item-no-data' : 'label_list-item-downloading')}
        />
    );
};

const CreatingSourceItem = (item: ListItemData<FileSourceItem>) => {
    const {error, disabled} = item;
    const {deleteFileSource, openRenameSourceDialog, handleReplaceSourceActionData} =
        useFileContext();
    const actions: ListItemAction<FileSourceItem>[] = [
        {
            type: 'more',
            item,
            onDelete: (deletedItem) => deleteFileSource(deletedItem.source.source_id),
            onRename: (renamedItem) => openRenameSourceDialog(renamedItem.source),
            onReplace: ({source}) =>
                handleReplaceSourceActionData({
                    replaceSourceId: source.source_id,
                    showFileSelection: true,
                }),
        },
    ];

    const description = getCreatingSourceItemDescription({error, disabled});

    return (
        <ListItem
            actions={disabled ? undefined : actions}
            title={item.source.title}
            description={description}
        />
    );
};

const CreatedSourceItem = (item: ListItemData<StandaloneFileSource>) => {
    const {deleteFileSource, openRenameSourceDialog, handleReplaceSourceActionData} =
        useFileContext();
    const actions: ListItemAction<StandaloneFileSource>[] = [
        {
            type: 'more',
            item,
            onDelete: (deletedItem) => deleteFileSource(deletedItem.id),
            onRename: (renamedItem) => openRenameSourceDialog(renamedItem),
            onReplace: ({id}) =>
                handleReplaceSourceActionData({
                    replaceSourceId: id,
                    showFileSelection: true,
                }),
        },
    ];
    const description = item.disabled ? i18n('label_source-replacing') : '';

    return (
        <ListItem
            actions={item.disabled ? undefined : actions}
            title={item.title}
            description={description}
        />
    );
};

export const SourceItem = (props: FileSource) => {
    if ('source_id' in props) {
        return <SourceInfoItem {...props} />;
    }

    if ('source' in props) {
        return <CreatingSourceItem {...props} />;
    }

    if ('id' in props) {
        return <CreatedSourceItem {...props} />;
    }

    return null;
};
