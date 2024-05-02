import React from 'react';

import {SelectOption} from '@gravity-ui/uikit';
import uniqBy from 'lodash/uniqBy';
import {
    ClientChartsConfig,
    Field,
    Placeholder,
    PlaceholderId,
    WizardVisualizationId,
    getFakeTitleOrTitle,
    isDimensionField,
    isMeasureField,
    isMeasureName,
    isNumberField,
    isPseudoField,
} from 'shared';
import {DataTypeIcon} from 'ui';

import {isFieldVisible} from '../../../../../../utils/wizard';
import {VisualizationItemTitleWithAggregation} from '../../../../../VisualizationItemTitleWithAggregation/VisualizationItemTitleWithAggregation';
import {PLACEHOLDERS_WITH_BACKGROUND_SETTINGS} from '../../../utils/backgroundSettings';

export const getPlaceholderWithBackgroundSettingsFields = (
    visualization: ClientChartsConfig['visualization'],
    placeholderId: PlaceholderId,
): Field[] => {
    const placeholders = visualization.placeholders;
    const placeholdersWithBackgroundSettings: Placeholder[] = [];

    if (
        placeholderId === PlaceholderId.PivotTableColumns ||
        placeholderId === PlaceholderId.PivotTableRows
    ) {
        const currentPlaceholder = placeholders.find((p) => p.id === placeholderId);
        if (currentPlaceholder) {
            placeholdersWithBackgroundSettings.push(currentPlaceholder);
        }
    } else {
        placeholdersWithBackgroundSettings.push(
            ...placeholders.filter(
                (placeholder) =>
                    PLACEHOLDERS_WITH_BACKGROUND_SETTINGS[placeholder.id as PlaceholderId],
            ),
        );
    }
    if (!placeholdersWithBackgroundSettings.length) {
        return [];
    }

    return placeholdersWithBackgroundSettings.reduce((acc, placeholder) => {
        if (placeholder.items) {
            acc.push(...placeholder.items);
        }
        return acc;
    }, [] as Field[]);
};

export const splitFieldsByType = (fields: Field[], shouldAddPseudoFields: boolean) => {
    return fields.reduce(
        (acc, field) => {
            if (isMeasureField(field)) {
                return {
                    ...acc,
                    measures: [...acc.measures, field],
                };
            } else if (isDimensionField(field) || (shouldAddPseudoFields && isMeasureName(field))) {
                return {
                    ...acc,
                    dimensions: [...acc.dimensions, field],
                };
            }

            return acc;
        },
        {measures: [], dimensions: []} as {
            measures: Field[];
            dimensions: Field[];
        },
    );
};

export const getBackgroundColorFieldSelectorItems = (
    fields: Field[],
    datasetFieldsMap: Record<string, boolean>,
): SelectOption<{icon: JSX.Element}>[] => {
    return fields.map((item: Field): SelectOption<{icon: JSX.Element}> => {
        return {
            value: item.guid || item.title,
            content:
                item.aggregation === 'none' ||
                datasetFieldsMap[item.guid] ||
                isPseudoField(item) ? (
                    getFakeTitleOrTitle(item)
                ) : (
                    <VisualizationItemTitleWithAggregation
                        field={item}
                        isDisabled={Boolean(item.conflict || item.disabled)}
                    />
                ),
            data: {icon: <DataTypeIcon dataType={item.data_type} fieldType={item.type} />},
        };
    });
};

export const getChartFields = (
    visualization: ClientChartsConfig['visualization'],
    placeholderId: PlaceholderId,
    currentField: Field,
    additionalFields: {datasetMeasures: Field[]; datasetDimensions: Field[]},
): {chartFields: Field[]; datasetFieldsMap: Record<string, boolean>} => {
    const fields = getPlaceholderWithBackgroundSettingsFields(visualization, placeholderId);

    const isPivotTable = visualization.id === WizardVisualizationId.PivotTable;
    const isDimensionsPlaceholders =
        placeholderId === PlaceholderId.PivotTableColumns ||
        placeholderId === PlaceholderId.PivotTableRows;

    const {measures, dimensions} = splitFieldsByType(fields, isPivotTable);

    const filteredMeasures = [...measures, ...additionalFields.datasetMeasures].filter(
        (field: Field) => isNumberField(field),
    );

    let preparedFields: Field[];

    if (isPivotTable && isDimensionsPlaceholders) {
        const currentFieldIndex = dimensions.findIndex(
            (field) => field.guid === currentField.guid || field.title === currentField.title,
        );
        preparedFields = [...dimensions.slice(0, currentFieldIndex + 1)];
    } else {
        preparedFields = [
            ...filteredMeasures,
            ...dimensions,
            ...additionalFields.datasetDimensions,
        ];
    }

    const uniqueFields = uniqBy<Field>(preparedFields, (field) => field.guid);

    const datasetFieldsMap = [
        ...additionalFields.datasetDimensions,
        ...additionalFields.datasetMeasures,
    ]
        .filter(isFieldVisible)
        .reduce(
            (acc, field) => {
                return {
                    ...acc,
                    [field.guid]: true,
                };
            },
            {} as Record<string, boolean>,
        );

    return {chartFields: uniqueFields, datasetFieldsMap};
};

export const isSelectedFieldMeasureName = (chartField: Field, guid: string) => {
    return isMeasureName(chartField) && chartField.title === guid;
};
