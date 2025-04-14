import intersection from 'lodash/intersection';
import {getDefaultTypeByIgnore} from 'ui/components/DialogRelations/hooks/helpers';
import type {FilteringWidgetType} from 'ui/units/dash/modules/constants';
import {DASH_FILTERING_CHARTS_WIDGET_TYPES} from 'ui/units/dash/modules/constants';

import {FULL_RELATIONS, INPUT_RELATIONS, OUTPUT_RELATIONS, RELATION_TYPES} from '../constants';
import type {DashkitMetaDataItemNoRelations, Datasets, RelationType, RelationsData} from '../types';

import {
    hasCommonUsedParamsWithDefaults,
    isControl,
    isDatasetControl,
    isExternalControl,
} from './helpersControls';
import {getMappedConnectedControlField} from './helpersDatasets';

export const isEditorChart = (item: DashkitMetaDataItemNoRelations) =>
    item.isEditor && !isControl(item) && item.chartId;

/**
 * For current widget == control and widget in line == chart
 */
const getControlToChartRelations = ({
    relationType,
    widget,
    row,
    relations,
    datasets,
}: {
    relationType: string;
    widget: DashkitMetaDataItemNoRelations;
    row: DashkitMetaDataItemNoRelations;
    relations: Omit<RelationsData, 'type' | 'available' | 'byFields' | 'forceAddAlias'>;
    datasets: Datasets;
}) => {
    let availableRelations = [...OUTPUT_RELATIONS];
    let newRelationType = relationType;
    const isItemFilteringChart = Boolean(
        (row.type as FilteringWidgetType) in DASH_FILTERING_CHARTS_WIDGET_TYPES &&
            row.enableFiltering,
    );
    let hasRelation = false;
    let forceAddAlias = false;
    let byFields = [] as string[];

    if (relations.byAliases.length) {
        if (isItemFilteringChart) {
            newRelationType = relationType || getDefaultTypeByIgnore(relations);
            availableRelations = [...FULL_RELATIONS];
        } else {
            newRelationType = relationType || RELATION_TYPES.output;
            if (!OUTPUT_RELATIONS.includes(newRelationType)) {
                newRelationType = RELATION_TYPES.output;
            }
            availableRelations = [...OUTPUT_RELATIONS];
        }
    } else if (isExternalControl(widget)) {
        hasRelation = hasCommonUsedParamsWithDefaults(
            widget.widgetParams || {},
            row.usedParams || [],
        );
        if (hasRelation) {
            newRelationType = relationType || RELATION_TYPES.output;
        } else if (isEditorChart(row)) {
            newRelationType = relationType || RELATION_TYPES.unknown;
            forceAddAlias = true;
        } else {
            newRelationType = RELATION_TYPES.ignore;
        }
        if (isItemFilteringChart) {
            availableRelations = [...FULL_RELATIONS];
        } else {
            if (!OUTPUT_RELATIONS.includes(newRelationType)) {
                newRelationType = RELATION_TYPES.output;
            }
            availableRelations = [...OUTPUT_RELATIONS];
        }
    } else {
        const commonUsedParamsFields = intersection(widget.usedParams || [], row.usedParams || []);
        if (commonUsedParamsFields.length) {
            newRelationType = relationType || RELATION_TYPES.output;

            if (isDatasetControl(widget)) {
                byFields = getMappedConnectedControlField({item: widget, datasets}) || [];
            }

            if (isItemFilteringChart) {
                availableRelations = [...FULL_RELATIONS];
            } else {
                if (!OUTPUT_RELATIONS.includes(newRelationType)) {
                    newRelationType = RELATION_TYPES.output;
                }
                availableRelations = [...OUTPUT_RELATIONS];
            }
        } else {
            newRelationType = relationType || RELATION_TYPES.unknown;
            if (isItemFilteringChart) {
                availableRelations = [...FULL_RELATIONS];
            }
            forceAddAlias = true;
        }
    }

    return {
        relationType: newRelationType as RelationType,
        availableRelations,
        forceAddAlias,
        byFields,
    };
};

/**
 * For current widget == chart and widget in line == control
 */
