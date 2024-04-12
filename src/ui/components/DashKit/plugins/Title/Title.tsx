import React from 'react';

import {
    PLUGIN_ROOT_ATTR_NAME,
    PluginTitle,
    PluginTitleProps,
    pluginTitle,
} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import {adjustWidgetLayout as dashkitAdjustWidgetLayout} from 'ui/components/DashKit/utils';

import './Title.scss';

const b = block('dashkit-plugin-title-container');

type Props = PluginTitleProps;

const titlePlugin = {
    ...pluginTitle,
    renderer: function Wrapper(
        props: Props,
        forwardedRef: React.LegacyRef<PluginTitle> | undefined,
    ) {
        const rootNodeRef = React.useRef<HTMLDivElement>(null);

        /**
         * call common for charts & selectors adjust function for widget
         */
        const adjustLayout = React.useCallback(
            (needSetDefault) => {
                dashkitAdjustWidgetLayout({
                    widgetId: props.id,
                    needSetDefault,
                    rootNode: rootNodeRef,
                    gridLayout: props.gridLayout,
                    layout: props.layout,
                    cb: props.adjustWidgetLayout,
                    mainNodeSelector: `.${b()}`,
                    scrollableNodeSelector: `[${PLUGIN_ROOT_ATTR_NAME}="title"]`,
                });
            },
            [props.id, rootNodeRef, props.adjustWidgetLayout, props.layout, props.gridLayout],
        );

        React.useLayoutEffect(() => {
            adjustLayout(!props.data.autoHeight);
        }, [adjustLayout, props.data.autoHeight]);

        const content = <PluginTitle {...props} ref={forwardedRef} />;

        return (
            <div
                className={b({'with-auto-height': Boolean(props.data.autoHeight)})}
                ref={rootNodeRef}
            >
                {content}
            </div>
        );
    },
};

export default titlePlugin;
