import type {SelectOption} from '@gravity-ui/uikit';
import type {Field as TField} from 'shared';
import {DATASET_FIELD_TYPES, Feature, PlaceholderId, WizardVisualizationId} from 'shared';
import Utils from 'ui/utils';

export const getDialogFieldSelectItems = ({
    arr,
    generateTitle,
    generateValue,
    generateQa,
}: {
    arr: string[];
    generateTitle: (value: string) => string;
    generateValue?: (value: string) => string;
    generateQa?: (value: string) => string;
}): SelectOption[] => {
    return arr.map((value): SelectOption => {
        const selectorValue = generateValue ? generateValue(value) : value;
        const qa = generateQa ? generateQa(value) : value;
        return {
            value: selectorValue,
            content: generateTitle(value),
            qa,
        };
    });
};

export const isOneOfPropChanged = <T extends Record<string, any>>(
    obj1: T,
    obj2: T,
    props: (keyof T)[],
) => {
    return props.some((key) => obj1[key] !== obj2[key]);
};

export const getFormattingDataType = (item: TField, cast: DATASET_FIELD_TYPES | undefined) => {
    const data_type = item.data_type as unknown as DATASET_FIELD_TYPES;

    if (cast && Object.values(DATASET_FIELD_TYPES).includes(data_type) && cast !== data_type) {
        return cast as unknown as DATASET_FIELD_TYPES;
    }

    return item.data_type;
};

export function canUseStringAsMarkdown(
    visualizationId: WizardVisualizationId,
    placeholderId: PlaceholderId | undefined,
) {
    switch (visualizationId) {
        case WizardVisualizationId.Scatter: {
            const possiblePlaceholders: PlaceholderId[] = [
                PlaceholderId.X,
                PlaceholderId.Y,
                PlaceholderId.Points,
                PlaceholderId.Colors,
                PlaceholderId.Shapes,
            ];
            return placeholderId && possiblePlaceholders.includes(placeholderId);
        }
        case WizardVisualizationId.Treemap:
        case WizardVisualizationId.TreemapD3: {
            const possiblePlaceholders: PlaceholderId[] = [PlaceholderId.Dimensions];
            return placeholderId && possiblePlaceholders.includes(placeholderId);
        }
        case WizardVisualizationId.Geopoint:
        case WizardVisualizationId.GeopointWithCluster:
        case WizardVisualizationId.Geopolygon: {
            const possiblePlaceholders: PlaceholderId[] = [PlaceholderId.Tooltips];
            return placeholderId && possiblePlaceholders.includes(placeholderId);
        }
        case WizardVisualizationId.Line:
        case WizardVisualizationId.Area:
        case WizardVisualizationId.Area100p:
        case WizardVisualizationId.Column:
        case WizardVisualizationId.Column100p:
        case WizardVisualizationId.Bar:
        case WizardVisualizationId.Bar100p:
        case WizardVisualizationId.Pie: {
            const possiblePlaceholders: PlaceholderId[] = [PlaceholderId.Labels];
            return placeholderId && possiblePlaceholders.includes(placeholderId);
        }
        default:
            return false;
    }
}

export function canUseStringAsHtml(
    _visualizationId: WizardVisualizationId,
    _placeholderId: PlaceholderId | undefined,
) {
    return Utils.isEnabledFeature(Feature.HtmlInWizard);
}
