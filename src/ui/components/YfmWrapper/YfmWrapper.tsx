import React from 'react';

import {registry} from 'ui/registry';

import {YfmWrapperProps} from '../../registry/units/common/types/components/YfmWrapper';

export const YfmWrapper = React.forwardRef<HTMLDivElement, Omit<YfmWrapperProps, 'ref'>>(
    (props, ref) => {
        const YfmWrapperContent = registry.common.components.get('YfmWrapperContent');

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
