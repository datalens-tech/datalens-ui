import type {AppConfig} from '@gravity-ui/nodekit';
import type {AxiosInstance} from 'axios';
import axios from 'axios';
import axiosRetry from 'axios-retry';

import {DEFAULT_TIMEOUT} from '../..';
import {IPV6_AXIOS_OPTIONS} from '../../server/axios';

let axiosInstance: AxiosInstance | undefined;
export const getAxios = (config: AppConfig): AxiosInstance => {
    if (!axiosInstance) {
        axiosInstance = axios.create({
            ...(config.useIPV6 ? IPV6_AXIOS_OPTIONS : {}),
            timeout: DEFAULT_TIMEOUT,
        });

        axiosRetry(axiosInstance, {
            retries: 0,
            retryDelay: (retryCount) => retryCount * 3000,
            retryCondition: (error) => {
                if (!error.config) {
                    return false;
                }

                return axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error);
            },
        });
    }

    return axiosInstance;
};
