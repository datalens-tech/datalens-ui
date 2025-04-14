import _ from 'lodash';

import {PANE_VIEWS, Status} from '../../../constants/common';
import type {EditorEntry, EditorFakeEntry} from '../../../types/common';
import {swapArrayElements} from '../../../utils';
import type {EditorActions} from '../../actions';
import {
    CHART_SET_LOADED_DATA,
    EDITOR_CODE_CHANGE,
    GRID_SCHEME_SELECT,
    PANES_SWITCH,
    PANE_TAB_SELECT,
    PANE_VIEW_SELECT,
    PREVIEW_DRAW,
    SET_ENTRY_KEY,
} from '../../actions';
import type {AutoExtendCommand} from '../../update';
import {imm} from '../../update';

import {GridStorage} from './gridStorage';
import {Helper} from './helper';

export type EditorState = {
    status: Status;
    settings: {
        counter: number;
        defaultPath: string;
    };
    scriptsValues: null | Record<string, string>;
    grid: null | {
        panes: string[];
        scheme: string;
    };
    panes: null | {
        byId: Record<
            string,
            {
                id: string;
                view: string;
                currentTab: string | null;
            }
        >;
        allIds: string[];
    };
    tabs: null | {
        byId: Record<
            string,
            {
                id: string;
                name: string;
                language: string;
                docs?: {
                    path: string;
                    title: string;
                }[];
            }
        >;
        allIds: string[];
    };
    paneViews: {
        byId: Record<
            string,
            {
                id: string;
                name: string;
            }
        >;
        allIds: string[];
    };
    error: null | Error;
    chart: null | {
        id?: string;
        editMode: {
            type: string;
            data: Record<string, string>;
            key?: string;
            createdAt?: string;
        };
        updateKey: number;
        logs?: null | string;
        stackTrace?: null | string;
    };
    entry: null | EditorEntry | EditorFakeEntry;
};

export function editorTypedReducer(state: EditorState, action: EditorActions): EditorState {
    switch (action.type) {
        case EDITOR_CODE_CHANGE: {
            const {scriptId, value} = action.payload;
            return imm.update(state, {
                scriptsValues: {[scriptId]: {$set: value}},
            });
        }

        case PANES_SWITCH: {
            const {panes} = state.grid!;
            const {sourceId, targetId} = action.payload;
            const sourceIndex = panes.findIndex((id) => id === sourceId);
            const targetIndex = panes.findIndex((id) => id === targetId);
            const newState = imm.update(state, {
                grid: {panes: {$set: swapArrayElements(panes, sourceIndex, targetIndex)}},
            });
            GridStorage.storePanes(newState);
            return newState;
        }

        case PANE_TAB_SELECT: {
            const {paneId, tabId} = action.payload;
            return imm.update(state, {
                panes: {byId: {[paneId]: {currentTab: {$set: tabId}}}},
            });
        }

        case PANE_VIEW_SELECT: {
            const {tabs} = state;
            const {paneId, view} = action.payload;
            const newState = imm.update(state, {
                panes: {
                    byId: {
                        [paneId]: {
                            $merge: {
                                view,
                                currentTab:
                                    view === PANE_VIEWS.EDITOR
                                        ? Helper.getDefaultTabId(tabs)
                                        : null,
                            },
                        },
                    },
                },
            });
            GridStorage.storePanes(newState);
            return newState;
        }

        case GRID_SCHEME_SELECT: {
            const {settings, tabs, entry} = state;
            const {schemeId} = action.payload;
            const {
                panes,
                grid,
                settings: newSettings,
            } = Helper.createGridData({
                tabs,
                schemeId,
                settings,
                entry,
                queryActiveTab: undefined,
            });
            return imm.update(state, {
                panes: {$set: panes},
                settings: {$merge: newSettings},
                grid: {$set: grid},
            });
        }

        case PREVIEW_DRAW: {
            const {entry, scriptsValues} = state;
            if (!entry) {
                return state;
            }
            return imm.update<EditorState, AutoExtendCommand<EditorState['chart']>>(state, {
                chart: {
                    $auto: {
                        id: {$set: entry.fake ? undefined : entry.entryId},
                        editMode: {
                            $set: {
                                type: entry.type,
                                createdAt: entry.fake ? undefined : entry.createdAt,
                                data: Helper.formEntryData({scriptsValues, entry}),
                                key: entry.fake ? undefined : entry.key,
                            },
                        },
                        updateKey: {$set: state.chart ? state.chart.updateKey + 1 : 0},
                    },
                },
            });
        }

        case CHART_SET_LOADED_DATA: {
            const {data, status} = action.payload;
            const isSuccess = status === Status.Success;
            return imm.update<EditorState, AutoExtendCommand<EditorState['chart']>>(state, {
                chart: {
                    $auto: {
                        logs: {
                            $set: isSuccess
                                ? _.get(data, ['loadedData', 'logs_v2'])
                                : _.get(data, ['error', 'extra', 'logs_v2'], null) ||
                                  _.get(data, ['loadedData', 'logs_v2'], null),
                        },
                        stackTrace: {
                            $set: isSuccess
                                ? null
                                : _.get(data, ['error', 'details', 'stackTrace'], null),
                        },
                    },
                },
            });
        }

        case SET_ENTRY_KEY: {
            if (!state.entry) {
                return state;
            }
            return {
                ...state,
                entry: {
                    ...state.entry,
                    key: action.payload,
                },
            };
        }

        default:
            return state;
    }
}
