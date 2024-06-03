import type {Request, Response} from '@gravity-ui/expresskit';

import {registry} from '../registry';

export default async (req: Request, res: Response) => {
    const layoutConfig = await registry.useGetLayoutConfig({req, res, settingsId: 'dl-main'});

    res.send(res.renderDatalensLayout(layoutConfig));
    return;
};
