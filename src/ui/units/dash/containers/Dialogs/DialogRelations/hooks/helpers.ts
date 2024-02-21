import {DashKit} from '@gravity-ui/dashkit';
import intersection from 'lodash/intersection';
import {
    DashTabItem,
    DashTabItemControlSourceType,
    DashTabItemType,
    DashTabItemWidgetTab,
} from 'shared';
import {GetEntriesDatasetsFieldsResponse} from 'shared/schema';
import {DatasetsData} from 'ui/components/DashKit/plugins/types';
import {
    CONNECTION_KIND,
    DASH_ACCEPT_FILTERING_CHARTS_WIDGET_TYPES,
    DASH_FILTERING_CHARTS_WIDGET_TYPES,
    FilteringWidgetType,
} from 'ui/units/dash/modules/constants';

import {DEFAULT_FILTERS, FiltersTypes} from '../components/Filters/Filters';
import {DEFAULT_ALIAS_NAMESPACE, RELATION_TYPES} from '../constants';
import {
    AliasesData,
    ConnectionsData,
    DashMetaData,
    DashMetaDataNoRelations,
    DashkitMetaData,
    DashkitMetaDataItem,
    DashkitMetaDataItemNoRelations,
    Datasets,
    DatasetsListData,
    RelationType,
    RelationsData,
} from '../types';

import {getChartAndControlRelations, getChartToChartRelations} from './helpersChart';
import {getControlToControlRelations, isControl, isExternalControl} from './helpersControls';

export const getPreparedMetaData = (
    data: DashkitMetaData,
    dashkitData: DashKit | null,
): {
    metaData: Array<Omit<DashkitMetaDataItem, 'relations'>>;
    datasetsList: DatasetsListData;
    entriesList: Array<string>;
    controlsList: Array<string>;
} => {
    if (!data || !data?.length || !dashkitData) {
        return {
            metaData: [],
            datasetsList: {},
            entriesList: [],
            controlsList: [],
        };
    }

    const config = dashkitData.props.config;
    const configItems: Record<string, string> = {};
    config.items.forEach((item) => {
        configItems[item.id] = item.namespace;
    });

    const metaDataWithNamespaces: Array<Omit<DashkitMetaDataItem, 'relations'>> = data
        .reduce(
            (list: Array<Omit<DashkitMetaDataItem, 'relations'>>, item) => list.concat(item),
            [],
        )
        .map((item: Omit<DashkitMetaDataItem, 'relations'>) => ({
            ...item,
            namespace: configItems[item.layoutId] || '',
        }));

    const datasetsList: DatasetsListData = {};
    const controlsList: string[] = [];

    metaDataWithNamespaces.forEach((item) => {
        if (item.datasets?.length) {
            item.datasets.forEach((datasetItem) => {
                if (datasetItem.id) {
                    datasetsList[datasetItem.id] = {
                        fields: datasetItem.fieldsList,
                    };
                }
            });
        }
        if (
            item?.type === DashTabItemType.Control &&
            item?.sourceType !== DashTabItemControlSourceType.Dataset
        ) {
            controlsList.push(item?.widgetId);
        }
    });

    const entriesList = [
        ...new Set(metaDataWithNamespaces.map((item) => item.entryId).filter(Boolean)),
    ] as Array<string>;

    return {
        metaData: metaDataWithNamespaces,
        datasetsList,
        entriesList,
        controlsList,
    };
};

