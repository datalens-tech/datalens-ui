import React from 'react';

import {Config, ConfigConnection, DashKit} from '@gravity-ui/dashkit';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import cloneDeep from 'lodash/cloneDeep';
import intersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';
import {
    DashTabItem,
    DashTabItemControlSourceType,
    DashTabItemType,
    DashTabItemWidgetTab,
} from 'shared';

import {GetEntriesDatasetsFieldsResponse} from '../../../../../../shared/schema';
import {
    DashkitMetaDataItemBase,
    DatasetsData,
} from '../../../../../components/DashKit/plugins/types';
import {
    AcceptFiltersWidgetType,
    CONNECTION_KIND,
    DASH_ACCEPT_FILTERING_CHARTS_WIDGET_TYPES,
    DASH_FILTERING_CHARTS_WIDGET_TYPES,
    DASH_WIDGET_TYPES,
    FilteringWidgetType,
} from '../../../modules/constants';

import {FiltersTypes} from './components/Filters/Filters';
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
} from './types';

import iconReverse from 'assets/icons/arr-reverse.svg';
import iconRight from 'assets/icons/arr-right.svg';
import iconArea100p from 'assets/icons/charts-visualisations/vis-area-100p.svg';
import iconArea from 'assets/icons/charts-visualisations/vis-area.svg';
import iconBar100p from 'assets/icons/charts-visualisations/vis-bar-100p.svg';
import iconBar from 'assets/icons/charts-visualisations/vis-bar.svg';
import iconColumn100p from 'assets/icons/charts-visualisations/vis-column-100p.svg';
import iconColumn from 'assets/icons/charts-visualisations/vis-column.svg';
import iconDonut from 'assets/icons/charts-visualisations/vis-donut.svg';
import iconFlatTable from 'assets/icons/charts-visualisations/vis-flat-table.svg';
import iconGeolayers from 'assets/icons/charts-visualisations/vis-geolayers.svg';
import iconLine from 'assets/icons/charts-visualisations/vis-lines.svg';
import iconMetric from 'assets/icons/charts-visualisations/vis-metric.svg';
import iconPie from 'assets/icons/charts-visualisations/vis-pie.svg';
import iconPivotTable from 'assets/icons/charts-visualisations/vis-pivot.svg';
import iconScatter from 'assets/icons/charts-visualisations/vis-scatter.svg';
import iconTreemap from 'assets/icons/charts-visualisations/vis-treemap.svg';
import iconAnyChart from 'assets/icons/relations-any.svg';
import iconControls from 'assets/icons/relations-controls.svg';
import iconNoData from 'assets/icons/relations-no-data.svg';
import iconNoLink from 'assets/icons/relations-no-link.svg';

import './DialogRelations.scss';

export const RELATIONS_CHARTS_ICONS_DICT = {
    control: iconControls,
    table: iconFlatTable,
    widget: iconAnyChart,
    line: iconLine,
    area: iconArea,
    area100p: iconArea100p,
    column: iconColumn,
    column100p: iconColumn100p,
    bar: iconBar,
    bar100p: iconBar100p,
    scatter: iconScatter,
    pie: iconPie,
    donut: iconDonut,
    metric: iconMetric,
    treemap: iconTreemap,
    flatTable: iconFlatTable,
    pivotTable: iconPivotTable,
    geolayer: iconGeolayers,
    ymap: iconGeolayers,
};

type RelationChartType = keyof typeof RELATIONS_CHARTS_ICONS_DICT;

const b = block('dialog-relations');

export const DEFAULT_ALIAS_NAMESPACE = 'default';

