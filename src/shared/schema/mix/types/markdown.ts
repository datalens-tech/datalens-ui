export type RenderMarkdownResponse = {
    result: string;
};

export type RenderMarkdownArgs = {
    text: string;
    lang: string;
};

export type BatchRenderMarkdownResponse = Record<string, {result: string}>;

export type BatchRenderMarkdownArgs = {
    texts: Record<string, string>;
    lang: string;
};

export type MarkdownContextAction = (args: {text: string; lang: string}) => {result: string};
