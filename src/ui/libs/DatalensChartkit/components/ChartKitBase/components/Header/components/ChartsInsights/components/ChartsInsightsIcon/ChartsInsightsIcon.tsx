import React from 'react';

import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {ChartsInsightsItemLevels} from 'shared';

import {ICONS_MENU_DEFAULT_SIZE} from '../../../../../../../../menu/MenuItems';

import {getIconData} from './getIconData';

import './ChartsInsightsIcon.scss';

const b = block('chartkit-charts-insights');

type ChartsInsightsIconProps = {
    level: ChartsInsightsItemLevels;
};

export const ChartsInsightsIcon: React.FC<ChartsInsightsIconProps> = ({
    level,
}: ChartsInsightsIconProps) => {
    const iconData = getIconData(level);

    return (
        <Icon
            data={iconData}
            size={ICONS_MENU_DEFAULT_SIZE}
            className={b('icon', {[level]: true})}
        />
    );
};
// Pretending to be an Icon component to make this condition work:
// https://github.com/gravity-ui/uikit/blob/main/src/components/Button/Button.tsx#L195
ChartsInsightsIcon.displayName = 'Icon';
