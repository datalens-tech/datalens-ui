import {getSdk} from 'libs/schematic-sdk';
import logger from 'libs/logger';
import {showToast} from 'store/actions/toaster';

import {
    COPY_TEMPLATE_LOADING,
    COPY_TEMPLATE_SUCCESS,
    COPY_TEMPLATE_FAILED,
} from '../../constants/collectionsStructure';

import type {CopyTemplateResponse} from '../../../../shared/schema';

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
