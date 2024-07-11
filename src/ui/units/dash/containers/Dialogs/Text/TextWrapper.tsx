import React from 'react';

import {registry} from 'ui/registry';

export const TextWrapper = () => {
    const {DialogText: Text} = registry.dash.components.getAll();

    return <Text />;
};
