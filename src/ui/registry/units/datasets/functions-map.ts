import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';

import type {RenderRLSDialog} from './types/functions/renderRLSDialog';

export const datasetsFunctionsMap = {
    renderRLSDialog: makeFunctionTemplate<RenderRLSDialog<any, any>>(),
} as const;
