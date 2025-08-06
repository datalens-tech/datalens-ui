import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';

import type {GetRenderDatasetSettingsPopup} from './types/functions/getRenderDatasetSettingsPopup';
import type {RenderRLSDialog} from './types/functions/renderRLSDialog';

export const datasetsFunctionsMap = {
    renderRLSDialog: makeFunctionTemplate<RenderRLSDialog<any, any>>(),
    getRenderDatasetSettingsPopup: makeFunctionTemplate<GetRenderDatasetSettingsPopup>(),
} as const;
