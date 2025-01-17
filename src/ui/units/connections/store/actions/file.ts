import {I18n} from 'i18n';
import {clone, get} from 'lodash';
import {batch} from 'react-redux';
import {ConnectorType, Feature} from 'shared';
import {showToast} from 'ui/store/actions/toaster';
import Utils from 'ui/utils';

import type {UpdateFileSourceArgs} from '../../../../../shared/schema';
import logger from '../../../../libs/logger';
import {closeDialog, openDialog} from '../../../../store/actions/dialog';
import type {DataLensApiError} from '../../../../typings';
import {DIALOG_CONN_S3_SOURCES} from '../../components/dialogs';
import {FieldKey} from '../../constants';
import type {FormDict} from '../../typings';
import type {
    ApplySourceSettings,
    ConnectionsReduxDispatch,
    FileSource,
    FileSourceItem,
    GetState,
    ReplaceSource,
    StandaloneFileSource,
    UpdateFileSourceInline,
    UploadedFile,
} from '../typings';
import {
    findFileSourceItemIndex,
    getActualReplaceSources,
    mapSourcesToAPIFormat,
    mergeColumnTypes,
} from '../utils';

import {api} from './api';
import {
    setBeingDeletedSourceId,
    setFileReplaceSources,
    setFileSources,
    setForm,
    setInitialForm,
    setUploadedFiles,
} from './base';

const i18n = I18n.keyset('connections.file.view');
const FILE_MAX_SIZE = 1024 * 1024 * 200; // 200MB

type UtilityHandlerArgs = {
    fileId: string;
    dispatch: ConnectionsReduxDispatch;
    getState: GetState;
};

const getSourceIndexById = (sources: FileSource[], id?: string) => {
    return sources.findIndex((source) => {
        if ('source' in source) {
            return source.source.source_id === id;
        }

        if ('id' in source) {
            return source.id === id;
        }

        return source.source_id === id;
    });
};

const getSourceTitle = (source?: FileSource) => {
    if (!source) {
        return undefined;
    }

    if ('source' in source) {
        return source.source.title;
    }

    return source.title;
};

export const setFileAndFormSources = ({
    sources,
    replaceSources,
}: {
    sources: FileSource[];
    replaceSources?: ReplaceSource[];
}) => {
    return async (dispatch: ConnectionsReduxDispatch) => {
        batch(() => {
            dispatch(
                setForm({
                    updates: {
                        [FieldKey.Sources]: mapSourcesToAPIFormat(sources),
                        ...(replaceSources && {[FieldKey.ReplaceSources]: replaceSources}),
                    },
                }),
            );
            dispatch(setFileSources({sources}));
        });
    };
};

const setUploadedFileError = (fileId: string, error?: DataLensApiError) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const prevUploadedFiles = get(getState().connections, ['file', 'uploadedFiles']);
        const uploadedFiles = [...prevUploadedFiles];
        const uploadedFileIndex = prevUploadedFiles.findIndex(
            (prevUploadedFile) => prevUploadedFile.id === fileId,
        );
        const uploadedFile = {...prevUploadedFiles[uploadedFileIndex], error};
        uploadedFiles.splice(uploadedFileIndex, 1, uploadedFile);
        dispatch(setUploadedFiles({uploadedFiles}));
    };
};

const setFileSourceError = (sourceId: string, error?: DataLensApiError) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const prevSources = get(getState().connections, ['file', 'sources']);
        const sources = [...prevSources];
        const sourceIndex = getSourceIndexById(prevSources, sourceId);
        const source = {...prevSources[sourceIndex], error};
        sources.splice(sourceIndex, 1, source);
        dispatch(setFileAndFormSources({sources}));
    };
};

