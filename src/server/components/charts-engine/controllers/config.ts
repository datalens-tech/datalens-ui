import type {Request, Response} from '@gravity-ui/expresskit';

import type {ChartsEngine} from '..';
import {DataFetcher} from '../components/processor/data-fetcher';

export const configController = (chartsEngine: ChartsEngine) => {
    return (_req: Request, res: Response) => {
        res.status(200).send(
            DataFetcher.getChartKitSources({
                sourcesConfig: chartsEngine.sources,
                lang: res.locals.lang,
            }),
        );
    };
};
