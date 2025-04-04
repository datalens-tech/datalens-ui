import type {CancellablePromise} from '@gravity-ui/sdk';

import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';

import {EXAMPLE_FUNCTION} from './constants/functions';
import type {FetchEditorDocumentationResponse} from './types/functions/fetchEditorDocumentation';

export const editorFunctionsMap = {
    [EXAMPLE_FUNCTION]: makeFunctionTemplate<(arg: number) => string>(),
    fetchEditorDocumentation:
        makeFunctionTemplate<
            (activeTab: string) => CancellablePromise<FetchEditorDocumentationResponse>
        >(),
} as const;