export const getMetaDataWithDatasetInfo = ({
    metaData,
    entriesDatasetsFields,
    datasetsList,
}: {
    metaData: Array<Omit<DashkitMetaDataItem, 'relations'>>;
    entriesDatasetsFields: GetEntriesDatasetsFieldsResponse;
    datasetsList: DatasetsListData;
}) => {
    const entriesWithDatasetsFields = entriesDatasetsFields.filter((item) =>
        Boolean(item.datasetFields?.length),
    );

    const res = (metaData || []).map((item) => {
        const itemWithDataset = {...item};
        const entryWithDataset = entriesWithDatasetsFields.find(
            (entryItem) => entryItem.entryId === itemWithDataset.entryId,
        );

        if (!entryWithDataset) {
            return itemWithDataset;
        }

        const {type, datasetId, datasetName, datasetFields} = entryWithDataset;
        const key = datasetId as string;

        if (datasetFields) {
            datasetsList[key] = datasetsList[key] || {};
            datasetsList[key].name = datasetName || '';
            datasetsList[key].fields = datasetFields.map((fieldItem) => ({
                title: fieldItem.title,
                guid: fieldItem.guid,
                dataType: fieldItem.dataType || fieldItem.type || '',
            }));
        }

        if (datasetId && datasetsList[datasetId]) {
            const fields = datasetsList[datasetId].fields;
            itemWithDataset.usedParams = Array.isArray(fields)
                ? fields.map((fieldItem) => fieldItem.guid)
                : Object.keys(fields);

            item.datasets
                ?.find(({id}) => id === datasetId)
                ?.fieldsList.forEach(({guid}) => {
                    if (!itemWithDataset.usedParams?.includes(guid)) {
                        itemWithDataset.usedParams?.push(guid);
                    }
                });

            itemWithDataset.datasets = (
                item.datasets?.length
                    ? item.datasets.map((datasetItem) => ({
                          ...datasetItem,
                          name: datasetsList[datasetItem.id]?.name,
                      }))
                    : [
                          {
                              id: datasetId,
                              fieldsList: datasetFields || [],
                              fields: datasetsList[key].fields,
                              name: datasetsList[key].name,
                          },
                      ]
            ) as Array<DatasetsData>; // TODO for multi-datasets, this did not work, you need to support in API to return a different format
            itemWithDataset.type = item.type || type; // TODO order from US type for graph
            itemWithDataset.enableFiltering = item.enableFiltering || false;
        }

        return itemWithDataset;
    });
    return res;
};

export const showInRelation = (
    currentItem: DashkitMetaDataItem,
    rowItem: DashkitMetaDataItemNoRelations,
) => {
    const isItemControl = isControl(rowItem);

    const isCurrentChartAcceptFilter =
        (currentItem.type as string) in DASH_ACCEPT_FILTERING_CHARTS_WIDGET_TYPES;
    const isItemChartAcceptFilter =
        (rowItem.type as string) in DASH_ACCEPT_FILTERING_CHARTS_WIDGET_TYPES;

    const isCurrentFilteringChart =
        (currentItem.type as FilteringWidgetType) in DASH_FILTERING_CHARTS_WIDGET_TYPES &&
        currentItem.enableFiltering;
    const isItemFilteringChart =
        (rowItem.type as FilteringWidgetType) in DASH_FILTERING_CHARTS_WIDGET_TYPES &&
        rowItem.enableFiltering;

    if (
        currentItem.loadError ||
        rowItem.loadError ||
        (currentItem.type === null && (currentItem.chartId || currentItem.datasetId)) ||
        (rowItem.type === null && (rowItem.chartId || rowItem.datasetId))
    ) {
        return true;
    } else if (isControl(currentItem)) {
        // if selected widget is control
        if (isItemControl || isItemChartAcceptFilter) {
            // if item widget is control or chart that can be filtered by control
            return true;
        }
    } else if (isCurrentFilteringChart) {
        // if selected widget is filtering chart

        if (isItemControl || isItemChartAcceptFilter) {
            return true;
        }
    } else if (isCurrentChartAcceptFilter) {
        // if selected widget is chart that can be filtered by control

        if (isItemControl || isItemFilteringChart) {
            return true;
        }
    }
    return false;
};

const getCurrentNamespaceItems = ({
    metaItems,
    widgetId,
}: {
    metaItems: DashMetaDataNoRelations;
    widgetId: DashkitMetaDataItem['widgetId'];
}) => {
    if (!metaItems || !metaItems.length) {
        return [];
    }

    if (!widgetId) {
        return metaItems || [];
    }
    return metaItems.filter(
        (item) => item.widgetId !== widgetId && item.namespace === DEFAULT_ALIAS_NAMESPACE,
    );
};

const getRelationTypeByIgnores = ({
    relations,
    loadError,
    hasRelation,
}: {
    relations: Omit<RelationsData, 'type' | 'available' | 'byFields' | 'forceAddAlias'>;
    loadError: boolean;
    hasRelation: boolean;
}) => {
    let relationType = '';
    if (relations.isIgnored && relations.isIgnoring) {
        relationType = RELATION_TYPES.ignore;
    } else if (loadError) {
        relationType = RELATION_TYPES.unknown;
    } else if (hasRelation) {
        if (relations.isIgnored || relations.isIgnoring) {
            relationType = relations.isIgnored ? RELATION_TYPES.output : RELATION_TYPES.input;
        } else {
            relationType = RELATION_TYPES.both;
        }
    }

    return relationType;
};

