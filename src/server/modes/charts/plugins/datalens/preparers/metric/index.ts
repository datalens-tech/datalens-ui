import {Feature, isEnabledServerFeature, isMarkupItem} from '../../../../../../../shared';
import {registry} from '../../../../../../registry';
import {findIndexInOrder} from '../../utils/misc-helpers';
import {PrepareFunctionArgs} from '../types';

import {prepareBasicMetricVariant} from './variants/basic';
import {prepareMarkupMetricVariant} from './variants/markup';

function prepareMetric({placeholders, resultData, shared, idToTitle}: PrepareFunctionArgs) {
    const {data, order} = resultData;

    const measure = placeholders[0].items[0];

    if (typeof measure === 'undefined') {
        return {};
    }

    const measureActualTitle = idToTitle[measure.guid];
    const measureIndex = findIndexInOrder(order, measure, measureActualTitle);
    const value = data[0][measureIndex];

    if (typeof value === 'undefined') {
        return {};
    }

    const app = registry.getApp();

    const useMarkupMetric =
        isMarkupItem(value) && isEnabledServerFeature(app.nodekit.ctx, Feature.MarkupMetric);

    if (useMarkupMetric) {
        return prepareMarkupMetricVariant({measure, value, extraSettings: shared.extraSettings});
    } else {
        return prepareBasicMetricVariant({measure, value, extraSettings: shared.extraSettings});
    }
}

export default prepareMetric;
