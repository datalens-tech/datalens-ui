import type {DatalensGlobalState} from 'index';

import {ComponentName} from '../actions';

export const getButtonSave = (state: DatalensGlobalState) =>
    state.components[ComponentName.ButtonSave];

export const getDialogRevisionsProgress = (state: DatalensGlobalState) =>
    state.components[ComponentName.DialogRevisions].progress;
