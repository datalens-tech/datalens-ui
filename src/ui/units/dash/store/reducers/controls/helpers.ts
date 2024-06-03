import {i18n} from 'i18n';
import type {DashTab, DashTabItemGroupControl} from 'shared/types';

import type {SelectorDialogState} from '../../actions/dashTyped';

export const getActualUniqueFieldNameValidation = (
    group: SelectorDialogState[],
    fieldName?: string,
    validation?: string,
) => {
    if (!validation || !fieldName) {
        return undefined;
    }

    const fieldNameClones = group.filter((groupItem) => groupItem.fieldName === fieldName);

    if (fieldNameClones.length > 1) {
        const clonesTitles: string[] = [];
        fieldNameClones.forEach((item) => {
            if (item.title) {
                clonesTitles.push(item.title);
            }
        });
        return i18n('dash.control-dialog.edit', 'validation_field-name-unique', {
            selectorsNames: clonesTitles.join(', '),
        });
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
