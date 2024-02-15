import intersection from 'lodash/intersection';
import {StringParams} from 'shared';
import {DASH_WIDGET_TYPES} from 'ui/units/dash/modules/constants';

import {FULL_RELATIONS, INPUT_RELATIONS, OUTPUT_RELATIONS, RELATION_TYPES} from '../constants';
import {
    DashkitMetaDataItem,
    DashkitMetaDataItemNoRelations,
    Datasets,
    RelationType,
    RelationsData,
} from '../types';

import {getMappedConnectedControlField} from './helpersDatasets';

export const isControl = (item: DashkitMetaDataItem | DashkitMetaDataItemNoRelations) =>
    item.type === DASH_WIDGET_TYPES.CONTROL;

export const isManualControl = (item: DashkitMetaDataItemNoRelations) =>
    isControl(item) && !item.datasetId && !item.chartId;

export const isDatasetControl = (item: DashkitMetaDataItemNoRelations) =>
    isControl(item) && item.datasetId;

export const isExternalControl = (item: DashkitMetaDataItemNoRelations) =>
    isControl(item) && item.chartId;

export const hasCommonUsedParamsWithDefaults = (
    widgetParams: StringParams,
    usedParams: string[],
) => {
    return Boolean(intersection(Object.keys(widgetParams || {}), usedParams).length);
};

const hasCommonDefaultsWithDefaults = (
    widgetParams: StringParams,
    itemWidgetParams: StringParams,
) => {
    return Boolean(
        intersection(Object.keys(widgetParams || {}), Object.keys(itemWidgetParams || {})).length,
    );
};

/**
 * For current widget == control and widget in line == control
 */
