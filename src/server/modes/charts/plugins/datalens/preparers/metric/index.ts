import {isMarkupItem} from '../../../../../../../shared';
import {selectServerPalette} from '../../../../../../constants';
import {findIndexInOrder} from '../../utils/misc-helpers';
import type {PrepareFunctionArgs} from '../types';

import {prepareBasicMetricVariant} from './variants/basic';
import {prepareMarkupMetricVariant} from './variants/markup';

function prepareMetric({
    placeholders,
    resultData,
    shared,
    idToTitle,
    colorsConfig,
}: PrepareFunctionArgs) {
    const {data, order} = resultData;

    const measure = placeholders[0].items[0];

    if (typeof measure === 'undefined') {
        return {};
    }

    const measureActualTitle = idToTitle[measure.guid];
    const measureIndex = findIndexInOrder(order, measure, measureActualTitle);
    const value = data[0][measureIndex];

    if (typeof value === 'undefined' || value === null) {
        return {};
    }

    const useMarkup = isMarkupItem(value);

    const currentPalette = selectServerPalette({
        palette: shared.extraSettings?.metricFontColorPalette,
        availablePalettes: colorsConfig.availablePalettes,
        customColorPalettes: colorsConfig.loadedColorPalettes,
    });

    if (useMarkup) {
        return prepareMarkupMetricVariant({
            measure,
            value,
            extraSettings: shared.extraSettings,
            currentPalette,
        });
    } else {
        return prepareBasicMetricVariant({
            measure,
            value,
            extraSettings: shared.extraSettings,
            currentPalette,
        });
    }
}

export default prepareMetric;
