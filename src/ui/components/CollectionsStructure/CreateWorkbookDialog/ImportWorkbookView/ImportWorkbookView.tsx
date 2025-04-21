import React from 'react';

import {Flex, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {ProgressBar} from 'ui/components/ProgressBar/ProgressBar';
import ViewError from 'ui/components/ViewError/ViewError';

import {EntriesNotificationCut} from '../../components/EntriesNotificationCut/EntriesNotificationCut';
import {transformNotifications} from '../../components/EntriesNotificationCut/helpers';
import type {TempImportExportDataType} from '../../components/EntriesNotificationCut/types';
import type {ImportExportStatus} from '../../types';

import './ImportWorkbookView.scss';

const b = block('import-workbook-file-view');

const i18n = I18n.keyset('component.workbook-import-view.view');

export type ImportWorkbookViewProps = {
    error: null | Error;
    data: TempImportExportDataType | null;
    status: ImportExportStatus;
    progress: number;
};

export const ImportWorkbookView = ({status, error, progress, data}: ImportWorkbookViewProps) => {
    switch (status) {
        case 'pending':
            return <ProgressBar size="s" className={b('progress')} value={progress} />;

        case 'loading':
            return (
                <Flex alignItems="center" justifyContent="center">
                    <Loader size="m" />
                </Flex>
            );
        case 'success':
        case 'notification-error':
            if (!data) {
                return null;
            }
            if (data.status !== 'error' && !data.notifications) {
                return (
                    <EntriesNotificationCut title={i18n('label_success-import')} level="success" />
                );
            }

            {
                const preparedNotifications = transformNotifications(data.notifications);
                return (
                    <Flex direction="column" gap={4}>
                        {preparedNotifications.map(({code, message, level, entries}) => (
                            <EntriesNotificationCut
                                key={code}
                                title={message}
                                level={level}
                                entries={entries}
                            />
                        ))}
                    </Flex>
                );
            }
        case 'fatal-error':
        default:
            return <ViewError containerClassName={b('error-content')} error={error} size="s" />;
    }
};
