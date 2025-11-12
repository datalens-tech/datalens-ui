import React from 'react';

import {useDispatch} from 'react-redux';
import type {ChartActivityResponseData} from 'shared/types';
import type {OnChangeData} from 'ui/libs/DatalensChartkit/types';
import {showToast} from 'ui/store/actions/toaster';
import {getRenderMarkdownFn} from 'ui/utils';

type UseActionArgs = {
    onChange?: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
        callChangeByClick?: boolean,
    ) => void;
    onActivityComplete?: (args: {responseData?: ChartActivityResponseData}) => void;
};

export function useChartActivities(args: UseActionArgs) {
    const {onChange, onActivityComplete} = args;
    const dispatch = useDispatch();

    const onComplete = React.useCallback(
        async ({responseData}: {responseData?: ChartActivityResponseData} = {}) => {
            if (responseData?.error) {
                console.error('responseData.error: ', responseData.error);
            } else {
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
                    case 'setParams': {
                        const {params} = responseData.data;
                        if (onChange) {
                            onChange(
                                {type: 'PARAMS_CHANGED', data: {params}},
                                {forceUpdate: true},
                                true,
                            );
                        }

                        break;
                    }
                }
            }

            onActivityComplete?.({responseData});
        },
        [dispatch, onActivityComplete, onChange],
    );

    return {onActivityComplete: onComplete};
}
