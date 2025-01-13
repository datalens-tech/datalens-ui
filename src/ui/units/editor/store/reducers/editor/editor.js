import {i18n} from 'i18n';
import _get from 'lodash/get';
import {createSelector} from 'reselect';
import {showToast} from 'store/actions/toaster';
import {DL, URL_QUERY} from 'ui';
import history from 'ui/utils/history';

import {ENTRY_TYPES} from '../../../../../../shared';
import {navigateHelper} from '../../../../../libs';
import logger from '../../../../../libs/logger';
import {getSdk} from '../../../../../libs/schematic-sdk';
import {UrlSearch} from '../../../../../utils';
import {EditorUrls, Status, TOASTER_TYPE, UPDATE_ENTRY_MODE} from '../../../constants/common';
import {RevisionAction} from '../../../types/revisions';
import {isEntryLatest} from '../../../utils/utils';
import {ComponentName, componentStateChange} from '../../actions';
import {imm} from '../../update';

import {editorTypedReducer} from './editorTypedReducer';
import {Helper} from './helper';

/* --- ACTIONS --- */
const INITIAL_LOAD_LOADING = Symbol('editor/INITIAL_LOAD_LOADING');
const INITIAL_LOAD_SUCCESS = Symbol('editor/INITIAL_LOAD_SUCCESS');
const INITIAL_LOAD_FAILED = Symbol('editor/INITIAL_LOAD_FAILED');
export const initialLoading = (payload) => (dispatch) => {
    dispatch({
        type: INITIAL_LOAD_LOADING,
        payload,
    });
};
export const fetchInitialLoad = ({id, template, location}) => {
    return async function (dispatch, getState) {
        const {search} = location;
        let settings = getState().editor.settings;
        let entry = null;
        try {
            const urlSearch = new UrlSearch(search);
            if (id) {
                const revId = urlSearch.get(URL_QUERY.REV_ID_OLD);
                const entryData = await getSdk().sdk.us.getEntry({
                    entryId: id,
                    includePermissionsInfo: true,
                    revId,
                });
                entry = {
                    ...entryData,
                };
            } else {
                const searchCurrentPath = urlSearch.get(URL_QUERY.CURRENT_PATH);
                let path = searchCurrentPath || DL.USER_FOLDER;
                path = path.endsWith('/') ? path : `${path}/`;
                let entryData;
                if (template.empty) {
                    entryData = Helper.getEmptyTemplate();
                } else {
                    entryData = template;
                }
                entry = {
                    ...entryData,
                    entryId: null,
                    fake: true,
                    key: `${path}${i18n('editor.common.view', 'label_new-chart')}`,
                    permissions: {read: true, edit: true, admin: true},
                };
                const defaultPath = urlSearch.getNormalized(URL_QUERY.CURRENT_PATH);
                settings = {...settings, defaultPath: defaultPath ? defaultPath : DL.USER_FOLDER};
            }

            if (!ENTRY_TYPES.editor.includes(entry.type)) {
                const {pathname} = new URL(navigateHelper.redirectUrlSwitcher(entry));
                history.replace({pathname, search});

                return;
            }

            const {tabs, scriptsValues} = Helper.createTabData(entry);
            const gridData = Helper.createGridData({
                tabs,
                settings,
                entry,
                queryActiveTab: urlSearch.getNormalized(URL_QUERY.ACTIVE_TAB),
            });
            dispatch({
                type: INITIAL_LOAD_SUCCESS,
                payload: {
                    status: Status.Success,
                    entry,
                    tabs,
                    scriptsValues,
                    ...gridData,
                    chart: null,
                },
            });
        } catch (error) {
            logger.logError('editor: fetchInitialLoad failed', error);
            dispatch({
                type: INITIAL_LOAD_FAILED,
                payload: {
                    status: Status.Failed,
                    entry,
                    error,
                },
            });
        }
    };
};

