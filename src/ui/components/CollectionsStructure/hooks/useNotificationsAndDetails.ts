import React from 'react';

import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import type {EntryNotification} from 'shared/types/meta-manager';
import {openDialogErrorWithTabs} from 'ui/store/actions/dialog';

import {transformNotifications} from '../components/EntriesNotificationCut/helpers';
import type {PreparedNotificationType} from '../components/EntriesNotificationCut/types';

const i18n = I18n.keyset('component.workbook-export.notifications');

export interface UseNotificationsAndDetailsProps {
    notifications?: EntryNotification[] | null;
    exportId?: string;
    importId?: string;
}

export const useNotificationsAndDetails = ({
    notifications,
    exportId,
    importId,
}: UseNotificationsAndDetailsProps) => {
    const dispatch = useDispatch();
    const [notificationDetails, setNotificationDetails] = React.useState<string | null>(null);

    const preparedNotifications = React.useMemo<PreparedNotificationType[]>(() => {
        if (!notifications) {
            setNotificationDetails(null);
            return [];
        }

        const {notifications: transformedNotifications, details} =
            transformNotifications(notifications);

        setNotificationDetails(details);

        return transformedNotifications;
    }, [notifications]);

    const handleShowDetails = React.useCallback(() => {
        if (notificationDetails) {
            dispatch(
                openDialogErrorWithTabs({
                    title: i18n('title_error-details'),
                    details: notificationDetails,
                    exportId,
                    importId,
                }),
            );
        }
    }, [notificationDetails, dispatch, exportId, importId]);

    return {
        notificationDetails,
        preparedNotifications,
        handleShowDetails,
    };
};
