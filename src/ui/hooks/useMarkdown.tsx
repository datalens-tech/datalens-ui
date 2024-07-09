import React from 'react';

import {registry} from 'ui/registry';

import {YfmWrapper} from '../components/YfmWrapper/YfmWrapper';
import {DL} from '../constants';

type Props = {
    value: string;
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

            const {renderHTML} = await import('../../shared/modules/markdown/markdown');
            const {getAdditionalMarkdownPlugins} = registry.common.functions.getAll();
            const renderedMarkdown = renderHTML({
                text: value,
                lang: DL.USER_LANG,
                plugins: getAdditionalMarkdownPlugins(),
            });
            const yfmString = renderedMarkdown.result;
            MarkdownCollection.set(value, yfmString);
        } catch (e) {
            console.error('useMarkdown failed ', e);
        }
    }

    return MarkdownCollection.get(value);
}

export const useMarkdown = (props: Props) => {
    const {value} = props;
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

    return {markdown: <YfmWrapper content={markdown} setByInnerHtml={true} />, isLoading};
};
