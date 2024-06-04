import {QLChartType, WizardVisualizationId} from '../../constants';
import type {Field, ServerField} from '../../types';
import {getFakeTitleOrTitle} from '../fields';

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
const chartTypeWithMultipleColors: Record<
    string,
    Partial<Record<WizardVisualizationId, boolean>>
> = {
    [QLChartType.Monitoringql]: {
        [WizardVisualizationId.Line]: true,
        [WizardVisualizationId.Area]: true,
        [WizardVisualizationId.Area100p]: true,
        [WizardVisualizationId.Column]: true,
        [WizardVisualizationId.Column100p]: true,
        [WizardVisualizationId.Bar]: true,
        [WizardVisualizationId.Bar100p]: true,
    },
};
export const isChartSupportMultipleColors = (chartType: string, visualizationId: string): boolean =>
    Boolean(chartTypeWithMultipleColors[chartType]?.[visualizationId as WizardVisualizationId]);
