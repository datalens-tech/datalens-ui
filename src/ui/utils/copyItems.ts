import type {ConfigItem, ConfigItemData} from '@gravity-ui/dashkit';
import {DashTabItemType} from 'shared/types';
import type {ConnectionsData} from 'ui/units/dash/containers/Dialogs/DialogRelations/types';

export const collectWidgetItemIds = (item: {
    type: ConfigItem['type'];
    data: ConfigItemData;
    targetId?: string;
    id?: string;
}) => {
    if (item.type === DashTabItemType.GroupControl && item.data.group) {
        return item.data.group.map((groupItem) => groupItem.id);
    }

    if (item.type === DashTabItemType.Widget && item.data.tabs) {
        return item.data.tabs.map((tabItem) => tabItem.id);
    }

    // old selectors doesn't have tabs or group. widgetId is the only identifier
    // dashkit save item.targetId in localStorage on copy and item.id is taken from Dashkit.setItem
    const itemId = item.targetId || item.id;

    return itemId ? [itemId] : [];
};

export const getUpdatedConnections = ({
    item,
    connections,
    originalIds,
}: {
    item: ConfigItem;
    connections: ConnectionsData;
    originalIds: string[];
}) => {
    const copiedItemIds = collectWidgetItemIds(item);

    const idsDictionary: Record<string, string> = {};
    const copiedConnections: ConnectionsData = [];

    originalIds.forEach((originalId, index) => {
        idsDictionary[originalId] = copiedItemIds[index];
    });

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
