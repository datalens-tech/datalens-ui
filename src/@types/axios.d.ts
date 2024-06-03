import type {IAxiosRetryConfig} from 'axios-retry';

declare module 'axios' {
    export interface AxiosRequestConfig {
        'axios-retry'?: IAxiosRetryConfig;
    }
    export interface AxiosInterceptorManager {
        handlers: Array<() => void>;
    }
    export interface AxiosInstance {
        retryRequestInterceptor?: number;
        retryResponseInterceptor?: number;
    }
}
