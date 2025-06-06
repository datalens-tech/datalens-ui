import type {SelectRenderPopup} from '@gravity-ui/uikit';

export type GetRenderDatasetSettingsPopup = (
    datasetId: string | null | undefined,
) => SelectRenderPopup | undefined;
