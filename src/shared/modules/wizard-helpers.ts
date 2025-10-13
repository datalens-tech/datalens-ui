import type {RGBColor} from '../constants';
import {
    DEFAULT_FLOAT_NUMBERS,
    DEFAULT_FORMATTING,
    DEFAULT_INTEGER_NUMBERS,
    GradientType,
    PERCENT_VISUALIZATIONS,
    PlaceholderId,
    PseudoFieldTitle,
    VISUALIZATIONS_WITH_SEVERAL_FIELDS_X_PLACEHOLDER,
    WizardVisualizationId,
} from '../constants';
import type {
    CommonNumberFormattingOptions,
    Dataset,
    Field,
    MarkupItem,
    ServerFieldFormatting,
    ServerSort,
    Update,
    V3Label,
} from '../types';
import {
    DATASET_FIELD_TYPES,
    DatasetFieldType,
    isDateField,
    isFloatField,
    isNumberField,
} from '../types';
import {getFieldUISettings} from '../utils';

import {isMeasureField} from './helpers';

export const isMeasureName = (field: {type: string; title: string}) =>
    field.type === 'PSEUDO' &&
    (field.title === PseudoFieldTitle.MeasureNames || field.title === PseudoFieldTitle.ColumnNames);

export const isMeasureValue = (field?: {type: string; title: string}) =>
    field?.type === 'PSEUDO' && field?.title === PseudoFieldTitle.MeasureValues;

export const isMeasureType = (field: {type: string}) => field.type === 'MEASURE';

export const isMeasureNameOrValue = (field: {type: string; title: string}) =>
    isMeasureName(field) || isMeasureValue(field);

export const createMeasureNames = (isQL?: boolean) =>
    ({
        title: isQL ? PseudoFieldTitle.ColumnNames : PseudoFieldTitle.MeasureNames,
        type: DatasetFieldType.Pseudo,
        className: 'item pseudo-item dimension-item',
        data_type: DATASET_FIELD_TYPES.STRING,
    }) as Field;

export const createMeasureValues = () =>
    ({
        title: PseudoFieldTitle.MeasureValues,
        type: DatasetFieldType.Pseudo,
        className: 'item pseudo-item measure-item',
        data_type: DATASET_FIELD_TYPES.FLOAT,
    }) as Field;

export const getDefaultFormatting = (
    field: Field | undefined,
): ServerFieldFormatting | CommonNumberFormattingOptions => {
    if (!field) {
        return {} as CommonNumberFormattingOptions;
    }

    const fieldUISettings = getFieldUISettings({field});

    return {
        ...DEFAULT_FORMATTING,
        precision: isFloatField(field) ? DEFAULT_FLOAT_NUMBERS : DEFAULT_INTEGER_NUMBERS,
        ...fieldUISettings?.numberFormatting,
        labelMode:
            (field as V3Label).labelMode ||
            fieldUISettings?.numberFormatting?.labelMode ||
            DEFAULT_FORMATTING.labelMode,
    };
};
export const getResultSchemaFromDataset = (dataset?: Dataset | Dataset['dataset']): Field[] => {
    if (!dataset) {
        return [];
    }

    const schema = (
        'dataset' in dataset ? dataset.dataset.result_schema : dataset.result_schema
    ) as Field[];

    // Return the default empty array, because some cases
    // there may be a dataset without result_schema
    return schema || [];
};

export const filterUpdatesByDatasetId = (updates: Update[], datasetId: string) => {
    return updates.filter((update) => {
        return (
            // Checking for typeof - fallback, because in the old charts updates did not contain datasetId
            typeof update.field.datasetId === 'undefined' || update.field.datasetId === datasetId
        );
    });
};

export const isPercentVisualization = (visualizationId: string) =>
    PERCENT_VISUALIZATIONS.has(visualizationId);

export const isVisualizationWithSeveralFieldsXPlaceholder = (visualizationId: string) =>
    VISUALIZATIONS_WITH_SEVERAL_FIELDS_X_PLACEHOLDER.has(visualizationId);

