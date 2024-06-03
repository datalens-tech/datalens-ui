import querystring from 'querystring';

import type {AppConfig} from '@gravity-ui/nodekit';
import type {AxiosInstance, AxiosRequestConfig} from 'axios';
import axios from 'axios';

import {IPV6_AXIOS_OPTIONS} from '../constants/axios';

let axiosInstance: AxiosInstance | undefined;

export const getUtilsAxios = (appConfig: AppConfig): AxiosInstance => {
    if (!axiosInstance) {
        const config: AxiosRequestConfig = {
            paramsSerializer: (params: any) => querystring.stringify(params),
            ...(appConfig.useIPV6 ? IPV6_AXIOS_OPTIONS : {}),
        };
        axiosInstance = axios.create(config);
    }

    return axiosInstance;
};
