import React from 'react';

import {useDispatch} from 'react-redux';
import {YfmWrapper} from 'ui/components/YfmWrapper/YfmWrapper';
import type {OnChangeData} from 'ui/libs/DatalensChartkit/types';
import {showToast} from 'ui/store/actions/toaster';
import {getRenderMarkdownFn} from 'ui/utils';
import type {ActivityResultData} from 'ui/utils/chart-activity';

type UseActionArgs = {
    onChange?: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
        callChangeByClick?: boolean,
    ) => void;
};

type ActivityPopupProps = {
    open: boolean;
    title?: string;
    content?: React.ReactElement;
    onClose: () => void;
};

export function useChartActions(args: UseActionArgs) {
    const {onChange} = args;
    const dispatch = useDispatch();

    const [activityPopupProps, setActivityPopupProps] = React.useState<
        ActivityPopupProps | undefined
    >();

    const handleCloseActivityPopup = React.useCallback(
        () => setActivityPopupProps({...activityPopupProps, open: false} as ActivityPopupProps),
        [activityPopupProps],
    );

    const onAction = React.useCallback(
        async (actionArgs: {data: ActivityResultData}) => {
            const {type, data} = actionArgs.data;

            switch (type) {
                case 'popup': {
                    const renderMarkdown = await getRenderMarkdownFn();
                    setActivityPopupProps({
                        open: true,
                        title: data.title ?? '',
                        content: (
                            <YfmWrapper
                                content={renderMarkdown(String(data.content ?? ''))}
                                setByInnerHtml={true}
                            />
                        ),
                        onClose: handleCloseActivityPopup,
                    });
                    break;
                }
                case 'toast': {
                    const renderMarkdown = await getRenderMarkdownFn();
                    dispatch(
                        showToast({
                            title: data.title ?? '',
                            type: data.type,
                            content: (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: renderMarkdown(String(data.content ?? '')),
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
                            {type: 'PARAMS_CHANGED', data: {params: data}},
                            {forceUpdate: true},
                            true,
                        );
                    }

                    break;
                }
            }
        },
        [dispatch, handleCloseActivityPopup, onChange],
    );

    return {onAction, activityPopupProps};
}
