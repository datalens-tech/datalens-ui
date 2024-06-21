import escape from 'lodash/escape';

import type {ChartsConfig, FeatureConfig, ServerPlaceholder} from '../../../../../../../../shared';
import {Feature, PlaceholderId, getFakeTitleOrTitle} from '../../../../../../../../shared';
import {getFieldTitle} from '../../../utils/misc-helpers';

type GetScatterTooltipOptionsArgs = {
    placeholders: ServerPlaceholder[];
    shared: ChartsConfig;
    features: FeatureConfig;
};

export function getScatterTooltipOptions(args: GetScatterTooltipOptionsArgs) {
    const {shared, placeholders, features} = args;

    const xField = placeholders[0].items[0];
    const yField = placeholders[1].items[0];
    const pointField = placeholders[2].items[0];
    const colorField = shared.colors[0];
    const shapeField = shared.shapes?.[0];
    const sizeField = placeholders.find((pl) => pl.id === PlaceholderId.Size)?.items[0];

    let xTitle = getFieldTitle(xField);
    let yTitle = getFieldTitle(yField);
    let pointTitle = getFakeTitleOrTitle(pointField);
    let colorTitle = getFieldTitle(colorField);
    let shapeTitle = getFieldTitle(shapeField);
    let sizeTitle = getFieldTitle(sizeField);

    if (features[Feature.EscapeUserHtmlInDefaultHcTooltip]) {
        xTitle = escape(xTitle);
        yTitle = escape(yTitle);
        pointTitle = escape(pointTitle);
        colorTitle = escape(colorTitle);
        shapeTitle = escape(shapeTitle);
        sizeTitle = escape(sizeTitle);
    }

    return {
        pointTitle,
        colorTitle,
        shapeTitle,
        sizeTitle,
        xTitle,
        yTitle,
    };
}
