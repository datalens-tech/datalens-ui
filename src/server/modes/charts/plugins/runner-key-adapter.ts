import url from 'url';

import {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import {MiddlewareStage} from '../../../components/charts-engine/types';

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

                            // Otherwise, the request with a space will be encoded, and the request in US will encode the encoded space
                            // Datalens%20Charts/Errors/no-data -> Datalens%2520Charts%2FErrors%2Fno-data
                            const decodedPathname = decodeURIComponent(parsedKey.pathname!);

                            const pathname = decodedPathname.replace(
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
                                params.name = decodedPathname
                                    .replace(/^\/?editor\//, '')
                                    .replace(/^\/?wizard\//, '');
                            }

                            if (/^[0-9a-z]{13}$/.test(params.name)) {
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
