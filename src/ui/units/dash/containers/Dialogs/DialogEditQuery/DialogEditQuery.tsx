import React from 'react';

import DialogManager from '../../../../../components/DialogManager/DialogManager';

export const DIALOG_EDIT_QUERY = Symbol('DIALOG_EDIT_QUERY');

export type OpenDialogEditQueryArgs = {
    id: typeof DIALOG_EDIT_QUERY;
    props: undefined;
};

const DialogEditQuery: React.FC = () => {
    return <div />;
};

DialogManager.registerDialog(DIALOG_EDIT_QUERY, DialogEditQuery);
