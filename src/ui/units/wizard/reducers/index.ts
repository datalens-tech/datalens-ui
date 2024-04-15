import {AnyAction, combineReducers} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {DatalensGlobalState} from 'ui';

import {
    RESET_WIZARD_STORE,
    ResetWizardStoreAction,
    SET_WIZARD_STORE,
    SetWizardStoreAction,
} from '../actions';
import {DatasetAction} from '../actions/dataset';
import {DialogColorAction} from '../actions/dialogColor';
import {HierarchyEditorAction} from '../actions/hierarchyEditor';
import {PreviewAction} from '../actions/preview';
import {SettingsAction} from '../actions/settings';
import {VisualizationAction} from '../actions/visualization';
import {WidgetAction} from '../actions/widget';

import {DatasetState, dataset} from './dataset';
import {DialogColorState, dialogColor} from './dialogColor';
import {HierarchyEditorState, hierarchyEditor} from './hierarchyEditor';
import {PreviewState, preview} from './preview';
import {SettingsState, settings} from './settings';
import {VisualizationState, visualization} from './visualization';
import {WidgetState, widget} from './widget';

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
