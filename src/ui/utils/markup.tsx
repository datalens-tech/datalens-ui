import React from 'react';

import escape from 'lodash/escape';
import type {MarkupItem} from 'shared';
import {isMarkupItem} from 'shared/modules/markup';

import {Markup} from '../components/Markup';

export const getRenderMarkupToStringFn = async () => {
    const ReactDOMServer = await import(
        /* webpackChunkName: "react-dom/server" */ 'react-dom/server'
    );
    const renderToString = ReactDOMServer.renderToStaticMarkup;
    return function (value: MarkupItem | string | undefined) {
        if (!isMarkupItem(value)) {
            return escape(String(value));
        }

        return renderToString(<Markup item={value} />);
    };
};
