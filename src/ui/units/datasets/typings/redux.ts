/* eslint-disable camelcase */

import type {WorkbookId} from 'shared';

import type {ActionTypeNotification} from '../helpers/dataset-error-helpers';
import type {ConnectionEntry} from '../store/types';

export interface Validation {
    isLoading: boolean;
    error: object;
}

export interface UpdateDatasetByValidationData {
    actionTypeNotification?: string;
    updatePreview?: boolean;
    validateEnabled?: boolean;
}

export interface UpdateDatasetByValidationProps {
    actionTypeNotification?: ActionTypeNotification;
    compareContent?: boolean;
    updatePreview?: boolean;
    validateEnabled?: boolean;
    workbookId?: WorkbookId;
    bindedWorkbookId?: WorkbookId;
}

export type ConnectionEntryWithDelegation = ConnectionEntry & {isDelegated?: boolean};
