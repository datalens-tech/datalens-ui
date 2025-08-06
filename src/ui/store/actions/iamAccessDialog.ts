import type {ThunkDispatch} from 'redux-thunk';
import {DL, type DatalensGlobalState} from 'index';

import {showToast} from './toaster';
import {waitOperation} from '../../utils/waitOperation';
import {
    RESET_STATE,
    LIST_ACCESS_BINDINGS_LOADING,
    LIST_ACCESS_BINDINGS_SUCCESS,
    LIST_ACCESS_BINDINGS_FAILED,
    UPDATE_ACCESS_BINDINGS_LOADING,
    UPDATE_ACCESS_BINDINGS_SUCCESS,
    UPDATE_ACCESS_BINDINGS_FAILED,
    UPDATE_LIST_ACCESS_BINDINGS_INLINE,
    GET_COLLECTION_BREADCRUMBS_LOADING,
    GET_COLLECTION_BREADCRUMBS_SUCCESS,
    GET_COLLECTION_BREADCRUMBS_FAILED,
    GET_CLAIMS_LOADING,
    GET_CLAIMS_SUCCESS,
    GET_CLAIMS_FAILED,
    SUGGEST_BATCH_LIST_MEMBERS_LOADING,
    SUGGEST_BATCH_LIST_MEMBERS_SUCCESS,
    SUGGEST_BATCH_LIST_MEMBERS_FAILED,
} from '../constants/iamAccessDialog';
import type {
    AccessBindingDelta,
    ListCollectionAccessBindingsResponse,
    ListWorkbookAccessBindingsResponse,
    PageTokenData,
    GetClaimsResponse,
    GetClaimsArgs,
    SubjectClaims,
} from '../../../shared/schema/extensions/types';
import type {
    GetDatalensOperationResponse,
    GetCollectionBreadcrumbsResponse,
} from '../../../shared/schema';
import {getSdk} from 'libs/schematic-sdk';
import type {SuggestBatchListMembersArgs} from '../typings/iamAccessDialog';

export enum ResourceType {
    Collection = 'collection',
    Workbook = 'workbook',
}

type ResetStateAction = {
    type: typeof RESET_STATE;
};

const BATCH_LIST_MEMBERS_PAGE_SIZE = 10;

export const resetState = () => (dispatch: IamAccessDialogDispatch) => {
    dispatch({
        type: RESET_STATE,
    });
};

type UpdatedItemInListAccessBindings = {
    roleId: string;
    resourceId: string;
    subjectId: string;
};

type ListAccessBindingsLoadingAction = {
    type: typeof LIST_ACCESS_BINDINGS_LOADING;
};
type ListAccessBindingsSuccessAction = {
    type: typeof LIST_ACCESS_BINDINGS_SUCCESS;
    data: ListCollectionAccessBindingsResponse | ListWorkbookAccessBindingsResponse;
};
type ListAccessBindingsFailedAction = {
    type: typeof LIST_ACCESS_BINDINGS_FAILED;
    error: Error | null;
};

type UpdateListAccessBindingsInlineAction = {
    type: typeof UPDATE_LIST_ACCESS_BINDINGS_INLINE;
    data: UpdatedItemInListAccessBindings;
};

type ListAccessBindingsAction =
    | ListAccessBindingsLoadingAction
    | ListAccessBindingsSuccessAction
    | ListAccessBindingsFailedAction;

export const updateListAccessBindingsInline = (updatedBinding: UpdatedItemInListAccessBindings) => {
    return (dispatch: IamAccessDialogDispatch) => {
        dispatch({
            type: UPDATE_LIST_ACCESS_BINDINGS_INLINE,
            data: updatedBinding,
        });
    };
};

