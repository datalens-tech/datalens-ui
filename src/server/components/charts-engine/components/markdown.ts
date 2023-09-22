import yfmTransform from '@doc-tools/transform';
import cut from '@doc-tools/transform/lib/plugins/cut';
import deflist from '@doc-tools/transform/lib/plugins/deflist';
import imsize from '@doc-tools/transform/lib/plugins/imsize';
import notes from '@doc-tools/transform/lib/plugins/notes';
import table from '@doc-tools/transform/lib/plugins/table';
import katex from 'markdown-it-katex';
import mila from 'markdown-it-link-attributes';

import {registry} from '../../../registry';

export function renderHTML({text = '', lang}: {text: string; lang: string}): {result: string} {
    const plugins = [deflist, notes, cut, mila, imsize, table, katex];

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
        attrs: {
            target: '_blank',
            rel: 'noopener noreferrer',
        },
        disableLiquid: true,
        needToSanitizeHtml: true,
    });
    return {result: html};
}
