import type {EntryNotification} from 'shared/types/meta-manager';

import type {PreparedNotificationType} from './types';

export const transformNotifications = (
    notifications: EntryNotification[] = [],
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
