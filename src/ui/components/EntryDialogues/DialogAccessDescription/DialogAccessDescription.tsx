import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {ErrorContentTypes} from 'shared/constants';
import {DashData} from 'shared/types/dash';
import ErrorContent from 'ui/components/ErrorContent/ErrorContent';

import {EntryDialogResolveStatus} from '../constants';
import {EntryDialogProps} from '../types';

import './DialogAccessDescription.scss';

export interface DialogCreateDashboardProps extends EntryDialogProps {
    initDestination?: string;
    workbookId?: string;
    data?: DashData;
}

const i18n = I18n.keyset('datalens.landing.error');
const b = block('dialog-access-description');

export type DialogAccessDescriptionProps = {
    visible: boolean;
    onClose: ({status}: {status: EntryDialogResolveStatus}) => void;
    accessDescription: string;
};

export const DialogAccessDescription = ({
    visible,
    onClose,
    accessDescription,
}: DialogAccessDescriptionProps) => {
    const handleClose = () => {
        onClose({status: EntryDialogResolveStatus.Close});
    };

    return (
        <Dialog open={visible} onClose={handleClose} className={b()}>
            <Dialog.Header caption={i18n('label_title-forbidden-entry')} />
            <Dialog.Body className={b('body')}>
                <ErrorContent
                    type={ErrorContentTypes.NO_ENTRY_ACCESS}
                    accessDescription={accessDescription}
                    showDebugInfo={false}
                    hideTitle={true}
                />
            </Dialog.Body>
        </Dialog>
    );
};
