import type {MarkupItem} from '../../../../shared';

export function markupToRawString(obj: MarkupItem, str = ''): string {
    let text = str;

    if (obj.children) {
        text =
            text +
            obj.children
                .map((item) => (typeof item === 'object' ? markupToRawString(item, text) : text))
                .join('');
    } else if (obj.content && typeof obj.content === 'string') {
        text = text + obj.content;
    } else if (obj.content && typeof obj.content === 'object') {
        text = markupToRawString(obj.content, text);
    }

    return text;
}
