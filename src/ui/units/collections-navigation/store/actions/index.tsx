import type {DatalensGlobalState} from 'index';
import logger from 'libs/logger';
import {getSdk} from 'libs/schematic-sdk';
import type {ThunkDispatch} from 'redux-thunk';

import type {GetCollectionBreadcrumbsResponse} from '../../../../../shared/schema';
import {
    GET_COLLECTION_BREADCRUMBS_FAILED,
    GET_COLLECTION_BREADCRUMBS_LOADING,
    GET_COLLECTION_BREADCRUMBS_SUCCESS,
    RESET_STATE,
    SET_COLLECTION_BREDCRUMBS,
} from '../constants';

type ResetStateAction = {
    type: typeof RESET_STATE;
};

export const resetState = () => {
    return {
        type: RESET_STATE,
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
    return (dispatch: CollectionsNavigationDispatch) => {
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
                if (!getSdk().sdk.isCancel(error)) {
                    logger.logError(
                        'collections-navigation/getCollectionBreadcrumbs failed',
                        error,
                    );
                }

                dispatch({
                    type: GET_COLLECTION_BREADCRUMBS_FAILED,
                    error,
                });

                return null;
            });
    };
};

type SetCollectionBreadcrumbsAction = {
    type: typeof SET_COLLECTION_BREDCRUMBS;
    data: {
        collectionBreadcrumbs: GetCollectionBreadcrumbsResponse | null;
    };
};

export const setCollectionBreadcrumbs = (
    collectionBreadcrumbs: GetCollectionBreadcrumbsResponse | null,
) => {
    return {
        type: SET_COLLECTION_BREDCRUMBS,
        data: {
            collectionBreadcrumbs,
        },
    };
};

export type CollectionsNavigationAction =
    | ResetStateAction
    | GetCollectionBreadcrumbsAction
    | SetCollectionBreadcrumbsAction;

export type CollectionsNavigationDispatch = ThunkDispatch<
    DatalensGlobalState,
    void,
    CollectionsNavigationAction
>;
