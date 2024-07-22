import type {DashData, Dictionary} from 'shared';
import {DashTabItemType} from 'shared';

import {DL} from '../constants';
import logger from '../libs/logger';
import {getSdk} from '../libs/schematic-sdk';

class MarkdownProvider {
    // {<source text>: <markdown>, ...}
    private static cache: Dictionary<string> = {};
    private static cacheMeta: Dictionary<object | undefined> = {};

    static async init(data: DashData) {
        const texts = data.tabs.reduce((result: Dictionary<string>, {items}) => {
            items.forEach((item) => {
                if (item.type === DashTabItemType.Text && item.data.text) {
                    result[item.id] = item.data.text;
                }

                if (item.type === DashTabItemType.Widget) {
                    item.data.tabs.forEach(({id, description}) => {
                        if (description) {
                            result[id] = description;
                        }
                    });
                }
            });

            return result;
        }, {});

        if (Object.keys(texts).length) {
            try {
                const markdowns = await getSdk().mix.batchRenderMarkdown({
                    texts,
                    lang: DL.USER_LANG,
                });

                Object.entries(markdowns).forEach(([key, value]) => {
                    MarkdownProvider.cache[texts[key]] = value.result;
                    MarkdownProvider.cacheMeta[texts[key]] = value.meta;
                });
            } catch (error) {
                logger.logError('MarkdownProvider: batchRenderMarkdown failed', error);
                console.error('MARKDOWN_PROVIDER_INIT_FAILED', error);
            }
        }
    }

    // we accept {text} and give {result} for compatibility with plugins/Text in dashkit
    static async getMarkdown({text}: {text: string}) {
        const cached = MarkdownProvider.cache[text];

        if (cached) {
            return {
                result: cached,
                meta: MarkdownProvider.cacheMeta[text],
            };
        }

        try {
            const {result, meta} = await getSdk().mix.renderMarkdown({text, lang: DL.USER_LANG});
            MarkdownProvider.cache[text] = result;
            MarkdownProvider.cacheMeta[text] = meta;

            return {result, meta};
        } catch (error) {
            logger.logError('MarkdownProvider: renderMarkdown failed', error);
            console.error('MARKDOWN_PROVIDER_GET_MARKDOWN_FAILED', error);

            throw error;
        }
    }
}

export default MarkdownProvider;
