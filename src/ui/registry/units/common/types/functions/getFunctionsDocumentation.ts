export type DocsTocItemLastLevel = {
    name: string;
    href: string;
    id: string;
};

export interface DataLensFunctionsDocGroupTocItem {
    id: string;
    name: string;
    items: DocsTocItemLastLevel[];
}

export type GetFunctionsDocumentationResponse = DataLensFunctionsDocGroupTocItem[];

type DocsTocItem = {
    name: string;
    items: (DocsTocItem | DocsTocItemLastLevel)[];
    id: string;
};

export interface DocsApiResponse {
    html: string;
    title: string;
    toc?: {
        title: string;
        href: string;
        items?: DocsTocItem[];
    };
    breadcrumbs: {
        name: string;
    }[];
    headings?: {
        title: string;
        href: string;
        level: number;
    }[];
    meta?: Record<string, unknown>;
}
