import React from 'react';

import {useLatex} from '@diplodoc/latex-extension/react';
import debounce from 'lodash/debounce';
import {YFM_LATEX_CLASSNAME} from 'ui/constants';
import {registry} from 'ui/registry';

import {YfmWrapperProps} from '../../registry/units/common/types/components/YfmWrapper';

export const YfmWrapper = React.forwardRef<HTMLDivElement, Omit<YfmWrapperProps, 'ref'>>(
    (props, forwardedRef) => {
        const YfmWrapperContent = registry.common.components.get('YfmWrapperContent');
        const elementRef = React.useRef<HTMLDivElement | null>(null);

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

        React.useEffect(() => {
            // TODO: https://github.com/datalens-tech/datalens-ui/issues/753
            import('@diplodoc/latex-extension/runtime');
        }, []);

        const debounceRender = React.useCallback(
            debounce(() => {
                const element = elementRef?.current;

                if (!element) {
                    return;
                }
                const nodes = element.querySelectorAll(`.${YFM_LATEX_CLASSNAME}`);

                if (nodes.length) {
                    renderLatex({nodes}).then(() => {
                        props.onRenderCallback?.();
                    });
                }
            }, 100),
            [elementRef, renderLatex, props.onRenderCallback],
        );

        React.useLayoutEffect(() => debounceRender(), [debounceRender]);

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
