import React from 'react';

import type {Plugin} from '@gravity-ui/dashkit';
import type {DashTabItemWidget} from 'shared';
import {CustomPaletteBgColors} from 'shared/constants';
import {isOldBackgroundSettings} from 'shared/utils';
import type {ChartWidgetWithWrapRefProps} from 'ui/components/Widgets/Chart/types';

import MarkdownProvider from '../../../../modules/markdownProvider';
import {ChartWrapper} from '../../../Widgets/Chart/ChartWidgetWithProvider';
import type {CommonPluginSettings} from '../../DashKit';
import {useWidgetContext} from '../../context/WidgetContext';
import {usePreparedWrapSettings} from '../../utils';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import type {WidgetPluginProps} from './types';

type Props = WidgetPluginProps;

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
        widgetPlugin.globalWidgetSettings = settings.globalWidgetSettings;
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

        // @ts-expect-error TS2352: hideTitle is required in DashTabItemWidget['data'].
        const data = props.data as DashTabItemWidget['data'];

        const workbookId = props.context.workbookId;
        const enableAssistant = props.context.enableAssistant;
        const propsBg = data.tabs?.[0]?.background;

        let oldWidgetBg = isOldBackgroundSettings(propsBg) ? propsBg : undefined;
        if (widgetPlugin.scope === 'dash' && !data.backgroundSettings) {
            oldWidgetBg = {color: CustomPaletteBgColors.LIKE_CHART};
        }

        const {style} = usePreparedWrapSettings({
            ownWidgetSettings: {
                background: oldWidgetBg,
                backgroundSettings: data.backgroundSettings,
                borderRadius: data.borderRadius,
            },
            globalWidgetSettings: widgetPlugin.globalWidgetSettings ?? {},
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
