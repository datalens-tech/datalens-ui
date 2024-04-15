import React from 'react';

import {
    PluginText,
    PluginTextObjectSettings,
    PluginTextProps,
    pluginText,
} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import {adjustWidgetLayout as dashkitAdjustWidgetLayout} from 'ui/components/DashKit/utils';
import {YFM_MARKDOWN_CLASSNAME} from 'ui/constants/yfm';

import {getRandomCKId} from '../../../../libs/DatalensChartkit/ChartKit/helpers/getRandomCKId';
import {YfmWrapper} from '../../../YfmWrapper/YfmWrapper';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import './Text.scss';

type Props = Omit<PluginTextProps, 'apiHandler'>;

const b = block('dashkit-plugin-text-container');

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
        const [textReady, setTextReady] = React.useState<string>('');
        const [randomId, setRandomId] = React.useState<string>('');
        const rootNodeRef = React.useRef<HTMLDivElement>(null);
        const cutNodesRef = React.useRef<NodeList | null>(null);
        const mutationObserver = React.useRef<MutationObserver | null>(null);

        /**
         * get prepared text with markdown
         */
        const textHandler = React.useCallback(
            async (arg: {text: string}) => {
                const text = await pluginText._apiHandler!(arg);
                setTextReady(text?.result);
                return text;
            },
            [pluginText._apiHandler],
        );

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
                    mainNodeSelector: `.${YFM_MARKDOWN_CLASSNAME}.${b()}`,
                    scrollableNodeSelector: `.${YFM_MARKDOWN_CLASSNAME} .${YFM_MARKDOWN_CLASSNAME}`,
                });
            },
            [props.id, rootNodeRef, props.adjustWidgetLayout, props.layout, props.gridLayout],
        );

        /**
         * call adjust function after all text was rendered (ketex formulas, markdown, etc)
         * and after cut opened/closed
         */
        const handleTextRender = React.useCallback(() => {
            adjustLayout(!props.data.autoHeight);
        }, [props.data.autoHeight, adjustLayout]);

        const content = <PluginText {...props} apiHandler={textHandler} ref={forwardedRef} />;

        /**
         * force rerender after get markdown text to see magic links
         */
        React.useEffect(() => {
            setRandomId(String(getRandomCKId()));
        }, [textReady]);

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

        return (
            <RendererWrapper type="text" nodeRef={rootNodeRef}>
                <YfmWrapper
                    content={<div className={b('content-wrap', null, randomId)}>{content}</div>}
                    className={b()}
                    onRenderCallback={handleTextRender}
                />
            </RendererWrapper>
        );
    },
};

export default textPlugin;
