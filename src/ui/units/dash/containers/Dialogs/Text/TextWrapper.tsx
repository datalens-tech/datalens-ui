import React from 'react';

import {registry} from 'ui/registry';

import type {DialogTextWidgetProps} from '../../../../../components/DialogTextWidget/DialogTextWidget';

export const TextWrapper = (props: DialogTextWidgetProps) => {
    const {DialogTextWidget} = registry.dash.components.getAll();

    return <DialogTextWidget {...props} />;
};
