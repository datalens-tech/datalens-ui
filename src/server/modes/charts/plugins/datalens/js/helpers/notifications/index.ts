import type {
    ChartsInsight,
    ServerField,
    ServerPlaceholder,
    ServerVisualization,
} from '../../../../../../../../shared';
import {ChartsInsightLocator, getFakeTitleOrTitle} from '../../../../../../../../shared';

export const prepareNotifications = (
    notifications: ChartsInsight[],
    visualization: ServerVisualization,
) => {
    const fieldDict: Record<string, ServerField> = visualization.placeholders.reduce(
        (acc: Record<string, ServerField>, placeholder: ServerPlaceholder) => {
            placeholder.items.forEach((placeholderItem) => {
                acc[placeholderItem.guid] = placeholderItem;
                acc[placeholderItem.title] = placeholderItem;
            });

            return acc;
        },
        {},
    );

    return notifications.map((notification) => {
        if (notification.locator.startsWith(ChartsInsightLocator.UsingDeprecatedDatetimeFields)) {
            return prepareUsingDeprecatedDatetimeFieldsNotification(notification, fieldDict);
        }

        return notification;
    });
};

const getTitleWithGuidRegexp = () =>
    /title-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

const prepareUsingDeprecatedDatetimeFieldsNotification = (
    notification: ChartsInsight,
    fieldDict: Record<string, ServerField>,
) => {
    const match = notification.message.match(getTitleWithGuidRegexp());

    if (!match) {
        return notification;
    }

    const guid = match[0].replace('title-', '');

    const field = fieldDict[guid];

    if (!field) {
        return notification;
    }

    return {
        ...notification,
        message: notification.message.replace(getTitleWithGuidRegexp(), getFakeTitleOrTitle(field)),
    };
};
