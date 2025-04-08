import {getSdk} from 'libs/schematic-sdk';
import logger from 'libs/logger';
import {waitOperation} from '../../../utils/waitOperation';
import {showToast} from 'store/actions/toaster';

import {
    COPY_TEMPLATE_LOADING,
    COPY_TEMPLATE_SUCCESS,
    COPY_TEMPLATE_FAILED,
    ADD_DEMO_WORKBOOK_LOADING,
    ADD_DEMO_WORKBOOK_SUCCESS,
    ADD_DEMO_WORKBOOK_FAILED,
} from '../../constants/collectionsStructure';

import type {CopyTemplateResponse, CopyWorkbookTemplateResponse} from '../../../../shared/schema';

import type {CollectionsStructureDispatch} from './index';

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
export type CopyTemplateAction =
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
            .sdk.us.copyTemplate({
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
                const isCanceled = getSdk().sdk.isCancel(error);

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
export type AddDemoWorkbookAction =
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
            .sdk.us.copyWorkbookTemplate({
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
                            getSdk().sdk.us.getOperation(
                                {operationId: operation.id},
                                {concurrentId},
                            ),
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
                const isCanceled = getSdk().sdk.isCancel(error);

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
