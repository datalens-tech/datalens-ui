import {DashKit} from '@gravity-ui/dashkit';
import {generateUniqId} from '@gravity-ui/dashkit/helpers';
import update from 'immutability-helper';
import pick from 'lodash/pick';
import {DashTabItemType} from 'shared';
import {migrateConnectionsForGroupControl} from 'ui/store/utils/controlDialog';
import {getUpdatedConnections} from 'ui/utils/copyItems';

import {EMBEDDED_MODE} from '../../../../constants/embedded';
import {Mode} from '../../modules/constants';
import {getUniqIdsFromDashData} from '../../modules/helpers';
import * as actionTypes from '../constants/dashActionTypes';

import {dashTypedReducer} from './dashTypedReducer';

export const TAB_PROPERTIES = [
    'id',
    'title',
    'items',
    'layout',
    'connections',
    'aliases',
    'settings',
];

const initialState = {
    mode: Mode.Loading,

    entry: null,
    data: null,

    permissions: null,
    navigationPath: null,

    // for the case when the config was updated, and in editing mode, you need to immediately show the active Save,
    // and when Canceling, switch to the converted data, and not to the one in entry
    convertedEntryData: null,

    tabId: null,

    hashStates: null,

    openedDialog: null,
    openedItemId: null,

    showTableOfContent: false,

    dashKitRef: null,

    lockToken: null,

    // TODO: not yet MODE.ERROR is not used, but it is worth resetting to null
    error: null,

    isFullscreenMode: new URLSearchParams(window.location.search).get('mode') === EMBEDDED_MODE.TV,

    skipReload: false,

    widgetsCurrentTab: {},
};

