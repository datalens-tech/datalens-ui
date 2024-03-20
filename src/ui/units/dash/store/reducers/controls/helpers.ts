import {DashTab, DashTabItemGroupControl} from 'shared/types';

export const migrateConnectionsForGroupControl = ({
    openedItemId,
    currentTab,
    tabDataItems,
}: {
    openedItemId: string;
    currentTab: DashTab;
    tabDataItems: DashTab['items'];
}) => {
    const updatedItem = tabDataItems.find(({id}) => id === openedItemId) as DashTabItemGroupControl;
    const newConnectionId = updatedItem.data.group[0].id;

    const migratedConnections = currentTab.connections.map((connection) => {
        if (connection.to === openedItemId) {
            return {...connection, to: newConnectionId};
        }
        if (connection.from === openedItemId) {
            return {...connection, from: newConnectionId};
        }
        return connection;
    });

    return migratedConnections;
};
