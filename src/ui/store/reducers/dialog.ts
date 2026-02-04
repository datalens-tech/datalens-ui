import type {DialogAction} from '../actions/dialog';
import {
    OPEN_DIALOG,
    CLOSE_DIALOG,
    UPDATE_DIALOG_PROPS,
    PARTIAL_UPDATE_DIALOG_PROPS,
} from '../actions/dialog';

export interface DialogState {
    dialogs: {id: symbol; props: any}[];
}

const getInitialDialogState = (): DialogState => ({
    dialogs: [],
});

function dialog(state: DialogState = getInitialDialogState(), action: DialogAction): DialogState {
    switch (action.type) {
        case OPEN_DIALOG:
            return {
                ...state,
                dialogs: [...state.dialogs, {id: action.id, props: action.props}],
            };

        case CLOSE_DIALOG: {
            return {
                ...state,
                dialogs: state.dialogs.slice(0, -1),
            };
        }

        case UPDATE_DIALOG_PROPS: {
            const {id, props} = action;
            const dialogToUpdateIndex = state.dialogs.findIndex((d) => d.id === id);

            if (dialogToUpdateIndex !== -1) {
                const dialogToUpdate = state.dialogs[dialogToUpdateIndex];
                const updatedDialog = Object.assign(
                    {id: dialogToUpdate.id},
                    {props: dialogToUpdate.props},
                    {props},
                );
                const nextDialogs = state.dialogs.map((d) => {
                    if (d.id === id) {
                        return updatedDialog;
                    }
                    return d;
                });
                return {
                    ...state,
                    dialogs: nextDialogs,
                };
            }

            return state;
        }

        case PARTIAL_UPDATE_DIALOG_PROPS: {
            const {id, props} = action;
            const dialogToUpdateIndex = state.dialogs.findIndex((d) => d.id === id);

            if (dialogToUpdateIndex !== -1) {
                const dialogToUpdate = state.dialogs[dialogToUpdateIndex];

                const updatedDialog = Object.assign(
                    {id: dialogToUpdate.id},
                    {props: {...dialogToUpdate.props, ...props}},
                );

                return {
                    ...state,
                    dialogs: state.dialogs.map((d) => (d.id === id ? updatedDialog : d)),
                };
            }

            return state;
        }

        default:
            return state;
    }
}

export default dialog;
