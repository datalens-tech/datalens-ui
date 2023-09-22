import {ConnectionData} from 'shared';

import {ValidationErrorType} from '../constants';

export type FormDict = ConnectionData;

export type ValidationError = {
    type: ValidationErrorType;
    name: string;
};
