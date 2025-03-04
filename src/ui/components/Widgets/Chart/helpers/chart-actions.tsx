import React from 'react';

import {useDispatch} from 'react-redux';
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
};

export function useChartActions(args: UseActionArgs) {
    const {onChange} = args;
    const dispatch = useDispatch();

    const onAction = React.useCallback(async (actionArgs: {data?: any} = {}) => {
        const {action, ...args} = actionArgs.data || {};

        switch (action) {
            case 'toast': {
                const renderMarkdown = await getRenderMarkdownFn();
                dispatch(
                    showToast({
                        title: args?.title,
                        type: args?.type,
                        content: (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: renderMarkdown(String(args.content ?? '')),
                                }}
                            />
                        ),
                    }),
                );
                break;
            }
            case 'setParams': {
                if (onChange) {
                    onChange(
                        {type: 'PARAMS_CHANGED', data: {params: args}},
                        {forceUpdate: true},
                        true,
                    );
                }

                break;
            }
        }
    }, []);

    return {onAction};
}
