import React from 'react';

import {useLatex} from '@diplodoc/latex-extension/react';
import debounce from 'lodash/debounce';
import {YFM_LATEX_CLASSNAME} from 'ui/constants';
import {registry} from 'ui/registry';

import {YfmWrapperProps} from '../../registry/units/common/types/components/YfmWrapper';

export const YfmWrapper = React.forwardRef<HTMLDivElement, Omit<YfmWrapperProps, 'ref'>>(
    (props, ref) => {
        const YfmWrapperContent = registry.common.components.get('YfmWrapperContent');
        const elementRef = React.useRef<HTMLDivElement | null>(null);

        const renderLatex = useLatex();

        const renderLatexDebounce = React.useCallback(
            debounce(() => {
                const element = elementRef.current;

                if (!element) {
                    return;
                }

                renderLatex({
                    nodes: element.querySelectorAll(`.${YFM_LATEX_CLASSNAME}`),
                }).then(() => {
                    props.onRenderCallback?.();
                });
            }, 100),
            [elementRef, renderLatex, props.onRenderCallback],
        );

        React.useLayoutEffect(() => renderLatexDebounce(), [renderLatexDebounce]);

        React.useEffect(() => {
            // TODO: https://github.com/datalens-tech/datalens-ui/issues/753
            import('@diplodoc/latex-extension/runtime').then(() => {
                props.onRenderCallback?.();
            });
        }, []);

        return (
            <YfmWrapperContent
                content={props.content}
                setByInnerHtml={props.setByInnerHtml}
                className={props.className}
                noMagicLinks={props.noMagicLinks}
                ref={(divElement) => {
                    if (typeof ref === 'function') {
                        ref?.(divElement);
                    } else if (ref) {
                        ref.current = divElement;
                    }

                    elementRef.current = divElement;
                }}
            />
        );
    },
);

YfmWrapper.displayName = 'YfmWrapper';
