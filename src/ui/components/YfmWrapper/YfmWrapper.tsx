import React from 'react';

import {useLatex} from '@diplodoc/latex-extension/react';
// TODO: https://github.com/datalens-tech/datalens-ui/issues/753
import '@diplodoc/latex-extension/runtime';
import '@diplodoc/latex-extension/runtime/styles';
import {registry} from 'ui/registry';

import {YfmWrapperProps} from '../../registry/units/common/types/components/YfmWrapper';

export const YfmWrapper = React.forwardRef<HTMLDivElement, Omit<YfmWrapperProps, 'ref'>>(
    (props, ref) => {
        const YfmWrapperContent = registry.common.components.get('YfmWrapperContent');
        const renderLatex = useLatex();

        React.useLayoutEffect(() => {
            renderLatex();
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
