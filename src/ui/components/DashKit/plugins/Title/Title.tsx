import React from 'react';

import {
    PluginTitle as DashKitPluginTitle,
    PLUGIN_ROOT_ATTR_NAME,
    pluginTitle,
} from '@gravity-ui/dashkit';
import type {Plugin, PluginTitleProps} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import {type DashTabItemTitle, EXPORT_PRINT_HIDDEN_ATTR} from 'shared';
import {CustomPaletteBgColors} from 'shared/constants/widgets';
import {
    adjustWidgetLayout as dashkitAdjustWidgetLayout,
    getPreparedWrapSettings,
} from 'ui/components/DashKit/utils';
import {MarkdownHelpPopover} from 'ui/components/MarkdownHelpPopover/MarkdownHelpPopover';
import {DL} from 'ui/constants';

import {useBeforeLoad} from '../../../../hooks/useBeforeLoad';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import {AnchorLink} from './AnchorLink/AnchorLink';
import {getFontStyleBySize, getTopOffsetBySize, isTitleOverflowed} from './utils';

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
// const MAX_HINT_WIDTH = 28;
// const MAX_HINT_WITH_ANCHOR_WIDTH = 42;

// text can be placed directly on the upper border of container,
// in which case a small negative offset is needed
const MIN_AVAILABLE_TOP_OFFSET = -5;
// if the text is too large, it slightly overflows its container
const MIN_AVAILABLE_HEIGHT_OFFSET = 8.5;

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
        const extraRef = React.useRef<HTMLDivElement>(null);

        const [isInlineExtraElements, setIsInlineExtraElements] = React.useState<boolean | null>(
            false,
        );
        const [extraElementsTop, setExtraElementsTop] = React.useState<number | undefined>(
            undefined,
        );
        const [isVerticalOverflowing, setIsVerticalOverflowing] = React.useState<boolean>(false);

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
            [props.id, props.adjustWidgetLayout, props.gridLayout],
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

        const showHint = Boolean(!titlePlugin.hideHint && data.hint?.enabled && data.hint.text);
        const showAnchor = !titlePlugin.hideAnchor && !DL.IS_MOBILE;

        const withInlineExtraElements = (showAnchor || showHint) && isInlineExtraElements;

        const withAbsoluteAnchor = showAnchor && !isInlineExtraElements;
        const withAbsoluteHint = showHint && !isInlineExtraElements;

        const {classMod, style} = getPreparedWrapSettings(
            showBgColor,
            data.background?.color,
            {
                position: !showAnchor && isVerticalOverflowing ? 'relative' : undefined,
            },
            data.textColor,
        );

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

        const calculateExtraElements = React.useCallback(() => {
            if (contentRef.current && rootNodeRef.current) {
                const contentRect = contentRef.current.getBoundingClientRect();
                const rootRect = rootNodeRef.current.getBoundingClientRect();

                const offsetTop = contentRect.top - rootRect.top;

                const titleElement = contentRef.current.children[0];
                const isWidthFits =
                    titleElement instanceof HTMLDivElement && extraRef.current
                        ? !isTitleOverflowed(contentRef.current, extraRef.current)
                        : contentRect.width <= rootRect.width;

                const isHeightFits =
                    contentRect.height <= rootRect.height + MIN_AVAILABLE_HEIGHT_OFFSET;

                // const isHeightFits = true;

                const contentFits = isWidthFits && isHeightFits;

                const calculatedAnchorTop =
                    offsetTop < MIN_AVAILABLE_TOP_OFFSET || contentFits ? 0 : offsetTop;

                setExtraElementsTop(calculatedAnchorTop);
                setIsInlineExtraElements(contentFits);
                setIsVerticalOverflowing(!isHeightFits);
            }
        }, []);

        React.useLayoutEffect(() => {
            if (showAnchor || showHint) {
                calculateExtraElements();
            } else {
                setIsInlineExtraElements(false);
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
        }, [showAnchor, showHint]);

        const relativePosition = !showAnchor && !isVerticalOverflowing;

        const getStyles = () => {
            const fontStyles = getFontStyleBySize(data.size);

            if (isInlineExtraElements) {
                return fontStyles;
            }

            const noAnchorTop = isVerticalOverflowing ? 0 : getTopOffsetBySize(data.size);

            return {
                ...fontStyles,
                top: showAnchor ? extraElementsTop : noAnchorTop,
            };
        };

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
                        'with-inline-extra-elements': Boolean(withInlineExtraElements),
                        'with-absolute-anchor': withAbsoluteAnchor && !withAbsoluteHint,
                        'with-absolute-hint': withAbsoluteHint && !withAbsoluteAnchor,
                        'with-absolute-hint-and-anchor': withAbsoluteHint && withAbsoluteAnchor,
                        absolute: !isInlineExtraElements,
                        relative: relativePosition,
                    })}
                    ref={contentRef}
                >
                    {content}
                    <div
                        className={b('extra-elements-container', {
                            absolute: !isInlineExtraElements,
                        })}
                        style={getStyles()}
                        ref={extraRef}
                        {...{[EXPORT_PRINT_HIDDEN_ATTR]: true}}
                    >
                        {showHint && (
                            <MarkdownHelpPopover
                                size={data.size}
                                markdown={data.hint?.text ?? ''}
                                className={b('hint')}
                                popoverProps={{
                                    placement: 'bottom',
                                }}
                                buttonProps={{
                                    className: b('hint-button'),
                                }}
                            />
                        )}
                        <AnchorLink to={data.text} show={showAnchor} />
                    </div>
                </div>
            </RendererWrapper>
        );
    },
};

export default titlePlugin;
