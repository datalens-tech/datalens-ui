import type {ThunkDispatch} from 'redux-thunk';
import {getSdk} from 'libs/schematic-sdk';
import logger from 'libs/logger';
import type {DatalensGlobalState} from 'index';
import {waitOperation} from '../../utils/waitOperation';
import {showToast} from 'store/actions/toaster';

import type {GET_ROOT_COLLECTION_PERMISSIONS_FAILED} from '../constants/collectionsStructure';
import {
    DELETE_COLLECTIONS_FAILED,
    DELETE_COLLECTIONS_LOADING,
    DELETE_COLLECTIONS_SUCCESS,
    RESET_STATE,
    GET_ROOT_COLLECTION_PERMISSIONS_LOADING,
    GET_ROOT_COLLECTION_PERMISSIONS_SUCCESS,
    RESET_COLLECTION_BREADCRUMBS,
    GET_COLLECTION_BREADCRUMBS_LOADING,
    GET_COLLECTION_BREADCRUMBS_SUCCESS,
    GET_COLLECTION_BREADCRUMBS_FAILED,
    GET_COLLECTION_LOADING,
    GET_COLLECTION_SUCCESS,
    GET_COLLECTION_FAILED,
    RESET_STRUCTURE_ITEMS,
    GET_STRUCTURE_ITEMS_LOADING,
    GET_STRUCTURE_ITEMS_SUCCESS,
    GET_STRUCTURE_ITEMS_FAILED,
    CREATE_COLLECTION_LOADING,
    CREATE_COLLECTION_SUCCESS,
    CREATE_COLLECTION_FAILED,
    CREATE_WORKBOOK_LOADING,
    CREATE_WORKBOOK_SUCCESS,
    CREATE_WORKBOOK_FAILED,
    MOVE_COLLECTIONS_LOADING,
    MOVE_COLLECTIONS_SUCCESS,
    MOVE_COLLECTIONS_FAILED,
    MOVE_WORKBOOKS_LOADING,
    MOVE_WORKBOOKS_SUCCESS,
    MOVE_WORKBOOKS_FAILED,
    MOVE_COLLECTION_LOADING,
    MOVE_COLLECTION_SUCCESS,
    MOVE_COLLECTION_FAILED,
    MOVE_WORKBOOK_LOADING,
    MOVE_WORKBOOK_SUCCESS,
    MOVE_WORKBOOK_FAILED,
    COPY_WORKBOOK_LOADING,
    COPY_WORKBOOK_SUCCESS,
    COPY_WORKBOOK_FAILED,
    UPDATE_WORKBOOK_FAILED,
    UPDATE_WORKBOOK_LOADING,
    UPDATE_WORKBOOK_SUCCESS,
    UPDATE_COLLECTION_FAILED,
    UPDATE_COLLECTION_LOADING,
    UPDATE_COLLECTION_SUCCESS,
    COPY_TEMPLATE_LOADING,
    COPY_TEMPLATE_SUCCESS,
    COPY_TEMPLATE_FAILED,
    DELETE_COLLECTION_LOADING,
    DELETE_COLLECTION_SUCCESS,
    DELETE_COLLECTION_FAILED,
    DELETE_WORKBOOK_LOADING,
    DELETE_WORKBOOK_SUCCESS,
    DELETE_WORKBOOK_FAILED,
    DELETE_WORKBOOKS_FAILED,
    DELETE_WORKBOOKS_LOADING,
    DELETE_WORKBOOKS_SUCCESS,
    ADD_DEMO_WORKBOOK_LOADING,
    ADD_DEMO_WORKBOOK_SUCCESS,
    ADD_DEMO_WORKBOOK_FAILED,
} from '../constants/collectionsStructure';

import type {
    GetCollectionBreadcrumbsResponse,
    GetStructureItemsArgs,
    GetStructureItemsResponse,
    CreateCollectionResponse,
    GetRootCollectionPermissionsResponse,
    MoveCollectionResponse,
    MoveCollectionsResponse,
    MoveWorkbooksResponse,
    MoveWorkbookResponse,
    CollectionWithPermissions,
    CopyWorkbookResponse,
    CreateWorkbookResponse,
    UpdateWorkbookResponse,
    UpdateCollectionResponse,
    CopyTemplateResponse,
    DeleteCollectionResponse,
    DeleteWorkbookResponse,
    CopyWorkbookTemplateResponse,
    DeleteCollectionsResponse,
    DeleteWorkbooksResponse,
} from '../../../shared/schema';

