import React from 'react';

import {registry} from 'ui/registry';

export const MobileHeader = () => {
    const {MobileHeaderComponent} = registry.common.components.getAll();

    return <MobileHeaderComponent />;
};
