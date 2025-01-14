import type {Request, Response} from '@gravity-ui/expresskit';

import {DataFetcher} from '../components/processor/data-fetcher';

export const configController = () => {
    return (req: Request, res: Response) => {
        res.status(200).send(DataFetcher.getChartKitSources({ctx: req.ctx, lang: res.locals.lang}));
    };
};