export const sourcesInfoToSources = (fileId: string, sourcesId: string[]) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        let uploadedFiles = get(getState().connections, ['file', 'uploadedFiles']);
        const beingDeletedSourceId = get(getState().connections, ['file', 'beingDeletedSourceId']);
        const uploadedFile = uploadedFiles.find((file) => file.id === fileId);
        const response = await Promise.all(sourcesId.map((id) => api.updateFileSource(fileId, id)));
        const sources = response.reduce((acc, item) => {
            if ('error' in item) {
                const sourceInfo = uploadedFile?.sourcesInfo?.find(
                    ({source_id}) => source_id === item.sourceId,
                );

                if (sourceInfo) {
                    acc.push({...sourceInfo, file_id: fileId, error: item.error});
                }
            } else {
                acc.push(item.source);
            }

            return acc;
        }, [] as FileSource[]);
        batch(() => {
            const prevUploadedFiles = get(getState().connections, ['file', 'uploadedFiles']);
            uploadedFiles = prevUploadedFiles.filter((file) => file.id !== fileId);
            let prevSources = get(getState().connections, ['file', 'sources']);
            const prevReplaceSources = get(getState().connections, ['file', 'replaceSources']);
            let replaceSources: ReplaceSource[] | undefined;

            if (beingDeletedSourceId) {
                prevSources = prevSources.filter((source) => {
                    if ('id' in source) {
                        return source.id !== beingDeletedSourceId;
                    }

                    if ('source' in source) {
                        return source.source.source_id !== beingDeletedSourceId;
                    }

                    return true;
                });

                replaceSources = getActualReplaceSources(
                    prevReplaceSources,
                    beingDeletedSourceId,
                    (sources[0] as FileSourceItem)?.source.source_id,
                );

                dispatch(setFileReplaceSources({replaceSources}));
            }

            dispatch(setUploadedFiles({uploadedFiles}));
            dispatch(
                setFileAndFormSources({sources: [...prevSources, ...sources], replaceSources}),
            );
            dispatch(setBeingDeletedSourceId({beingDeletedSourceId: undefined}));
        });
    };
};

export const openS3SourcesDialog = (fileId: string) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const uploadedFiles = get(getState().connections, ['file', 'uploadedFiles']);
        const uploadedFile = uploadedFiles.find((file) => file.id === fileId);
        const beingDeletedSourceId = get(getState().connections, ['file', 'beingDeletedSourceId']);
        dispatch(
            openDialog({
                id: DIALOG_CONN_S3_SOURCES,
                props: {
                    sourcesInfo: uploadedFile?.sourcesInfo,
                    batch: !beingDeletedSourceId,
                    onApply: (sourcesId) => {
                        batch(() => {
                            dispatch(sourcesInfoToSources(fileId, sourcesId));
                            dispatch(closeDialog());
                        });
                    },
                    onClose: () => dispatch(closeDialog()),
                },
            }),
        );
    };
};

const pollFileStatus = async (args: UtilityHandlerArgs) => {
    const {fileId, dispatch, getState} = args;
    const files = get(getState().connections, ['file', 'uploadedFiles']);
    const fileExist = files.some((file) => file.id === fileId);

    if (!fileExist) {
        return;
    }

    const {status, error} = await api.checkFileStatus(fileId);

    switch (status) {
        case 'ready': {
            const {sources: sourcesInfo, error: sourcesInfoError} =
                await api.fetchFileSources(fileId);

            if (sourcesInfoError) {
                batch(() => {
                    dispatch(setUploadedFileError(fileId, sourcesInfoError));
                    dispatch(setBeingDeletedSourceId({beingDeletedSourceId: undefined}));
                });

                return;
            }

            const prevUploadedFiles = get(getState().connections, ['file', 'uploadedFiles']);
            const uploadedFileIndex = files.findIndex((file) => file.id === fileId);
            const uploadedFile = clone(files[uploadedFileIndex]);
            uploadedFile.sourcesInfo = sourcesInfo;
            const uploadedFiles = [...prevUploadedFiles];
            uploadedFiles.splice(uploadedFileIndex, 1, uploadedFile);

            batch(() => {
                dispatch(setUploadedFiles({uploadedFiles}));

                if (sourcesInfo.length > 1) {
                    dispatch(openS3SourcesDialog(fileId));
                } else if (sourcesInfo[0]) {
                    dispatch(sourcesInfoToSources(fileId, [sourcesInfo[0].source_id]));
                } else {
                    console.warn('pollFileStatus: no available sources');
                }
            });

            break;
        }
        case 'in_progress': {
            setTimeout(() => pollFileStatus(args), 1000);
            break;
        }
        case 'failed': {
            batch(() => {
                dispatch(setUploadedFileError(fileId, error));
                dispatch(setBeingDeletedSourceId({beingDeletedSourceId: undefined}));
            });
        }
    }
};