export const listAccessBindings = ({
    resourceId,
    resourceType,
    withInherits = false,
    pageTokenData,
}: {
    resourceId: string;
    resourceType: ResourceType;
    withInherits?: boolean;
    pageTokenData?: PageTokenData;
}) => {
    return (dispatch: IamAccessDialogDispatch) => {
        const restArgs = {
            withInherits,
            pageSize: 100,
            pageTokenData,
        };

        dispatch({
            type: LIST_ACCESS_BINDINGS_LOADING,
        });

        const thenHandler = (
            data: ListCollectionAccessBindingsResponse | ListWorkbookAccessBindingsResponse,
        ) => {
            dispatch({
                type: LIST_ACCESS_BINDINGS_SUCCESS,
                data,
            });

            return data;
        };

        const catchHandler = (error: Error) => {
            const isCanceled = getSdk().sdk.isCancel(error);

            if (!isCanceled) {
                dispatch(
                    showToast({
                        title: error.message,
                        error,
                    }),
                );
            }

            dispatch({
                type: LIST_ACCESS_BINDINGS_FAILED,
                error: isCanceled ? null : error,
            });

            return null;
        };

        if (resourceType === ResourceType.Collection) {
            return getSdk()
                .sdk.extensions.listCollectionAccessBindings({
                    collectionId: resourceId,
                    ...restArgs,
                })
                .then(thenHandler)
                .catch(catchHandler);
        } else {
            return getSdk()
                .sdk.extensions.listWorkbookAccessBindings({
                    workbookId: resourceId,
                    ...restArgs,
                })
                .then(thenHandler)
                .catch(catchHandler);
        }
    };
};

type UpdateAccessBindingsLoadingAction = {
    type: typeof UPDATE_ACCESS_BINDINGS_LOADING;
};
type UpdateAccessBindingsSuccessAction = {
    type: typeof UPDATE_ACCESS_BINDINGS_SUCCESS;
    data: GetDatalensOperationResponse;
};
type UpdateAccessBindingsFailedAction = {
    type: typeof UPDATE_ACCESS_BINDINGS_FAILED;
    error: Error | null;
};

type UpdateAccessBindingsAction =
    | UpdateAccessBindingsLoadingAction
    | UpdateAccessBindingsSuccessAction
    | UpdateAccessBindingsFailedAction;

export const updateAccessBindings = ({
    resourceId,
    resourceType,
    deltas,
}: {
    resourceId: string;
    resourceType: ResourceType;
    deltas: AccessBindingDelta[];
}) => {
    return (dispatch: IamAccessDialogDispatch) => {
        dispatch({
            type: UPDATE_ACCESS_BINDINGS_LOADING,
        });

        const thenHandler = (data: GetDatalensOperationResponse) => {
            dispatch({
                type: UPDATE_ACCESS_BINDINGS_SUCCESS,
                data,
            });

            return data;
        };

        const catchHandler = (error: Error) => {
            const isCanceled = getSdk().sdk.isCancel(error);

            if (!isCanceled) {
                dispatch(
                    showToast({
                        title: error.message,
                        error,
                    }),
                );
            }

            dispatch({
                type: UPDATE_ACCESS_BINDINGS_FAILED,
                error: isCanceled ? null : error,
            });

            return null;
        };

        const thenWaitOperation = async (operation: GetDatalensOperationResponse) => {
            if (operation && operation.id) {
                await waitOperation({
                    operation,
                    loader: ({concurrentId}) =>
                        getSdk().sdk.us.getOperation({operationId: operation.id}, {concurrentId}),
                }).promise;
            }
            return operation;
        };

        if (resourceType === ResourceType.Collection) {
            return getSdk()
                .sdk.extensions.updateCollectionAccessBindings({
                    collectionId: resourceId,
                    deltas,
                })
                .then(thenWaitOperation)
                .then(thenHandler)
                .catch(catchHandler);
        } else {
            return getSdk()
                .sdk.extensions.updateWorkbookAccessBindings({
                    workbookId: resourceId,
                    deltas,
                })
                .then(thenWaitOperation)
                .then(thenHandler)
                .catch(catchHandler);
        }
    };
};

