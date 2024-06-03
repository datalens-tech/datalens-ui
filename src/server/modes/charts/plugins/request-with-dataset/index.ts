import type {Request, Response} from '@gravity-ui/expresskit';
import type {ApiWithRoot} from '@gravity-ui/gateway';

import type {DatalensGatewaySchemas} from '../../../../types/gateway';
import {
    CHARTS_MIDDLEWARE_URL_TYPE,
    CONTROL_MIDDLEWARE_URL_TYPE,
} from '../constants/middleware-urls';
import type {MiddlewareSourceAdapterArgs} from '../types';

import chartsWithDataset from './middlewareAdapters/charts-with-dataset';
import controlsWithDataset from './middlewareAdapters/controls-with-dataset';

export type ConfigurableRequestWithDatasetPluginOptions = {
    cache?: number;
    getDataSetFieldsById?: ApiWithRoot<
        DatalensGatewaySchemas,
        Request['ctx'],
        Request,
        Response
    >['bi']['getDataSetFieldsById'];
};

const getPlugin = (options?: ConfigurableRequestWithDatasetPluginOptions) => {
    return {
        request_with_dataset: {
            description: {
                title: {
                    ru: 'DataLens запрос с Датасетом',
                    en: 'DataLens request with Dataset',
                },
            },
            middlewareAdapter: async (args: MiddlewareSourceAdapterArgs) => {
                const middlewarePluginUrl = args.source.middlewareUrl.middlewareType;
                switch (middlewarePluginUrl) {
                    case CHARTS_MIDDLEWARE_URL_TYPE:
                        return chartsWithDataset({...args, pluginOptions: options});
                    case CONTROL_MIDDLEWARE_URL_TYPE:
                        return controlsWithDataset({...args, pluginOptions: options});
                    default:
                        return args.source;
                }
            },
        },
    };
};

export const configurableRequestWithDatasetPlugin = (
    options?: ConfigurableRequestWithDatasetPluginOptions,
) => {
    return {sources: getPlugin(options)};
};
