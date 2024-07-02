import React from 'react';

import type {MarkupItem} from 'shared/types';
import {Markup} from 'ui/components/Markup';

type RenderToString = (element: React.ReactElement) => string;

export const renderPossibleMarkupItems = (
    renderToString: RenderToString,
    data: {text: string; value?: MarkupItem; key?: string}[],
) => {
    data.forEach((d) => {
        if (d.key && d.value) {
            // We do not need an original data, than it more convenient to have mutation here instead of cloneDeep
            // eslint-disable-next-line no-param-reassign
            d.text = renderToString(
                <React.Fragment>
                    {d.key}: <Markup item={d.value} />
                </React.Fragment>,
            );
        }
    });
};