// eslint-disable-next-line complexity
function dash(state = initialState, action) {
    const {data, tabId} = state;

    const tabIndex = data ? data.tabs.findIndex(({id}) => id === tabId) : -1;
    const tab = tabIndex === -1 ? null : data.tabs[tabIndex];

    switch (action.type) {
        case actionTypes.SET_TABS: {
            let counter = data.counter;

            const salt = data.salt;
            const dashDataUniqIds = getUniqIdsFromDashData(data);

            const newTabs = action.payload.map((tab) => {
                let tabItem = null;
                const idsMapper = {};

                if (tab.id) {
                    tabItem = tab;
                } else if (tab.duplicatedFrom) {
                    const tabForDuplication = state.data.tabs.find(
                        ({id}) => id === tab.duplicatedFrom,
                    );

                    const uniqTabIdData = generateUniqId({salt, counter, ids: dashDataUniqIds});
                    counter = uniqTabIdData.counter;

                    const newTabId = uniqTabIdData.id;

                    const items = tabForDuplication.items.map((item) => {
                        let widgetItem = null;
                        const uniqItemIdData = generateUniqId({
                            salt,
                            counter,
                            ids: dashDataUniqIds,
                        });
                        counter = uniqItemIdData.counter;

                        const itemId = uniqItemIdData.id;

                        idsMapper[item.id] = itemId;

                        if (item.type === 'widget') {
                            widgetItem = {
                                ...item,
                                id: itemId,
                                data: {
                                    ...item.data,
                                    tabs: item.data.tabs.map((entity) => {
                                        const uniqEntityIdData = generateUniqId({
                                            salt,
                                            counter,
                                            ids: dashDataUniqIds,
                                        });
                                        counter = uniqEntityIdData.counter;

                                        const entityId = uniqEntityIdData.id;

                                        idsMapper[entity.id] = entityId;

                                        return {
                                            ...entity,
                                            id: entityId,
                                        };
                                    }),
                                },
                            };
                        } else {
                            widgetItem = {...item, id: itemId};
                        }

                        return widgetItem;
                    });

                    tabItem = {
                        id: newTabId,
                        title: tab.title,
                        aliases: {...tabForDuplication.aliases},
                        layout: tabForDuplication.layout.map((layoutItem) => ({
                            ...layoutItem,
                            i: idsMapper[layoutItem.i],
                        })),
                        connections: tabForDuplication.connections
                            // there may be elements in connections that are no longer in items
                            .filter(({from, to}) => idsMapper[from] && idsMapper[to])
                            .map(({from, to, kind}) => ({
                                from: idsMapper[from],
                                to: idsMapper[to],
                                kind,
                            })),
                        items,
                    };
                } else {
                    const uniqTabIdData = generateUniqId({salt, counter, ids: dashDataUniqIds});
                    counter = uniqTabIdData.counter;

                    tabItem = {id: uniqTabIdData.id, ...tab};
                }

                return tabItem;
            });

            let newTabId = tabId;

            if (tabIndex > newTabs.length - 1) {
                newTabId = newTabs[newTabs.length - 1].id;
            } else if (!newTabs.some(({id}) => id === tabId)) {
                newTabId = newTabs[tabIndex].id;
            }

            const updateData = {
                tabs: {$set: newTabs},
                counter: {$set: counter},
            };

            return {
                ...state,
                data: update(data, updateData),
                tabId: newTabId,
            };
        }
        case actionTypes.SET_CURRENT_TAB_DATA:
            return {
                ...state,
                data: update(data, {
                    tabs: {
                        [tabIndex]: {
                            $set: pick(action.payload, TAB_PROPERTIES),
                        },
                    },
                }),
            };
        case actionTypes.UPDATE_CURRENT_TAB_DATA:
            return {
                ...state,
                data: update(data, {
                    tabs: {
                        [tabIndex]: {
                            $merge: pick(action.payload, TAB_PROPERTIES),
                        },
                    },
                }),
            };
        case actionTypes.SET_COPIED_ITEM_DATA: {
            const tabData = DashKit.setItem({
                item: action.payload.item,
                config: {...tab, salt: data.salt, counter: data.counter},
                options: {
                    ...action.payload.options,
                    excludeIds: getUniqIdsFromDashData(data),
                },
            });

            const {targetDashTabId, targetEntryId, targetIds} = action.payload.context;

            // Duplicate connections only if it's the same tab as targetItem
            if (
                tabId === targetDashTabId &&
                state.entry.entryId === targetEntryId &&
                targetIds?.length
            ) {
                const copiedItem = tabData.items[tabData.items.length - 1];

                const updatedConnections = getUpdatedConnections({
                    connections: tabData.connections,
                    targetIds,
                    item: copiedItem,
                });

                tabData.connections = updatedConnections;
            }

            return {
                ...state,
                data: update(data, {
                    tabs: {
                        [tabIndex]: {$set: pick(tabData, TAB_PROPERTIES)},
                    },
                    counter: {$set: tabData.counter},
                }),
            };
        }
        case actionTypes.SET_ITEM_DATA: {
            const tabData = DashKit.setItem({
                item: {
                    id: state.openedItemId,
                    type: action.payload.type || state.openedDialog,
                    data: action.payload.data,
                    namespace: action.payload.namespace,
                    layout: state.dragOperationProps?.itemLayout,
                    ...(action.payload.defaults ? {defaults: action.payload.defaults} : null),
                },
                config: {...tab, salt: data.salt, counter: data.counter},
                options: {
                    excludeIds: getUniqIdsFromDashData(data),
                    updateLayout: state.dragOperationProps?.newLayout,
                },
            });

            // migration of connections if old selector becomes a group selector
            // 1. state.openedItemId existance means that widget already exist
            // 2. !action.payload.data.group[0].id - first selector doesn't have an id because it was just converted
            if (
                state.openedItemId &&
                action.payload.type === DashTabItemType.GroupControl &&
                !action.payload.data.group[0].id
            ) {
                tabData.connections = migrateConnectionsForGroupControl({
                    openedItemId: state.openedItemId,
                    currentTab: tab,
                    tabDataItems: tabData.items,
                });
            }

            return {
                ...state,
                data: update(data, {
                    tabs: {
                        [tabIndex]: {$set: pick(tabData, TAB_PROPERTIES)},
                    },
                    counter: {$set: tabData.counter},
                }),
            };
        }

        default:
            return dashTypedReducer(state, action);
    }
}

export default dash;
