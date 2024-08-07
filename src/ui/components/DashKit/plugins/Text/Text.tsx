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
import {YFM_MARKDOWN_CLASSNAME} from 'ui/constants/yfm';

import {YfmWrapper} from '../../../YfmWrapper/YfmWrapper';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import './Text.scss';

type Props = Omit<PluginTextProps, 'apiHandler'>;

const b = block('dashkit-plugin-text-container');

const WIDGET_RESIZE_DEBOUNCE_TIMEOUT = 100;

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
        const mutationObserver = React.useRef<MutationObserver | null>(null);
        const [metaScripts, setMetaScripts] = React.useState<string[] | undefined>();

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
                    mainNodeSelector: `.${YFM_MARKDOWN_CLASSNAME}.${b()}`,
                    scrollableNodeSelector: `.${YFM_MARKDOWN_CLASSNAME} .${YFM_MARKDOWN_CLASSNAME}`,
                });
            }, WIDGET_RESIZE_DEBOUNCE_TIMEOUT),
            [props.id, rootNodeRef, props.adjustWidgetLayout, props.layout, props.gridLayout],
        );

        /**
         * call adjust function after all text was rendered (ketex formulas, markdown, etc)
         * and after cut opened/closed
         */
        const handleTextRender = React.useCallback(() => {
            adjustLayout(!props.data.autoHeight);
        }, [props.data.autoHeight, adjustLayout]);

        /**
         * get prepared text with markdown
         */
        const textHandler = React.useCallback(
            async (arg: {text: string}) => {
                const text = await pluginText._apiHandler!(arg);
                const nextMetaScripts = get(text, 'meta.script');
                setMetaScripts(nextMetaScripts);
                handleTextRender();
                return text;
            },
            [pluginText._apiHandler, handleTextRender],
        );

        /**
         * force rerender after get markdown text to see magic links
         */
        React.useEffect(() => {
            handleTextRender();
        }, [handleTextRender]);

        /**
         * watching content changes to check if adjustLayout needed for autoheight widgets update
         */
        React.useEffect(() => {
            if (!mutationObserver) {
                return;
            }
            mutationObserver.current = new MutationObserver(handleTextRender);

            if (mutationObserver.current && cutNodesRef.current) {
                cutNodesRef.current.forEach((cutNode) => {
                    mutationObserver.current?.observe(cutNode, {
                        attributes: true,
                        attributeFilter: ['class'],
                    });
                });
            }
            return () => {
                mutationObserver.current?.disconnect();
            };
        }, [handleTextRender, mutationObserver, rootNodeRef, cutNodesRef.current]);

        const nodes = rootNodeRef.current?.querySelectorAll(`.${YFM_MARKDOWN_CLASSNAME}-cut`);

        if (nodes?.length && !cutNodesRef.current) {
            cutNodesRef.current = nodes;
        }

        const content = <PluginText {...props} apiHandler={textHandler} ref={forwardedRef} />;

        const data = props.data as DashTabItemText['data'];

        const showBgColor = Boolean(
            data.background?.enabled &&
                data.background?.color &&
                data.background?.color !== 'transparent',
        );

        const {classMod, style} = getPreparedWrapSettings(showBgColor, data.background?.color);

        return (
            <RendererWrapper
                type="text"
                nodeRef={rootNodeRef}
                style={style as React.StyleHTMLAttributes<HTMLDivElement>}
                classMod={classMod}
            >
                <YfmWrapper
                    // needed for force update when text is changed
                    key={data.text}
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
