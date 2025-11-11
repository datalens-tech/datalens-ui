import React from 'react';

import type {Plugin} from '@gravity-ui/dashkit';
import {type ColorSettings, CustomPaletteBgColors, isBackgroundSettings} from 'shared';
import type {ChartWidgetWithWrapRefProps} from 'ui/components/Widgets/Chart/types';

import MarkdownProvider from '../../../../modules/markdownProvider';
import {ChartWrapper} from '../../../Widgets/Chart/ChartWidgetWithProvider';
import type {CommonPluginSettings} from '../../DashKit';
import {useWidgetContext} from '../../context/WidgetContext';
import {usePreparedWrapSettings} from '../../utils';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import type {WidgetPluginProps} from './types';

type PluginWidgetObjectSettings = CommonPluginSettings;

type PluginWidget = Plugin<WidgetPluginProps> & {
    setSettings: (settings: PluginWidgetObjectSettings) => PluginWidget;
    background?: ColorSettings;
};

const widgetPlugin: PluginWidget = {
    type: 'widget',
    defaultLayout: {w: 12, h: 12},
    setSettings: (settings: PluginWidgetObjectSettings) => {
        widgetPlugin.background = settings.background;
        return widgetPlugin;
    },
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
        const propsBg = props.data.background ?? props.data.tabs?.[0]?.background;
        const {style} = usePreparedWrapSettings({
            widgetBackground: isBackgroundSettings(propsBg) ? propsBg : undefined,
            globalBackground: widgetPlugin.background,
            defaultOldColor: CustomPaletteBgColors.LIKE_CHART,
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
