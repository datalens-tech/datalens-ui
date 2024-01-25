import {QLChartType} from '../constants';
import {Field, ServerField} from '../types';

import {getFakeTitleOrTitle} from './fields';

type GetColorsConfigKeyOptions = {
    isMeasureNames: boolean;
};

export const getColorsConfigKey = (
    field: ServerField | Field,
    fields: (ServerField | Field)[],
    options: GetColorsConfigKeyOptions,
) => {
    if (options.isMeasureNames) {
        const fieldTitle = getFakeTitleOrTitle(field);
        const isFieldWithSameNameExist = fields.some(
            (item) =>
                getFakeTitleOrTitle(item) === fieldTitle && item.datasetId !== field.datasetId,
        );

        if (isFieldWithSameNameExist) {
            return `${fieldTitle} (${field.datasetName})`;
        }

        return fieldTitle;
    }

    return undefined;
};
const chartTypeWithMultipleColors: Record<string, boolean> = {
    [QLChartType.Monitoringql]: true,
};
export const isChartSupportMultipleColors = (chartType: string) =>
    chartTypeWithMultipleColors[chartType];
