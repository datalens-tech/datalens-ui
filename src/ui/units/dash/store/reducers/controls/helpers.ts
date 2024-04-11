import {i18n} from 'i18n';
import {DashTab, DashTabItemGroupControl} from 'shared/types';

import type {SelectorDialogState} from '../../actions/dashTyped';

export const getActualFieldNameValidation = (
    group: SelectorDialogState[],
    fieldName?: string,
    validation?: string,
) => {
    if (
        !validation ||
        validation !== i18n('dash.control-dialog.edit', 'validation_field-name-unique')
    ) {
        return validation;
    }

    const dublicateItemIndex = group.filter((groupItem) => groupItem.fieldName === fieldName);

    if (dublicateItemIndex.length > 1) {
        return validation;
    }

    return undefined;
};

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
