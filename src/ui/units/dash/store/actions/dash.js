import {lockedTextInfo} from 'components/RevisionsPanel/RevisionsPanel';
import {I18n} from 'i18n';
import {sdk} from 'libs/sdk';
import isEmpty from 'lodash/isEmpty';
import {DashSchemeConverter, EntryScope, Feature, extractEntryId} from 'shared';
import {closeDialog as closeDialogConfirm, openDialogConfirm} from 'store/actions/dialog';
import {MarkdownProvider, URL_QUERY, Utils} from 'ui';
import {getLoginOrIdFromLockedError, isEntryIsLockedError} from 'utils/errors/errorByCode';

import {DL, EMBEDDED_MODE} from '../../../../constants';
import ChartKit from '../../../../libs/DatalensChartkit';
import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {registry} from '../../../../registry';
import {showToast} from '../../../../store/actions/toaster';
import {ITEM_TYPE} from '../../containers/Dialogs/constants';
import {LOCK_DURATION, Mode} from '../../modules/constants';
import {collectDashStats} from '../../modules/pushStats';
import * as actionTypes from '../constants/dashActionTypes';
import {getFakeDashEntry} from '../utils';

import {SET_ERROR_MODE, SET_STATE, setDashViewMode, toggleTableOfContent} from './dashTyped';
import {
    DOES_NOT_EXIST_ERROR_TEXT,
    NOT_FOUND_ERROR_TEXT,
    prepareLoadedData,
    removeParamAndUpdate,
} from './helpers';

const i18n = I18n.keyset('dash.store.view');

const getBeforeOpenDialogItemAction = () => {
    const {beforeOpenItemDialog} = registry.dash.functions.getAll();
    return beforeOpenItemDialog;
};

export function purgeData(data) {
    const allTabsIds = new Set();
    const allItemsIds = new Set();
    const allWidgetTabsIds = new Set();

    return {
        ...data,
        tabs: data.tabs.map((tab) => {
            const {id: tabId, items: tabItems, layout, connections, aliases} = tab;

            const currentItemsIds = new Set();
            const currentWidgetTabsIds = new Set();
            const currentControlsIds = new Set();

            allTabsIds.add(tabId);

            const resultItems = tabItems
                // there are empty data
                .filter((item) => !isEmpty(item.data))
                .map((item) => {
                    const {id: itemId, type, data} = item;

                    allItemsIds.add(itemId);
                    currentItemsIds.add(itemId);

                    if (type === ITEM_TYPE.CONTROL) {
                        currentControlsIds.add(itemId);
                    } else if (type === ITEM_TYPE.WIDGET) {
                        data.tabs.forEach(({id: widgetTabId}) => {
                            allWidgetTabsIds.add(widgetTabId);
                            currentWidgetTabsIds.add(widgetTabId);
                        });
                    }

                    return item;
                });

            return {
                ...tab,
                items: resultItems,
                // since items is filtered above, then layout needs to be filtered as well.
                layout: layout.filter(({i}) => currentItemsIds.has(i)),
                connections: connections.filter(
                    ({from, to}) =>
                        // connections can only have elements with from or to
                        from &&
                        to &&
                        // there may be elements in connections that are no longer in items
                        (currentControlsIds.has(from) || currentWidgetTabsIds.has(from)) &&
                        (currentControlsIds.has(to) || currentWidgetTabsIds.has(to)),
                ),
                aliases: Object.entries(aliases).reduce((result, [key, value]) => {
                    result[key] = value
                        // the array of aliases can be null
                        .map((alias) => alias.filter(Boolean))
                        // there may be less than 2 elements in the alias array
                        .filter((alias) => alias.length > 1);
                    return result;
                }, {}),
            };
        }),
    };
}

export const setSelectStateMode = ({tabId: selectedTabId, stateHash, history, location}) => {
    return async function (dispatch, getState) {
        const {
            dash: {tabId: stateTabId},
        } = getState();

        const tabId = selectedTabId || stateTabId;

        const payload = {
            mode: Mode.SelectState,
        };

        const search = [];

        if (tabId) {
            payload.tabId = tabId;
            search.push(`tab=${tabId}`);
        }

        if (stateHash) {
            try {
                dispatch({type: SET_STATE, payload: {mode: Mode.Loading}});

                const {
                    dash: {
                        entry: {entryId},
                    },
                } = getState();

                const hashData = await getSdk()
                    .us.getDashState({entryId, hash: stateHash})
                    .catch((error) => {
                        logger.logError('getDashState failed', error);
                        console.error('STATE_LOAD', error);
                    });

                if (hashData) {
                    const {
                        data: {controls, ...states},
                    } = hashData;
                    payload.hashStates = {
                        [tabId]: {
                            hash: stateHash,
                            state: {...controls, ...states},
                        },
                    };
                    search.push(`state=${stateHash}`);
                }
            } catch (error) {
                logger.logError('dash: setSelectStateMode failed', error);
                console.error('MAILING_MODE_STATE', error);
            }
        }

        history.push({...location, search: `?${search.join('&')}`, hash: ''});
        dispatch({type: SET_STATE, payload});
    };
};

