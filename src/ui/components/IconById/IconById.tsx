import React from 'react';

import {Icon, IconProps} from '@gravity-ui/uikit';

import {IconId} from '../../../shared';
import {registry} from '../../registry';

export type IconByIdProps = Omit<IconProps, 'data'> & {
    id: IconId;
};

export const IconById = ({id, ...restProps}: IconByIdProps) => {
    const {getIconDataById} = registry.common.functions.getAll();
    const iconData = getIconDataById(id);

    if (!iconData) {
        return null;
    }

    return <Icon data={iconData} {...restProps} />;
};