const getChartToControlRelations = ({
    relationType,
    widget,
    row,
    relations,
    datasets,
}: {
    relationType: string;
    widget: DashkitMetaDataItemNoRelations;
    row: DashkitMetaDataItemNoRelations;
    relations: Omit<RelationsData, 'type' | 'available' | 'byFields' | 'forceAddAlias'>;
    datasets: Datasets;
}) => {
    let newRelationType = relationType;
    let availableRelations = [...INPUT_RELATIONS];
    const isCurrentFilteringChart = Boolean(
        (widget.type as FilteringWidgetType) in DASH_FILTERING_CHARTS_WIDGET_TYPES &&
            widget.enableFiltering,
    );
    let forceAddAlias = false;
    let hasRelation = false;
    let byFields = [] as string[];

    if (relations.byAliases.length) {
        if (isCurrentFilteringChart) {
            newRelationType = relationType || getDefaultTypeByIgnore(relations);
            availableRelations = [...FULL_RELATIONS];
        } else {
            newRelationType = relationType || RELATION_TYPES.input;
            if (!INPUT_RELATIONS.includes(newRelationType)) {
                newRelationType = RELATION_TYPES.input;
            }
            availableRelations = [...INPUT_RELATIONS];
        }
    } else if (isExternalControl(row)) {
        hasRelation = hasCommonUsedParamsWithDefaults(
            row.widgetParams || {},
            widget.usedParams || [],
        );
        if (hasRelation) {
            newRelationType = relationType || RELATION_TYPES.input;
        } else if (isEditorChart(widget)) {
            newRelationType = relationType || RELATION_TYPES.unknown;
            forceAddAlias = true;
        } else {
            newRelationType = RELATION_TYPES.ignore;
        }
        if (isCurrentFilteringChart) {
            availableRelations = [...FULL_RELATIONS];
        } else {
            if (!INPUT_RELATIONS.includes(newRelationType)) {
                newRelationType = RELATION_TYPES.input;
            }
            availableRelations = [...INPUT_RELATIONS];
        }
    } else {
        const commonUsedParamsFields = intersection(row.usedParams || [], widget.usedParams || []);
        if (commonUsedParamsFields.length) {
            newRelationType = relationType || RELATION_TYPES.input;

            if (isDatasetControl(row)) {
                byFields = getMappedConnectedControlField({item: row, datasets}) || [];
            }
            if (isCurrentFilteringChart) {
                availableRelations = [...FULL_RELATIONS];
            } else {
                if (!INPUT_RELATIONS.includes(newRelationType)) {
                    newRelationType = RELATION_TYPES.input;
                }
                availableRelations = [...INPUT_RELATIONS];
            }
        } else {
            newRelationType = relationType || RELATION_TYPES.unknown;
            if (isCurrentFilteringChart) {
                availableRelations = [...FULL_RELATIONS];
            }
            forceAddAlias = true;
        }
    }

    return {
        relationType: newRelationType as RelationType,
        availableRelations,
        forceAddAlias,
        byFields,
    };
};

export const getChartAndControlRelations = (args: {
    isCurrentControl: boolean;
    isItemControl: boolean;
    relationType: string;
    widget: DashkitMetaDataItemNoRelations;
    row: DashkitMetaDataItemNoRelations;
    relations: Omit<RelationsData, 'type' | 'available' | 'byFields' | 'forceAddAlias'>;
    datasets: Datasets;
}) => {
    const {isCurrentControl, isItemControl, relationType, row, widget, relations, datasets} = args;
    let availableRelations = [] as string[];
    let newRelationType = relationType;
    let forceAddAlias = false;
    let byFields = [] as string[];
    if (!isCurrentControl && isItemControl) {
        const chartToControlRelation = getChartToControlRelations({
            relationType,
            widget,
            row,
            relations,
            datasets,
        });
        newRelationType = chartToControlRelation.relationType;
        availableRelations = chartToControlRelation.availableRelations;
        forceAddAlias = chartToControlRelation.forceAddAlias;
        byFields = chartToControlRelation.byFields;
    } else if (!isItemControl && isCurrentControl) {
        const controlToChartRelation = getControlToChartRelations({
            relationType,
            widget,
            row,
            relations,
            datasets,
        });
        newRelationType = controlToChartRelation.relationType;
        availableRelations = controlToChartRelation.availableRelations;
        forceAddAlias = controlToChartRelation.forceAddAlias;
        byFields = controlToChartRelation.byFields;
    }

    return {
        relationType: newRelationType,
        availableRelations,
        forceAddAlias,
        byFields,
    };
};

/**
 * For current widget == chart and widget in line == chart
 */
export const getChartToChartRelations = ({
    widget,
    row,
    relationType,
    relations,
}: {
    widget: DashkitMetaDataItemNoRelations;
    row: DashkitMetaDataItemNoRelations;
    relationType: string;
    relations: Omit<RelationsData, 'type' | 'available' | 'byFields' | 'forceAddAlias'>;
}) => {
    const isCurrentFilteringChart = Boolean(
        (widget.type as FilteringWidgetType) in DASH_FILTERING_CHARTS_WIDGET_TYPES &&
            widget.enableFiltering,
    );
    const isItemFilteringChart = Boolean(
        (row.type as FilteringWidgetType) in DASH_FILTERING_CHARTS_WIDGET_TYPES &&
            row.enableFiltering,
    );
    let availableRelations = [] as string[];
    let hasDataset = false;
    let byFields = [] as string[];
    let newRelationType = relationType || RELATION_TYPES.ignore;

    if (isCurrentFilteringChart && !isItemFilteringChart) {
        newRelationType = relationType || RELATION_TYPES.output;
        if (!OUTPUT_RELATIONS.includes(newRelationType)) {
            newRelationType = RELATION_TYPES.output;
        }
        availableRelations = [...OUTPUT_RELATIONS];
        if (widget.isWizard) {
            hasDataset = true;
            byFields = [];
        }
    } else if (!isCurrentFilteringChart && isItemFilteringChart) {
        newRelationType = relationType || RELATION_TYPES.input;
        if (!INPUT_RELATIONS.includes(newRelationType)) {
            newRelationType = RELATION_TYPES.input;
        }
        availableRelations.push(RELATION_TYPES.input, RELATION_TYPES.ignore);
        if (row.isWizard) {
            hasDataset = true;
            byFields = [];
        }
    } else if (isCurrentFilteringChart && isItemFilteringChart) {
        newRelationType = relationType || getDefaultTypeByIgnore(relations);
        availableRelations = [...FULL_RELATIONS];
        if (widget.isWizard || row.isWizard) {
            hasDataset = true;
            byFields = [];
        }
    }

    return {
        relationType: newRelationType as RelationType,
        availableRelations,
        hasDataset,
        byFields,
    };
};
