import React from 'react';

import {
    ChartColumn,
    CirclesIntersection,
    CurlyBrackets,
    LayoutCellsLarge,
    Thunderbolt,
} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

// TODO: Replace icons after the release in the library CHARTS-7528
import iconFolder from '../../assets/icons/folder.svg';
import iconQLchart from '../../assets/icons/ql-chart.svg';

import './EntityIcon.scss';

const b = block('entity-icon');

const typeIcons = {
    dataset: CirclesIntersection,
    folder: iconFolder,
    'chart-wizard': ChartColumn,
    'chart-ql': iconQLchart,
    editor: CurlyBrackets,
    dashboard: LayoutCellsLarge,
    connection: Thunderbolt,
};

export type EntityIconType = keyof typeof typeIcons;

export type EntityIconSize = 's' | 'l' | 'xl';

export type EntityIconProps = {
    type: EntityIconType;
    size?: EntityIconSize;
    iconSize?: number;
    classMixin?: string;
};

export const defaultIconSize = {
    s: 12,
    l: 16,
    xl: 18,
};

export const EntityIcon: React.FC<EntityIconProps> = ({
    size = 's',
    type,
    iconSize = defaultIconSize[size],
    classMixin,
}) => {
    return (
        <div className={b('container', {size}, classMixin)}>
            <div className={b('color-box', {type})}>
                <Icon data={typeIcons[type]} size={iconSize} />
            </div>
        </div>
    );
};
