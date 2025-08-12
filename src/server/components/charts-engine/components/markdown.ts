import type {MarkdownItPluginCb} from '@diplodoc/transform/lib/typings';

import {renderHTML as renderHtmlFromMarkdown} from '../../../../shared/modules/markdown/markdown';
import {registry} from '../../../registry';

export function renderHTML(
    args: {text: string; lang: string},
    additionalPlugins: MarkdownItPluginCb[] = [],
) {
    const plugins = registry.getYfmPlugins() ?? [];

    return renderHtmlFromMarkdown({
        ...args,
        plugins: [...plugins, ...additionalPlugins],
    });
}
