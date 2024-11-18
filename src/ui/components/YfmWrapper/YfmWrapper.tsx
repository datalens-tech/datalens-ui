import React from 'react';

import {useLatex} from '@diplodoc/latex-extension/react';
import {useMermaid} from '@diplodoc/mermaid-extension/react';
import {getThemeType, useThemeValue} from '@gravity-ui/uikit';
import type {DebouncedFunc} from 'lodash';
import debounce from 'lodash/debounce';
import {YfmMetaScripts} from 'shared/constants/yfm';
import {YFM_LATEX_CLASSNAME, YFM_MERMAID_CLASSNAME} from 'ui/constants';
import {registry} from 'ui/registry';

import type {YfmWrapperProps} from '../../registry/units/common/types/components/YfmWrapper';

let hasLatexImported = false;
let hasMermaidImported = false;

const PLUGINS_REDRAW_TIMEOUT = 100;

const dompurifyConfig = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTRIBUTES: [],
    ALLOW_ARIA_ATTR: false,
    ALLOW_DATA_ATTR: false,
};

const MERMAID_THEMES = ['light', 'dark'];

const getMermaidTheme = (theme: string) => {
    const currentThemeType = getThemeType(theme);

    return MERMAID_THEMES.includes(currentThemeType) ? currentThemeType : MERMAID_THEMES[0];
};

/**
 * Check latex and mermaid containers
 * when containers are first time passed they are empty and all data is stored in data attribute
 * if they don't have any child element it's an indicator that we need to update them
 */
const isNeedToUpdateNode = (el: Element) => {
    return el.children?.length === 0;
};

export const YfmWrapper = React.forwardRef<HTMLDivElement, Omit<YfmWrapperProps, 'ref'>>(
    (props, forwardedRef) => {
        const YfmWrapperContent = registry.common.components.get('YfmWrapperContent');
        const elementRef = React.useRef<HTMLDivElement | null>(null);
        const debouncedRenderLatexAndMermaid = React.useRef<
            DebouncedFunc<() => void> | undefined
        >();
        const hasLatexScript =
            Array.isArray(props.metaScripts) && props.metaScripts.includes(YfmMetaScripts.LATEX);
        const hasMermaidScript =
            Array.isArray(props.metaScripts) && props.metaScripts.includes(YfmMetaScripts.MERMAID);

        let ref: React.ForwardedRef<HTMLDivElement>;
        if (typeof forwardedRef === 'function') {
            ref = (el: HTMLDivElement | null) => {
                forwardedRef(el);
                elementRef.current = el;
            };
        } else if (forwardedRef) {
            ref = forwardedRef;
            elementRef.current = ref.current;
        } else {
            ref = elementRef;
        }

        const renderLatex = useLatex();
        const renderMermaid = useMermaid();
        const currentMermaidTheme = getMermaidTheme(useThemeValue());

        const renderLatexAndMermaid = () => {
            const element = elementRef?.current;

            if (!element) {
                return;
            }

            if (hasLatexScript) {
                const latexNodes = [...element.querySelectorAll(`.${YFM_LATEX_CLASSNAME}`)].filter(
                    isNeedToUpdateNode,
                );

                if (latexNodes.length) {
                    renderLatex({nodes: latexNodes}).then(() => {
                        props.onRenderCallback?.();
                    });
                }
            }

            if (hasMermaidScript) {
                const mermaidNodes = [
                    ...element.querySelectorAll(`.${YFM_MERMAID_CLASSNAME}`),
                ].filter(isNeedToUpdateNode);

                if (mermaidNodes.length) {
                    renderMermaid({
                        theme: currentMermaidTheme,
                        nodes: mermaidNodes,
                        dompurifyConfig,
                    }).then(() => {
                        props.onRenderCallback?.();
                    });
                }
            }
        };

        React.useEffect(() => {
            if (hasLatexScript && !hasLatexImported) {
                hasLatexImported = true;
                import('@diplodoc/latex-extension/runtime').catch(() => {
                    hasLatexImported = false;
                });
            }

            if (hasMermaidScript && !hasMermaidImported) {
                hasMermaidImported = true;
                import('@diplodoc/mermaid-extension/runtime').catch(() => {
                    hasMermaidImported = false;
                });
            }
        }, [hasLatexScript, hasMermaidScript]);

        React.useLayoutEffect(() => {
            if (!hasLatexScript && !hasMermaidScript) {
                return;
            }

            if (debouncedRenderLatexAndMermaid.current) {
                debouncedRenderLatexAndMermaid.current.cancel();
            }

            debouncedRenderLatexAndMermaid.current = debounce(
                renderLatexAndMermaid,
                PLUGINS_REDRAW_TIMEOUT,
            );
            debouncedRenderLatexAndMermaid.current();
        });

        return (
            <YfmWrapperContent
                content={props.content}
                setByInnerHtml={props.setByInnerHtml}
                className={props.className}
                noMagicLinks={props.noMagicLinks}
                ref={ref}
            />
        );
    },
);

YfmWrapper.displayName = 'YfmWrapper';
