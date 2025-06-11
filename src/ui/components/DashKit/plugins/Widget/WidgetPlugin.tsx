import React from 'react';

import type {ChartWidgetWithWrapRefProps} from 'ui/components/Widgets/Chart/types';

import MarkdownProvider from '../../../../modules/markdownProvider';
import {ChartWrapper} from '../../../Widgets/Chart/ChartWidgetWithProvider';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import type {WidgetPluginProps} from './types';

const plugin = {
    type: 'widget',
    defaultLayout: {w: 12, h: 12},
    renderer: function Wrapper(
        props: WidgetPluginProps,
        forwardedRef: React.RefObject<ChartWidgetWithWrapRefProps>,
    ) {
        const workbookId = props.context.workbookId;

        return (
            <RendererWrapper type="widget" id={props.id}>
                <ChartWrapper
                    {...props}
                    usageType="widget"
                    forwardedRef={forwardedRef}
                    getMarkdown={MarkdownProvider.getMarkdown}
                    workbookId={workbookId}
                />
            </RendererWrapper>
        );
    },
};
export default plugin;
