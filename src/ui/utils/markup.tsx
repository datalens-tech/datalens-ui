import React from 'react';

import type {MarkupItem} from 'shared';

import {Markup} from '../components/Markup';

export const getRenderMarkupToStringFn = async () => {
    const ReactDOMServer = await import(
        /* webpackChunkName: "react-dom/server" */ 'react-dom/server'
    );
    const renderToString = ReactDOMServer.renderToString;
    return function (value: MarkupItem) {
        return renderToString(<Markup item={value} />);
    };
};
