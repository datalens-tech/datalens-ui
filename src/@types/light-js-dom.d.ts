declare module '@litejs/dom' {
    export type HtmlElement = HTMLElement & {
        attributes?: {
            names: () => string[];
        };
    };

    interface Document {
        createElement: (tag: string) => HTMLElement;
    }

    export const document: Document;
}
