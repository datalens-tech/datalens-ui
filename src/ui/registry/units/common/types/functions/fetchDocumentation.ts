import type {DocsApiResponse} from 'ui/registry/units/common/types/functions/getFunctionsDocumentation';

export type FetchDocumentationArgs = {
    lang: string;
    path: string;
    region?: string;
};

export type FetchDocumentationResponse = {
    html: DocsApiResponse['html'];
};
