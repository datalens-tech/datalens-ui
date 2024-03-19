import {transform as latex} from '@diplodoc/latex-extension/plugin';
import yfmTransform from '@diplodoc/transform';
import cut from '@diplodoc/transform/lib/plugins/cut';
import deflist from '@diplodoc/transform/lib/plugins/deflist';
import imsize from '@diplodoc/transform/lib/plugins/imsize';
import notes from '@diplodoc/transform/lib/plugins/notes';
import table from '@diplodoc/transform/lib/plugins/table';
import {defaultOptions} from '@diplodoc/transform/lib/sanitize';
import MarkdownIt from 'markdown-it';
import mila from 'markdown-it-link-attributes';

import {registry} from '../../../registry';

export function renderHTML({text = '', lang}: {text: string; lang: string}): {result: string} {
    const plugins = [
        deflist,
        notes,
        cut,
        (md: MarkdownIt) =>
            md.use(mila, {
                matcher(href: string) {
                    return !href.startsWith('#');
                },
                attrs: {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
        imsize,
        table,
        latex({
            bundle: false,
            runtime: 'extension:latex',
        }),
    ];

    const yfmPlugins = registry.getYfmPlugins();
    if (yfmPlugins) {
        plugins.push(...yfmPlugins);
    }

    const {
        result: {html},
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
    return {result: html};
}
