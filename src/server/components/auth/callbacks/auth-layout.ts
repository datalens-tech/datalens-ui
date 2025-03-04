import type {Request, Response} from '@gravity-ui/expresskit';

import type {AuthLayoutSettings} from '../../../../shared/components/auth/types/layout';
import {registry} from '../../../registry';

export const getAuthLayout = async (
    req: Request,
    res: Response,
    pageSettings: AuthLayoutSettings,
) => {
    const layoutConfig = await registry.useGetLayoutConfig({
        req,
        res,
        settingsId: 'auth-layout',
    });

    layoutConfig.data!.DL.authPageSettings = {
        ...pageSettings,
        isAuthPage: true,
    };

    return res.renderDatalensLayout(layoutConfig);
};
