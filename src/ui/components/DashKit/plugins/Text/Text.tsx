import React from 'react';

import type {PluginTextObjectSettings, PluginTextProps} from '@gravity-ui/dashkit';
import {PluginText, pluginText} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import type {DashTabItemText} from 'shared';
import {CustomPaletteBgColors} from 'shared/constants/widgets';
import {
    adjustWidgetLayout as dashkitAdjustWidgetLayout,
    getPreparedWrapSettings,
} from 'ui/components/DashKit/utils';
import {YFM_MARKDOWN_CLASSNAME} from 'ui/constants/yfm';
import {usePrevious} from 'ui/hooks';

import {useBeforeLoad} from '../../../../hooks/useBeforeLoad';
import {YfmWrapper} from '../../../YfmWrapper/YfmWrapper';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import './Text.scss';

type Props = Omit<PluginTextProps, 'apiHandler'>;

const b = block('dashkit-plugin-text-container');

const WIDGET_RESIZE_DEBOUNCE_TIMEOUT = 100;

const useWatchDomResizeObserver = ({
    domNodeGetter,
    onResize,
    enable = false,
}: {
    domNodeGetter: () => HTMLElement | null;
    onResize: () => void;
    enable: boolean;
}) => {
    const currentRectRef = React.useRef({width: 0, height: 0});
    const domElement = enable ? domNodeGetter() : null;

    React.useEffect(() => {
        if (!domElement) {
            return;
        }

        const observer = new ResizeObserver(
            debounce((entries) => {
                if (!entries[0]) {
                    return;
                }
                const {width, height} = entries[0].contentRect;
                const currentRect = currentRectRef.current;

                if (currentRect.height !== height || currentRect.width !== width) {
                    currentRect.height = height;
                    currentRect.width = width;

                    onResize();
                }
            }, WIDGET_RESIZE_DEBOUNCE_TIMEOUT),
        );

        observer.observe(domElement);

        // eslint-disable-next-line consistent-return
        return () => {
            observer.disconnect();
        };
    }, [domElement, onResize]);
};

const textPlugin = {
    ...pluginText,
    setSettings(settings: PluginTextObjectSettings) {
        const {apiHandler} = settings;
        pluginText._apiHandler = apiHandler;
        return textPlugin;
    },
    renderer: function Wrapper(
        props: Props,
        forwardedRef: React.LegacyRef<PluginText> | undefined,
    ) {
        const rootNodeRef = React.useRef<HTMLDivElement>(null);
        const [metaScripts, setMetaScripts] = React.useState<string[] | undefined>();
        const [isPending, setIsPending] = React.useState<boolean>(false);

        const previousPendingState = usePrevious(isPending);
        const isPendingChanged = isPending !== previousPendingState;
        const handleUpdate = useBeforeLoad(props.onBeforeLoad);

        /**
         * Increment render key
         */
        const YfmWrapperKeyRef = React.useRef(0);

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
                    cb: (...args) => {
                        return props.adjustWidgetLayout(...args);
                    },
                    mainNodeSelector: `.${YFM_MARKDOWN_CLASSNAME}.${b()}`,
                    scrollableNodeSelector: `.${YFM_MARKDOWN_CLASSNAME} .${YFM_MARKDOWN_CLASSNAME}`,
                });
            }, WIDGET_RESIZE_DEBOUNCE_TIMEOUT),
            [props.id, rootNodeRef, layoutRef, props.adjustWidgetLayout, props.gridLayout],
        );

        /**
         * call adjust function after all text was rendered (ketex formulas, markdown, etc)
         * and after cut opened/closed, change tabs
         */
        const handleTextRender = React.useCallback(() => {
            adjustLayout(!props.data.autoHeight);
            handleUpdate?.();
        }, [handleUpdate, adjustLayout, props.data.autoHeight]);

        /**
         * get prepared text with markdown
         */
        const textHandler = React.useCallback(
            async (arg: {text: string}) => {
                setIsPending(true);
                const text = await pluginText._apiHandler!(arg);
                const nextMetaScripts = get(text, 'meta.script');

                setMetaScripts(nextMetaScripts);
                setIsPending(false);
                return text;
            },
            [setIsPending],
        );

        /**
         * force rerender after get autoheight prop is changed
         */
        React.useEffect(() => {
            handleTextRender();
        }, [props.data.autoHeight]);

        const content = <PluginText {...props} apiHandler={textHandler} ref={forwardedRef} />;

        const data = props.data as DashTabItemText['data'];

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

        /**
         * triggering update after text is loaded
         */
        React.useEffect(() => {
            if (isPendingChanged && !isPending) {
                handleTextRender();
            }
        }, [isPendingChanged, isPending, handleTextRender]);

        /**
         * watching for all visual props of chart
         */
        React.useEffect(() => {
            handleUpdate?.();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [
            // Widget dimensions
            currentLayout.x,
            currentLayout.y,
            classMod,
            data.background?.color,
        ]);

        /**
         * Watching yfm width, height - as result currentLayout.w, currentLayout.h
         */
        useWatchDomResizeObserver({
            domNodeGetter: () =>
                rootNodeRef.current?.querySelector(
                    `.${YFM_MARKDOWN_CLASSNAME}.${b()} .${YFM_MARKDOWN_CLASSNAME}`,
                ) || null,
            onResize: handleTextRender,
            enable: props.data.autoHeight as boolean,
        });

        /**
         * Increment key to force yfm editor redraw
         * In that case if text is changed shallow matcher content props will not detect as there is always passed <div/>
         * So to force YfmWrapper to update when text changes key prop is used
         */
        React.useEffect(() => {
            YfmWrapperKeyRef.current += 1;
        }, [YfmWrapperKeyRef, data.text]);

        return (
            <RendererWrapper
                id={props.id}
                type="text"
                nodeRef={rootNodeRef}
                style={style as React.StyleHTMLAttributes<HTMLDivElement>}
                classMod={classMod}
            >
                <YfmWrapper
                    // needed for force update when text is changed
                    key={`yfm_${YfmWrapperKeyRef.current}`}
                    content={<div className={b('content-wrap', null)}>{content}</div>}
                    className={b({'with-color': Boolean(showBgColor)})}
                    metaScripts={metaScripts}
                    onRenderCallback={handleTextRender}
                />
            </RendererWrapper>
        );
    },
};

export default textPlugin;
