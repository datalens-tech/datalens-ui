import {DatalensGlobalState} from 'index';
import logger from 'libs/logger';
import {getSdk} from 'libs/schematic-sdk';
import {ThunkDispatch} from 'redux-thunk';
import {showToast} from 'store/actions/toaster';

import type {
    CollectionWithPermissions,
    CopyWorkbookTemplateResponse,
    DeleteCollectionResponse,
    DeleteWorkbookResponse,
    GetCollectionBreadcrumbsResponse,
    GetCollectionContentResponse,
    GetRootCollectionPermissionsResponse,
} from '../../../../../shared/schema';
import {GetCollectionContentMode} from '../../../../../shared/schema/us/types/collections';
import {OrderBasicField, OrderDirection} from '../../../../../shared/schema/us/types/sort';
import {waitOperation} from '../../../../utils/waitOperation';
import {
    ADD_DEMO_WORKBOOK_FAILED,
    ADD_DEMO_WORKBOOK_LOADING,
    ADD_DEMO_WORKBOOK_SUCCESS,
    DELETE_COLLECTION_FAILED,
    DELETE_COLLECTION_IN_ITEMS,
    DELETE_COLLECTION_LOADING,
    DELETE_COLLECTION_SUCCESS,
    DELETE_WORKBOOK_FAILED,
    DELETE_WORKBOOK_IN_ITEMS,
    DELETE_WORKBOOK_LOADING,
    DELETE_WORKBOOK_SUCCESS,
    GET_COLLECTION_BREADCRUMBS_FAILED,
    GET_COLLECTION_BREADCRUMBS_LOADING,
    GET_COLLECTION_BREADCRUMBS_SUCCESS,
    GET_COLLECTION_CONTENT_FAILED,
    GET_COLLECTION_CONTENT_LOADING,
    GET_COLLECTION_CONTENT_SUCCESS,
    GET_COLLECTION_FAILED,
    GET_COLLECTION_LOADING,
    GET_COLLECTION_SUCCESS,
    GET_ROOT_COLLECTION_PERMISSIONS_FAILED,
    GET_ROOT_COLLECTION_PERMISSIONS_LOADING,
    GET_ROOT_COLLECTION_PERMISSIONS_SUCCESS,
    RESET_COLLECTION_CONTENT,
    RESET_COLLECTION_INFO,
} from '../constants';

type GetRootCollectionPermissionsLoadingAction = {
    type: typeof GET_ROOT_COLLECTION_PERMISSIONS_LOADING;
};
type GetRootCollectionPermissionsSuccessAction = {
    type: typeof GET_ROOT_COLLECTION_PERMISSIONS_SUCCESS;
    data: GetRootCollectionPermissionsResponse;
};
type GetRootCollectionPermissionsFailedAction = {
    type: typeof GET_ROOT_COLLECTION_PERMISSIONS_FAILED;
    error: Error | null;
};
type GetRootCollectionPemissionsAction =
    | GetRootCollectionPermissionsLoadingAction
    | GetRootCollectionPermissionsSuccessAction
    | GetRootCollectionPermissionsFailedAction;

