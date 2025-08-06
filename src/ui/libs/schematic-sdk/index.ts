import type {SchemasByScope} from '@gravity-ui/gateway';
import type {ApiByScope, SdkActionOptions, SdkConfig} from '@gravity-ui/sdk';
import sdkFactory from '@gravity-ui/sdk';
import type {Lang} from '@gravity-ui/sdk/build/constants';
import type {AxiosError} from 'axios';
import {v4 as uuidv4} from 'uuid';

import {
    ACCEPT_LANGUAGE_HEADER,
    ENABLE,
    REQUEST_ID_HEADER,
    SUPERUSER_SWITCH_MODE_COOKIE_NAME,
    SuperuserHeader,
    TENANT_ID_HEADER,
    TIMEZONE_OFFSET_HEADER,
    RPC_AUTHORIZATION
} from '../../../shared';
import type {WithRequired, anonymousSchema, authSchema, schema} from '../../../shared';
import {DL} from '../../constants';
import {registry} from '../../registry';
import Utils from '../../utils';
import {refreshAuthToken} from '../auth/refreshToken';

import {emitCancelRequest, initBeforeRequestDecorator} from './decorator';
import type {OperationError, SdkError} from './parse-error';
import {handleRequestError, isOperationError, isSdkError} from './parse-error';

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
    axiosConfig: {
        'axios-retry': {
            retries: 3,
            retryDelay: () => 1000,
            retryCondition: (error: AxiosError<unknown, unknown>) => {
                return error?.response?.status === 498;
            },
        },
    },
    endpoint: '/gateway',
    handleRequestError,
    prepareRequestOptions(_scope, _service, _action, options) {
        return {
            ...options,
            headers: {
                [REQUEST_ID_HEADER]: `dl.${DL.REQUEST_ID.slice(-5)}.${uuidv4().slice(0, 8)}`,
                ...options?.headers,
            },
        };
    },
    decorator: DL.AUTH_ENABLED
        ? initBeforeRequestDecorator(({scope}) => {
              return scope === 'auth' ? Promise.resolve() : refreshAuthToken();
          })
        : undefined,
};

export type TypedSchema = {
    root: typeof schema;
    auth: typeof authSchema;
    anonymous: typeof anonymousSchema;
};

export const initSdk = () => {
    const sdk: DatalensSdk<TypedSchema> = sdkFactory<TypedSchema>(sdkConfig);

    sdk.setDefaultHeader({
        name: RPC_AUTHORIZATION,
        value: Utils.getRpcAuthorization(),
    });

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
    const sdk = registry.libs.schematicSdk.get() as DatalensSdk<TypedSchema>;
    return {
        sdk,
        // Use this method instead of sdk.cancelRequest
        cancelRequest(concurrentId: string) {
            emitCancelRequest(concurrentId);
            sdk.cancelRequest(concurrentId);
        },
    };
};
