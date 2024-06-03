import React from 'react';

import {useSelector} from 'react-redux';
import type {ClientChartsConfig, Field, TableFieldBackgroundSettings} from 'shared';
import {PlaceholderId, isMeasureField, isMeasureName} from 'shared';

import {selectMeasures} from '../../../../../../selectors/dataset';
import {selectSort} from '../../../../../../selectors/visualization';

import {getChartFields, isSelectedFieldMeasureName} from './helpers';

type UseBackgroundSettingsArgs = {
    state: TableFieldBackgroundSettings;
    visualization: ClientChartsConfig['visualization'];
    currentField: Field;

    placeholderId: PlaceholderId;
};

export const useBackgroundSettings = ({
    visualization,
    state,
    currentField,
    placeholderId,
}: UseBackgroundSettingsArgs) => {
    const sortItems = useSelector(selectSort);

    const datasetMeasures = useSelector(selectMeasures);

    const {chartFields, datasetFieldsMap} = React.useMemo(() => {
        return getChartFields(visualization, placeholderId, currentField, {
            datasetMeasures,
            datasetDimensions: [...sortItems],
        });
    }, [visualization, placeholderId, currentField, datasetMeasures, sortItems]);

    const field =
        chartFields.find(
            (chartField) =>
                chartField.guid === state.colorFieldGuid ||
                isSelectedFieldMeasureName(chartField, state.colorFieldGuid),
        ) || currentField;

    const extraDistincts: string[] = React.useMemo(() => {
        let measures: string[] = [];
        if (isMeasureName(field) && visualization) {
            const measurePlaceholder = visualization.placeholders.find(
                (placeholder) => placeholder.id === PlaceholderId.Measures,
            );
            if (measurePlaceholder) {
                measures = isMeasureField(currentField)
                    ? [currentField.fakeTitle || currentField.title]
                    : measurePlaceholder.items.map((item) => item.fakeTitle || item.title);
            }
        }

        return measures;
    }, [currentField, field, visualization]);

    return {datasetFieldsMap, field, chartFields, extraDistincts};
};
