import React from 'react';

import {registry} from '../../registry';

export const DialogCreateTextWidgetWrapper = () => {
    const {DialogText} = registry.dash.components.getAll();

    return <DialogText />;
};
