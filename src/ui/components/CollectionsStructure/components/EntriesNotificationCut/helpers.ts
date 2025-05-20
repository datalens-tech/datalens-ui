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
};

export const transformNotifications = (
    notifications: EntryNotification[] = [],
): {notifications: PreparedNotificationType[]; details: string} => {
    const notificationMap = new Map<string, PreparedNotificationType>();
    const details: string[] = [];

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

        if (notification.scope && notification.entryId) {
            notificationMap.get(key)?.entries.push({
                entryId: notification.entryId,
                scope: notification.scope || 'connection',
            });
        }
    });

    return {notifications: Array.from(notificationMap.values()), details: details.join('\n')};
};

export const getNotificationTitleByCode = (code: string) => {
    return NOTIFICATIONS_BY_CODE[code] || i18n('label_invalid-error');
};
