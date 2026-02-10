import type {AppConfig} from '@gravity-ui/nodekit';

import type {CacheClient} from '../../../cache-client';

import {RequestAxios} from './axios';

export class Request {
    static init({
        cacheClientInstance,
        config: appConfig,
    }: {
        cacheClientInstance: CacheClient;
        config: AppConfig;
    }) {
        RequestAxios.init({cacheClientInstance, config: appConfig});
    }

    static request({
        requestOptions,
        useCaching = false,
        requestControl,
    }: Parameters<typeof RequestAxios.request>[0]) {
        return RequestAxios.request({
            requestOptions,
            useCaching,
            requestControl,
        });
    }
}
