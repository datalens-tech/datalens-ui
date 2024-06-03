import type {AxiosRequestConfig} from 'axios';

export type HeadersSdk = Record<string, string>;

export interface DataMethodGateway {
    [key: string]: any;
}

export interface OptionsMethodGateway {
    cancelable?: boolean;
    passTimezoneOffset?: boolean;
}

export interface SendRequest {
    requestConfig: AxiosRequestConfig;
    options: OptionsMethodGateway;
    data?: DataMethodGateway;
    method?: string;
}

export interface ConfigSdk {
    endpoints: {
        [endpoint: string]: string;
    };
    useGlobalProjectId?: boolean;
    currentTenantId?: string;
}
