import React from 'react';

import {useDispatch} from 'react-redux';
import type {ChartActivityResponseData, DashChartRequestContext, StringParams} from 'shared';
import {DIALOG_DEFAULT} from 'ui/components/DialogDefault/DialogDefault';
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
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: renderMarkdown(String(content)),
                                    }}
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
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: renderMarkdown(content),
                                        }}
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

    const runActivity: RunActivityFn = React.useCallback(
        async ({params}: RunActivityArgs) => {
            let responseData: ChartActivityResponseData;
            try {
                responseData = await dataProvider.makeActivityRequest({
                    props: {...initialData, params: params as StringParams},
                    requestId,
                    ...(requestHeadersGetter ? {contextHeaders: requestHeadersGetter()} : {}),
                });

                if (responseData.error) {
                    switch (responseData.settings?.logError) {
                        case 'toast': {
                            dispatch(
                                showToast({
                                    type: 'danger',
                                    title: responseData.error.message,
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
                } else {
                    handleActivityCompleteSuccess(responseData);
                }
            } catch (activityError) {
                responseData = {error: activityError};
                console.error('responseData.error: ', responseData.error);
            }

            onActivityComplete?.({responseData});
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
