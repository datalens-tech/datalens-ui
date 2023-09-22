/* eslint-disable camelcase */

export interface Validation {
    isLoading: boolean;
    error: object;
}

export interface UpdateDatasetByValidationData {
    actionTypeNotification?: string;
    updatePreview?: boolean;
    validateEnabled?: boolean;
}