type GetCollectionBreadcrumbsLoadingAction = {
    type: typeof GET_COLLECTION_BREADCRUMBS_LOADING;
};
type GetCollectionBreadcrumbsSuccessAction = {
    type: typeof GET_COLLECTION_BREADCRUMBS_SUCCESS;
    data: GetCollectionBreadcrumbsResponse;
};
type GetCollectionBreadcrumbsFailedAction = {
    type: typeof GET_COLLECTION_BREADCRUMBS_FAILED;
    error: Error | null;
};

type GetCollectionBreadcrumbsAction =
    | GetCollectionBreadcrumbsLoadingAction
    | GetCollectionBreadcrumbsSuccessAction
    | GetCollectionBreadcrumbsFailedAction;

export const getCollectionBreadcrumbs = ({collectionId}: {collectionId: string}) => {
    return (dispatch: IamAccessDialogDispatch) => {
        dispatch({
            type: GET_COLLECTION_BREADCRUMBS_LOADING,
        });

        return getSdk()
            .sdk.us.getCollectionBreadcrumbs({
                collectionId,
            })
            .then((data) => {
                dispatch({
                    type: GET_COLLECTION_BREADCRUMBS_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                dispatch({
                    type: GET_COLLECTION_BREADCRUMBS_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type GetClaimsLoadingAction = {
    type: typeof GET_CLAIMS_LOADING;
};
type GetClaimsSuccessAction = {
    type: typeof GET_CLAIMS_SUCCESS;
    data: GetClaimsResponse;
};
type GetClaimsFailedAction = {
    type: typeof GET_CLAIMS_FAILED;
    error: Error | null;
};

type GetClaimsAction = GetClaimsLoadingAction | GetClaimsSuccessAction | GetClaimsFailedAction;

export const batchListMembers = ({subjectIds}: GetClaimsArgs) => {
    return (dispatch: IamAccessDialogDispatch) => {
        dispatch({
            type: GET_CLAIMS_LOADING,
        });

        return getSdk()
            .sdk.extensions.getClaims({
                subjectIds,
                language: DL.USER_LANG,
            })
            .then((data) => {
                dispatch({
                    type: GET_CLAIMS_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: GET_CLAIMS_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type SuggestBatchListMembersLoadingAction = {
    type: typeof SUGGEST_BATCH_LIST_MEMBERS_LOADING;
};
type SuggestBatchListMembersSuccessAction = {
    type: typeof SUGGEST_BATCH_LIST_MEMBERS_SUCCESS;
    data: SubjectClaims[];
};
type SuggestBatchListMembersFailedAction = {
    type: typeof SUGGEST_BATCH_LIST_MEMBERS_FAILED;
    error: Error | null;
};

type SuggestBatchListMembersAction =
    | SuggestBatchListMembersLoadingAction
    | SuggestBatchListMembersSuccessAction
    | SuggestBatchListMembersFailedAction;

export const suggestBatchListMembers = ({
    id,
    search,
    tabId,
    pageToken,
    filter,
}: SuggestBatchListMembersArgs) => {
    return (dispatch: IamAccessDialogDispatch) => {
        dispatch({
            type: SUGGEST_BATCH_LIST_MEMBERS_LOADING,
        });

        return getSdk()
            .sdk.extensions.batchListMembers({
                id,
                search: search.toLowerCase(),
                tabId,
                pageSize: BATCH_LIST_MEMBERS_PAGE_SIZE,
                pageToken,
                filter,
                language: DL.USER_LANG,
            })
            .then((res) => {
                const {members, nextPageToken} = res;

                dispatch({
                    type: SUGGEST_BATCH_LIST_MEMBERS_SUCCESS,
                    data: members,
                });
                return {subjects: members, nextPageToken};
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: SUGGEST_BATCH_LIST_MEMBERS_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

export type IamAccessDialogAction =
    | ResetStateAction
    | ListAccessBindingsAction
    | UpdateAccessBindingsAction
    | GetCollectionBreadcrumbsAction
    | GetClaimsAction
    | SuggestBatchListMembersAction
    | UpdateListAccessBindingsInlineAction;

export type IamAccessDialogDispatch = ThunkDispatch<
    DatalensGlobalState,
    void,
    IamAccessDialogAction
>;
