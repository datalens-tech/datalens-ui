import React from 'react';

import {registry} from 'ui/registry';
import type {DialogEntryDescriptionProps} from 'ui/registry/units/common/types/components/DialogEntryDescription';

import DialogManager from '../DialogManager/DialogManager';

export const DIALOG_ENTRY_DESCRIPTION = Symbol('DIALOG_ENTRY_DESCRIPTION');

export type OpenDialogEntryDescriptionArgs = {
    id: typeof DIALOG_ENTRY_DESCRIPTION;
    props: DialogEntryDescriptionProps;
};

export const DialogEntryDescriptionWrapper = (props: DialogEntryDescriptionProps) => {
    const {DialogEntryDescription} = registry.common.components.getAll();
    return <DialogEntryDescription {...props} />;
};

DialogManager.registerDialog(DIALOG_ENTRY_DESCRIPTION, DialogEntryDescriptionWrapper);