export const getRootCollectionPermissions = () => {
    return (dispatch: CollectionsDispatch) => {
        dispatch({
            type: GET_ROOT_COLLECTION_PERMISSIONS_LOADING,
        });
        return getSdk()
            .us.getRootCollectionPermissions()
            .then((data) => {
                dispatch({
                    type: GET_ROOT_COLLECTION_PERMISSIONS_SUCCESS,
                    data: data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collections/getRootCollectionPermissions failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: GET_ROOT_COLLECTION_PERMISSIONS_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type GetCollectionsContentLoadingAction = {
    type: typeof GET_COLLECTION_CONTENT_LOADING;
};
type GetCollectionsContentSuccessAction = {
    type: typeof GET_COLLECTION_CONTENT_SUCCESS;
    data: GetCollectionContentResponse;
};
type GetCollectionsContentFailedAction = {
    type: typeof GET_COLLECTION_CONTENT_FAILED;
    error: Error | null;
};
type GetCollectionsContentAction =
    | GetCollectionsContentLoadingAction
    | GetCollectionsContentSuccessAction
    | GetCollectionsContentFailedAction;

export const getCollectionContent = ({
    collectionId,
    collectionsPage,
    workbooksPage,
    filterString,
    orderField,
    orderDirection,
    onlyMy,
    mode,
    pageSize,
}: {
    collectionId: string | null;
    collectionsPage?: string | null;
    workbooksPage?: string | null;
    filterString?: string;
    orderField?: OrderBasicField;
    orderDirection?: OrderDirection;
    onlyMy?: boolean;
    mode?: GetCollectionContentMode;
    pageSize?: number;
}) => {
    return (dispatch: CollectionsDispatch) => {
        dispatch({
            type: GET_COLLECTION_CONTENT_LOADING,
        });
        return getSdk()
            .us.getCollectionContent({
                collectionId,
                includePermissionsInfo: true,
                collectionsPage,
                workbooksPage,
                filterString,
                orderField,
                orderDirection,
                onlyMy,
                mode,
                pageSize,
            })
            .then((data) => {
                dispatch({
                    type: GET_COLLECTION_CONTENT_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collections/getCollectionContent failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: GET_COLLECTION_CONTENT_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type GetCollectionLoadingAction = {
    type: typeof GET_COLLECTION_LOADING;
};
type GetCollectionSuccessAction = {
    type: typeof GET_COLLECTION_SUCCESS;
    data: CollectionWithPermissions;
};
type GetCollectionFailedAction = {
    type: typeof GET_COLLECTION_FAILED;
    error: Error | null;
};
type GetCollectionAction =
    | GetCollectionLoadingAction
    | GetCollectionSuccessAction
    | GetCollectionFailedAction;

export const getCollection = ({collectionId}: {collectionId: string}) => {
    return (dispatch: CollectionsDispatch) => {
        dispatch({
            type: GET_COLLECTION_LOADING,
        });
        return getSdk()
            .us.getCollection({
                collectionId,
                includePermissionsInfo: true,
            })
            .then((data) => {
                dispatch({
                    type: GET_COLLECTION_SUCCESS,
                    data: data as CollectionWithPermissions,
                });
                return data as CollectionWithPermissions;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collections/getCollection failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: GET_COLLECTION_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
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
    return (dispatch: CollectionsDispatch) => {
        dispatch({
            type: GET_COLLECTION_BREADCRUMBS_LOADING,
        });
        return getSdk()
            .us.getCollectionBreadcrumbs({
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
                const isCanceled = getSdk().isCancel(error);

                dispatch({
                    type: GET_COLLECTION_BREADCRUMBS_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type ResetCollectionInfoAction = {
    type: typeof RESET_COLLECTION_INFO;
};

export const resetCollectionInfo = () => {
    return (dispatch: CollectionsDispatch) => {
        dispatch({
            type: RESET_COLLECTION_INFO,
        });
    };
};

type ResetCollectionContentAction = {
    type: typeof RESET_COLLECTION_CONTENT;
};

export const resetCollectionContent = () => {
    return (dispatch: CollectionsDispatch) => {
        dispatch({
            type: RESET_COLLECTION_CONTENT,
        });
    };
};

type DeleteCollectionLoadingAction = {
    type: typeof DELETE_COLLECTION_LOADING;
};
type DeleteCollectionSuccessAction = {
    type: typeof DELETE_COLLECTION_SUCCESS;
    data: DeleteCollectionResponse;
};
type DeleteCollectionFailedAction = {
    type: typeof DELETE_COLLECTION_FAILED;
    error: Error | null;
};
type DeleteCollectionInItemsAction = {
    type: typeof DELETE_COLLECTION_IN_ITEMS;
    data: {
        collectionId: string;
    };
};
type DeleteCollectionAction =
    | DeleteCollectionLoadingAction
    | DeleteCollectionSuccessAction
    | DeleteCollectionFailedAction
    | DeleteCollectionInItemsAction;

export const deleteCollection = ({
    collectionId,
    deleteInItems = false,
}: {
    collectionId: string;
    deleteInItems?: boolean;
}) => {
    return (dispatch: CollectionsDispatch) => {
        dispatch({
            type: DELETE_COLLECTION_LOADING,
        });
        return getSdk()
            .us.deleteCollection({
                collectionId,
            })
            .then((data) => {
                dispatch({
                    type: DELETE_COLLECTION_SUCCESS,
                    data,
                });
                if (deleteInItems) {
                    dispatch({
                        type: DELETE_COLLECTION_IN_ITEMS,
                        data: {
                            collectionId,
                        },
                    });
                }
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collections/deleteCollection failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: DELETE_COLLECTION_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type AddDemoWorkbookLoadingAction = {
    type: typeof ADD_DEMO_WORKBOOK_LOADING;
};
type AddDemoWorkbookSuccessAction = {
    type: typeof ADD_DEMO_WORKBOOK_SUCCESS;
    data: CopyWorkbookTemplateResponse;
};
type AddDemoWorkbookFailedAction = {
    type: typeof ADD_DEMO_WORKBOOK_FAILED;
    error: Error | null;
};
type AddDemoWorkbookAction =
    | AddDemoWorkbookLoadingAction
    | AddDemoWorkbookSuccessAction
    | AddDemoWorkbookFailedAction;

export const addDemoWorkbook = ({
    workbookId,
    collectionId,
    title,
}: {
    workbookId: string;
    collectionId: string | null;
    title: string;
}) => {
    return (dispatch: CollectionsDispatch) => {
        dispatch({
            type: ADD_DEMO_WORKBOOK_LOADING,
        });
        return getSdk()
            .us.copyWorkbookTemplate({
                workbookId,
                title,
                collectionId,
            })
            .then(async (result) => {
                const {operation} = result;
                if (operation && operation.id) {
                    await waitOperation({
                        operation,
                        loader: ({concurrentId}) =>
                            getSdk().us.getOperation({operationId: operation.id}, {concurrentId}),
                    }).promise;
                }
                return result;
            })
            .then((data) => {
                dispatch({
                    type: ADD_DEMO_WORKBOOK_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collections/addDemoWorkbook failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: ADD_DEMO_WORKBOOK_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type DeleteWorkbookLoadingAction = {
    type: typeof DELETE_WORKBOOK_LOADING;
};
type DeleteWorkbookSuccessAction = {
    type: typeof DELETE_WORKBOOK_SUCCESS;
    data: DeleteWorkbookResponse;
};
type DeleteWorkbookFailedAction = {
    type: typeof DELETE_WORKBOOK_FAILED;
    error: Error | null;
};
type DeleteWorkbookInItemsAction = {
    type: typeof DELETE_WORKBOOK_IN_ITEMS;
    data: {
        workbookId: string;
    };
};
type DeleteWorkbookAction =
    | DeleteWorkbookLoadingAction
    | DeleteWorkbookSuccessAction
    | DeleteWorkbookFailedAction
    | DeleteWorkbookInItemsAction;

export const deleteWorkbook = ({
    workbookId,
    deleteInItems = false,
}: {
    workbookId: string;
    deleteInItems?: boolean;
}) => {
    return (dispatch: CollectionsDispatch) => {
        dispatch({
            type: DELETE_WORKBOOK_LOADING,
        });
        return getSdk()
            .us.deleteWorkbook({
                workbookId,
            })
            .then((data) => {
                dispatch({
                    type: DELETE_WORKBOOK_SUCCESS,
                    data,
                });
                if (deleteInItems) {
                    dispatch({
                        type: DELETE_WORKBOOK_IN_ITEMS,
                        data: {
                            workbookId,
                        },
                    });
                }
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collections/deleteWorkbook failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: DELETE_WORKBOOK_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

export type CollectionsAction =
    | GetRootCollectionPemissionsAction
    | GetCollectionsContentAction
    | GetCollectionAction
    | GetCollectionBreadcrumbsAction
    | ResetCollectionInfoAction
    | ResetCollectionContentAction
    | DeleteCollectionAction
    | AddDemoWorkbookAction
    | DeleteWorkbookAction;

export type CollectionsDispatch = ThunkDispatch<DatalensGlobalState, void, CollectionsAction>;
