import type {ThunkDispatch} from 'redux-thunk';
import {getSdk} from 'libs/schematic-sdk';
import logger from 'libs/logger';
import type {DatalensGlobalState} from 'index';
import {showToast} from 'store/actions/toaster';
import {
    RESET_STATE,
    GET_ENTRY_LOADING,
    GET_ENTRY_SUCCESS,
    GET_ENTRY_FAILED,
    GET_RELATIONS_GRAPH_LOADING,
    GET_RELATIONS_GRAPH_SUCCESS,
    GET_RELATIONS_GRAPH_FAILED,
    GET_RELATIONS_LOADING,
    GET_RELATIONS_SUCCESS,
    GET_RELATIONS_FAILED,
    MIGRATE_ENTRIES_TO_WORKBOOK_LOADING,
    MIGRATE_ENTRIES_TO_WORKBOOK_SUCCESS,
    MIGRATE_ENTRIES_TO_WORKBOOK_FAILED,
} from '../constants/migrationToWorkbook';
import type {
    GetEntryArgs,
    GetEntryResponse,
    GetRelationsGraphArgs,
    GetRelationsGraphResponse,
    GetRelationsArgs,
    GetRelationsResponse,
    MigrateEntriesToWorkbookArgs,
    MigrateEntriesToWorkbookResponse,
} from '../../../shared/schema';

type ResetStateAction = {
    type: typeof RESET_STATE;
};

export const resetState = () => (dispatch: MigrationToWorkbookDispatch) => {
    dispatch({
        type: RESET_STATE,
    });
};

type GetEntryLoadingAction = {
    type: typeof GET_ENTRY_LOADING;
};
type GetEntrySuccessAction = {
    type: typeof GET_ENTRY_SUCCESS;
    data: GetEntryResponse;
};
type GetEntryFailedAction = {
    type: typeof GET_ENTRY_FAILED;
    error: Error | null;
};
type GetEntryAction = GetEntryLoadingAction | GetEntrySuccessAction | GetEntryFailedAction;

export const getEntry = (params: GetEntryArgs) => {
    return (dispatch: MigrationToWorkbookDispatch) => {
        dispatch({
            type: GET_ENTRY_LOADING,
        });
        return getSdk()
            .sdk.us.getEntry(params)
            .then((data) => {
                dispatch({
                    type: GET_ENTRY_SUCCESS,
                    data: data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('migrationToWorkbook/getEntry failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: GET_ENTRY_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type GetRelationsGraphLoadingAction = {
    type: typeof GET_RELATIONS_GRAPH_LOADING;
};
type GetRelationsGraphSuccessAction = {
    type: typeof GET_RELATIONS_GRAPH_SUCCESS;
    data: GetRelationsGraphResponse;
};
type GetRelationsGraphFailedAction = {
    type: typeof GET_RELATIONS_GRAPH_FAILED;
    error: Error | null;
};
type GetRelationsGraphAction =
    | GetRelationsGraphLoadingAction
    | GetRelationsGraphSuccessAction
    | GetRelationsGraphFailedAction;

export const getRelationsGraph = (params: GetRelationsGraphArgs) => {
    return (dispatch: MigrationToWorkbookDispatch) => {
        dispatch({
            type: GET_RELATIONS_GRAPH_LOADING,
        });
        return getSdk()
            .sdk.us.getRelationsGraph(params)
            .then((data) => {
                dispatch({
                    type: GET_RELATIONS_GRAPH_SUCCESS,
                    data: data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('migrationToWorkbook/getRelationsGraph failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: GET_RELATIONS_GRAPH_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type GetRelationsLoadingAction = {
    type: typeof GET_RELATIONS_LOADING;
};
type GetRelationsSuccessAction = {
    type: typeof GET_RELATIONS_SUCCESS;
    data: GetRelationsResponse;
};
type GetRelationsFailedAction = {
    type: typeof GET_RELATIONS_FAILED;
    error: Error | null;
};
type GetRelationsAction =
    | GetRelationsLoadingAction
    | GetRelationsSuccessAction
    | GetRelationsFailedAction;

export const getRelations = (params: GetRelationsArgs) => {
    return (dispatch: MigrationToWorkbookDispatch) => {
        dispatch({
            type: GET_RELATIONS_LOADING,
        });
        return getSdk()
            .sdk.us.getRelations(params)
            .then((data) => {
                dispatch({
                    type: GET_RELATIONS_SUCCESS,
                    data: data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('migrationToWorkbook/getRelations failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: GET_RELATIONS_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type MigrateEntriesToWorkbookLoadingAction = {
    type: typeof MIGRATE_ENTRIES_TO_WORKBOOK_LOADING;
};
type MigrateEntriesToWorkbookSuccessAction = {
    type: typeof MIGRATE_ENTRIES_TO_WORKBOOK_SUCCESS;
    data: MigrateEntriesToWorkbookResponse;
};
type MigrateEntriesToWorkbookFailedAction = {
    type: typeof MIGRATE_ENTRIES_TO_WORKBOOK_FAILED;
    error: Error | null;
};
type MigrateEntriesToWorkbookAction =
    | MigrateEntriesToWorkbookLoadingAction
    | MigrateEntriesToWorkbookSuccessAction
    | MigrateEntriesToWorkbookFailedAction;

export const migrateEntriesToWorkbookByTransfer = (params: MigrateEntriesToWorkbookArgs) => {
    return (dispatch: MigrationToWorkbookDispatch) => {
        dispatch({
            type: MIGRATE_ENTRIES_TO_WORKBOOK_LOADING,
        });
        return getSdk()
            .sdk.us.migrateEntriesToWorkbookByTransfer(params)
            .then((data) => {
                dispatch({
                    type: MIGRATE_ENTRIES_TO_WORKBOOK_SUCCESS,
                    data: data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('migrationToWorkbook/migrateEntriesToWorkbook failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: MIGRATE_ENTRIES_TO_WORKBOOK_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

export const migrateEntriesToWorkbookByCopy = (params: MigrateEntriesToWorkbookArgs) => {
    return (dispatch: MigrationToWorkbookDispatch) => {
        dispatch({
            type: MIGRATE_ENTRIES_TO_WORKBOOK_LOADING,
        });
        return getSdk()
            .sdk.us.migrateEntriesToWorkbookByCopy(params)
            .then((data) => {
                dispatch({
                    type: MIGRATE_ENTRIES_TO_WORKBOOK_SUCCESS,
                    data: data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('migrationToWorkbook/migrateEntriesToWorkbook failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: MIGRATE_ENTRIES_TO_WORKBOOK_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

export type MigrationToWorkbookAction =
    | ResetStateAction
    | GetEntryAction
    | GetRelationsGraphAction
    | GetRelationsAction
    | MigrateEntriesToWorkbookAction;

export type MigrationToWorkbookDispatch = ThunkDispatch<
    DatalensGlobalState,
    void,
    MigrationToWorkbookAction
>;