export const getCurrentWidgetTabShortInfo = (data: DashKit | null, widget: DashTabItem) => {
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

export const getDialogCaptionIcon = (
    widget: DashTabItem,
    currentWidgetMeta: DashkitMetaDataItem,
) => {
    let iconData = null;
    if (
        widget.type === DashTabItemType.Control ||
        currentWidgetMeta.type === DashTabItemType.Control
    ) {
        iconData = RELATIONS_CHARTS_ICONS_DICT.control;
    }
    if (widget.type === DashTabItemType.Widget) {
        iconData =
            RELATIONS_CHARTS_ICONS_DICT[currentWidgetMeta.visualizationType as RelationChartType] ||
            RELATIONS_CHARTS_ICONS_DICT[currentWidgetMeta.type as RelationChartType] ||
            RELATIONS_CHARTS_ICONS_DICT.widget;
    }
    return iconData ? <Icon data={iconData} size={24} className={b('icon-title')} /> : null;
};

export const getDialogRowIcon = (widgetMeta: DashkitMetaDataItem, className: string) => {
    const iconData =
        widgetMeta.type === DashTabItemType.Control
            ? RELATIONS_CHARTS_ICONS_DICT.control
            : RELATIONS_CHARTS_ICONS_DICT[widgetMeta.visualizationType as RelationChartType] ||
              RELATIONS_CHARTS_ICONS_DICT[widgetMeta.type as RelationChartType] ||
              RELATIONS_CHARTS_ICONS_DICT.widget;

    return <Icon data={iconData} size={20} className={className} />;
};

export const getLinkIcon = (type: string) => {
    switch (type) {
        case 'ignore':
            return iconNoLink;
        case 'input':
        case 'output':
            return iconRight;
        case 'both':
            return iconReverse;
        default:
            return iconNoData;
    }
};

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
            const byUsedParams = intersection(item.usedParams || [], widgetMeta.usedParams || []);
            let byAliases: Array<Array<string>> = [];
            if (aliases[DEFAULT_ALIAS_NAMESPACE]?.length) {
                byAliases = aliases[DEFAULT_ALIAS_NAMESPACE].filter((aliasArr) => {
                    if (!item.usedParams?.length) {
                        return false;
                    }
                    return intersection(item.usedParams, aliasArr);
                });
            }

            const isIgnoring = connections
                .filter(({kind}) => kind === CONNECTION_KIND.IGNORE)
                .some(({from, to}) => from === widgetMeta.widgetId && to === item.widgetId);

            const isIgnored = connections
                .filter(({kind}) => kind === CONNECTION_KIND.IGNORE)
                .some(({from, to}) => from === item.widgetId && to === widgetMeta.widgetId);

            const linkedInfo = {
                byUsedParams,
                byAliases,
                isIgnoring,
                isIgnored,
            };

            const {relationType, availableRelations} = getItemsRelations({
                relations: linkedInfo,
                widgetMeta,
                type: item.type,
                row: item,
            });

            const relations = {
                byUsedParams,
                byAliases,
                isIgnoring,
                isIgnored,
                type: relationType,
                available: availableRelations,
            };

            const byFields = getConnectedField({
                widget: widgetMeta,
                row: item,
                relations,
                relationType,
                datasets,
            });

            relationsItems.push({
                ...item,
                relations: {
                    ...relations,
                    byFields: byFields || [],
                },
            });
        });

    return relationsItems;
};