const getItemsRelations = ({
    relations,
    widgetMeta,
    row,
    datasets,
}: {
    relations: Omit<RelationsData, 'type' | 'available' | 'byFields' | 'forceAddAlias'>;
    widgetMeta: DashkitMetaDataItemNoRelations;
    row: DashkitMetaDataItemNoRelations;
    datasets: Datasets;
}) => {
    const isCurrentControl = isControl(widgetMeta);
    const isItemControl = isControl(row);

    const byUsedParams = relations.byUsedParams;
    // draft relationType, detected by common fields and ignores without special cases
    // (like filtering charts, editor param defauls etc.)
    let relationType = getRelationTypeByIgnores({
        loadError: Boolean(widgetMeta.loadError || row.loadError),
        relations,
        hasRelation: Boolean(byUsedParams.length || relations.byAliases.length),
    });

    let byFields: string[] = [];
    let hasDataset = false;
    let forceAddAlias = false;

    let availableRelations: string[] = [];
    if (widgetMeta.loadError || row.loadError) {
        availableRelations.push(RELATION_TYPES.unknown, RELATION_TYPES.ignore);
    } else if (isItemControl && isCurrentControl) {
        const resultRelations = getControlToControlRelations({
            relationType,
            widget: widgetMeta,
            row,
            byUsedParams,
            relations,
            datasets,
        });
        relationType = resultRelations.relationType;
        availableRelations = resultRelations.availableRelations;
        byFields = resultRelations.byFields;
        hasDataset = resultRelations.hasDataset;
        forceAddAlias = resultRelations.forceAddAlias;
    } else if (!isItemControl && !isCurrentControl) {
        const resultRelations = getChartToChartRelations({
            widget: widgetMeta,
            row,
            relationType,
        });
        relationType = resultRelations.relationType;
        availableRelations = resultRelations.availableRelations;
        hasDataset = resultRelations.hasDataset;
    } else {
        const resultRelations = getChartAndControlRelations({
            relations,
            relationType,
            isCurrentControl,
            isItemControl,
            widget: widgetMeta,
            row,
            datasets,
        });

        relationType = resultRelations.relationType;
        availableRelations = resultRelations.availableRelations;
        forceAddAlias = resultRelations.forceAddAlias;
        byFields = resultRelations.byFields;
    }

    if (!relationType) {
        relationType = RELATION_TYPES.unknown;
    }

    return {
        byUsedParams,
        byAliases: relations.byAliases,
        isIgnoring: relations.isIgnoring,
        isIgnored: relations.isIgnored,
        type: relationType as RelationType,
        available: availableRelations as Array<RelationType>,
        byFields: byFields || [],
        hasDataset,
        forceAddAlias,
    };
};

const getNormalizedUsedParams = (
    item: DashkitMetaDataItem | DashkitMetaDataItemNoRelations,
): string[] | null => {
    if (isExternalControl(item)) {
        return Object.keys(item.widgetParams || {});
    }

    return item.usedParams;
};

const getByUsedParams = (args: {
    widget: DashkitMetaDataItem;
    row: DashkitMetaDataItemNoRelations;
}) => {
    const {widget, row} = args;

    const rowUsedParams = getNormalizedUsedParams(row) || [];
    const widgetUsedParams = getNormalizedUsedParams(widget) || [];

    return intersection(rowUsedParams, widgetUsedParams);
};

