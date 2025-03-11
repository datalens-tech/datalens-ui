import {I18n} from 'i18n';

import type {ImportExportStatus} from '../types';

const i18n = I18n.keyset('component.workbook-import-dialog.view');

export const getApplyButtonText = (status: ImportExportStatus) => {
    switch (status) {
        case 'loading':
            return i18n('button_create');
        case 'success':
            return i18n('button_go-to-workbook');
        case 'error':
        default:
            return undefined;
    }
};

export const getCaption = (status: ImportExportStatus) => {
    switch (status) {
        case 'loading':
            return i18n('title_creating-workbook');
        case 'error':
            return i18n('title_error-creating');
        case 'success':
            return i18n('title_workbook-created');
        default:
            return i18n('title_creating-workbook');
    }
};

export const getCancelButtonText = (status: ImportExportStatus, defaultText: string) => {
    return status === 'loading' ? defaultText : i18n('button_close');
};
