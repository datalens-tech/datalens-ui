import React from 'react';

import type {Plugin} from '@gravity-ui/dashkit';
import {CustomPaletteBgColors} from 'shared/constants';
import {isOldBackgroundSettings} from 'shared/utils';
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

type PluginWidget = Plugin<Props> &
    CommonPluginSettings & {
        setSettings: (settings: PluginWidgetObjectSettings) => PluginWidget;
    };

const widgetPlugin: PluginWidget = {
    type: 'widget',
    defaultLayout: {w: 12, h: 12},
    setSettings: (settings: PluginWidgetObjectSettings) => {
        widgetPlugin.scope = settings.scope;
        widgetPlugin.globalBackground = settings.globalBackground;
        widgetPlugin.globalBackgroundSettings = settings.globalBackgroundSettings;
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
        const propsBg = props.data.tabs?.[0]?.background;

        let oldWidgetBg = isOldBackgroundSettings(propsBg) ? propsBg : undefined;
        if (widgetPlugin.scope === 'dash' && !props.data.backgroundSettings) {
            oldWidgetBg = {color: CustomPaletteBgColors.LIKE_CHART};
        }

        const {style} = usePreparedWrapSettings({
            widgetBackground: oldWidgetBg,
            globalBackground: widgetPlugin.globalBackground,
            widgetBackgroundSettings: props.backgroundSettings,
            globalBackgroundSettings: widgetPlugin.globalBackgroundSettings,
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
                    backgroundColor={style?.backgroundColor}
                />
            </RendererWrapper>
        );
    },
};
export default widgetPlugin;
