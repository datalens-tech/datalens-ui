import {DL} from 'ui/constants/common';
import {getSdk} from 'ui/libs/schematic-sdk';

export const fetchBatchRenderedMarkdown = (texts: Record<string, string>) => {
    return getSdk().mix.batchRenderMarkdown({
        texts,
        lang: DL.USER_LANG,
    });
};

export const fetchRenderedMarkdown = (text: string) => {
    return getSdk().mix.renderMarkdown({
        text,
        lang: DL.USER_LANG,
    });
};
