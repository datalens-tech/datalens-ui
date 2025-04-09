import {getSdk} from 'libs/schematic-sdk';
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
    GetWorkbookExportResultResponse,
    GetWorkbookExportStatusResponse,
    GetWorkbookImportStatusResponse,
} from '../../../../shared/schema';

import type {CollectionsStructureDispatch} from './index';
import {convertFileToJSON} from 'ui/store/utils/collectionStructure';

type ExportWorkbookLoadingAction = {
    type: typeof EXPORT_WORKBOOK_LOADING;
};
type ExportWorkbookSuccessAction = {
    type: typeof EXPORT_WORKBOOK_SUCCESS;
    data: {};
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

type GetExportProgressLoadingAction = {
    type: typeof GET_EXPORT_PROGRESS_LOADING;
};
type GetExportProgressSuccessAction = {
    type: typeof GET_EXPORT_PROGRESS_SUCCESS;
    data: GetWorkbookExportStatusResponse;
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
            .then((data) => {
                dispatch({
                    type: GET_EXPORT_PROGRESS_SUCCESS,
                    data,
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

                showToast({
                    title: error.message,
                    error,
                });
            });
    };
};

type ImportWorkbookLoadingAction = {
    type: typeof IMPORT_WORKBOOK_LOADING;
};
type ImportWorkbookSuccessAction = {
    type: typeof IMPORT_WORKBOOK_SUCCESS;
    data: {};
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
}: {
    title: string;
    description?: string;
    collectionId: string | null;
    importFile: File;
}) => {
    return async (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: IMPORT_WORKBOOK_LOADING,
        });

        const data = await convertFileToJSON(importFile);

        return getSdk()
            .sdk.metaManager.startWorkbookImport({
                title,
                description,
                collectionId: collectionId || 'null',
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
            .then((data) => {
                dispatch({
                    type: GET_IMPORT_PROGRESS_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/getImportProgress failed', error);
                }

                dispatch({
                    type: GET_IMPORT_PROGRESS_FAILED,
                    error: isCanceled ? null : error,
                });
            });
    };
};