export const getRelationsInfo = (args: {
    aliases: AliasesData;
    connections: ConnectionsData;
    datasets: Datasets;
    widget: DashkitMetaDataItem;
    row: DashkitMetaDataItemNoRelations;
}) => {
    const {aliases, connections, datasets, widget, row} = args;
    const byUsedParams = getByUsedParams({widget, row});
    let byAliases: Array<Array<string>> = [];
    if (aliases[DEFAULT_ALIAS_NAMESPACE]?.length) {
        byAliases = aliases[DEFAULT_ALIAS_NAMESPACE].filter((aliasArr) => {
            if (!row.usedParams?.length) {
                return false;
            }
            const rowInAlias = intersection(row.usedParams, aliasArr);
            const widgetInAlias = intersection(widget.usedParams, aliasArr);
            if (!rowInAlias.length || !widgetInAlias.length) {
                return false;
            }
            return rowInAlias;
        });
    }

    const isIgnored = connections
        .filter(({kind}) => kind === CONNECTION_KIND.IGNORE)
        .some(({from, to}) => from === widget.widgetId && to === row.widgetId);

    const isIgnoring = connections
        .filter(({kind}) => kind === CONNECTION_KIND.IGNORE)
        .some(({from, to}) => from === row.widgetId && to === widget.widgetId);

    return getItemsRelations({
        relations: {
            byUsedParams,
            byAliases,
            isIgnoring,
            isIgnored,
            hasDataset: false,
        },
        widgetMeta: widget,
        row,
        datasets,
    });
};

export const getRelationsData = ({
    metaData,
    widgetMeta,
    aliases,
    connections,
    datasets,
}: {
    metaData: DashMetaDataNoRelations;
    widgetMeta: DashkitMetaDataItem;
    aliases: AliasesData;
    connections: ConnectionsData;
    datasets: Datasets;
}): Array<DashkitMetaDataItem> => {
    if (!metaData || !metaData.length || !widgetMeta) {
        return [];
    }

    const metaItems = getCurrentNamespaceItems({
        metaItems: metaData,
        widgetId: widgetMeta.widgetId,
    });

    const relationsItems: Array<DashkitMetaDataItem> = [];

    // filtering logic is reproduced from old links
    metaItems
        .filter((item) => {
            return item.widgetId !== widgetMeta.widgetId && showInRelation(widgetMeta, item);
        })
        .forEach((item) => {
            const relations = getRelationsInfo({
                aliases,
                connections,
                datasets,
                widget: widgetMeta,
                row: item,
            });

            relationsItems.push({
                ...item,
                relations,
            });
        });

    return relationsItems;
};

const getCurrentWidgetTabShortInfo = (data: DashKit | null, widget: DashTabItem) => {
    if (widget.type === DashTabItemType.Control || widget.type === DashTabItemType.GroupControl) {
        return widget;
    }
    if (!data || widget.type !== DashTabItemType.Widget) {
        return null;
    }

    const currentPlugin = data.metaRef?.current?.pluginsRefs?.find(
        (item) => item.props.id === widget.id,
    );

    const currentWidgetId =
        currentPlugin?.chartKitRef?.current?.props.id || currentPlugin?.getCurrentTabChartId?.();
    const res = currentPlugin.props.data.tabs.find(
        (item: DashTabItemWidgetTab) => item.chartId === currentWidgetId,
    );
    if (res) {
        return {...res, namespace: currentPlugin.props.namespace};
    }
    return res;
};

export const getCurrentWidgetMeta = ({
    metaData,
    dashkitData,
    widget,
}: {
    metaData: DashMetaDataNoRelations;
    dashkitData: DashKit | null;
    widget: DashTabItem;
}): DashkitMetaDataItem => {
    const tabInfo = getCurrentWidgetTabShortInfo(dashkitData, widget);
    return (metaData?.find((item) => item.widgetId === tabInfo.id) || {}) as DashkitMetaDataItem;
};

export const getMappedFilters = (items: Array<FiltersTypes>) => {
    const mapped: Record<RelationType, boolean> = {
        ignore: false,
        input: false,
        output: false,
        both: false,
        unknown: false,
    };

    const preparedItems = items.length > 0 ? items : DEFAULT_FILTERS;

    preparedItems.forEach((item) => {
        switch (item) {
            case 'none':
                mapped.ignore = true;
                mapped.unknown = true;
                break;
            case 'input':
                mapped.input = true;
                mapped.both = true;
                break;
            case 'output':
                mapped.output = true;
                mapped.both = true;
                break;
        }
    });

    return mapped;
};

export const getChangedRelations = (
    items: DashMetaData,
    changed: Record<string, RelationType> | undefined,
) => {
    return items.map((item) => {
        const newItem = {
            ...item,
        };
        if (changed && changed[item.widgetId]) {
            newItem.relations = {
                ...item.relations,
                type: changed[item.widgetId],
            };
        }
        return newItem;
    });
};
