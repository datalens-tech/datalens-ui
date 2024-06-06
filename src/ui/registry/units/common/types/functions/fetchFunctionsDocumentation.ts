import type {DocsApiResponse} from 'ui/registry/units/common/types/functions/getFunctionsDocumentation';

export type FetchFunctionsDocumentationResponse = {
    html: DocsApiResponse['html'];
};