export const getControlToControlRelations = ({
    byUsedParams,
    relationType,
    relations,
    widget,
    row,
    datasets,
}: {
    byUsedParams: string[];
    relationType: string;
    relations: Omit<RelationsData, 'type' | 'available' | 'byFields' | 'forceAddAlias'>;
    widget: DashkitMetaDataItemNoRelations;
    row: DashkitMetaDataItemNoRelations;
    datasets: Datasets;
}) => {
    let newRelationType = relationType;
    let availableRelations = [] as string[];
    let byFields = [] as string[];
    let hasDataset = false;
    let forceAddAlias = false;
    let hasRelation = false;

    if (isManualControl(widget) && isManualControl(row)) {
        if (relations.byAliases.length || byUsedParams.length) {
            newRelationType = relationType || RELATION_TYPES.both;
        } else {
            newRelationType = RELATION_TYPES.ignore;
            forceAddAlias = true;
        }
        availableRelations = [...FULL_RELATIONS];
    } else if (
        (isDatasetControl(widget) && isManualControl(row)) ||
        (isDatasetControl(row) && isManualControl(widget))
    ) {
        if (relations.byAliases.length || byUsedParams.length) {
            newRelationType = relationType || RELATION_TYPES.both;
        } else {
            newRelationType = RELATION_TYPES.ignore;
            forceAddAlias = true;
        }
        availableRelations = [...FULL_RELATIONS];

        hasDataset = true;
        const fields =
            getMappedConnectedControlField({
                item: isDatasetControl(widget) ? widget : row,
                datasets,
            }) || [];
        byFields = fields || byUsedParams;
    } else if (
        (isManualControl(widget) && isExternalControl(row)) ||
        (isManualControl(row) && isExternalControl(widget))
    ) {
        if (relations.byAliases.length) {
            newRelationType = relationType || RELATION_TYPES.both;
            availableRelations = [...FULL_RELATIONS];
        } else if (isExternalControl(widget)) {
            hasRelation = hasCommonUsedParamsWithDefaults(
                widget.widgetParams || {},
                row.usedParams || [],
            );
            if (hasRelation) {
                newRelationType = relationType || RELATION_TYPES.both;
                availableRelations = [...FULL_RELATIONS];
            } else {
                newRelationType = relationType || RELATION_TYPES.input;
                availableRelations = [...INPUT_RELATIONS];
            }
        } else {
            hasRelation = hasCommonUsedParamsWithDefaults(
                row.widgetParams || {},
                widget.usedParams || [],
            );
            if (hasRelation) {
                newRelationType = relationType || RELATION_TYPES.both;
                availableRelations = [...FULL_RELATIONS];
            } else {
                newRelationType = relationType || RELATION_TYPES.output;
                availableRelations = [...OUTPUT_RELATIONS];
            }
        }
    } else if (isDatasetControl(widget) && isDatasetControl(row)) {
        if (relations.byAliases.length) {
            newRelationType = relationType || RELATION_TYPES.both;
        } else if (widget.datasetId === row.datasetId) {
            newRelationType = relationType || RELATION_TYPES.both;
            byFields = [];
            hasDataset = true;
        } else {
            const commonUsedParamsFields = intersection(
                widget.usedParams || [],
                row.usedParams || [],
            );
            if (commonUsedParamsFields.length) {
                newRelationType = relationType || RELATION_TYPES.both;
                byFields = [];
            } else {
                newRelationType = RELATION_TYPES.ignore;
                forceAddAlias = true;
            }
        }
        availableRelations = [...FULL_RELATIONS];
    } else if (
        (isDatasetControl(widget) && isExternalControl(row)) ||
        (isDatasetControl(row) && isExternalControl(widget))
    ) {
        if (relations.byAliases.length) {
            newRelationType = relationType || RELATION_TYPES.both;
            availableRelations = [...FULL_RELATIONS];
        } else if (isExternalControl(widget)) {
            hasRelation = hasCommonUsedParamsWithDefaults(
                widget.widgetParams || {},
                row.usedParams || [],
            );
            if (hasRelation) {
                newRelationType = relationType || RELATION_TYPES.both;
                availableRelations = [...FULL_RELATIONS];
                hasDataset = true;
                byFields =
                    getMappedConnectedControlField({
                        item: row,
                        datasets,
                    }) || [];
            } else {
                newRelationType = relationType || RELATION_TYPES.input;
                availableRelations = [...INPUT_RELATIONS];
            }
        } else {
            hasRelation = hasCommonUsedParamsWithDefaults(
                row.widgetParams || {},
                widget.usedParams || [],
            );
            if (hasRelation) {
                newRelationType = relationType || RELATION_TYPES.both;
                availableRelations = [...FULL_RELATIONS];
                hasDataset = true;
                byFields =
                    getMappedConnectedControlField({
                        item: widget,
                        datasets,
                    }) || [];
            } else {
                newRelationType = relationType || RELATION_TYPES.output;
                availableRelations = [...OUTPUT_RELATIONS];
            }
        }
    } else if (isExternalControl(widget) && isExternalControl(row)) {
        hasRelation = hasCommonDefaultsWithDefaults(
            row.widgetParams || {},
            widget.widgetParams || {},
        );
        if (relations.byAliases.length || hasRelation) {
            newRelationType = RELATION_TYPES.both;
            availableRelations = [...FULL_RELATIONS];
        } else if (Object.keys(widget.widgetParams || {}).length) {
            newRelationType = RELATION_TYPES.output;
            availableRelations = [...OUTPUT_RELATIONS];
        } else if (Object.keys(row.widgetParams || {}).length) {
            newRelationType = RELATION_TYPES.input;
            availableRelations = [...OUTPUT_RELATIONS];
        } else {
            newRelationType = RELATION_TYPES.ignore;
            availableRelations = [...FULL_RELATIONS];
            forceAddAlias = true;
        }
    }

    return {
        relationType: newRelationType as RelationType,
        availableRelations: availableRelations as RelationType[],
        byFields,
        hasDataset,
        forceAddAlias,
        hasRelation,
    };
};
