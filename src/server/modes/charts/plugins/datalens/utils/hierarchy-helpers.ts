import type {
    HierarchyField,
    ServerChartsConfig,
    ServerField,
    SharedData,
    StringParams,
} from '../../../../../../shared';
import {
    DATASET_FIELD_TYPES,
    PlaceholderId,
    WizardVisualizationId,
    isMarkupField,
} from '../../../../../../shared';

import {getDrillDownData} from './misc-helpers';

export function preprocessHierarchies({
    visualizationId,
    placeholders,
    params,
    sharedData,
    colors,
    shapes,
    segments,
}: {
    visualizationId: string;
    placeholders: ServerChartsConfig['visualization']['placeholders'];
    params: StringParams;
    sharedData: SharedData;
    colors: ServerChartsConfig['colors'];
    shapes: ServerChartsConfig['shapes'];
    segments: ServerChartsConfig['segments'];
}): void {
    const {drillDownFilters, drillDownLevel} = getDrillDownData(params);

    const hierarchiesWithParent: HierarchyWithParent[] = getHierarchiesTheirParent({
        placeholders: placeholders,
        colors: colors,
        shapes: shapes,
        segments,
    });

    if (visualizationId !== 'flatTable') {
        hierarchiesWithParent.forEach(({hierarchy}) => {
            removeMarkupFieldsFromHierarchy(hierarchy);
        });
    }

    hierarchiesWithParent.forEach(
        ({hierarchy, hierachyContainer, hierarchyIndex, hierarchyContainerId}, index) => {
            if (!index) {
                sharedData.drillDownData = {
                    breadcrumbs: hierarchy.fields.map((el) => el.title),
                    filters: drillDownFilters || hierarchy.fields.map(() => ''),
                    level: drillDownLevel,
                    fields: hierarchy.fields,
                    isColorDrillDown: hierachyContainer === colors || hierachyContainer === shapes,
                };
            } else if (sharedData.drillDownData) {
                const notSplitByColors: string[] = [
                    WizardVisualizationId.Pie,
                    WizardVisualizationId.Donut,
                    WizardVisualizationId.Treemap,
                ];
                sharedData.drillDownData.isColorDrillDown =
                    !notSplitByColors.includes(visualizationId) &&
                    (sharedData.drillDownData.isColorDrillDown ||
                        hierachyContainer === colors ||
                        hierachyContainer === shapes ||
                        hierachyContainer === segments);
            }

            const hierarchyFieldIndex =
                hierarchy.fields.length < drillDownLevel
                    ? hierarchy.fields.length - 1
                    : drillDownLevel;
            hierachyContainer[hierarchyIndex] = hierarchy.fields[hierarchyFieldIndex];

            if (!sharedData.metaHierarchy) {
                sharedData.metaHierarchy = {};
            }

            sharedData.metaHierarchy[hierarchyContainerId] = {hierarchyIndex, hierarchyFieldIndex};
        },
    );
}

const isFieldHierarchy = (field: {data_type: string}) =>
    field.data_type === DATASET_FIELD_TYPES.HIERARCHY;

type HierarchyWithParent = {
    hierarchy: HierarchyField;
    hierachyContainer: any;
    hierarchyIndex: number;

    hierarchyContainerId: PlaceholderId;
};

function getHierarchiesTheirParent({
    placeholders,
    colors,
    shapes,
    segments,
}: {
    placeholders: ServerChartsConfig['visualization']['placeholders'];
    colors: ServerChartsConfig['colors'];
    shapes: ServerChartsConfig['shapes'];
    segments: ServerChartsConfig['segments'];
}): HierarchyWithParent[] {
    const placeholderHierarchies = placeholders.reduce(
        (acc: HierarchyWithParent[], placeholder) => {
            placeholder.items.forEach((field: ServerField, index: number) => {
                if (isFieldHierarchy(field)) {
                    acc.push({
                        hierarchy: field as HierarchyField,
                        hierachyContainer: placeholder.items,
                        hierarchyIndex: index,
                        hierarchyContainerId: placeholder.id as PlaceholderId,
                    });
                }
            });

            return acc;
        },
        [],
    );

    const otherItems: [any[], PlaceholderId][] = [
        [colors, PlaceholderId.Colors],
        [shapes, PlaceholderId.Shapes],
        [segments, PlaceholderId.Segments],
    ];
    const otherItemHierarchies = otherItems.map(([item, placeholderId]: [any[], PlaceholderId]) => {
        return item.reduce((acc: HierarchyWithParent[], field, index) => {
            if (isFieldHierarchy(field)) {
                acc.push({
                    hierarchy: field as HierarchyField,
                    hierachyContainer: item,
                    hierarchyIndex: index,
                    hierarchyContainerId: placeholderId,
                });
            }

            return acc;
        }, []);
    });

    const flattenOtherItemHierarchies = ([] as HierarchyWithParent[]).concat(
        ...otherItemHierarchies,
    );

    return [...placeholderHierarchies, ...flattenOtherItemHierarchies];
}

function removeMarkupFieldsFromHierarchy(hierarchy: HierarchyField) {
    hierarchy.fields = hierarchy.fields.filter((field) => {
        return !isMarkupField(field);
    });
}
