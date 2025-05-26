import {transform as yfmCut} from '@diplodoc/cut-extension';
import {transform as latex} from '@diplodoc/latex-extension/plugin';
import {transform as mermaid} from '@diplodoc/mermaid-extension/plugin';
import {transform as yfmTabs} from '@diplodoc/tabs-extension';
import yfmTransform from '@diplodoc/transform';
import code from '@diplodoc/transform/lib/plugins/code';
import deflist from '@diplodoc/transform/lib/plugins/deflist';
import imsize from '@diplodoc/transform/lib/plugins/imsize';
import monospace from '@diplodoc/transform/lib/plugins/monospace';
import notes from '@diplodoc/transform/lib/plugins/notes';
import sup from '@diplodoc/transform/lib/plugins/sup';
import table from '@diplodoc/transform/lib/plugins/table';
import term from '@diplodoc/transform/lib/plugins/term';
import type {Lang, MarkdownItPluginCb} from '@diplodoc/transform/lib/plugins/typings';
import {defaultOptions} from '@diplodoc/transform/lib/sanitize';
// eslint-disable-next-line import/no-extraneous-dependencies
import type MarkdownIt from 'markdown-it';
import type {PluginWithParams} from 'markdown-it';
import MarkdownItColor from 'markdown-it-color';
import MarkdownItEmoji from 'markdown-it-emoji';
import MarkdonwItIns from 'markdown-it-ins';
import Mila from 'markdown-it-link-attributes';
import MarkdonwItMark from 'markdown-it-mark';
import MarkdonwItSub from 'markdown-it-sub';
import {v4 as uuidv4} from 'uuid';

import {YFM_COLORIFY_MARKDOWN_CLASSNAME, YfmMetaScripts} from '../../constants';

import {emojiDefs} from './emoji-defs';
import {unifyTermIds} from './markdown-plugins/unify-terms';

type RenderHtmlArgs = {
    text?: string;
    lang: Lang;
    plugins?: MarkdownItPluginCb[];
};

export type RenderHtmlOutput = {
    result: string;
    meta?: object;
};

export function renderHTML(args: RenderHtmlArgs): RenderHtmlOutput {
    const {text = '', lang, plugins: additionalPlugins = []} = args;

    const uniqPrefix = uuidv4();

    const plugins = [
        deflist,
        notes,
        yfmCut({bundle: false}) as PluginWithParams,
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
                .use(MarkdownItEmoji, {defs: emojiDefs})
                .use(unifyTermIds, {
                    prefix: uniqPrefix,
                }),
        yfmTabs({
            bundle: false,
            features: {
                enabledVariants: {
                    regular: true,
                    radio: false,
                    dropdown: false,
                    accordion: true,
                },
            },
        }),
        imsize,
        table,
        monospace,
        sup,
        MarkdonwItSub,
        MarkdonwItMark,
        MarkdonwItIns,
        latex({
            bundle: false,
            runtime: YfmMetaScripts.LATEX,
        }),
        mermaid({
            bundle: false,
            runtime: YfmMetaScripts.MERMAID,
        }),
        code,
    ];

    if (additionalPlugins) {
        plugins.push(...additionalPlugins);
    }

    // temp terms bug fix until the editor supports transform plugin
    const preparedTextWithTermDefs = text.replace(
        /^\s*?\\\[\\\*([\wа-я]+)\\\]:(.*?\S+?.*?)$/gim,
        '[*$1]:$2',
    );

    const preparedTextWithTermLinks = preparedTextWithTermDefs.replace(
        /(\[.+?\])\(\*(%.+?)\)/g,
        (_, p1, p2) => `${p1}(*${decodeURIComponent(p2)})`,
    );

    const {
        result: {html, meta},
    } = yfmTransform(preparedTextWithTermLinks, {
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
