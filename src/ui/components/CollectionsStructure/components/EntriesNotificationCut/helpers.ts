import {I18n} from 'i18n';

import type {PreparedNotificationType, TempImportExportDataType} from './types';

const i18n = I18n.keyset('component.workbook-export.notifications');

// TODO: remove when api will be added
export const notifications: TempImportExportDataType['notifications'] = [
    {
        entryId: '11221l3111',
        scope: 'connection',
        code: 'test1',
        message:
            'Long long long long long long long long long long long long long long long long long long long long long long Info Alert',
        level: 'info',
    },
    {
        entryId: '11221l3112',
        scope: 'connection',
        code: 'test1',
        message:
            'Long long long long long long long long long long long long long long long long long long long long long long Info Alert',
        level: 'info',
    },
    {
        entryId: '11221l3113',
        scope: 'dataset',
        code: 'test2',
        message: 'Short Warning alert',
        level: 'warning',
    },
    {
        code: 'test3',
        message: 'Some critical alert',
        level: 'critical',
    },
];

const NOTIFICATIONS_BY_CODE: Record<string, string> = {
    'NOTIF.WB_EXPORT.DS.RLS': i18n('label_export-rls'),
    'NOTIF.WB_IMPORT.DS.RLS': i18n('label_import-rls'),
    'NOTIF.WB_EXPORT.CONN.CHECK_CREDENTIALS': i18n('label_export-check-connection-credentials'),
    'NOTIF.WB_IMPORT.CONN.CHECK_CREDENTIALS': i18n('label_import-check-connections-credentials'),
    'NOTIF.WB_IMPORT.CONN.CHECK_DELEGATION': i18n('lable_import-check-delegation'),
    'ERR.UI_API.TRANSFER_INVALID_VERSION': i18n('label_invalid-version'),
    'ERR.UI_API.TRANSFER_MISSING_MAPPING_ID': i18n('label_missing-mapping-id'),
    'ERR.UI_API.TRANSFER_INVALID_ENTRY_DATA': i18n('label_invalid-entry-data'),
    'ERR.UI_API.TRANSFER_INVALID_ENTRY_SCOPE': i18n('label_invalid-entry-scope'),
};

export const transformNotifications = (
    notifications: TempImportExportDataType['notifications'] = [],
): PreparedNotificationType[] => {
    const notificationMap = new Map<string, PreparedNotificationType>();

    notifications.forEach((notification) => {
        const key = notification.code;

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

    return Array.from(notificationMap.values());
};

export const getNotificationTitleByCode = (code: string) => {
    return NOTIFICATIONS_BY_CODE[code] || i18n('label_invalid-error');
};
