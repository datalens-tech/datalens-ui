import React from 'react';

import {registry} from '../../registry';

import type {DialogCreateTextWidgetProps} from './DialogCreateTextWidget';

export const DialogCreateTextWidgetWrapper = (props: DialogCreateTextWidgetProps) => {
    const {DialogCreateTextWidget} = registry.dash.components.getAll();

    return <DialogCreateTextWidget {...props} />;
};
