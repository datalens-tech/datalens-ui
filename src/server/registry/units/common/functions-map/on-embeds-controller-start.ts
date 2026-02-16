import type {Request, Response} from '@gravity-ui/expresskit';

export type OnEmbedsControllerStart = (args: {req: Request; res: Response}) => Promise<void>;

export const onEmbedsControllerStart: OnEmbedsControllerStart = async () => {};
