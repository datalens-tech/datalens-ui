import {DL} from '../../../../../../../../../constants/common';
import {getSdk} from '../../../../../../../../schematic-sdk';

export const fetchBatchRenderedMarkdown = (texts: Record<string, string>) => {
    return getSdk().mix.batchRenderMarkdown({
        texts,
        lang: DL.USER_LANG,
    });
};
