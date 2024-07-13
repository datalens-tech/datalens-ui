import React from 'react';

import {registry} from '../../registry';

import type {DialogTextWidgetProps} from './DialogTextWidget';

export const DialogTextWidgetWrapper = (props: DialogTextWidgetProps) => {
    const {DialogTextWidget} = registry.dash.components.getAll();

    return <DialogTextWidget {...props} />;
};