const CREATE_ENTRY = Symbol('editor/ENTRY_CREATE');
export const createEditorChart = (entry, history) => {
    return function (dispatch) {
        dispatch({
            type: CREATE_ENTRY,
            payload: {
                entry: {...entry, fake: false},
            },
        });
        history.replace(`${EditorUrls.Base}/${entry.entryId}`);
        dispatch(
            showToast({
                name: 'success_update_chart_editor',
                type: TOASTER_TYPE.SUCCESS,
                title: i18n('editor.notifications.view', 'toast_save-editor-chart-success'),
            }),
        );
    };
};

const EDITOR_CHART_UPDATE_LOADING = Symbol('editor/EDITOR_CHART_UPDATE_LOADING');
const EDITOR_CHART_UPDATE_SUCCESS = Symbol('editor/EDITOR_CHART_UPDATE_SUCCESS');
const EDITOR_CHART_UPDATE_FAILED = Symbol('editor/EDITOR_CHART_UPDATE_FAILED');
export const fetchEditorChartUpdate = ({mode, release, history, location}) => {
    return async function (dispatch, getState) {
        const {
            editor: {entry, scriptsValues},
        } = getState();
        const {pathname, search} = location;
        try {
            dispatch({type: EDITOR_CHART_UPDATE_LOADING});
            dispatch(
                componentStateChange({name: ComponentName.ButtonSave, data: {progress: true}}),
            );
            const meta = release ? {...entry.meta, is_release: true} : {...entry.meta};
            const updatedEntry = await getSdk().sdk.mix.updateEditorChart({
                mode,
                data: Helper.formEntryData({scriptsValues, entry}),
                entryId: entry.entryId,
                meta,
            });
            dispatch({
                type: EDITOR_CHART_UPDATE_SUCCESS,
                payload: {
                    entry: updatedEntry,
                },
            });
            dispatch(
                componentStateChange({name: ComponentName.ButtonSave, data: {progress: false}}),
            );
            const urlSearch = new UrlSearch(search);
            const query = isEntryLatest(updatedEntry)
                ? urlSearch.delete(URL_QUERY.REV_ID_OLD).toString()
                : urlSearch.set(URL_QUERY.REV_ID_OLD, updatedEntry.revId).toString();
            history.replace(`${pathname}${query}`);
            dispatch(
                showToast({
                    name: 'success_update_chart_editor',
                    type: TOASTER_TYPE.SUCCESS,
                    title: i18n(
                        'editor.notifications.view',
                        mode === UPDATE_ENTRY_MODE.SAVE
                            ? 'toast_save-editor-chart-success'
                            : 'toast_publish-editor-chart-success',
                    ),
                }),
            );
        } catch (error) {
            logger.logError('editor: updateEditorChart failed', error);
            dispatch({type: EDITOR_CHART_UPDATE_FAILED});
            dispatch(
                componentStateChange({name: ComponentName.ButtonSave, data: {progress: false}}),
            );
            const title = i18n(
                'editor.notifications.view',
                mode === UPDATE_ENTRY_MODE.SAVE
                    ? 'toast_save-editor-chart-failed'
                    : 'toast_publish-editor-chart-failed',
            );
            dispatch(
                showToast({
                    title,
                    error,
                    name: 'failed_update_chart_editor',
                }),
            );
        }
    };
};

