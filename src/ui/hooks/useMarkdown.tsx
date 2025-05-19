import React from 'react';

import {YfmWrapper} from '../components/YfmWrapper/YfmWrapper';
import {getRenderMarkdownFn} from '../utils/markdown/get-render-markdown-fn';

type Props = {
    value: string;
    className?: string;
};

const MD_COLLECTION_MAX_SIZE = 1000;
const MarkdownCollection = new Map();
async function renderMarkdown(value: string) {
    if (!MarkdownCollection.has(value)) {
        try {
            if (MarkdownCollection.size > MD_COLLECTION_MAX_SIZE) {
                const firstKey = MarkdownCollection.keys().next().value;
                MarkdownCollection.delete(firstKey);
            }

            const renderYfm = await getRenderMarkdownFn();
            MarkdownCollection.set(value, renderYfm(value));
        } catch (e) {
            console.error('useMarkdown failed ', e);
        }
    }

    return MarkdownCollection.get(value);
}

export const useMarkdown = (props: Props) => {
    const {value, className} = props;
    const [markdown, setMarkdown] = React.useState('');
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        if (!value) {
            return;
        }

        renderMarkdown(value).then((val) => {
            setMarkdown(val);
            setIsLoading(false);
        });
    }, [value]);

    return {
        markdown: <YfmWrapper className={className} content={markdown} setByInnerHtml={true} />,
        isLoading,
    };
};