type ResetStateAction = {
    type: typeof RESET_STATE;
};

export const resetState = () => (dispatch: CollectionsStructureDispatch) => {
    dispatch({
        type: RESET_STATE,
    });
};

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
    return (dispatch: CollectionsStructureDispatch) => {
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
                    logger.logError(
                        'collectionsStructure/getRootCollectionPermissions failed',
                        error,
                    );
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                return null;
            });
    };
};

type ResetCollectionBreadcrumbsAction = {
    type: typeof RESET_COLLECTION_BREADCRUMBS;
};

export const resetCollectionBreadcrumbs = () => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: RESET_COLLECTION_BREADCRUMBS,
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
    return (dispatch: CollectionsStructureDispatch) => {
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

                if (!isCanceled) {
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: GET_COLLECTION_BREADCRUMBS_FAILED,
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
    return (dispatch: CollectionsStructureDispatch) => {
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
                    logger.logError('collectionsStructure/getCollection failed', error);
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

type ResetStructureItemsAction = {
    type: typeof RESET_STRUCTURE_ITEMS;
};

export const resetStructureItems = () => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: RESET_STRUCTURE_ITEMS,
        });
    };
};

type GetStructureItemsLoadingAction = {
    type: typeof GET_STRUCTURE_ITEMS_LOADING;
};
type GetStructureItemsSuccessAction = {
    type: typeof GET_STRUCTURE_ITEMS_SUCCESS;
    data: GetStructureItemsResponse;
};
type GetStructureItemsFailedAction = {
    type: typeof GET_STRUCTURE_ITEMS_FAILED;
    error: Error | null;
};
type GetStructureItemsAction =
    | GetStructureItemsLoadingAction
    | GetStructureItemsSuccessAction
    | GetStructureItemsFailedAction;

