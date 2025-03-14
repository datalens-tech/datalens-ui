import React from 'react';

import {Flex, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {ProgressBar} from 'ui/components/ProgressBar/ProgressBar';
import ViewError from 'ui/components/ViewError/ViewError';

import {EntriesNotificationCut} from '../../components/EntriesNotificationCut/EntriesNotificationCut';
import type {TempImportExportDataType} from '../../components/EntriesNotificationCut/types';
import type {ImportExportStatus} from '../../types';

import './ImportWorkbookView.scss';

const b = block('import-workbook-file-view');

const i18n = I18n.keyset('component.workbook-import-view.view');

export type Props = {
    status?: ImportExportStatus;
    error: null | Error;
    progress: number | null;
    // TODO: Fix type
    data: TempImportExportDataType | null;
};

export const ImportWorkbookView: React.FC<Props> = ({status, error, progress, data}) => {
    switch (status) {
        case 'loading':
            if (!progress) {
                return (
                    <Flex alignItems="center" justifyContent="center">
                        <Loader size="m" />
                    </Flex>
                );
            }
            return <ProgressBar size="s" className={b('progress')} value={progress} />;
        case 'success':
        case 'notification-error':
            if (!data) {
                return null;
            }
            if (!data.notifications?.length) {
                return (
                    <EntriesNotificationCut title={i18n('label_success-import')} level="success" />
                );
            }
            return (
                <Flex direction="column" gap={4}>
                    {data.notifications.map((notification) => (
                        <EntriesNotificationCut
                            key={notification.code}
                            title={notification.message}
                            level={notification.level}
                            entries={notification.entries}
                        />
                    ))}
                </Flex>
            );
        case 'fatal-error':
        default:
            return <ViewError containerClassName={b('error-content')} error={error} size="s" />;
    }
};
