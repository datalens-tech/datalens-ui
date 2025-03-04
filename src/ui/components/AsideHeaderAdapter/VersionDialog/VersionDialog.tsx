import React from 'react';

import {Dialog, Text, spacing} from '@gravity-ui/uikit';
import {i18n} from 'i18n';
import DialogManager from 'ui/components/DialogManager/DialogManager';

export const DIALOG_RELEASE_VERSION = Symbol('DIALOG_RELEASE_VERSION');

type VersionDialogProps = {
    releaseVersion: string;
    open: boolean;
    onClose: VoidFunction;
};

export type OpenDialogReleaseVersionArgs = {
    id: typeof DIALOG_RELEASE_VERSION;
    props: VersionDialogProps;
};

export function VersionDialog({releaseVersion, open, onClose}: VersionDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} size="s">
            <Dialog.Header caption={i18n('component.aside-header.view', 'label_about')} />
            <Dialog.Body>
                <Text variant="subheader-1" className={spacing({mr: 2})}>
                    {i18n('component.aside-header.view', 'label_app-version')}:
                </Text>
                {releaseVersion}
            </Dialog.Body>
            <Dialog.Footer />
        </Dialog>
    );
}

DialogManager.registerDialog(DIALOG_RELEASE_VERSION, VersionDialog);