export const setLock = (entryId, force = false, noEditMode = false) => {
    return async function (dispatch) {
        const {lockToken} = await getSdk().us.createLock({
            entryId,
            data: {duration: LOCK_DURATION, force},
        });

        const payload = {lockToken};
        if (!noEditMode) {
            payload.mode = Mode.Edit;
        }

        dispatch({
            type: SET_STATE,
            payload,
        });
    };
};

export const deleteLock = () => {
    return async function (dispatch, getState) {
        const state = getState();

        if (!state.dash) {
            return;
        }

        const {lockToken, entry} = state.dash;

        const entryId = entry?.entryId || null;

        if (lockToken && entryId) {
            return getSdk()
                .us.deleteLock({
                    entryId: entryId,
                    params: {lockToken},
                })
                .then(() => {
                    dispatch(cleanLock());
                })
                .catch((error) => logger.logError('LOCK_DELETE', error));
        }
    };
};

export const setEditMode = (successCallback = () => {}, failCallback = () => {}) => {
    return async function (dispatch, getState) {
        const {
            dash: {
                entry: {entryId, savedId: stateSavedId, fake},
                mode,
            },
        } = getState();

        if (fake) {
            return;
        }

        try {
            const {savedId} = await getSdk().us.getEntryMeta({entryId});

            if (stateSavedId !== savedId) {
                dispatch(
                    openDialogConfirm({
                        onApply: () => {
                            location.reload();
                        },
                        message: i18n('label_obsolete-version'),
                        isWarningConfirm: true,
                        cancelButtonView: 'flat',
                        confirmButtonView: 'normal',
                        showIcon: false,
                        onCancel: () => {
                            failCallback();
                            dispatch(closeDialogConfirm());
                        },
                        widthType: 'medium',
                        confirmHeaderText: i18n('label_obsolete-dash'),
                        cancelButtonText: i18n('button_cancel'),
                        confirmButtonText: i18n('button_reload-page'),
                    }),
                );

                return;
            }

            await dispatch(setLock(entryId));
            successCallback();
        } catch (error) {
            if (isEntryIsLockedError(error)) {
                const loginOrId = getLoginOrIdFromLockedError(error);

                dispatch(
                    openDialogConfirm({
                        onApply: async () => {
                            try {
                                await dispatch(setLock(entryId, true));
                                dispatch(closeDialogConfirm());
                                successCallback();
                            } catch (error) {
                                dispatch(
                                    showToast({
                                        error,
                                        title: i18n('label_unexpected-error'),
                                    }),
                                );
                                failCallback();
                            }
                        },
                        message: lockedTextInfo(loginOrId, EntryScope.Dash),
                        isWarningConfirm: true,
                        cancelButtonView: 'flat',
                        confirmButtonView: 'normal',
                        showIcon: false,
                        onCancel: () => {
                            failCallback();
                            if (mode === Mode.Edit) {
                                dispatch(setDashViewMode());
                            }
                            dispatch(closeDialogConfirm());
                        },
                        widthType: 'medium',
                        confirmHeaderText: i18n('label_dash-is-editing'),
                        cancelButtonText: i18n('button_cancel'),
                        confirmButtonText: i18n('button_edit-anyway'),
                    }),
                );

                return;
            }

            dispatch(
                showToast({
                    error,
                    title: i18n('label_unexpected-error'),
                }),
            );
            failCallback();
        }
    };
};

export const cleanLock = () => ({type: SET_STATE, payload: {lockToken: null}});

/**
 * Loading dash data: dash config from us, dash state from us, and in parallel all datasets schemas, which is used in dash items
 * @param location
 * @param history
 * @param params
 * @returns {(function(*): Promise<void>)|*}
 */
