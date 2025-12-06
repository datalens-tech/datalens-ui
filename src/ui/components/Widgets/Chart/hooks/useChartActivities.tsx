import React from 'react';

import {i18n} from 'i18n';
import {useDispatch} from 'react-redux';
import type {ChartActivityResponseData, DashChartRequestContext, StringParams} from 'shared';
import {DIALOG_DEFAULT} from 'ui/components/DialogDefault/DialogDefault';
import {YfmWrapper} from 'ui/components/YfmWrapper/YfmWrapper';
import type {ResponseError} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';
import {ChartsDataProvider} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';
import type {
    OnActivityComplete,
    OnChangeData,
    RunActivityArgs,
    RunActivityFn,
} from 'ui/libs/DatalensChartkit/types';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {showToast} from 'ui/store/actions/toaster';
import {getRenderMarkdownFn} from 'ui/utils';

import type {ChartWithProviderProps, DataProps} from '../types';

export const useChartActivities = ({
    requestId,
    requestHeadersGetter,
    dataProvider,
    initialData,
    onChange,
    onActivityComplete,
}: {
    requestId: string;
    requestHeadersGetter?: () => DashChartRequestContext;
    dataProvider: ChartWithProviderProps['dataProvider'];
    initialData: DataProps;
    onChange?: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
        callChangeByClick?: boolean,
    ) => void;
    onActivityComplete?: OnActivityComplete;
}) => {
    const dispatch = useDispatch();

    const handleActivityCompleteSuccess = React.useCallback(
        async (responseData: ChartActivityResponseData) => {
            switch (responseData?.data?.action) {
                case 'toast': {
                    const {title = '', type, content = ''} = responseData.data;
                    const renderMarkdown = await getRenderMarkdownFn();
                    dispatch(
                        showToast({
                            title,
                            type,
                            content: (
                                <YfmWrapper
                                    setByInnerHtml={true}
                                    content={renderMarkdown(content)}
                                />
                            ),
                        }),
                    );
                    break;
                }
                case 'popup': {
                    const {title = '', content = ''} = responseData.data;
                    const renderMarkdown = await getRenderMarkdownFn();

                    dispatch(
                        openDialog({
                            id: DIALOG_DEFAULT,
                            props: {
                                open: true,
                                onApply: () => {
                                    dispatch(closeDialog());
                                },
                                onCancel: () => dispatch(closeDialog()),
                                caption: title,
                                message: (
                                    <YfmWrapper
                                        setByInnerHtml={true}
                                        content={renderMarkdown(content)}
                                    />
                                ),
                            },
                        }),
                    );
                    break;
                }
                case 'setParams': {
                    if (onChange) {
                        onChange(
                            {type: 'PARAMS_CHANGED', data: {params: responseData.data.params}},
                            {forceUpdate: true},
                            true,
                        );
                    }

                    break;
                }
            }
        },
        [dispatch, onChange],
    );

    const inProgressRef = React.useRef(false);

    const runActivity: RunActivityFn = React.useCallback(
        async ({params}: RunActivityArgs) => {
            // blocking the run until the previous one ends
            if (inProgressRef.current) {
                return null;
            }

            inProgressRef.current = true;

            let responseData: ChartActivityResponseData | null;
            try {
                responseData = await dataProvider.makeActivityRequest({
                    props: {...initialData, params: params as StringParams},
                    requestId,
                    ...(requestHeadersGetter ? {contextHeaders: requestHeadersGetter()} : {}),
                });
            } catch (e) {
                responseData = {error: e};
            }

            if (responseData?.error) {
                switch (responseData.settings?.logError) {
                    case 'toast': {
                        dispatch(
                            showToast({
                                type: 'danger',
                                title: i18n('chartkit.data-provider', 'error-execution'),
                                error: ChartsDataProvider.formatError(
                                    responseData.error as ResponseError['error'],
                                    false,
                                ),
                            }),
                        );
                        break;
                    }
                    case 'ignore': {
                        break;
                    }
                    default: {
                        console.error(responseData.error);
                        break;
                    }
                }
            } else if (responseData) {
                handleActivityCompleteSuccess(responseData);
            }

            onActivityComplete?.({responseData});
            inProgressRef.current = false;

            return responseData;
        },
        [
            dataProvider,
            dispatch,
            handleActivityCompleteSuccess,
            initialData,
            onActivityComplete,
            requestHeadersGetter,
            requestId,
        ],
    );

    return {
        runActivity,
    };
};
