import type {DatalensGlobalState} from 'index';
import type {ThunkDispatch} from 'redux-thunk';

import type {
    Collection,
    CollectionWithPermissions,
    GetCollectionContentResponse,
    GetRootCollectionPermissionsResponse,
} from '../../../../../shared/schema';
import type {GetCollectionContentMode} from '../../../../../shared/schema/us/types/collections';
import type {OrderBasicField, OrderDirection} from '../../../../../shared/schema/us/types/sort';
import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {showToast} from '../../../../store/actions/toaster';
import {
    DELETE_COLLECTION_IN_ITEMS,
    DELETE_WORKBOOK_IN_ITEMS,
    GET_COLLECTION_CONTENT_FAILED,
    GET_COLLECTION_CONTENT_LOADING,
    GET_COLLECTION_CONTENT_SUCCESS,
    GET_COLLECTION_FAILED,
    GET_COLLECTION_LOADING,
    GET_COLLECTION_SUCCESS,
    GET_ROOT_COLLECTION_PERMISSIONS_FAILED,
    GET_ROOT_COLLECTION_PERMISSIONS_LOADING,
    GET_ROOT_COLLECTION_PERMISSIONS_SUCCESS,
    RESET_COLLECTION,
    RESET_COLLECTION_CONTENT,
    RESET_STATE,
    SET_COLLECTION,
} from '../constants';

type ResetStateAction = {
    type: typeof RESET_STATE;
};

export const resetState = () => {
    return {
        type: RESET_STATE,
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
                }

                dispatch({
                    type: GET_COLLECTION_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
};

type SetCollectionAction = {
    type: typeof SET_COLLECTION;
    data: {
        collection: CollectionWithPermissions;
    };
};

export const setCollection = (collection: CollectionWithPermissions | Collection) => {
    return {
        type: SET_COLLECTION,
        data: {
            collection,
        },
    };
};

type ResetCollectionAction = {
    type: typeof RESET_COLLECTION;
};

export const resetCollection = () => {
    return (dispatch: CollectionsDispatch) => {
        dispatch({
            type: RESET_COLLECTION,
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
    itemsPage,
    filterString,
    orderField,
    orderDirection,
    onlyMy,
    mode,
    pageSize,
}: {
    collectionId: string | null;
    itemsPage?: string | null;
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
                itemsPage,
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

type DeleteCollectionInItemsAction = {
    type: typeof DELETE_COLLECTION_IN_ITEMS;
    data: {
        collectionId: string;
    };
};

export const deleteCollectionInItems = (collectionId: string) => {
    return {
        type: DELETE_COLLECTION_IN_ITEMS,
        data: {
            collectionId,
        },
    };
};

type DeleteWorkbookInItemsAction = {
    type: typeof DELETE_WORKBOOK_IN_ITEMS;
    data: {
        workbookId: string;
    };
};

export const deleteWorkbookInItems = (workbookId: string) => {
    return {
        type: DELETE_WORKBOOK_IN_ITEMS,
        data: {
            workbookId,
        },
    };
};

export type CollectionsAction =
    | ResetStateAction
    | GetCollectionAction
    | SetCollectionAction
    | ResetCollectionAction
    | GetCollectionsContentAction
    | ResetCollectionContentAction
    | GetRootCollectionPemissionsAction
    | DeleteCollectionInItemsAction
    | DeleteWorkbookInItemsAction;

export type CollectionsDispatch = ThunkDispatch<DatalensGlobalState, void, CollectionsAction>;
