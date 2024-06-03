import type {Request, Response} from '@gravity-ui/expresskit';

import {renderHTML} from '../components/markdown';

export const markdownController = {
    render: (req: Request, res: Response) => {
        try {
            const {body} = req;

            const result = renderHTML({
                text: body.text,
                lang: res.locals.lang,
            });

            res.status(200).send(result);
        } catch (error) {
            const {ctx} = req;
            ctx.logError('Error rendering markdown', error);
            res.status(500).send(error);
        }
    },

    batchRender: (req: Request, res: Response) => {
        try {
            const input = req.body.texts;
            const results: Record<string, {result: string}> = {};

            for (const key of Object.keys(input)) {
                const text = input[key];
                results[key] = renderHTML({
                    text,
                    lang: res.locals.lang,
                });
            }

            res.status(200).send(results);
        } catch (error) {
            const {ctx} = req;
            ctx.logError('Error rendering markdown', error);
            res.status(500).send(error);
        }
    },
};
