import {DL} from '../../constants';
import {registry} from '../../registry';

export async function getRenderMarkdownFn() {
    const {getAdditionalMarkdownPlugins} = registry.common.functions.getAll();
    const {renderHTML} = await import(
        /* webpackChunkName: "markdown" */ '../../../shared/modules/markdown/markdown'
    );
    const plugins = await getAdditionalMarkdownPlugins();
    return function (value: string) {
        const renderedMarkdown = renderHTML({
            text: value,
            lang: DL.USER_LANG,
            plugins,
        });

        return renderedMarkdown.result;
    };
}
