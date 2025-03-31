import cloneDeep from 'lodash/cloneDeep';

import type {Field, ServerVisualization} from '../../../../../../shared';
import {PlaceholderId, WizardVisualizationId} from '../../../../../../shared';
import type {QlConfigResultEntryMetadataDataColumnOrGroup} from '../../../../../../shared/types/config/ql';

import {
    autofillLineVisualization,
    autofillMetricVisualization,
    autofillPieVisualization,
    autofillScatterVisualization,
    autofillTableVisualization,
    autofillTreemapVisualization,
} from './autofill-helpers';
import {
    migrateLineVisualization,
    migrateMetricVisualization,
    migratePieVisualization,
    migrateTableVisualization,
} from './migrate-helpers';

export const migrateOrAutofillVisualization = ({
    visualization: originalVisualization,
    fields,
    rows,
    order,
    colors: originalColors,
    distinctsMap,
}: {
    visualization: ServerVisualization;
    fields: Field[];
    rows: string[][];
    order?: QlConfigResultEntryMetadataDataColumnOrGroup[] | null;
    colors?: Field[];
    // distincts are optional and is used only for visualization which supports multiple color fields in section
    distinctsMap?: Record<string, string[]>;
}) => {
    const {id: visualizationId} = originalVisualization;

    const newVisualization = cloneDeep(originalVisualization);
    let newColors: Field[] = originalColors || [];

    // Logic of autofill depends on visualization id
    if (
        new Set([
            WizardVisualizationId.Line,
            WizardVisualizationId.Area,
            WizardVisualizationId.Area100p,
            WizardVisualizationId.Column,
            WizardVisualizationId.Column100p,
            WizardVisualizationId.Bar,
            WizardVisualizationId.Bar100p,
            WizardVisualizationId.BarXD3,
        ]).has(visualizationId as WizardVisualizationId)
    ) {
        if (order) {
            // Order is set, so we need to migrate old order to new structure
            const {
                xFields,
                yFields,
                colors: migratedColors,
            } = migrateLineVisualization({
                order,
                fields,
                rows,
            });

            newVisualization.placeholders[0].items = xFields;
            newVisualization.placeholders[1].items = yFields;

            newColors = migratedColors;
        } else {
            // Old order was not set, so we can do autofill
            const {xFields, yFields, colors} = autofillLineVisualization({
                fields,
                distinctsMap,
            });

            newVisualization.placeholders[0].items = xFields;
            newVisualization.placeholders[1].items = yFields;

            if (colors) {
                newColors = colors;
            }
        }
    } else if (
        [WizardVisualizationId.Scatter, WizardVisualizationId.ScatterD3].includes(
            visualizationId as WizardVisualizationId,
        )
    ) {
        // Scatter visualization was not present in older ql charts,
        // so we don't need to migrate older order
        const {xFields, yFields, pointsFields} = autofillScatterVisualization({fields});

        newVisualization.placeholders[0].items = xFields;
        newVisualization.placeholders[1].items = yFields;
        newVisualization.placeholders[2].items = pointsFields;
    } else if (
        new Set([
            WizardVisualizationId.Pie,
            WizardVisualizationId.Pie3D,
            WizardVisualizationId.Donut,
            WizardVisualizationId.PieD3,
            WizardVisualizationId.DonutD3,
        ]).has(visualizationId as WizardVisualizationId)
    ) {
        // Checking if order is set (from older versions of ql charts)
        const hasOrder = order && order.length > 0;
        const {colorFields, measureFields} = hasOrder
            ? // Order is set, so we need to migrate old order to new structure
              migratePieVisualization({
                  order: order,
                  fields,
              })
            : // Old order was not set, so we can do autofill
              autofillPieVisualization({
                  fields,
              });

        const colorsPlaceholder = newVisualization.placeholders.find(
            (p) => p.id === PlaceholderId.Colors,
        );
        if (colorsPlaceholder) {
            colorsPlaceholder.items = colorFields;
        }

        const measurePlaceholder = newVisualization.placeholders.find(
            (p) => p.id === PlaceholderId.Measures,
        );
        if (measurePlaceholder) {
            measurePlaceholder.items = measureFields;
        }
    } else if (visualizationId === WizardVisualizationId.Metric) {
        // Checking if order is set (from older versions of ql charts)
        if (order && order.length > 0) {
            // Order is set, so we need to migrate old order to new structure
            const {measureFields} = migrateMetricVisualization({
                order: order,
                fields,
            });

            newVisualization.placeholders[0].items = measureFields;
        } else {
            // Old order was not set, so we can do autofill
            const {measureFields} = autofillMetricVisualization({
                fields,
            });

            newVisualization.placeholders[0].items = measureFields;
        }
    } else if (
        visualizationId === WizardVisualizationId.Treemap ||
        visualizationId === WizardVisualizationId.TreemapD3
    ) {
        const {dimensionFields, sizeFields} = autofillTreemapVisualization({
            fields,
        });

        newVisualization.placeholders[0].items = dimensionFields;
        newVisualization.placeholders[1].items = sizeFields;
    } else if (visualizationId === WizardVisualizationId.FlatTable) {
        // Checking if order is set (from older versions of ql charts)
        if (order && order.length > 0) {
            // Order is set, so we need to migrate old order to new structure
            const {columnFields} = migrateTableVisualization({
                order: order,
                fields,
            });

            newVisualization.placeholders[0].items = columnFields;
        } else {
            // Old order was not set, so we can do autofill
            const {columnFields} = autofillTableVisualization({fields});

            newVisualization.placeholders[0].items = columnFields;
        }
    }

    return {
        colors: newColors,
        visualization: newVisualization,
    };
};

export const mapItems = ({items, fields}: {items: Field[]; fields: Field[]}) => {
    return items.map((item, i) => {
        const exactField = fields.find(
            (field) => field.guid === item.guid && field.data_type === item.data_type,
        );

        // Field does not need to be mapped
        if (exactField) {
            delete item.conflict;

            return item;
        }

        const matchingField = fields.find((field) => field.title === item.title);

        // We need to use new field in placeholder
        if (matchingField) {
            if (item.data_type === matchingField.data_type) {
                // eslint-disable-next-line no-param-reassign
                return {
                    ...items[i],
                    ...matchingField,
                };
            } else {
                // eslint-disable-next-line no-param-reassign
                return matchingField;
            }
        }

        return {
            ...item,
            conflict: 'not-existing-ql',
        };
    });
};

export const mapVisualizationPlaceholdersItems = ({
    visualization,
    fields,
}: {
    visualization: ServerVisualization;
    fields: Field[];
}) => {
    const newVisualization = cloneDeep(visualization);

    // Visualization is not empty, we may need to map some new fields to existing fields in placeholders
    newVisualization.placeholders.forEach((placeholder) => {
        placeholder.items = mapItems({items: placeholder.items as Field[], fields});
    });

    return newVisualization;
};
