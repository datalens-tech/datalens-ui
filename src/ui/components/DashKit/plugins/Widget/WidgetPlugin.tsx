import React from 'react';

import type {ChartWidgetWithWrapRefProps} from 'ui/components/Widgets/Chart/types';

import MarkdownProvider from '../../../../modules/markdownProvider';
import {ChartWrapper} from '../../../Widgets/Chart/ChartWidgetWithProvider';

import type {WidgetPluginProps} from './types';

const plugin = {
    type: 'widget',
    defaultLayout: {w: 12, h: 12},
    renderer: function Wrapper(
        props: WidgetPluginProps,
        forwardedRef: React.RefObject<ChartWidgetWithWrapRefProps>,
    ) {
        const workbookId = props.context.workbookId;
        const enableAssistant = props.context.enableAssistant;

        return (
            <ChartWrapper
                {...props}
                usageType="widget"
                forwardedRef={forwardedRef}
                getMarkdown={MarkdownProvider.getMarkdown}
                workbookId={workbookId}
                enableAssistant={enableAssistant}
            />
        );
    },
};
export default plugin;
