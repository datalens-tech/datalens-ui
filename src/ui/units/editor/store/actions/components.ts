import type {ButtonSaveComponentData, DialogRevisionsComponentData} from '../types';

export enum ComponentName {
    ButtonSave = 'buttonSave',
    DialogRevisions = 'dialogRevisions',
}

type ButtonSavePayload = {
    name: ComponentName.ButtonSave;
    data: ButtonSaveComponentData;
};

type DialogRevisionsPayload = {
    name: ComponentName.DialogRevisions;
    data: DialogRevisionsComponentData;
};

export const COMPONENT_STATE_CHANGE = Symbol('editor/components/COMPONENT_STATE_CHANGE');

export type ComponentStateChangeAction = {
    type: typeof COMPONENT_STATE_CHANGE;
    payload: ButtonSavePayload | DialogRevisionsPayload;
};

export const componentStateChange = (
    data: ComponentStateChangeAction['payload'],
): ComponentStateChangeAction => ({
    type: COMPONENT_STATE_CHANGE,
    payload: data,
});
