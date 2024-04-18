import React from 'react';

import {
    PluginText,
    PluginTextObjectSettings,
    PluginTextProps,
    pluginText,
} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import {adjustWidgetLayout as dashkitAdjustWidgetLayout} from 'ui/components/DashKit/utils';
import {YFM_KATEX_MARKDOWN_CLASSNAME, YFM_MARKDOWN_CLASSNAME} from 'ui/constants/yfm';

//import {getRandomCKId} from '../../../../libs/DatalensChartkit/ChartKit/helpers/getRandomCKId';
//import {usePrevious} from '../../../../../../api/ui/hooks';
import {YfmWrapper} from '../../../YfmWrapper/YfmWrapper';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import './Text.scss';

type Props = Omit<PluginTextProps, 'apiHandler'>;

const b = block('dashkit-plugin-text-container');

//const WIDGET_RESIZE_DEBOUNCE_TIMEOUT = 300;

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
        //const [textReady, setTextReady] = React.useState<string>('');
        //const [randomId, setRandomId] = React.useState<string>('');
        const rootNodeRef = React.useRef<HTMLDivElement>(null);
        const cutNodesRef = React.useRef<NodeList | null>(null);
        const mutationObserver = React.useRef<MutationObserver | null>(null);
        //console.log('textReady', textReady);
        //console.log('setRandomId', Boolean(setRandomId));
        /**
         * call common for charts & selectors adjust function for widget
         */
        const adjustLayout = React.useCallback(
            debounce((needSetDefault) => {
                //console.log('adjustLayout');

                const hasFormula = rootNodeRef.current?.innerHTML.includes(
                    YFM_KATEX_MARKDOWN_CLASSNAME,
                );
                //console.log('hasFn', hasFormula);

                const mainNodeSelector = hasFormula
                    ? `.${YFM_MARKDOWN_CLASSNAME}.${b()}` //'.dashkit-plugin-text-container__content-wrap' //'.dashkit-plugin-text_withMarkdown'
                    : `.${YFM_MARKDOWN_CLASSNAME}.${b()}`;
                const scrollableNodeSelector = hasFormula
                    ? '.dashkit-plugin-text-container__content-wrap' // '.dashkit-plugin-text_withMarkdown' //'.yfm' //'dashkit-plugin-text-container__content-wrap'
                    : `.${YFM_MARKDOWN_CLASSNAME} .${YFM_MARKDOWN_CLASSNAME}`;

                //const mainNodeSelector = `.${YFM_MARKDOWN_CLASSNAME}.${b()}`; //'.dashkit-plugin-text-container__content-wrap';
                //const scrollableNodeSelector = `.${YFM_MARKDOWN_CLASSNAME} .${YFM_MARKDOWN_CLASSNAME}`; //'.dashkit-plugin-text_withMarkdown';

                //const contentHeightSelector = '';
                //const contentScrollSelector = '';

                dashkitAdjustWidgetLayout({
                    widgetId: props.id,
                    needSetDefault,
                    rootNode: rootNodeRef,
                    gridLayout: props.gridLayout,
                    layout: props.layout,
                    cb: props.adjustWidgetLayout,
                    mainNodeSelector,
                    scrollableNodeSelector,
                    resetOverflow: hasFormula,
                });
                //}, 100);
            }, 300),
            [
                props.id,
                rootNodeRef,
                props.adjustWidgetLayout,
                props.layout,
                props.gridLayout,
                //textReady,
            ],
        );

        const handleTextRender = React.useCallback(() => {
            //debounce(() => adjustLayout(!props.data.autoHeight), 300);
            //console.log('handleTextRender');
            adjustLayout(!props.data.autoHeight);
        }, [props.data.autoHeight, adjustLayout]);

        /**
         * get prepared text with markdown
         */
        const textHandler = React.useCallback(
            async (arg: {text: string}) => {
                const text = await pluginText._apiHandler!(arg);
                //setTextReady(text?.result);

                adjustLayout(!props.data.autoHeight);
                return text;
            },
            [adjustLayout, props.data.autoHeight],
        );

        /**
         * call adjust function after all text was rendered (ketex formulas, markdown, etc)
         * and after cut opened/closed
         */
        /*const handleTextRender = React.useCallback(() => {
            debounce(() => adjustLayout(!props.data.autoHeight), 300);
        }, [props.data.autoHeight, adjustLayout]);*/

        //

        /**
         * force rerender after get markdown text to see magic links
         */
        React.useEffect(() => {
            //console.log('useEffect');
            //setRandomId(String(getRandomCKId()));
            adjustLayout(!props.data.autoHeight);
        }, [adjustLayout, /*textReady,*/ props.data.autoHeight]);

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

        return (
            <RendererWrapper type="text" nodeRef={rootNodeRef}>
                <YfmWrapper
                    content={
                        <div className={b('content-wrap', null /*, randomId*/)}>{content}</div>
                    }
                    className={b()}
                    //@ts-ignore
                    onRenderCallback={adjustLayout}
                    autoHeight={Boolean(props.data.autoHeight)}
                />
            </RendererWrapper>
        );
    },
};

export default textPlugin;
