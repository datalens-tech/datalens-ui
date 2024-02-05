import {SchemasByScope} from '@gravity-ui/gateway';
import sdkFactory, {ApiByScope, SdkActionOptions, SdkConfig} from '@gravity-ui/sdk';
import {Lang} from '@gravity-ui/sdk/build/constants';
import uuid from 'uuid/v4';

import {
    ACCEPT_LANGUAGE_HEADER,
    ENABLE,
    REQUEST_ID_HEADER,
    SUPERUSER_SWITCH_MODE_COOKIE_NAME,
    SuperuserHeader,
    TENANT_ID_HEADER,
    TIMEZONE_OFFSET_HEADER,
    WithRequired,
} from '../../../shared';
import type {schema} from '../../../shared';
import {DL} from '../../constants';
import {registry} from '../../registry';
import Utils from '../../utils';

import {
    OperationError,
    SdkError,
    handleRequestError,
    isOperationError,
    isSdkError,
} from './parse-error';

export {isSdkError, isOperationError, handleRequestError};
export type {SdkError, OperationError};

export type DatalensSdk<TSchema extends SchemasByScope> = (<T>(
    requestConfig: WithRequired<SdkConfig, 'axiosConfig'>['axiosConfig'],
    initialOptions?: SdkActionOptions | undefined,
) => Promise<T>) & {
    cancelRequest(id: string): void;
    setLang(lang: Lang): void;
    setDefaultHeader: (__0: {name: string; value: string; methods?: string[] | undefined}) => void;
    setCSRFToken(csrfToken: string): void;
    getConcurrentId(): string;
    isCancel(value: any): boolean;
} & ApiByScope<TSchema>['root'] &
    ApiByScope<TSchema>;

const sdkConfig: SdkConfig = {
    csrfToken: Utils.getCSRFToken() || '',
    endpoint: '/gateway',
    handleRequestError,
    prepareRequestOptions(_scope, _service, _action, options) {
        return {
            ...options,
            headers: {
                [REQUEST_ID_HEADER]: `dl.${DL.REQUEST_ID.slice(-5)}.${uuid().slice(0, 8)}`,
                ...options?.headers,
            },
        };
    },
};

export const initSdk = () => {
    const sdk: DatalensSdk<{root: typeof schema}> = sdkFactory<{root: typeof schema}>(sdkConfig);

    sdk.setDefaultHeader({
        name: TIMEZONE_OFFSET_HEADER,
        value: new Date().getTimezoneOffset().toString(),
    });

    sdk.setDefaultHeader({
        name: ACCEPT_LANGUAGE_HEADER,
        value: DL.USER_LANG,
    });

    if (DL.CURRENT_TENANT_ID) {
        sdk.setDefaultHeader({
            name: TENANT_ID_HEADER,
            value: DL.CURRENT_TENANT_ID,
        });
    }

    if (DL.DISPLAY_SUPERUSER_SWITCH) {
        const superuserModeEnabled = Utils.getCookie(SUPERUSER_SWITCH_MODE_COOKIE_NAME) === ENABLE;
        sdk.setDefaultHeader({
            name: SuperuserHeader.XDlAllowSuperuser,
            value: String(superuserModeEnabled),
        });
        sdk.setDefaultHeader({
            name: SuperuserHeader.XDlSudo,
            value: String(superuserModeEnabled),
        });
    }

    return sdk;
};

export const getSdk = () => {
    return registry.libs.schematicSdk.get() as DatalensSdk<{
        root: typeof schema;
    }>;
};
