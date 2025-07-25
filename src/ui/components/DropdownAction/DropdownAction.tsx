import React from 'react';

import type {IconData, IconProps} from '@gravity-ui/uikit';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './DropdownAction.scss';

type DropdownActionProps = {
    icon: IconData;
    text: string;
    size?: IconProps['size'];
};

const b = block('dl-collection-dropdown-action');

const DropdownAction: React.FC<DropdownActionProps> = ({icon, text, size}) => {
    return (
        <div className={b()}>
            <Icon data={icon} size={size} />
            <div className={b('text')}>{text}</div>
        </div>
    );
};

export {DropdownAction};
