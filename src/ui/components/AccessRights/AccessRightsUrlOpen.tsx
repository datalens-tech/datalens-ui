import React from 'react';

import {registry} from 'ui/registry';
import type {AccessRightsUrlOpenProps} from 'ui/registry/units/common/types/components/AccessRightsUrlOpen';

export const AccessRightsUrlOpen = ({history}: AccessRightsUrlOpenProps) => {
    const {AccessRightsUrlOpenComponent} = registry.common.components.getAll();

    return <AccessRightsUrlOpenComponent history={history} />;
};
