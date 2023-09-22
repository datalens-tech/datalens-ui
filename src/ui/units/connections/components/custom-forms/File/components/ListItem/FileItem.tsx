import React from 'react';

import type {ListItemData} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

import type {UploadedFile} from '../../../../../store';
import {ListItem} from '../../../components';
import type {ListItemAction} from '../../../components';
import {useFileContext} from '../../context';

const i18n = I18n.keyset('connections.file.view');
const i18nGsheet = I18n.keyset('connections.gsheet.view');

type FileItemStatus = 'in_progress' | 'ready' | 'ready_to_selection' | 'failed';

const getFileItemStatus = ({error, sourcesInfo}: ListItemData<UploadedFile>): FileItemStatus => {
    if (error) {
        return 'failed';
    }

    if (sourcesInfo && sourcesInfo.length > 1) {
        return 'ready_to_selection';
    }

    if (sourcesInfo) {
        return 'ready';
    }

    return 'in_progress';
};

const getDescription = (status: FileItemStatus) => {
    switch (status) {
        case 'failed': {
            return i18n('label_list-item-no-data');
        }
        case 'ready_to_selection': {
            return i18nGsheet('label_gsheet-ready');
        }
        case 'in_progress': {
            return i18n('label_list-item-downloading');
        }
        default: {
            return '';
        }
    }
};

export const FileItem = (item: ListItemData<UploadedFile>) => {
    const {file} = item;
    const {handleFileUpload, deleteUploadedFile} = useFileContext();
    const status = getFileItemStatus(item);
    const fileName = file.name;

    const handleErrorClick = React.useCallback(() => {
        handleFileUpload(file);
    }, [handleFileUpload, file]);

    const handleDeleteClick = React.useCallback(() => {
        deleteUploadedFile(fileName);
    }, [deleteUploadedFile, fileName]);

    const actions: ListItemAction[] = React.useMemo(() => {
        const resultActions: ListItemAction[] = [];

        if (status !== 'ready_to_selection') {
            resultActions.push({type: 'delete', item: file, onClick: handleDeleteClick});
        }

        if (status === 'failed') {
            resultActions.unshift({
                type: 'error',
                item: file,
                message: i18n('label_file-download-failure'),
                onClick: handleErrorClick,
            });
        }

        return resultActions;
    }, [handleErrorClick, handleDeleteClick, file, status]);

    return <ListItem actions={actions} title={file.name} description={getDescription(status)} />;
};