function markupToRawString(obj: MarkupItem, str = ''): string {
    let text = str;

    if (obj.children) {
        text =
            text +
            obj.children
                .map((item) => {
                    if (typeof item === 'string') {
                        return item;
                    }
                    return markupToRawString(item, text);
                })
                .join('');
    } else if (obj.content && typeof obj.content === 'string') {
        text = text + obj.content;
    } else if (obj.content && typeof obj.content === 'object') {
        text = markupToRawString(obj.content, text);
    }

    return text;
}

export {markupToRawString};

export function getDeltasByColorValuesMap(
    colorValues: (number | null)[],
    min: number,
    range: number,
) {
    return colorValues.reduce(
        (acc, colorValue) => {
            const delta = getRangeDelta(colorValue, min, range);
            if (typeof colorValue !== 'number' || typeof delta !== 'number') {
                return acc;
            }

            return {
                ...acc,
                [colorValue]: delta,
            };
        },
        {} as Record<number, number>,
    );
}

export function getRgbColorValue(
    delta: number,
    gradientMode: string | GradientType,
    rangeMiddleRatio: number,
    colors: RGBColor[],
): string {
    let resultDelta = delta;
    let shadeA: RGBColor;
    let shadeB: RGBColor;
    if (gradientMode === GradientType.THREE_POINT) {
        if (delta >= rangeMiddleRatio) {
            // ../technotes.md -> utils/colors-helpers p1
            resultDelta = delta === 1 ? delta : delta - rangeMiddleRatio;
            shadeA = colors[1];
            shadeB = colors[2];
        } else {
            shadeA = colors[0];
            shadeB = colors[1];
        }
    } else {
        shadeA = colors[0];
        shadeB = colors[1];
    }

    const red = Math.floor((shadeB.red - shadeA.red) * resultDelta + shadeA.red);
    const green = Math.floor((shadeB.green - shadeA.green) * resultDelta + shadeA.green);
    const blue = Math.floor((shadeB.blue - shadeA.blue) * resultDelta + shadeA.blue);

    return `rgb(${red}, ${green}, ${blue})`;
}

export function getRangeDelta(
    colorValue: number | null,
    min: number,
    range: number,
): number | null {
    let delta = typeof colorValue === 'number' ? (colorValue - min) / range : null;

    if (delta !== null) {
        if (delta > 1) {
            delta = 1;
        } else if (delta < 0) {
            delta = 0;
        }
    }

    return delta;
}

export const isPlaceholderSupportsAxisMode = (
    placeholderId: PlaceholderId,
    visualizationId: WizardVisualizationId,
) => {
    const isReversedXYPlaceholderVisualization =
        visualizationId === WizardVisualizationId.Bar ||
        visualizationId === WizardVisualizationId.Bar100p;
    const isXPlaceholder =
        placeholderId === PlaceholderId.X && !isReversedXYPlaceholderVisualization;

    const isReversedYPlaceholder =
        placeholderId === PlaceholderId.Y && isReversedXYPlaceholderVisualization;

    return isXPlaceholder || isReversedYPlaceholder;
};

export const isAllAxisModesAvailable = (field?: {data_type: string}) => {
    return isNumberField(field) || isDateField(field);
};

export function doesSortingAffectAxisMode(visualizationId: WizardVisualizationId) {
    return ![
        WizardVisualizationId.Area,
        WizardVisualizationId.Area100p,
        WizardVisualizationId.Column100p,
        WizardVisualizationId.Bar100p,
        WizardVisualizationId.BarYD3,
        WizardVisualizationId.BarY100pD3,
    ].includes(visualizationId);
}

export enum AxisModeDisabledReason {
    FieldType = 'fieldType',
    HasSortingField = 'sorting',
    Unknown = 'unknown',
}

export function isContinuousAxisModeDisabled(args: {
    field: {guid: string; data_type: string};
    axisSettings: {disableAxisMode?: boolean} | undefined;
    visualizationId: WizardVisualizationId;
    sort: ServerSort[];
}) {
    const {field, axisSettings, visualizationId, sort} = args;

    if (!isAllAxisModesAvailable(field)) {
        return AxisModeDisabledReason.FieldType;
    }

    const disableDueToSorting =
        doesSortingAffectAxisMode(visualizationId) && sort.some(isMeasureField);
    if (disableDueToSorting) {
        return AxisModeDisabledReason.HasSortingField;
    }

    if (axisSettings?.disableAxisMode) {
        return AxisModeDisabledReason.Unknown;
    }

    return null;
}