const REVISION_CHANGE_LOADING = Symbol('editor/REVISION_CHANGE_LOADING');
const REVISION_CHANGE_SUCCESS = Symbol('editor/REVISION_CHANGE_SUCCESS');
const REVISION_CHANGE_FAILED = Symbol('editor/REVISION_CHANGE_FAILED');
export const fetchRevisionChange = ({revisionEntry, action}, history, location) => {
    return async function (dispatch) {
        const {pathname, search} = location;
        try {
            const {revId, entryId} = revisionEntry;
            dispatch({type: REVISION_CHANGE_LOADING});
            dispatch(
                componentStateChange({
                    name: ComponentName.DialogRevisions,
                    data: {progress: {action, revId}},
                }),
            );
            let entryData = {};
            let scriptsValues = {};
            let chart;
            const urlSearch = new UrlSearch(search);
            switch (action) {
                case RevisionAction.Open: {
                    entryData = await getSdk().sdk.us.getEntry({
                        entryId,
                        includePermissionsInfo: true,
                        revId,
                    });
                    const tabData = Helper.createTabData(entryData);
                    scriptsValues = tabData.scriptsValues;
                    chart = null;
                    const query = isEntryLatest(entryData)
                        ? urlSearch.delete(URL_QUERY.REV_ID_OLD).toString()
                        : urlSearch.set(URL_QUERY.REV_ID_OLD, entryData.revId).toString();
                    history.replace(`${pathname}${query}`);
                    break;
                }
                case RevisionAction.Publish: {
                    const publishedEntry = await getSdk().sdk.mix.updateEditorChart({
                        mode: UPDATE_ENTRY_MODE.PUBLISH,
                        entryId,
                        revId,
                    });
                    entryData = {publishedId: publishedEntry.publishedId};
                    break;
                }
                case RevisionAction.Reset: {
                    const clonedEntry = await getSdk().sdk.us.getEntry({
                        entryId,
                        includePermissionsInfo: true,
                        revId,
                    });
                    const tabData = Helper.createTabData(clonedEntry);
                    scriptsValues = tabData.scriptsValues;
                    chart = null;
                    entryData = await getSdk().sdk.mix.updateEditorChart({
                        mode: UPDATE_ENTRY_MODE.SAVE,
                        entryId,
                        data: Helper.formEntryData({scriptsValues, entry: clonedEntry}),
                    });
                    const query = urlSearch.delete(URL_QUERY.REV_ID_OLD).toString();
                    history.replace(`${pathname}${query}`);
                    break;
                }
            }
            dispatch({
                type: REVISION_CHANGE_SUCCESS,
                payload: {entry: entryData, scriptsValues, chart},
            });
            dispatch(
                componentStateChange({name: ComponentName.DialogRevisions, data: {progress: null}}),
            );
            showToast({
                name: 'success_change_revision',
                type: TOASTER_TYPE.SUCCESS,
                title: i18n(
                    'editor.notifications.view',
                    {
                        [RevisionAction.Open]: 'toast_open-editor-chart-success',
                        [RevisionAction.Publish]: 'toast_publish-editor-chart-success',
                        [RevisionAction.Reset]: 'toast_reset-editor-chart-success',
                    }[action],
                ),
            });
        } catch (error) {
            logger.logError('editor: fetchRevisionChange failed', error);
            dispatch({type: REVISION_CHANGE_FAILED});
            dispatch(
                componentStateChange({name: ComponentName.DialogRevisions, data: {progress: null}}),
            );
            const title = i18n(
                'editor.notifications.view',
                {
                    [RevisionAction.Open]: 'toast_open-editor-chart-failed',
                    [RevisionAction.Publish]: 'toast_publish-editor-chart-failed',
                    [RevisionAction.Reset]: 'toast_reset-editor-chart-failed',
                }[action],
            );
            dispatch(
                showToast({
                    title,
                    error,
                    name: 'failed_change_revision',
                }),
            );
        }
    };
};

export const UPDATE_EDITOR_ENTRY = Symbol('editor/UPDATE_EDITOR_ENTRY');

export const updateEditorEntry = (entry) => {
    return {
        type: UPDATE_EDITOR_ENTRY,
        payload: {entry},
    };
};

/* --- REDUCER --- */
export const editorInitialState = {
    status: Status.Loading,
    error: null,
    settings: {
        counter: 0, // needed to generate unique ids using hashids utility
        defaultPath: DL.USER_FOLDER,
    },
    entry: null,
    chart: null,
    grid: null,
    panes: null,
    tabs: null,
    // to optimize the value update
    // ids - from tabs.byId
    scriptsValues: null,
    paneViews: Helper.createPaneViewsData(),
};

