import React from 'react';

import {registry} from 'ui/registry';
import {DialogDashMetaProps} from 'ui/registry/units/dash/types/DialogDashMeta';

export const DialogDashMetaWrapper = (props: DialogDashMetaProps) => {
    const {DialogDashMeta} = registry.dash.components.getAll();
    return <DialogDashMeta {...props} />;
};
