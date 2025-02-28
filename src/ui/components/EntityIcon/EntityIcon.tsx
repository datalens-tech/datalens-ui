import React from 'react';

import {
    ChartColumn,
    CircleQuestion,
    CirclesIntersection,
    CurlyBrackets,
    DisplayPulse,
    LayoutCellsLarge,
    Thunderbolt,
} from '@gravity-ui/icons';
import type {IconData} from '@gravity-ui/uikit';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

// TODO: Replace icons after the release in the library CHARTS-7528
import iconFolder from '../../assets/icons/folder.svg';
import iconQLChart from '../../assets/icons/ql-chart.svg';

import './EntityIcon.scss';

const b = block('entity-icon');

const typeIcons = {
    dataset: CirclesIntersection,
    folder: iconFolder,
    'chart-wizard': ChartColumn,
    'chart-ql': iconQLChart,
    editor: CurlyBrackets,
    dashboard: LayoutCellsLarge,
    connection: Thunderbolt,
    report: DisplayPulse,
    broken: CircleQuestion,
};

export type EntityIconType = keyof typeof typeIcons;

export type EntityIconSize = 's' | 'l' | 'xl';

// TODO: remove usage of this type from closed source, then remove it from here
export type EntityIconProps = {
    type?: string;
    iconData?: IconData;
    size?: EntityIconSize;
    iconSize?: number;
    view?: 'round';
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
    iconData,
    iconSize = defaultIconSize[size],
    classMixin,
    view,
}) => {
    let targetIconData;
    if (iconData) {
        targetIconData = iconData;
    } else if (type && typeIcons[type as EntityIconType]) {
        targetIconData = typeIcons[type as EntityIconType];
    }

    return (
        <div className={b('container', {size, view}, classMixin)}>
            <div className={b('color-box', {type})}>
                <Icon data={targetIconData} size={iconSize} />
            </div>
        </div>
    );
};
