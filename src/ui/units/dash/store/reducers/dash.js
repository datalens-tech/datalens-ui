import {DashKit, generateUniqId} from '@gravity-ui/dashkit';
import {I18n} from 'i18n';
import update from 'immutability-helper';
import pick from 'lodash/pick';
import {DashTabItemControlSourceType, DashTabItemType, Feature} from 'shared';
import {getRandomKey} from 'ui/libs/DatalensChartkit/helpers/helpers';
import {ELEMENT_TYPE} from 'units/dash/containers/Dialogs/Control/constants';
import Utils from 'utils';

import {EMBEDDED_MODE} from '../../../../constants/embedded';
import {CONTROLS_PLACEMENT_MODE} from '../../containers/Dialogs/constants';
import {Mode} from '../../modules/constants';
import {getUniqIdsFromDashData} from '../../modules/helpers';
import * as actionTypes from '../constants/dashActionTypes';

import {dashTypedReducer} from './dashTypedReducer';

const i18n = I18n.keyset('dash.store.view');

export const TAB_PROPERTIES = ['id', 'title', 'items', 'layout', 'connections', 'aliases'];

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
    lastUsedDatasetId: null,

    selectorDialog: getSelectorDialogInitialState(),
    selectorsGroup: getGroupSelectorDialogInitialState(),
    activeSelectorIndex: 0,

    skipReload: false,
};

export function getGroupSelectorDialogInitialState() {
    return {
        items: [],
        id: getRandomKey(),
    };
}

export function getSelectorDialogInitialState(args = {}) {
    const required = Utils.isEnabledFeature(Feature.SelectorRequiredValue) ? {required: false} : {};

    return {
        elementType: ELEMENT_TYPE.SELECT,
        sourceType: DashTabItemControlSourceType.Dataset,
        validation: {},
        defaults: {},
        datasetId: args.lastUsedDatasetId,
        connectionId: args.lastUsedConnectionId,
        showTitle: true,
        placementMode: CONTROLS_PLACEMENT_MODE.AUTO,
        width: '',
        id: getRandomKey(),
        ...required,
    };
}

export function getSelectorDialogFromData(data, defaults) {
    return {
        validation: {},
        isManualTitle: true,

        defaults,

        title: data.title,
        sourceType: data.sourceType,
        autoHeight: data.autoHeight,

        datasetId: data.source.datasetId,
        connectionId: data.source.connectionId,
        connectionQueryType: data.source.connectionQueryType,
        connectionQueryTypes: data.source.connectionQueryTypes,
        elementType: data.source.elementType || ELEMENT_TYPE.SELECT,
        defaultValue: data.source.defaultValue,
        datasetFieldId: data.source.datasetFieldId,
        showTitle: data.source.showTitle,
        multiselectable: data.source.multiselectable,
        isRange: data.source.isRange,
        fieldName: data.source.fieldName,
        fieldType: data.source.fieldType,
        datasetFieldType: data.source.datasetFieldType,
        acceptableValues: data.source.acceptableValues,
        chartId: data.source.chartId,
        operation: data.source.operation,
        innerTitle: data.source.innerTitle,
        showInnerTitle: data.source.showInnerTitle,
        id: data.id || getRandomKey(),
        required: data.source.required,
    };
}

export function getSelectorGroupDialogFromData(data, defaults) {
    const items = Object.values(data.items)
        .map((item) => ({
            validation: {},
            isManualTitle: true,

            title: item.title,
            sourceType: item.sourceType,

            datasetId: item.source.datasetId,
            elementType: item.source.elementType || ELEMENT_TYPE.SELECT,
            defaultValue: item.source.defaultValue,
            datasetFieldId: item.source.datasetFieldId,
            showTitle: item.source.showTitle,
            multiselectable: item.source.multiselectable,
            isRange: item.source.isRange,
            fieldName: item.source.fieldName,
            fieldType: item.source.fieldType,
            datasetFieldType: item.source.datasetFieldType,
            acceptableValues: item.source.acceptableValues,
            chartId: item.source.chartId,
            operation: item.source.operation,
            innerTitle: item.source.innerTitle,
            showInnerTitle: item.source.showInnerTitle,
            id: item.id || getRandomKey(),
            required: item.source.required,
            placementMode: item.placementMode || CONTROLS_PLACEMENT_MODE.AUTO,
            width: item.width || '',
        }))
        .sort((a, b) => a.index - b.index);

    return {
        defaults,

        autoHeight: data.autoHeight,
        buttonApply: data.buttonApply,
        buttonReset: data.buttonReset,

        id: data.id || getRandomKey(),

        items,
    };
}

