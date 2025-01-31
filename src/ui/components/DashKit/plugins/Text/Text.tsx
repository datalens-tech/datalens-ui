import React from 'react';

import type {PluginTextObjectSettings, PluginTextProps} from '@gravity-ui/dashkit';
import {PluginText, pluginText} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import type {DashTabItemText} from 'shared';
import {
    adjustWidgetLayout as dashkitAdjustWidgetLayout,
    getPreparedWrapSettings,
} from 'ui/components/DashKit/utils';
import {CustomPaletteBgColors} from 'ui/constants/widgets';
import {YFM_MARKDOWN_CLASSNAME} from 'ui/constants/yfm';
import {usePrevious} from 'ui/hooks';

import {useBeforeLoad} from '../../../../hooks/useBeforeLoad';
import {YfmWrapper} from '../../../YfmWrapper/YfmWrapper';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import './Text.scss';

type Props = Omit<PluginTextProps, 'apiHandler'>;

const b = block('dashkit-plugin-text-container');

const WIDGET_RESIZE_DEBOUNCE_TIMEOUT = 100;

const setObserve = (
    nodesRef: React.MutableRefObject<NodeList | null>,
    observerRef: React.MutableRefObject<MutationObserver | null>,
) => {
    if (!nodesRef.current || !observerRef.current) {
        return false;
    }

    nodesRef.current.forEach((cutNode) => {
        observerRef.current?.observe(cutNode, {
            attributes: true,
            attributeFilter: ['class'],
        });
    });

    return true;
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
        const cutNodesRef = React.useRef<NodeList | null>(null);
        const tabsNodesRef = React.useRef<NodeList | null>(null);
        const mutationObserver = React.useRef<MutationObserver | null>(null);
        const observedIsSetRef = React.useRef<{[key: string]: boolean}>({cuts: false, tabs: false});
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

        /**
         * watching content changes to check if adjustLayout needed for autoheight widgets update
         */
        // TODO move this logic in isPending check hook and instead of useEffect use it as callback
        React.useEffect(() => {
            if (!mutationObserver) {
                return;
            }

            mutationObserver.current = new MutationObserver(() => {
                requestAnimationFrame(() => handleTextRender());
            });

            observedIsSetRef.current.cuts = setObserve(cutNodesRef, mutationObserver);
            observedIsSetRef.current.tabs = setObserve(tabsNodesRef, mutationObserver);

            // eslint-disable-next-line consistent-return
            return () => {
                mutationObserver.current?.disconnect();
                observedIsSetRef.current = {cuts: false, tabs: false};
            };
        }, [
            handleTextRender,
            mutationObserver,
            rootNodeRef,
            cutNodesRef.current,
            tabsNodesRef.current,
        ]);

        const cutNodes = rootNodeRef.current?.querySelectorAll(`.${YFM_MARKDOWN_CLASSNAME}-cut`);
        const tabsNodes = rootNodeRef.current?.querySelectorAll(`.${YFM_MARKDOWN_CLASSNAME}-tab`);

        if (cutNodes?.length && !cutNodesRef.current) {
            cutNodesRef.current = cutNodes;

            if (!observedIsSetRef.current.cuts) {
                setObserve(cutNodesRef, mutationObserver);
            }
        }

        if (tabsNodes?.length && !tabsNodesRef.current) {
            tabsNodesRef.current = tabsNodes;

            if (!observedIsSetRef.current.tabs) {
                setObserve(tabsNodesRef, mutationObserver);
            }
        }

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
            currentLayout.h,
            currentLayout.w,
            classMod,
            data.background?.color,
        ]);

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
