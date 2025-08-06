import type {Request, Response} from '@gravity-ui/expresskit';

import {registry} from '../registry';

export const dlMainController = async (req: Request, res: Response) => {
    const layoutConfig = await registry.useGetLayoutConfig({req, res, settingsId: 'dl-main'});

    res.send(res.renderDatalensLayout(layoutConfig));
    return;
};
