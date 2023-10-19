import {DashKit} from '@gravity-ui/dashkit';
import intersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';
import {
    DashTabItem,
    DashTabItemControlSourceType,
    DashTabItemType,
    DashTabItemWidgetTab,
} from 'shared';
import {GetEntriesDatasetsFieldsResponse} from 'shared/schema';
import {
    DashkitMetaDataItemBase,
    DatasetsData,
    DatasetsFieldsListData,
} from 'ui/components/DashKit/plugins/types';
import {
    AcceptFiltersWidgetType,
    CONNECTION_KIND,
    DASH_ACCEPT_FILTERING_CHARTS_WIDGET_TYPES,
    DASH_FILTERING_CHARTS_WIDGET_TYPES,
    DASH_WIDGET_TYPES,
    FilteringWidgetType,
} from 'ui/units/dash/modules/constants';

import {FiltersTypes} from '../components/Filters/Filters';
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
    DatasetsFlatListData,
    DatasetsListData,
    RelationType,
    RelationsData,
} from '../types';

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
            item.datasets!.forEach((datasetItem) => {
                datasetsList[datasetItem.id] = {
                    fields: datasetItem.fieldsList,
                };
            });
        }
        if (
            item?.type === DashTabItemType.Control &&
            item?.sourceType !== DashTabItemControlSourceType.Dataset
        ) {
            controlsList.push(item?.widgetId);
        }
    });

    metaDataWithNamespaces
        .filter((item) => Boolean(item.datasets?.length))
        .forEach((item) => {
            item.datasets!.forEach((datasetItem) => {
                datasetsList[datasetItem.id] = {
                    fields: datasetItem.fieldsList,
                };
            });
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

        // TODO next PR
        /*if (entryWithDataset && !itemWithDataset.datasets?.length) {
            const controlWithDataset = itemWithDataset.datasets?.find(
                (entryItem) => entryItem.id === item.datasetId,
            );
        }*/

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
            ) as Array<DatasetsData>; // TODO for multi-datasets, this did not work, you need to order the pen to return a different format
            itemWithDataset.type = item.type || type; // TODO order from US type for graph
            itemWithDataset.enableFiltering = item.enableFiltering || false;
        }

        return itemWithDataset;
    });
    return res;
};

