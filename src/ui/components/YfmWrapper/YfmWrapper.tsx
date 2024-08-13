import React from 'react';

import {useLatex} from '@diplodoc/latex-extension/react';
import {useMermaid} from '@diplodoc/mermaid-extension/react';
import {getThemeType, useThemeValue} from '@gravity-ui/uikit';
import debounce from 'lodash/debounce';
import {YfmMetaScripts} from 'shared/constants/yfm';
import {YFM_LATEX_CLASSNAME, YFM_MERMAID_CLASSNAME} from 'ui/constants';
import {usePrevious} from 'ui/hooks';
import {registry} from 'ui/registry';

import type {YfmWrapperProps} from '../../registry/units/common/types/components/YfmWrapper';

let hasLatexImported = false;
let hasMermaidImported = false;

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

export const YfmWrapper = React.forwardRef<HTMLDivElement, Omit<YfmWrapperProps, 'ref'>>(
    (props, forwardedRef) => {
        const YfmWrapperContent = registry.common.components.get('YfmWrapperContent');
        const elementRef = React.useRef<HTMLDivElement | null>(null);
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
        const previousMermaidTheme = usePrevious(currentMermaidTheme);

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

        const debounceRender = React.useCallback(
            debounce(() => {
                const element = elementRef?.current;

                if (!element) {
                    return;
                }

                if (hasLatexScript) {
                    const latexNodes = element.querySelectorAll(`.${YFM_LATEX_CLASSNAME}`);

                    if (latexNodes.length) {
                        renderLatex({nodes: latexNodes}).then(() => {
                            props.onRenderCallback?.();
                        });
                    }
                }

                if (hasMermaidScript) {
                    const mermaidNodes = element.querySelectorAll(`.${YFM_MERMAID_CLASSNAME}`);

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
            }, 100),
            [
                elementRef,
                hasLatexScript,
                hasMermaidScript,
                renderLatex,
                renderMermaid,
                props.onRenderCallback,
            ],
        );

        React.useLayoutEffect(() => debounceRender(), [debounceRender]);

        React.useLayoutEffect(() => {
            const element = elementRef?.current;
            const isThemeChanged =
                previousMermaidTheme && currentMermaidTheme !== previousMermaidTheme;

            if (isThemeChanged && hasMermaidScript && element) {
                const mermaidNodes = element.querySelectorAll(`.${YFM_MERMAID_CLASSNAME}`);

                renderMermaid({
                    theme: currentMermaidTheme,
                    nodes: mermaidNodes,
                    dompurifyConfig,
                });
            }
        }, [currentMermaidTheme, hasMermaidScript, previousMermaidTheme, renderMermaid]);

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
