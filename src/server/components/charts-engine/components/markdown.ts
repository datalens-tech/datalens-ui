import {renderHTML as renderHtmlFromMarkdown} from '../../../../shared/modules/markdown/markdown';
import {registry} from '../../../registry';

export function renderHTML(args: {text: string; lang: string}) {
    return renderHtmlFromMarkdown({...args, plugins: registry.getYfmPlugins()});
}
