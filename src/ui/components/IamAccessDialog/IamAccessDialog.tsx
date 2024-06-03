import React from 'react';

import {registry} from 'ui/registry';
import type {IamAccessDialogProps} from 'ui/registry/units/common/types/components/IamAccessDialog';

import DialogManager from '../../components/DialogManager/DialogManager';

export const DIALOG_IAM_ACCESS = Symbol('DIALOG_IAM_ACCESS');

export type OpenDialogIamAccessArgs = {
    id: typeof DIALOG_IAM_ACCESS;
    props: IamAccessDialogProps;
};

export const IamAccessDialog = React.memo<IamAccessDialogProps>((props) => {
    const {IamAccessDialogComponent} = registry.common.components.getAll();

    return <IamAccessDialogComponent {...props} />;
});

IamAccessDialog.displayName = 'IamAccessDialog';

DialogManager.registerDialog(DIALOG_IAM_ACCESS, IamAccessDialog);
