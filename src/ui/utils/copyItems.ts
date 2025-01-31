import type {ConfigItem, ConfigItemData} from '@gravity-ui/dashkit';
import {DashTabItemType} from 'shared/types';
import type {ConnectionsData} from 'ui/components/DialogRelations/types';

// targetId - item is copied data from localStorage
// id - item is already created via DashKit.setItem
type TargetWidgetId = {id: string} | {targetId?: string};

export const collectWidgetItemIds = (
    item: {
        type: ConfigItem['type'];
        data: ConfigItemData;
    } & TargetWidgetId,
) => {
    if (item.type === DashTabItemType.GroupControl && item.data.group) {
        return item.data.group.map((groupItem) => groupItem.id);
    }

    if (item.type === DashTabItemType.Widget && item.data.tabs) {
        return item.data.tabs.map((tabItem) => tabItem.id);
    }

    // old selectors doesn't have tabs or group. widgetId is the only identifier
    const itemId = 'id' in item ? item.id : item.targetId;

    return itemId ? [itemId] : [];
};

export const getUpdatedConnections = ({
    item,
    connections,
    targetIds,
}: {
    item: ConfigItem;
    connections: ConnectionsData;
    targetIds: string[];
}) => {
    const copiedItemIds = collectWidgetItemIds(item);

    const idsDictionary = targetIds.reduce<Record<string, string>>(
        (dictionary, targetId, index) => {
            dictionary[targetId] = copiedItemIds[index];
            return dictionary;
        },
        {},
    );
    const copiedConnections: ConnectionsData = [];

    connections.forEach((connection) => {
        const replacedFromId = idsDictionary[connection.from];
        const replacedToId = idsDictionary[connection.to];

        if (replacedFromId || replacedToId) {
            copiedConnections.push({
                to: replacedToId || connection.to,
                from: replacedFromId || connection.from,
                kind: connection.kind,
            });
        }
    });

    return connections.concat(copiedConnections);
};
