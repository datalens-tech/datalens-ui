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
    GET_RELATIONS_LOADING,
    GET_RELATIONS_SUCCESS,
    GET_RELATIONS_FAILED,
    COPY_ENTRIES_TO_WORKBOOK_LOADING,
    COPY_ENTRIES_TO_WORKBOOK_SUCCESS,
    COPY_ENTRIES_TO_WORKBOOK_FAILED,
} from '../constants/copyEntriesToWorkbook';

import type {
    CopyEntriesToWorkbookArgs,
    GetEntryArgs,
    GetEntryResponse,
    GetRelationsArgs,
    GetRelationsResponse,
} from '../../../shared/schema';

type ResetStateAction = {
    type: typeof RESET_STATE;
};

export const resetState = () => (dispatch: CopyingEntriesToWorkbookDispatch) => {
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
    return (dispatch: CopyingEntriesToWorkbookDispatch) => {
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
                    logger.logError('copyEntryToWorkbook/getEntry failed', error);
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
    return (dispatch: CopyingEntriesToWorkbookDispatch) => {
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
                    logger.logError('copyEntryToWorkbook/getRelations failed', error);
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

type CopyEntriesToWorkbookLoadingAction = {
    type: typeof COPY_ENTRIES_TO_WORKBOOK_LOADING;
};
type CopyEntriesToWorkbookSuccessAction = {
    type: typeof COPY_ENTRIES_TO_WORKBOOK_SUCCESS;
    data: any;
};
type CopyEntriesToWorkbookFailedAction = {
    type: typeof COPY_ENTRIES_TO_WORKBOOK_FAILED;
    error: Error | null;
};
type CopyEntryToWorkbookAction =
    | CopyEntriesToWorkbookLoadingAction
    | CopyEntriesToWorkbookSuccessAction
    | CopyEntriesToWorkbookFailedAction;

export const copyEntriesToWorkbook = (params: CopyEntriesToWorkbookArgs) => {
    return (dispatch: CopyingEntriesToWorkbookDispatch) => {
        dispatch({
            type: COPY_ENTRIES_TO_WORKBOOK_LOADING,
        });
        return getSdk()
            .sdk.us.copyEntriesToWorkbook(params)
            .then((data) => {
                dispatch({
                    type: COPY_ENTRIES_TO_WORKBOOK_SUCCESS,
                    data: data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('copyEntriesToWorkbook/copyEntriesToWorkbook failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: COPY_ENTRIES_TO_WORKBOOK_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

export type CopyingEntiesToWorkbookAction =
    | ResetStateAction
    | GetEntryAction
    | GetRelationsAction
    | CopyEntryToWorkbookAction;

export type CopyingEntriesToWorkbookDispatch = ThunkDispatch<
    DatalensGlobalState,
    void,
    CopyingEntiesToWorkbookAction
>;
