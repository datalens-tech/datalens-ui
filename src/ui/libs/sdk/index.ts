/* eslint-disable camelcase */

import type {AxiosRequestConfig, CancelTokenSource} from 'axios';
import axios from 'axios';
import type {DashData, EntryAnnotationArgs, EntryUpdateMode} from 'shared';
import {ACCEPT_LANGUAGE_HEADER, TIMEZONE_OFFSET_HEADER, oldSchema} from 'shared';
import {DL} from 'ui/constants/common';

import type {CreateWidgetArgs} from '../../../shared/old-schema/charts';
import {registry} from '../../registry';
import type {Entry} from '../../typings';
import axiosInstance from '../axios/axios';

import type {
    ConfigSdk,
    DataMethodGateway,
    HeadersSdk,
    OptionsMethodGateway,
    SendRequest,
} from './types';

interface IMakeRequestCancelable {
    method?: string;
    requestConfig: AxiosRequestConfig;
}

class SDK {
    config: ConfigSdk;
    _cancelableRequests: {
        [cancelableRequest: string]: CancelTokenSource;
    } = {};

    constructor(config: ConfigSdk) {
        if (!config) {
            throw new Error('SDK needs a config');
        }

        this.config = config;

        this.initSchema(this, oldSchema);
    }

    createCancelSource() {
        return axios.CancelToken.source();
    }

    isCancel(error: Error): boolean {
        return axios.isCancel(error);
    }

    getHeaders() {
        const {config} = this;
        const headers = {} as HeadersSdk;

        const {setOldSdkDefaultHeaders} = registry.common.functions.getAll();

        setOldSdkDefaultHeaders(config, headers);

        headers[ACCEPT_LANGUAGE_HEADER] = DL.USER_LANG;

        return headers;
    }

    getGatewayRequestConfig(method: string, data: DataMethodGateway): AxiosRequestConfig {
        return {
            method: 'post',
            url: `${this.config.endpoints.gateway}/private/rpc/v1/${method}`,
            responseType: 'json',
            data,
            headers: this.getHeaders(),
        };
    }

    getChartsRequestConfig(data: DataMethodGateway, schemaMethod: Function) {
        return schemaMethod(this.getHeaders(), this.config.endpoints, data);
    }

    getRequestCallback =
        (method: string, schemaMethod?: Function, parentName?: string) =>
        (data: DataMethodGateway, options: OptionsMethodGateway) => {
            let requestConfig;
            if (parentName === 'charts' && schemaMethod) {
                requestConfig = this.getChartsRequestConfig(data, schemaMethod);
            } else {
                requestConfig = this.getGatewayRequestConfig(method, data);
            }

            return this.sendRequest({requestConfig, method, data, options});
        };

    initSchema(
        parent: {[key: string]: any},
        initialSchema: {[key: string]: any},
        parentName?: string,
    ) {
        Object.entries(initialSchema).forEach(([method, value]: [string, Function | object]) => {
            if (typeof value === 'function') {
                if (!parent[method]) {
                    parent[method] = this.getRequestCallback(method, value, parentName);
                }
            } else if (typeof value === 'object') {
                parent[method] = {};

                this.initSchema(parent[method], value, method);
            }
        });
    }

    // TODO: save not only method, but data and query
    makeRequestCancelable({method = 'custom', requestConfig}: IMakeRequestCancelable) {
        const currentCancelableRequest = this._cancelableRequests[method];

        if (currentCancelableRequest) {
            currentCancelableRequest.cancel(`${method} was cancelled`);
        }

        const cancellation = this.createCancelSource();
        this._cancelableRequests[method] = cancellation;

        requestConfig.cancelToken = cancellation.token;
    }

    passTimezoneOffsetHeader(requestConfig: AxiosRequestConfig) {
        if (!requestConfig.headers) {
            requestConfig.headers = {};
        }
        requestConfig.headers[TIMEZONE_OFFSET_HEADER] = new Date().getTimezoneOffset().toString();
    }

    sendRequest({requestConfig, method, options = {}}: SendRequest) {
        const {cancelable, passTimezoneOffset = true} = options;

        if (cancelable) {
            this.makeRequestCancelable({method, requestConfig});
        }

        if (passTimezoneOffset) {
            this.passTimezoneOffsetHeader(requestConfig);
        }

        return axiosInstance(requestConfig).then((response) => response.data);
    }

    sendFileInConnectionUploaderV2(
        {formData, useComEndpoint = false}: {formData: FormData; useComEndpoint?: boolean},
        options: OptionsMethodGateway,
    ): Promise<{file_id: string; operation_id: string}> {
        const {uploaderV2, uploaderComV2} = this.config.endpoints;
        const endpoint = useComEndpoint && uploaderComV2 ? uploaderComV2 : uploaderV2;

        const requestConfig: AxiosRequestConfig = {
            method: 'post',
            url: `${endpoint}/api/v2/files`,
            headers: {
                ...this.getHeaders(),
                'Content-Type': 'multipart/form-data',
                'x-request-id': `dl.${(DL.REQUEST_ID || '').slice(0, 6)}_conn`,
            },
            data: formData,
        };

        return this.sendRequest({requestConfig, options});
    }
}

interface SDK {
    charts: {
        getWidget(
            {
                entryId,
                unreleased,
                revId,
            }: {
                entryId: string;
                unreleased?: boolean;
                revId?: string;
            },
            options: OptionsMethodGateway,
        ): Promise<Entry>;
        createDash({
            data: {key, workbookId, name, mode, withParams, data, annotation},
        }: {
            data: {
                key?: string;
                workbookId?: string;
                name?: string;
                mode?: EntryUpdateMode;
                withParams?: boolean;
                data?: DashData;
                annotation?: EntryAnnotationArgs;
            };
        }): Promise<Entry>;
        createWidget(args: CreateWidgetArgs): Promise<Entry>;
        updateWidget({
            entryId,
            revId,
            data,
            template,
            mode,
            annotation,
        }: {
            entryId: string;
            revId?: string;
            data: Record<string, any>;
            template?: string;
            mode?: EntryUpdateMode;
            annotation?: EntryAnnotationArgs;
        }): Promise<Entry>;
    };
}

const sdk = new SDK(
    window.DL
        ? {
              endpoints: DL.ENDPOINTS,
              useGlobalProjectId: true,
              currentTenantId: DL.CURRENT_TENANT_ID,
          }
        : {
              endpoints: {},
          },
);

export {sdk};
export default SDK;
