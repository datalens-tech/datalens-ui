import React from 'react';

import {registry} from '../../registry';

import {getRenderMarkdownFn} from './get-render-markdown-fn';

export type RenderMarkdownFn = (value: string) => string;

export async function getRenderYfmFn(): Promise<RenderMarkdownFn> {
    const renderMarkdown = await getRenderMarkdownFn();
    const ReactDOMServer = await import(
        /* webpackChunkName: "react-dom/server" */ 'react-dom/server'
    );
    const renderToString = ReactDOMServer.renderToString;
    const YfmWrapperContent = registry.common.components.get('YfmWrapperContent');

    return (value: string) => {
        const markdown = renderMarkdown(value);
        return renderToString(<YfmWrapperContent content={markdown} setByInnerHtml={true} />);
    };
}
