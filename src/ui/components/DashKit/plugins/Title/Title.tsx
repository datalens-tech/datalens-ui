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

import {AnchorLink} from './AnchorLink/AnchorLink';

import './Title.scss';

const b = block('dashkit-plugin-title-container');

type Props = PluginTitleProps;

const WIDGET_RESIZE_DEBOUNCE_TIMEOUT = 100;
const MAX_ANCHOR_WIDTH = 28;
// text can be placed directly on the upper border of container,
// in which case a small negative offset is needed
const MIN_AVAILABLE_ANCHOR_OFFSET = -5;

const getTitlePlugin = (disableHashNavigation?: boolean) => ({
    ...pluginTitle,
    renderer: function Wrapper(
        props: Props,
        forwardedRef: React.LegacyRef<PluginTitle> | undefined,
    ) {
        const rootNodeRef = React.useRef<HTMLDivElement>(null);
        const contentRef = React.useRef<HTMLDivElement>(null);

        const [isInlineAnchor, setIsInlineAnchor] = React.useState<boolean>(false);
        const [anchorTop, setAnchorTop] = React.useState(0);

        const data = props.data as DashTabItemTitle['data'];

        const handleUpdate = useBeforeLoad(props.onBeforeLoad);

        /**
         * Ref layout so that we could use actual state without passing link to layout object
         */
        const layoutRef = React.useRef(props.layout);
        layoutRef.current = props.layout;

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
            handleUpdate?.();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [
            currentLayout.x,
            currentLayout.y,
            currentLayout.h,
            currentLayout.w,
            classMod,
            data.background?.color,
            data.background?.enabled,
            data.size,
            data.text,
        ]);

        const showAnchor = !disableHashNavigation && !props.editMode;
        const withInlineAnchor = showAnchor && isInlineAnchor;
        const withAbsoluteAnchor = showAnchor && !isInlineAnchor;

        React.useLayoutEffect(() => {
            if (showAnchor && contentRef.current && rootNodeRef.current) {
                const contentHeight = contentRef.current.getBoundingClientRect().height || 0;
                const contentWidth = contentRef.current.getBoundingClientRect().width || 0;

                const rootHeight = rootNodeRef.current.getBoundingClientRect().height || 0;
                const rootWidth = rootNodeRef.current.getBoundingClientRect().width || 0;

                const offsetTop =
                    contentRef.current.getBoundingClientRect().top -
                    rootNodeRef.current.getBoundingClientRect().top;

                const isWidthFits = contentWidth + MAX_ANCHOR_WIDTH < rootWidth;
                const isHeightFits = contentHeight <= rootHeight;

                const enableInlineAnchor = isWidthFits && isHeightFits;
                const calculatedAnchorTop =
                    offsetTop < MIN_AVAILABLE_ANCHOR_OFFSET || enableInlineAnchor ? 0 : offsetTop;

                setAnchorTop(calculatedAnchorTop);
                setIsInlineAnchor(enableInlineAnchor);
            } else {
                setIsInlineAnchor(false);
            }
        }, [
            currentLayout.x,
            currentLayout.h,
            currentLayout.w,
            showAnchor,
            data.text,
            data.size,
            data.background?.enabled,
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
                        'with-inline-anchor': Boolean(withInlineAnchor),
                        'with-absolute-anchor': Boolean(withAbsoluteAnchor),
                    })}
                    ref={contentRef}
                >
                    {content}
                    <AnchorLink
                        size={data.size}
                        to={data.text}
                        show={showAnchor}
                        top={anchorTop}
                        absolute={!isInlineAnchor}
                    />
                </div>
            </RendererWrapper>
        );
    },
});

export default getTitlePlugin;
