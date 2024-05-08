import React from 'react';

import {YfmWrapper} from '../components/YfmWrapper/YfmWrapper';
import {DL} from '../constants';
import {getSdk} from '../libs/schematic-sdk';

type Props = {
    value: string;
};

const MarkdownCollection = new Map();
async function renderMarkdown(value: string) {
    if (!MarkdownCollection.has(value)) {
        try {
            const response = await getSdk().mix.renderMarkdown({text: value, lang: DL.USER_LANG});
            const yfmString = response.result;
            MarkdownCollection.set(value, yfmString);
        } catch (e) {
            console.error('useMarkdown failed ', e);
        }
    }

    return MarkdownCollection.get(value);
}

export const useMarkdown = (props: Props) => {
    const {value} = props;
    const [markdown, setMarkdown] = React.useState<React.ReactNode>('');
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        if (!value) {
            return;
        }

        renderMarkdown(value).then((val) => {
            setMarkdown(<YfmWrapper content={val} setByInnerHtml={true} />);
            setIsLoading(false);
        });
    }, [value]);

    return {markdown, isLoading};
};
