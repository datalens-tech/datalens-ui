/* eslint-disable no-console */
import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {
    PluginTitle as DashKitPluginTitle,
    PLUGIN_ROOT_ATTR_NAME,
    RECCOMMENDED_LINE_HEIGHT_MULTIPLIER,
    TITLE_DEFAULT_SIZES,
    pluginTitle,
} from '@gravity-ui/dashkit';
import type {Plugin, PluginTitleProps} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import type {DashTabItemTitle} from 'shared';
import {CustomPaletteBgColors} from 'shared/constants/widgets';
import {
    adjustWidgetLayout as dashkitAdjustWidgetLayout,
    getPreparedWrapSettings,
} from 'ui/components/DashKit/utils';

import {useBeforeLoad} from '../../../../hooks/useBeforeLoad';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import {AnchorLink} from './AnchorLink/AnchorLink';

import './Title.scss';

const b = block('dashkit-plugin-title-container');

type PluginTitleObjectSettings = {hideAnchor?: boolean; hideHint?: boolean};

type Props = PluginTitleProps & PluginTitleObjectSettings;

type PluginTitle = Plugin<Props> & {
    setSettings: (settings: PluginTitleObjectSettings) => PluginTitle;
    hideAnchor?: boolean;
    hideHint?: boolean;
};

const WIDGET_RESIZE_DEBOUNCE_TIMEOUT = 100;
const MAX_ANCHOR_WIDTH = 28;
// text can be placed directly on the upper border of container,
// in which case a small negative offset is needed
const MIN_AVAILABLE_ANCHOR_OFFSET = -5;

const MIN_AVAILABLE_HEIGHT_OFFSET = -8.5;

const titlePlugin: PluginTitle = {
    ...pluginTitle,
    setSettings(settings: PluginTitleObjectSettings) {
        const {hideAnchor, hideHint} = settings;
        titlePlugin.hideAnchor = hideAnchor;
        titlePlugin.hideHint = hideHint;
        return titlePlugin;
    },
    renderer: function Wrapper(
        props: Props,
        forwardedRef: React.LegacyRef<DashKitPluginTitle> | undefined,
    ) {
        const rootNodeRef = React.useRef<HTMLDivElement>(null);
        const contentRef = React.useRef<HTMLDivElement>(null);

        const [isInlineExtra, setIsInlineExtra] = React.useState<boolean>(false);
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

        const content = <DashKitPluginTitle {...props} ref={forwardedRef} />;

        const showBgColor = Boolean(
            data.background?.enabled !== false &&
                data.background?.color &&
                data.background?.color !== CustomPaletteBgColors.NONE,
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
            data.size,
            data.text,
        ]);

        const showAnchor = !titlePlugin.hideAnchor && !props.editMode;
        const withInlineAnchor = showAnchor && isInlineExtra;
        const withAbsoluteAnchor = showAnchor && !isInlineExtra;

        // const showHint = !titlePlugin.hideHint && !props.editMode && data.hint?.enabled;
        const showHint = !props.editMode;
        // const showHint = data.hint?.enabled;
        const withAbsoluteHint = showHint && !isInlineExtra;

        const calculateExtraElements = React.useCallback(() => {
            if (contentRef.current && rootNodeRef.current) {
                const contentRect = contentRef.current.getBoundingClientRect();
                const rootRect = rootNodeRef.current.getBoundingClientRect();

                const offsetTop = contentRect.top - rootRect.top;

                console.log(contentRef.current);
                console.log(rootNodeRef.current);
                console.log({offsetTop});

                const isWidthFits = contentRect.width + MAX_ANCHOR_WIDTH < rootRect.width;
                const isHeightFits =
                    rootRect.height - contentRect.height >= MIN_AVAILABLE_HEIGHT_OFFSET;

                console.log(
                    {isWidthFits, isHeightFits},
                    rootRect.height,
                    contentRect.height,
                    rootRect.height - contentRect.height,
                );

                const contentFits = isWidthFits && isHeightFits;
                const calculatedAnchorTop =
                    offsetTop < MIN_AVAILABLE_ANCHOR_OFFSET || contentFits ? 0 : offsetTop;

                setAnchorTop(calculatedAnchorTop);
                setIsInlineExtra(contentFits);
            }
        }, []);

        React.useLayoutEffect(() => {
            if (showAnchor || showHint) {
                calculateExtraElements();
            } else {
                setIsInlineExtra(false);
            }
        }, [
            currentLayout.x,
            currentLayout.h,
            currentLayout.w,
            data.text,
            data.size,
            calculateExtraElements,
            showAnchor,
            showHint,
        ]);

        React.useEffect(() => {
            if (!showAnchor && !showHint) {
                return undefined;
            }

            const debouncedCalculateAnchor = debounce(
                calculateExtraElements,
                WIDGET_RESIZE_DEBOUNCE_TIMEOUT,
            );
            window.addEventListener('resize', debouncedCalculateAnchor);

            return () => {
                window.removeEventListener('resize', debouncedCalculateAnchor);
            };
        }, [calculateExtraElements, showAnchor, showHint]);

        let fontStyle: React.CSSProperties = {};
        if (typeof data.size === 'object' && 'fontSize' in data.size) {
            fontStyle = {
                fontSize: data.size.fontSize + 'px',
                lineHeight: RECCOMMENDED_LINE_HEIGHT_MULTIPLIER,
            };
        } else if (typeof data.size === 'string') {
            fontStyle = TITLE_DEFAULT_SIZES[data.size];
        }

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
                        'with-absolute-anchor': Boolean(withAbsoluteAnchor && !withAbsoluteHint),
                        'with-absolute-hint': Boolean(withAbsoluteHint),
                    })}
                    ref={contentRef}
                >
                    {content}
                    <span
                        className={b('anchor-container', {
                            absolute: !isInlineExtra,
                            'with-hint': showHint,
                        })}
                        style={{top: anchorTop, ...fontStyle}}
                    >
                        {showHint && (
                            <HelpPopover
                                // TODO
                                content={data.hint?.text || 'test'}
                                // content={data.hint?.text}
                                className={b('hint')}
                                placement="bottom"
                                buttonProps={{
                                    className: b('hint-button'),
                                    style: fontStyle,
                                }}
                            />
                        )}
                        <AnchorLink to={data.text} show={showAnchor} absolute={!isInlineExtra} />
                    </span>
                </div>
            </RendererWrapper>
        );
    },
};

export default titlePlugin;