export const load = ({location, history, params}) => {
    // eslint-disable-next-line complexity
    return async function (dispatch) {
        try {
            dispatch({
                type: SET_STATE,
                payload: {mode: Mode.Loading, error: null},
            });

            const {pathname, search} = location;

            const searchParams = new URLSearchParams(search);

            const entryId = extractEntryId(pathname);
            const isFakeEntry =
                !entryId && (pathname === '/dashboards/new' || pathname.startsWith('/workbooks/'));

            if (isFakeEntry) {
                removeParamAndUpdate(history, searchParams, URL_QUERY.TAB_ID);
                dispatch({
                    type: SET_STATE,
                    payload: getFakeDashEntry(params?.workbookId),
                });
                await dispatch(setEditMode());
                return;
            }

            if (!entryId) {
                throw new Error(NOT_FOUND_ERROR_TEXT);
            }

            const hash = searchParams.get('state');
            const revId = searchParams.get(URL_QUERY.REV_ID);
            const readDashParams = {
                includePermissionsInfo: true,
                includeLinks: true,
                branch: 'published',
            };

            if (revId) {
                readDashParams.revId = revId;
            }

            const [entry, hashData] = await Promise.all([
                sdk.charts.readDash({
                    id: entryId,
                    params: readDashParams,
                }),
                hash
                    ? getSdk()
                          .us.getDashState({
                              entryId,
                              hash,
                          })
                          .catch((error) => {
                              logger.logError('getDashState failed', error);
                              console.error('STATE_LOAD', error);
                          })
                    : null,
            ]);

            if (!entry?.entryId || entry?.scope !== EntryScope.Dash) {
                throw new Error(NOT_FOUND_ERROR_TEXT);
            }

            let data;
            let convertedEntryData;
            if (DashSchemeConverter.isUpdateNeeded(entry.data)) {
                dispatch({
                    type: SET_STATE,
                    payload: {mode: Mode.Updating},
                });
                data = prepareLoadedData(await DashSchemeConverter.update(entry.data));
                convertedEntryData = data;
            } else {
                data = prepareLoadedData(entry.data);
            }

            // fix try to open not dashboard entry
            if (!data.tabs) {
                throw new Error(NOT_FOUND_ERROR_TEXT);
            }

            // without await, they will start following each markdown separately
            await MarkdownProvider.init(data);

            let tabId = searchParams.has(URL_QUERY.TAB_ID)
                ? searchParams.get(URL_QUERY.TAB_ID)
                : data.tabs[0].id;
            let tabIndex = data.tabs.findIndex(({id}) => id === tabId);
            const widgetsCurrentTab = {};
            if (tabIndex === -1) {
                tabIndex = 0;
                tabId = data.tabs[0].id;
                removeParamAndUpdate(history, searchParams, URL_QUERY.TAB_ID);
            }

            data.tabs[tabIndex].items.forEach(({id: widgetId, data}) => {
                if (data.tabs && data.tabs.length > 1) {
                    const defaultTab = data.tabs.find(({isDefault}) => isDefault);
                    if (defaultTab) {
                        widgetsCurrentTab[widgetId] = defaultTab.id;
                    }
                }
            });

            let hashStates = {};
            if (hashData) {
                const {
                    data: {controls, ...states},
                } = hashData;
                hashStates = {
                    [tabId]: {
                        hash,
                        state: {...controls, ...states},
                    },
                };
            }

            const isEmptyDash = data.tabs.length === 1 && !data.tabs[0].items.length;
            const hasEditPermissions = entry?.permissions?.admin || entry?.permissions?.edit;
            const isOpenedActualRevision = !revId;
            const isAvailableEditMode =
                !Utils.isEnabledFeature(Feature.ReadOnlyMode) && !DL.IS_MOBILE;

            const mode =
                isEmptyDash && isOpenedActualRevision && hasEditPermissions && isAvailableEditMode
                    ? Mode.Edit
                    : Mode.View;

            collectDashStats({
                dashId: entryId,
                dashTabId: tabId,
                dashStateHash: hash,
            });

            if (data.settings) {
                if (!DL.IS_MOBILE) {
                    // Boolean is used to handle the case when there is no expandTOC setting in the object (undefined)
                    dispatch(toggleTableOfContent(Boolean(data.settings.expandTOC)));
                }

                if (data.settings.maxConcurrentRequests) {
                    ChartKit.setDataProviderSettings({
                        maxConcurrentRequests: data.settings.maxConcurrentRequests,
                    });
                }

                if (data.settings.loadPriority) {
                    ChartKit.setDataProviderSettings({
                        loadPriority: data.settings.loadPriority,
                    });
                }
            }

            dispatch({
                type: SET_STATE,
                payload: {
                    permissions: entry.permissions,
                    navigationPath: Utils.getNavigationPathFromKey(entry.key),
                    mode,
                    entry,
                    hashStates,
                    data,
                    convertedEntryData,
                    tabId,
                    stateHashId: hash,
                    currentRevId: entry.revId,
                    widgetsCurrentTab,
                },
            });

            if (mode === Mode.Edit) {
                await dispatch(setEditMode());
            }
        } catch (error) {
            logger.logError('load dash failed', error);

            const errorMessage = error?.response?.data?.message || error?.message;
            let errorParams = {
                code: errorMessage,
                status: error.request?.status,
            };

            if (
                errorMessage === NOT_FOUND_ERROR_TEXT ||
                errorMessage === DOES_NOT_EXIST_ERROR_TEXT
            ) {
                errorParams = {
                    code: errorMessage,
                    message: i18n('label_error-404-title'),
                    status: 404,
                    _manualError: true,
                };
                dispatch({
                    type: SET_ERROR_MODE,
                    payload: {
                        error: errorParams,
                    },
                });
            }

            dispatch({
                type: SET_STATE,
                payload: {
                    mode: Mode.Error,
                    error: errorParams,
                },
            });
        }
    };
};

