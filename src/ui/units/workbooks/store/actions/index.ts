import {DatalensGlobalState} from 'index';
import logger from 'libs/logger';
import {getSdk} from 'libs/schematic-sdk';
import {ThunkDispatch} from 'redux-thunk';
import {EntryScope} from 'shared';
import {showToast} from 'store/actions/toaster';

import type {
    DeleteEntryArgs,
    DeleteEntryResponse,
    GetCollectionBreadcrumbsResponse,
    GetWorkbookEntriesArgs,
    GetWorkbookEntriesResponse,
    RenameEntryResponse,
    WorkbookPermission,
    WorkbookWithPermissions,
} from '../../../../../shared/schema';
import {CreateEntryActionType} from '../../constants';
import {WorkbookEntriesFilters} from '../../types';
import {
    ADD_WORKBOOK_INFO,
    CHANGE_FILTERS,
    DELETE_ENTRY_FAILED,
    DELETE_ENTRY_INLINE,
    DELETE_ENTRY_LOADING,
    DELETE_ENTRY_SUCCESS,
    GET_WORKBOOK_BREADCRUMBS_FAILED,
    GET_WORKBOOK_BREADCRUMBS_LOADING,
    GET_WORKBOOK_BREADCRUMBS_SUCCESS,
    GET_WORKBOOK_ENTRIES_FAILED,
    GET_WORKBOOK_ENTRIES_LOADING,
    GET_WORKBOOK_ENTRIES_SUCCESS,
    GET_WORKBOOK_FAILED,
    GET_WORKBOOK_LOADING,
    GET_WORKBOOK_SUCCESS,
    RENAME_ENTRY_FAILED,
    RENAME_ENTRY_INLINE,
    RENAME_ENTRY_LOADING,
    RENAME_ENTRY_SUCCESS,
    RESET_CREATE_WORKBOOK_ENTRY_TYPE,
    RESET_WORKBOOK_ENTRIES,
    RESET_WORKBOOK_PERMISSIONS,
    RESET_WORKBOOK_STATE,
    SET_CREATE_WORKBOOK_ENTRY_TYPE,
} from '../constants';

type GetWorkbookLoadingAction = {
    type: typeof GET_WORKBOOK_LOADING;
};
type GetWorkbookSuccessAction = {
    type: typeof GET_WORKBOOK_SUCCESS;
    data: WorkbookWithPermissions;
};
type GetWorkbookFailedAction = {
    type: typeof GET_WORKBOOK_FAILED;
    error: Error;
};
type GetWorkbookAction =
    | GetWorkbookLoadingAction
    | GetWorkbookSuccessAction
    | GetWorkbookFailedAction;

export const getWorkbook = ({workbookId}: {workbookId: string}) => {
    return async (dispatch: WorkbooksDispatch) => {
        dispatch({
            type: GET_WORKBOOK_LOADING,
        });
        try {
            const data = await getSdk().us.getWorkbook(
                {
                    workbookId,
                    includePermissionsInfo: true,
                },
                {concurrentId: 'workbooks/getWorkbook'},
            );
            dispatch({
                type: GET_WORKBOOK_SUCCESS,
                data: data as WorkbookWithPermissions,
            });
        } catch (error) {
            if (getSdk().isCancel(error)) {
                return;
            }
            logger.logError('workbooks/getWorkbook failed', error);
            dispatch({
                type: GET_WORKBOOK_FAILED,
                error,
            });
        }
    };
};

type GetWorkbookBreadcrumbsLoadingAction = {
    type: typeof GET_WORKBOOK_BREADCRUMBS_LOADING;
};
type GetWorkbookBreadcrumbsSuccessAction = {
    type: typeof GET_WORKBOOK_BREADCRUMBS_SUCCESS;
    data: GetCollectionBreadcrumbsResponse;
};
type GetWorkbookBreadcrumbsFailedAction = {
    type: typeof GET_WORKBOOK_BREADCRUMBS_FAILED;
    error: Error;
};

type GetWorkbookBreadcrumbsAction =
    | GetWorkbookBreadcrumbsLoadingAction
    | GetWorkbookBreadcrumbsSuccessAction
    | GetWorkbookBreadcrumbsFailedAction;

export const getWorkbookBreadcrumbs = ({collectionId}: {collectionId: string}) => {
    return async (dispatch: WorkbooksDispatch) => {
        dispatch({
            type: GET_WORKBOOK_BREADCRUMBS_LOADING,
        });
        try {
            const data = await getSdk().us.getCollectionBreadcrumbs(
                {
                    collectionId,
                },
                {concurrentId: 'workbooks/getCollectionBreadcrumbs'},
            );
            dispatch({
                type: GET_WORKBOOK_BREADCRUMBS_SUCCESS,
                data,
            });
        } catch (error) {
            const isCanceled = getSdk().isCancel(error);

            dispatch({
                type: GET_WORKBOOK_BREADCRUMBS_FAILED,
                error: isCanceled ? null : error,
            });
        }
    };
};