export const getStructureItems = ({
    collectionId,
    page,
    filterString,
    orderField,
    orderDirection,
    onlyMy,
    mode,
    pageSize,
}: GetStructureItemsArgs) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: GET_STRUCTURE_ITEMS_LOADING,
        });
        return getSdk()
            .us.getStructureItems({
                collectionId,
                includePermissionsInfo: false,
                page,
                filterString,
                orderField,
                orderDirection,
                onlyMy,
                mode,
                pageSize,
            })
            .then((data) => {
                dispatch({
                    type: GET_STRUCTURE_ITEMS_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/getStructureItems failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: GET_STRUCTURE_ITEMS_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type CreateCollectionLoadingAction = {
    type: typeof CREATE_COLLECTION_LOADING;
};
type CreateCollectionSuccessAction = {
    type: typeof CREATE_COLLECTION_SUCCESS;
    data: CreateCollectionResponse;
};
type CreateCollectionFailedAction = {
    type: typeof CREATE_COLLECTION_FAILED;
    error: Error | null;
};
type CreateCollectionAction =
    | CreateCollectionLoadingAction
    | CreateCollectionSuccessAction
    | CreateCollectionFailedAction;

export const createCollection = ({
    title,
    description,
    parentId,
}: {
    title: string;
    description?: string;
    parentId: string | null;
}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: CREATE_COLLECTION_LOADING,
        });
        return getSdk()
            .us.createCollection({
                title,
                description,
                parentId,
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
                    type: CREATE_COLLECTION_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/createCollection failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: CREATE_COLLECTION_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type CopyTemplateLoadingAction = {
    type: typeof COPY_TEMPLATE_LOADING;
};
type CopyTemplateSuccessAction = {
    type: typeof COPY_TEMPLATE_SUCCESS;
    data: CopyTemplateResponse;
};
type CopyTemplateFailedAction = {
    type: typeof COPY_TEMPLATE_FAILED;
    error: Error | null;
};
type CopyTemplateAction =
    | CopyTemplateLoadingAction
    | CopyTemplateSuccessAction
    | CopyTemplateFailedAction;

export const copyTemplate = ({
    templateName,
    productId,
    workbookId,
    connectionId,
}: {
    templateName: string;
    workbookId: string;
    productId?: string;
    connectionId?: string;
}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: COPY_TEMPLATE_LOADING,
        });
        return getSdk()
            .us.copyTemplate({
                templateName,
                workbookId,
                connectionId,
                meta: {productId},
            })
            .then((data) => {
                dispatch({
                    type: COPY_TEMPLATE_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/copyTemplate failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: COPY_TEMPLATE_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type CreateWorkbookLoadingAction = {
    type: typeof CREATE_WORKBOOK_LOADING;
};
type CreateWorkbookSuccessAction = {
    type: typeof CREATE_WORKBOOK_SUCCESS;
    data: CreateWorkbookResponse;
};
type CreateWorkbookFailedAction = {
    type: typeof CREATE_WORKBOOK_FAILED;
    error: Error | null;
};
type CreateWorkbookAction =
    | CreateWorkbookLoadingAction
    | CreateWorkbookSuccessAction
    | CreateWorkbookFailedAction;

export const createWorkbook = ({
    title,
    description,
    collectionId,
}: {
    title: string;
    description?: string;
    collectionId: string | null;
}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: CREATE_WORKBOOK_LOADING,
        });
        return getSdk()
            .us.createWorkbook({
                title,
                description,
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
                    type: CREATE_WORKBOOK_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/createWorkbook failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: CREATE_WORKBOOK_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type DeleteWorkbooksLoadingAction = {
    type: typeof DELETE_WORKBOOKS_LOADING;
};
type DeleteWorkbooksSuccessAction = {
    type: typeof DELETE_WORKBOOKS_SUCCESS;
    data: DeleteWorkbooksResponse;
};
type DeleteWorkbooksFailedAction = {
    type: typeof DELETE_WORKBOOKS_FAILED;
    error: Error | null;
};
type DeleteWorkbooksAction =
    | DeleteWorkbooksLoadingAction
    | DeleteWorkbooksSuccessAction
    | DeleteWorkbooksFailedAction;

export const deleteWorkbooks = ({workbookIds}: {workbookIds: string[]}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: DELETE_WORKBOOKS_LOADING,
        });

        return getSdk()
            .us.deleteWorkbooks({
                workbookIds,
            })
            .then((data) => {
                dispatch({
                    type: DELETE_WORKBOOKS_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/deleteWorkbooks failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: DELETE_WORKBOOKS_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type DeleteCollectionsLoadingAction = {
    type: typeof DELETE_COLLECTIONS_LOADING;
};
type DeleteCollectionsSuccessAction = {
    type: typeof DELETE_COLLECTIONS_SUCCESS;
    data: DeleteCollectionsResponse;
};
type DeleteCollectionsFailedAction = {
    type: typeof DELETE_COLLECTIONS_FAILED;
    error: Error | null;
};
type DeleteCollectionsAction =
    | DeleteCollectionsLoadingAction
    | DeleteCollectionsSuccessAction
    | DeleteCollectionsFailedAction;

export const deleteCollections = ({collectionIds}: {collectionIds: string[]}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: DELETE_COLLECTIONS_LOADING,
        });

        return getSdk()
            .us.deleteCollections({
                collectionIds,
            })
            .then((data) => {
                dispatch({
                    type: DELETE_COLLECTIONS_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/deleteCollections failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: DELETE_COLLECTIONS_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type MoveCollectionsLoadingAction = {
    type: typeof MOVE_COLLECTIONS_LOADING;
};
type MoveCollectionsSuccessAction = {
    type: typeof MOVE_COLLECTIONS_SUCCESS;
    data: MoveCollectionsResponse;
};
type MoveCollectionsFailedAction = {
    type: typeof MOVE_COLLECTIONS_FAILED;
    error: Error | null;
};
type MoveCollectionsAction =
    | MoveCollectionsLoadingAction
    | MoveCollectionsSuccessAction
    | MoveCollectionsFailedAction;

export const moveCollections = ({
    collectionIds,
    parentId,
}: {
    collectionIds: string[];
    parentId: string | null;
}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: MOVE_COLLECTIONS_LOADING,
        });

        return getSdk()
            .us.moveCollections({
                collectionIds,
                parentId,
            })
            .then((data) => {
                dispatch({
                    type: MOVE_COLLECTIONS_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/moveCollections failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: MOVE_COLLECTIONS_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type MoveWorkbooksLoadingAction = {
    type: typeof MOVE_WORKBOOKS_LOADING;
};
type MoveWorkbooksSuccessAction = {
    type: typeof MOVE_WORKBOOKS_SUCCESS;
    data: MoveWorkbooksResponse;
};
type MoveWorkbooksFailedAction = {
    type: typeof MOVE_WORKBOOKS_FAILED;
    error: Error | null;
};
type MoveWorkbooksAction =
    | MoveWorkbooksLoadingAction
    | MoveWorkbooksSuccessAction
    | MoveWorkbooksFailedAction;

export const moveWorkbooks = ({
    workbookIds,
    collectionId,
}: {
    workbookIds: string[];
    collectionId: string | null;
}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: MOVE_WORKBOOKS_LOADING,
        });
        return getSdk()
            .us.moveWorkbooks({
                workbookIds,
                collectionId,
            })
            .then((data) => {
                dispatch({
                    type: MOVE_WORKBOOKS_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/moveWorkbooks failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: MOVE_WORKBOOKS_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type MoveCollectionLoadingAction = {
    type: typeof MOVE_COLLECTION_LOADING;
};
type MoveCollectionSuccessAction = {
    type: typeof MOVE_COLLECTION_SUCCESS;
    data: MoveCollectionResponse;
};
type MoveCollectionFailedAction = {
    type: typeof MOVE_COLLECTION_FAILED;
    error: Error | null;
};
type MoveCollectionAction =
    | MoveCollectionLoadingAction
    | MoveCollectionSuccessAction
    | MoveCollectionFailedAction;

export const moveCollection = ({
    collectionId,
    parentId,
    title,
}: {
    collectionId: string;
    parentId: string | null;
    title?: string;
}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: MOVE_COLLECTION_LOADING,
        });
        return getSdk()
            .us.moveCollection({
                collectionId,
                parentId,
                title,
            })
            .then((data) => {
                dispatch({
                    type: MOVE_COLLECTION_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/moveCollection failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: MOVE_COLLECTION_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type MoveWorkbookLoadingAction = {
    type: typeof MOVE_WORKBOOK_LOADING;
};
type MoveWorkbookSuccessAction = {
    type: typeof MOVE_WORKBOOK_SUCCESS;
    data: MoveWorkbookResponse;
};
type MoveWorkbookFailedAction = {
    type: typeof MOVE_WORKBOOK_FAILED;
    error: Error | null;
};
type MoveWorkbookAction =
    | MoveWorkbookLoadingAction
    | MoveWorkbookSuccessAction
    | MoveWorkbookFailedAction;

export const moveWorkbook = ({
    workbookId,
    collectionId,
    title,
}: {
    workbookId: string;
    collectionId: string | null;
    title?: string;
}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: MOVE_WORKBOOK_LOADING,
        });
        return getSdk()
            .us.moveWorkbook({
                workbookId,
                collectionId,
                title,
            })
            .then((data) => {
                dispatch({
                    type: MOVE_WORKBOOK_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/moveWorkbook failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: MOVE_WORKBOOK_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type CopyWorkbookLoadingAction = {
    type: typeof COPY_WORKBOOK_LOADING;
};
type CopyWorkbookSuccessAction = {
    type: typeof COPY_WORKBOOK_SUCCESS;
    data: CopyWorkbookResponse;
};
type CopyWorkbookFailedAction = {
    type: typeof COPY_WORKBOOK_FAILED;
    error: Error | null;
};
type CopyWorkbookAction =
    | CopyWorkbookLoadingAction
    | CopyWorkbookSuccessAction
    | CopyWorkbookFailedAction;

export const copyWorkbook = ({
    workbookId,
    collectionId,
    title,
}: {
    workbookId: string;
    collectionId: string | null;
    title?: string;
}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: COPY_WORKBOOK_LOADING,
        });
        return getSdk()
            .us.copyWorkbook({
                workbookId,
                collectionId,
                title,
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
                    type: COPY_WORKBOOK_SUCCESS,
                    data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/copyWorkbook failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: COPY_WORKBOOK_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type UpdateWorkbookLoadingAction = {
    type: typeof UPDATE_WORKBOOK_LOADING;
};
type UpdateWorkbookSuccessAction = {
    type: typeof UPDATE_WORKBOOK_SUCCESS;
    data: UpdateWorkbookResponse;
};
type UpdateWorkbookFailedAction = {
    type: typeof UPDATE_WORKBOOK_FAILED;
    error: Error | null;
};

type UpdateWorkbookAction =
    | UpdateWorkbookLoadingAction
    | UpdateWorkbookSuccessAction
    | UpdateWorkbookFailedAction;

export const updateWorkbook = ({
    workbookId,
    title,
    description,
}: {
    workbookId: string;
    title: string;
    description: string;
}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: UPDATE_WORKBOOK_LOADING,
        });
        return getSdk()
            .us.updateWorkbook({
                workbookId,
                title,
                description,
            })
            .then((data) => {
                dispatch({
                    type: UPDATE_WORKBOOK_SUCCESS,
                    data,
                });

                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/updateWorkbook failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: UPDATE_WORKBOOK_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type UpdateCollectionLoadingAction = {
    type: typeof UPDATE_COLLECTION_LOADING;
};
type UpdateCollectionSuccessAction = {
    type: typeof UPDATE_COLLECTION_SUCCESS;
    data: UpdateCollectionResponse;
};
type UpdateCollectionFailedAction = {
    type: typeof UPDATE_COLLECTION_FAILED;
    error: Error | null;
};

type UpdateCollectionAction =
    | UpdateCollectionLoadingAction
    | UpdateCollectionSuccessAction
    | UpdateCollectionFailedAction;

export const updateCollection = ({
    collectionId,
    title,
    description,
}: {
    collectionId: string;
    title: string;
    description: string;
}) => {
    return (dispatch: CollectionsStructureDispatch) => {
        dispatch({
            type: UPDATE_COLLECTION_LOADING,
        });
        return getSdk()
            .us.updateCollection({
                collectionId,
                title,
                description,
            })
            .then((data) => {
                dispatch({
                    type: UPDATE_COLLECTION_SUCCESS,
                    data,
                });

                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/updateCollection failed', error);
                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: UPDATE_COLLECTION_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
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
type DeleteCollectionAction =
    | DeleteCollectionLoadingAction
    | DeleteCollectionSuccessAction
    | DeleteCollectionFailedAction;

export const deleteCollection = ({collectionId}: {collectionId: string}) => {
    return (dispatch: CollectionsStructureDispatch) => {
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
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/deleteCollection failed', error);
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
type DeleteWorkbookAction =
    | DeleteWorkbookLoadingAction
    | DeleteWorkbookSuccessAction
    | DeleteWorkbookFailedAction;

export const deleteWorkbook = ({workbookId}: {workbookId: string}) => {
    return (dispatch: CollectionsStructureDispatch) => {
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
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().isCancel(error);

                if (!isCanceled) {
                    logger.logError('collectionsStructure/deleteWorkbook failed', error);
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
    return (dispatch: CollectionsStructureDispatch) => {
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
                    logger.logError('collectionsStructure/addDemoWorkbook failed', error);
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

export type CollectionsStructureAction =
    | ResetStateAction
    | GetRootCollectionPemissionsAction
    | ResetCollectionBreadcrumbsAction
    | GetCollectionBreadcrumbsAction
    | GetCollectionAction
    | ResetStructureItemsAction
    | GetStructureItemsAction
    | CreateCollectionAction
    | CreateWorkbookAction
    | CopyTemplateAction
    | MoveCollectionAction
    | MoveWorkbookAction
    | MoveCollectionsAction
    | MoveWorkbooksAction
    | DeleteCollectionsAction
    | DeleteWorkbooksAction
    | CopyWorkbookAction
    | UpdateWorkbookAction
    | UpdateCollectionAction
    | DeleteCollectionAction
    | DeleteWorkbookAction
    | AddDemoWorkbookAction;

export type CollectionsStructureDispatch = ThunkDispatch<
    DatalensGlobalState,
    void,
    CollectionsStructureAction
>;
