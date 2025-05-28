import {getSdk, isSdkError} from 'libs/schematic-sdk';
import logger from 'libs/logger';
import {showToast} from 'store/actions/toaster';

import {
    RESET_IMPORT_PROGRESS,
    IMPORT_WORKBOOK_SUCCESS,
    IMPORT_WORKBOOK_LOADING,
    EXPORT_WORKBOOK_LOADING,
    EXPORT_WORKBOOK_SUCCESS,
    EXPORT_WORKBOOK_FAILED,
    RESET_IMPORT_WORKBOOK,
    RESET_EXPORT_WORKBOOK,
    GET_IMPORT_PROGRESS_LOADING,
    GET_IMPORT_PROGRESS_SUCCESS,
    GET_IMPORT_PROGRESS_FAILED,
    GET_EXPORT_PROGRESS_LOADING,
    RESET_EXPORT_PROGRESS,
    GET_EXPORT_PROGRESS_SUCCESS,
    GET_EXPORT_PROGRESS_FAILED,
    IMPORT_WORKBOOK_FAILED,
    GET_EXPORT_RESULT_LOADING,
    GET_EXPORT_RESULT_SUCCESS,
    GET_EXPORT_RESULT_FAILED,
    RESET_EXPORT_RESULT,
} from '../../constants/collectionsStructure';

import type {
    GetEntriesEntryResponse,
    GetWorkbookExportResultResponse,
    GetWorkbookExportStatusResponse,
    GetWorkbookImportStatusResponse,
    StartWorkbookExportResponse,
    StartWorkbookImportResponse,
} from '../../../../shared/schema';

import type {CollectionsStructureDispatch} from './index';
import {convertFileToJSON} from 'ui/store/utils/collectionStructure';
import {I18n} from 'i18n';

const i18n = I18n.keyset('component.collections-structure');

type ExportWorkbookLoadingAction = {
    type: typeof EXPORT_WORKBOOK_LOADING;
};
type ExportWorkbookSuccessAction = {
    type: typeof EXPORT_WORKBOOK_SUCCESS;
    data: StartWorkbookExportResponse;
};
type ExportWorkbookFailedAction = {
    type: typeof EXPORT_WORKBOOK_FAILED;
    error: Error | null;
};
type ResetExportWorkbookAction = {
    type: typeof RESET_EXPORT_WORKBOOK;
};

export type ExportWorkbookAction =
    | ExportWorkbookLoadingAction
    | ExportWorkbookSuccessAction
    | ExportWorkbookFailedAction
    | ResetExportWorkbookAction;

export const exportWorkbook = ({workbookId}: {workbookId: string}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: EXPORT_WORKBOOK_LOADING,
        });

        return getSdk()
            .sdk.metaManager.startWorkbookExport({workbookId})
            .then((data) => {
                dispatch({
                    type: EXPORT_WORKBOOK_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/exportWorkbook failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: EXPORT_WORKBOOK_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};
export const resetExportWorkbook = () => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: RESET_EXPORT_WORKBOOK,
        });
        dispatch({
            type: RESET_EXPORT_PROGRESS,
        });
        dispatch({
            type: RESET_EXPORT_RESULT,
        });
    };
};

const getEntriesMap = async (
    data: GetWorkbookExportStatusResponse | GetWorkbookImportStatusResponse,
) => {
    const ids: string[] = [];
    data.notifications?.forEach((notification) => {
        if (notification.entryId) {
            ids.push(notification.entryId);
        }
    });
    try {
        if (ids.length === 0) {
            return null;
        }

        const notificationEntries = await getSdk().sdk.mix.getBatchEntriesByIds({ids});

        const entriesMap = notificationEntries.entries.reduce(
            (acc, entry) => {
                acc[entry.entryId] = entry;
                return acc;
            },
            {} as {[key: string]: GetEntriesEntryResponse},
        );

        return entriesMap;
    } catch (error) {
        const isCanceled = getSdk().sdk.isCancel(error);

        if (!isCanceled) {
            logger.logError('collectionsStructure/getEntriesMap failed', error);
        }

        return null;
    }
};

type GetExportProgressLoadingAction = {
    type: typeof GET_EXPORT_PROGRESS_LOADING;
};
type GetExportProgressSuccessAction = {
    type: typeof GET_EXPORT_PROGRESS_SUCCESS;

    data: GetWorkbookExportStatusResponse;
    notificationEntries: Record<string, GetEntriesEntryResponse> | null;
};
type GetExportProgressFailedAction = {
    type: typeof GET_EXPORT_PROGRESS_FAILED;
    error: Error | null;
};
type ResetGetExportProgressAction = {
    type: typeof RESET_EXPORT_PROGRESS;
};
export type GetExportProgressAction =
    | GetExportProgressLoadingAction
    | GetExportProgressSuccessAction
    | GetExportProgressFailedAction
    | ResetGetExportProgressAction;

export const getExportProgress = ({exportId}: {exportId: string}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: GET_EXPORT_PROGRESS_LOADING,
        });

        return getSdk()
            .sdk.metaManager.getWorkbookExportStatus({exportId})
            .then(async (data) => {
                const notificationEntries = await getEntriesMap(data);

                dispatch({
                    type: GET_EXPORT_PROGRESS_SUCCESS,
                    data,
                    notificationEntries,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/getExportProgress failed', error);
                }

                dispatch({
                    type: GET_EXPORT_PROGRESS_FAILED,
                    error: isCanceled ? null : error,
                });
            });
    };
};

