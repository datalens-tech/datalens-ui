import escape from 'lodash/escape';
import {WRAPPED_MARKDOWN_KEY} from 'shared';
import type {MarkupItem} from 'shared/types';

type RenderToString = (element: MarkupItem) => string;

type DataItem = {text: string; value?: MarkupItem; key?: string; [WRAPPED_MARKDOWN_KEY]?: string};

export const renderPossibleMarkupItems = (
    renderMarkupToString: RenderToString,
    renderMarkdownToString: undefined | ((value: unknown) => string),
    data: (DataItem | null)[],
) => {
    data.forEach((d) => {
        if (d?.key && d?.value) {
            // We do not need an original data, than it more convenient to have mutation here instead of cloneDeep
            // eslint-disable-next-line no-param-reassign
            d.text = `${escape(d.key)}: ${renderMarkupToString(d.value)}`;
        }

        if (d && d?.[WRAPPED_MARKDOWN_KEY] && renderMarkdownToString) {
            // eslint-disable-next-line no-param-reassign
            d.text = renderMarkdownToString(d[WRAPPED_MARKDOWN_KEY]);
        }
    });
};
