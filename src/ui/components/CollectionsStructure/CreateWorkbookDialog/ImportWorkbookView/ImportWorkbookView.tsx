import React from 'react';

import {Flex, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {ProgressBar} from 'ui/components/ProgressBar/ProgressBar';
import ViewError from 'ui/components/ViewError/ViewError';
import {
    selectGetImportProgressData,
    selectGetImportProgressEntriesMap,
    selectImportError,
} from 'ui/store/selectors/collectionsStructure';

import {EntriesNotificationCut} from '../../components/EntriesNotificationCut/EntriesNotificationCut';
import {transformNotifications} from '../../components/EntriesNotificationCut/helpers';
import type {ImportExportStatus} from '../../types';

import './ImportWorkbookView.scss';

const b = block('import-workbook-file-view');

const i18n = I18n.keyset('component.workbook-import-view.view');

export type ImportWorkbookViewProps = {
    status: ImportExportStatus;
};

export const ImportWorkbookView = ({status}: ImportWorkbookViewProps) => {
    const importProgressData = useSelector(selectGetImportProgressData);
    const notificationEntriesMap = useSelector(selectGetImportProgressEntriesMap);
    const error = useSelector(selectImportError);

    const progress = importProgressData?.progress;
    const notifications = importProgressData?.notifications;

    switch (status) {
        case 'pending':
            return <ProgressBar size="s" className={b('progress')} value={progress ?? 0} />;

        case 'loading':
            return (
                <Flex alignItems="center" justifyContent="center">
                    <Loader size="m" />
                </Flex>
            );
        case 'success':
        case 'notification-error':
            if (status === 'success' && !notifications) {
                return (
                    <EntriesNotificationCut title={i18n('label_success-import')} level="success" />
                );
            }

            {
                const preparedNotifications = notifications
                    ? transformNotifications(notifications).notifications
                    : [];
                return (
                    <Flex direction="column" gap={4}>
                        {preparedNotifications.map(({code, level, entries}) => (
                            <EntriesNotificationCut
                                key={code}
                                code={code}
                                level={level}
                                entries={entries}
                                entriesMap={notificationEntriesMap}
                            />
                        ))}
                    </Flex>
                );
            }
        case 'fatal-error':
        default:
            return (
                <ViewError
                    showDebugInfo={false}
                    containerClassName={b('error-content')}
                    error={error}
                    size="s"
                />
            );
    }
};