export const cancelExportProcess = (exportId: string) => {
    return (dispatch: CollectionsStructureDispatch) => {
        return getSdk()
            .sdk.metaManager.cancelWorkbookExport({exportId})
            .then(() => {
                dispatch(resetExportWorkbook());
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/cancelExportProcess failed', error);
                }
            });
    };
};

type ImportWorkbookLoadingAction = {
    type: typeof IMPORT_WORKBOOK_LOADING;
};
type ImportWorkbookSuccessAction = {
    type: typeof IMPORT_WORKBOOK_SUCCESS;
    data: StartWorkbookImportResponse;
};
type ImportWorkbookFailedAction = {
    type: typeof IMPORT_WORKBOOK_FAILED;
    error: Error | null;
};
type ResetImportWorkbookAction = {
    type: typeof RESET_IMPORT_WORKBOOK;
};
export type ImportWorkbookAction =
    | ImportWorkbookLoadingAction
    | ImportWorkbookSuccessAction
    | ImportWorkbookFailedAction
    | ResetImportWorkbookAction;

export const importWorkbook = ({
    title,
    description,
    collectionId,
    importFile,
    publicGalleryUrl,
}: {
    title: string;
    description?: string;
    collectionId: string | null;
} & (
    | {importFile: File; publicGalleryUrl?: undefined}
    | {publicGalleryUrl: string; importFile?: undefined}
)) => {
    return async (dispatch: CollectionsStructureDispatch) => {
        let data;

        if (importFile) {
            try {
                data = await convertFileToJSON(importFile);
            } catch (err) {
                dispatch(
                    showToast({
                        title: i18n('toast_get-json-error'),
                        error: err,
                    }),
                );
                return Promise.resolve();
            }
        } else {
            try {
                const request = await fetch(publicGalleryUrl);
                data = await request.json();
            } catch (err) {
                dispatch(
                    showToast({
                        title: i18n('toast_get-json-error'),
                        error: err,
                    }),
                );
                return Promise.resolve();
            }
        }

        dispatch({
            type: IMPORT_WORKBOOK_LOADING,
        });

        return getSdk()
            .sdk.metaManager.startWorkbookImport({
                title,
                description,
                collectionId,
                data,
            })
            .then((resultData) => {
                dispatch({
                    type: IMPORT_WORKBOOK_SUCCESS,
                    data: resultData,
                });
                return resultData;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/importWorkbook failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: IMPORT_WORKBOOK_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};
export const resetImportWorkbook = () => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: RESET_IMPORT_WORKBOOK,
        });
        dispatch({
            type: RESET_IMPORT_PROGRESS,
        });
    };
};

type GetImportProgressLoadingAction = {
    type: typeof GET_IMPORT_PROGRESS_LOADING;
};
type GetImportProgressSuccessAction = {
    type: typeof GET_IMPORT_PROGRESS_SUCCESS;

    data: GetWorkbookImportStatusResponse;
    notificationEntries: Record<string, GetEntriesEntryResponse> | null;
};
type GetImportProgressFailedAction = {
    type: typeof GET_IMPORT_PROGRESS_FAILED;
    error: Error | null;
};
type ResetGetImportProgressAction = {
    type: typeof RESET_IMPORT_PROGRESS;
};
export type GetImportProgressAction =
    | GetImportProgressLoadingAction
    | GetImportProgressSuccessAction
    | GetImportProgressFailedAction
    | ResetGetImportProgressAction;

type GetExportResultLoadingAction = {
    type: typeof GET_EXPORT_RESULT_LOADING;
};
type GetExportResultSuccessAction = {
    type: typeof GET_EXPORT_RESULT_SUCCESS;
    data: GetWorkbookExportResultResponse;
};
type GetExportResultFailedAction = {
    type: typeof GET_EXPORT_RESULT_FAILED;
    error: Error | null;
};

type ResetExportResultAction = {
    type: typeof RESET_EXPORT_RESULT;
};
export type GetExportResultAction =
    | GetExportResultLoadingAction
    | GetExportResultSuccessAction
    | GetExportResultFailedAction
    | ResetExportResultAction;

export const getExportResult = ({exportId}: {exportId: string}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: GET_EXPORT_RESULT_LOADING,
        });
        return getSdk()
            .sdk.metaManager.getWorkbookExportResult({
                exportId,
            })
            .then((data) => {
                dispatch({
                    type: GET_EXPORT_RESULT_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/getExportResult failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: GET_EXPORT_RESULT_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

export const getImportProgress = ({importId}: {importId: string}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: GET_IMPORT_PROGRESS_LOADING,
        });

        return getSdk()
            .sdk.metaManager.getWorkbookImportStatus({importId})
            .then(async (data) => {
                const notificationEntries = await getEntriesMap(data);
                dispatch({
                    type: GET_IMPORT_PROGRESS_SUCCESS,
                    data,
                    notificationEntries,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    if (isSdkError(error) && error.status === 404) {
                        dispatch(
                            showToast({
                                title: i18n('toast_outdated-workbook-info'),
                                type: 'danger',
                            }),
                        );
                        return;
                    }

                    logger.logError('collectionsStructure/getImportProgress failed', error);
                }

                dispatch({
                    type: GET_IMPORT_PROGRESS_FAILED,
                    error: isCanceled ? null : error,
                });
            });
    };
};
