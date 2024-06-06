import type {ComponentStateChangeAction} from '../../actions';
import {COMPONENT_STATE_CHANGE, ComponentName} from '../../actions';
import type {ButtonSaveComponentData, DialogRevisionsComponentData} from '../../types';

export type ComponentsState = {
    [ComponentName.ButtonSave]: ButtonSaveComponentData;
    [ComponentName.DialogRevisions]: DialogRevisionsComponentData;
};

export const componentsInitialState: ComponentsState = {
    [ComponentName.ButtonSave]: {
        progress: false,
    },
    [ComponentName.DialogRevisions]: {
        progress: null,
    },
};

export function components(
    state: ComponentsState = componentsInitialState,
    action: ComponentStateChangeAction,
): ComponentsState {
    switch (action.type) {
        case COMPONENT_STATE_CHANGE: {
            const {name, data} = action.payload;
            return {
                ...state,
                [name]: {
                    ...state[name],
                    ...data,
                },
            };
        }

        default:
            return state;
    }
}
