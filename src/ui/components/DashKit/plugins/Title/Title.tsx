import React from 'react';

import type {PluginTitleProps} from '@gravity-ui/dashkit';
import {PLUGIN_ROOT_ATTR_NAME, PluginTitle, pluginTitle} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import type {DashTabItemTitle} from 'shared';
import {adjustWidgetLayout as dashkitAdjustWidgetLayout} from 'ui/components/DashKit/utils';

import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import './Title.scss';

const b = block('dashkit-plugin-title-container');

type Props = PluginTitleProps;

const WIDGET_RESIZE_DEBOUNCE_TIMEOUT = 100;

const titlePlugin = {
    ...pluginTitle,
    renderer: function Wrapper(
        props: Props,
        forwardedRef: React.LegacyRef<PluginTitle> | undefined,
    ) {
        const rootNodeRef = React.useRef<HTMLDivElement>(null);

        const data = props.data as DashTabItemTitle['data'];

        /**
         * call common for charts & selectors adjust function for widget
         */
        const adjustLayout = React.useCallback(
            debounce((needSetDefault) => {
                dashkitAdjustWidgetLayout({
                    widgetId: props.id,
                    needSetDefault,
                    rootNode: rootNodeRef,
                    gridLayout: props.gridLayout,
                    layout: props.layout,
                    cb: props.adjustWidgetLayout,
                    mainNodeSelector: `[${PLUGIN_ROOT_ATTR_NAME}="title"]`,
                    scrollableNodeSelector: `.${b()}`,
                    needHeightReset: true,
                });
            }, WIDGET_RESIZE_DEBOUNCE_TIMEOUT),
            [props.id, rootNodeRef, props.adjustWidgetLayout, props.layout, props.gridLayout],
        );

        React.useEffect(() => {
            adjustLayout(!data.autoHeight);
        }, [adjustLayout, data.autoHeight, props.data?.text, props.data?.size]);

        const content = <PluginTitle {...props} ref={forwardedRef} />;

        const showBgColor =
            data.background?.enabled &&
            data.background?.color &&
            data.background?.color !== 'transparent';

        const style = showBgColor ? {backgroundColor: data.background?.color} : {};

        return (
            <RendererWrapper
                type="title"
                nodeRef={rootNodeRef}
                style={style as React.StyleHTMLAttributes<HTMLDivElement>}
                classMod={showBgColor ? 'with-color' : undefined}
            >
                <div
                    className={b({
                        'with-auto-height': Boolean(data.autoHeight),
                        'with-color': Boolean(showBgColor),
                    })}
                >
                    {content}
                </div>
            </RendererWrapper>
        );
    },
};

export default titlePlugin;
