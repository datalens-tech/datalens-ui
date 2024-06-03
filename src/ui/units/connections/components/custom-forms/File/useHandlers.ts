import React from 'react';

import {I18n} from 'i18n';
import {batch, useDispatch} from 'react-redux';

import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import type {FileSource, ReplaceSource, UploadedFile} from '../../../store';
import {
    applySourceSettings,
    openS3SourcesDialog,
    setBeingDeletedSourceId,
    setDataFileFormData,
    setFileAndFormSources,
    setFileColumnFilter,
    setFileReplaceSources,
    setFileSelectedItemId,
    setReplaceSourceActionData,
    setUploadedFiles,
    updateFileSource,
    updateFileSourceInline,
    uploadFile,
} from '../../../store';
import {DIALOG_CONN_WITH_INPUT} from '../components';

import type {
    DeleteFileSource,
    DeleteUploadedFile,
    HandleFileColumnFilterUpdate,
    HandleFileSourceUpdate,
    HandleFileUpload,
    HandleFilesUpload,
    HandleInlineFileSourceUpdate,
    HandleReplaceSource,
    HandleReplaceSourceActionData,
    HandleSourceSettingsApply,
    OpenRenameSourceDialog,
    OpenSourcesDialog,
} from './types';

const i18n = I18n.keyset('connections.file.view');

export const useHandlers = (args: {
    uploadedFiles: UploadedFile[];
    sources: FileSource[];
    replaceSources: ReplaceSource[];
}) => {
    const {uploadedFiles, sources, replaceSources} = args;
    const dispatch = useDispatch();

    const handleFileUpload: HandleFileUpload = React.useCallback(
        (file) => {
            dispatch(uploadFile(file));
        },
        [dispatch],
    );

    const handleFilesUpload: HandleFilesUpload = React.useCallback(
        (files) => {
            files.forEach((file) => handleFileUpload(file));
        },
        [handleFileUpload],
    );

    const handleFileSourceUpdate: HandleFileSourceUpdate = React.useCallback(
        (fileId, sourceId, columnTypes) => {
            dispatch(updateFileSource(fileId, sourceId, columnTypes));
        },
        [dispatch],
    );

    const handleInlineFileSourceUpdate: HandleInlineFileSourceUpdate = React.useCallback(
        (sourceId, updates) => {
            dispatch(updateFileSourceInline(sourceId, updates));
        },
        [dispatch],
    );

    const handleFileColumnFilterUpdate: HandleFileColumnFilterUpdate = React.useCallback(
        (filter: string) => {
            dispatch(setFileColumnFilter({columnFilter: filter}));
        },
        [dispatch],
    );

    const handleSourceSettingsApply: HandleSourceSettingsApply = React.useCallback(
        (fileId, sourceId, settings) => {
            dispatch(applySourceSettings(fileId, sourceId, settings));
        },
        [dispatch],
    );

    const handleReplaceSource: HandleReplaceSource = React.useCallback(
        (file, beingDeletedSourceId) => {
            batch(() => {
                dispatch(setBeingDeletedSourceId({beingDeletedSourceId}));
                dispatch(uploadFile(file));
            });
        },
        [dispatch],
    );

    const handleReplaceSourceActionData: HandleReplaceSourceActionData = React.useCallback(
        (replaceSourceActionData) => {
            dispatch(setReplaceSourceActionData({replaceSourceActionData}));
        },
        [dispatch],
    );

    const deleteUploadedFile: DeleteUploadedFile = React.useCallback(
        (fileName) => {
            const nextUploadedFiles = uploadedFiles.filter(({file}) => file.name !== fileName);
            dispatch(setUploadedFiles({uploadedFiles: nextUploadedFiles}));
        },
        [dispatch, uploadedFiles],
    );

    const deleteFileSource: DeleteFileSource = React.useCallback(
        (sourceId) => {
            const nextSources = sources.filter((item) => {
                if ('source_id' in item) {
                    return item.source_id !== sourceId;
                }

                if ('source' in item) {
                    return item.source.source_id !== sourceId;
                }

                return item.id !== sourceId;
            });
            const nextReplaceSources = replaceSources.filter((replaceSource) => {
                return replaceSource.new_source_id !== sourceId;
            });
            const replaceSourcesChanged = replaceSources.length !== nextReplaceSources.length;
            const updates: {sources: FileSource[]; replaceSources?: ReplaceSource[]} = {
                sources: nextSources,
            };

            if (replaceSourcesChanged) {
                updates.replaceSources = nextReplaceSources;
            }

            batch(() => {
                dispatch(setFileAndFormSources(updates));

                if (replaceSourcesChanged) {
                    dispatch(setFileReplaceSources({replaceSources: nextReplaceSources}));
                }
            });
        },
        [dispatch, sources, replaceSources],
    );

    const openRenameSourceDialog: OpenRenameSourceDialog = React.useCallback(
        (source) => {
            dispatch(
                openDialog({
                    id: DIALOG_CONN_WITH_INPUT,
                    props: {
                        caption: i18n('label_source-name'),
                        value: source.title,
                        applyMode: 'sync',
                        onApply: (title: string) => {
                            const sourceId = 'source_id' in source ? source.source_id : source.id;
                            handleInlineFileSourceUpdate(sourceId, {title});
                            dispatch(closeDialog());
                        },
                        onClose: () => dispatch(closeDialog()),
                    },
                }),
            );
        },
        [dispatch, handleInlineFileSourceUpdate],
    );

    const openSourcesDialog: OpenSourcesDialog = React.useCallback(
        (fileId) => {
            dispatch(openS3SourcesDialog(fileId));
        },
        [dispatch],
    );

    const setSelectedItemId = React.useCallback(
        (selectedItemId: string) => {
            dispatch(setFileSelectedItemId({selectedItemId}));
        },
        [dispatch],
    );

    const setInitialFormData = React.useCallback(() => {
        dispatch(setDataFileFormData());
    }, [dispatch]);

    const handlers = React.useMemo(
        () => ({
            handleFileUpload,
            handleFilesUpload,
            handleFileSourceUpdate,
            handleInlineFileSourceUpdate,
            handleFileColumnFilterUpdate,
            handleSourceSettingsApply,
            handleReplaceSource,
            handleReplaceSourceActionData,
            deleteUploadedFile,
            deleteFileSource,
            openRenameSourceDialog,
            openSourcesDialog,
            setSelectedItemId,
            setInitialFormData,
        }),
        [
            handleFileUpload,
            handleFilesUpload,
            handleFileSourceUpdate,
            handleInlineFileSourceUpdate,
            handleFileColumnFilterUpdate,
            handleSourceSettingsApply,
            handleReplaceSource,
            handleReplaceSourceActionData,
            deleteUploadedFile,
            deleteFileSource,
            openRenameSourceDialog,
            openSourcesDialog,
            setSelectedItemId,
            setInitialFormData,
        ],
    );

    return handlers;
};
