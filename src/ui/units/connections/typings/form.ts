import type {ConnectionData} from 'shared';

import type {ValidationErrorType} from '../constants';

export type FormDict = ConnectionData;

export type ValidationError = {
    type: ValidationErrorType;
    name: string;
};
