import React from 'react';

import {registry} from '../../registry';

export const DialogTextWidgetWrapper = () => {
    const {DialogText} = registry.dash.components.getAll();

    return <DialogText />;
};
