import React from 'react';

import {registry} from 'ui/registry';

import DialogManager from '../DialogManager/DialogManager';
import {AccessDialogProps} from 'ui/registry/units/common/types/components/AccessDialog';

export const DIALOG_ACCESS = Symbol('DIALOG_ACCESS');

export type OpenDialogAccessDialogArgs = {
    id: typeof DIALOG_ACCESS;
    props: AccessDialogProps;
};

export const AccessDialogWrapper = (props: AccessDialogProps) => {
    const {AccessDialog} = registry.common.components.getAll();
    return <AccessDialog {...props} />;
};

DialogManager.registerDialog(DIALOG_ACCESS, AccessDialogWrapper);
