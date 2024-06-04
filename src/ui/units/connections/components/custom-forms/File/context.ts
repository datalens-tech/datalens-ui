import React from 'react';

import {noop} from 'lodash';

import type {ReplaceSourceActionData} from '../../../store';

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

type FileContextValue = {
    handleFileUpload: HandleFileUpload;
    handleFilesUpload: HandleFilesUpload;
    handleFileSourceUpdate: HandleFileSourceUpdate;
    handleInlineFileSourceUpdate: HandleInlineFileSourceUpdate;
    handleFileColumnFilterUpdate: HandleFileColumnFilterUpdate;
    handleSourceSettingsApply: HandleSourceSettingsApply;
    handleReplaceSource: HandleReplaceSource;
    handleReplaceSourceActionData: HandleReplaceSourceActionData;
    deleteUploadedFile: DeleteUploadedFile;
    deleteFileSource: DeleteFileSource;
    openRenameSourceDialog: OpenRenameSourceDialog;
    openSourcesDialog: OpenSourcesDialog;
    replaceSourceActionData: ReplaceSourceActionData;
    beingDeletedSourceId?: string;
};

const initialValue = {
    handleFileUpload: noop,
    handleFilesUpload: noop,
    handleFileSourceUpdate: noop,
    handleInlineFileSourceUpdate: noop,
    handleFileColumnFilterUpdate: noop,
    handleSourceSettingsApply: noop,
    handleReplaceSource: noop,
    handleReplaceSourceActionData: noop,
    deleteUploadedFile: noop,
    deleteFileSource: noop,
    openRenameSourceDialog: noop,
    openSourcesDialog: noop,
    replaceSourceActionData: {},
    beingDeletedSourceId: undefined,
};

export const FileContext = React.createContext<FileContextValue>(initialValue);

export const useFileContext = () => React.useContext(FileContext);
