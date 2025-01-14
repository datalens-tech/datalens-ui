import type {Request, Response} from '@gravity-ui/expresskit';

import type {ChartsEngine} from '..';
import {DataFetcher} from '../components/processor/data-fetcher';

export const configController = (_chartsEngine: ChartsEngine) => {
    return (req: Request, res: Response) => {
        res.status(200).send(DataFetcher.getChartKitSources({ctx: req.ctx, lang: res.locals.lang}));
    };
};