export const RELATION_TYPES = {
    ignore: 'ignore',
    input: 'input',
    output: 'output',
    both: 'both',
    unknown: 'unknown',
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

export const TEXT_LIMIT = 20;

export const getClampedText = (text: string) =>
    text.length > TEXT_LIMIT ? `${text.substr(0, TEXT_LIMIT)}...` : text;

export const getRelationsText = (type: RelationType): string => {
    switch (type) {
        case 'ignore':
            return 'label_ignore';
        case 'input':
            return 'label_input';
        case 'output':
            return 'label_output';
        case 'both':
            return 'label_both';
        case 'unknown':
            return 'label_unknown';
        default:
            return '';
    }
};

export const getRelationDetailsKey = (item: RelationType) => {
    switch (item) {
        case RELATION_TYPES.input:
        case RELATION_TYPES.output:
            return 'value_link-affect';
        case RELATION_TYPES.both:
            return 'value_link-both';
        case RELATION_TYPES.ignore:
            return 'value_link-ignore';
        case RELATION_TYPES.unknown:
        default:
            return 'value_link-unknown';
    }
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

const getDatasetItemFlatFields = (data: DatasetsData): Record<string, string> => {
    if (!data) {
        return {};
    }

    const result = data.fields || {};
    data.fieldsList?.forEach((listItem) => {
        if (!result[listItem.guid]) {
            result[listItem.guid] = listItem.title || '';
        }
    });
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
    if (item?.type === DASH_WIDGET_TYPES.CONTROL) {
        // map fields with the name of the field from the dataset
        if (item?.datasets?.length) {
            return Object.keys(item.defaultParams).map((paramItem) => {
                const allFields = getDatasetsFlatItems(item.datasets);
                return allFields[paramItem] || '';
            });
        } else {
            const datasetFlatFields = getDatasetsListWithFlatFields(datasets);
            if (datasetFlatFields && item?.datasetId && datasetFlatFields[item?.datasetId]) {
                return Object.keys(item.defaultParams).map(
                    (paramItem) =>
                        datasetFlatFields[item.datasetId!] &&
                        datasetFlatFields[item.datasetId!][paramItem],
                );
            }
        }
    }
    return null;
};

const getConnectedField = ({
    widget,
    row,
    relations,
    relationType,
    datasets,
}: {
    widget: DashkitMetaDataItemNoRelations;
    row: DashkitMetaDataItemNoRelations;
    relations: Omit<RelationsData, 'byFields'>;
    relationType: RelationType;
    datasets: Datasets;
}) => {
    if (
        relationType !== RELATION_TYPES.output &&
        relationType !== RELATION_TYPES.input &&
        !relations.byUsedParams.length
    ) {
        return '';
    }

    let res = getMappedConnectedField({item: row, datasets});
    if (!res) {
        res = getMappedConnectedField({item: widget, datasets});
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

const getChangedConnections = ({
    items,
    widgetId,
    changedId,
    changedType,
}: {
    items: Config['connections'];
    widgetId: string;
    changedId: string;
    changedType: string;
}) => {
    const relationFromWidgetToRow = {
        from: widgetId,
        kind: RELATION_TYPES.ignore as ConfigConnection['kind'],
        to: changedId,
    };
    const relationFromRowToWidget = {
        from: changedId,
        kind: RELATION_TYPES.ignore as ConfigConnection['kind'],
        to: widgetId,
    };

    const connectionsWithoutCurrentLink = items.filter(
        (item) =>
            item.kind === RELATION_TYPES.ignore &&
            !(changedId === item.from && widgetId === item.to) &&
            !(changedId === item.to && widgetId === item.from),
    );
    let result: Config['connections'] = [];
    switch (changedType) {
        case RELATION_TYPES.ignore: {
            result = connectionsWithoutCurrentLink.concat([
                relationFromWidgetToRow,
                relationFromRowToWidget,
            ]);
            break;
        }
        case RELATION_TYPES.output: {
            result = connectionsWithoutCurrentLink.concat([relationFromRowToWidget]);
            break;
        }
        case RELATION_TYPES.input: {
            result = connectionsWithoutCurrentLink.concat([relationFromWidgetToRow]);
            break;
        }
    }
    return result;
};

export const getUpdatedRelations = (
    items: Config['connections'],
    widgetId: DashkitMetaDataItem['widgetId'],
    changed: Record<string, RelationType>,
) => {
    let updatedItems: Config['connections'] = [...items];
    for (const [key, type] of Object.entries(changed)) {
        updatedItems = getChangedConnections({
            items: updatedItems,
            widgetId,
            changedId: key,
            changedType: type,
        });
    }
    return updatedItems;
};

export const getRelationsForSave = ({
    currentWidgetId,
    changed,
    dashkitData,
}: {
    currentWidgetId: DashkitMetaDataItem['widgetId'];
    changed: Record<string, RelationType> | undefined;
    dashkitData: DashKit | null;
}) => {
    if (!dashkitData || !changed || isEmpty(changed)) {
        return null;
    }

    const {connections} = dashkitData.props.config;

    return getUpdatedRelations(connections, currentWidgetId, changed);
};

export const appendUniq = (first: string, second: string, alias: Array<string>) => {
    const uniqSet: Set<string> = new Set([first, second]);

    alias.forEach((key) => uniqSet.add(key));

    return Array.from(uniqSet);
};

export const concatUniq = (left: Array<string>, right: Array<string>) => {
    const uniqSet: Set<string> = new Set();

    left.forEach((key) => uniqSet.add(key));
    right.forEach((key) => uniqSet.add(key));

    return Array.from(uniqSet);
};

export const checkExist = (first: string, second: string, checkedAlias: Array<string>) => {
    return checkedAlias.some((key) => key === first || key === second);
};

export const getNormalizedAliases = (aliases: Array<Array<string>>) => {
    // immediately create a copy of the array and change it
    const normalizedAliases = cloneDeep(aliases);

    for (let i = 0; i < normalizedAliases.length; i++) {
        let alias = normalizedAliases[i];
        if (alias.length < 1) {
            // immediately delete the empty alias and move on to the next one
            normalizedAliases.splice(i, 1);
            i -= 1; // we compensate for the deleted index during the transition
            continue;
        }

        // compare the current one only with all the following aliases (m = i 1)
        // we believe that all the previous ones have already been normalized
        for (let m = i + 1; m < normalizedAliases.length; m++) {
            const accumulationAlias = alias;
            const nextAlias = normalizedAliases[m];

            // looking for the intersection of aliases (intersection)
            if (nextAlias.some((al) => accumulationAlias.includes(al))) {
                // we connect the chains, select only unique ones and save them in the accumulating
                alias = concatUniq(accumulationAlias, nextAlias);
                // usage.from and .concat due to a performance issue

                // we delete the current one, because it is a duplicate
                normalizedAliases.splice(m, 1);

                // again, we return to checking aliases for the intersection first
                m = i;
            }
        }

        // redefining the alias with the accumulated value
        normalizedAliases[i] = alias;
    }

    return normalizedAliases;
};

export const addAlias = (first: string, second: string, aliases: Array<Array<string>>) => {
    let isAppended = false;
    let appended: Array<string> = [];

    const result: Array<Array<string>> = [];

    for (let i = 0; i < aliases.length; i++) {
        const alias = aliases[i];

        if (checkExist(first, second, alias)) {
            if (isAppended) {
                // repeated alias match

                // do not add to the array again, add to the previous one
                const appendedIndex = result.indexOf(appended);
                appended = concatUniq(alias, appended);

                result[appendedIndex] = appended;
            } else {
                // the first alias match
                isAppended = true;

                appended = appendUniq(first, second, alias);
                result.push(appended);
            }
        } else {
            result.push(alias);
        }
    }

    if (!isAppended) {
        result.push([first, second]);
    }

    return result;
};
