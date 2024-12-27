import type {DatalensGlobalState} from 'index';
import type {ThunkDispatch} from 'redux-thunk';

import type {
    Collection,
    CollectionWithPermissions,
    GetRootCollectionPermissionsResponse,
    GetStructureItemsResponse,
} from '../../../../../shared/schema';
import type {GetStructureItemsMode} from '../../../../../shared/schema/us/types/collections';
import type {OrderBasicField, OrderDirection} from '../../../../../shared/schema/us/types/sort';
import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {showToast} from '../../../../store/actions/toaster';
import {
    DELETE_COLLECTION_IN_ITEMS,
    DELETE_WORKBOOK_IN_ITEMS,
    GET_COLLECTION_FAILED,
    GET_COLLECTION_LOADING,
    GET_COLLECTION_SUCCESS,
    GET_ROOT_COLLECTION_PERMISSIONS_FAILED,
    GET_ROOT_COLLECTION_PERMISSIONS_LOADING,
    GET_ROOT_COLLECTION_PERMISSIONS_SUCCESS,
    GET_STRUCTURE_ITEMS_FAILED,
    GET_STRUCTURE_ITEMS_LOADING,
    GET_STRUCTURE_ITEMS_SUCCESS,
    RESET_COLLECTION,
    RESET_STATE,
    RESET_STRUCTURE_ITEMS,
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
            .sdk.us.getCollection({
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
                const isCanceled = getSdk().sdk.isCancel(error);

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
}: {
    collectionId: string | null;
    page?: string | null;
    filterString?: string;
    orderField?: OrderBasicField;
    orderDirection?: OrderDirection;
    onlyMy?: boolean;
    mode?: GetStructureItemsMode;
    pageSize?: number;
}) => {
    return (dispatch: CollectionsDispatch) => {
        dispatch({
            type: GET_STRUCTURE_ITEMS_LOADING,
        });
        return getSdk()
            .sdk.us.getStructureItems({
                collectionId,
                includePermissionsInfo: true,
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
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('collections/getStructureItems failed', error);
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

type ResetStructureItemsAction = {
    type: typeof RESET_STRUCTURE_ITEMS;
};

export const resetStructureItems = () => {
    return (dispatch: CollectionsDispatch) => {
        dispatch({
            type: RESET_STRUCTURE_ITEMS,
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
            .sdk.us.getRootCollectionPermissions()
            .then((data) => {
                dispatch({
                    type: GET_ROOT_COLLECTION_PERMISSIONS_SUCCESS,
                    data: data,
                });
                return data;
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

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
    | GetStructureItemsAction
    | ResetStructureItemsAction
    | GetRootCollectionPemissionsAction
    | DeleteCollectionInItemsAction
    | DeleteWorkbookInItemsAction;

export type CollectionsDispatch = ThunkDispatch<DatalensGlobalState, void, CollectionsAction>;
