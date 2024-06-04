import type {AnyAction} from 'redux';
import {combineReducers} from 'redux';
import type {ThunkDispatch} from 'redux-thunk';
import type {DatalensGlobalState} from 'ui';

import type {ResetWizardStoreAction, SetWizardStoreAction} from '../actions';
import {RESET_WIZARD_STORE, SET_WIZARD_STORE} from '../actions';
import type {DatasetAction} from '../actions/dataset';
import type {DialogColorAction} from '../actions/dialogColor';
import type {HierarchyEditorAction} from '../actions/hierarchyEditor';
import type {PreviewAction} from '../actions/preview';
import type {SettingsAction} from '../actions/settings';
import type {VisualizationAction} from '../actions/visualization';
import type {WidgetAction} from '../actions/widget';

import type {DatasetState} from './dataset';
import {dataset} from './dataset';
import type {DialogColorState} from './dialogColor';
import {dialogColor} from './dialogColor';
import type {HierarchyEditorState} from './hierarchyEditor';
import {hierarchyEditor} from './hierarchyEditor';
import type {PreviewState} from './preview';
import {preview} from './preview';
import type {SettingsState} from './settings';
import {settings} from './settings';
import type {VisualizationState} from './visualization';
import {visualization} from './visualization';
import type {WidgetState} from './widget';
import {widget} from './widget';

export type WizardGlobalState = {
    hierarchyEditor: HierarchyEditorState;
    dataset: DatasetState;
    settings: SettingsState;
    widget: WidgetState;
    preview: PreviewState;
    visualization: VisualizationState;
    dialogColor: DialogColorState;
};

type WizardAction =
    | ResetWizardStoreAction
    | SetWizardStoreAction
    | DatasetAction
    | VisualizationAction
    | PreviewAction
    | WidgetAction
    | SettingsAction
    | HierarchyEditorAction
    | DialogColorAction;

const reducers = combineReducers({
    dataset,
    visualization,
    preview,
    widget,
    settings,
    hierarchyEditor,
    dialogColor,
});

const wizardReducer = (state: WizardGlobalState, action: WizardAction) => {
    if (action.type === RESET_WIZARD_STORE) {
        return reducers(undefined, action);
    }

    if (action.type === SET_WIZARD_STORE) {
        return action.store;
    }

    return reducers(state, action);
};

export type WizardDispatch = ThunkDispatch<DatalensGlobalState, void, AnyAction>;

export default wizardReducer;