// eslint-disable-next-line complexity
function dash(state = initialState, action) {
    const {data, tabId} = state;

    const tabIndex = data ? data.tabs.findIndex(({id}) => id === tabId) : -1;
    const tab = tabIndex === -1 ? null : data.tabs[tabIndex];

    switch (action.type) {
        case actionTypes.SAVE_DASH_SUCCESS:
        case actionTypes.SAVE_DASH_ERROR:
        case actionTypes.CLOSE_DIALOG:
            return {
                ...state,
                selectorsGroup: getGroupSelectorDialogInitialState(),
                ...action.payload,
            };
        case actionTypes.OPEN_DIALOG: {
            const selectorDialog =
                action.payload?.openedDialog === DashTabItemType.Control ||
                action.payload?.openedDialog === DashTabItemType.GroupControl
                    ? getSelectorDialogInitialState({
                          lastUsedDatasetId: state.lastUsedDatasetId,
                          lastUsedConnectionId: state.lastUsedConnectionId,
                      })
                    : state.selectorDialog;

            if (
                Utils.isEnabledFeature(Feature.GroupControls) &&
                action.payload?.openedDialog === DashTabItemType.GroupControl
            ) {
                // TODO: move to getSelectorDialogInitialState after the release of the feature
                selectorDialog.title = i18n('label_selector-dialog');
            }

            return {
                ...state,
                ...action.payload,
                selectorDialog,
                selectorsGroup: {
                    items: [selectorDialog],
                    autoHeight: Boolean(selectorDialog.autoHeight),
                    buttonApply: Boolean(selectorDialog.buttonApply),
                    buttonReset: Boolean(selectorDialog.buttonReset),
                    defaults: selectorDialog.defaults,
                },
                activeSelectorIndex: 0,
            };
        }
        case actionTypes.SET_SETTINGS:
            return {...state, data: update(data, {settings: {$set: action.payload}})};
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
                item: action.payload.data,
                config: {...tab, salt: data.salt, counter: data.counter},
                options: {
                    excludeIds: getUniqIdsFromDashData(data),
                },
            });

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
                    operation: action.payload.operation,
                    ...(action.payload.defaults ? {defaults: action.payload.defaults} : null),
                },
                config: {...tab, salt: data.salt, counter: data.counter},
                options: {
                    excludeIds: getUniqIdsFromDashData(data),
                },
            });

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
        case actionTypes.OPEN_ITEM_DIALOG: {
            const payload = action.payload;
            const {id: openedItemId, data, defaults} = payload;
            let {type: openedDialog} = tab.items.find(({id}) => id === openedItemId);

            const newState = {
                ...state,
                openedItemId,
                activeSelectorIndex: 0,
            };

            if (
                Utils.isEnabledFeature(Feature.GroupControls) &&
                openedDialog === 'control' &&
                data.sourceType !== 'external'
            ) {
                const selectorDialog = getSelectorDialogFromData(data, defaults);
                selectorDialog.title =
                    data.source.innerTitle && data.source.showInnerTitle
                        ? `${data.title} ${data.source.innerTitle}`
                        : data.title;

                // migration forward to group
                openedDialog = 'group_control';
                newState.selectorsGroup = {
                    autoHeight: Boolean(data.autoHeight),
                    buttonApply: false,
                    buttonReset: false,
                    items: [selectorDialog],
                };
                newState.selectorDialog = selectorDialog;
            } else if (openedDialog === 'group_control') {
                newState.selectorsGroup = getSelectorGroupDialogFromData(data, defaults);
                newState.selectorDialog = newState.selectorsGroup.items[0];
            } else if (openedDialog === 'control') {
                newState.selectorDialog = getSelectorDialogFromData(data, defaults);
            }

            newState.openedDialog = openedDialog;

            return newState;
        }

        default:
            return dashTypedReducer(state, action);
    }
}

export default dash;