const updateUploadedFiles = (uploadedFile: UploadedFile) => {
    return (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const prevUploadedFiles = get(getState().connections, ['file', 'uploadedFiles']);
        const alreadyUploadedFileIndex = prevUploadedFiles.findIndex(
            (prevUploadedFile) => prevUploadedFile.file === uploadedFile.file,
        );
        let uploadedFiles: UploadedFile[];

        if (alreadyUploadedFileIndex === -1) {
            uploadedFiles = [...prevUploadedFiles, uploadedFile];
        } else {
            uploadedFiles = [...prevUploadedFiles];
            uploadedFiles.splice(alreadyUploadedFileIndex, 1, uploadedFile);
        }

        dispatch(setUploadedFiles({uploadedFiles}));
    };
};

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API/Non-cryptographic_uses_of_subtle_crypto#hashing_a_file
const getFileHash = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashAsArrayBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const uint8ViewOfHash = new Uint8Array(hashAsArrayBuffer);
    return Array.from(uint8ViewOfHash)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
};

const removeUploadedFile = (file: File) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const prevUploadedFiles = get(getState().connections, ['file', 'uploadedFiles']);
        const uploadedFiles = prevUploadedFiles.filter((prevUploadedFile) => {
            return prevUploadedFile.file !== file;
        });
        dispatch(setUploadedFiles({uploadedFiles}));
    };
};

const uploadFileViaUploader = (file: File) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        // To show the loader without waiting for the file to be uploaded to the uploader
        dispatch(updateUploadedFiles({file, id: ''}));

        const uploadedFile = await api.uploadFile(file);

        dispatch(updateUploadedFiles(uploadedFile));

        if (uploadedFile.id) {
            pollFileStatus({fileId: uploadedFile.id, dispatch, getState});
        }
    };
};

const uploadFileViaPresignedUrl = (file: File) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        if (file.size > FILE_MAX_SIZE) {
            dispatch(
                showToast({
                    title: i18n('label_file-size-error'),
                    type: 'danger',
                }),
            );

            return;
        }

        // To show the loader without waiting for the file to be uploaded to the uploader
        dispatch(updateUploadedFiles({file, id: ''}));

        const fileHash = await getFileHash(file);
        const {fields, url, error: getPresignedUrlError} = await api.getPresignedUrl(fileHash);

        if (getPresignedUrlError) {
            dispatch(removeUploadedFile(file));
            dispatch(
                showToast({
                    title: i18n('label_file-download-failure'),
                    error: getPresignedUrlError,
                }),
            );

            return;
        }

        const {error: uploadFileToS3Error} = await api.uploadFileToS3({
            fields,
            file,
            fileHash,
            url,
        });

        if (uploadFileToS3Error) {
            dispatch(removeUploadedFile(file));
            dispatch(
                showToast({
                    title: i18n('label_file-download-failure'),
                    error: uploadFileToS3Error,
                }),
            );

            return;
        }

        const {file_id: id, error} = await api.downloadPresignedUrl({
            filename: file.name,
            key: fields.key,
        });

        dispatch(updateUploadedFiles({file, id, error}));

        if (id) {
            pollFileStatus({fileId: id, dispatch, getState});
        }
    };
};

export const uploadFile = Utils.isEnabledFeature(Feature.EnableFileUploadingByPresignedUrl)
    ? uploadFileViaPresignedUrl
    : uploadFileViaUploader;

export const updateFileSource = (
    fileId: string,
    sourceId: string,
    columnTypes?: UpdateFileSourceArgs['column_types'],
) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const prevSources = get(getState().connections, ['file', 'sources']);
        const resultColumnTypes = mergeColumnTypes(prevSources, sourceId, columnTypes);
        const response = await api.updateFileSource(fileId, sourceId, resultColumnTypes);
        let alreadyExistedSourceIndex = -1;
        let source: FileSource;
        let sources: FileSource[];

        if ('error' in response) {
            alreadyExistedSourceIndex = prevSources.findIndex((prevSource) => {
                if ('source_id' in prevSource) {
                    return prevSource.source_id === sourceId;
                }

                if ('source' in prevSource) {
                    return prevSource.source.source_id === sourceId;
                }

                return false;
            });
            source = {...prevSources[alreadyExistedSourceIndex], error: response.error};
        } else {
            alreadyExistedSourceIndex = prevSources.findIndex((prevSource) => {
                return 'source' in prevSource ? prevSource.source.source_id === sourceId : false;
            });
            source = response.source;
        }

        if ('source' in source && resultColumnTypes.length) {
            source.columnTypes = resultColumnTypes;
        }

        if (alreadyExistedSourceIndex === -1 && 'source' in response) {
            sources = [...prevSources, source];
        } else {
            sources = [...prevSources];
            sources.splice(alreadyExistedSourceIndex, 1, source);
        }

        dispatch(setFileAndFormSources({sources}));
    };
};

