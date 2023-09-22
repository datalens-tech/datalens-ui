import {DL} from '../../../../../constants/common';
import {getSdk} from '../../../../schematic-sdk';

export const fetchRenderedMarkdown = (text: string) => {
    return getSdk().mix.renderMarkdown({
        text,
        lang: DL.USER_LANG,
    });
};
