import {isEmpty, size} from 'lodash';
import type {ChartsInsightsItem, ChartsInsightsItemLevels} from 'shared';

const levelsValue = {
    info: 1,
    warning: 2,
    critical: 3,
};

const compare = (a: ChartsInsightsItemLevels, b: ChartsInsightsItemLevels) => {
    if (levelsValue[a] > levelsValue[b]) {
        return -1;
    }

    if (levelsValue[a] < levelsValue[b]) {
        return 1;
    }

    return 0;
};

export const getIconLevel = (items: ChartsInsightsItem[]): null | ChartsInsightsItemLevels => {
    if (isEmpty(items)) {
        return null;
    }

    if (size(items) === 1) {
        return items[0].level;
    }

    const sortingIcons = items.map((it) => it.level).sort(compare);

    return sortingIcons[0];
};
