import type {DatalensGlobalState} from 'index';
import logger from 'libs/logger';
import {getSdk} from 'libs/schematic-sdk';
import type {ThunkDispatch} from 'redux-thunk';
import {EntryScope} from 'shared';
import {showToast} from 'store/actions/toaster';
import {CounterName, GoalId, reachMetricaGoal} from 'ui/libs/metrica';

import type {
    AddFavoriteResponse,
    DeleteEntryResponse,
    DeleteFavoriteResponse,
    GetCollectionBreadcrumbsResponse,
    GetWorkbookEntriesArgs,
    GetWorkbookEntriesResponse,
    RenameEntryResponse,
    WorkbookPermission,
    WorkbookWithPermissions,
} from '../../../../../shared/schema';
import type {CreateEntryActionType} from '../../constants';
import type {WorkbookEntriesFilters, WorkbookEntry} from '../../types';
import {
    ADD_WORKBOOK_INFO,
    CHANGE_FAVORITE_ENTRY_FAILED,
    CHANGE_FAVORITE_ENTRY_INLINE,
    CHANGE_FAVORITE_ENTRY_LOADING,
    CHANGE_FAVORITE_ENTRY_SUCCESS,
    CHANGE_FILTERS,
    DELETE_ENTRY_FAILED,
    DELETE_ENTRY_INLINE,
    DELETE_ENTRY_LOADING,
    DELETE_ENTRY_SUCCESS,
    GET_ALL_WORKBOOK_ENTRIES_SEPARATELY_SUCCESS,
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
    RESET_WORKBOOK_ENTRIES_BY_SCOPE,
    RESET_WORKBOOK_PERMISSIONS,
    RESET_WORKBOOK_STATE,
    SET_CREATE_WORKBOOK_ENTRY_TYPE,
    SET_WORKBOOK,
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
            const data = await getSdk().sdk.us.getWorkbook(
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
            if (getSdk().sdk.isCancel(error)) {
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

type SetWorkbookAction = {
    type: typeof SET_WORKBOOK;
    data: {
        workbook: WorkbookWithPermissions;
    };
};

export const setWorkbook = (workbook: WorkbookWithPermissions) => {
    return {
        type: SET_WORKBOOK,
        data: {
            workbook,
        },
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
            const data = await getSdk().sdk.us.getCollectionBreadcrumbs(
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
            const isCanceled = getSdk().sdk.isCancel(error);

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
    pageSize = 200,
    ignoreConcurrentId = false,
}: {
    workbookId: string;
    filters: WorkbookEntriesFilters;
    scope?: EntryScope;
    nextPageToken?: string;
    pageSize?: number;
    ignoreConcurrentId?: boolean;
}) => {
    return async (dispatch: WorkbooksDispatch) => {
        dispatch({
            type: GET_WORKBOOK_ENTRIES_LOADING,
        });

        const args: GetWorkbookEntriesArgs = {
            workbookId,
            pageSize,
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
            const data = await getSdk().sdk.us.getWorkbookEntries(args, {
                concurrentId: ignoreConcurrentId ? undefined : 'workbooks/getWorkbookEntries',
            });
            dispatch({
                type: GET_WORKBOOK_ENTRIES_SUCCESS,
                data,
            });

            return data;
        } catch (error) {
            if (getSdk().sdk.isCancel(error)) {
                return null;
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

            return null;
        }
    };
};

type GetAllWorkbookEntriesSeparatelyLoadingAction = {
    type: typeof GET_WORKBOOK_ENTRIES_LOADING;
};
type GetAllWorkbookEntriesSeparatelySuccessAction = {
    type: typeof GET_ALL_WORKBOOK_ENTRIES_SEPARATELY_SUCCESS;
    data: (GetWorkbookEntriesResponse | null)[];
};
type GetAllWorkbookEntriesSeparatelyFailedAction = {
    type: typeof GET_WORKBOOK_ENTRIES_FAILED;
    error: Error;
};
type GetAllWorkbookEntriesSeparatelyAction =
    | GetAllWorkbookEntriesSeparatelyLoadingAction
    | GetAllWorkbookEntriesSeparatelySuccessAction
    | GetAllWorkbookEntriesSeparatelyFailedAction;

export const getAllWorkbookEntriesSeparately = ({
    workbookId,
    filters,
    scopes,
    pageSize = 200,
}: {
    workbookId: string;
    filters: WorkbookEntriesFilters;
    scopes: EntryScope[];
    pageSize?: number;
}) => {
    return async (dispatch: WorkbooksDispatch) => {
        dispatch({
            type: GET_WORKBOOK_ENTRIES_LOADING,
        });

        const args: GetWorkbookEntriesArgs = {
            workbookId,
            pageSize,
            page: 0,
            orderBy: {
                field: filters.orderField,
                direction: filters.orderDirection,
            },
        };

        if (filters.filterString) {
            args.filters = {
                name: filters.filterString,
            };
        }

        const promises = scopes.map((scope) => {
            return getSdk().sdk.us.getWorkbookEntries({
                ...args,
                scope,
            });
        });

        const results = await Promise.allSettled(promises);

        const data: (GetWorkbookEntriesResponse | null)[] = results.map((result) => {
            if (result.status === 'fulfilled') {
                return result.value;
            }

            if (result.status === 'rejected') {
                logger.logError('workbooks/getWorkbookEntries failed', result.reason);

                return null;
            }

            return null;
        });

        dispatch({
            type: GET_ALL_WORKBOOK_ENTRIES_SEPARATELY_SUCCESS,
            data,
        });

        return data;
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

type ResetWorkbookEntriesByScopeAction = {
    type: typeof RESET_WORKBOOK_ENTRIES_BY_SCOPE;
    data: EntryScope;
};

export const resetWorkbookEntriesByScope = (scope: EntryScope) => {
    return (dispatch: WorkbooksDispatch) => {
        dispatch({type: RESET_WORKBOOK_ENTRIES_BY_SCOPE, data: scope});
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
            .sdk.us.renameEntry({
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
                if (!getSdk().sdk.isCancel(error)) {
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

type ChangeFavoriteEntryLoadingAction = {
    type: typeof CHANGE_FAVORITE_ENTRY_LOADING;
};
type ChangeFavoriteEntrySuccessAction = {
    type: typeof CHANGE_FAVORITE_ENTRY_SUCCESS;
    data: AddFavoriteResponse | DeleteFavoriteResponse;
};
type ChangeFavoriteEntryFailedAction = {
    type: typeof CHANGE_FAVORITE_ENTRY_FAILED;
    error: Error;
};
type ChangeFavoriteEntryInlineAction = {
    type: typeof CHANGE_FAVORITE_ENTRY_INLINE;
    data: {
        entryId: string;
        isFavorite: boolean;
    };
};
type ChangeFavoriteEntryAction =
    | ChangeFavoriteEntryLoadingAction
    | ChangeFavoriteEntrySuccessAction
    | ChangeFavoriteEntryFailedAction
    | ChangeFavoriteEntryInlineAction;

export const changeFavoriteEntry = ({
    entryId,
    isFavorite = false,
    updateInline = false,
}: {
    entryId: string;
    isFavorite: boolean;
    updateInline?: boolean;
}) => {
    return (dispatch: WorkbooksDispatch) => {
        const thenHandler = (data: AddFavoriteResponse | DeleteFavoriteResponse) => {
            dispatch({
                type: CHANGE_FAVORITE_ENTRY_SUCCESS,
                data,
            });

            return data;
        };

        const catchHandler = (error: Error) => {
            if (!getSdk().sdk.isCancel(error)) {
                logger.logError('workbooks/changeFavoriteEntry failed', error);
                dispatch(
                    showToast({
                        title: error.message,
                        error,
                    }),
                );
            }
            dispatch({
                type: CHANGE_FAVORITE_ENTRY_FAILED,
                error,
            });

            if (updateInline) {
                dispatch({
                    type: CHANGE_FAVORITE_ENTRY_INLINE,
                    data: {
                        entryId,
                        isFavorite: !isFavorite,
                    },
                });
            }

            return null;
        };

        dispatch({
            type: CHANGE_FAVORITE_ENTRY_LOADING,
        });

        if (updateInline) {
            dispatch({
                type: CHANGE_FAVORITE_ENTRY_INLINE,
                data: {
                    entryId,
                    isFavorite,
                },
            });
        }

        if (isFavorite) {
            return getSdk()
                .sdk.us.addFavorite({
                    entryId,
                })
                .then(thenHandler)
                .catch(catchHandler);
        } else {
            return getSdk()
                .sdk.us.deleteFavorite({
                    entryId,
                })
                .then(thenHandler)
                .catch(catchHandler);
        }
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
    entry,
    deleteInline = false,
}: {
    entry: WorkbookEntry;
    deleteInline?: boolean;
}) => {
    return (dispatch: WorkbooksDispatch) => {
        const {entryId, scope} = entry;
        dispatch({
            type: DELETE_ENTRY_LOADING,
        });
        return getSdk()
            .sdk.mix.deleteEntry({
                entryId,
                scope,
            })
            .then((data) => {
                if (scope === EntryScope.Connection) {
                    reachMetricaGoal(CounterName.Main, GoalId.ConnectionDeleteSubmit, {
                        type: entry.type,
                    });
                }
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
                if (!getSdk().sdk.isCancel(error)) {
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
        const workbook = await getSdk().sdk.us.getWorkbook({
            workbookId,
            includePermissionsInfo: true,
        });

        let workbookBreadcrumbs = null;
        let requestedWithBreadcrumbs = false;

        if (withBreadcrumbs && workbook.collectionId) {
            try {
                workbookBreadcrumbs = await getSdk().sdk.us.getCollectionBreadcrumbs(
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
    | SetWorkbookAction
    | GetWorkbookBreadcrumbsAction
    | GetWorkbookEntriesAction
    | GetAllWorkbookEntriesSeparatelyAction
    | ResetWorkbookEntriesAction
    | ResetWorkbookEntriesByScopeAction
    | SetCreateWorkbookEntryTypeAction
    | ResetCreateWorkbookEntryTypeAction
    | RenameEntryAction
    | ChangeFavoriteEntryAction
    | DeleteEntryAction
    | ResetWorkbookStateAction
    | ChangeFiltersAction
    | AddWorkbookInfoAction
    | ResetWorkbookPermissionsAction;

export type WorkbooksDispatch = ThunkDispatch<DatalensGlobalState, void, WorkbooksAction>;
