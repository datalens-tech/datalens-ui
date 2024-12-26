import type {GatewayError} from '@gravity-ui/gateway';
import type {SdkConfig} from '@gravity-ui/sdk';
import {DIALOG_NEED_RESET} from 'components/OpenDialogNeedReset/OpenDialogNeedReset';
import _ from 'lodash';
import type {Action, Dispatch} from 'redux';
import {ErrorCode, REQUEST_ID_HEADER, TRACE_ID_HEADER} from 'shared';
import {openDialog} from 'store/actions/dialog';
import {showReadOnlyToast} from 'ui/utils/readOnly';

import {DL} from '../../constants';

export interface SdkError extends GatewayError {
    requestId: string;
    traceId: string;
    _sdk: true;
    code: string;
}

export function isSdkError(error: any): error is SdkError {
    return _.isPlainObject(error) && Boolean(error._sdk);
}

const DEFAULT_SDK_CODE = 'SDK_REQUEST_ERROR';
const DEFAULT_SDK_MESSAGE = 'SDK request error';

let dispatch: Dispatch<Action<any>>;

let needResetDialogShown = false;

export function registerSDKDispatch(_dispatch: Dispatch<Action<any>>) {
    dispatch = _dispatch;
}

export const handleRequestError: SdkConfig['handleRequestError'] = (errorResponse) => {
    let parsedError = {} as SdkError;
    const errorData = _.get(errorResponse, 'data');
    const requestId = _.get(errorResponse, ['headers', REQUEST_ID_HEADER], DL.REQUEST_ID || '');
    const traceId = _.get(errorResponse, ['headers', TRACE_ID_HEADER], '');

    if (errorData) {
        // Properly handle nginx errors
        if (typeof errorData === 'string') {
            parsedError = {
                status: _.get(errorResponse, 'status'),
                code: DEFAULT_SDK_CODE,
                message: DEFAULT_SDK_MESSAGE,
                details: {
                    title: DEFAULT_SDK_CODE,
                    description: errorData,
                },
                requestId,
                traceId,
                _sdk: true,
            };
        } else {
            parsedError = {
                status: _.get(errorData, 'status', 500),
                code: _.get(errorData, 'code', DEFAULT_SDK_CODE),
                message: _.get(errorData, 'message', DEFAULT_SDK_MESSAGE),
                details: _.get(errorData, 'details'),
                debug: _.get(errorData, 'debug'),
                requestId,
                traceId,
                _sdk: true,
            };
        }
    } else if (_.get(errorResponse, 'code') === 'ECONNABORTED') {
        parsedError = {
            status: 500,
            code: 'ECONNABORTED',
            message: _.get(errorResponse, 'message', DEFAULT_SDK_MESSAGE),
            requestId: _.get(errorResponse, ['config', 'headers', REQUEST_ID_HEADER], requestId),
            traceId,
            _sdk: true,
        };
    } else {
        parsedError = {
            status: 500,
            code: DEFAULT_SDK_CODE,
            message: DEFAULT_SDK_MESSAGE,
            details: errorResponse as any,
            requestId,
            traceId,
            _sdk: true,
        };
    }

    if (
        ([ErrorCode.AuthNeedReset, ErrorCode.NeedReset] as string[]).includes(parsedError.code) &&
        dispatch &&
        !needResetDialogShown
    ) {
        needResetDialogShown = true;

        dispatch(
            openDialog({
                id: DIALOG_NEED_RESET,
            }),
        );
    }

    if (parsedError.code === ErrorCode.ReadOnlyMode) {
        showReadOnlyToast();
    }

    throw parsedError;
};

export interface OperationError extends GatewayError {
    _operationError: true;
    code: string;
}

export function isOperationError(error: any): error is OperationError {
    return _.isPlainObject(error) && Boolean(error._operationError);
}
