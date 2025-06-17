import type {SelectRenderPopup} from '@gravity-ui/uikit';

export type GetRenderConnectionSettingsPopup = (
    connectionId: string | null | undefined,
) => SelectRenderPopup | undefined;
