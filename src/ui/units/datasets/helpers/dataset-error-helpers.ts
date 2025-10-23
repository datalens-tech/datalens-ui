import {I18n} from 'i18n';
import type {DatasetError} from 'units/datasets/store/types';

const i18n = I18n.keyset('dataset.notifications.view');

// Empty lines are added to preserve the consistency of the object structure
function getMessageText() {
    return {
        CREATE_DATASET_MSGS: {
            NOTIFICATION_SUCCESS: i18n('toast_create-dataset-msgs-success'),
            NOTIFICATION_FAILURE: i18n('toast_create-dataset-msgs-failure'),
        },
        FIELD_DUPLICATED_MSGS: {
            NOTIFICATION_SUCCESS: i18n('toast_field-duplicated-msgs-success'),
            NOTIFICATION_FAILURE: '',
        },
        FIELD_REMOVE_MSGS: {
            NOTIFICATION_SUCCESS: i18n('toast_field-remove-msgs-success'),
            NOTIFICATION_FAILURE: '',
        },
        DATASET_SAVE_MSGS: {
            NOTIFICATION_SUCCESS: i18n('toast_dataset-save-msgs-success'),
            NOTIFICATION_FAILURE: i18n('toast_dataset-save-msgs-failure'),
        },
        DATASET_FETCH_PREVIEW_MSGS: {
            NOTIFICATION_SUCCESS: '',
            NOTIFICATION_FAILURE: i18n('toast_dataset-fetch-preview-msgs-failure'),
        },
        DATASET_VALIDATION_MSGS: {
            NOTIFICATION_SUCCESS: '',
            NOTIFICATION_FAILURE: i18n('toast_dataset-validation-msgs-failure'),
        },
        FETCH_TYPES_MSGS: {
            NOTIFICATION_SUCCESS: '',
            NOTIFICATION_FAILURE: i18n('toast_fetch-types-msgs-failure'),
        },
    };
}

export type ActionTypeNotification =
    | 'create'
    | 'duplicate'
    | 'remove'
    | 'save'
    | 'preview'
    | 'validate'
    | 'types';

export function getToastTitle(
    type: 'NOTIFICATION_SUCCESS' | 'NOTIFICATION_FAILURE',
    actionTypeNotification: ActionTypeNotification,
) {
    switch (actionTypeNotification) {
        case 'create': {
            return getMessageText().CREATE_DATASET_MSGS[type];
        }

        case 'duplicate': {
            return getMessageText().FIELD_DUPLICATED_MSGS[type];
        }

        case 'remove': {
            return getMessageText().FIELD_REMOVE_MSGS[type];
        }

        case 'save': {
            return getMessageText().DATASET_SAVE_MSGS[type];
        }

        case 'preview': {
            return getMessageText().DATASET_FETCH_PREVIEW_MSGS[type];
        }

        case 'validate': {
            return getMessageText().DATASET_VALIDATION_MSGS[type];
        }

        case 'types': {
            return getMessageText().FETCH_TYPES_MSGS[type];
        }
        default: {
            return '';
        }
    }
}

export function parseError(error: DatasetError) {
    const {
        // @ts-ignore
        response: {
            // @ts-ignore
            data: {message: responseMessage, data: {description} = {}, data = {}} = {},
            // @ts-ignore
            headers: {'x-request-id': requestId} = {},
        } = {},
        // @ts-ignore
        message,
    } = error;

    let errorDialogMessage = responseMessage || message;

    if (description) {
        errorDialogMessage += `\n${description}`;
    }

    return {
        requestId,
        message: errorDialogMessage,
        data,
    };
}
