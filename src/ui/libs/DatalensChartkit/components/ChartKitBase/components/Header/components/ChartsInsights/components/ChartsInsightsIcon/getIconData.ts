import {
    CircleExclamation,
    CircleExclamationFill,
    CircleInfo,
    TriangleExclamation,
    TriangleExclamationFill,
} from '@gravity-ui/icons';
import {type ChartsInsightsItemLevels, Feature} from 'shared';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

const LevelToIcons = {
    critical: TriangleExclamationFill,
    warning: CircleExclamationFill,
    info: CircleInfo,
};

const insightsIconsFloat = {
    critical: TriangleExclamation,
    warning: CircleExclamation,
    info: CircleExclamation,
};

export const getIconData = (level: ChartsInsightsItemLevels) => {
    const showFlatControls = isEnabledFeature(Feature.DashFloatControls);
    if (showFlatControls) {
        return insightsIconsFloat[level];
    }
    return LevelToIcons[level];
};