type GetWorkbookEntriesLoadingAction = {
    type: typeof GET_WORKBOOK_ENTRIES_LOADING;
};
type GetWorkbookEntriesSuccessAction = {
    type: typeof GET_WORKBOOK_ENTRIES_SUCCESS;
    data: GetWorkbookEntriesResponse;
};
type GetWorkbookEntriesFailedAction = {
    type: typeof GET_WORKBOOK_ENTRIES_FAILED;
    error: Error;
};
type GetWorkbookEntriesAction =
    | GetWorkbookEntriesLoadingAction
    | GetWorkbookEntriesSuccessAction
    | GetWorkbookEntriesFailedAction;

export const getWorkbookEntries = ({
    workbookId,
    filters,
    scope,
    nextPageToken,
}: {
    workbookId: string;
    filters: WorkbookEntriesFilters;
    scope?: EntryScope;
    nextPageToken?: string;
}) => {
    return async (dispatch: WorkbooksDispatch) => {
        dispatch({
            type: GET_WORKBOOK_ENTRIES_LOADING,
        });

        const args: GetWorkbookEntriesArgs = {
            workbookId,
            pageSize: 200,
            page: Number(nextPageToken || 0),
            orderBy: {
                field: filters.orderField,
                direction: filters.orderDirection,
            },
            scope,
        };

        if (filters.filterString) {
            args.filters = {
                name: filters.filterString,
            };
        }

        try {
            const data = await getSdk().us.getWorkbookEntries(args, {
                concurrentId: 'workbooks/getWorkbookEntries',
            });
            dispatch({
                type: GET_WORKBOOK_ENTRIES_SUCCESS,
                data,
            });
        } catch (error) {
            if (getSdk().isCancel(error)) {
                return;
            }
            logger.logError('workbooks/getWorkbookEntries failed', error);
            dispatch(
                showToast({
                    title: error.message,
                    error,
                }),
            );
            dispatch({
                type: GET_WORKBOOK_ENTRIES_FAILED,
                error,
            });
        }
    };
};

type ResetWorkbookEntriesAction = {
    type: typeof RESET_WORKBOOK_ENTRIES;
};

export const resetWorkbookEntries = () => {
    return (dispatch: WorkbooksDispatch) => {
        dispatch({type: RESET_WORKBOOK_ENTRIES});
    };
};

type SetCreateWorkbookEntryTypeAction = {
    type: typeof SET_CREATE_WORKBOOK_ENTRY_TYPE;
    data: CreateEntryActionType;
};

export const setCreateWorkbookEntryType = (type: CreateEntryActionType) => {
    return (dispatch: WorkbooksDispatch) => {
        dispatch({
            type: SET_CREATE_WORKBOOK_ENTRY_TYPE,
            data: type,
        });
    };
};

type ResetCreateWorkbookEntryTypeAction = {
    type: typeof RESET_CREATE_WORKBOOK_ENTRY_TYPE;
};

export const resetCreateWorkbookEntryType = () => {
    return (dispatch: WorkbooksDispatch) => {
        dispatch({type: RESET_CREATE_WORKBOOK_ENTRY_TYPE});
    };
};

type RenameEntryLoadingAction = {
    type: typeof RENAME_ENTRY_LOADING;
};
type RenameEntrySuccessAction = {
    type: typeof RENAME_ENTRY_SUCCESS;
    data: RenameEntryResponse;
};
type RenameEntryFailedAction = {
    type: typeof RENAME_ENTRY_FAILED;
    error: Error;
};
type RenameEntryInlineAction = {
    type: typeof RENAME_ENTRY_INLINE;
    data: RenameEntryResponse;
};
type RenameEntryAction =
    | RenameEntryLoadingAction
    | RenameEntrySuccessAction
    | RenameEntryFailedAction
    | RenameEntryInlineAction;

