import React from 'react';

import type {ChartsChartKit} from 'ui/libs/DatalensChartkit/types/charts';

import MarkdownProvider from '../../../../modules/markdownProvider';
import {ChartWrapper} from '../../../Widgets/Chart/ChartWidgetWithProvider';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import {WidgetPluginProps} from './types';

const plugin = {
    type: 'widget',
    defaultLayout: {w: 12, h: 12},
    renderer: function Wrapper(
        props: WidgetPluginProps,
        forwardedRef: React.RefObject<ChartsChartKit>,
    ) {
        return (
            <RendererWrapper type="widget">
                <ChartWrapper
                    {...props}
                    usageType="widget"
                    forwardedRef={forwardedRef as any}
                    getMarkdown={MarkdownProvider.getMarkdown}
                />
            </RendererWrapper>
        );
    },
};
export default plugin;