export const save = (mode, isDraft = false) => {
    return async function (dispatch, getState) {
        try {
            const isPublishing = mode === 'publish';
            const {entry: prevEntry, data, lockToken} = getState().dash;

            const updateData = {
                id: prevEntry.entryId,
                data: {
                    lockToken,
                    mode: mode,
                    meta: isPublishing ? {is_release: true} : {},
                },
            };
            if (isDraft && isPublishing) {
                updateData.data.revId = prevEntry.revId;
            } else {
                updateData.data.data = purgeData(data);
            }
            const entry = await sdk.charts.updateDash(updateData);

            const newMaxConcurrentRequestsValue = entry.data.settings?.maxConcurrentRequests;
            const prevMaxConcurrentRequestsValue = prevEntry.data.settings?.maxConcurrentRequests;

            if (newMaxConcurrentRequestsValue !== prevMaxConcurrentRequestsValue) {
                ChartKit.setDataProviderSettings({
                    maxConcurrentRequests: newMaxConcurrentRequestsValue,
                });
            }

            dispatch({
                type: actionTypes.SAVE_DASH_SUCCESS,
                payload: {
                    mode: Mode.View,
                    data: entry.data,
                    convertedEntryData: null,
                    initialTabsSettings: null,
                    entry: {
                        ...prevEntry,
                        ...entry,
                    },
                },
            });
        } catch (error) {
            logger.logError('save dash failed', error);
            dispatch({type: actionTypes.SAVE_DASH_ERROR});
            throw error;
        }
    };
};

export const openDialog = (dialogType) => ({
    type: actionTypes.OPEN_DIALOG,
    payload: {openedDialog: dialogType},
});

export const openItemDialog = (data) => ({type: actionTypes.OPEN_ITEM_DIALOG, payload: data});

export const openItemDialogAndSetData = (data) => {
    return (dispatch) => {
        const beforeOpenItemDialog = getBeforeOpenDialogItemAction();
        dispatch(beforeOpenItemDialog(data));
        dispatch(openItemDialog(data));
    };
};

export const closeDialog = () => ({
    type: actionTypes.CLOSE_DIALOG,
    payload: {openedDialog: null, openedItemId: null},
});

export const setTabs = (tabs) => ({type: actionTypes.SET_TABS, payload: tabs});

export const setSettings = (settings) => ({type: actionTypes.SET_SETTINGS, payload: settings});

export const setCopiedItemData = (data) => ({
    type: actionTypes.SET_COPIED_ITEM_DATA,
    payload: {
        data,
    },
});

export const setCurrentTabData = (data) => ({
    type: actionTypes.SET_CURRENT_TAB_DATA,
    payload: data,
});

export const updateCurrentTabData = (data) => ({
    type: actionTypes.UPDATE_CURRENT_TAB_DATA,
    payload: data,
});

export const toggleFullscreenMode =
    ({history, location}) =>
    (dispatch, getState) => {
        const {
            dash: {isFullscreenMode},
        } = getState();
        const {search} = location;

        const searchParams = new URLSearchParams(search);

        if (isFullscreenMode) {
            searchParams.delete('mode');
        } else {
            searchParams.set('mode', EMBEDDED_MODE.TV);
        }

        history.replace({
            ...location,
            search: `?${searchParams.toString()}`,
        });

        dispatch({type: actionTypes.TOGGLE_FULLSCREEN_MODE});
    };
