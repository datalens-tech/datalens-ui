import React from 'react';

import type {ChartWidgetWithWrapRefProps} from 'ui/components/Widgets/Chart/types';

import MarkdownProvider from '../../../../modules/markdownProvider';
import {ChartWrapper} from '../../../Widgets/Chart/ChartWidgetWithProvider';
import {useWidgetContext} from '../../context/WidgetContext';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import type {WidgetPluginProps} from './types';

const plugin = {
    type: 'widget',
    defaultLayout: {w: 12, h: 12},
    renderer: function Wrapper(
        props: WidgetPluginProps,
        forwardedRef: React.RefObject<ChartWidgetWithWrapRefProps>,
    ) {
        const rootNodeRef = React.useRef<HTMLDivElement>(null);
        const {onWidgetLoadData} = useWidgetContext({
            id: props.id,
            elementRef: rootNodeRef,
        });

        const workbookId = props.context.workbookId;
        const enableAssistant = props.context.enableAssistant;

        return (
            <RendererWrapper type="widget" nodeRef={rootNodeRef} id={props.id}>
                <ChartWrapper
                    {...props}
                    usageType="widget"
                    forwardedRef={forwardedRef}
                    getMarkdown={MarkdownProvider.getMarkdown}
                    workbookId={workbookId}
                    enableAssistant={enableAssistant}
                    onWidgetLoadData={onWidgetLoadData}
                />
            </RendererWrapper>
        );
    },
};
export default plugin;
