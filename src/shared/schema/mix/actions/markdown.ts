import {createAction} from '../../gateway-utils';
import type {
    BatchRenderMarkdownArgs,
    BatchRenderMarkdownResponse,
    RenderMarkdownArgs,
    RenderMarkdownResponse,
} from '../types';

export const markdownActions = {
    renderMarkdown: createAction<RenderMarkdownResponse, RenderMarkdownArgs>(
        async (_, {text, lang}, {ctx}): Promise<RenderMarkdownResponse> => {
            return ctx.get('gateway').markdown({text, lang});
        },
    ),
    batchRenderMarkdown: createAction<BatchRenderMarkdownResponse, BatchRenderMarkdownArgs>(
        async (_, {texts, lang}, {ctx}): Promise<BatchRenderMarkdownResponse> => {
            const {markdown} = ctx.get('gateway');
            const results = {} as BatchRenderMarkdownResponse;
            for (const key of Object.keys(texts)) {
                const text = texts[key];
                results[key] = markdown({
                    text,
                    lang,
                });
            }
            return results;
        },
    ),
};
