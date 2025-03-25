import React from 'react';

import type {PopupPlacement} from '@gravity-ui/uikit';

import {
    ATTR_DATA_TOOLTIP_CONTENT,
    ATTR_DATA_TOOLTIP_PLACEMENT,
} from '../../../../libs/DatalensChartkit/modules/html-generator/constants';
import type {TemplateItem} from '../../types';

type Props = {
    content: React.ReactElement | string;
    children?: (string | TemplateItem)[];
    placement?: PopupPlacement;
    tooltipId?: string;
};

export function MarkupTooltip(props: Props) {
    const {children, content = '', tooltipId, placement = 'auto'} = props;

    const attrs = {
        [ATTR_DATA_TOOLTIP_CONTENT]: JSON.stringify(content),
        [ATTR_DATA_TOOLTIP_PLACEMENT]: JSON.stringify(placement),
    };

    return (
        <div id={tooltipId} style={{display: 'inline-block'}} {...attrs}>
            {children}
        </div>
    );
}
