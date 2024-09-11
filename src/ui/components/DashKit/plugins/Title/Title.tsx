import React from 'react';

import type {PluginTitleProps} from '@gravity-ui/dashkit';
import {PLUGIN_ROOT_ATTR_NAME, PluginTitle, pluginTitle} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import type {DashTabItemTitle} from 'shared';
import {
    adjustWidgetLayout as dashkitAdjustWidgetLayout,
    getPreparedWrapSettings,
} from 'ui/components/DashKit/utils';

import {useBeforeLoad} from '../../../../hooks/useBeforeLoad';
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

        const onUpdate = useBeforeLoad(props.onBeforeLoad);

        /**
         * call common for charts & selectors adjust function for widget
         */
        const layoutRef = React.useRef(props.layout);
        layoutRef.current = props.layout;

        const adjustLayout = React.useCallback(
            debounce((needSetDefault) => {
                dashkitAdjustWidgetLayout({
                    widgetId: props.id,
                    needSetDefault,
                    rootNode: rootNodeRef,
                    gridLayout: props.gridLayout,
                    layout: layoutRef.current,
                    // TODO: optimize call times in future
                    cb: (...args) => {
                        return props.adjustWidgetLayout(...args);
                    },
                    mainNodeSelector: `[${PLUGIN_ROOT_ATTR_NAME}="title"]`,
                    scrollableNodeSelector: `.${b()}`,
                    needHeightReset: true,
                });
            }, WIDGET_RESIZE_DEBOUNCE_TIMEOUT),
            [props.id, rootNodeRef, layoutRef, props.adjustWidgetLayout, props.gridLayout],
        );

        React.useEffect(() => {
            adjustLayout(!data.autoHeight);
        }, [adjustLayout, data.autoHeight, props.data?.text, props.data?.size]);

        const content = <PluginTitle {...props} ref={forwardedRef} />;

        const showBgColor = Boolean(
            data.background?.enabled &&
                data.background?.color &&
                data.background?.color !== 'transparent',
        );

        const {classMod, style} = getPreparedWrapSettings(showBgColor, data.background?.color);

        const currentLayout = props.layout.find(({i}) => i === props.id) || {
            x: null,
            y: null,
            h: null,
            w: null,
        };
        React.useEffect(() => {
            onUpdate?.();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [
            currentLayout.x,
            currentLayout.y,
            currentLayout.h,
            currentLayout.w,
            classMod,
            data.background?.color,
            data.size,
            data.text,
        ]);

        return (
            <RendererWrapper
                id={props.id}
                type="title"
                nodeRef={rootNodeRef}
                style={style as React.StyleHTMLAttributes<HTMLDivElement>}
                classMod={classMod}
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
