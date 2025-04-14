import React from 'react';

import type {Config, ConfigConnection, DashKit} from '@gravity-ui/dashkit';
import type {SelectOption} from '@gravity-ui/uikit';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';

import type {DashTabItem} from '../../../shared';
import {DashTabItemType} from '../../../shared';
import {VISUALIZATIONS_BY_ID} from '../../constants/visualizations';
import {IconById} from '../IconById/IconById';

import {
    DEFAULT_ALIAS_NAMESPACE,
    DEFAULT_ICON_SIZE,
    RELATIONS_CHARTS_ICONS_DICT,
    RELATION_TYPES,
} from './constants';
import {getRelationsInfo, showInRelation} from './hooks/helpers';
import type {
    ConnectionsData,
    DashMetaData,
    DashkitMetaDataItem,
    DatasetsListData,
    RelationChartType,
    RelationType,
    RelationsData,
    WidgetsTypes,
} from './types';

import './DialogRelations.scss';

const b = block('dialog-relations');

const getIconByVisualizationId = ({
    visualizationId,
    iconSize,
    className,
}: {
    visualizationId: string;
    iconSize?: number;
    className?: string;
}) => {
    const visualization = VISUALIZATIONS_BY_ID[visualizationId];

    return visualization ? (
        <IconById
            id={visualization.iconProps.id}
            size={iconSize || DEFAULT_ICON_SIZE}
            className={`${className} ${b('icon-visualization')}`}
        />
    ) : (
        <Icon
            data={RELATIONS_CHARTS_ICONS_DICT.widget}
            size={iconSize || DEFAULT_ICON_SIZE}
            className={className}
        />
    );
};

export const getRelationsIcon = (
    widgetMeta: DashkitMetaDataItem | Omit<DashkitMetaDataItem, 'relations'>,
    className?: string,
) => {
    if (!widgetMeta) {
        return null;
    }

    if (widgetMeta.visualizationType) {
        return getIconByVisualizationId({
            visualizationId: widgetMeta.visualizationType,
            className,
        });
    }

    const iconData =
        widgetMeta.type === DashTabItemType.Control
            ? RELATIONS_CHARTS_ICONS_DICT.control
            : RELATIONS_CHARTS_ICONS_DICT[widgetMeta.type as RelationChartType] ||
              RELATIONS_CHARTS_ICONS_DICT.widget;

    return <Icon data={iconData} size={DEFAULT_ICON_SIZE} className={className} />;
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
        case RELATION_TYPES.input: {
            result = connectionsWithoutCurrentLink.concat([relationFromRowToWidget]);
            break;
        }
        case RELATION_TYPES.output: {
            result = connectionsWithoutCurrentLink.concat([relationFromWidgetToRow]);
            break;
        }
        default:
            result = connectionsWithoutCurrentLink;
    }

    return result;
};

export const getUpdatedRelations = (items: Config['connections'], changed: WidgetsTypes) => {
    let updatedItems: Config['connections'] = [...items];

    for (const id of Object.keys(changed)) {
        for (const [key, type] of Object.entries(changed[id])) {
            updatedItems = getChangedConnections({
                items: updatedItems,
                widgetId: id,
                changedId: key,
                changedType: type,
            });
        }
    }
    return updatedItems;
};

export const getRelationsForSave = ({
    changed,
    dashkitData,
}: {
    changed: WidgetsTypes | undefined;
    dashkitData: DashKit | null;
}) => {
    if (!dashkitData || !changed || isEmpty(changed)) {
        return null;
    }

    const {connections} = dashkitData.props.config;

    return getUpdatedRelations(connections, changed);
};

const appendUniq = (first: string, second: string, alias: Array<string>) => {
    const uniqSet: Set<string> = new Set([first, second]);

    alias.forEach((key) => uniqSet.add(key));

    return Array.from(uniqSet);
};

const concatUniq = (left: Array<string>, right: Array<string>) => {
    const uniqSet: Set<string> = new Set();

    left.forEach((key) => uniqSet.add(key));
    right.forEach((key) => uniqSet.add(key));

    return Array.from(uniqSet);
};

