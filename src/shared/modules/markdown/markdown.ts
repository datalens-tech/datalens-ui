import {transform as latex} from '@diplodoc/latex-extension/plugin';
import {transform as mermaid} from '@diplodoc/mermaid-extension/plugin';
import yfmTransform from '@diplodoc/transform';
import cut from '@diplodoc/transform/lib/plugins/cut';
import deflist from '@diplodoc/transform/lib/plugins/deflist';
import imsize from '@diplodoc/transform/lib/plugins/imsize';
import notes from '@diplodoc/transform/lib/plugins/notes';
import table from '@diplodoc/transform/lib/plugins/table';
import term from '@diplodoc/transform/lib/plugins/term';
import type {MarkdownItPluginCb} from '@diplodoc/transform/lib/plugins/typings';
import {defaultOptions} from '@diplodoc/transform/lib/sanitize';
// eslint-disable-next-line import/no-extraneous-dependencies
import type MarkdownIt from 'markdown-it';
import MarkdownItColor from 'markdown-it-color';
import Mila from 'markdown-it-link-attributes';
import uuid from 'uuid';

import {YFM_COLORIFY_MARKDOWN_CLASSNAME, YfmMetaScripts} from '../../constants';

import {unifyTermIds} from './markdown-plugins/unify-terms';

type RenderHtmlArgs = {
    text?: string;
    lang: string;
    plugins?: MarkdownItPluginCb[];
};

export type RenderHtmlOutput = {
    result: string;
    meta?: object;
};

export function renderHTML(args: RenderHtmlArgs): RenderHtmlOutput {
    const {text = '', lang, plugins: additionalPlugins = []} = args;

    const uniqPrefix = uuid.v4();

    const plugins = [
        deflist,
        notes,
        cut,
        term,
        (md: MarkdownIt) =>
            md
                .use(Mila, {
                    matcher(href: string) {
                        return !href.startsWith('#');
                    },
                    attrs: {
                        target: '_blank',
                        rel: 'noopener noreferrer',
                    },
                })
                .use(MarkdownItColor, {
                    defaultClassName: YFM_COLORIFY_MARKDOWN_CLASSNAME,
                })
                .use(unifyTermIds, {
                    prefix: uniqPrefix,
                }),
        imsize,
        table,
        latex({
            bundle: false,
            runtime: YfmMetaScripts.LATEX,
        }),
        mermaid({
            bundle: false,
            runtime: YfmMetaScripts.MERMAID,
        }),
    ];

    if (additionalPlugins) {
        plugins.push(...additionalPlugins);
    }

    const {
        result: {html, meta},
    } = yfmTransform(text, {
        plugins,
        lang,
        vars: {},
        disableLiquid: true,
        needToSanitizeHtml: true,
        sanitizeOptions: {
            ...defaultOptions,
            disableStyleSanitizer: true,
        },
    });
    return {result: html, meta};
}
