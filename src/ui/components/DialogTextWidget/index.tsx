import React from 'react';

import {registry} from '../../registry';

export const DialogTextWidgettWrapper = () => {
    const {DialogText} = registry.dash.components.getAll();

    return <DialogText />;
};
