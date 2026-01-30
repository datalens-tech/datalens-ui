import {CircleExclamation, TriangleExclamation} from '@gravity-ui/icons';
import {type ChartsInsightsItemLevels} from 'shared';

const insightsIconsFloat = {
    critical: TriangleExclamation,
    warning: CircleExclamation,
    info: CircleExclamation,
};

export const getIconData = (level: ChartsInsightsItemLevels) => {
    return insightsIconsFloat[level];
};
