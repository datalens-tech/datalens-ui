import type {Request, Response} from '@gravity-ui/expresskit';

import type {RunnerHandlerResult} from '../../../../components/charts-engine/runners';

export type OnEmbedsControllerBeforeResponse = (args: {
    req: Request;
    res: Response;
    runnerName: string;
    runnerHandlerResult: RunnerHandlerResult;
}) => Promise<void>;

export const onEmbedsControllerBeforeResponse: OnEmbedsControllerBeforeResponse = async () => {};
