import {WRAPPED_MARKDOWN_KEY} from '../constants';

export function wrapMarkdownValue(value: string) {
    return {[WRAPPED_MARKDOWN_KEY]: value};
}

export type WrappedMarkdown = ReturnType<typeof wrapMarkdownValue>;