export const renameEntry = ({
    entryId,
    name,
    updateInline = false,
}: {
    entryId: string;
    name: string;
    updateInline: boolean;
}) => {
    return (dispatch: WorkbooksDispatch) => {
        dispatch({
            type: RENAME_ENTRY_LOADING,
        });
        return getSdk()
            .us.renameEntry({
                entryId,
                name,
            })
            .then((data) => {
                dispatch({
                    type: RENAME_ENTRY_SUCCESS,
                    data,
                });
                if (updateInline) {
                    dispatch({
                        type: RENAME_ENTRY_INLINE,
                        data,
                    });
                }
                return data;
            })
            .catch((error) => {
                if (!getSdk().isCancel(error)) {
                    logger.logError('workbooks/renameEntry failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }
                dispatch({
                    type: RENAME_ENTRY_FAILED,
                    error,
                });
                return null;
            });
    };
};

type DeleteEntryLoadingAction = {
    type: typeof DELETE_ENTRY_LOADING;
};
type DeleteEntrySuccessAction = {
    type: typeof DELETE_ENTRY_SUCCESS;
    data: DeleteEntryResponse;
};
type DeleteEntryFailedAction = {
    type: typeof DELETE_ENTRY_FAILED;
    error: Error;
};
type DeleteEntryInlineAction = {
    type: typeof DELETE_ENTRY_INLINE;
    data: {
        entryId: string;
    };
};
type DeleteEntryAction =
    | DeleteEntryLoadingAction
    | DeleteEntrySuccessAction
    | DeleteEntryFailedAction
    | DeleteEntryInlineAction;

export const deleteEntry = ({
    entryId,
    scope,
    deleteInline = false,
}: {
    entryId: string;
    scope: DeleteEntryArgs['scope'];
    deleteInline?: boolean;
}) => {
    return (dispatch: WorkbooksDispatch) => {
        dispatch({
            type: DELETE_ENTRY_LOADING,
        });
        return getSdk()
            .mix.deleteEntry({
                entryId,
                scope,
            })
            .then((data) => {
                dispatch({
                    type: DELETE_ENTRY_SUCCESS,
                    data,
                });
                if (deleteInline) {
                    dispatch({
                        type: DELETE_ENTRY_INLINE,
                        data: {
                            entryId,
                        },
                    });
                }
                return data;
            })
            .catch((error) => {
                if (!getSdk().isCancel(error)) {
                    logger.logError('workbooks/deleteEntry failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }
                dispatch({
                    type: DELETE_ENTRY_FAILED,
                    error,
                });
                return null;
            });
    };
};

type ResetWorkbookStateAction = {
    type: typeof RESET_WORKBOOK_STATE;
};

export const resetWorkbookState = () => {
    return (dispatch: WorkbooksDispatch) => {
        dispatch({type: RESET_WORKBOOK_STATE});
    };
};

type ChangeFiltersAction = {
    type: typeof CHANGE_FILTERS;
    data: Partial<WorkbookEntriesFilters>;
};

export const changeFilters = (data: Partial<WorkbookEntriesFilters>) => {
    return (dispatch: WorkbooksDispatch) => {
        dispatch({type: CHANGE_FILTERS, data});
    };
};

type AddWorkbookInfoAction = {
    type: typeof ADD_WORKBOOK_INFO;
    data: {
        workbookId: string;
        workbookName: string;
        workbookPermissions: WorkbookPermission;
        workbookBreadcrumbs?: GetCollectionBreadcrumbsResponse | null;
    };
};

export const addWorkbookInfo = (workbookId: string, withBreadcrumbs = false) => {
    return async (dispatch: WorkbooksDispatch) => {
        const workbook = await getSdk().us.getWorkbook({workbookId, includePermissionsInfo: true});

        let workbookBreadcrumbs = null;
        let requestedWithBreadcrumbs = false;

        if (withBreadcrumbs && workbook.collectionId) {
            try {
                workbookBreadcrumbs = await getSdk().us.getCollectionBreadcrumbs(
                    {
                        collectionId: workbook.collectionId,
                    },
                    {concurrentId: 'workbooks/getCollectionBreadcrumbs'},
                );

                dispatch({
                    type: ADD_WORKBOOK_INFO,
                    data: {
                        workbookId,
                        workbookName: workbook.title,
                        workbookPermissions: workbook.permissions,
                        workbookBreadcrumbs,
                    },
                });

                // If we have permissions for getting breadcrumbs, set flag to exclude the next request
                requestedWithBreadcrumbs = true;
            } catch (e) {
                logger.logError('workbooks/getCollectionBreadcrumbs failed', e);
            }
        }

        if (!requestedWithBreadcrumbs) {
            dispatch({
                type: ADD_WORKBOOK_INFO,
                data: {
                    workbookId,
                    workbookName: workbook.title,
                    workbookPermissions: workbook.permissions,
                },
            });
        }
    };
};

type ResetWorkbookPermissionsAction = {
    type: typeof RESET_WORKBOOK_PERMISSIONS;
};

export const resetWorkbookPermissions = () => {
    return (dispatch: WorkbooksDispatch) => {
        dispatch({type: RESET_WORKBOOK_PERMISSIONS});
    };
};

export type WorkbooksAction =
    | GetWorkbookAction
    | GetWorkbookBreadcrumbsAction
    | GetWorkbookEntriesAction
    | ResetWorkbookEntriesAction
    | SetCreateWorkbookEntryTypeAction
    | ResetCreateWorkbookEntryTypeAction
    | RenameEntryAction
    | DeleteEntryAction
    | ResetWorkbookStateAction
    | ChangeFiltersAction
    | AddWorkbookInfoAction
    | ResetWorkbookPermissionsAction;

export type WorkbooksDispatch = ThunkDispatch<DatalensGlobalState, void, WorkbooksAction>;
