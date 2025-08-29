import type {AxiosError} from 'axios';
import {EntryUpdateMode} from 'shared';
import {sdk, Utils} from 'ui';
import {reloadRevisionsOnSave, setChartsEntryContent} from './entryContent';
import type {AppDispatch} from '../index';
import logger from '../../libs/logger';
import type {GetEntryResponse} from '../../../shared/schema';
import {setDialogConfirmLoadingStatus} from './dialog';
import {DialogConfirmApplyStatus} from '../../components/DialogConfirm/DialogConfirm';

export type UpdateWidgetArguments<RequestData> = {
    entryId: string;
    revId?: string;
    data: RequestData;
    mode?: EntryUpdateMode;
    template?: string;
    description?: string;
};

export type RequestUpdateWidgetArgs<RequestData, ResponseData> = {
    updateParams: UpdateWidgetArguments<RequestData>;
    onSuccess: (data: ResponseData) => void;
    onError: (error: AxiosError) => void;
};

export const requestUpdateWidget = <
    RequestData extends Record<string, any>,
    ResponseData extends Record<string, any>,
>(
    args: RequestUpdateWidgetArgs<RequestData, ResponseData>,
) => {
    return (dispatch: AppDispatch) => {
        const {updateParams} = args;
        return sdk.charts
            .updateWidget(updateParams)
            .then((data) => {
                args.onSuccess(data as any);
                dispatch(setChartsEntryContent(data as unknown as GetEntryResponse));
                return data;
            })
            .catch((error: AxiosError) => {
                logger.logError('requestUpdateWidget failed', error);
                let parsedError = error;
                if (error.response && error.response.status) {
                    parsedError = {
                        ...error,
                        code: String(error.response.status),
                    };
                }
                args.onError(parsedError);
                return null;
            });
    };
};

export type SetActualChartArgs<RequestData, ResponseData> = {
    entry: GetEntryResponse;
    data: RequestData;
    isDraftEntry?: boolean;
    template?: string;
    onRequestSuccess: (data: ResponseData) => void;
    onRequestError: (error: AxiosError) => void;
    onSetActualSuccess?: (data: ResponseData) => void;
    onSetActualError: (error: AxiosError) => void;
};

export const setActualChart = <
    RequestData extends Record<string, any>,
    ResponseData extends Record<string, any>,
>(
    args: SetActualChartArgs<RequestData, ResponseData>,
) => {
    return async (dispatch: AppDispatch) => {
        const {data, isDraftEntry, entry, template} = args;
        const updateParams: UpdateWidgetArguments<RequestData> = {
            data,
            mode: EntryUpdateMode.Publish,
            entryId: entry.entryId,
            template,
            description: entry.annotation?.description,
        };

        if (isDraftEntry) {
            updateParams.revId = entry.revId;
        }

        try {
            await dispatch(setDialogConfirmLoadingStatus(DialogConfirmApplyStatus.Loading));
            const updatedWidget = await dispatch(
                requestUpdateWidget<RequestData, ResponseData>({
                    updateParams,
                    onSuccess: args.onRequestSuccess,
                    onError: args.onRequestError,
                }),
            );
            await dispatch(setDialogConfirmLoadingStatus(DialogConfirmApplyStatus.Successed));

            if (args.onSetActualSuccess) {
                args.onSetActualSuccess(updatedWidget as any);
            }

            await dispatch(reloadRevisionsOnSave(true));
        } catch (error) {
            const {message, status} = Utils.parseErrorResponse(error);
            logger.logError('wizard: requestUpdateWidget failed', message || error);

            if (status) {
                error.code = status;
            }

            await dispatch(setDialogConfirmLoadingStatus(DialogConfirmApplyStatus.Failed));

            args.onSetActualError(error);
        }
    };
};

export type SaveWidgetArgs<RequestData, ResponseData> = {
    entry: GetEntryResponse;
    data: RequestData;
    mode?: EntryUpdateMode;
    template?: string;
    description?: string;
} & Omit<RequestUpdateWidgetArgs<RequestData, ResponseData>, 'updateParams'>;

export const saveWidget = <
    RequestData extends Record<string, any>,
    ResponseData extends Record<string, any>,
>(
    args: SaveWidgetArgs<RequestData, ResponseData>,
) => {
    return async (dispatch: AppDispatch) => {
        const {entry, data, mode, template, description, ...restArgs} = args;
        const updateParams: UpdateWidgetArguments<RequestData> = {
            entryId: entry.entryId,
            data,
            mode,
            template,
            description,
        };

        if (updateParams.mode === EntryUpdateMode.Publish) {
            updateParams.revId = entry.revId;
        }

        await dispatch(requestUpdateWidget<RequestData, ResponseData>({updateParams, ...restArgs}));
    };
};
