import type {RenderHtmlOutput} from '../../../modules/markdown/markdown';

export type RenderMarkdownResponse = RenderHtmlOutput;

export type RenderMarkdownArgs = {
    text: string;
    lang: string;
};

export type BatchRenderMarkdownResponse = Record<string, RenderHtmlOutput>;

export type BatchRenderMarkdownArgs = {
    texts: Record<string, string>;
    lang: string;
};

export type MarkdownContextAction = (args: {text: string; lang: string}) => RenderHtmlOutput;