export const updateFileSourceInline: UpdateFileSourceInline = (sourceId, updates) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const prevSources = get(getState().connections, ['file', 'sources']);
        const updatedSourceIndex = getSourceIndexById(prevSources, sourceId);

        if (updatedSourceIndex === -1) {
            logger.logError('Redux actions (conn): updateFileSourceInline failed');
            return;
        }

        const sources = [...prevSources];
        let updatedSource = clone(prevSources[updatedSourceIndex]);

        if ('source' in updatedSource) {
            updatedSource.source = {
                ...updatedSource.source,
                ...updates,
            };
        }

        if ('id' in updatedSource && 'raw_schema' in updatedSource) {
            updatedSource = {
                ...updatedSource,
                ...updates,
            };
        }

        sources.splice(updatedSourceIndex, 1, updatedSource);
        dispatch(setFileAndFormSources({sources}));
    };
};

const setFileSourcePolling = (sourceId: string, polling: boolean) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const prevSources = get(getState().connections, ['file', 'sources']);
        const sourceIndex = findFileSourceItemIndex(prevSources, sourceId);

        if (sourceIndex === -1) {
            logger.logError('Redux actions (conn): setFileSourcePolling failed');
            return;
        }

        const sources = [...prevSources];
        const source = clone(sources[sourceIndex]) as FileSourceItem;
        source.polling = polling;
        sources.splice(sourceIndex, 1, source);

        dispatch(setFileSources({sources}));
    };
};

const removeUserColumnTypes = (sourceId: string) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const prevSources = get(getState().connections, ['file', 'sources']);
        const sourceItemIndex = findFileSourceItemIndex(prevSources, sourceId);

        if (sourceItemIndex !== -1) {
            const sources = [...prevSources];
            const updatedSource = clone(sources[sourceItemIndex]) as FileSourceItem;
            updatedSource.columnTypes = undefined;
            sources.splice(sourceItemIndex, 1, updatedSource);
            dispatch(setFileAndFormSources({sources}));
        }
    };
};

const pollFileSourceStatus = async (args: UtilityHandlerArgs & {sourceId: string}) => {
    const {fileId, sourceId, dispatch, getState} = args;
    const sources = get(getState().connections, ['file', 'sources']);
    const sourceExist = sources.some((source) => {
        return 'source' in source && source.source.source_id === sourceId;
    });

    if (!sourceExist) {
        return;
    }

    const {status, error} = await api.checkFileSourceStatus(fileId, sourceId);

    switch (status) {
        case 'ready': {
            batch(() => {
                dispatch(setFileSourcePolling(sourceId, false));
                dispatch(removeUserColumnTypes(sourceId));
                dispatch(updateFileSource(fileId, sourceId));
            });
            break;
        }
        case 'in_progress': {
            setTimeout(() => pollFileSourceStatus(args), 1000);
            break;
        }
        case 'failed': {
            batch(() => {
                dispatch(setFileSourcePolling(sourceId, false));
                dispatch(setFileSourceError(sourceId, error));
            });
        }
    }
};

export const applySourceSettings: ApplySourceSettings = (fileId, sourceId, settings) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        dispatch(setFileSourcePolling(sourceId, true));
        const sources = get(getState().connections, ['file', 'sources']);
        const sourceIndex = getSourceIndexById(sources, sourceId);
        const title = getSourceTitle(sources[sourceIndex]);

        const {error} = await api.applySourceSettings(fileId, sourceId, settings, title);

        if (error) {
            batch(() => {
                dispatch(setFileSourcePolling(sourceId, false));
                dispatch(setFileSourceError(sourceId, error));
            });

            return;
        }

        pollFileSourceStatus({fileId, sourceId, dispatch, getState});
    };
};

export const setDataFileFormData = () => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const newConnection = !getState().connections.entry?.entryId;
        let form: FormDict;
        let sources: FileSource[] = [];

        if (newConnection) {
            form = {
                [FieldKey.Type]: ConnectorType.File,
                [FieldKey.Sources]: [],
            };
        } else {
            sources = get(
                getState().connections,
                ['connectionData', FieldKey.Sources],
                [],
            ) as StandaloneFileSource[];

            form = {
                [FieldKey.Sources]: mapSourcesToAPIFormat(sources),
            };
        }

        batch(() => {
            dispatch(setForm({updates: form}));
            dispatch(setInitialForm({updates: form}));

            if (sources.length) {
                dispatch(setFileSources({sources}));
            }
        });
    };
};
