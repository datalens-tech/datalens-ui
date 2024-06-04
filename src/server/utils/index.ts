import fs from 'fs';
import type {IncomingHttpHeaders} from 'http';

import type {AppContext} from '@gravity-ui/nodekit';
import type {AxiosResponse} from 'axios';
import axios from 'axios';
import type {Request} from 'express';
import pick from 'lodash/pick';

import {
    AuthHeader,
    DL_CONTEXT_HEADER,
    FORWARDED_FOR_HEADER,
    PROJECT_ID_HEADER,
    REQUEST_ID_HEADER,
    RPC_AUTHORIZATION,
    SuperuserHeader,
    TENANT_ID_HEADER,
} from '../../shared';
import {isOpensourceInstallation} from '../app-env';

import {isGatewayError} from './gateway';

class Utils {
    static getName(key = '') {
        return key.split('/').filter(Boolean).pop();
    }

    static pickAuthHeaders(headers: IncomingHttpHeaders, req: Request) {
        const {folderId: folderIdHeader, subjectToken: subjectTokenHeader} =
            req.ctx.config.headersMap;

        let headersList = [
            AuthHeader.Cookie,
            AuthHeader.Authorization,
            folderIdHeader,
            TENANT_ID_HEADER,
            PROJECT_ID_HEADER,
            RPC_AUTHORIZATION,
            subjectTokenHeader,
        ];

        if (isOpensourceInstallation) {
            headersList = [];
        }

        return pick(headers, headersList);
    }

    static pickSuperuserHeaders(headers: IncomingHttpHeaders) {
        return pick(headers, [SuperuserHeader.XDlSudo, SuperuserHeader.XDlAllowSuperuser]);
    }

    static pickDlContextHeaders(headers: IncomingHttpHeaders) {
        return pick(headers, DL_CONTEXT_HEADER);
    }

    static pickForwardHeaders(headers: IncomingHttpHeaders) {
        return pick(headers, FORWARDED_FOR_HEADER);
    }

    static pickRpcAuthorizationHeaders(headers: IncomingHttpHeaders) {
        return pick(headers, RPC_AUTHORIZATION);
    }

    static pickHeaders(req: Request) {
        return {
            ...Utils.pickAuthHeaders(req.headers, req),
            ...Utils.pickSuperuserHeaders(req.headers),
            ...Utils.pickDlContextHeaders(req.headers),
            ...Utils.pickForwardHeaders(req.headers),
            ...Utils.pickRpcAuthorizationHeaders(req.headers),
            [REQUEST_ID_HEADER]: req.id
        };
    }

    static getErrorMessage(error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data.message || error.message;
        } else if (error instanceof Error) {
            return error.message;
        } else if (isGatewayError(error)) {
            return error.error.message;
        } else {
            return 'Unknown error';
        }
    }

    static getErrorDetails(error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data.details;
        }
        return undefined;
    }

    static getErrorCode(error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data.code;
        }
        return undefined;
    }

    static getErrorStatus(error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.status;
        }
        return undefined;
    }

    static getFormattedLogin(login: string | undefined) {
        let formattedLogin = login;
        if (typeof formattedLogin === 'string' && !formattedLogin.includes('@')) {
            formattedLogin = formattedLogin.replace(/\./g, '-');
        }
        return formattedLogin;
    }

    static isDevelopment(ctx: AppContext) {
        return ctx.config.appEnv === 'development';
    }

    static getResponseData(response: AxiosResponse) {
        return response.data;
    }

    static getEnvVariable(envVariableName: string) {
        const valueFromEnv = process.env[envVariableName];
        if (valueFromEnv) {
            return valueFromEnv;
        }
        const FILE_PATH_POSTFIX = '_FILE_PATH';
        const filePath = process.env[`${envVariableName}${FILE_PATH_POSTFIX}`];
        if (filePath) {
            return fs.readFileSync(filePath, 'utf8') as string;
        }
        return undefined;
    }
}

export default Utils;
