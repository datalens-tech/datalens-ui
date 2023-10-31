import React from 'react';

import {Icon} from '@gravity-ui/uikit';
import {SVGIconData} from '@gravity-ui/uikit/build/esm/components/Icon/types';
import block from 'bem-cn-lite';

import './CollectionContentTable.scss';

type DropdownActionsProps = {
    icon: SVGIconData;
    text: string;
};

const b = block('dl-collection-content-table');

const DropdownActions: React.FC<DropdownActionsProps> = ({icon, text}) => {
    return (
        <div className={b('dropdown-item')}>
            <Icon data={icon} />
            <div className={b('dropdown-text')}>{text}</div>
        </div>
    );
};

export {DropdownActions};
