import url from 'url';

import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import {MiddlewareStage} from '../../../components/charts-engine/types';
import {registry} from '../../../registry';

export const plugin = {
    middlewares: [
        {
            stage: MiddlewareStage.AfterAuth,
            fn: (req: Request, _res: Response, next: NextFunction) => {
                if (req.url === '/api/run') {
                    const {body} = req;

                    if (body) {
                        const key = body.key || body.path;
                        if (key) {
                            /*
                        /editor/<name>?<params>
                        /wizard/<name>?<params>
                        /preview/editor/<name>?<params>
                        /preview/wizard/<name>?<params>
                        /ChartPreview/editor/<name>?<params>
                        /ChartPreview/wizard/<name>?<params>
                        /preview/ChartEditor?name=<name>&<params>
                        /preview/ChartWizard?name=<name>&<params>
                        /ChartPreview/ChartEditor?name=<name>&<params>
                        /ChartPreview/ChartWizard?name=<name>&<params>
                        */
                            const parsedKey = url.parse(key, true);

                            const keyWithoutQueryParams = key.split('?')[0];

                            const pathname = keyWithoutQueryParams.replace(
                                /\/?(?:ChartPreview|preview)/,
                                '',
                            );
                            const params = Object.assign({}, parsedKey.query, req.body.params);

                            if (
                                pathname.startsWith('/editor') ||
                                pathname.startsWith('editor') ||
                                pathname.startsWith('/wizard') ||
                                pathname.startsWith('wizard')
                            ) {
                                params.name = keyWithoutQueryParams
                                    .replace(/^\/?editor\//, '')
                                    .replace(/^\/?wizard\//, '');
                            }

                            const isEntryId = registry.common.functions.get('isEntryId');
                            if (isEntryId(params.name)) {
                                // If params.name looks like id - use it as id.
                                body.id = params.name;

                                body.unreleased = false; // request publised version by default
                            } else if (!body.key) {
                                body.key = params.name;
                            }

                            body.params = params;
                        }
                    }
                }

                next();
            },
        },
    ],
};
