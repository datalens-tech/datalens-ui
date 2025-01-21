import type {RenderParams} from '@gravity-ui/app-layout';
import type {Request, Response} from '@gravity-ui/expresskit';

import type {DLGlobalData} from '../../shared';

export type AppLayoutSettingsName = 'dl-main' | 'navigation' | 'landing-layout' | 'auth-layout';

export type AppLayoutSettings = {
    renderConfig: RenderParams<{DL: DLGlobalData}>;
    DL: Partial<DLGlobalData>;
    bundleName: string;
};

export type GetLayoutConfig = (args: {
    req: Request;
    res: Response;
    settingsId: string;
}) => Promise<RenderParams<{DL: DLGlobalData}>>;
