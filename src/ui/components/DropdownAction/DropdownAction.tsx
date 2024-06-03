import React from 'react';

import {Icon} from '@gravity-ui/uikit';
import type {SVGIconData} from '@gravity-ui/uikit/build/esm/components/Icon/types';
import block from 'bem-cn-lite';

import './DropdownAction.scss';

type DropdownActionProps = {
    icon: SVGIconData;
    text: string;
};

const b = block('dl-collection-dropdown-action');

const DropdownAction: React.FC<DropdownActionProps> = ({icon, text}) => {
    return (
        <div className={b()}>
            <Icon data={icon} />
            <div className={b('text')}>{text}</div>
        </div>
    );
};

export {DropdownAction};
