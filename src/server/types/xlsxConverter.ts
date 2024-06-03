import type {Request, Response} from '@gravity-ui/expresskit';

import type {Graph} from '../components/charts-engine/components/processor/comments-fetcher';

export type XlsxConverterFn = (
    req: Request,
    res: Response,
    chartData: {
        categories_ms?: number[];
        categories?: string[] | number[];
        graphs: Graph[];
    },
    dataArray: number[],
    downloadConfig: {
        filename: string;
    },
) => void;