function editorReducer(state, action) {
    switch (action.type) {
        case EDITOR_CHART_UPDATE_SUCCESS:
        case CREATE_ENTRY:
        case UPDATE_EDITOR_ENTRY: {
            const {entry} = action.payload;
            return imm.update(state, {
                entry: {$merge: entry},
            });
        }
        case REVISION_CHANGE_SUCCESS: {
            const {payload} = action;
            return imm.update(
                state,
                Object.keys(payload).reduce((acc, key) => {
                    const data = payload[key];
                    if (data !== undefined) {
                        acc[key] =
                            Array.isArray(data) || data === null ? {$set: data} : {$merge: data};
                    }
                    return acc;
                }, {}),
            );
        }
        case INITIAL_LOAD_LOADING:
        case INITIAL_LOAD_SUCCESS:
        case INITIAL_LOAD_FAILED: {
            return {...state, ...action.payload};
        }
        default: {
            return state;
        }
    }
}

export default function reducer(state = editorInitialState, action) {
    const editorState = editorReducer(state, action);
    return editorTypedReducer(editorState, action);
}

/* --- SELECTORS --- */
export const getEditorStatus = (state) => state.editor.status;
export const getEditorPageError = (state) => state.editor.error;
export const getScriptValue = (state, props) => state.editor.scriptsValues[props.id];
export const getScriptOriginalValue = (state, props) => state.editor.entry.data[props.id] || '';
export const getCurrentSchemeId = (state) => _get(state.editor.grid, ['scheme']);
export const getGridPanesIds = (state) => state.editor.grid.panes;
export const getEntry = (state) => state.editor.entry;
export const getChart = (state) => state.editor.chart;
export const getScriptsValues = (state) => state.editor.scriptsValues;

export const getIsScriptsChanged = createSelector(
    [getEntry, getScriptsValues],
    (entry, scriptsValues) => {
        if (entry.meta?.is_sandbox_version_changed) {
            delete entry.meta.is_sandbox_version_changed;
            return true;
        }
        return Object.keys(scriptsValues).some(
            (key) => (entry.data[key] || '') !== scriptsValues[key],
        );
    },
);
export const getLogsData = createSelector([getChart], (chart) => {
    const chartData = chart || {};
    return {
        logs: chartData.logs,
        stackTrace: chartData.stackTrace,
    };
});
const getPaneCurrentTabId = (state, props) => state.editor.panes.byId[props.paneId].currentTab;
const getTabsAllIds = (state) => state.editor.tabs.allIds;
const getTabsById = (state) => state.editor.tabs.byId;
export const getTabsData = createSelector([getTabsAllIds, getTabsById], (tabsIds, tabsById) => {
    return tabsIds.map((id) => tabsById[id]);
});
export const makeGetPaneTabs = () =>
    createSelector(
        [getTabsAllIds, getTabsById, getPaneCurrentTabId],
        (tabsIds, tabsById, currentTabId) => {
            return currentTabId === null ? [] : tabsIds.map((id) => tabsById[id]);
        },
    );
export const makeGetPaneTabData = () =>
    createSelector([getTabsById, getPaneCurrentTabId], (tabsById, currentTabId) => {
        return currentTabId === null ? undefined : tabsById[currentTabId];
    });

const getPaneViewsById = (state) => state.editor.paneViews.byId;
const getPaneCurrentViewId = (state, props) => state.editor.panes.byId[props.paneId].view;
export const makeGetPaneView = () =>
    createSelector([getPaneViewsById, getPaneCurrentViewId], (paneViewsById, currentViewId) => {
        return paneViewsById[currentViewId];
    });
export const getDefaultPath = (state) => state.editor.settings.defaultPath;
