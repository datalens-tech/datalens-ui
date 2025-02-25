import type {ChartsConfig, ServerPlaceholder} from '../../../../../../../../shared';
import {PlaceholderId, getFakeTitleOrTitle} from '../../../../../../../../shared';
import {getFieldTitle} from '../../../utils/misc-helpers';

type GetScatterTooltipOptionsArgs = {
    placeholders: ServerPlaceholder[];
    shared: ChartsConfig;
};

export function getScatterTooltipOptions(args: GetScatterTooltipOptionsArgs) {
    const {shared, placeholders} = args;

    const xField = placeholders[0]?.items?.[0];
    const yField = placeholders[1]?.items?.[0];
    const pointField = placeholders[2]?.items?.[0];
    const colorField = shared.colors?.[0];
    const shapeField = shared.shapes?.[0];
    const sizeField = placeholders.find((pl) => pl.id === PlaceholderId.Size)?.items?.[0];

    return {
        pointTitle: getFakeTitleOrTitle(pointField),
        colorTitle: getFieldTitle(colorField),
        shapeTitle: getFieldTitle(shapeField),
        sizeTitle: getFieldTitle(sizeField),
        xTitle: getFieldTitle(xField),
        yTitle: getFieldTitle(yField),
    };
}
