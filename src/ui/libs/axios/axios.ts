import axios from 'axios';
import axiosRetry from 'axios-retry';
import {showReadOnlyToast} from 'ui/utils/readOnly';

import {DL} from '../../constants/common';
import {refreshAuthToken} from '../auth/refreshToken';

import {initBeforeRequestInterceptor} from './interceptors';

const NULL_HEADER = '__null__';

const csrfMetaTag = document.querySelector<HTMLMetaElement>('meta[name=csrf-token]');

const client = axios.create({
    withCredentials: true,
    xsrfCookieName: '',
});

client.interceptors.request.use((config) => {
    // https://github.com/axios/axios/issues/382
    // otherwise, you cannot reset the default instance header
    // for example, for auth/update requests in dash, where axios-retry is needed
    if (config.headers['x-csrf-token'] === NULL_HEADER) {
        delete config.headers['x-csrf-token'];
    } else if (csrfMetaTag) {
        config.headers['x-csrf-token'] = csrfMetaTag.content;
    }
    return config;
});

client.interceptors.response.use(
    (data) => data,
    (error) => {
        if (error?.response?.status === 451) {
            showReadOnlyToast();
        }

        throw error;
    },
);

axiosRetry(client, {
    retries: 0,
    retryDelay: (retryCount) => retryCount * 3000,
    retryCondition: (error) =>
        axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error),
});

if (DL.AUTH_ENABLED) {
    initBeforeRequestInterceptor(client, refreshAuthToken);
}

export default client;

export {NULL_HEADER};