const checkExist = (first: string, second: string, checkedAlias: Array<string>) => {
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

export const hasConnectionsBy = (relation?: RelationsData) => {
    return (
        Boolean(relation?.byUsedParams?.length) ||
        Boolean(relation?.byFields?.length) ||
        Boolean(relation?.byAliases?.length)
    );
};

export const getUpdatedPreparedRelations = (props: {
    aliases: string[][] | Record<string, string[][]>;
    currentWidgetId: string;
    currentWidgetMeta: DashkitMetaDataItem | null;
    changedWidgetsData?: WidgetsTypes;
    dashkitData: DashKit | null;
    dashWidgetsMeta: Omit<DashkitMetaDataItem, 'relations'>[] | null;
    preparedRelations: DashMetaData;
    datasets: DatasetsListData | null;
    type?: 'aliases' | 'connections';
}) => {
    const {
        aliases,
        currentWidgetId,
        currentWidgetMeta,
        changedWidgetsData,
        dashkitData,
        dashWidgetsMeta,
        preparedRelations,
        datasets,
        type = 'connections',
    } = props;
    if (!dashWidgetsMeta || !currentWidgetMeta) {
        return null;
    }
    const connections = (getRelationsForSave({
        changed: changedWidgetsData,
        dashkitData,
    }) || []) as ConnectionsData;

    const row = dashWidgetsMeta.find((item) => (item.itemId || item.widgetId) === currentWidgetId);
    if (!row) {
        return null;
    }

    const newPreparedRelations = [...preparedRelations];
    const changedRelationsItem = newPreparedRelations.find(
        (item) => (item.itemId || item.widgetId) === currentWidgetId,
    );
    const newAliases = Array.isArray(aliases)
        ? ({[DEFAULT_ALIAS_NAMESPACE]: aliases} as Record<string, string[][]>)
        : (aliases as Record<string, string[][]>);
    if (type === 'aliases') {
        const relationsItems: Array<DashkitMetaDataItem> = [];

        // filtering logic is reproduced from old links
        dashWidgetsMeta
            .filter((item) => {
                return (
                    (item.itemId || item.widgetId) !== currentWidgetId &&
                    showInRelation(currentWidgetMeta, item)
                );
            })
            .forEach((item) => {
                const relations = getRelationsInfo({
                    aliases: newAliases,
                    connections: (dashkitData?.props.config.connections || []) as ConnectionsData,
                    datasets,
                    widget: currentWidgetMeta,
                    row: item,
                });

                relationsItems.push({
                    ...item,
                    relations,
                });
            });

        return relationsItems;
    }
    if (!changedRelationsItem) {
        return null;
    }

    changedRelationsItem.relations = getRelationsInfo({
        aliases: newAliases,
        connections,
        datasets,
        widget: currentWidgetMeta,
        row,
    });

    return newPreparedRelations;
};

export const getPairedRelationType = (type: RelationType): RelationType => {
    switch (type) {
        case RELATION_TYPES.ignore:
        case RELATION_TYPES.both:
            return type;
        case RELATION_TYPES.input:
            return RELATION_TYPES.output as RelationType;
        case RELATION_TYPES.output:
            return RELATION_TYPES.input as RelationType;
    }

    return RELATION_TYPES.unknown as RelationType;
};

export const getWidgetsOptions = (
    widgetsIconMap: Record<string, JSX.Element | null>,
    widgets?: DashTabItem[],
    showDebugInfo?: boolean,
) => {
    const options: SelectOption<{
        widgetId?: string;
        isItem?: boolean;
        icon: JSX.Element | null;
    }>[] = [];

    if (!widgets) {
        return options;
    }

    for (let i = 0; i < widgets?.length; i++) {
        const widgetItem = widgets[i];

        switch (widgetItem.type) {
            case DashTabItemType.GroupControl:
                widgetItem.data.group.forEach((item) => {
                    options.push({
                        value: item.id,
                        content: showDebugInfo
                            ? `(${widgetItem.id} ${item.id}) ${item.title}`
                            : item.title,
                        data: {
                            widgetId: widgetItem.id,
                            isItem: true,
                            icon: widgetsIconMap[widgetItem.id],
                        },
                    });
                });
                break;
            case DashTabItemType.Widget:
                widgetItem.data.tabs.forEach((item) => {
                    options.push({
                        value: item.id,
                        content: showDebugInfo
                            ? `(${widgetItem.id} ${item.id}) ${item.title}`
                            : item.title,
                        data: {
                            widgetId: widgetItem.id,
                            icon: widgetsIconMap[item.id],
                        },
                    });
                });
                break;
            case DashTabItemType.Control:
                options.push({
                    value: widgetItem.id,
                    content: showDebugInfo
                        ? `(${widgetItem.id}) ${widgetItem.data.title}`
                        : widgetItem.data.title,
                    data: {icon: widgetsIconMap[widgetItem.id]},
                });
                break;
        }
    }

    return options;
};
