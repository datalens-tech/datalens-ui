import React from 'react';

import type {IconProps} from '@gravity-ui/uikit';
import {Icon} from '@gravity-ui/uikit';

import type {IconId} from '../../../shared';
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
