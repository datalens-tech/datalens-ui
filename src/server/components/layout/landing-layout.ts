import type {Request, Response} from '@gravity-ui/expresskit';

import type {LandingPageSettings} from '../../../shared';
import {registry} from '../../registry';

export const getLandingLayout = async (
    req: Request,
    res: Response,
    pageSettings: LandingPageSettings,
) => {
    req.originalContext.set('landingPageSettings', pageSettings);
    req.ctx.set('landingPageSettings', pageSettings);

    const layoutConfig = await registry.useGetLayoutConfig({
        req,
        res,
        settingsId: 'landing-layout',
    });

    return res.renderDatalensLayout(layoutConfig);
};
