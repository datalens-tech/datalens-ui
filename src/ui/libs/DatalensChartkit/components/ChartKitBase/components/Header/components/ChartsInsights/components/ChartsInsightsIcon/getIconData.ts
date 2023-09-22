import {CircleExclamationFill, CircleInfo, TriangleExclamationFill} from '@gravity-ui/icons';
import {ChartsInsightsItemLevels} from 'shared';

const LevelToIcons = {
    critical: TriangleExclamationFill,
    warning: CircleExclamationFill,
    info: CircleInfo,
};

export const getIconData = (level: ChartsInsightsItemLevels) => {
    return LevelToIcons[level];
};