const showInRelation = (
    currentItem: DashkitMetaDataItem,
    rowItem: DashkitMetaDataItemNoRelations,
) => {
    const isCurrentControl = currentItem.type === DASH_WIDGET_TYPES.CONTROL;
    const isItemControl = rowItem.type === DASH_WIDGET_TYPES.CONTROL;

    const isCurrentChartAcceptFilter =
        (currentItem.type as AcceptFiltersWidgetType) in DASH_ACCEPT_FILTERING_CHARTS_WIDGET_TYPES;
    const isItemChartAcceptFilter =
        (rowItem.type as AcceptFiltersWidgetType) in DASH_ACCEPT_FILTERING_CHARTS_WIDGET_TYPES;

    const isCurrentFilteringChart =
        (currentItem.type as FilteringWidgetType) in DASH_FILTERING_CHARTS_WIDGET_TYPES &&
        currentItem.enableFiltering;
    const isItemFilteringChart =
        (rowItem.type as FilteringWidgetType) in DASH_FILTERING_CHARTS_WIDGET_TYPES &&
        rowItem.enableFiltering;

    if (isCurrentControl) {
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

const getItemsRelations = ({
    relations,
    widgetMeta,
    type,
    row,
}: {
    relations: Omit<RelationsData, 'type' | 'available' | 'byFields'>;
    widgetMeta: DashkitMetaDataItemNoRelations;
    type: DashkitMetaDataItem['type'];
    row: DashkitMetaDataItemNoRelations;
}) => {
    const hasRelation = relations.byUsedParams.length || relations.byAliases.length;
    let relationType = '';
    if ((widgetMeta.loadError || row.loadError) && !(relations.isIgnored && relations.isIgnoring)) {
        relationType = RELATION_TYPES.unknown;
    } else if (relations.isIgnored && relations.isIgnoring) {
        relationType = RELATION_TYPES.ignore;
    } else if (hasRelation) {
        if (relations.isIgnored || relations.isIgnoring) {
            relationType = relations.isIgnored ? RELATION_TYPES.output : RELATION_TYPES.input;
        } else {
            relationType = RELATION_TYPES.both;
        }
    }

    const isCurrentFilteringChart =
        (widgetMeta.type as FilteringWidgetType) in DASH_FILTERING_CHARTS_WIDGET_TYPES &&
        widgetMeta.enableFiltering;
    const isItemFilteringChart =
        (row.type as FilteringWidgetType) in DASH_FILTERING_CHARTS_WIDGET_TYPES &&
        row.enableFiltering;

    let availableRelations = [];
    if (widgetMeta.loadError || row.loadError) {
        availableRelations.push(RELATION_TYPES.unknown, RELATION_TYPES.ignore);
    } else if (
        widgetMeta.type !== DASH_WIDGET_TYPES.CONTROL &&
        type === DASH_WIDGET_TYPES.CONTROL
    ) {
        // current widget == chart and widget in line == control
        availableRelations = isCurrentFilteringChart
            ? [
                  RELATION_TYPES.both,
                  RELATION_TYPES.input,
                  RELATION_TYPES.output,
                  RELATION_TYPES.ignore,
              ]
            : [RELATION_TYPES.input, RELATION_TYPES.ignore];
        if (!availableRelations.includes(relationType)) {
            relationType = isCurrentFilteringChart ? RELATION_TYPES.both : RELATION_TYPES.input;
        }
    } else if (
        type !== DASH_WIDGET_TYPES.CONTROL &&
        widgetMeta.type === DASH_WIDGET_TYPES.CONTROL
    ) {
        // current widget == control and widget in line == chart
        availableRelations = isItemFilteringChart
            ? [
                  RELATION_TYPES.both,
                  RELATION_TYPES.input,
                  RELATION_TYPES.output,
                  RELATION_TYPES.ignore,
              ]
            : [RELATION_TYPES.output, RELATION_TYPES.ignore];
        if (!availableRelations.includes(relationType)) {
            relationType = isItemFilteringChart ? RELATION_TYPES.both : RELATION_TYPES.output;
        }
    } else if (
        type === DASH_WIDGET_TYPES.CONTROL &&
        widgetMeta.type === DASH_WIDGET_TYPES.CONTROL
    ) {
        // current widget == control and widget in line == control
        availableRelations.push(
            RELATION_TYPES.both,
            RELATION_TYPES.input,
            RELATION_TYPES.output,
            RELATION_TYPES.ignore,
        );
    } else if (
        type !== DASH_WIDGET_TYPES.CONTROL &&
        widgetMeta.type !== DASH_WIDGET_TYPES.CONTROL
    ) {
        // if current widget == chart and widget in line == chart

        const currentItemWithEnabledFiltering = widgetMeta.enableFiltering;
        const rowItemWithEnabledFiltering = row.enableFiltering;

        relationType = RELATION_TYPES.both;
        if (currentItemWithEnabledFiltering && !rowItemWithEnabledFiltering) {
            relationType = RELATION_TYPES.output;
        } else if (!currentItemWithEnabledFiltering && rowItemWithEnabledFiltering) {
            relationType = RELATION_TYPES.input;
        }
        availableRelations.push(
            RELATION_TYPES.both,
            RELATION_TYPES.input,
            RELATION_TYPES.output,
            RELATION_TYPES.ignore,
        );
    }
    if (!relationType) {
        relationType = RELATION_TYPES.ignore;
    }

    return {
        relationType: relationType as RelationType,
        availableRelations: availableRelations as Array<RelationType>,
    };
};

const getDatasetsListWithFlatFields = (datasets: Datasets) => {
    if (!datasets) {
        return {};
    }
    const flatDatasetFields: DatasetsFlatListData = {};
    for (const [id, data] of Object.entries(datasets)) {
        flatDatasetFields[id] = data.fields.reduce(
            (result, {guid, title}) => ({...result, [guid]: title}),
            {},
        );
    }
    return flatDatasetFields;
};

const mapFieldsListGuid = (list: Array<DatasetsFieldsListData>, result: Record<string, string>) => {
    list.forEach((listItem) => {
        if (!result[listItem.guid]) {
            result[listItem.guid] = listItem.title || '';
        }
    });
};

const getDatasetItemFlatFields = (data: DatasetsData): Record<string, string> => {
    if (!data) {
        return {};
    }
    let result = {};
    if (Array.isArray(data.fields)) {
        mapFieldsListGuid(data.fields, result);
    } else {
        result = {...data.fields};
    }
    if (data.fieldsList) {
        mapFieldsListGuid(data.fieldsList, result);
    }
    return result;
};

const getDatasetsFlatItems = (
    datasets: DashkitMetaDataItemBase['datasets'],
): Record<string, string> => {
    if (!datasets) {
        return {};
    }
    let result = {};
    datasets.forEach((item) => {
        const fields = getDatasetItemFlatFields(item);
        result = {...result, ...fields};
    });
    return result;
};

const getMappedConnectedField = ({
    item,
    datasets,
}: {
    item: DashkitMetaDataItemNoRelations;
    datasets: Datasets;
}) => {
    if (item?.type !== DASH_WIDGET_TYPES.CONTROL) {
        return null;
    }

    // map fields with the name of the field from the dataset
    if (item?.datasets?.length) {
        // if it is dataset selector
        return Object.keys(item.defaultParams)
            .map((paramItem) => {
                const allFields = getDatasetsFlatItems(item.datasets);
                return allFields[paramItem] || '';
            })
            .filter(Boolean);
    } else {
        // if it is dataset selector (other format)
        const datasetFlatFields = getDatasetsListWithFlatFields(datasets);
        if (datasetFlatFields && item?.datasetId && datasetFlatFields[item?.datasetId]) {
            return Object.keys(item.defaultParams)
                .map(
                    (paramItem) =>
                        datasetFlatFields[item.datasetId!] &&
                        datasetFlatFields[item.datasetId!][paramItem],
                )
                .filter(Boolean);
        }
    }

    return null;
};

const getConnectedFieldExternalSelectors = (
    left: DashkitMetaDataItemNoRelations,
    right: DashkitMetaDataItemNoRelations,
) => {
    if (!('widgetParams' in left) || isEmpty(left.widgetParams)) {
        return null;
    }

    const filteredWidgetParams = Object.keys(left.widgetParams || {}).filter((item) =>
        left?.usedParams?.includes(item),
    );

    if (!filteredWidgetParams.length) {
        return null;
    }

    if (right?.datasets?.length) {
        const allFields = getDatasetsFlatItems(right.datasets);
        const allFieldsValues: Record<string, string> = {};
        Object.values(allFields).forEach((item) => {
            allFieldsValues[item] = item;
        });
        const res = filteredWidgetParams
            .map((paramItem) => {
                return allFields[paramItem] || allFieldsValues[paramItem] || '';
            })
            .filter(Boolean);
        if (res.length) {
            return res;
        }
    }

    return null;
};

const getConnectedField = ({
    widget,
    row,
    datasets,
}: {
    widget: DashkitMetaDataItemNoRelations;
    row: DashkitMetaDataItemNoRelations;
    datasets: Datasets;
}) => {
    let res =
        getMappedConnectedField({item: row, datasets}) ||
        getMappedConnectedField({item: widget, datasets});

    if (
        !res?.length &&
        (row.type === DASH_WIDGET_TYPES.CONTROL || widget.type === DASH_WIDGET_TYPES.CONTROL)
    ) {
        res =
            getConnectedFieldExternalSelectors(row, widget) ||
            getConnectedFieldExternalSelectors(widget, row);
    }
    return res;
};

export const getRelationsInfo = (args: {
    aliases: AliasesData;
    connections: ConnectionsData;
    datasets: Datasets;
    widget: DashkitMetaDataItem;
    row: DashkitMetaDataItemNoRelations;
}) => {
    const {aliases, connections, datasets, widget, row} = args;
    const byUsedParams = intersection(row.usedParams || [], widget.usedParams || []);
    let byAliases: Array<Array<string>> = [];
    if (aliases[DEFAULT_ALIAS_NAMESPACE]?.length) {
        byAliases = aliases[DEFAULT_ALIAS_NAMESPACE].filter((aliasArr) => {
            if (!row.usedParams?.length) {
                return false;
            }
            return intersection(row.usedParams, aliasArr);
        });
    }

    const isIgnored = connections
        .filter(({kind}) => kind === CONNECTION_KIND.IGNORE)
        .some(({from, to}) => from === widget.widgetId && to === row.widgetId);

    const isIgnoring = connections
        .filter(({kind}) => kind === CONNECTION_KIND.IGNORE)
        .some(({from, to}) => from === row.widgetId && to === widget.widgetId);

    const linkedInfo = {
        byUsedParams,
        byAliases,
        isIgnoring,
        isIgnored,
    };

    const {relationType, availableRelations} = getItemsRelations({
        relations: linkedInfo,
        widgetMeta: widget,
        type: row.type,
        row,
    });

    const relations = {
        byUsedParams,
        byAliases,
        isIgnoring,
        isIgnored,
        type: relationType,
        available: availableRelations,
    };

    const noAvailLinks =
        relationType !== RELATION_TYPES.output &&
        relationType !== RELATION_TYPES.input &&
        !relations.byUsedParams.length;

    const byFields = noAvailLinks
        ? []
        : getConnectedField({
              widget,
              row,
              datasets,
          });

    if (!isIgnoring && !isIgnored && isEmpty(byAliases.filter(Boolean)) && isEmpty(byFields)) {
        relations.type = RELATION_TYPES.ignore as RelationType;
    }

    return {
        ...relations,
        byFields: byFields || [],
    };
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
    if (widget.type === DashTabItemType.Control) {
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

    items.forEach((item) => {
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
