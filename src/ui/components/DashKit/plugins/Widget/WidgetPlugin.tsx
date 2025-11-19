import React from 'react';

import type {Plugin} from '@gravity-ui/dashkit';
import {CustomPaletteBgColors, isBackgroundSettings} from 'shared';
import type {ChartWidgetWithWrapRefProps} from 'ui/components/Widgets/Chart/types';

import MarkdownProvider from '../../../../modules/markdownProvider';
import {ChartWrapper} from '../../../Widgets/Chart/ChartWidgetWithProvider';
import type {CommonPluginProps, CommonPluginSettings} from '../../DashKit';
import {useWidgetContext} from '../../context/WidgetContext';
import {usePreparedWrapSettings} from '../../utils';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import type {WidgetPluginProps} from './types';

type Props = WidgetPluginProps & CommonPluginProps;

type PluginWidgetObjectSettings = CommonPluginSettings;

type PluginWidget = Plugin<Props> & {
    setSettings: (settings: PluginWidgetObjectSettings) => PluginWidget;
    scope?: string;
};

const widgetPlugin: PluginWidget = {
    type: 'widget',
    defaultLayout: {w: 12, h: 12},
    setSettings: (settings: PluginWidgetObjectSettings) => {
        widgetPlugin.scope = settings.scope;
        return widgetPlugin;
    },
    renderer: function Wrapper(
        props: Props,
        forwardedRef: React.RefObject<ChartWidgetWithWrapRefProps>,
    ) {
        const rootNodeRef = React.useRef<HTMLDivElement>(null);
        const {onWidgetLoadData} = useWidgetContext({
            id: props.id,
            elementRef: rootNodeRef,
        });

        const workbookId = props.context.workbookId;
        const enableAssistant = props.context.enableAssistant;
        const propsBg = props.data.background ?? props.data.tabs?.[0]?.background;
        const {style} = usePreparedWrapSettings({
            widgetBackground: isBackgroundSettings(propsBg) ? propsBg : undefined,
            globalBackground: props.background,
            defaultOldColor:
                widgetPlugin.scope === 'dash'
                    ? CustomPaletteBgColors.LIKE_CHART
                    : CustomPaletteBgColors.NONE,
        });

        return (
            <RendererWrapper type="widget" nodeRef={rootNodeRef} id={props.id} style={style}>
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
export default widgetPlugin;
