import React from 'react';

import {PluginTitle, PluginTitleProps, pluginTitle} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import {adjustWidgetLayout as dashkitAdjustWidgetLayout} from 'ui/components/DashKit/utils';

import {RENDERER_WRAPPER_CLASSNAME, RendererWrapper} from '../RendererWrapper/RendererWrapper';

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
                    mainNodeSelector: `.${RENDERER_WRAPPER_CLASSNAME}`,
                    scrollableNodeSelector: `.${b()}`,
                });
            }, WIDGET_RESIZE_DEBOUNCE_TIMEOUT),
            [props.id, rootNodeRef, props.adjustWidgetLayout, props.layout, props.gridLayout],
        );

        React.useEffect(() => {
            adjustLayout(!props.data.autoHeight);
        }, [adjustLayout, props.data.autoHeight]);

        const content = <PluginTitle {...props} ref={forwardedRef} />;

        return (
            <RendererWrapper type="title" nodeRef={rootNodeRef}>
                <div className={b({'with-auto-height': Boolean(props.data.autoHeight)})}>
                    {content}
                </div>
            </RendererWrapper>
        );
    },
};

export default titlePlugin;
