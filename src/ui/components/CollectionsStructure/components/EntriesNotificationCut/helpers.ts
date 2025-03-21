import type {PreparedNotificationType, TempImportExportDataType} from './types';

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
