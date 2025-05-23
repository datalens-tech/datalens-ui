import {I18n} from 'i18n';
import type {EntryNotification} from 'shared/types/meta-manager';

import type {PreparedNotificationType} from './types';

const i18n = I18n.keyset('component.workbook-export.notifications');

const NOTIFICATIONS_BY_CODE: Record<string, string> = {
    'NOTIF.WB_EXPORT.DS.RLS': i18n('label_export-rls'),
    'NOTIF.WB_IMPORT.DS.RLS': i18n('label_import-rls'),
    'NOTIF.WB_EXPORT.CONN.CHECK_CREDENTIALS': i18n('label_export-check-connection-credentials'),
    'NOTIF.WB_IMPORT.CONN.CHECK_CREDENTIALS': i18n('label_import-check-connections-credentials'),
    'NOTIF.WB_IMPORT.CONN.CHECK_DELEGATION': i18n('label_import-check-delegation'),
    'ERR.UI_API.TRANSFER_INVALID_VERSION': i18n('label_invalid-version'),
    'ERR.UI_API.TRANSFER_MISSING_LINKED_ENTRY': i18n('label_missing-linked-entry'),
    'ERR.UI_API.TRANSFER_INVALID_ENTRY_DATA': i18n('label_invalid-entry-data'),
    'ERR.UI_API.TRANSFER_INVALID_ENTRY_SCOPE': i18n('label_invalid-entry-scope'),
    UNEXPECTED_WORKFLOW_ERROR: i18n('label_unexpected-workflow-error'),
    SCOPE_NOT_AVAILABLE_FOR_INSTALLATION: i18n('label_scope-not-available-for-installation'),
    'ERR.DS_API.BAD_CONN_TYPE': i18n('label_bad-connection-type'),
    'ERR.DS_API.UNSUPPORTED': i18n('label_unsupported-objects'),
    'ERR.DS_API.WB_EXPORT.DS': i18n('label_error-export-dataset'),
    'ERR.DS_API.WB_EXPORT.CONN': i18n('label_error-export-connection'),
    'ERR.DS_API.WB_IMPORT.DS': i18n('label_error-import-dataset'),
    'ERR.DS_API.WB_IMPORT.CONN': i18n('label_error-import-connection'),
};

export const transformNotifications = (
    notifications: EntryNotification[] = [],
): {notifications: PreparedNotificationType[]; details: string} => {
    const notificationMap = new Map<string, PreparedNotificationType>();
    const details: string[] = [];

    let hasCritical = false;

    notifications.forEach((notification) => {
        const key = notification.code;

        details.push(JSON.stringify(notification.details));

        if (!notificationMap.has(key)) {
            notificationMap.set(key, {
                code: notification.code,
                message: notification.message,
                level: notification.level,
                entries: [],
            });
        }

        if (notification.level === 'critical') {
            hasCritical = true;
        }

        if (notification.scope && notification.entryId) {
            notificationMap.get(key)?.entries.push({
                entryId: notification.entryId,
                scope: notification.scope || 'connection',
            });
        }
    });

    const preparedNotifications: PreparedNotificationType[] = Array.from(notificationMap.values());
    const preparedDetails = details.join('\n');

    if (hasCritical) {
        return {
            notifications: preparedNotifications.filter(
                (notification) => notification.level === 'critical',
            ),
            details: preparedDetails,
        };
    }

    return {notifications: preparedNotifications, details: preparedDetails};
};

export const getNotificationTitle = (code?: string, message?: string) => {
    if (!code) {
        return message;
    }
    return NOTIFICATIONS_BY_CODE[code] || message || i18n('label_invalid-error');
};
