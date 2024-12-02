/* eslint-disable complexity */
import intersection from 'lodash/intersection';
import type {StringParams} from 'shared';
import {getDefaultTypeByIgnore} from 'ui/components/DialogRelations/hooks/helpers';
import {DASH_WIDGET_TYPES} from 'ui/units/dash/modules/constants';

import {FULL_RELATIONS, INPUT_RELATIONS, OUTPUT_RELATIONS, RELATION_TYPES} from '../constants';
import type {
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
    const isIndirectRelation = !relations.isIgnored && !relations.isIgnoring;

    if (isManualControl(widget) && isManualControl(row)) {
        if (relations.byAliases.length || byUsedParams.length) {
            newRelationType = relationType || getDefaultTypeByIgnore(relations);
        } else {
            newRelationType = RELATION_TYPES.ignore;
            forceAddAlias = true;
        }
        availableRelations = [...FULL_RELATIONS];
    } else if (
        (isDatasetControl(widget) && isManualControl(row)) ||
        (isDatasetControl(row) && isManualControl(widget))
    ) {
        hasDataset = true;
        byFields =
            getMappedConnectedControlField({
                item: isDatasetControl(widget) ? widget : row,
                itemDefaults: isDatasetControl(widget) ? row.defaultParams : widget.defaultParams,
                datasets,
            }) || byUsedParams;

        if (relations.byAliases.length || byUsedParams.length) {
            newRelationType = relationType || getDefaultTypeByIgnore(relations);
        } else if (isIndirectRelation && relations.indirectAliases.length) {
            newRelationType = RELATION_TYPES.unknown;
            forceAddAlias = true;
        } else {
            newRelationType = RELATION_TYPES.ignore;
            forceAddAlias = true;
        }
        availableRelations = [...FULL_RELATIONS];
    } else if (
        (isManualControl(widget) && isExternalControl(row)) ||
        (isManualControl(row) && isExternalControl(widget))
    ) {
        if (relations.byAliases.length) {
            newRelationType = relationType || getDefaultTypeByIgnore(relations);
            availableRelations = [...FULL_RELATIONS];
        } else if (isExternalControl(widget)) {
            hasRelation = hasCommonUsedParamsWithDefaults(
                widget.widgetParams || {},
                row.usedParams || [],
            );
            if (hasRelation) {
                newRelationType = relationType || getDefaultTypeByIgnore(relations);
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
                newRelationType = relationType || getDefaultTypeByIgnore(relations);
                availableRelations = [...FULL_RELATIONS];
            } else {
                newRelationType = relationType || RELATION_TYPES.output;
                availableRelations = [...OUTPUT_RELATIONS];
            }
        }
    } else if (isDatasetControl(widget) && isDatasetControl(row)) {
        if (relations.byAliases.length) {
            newRelationType = relationType || getDefaultTypeByIgnore(relations);
        } else if (widget.datasetId === row.datasetId) {
            newRelationType = relationType || getDefaultTypeByIgnore(relations);
            byFields = [];
            hasDataset = true;
        } else {
            const commonUsedParamsFields = intersection(
                widget.usedParams || [],
                row.usedParams || [],
            );
            if (commonUsedParamsFields.length) {
                newRelationType = relationType || getDefaultTypeByIgnore(relations);
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
            newRelationType = relationType || getDefaultTypeByIgnore(relations);
            availableRelations = [...FULL_RELATIONS];
        } else if (isExternalControl(widget)) {
            hasRelation = hasCommonUsedParamsWithDefaults(
                widget.widgetParams || {},
                row.usedParams || [],
            );
            if (hasRelation) {
                newRelationType = relationType || getDefaultTypeByIgnore(relations);
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
                newRelationType = relationType || getDefaultTypeByIgnore(relations);
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

        const hasWigetParams = Object.keys(widget.widgetParams || {}).length;
        const hasRowParams = Object.keys(row.widgetParams || {}).length;

        // widgets have defaults & defaults have common or there are aliases
        if ((relations.byAliases.length && hasWigetParams && hasRowParams) || hasRelation) {
            newRelationType = relationType || getDefaultTypeByIgnore(relations);
            availableRelations = [...FULL_RELATIONS];
        }
        // widgets have defaults but not common & widgets don't have aliases
        else if (hasWigetParams && hasRowParams) {
            newRelationType = RELATION_TYPES.unknown;
            availableRelations = [...FULL_RELATIONS];
            forceAddAlias = true;
        }
        // widget has defaults but row doesn't, they may have aliases or not
        else if (hasWigetParams) {
            newRelationType = OUTPUT_RELATIONS.includes(relationType)
                ? relationType
                : RELATION_TYPES.output;
            availableRelations = [...OUTPUT_RELATIONS];
        }
        // row has defaults but widget doesn't, they may have aliases or not
        else if (hasRowParams) {
            newRelationType = INPUT_RELATIONS.includes(relationType)
                ? relationType
                : RELATION_TYPES.input;
            availableRelations = [...INPUT_RELATIONS];
        }
        // widget and row don't have defaults
        else {
            newRelationType = relationType || RELATION_TYPES.ignore;
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
