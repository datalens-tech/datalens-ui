import {I18n} from 'i18n';

import type {ImportExportStatus} from '../types';

const i18n = I18n.keyset('component.workbook-import-view.view');

export const getApplyButtonText = (status: ImportExportStatus, defaultText: string) => {
    switch (status) {
        case 'loading':
        case 'pending':
            return defaultText;
        case 'success':
            return i18n('button_go-to-workbook');
        case 'fatal-error':
        case 'notification-error':
        default:
            return undefined;
    }
};

export const getCaption = (status: ImportExportStatus) => {
    switch (status) {
        case 'loading':
        case 'pending':
            return i18n('title_creating-workbook');
        case 'fatal-error':
        case 'notification-error':
            return i18n('title_error-creating');
        case 'success':
            return i18n('title_workbook-created');
        default:
            return i18n('title_creating-workbook');
    }
};

export const getCancelButtonText = (status: ImportExportStatus, defaultText: string) => {
    return status === 'loading' || status === 'pending' ? defaultText : i18n('button_close');
};
