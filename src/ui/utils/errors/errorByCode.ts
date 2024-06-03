import {ErrorCode} from 'shared';
import type {DataLensApiError} from 'typings';

import {parseError} from './parse';

interface EntryIsLockedError extends Error {
    code: ErrorCode.EntryIsLocked;
    details: {
        login: string;
        // TODO: after CHARTS-6891, use loginOrId instead of login
        loginOrId?: string;
        code?: string;
    };
    debug: {
        expiryDate: string;
    };
}

export function isEntryIsLockedError(error: DataLensApiError): error is EntryIsLockedError {
    return parseError(error).code === ErrorCode.EntryIsLocked;
}

export function getLoginOrIdFromLockedError(error: EntryIsLockedError) {
    return error.details.loginOrId || error.details.login;
}

export function isEntryAlreadyExists(error: DataLensApiError) {
    const {code} = parseError(error);
    if (code === ErrorCode.UsUniqViolation || code === ErrorCode.EntryAlreadyExists) {
        return true;
    }
    return false;
}
